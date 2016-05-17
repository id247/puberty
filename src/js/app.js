'use strict';

const $header = $('.header');
const $win = $(window);
const $doc = $(document);

function goTo(){
	$('.js-goto').on('click', function(e){
		e.preventDefault();
		const sectionId = parseInt($(this).attr('href').replace('#section-', ''));
		$.fn.fullpage.moveTo(sectionId);
	});
}

function fullPage(){

    $('#fullpage').fullpage({
        //Navigation
        //menu: '#menu',
        lockAnchors: true,
        //anchors: anchors,
        navigation: true,
        navigationPosition: 'right',
        //navigationTooltips: ['firstSlide', 'secondSlide'],
        showActiveTooltip: false,
        slidesNavigation: true,
        slidesNavPosition: 'bottom',

        //Scrolling
        css3: true,
        scrollingSpeed: 700,
        autoScrolling: true,
        fitToSection: true,
        fitToSectionDelay: 1000,
        scrollBar: false,
        easing: 'easeInOutCubic',
        easingcss3: 'ease',
        loopBottom: false,
        loopTop: false,
        loopHorizontal: true,
        continuousVertical: false,
        //normalScrollElements: '#element1, .element2',
        scrollOverflow: false,
        touchSensitivity: 15,
        normalScrollElementTouchThreshold: 5,

        //Accessibility
        keyboardScrolling: true,
        animateAnchor: true,
        recordHistory: true,

        //Design
        controlArrows: true,
        verticalCentered: true,
        resize : false,
        //sectionsColor : ['#ccc', '#fff'],
        paddingTop: '100px',
        paddingBottom: '30px',
        //fixedElements: '.header',
        responsiveWidth: 0,
        responsiveHeight: 0,

        //Custom selectors
        sectionSelector: '.content__section',
        slideSelector: '.slide',

        //events
        onLeave: function(index, nextIndex, direction){
        	if ( nextIndex > 1 ){
				$header.addClass('header--visible');
			}else{
				$header.removeClass('header--visible');
			}
        },
        afterLoad: function(anchorLink, index){},
        afterRender: function(){},
        afterResize: function(){},
        afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex){},
        onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex){}
    });
}

$(document).ready(function() {

	goTo();
	fullPage();

});
