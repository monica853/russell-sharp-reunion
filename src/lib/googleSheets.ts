import { google } from "googleapis";

// ── Auth ──────────────────────────────────────────────────────────
// Reads credentials from env vars (see README for how to get these).
// GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY come straight from
// the JSON key file Google gives you when you create the service account.
//
// The authenticated client is cached at module scope and reused across
// calls — rebuilding it (a full OAuth handshake) on every single
// read/write is what made multi-row submissions (one call per household
// member) slow enough to time out. Serverless functions reuse warm
// instances between invocations, so this cache often survives across
// requests too, not just within one.
let cachedSheetsClient: ReturnType<typeof google.sheets> | null = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars. See README.md for setup steps."
    );
  }
  // .env files store the key with literal \n sequences — turn them back
  // into real newlines or the key won't parse.
  const privateKey = rawKey.replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  if (cachedSheetsClient) return cachedSheetsClient;
  cachedSheetsClient = google.sheets({ version: "v4", auth: getAuth() });
  return cachedSheetsClient;
}

function spreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID env var. See README.md for setup steps.");
  return id;
}

// ── Reads ─────────────────────────────────────────────────────────
// Returns a 2D array of cell values, e.g. rows[0] is the header row.
export async function getSheetValues(tabName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: tabName,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (res.data.values as string[][]) || [];
}

// ── Writes ────────────────────────────────────────────────────────
export async function appendRow(tabName: string, values: (string | number)[]): Promise<void> {
  await appendRows(tabName, [values]);
}

// Appends several rows in a single API call — always prefer this over
// calling appendRow in a loop, since each call is a separate network
// round-trip and (before the client-caching above) a separate auth
// handshake. A household of 5 people is 1 call here instead of 5.
export async function appendRows(tabName: string, rows: (string | number)[][]): Promise<void> {
  if (rows.length === 0) return;
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: tabName + "!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });
}

// rowNumber is 1-indexed and matches the actual sheet row (so a header row
// means real data starts at rowNumber 2).
export async function updateCell(tabName: string, cellRef: string, value: string | number): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: tabName + "!" + cellRef,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[value]] },
  });
}

// Finds the 1-indexed row number of the first row where `columnIndex`
// (0-indexed) matches `value`. Returns null if not found. Skips row 1
// (assumed header).
export function findRowNumber(rows: string[][], columnIndex: number, value: string): number | null {
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][columnIndex] ?? "").trim().toLowerCase() === value.trim().toLowerCase()) {
      return i + 1; // convert 0-indexed array position to 1-indexed sheet row
    }
  }
  return null;
}
