// SELECT ELEMENTS

const popup = document.getElementById("blogPopup");

const popupTitle = document.getElementById("popupTitle");

const popupText = document.getElementById("popupText");

const buttons = document.querySelectorAll(".read-more-btn");

const closeBtn = document.querySelector(".close-popup");


// OPEN POPUP

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const title = button.getAttribute("data-title");

        const text = button.getAttribute("data-text");

        popupTitle.innerText = title;

        popupText.innerText = text;

        popup.classList.add("show");

    });

});


// CLOSE BUTTON

closeBtn.addEventListener("click", () => {

    popup.classList.remove("show");

});


// CLOSE OUTSIDE CLICK

window.addEventListener("click", (e) => {

    if(e.target === popup){

        popup.classList.remove("show");

    }

});


