/**
 * jquery.autoform.js - version 1.10
 * Model dependant automatic form generator for jQuery
 *
 * Copyright (C) 2009 Felipe Alcacibar <falcacibar@gmail.com>
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
jQuery.autoform	= function(name, options, parent)  {
	try {
		if(parent && parent.length > 1)  {
			throw(this._errprefix() + ": cannot manage form fore more than 1 element for the selector \"" + parent.selector + "\".");
		}
		
		if(options) jQuery.autoform.processOptions(name, options, (!!parent))

		var out;
		if(parent && typeof(jQuery.autoform.instances[name]) != 'undefined') {
			jQuery.extend(jQuery.autoform.instances[name], {
				 'parent'		: parent
				,'created'		: false
				,'createAgainLock'	: true
			})
        
			var out = jQuery.autoform.instances[name].create();
			out.prevObject = parent;
        
			if(parent instanceof jQuery) 
				parent.append(out);

			return out;
		} else {
			return jQuery.autoform.instances[name];
		}
	} catch(error) {
		jQuery.error(error);
	} 
};

jQuery.autoform.events		= 'error beforesubmit aftersubmit autoform submit beforeaddelem afteraddelem beforeaddlabel afteraddlabel beforeaddbutton afteraddbutton aftercreate startwait stopwait'.split(/ +/);
jQuery.autoform.filters		= 'dataFilter labelFilter'.split(/ +/);
jQuery.autoform.bannedInherit	= 'bannedInherit bannedInheritFilter bannedInheritSetup bannedInheritStupFilter name'.split(/ +/);

jQuery.autoform.instances = {};
jQuery.autoform.processOptions	= function(autoform, options, parent) {
	if(typeof(autoform) == 'string' && typeof(jQuery.autoform.instances[autoform]) == 'undefined') {
		autoform = jQuery.autoform.instances[autoform] = new jQuery.autoform.init(autoform, options);
	} else {
		if(options == null) 	options = {};
		
		if(typeof(options.type) != 'undefined')
			delete options.type;
		if(typeof(options.name) != 'undefined')
			delete options.name;
        
		if(autoform instanceof jQuery.autoform)
			autoform = jQuery.extend(autoform, options);
       		else
			autoform = jQuery.extend(jQuery.autoform.instances[autoform], options);
	}

	var createAgain		= false;
	var modelProcessed	= false;
        
	if(typeof(options.model) != 'undefined' && jQuery.isArray(options.model)) {
		modelProcessed = true;
		autoform.identity = null;
		autoform._model();
        
		if(	typeof(options.data) == 'undefined'
		   	|| (typeof(options.data) != 'undefined' && !options.data)
		)  {
			autoform.data	= null;
			createAgain = true;
		}
	}
        
	if( typeof(options.data) != 'undefined') { 
		if(typeof(options.data) == 'object' || jQuery.isArray(options.data) ) 
			createAgain = true;
		else throw(this._errprefix() + ": the data passed to the form must be an array or a object.");
	} 
        
	if( typeof(options.action) != 'undefined' ) {
		createAgain = true;
		if(!modelProcessed) {
			autoform.identity = null;
			autoform._model();
		}
	}
	
	if(typeof(options.method) != 'undefined')
		createAgain = true;
        
	if(!parent && createAgain) 
		autoform.createAgain();
}

jQuery.autoform.init	= function(name, options) {
	var type	= jQuery.autoform.type(((typeof(options.type) != 'undefined') ? options.type : jQuery.autoform.settings.type));
	var atOptions	= jQuery.extend({}, type);
	var banned	= jQuery.trim(type.bannedInherit + ' bannedFilterSetup bannedFilter banned')
					.split(/ +/)
						.concat(jQuery.autoform.events)
						.concat(jQuery.autoform.filters)
						.concat(jQuery.autoform.bannedInherit); 
	for(var i=0;i<banned.length;i++)  {	
		delete atOptions[banned[i]];
	}

	var opt;
	if(jQuery.isFunction(type.bannedInheritFilter)) {
		for(opt in atOptions) {
			if(!type.bannedInheritFilter(opt)) {
				delete atOptions[opt];
			}
		}
	}

	var sOptions	= jQuery.extend({}, jQuery.autoform.settings);
	    banned	= jQuery.trim(type.bannedSetupInterit)
	    			.split(/[ \r\n\t]+/)
					.concat(jQuery.autoform.events)
					.concat(jQuery.autoform.filters)
					.concat(jQuery.autoform.bannedInherit); 

	for(var i=0;i<banned.length;i++) 
		delete sOptions[banned[i]];
	
	if(type.bannedInheritSetupFilter)  {
		var f = (jQuery.isFunction(type.bannedInheritSetupFilter) 
				? type.bannedInheritSetupFilter 
				: (jQuery.isFunction(type.bannedInheritFilter)
					? type.bannedInheritFilter
					: false
				)
		);

		if(f) {
			for(opt in sOptions) {
				if(!f(opt)) {
					delete sOptions[opt];
				}
			}
		}
	}

	jQuery.extend(true, this, atOptions, sOptions);
	delete atOptions, sOptions;

	this.name = name;

	if(typeof(options) == 'object') 
		jQuery.extend(this, options);
	
	this.type = type;
	this.type.autoform.call(this);
};

jQuery.autoform._submit	= function(event) {
	if(this.action == 'delete') {
		for(var i=1; i<this.model.length; i++) {
			if(this.model[i] != this.identity) {
				this.model[i].element.autoformUI.toggle(false);
			}
		}
	}


	try {
		var cancel = false;
		this._eventorfilter.apply(this, [false, false, 'submit', null].concat(jQuery.makeArray(arguments)));
	} catch(error)  {
		cancel = true;
		event.preventDefault();
		jQuery.error(error);
	}

	if(this.dontSubmit || cancel) {
		event.preventDefault();
		return false;
	}
	
	this.form.unbind('submit.autoformsubmithandler');
};

jQuery.autoform.prototype	= {
	'_vof'		: function(v)  {
			return jQuery.isFunction(v) ? v.call(this) : v;
	}
	, 'create'		: function() {
		this.created		= true;
		this._createlock	= false;
        
		this.form	= jQuery.domForm({
					'method'	: '' + this.method
					,'class'	: this.classForm
					,'action'	: this.urls[this.maps.actionUrl[this.action]]
					,'enctype'	: 'multipart/form-data'
		});
        
		this.method		= this.form[0].method;
		this.loading		= this.form.appendDiv({'class' : this.classLoading}).text(this._vof(this.labelWaitLoad));

		this.form.autoform
		this.form[0].autoform	= this;
		
		var self = this;
        
		if(this.jqueryUI) this._jqueryUI_beforecreate();
		this._eventorfilter(false, true, 'beforecreate', null);
        
		setTimeout(function() {
			self._form();
		}, 500);
		
		return this.form;
	}
	,'createAgain'		: function() {
		if(this.created && !this.createAgainLock)  {
			this.parent.empty();
			this.parent.append(this.create());
		}
	}
	,'_modeldefault'		: function(n) {
		var value = this.model[n].defaultValue;
		return ((typeof(value) == 'undefined') ? '' : ((value === null)  ? '' : value));
	}
	,'_jqueryUI_beforecreate'			: function() {
		this.classForm		+= ' ui-widget ui-widget-content ui-corner-all';
		this.classButton	+= ' ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only';
		this.classLoading	+= ' ui-widget';
		this.classCaption	+= ' ui-widget-header ui-corner-top';
	}
	,'_jqueryUI_aftercreate'			: function() {
		this.form
			.find('.autoform-caption').rawCss('padding: 5px 0px; padding-left: 5px; margin-bottom: 10px')
			.end()
			.find('.autoform-body').rawCss('margin: 10px')
			.end()
			.find('.autoform-textbox, .autoform-textarea, .autoform-combobox')
			.end()
			.find('.autoform-button > span').addClass('ui-button-text')
			.end()
			.find('.autoform-elem-div, .autoform-buttons-div').rawCss('text-align: right')				
	}
	,'_form'		: function() {
		if(this.action == 'add') {
			this.data = {};
			for(var i=0;i<this.model.length;i++) {
				this.data[this.model[i].name] = this._modeldefault(i);
			}
		}

		var self = this;
		
		if(!self.data)  
			return setTimeout(function() {
				self._form()
			}, 100);

		if(this._createlock) return null;
		this._createlock	= true;

		this.form.bind("submit.autoformsubmithandler", jQuery.proxy(jQuery.autoform._submit, this));
		this.form.append(this.caption	= jQuery.domDiv({'class' : this.classCaption}).text(this._vof(this.labelCaption)));
		this.form.append(this.body	= jQuery.domDiv({'class' : this.classBody}));

		this.body[0].style.display = 'none';
		this.caption[0].style.display = 'none';
		
		var idelem = null;
		if(this.identity != null) {
			if(this.action != 'add') {
				this.form.append((idelem = jQuery.autoform.UI.hidden()));
				jQuery.autoform.UI.hidden.value(idelem, (this.id = this._eventorfilter(true, true, 'dataFilter', null, this.data[this.identity.name], null, i)));
				jQuery.autoform.UI.hidden.setName(idelem, this.identityFormName);
			}
			
			this.model[0].element = idelem;
		}
		
		var rowelem, labelelem, elemdiv, elem;
		
		for(i=((this.identity == null) ? 0 : 1);i<this.model.length;i++) {
			if(typeof(this.model[i].options.type) != 'undefined') {
				if(this.model[i].options.type != 'hidden') {
					rowelem		= this.body.appendDiv({ 'class' : this.classRow});
					labelelem	= jQuery.domDiv({'class' : this.classLabel})
								.text(
									this._eventorfilter(true, true, 
										'labelFilter'
										, null
										, this.model[i].label
										, this.id
										, i
								)
					);
                
					labelelem = this._eventorfilter(true, true, 'beforeaddlabel', null, labelelem, this.id, i);
					rowelem.append(labelelem);
					this._eventorfilter(false, false, 'afteraddlabel', null, labelelem, this.id, i);
                
					this.data[this.model[i].name] = this._eventorfilter(true, true, 'dataFilter', null, this.data[this.model[i].name], this.id, i);			
                
					elemdiv		= jQuery.domDiv({'class': this.classElemDiv});
       	       				
					if(typeof(jQuery.autoform.UI[this.model[i].options.type]) == 'undefined') 
						throw("Does not exists the autoform UI called \""+this.model[i].options.type+"\".");
				} else
					elemdiv = this.body;

				elem = jQuery.autoform.UI[this.model[i].options.type](this, elemdiv, this.id, i);
				elem[0].autoformUI	= {
					'autoform'	: this
					,'elem'		: elem
					,'ui'		: jQuery.autoform.UI[this.model[i].options.type]
					,'setName'	: function(name) {
						return this.ui.setName(this.elem, name);
					}
					,'value'	: function() {
						var r = this.ui.value.apply(this.ui, [this.elem].concat(jQuery.makeArray(arguments)));
						if(arguments.length) {
							this.data	= arguments[0];
							this.oldvalue	= this.elem.val();
						}
						return r;
					}
					,'restore'	: function() {
						return this.value(this.data);
					}
					,'toggle'	: function(onoff) {
						return this.ui.toggle(this.elem, onoff);
					}
					,'id'		: this.id
					,'oldvalue'	: null 
					,'data'		: null 
					,'model'	: this.model[i]					
				};
                        
				elem.autoformUI = elem[0].autoformUI;
                        
				elem.autoformUI.value(this.data[this.model[i].name]);
				elem.autoformUI.setName(this.model[i].name);
                        
				elem = this._eventorfilter(true, true, 'beforeaddelem', null, elem, elemdiv, this.id, i);
				elemdiv.append(elem);

				this.model[i].element = elem;

				this._eventorfilter(false, false, 'afteraddelem', null, elem, elemdiv, this.id, i);
                        
				if(elemdiv != this.body)
					rowelem.append(elemdiv);

				this.createAgainLock = false;
			}
		}

		buttonsdiv = jQuery.domDiv({
				'class' : this.classButtonsDiv
		});
		var battrs	= ((jQuery.browser.msie) ? {} : {'type' : 'submit'}); 
		var buttons	= [];

		if(this.action == 'add') {
			//add
			this.buttonadd = jQuery.domButton(jQuery.extend( battrs, {
					'class'	: this.classButton
				})).appendSpan().text(this._vof(this.labelButtonAdd)).end();
        
			this.buttonadd		= this._eventorfilter(true, true, 'beforeaddbutton', null, this.buttonadd, buttonsdiv, 'add', this.id);
			buttonsdiv.append(this.buttonadd);
			this._eventorfilter(false, false, 'afteraddbutton', null, this.buttonadd, 'add', this.id);
			buttons.push(this.buttonadd[0]);
		} else {
			//edit
			this.buttonedit = jQuery.domButton(jQuery.extend( battrs, {
					'class'	: this.classButton
				})).appendSpan().text(this._vof(this.labelButtonEdit)).end();
        
			this.buttonedit		= this._eventorfilter(true, true, 'beforeaddbutton', null, this.buttonedit, buttonsdiv, 'edit', this.id);
			buttonsdiv.append(this.buttonedit);
			this._eventorfilter(false, false, 'afteraddbutton', null, this.buttonedit, 'edit', this.id);
			buttons.push(this.buttonedit[0]);
        
			//delete
			this.buttondelete = jQuery.domButton(jQuery.extend( battrs, {
					'class'	: this.classButton
				})).appendSpan().text(this._vof(this.labelButtonDelete)).end();

			this.buttondelete	= this._eventorfilter(true, true, 'beforeaddbutton', null, this.buttondelete, buttonsdiv, 'delete', this.id);
			buttonsdiv.append(this.buttondelete);
			this._eventorfilter(false, false, 'afteraddbutton', null, this.buttondelete, 'delete', this.id);
			buttons.push(this.buttondelete[0]);
			this.buttondelete.click(function() {
				this.form.autoform.action = 'delete';
			});
		}

		this.body.append(buttonsdiv);
		
		this.loading.hide();
		this.caption.show();
		this.body.show();	

		if(this.jqueryUI) this._jqueryUI_aftercreate();
		this._eventorfilter(false, false, 'aftercreate', null);

		jQuery(buttons).click(function(evt) {
			this.form.autoform.waitLabel();
			jQuery(this.form).submit();
			return false;
		});
	}
	,'_modelfieldclone'	: function(field) {
		var clone = {
			'element'	:  null
		};
		var elem = null;

		for(elem in field) {
			clone[elem] = field[elem];
		}

		return clone;
	}
	,'_model'		: function() {
		var origmodel	= this.model;
		this.model	= [];

		for(var i=0;i<origmodel.length;i++) {
			this.model.push(this._modelfieldclone(origmodel[i]));
		}

		for(i=0;i<this.model.length;i++) {
			if(this.model[i].identity)  {				
				this.identity = this.model.splice(i, 1).shift();
				break;
			}
		}

		if(this.identity != null) {
			this.model.unshift(this.identity);
			this.identity = this.model[0];
		} else if(this.action != 'add') {
			throw(this._errprefix() + ": I cant do another action than add without identity field.");			
		}
		
		for(i=0;i<this.model.length;i++) {
			this.maps.elemsModel[this.model[i].name] = i;
		}
	}
	,'field'		: function(getter) {
		if(typeof(getter) ==  'number') 
			return this.model[getter];
		else if(typeof(getter) == "string")
			return this.model[this.maps.elemsModel[getter]];
	}
	,'fieldByLabel'		: function(label, unsensitive) {
		var c;
		for(var i=0;i<this.model.length;i++) {
			c = this.model[i].label;
			if(((unsensitive) ? c.toLowerCase() : c) == ((unsensitive) ? label.toLowerCase() : label))  {			
				return this.model[i];
				break;
			}
		}
	}
	,'_eventorfilter'	: function(/* needreturn, typefirst, method, context, arguments... */) {
		var args	= jQuery.makeArray(arguments);
		var nr		= args.shift();

		var objs	= [jQuery.autoform.settings, this];
		objs[((args.shift()) ? 'unshift' : 'push')](this.type);

		var method	= args.shift();
		var c		= args.shift();
		var r 		= ((nr) ? args[0] : null);
		var f		= false;

		for(var i=0;i<objs.length;i++) {
			if(r !== false && jQuery.isFunction(objs[i][method])) {
				f = true;
				r = objs[i][method].apply((c==null ? this : c), args);
				if(r === false) return r;
			}
		}

		if(f && nr && (r == null || r === false))
			throw(this._errprefix() + ": The event or filter \"" + method +"\" needs a return value.");

		return r;
	}
	,'_errprefix'		: function() {
		return "autoform \"" + this.name + "\"";
	}
	,'toggleWait'		: function(action, show) {
		this.waitLabel(((action === null) ? 'load' : action));

		var cfn	= ((show === true || (show === null && this.loading.is(":hidden"))) ? 'show' : 'hide');
		var bfn = ((cfn === 'show') ? 'hide' : 'show');
		var ev	= ((cfn === 'show') ? 'start' : 'stop');

		if(this.loading) 	this.loading[cfn]();
		if(this.body)		this.body[bfn]();
		if(this.caption)	this.caption[bfn]();
		
		this._eventorfilter(false, true, ev+'wait', this);
	}
	,'waitLabel'	: function(action) {
		var action = ((action) ? action : this.action);
		this.loading.text(this._vof(this['labelWait'+action.charAt(0).toUpperCase()+action.substring(1)])); 
	}

	,'_createlock'		: false
	,'labelButtonAdd' 	: 'Add Element'
	,'labelButtonDelete'	: 'Delete Element'
	,'labelButtonEdit'	: 'Edit Element'
	,'labelCaption'		: 'Element'

	,'labelWaitLoad'	: 'Loading... please wait.'
	,'created'		: false
	,'createAgainLock'	: true

	,'form'			: null
	,'loading'		: null
	,'parents'		: null
	,'caption'		: null
	,'body'			: null

	,'buttonadd'		: null
	,'buttonedit'		: null
	,'buttondelete'		: null

	,'classForm'		: 'autoform'
	,'classLoading'		: 'autoform-loading'
	,'classCaption'		: 'autoform-caption'
	,'classBody'		: 'autoform-body'
	,'classRow'		: 'autoform-row'
	,'classLabel'		: 'autoform-label'
	,'classElemDiv'		: 'autoform-elem-div'
	,'classButtonsDiv'	: 'autoform-buttons-div'
	,'classButton'		: 'autoform-button'
	,'jqueryUI'		: false

	,'method'		: 'GET'
	,'action'		: 'add'
	,'urls'			: []

	,'id'			: null
	,'identity'		: null
	,'identityFormName'	: '_id'

	,'data'			: null
	,'model'		: null
	,'elements'		: []

	,'maps'			: {
		'elemsModel'	: {}	
		,'actionUrl'	: {'add' : 0, 'edit' : 1, 'delete' : 2}

	}

	,'type'			: 'default'

	,'beforeaddelem'	: null // function(element, parent, id, fieldno)
	,'afteraddelem'		: null // function(element, id, fieldno)

	,'beforeaddlabel'	: null // function(element, parent, id, fieldno)
	,'afteraddlabel'	: null // function(element, id, fieldno)

	,'beforeaddbutton'	: null // function(element, parent, action, id)
	,'afteraddbutton'	: null // function(element, action, id)

	,'beforecreate'		: null // function()
	,'aftercreate'		: null // function()
	,'submit'		: null // function(event)
	
	,'dataFilter'		: null // function(value, id, fieldno)
	,'labelFilter'		: null // function(label, id, fieldno)	

	,'startwait'		: null // function()
	,'endwait'		: null // function()

	,'error'		: function(msg) { // user errors
		alert(msg);
	}
}

