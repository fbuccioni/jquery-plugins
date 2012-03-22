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
