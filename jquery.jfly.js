jQuery.fn.jfly = function(settings) {
	jQuery.jfly(this, settings);
	return this;
}

jQuery.jfly = function(objects, settings) {		
	 if(!(objects instanceof jQuery)) 
	 	objects = jQuery(objects);

	 var ret;
	 
	 objects.data('jfly', ret = new jQuery.jfly.init(objects, settings));
	 return ret;
}


jQuery.jfly.init = function(objects, settings) {
	if(!(objects instanceof jQuery)) 
		objects = jQuery(objects);
		
	var s			= this.settings;
	var self		= this;
	
	this.settings	= jQuery.extend(true, {}, s, settings);
	this.objects	= objects;
	
	this.initial	= [];
	
	for(var i=0;i<this.objects.length;i++) {
/*	 	var tmpel, tl;
	 	tl = (tmpel = this.objects.eq(0)).offset();

	 	this.initial.push([tl.left, tl.top]);
		delete tmpel, tl;
		*/
		
		this.initial.push([this.objects.eq(i).css('left'), this.objects.eq(i).css('top')]);
	}
	
	this.objects.each(function(idx) {
		var $elem;
		$elem = $(this);
	 	 
	 	var diff;

	 	if(self.settings.startxoffset == 'left' || self.settings.startxoffset == 'right') 
			$elem.css('left', ((self.settings.startxoffset == 'left') ? (0 - self._elemc($elem, 'h')) : (self.extent().x)));
	
		if(self.startyoffset == 'top' || self.settings.startyoffset == 'bottom') 
			$elem.css('top', ((self.settings.startoffset == 'bottom')	? (0 - self._elemc($elem, 'v')) : (self.extent().y))); 
	});
			
	this.step = this.settings.initstep;
	
	this.start();
}

jQuery.jfly.init.prototype = {
		'_elemc'	: function($elem, t) { 
				var ioz = function(i) {
					return isNaN(i) ? 0 : i;
				};                           
					
				return ((t=='v') 
					? $elem.height()	+ ioz(parseInt($elem.css('border-bottom-width')))	+ ioz(parseInt($elem.css('border-top-width')))
					: $elem.width()		+ ioz(parseInt($elem.css('border-left-width')))		+ ioz(parseInt($elem.css('border-right-width'))) 
		)}
		, 'extent'		: function() {
		 	return ((this.settings.relativeto == 'screen') ? {
					'x'		: screen.width 
					,'y'	: screen.height
			 	} : (((this.settings.relativeto == 'window')) ? {
					'x'		: $(window).width() 
					,'y'	: $(window).height()
			 	} : {
					'x'		: $(document).width() 
					,'y'	: $(document).height()			 		
			 	}));			
		}
		, 'settings'	: {
			  'direction'		: 'ltr'
			, 'duration'		: 1000
			, 'hold'			: 8000
			, 'startxoffset'	: ''
			, 'startyoffset'	: ''
			, 'relativeto'		: 'window'
			, 'easing'			: 'swing'
			, 'easingX'			: null
			, 'easingY'			: null
			, 'initstep'		: 0
			, 'hideatend'		: false
		}		
		, 'running'			: false
		, 'objects'			: null
		, 'initial'			: []
		, 'step'			: 0
		, 'stop'			: function() {
			for(var i=0;i<this.objects.length;i++) {
				this.objects.eq(i)
					.stop()
					.animate({
						 'left'	: this.initial[i][0]
						,'top'	: this.initial[i][1]
					}, 'slow', this.settings.easing)
			 	
			}						
		}
		, 'reset'			: function() {
			for(var i=0;i<this.objects.length;i++) {
				var el = this.objects.eq(i);
				
					el.stop()
					.css({
					 'left'	: this.initial[i][0]
					,'top'	: this.initial[i][1]
				})
			}			
		}
		, 'start'			: function() {
				var extent;
				
				// [ x, y, duration, easing, oncomplete, hold]
				var self	= this;	
				
				if(self.settings && self.settings.steps && self.settings.steps.length) {					
					this.objects.each(function() {
						if(self.step == 0) {
							this.style.display		= 'block';
							this.style.visibility	= 'visible';
						}
						
					 	var $elem	= $(this);
					 	var step	= self.settings.steps[self.step];				 	
					 	
					 	var args = [{}];
					 	
					 	if(step[0] != null) {
							if(step[0] == 'center') {
								step[0] = (self.extent().x - self._elemc($elem, 'h')) / 2;
							}
								
							else if(step[0] == 'offsetleft')
								step[0] = 0 - self._elemc($elem, 'h');						
							else if(step[0] == 'offsetright')
								step[0] = self.extent().x;
								
							args[0].left = step[0];										 		
					 	}
	
						if(step[1] != null) {							
							if(step[1] == 'center')
								step[1] = Math.floor((self.extent().y - self._elemc($elem, 'v')) / 2);
							else if(step[1] == 'offsettop')
								step[1] = 0 - self._elemc($elem, 'v');
							else if(step[1] == 'offsetbottom')
								step[1] = self.extent().y - self._elemc($elem, 'v');
								
							args[0].top = step[1];
						}	 
				 		
			 			
			 			var defaultEasing	= ((typeof(step[3]) != 'undefined' && step[3] != null) ? step[3] : self.settings.easing);
			 			var settings		= {
			 					'duration'			: ((typeof(step[2]) != 'undefined' && step[2] != null) ? step[2] : self.settings.duration)
			 					,'specialEasing'	: {
					 				  'left'	: ((self.settings.easingX != null) ? self.settings.easingX : defaultEasing)
									, 'right'	: ((self.settings.easingX != null) ? self.settings.easingX : defaultEasing)
					 				, 'top'		: ((self.settings.easingY != null) ? self.settings.easingY : defaultEasing)
					 				, 'bottom'	: ((self.settings.easingY != null) ? self.settings.easingY : defaultEasing)		 						
			 					}
			 					,'complete'			: function() {
												 		window.setTimeout(function() {
												 			self.step++;
												 			
															if(typeof(step[4]) != 'undefined' && jQuery.isFunction(step[4]))															
																step[4].apply(this, arguments);
																												 			
												 			if(self.step < self.settings.steps.length)
												 				self.start();
												 			else if(self.settings.hideatend)
												 				self.objects.css('display' , 'none')
												 			
												 		}, ((typeof(step[5]) != 'undefined' && step[5] != null) ? step[5] : self.settings.hold));				 
								} 
			 			};
			 			
						// try { console.debug(args)}
						//catch(e) {}
						
						args.push(settings);
						delete defaultEasing;

				 		$elem.animate.apply($elem, args);
				 });
					
				} 
		}
}


