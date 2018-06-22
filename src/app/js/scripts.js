/*
Internal navigation - Code by Zsolt Király
v1.0.9 - 2018-04-17
*/

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
            menuElement[0].classList.add('active');

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

        sidebarDiv.innerHTML = '<div class="scroll-line"><div class="line" style="height: 0px;"></div></div><ul></ul>';

        var menuElement = iN.querySelectorAll('.menu li'),
            menuLen = menuElement.length,
            sidebar = iN.querySelector('.sidebar-navigation ul');

        var stop = 0;
        while (stop < menuLen) {
            sidebar.innerHTML += '<li></li>';
            stop++;
        }

        var sidebarLi = iN.querySelectorAll('.sidebar-navigation ul li');

        sidebarLi[0].classList.add('active');

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

    function scrollLine(iN) {
        var firstScrollElement = getElemDistance(iN.querySelectorAll('.scroll-element')[0]),
            h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            windowScrollHeight = document.body.scrollHeight - h,
            scrollLineHeight = iN.querySelector('.scroll-line').offsetHeight,
            windowRatio = windowScrollHeight / scrollLineHeight;

        window.addEventListener('scroll', function() {
            if (firstScrollElement < document.body.scrollTop || firstScrollElement < document.documentElement.scrollTop) {
                var ratio = (window.pageYOffset - firstScrollElement) / windowRatio;

                if (ratio <= scrollLineHeight) {
                    iN.querySelector('.scroll-line .line').style.height = ratio + 'px';
                }
            }
        }, false);
    }

    function setActive(iN) {
        var scrollActive = iN.querySelectorAll('.scroll-element');

        forEach(scrollActive, function(index, scrollActives) {

            window.addEventListener('scroll', function() {
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
            }, false);
        });
    }

    function app() {
        var internalNavigation = document.querySelector('html.internal-navigation');

        if(internalNavigation) {
            scrollPosition(internalNavigation, config);
            setActive(internalNavigation);
            sidebarNavigation(internalNavigation, config);
            scrollLine(internalNavigation);
            scrollMax(internalNavigation);
        }
    }

    return {
        app: app
    }

}();