/**
 * @author Joren Thijs
 * @version V1.0
 * @summary This is the main JS file for this website
 */

/**
 * Navigation
 */
var hameburger = document.querySelector('.hamburger');
var navigation = document.querySelector('.navigation');

console.log(hameburger);
console.log(navigation);

hameburger.addEventListener('click', onHamburgerClick);

function onHamburgerClick() {
    if (navigation.classList.contains('expanded')) {
        collapseHamburger()
    }
    else {
        navigation.classList.add('expanded');
    }
}

function collapseHamburger() {
    navigation.classList.remove('expanded');
}

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    if (window.innerWidth > 800) {
        collapseHamburger();
    }
}