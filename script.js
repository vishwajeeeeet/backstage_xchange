

document.addEventListener("DOMContentLoaded", () => {

    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {

        const target = Number(counter.getAttribute("data-target"));

        let count = 0;

        const speed = target / 100;

        function updateCounter(){

            count += speed;

            if(count < target){

                counter.innerText = Math.floor(count);

                requestAnimationFrame(updateCounter);

            }else{

                counter.innerText = target;

            }

        }

        updateCounter();

    });

});





const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        item.classList.toggle("active");

    });

});