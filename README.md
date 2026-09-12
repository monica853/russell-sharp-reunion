# Russell–Sharp Family Reunion Website

Built with Next.js + Tailwind CSS. Theme: Roaring '20s Atlanta (black, oxblood red, gold, pearl), matching the Save the Date poster used on the homepage.

**The database is a Google Sheet.** Every interest-list signup and registration is written as a row in a Sheet you own, using a Google service account. There's no separate database to pay for or manage — you can open the Sheet anytime and see everything, edit balances by hand, or export it.

## Pages

- `/` — Home: poster, countdown to Sept 3, 2027, section overview, timeline preview
- `/reunion-details` — Dates, location, theme
- `/interest-list` — Phase 1 form (live now) — writes to the "Interest List" tab
- `/register` — Phase 2 form (auto-unlocks when you flip `CURRENT_PHASE`) — writes to "Registrations" and creates a login
- `/my-invoice` — a family logs in with their email + the password they were given at registration, and sees their balance
- `/family-directory`, `/schedule`, `/hotel-travel` — placeholders that fill in over time
- `/payments` — full timeline + registration fee table

## One-time setup: Google Sheet + service account

This is the only setup required to make the site fully functional. It takes about 10 minutes.

### 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet. Name it something like "Russell-Sharp Reunion Data".
2. At the bottom, create five tabs (right-click a tab → Duplicate, or the `+` button), named **exactly**:
   - `Interest List`
   - `Registrations`
   - `Family Gatherings`
   - `Family Connections`
   - `Contact Messages`
3. Add a header row to each tab (row 1) — this is just for your own reference; the code writes by column position, not by header name, so exact header wording doesn't matter, but the **order** of columns does. Use these:

   **Interest List** (A through N):
   `Timestamp | Primary Name | Phone | Email | Family Branch | City | State | Household Members (JSON) | Num Adults | Num Children | Lodging Needed | Num Rooms | Accessibility/Dietary | Activities Interest`

   **Registrations** (A through P):
   `Timestamp | Primary Name | Email | Phone | Family Branch | City | State | Password | Attendees (JSON) | Lodging Selection | Accommodations | Emergency Name | Emergency Phone | Total Owed | Amount Paid | Notes`

   **Family Gatherings** (A through M):
   `Timestamp | Event Name | Host Name | Date/Time | Location | Description | Invited | Cost | RSVP Deadline | RSVP Contact | Status | Submitter Email | Submitter Phone`

   Every new submission lands here with Status = `Pending` and stays invisible on the public page until you edit that cell to `Approved`.

   **Family Connections** (A through I):
   `Timestamp | Business Name | Owner Name | Category | Description | Website | Phone | Email | Visible`

   There's no public submission form for this one — you (or whoever manages the sheet) add a row directly for each family business/service, and set `Visible` to `TRUE` to publish it.

   **Contact Messages** (A through D):
   `Timestamp | Name | Email | Message`

4. Copy the Sheet's ID out of its URL — the long string between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### 2. Create a Google Cloud service account

A service account is a robot account that only your app uses to read/write this one Sheet — it's not your personal Google login.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with any Google account.
2. Click the project dropdown at the top → **New Project**. Name it anything (e.g. "russell-sharp-reunion") → **Create**. Wait for it to finish, then make sure it's selected in the dropdown.
3. In the search bar at the top, type **Google Sheets API** → open it → click **Enable**.
4. In the left sidebar, go to **IAM & Admin → Service Accounts**.
5. Click **+ Create Service Account**.
   - Name: `reunion-site` (anything works)
   - Click **Create and Continue**
   - Skip the optional "grant access" steps → **Continue** → **Done**
6. Click on the service account you just created (it'll look like `reunion-site@your-project.iam.gservichttps://console.cloud.google.com/apis/credentials/consent?project=russell-sharp-reunioneaccount.com`).
7. Go to the **Keys** tab → **Add Key** → **Create new key** → choose **JSON** → **Create**. A `.json` file downloads to your computer. **Keep this file private** — anyone with it can access your Sheet.

### 3. Share the Sheet with the service account

1. Open the downloaded JSON file in any text editor. Find the `"client_email"` field — it looks like `reunion-site@your-project.iam.gserviceaccount.com`.
2. Go back to your Google Sheet → click **Share** (top right) → paste that email address → give it **Editor** access → **Send** (it's fine that it's not a real inbox).

### 4. Set your environment variables

1. In the project folder, copy `.env.example` to a new file named `.env.local`.
2. Fill in the values:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` from the JSON file
   - `GOOGLE_PRIVATE_KEY` — the `private_key` from the JSON file, wrapped in quotes exactly as it appears (it contains literal `\n` sequences — leave them as-is)
   - `GOOGLE_SHEET_ID` — the Sheet ID from step 1.4
   - `JWT_SECRET` — any long random string, e.g. run `openssl rand -base64 32` in a terminal and paste the result
3. When you deploy to Vercel, add these same four variables under **Project Settings → Environment Variables** (paste the private key exactly the same way, quotes and all).

That's it — once these are set, the Interest List form, Registration form, and My Invoice login are all fully working, writing to and reading from your Sheet.

### 5. Opening later phases

`src/lib/config.ts` has one line that controls the whole site:

```ts
export const CURRENT_PHASE: 1 | 2 | 3 | 4 = 1;
```

Bump it to `2` when registration opens and the `/register` page automatically switches from "not open yet" to the live registration form. No other code changes needed.

### 6. Updating a family's balance

Payments aren't collected online yet — when a family pays you by check, Zelle, cash, etc., open the Google Sheet, find their row on the **Registrations** tab, and update the **Amount Paid** column (column O) directly. Their `/my-invoice` page reflects it immediately.

### 7. Reviewing Family Gatherings submissions

When someone submits an event through "Submit a Family Event," it lands as a new row on the **Family Gatherings** tab with Status set to `Pending` — it will not show on the public page yet. Review the details, and when you're ready to publish it, change that row's **Status** cell to `Approved`. It appears on `/family-gatherings` right away.

### 8. Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploying: GitHub → Vercel

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial reunion site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/russell-sharp-reunion.git
   git push -u origin main
   ```
2. In Vercel, click **Add New Project** → **Import** your GitHub repo
3. Add the four environment variables from step 4 above under the project's Environment Variables before deploying
4. Vercel auto-detects Next.js — leave the defaults and click **Deploy**
5. In your Vercel project settings → **Domains**, add `russellsharpfamily.com` (the domain you already own) and follow Vercel's DNS instructions

From then on, every `git push` to `main` auto-deploys the update.

## Editing content

- **Timeline & registration fees:** `src/lib/timeline.ts`
- **Hotel info:** `src/lib/config.ts` (`HOTEL` object) and `src/app/hotel-travel/page.tsx`
- **Homepage poster:** `public/images/save-the-date.png`
- **Google Sheet tab names / column layout:** `src/lib/sheetsSchema.ts` and the API routes in `src/app/api/`