jQuery.autoform.init.prototype = jQuery.autoform.prototype;

jQuery.fn.autoform	= function(name, options) {
	return	this.append(jQuery.autoform(name, options, this));
}


jQuery.autoform.type = function(name, basedOn, options) {
	var based = false;
	if(!(based = (typeof(basedOn) == 'string')))
		options = basedOn;

	if(options) {
		if(typeof(jQuery.autoform.type[name]) == 'undefined') {
			jQuery.autoform.type[name] = new jQuery.autoform.type.init(name, (based ? jQuery.autoform.type[basedOn] : options), based);

			if(typeof(basedOn) == 'string') 
				jQuery.autoform.type.init.call( jQuery.autoform.type[name], name, options, true); 
		} else {
			jQuery.extend(jQuery.autoform.type[name], options);
		}
	}

	return jQuery.autoform.type[name];
}

jQuery.autoform.type.instances = {};

jQuery.autoform.type.init = function(name, options, noinit) {
	jQuery.extend(this, options);
	this.name = name;

	if(!noinit)	this._init();
};

jQuery.autoform.type.prototype = {
	'name'				: null
	,'bannedInherit'		: ''
	,'bannedInheritFilter'		: null
	,'bannedInheritSetup'		: ''
	,'bannedInheritSetupFilter'	: false
	,'_init'		: function()  {
	}
	,'autoform'		: function() {
		if(!(jQuery.isArray(this.urls) && this.urls.length == 3))
			return jQuery.error(this._errprefix() + ': Provide the urls for add, edit and delete.');
	}

	,'cancelRealSubmit'	: false
	,'urls'			: []

	,'submit'		: null
	,'beforeaddelem'	: null
	,'afteraddelem'		: null
	,'beforeaddlabel'	: null
	,'afteraddlabel'	: null
	,'beforeaddbutton'	: null
	,'afteraddbutton'	: null
	,'beforecreate'		: null
	,'aftercreate'		: null

	,'startwait'		: null
	,'endwait'		: null

	,'dataFilter'		: null
	,'labelFilter'		: null
};

