/* SIMPLE SCROLL EFFECT */

window.addEventListener("scroll", ()=>{

    const navbar = document.querySelector(".navbar");

    if(window.scrollY > 50){

        navbar.style.background = "rgba(255,255,255,0.9)";

    }
    else{

        navbar.style.background = "rgba(255,255,255,0.65)";
    }

});




const cards = document.querySelectorAll('.other-card');

window.addEventListener('scroll', reveal);

function reveal(){

    let windowHeight = window.innerHeight;

    cards.forEach(card => {

        let cardTop = card.getBoundingClientRect().top;

        if(cardTop < windowHeight - 100){

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }

    });

}




const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        item.classList.toggle("active");

    });

});
