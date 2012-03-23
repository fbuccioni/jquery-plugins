/**
 * jquery.func.js version 1.0
 * jQuery method proxy with params and partially applied function plugin
 *
 * Copyright (C) 2009 Felipe Alcacibar <falcacibar@gmail.com>
 *
 *
 * Ported from MochiKit javascript framework written by Bob Ippolito 
 * and distributed under the terms of MIT liscence.
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

(function($) {
	$.proxyParams =  function (func, obj/* args... */) {
		if (typeof(func) == "string") {
			func = obj[func];
		}
		
		var im_func = func.im_func;
		var im_preargs = func.im_preargs;
		var im_self = func.im_self;
        
		if (typeof(func) == "function" && typeof(func.apply) == "undefined") {
			func = (function (func) {
  	  	  		// fast path!
  	  	  		switch (arguments.length) {
  	  	  		    case 0: return func();
  	  	  		    case 1: return func(arguments[0]);
  	  	  		    case 2: return func(arguments[0], arguments[1]);
  	  	  		    case 3: return func(arguments[0], arguments[1], arguments[2]);
  	  	  		}
  	  	  		var args = [];
  	  	  		for (var i = 0; i < arguments.length; i++) {
  	  	  		    args.push("arguments[" + i + "]");
  	  	  		}
  	  	  		return eval("(func(" + args.join(",") + "))");
			})(func)
		}
		
		if (typeof(im_func) != 'function') {
			im_func = func;
		}
		if (typeof(obj) != 'undefined') {
			im_self = obj;
		}
		if (typeof(im_preargs) == 'undefined') {
			im_preargs = [];
		} else  {
			im_preargs = im_preargs.slice();
		}
		
		jQuery.merge(im_preargs, jQuery.makeArray(arguments).slice(2));

		var newfunc = function () {
			var args = jQuery.makeArray(arguments);
			var me = arguments.callee;
			if (me.im_preargs.length > 0) {
			    args = me.im_preargs.concat(args);
			}
			var obj = me.im_self;
			if (!obj) {
			    obj = this;
			}

			return me.im_func.apply(obj, args);
		};

		newfunc.im_self = im_self;
		newfunc.im_func = im_func;
		newfunc.im_preargs = im_preargs;
		return newfunc;
	},
	

	$.partial = function (func) {
	    return jQuery.proxyParams.apply(this, jQuery.merge([func, undefined], jQuery.makeArray(arguments).slice(1)));
	}
})(jQuery);