jQuery.autoform.type.init.prototype = jQuery.autoform.type.prototype
jQuery.autoform.type('default', {});


/**
 * @require jquery.form.js
 */
if(typeof(jQuery.fn.ajaxSubmit) != 'undefined') {
	jQuery.autoform.type('ajax', {
		 '_init'		: function() {

		 }
		 , 'autoform'		: function(autoform) {
			if(!(jQuery.isArray(this.urls) && this.urls.length == ((this.fetchData) ? 4 :3 ))) 
				return jQuery.error(this._errprefix() + ': Provide the urls for add, edit, delete, and load if available.');

			this.maps.actionUrl['load'] = 3;
		}

		,'bannedInherit'		: 'canFetchData'
		,'bannedInheritFilter'		: function(name) {
			return ( name == 'ajaxSettings' || name.toLowerCase().indexOf('ajax') === -1);
		}
		,'bannedInheritSetupFilter'	: true
		,'loadData'		: function() {
			if(this.type.canFetchData(this)) {				
				this.type.ajax(this, 'load');
			}
		}

		,'dontSubmit'		: true
		,'fetchData'		: false
		,'fetchDataLock'	: false
		,'canFetchData'	: function(autoform) {
			return (!autoform.fetchDataLock && autoform.fetchData && autoform.action == 'edit')
		}

		,'labelWaitEdit'	: 'Editing... please wait.'
		,'labelWaitAdd'		: 'Adding... please wait.'
		,'labelWaitDelete'	: 'Deleting... please wait.'
		,'labelDelete'		: 'Deleted'

		,'beforecreate'		: function() {
			if(this.type.canFetchData(this)) {				
				this.data	= null;
				this.loadData();
			}
		}
		, 'aftercreate'		: function() {	
			if(this.action == 'edit') {
				if(this.fetchDataLock)	this.fetchDataLock = false;
			}
		}
		,'submit'		: function() {
			this.dontSubmit = true;
			this._eventorfilter(false, true, 'beforeAjax', null);

			this.form.ajaxSubmit(this.type.getAjaxSettings(this, this.action));
			this.toggleWait('load', true);
		}
		,'ajaxCallbackBase'	: function() {
			var args 	= jQuery.makeArray(arguments);
			var autoform	= args.shift();
			var action	= args.shift();
			var nr		= args.shift();
			var df		= args.shift();
			var name	= args.shift();
			var s		= function(s) {; return s.toUpperCase(); };
			
			return autoform._eventorfilter.apply(autoform, [nr,df, 'ajax'+action.replace(/^[a-z]/,s)+name.replace(/^[a-z]/,s), this].concat(args));
		}
		,'getAjaxSettings'		: function(autoform, action) {
			var self = this;
			return  jQuery.extend({}
				, autoform.ajaxSettings
				, {					
					'url'		: autoform.urls[autoform.maps.actionUrl[action]]
					,'autoform'	: autoform
					,'type'		: autoform.method	
					,'beforeSend'	: function() {
						this.autoform = autoform;
						self.ajaxCallbackBase.apply(this, [autoform, action, false, true, 'beforeSend'].concat(jQuery.makeArray(arguments)));
					}
					,'error'	: function() {
						var s	= function(s) {; return s.toUpperCase(); };
						var fn	= 'ajax'+action.replace(/^[a-z]/,s)+'Error';
						
						if(
							jQuery.isFunction(self[fn])
							|| jQuery.isFunction(autoform[fn])
							|| jQuery.isFunction(jQuery.autoform.settings[fn])
						) 
							self.ajaxCallbackBase.apply(this, [autoform, action, false, true, 'error', this].concat(jQuery.makeArray(arguments)));
						else
							autoform._eventorfilter.apply(autoform, [false, true, 'error', autoform, arguments[2]]);
					}
					,'dataFilter'	: jQuery.partial(this.ajaxCallbackBase, autoform, action, true, true, 'dataFilter')
					,'success'	: jQuery.partial(this.ajaxCallbackBase, autoform, action, false, true, 'success')
					,'complete'	: jQuery.partial(this.ajaxCallbackBase, autoform, action, true,  true, 'complete')	
				}
				, ((action == 'load') ? {  
						'data' : autoform.identityFormName + '=' + autoform.id 
					} : { 				
				})

			);

		}
			
		,'ajax'			: function(autoform, action) {
			autoform.toggleWait(action, true);
			autoform._eventorfilter(false, true, 'beforeAjax', null);
			return jQuery.ajax(this.getAjaxSettings(autoform, action));
		}

		,'ajaxSettings'		: {
			'cache'		: false
			,'dataType'	: 'json'
		}
		,'beforeAjax'		: function() {
		}
		,'ajaxLoadSuccess'	: function(data) {
			if(typeof(data) == 'string')
				this.autoform.error(data);
			else {
				this.autoform.data = data;
				this.autoform.toggleWait('load', false);
			}
		}
		,'ajaxAddSuccess'	: function(data) {
			if(typeof(data) == 'string')
				this.autoform.error(data);
			else {
				for(field in data) { 
					this.autoform.data[field] = data[field];
				}

				this.autoform.fetchDataLock = true;
				jQuery.autoform.processOptions(this.autoform, { 'action' : 'edit'});
				if(this.autoform.fetchDataLock) this.autoform.fetchDataLock = false;
			}			
		}
		,'ajaxEditSuccess'	: function(data) {
			if(typeof(data) == 'string')
				this.autoform.error(data);
			else {
				for(field in data) { 
					this.autoform.data[field] = data[field];
				}
        
				this.autoform.toggleWait('load', false);
				this.autoform.createAgain();
			}
		}
		,'ajaxDeleteSuccess'	: function(data) {
			if(typeof(data) == 'string')
				this.autoform.error(data);
			else {
				this.data = null;
				this.autoform.caption.text(this.autoform.labelDelete);
			}
		}
	});

	jQuery.autoform.type('ajaxedit', 'ajax', {
		'beforeaddbutton' : function(elem, parent, type) {
			if(type == 'edit') {
				elem[0].style.display = 'none';
			}
			
			return elem;
		}
		,'ajaxEditSuccess'	: function() {
			var args = jQuery.makeArray(arguments);	
			jQuery.autoform.type.ajax.ajaxEditSuccess.call(this, args);

			if(this.fetchDataLock) this.fetchDataLock = false;
			this.autoform.isEditing		= false;
		}
		, 'ajaxEditError'	: function() {
			var autoform	= this.autoform;
			var r 		= null;

			autoform.field(autoform.sourceEditField).element.focus();

			if(!(jQuery.isFunction(autoform.ajaxEditError) || jQuery.isFunction(jQuery.autoform.settings.ajaxEditError))) 
				r = autoform._eventorfilter.apply(autoform, [false, true, 'error', autoform, arguments[3]]);

			autoform.isEditing		= false;
			return r;
		}
		, 'beforeaddelem'	: function(elem) {
			elem.blur(function(){				
				var afui	= this.autoformUI;
				var autoform	= afui.autoform;
				autoform.sourceEditField	= afui.model.name;

				if(afui.oldvalue != afui.value() && !autoform.isEditing) {					
					autoform.isEditing = true;

					jQuery.ajax(jQuery.extend(
						autoform.type.getAjaxSettings(autoform, 'edit'), {
							'data' : autoform.identityFormName + '=' + autoform.identity.element.val()
								+ '&' + this.name + '=' + this.autoformUI.value()
						})
					);
				}
			});

			elem.keyup(function(event) {
				var afui	= this.autoformUI;
				var autoform	= afui.autoform;

				if(autoform.action == 'edit') {
					if(event.keyCode == 27)
						afui.restore();	
					else if(event.keyCode == 13) {
						event.stopImmediatePropagation();
						event.preventDefault();
						return false;
					}
				}
			});
			return elem;
		}
		, 'stopwait'		: function() {			
			if(this.sourceEditField) {
				var elem 	= this.sourceEditField;
				var autoform	= this;

				this.sourceEditField = null;

				var f = function() {
					if(autoform.field(elem).element && autoform.field(elem).element.is(":visible")) 
						autoform.field(elem).element.focus();
					else
						setTimeout(f, 100);
				}

				setTimeout(f, 100);
			}
		}
		, 'currentElement'	: null
		, 'isEditing'		: false
		, 'sourceEditField'	: null
	});
} ;

