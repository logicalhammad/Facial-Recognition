const header = document.querySelector("header");

const links = document.querySelectorAll(".nav-link");

const toggle_btn = document.querySelector(".toggle-btn");

const hamburger = document.querySelector(".hamburger");

var progressAnimationPlayed = false;

stickyNavbar();

window.addEventListener("scroll", () => {
	stickyNavbar();
});

/* ----------------------- Sticky Navbar ----------------------- */

function stickyNavbar() {
	header.classList.toggle("scrolled", window.pageYOffset > 0);
}




hamburger.addEventListener("click", () => {
	document.body.classList.toggle("open");
	document.body.classList.toggle("stopScrolling");
});

links.forEach(link => {
	document.body.classList.remove("open");
	document.body.classList.remove("stopScrolling");
});


