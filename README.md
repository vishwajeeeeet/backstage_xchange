# Backstage Xchange

Responsive event-planning website with a shared orange-and-navy visual theme.

## Run the site

Open `index.html` in a browser. The site uses static HTML, CSS, and JavaScript and does not require a build step.

## Connect contact inquiries to Google Sheets

The contact form stores submissions in a Google Sheet through a Google Apps Script web app:

1. Create or open a Google Sheet, then choose **Extensions → Apps Script**.
2. Replace the editor contents with `google-apps-script.gs` and save the project.
3. Choose **Deploy → New deployment**, select **Web app**, set **Execute as** to yourself, and allow access to **Anyone**. Deploy and authorize the requested spreadsheet access.
4. Copy the deployed web app URL (it ends in `/exec`) into `google-sheets-config.js` as the value of `window.BACKSTAGE_SHEETS_ENDPOINT`.
5. Serve the site over HTTPS and test the contact form. Successful submissions appear in the `Inquiries` sheet tab, which the script creates automatically.

The endpoint is public so the static site can submit without exposing Google credentials. The script validates and length-limits fields, ignores submissions that fill the hidden spam-trap field, and protects Sheet cells from formula injection. Anyone with the endpoint can still attempt submissions; review and protect the Sheet appropriately. Do not put credentials or private keys in the website.

The contact form reports setup, delivery, and failure states. If delivery times out, check the Sheet before retrying in case the submission was saved.