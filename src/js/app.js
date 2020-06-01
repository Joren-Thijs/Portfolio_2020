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
        navigation.classList.remove('expanded');
    }
    else {
        navigation.classList.add('expanded');
    }
}