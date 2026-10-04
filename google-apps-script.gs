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
      !isValidEmailAddress(fields.email)) {
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
  if (!fields.name || !isValidEmailAddress(fields.email) || !isValidPhoneNumber(fields.phone) || bookingTypes.indexOf(fields.bookingType) === -1 || !isValidEventDate(fields.eventDate) || !fields.details) return htmlResponse({ ok: false, message: 'Please check your name, email, phone number, booking type, event date, and details.', requestId: requestId });
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

function isValidEmailAddress(value) {
  if (value.length > 254) return false;
  var atIndex = value.lastIndexOf('@');
  if (atIndex < 1 || atIndex > 64) return false;
  var localPart = value.slice(0, atIndex);
  var domain = value.slice(atIndex + 1);
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart) || localPart.charAt(0) === '.' || localPart.charAt(localPart.length - 1) === '.' || localPart.indexOf('..') !== -1) return false;
  var labels = domain.split('.');
  if (labels.length < 2) return false;
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].length < 1 || labels[i].length > 63 || !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(labels[i])) return false;
  }
  var topLevelDomain = labels[labels.length - 1];
  return /^[A-Za-z]{2,63}$/.test(topLevelDomain) || /^xn--[A-Za-z0-9-]{2,59}$/i.test(topLevelDomain);
}

function isValidPhoneNumber(value) {
  if (!/^\+?[0-9(). -]+$/.test(value)) return false;
  var phone = value.trim();
  var digits = phone.replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digits)) return false;
  if (phone.charAt(0) === '+') {
    if (digits.indexOf('91') === 0) return digits.length === 12 && /^[6-9]\d{9}$/.test(digits.slice(2));
    return /^[1-9]\d{6,14}$/.test(digits);
  }
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 11 && digits.charAt(0) === '0') return /^[6-9]\d{9}$/.test(digits.slice(1));
  return digits.length === 12 && digits.indexOf('91') === 0 && /^[6-9]\d{9}$/.test(digits.slice(2));
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
