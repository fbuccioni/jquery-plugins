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