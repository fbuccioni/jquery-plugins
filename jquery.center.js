/**
 * jquery.center.js - version 0.4
 * Animated centerer of objects for jQuery
 *
 * Copyright (C) 2011 Felipe Alcacibar <falcacibar@gmail.com>
 *
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * License available in the following URL
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
**/

jQuery.center = function(query, speed, offsetX, offsetY) {
	if(!(query instanceof jQuery)) query = jQuery(query);
	
	if(query.length > 1) query.center(speed, offsetX, offsetY);
	else {
		if(speed == null)		speed		= 'slow';
		if(offsetX == null)		offsetX		= 0;
		if(offsetY == null)		offsetY		= 0;

		var pos = query.position();	
		
		if(pos) {
			query.css({
						"top"			: pos.top
						,"left"			: pos.left
						, "position"	: "absolute"	
			});
			
			var csscenter = {
				 "top"			: ((($(window).height() - query.outerHeight()) + offsetY) / 2)
				, "left"		: ((($(window).width() - query.outerWidth()) + offsetX) / 2)
			}
			
			if(speed === 0)		query.css(csscenter);
			else				query.animate(csscenter, speed, 'linear');
		}
	}
	
	return this;
}

jQuery.fn.center = function (speed, offsetX, offsetY) {
	this.each(function() {
		var self = this;
		setTimeout(function() {
			jQuery.center(self, speed, offsetX, offsetY);
		}, 0);
	});
    	
    return this;
}	
