# Ronch Production Floor

LED driver flow by **model and component-level BOM**: client orders from sub-vendors, SCM (multi-line component POs), Store (GRN and BOM-based issue to work orders), Production (4 test stages), Dispatch, Forecast, daily Reports, **R&D (components, BOMs, BOM modifications)** and Excel/PDF export.
It is one web page. It runs on GitHub Pages and keeps its data in a free Firebase (Firestore) database that the whole team shares.

## Departments and what each can change

Everyone can **view** everything. Each department **edits only its own work**. **Admin edits everything.**

| Login | Department | Can change |
|---|---|---|
| `admin` | Admin | Everything, including opening-data import and "Delete all data" |
| `sales` | Client Order | Sub-vendor POs (client orders), price & specification, clients & sub-vendors |
| `scm` | SCM | Component POs (one supplier, many lines) and their status, forecast |
| `store` | Store | GRN against PO lines (part receipts), component issue to WOs per BOM, stock in/out, stock import |
| `production` | Production | Work orders (clubbing), stage output, rejects, FG handover, which BOM/modification a WO is built to |
| `dispatch` | Dispatch | Dispatches to sub-vendors, invoices/dockets |
| `rnd` | R&D | Models (each version, e.g. 100W-C7 and 100W-B7, is its own model), component master, BOMs, BOM modifications, component master import |

The app greys out buttons that belong to other departments, and the Firebase rules (`firestore.rules`) block such changes on the server too.

## Files

| File | What it is |
|---|---|
| `index.html` | The app |
| `firebase-config.js` | **Your settings** (Firebase connection, login domain). This is the only file you edit |
| `firestore.rules` | Security rules to paste into Firebase |
| `manifest.json`, `sw.js`, `icons/` | Let phones install the app and open it offline |

---

## Step 1: Create the Firebase database (one time)

1. Go to https://console.firebase.google.com and sign in with the company Google account.
2. **Add project**. Name it `ronch-production`. Google Analytics is not needed. Click **Create project**.
3. **Build → Firestore Database → Create database**. Location **asia-south1 (Mumbai)**, **production mode**.
4. On the **Rules** tab, paste the whole of `firestore.rules` and click **Publish**.
5. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**. (If Anonymous is enabled from an earlier setup, disable it.)
6. **Authentication → Users → Add user**. Create these 7 users, giving each its own password:

   | Email | Department |
   |---|---|
   | `admin@ronch-floor.app` | Admin |
   | `sales@ronch-floor.app` | Client Order |
   | `scm@ronch-floor.app` | SCM |
   | `store@ronch-floor.app` | Store |
   | `production@ronch-floor.app` | Production |
   | `dispatch@ronch-floor.app` | Dispatch |
   | `rnd@ronch-floor.app` | R&D |

   These are login names only; no email is ever sent to them. Keep the passwords safe and give each department only its own.
7. **Project settings (gear) → Your apps → </> Web**. Register the app `ronch-floor` (no Hosting). Copy the six `firebaseConfig` values into `firebase-config.js`.

## Step 2: Put the app on GitHub Pages

1. On https://github.com, create a **New repository** called `ronch-production-floor`, set to **Public**.
2. Click **uploading an existing file**. Drag in everything in this folder, including the `icons` folder, then **Commit changes**.
3. **Settings → Pages**: Source **Deploy from a branch**, Branch **main**, folder **/ (root)**, then **Save**.
4. After 1–2 minutes you get the address `https://<your-github-name>.github.io/ronch-production-floor/`.
5. Firebase: **Authentication → Settings → Authorized domains → Add domain** → `<your-github-name>.github.io`.

**Already uploaded the earlier version?** Replace `index.html`, `firebase-config.js` and `firestore.rules` in the repo, paste the new rules into Firebase, and do steps 5–6 of Step 1.

## Step 3: Start using it

