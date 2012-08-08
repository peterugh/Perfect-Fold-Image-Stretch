/**
*
* @author Pete Rugh peterugh@gmail.com 
*
* Image Stretching jQuery Plugin
*
* ©2012 Pete Rugh
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
* 
*/

/* 
Example Usage

Simplest form

$("img").sizeImage();

Default Variables

$("img").sizeImage({
	alignHorizontal: 'center',	//Type: String		values: left/center/right
	alignVertical: 'middle',	//Type: String		values: top/middle/bottom
	container: this.parent(),	//Type: Selector	Plugin assumes that the parent element is the container.
	easingMethod: 'swing',		//Type: String		default jquery easing method
	fadeTime: 2000,				//Type: Int			default fade length
	heightMax: null,			//Type: Bool		Minimum image height
	heightMin: null,			//Type: Bool		Maximum image height
	offset : 0,					//Type: Int			Amount of space to leave visible below image in viewport. Int is pixels
	changeOnResize: true,		//Type: Bool		Whether or not to recalculate when resizing viewport
	imageLoaded: function() {}	//Type: Function	Execute code after the plugin is finished resizing. Fires 1 time only.
	imageVisible: function(){}	//Type: Function	Executed after the image becomes fully visible
});

Utilizing all variables with non-default values

$("img").sizeImage({
	alignVertical: 'bottom',
	alignHorizontal: 'right',
	container: '#stretch_holder',
	easingMethod: 'easeOutQuad',
	fadeTime: 5000,
	heightMax: 900,
	heightMin: 400,
	offset: 270,
	changeOnResize: true,
	imageLoaded: function() {
		//more code
		//stack plugin on top?
	},
	imageVisible: function() {
		//happens after image is showing
	}
});

*/

jQuery.fn.sizeImage = function (options) {
	"use strict";

	// Set the defaults
    var settings = $.extend({
		alignHorizontal: 'center', //values: left/center/right
		alignVertical: 'middle', //values: top/middle/bottom
		container: this.parent(), //the container. We assume that the parent element is the container, but it might not be. Let them declare it
		easingMethod: 'swing', //default jquery easing method
		fadeTime: 2000, //default fade length
		heightMax: null, //self explanatory
		heightMin: null, //self explanatory
		offset : 0,	//This means the container will extend to the bottom of the viewport, change it to move it up from the bottom of the viewport
		changeOnResize: true,
		imageLoaded: function () {},
		imageVisible: function () {}
	}, options),
		containerHeight,
		containerWidth,
		imageHeight,
		imageWidth,
		pctX,
		pctY,
		scaledHeight,
		scaledWidth,
		halfOverflow,
		//theOffset = settings.offset + $(settings.container).position().top,	//calculate the true offset. This accounts for the container not being at the top of the viewport
		theOffset = 0,
		theImage = this, //grab the image the plugin is attached to
		adjustedHeight = $(window).height() - theOffset, //Determine how much to allow below the image
		activated = false,
		imgLoadCheck;

	//determine the proper height based on heightMax and heightMin
	if (settings.heightMax != null && settings.heightMax < adjustedHeight) {
		adjustedHeight = settings.heightMax;
	}
	if (settings.heightMin != null && settings.heightMin > adjustedHeight) {
		adjustedHeight = settings.heightMin;
	}
	//make it transparent until it is loaded
	//make it positioned absolute	
	$(theImage)
		.css({
			opacity: 0,
			position: 'absolute'
		});

	//size container intitally
	//this creates the "frame" for the image before we have to wait for it to load
	//the height will re-draw on resize
	$(settings.container)
		.css({
			display: 'block',
			left: '0',
			overflow: 'hidden',
			position: 'relative',
			top: '0'
		})
		.height(adjustedHeight)
		.width($(window).width());

	//the function that actually repositions the image
	function posImg() {

		//get height of box
		adjustedHeight = $(window).height() - theOffset;

		//determine the proper height based on heightMax and heightMin
		if (settings.heightMax != null && settings.heightMax < adjustedHeight) {
			adjustedHeight = settings.heightMax;
		}
		if (settings.heightMin != null && settings.heightMin > adjustedHeight) {
			adjustedHeight = settings.heightMin;
		}
		//redraw height & width of box
		$(settings.container)
			.height(adjustedHeight)
			.width($(window).width());

		//fade in image now that it is loaded
		//use the default jquery animation method 

		theImage
			.animate({
				opacity: 1
			}, settings.fadeTime, settings.easingMethod, function(){
				settings.imageVisible();
			});

		//the height/width of the container
		containerHeight = adjustedHeight;
		containerWidth = $(window).width();

		//resize the image according to the container height/width
		imageHeight = $(theImage).height();
		imageWidth = $(theImage).width();

		//determine the ratio of height/width to see what part of the image needs to be larger
		pctY = containerHeight / imageHeight;
		pctX = containerWidth / imageWidth;

		if (pctX > pctY) {
			//maintain aspect ratio so that it overflows x
			scaledHeight = imageHeight * pctX;
			$(theImage).height(scaledHeight);
			$(theImage).width(containerWidth);

		} else {
			//maintain aspect ratio so it overflows y
			scaledWidth = imageWidth * pctY;
			$(theImage).height(containerHeight);
			$(theImage).width(scaledWidth);

		}
		//Check for which way the user wants to align the image
		switch (settings.alignVertical) {
		case 'top':
			$(theImage).css('top', 0);
			break;
		case 'bottom':
			$(theImage).css('bottom', 0);
			break;
		default:
			halfOverflow = (Math.abs(($(theImage).height() - containerHeight) / 2)) * -1;
			$(theImage).css('top', halfOverflow);
			break;
		}

		//Check for which way the user wants to align the image
		switch (settings.alignHorizontal) {
		case 'left':
			$(theImage).css('left', 0);
			break;
		case 'right':
			$(theImage).css('right', 0);
			break;
		default:
			halfOverflow = (Math.abs((($(theImage).width() - containerWidth) / 2))) * -1;
			$(theImage).css('left', halfOverflow);
			break;
		}
	}


	$(window).resize(function () {
		//make sure the window resize should trigger resize
		if (settings.changeOnResize) {
			//recalculate the adjusted height on resize
			adjustedHeight = $(window).height() - theOffset;
			//resize the image
			posImg();
		}
	});

	adjustedHeight = $(window).height() - theOffset;

	//check to make sure the image is loaded.
	imgLoadCheck = setInterval(function () {
		if ($(theImage).prop('complete') == true) {
			posImg();
			//has the plugin main function fired?
			if (activated == false) {
				//run a function once when the first image loads
				if (options.imageLoaded) {
					options.imageLoaded();
				}
				//this keeps the function from running multiple times
				activated = true;
			}
			clearInterval(imgLoadCheck);
		}
	}, 100);
};