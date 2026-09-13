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

   **Interest List** (A through O) — **one row per person**, not per household. Every member of a household repeats that household's shared info (email, phone, etc.) on their own row — this is what lets you filter or sort by age group or T-shirt size directly in the sheet, and see everyone in a household by filtering on Household Email:
   `Timestamp | Household Email | Primary Contact Name | Phone | Family Branch | City | State | Lodging Needed | Num Rooms Needed | Accessibility/Dietary | Activities Interest | Person Name | Relationship to Primary | Age Group | T-Shirt Size`

   **Registrations** (A through O) — **one row per attendee**. Household-level fields (password, totals, emergency contact) only ever appear on the row where **Is Primary** is `TRUE` for that household — that's the one row to edit when a payment comes in. Other attendees in the same household have their own row with just their name/age/size filled in and the household-level columns left blank:
   `Timestamp | Household Email | Primary Name | Is Primary | Password | Lodging Selection | Accommodations | Emergency Name | Emergency Phone | Total Owed | Amount Paid | Notes | Attendee Name | Age Group | T-Shirt Size`

   **Family Gatherings** (A through M):
   `Timestamp | Event Name | Host Name | Date/Time | Location | Description | Invited | Cost | RSVP Deadline | RSVP Contact | Status | Submitter Email | Submitter Phone`

   Every new submission lands here with Status = `Pending` and stays invisible on the public page until you edit that cell to `Approved`.

   **Family Connections** (A through I):
   `Timestamp | Business Name | Owner Name | Category | Description | Website | Phone | Email | Visible`

   Family members can now submit their own listing via "Submit a Family Connection" — it lands here with `Visible` set to `FALSE`. Change it to `TRUE` to publish it. You can still add entries directly yourself the same way.

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
6. Click on the service account you just created (it'll look like `reunion-site@your-project.iam.gserviceaccount.com`).
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

### 6. Set up email: real inbox + automated confirmations

This is two separate pieces sharing one address (`updates@russellsharpfamily.com`): a real mailbox you can log into and write from (Zoho Mail), and a service the site uses to send automatic confirmations (Resend). Both need DNS records added — for a domain bought through Vercel, that's under your project's **Domains** settings (or [vercel.com/domains](https://vercel.com/domains) → click the domain → DNS Records), not a separate registrar.

**Part 1 — Zoho Mail (the real inbox), free for up to 5 mailboxes:**

1. Go to [zoho.com/mail](https://www.zoho.com/mail/) → sign up → choose the free **Mail Lite** plan → add `russellsharpfamily.com` as your domain.
2. Zoho will give you a TXT record to prove you own the domain — add it in Vercel's DNS records for this domain, wait a few minutes, then click Verify in Zoho.
3. Zoho then gives you MX records (usually 2-3) — add each one in Vercel's DNS records exactly as shown (same Host, Priority, and Value/Points To fields Zoho lists).
4. Zoho also gives you an SPF TXT record — add that too. (If Resend later asks for its own SPF record, don't add a second one — merge them into a single TXT record, see Part 2.)
5. In Zoho's admin panel, create the actual mailbox: `updates@russellsharpfamily.com`. You can now log into mail.zoho.com with that address to read and send email like a normal inbox.

**Part 2 — Resend (automated sending), free for this volume:**

1. Go to [resend.com](https://resend.com) → sign up → **Domains** → **Add Domain** → enter `russellsharpfamily.com`.
2. Resend gives you a few DNS records (typically one or two DKIM CNAMEs, and an SPF-related TXT record). Add the CNAMEs as new records in Vercel.
3. For the SPF TXT record: if you already added Zoho's SPF record in Part 1, don't create a second TXT record at the same host — edit that existing one so it lists both, e.g. `v=spf1 include:zoho.com include:amazonses.com ~all` (Resend will tell you exactly what to include). Having two separate SPF TXT records at the same host breaks both.
4. Back in Resend, click Verify — once all records show green, your domain is ready to send from.
5. Go to **API Keys** → **Create API Key** → copy it.
6. Add it to `.env.local` as `RESEND_API_KEY=` and to Vercel's Environment Variables the same way.

**Once both are done:** Interest List and Registration submissions automatically email the person who submitted, and CC everyone listed in `ALERT_CC_EMAILS` in `src/lib/config.ts` (add your own email and anyone else who should be notified — it's empty by default). Family Gatherings submissions notify that same list so someone knows to review them, and the Contact form emails that list directly.

### 7. Updating a family's balance

Payments aren't collected online yet — when a family pays you by check, Zelle, cash, etc., open the Google Sheet, find that household's row on the **Registrations** tab where **Is Primary** is `TRUE`, and update the **Amount Paid** column (column K) directly. Their `/my-invoice` page reflects it immediately. Other rows for the same household (extra attendees) don't need anything changed.

### 8. Reviewing Family Gatherings submissions

When someone submits an event through "Submit a Family Event," it lands as a new row on the **Family Gatherings** tab with Status set to `Pending` — it will not show on the public page yet. Review the details, and when you're ready to publish it, change that row's **Status** cell to `Approved`. It appears on `/family-gatherings` right away.

### 9. Local development

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
3. Add all five environment variables (the four from step 4, plus `RESEND_API_KEY` from step 6) under the project's Environment Variables before deploying
4. Vercel auto-detects Next.js — leave the defaults and click **Deploy**
5. In your Vercel project settings → **Domains**, add `russellsharpfamily.com` (the domain you already own) and follow Vercel's DNS instructions

From then on, every `git push` to `main` auto-deploys the update.

## Editing content

- **Timeline & registration fees:** `src/lib/timeline.ts`
- **Hotel info:** `src/lib/config.ts` (`HOTEL` object) and `src/app/hotel-travel/page.tsx`
- **Homepage poster:** `public/images/save-the-date.png`
- **Google Sheet tab names / column layout:** `src/lib/sheetsSchema.ts` and the API routes in `src/app/api/`
- **Who gets CC'd on confirmation/alert emails:** `ALERT_CC_EMAILS` in `src/lib/config.ts`
- **Confirmation email wording:** inside each route in `src/app/api/` (interest-list, register, gatherings, contact)
