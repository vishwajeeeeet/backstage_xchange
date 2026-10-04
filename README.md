# Backstage Xchange

Responsive event-planning website with a shared orange-and-navy visual theme.

## Run the site

Open `index.html` in a browser. The site uses static HTML, CSS, and JavaScript and does not require a build step.

## Connect contact inquiries and bookings to Google Sheets

The contact and booking forms store submissions in a Google Sheet through a Google Apps Script web app:

1. Create or open a Google Sheet, then choose **Extensions > Apps Script**.
2. Replace the editor contents with `google-apps-script.gs` and save the project.
3. Choose **Deploy > New deployment**, select **Web app**, set **Execute as** to yourself, and allow access to **Anyone**. Deploy and authorize the requested spreadsheet access.
4. Copy the deployed web app URL (it ends in `/exec`) into `google-sheets-config.js` as the value of `window.BACKSTAGE_SHEETS_ENDPOINT`. The configured spreadsheet is [Backstage Xchange Inquiries](https://docs.google.com/spreadsheets/d/1ESsX-0c370PfQAYQKa4sjvRbCSohCl0j2mqctBzANm4/edit).
5. Serve the site over HTTPS and test the forms. Contact submissions appear in the `Inquiries` tab, and booking requests appear in the `Bookings` tab; the script creates both tabs automatically.

The endpoint is public so the static site can submit without exposing Google credentials. The script validates and length-limits fields, checks email syntax and phone-number format (including Indian mobile-number rules), ignores submissions that fill the hidden spam-trap field, and protects Sheet cells from formula injection. These format checks cannot confirm that an email inbox or phone number belongs to the submitter; ownership verification requires email/SMS confirmation and provider configuration. Anyone with the endpoint can still attempt submissions; review and protect the Sheet appropriately. Do not put credentials or private keys in the website.

Both forms report setup, delivery, and failure states. If delivery times out, check the Sheet before retrying in case the submission was saved.
