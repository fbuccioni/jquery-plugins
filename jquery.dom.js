/**
 * jquery.dom.js version 0.4b
 *
 * jQuery DOM manipulation plugin
 * written by Felipe Alcacibar <falcacibar@gmail.com>
 *
 * Liscenced under the terms of the MIT liscence.
 *
 * Based on MochiKit javascript framework DOM manipulation library 
 * and MochiKit bases in python Twisted Matrix framework
 * 
 **/

(function($) {
	var htmlTags = "embed canvas a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol optgroup option p param pre q s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var"
		.split(/ /);

	$.createDom = function(name, attrs) {
		var elem	= document.createElement(name);
		var jQueryElem	= jQuery(elem);
		jQueryElem.attr(attrs);
		return jQueryElem;
	}

	$.fn.appendDom	= function(name, attrs, cleanBefore) {
		var newElems = [];
		for(var i=0;i<this.length;i++) {
			if(this[i].nodeType == 1) {
				newElems[i] = document.createElement(name);
				
				if(cleanBefore) {
					var $parent = this.eq(i).empty();
					delete $parent;
				}
				
				var $elem = $(newElems[i]).attr(attrs);				
				this[i].appendChild(newElems[i]);
				delete $elem;	
			}
		}

		var jQueryElems = jQuery(newElems);
		jQueryElems.prevObject = this;
		return jQueryElems;

	};

	var ucf;
	for(var i=0;i<htmlTags.length;i++) {		
		$.fn['append'+(ucf=htmlTags[i].charAt(0).toUpperCase()+htmlTags[i].substring(1))] = $.partial($.fn.appendDom, ('' + htmlTags[i]));
		$['dom'+ucf] = $.partial($.createDom, ('' + htmlTags[i]));
	}
	
	$.fn.rawCss	= function(str) {
		var rules = str.split(/;/);
		var pairs;
		var map = {}; 

		for(var i=0;i<rules.length;i++) {
			 pairs = jQuery.trim(rules[i])
					.replace(/([^ \t\n\r])([ \t\n\r]*?):([ \t\n\r]*?)([^ \t\n\r])/, '$1:$4')
					.split(/:/)
			map[pairs[0]] = pairs[1];
		}
		
		delete pairs, pairs, i;

		this.css(map);
		return this;
	}

	$.fn.swapDom	= function(elem) {
		var isDom	= (typeof(elem.nodeName) != 'undefined');
		var isjQuery	= (elem instanceof jQuery);
		
		if(!(isDom || isjQuery || jQuery.isArray(elem)))
			jQuery.error("swapDom: wrong argument to swap dom");

		if((isjQuery || jQuery.isArray(elem))){
			if(elem.length == 1) { 
				elem		= elem[0];
				isDom		= true;
				isjQuery	= false;
			} else if(elem.length != this.length)
				jQuery.error("swapDom: the count of the elements to replace must be the same of the current selection.");
		}

		var cloned = [];
		for(var i=0;i<this.length;i++) {
			var from	= jQuery(this[i]);
			var to		= jQuery(isDom ? elem : elem[i]);
			var clone	= to.clone(true);

			from.replaceWith(clone);
			to.replaceWith(from);
			
			cloned[i] = clone[0]
			
			delete to, from, clone;
		}
		
		if(isjQuery) delete elem;

		cloned = jQuery(cloned);
		
		cloned.prevObject = this;
		return cloned;
	}

	delete htmlTags, ucf;
	
	var switchattrprop	= function(attrprop, switchie, attrval) {
		if(attrval == null) attrval = attrprop;
		
		if(switchie)
			this.setAttribute(attrprop, attrval);
		else
			this.removeAttribute(attrprop);
			
		this[attrprop] = switchie;
	}
	
	
	jQuery.fn.disable = function () {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'disabled', true);
		}
		
		return this;
	};

	jQuery.fn.enable = function () {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'disabled', false);
		}
		return this;
	};

	jQuery.fn.selected = function() {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'selected', true);
		}
		
		return this;		
	}
	
	jQuery.fn.unselected = function() {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'selected', false);
		}
		
		return this;		
	}
	
	jQuery.fn.check = function() {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'checked', true);
		}
		
		return this;		
	}
	
	jQuery.fn.uncheck = function() {
		for(var i=0;i<this.length;i++) {
			switchattrprop.call(this[i], 'checked', false);
		}
		
		return this;		
	}	
})(jQuery);