jQuery.autoform.settings	= {};

jQuery.autoformSetup		=  function(options) {
	jQuery.extend(jQuery.autoform.settings, options);
	return this;
}

jQuery.autoform.UI	= function(ui, create, attrs) {
	jQuery.autoform.UI[ui] = function() {
		var elem = create.apply(jQuery.autoform.UI[ui], arguments);
		if(typeof(attrs.cssClass) != 'undefined')  
			elem.addClass(attrs.cssClass);
		
		if(typeof(jQuery.ui) != 'undefined' && typeof(attrs.jquiClass) != 'undefined')
			elem.addClass(attrs.jquiClass);
			
		return elem;
	};

	jQuery.extend(jQuery.autoform.UI[ui], jQuery.autoform.UI._base, attrs);
	return jQuery.autoform.UI[ui];
};

jQuery.autoform.UI._base = {
	'value'		: function()  {
		var args	= jQuery.makeArray(arguments);
		var elem	= args.shift();
	
		return elem.val.apply(elem, args);
	}
	,'setName'	: function(elem, name)  {
		return elem[0].name = name;
	}
	,'toggle'	: function(elem, onoff) {
		return elem[0].disabled = !((onoff == null) ? elem[0].disable : onoff);
	}
	,'cssClass'	: ''
}; 


