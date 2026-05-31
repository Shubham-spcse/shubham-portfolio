const roles = [
    "Software Engineer",
    "Java Developer",
    "Problem Solver",
    "GATE 2026 Qualified"
];

let roleIndex = 0;

const typingText = document.getElementById("typing-text");

setInterval(() => {

    roleIndex++;

    if (roleIndex >= roles.length) {
        roleIndex = 0;
    }

    typingText.textContent = roles[roleIndex];

}, 2000);


// Counter Animation

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const updateCounter = () => {

        const target =
            +counter.getAttribute("data-target");

        const current =
            +counter.innerText;

        const increment =
            target / 100;

        if (current < target) {

            counter.innerText =
                Math.ceil(current + increment);

            setTimeout(updateCounter, 20);

        } else {

            counter.innerText = target;
        }
    };

    updateCounter();
});


// Scroll Reveal Animation

const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

    reveals.forEach(section => {

        const top =
            section.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {

            section.classList.add("active");
        }

    });

});

window.dispatchEvent(new Event("scroll"));
const sections =
    document.querySelectorAll("section");

const navLinks =
    document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        if(window.scrollY >= sectionTop){

            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if(
            link.getAttribute("href") ===
            `#${current}`
        ){
            link.classList.add("active");
        }

    });

});
window.addEventListener("load",()=>{

    const loader =
        document.getElementById("loader");

    loader.style.opacity = "0";

    setTimeout(()=>{

        loader.style.display = "none";

    },600);

});