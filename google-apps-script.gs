function doPost(event) {
  var payload = event.parameter || {};
  var requestId = /^[a-zA-Z0-9-]{1,100}$/.test(payload.submissionId || '')
    ? payload.submissionId
    : '';

  if (payload.website) {
    return htmlResponse({ ok: true, requestId: requestId });
  }

  var fields = {
    name: cleanField(payload.name, 120),
    email: cleanField(payload.email, 254),
    subject: cleanField(payload.subject, 200),
    message: cleanField(payload.message, 5000)
  };

  if (!fields.name || !fields.email || !fields.subject || !fields.message ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return htmlResponse({
      ok: false,
      message: 'Please check the required fields.',
      requestId: requestId
    });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName('Inquiries');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Inquiries');
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received at', 'Name', 'Email', 'Subject', 'Message']);
    }
    sheet.appendRow([
      new Date(),
      safeCell(fields.name),
      safeCell(fields.email),
      safeCell(fields.subject),
      safeCell(fields.message)
    ]);
  } finally {
    lock.releaseLock();
  }

  return htmlResponse({ ok: true, requestId: requestId });
}

function cleanField(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function htmlResponse(data) {
  var message = JSON.stringify(data).replace(/</g, '\\u003c');
  return HtmlService
    .createHtmlOutput('<!doctype html><script>window.parent.postMessage(' + message + ', "*");</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