// create function(autoform, parent, id, fieldno)
/**
   @param {jQuery.autoform} autoform The current autoform
 */
jQuery.autoform.UI('selectbox', function(autoform, parent, id, fieldno) {
			var select = jQuery.domSelect();			
			var data = autoform.field(fieldno).options.data;

			for(var i=0;i<data.length;i++) {
				select.appendOption({'value' : data[i][0]}).text(data[i][1]); 
			}
			
			return select;
		}, {
			'cssClass'		: 'autoform-selectbox'
			,'jquiClass'	: 'ui-corner-all ui-widget-content'
			,'value'		: function(elem, value) {
				elem.find('option[value="'+value+'"]').selected();
			}
		}		
);

jQuery.autoform.UI('textbox', function() {
			return jQuery.domInput({
				'type' 		: 'text'
			});
		}, {
			'cssClass'		: 'autoform-textbox'
			,'jquiClass'	: 'ui-corner-all ui-widget-content'
		}
);

jQuery.autoform.UI('checkbox', function() {
			return jQuery.domInput({
				'type' 		: 'checkbox'
			});
		}, {
			'value'		: function(elem, val) {
				var self = this;
				if(typeof(val) != 'undefined') setTimeout(function() { // Q: why setTimeout()? A: Becaues IE SUCKS!
					elem[0].checked = !((!val) || val == self.falseIs)
				}, 10)
				return ((elem[0].checked) ? this.trueIs : this.falseIs)
			}
			,'cssClass'		: 'autoform-checkbox'
			,'jquiClass'	: 'ui-corner-all ui-widget-content'
			,'trueIs'		: '1'
			,'falseIs'		: '0'
		}
);