1. Open the address, tap your department and enter its password.
2. Load the data in **Masters → Data import**. There are three separate Excel imports; each checks every row and shows a summary before saving, and none of them deletes anything:
   1. **Components (component-wise)**: Description, Category, Unit, Min Stock, Stock Qty, Remarks, Preferred Make and Alternate Make 1, 2, 3 (add columns Alternate Make 4, 5 … for more). Part No. is optional: left blank, the app numbers it from the category (PCB-0001, MOV-0001, MOS-0001, ECAP-0001 …). Existing components are matched by Part No., or by Description, and blank cells keep the current value, so makes can be filled in later. R&D imports the master, Store imports stock, Admin both.
   2. **Models & BOMs (in the app)**: R&D adds each model (**+ Add model**) and then its BOM (**+ New BOM**). Choose the **BOM type**:
      - **Main BOM**: select the Model No.; the BOM No. is generated (BOM-100W-C7-R0, next revision R1 …). The Released main BOM is what planning and issue use.
      - **Sub BOM**: select the Main BOM it belongs to (no model choice; it takes the main BOM's model). The main BOM's lines are copied in; change only what differs (parts, qty, specification). Number: BOM-100W-C7-R0-S1, S2 … The form shows the changes against the main BOM as you type. A work order can be set to build to a sub BOM (WO → Change BOM / modification), and Store then issues per the sub BOM.
      - **PDF of a sub BOM**: first the **Sub BOM** – only the components added (or replacing a main-BOM part) and the qty / specification changes; below it the **complete main BOM** with the lines this sub BOM changes highlighted (red = removed / replaced, amber = qty or specification changed) and a "Change in sub BOM" column.
      For each line type the Part No. or part of the description; Specification fills from the component master (editable).
   3. **Opening balances**: clients and sub-vendors, WIP on the floor, FG stock per model, open component POs. Admin.
3. Components can also be added one by one in **R&D / BOM → + Add component**, with **+ Add alternate make** for as many alternates as needed.

## How the material flow works

1. **Sales** enters sub-vendor POs by model. **Production / Sales** clubs pending lines of a model into a work order (WO).
2. **SCM → Component requirement (MRP)** explodes open WOs and unplanned orders through each model's released BOM and compares with stock, open POs and in-transit. **New PO → shortages** fills a PO with everything short.
3. A **PO** is one supplier with many component lines. SCM moves it Ordered → Shipped → At Port / Customs. **Store** receives it with a **GRN**, line by line; part receipts are allowed and the PO stays open until everything arrives or SCM closes it.
4. **Store → Issue** picks a WO and the number of units; the app works out each component (BOM qty × units, including any BOM modification the WO is built to), shows stock and shortages, and deducts stock on issue. A WO can be issued in several parts.
5. **Production** logs the 4 test stages for the units issued, then hands FG over to **Dispatch**, who dispatches to each sub-vendor.

## Orders tab (search & filter)

- **Search:** SO no., sub-vendor PO no., client, sub-vendor, city, model, category, specification, invoice or docket. Several words must all match (e.g. `sai 100W dimming`).
- **Filters** (combine freely): client, sub-vendor, customer code, category (Driver / SPD / Other), model, order status (incl. overdue / due in 7 days), line delivery (not started / part / delivered / anything pending), specification yes/no, price entered/missing, PO date range, due date range.
- **Views:** one row per product line or one row per order; group lines by client, sub-vendor, model, category, PO month, due month or status (with subtotals).
- **Totals** at the top: orders, lines, PO qty, delivered, pending, value, pending value. **Export these to Excel** exports exactly the filtered list.
- On phones the filters fold under **Filters**; tap to open.

## R&D / BOM in short

- **Component master:** part no., description, category, make, value/spec, package, unit, min stock. R&D edits it; Store keeps the stock (movements are logged).
- **Import / export:** one Excel sheet. R&D import updates the master fields. Store import sets stock to the Stock Qty column (the difference is logged). Admin import does both.
- **Models:** R&D adds each sellable version as a model. When adding a model you can copy the BOM of a similar one (e.g. start 100W-B7 from 100W-C7) as a draft.
- **BOM:** one per model, with revision and status Draft / Released / Obsolete. Lines can be imported from Excel (Part No., Qty, Ref. des., Remarks). **New revision** copies a BOM to R1, R2…
- **Modification:** a small change linked to a main BOM (Add / Remove / Replace / Change qty). **PDF (BOM + changes)** gives one PDF with the full main BOM, the modification list and the resulting BOM (changed lines highlighted), plus signature boxes.
- **Production:** each work order shows its BOM (and selected modification) and the component requirement against stock, with shortages flagged.

## Passwords

- **Change your department's password (in the app):** sign in, tap **Password** at the top, enter the current password and the new one twice (at least 6 characters). The change applies to everyone who uses that department login, so tell them the new password.
- **Forgotten password (Admin, in Firebase):** the login emails are not real mailboxes, so "Reset password" emails from Firebase never arrive. Instead: Firebase console → **Authentication → Users** → find the user (e.g. `store@ronch-floor.app`) → ⋮ → **Delete account**, then **Add user** with the same email and a new password. No data is lost; the app only looks at the department name in the email.
- To lock out someone who has left, change that department's password.

## Install on phones

- **Android (Chrome):** menu (three dots) → **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen**.

## Works on

Any modern browser: Chrome, Edge, Firefox and Safari on Windows or Mac, Android phones and tablets (Chrome), and iPhone / iPad (Safari, iOS 15 or newer). It can be added to the home screen on both Android and iPhone.

## Making changes in future

- The whole app is `index.html` in the GitHub repository; the data stays in Firebase and is never touched by an app update.
- To change something, describe it to Claude in this project. The updated `index.html` is uploaded to the repository (Claude can push it directly if you give a short-lived GitHub token again), and everyone gets the new version the next time they open or reload the link.
- The version number is shown at the bottom of every page, so you can check everyone is on the latest one.
- New fields or lists are added in a way that keeps existing data (older records are upgraded automatically when the app loads).

## Updating the app later

Upload the new `index.html` to the same repository. The data stays in Firebase and is not touched.

## Backups

Use **Export all (Excel)** regularly and keep the file. **Masters → Delete all data** (Admin only) wipes the shared database for everyone, and asks you to type DELETE first.

## Where the data lives (cloud only)

- **All business data is in the Firebase Firestore cloud database only** (Google Cloud, Mumbai region asia-south1). This covers models, components, stock, orders, POs, WOs, dispatches, components, BOMs and forecast.
- **Nothing is saved on phones or PCs.** The app keeps data only in memory while the page is open (no offline copy on the device). Closing the tab leaves no data behind.
- **GitHub holds only the app's code**, never data. A public repository is safe in that sense.
- **What the browser remembers:** only the login session (so users don't retype the password every time), the last department picked, the last open tab and the name typed in the header. None of this is business data.
- **No internet = view only.** If the connection drops, the header shows **Offline · view only**, all edit buttons are locked, and they unlock when the connection is back. So no change is ever kept only on a device.
- **Files you export** (Excel, PDF) are saved where you choose. Keep official copies on the company drive.

## Backups (recommended)

1. **Weekly:** Admin clicks **Export all (Excel)** and saves the file to the company Google Drive / OneDrive.
2. **Automatic daily cloud backup (best):** switch the Firebase project to the **Blaze (pay-as-you-go)** plan and turn on **Firestore → Disaster recovery → Scheduled backups (daily, keep 7 days)** and **Point-in-time recovery**. At this data size the cost is typically a few rupees a month. Set a budget alert of ₹500 in Google Cloud Billing for peace of mind.
3. **Protect against mistakes:** only Admin can import opening data or delete all data. Keep the admin password with 1–2 people.

## Good to know

- If `firebase-config.js` still has `PASTE...` values, the app shows **Cloud database not set up** and stores nothing.
- The Firebase free plan (Spark) comfortably covers a team of this size (50,000 reads and 20,000 writes per day). The Blaze plan is only needed for the automatic backups above.
- On shared floor PCs, click **Sign out** at the end of the shift.
