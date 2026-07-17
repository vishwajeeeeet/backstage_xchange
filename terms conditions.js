const bookingForm = document.getElementById("bookingForm");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form values
    const inputs = bookingForm.querySelectorAll("input, select, textarea");

    const fullName = inputs[0].value;
    const email = inputs[1].value;
    const phone = inputs[2].value;
    const bookingType = inputs[3].value;
    const bookingDate = inputs[4].value;
    const details = inputs[5].value;

    // Your WhatsApp Number (with country code, no + sign)
    const ownerNumber = "919822137422";

    // Message format
    const message = `🎉 New Booking Request!\n\n` +
        `👤 Name: ${fullName}\n` +
        `📧 Email: ${email}\n` +
        `📞 Phone: ${phone}\n` +
        `🎟 Booking Type: ${bookingType}\n` +
        `📅 Date: ${bookingDate}\n` +
        `📝 Details: ${details}`;

    // Encode URL
    const whatsappURL = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappURL, "_blank");

    // Show popup
    popup.style.display = "flex";

    // Reset form
    bookingForm.reset();
});

// Close popup
closePopup.addEventListener("click", function () {
    popup.style.display = "none";
});