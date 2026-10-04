function isValidEmailAddress(value) {
    const email = value.trim();
    const atIndex = email.lastIndexOf('@');
    if (atIndex < 1 || atIndex > 64 || email.length > 254) return false;
    const localPart = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart) || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return false;
    const labels = domain.split('.');
    if (labels.length < 2 || labels.some(label => label.length < 1 || label.length > 63 || !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label))) return false;
    return /^[A-Za-z]{2,63}$/.test(labels[labels.length - 1]) || /^xn--[A-Za-z0-9-]{2,59}$/i.test(labels[labels.length - 1]);
}

function isValidPhoneNumber(value) {
    const phone = value.trim();
    if (!/^\+?[0-9().\s-]+$/.test(phone)) return false;
    const digits = phone.replace(/\D/g, '');
    if (/^(\d)\1+$/.test(digits)) return false;
    if (phone.startsWith('+')) {
        if (digits.startsWith('91')) return digits.length === 12 && /^[6-9]\d{9}$/.test(digits.slice(2));
        return /^[1-9]\d{6,14}$/.test(digits);
    }
    if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
    if (digits.length === 11 && digits.startsWith('0')) return /^[6-9]\d{9}$/.test(digits.slice(1));
    return digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2));
}

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.background = window.scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)';
        }, { passive: true });
    }
    const form = document.getElementById('contactForm');
    if (form) {
        const status = document.getElementById('contactFormStatus');
        const submitButton = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!status) return;
            const endpoint = window.BACKSTAGE_SHEETS_ENDPOINT;
            if (!endpoint) {
                status.textContent = 'The contact form is not configured yet. Please contact us by phone or email.';
                status.dataset.state = 'error';
                return;
            }
            if (submitButton) submitButton.disabled = true;
            status.textContent = 'Sending your message...';
            status.dataset.state = 'pending';
            try {
                const responseFrame = document.querySelector('iframe[name="googleSheetsResponse"]');
                const submissionId = document.getElementById('submissionId');
                if (!responseFrame || !submissionId) throw new Error('The contact form response target is missing.');
                const requestId = crypto.randomUUID();
                submissionId.value = requestId;
                form.action = endpoint;
                form.method = 'post';
                form.target = responseFrame.name;
                const result = await new Promise((resolve, reject) => {
                    const timeout = window.setTimeout(() => {
                        window.removeEventListener('message', onMessage);
                        reject(new Error('The contact form response timed out.'));
                    }, 30000);
                    function onMessage(messageEvent) {
                        if (!messageEvent.origin.endsWith('.googleusercontent.com') || !messageEvent.data || messageEvent.data?.requestId !== requestId) return;
                        window.clearTimeout(timeout);
                        window.removeEventListener('message', onMessage);
                        resolve(messageEvent.data);
                    }
                    window.addEventListener('message', onMessage);
                    HTMLFormElement.prototype.submit.call(form);
                });
                if (result.ok !== true) throw new Error(result.message || 'The message could not be saved.');
                form.reset();
                status.textContent = 'Thanks! Your message has been sent.';
                status.dataset.state = 'success';
            } catch (error) {
                console.error('Contact form submission failed:', error);
                status.textContent = 'We could not confirm delivery. Check whether your message arrived before trying again, or contact us by phone or email.';
                status.dataset.state = 'error';
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;
    const bookingStatus = document.getElementById('bookingFormStatus');
    const bookingSubmitButton = bookingForm.querySelector('button[type="submit"]');
    bookingForm.addEventListener('submit', async event => {
        event.preventDefault();
        if (!bookingStatus) return;
        const phone = bookingForm.querySelector('[name="phone"]').value.trim();
        const emailField = bookingForm.querySelector('[name="email"]');
        if (!isValidEmailAddress(emailField.value)) {
            bookingStatus.textContent = 'Please enter a valid email address, such as name@example.com.';
            bookingStatus.dataset.state = 'error';
            emailField.focus();
            return;
        }
        if (!isValidPhoneNumber(phone)) {
            bookingStatus.textContent = 'Enter a valid Indian mobile number (10 digits beginning 6-9) or an international number with its + country code.';
            bookingStatus.dataset.state = 'error';
            bookingForm.querySelector('[name="phone"]').focus();
            return;
        }

        const endpoint = window.BACKSTAGE_SHEETS_ENDPOINT;
        if (!endpoint) {
            bookingStatus.textContent = 'The booking form is not configured yet. Please contact us by phone or email.';
            bookingStatus.dataset.state = 'error';
            return;
        }
        if (bookingSubmitButton) bookingSubmitButton.disabled = true;
        bookingStatus.textContent = 'Sending your booking request...';
        bookingStatus.dataset.state = 'pending';
        try {
            const responseFrame = document.querySelector('iframe[name="googleSheetsResponse"]');
            const submissionId = bookingForm.querySelector('[name="submissionId"]');
            if (!responseFrame || !submissionId) throw new Error('The booking form response target is missing.');
            const requestId = crypto.randomUUID();
            submissionId.value = requestId;
            bookingForm.action = endpoint;
            bookingForm.method = 'post';
            bookingForm.target = responseFrame.name;
            const result = await new Promise((resolve, reject) => {
                const timeout = window.setTimeout(() => {
                    window.removeEventListener('message', onMessage);
                    reject(new Error('The booking form response timed out.'));
                }, 30000);
                function onMessage(messageEvent) {
                    if (!messageEvent.origin.endsWith('.googleusercontent.com') || !messageEvent.data || messageEvent.data?.requestId !== requestId) return;
                    window.clearTimeout(timeout);
                    window.removeEventListener('message', onMessage);
                    resolve(messageEvent.data);
                }
                window.addEventListener('message', onMessage);
                HTMLFormElement.prototype.submit.call(bookingForm);
            });
            if (result.ok !== true) throw new Error(result.message || 'The booking request could not be saved.');
            bookingForm.reset();
            bookingStatus.textContent = 'Thanks! Your booking request has been received.';
            bookingStatus.dataset.state = 'success';
        } catch (error) {
            console.error('Booking form submission failed:', error);
            bookingStatus.textContent = 'We could not confirm your booking request. Check whether it arrived before trying again, or contact us by phone or email.';
            bookingStatus.dataset.state = 'error';
        } finally {
            if (bookingSubmitButton) bookingSubmitButton.disabled = false;
        }
    });
});
