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

// Tab names with spaces or punctuation must be single-quoted in A1 ranges.
function q(tabName: string) {
  return "'" + tabName.replace(/'/g, "''") + "'";
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
    range: q(tabName),
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
    range: q(tabName) + "!A1",
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
    range: q(tabName) + "!" + cellRef,
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

// Writes a block of rows starting at a specific cell, e.g. writeRange("Jones", "A8", rows).
// Strings starting with "=" are entered as formulas.
export async function writeRange(tabName: string, startCell: string, rows: (string | number)[][]): Promise<void> {
  if (rows.length === 0) return;
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: q(tabName) + "!" + startCell,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });
}

export async function listTabTitles(): Promise<string[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId(),
    fields: "sheets.properties.title",
  });
  return (res.data.sheets ?? []).map((s) => s.properties?.title ?? "");
}

// Creates a new tab (with simple invoice styling) and returns nothing; throws if the name exists.
export async function createInvoiceTab(title: string): Promise<void> {
  const sheets = getSheetsClient();
  const add = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: { requests: [{ addSheet: { properties: { title, gridProperties: { frozenRowCount: 7 } } } }] },
  });
  const sheetId = add.data.replies?.[0]?.addSheet?.properties?.sheetId;
  if (sheetId == null) return;
  const money = { numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" } };
  const widths = [100, 130, 200, 120, 90, 110, 100, 100, 110, 220];
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 6, endRowIndex: 7, startColumnIndex: 0, endColumnIndex: 10 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.64, green: 0.13, blue: 0.1 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 7, startColumnIndex: 6, endColumnIndex: 9 },
            cell: { userEnteredFormat: money },
            fields: "userEnteredFormat.numberFormat",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 14 } } },
            fields: "userEnteredFormat.textFormat",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: "userEnteredFormat.textFormat",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 1, endColumnIndex: 2 },
            cell: { userEnteredFormat: { ...money, horizontalAlignment: "LEFT" } },
            fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
          },
        },
        ...widths.map((w, i) => ({
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 },
            properties: { pixelSize: w },
            fields: "pixelSize",
          },
        })),
      ],
    },
  });
}
