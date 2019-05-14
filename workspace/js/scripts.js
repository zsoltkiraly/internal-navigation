/*
Internal navigation - Code by Zsolt Király
v1.0.9 - 2018-04-17
*/

'use strict';

function hasTouch() {
    return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

if (hasTouch()) {
    try {
        for (var si in document.styleSheets) {
            var styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover')) {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    } catch (ex) {}
}

function getElemDistance(element) {
    var location = 0;
    if (element.offsetParent) {
        do {
            location += element.offsetTop;
            element = element.offsetParent;
        } while (element);
    }
    return location >= 0 ? location : 0;
}

var menuFixed = function() {
    function menu() {
        var menu = document.querySelector('menu'),
            menuTopDistance = getElemDistance(menu);

        menu.nextElementSibling.style.marginTop = menu.offsetHeight + 'px';
        menu.setAttribute('data-position', menuTopDistance);

        window.addEventListener('scroll', function() {

            if (menu.getAttribute('data-position') < document.body.scrollTop || menu.getAttribute('data-position') < document.documentElement.scrollTop) {
                menu.classList.add('scroll');

            } else {
                menu.classList.remove('scroll');
            }
        }, false);
    }

    return {
        menu: menu
    }
}();

var scrollAnimation = function() {

    function getWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    function getMenuHeight() {
        return document.querySelector('menu').offsetHeight;
    }

    function removeHash() { 
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    var forEach = function(array, callback, scope) {
        var i = 0;
        for (; i < array.length; i++) {
            callback.call(scope, i, array[i]);
        }
    }

    function scrolling(element, duration) {
        var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            startingY = window.pageYOffset,
            targetY;

        if(document.body.scrollHeight - element < h) {
            targetY = document.documentElement.scrollHeight - h;

        } else {
            targetY = element - getMenuHeight();
        }

        var diff = targetY - startingY;

        var easing = function(t) {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 }

        var start;
        if (!diff) return;

        window.requestAnimationFrame(function step(timestamp) {
            if (!start) {
                start = timestamp;
            }

            var time = timestamp - start,
                percent = Math.min(time / duration, 1);

            percent = easing(percent);

            window.scrollTo(0, startingY + diff * percent)

            if (time < duration) {
                window.requestAnimationFrame(step);
            }
        });
    }

    function resize() {
        menuFixed.menu();

        var cachedWidth = getWidth();

        window.addEventListener('resize', function() {
            var newWidth = getWidth();

            if(newWidth !== cachedWidth) {
                menuFixed.menu();
            }
        }, false);

    }

    function scrollMax(iN) {
        window.addEventListener('scroll', function() {
            var scrollMax = document.documentElement.scrollHeight - document.documentElement.clientHeight;

            if (window.pageYOffset == scrollMax) {
                var sidebarLi = iN.querySelectorAll('.sidebar-navigation ul li'),
                    menuLi = iN.querySelectorAll('.menu li');

                function lastActive(li) {
                    forEach(li, function(index, liS) {
                        liS.classList.remove('active');
                    });
                }

                lastActive(sidebarLi);
                lastActive(menuLi);

                var lastMenu = menuLi[menuLi.length - 1],
                    lastSidebar = sidebarLi[sidebarLi.length - 1];

                lastMenu.classList.add('active');
                lastSidebar.classList.add('active');
            }
        }, false);
    }

    function scrollPosition(iN, c) {
        var scrollElement = iN.querySelectorAll('.scroll-element');

        forEach(scrollElement, function(index, scrollElements) {
            var menuElement = iN.querySelectorAll('.menu li');
            //menuElement[0].classList.add('active');

            forEach(menuElement, function(index, menuElements) {
                menuElements.addEventListener('click', function() {
                    var obj = this;

                    if (obj.getAttribute('data-id') == scrollElements.getAttribute('data-id')) {

                        var elementDistance = getElemDistance(scrollElements);
                        window.location.hash = obj.getAttribute('data-id');
                        scrolling(elementDistance, c.duration);
                    }

                }, false);
            });

            function hash() {
                var hash = window.location.hash;

                if (hash == '#' + scrollElements.getAttribute('data-id')) {
                    var elementDistanceHash = getElemDistance(scrollElements);
                    scrolling(elementDistanceHash, c.duration);
                }
            }

            window.addEventListener('hashchange', function() {
                hash();
            }, false);

            setTimeout(function() {
                hash();
            }, 100);
        });

        window.addEventListener('scroll', function() {
            if(document.body.scrollTop == 0 && document.documentElement.scrollTop == 0) {
                removeHash();
            }
        }, false);
    }

    function sidebarNavigation(iN, c) {
        var sidebarDiv = document.createElement('SECTION');
        sidebarDiv.setAttribute('class', 'sidebar-navigation');
        document.body.insertBefore(sidebarDiv, document.body.firstChild);

        sidebarDiv.innerHTML = '<ul></ul>';

        var menuElement = iN.querySelectorAll('.menu li'),
            menuLen = menuElement.length,
            sidebar = iN.querySelector('.sidebar-navigation ul');

        var stop = 0;
        while (stop < menuLen) {
            sidebar.innerHTML += '<li data-number="' + (stop + 1) + '"><span class="circle"></span><span class="stripe"></span></li>';
            stop++;
        }

        var sidebarLi = iN.querySelectorAll('.sidebar-navigation ul li');

        //sidebarLi[0].classList.add('active');

        var sidebarLiArray = [],
            i = 0,
            lenList = sidebarLi.length;
        for (; i < lenList; i++) {
            var sidebarLis = sidebarLi[i];
            sidebarLiArray.push(sidebarLis);
        }

        var i = 0,
            lenMenuElement = menuElement.length,
            lenLiArrayLen = sidebarLiArray.length;
        for (; i < lenMenuElement && lenLiArrayLen; i++) {
            var sidebarLiArrays = sidebarLiArray[i],
                menuElements = menuElement[i];

            sidebarLiArrays.setAttribute('data-id', menuElements.getAttribute('data-id'));

            var scrollElement = iN.querySelectorAll('.scroll-element');

            forEach(scrollElement, function(index, scrollElements) {
                sidebarLiArrays.addEventListener('click', function() {
                    var obj = this;

                    if (obj.getAttribute('data-id') == scrollElements.getAttribute('data-id')) {

                        var elementDistance = getElemDistance(scrollElements);
                        window.location.hash = obj.getAttribute('data-id');
                        scrolling(elementDistance, c.duration);
                    }
                }, false);
            });
        }
    }

    function setId(iN) {
        var sidebarElements = iN.querySelectorAll('.sidebar-navigation ul li'),
            scrollElements = iN.querySelectorAll('.scroll-element');

        forEach(sidebarElements, function(index, sidebarElement) {
            forEach(scrollElements, function(index, scrollElement) {
                if(scrollElement.getAttribute('data-id') == sidebarElement.getAttribute('data-id')) {
                    scrollElement.setAttribute('data-number', parseFloat(sidebarElement.getAttribute('data-number')));
                }
            });
        });
    }

    function setActive(iN) {
        var scrollActive = iN.querySelectorAll('.scroll-element');

        forEach(scrollActive, function(index, scrollActives) {

            function navigationActive() {
                var scrollToZero = Math.floor(scrollActives.getBoundingClientRect().top - getMenuHeight());

                if (scrollToZero <= 0) {
                    var scrollActivesDataId = scrollActives.getAttribute('data-id');

                    function active(element) {
                        forEach(element, function(index, active) {

                            var menuElementsDataId = active.getAttribute('data-id');

                            if (menuElementsDataId == scrollActivesDataId) {
                                active.classList.add('active');

                            } else {
                                active.classList.remove('active');
                            }
                        });
                    }

                    var menuElement = iN.querySelectorAll('.menu li');
                    active(menuElement);

                    var sidebarLi = iN.querySelectorAll('.sidebar-navigation ul li');
                    active(sidebarLi);
                }

                setTimeout(function() {
                    var sidebarLiActive = document.querySelector('.sidebar-navigation ul li.active');

                    if(sidebarLiActive) {
                        var activeLiId = parseFloat(sidebarLiActive.getAttribute('data-number'));
                        var sidebarLis = document.querySelectorAll('.sidebar-navigation ul li');

                        forEach(sidebarLis, function(index, sidebarLi) {

                            var allScrollLiId = parseFloat(sidebarLi.getAttribute('data-number'));

                            if(allScrollLiId < activeLiId) {
                                sidebarLi.classList.add('before-line');

                            } else {
                                sidebarLi.classList.remove('before-line');
                            }
                        });
                    }
                }, 50);
            }

            window.addEventListener('scroll', function() {
                navigationActive();
            }, false);

            navigationActive();
        });
    }

    function setFirst(iN) {
        window.addEventListener('scroll', function() {

            var sidebarLi = iN.querySelectorAll('.sidebar-navigation ul li'),
                menuLi = iN.querySelectorAll('.menu li'),
                scrollActive = iN.querySelectorAll('.scroll-element');

            var firstScrollElement = scrollActive[0],
                sidebarLiFirst = sidebarLi[0],
                menuLiFirst = menuLi[0];

            var firstElementTop = getElemDistance(firstScrollElement) - getMenuHeight();

            if(window.pageYOffset != 0) {
                if (window.pageYOffset < firstElementTop) {
                    sidebarLiFirst.classList.remove('active');
                    menuLiFirst.classList.remove('active');
                }
            }
        }, false);
    }

    function signatura() {
        if (window['console']) {
            const text = {
                black: '%c     ',
                blue: '%c   ',
                author: '%c  Zsolt Király  ',
                github: '%c  https://zsoltkiraly.com/'
            }

            const style = {
                black: 'background: #282c34',
                blue: 'background: #61dafb',
                author: 'background: black; color: white',
                github: ''
            }

            console.log(text.black + text.blue + text.author + text.github, style.black, style.blue, style.author, style.github);
        }
    }

    function app() {
        var internalNavigation = document.querySelector('html.internal-navigation');

        if(internalNavigation) {
            signatura();
            resize();
            scrollPosition(internalNavigation, config);
            sidebarNavigation(internalNavigation, config);
            setActive(internalNavigation);
            setId(internalNavigation);
            scrollMax(internalNavigation);
            setFirst(internalNavigation);
        }
    }

    return {
        app: app
    }

}();