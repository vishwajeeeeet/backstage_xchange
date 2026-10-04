var SPREADSHEET_ID = '1ESsX-0c370PfQAYQKa4sjvRbCSohCl0j2mqctBzANm4';

function doPost(event) {
  var payload = event.parameter || {};
  var requestId = /^[a-zA-Z0-9-]{1,100}$/.test(payload.submissionId || '')
    ? payload.submissionId
    : '';

  if (payload.website) {
    return htmlResponse({ ok: true, requestId: requestId });
  }
  if (payload.formType === 'booking') {
    return saveBooking(payload, requestId);
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
  var lockAcquired = false;
  try {
    lock.waitLock(10000);
    lockAcquired = true;

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
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
    SpreadsheetApp.flush();
  } catch (error) {
    console.error('Unable to save inquiry:', error && error.stack ? error.stack : error);
    return htmlResponse({
      ok: false,
      message: 'The inquiry could not be saved. Please try again later.',
      requestId: requestId
    });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }

  return htmlResponse({ ok: true, requestId: requestId });
}

function saveBooking(payload, requestId) {
  var fields = { name: cleanField(payload.name, 120), email: cleanField(payload.email, 254), phone: cleanField(payload.phone, 40), bookingType: cleanField(payload.bookingType, 100), eventDate: cleanField(payload.eventDate, 10), details: cleanField(payload.details, 5000) };
  var bookingTypes = ['VIP Event', 'Artist Booking', 'Night Club Entry', 'Luxury Party', 'Private Event'];
  var phoneDigits = fields.phone.replace(/\D/g, '');
  if (!fields.name || !fields.email || !/^[+0-9(). -]{7,40}$/.test(fields.phone) || phoneDigits.length < 7 || phoneDigits.length > 15 || bookingTypes.indexOf(fields.bookingType) === -1 || !isValidEventDate(fields.eventDate) || !fields.details || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return htmlResponse({ ok: false, message: 'Please check your name, email, phone number, booking type, event date, and details.', requestId: requestId });
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lock.waitLock(10000); lockAcquired = true;
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName('Bookings');
    if (!sheet) sheet = spreadsheet.insertSheet('Bookings');
    if (sheet.getLastRow() === 0) sheet.appendRow(['Received at', 'Name', 'Email', 'Phone', 'Booking type', 'Event date', 'Additional details']);
    sheet.appendRow([new Date(), safeCell(fields.name), safeCell(fields.email), safeCell(fields.phone), safeCell(fields.bookingType), fields.eventDate, safeCell(fields.details)]);
    SpreadsheetApp.flush();
  } catch (error) {
    console.error('Unable to save booking:', error && error.stack ? error.stack : error);
    return htmlResponse({ ok: false, message: 'The booking request could not be saved. Please try again later.', requestId: requestId });
  } finally { if (lockAcquired) lock.releaseLock(); }
  return htmlResponse({ ok: true, requestId: requestId });
}

function isValidEventDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  var date = new Date(value + 'T00:00:00Z');
  return !isNaN(date.getTime()) && Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd') === value;
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
    .createHtmlOutput('<!doctype html><script>window.top.postMessage(' + message + ', "*");</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
