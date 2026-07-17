

const counters = document.querySelectorAll(".counter-box h2");

counters.forEach(counter => {

    let target = +counter.innerText.replace("+","");

    let count = 0;

    let speed = target / 100;

    function updateCounter(){

        count += speed;

        if(count < target){

            counter.innerText = Math.floor(count) + "+";

            requestAnimationFrame(updateCounter);

        } else {

            counter.innerText = target + "+";

        }
    }

    updateCounter();

});
