/**
 * jquery.jsonrpc.js - version 1.2
 * JSON-RPC Response parser for jQuery ajax responses.
 *
 * Copyright (C) 2010 Felipe Alcacibar <falcacibar@gmail.com>
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
(function($) {
	$.ajaxSettings.accepts.jsonrpc = $.ajaxSettings.accepts.json;
	
	var parseJsonrpc = function(data) {
		if(typeof(data) == 'string') data = jQuery.parseJSON(data);

		if(data.error == null || data.error == {} || !data.error) { 
			data = data.result;
		} else {
			throw(data.error);
		}

		return data;
	}

	if(typeof($.ajaxSettings.converters) !== 'undefined')
		$.ajaxSettings.converters["text jsonrpc"]  = parseJsonrpc

	$.httpData =  function( xhr, type, s ) {
		var ct = xhr.getResponseHeader("content-type") || "",
			xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
			data = xml ? xhr.responseXML : xhr.responseText;

		if ( xml && data.documentElement.nodeName === "parsererror" ) {
			jQuery.error( "parsererror" );
		}

		if ( s && s.dataFilter ) {
			data = s.dataFilter( data, type );
		}

		if ( typeof data === "string" ) {
			if ( type === "json" || type == "jsonrpc" || !type && ct.indexOf("json") >= 0 ) {
				data = jQuery.parseJSON( data );
			
			if(type == "jsonrpc") 
				data = parseJsonrpc(data);
			
			} else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
				jQuery.globalEval( data );
			}
		}

		return data;
	}


	$.jsonrpcSettings	= {
		'dataType'	: 'jsonrpc'
		,'cache'	: false
		,'error'	:  function(xhr, errorType, errorMsg) {
			alert(errorMsg);
		}
	};

	$.jsonrpc = function(settings) {
		var s = jQuery.extend(true, {}, jQuery.origSettings, settings, jQuery.jsonrpcSettings);
		s.error = settings.error || jQuery.jsonrpcSettings.error;
		return $.ajax(s);
	}
	
	$.getJsonrpc = function(url, data, callback, errorback) {
		if (jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}

		var s = jQuery.extend(true, jQuery.origSettings, {
				'type'		: 'GET'
				,'url'		: url
				,'data'		: data
				,'success'	: callback
		}, jQuery.jsonrpcSettings);
		s.error =  errorback || jQuery.jsonrpcSettings.error;

		return $.ajax(s);
	}

	$.postJsonrpc = function(url, data, callback, errorback) {
		if (jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}

		var s = jQuery.extend(true, jQuery.origSettings, {
				'type'		: 'POST'
				,'url'		: url
				,'data'		: data
				,'success'	: callback
		}, jQuery.jsonrpcSettings);
		s.error =  errorback || jQuery.jsonrpcSettings.error;

		return $.ajax(s);
	}
})(jQuery);
