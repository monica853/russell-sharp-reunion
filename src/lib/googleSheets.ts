import { google } from "googleapis";

// ── Auth ──────────────────────────────────────────────────────────
// Reads credentials from env vars (see README for how to get these).
// GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY come straight from
// the JSON key file Google gives you when you create the service account.
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

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

function spreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEET_ID env var. See README.md for setup steps.");
  return id;
}

// ── Reads ─────────────────────────────────────────────────────────
// Returns a 2D array of cell values, e.g. rows[0] is the header row.
export async function getSheetValues(tabName: string): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: tabName,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return (res.data.values as string[][]) || [];
}

// ── Writes ────────────────────────────────────────────────────────
export async function appendRow(tabName: string, values: (string | number)[]): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: tabName + "!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

// rowNumber is 1-indexed and matches the actual sheet row (so a header row
// means real data starts at rowNumber 2).
export async function updateCell(tabName: string, cellRef: string, value: string | number): Promise<void> {
  const sheets = await getSheetsClient();
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
