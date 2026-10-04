document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.background = window.scrollY > 50
                ? 'rgba(255,255,255,0.95)'
                : 'rgba(255,255,255,0.65)';
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
