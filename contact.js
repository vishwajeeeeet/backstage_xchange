/* NAVBAR EFFECT */

window.addEventListener("scroll", ()=>{

    const navbar = document.querySelector(".navbar");

    if(window.scrollY > 50){

        navbar.style.background = "rgba(255,255,255,0.95)";
    }
    else{

        navbar.style.background = "rgba(255,255,255,0.65)";
    }

});

/* FORM FUNCTIONALITY */

const form = document.getElementById("contactForm");

const popup = document.getElementById("popup");

const closePopup = document.getElementById("closePopup");

form.addEventListener("submit", function(e){

    e.preventDefault();

    popup.style.display = "flex";

    form.reset();

});

/* CLOSE POPUP */

closePopup.addEventListener("click", ()=>{

    popup.style.display = "none";

});

/* CLOSE ON OUTSIDE CLICK */

window.addEventListener("click", (e)=>{

    if(e.target === popup){

        popup.style.display = "none";
    }

});