jQuery.autoform.UI('file', function(autoform, parent, id, fieldno) {
			return jQuery.domDiv()
							.rawCss('position: relative; overflow: hidden; display: inline-block')
							.append(
								jQuery.domButton({'type' : 'button'})
									.addClass(autoform.classButton)
									.rawCss('padding: 5px 10px')
									.text('Browse')
							)
							.append(
								jQuery.domInput({'type' : 'file', 'readonly' : 'readonly'})
									.rawCss('position: absolute; right: 0px; opacity: 0; cursor: pointer !important')
							)							
						;

		}, {
			'value'		: new Function()
			,'setName'	: function(elem, name) {
				elem[0].getElementsByTagName('input')[0].name = name;
			} 
			,'cssClass'		: ''
			,'jquiClass'	: ''
		}
);

jQuery.autoform.UI('image', function(autoform, parent, id, fieldno) {
			var loading, img, imgelem;
			var elem	= jQuery.autoform.UI.file(autoform, parent, id, fieldno);
			
			return ((this.noDisplayOnAdd && autoform.action == 'add') ? elem : elem.prepend( imgelem = jQuery.domDiv({'class' : 'autoform-image-preview'})
								.rawCss('margin: 5px; position: relative')
								.append(
									  loading = jQuery.domDiv({'class' : autoform.cssLoading })
										.text(autoform.labelWaitLoad)										
									, jQuery.domA({'href' : '#', 'target' : '_blank'}).append(
											img = jQuery.domImg({'src' : this.imageURL(autoform, id), 'title' : 'Click to full size'})
											.rawCss('display: none;')
											.load(function(e){
												setTimeout(function() { 
													img.fadeIn()
												}, 1);
												
												loading
													.rawCss('position: absolute;')
													.fadeOut()											
											})
									).click(function() {
										this.href  = this.getElementsByTagName('img')[0].src;
									})
			)));
		}, {
			'value'		: function(elem, value) {
				this.imageURL(elem.autoformUI.autoform, elem.autoformUI.id);			
			}
			,'imageURL'		: function(autoform, id) {
				var rand = '' + (Math.random() * new Date().getTime() - ((((new Date().getTime()) / 1000) * 1000))/1000)
				return this.imagePattern.replace(/\%\{(.*?)\}/g, function() {
						return ((arguments[1] == 'id') ? id : autoform.data[arguments[1]]);
				}) + ((this.imagePattern.indexOf('?') === -1) ? '?' : '&') + 'nocache=' + rand;
			}
			,'setName'	: function(elem, name) {
				elem[0].getElementsByTagName('input')[0].name = name;
			} 
			,'imagePattern' : '/web4/files/images/%{id}?crop=true&aa=%{t15-f3}'
			,'noDisplayOnAdd' : true 
			,'cssClass'		: ''
			,'jquiClass'	: ''
		}
);

jQuery.autoform.UI('hidden', function() {
			return jQuery.domInput({
				'type' 		: 'hidden'
			});
		}, {
			'cssClass'	: 'autoform-hidden'
			,'jquiClass'	: 'ui-corner-all ui-widget-content'
		}
);

jQuery.autoform.UI('textarea', function() {
			return jQuery.domTextarea({})
		}, {
			'value'	: function(elem, value) {
				return elem.text(value)
			}
			,'cssClass'	: 'autoform-textarea'
			,'jquiClass'	: 'ui-corner-all ui-widget-content'
		}
);
})(jQuery);
