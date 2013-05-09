;!function( lib, Name, PACKAGE ) {
//	"use strict"; // removed because debugging in safari web inspector is impossible in strict mode!!!



/*~  src/lib.js  ~*/


	 function addDOMListener( el, event, listener ) {
	 	var existing, el = api.$( el );

	 	if ( el.length ) {
			existing = el.attr( 'data-' + event );
			if ( existing )
				listener += '|' + existing;

			el.attr( 'data-' + event, listener );
	 	}

	 	return __lib__;
	}

	function cached( cmp ) { return priv8[cmp.id] || ( priv8[cmp.id] = util.obj() ); }

	function closest( el ) {
		id = el.getAttribute( 'data-cmp-id' ) || el.id;

		if ( id && ( cmp = Mgr.get( id ) ) )
			return cmp;

		var cmp, id, pel = el;

		do {
			if ( !pel.id )
				continue;
			else if ( cmp = Mgr.get( pel.id ) ) {
				el.setAttribute( 'data-cmp-id', pel.id );
				return cmp;
			}
		} while ( pel = pel.parentElement );

		return null;
	}

	function create( what, how ) {
		if ( is_obj( what ) ) {
			how  = what;
			what = how.widgie || how.type;
		}

		if ( typeof what != 'string' )
			what = 'widgie.Component';

		var Widgie = getClass( what ) || __lib__.Component;

		return Widgie.create( how );
	}

	function define( what, how ) {
		if ( is_obj( what ) || typeof what == 'function' ) {
			how  = what;
			if ( typeof how == 'function' )
				how = how();
		}

		if ( typeof what != 'string' ) {
			what = how.namespace || capitalize( how.type );
			delete how.namespace;
		}

		return register( what, lib.define( what, how ) );
	}

	function getClass( Class ) {
		var Widgie = lib.get( Class ) || widgies[Class];        // trying to find a Widgie

		if ( !Widgie ) {
			Class  = Class.toLowerCase();
			Widgie = lib.get( 'w.' + Class ) || widgies[Class]; // trying a little harder

			if ( !Widgie ) {
				Class  = Class.replace( /\./g, '-' );
				Widgie = lib.get( Class ) || widgies[Class];    // trying even harder!!!
			}
		}

		return Widgie || null;
	}

	function handleBubble( evt ) {
		switch ( evt.type ) {
			case 'blur'  :
			case 'focus' :
				if ( evt.target === doc.activeElement
				 && evt.target.getAttribute( 'tabindex' )
				 && evt.target !== evt.currentTarget )
					return;
		}
		takeAction( evt.currentTarget, evt );
	}

	function handleCapture( evt ) {
		Array.coerce( doc.querySelectorAll( '[data-' + evt.type + ']' ) ).forEach( function( el ) {
			takeAction( el, evt );
		} );
	}

// todo: make all these static methods #lookup on their respective classes
	function lookupModel( model ) {
		switch ( typeof model ) {
			case 'string'   : return getClass( model ); break;
			case 'function' : return model.prototype instanceof getClass( 'data.Model' ) ? model : null;
		}

		return null;
	}
	function lookupProxy( proxy, ProxyClass ) { // noinspection FallthroughInSwitchStatementJS
		switch ( util.ntype( proxy ) ) {
			case 'object'   : proxy = proxy instanceof getClass( 'proxy.Ajax' )
									 ? proxy
									 : create( ( ProxyClass || 'proxy.Ajax' ), proxy );
									   break;
			case 'string'   : proxy = getClass( proxy ); // allow fall-through
			case 'function' : proxy = new proxy; break;
			default         : proxy = null;
		}

		return proxy || null;
	}

	function lookupSchema( schema, SchemaClass ) { // noinspection FallthroughInSwitchStatementJS
		switch ( util.ntype( schema ) ) {
			case 'array'    : schema = { properties : schema }; // allow fall-through
			case 'object'   : schema = schema instanceof getClass( 'data.Schema' )
									 ? schema
									 : create( SchemaClass || 'data.Schema', schema );
									   break;
			case 'string'   : schema = getClass( schema );      // allow fall-through
			case 'function' : schema = new schema; break;
			default         : schema = null;
		}

		return schema || null
	}
	function lookupStore( store ) {
		switch ( typeof store ) {
			case 'string'   : return getClass( store ); break;
			case 'function' : return store instanceof getClass( 'data.Store' ) ? store : null;
		}

		return null;
	}

	function register( what, Widgie ) {
		var i = what.indexOf( 'widgie' ),
			internal;

		if ( i === 0 || i === 1 )
			internal = what.split( '.' ).slice( 1 ).join( '.' );

		if ( typeof internal == 'string' )
			widgies[internal.toLowerCase().split( '.' ).join( '-' )] = widgies[internal] = Widgie;

		return Widgie;
	}
	function removeDOMListener( el, event, listener ) {
	 	var i, listeners, el = api.$( el );

	 	if ( el.length ) {
			listeners = el.attr( 'data-' + event ).split( '|' );

			if ( listeners.length ) {
				if ( !!~( i = listeners.indexOf( listener ) ) )
					listeners.splice( i, 1 );

				el.attr( 'data-' + event, listeners.join( '|' ) );
			}
	 	}

	 	return __lib__;
	}

	function takeAction( el, evt ) {
		if ( el === doc || el === global )
			el = doc.body;

		var actions = el.getAttribute( 'data-' + evt.type );

		if ( typeof actions != 'string' ) return;

		actions.split( '|' ).forEach( function( action ) {
			var cmp; action = action.split( '::' );

			switch ( action.length ) {
				case 1 : action = action.shift(); break;
				case 2 : cmp    = Mgr.get( action.shift() );
						 action = action.shift();
						 !lib.is( cmp, Name + '.Component' ) || cmp.onAction( action, evt );
						 return;
			}

			!( cmp = closest( el ) ) || cmp.onAction( action, evt );
		} );
	}

	function uncache( cmp ) { return delete priv8[cmp.id]; }



/*~  src/vars.js  ~*/

	var	UNDEF, Mgr,                Name_lc  = Name.toLowerCase(), QueryString,// Viewport,
		util    = lib.util,        __lib__  = util.obj(),
		api     = util.obj(),      global   = util.global,
		doc     = global.document, priv8    = util.obj(), ua,
		w_count = 999,             widgies  = util.obj();



/*~  src/util.js  ~*/

	function capitalize( str ) {
		str = String( str );
		return str.charAt( 0 ).toUpperCase() + str.substring( 1 );
	}

	function is_date( item ) { return util.ntype( item ) == 'date'; }
	function is_dom( item )  { return util.type( item )  == 'htmlelement'; }
	function is_el( item )   { return util.ntype( item ) == 'element[]'; }
	function is_evt( item )  { return util.ntype( item ) == 'event'; }
	function is_obj( item )  { return util.ntype( item ) == 'object'; }
	function is_num( item )  { return typeof item == 'number' && !isNaN( item ); }
	function is_true( v )    { return v === true; }

	function namespace( ClassName ) { return '^' + Name + '.' + ClassName; }

	function to_obj( val, prop ) {
		val[prop] = true;
		return val;
	}



/*~  src/api.js  ~*/

	api.$     = dinero;

	api.date  = {
		coerce : function( date_str, format ) {
			return Date.coerce( date_str, format );
		},
		format : function( date, format ) {
			return date.format( format );
		}
	};

	api.tpl   = {
		create  : function( tpl ) {
			return tpl instanceof Templ8 ? tpl : Templ8.get( tpl ) || new Templ8( tpl );
		},
		get     : function( id ) {
			return api.tpl.create( id );
		},
		parse   : function( tpl, dict ) {
			return tpl.parse( dict );
		}
	};

	api.ua    = ua = dinero.ua;

	api.xhr   = function() {
		var POSTISH = /DELETE|POST|PUT/i,
			headers = {
				'Accept'           : '*/*;q=0.5,application/json,application/javascript,text/javascript,application/ecmascript,application/x-ecmascript',
				'Content-Type'     : 'application/json;charset=UTF-8',
				'X-Requested-With' : 'XMLHttpRequest'
			},
			re_json = /\/(json|javascript)$/i;

		return function xhr( config ) {
			var data, hd, method, req = new XMLHttpRequest();

			req._config    = config;
			data           = config.data;
			config.headers = hd = util.copy( config.headers || util.obj(), headers, true );
			method         = config.method;
			method         = method ? method.toUpperCase() : 'GET';

			req.addEventListener( 'error', req._onerror = onerror.bind( req ), true );
			req.addEventListener( 'load',  req._onload  = onload.bind( req ), true );

			req.open( method, config.url, true );

			if ( POSTISH.test( method ) && hd['Content-Type'] === headers['Content-Type'] && config.sendJSON !== true )
				hd['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

			!req.overrideMimeType || req.overrideMimeType( hd['Content-Type'] );

			Object.reduce( config.headers, setHeader, req );

//			req.responseType = 'json';

			// noinspection FallthroughInSwitchStatementJS
			switch ( util.ntype( data ) ) {
				case 'string'   :
				case 'formdata' :                                                  break;
				case 'array'    :
				case 'object'   : data = config.sendJSON === true
									   ? JSON.stringify( data )
									   : __lib__.qs.encode( data ).substring( 1 ); break;
				default         : data = null;
			}

			req.send( data );

			return req;
		};

		function cleanup( req ) {
			req.removeEventListener( 'error', req._onerror, true );
			req.removeEventListener( 'load',  req._onload, true );

			delete req._onerror; delete req._onload; delete req._config;

			return req;
		}

		function data( req ) {
			var ctype = ( ( req.getResponseHeader( 'Content-Type' ) || '' ).split( '/' )[1] || '' ).split( ';' )[0],
				text  = req.responseText.trim().replace( /^[\n\r\s\t]+/m, '' );

			switch ( req.responseType || ctype ) {
				case 'json'        :
				case 'javascript'  : return is_obj( req.response ) ? req.response : text.indexOf( '<' ) !== 0 ? JSON.parse( text ) : null;
				case 'arraybuffer' :
				case 'blob'        :
				case 'document'    : return req.response;
				case 'html'        :
				case 'xml'         : return typeof req.response == 'string' ? req.responseXML : req.response;
				case 'text'        :
				case ''            : return req.responseText;
			}

			return tryAndParse( req );
		}

		function onabort( evt ) {
			var config = this._config;

			typeof config.abort != 'function' || config.abort( cleanup( this ), config );
		}

		function onerror( evt ) {
			var req    = this,
				config = req._config;

			typeof config.error != 'function' || config.error( data( req ), req.status, cleanup( req ), config );
		}

		function onload( evt ) {
			var req    = this,
				config = req._config;

			typeof config.success != 'function' || config.success( data( req ), req.status, cleanup( req ), config );
		}

		function setHeader( req, val, key ) {
			req.setRequestHeader( key, val );
			return req;
		}

		function tryAndParse( req ) {
			try {
				return JSON.parse( req.responseText );
			}
			catch( e ) {
				return req.responseXML || req.responseText;
			}
		}
	}();



/*~  src/tpl.js  ~*/

!function() {
var config = {
	"compiled"  : true,
	"execute"   : function( cmp, method ) {
		return typeof cmp[method] == 'function'
			 ? cmp[method].apply( cmp, Array.coerce( arguments, 2 ) )
			 : '';
	},
	"prepare"   : function( cmp ) {
		return cmp.prepare( cmp.data ? cmp.data : null );
	},
	"sort"      : function( items, field ) { //schwartzian transform
		return items.values.map( function( item ) {
			return [item[field], item];
		} ).sort( function( a, b ) {
			return a[0] == b[0] ? 0 : a[0] < b[0] ? 1 : -1;
		} ).map( function( item ) {
			return item[1];
		} );
	},
	"toJSON"    : function( items ) {
		return items.valueOf();
	}
};
new Templ8( m8.copy( { id : 'widgie.box', sourceURL : 'tpl/box.html'  }, config ), '<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }}\"{% if this.focusable !== false %} tabindex=\"-1\"{% endif %}>',
'	<div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\"></div>',
'</{{ @.tagName }}>' );
new Templ8( m8.copy( { id : 'widgie.component', sourceURL : 'tpl/component.html'  }, config ), '<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }}\"{% if this.focusable !== false %} tabindex=\"-1\"{% endif %}><div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\">',
'	{{ @.html if @.html|type:\"string\" }}',
'	{% if @.tplContent|exists AND @.data|exists %}{{ @|prepare:@.data|parse:@.tplContent }}{% endif %}',
'</div></{{ @.tagName }}>' );
new Templ8( m8.copy( { id : 'widgie.field', sourceURL : 'tpl/field.html'  }, config ), '{% sub label %}',
'<label class=\"{{ clsBase }}-label\" data-ref=\"label\" for=\"{{ id }}-input\">{{ label }}</label>',
'{% endsub %}',
'{% sub placeholder %}',
'placeholder=\"{% if placeholder === \':label\' %}{{ label }}{% else %}{{ placeholder }}{% endif %}\"',
'{% endsub %}',
'<{{ @.tagName }} class=\"{{ @.clsBase }} {{ @.clsDefault if @.clsDefault|exists }} {{ @.cls if @.cls|exists }} {{ @.clsBase }}-{{ @.inputType }}\"{% if @.errorMsg %} data-error-msg=\"{{ @.errorMsg }}\"{% endif %} tabindex=\"-1\"><div class=\"{{ @.clsBase }}-ct\" data-ref=\"ct\"{% if @.toolTip %} data-tool-tip=\"{{ @.toolTip }}\"{% endif %}>',
'	{% if @.showLabel AND @.labelPosition !== \'after\' %}{{ @|parse:\"label\" }}{% endif %}',
'	<span class=\"{{ @.clsBase }}-input-ct {{ @.clsBase }}-input-{{ @.inputType }}-ct\">{% if @.inputType === \'text\' AND @.multiLine === true %}',
'		<textarea autocapitalize=\"off\" autocorrect=\"off\" class=\"{{ @.clsBase }}-input {{ @.clsBase }}-input-multiline {{ @.clsBase }}-input-{{ @.inputType }}\" data-ref=\"field\" id=\"{{ @.id }}-input\" name=\"{{ @.name }}\" {{ @|parse:\"placeholder\" if @.placeholder|type:\"string\" }}></textarea>',
'	{% else %}',
'		<input autocapitalize=\"off\" autocorrect=\"off\" class=\"{{ @.clsBase }}-input {{ @.clsBase }}-input-{{ @.inputType }}\" data-ref=\"field\" id=\"{{ @.id }}-input\" name=\"{{ @.name }}\" {{ @|parse:\"placeholder\" if @.placeholder|type:\"string\" }} type=\"{{ @._inputType }}\" value=\"{{ @.value if @.value|exists }}\" />',
'	{% endif %}</span>',
'	{% if @.showLabel AND @.labelPosition === \'after\' %}{{ @|parse:\"label\" }}{% endif %}',
'</div></{{ @.tagName }}>' );
}();


/*~  src/expose.js  ~*/

	util.iter( PACKAGE ) || ( PACKAGE = util.ENV == 'commonjs' ? module : global );

	util.defs( __lib__ = util.expose( __lib__, Name, PACKAGE ), {
		api               : { value : api },
		gestureEnabled    : ua.touch,
		ua                : { value : ua  },
		addDOMListener    : addDOMListener,
		closest           : closest,
		create            : create,
		define            : define,
		error             : error,
		doc               : doc,
		getClass          : getClass,
		global            : global,
		lib               : lib,
		removeDOMListener : removeDOMListener,
		takeAction        : takeAction,
		util              : util
	}, 'r' );

	util.expose( lib,  __lib__ ); // store a reference to id8 on widgie
	util.expose( util, __lib__ ); // store a reference to m8 on widgie



/*~  src/util/qs.js  ~*/

	QueryString = lib.Class( {
		constructor : function() {
			this._decode_ = this._decode.bind( this );
			this._encode_ = this._encode.bind( this );
		},
		extend      : Object,
//		module      : __lib__,
//		singleton   : true,

		decode      : function( qs ) {
			qs = qs.indexOf( '?' ) === 0 ? qs.substring( 1 ) : qs;
			var qso = util.obj();
			return qs.length ? qs.split( '&' ).reduce( this._decode_, qso ) : qso;
		},
		encode      : function( qs ) {
			return '?' + Object.reduce( qs, this._encode_, '' ).substring( 1 );
		},
		_decode     : function( qs, item ) {
			item = item.split( '=' );

			var key = decodeURI( item.shift() ), val = decodeURI( item.shift() );

			if ( key in qs ) {
				if ( !Array.isArray( qs[key] ) )
					qs[key] = [qs[key]];
				qs[key].push( val );
			}
			else qs[key] = val;

			return qs;
		},
		_encode     : function( qs, val, key ) {
			key = '&' + encodeURI( key ) + '='; // noinspection FallthroughInSwitchStatementJS
			switch ( util.ntype( val ) ) {
				case 'array'   : qs += key + val.map( encodeURI ).join( key ); break;
				case 'date'    : val = +val;                                // allow fall-through
				case 'boolean' : case 'number' : case 'string' : qs += key + encodeURI( val );
			}
			return qs;
		}
	} );

// goddamn chrome v26 is intermittently doing some weird shizzle, so need to remove singletons for now
	util.def( __lib__, 'qs', { value : new QueryString }, 'cw' );



/*~  src/util/Gesture.js  ~*/

	lib.define( namespace( 'Gesture' ), function() {

		global.addEventListener( 'beforeunload', function() {
			global.removeEventListener( 'scroll', cancel_cb, true );
			global.removeEventListener( ua.mspoint ? 'MSPointerUp'   : 'touchend',   touchend,    true );
			global.removeEventListener( ua.mspoint ? 'MSPointerMove' : 'touchmove',  touchmove,   true );
			global.removeEventListener( ua.mspoint ? 'MSPointerDown' : 'touchstart', touchstart,  true );
		}, true );

		var attr        = 'data-gesture-hotspot',
			cache       = util.obj(),
			cancel_cb   = touchcancel.callback( {
				buffer  : 100,
				delay   : 100
			} ),
			current     = null,
			doc         = global.document,
			point       = {
				x       : {
					backward : 'left',  diff : 'diffX', dir   : 'directionX',
					forward  : 'right', id   : 'x',
					last     : 'lastX', page : 'pageX', start : 'startX'
				},
				y       : {
					backward : 'up',    diff : 'diffY', dir   : 'directionY',
					forward  : 'down',  id   : 'y',
					last     : 'lastY', page : 'pageY', start : 'startY'
				}
			},
			props_reset = 'initialRotation initialScale pressure rotation scale touches'.split( ' ' ),
			radian      = 180 / Math.PI,
			slc         = '[' + attr + '="true"]';

		global.addEventListener( 'scroll',     cancel_cb,   true );
		global.addEventListener( ua.mspoint ? 'MSPointerUp'   : 'touchend',   touchend,    true );
		global.addEventListener( ua.mspoint ? 'MSPointerMove' : 'touchmove',  touchmove,   true );
		global.addEventListener( ua.mspoint ? 'MSPointerDown' : 'touchstart', touchstart,  true );

		Touch.prototype = {
			constructor : Touch,
			angle       : -1,
			diffX       : null, diffY       : null,
			directionX  : null, directionY  : null,
			gesture     : null,
			lastX       : null, lastY       : null,
			startX      : null, startY      : null,
			tolerance   : null,
			type        : null,
			x           : null, y           : null,

			end         : function() {
				var x     = Math.abs( is_num( this.x ) ? ( this.startX - this.x ) : this.lastX - this.startX ),
					y     = Math.abs( is_num( this.y ) ? ( this.startY - this.y ) : this.lastY - this.startY ),
					angle = Math.round( Math.atan2( y, x ) * radian ),
					type  = '';

				if ( between( angle, 0, this.tolerance ) )
					type += this.directionX || '';
				else if ( between( angle, 60, 60 + this.tolerance ) )
					type += this.directionY || '';
				else
					type += ( this.directionX || '' ) + ( this.directionY || '' );

				this.angle   = angle;
				this.type    = type;
			},
			process     : function( touch ) {
				this.setCoord( 'x', touch );
				this.setCoord( 'y', touch );
			},
			setCoord    : function( id, touch ) {
				var coord = point[id], delta, diff = coord.diff, dir = coord.dir, last = coord.last, start = coord.start;

				if ( is_num( this[id] ) ) {
					this[last] = this[id];
					this[id]   = touch[coord.page];
					delta      = this[diff] = this[id] - this[last];

					if ( delta < 0 )
						this[dir] = coord.backward;
					else if ( delta > 0 )
						this[dir] = coord.forward;
					else
						this[dir] = null;
				}
				else
					this[id] = this[start] = touch[coord.page];
			}
		};

		return {
			constructor      : function Gesture( config ) {
				this.increasePressure_ = this.increasePressure.bind( this );
				this.mixin( 'observer', is_obj( config ) ? config.observers : [] ).parent( arguments );
			},
			extend           : lib.Source,
			mixins           : {
				observer : 'Observer'
			},
			module           : __lib__,
// public properties
			active           : false,
			destroyed        : false,
			disabled         : false,
			exclusions       : null,
			initialRotation  : null,
			initialScale     : null,
			interactive      : {
				get          : function() { return !this.destroyed && !this.disabled; },
				set          : function() { return this.interactive; }
			},
			longtapDelay     : 700,
			rotation         : null,
			precision        : .17,
			pressInterval    : 100,
			pressure         : null,
			scale            : null,
			tapDelay         : 200,
			tolerance        : 15,
			touches          : null,
// internal properties
			id_dbltap        : null,
			id_lngtap        : null,
			is_dbltap        : false,
			is_lngtap        : false,
			ts_tap           : null,
// public methods
			cancel           : function() {
				if ( !this.active ) return;

				this.active = false;

				this.reset().broadcast( 'cancel' );
			},
			end              : function( evt ) {
				if ( !this.interactive || !this.active || this.broadcast( 'before:end', evt ) === false ) return;

				this.process( evt );

				this.active  = false;

				if ( this.ts_tap )
					this.id_dbltap = setTimeout( this.onEnd.bind( this, evt ), this.tapDelay );
				else
					this.onEnd( evt );
			},
			enable           : function() {
				if ( !this.disabled || this.broadcast( 'before:enable' ) === false ) return;

				this.disabled = false;

				this.broadcast( 'enable' );
			},
			disable          : function() {
				if ( this.disabled || this.broadcast( 'before:disable' ) === false ) return;

				this.disabled = true;

				this.broadcast( 'disable' );
			},
			increasePressure : function() {
				this.pressure += 1;

				if ( this.ts_tap && Date.now() - this.ts_tap >= this.longtapDelay )
					this.is_lngtap = true;
			},
			move             : function( evt ) {
				if ( !this.active || !this.interactive ) return;

				this.process( evt );

				var tolerance = this.tolerance * 2;

				this.diffX < tolerance && this.diffY < tolerance || this.broadcast( 'move', evt );
			},
			reset            : function() {
				this.cleanup();

				if ( this.active || !this.interactive ) return;

				util.remove( this, props_reset );

				this.broadcast( 'reset' );
			},
			start            : function( evt ) {
				if ( !this.interactive || this.active || this.broadcast( 'before:start', evt ) === false ) return;

				if ( this.id_dbltap && between( Date.now() - this.ts_tap, 0, this.tapDelay ) )
					this.cleanup().is_dbltap = this.active = true;
				if ( this.is_dbltap === true || this.is_lngtap === true )
					return;

				this.reset();

				this.active          = true;

				this.initialRotation = evt.rotation;
				this.initialScale    = evt.scale;

				this.pressure        = 0;
				this.touches         = [];

				this.id_lngtap       = setInterval( this.increasePressure_, this.pressInterval );
				this.ts_tap          = Date.now();

				this.process( evt ).broadcast( 'start', evt );

	//			evt.target.tagName.toUpperCase() !== 'IMG' || evt.preventDefault();
			},
			valid            : function( el ) {
				return this.exclusions === null || !api.$( el ).closest( this.exclusions ).length;
			},
// internal methods
			cancelPress      : function() {
				global.clearInterval( this.id_lngtap );
				delete this.id_lngtap;
			},
			cancelTap        : function() {
				global.clearTimeout( this.id_dbltap );
				delete this.id_dbltap;
			},
			cleanup          : function() {
				util.remove( this.cancelPress().cancelTap(), 'is_dbltap', 'is_lngtap', 'ts_tap' );
			},
			init             : function() {
				this.parent( arguments );

				if ( typeof this.el == 'string' )
					this.el = doc.querySelector( this.el ) || doc.getElementById( this.el ) || null;

				if ( is_dom( this.el ) ) {
					cache[util.id( this.el )] = this;
					this.el.setAttribute( attr, "true" );
				}

				if ( Array.isArray( this.exlusions ) )
					this.exclusions = this.exclusions.join( ', ' );

				this.observe( {
					 move        : this.cleanup,
					 ctx         : this
				} );
			},
			onDestroy        : function() {
				delete cache[util.id( this.el )];
				this.parent( arguments );
			},
			onEnd            : function( evt ) {
				!Array.isArray( this.touches ) || this.touches.invoke( 'end' );

				var type = this.resolve( evt );

				this.cleanup().broadcast( type, evt ).broadcast( 'end', evt );
			},
			process          : function( evt ) {
				var touches = Array.coerce( evt.touches, 0, 2 );

				this.rotation = evt.rotation;
				this.scale    = evt.scale;

				if ( !touches.length ) return;

				if ( this.touches.length <= touches.length )
					touches.forEach( this.processTouch, this );
			},
			processTouch     : function( touch, i ) {
				if ( !this.touches[i] )
					this.touches[i] = new Touch( this );

				this.touches[i].process( touch );
			},
			resolve          : function( evt ) {
				var touches = this.touches; // noinspection FallthroughInSwitchStatementJS

				switch( touches.length ) {
					case 2  :
						if ( between( this.rotation, -300, -60 ) || between( this.rotation, 60, 300 ) )
							return 'rotate';
						if ( Math.abs( Math.abs( this.initialScale ) - Math.abs( this.scale ) ) > this.precision )
							return this.initialScale > this.scale ? 'pinch' : 'zoom';
						// allow fall-through [conditional]
					default :
						if ( this.is_dbltap === true )
							return 'doubletap';
						if ( this.is_lngtap === true )
							return 'longtap';
						if ( !touches[0].type && Date.now() - this.ts_tap >= this.tapDelay )
							return 'tap';

						return 'swipe' + touches[0].type;
				}
			}
		};

		function Touch( gesture ) {
			this.gesture   = gesture;
			this.tolerance = gesture.tolerance;
		}

		function between( a, b, c ) { return a >=b && a <= c; }

		function touchcancel() {
			!current || current.cancel();
		}

		function touchend( evt ) {
			if ( current )
				current.end( evt );
			else {
				var el = api.$( evt.target ).closest( slc )[0],
					gesture;

				if ( !el ) return;

				gesture = cache[util.id( el )];

				if ( !gesture || !gesture.interactive || !gesture.valid( evt.target ) ) return;

				gesture.end( evt );
			}

			current = null;
		}

		function touchmove( evt ) {
			!current || current.move( evt );
		}

		function touchstart( evt ) {
			var el = api.$( evt.target ).closest( slc )[0],
				gesture;

			if ( !el ) return;

			gesture = cache[util.id( el )];

			if ( !gesture || !gesture.interactive || !gesture.valid( evt.target ) ) return;

			!current || current.cancel();
			current = gesture.start( evt );
		}

	}() );



/*~  src/util/TypedHash.js  ~*/

	lib.define( namespace( 'TypedHash' ), function() {
		return {
			constructor : function TypedHash( config ) {
				var data;
				if ( !is_obj( config ) )
					config = {};

				if ( util.got( config, 'Type', 'data', 'propId' ) ) {
					this.Type   = typeof config.Type == 'function' ? config.Type : lib.get( config.Type ) || Object;
					this.propId = config.propId || 'id';
					data        = config.data;
				}
				else if ( !util.empty( config ) )
					data = config;

				this.parent( data );
			},
			extend      : 'Hash',
			module      : __lib__,
	// public properties
			propId      : 'id',
			Type        : null,
	// public methods
			add         : function( data ) {
				var item = data instanceof this.Type ? data : this.Type.create.apply( this.Type, arguments );
				this.set( item[this.propId] || util.id( item ), item );
				return item;
			},
			get         : function( id ) {
				if ( !util.exists( id ) )
					return null;
				if ( typeof id != 'string' )
					id = id[this.propId];
				return this.parent( id );
			},
			has         : function( id ) {
				if ( typeof id != 'string' )
					id = id[this.propId];
				return this.parent( id );
			},
			include     : function( data ) {
				return this.has( data ) ? false : this.add( data );
			},
			set         : function( o, v ) {
				if ( is_obj( o ) && o.constructor === Object )
					this.parent( o );
				else if ( v instanceof this.Type )
					this.parent( o, v );
			}
		};
	}() );



/*~  src/util/Validate.js  ~*/

	util.def( __lib__, 'Validate', { value : {
		checkbox : {
			minmax : function( field, value ) {
				return true;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return !field.elField || field.elField.checked === true;
			}
		},
		date     : {
			minmax : function( field, value ) {
				return value <= field.max && value >= field.min;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return util.ntype( value ) == 'date' && value <= field.max && value >= field.min;
			}
		},
		file     : { // todo: add mime-type validation and multiple file support
			minmax : function( field, value ) {
				return true;
			},
			raw    : function( field, value ) {
				return field.elField.files[0];
			},
			val    : function( field, value ) {
				return field.elField.files[0];
			},
			valid  : function( field, value ) {
				return true;
			}
		},
		number   : {
			minmax : function( field, value ) {
				return value <= field.max && value >= field.min;
			},
			raw    : function( field, value ) {
			},
			val    : function( field, value ) {
			},
			valid  : function( field, value ) {
				return util.type( value ) == 'number' && ( field.allowDecimals || Math.floor( value ) === value );
			}
		},
		text     : {
			minmax : function( field, value ) {
				return value.length <= field.max && value.length >= field.min;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return typeof value == 'string' && ( !field.pattern || field.pattern.test( value ) );
			}
		}
	} }, 'cw' );
	__lib__.Validate.radio = __lib__.Validate.checkbox;
	__lib__.Validate.email = __lib__.Validate.hidden = __lib__.Validate.number = __lib__.Validate.password = __lib__.Validate.text;



/*~  src/proxy/Ajax.js  ~*/

	define( namespace( 'proxy.Ajax' ), function () {
		function onAbort( xhr, config ) {
			 this.loading = false;
			!this.interactive || status == 'abort'   || this.onReqAbort( xhr, config.options ).broadcast( 'abort', err, config.options );
		}

		function onError( xhr, status, err, config ) {
			 this.loading = false;
			!this.interactive || this.onReqError( xhr, status, err, config.options ).broadcast( 'error', err, status, xhr, config.options );
		}

		function onLoad ( data, status, xhr, config ) {
			 this.loading = false;
			!this.interactive || typeof data !== 'object' || this.onReqLoad( data, status, xhr, config.options ).broadcast( 'load', data, status, xhr, config.options );
		}

		function onTimeout() {
			this.loading = false;
			this.abort().onReqTimeout( this.current ).broadcast( 'timeout', this.current );
		}

		return {
			constructor    : function AjaxProxy( config ) {
				this.mixin( 'observer', is_obj( config ) ? config.observers : [] ).parent( arguments );
			},
			extend         : lib.Source,
			mixins         : {
				observer   : 'Observer'
			},
			module         : __lib__,

// instance configuration
			defaultData    : null,
			headers        : null,
			method         : 'get',
			timeout        : 30000,
			urlBase        : null,

// accessors
			interactive    : {
				get        : function() {
					return !this.disabled;
				},
				set        : function() {
					return this.interactive;
				}
			},

// public properties
			loading        : false,
// internal properties
			lastConfig     : null,
			tid            : null,

// public methods
			abort          : function() {
				!this.current   || this.current.abort();
			},
			disable        : function() {
				if ( !this.disabled && this.broadcast( 'before:disable' ) !== false ) {
					this.disabled = true;
					this.onDisable().broadcast( 'disable' );
				}
			},
			enable         : function() {
				if ( this.disabled && this.broadcast( 'before:enable' ) !== false ) {
					this.disabled = false;
					this.onEnable().broadcast( 'enable' );
				}
			},
			load           : function ( data, method, options ) {
				if ( is_obj( method ) ) {
					options = method;
					method  = UNDEF;
				}
				if ( !method || typeof method != 'string' )
					method = this.method || 'GET';

				method = method.toUpperCase();

				/*if ( !navigator.onLine )
					this.broadcast( 'error:	offline' );

				else*/ if ( this.interactive && this.broadcast( 'before:load', data, method, options ) !== false )
					this.onLoadStart( this.createUrl( data = this.prepareData( data ) ), method, data, options );
			},
			reload         : function() {
				if ( this.lastConfig && this.interactive && this.broadcast( 'before:reload' ) !== false )
					this.doRequest( this.lastConfig );
			},
// stub overwrite methods
			onReqAbort     : function( xhr, options ) {},
			onReqError     : function( xhr, status, err, options ) {},
			onReqLoad      : function( data, status, xhr, options ) {},
			onReqTimeout   : function( config ) {},
// internal methods
			createUrl      : function ( params ) {
				return this.urlBase;
			},
			doRequest      : function( transport ) {
				this.lastConfig = transport;
				this.loading    = true;
				this.current    = api.xhr( transport );
				this.tid        = setTimeout( this.onTimeout, this.timeout );

				this.broadcast( 'loadstart' );

				return this.current;
			},
			initTransport  : function( url, method, data, options ) {
				var transport = {
					abort   : this.onAbort,
					error   : this.onError,
					headers : this.headers,
					method  : method  || this.method,
					options : options || util.obj(),
					success : this.onLoad,
					url     : url
				};

 // if not a put or a post your createURL over-write should turn data into query string params
				if ( method === 'POST' || method === 'PUT' )
					transport.data = data;

				return transport;
			},
			prepareData     : function( data ) {
				return util.copy( data || util.obj(), this.defaultData, true );
			},
			removeTransport : function() {
				!this.current || delete this.current;
				clearTimeout( this.tid );
				delete this.tid;
			},

// stub methods
			onBeforeLoad    : function () {
				!this.current || this.abort( true );
			},
			onDisable       : function() { },
			onEnable        : function() { },
			onLoadStart     : function( url, method, data, options ) {
				return this.doRequest( this.initTransport.apply( this, arguments ) );
			},
// constructor methods
			init            : function () {
				this.onAbort   = onAbort.bind( this );
				this.onError   = onError.bind( this );
				this.onLoad    = onLoad.bind( this );
				this.onTimeout = onTimeout.bind( this );

				if ( !is_obj( this.defaultData ) )
					this.defaultData = util.obj();

				var cleanups = [this.onBeforeLoad, this.removeTransport];

				this.observe( {
					 abort          : this.removeTransport,
					'before:load'   : cleanups,
					'before:reload' : cleanups,
					 error          : this.removeTransport,
					 load           : this.removeTransport,
					 timeout        : this.removeTransport,
					 ctx            : this
				} );
			}
		};
	}() );

	util.def( __lib__.proxy, 'lookup', lookupProxy, 'r' );



/*~  src/proxy/CRUD.js  ~*/

	define( namespace( 'proxy.CRUD' ), function () {
		var default_api = {
				create : {
					method : 'POST',
					url    : 'create'
				},
				delete : {
					method : 'POST',
					url    : 'delete'
				},
				read   : {
					method : 'GET',
					url    : 'get'
				},
				update : {
					method : 'POST',
					url    : 'update'
				}
			};
		return {
			extend         : namespace( 'proxy.Ajax' ),
			module         : __lib__,

// instance configuration
			api            : null,

// public methods
			create         : createAPIMethod( 'create' ),
			delete         : createAPIMethod( 'delete' ),
			read           : createAPIMethod( 'read'   ),
			update         : createAPIMethod( 'update' ),
// stub overwrite methods
			createUrl      : function( data, api ) {
				return api.url || this.urlBase;
			},
			onAPICall      : function( command, data, options ) {
				command = command in this.api ? command : 'read';

				var api = this.api[command];

				if ( !is_obj( options ) )
					options = util.obj();

				options.command = command;

				if ( api && this.interactive && this.broadcast( 'before:' + command, data, options ) !== false )
					this.onLoadStart( this.createUrl( data, api ), api.method, data = this.prepareData( data, api ), options );
			},
			onReqAbort     : function( xhr, options ) {
				this.broadcast( 'abort:' + options.command, xhr, err, options );
			},
			onReqError     : function( xhr, status, err, options ) {
				this.broadcast( 'error:' + options.command, xhr, status, err, options );
			},
			onReqLoad      : function( data, status, xhr, options ) {
				this.broadcast( options.command, data, status, xhr, options );
			},
// internal methods
			prepareData     : function( data, api ) {
				return typeof api.data == 'function' ? api.data( data ) : data;
			},
// constructor methods
			init            : function() {
				this.parent( arguments ).initAPI();
			},
			initAPI         : function() {
				if ( !is_obj( this.api ) )
					this.api = util.obj();

				Object.reduce( this.api, this.initAPIMethod, this );
			},
			initAPIMethod   : function( ctx, config, command ) {
				var cmd = default_api[command];

				if ( typeof config == 'string' )
					config = { url : config };

				if ( typeof ctx.urlBase == 'string' && typeof config.url == 'string' )
					config.url = ctx.urlBase + ( config.url.indexOf( '/' ) === 0 ? '' : '/' ) + config.url;

				ctx.api[command] = util.update( config, cmd );

				if ( typeof ctx[command] != 'function' )
					ctx[command] = createAPIMethod( command );

				return ctx;
			}
		};

		function createAPIMethod( command ) {
			return function APIMethod( model, options ) {
				return this.onAPICall( command, model, options );
			};
		}
	}() );



/*~  src/proxy/ModelSync.js  ~*/

	define( namespace( 'proxy.ModelSync' ), function () {
		return {
			extend         : namespace( 'proxy.CRUD' ),
			module         : __lib__,

// instance configuration
			api            : null,

// public methods
			create         : function( data, options ) {
				var id = options.model.schema.mappings.id;
				delete data[id];
				this.parent( data, options );
			},
			delete         : function( model ) {
				if ( !model.exists ) return;

				this.parent( { id : model.id }, { model : model } );
			},
			read           : function( data, options ) {
				var id = options.model.schema.mappings.id;
				this.parent( { id : data[id] || options.model[id] }, options );
			},
			sync           : function( model, options ) {
				var command = 'read';

				if ( model.dirty )
					command = model.exists ? 'update' : 'create';
				else if ( !model.exists )
					command = 'create';

				if ( !is_obj( options ) )
					options = util.obj();

				options.model = model; // todo, need decorator to add non-existent api methods as public methods to instance

				!( command in this.api ) || this[command]( model.toJSON(), options );
			},
//			update         : function( data, options ) {
//			},
// stub overwrite methods
			onReqAbort     : function( xhr, options ) {
				this.parent( arguments );
				options.model.onSyncAbort( options.command );
			},
			onReqError     : function( xhr, status, err, options ) {
				this.parent( arguments );
				options.model.onSyncError( err, options.command );
			},
			onReqLoad      : function( data, status, xhr, options ) {
				this.parent( arguments );
				options.model.onSync( data, options.command );
			},
// internal methods
			onBeforeLoad    : function() {}
		};
	}() );



/*~  src/data/Model.js  ~*/

	define( namespace( 'data.Model' ), function() {
		var count = 999;

		return {
// class configuration
			afterdefine    : function( Model ) {
				var p = Model.prototype;

				if ( Model.__proxy__  = lookupProxy(  p.proxy,  'proxy.ModelSync' ) )
					delete p.proxy;
				if ( Model.__schema__ = lookupSchema( p.schema ) )
					delete p.schema;
			},
			beforeinstance : function( Model, instance ) {
				instance.proxy  = Model.__proxy__;
				instance.schema = Model.__schema__;
			},
			constructor    : function DataModel( raw ) {
				this.parent();

				this.changes = util.obj();
				this.dom     = util.obj();
				this.raw     = raw;
				this.src     = this.schema.coerceItem( raw );

				var schema   = this.schema,
					id       = this.src[schema.mappings.id] || raw[schema.mappings.id];

				this.exists  = !!id;
				this.id      = id || 'phantom-' + ( ++count );

				if ( this.exists ) {
					( util.len( raw ) - 1 ) || this.autoLoad === false || this.sync();
					this.set( 'id', id );
				}
				else if ( util.len( this.src ) > 0 && this.autoSync === true )
					this.sync();
			},
			extend         : 'Observer',
			module         :  __lib__,

			proxy          : null,
			schema         : null,
// instance configuration
			autoLoad       : true,
			autoSync       : false,
// accessors
			dirty          : {
				get        : function() { return !!util.len( this.changes ); },
				set        : function() { return this.dirty; }
			},
// public properties
			changes        : null,
			id             : null,
// internal properties
			dom            : null,
			exists         : false,
			raw            : null,
			slc            : null,
			src            : null,
			strict         : false, // todo: implement this
			suspendChange  : 0,
			suspendSync    : 0,

// public methods
			destroy        : function( success ) {
				if ( this.autoSync === true ) {
					if ( success === true )
						this.parent( arguments );
					this.proxy.delete( this );
				}
				else
					this.set( 'deleted', true );
			},
			get            : function( key ) {
				return this.src[key] === UNDEF ? null : this.src[key];
			},
			getBoundEl     : function( cmp ) {
				return this.dom[typeof cmp == 'string' ? cmp : cmp.id] || null;
			},
			revert         : function( key ) {
				if ( typeof key != 'string' ) {
					Object.keys( this.changes ).forEach( this.revert, this );
					return;
				}
				if ( key in this.changes ) {
					this.set( key, this.changes[key] );
					delete this.changes[key];
				}
			},
			set            : function( key, val, noupdate ) {
				if ( is_obj( key ) ) {
					if ( typeof val == 'boolean' )
						noupdate = val;

					this.suspendChange || ++this.suspendChange;
					Object.reduce( key, function( ctx, v, k ) {
						return ctx.onSet( k, v, true );
					}, this );
					!this.suspendChange || --this.suspendChange;

					noupdate === true || this.syncView();

					this.broadcast( 'change' );

					return;
				}

				this.onSet( key, val, noupdate );

				noupdate === true || this.syncView();

				!this.dirty || this.autoSync === false || this.sync();
			},
			sync           : function() {
				if ( this.suspendSync ) return;

				this.proxy.sync( this );
			},
			toJSON         : function() {
				if ( this.destroyed )
					return util.obj();

				var json = Object.reduce( this.src, toJSON.bind( this ), util.obj() );

				if ( this.exists )
					json.id = this.id;
				else
					delete json.id;

				return json;
			},
// internal methods
			bindView       : function( cmp, el ) {
				switch ( util.type( el ) ) {
					case 'element[]'   :                   break;
					case 'htmlelement' : el = api.$( el ); break;
					default            :
						if ( !( el = cmp.$el.find( this.slc ) ).size )
							return;
				}

				this.dom[cmp.id] = el.attr( 'data-model-id', this.id );
			},
			onDestroy     : function() {
				this.parent( arguments );
				this.destroyed = true;
				delete this.changes; delete this.dom;
				delete this.exists;  delete this.id;
				delete this.raw;     delete this.src;
			},
			onSet         : function( key, val, noupdate ) {
				var change = false, clean,
					schema = this.schema,
					prop   = schema.property;

				if ( key in prop ) {
					if ( prop[key].store ) {
						this.src[key].load( val );
						this.suspendChange || prop[key].track === false || this.broadcast( 'change' );
						prop[key].track === false || this.broadcast( 'change:' + key );
					}
					else {
						clean = prop[key].coerce( val );
						if ( clean !== this.src[key] ) {
							this.raw[key]     = val;
							this.changes[key] = this.src[key];
							this.src[key]     = clean;
							this.suspendChange || prop[key].track === false || this.broadcast( 'change' );
							prop[key].track === false || this.broadcast( 'change:' + key, this.src[key], this.changes[key] );
						}
					}
				}

				if ( key === schema.mappings.id ) {
					this.id  = this.src[key] || val;
					this.slc = '[data-id="' + this.id + '"], [data-model-id="' + this.id + '"]';
				}
			},
			onSync        : function( raw, command ) {
				if ( !raw ) return; // todo: throw an error?

				if ( command === 'delete' )
					return this.destroy( true );

				var raw_item = this.schema.getItemRoot( raw );

				if ( !raw_item ) return;

//				this.suspendEvents();
				util.copy( this.src, this.schema.coerceItem( raw_item ) );
//				Object.keys( raw ).forEach( removeChange, this.changes );
				this.raw = raw_item;

				if ( command === 'create' ) {
					this.id     = this.src.id;
					this.exists = !!this.id;
				}
				this/*.resumeEvents()*/.broadcast( 'sync', command, raw ).broadcast( 'change' );
			},
			onSyncAbort   : function( command ) {
				this.broadcast( 'sync:abort', command );
			},
			onSyncError   : function( err, command ) {
				this.broadcast( 'sync:error', command, err );
			},
			syncView       : function() {
				Object.reduce( this.dom, syncView, this );
			}
		};

		function removeChange( key ) { delete this[key]; }

		function syncData( cmd, proxy, data, status, xhr ) {
			var id, m = this.schema.mappings;
			if ( is_obj( data ) )
				id   = data[m.id]   || data[m.item][m.id];
				data = data[m.item] || data;

			if ( is_obj( data ) ) { // noinspection FallthroughInSwitchStatementJS
				switch ( cmd ) {
					case 'read'   :
					case 'update' : this.set( data );                      break;
					case 'create' : !id || this.set( 'id', this.id = id ); break;
				}

				this.broadcast( cmd, data, status, xhr );
			}
		}
		function syncView( node, el, cmp_id ) {
			el.attr( 'data-model-id', node.id );

			Object.keys( node.changes ).forEach( function( key ) { // we're looping through changed properties to save time
				el.find( '[data-model-binding="' + key + '"]' ).html( this[key] ); // but we're applying the new values
			}, node.src );

			return node;
		}
		function toJSON( json, val, key ) {
			var property = this.schema.property[key];

			if ( property && property.stringify !== false ) {
				if ( property.store )
					json[key] = val.toJSON();
				else
					json[key] = util.merge( val );
			}

			return json;
		}
	}() );



/*~  src/data/Schema.js  ~*/

	;!function() {
		define( namespace( 'data.Schema' ), {
	// class configuration
			afterdefine    : function( Schema ) {
				var p    = Schema.prototype;

				Schema.__mappings__   = p.mappings;
				Schema.__properties__ = p.properties;

				delete p.mappings; delete p.properties;
			},
			beforeinstance : function( Schema, instance, args ) {
				var has_config = is_obj( args[0] );

				if ( is_obj( Schema.__mappings__ ) ) {
					instance.mappings   = has_config
										? util.update( args[0].mappings   || util.obj(), Schema.__mappings__   )
										: util.update( Schema.__mappings__   );
					!has_config || delete args[0].mappings;
				}
				if ( typeof Schema.__properties__ == 'object' ) {
					instance.properties = has_config
										? util.update( args[0].properties || util.obj(), Schema.__properties__ )
										: util.update( Schema.__properties__ );
					!has_config || delete args[0].properties;
				}
			},
			constructor : function DataSchema( config ) {
				if ( Array.isArray( config ) )
					config = { properties : config };

				if ( !is_obj( config ) )
					config = util.obj();

				this.mappings   = util.update( config.mappings || this.mappings || util.obj(), DEFAULT_MAPPINGS );
				this.properties = ( config.properties || this.properties ).map( to_property, this );
				this.property   = this.properties.reduce( to_prop_map, util.obj() );
			},
			extend      : Object,
			module      : __lib__,

	// instance configuration properties
			mappings    : null,
			properties  : null,

	// public properties
			property    : null,
	// public methods
			coerce      : function( raw, json ) {
				var data = this.prepare( raw );
// todo: once model replaces node, make coerce simply return the items array
				data.items = data.items.map( this.coerceItem, this );

				return data;
			},
			coerceItem  : function( raw ) {
				var data = util.obj();
				this.properties.invoke( 'process', util.update( this.getItemRoot( raw ) ), data );
				return data;
			},
			getItemRoot : function( raw ) {
				var item = this.mappings.item;
				return item ? Object.value( raw, item ) || raw : raw;
			},
			getRoot     : function( raw ) {
				if ( !raw ) return [];

				var items     = this.mappings.items,
					raw_items = Array.isArray( raw ) ? raw : items ? Object.value( raw, items ) || raw : raw;

				return Array.isArray( raw_items ) ? raw_items.slice() : [];
			},
			prepare     : function( response ) {
				var items, success, total;

				if ( response && typeof response == 'object' ) {
					items   = this.getRoot( response );
					total   = this.mappings.total   in response ? response[this.mappings.total]   : items.length;
					success = this.mappings.success in response ? response[this.mappings.success] : !!total;
				}
				else {
					items   = [];
					total   = -1;
					success = false;
				}

				return {
					items   : items,
					success : success,
					total   : total
				};
			},
			valid       : function( data ) {
				return Object.keys( data ).every( function( prop ) {
					return prop in this && this[prop].valid( data[prop] );
				}, this.property );
			}
		} );

		define( namespace( 'data.Schema.Property' ), {
	// class configuration
			constructor : function DataSchemaProperty( config ) {
				util.copy( this, config || {} );

				if ( !this.cite && this.id )
					this.cite = this.id;
				if ( !this.id && this.cite )
					this.id   = this.cite;

				if ( !~this.id.indexOf( '.' ) ) {
					this._id  = this.id;
					this.path = '';
				}
				else {
					this.path = this.id.split( '.' );
					this._id  = this.path.pop();
					this.path = this.path.join( '.' );
				}

				switch ( typeof this.type ) {
					case 'function' : break;
					case 'string'   :
						if ( this.default === null && this.type !== 'object' )
							this.default = DEFAULT[this.type];

						this.type = TYPE[this.type];

						break;
				}

				typeof this.type == 'function' || error( {
					instance : this,
					method   : 'constructor',
					message  : 'Invalid data.Schema.Property#type',
					name     : error.code.DATA_SCHEMA_TYPE
				} );

				// noinspection FallthroughInSwitchStatementJS
				switch ( typeof this.format ) {
					case 'function' :
					case 'string'   : break;
					default         : this.format = util;
				}

				this.fmt = FORMAT[util.ntype( this.format )] || this.fmt;

				this.schema = lookupSchema( this.schema );
				if ( this.type.id == 'collection' )
					this.store  = lookupStore( this.store );
			},
			extend      : Object,
			module      : __lib__,

	// instance configuration properties
			cite        : null,
			default     : null,
			format      : null,
			id          : null,
			schema      : null,
			store       : null,
			track       : true,
			type        : 'object',

	// internal properties
			_id         : null,

	// public methods
			coerce      : function( val, raw, data ) {
				return this.fmt( val, this.format, raw, data );
			},
			process     : function( raw, data ) {
				return this.assign( this.coerce( this.val( raw, data ), raw, data ), data );
			},
			valid       : function( v ) {
				return this.store ? true : util.ntype( v ) === this.type.id;
			},
			value       : util,
	// internal methods
			assign      : function( val, data ) {
				var root       = util.bless( this.path, data );
				root[this._id] = val;
				return data;
			},
			fmt         : util,
			val         : function( raw, data ) {
				var val = this.value( Object.value( raw, this.cite ) || null, raw, data );
				return val === this || val === UNDEF ? null : val;
			}
		} );

		var DataSchema       = getClass( 'data.Schema' ),
			DEFAULT_MAPPINGS = DataSchema.DEFAULT_MAPPINGS = {
				id      : 'id',      items : 'items',
				success : 'success', total : 'total'
			},
			DEFAULT          = {
				boolean :  false,
				date    : 'now',
				number  :  0,
				string  : ''
			},
			FORMAT           = {
				'function' : function( v, f, raw, data ) {
					return f.call( this, this.type( v ), raw, data );
				},
				 string    : function( v, f ) {
					return this.type( v, f );
				}
			},
			TYPE             = DataSchema.TYPE = { // todo: these may need a lil' more work
				array   : function( v ) {
					if ( this.schema )
						return this.schema.coerce( v ).items || [];

					return Array.isArray( v ) ? v : util.exists( v ) ? Array.coerce( v ) : [];
				},
				boolean : function( v ) {
					if ( typeof v == 'boolean' ) return v;
					return v == 'false' ? false : typeof this.default == 'boolean' ? this.default : Boolean.coerce( v );
				},
				collection : function( v ) {
					return this.store.create( { data : v } );
				},
				date    : function( v, f ) {
					if ( is_date( v ) ) return v;

					var date; f || ( f = this.format );

					if ( v !== null ) {
						switch ( typeof f ) {
							case 'string'   : date = api.date.coerce( v, f ); break;
							case 'function' : date = f( v );                  break;
							default         : date = new Date( v );
						}
					}
					else date = NaN;

					return isNaN( +date ) ? this.default == 'now' ? new Date() : new Date( +this.default ) : date;
				},
				number  : function( v ) {
					return Number( v ) == v ? Number( v ) : this.default;
				},
				object  : function( v ) {
					if ( this.schema )
						return this.schema.coerceItem( v );

					return v === UNDEF ? this.default : v;
				},
				string  : function( v ) {
					return String( v ) == v ? String( v ).trim() : this.default;
				}
			};

		Object.keys( TYPE ).forEach( function( t ) {
			this[t].id = t;
		}, TYPE );

		function to_prop_map( map, property ) {
			map[property.id] = property;
			return map;
		}
		function to_property( property ) {
			return property instanceof DataSchema.Property ? property : widgie.create( 'data.Schema.Property', property );
		}
	}();



/*~  src/data/Collection.js  ~*/

	define( namespace( 'data.Collection' ), function() {
		var count     = 999,
			filters   = {
				date    : function( f, v, model ) {
					return +model.get( f ) === +v;
				},
				default : function( f, v, model ) {
					return model.get( f ) === v;
				},
				regexp  : function( f, v, model ) {
					return v.test( model.get( f ) );
				},
				string  : function( f, v, model ) {
					return String( model.get( f ) ).toLowerCase() === v;
				}
			},
			sort_dir  = {
				asc     : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : -1;
				},
				desc    : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] < b[0] ? 1 : -1;
				}
			};

		return {
// class configuration
			constructor   : function DataCollection( config ) {
				this.mixin( 'observer', is_obj( config ) ? config.observers : [] ).parent( arguments );
			},
			extend        : lib.Source,
			mixins        : {
				observer  : 'Observer'
			},
			module        : __lib__,
// instance configuration properties
			data          : null,
			id            : null,
			model         : null,
			proxy         : null,
			schema        : null,
// accessors
			changes       : {
				get       : function() {
					return this.data.reduce( function( models, model ) {
						!model.dirty || models.push( model );
						return models;
					}, [] );
				},
				set       : function() { return this.changes; }
			},
			dirty         : {
				get       : function() { return this.data.values.pluck( 'dirty' ).some( is_true ); },
				set       : function() { return this.dirty; }
			},
			size          : {
				get       : function() { return this.data.length; },
				set       : function() { return this.size; }
			},
			view          : {
				get       : function() { return this.current || this.data; },
				set       : function() { return this.view; }
			},
// public properties
			loading       : false,
// internal properties
			current       : null,
			stache        : null,
			suspendChange : 0,

// public methods
			add           : function( data, silent ) {
				if ( Array.isArray( data ) ) {
					 this.suspendChange || ++this.suspendChange;
					 data.forEach( this.add, this );
					!this.suspendChange || --this.suspendChange;
					 return this.onChangeData( silent );
				}

				var model = this.onAdd( data );
				!model || this.broadcast( 'add', model ).onChangeData( silent );
			},
			bindView      : function( cmp ) {
				this.data.values.invoke( 'bindView', cmp );
			},
			byId          : function( id ) {
				if ( is_obj( id ) )
					return id instanceof this.model && this.data.key( id )
						 ? id
						 : this.data.get( id[this.model.__schema__.mappings.id] ) || this.data.get( id.id );

				return this.data.get( id ) || null;
			},
			clear         : function( silent ) {
				this.data.clear();

				silent === true || this.broadcast( 'clear' );
				this.onChangeData( silent );
			},
			clearFilters  : function( silent ) {
				this.emptyStash( silent );
			},
			commit        : function() {},
			contains      : function( item ) {
				return !!this.byId( item );
			},
			each          : function( fn, ctx ) {
				this.view.ovalues.forEach( fn, ctx || this );
			},
			emptyStash    : function( silent ) {
				delete this.current;
				this.stache.length = 0;
				silent === true || this.broadcast( 'empty:stash' );
				this.onChangeView( silent );
			},
			fetch         : function( params, options ) {
				if ( this.proxy ) {
					this.proxy.load( this.prepare( params ), options );
					this.loading = this.proxy.loading;
				}
			},
			filter        : function( fn, ctx ) {
				ctx || ( ctx = this );
				this.updateView( this.view.ovalues.filter( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this ) );
			},
			filterBy      : function( f, v ) {
				this.filter( ( filters[util.ntype( v )] || filters.default ).bind( this, f, v ) );
			},
			find          : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.find( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this );
			},
			findAll       : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.filter( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this );
			},
			first         : function() { return this.getAt( 0 ); },
			get           : function( model ) {
				if ( is_obj( model ) )
					return model instanceof this.model && this.data.key( model )
						 ? model
						 : this.data.get( model[this.model.__schema__.mappings.id] ) || this.data.get( model.id );

				return this.byId( model ) || this.getAt( model ) || null;
			},
			getAt         : function( i ) {
				return this.data.ovalues[i > - 1 ? i : this.data.length + i] || null;
			},
			getBoundEls   : function( cmp ) {
				return this.data.values.invoke( 'getBoundEl', cmp );
			},
			indexOf       : function( model, use_view ) {
				model = this.get( model ); // todo: shouls this use use_view too?
				return model ? ( use_view === true ? this.view : this.data ).ovalues.indexOf( model ) : -1;
			},
			last          : function() { return this.getAt( -1 ); },
			load          : function( raw, options ) {
				var data = this.readResponse( raw );

				if ( data.success && data.items ) {
					this.clearFilters( true ).add( data.items, !!options );
					!options || this.onChangeData( false, options );
				}
				else
					this.broadcast( 'load:empty', data, options );
			},
			map           : function( fn, ctx ) {
				return this.view.ovalues.map( fn, ctx || this );
			},
			next          : function( model ) {
				var i = this.indexOf( model, true );
				return !!~i ? this.view.ovalues[i + 1] || null : null;
			},
			pluck         : function( key ) {
				return this.view.values.invoke( 'get', key );
			},
			prev          : function( model ) {
				var i = this.indexOf( model, true );
				return !!~i ? this.view.ovalues[i - 1] || null : null;
			},
			reduce        : function( fn, val, ctx ) {
				ctx || ( ctx = this );
				return this.view.ovalues.reduce( function( v, model ) {
					return fn.call( ctx, v, model );
				}, val );
			},
			remove        : function( model, silent ) {
				model = this.get( model );

				if ( !model || !this.onRemove( model ) ) return;

				this.broadcast( 'remove', model );
				silent === true || this.onChangeData( silent );
			},
			readResponse  : function( raw ) {
				return this.model.__schema__.prepare( raw );
			},
			revert        : function( model, silent ) {
				if ( model ) {
					model = this.get( model );
					if ( model.dirty ) {
						model.revert();
						silent === true || this.broadcast( 'revert', model ).onChangeData();
					}
					return;
				}

				if ( typeof model == 'boolean' )
					silent = model;

				model = this.changes;

				if ( model.length ) {
					model.invoke( 'revert' );
					silent === true || this.broadcast( 'revert', model ).onChangeData();
				}
			},
			setModel      : function( model ) {
				if ( this.model = lookupModel( model ) )
					this.broadcast( 'set:model' );
			},
			setProxy      : function( proxy ) {
				if ( this.proxy instanceof getClass( 'proxy.Ajax' ) ) {
					this.proxy.ignore( 'error',     'onLoadError', this )
							  .ignore( 'load',      'onLoad',      this )
							  .ignore( 'loadstart', 'onLoadStart', this )
							  .ignore( 'timeout',   'onLoadError', this );

					delete this.proxy;
				}

				if ( typeof proxy == 'string' )
					proxy = lookupProxy( proxy ) || { urlBase : proxy };

				if ( this.proxy = lookupProxy( proxy ) ) {
						this.proxy.observe( {
							error     : 'onLoadError', load    : 'onLoad',
							loadstart : 'onLoadStart', timeout : 'onLoadError',
							ctx       : this
						} );

						this.broadcast( 'set:proxy' );
				}
			},
			sort          : function( fn, ctx ) {
				this.updateView( this.view.ovalues.slice().sort( fn.bind( ctx || this ) ) );
			},
			sortBy        : function( f, d ) {
				this.updateView( sort_prepare( this, f ).sort( sort_dir[String( d ).toLowerCase()] || sort_dir.asc ).pluck( 1 ) );
			},
			stash         : function() {
				if ( this.current ) {
					this.stache.push( this.current.clone() );
					delete this.current;
					this.broadcast( 'stash' );
				}
			},
			toJSON        : function() {
				return this.view.ovalues.invoke( 'toJSON' );
			},
			undo          : function( n ) {
				if ( this.stache.length ) {
					if ( isNaN( n ) || n < 0 )
						n = 0;

					var stash = this.stache[n];

					this.stache.splice( 0, n + 1 );

					this.current = stash;

					this.onChangeView();
				}
				else if ( delete this.current )
					this.onChangeView();
			},
			updateView    : function( view ) {
				this.stash();

				this.current = lib( 'Hash' );

				view.forEach( add, this.current );

				this.onChangeView();
			},
// stub methods
			onAdd          : function( data ) {
				var existing, model;

				if ( !( data instanceof this.model ) )
					model = this.model.create( data );

				if ( existing = this.data.get( model.id ) )
					return existing;

				this.data.set( model.id, model );

				model.observe( {
					'before:destroy' : 'remove',
					 change          : 'onChangeData',
					 sync            : 'onModelSync',
					 ctx             : this
				} );

				return model;
			},
			onChangeData   : function( silent, options ) {
				if ( this.suspendChange ) return;

				this.emptyStash( true );
				silent === true || this.broadcast( 'change:data', options );

				if ( this.proxy )
					this.loading = this.proxy.loading;
			},
			onChangeView   : function( silent ) {
				this.suspendChange || silent === true || this.broadcast( 'change:view' );
			},
			onModelSync    : function( model, command ) {
				if ( command === 'create' ) {
					var key = this.data.key( model );
					this.data.remove( key );
					this.data.set( model.id, model );
				}
			},
			onLoad         : function( proxy, data, status, xhr, config ) {
				this.broadcast( 'load:complete', data, status, xhr, config ).load( data, config.options );
			},
			onLoadError    : function( proxy, err, status, xhr, config ) {
				this.broadcast( 'load:error', err, status, xhr, config.options );
			},
			onLoadStart    : function() {
				this.broadcast( 'load:start' );
			},
			onRemove       : function( model ) {
				var id = model.id;

				!this.current || this.current.remove( id );
				this.stache.invoke( 'remove', id );

				return this.data.remove( id );
			},
			prepare       : function( params ) {
				return util.update( params || util.obj(), this.defaultData );
			},

// internal methods
			init          : function() {
				this.parent( arguments );
				this.stache = [];

				var data    = this.data,
					model   = this.model,
					proxy   = this.proxy;

				util.remove( this, 'data', 'model', 'proxy' );

				this.data   = lib( 'Hash' );

				this.setModel( model )
					.setProxy( proxy );

				if ( !is_obj( this.defaultData ) )
					this.defaultData = util.obj();

				switch ( util.ntype( data ) ) {
					case 'object' : this.load( data ); break;
					case 'array'  : this.add( data );                        break;
				}
			}
		};

		function add( model ) {
			this.set( model.id, model );
		}

		function sort_prepare( collection, f ) {
			return collection.view.ovalues.map( function( model ) {
				return [model.get( f ), model];
			} );
		}
	}() );

	util.def( __lib__.data, 'lookup', { value : {
		collection : lookupStore,
		model      : lookupModel,
		schema     : lookupSchema
	} }, 'r' );



/*~  src/mixins/DataProcessor.js  ~*/

	define( namespace( 'mixins.DataProcessor' ), {
// class configuration
		constructor : function DataProcessor() {},
		extend      : Object,
		module      : __lib__,

// instance configuration

// public methods
		parse       : function( tpl, data ) { return tpl ? api.tpl.parse( tpl, this.prepare( data ) ) : ''; },
		prepare     : function( data ) {
			var dict = { '@' : this };
			return typeof data == 'object' ? util.copy( dict, this.process( data ), true ) : dict;
		},

// internal methods
		process     : function( data ) {
			switch ( util.type( data ) ) {
				case 'object'                :
				case 'nullobject'            : return 'items' in data ? data.items.map( this.processItem, this ) : data;
				case 'array'                 : return { items : data.map( this.processItem, this  ) };
				case Name_lc + '-data-store' : return { items : data.view.ovalues.map( this.processItem, this  ) };
			}
			return { items : [] };
		},
		processItem : function( item ) { return item.toJSON ? item.toJSON() : item.src || item; }
	} );



/*~  src/mixins/ClsSlc.js  ~*/

	define( namespace( 'mixins.ClsSlc' ), {
// class configuration
		extend       : Object,
		module       : __lib__,

// instance configuration
		clsList      : 'active collapsed focused disabled expanded hidden item',

// internal methods
		init         : function() {
			this.slcBase = '.' + this.clsBase; //noinspection FallthroughInSwitchStatementJS

			switch ( util.ntype( this.clsList ) ) {
				case 'string' : this.clsList = this.clsList.split( ' ' ); // allow fall-through
				case 'array'  : this.clsList.map( this.prefixClsSlc, this ); break;
			}
		},
		prefixClsSlc : function( state ) {
			var left  = state.split( '-' ).map( capitalize ).join( '' ),
				right = '-' + state;

			this['cls' + left] = this.clsBase + right;
			this['slc' + left] = this.slcBase + right;
		}
	} );



/*~  src/mixins/DOMRefs.js  ~*/

	define( namespace( 'mixins.DOMRefs' ), function() {
		var $1 = '$1', re = /^\$?el(.*)/;
		return {
// class configuration
			extend           : Object,
			module           : __lib__,

// instance configuration
			selectors        :  null,
			slcRef           : '[data-ref]',

// properties
			refs             : null,
			suspendApply     : 0,

// public methods
			getRef           : function( ref, dom ) {
				dom = Boolean.coerce( dom );
				ref = String( ref ).replace( re, $1 );

				ref = ( !dom ? '$' : '' ) + 'el' + ref.split( '-' ).map( capitalize );

				return this[ref] || null;
			},
			applySelectors   : function() {
				if ( this.suspendApply ) return;

				this.applyDOMRefs();

				!is_obj( this.refs ) || Object.reduce( this.refs, this.applySelector, this );

				if ( !this.refs.focus && !this.elFocus ) {
					this.$elFocus = this.$el;
					this.elFocus  = this.el;
				}

				this.broadcast( 'refs:applied' );
			},
			unapplySelectors : function() {
				!is_obj( this.refs ) || Object.reduce( this.refs, this.unapplySelector, this );

				this.broadcast( 'refs:unapplied' );
			},
			updateEl         : function( ref, html ) {
				   !this.interactive
				|| !( ref = this.getRef( ref ) )
				|| this.broadcast( 'before:update:element', ref, html ) === false
				|| this.onUpdateEl( ref, html ).broadcast( 'update:element', ref );
			},
// stub methods
			onUpdateEl       : function( ref, html ) { ref.html( html ); },
// internal methods
			applyDOMRef      : function( el, ref ) {
				switch( util.type( el ) ) {
					case 'element[]'   :                           break;
					case 'htmlelement' : el = api.$( el );         break;
					case 'string'      : el = this.$el.find( el ); break;
					default            : return;
				}

				if ( typeof ref != 'string' )
					ref = el.data( 'ref' );

				if ( el && el.length ) {
					ref             = 'el' + capitalize( ref );
					this['$' + ref] = el;
					this[ref]       = this['$' + ref][0];
				}
			},
			applyDOMRefs     : function() { // we could simplify this, but then janeQuery/zepto would not work correctly
				Array.coerce( this.$el.find( this.slcRef ) ).map( this.applyDOMRef, this );
			},
			applySelector    : function( ctx, slc, ref ) { return ctx.applyDOMRef( slc, ref ); },
			init             : function() {
				this.prepareRefs();

				if ( !is_obj( this.refs ) )
					this.refs = {};

				if ( this.slcFocus ) {
					this.refs.focus = this.slcFocus;
					delete this.slcFocus;
				}

				!is_obj( this.selectors ) || util.copy( this.refs, this.selectors, true );
			},
			prepareRefs      : util.noop,
			registerEvents   : function() {
				this.observe( {
					destroy : 'unapplySelectors',
					render  : 'applySelectors',
					update  : 'applySelectors'
				} );
			},
			unapplySelector  : function( ctx, slc, ref ) {
				ref = 'el' + capitalize( ref );
				util.remove( this, [ref, '$' + ref] );
				return ctx; // note reduce works differently to other iterators, this is why we are returning the instance here
			}
		};
	}() );



/*~  src/mixins/Renderer.js  ~*/

	define( namespace( 'mixins.Renderer' ), {
// class configuration
		extend          : Object,
		module          : __lib__,

// instance configuration
		slcCt           : 'body',
		tpl             :  Name + '.component',

// flags
		dead            : { get : function() {
			return this.destroyed || this.destroying;
		} },
		destroyed       : false,
		destroying      : false,
		ready           : { get : function() {
			return this.rendered && !this.dead;
		} },
		rendered        : false,
		rendering       : false,

// properties
		$ct             : null,
		$el             : null,
		ct              : null,
		el              : null,
		suspendUpdate   : 0,

// public methods
		render          : function( ct ) {
			if ( this.ready || this.dead || this.broadcast( 'before:render' ) === false )
				return;
			this.rendering = true;
			this.assignContainer( ct ).onRender().afterRender();
			this.rendering = false;
		},
		prepareFragment : function( data, tpl ) {
			var html; // noinspection FallthroughInSwitchStatementJS
			switch ( util.type( data ) ) {
				case 'object'                :
				case 'nullobject'            :
				case 'array'                 :
				case Name_lc + '-data-store' : html = this.parse( tpl, data ); break;
				case 'string'                :                                             break;
				case 'null'                  : html = '';                                  break;
				case 'htmlelement'           :
				case 'documentfragment'      : return data;
				case 'htmlcollection'        :
				case 'element[]'             : html = data;                                break;
				default                      : return null;
			}

			if ( typeof html == 'string' )
				html = html.trim();

			return this.fragmentalize( html ? html : '' );
		},
		toElement       : function( tpl, data ) {
			return api.$( this.parse( tpl, data ) );
		},
// stub methods
		afterRender     : function() {
			 this.broadcast( 'after:render' );

			typeof this.active != 'boolean' || this[( this.active === true ? '' : 'de' ) + 'activate']();

			if ( this.focusable !== false ) {
				addDOMListener( this.$elFocus, 'blur',  this.id + '::blur' );
				addDOMListener( this.$elFocus, 'focus', this.id + '::focus' );

				if ( this.focused === true  ) {
					this.focused = false;
					this.focus();
				}
			}
		},
		onAppend        : function( frag ) {
			this[this.updateTarget][0].appendChild( frag );
		},
		onDestroy       : function() {
			if ( this.rendered ) {
				this.rendered = false;
				this.$el.remove();
				util.remove( this, '$ct $el ct el'.split( ' ' ) );
			}
		},
		onRender        : function() {
			this.createDOM();

			this.$el.appendTo( this.ct );

			this.rendered = true;

			this.broadcast( 'render' );

			if ( !( this.updateTarget in this ) )
				this.updateTarget = this.$elCt ? '$elCt' : '$el';
		},
		onUpdate        : function( frag ) {
			this[this.updateTarget].html( null )[0].appendChild( frag );
//			( this.$elCt || this.$el ).html( html );
		},
// internal methods
		assignContainer : function( ct ) {
			var type = util.type( ct );
			if ( util.exists( ct ) ) {
				if ( type == 'element[]' )
					this.$ct = ct;
				else if ( type == 'string' || type == 'htmlelement' )
					this.$ct = api.$( ct );
				else if ( lib.is( ct, Name + '.Box' ) )
					this.$ct = ct[ct.prop.ctItems] || ct.$elCt || ct.$el;
				else if ( this.slcCt )
					this.$ct = api.$( this.slcCt );
			}

			if ( this.$ct )
				this.ct = this.$ct[0];
		},
		createDOM       : function() {
			this.$el = this.toElement( this.tpl, null ).attr( 'id', this.id ).data( 'transitionend', 'afterTransition' );
			this.el  = this.$el[0];

			!this.$el.hasClass( this.clsDefault ) || this.$el.addClass( this.clsDefault );

			if ( !!~this.el.firstElementChild.className.indexOf( this.clsBase + '-ct' ) ) {
				this.elCt  = this.el.firstElementChild;
				this.$elCt = api.$( this.elCt );
			}
		},
		fragmentalize   : function( html ) {
			var frag = doc.createDocumentFragment();

			api.$( html ).appendTo( frag );

			return frag;
		},
		init            : function() {
			this.tpl = api.tpl.create( this.tpl );
		}
	} );



/*~  src/mixins/BoxRenderer.js  ~*/

	define( namespace( 'mixins.BoxRenderer' ), {
// class configuration
		extend      : namespace( 'mixins.Renderer' ),
		module      : __lib__,

// instance configuration
		autoRender  : true,
		tpl         :  Name + '.box',

// stub methods
		onRemove    : function( item ) {
			item.$el.remove();
		},
		onRender    : function() {
			this.parent().renderItems();
		},
// internal methods,
		adopt       : function( item, insert, index ) {
			if ( !this.rendered || this.autoRender === false ) return;

			item.render( this[this.$_items] ).$el.css( 'display', 'none' );

			!insert || item.$el.insertBefore( this.items[index >= 0 ? index : this.items.length + index].el );

			item.$el.css( 'display', '' );
		},
		destroyItem : function( item ) {
			return item.destroy();
		},
		renderItem  : function( item ) {
			if ( item.rendered && this.el.contains( item.el ) )
				return item;
			return item.render( this[this.$_items] );
		},
		renderItems : function() {
			!this.items.length || this.items.map( this.renderItem, this );
		}
	} );



/*~  src/mixins/Validation.js  ~*/

	define( namespace( 'mixins.Validation' ), {
// class configuration
		extend         : Object,
		module         : __lib__,

// instance configuration
		allowDecimals  : true,
		max            : Number.POSITIVE_INFINITY,
		min            : Number.NEGATIVE_INFINITY,
		pattern        : null,
		required       : false,

// public methods
		isValid        : function( value ) {
			return __lib__.Validate[this.inputType].valid( this, value );
		},
		validate       : function( silent ) {
			var value = this.value,
				valid = this.isValid( value ) && this.onValidate( value );

			silent === true || this.broadcast( 'validate' ).broadcast( ( valid ? '' : 'in' ) + 'valid' );

			if ( this.interactive ) {
				this.$el.removeClass( this.clsValid ).removeClass( this.clsInvalid );
				if ( silent !== true )
					this.$el.addClass( this['cls' + ( valid ? 'Valid' : 'Invalid' )] );
				else
					this.$elField.val() != '' || this.$el.addClass( this['cls' + ( valid ? 'Valid' : 'Invalid' )] );
			}

			return valid;
		},
// stub overwrite methods
		onValidate     : function( value ) {
			return this.required !== true || __lib__.Validate[this.inputType].minmax( this, value );
		},
// internal methods

		init           : function() {
		},
		registerEvents : function() {
			this.observe( 'change', 'validate', this );
		}
	} );



/*~  src/layout/Layout.js  ~*/

	define( namespace( 'layout.Layout' ), {
// class configuartion
		constructor      : function Layout( config ) {
			util.copy( this, config || {} );

			this.afterLayout_ = this.afterLayout.callback( { ctx : this, delay : 50 } );

			if ( this.cmp.rendered )
				this.init();
			else
				this.cmp.once( 'after:render', 'init', this );
		},
		extend           : Object,
// instance configuration
// accessors
// public properties
		$el              : null,
		cmp              : null,
		disabled         : false,
		el               : false,
		items            : null,
// internal properties
		slcItem          : null,
// public methods
		disable          : function() {
			this.disabled = true;
		},
		enable           : function() {
			this.disabled = false;
		},
		forceLayout       : function() {
			this.busy = false;
			this.layout( true );
		},
		layout           : function( force ) {
			force = force === true;

			if ( this.cmp && this.cmp.rendered && !this.el ) this.init();

			if ( this.disabled || this.busy ) return;

			if ( this.refresh( force ).beforeLayout( force ) === false ) {
				this.busy = false;
				return;
			}

			this.onLayout( force )
				.afterLayout_( force );

			return;
		},
// stub method over-writes
		afterLayout      : function( force ) {
			this.busy = false;
		},
		beforeLayout     : function( force ) {
			this.busy = true;
		},
		onLayout         : function( force ) { },
		refresh          : function( force ) { },
		sync             : function() { },
// internal methods
		init             : function() {
			var cmp = this.cmp,
				el  = cmp.el;

			this.$el      = cmp.$el;
			this.el       = el;
			this.slcItem  = cmp.slcItem;

			this.elOffset = /absolute|relative/.test( global.getComputedStyle( el, null ).position )
						   ? el
						   : el.offsetParent;

			cmp.observe( {
				'change:dom' : 'forceLayout',
				 ctx         :  this,
				 options     : { delay : 200 }
			} );

			!cmp.rendered || !cmp.active || this.layout();
		}
	} );



/*~  src/Component.js  ~*/

	define( namespace( 'Component' ), {
// class configuration
		constructor     : function Component( config ) {
			this.parent( arguments )
				.mixin( 'observer', [this.__config__.observers] )
				.mixin( 'processor' )
				.registerEvents();
		},
		extend          : lib.Source,
		mixins          : {
			clslc       : Name + '.mixins.ClsSlc',
//			dataview    : Name + '.mixins.DataView',
			observer    : 'Observer',
			processor   : Name + '.mixins.DataProcessor',
			domrefs     : Name + '.mixins.DOMRefs',
			renderer    : Name + '.mixins.Renderer'
		},
		module          : __lib__,
// instance configuration
		autoLoad        :  true,
		bound           :  null,
		cls             :  null,
		clsAnim         : 'w-anim',
		clsBase         : 'w-cmp',
		clsDefault      : 'w-cmp',
		focusable       :  true,
		html            :  null,
		layout          :  null,
		slcFocus        :  null,
		tagName         : 'div',
		updateTarget    : '$elCt',
// accessors
		collapsed       : {
			get : function() {
				return this.ready && this.$el.hasClass( this.clsCollapsed );
			},
			set : function( val ) {
				val = !!val;

				if ( this.collapsed !== val )
					this[val ? 'collapse' : 'expand']();

				return val;
			}
		},
		visible         : {
			get : function() {
				return this.ready && !( this.$el.hasClass( this.clsHidden ) || !this.$el.displayed() );
			},
			set : function( val ) {
				val = !!val;

				if ( this.visible !== val )
					this[val ? 'show' : 'hide']();

				return val;
			}
		},
// flags
		active          : null,
		focused         : false,
		disabled        : false,
		interactive     : { get : function() {
			return this.ready && this.visible && !this.disabled;// && ( !this.parentBox || this.parentBox.interactive );
		} },
// properties
		id              : null,
// public methods
		activate        : function() {
			this.active === true || !this.interactive || this.broadcast( 'before:activate' ) === false || this.onActivate().broadcast( 'activate' );
		},
		append          : function( data, tpl ) {
			if ( this.dead ) return;
			if ( !this.rendered ) this.render();
			data === UNDEF || this.disabled || this.broadcast( 'before:append', data, tpl ) === false || this.onAppend( data, tpl || this.tplContent );
		},
		blur            : function( evt ) {
			!this.interactive || this.focusable === false || !this.focused || this.broadcast( 'before:blur', evt ) === false || this.onBlur().broadcast( 'blur', evt );
		},
		collapse        : function() {
			 this.collapsed || !this.interactive || this.broadcast( 'before:collapse' ) === false || this.onCollapse().broadcast( 'collapse' );
		},
		deactivate      : function() {
			this.active === false || !this.interactive || this.broadcast( 'before:deactivate' ) === false || this.onDeactivate().broadcast( 'deactivate' );
		},
		destroy         : function() {
			!this.interactive || this.mixin( 'observer' );
		},
		disable         : function() {
			 this.disabled || this.broadcast( 'before:disable' ) === false || this.onDisable().broadcast( 'disable' );
		},
		enable          : function() {
			!this.disabled || this.broadcast( 'before:enable'  ) === false || this.onEnable().broadcast( 'enable' );
		},
		expand          : function() {
			!this.collapsed || !this.interactive || this.broadcast( 'before:expand' ) === false || this.onExpand().broadcast( 'expand' );
		},
		focus           : function( evt ) {
			!this.interactive || this.focusable === false || this.focused || this.broadcast( 'before:focus', evt ) === false || this.onFocus().broadcast( 'focus', evt );
		},
		hide            : function() {
			if ( !this.rendered ) this.render();
			!this.visible || !this.interactive || this.broadcast( 'before:hide' ) === false || this.onHide();
		},
		load            : function( config ) {
			this.suspendApply || ++this.suspendApply;

			if ( this.disabled || this.broadcast( 'before:load', config ) === false ) return;

			this.store.fetch( config );

			this.broadcast( 'load:start', config );
		},
		loadAppend      : function( config ) {
			this.suspendApply || ++this.suspendApply;

			if ( this.disabled || this.broadcast( 'before:load', config ) === false ) return;

			this.store.fetch( config, { append : true } );

			this.broadcast( 'load:start', config );
		},
		refreshView     : function( store, options ) {
			!this.suspendApply || --this.suspendApply;
			this.applySelectors();
			if ( this.store ) {
				this[is_obj( options ) && options.append === true ? 'append' : 'update']( this.store.toJSON() );
//				this.replaceCached().updateBindings();
				this.store.findAll( function( node ) {
					return !this.has( node.id );
				}, this.store.view ).invoke( 'getBoundEl', this ).invoke( 'remove' );
			}
		},
		replaceCached   : function() {
			!this.bound || this[this.updateTarget].find( '.replace-cached' ).map( this._replaceCached, this );
		},
		show            : function() {
			if ( !this.rendered ) this.render();
			!this.ready || this.visible || this.broadcast( 'before:show' ) === false || this.onShow();
		},
		update          : function( data, tpl ) {
			if ( this.dead ) return;
			if ( !this.rendered ) this.render();
			if ( this.suspendUpdate ) return;
			if ( ( !data || data === this ) && this.store )
				data = this.store;
			data === UNDEF || this.disabled || this.broadcast( 'before:update', data, tpl ) === false || this.onUpdate( data, tpl || this.tplContent );
		},
		updateBindings  : function() {
			this.store.bindView( this );
			this.bound = this.store.data.aggregate( this.bound || util.obj(), this._updateBindings, this );
		},
// stub methods
		afterActivate   : function() { this.broadcast( 'after:activate' ); },
		afterAppend     : function() {
			this[this.updateTarget].find( '.replace-cached' ).remove();
			!this.store  || this.replaceCached().updateBindings();
//			!this.layout || this.layout.layout();
			this.broadcast( 'append' ).broadcast( 'change:dom' );
		},
		afterCollapse   : function() { this.broadcast( 'after:collapse' ); },
		afterDeactivate : function() { this.broadcast( 'after:deactivate' ); },
		afterExpand     : function() { this.broadcast( 'after:expand' ); },
		afterHide       : function() { this.broadcast( 'after:hide' ); },
		afterShow       : function() { this.broadcast( 'after:show' ); },
		afterUpdate     : function() {
			!this.store  || this.replaceCached().updateBindings();
//			!this.layout || this.layout.layout();
			 this.broadcast( 'update' ).broadcast( 'change:dom' );
		},
		afterTransition : function() {
			typeof this[this.afterEvent] != 'function' || this[this.afterEvent]();
			delete this.afterEvent;
		},
		onActivate      : function() {
			this.afterEvent = 'afterActivate';
			this.active     = true;
			this.$el.addClass( this.clsActive );
		},
		onAppend        : function( data, tpl ) {
			var frag = this.prepareFragment( data, tpl );
			!frag || this.mixin( 'renderer', [frag] ).afterAppend();
		},
		onBlur          : function() {
			 this.focused = false;
			 this.$el.removeClass( this.clsFocused );
			!this.elFocus || this.elFocus.blur();
		},
		onCollapse      : function() {
			if ( !this.ready ) return;
			this.afterEvent = 'afterCollapse';
			this.$el.addClass( this.clsCollapsed );
		},
		onDeactivate    : function() {
			this.afterEvent = 'afterDeactivate';
			this.active     = false;
			this.$el.removeClass( this.clsActive );
		},
		onDestroy       : function() {
			uncache( this );
			this.mixin( 'renderer' );
		},
		onDisable       : function() {
			 this.disabled = true;
			!this.ready || this.$el.addClass( this.clsDisabled );
		},
		onEnable        : function() {
			 this.disabled = false;
			!this.ready || this.$el.removeClass( this.clsDisabled );
		},
		onExpand        : function() {
			if ( !this.ready ) return;
			this.afterEvent = 'afterExpand';
			this.$el.removeClass( this.clsCollapsed );
		},
		onFocus         : function() {
			 this.focused = true;
			 this.$el.addClass( this.clsFocused );
			!this.elFocus || this.elFocus.focus();
		},
		onHide          : function() {
			this.afterEvent = 'afterHide';
			this.$el.addClass( this.clsHidden );
		},
		onRender        : function() {
//			this.$el.on( api.event.transitionend, this.afterTransition_ );
			if ( this.store ) {
				if ( this.store.size )
					this.once( 'after:render', this.update, this );
				else if ( this.autoLoad !== false )
					this.load();
			}

			 this.mixin( 'renderer' );

			!this.disabled || this.disable();

			if ( this.hidden === true ) {
				this.hide();
				delete this.hidden;
			}
		},
		onShow          : function() {
			this.afterEvent = 'afterShow';
			this.$el.removeClass( this.clsHidden );
		},
		onUpdate        : function( data, tpl ) {
			var frag = this.prepareFragment( data, tpl );
			!frag || this.mixin( 'renderer', [frag] ).afterUpdate();
		},
		registerEvents  : function() {
			this.mixin( 'dataview' )
				.mixin( 'domrefs' );

			this.once( 'before:render', 'initLayout', this );

			!this.store || this.store.observe( {
				'change:data' : 'refreshView',
				'change:view' : 'refreshView',
				 ctx          :  this
			} );
		},
// internal methods,
		_replaceCached  : function( replacer ) {
			var id  = replacer.getAttribute( 'data-replace-id' ),
				elp = replacer.parentNode,
				el  = this.bound[id],
				data;

			if ( el ) {
				data = api.$( replacer ).data();
				delete data.replaceId;
				elp.replaceChild( el.data( data )[0], replacer );
			}
			else // just to play it safe
				elp.removeChild( replacer );
		},
		_updateBindings : function( bound, node, id ) {
			var el = node.getBoundEl( this.id );

			if ( el ) bound[id] = el;

			return bound;
		},
		init            : function() {
			this.parent()
				.mixin( 'clslc' )
				.mixin( 'dataview' )
				.mixin( 'domrefs' )
				.mixin( 'renderer' )
				.initStore();

			if ( this.tplContent )
				this.tplContent = api.tpl.create( this.tplContent ) || null;

			if ( !this.updateTarget )
				this.updateTarget = '$elCt';

			Mgr.include( this );
		},
		initConfig      : function( config ) {
			config = this.parent( arguments );

			this.id = this.id || config.id || this.clsBase + '-' + ( ++getClass( util.type( this ) ).count );

			delete config.id;

			return config;
		},
		initLayout      : function() {
			if ( this.layout instanceof getClass( 'layout.Layout' ) ) return;

			switch ( util.type( this.layout ) ) {
				case 'string' :
					var Layout = getClass( this.layout );

					if ( Layout.prototype instanceof getClass( 'layout.Layout' ) )
						this.layout = Layout.create( { cmp : this } );

					break;
				case 'object' :
					this.layout.cmp = this;
					this.layout     = create( this.layout );

					break;
				default       : this.layout = null;
			}
		},
		initStore       : function() {
			var s = this.store;                  // noinspection FallthroughInSwitchStatementJS
			switch ( util.type( s ) ) {
				case 'string'     :
				case 'function'   :
					s = lookupStore( s );
					if ( s ) this.store = new s;
					break;
				case 'object'     :
					this.store = s instanceof getClass( 'data.Collection' ) ? s : widgie.create( 'data.Collection', s );
			}
		},
		onAction        : function( action, evt ) {
			if ( typeof this[action] == 'function' )
				this[action]( evt );
		},
		syncSize        : function() {}
	} );

	getClass( 'Component' ).count = 999;

	util.defs( __lib__, {
		Mgr : { value : ( Mgr = lib( Name + '.TypedHash', { Type : __lib__.Component } ) ) },
		get : Mgr.get.bind( Mgr )
	}, 'r' );



/*~  src/Box.js  ~*/

	define( namespace( 'Box' ), {
		constructor   : function Box( config ) {
			this.parent( arguments )
				.initItems( this.items );
		},
// class configuration
		extend        : namespace( 'Component' ),
		mixins        : {
			dataview  : util.obj(),
			renderer  : Name + '.mixins.BoxRenderer'
		},
		module        : __lib__,
// instance configuration
		$_items       : '$elCt',
		clsBase       : 'w-box',
		tpl           : Name + '.box',
// public methods
		add           : function( item ) {
			if ( arguments.length > 1 && isNaN( arguments[1] ) )
				item = Array.coerce( arguments );

			if ( Array.isArray( item ) ) {
				this.suspendEvents();
				item = item.map( this.add, this );
				this.resumeEvents().broadcast( 'add', item );
				return item;
			}

			if ( this.broadcast( 'before:add', item ) !== false ) {
				if ( item = this.onAdd( item ) ) {
					this.broadcast( 'add', item );
					return item;
				}
			}
			return null;
		},
		clear         : function( silent ) {
			if ( !this.items.length || !this.ready || this.disabled || this.broadcast( 'before:clear' ) === false )
				return;

			if ( silent === true )
				this.suspendEvents();

			this.onClear().resumeEvents().broadcast( 'clear' );
		},
		contains      : function( item ) {
			item = this.get( item );
			return item && item.parentBox === this;
		},
		get           : function( item ) {
//if ( typeof item == 'string' && item.indexOf( 'box' ) > -1 ) debugger;
			if ( item !== null && item !== UNDEF && this.items.length )  // noinspection FallthroughInSwitchStatementJS
				switch ( util.type( item ) ) {
					case 'event'     : item = item.currentTarget;                          // allow fall-through
					case 'element[]' : case 'htmlelement' : item = api.$( item ).data( 'id' ); // allow fall-through
					case 'number'    : case 'string'      : return this.items[item] || this.map[item] || this.map[this.id + '-' + item] || null;
					default          : return 'id' in item || 'cmpId' in item ? this.get( item.id ) || this.get( this.id + '-' + item.cmpId ) : null;
				}
			return null;
		},
		insert        : function( index, item ) {
			if ( this.broadcast( 'before:add', item, index ) === false ) return null;

			item = this.onAdd( item, index );

			this.broadcast( 'add', item );

			return item;
		},
		loadItems     : function( items, append ) {
			if ( typeof items == 'string' )
				 items = { url : items };

			items.success = this.onLoadItems.bind( this, append );

			if ( this.disabled || this.broadcast( 'before:load:items', items ) === false ) return;

			this.broadcast( 'load:items:start', api.xhr( items ) );
		},
		remove        : function( item, destroy ) {
			if ( !item || !( item = this.get( item ) ) || this.broadcast( 'before:remove', item ) === false )
				return null;

			this.onRemove( item );

			destroy !== true || item.dead || item.destroy();

			this.broadcast( 'remove', item );
		},
// stub methods
		onAdd         : function( item, index ) {
			var existing = this.get( item );

			!existing || !item.parentBox || item.parentBox.remove( existing );

			if ( item = this.lookup( item ) ) {
				this.adopt( item, index );

				item.observe( 'destroy', 'onRemove', this );

				return item;
			}

			return null;
		},
		onClear       : function() {
			while ( this.items.length )
				this.remove( this.items[0], true );
		},
		onRemove      : function( item ) {
			util.remove( this.items, item );

			delete this.map[item.id];

			this.mixin( 'renderer', arguments );

			if ( item.parentBox === this )
				delete item.parentBox;
		},
		onRender      : function() {
			this.parent();

//			!this.tb || this.tb.render( this.$el );
//			!this.fb || this.fb.render( this.$el );
		},
// internal methods
		adopt         : function( item, index ) {
			var insert        = util.type( index ) == 'number';
			this.map[item.id] = item;

			!item.parentBox || item.parentBox.remove( item, false );

			item.parentBox = this;

			this.mixin( 'renderer', [item, insert, index] );

			if ( insert )
				this.items.splice( index, 0, item );
			else
				this.items.push( item );
		},
		applyDefaults : function( item ) {
			return util.copy( item, this.defaults, true );
		},
		init          : function() {
			this.parent();

			if ( !is_obj( this.defaults ) )
				this.defaults = {};

//			if ( this.fb && !lib.is( this.fb, 'w.toolbar' ) )
//				this.fb = lib( 'w.toolbar', this.fb );
//			if ( this.tb && !lib.is( this.tb, 'w.toolbar' ) )
//				this.tb = lib( 'w.toolbar', this.tb );
		},
		initItems     : function( items ) {
			this.items = [];
			this.map   = util.obj();

			switch ( util.ntype( items ) ) {
				case 'array'  : this.add( items );              break;
				case 'string' :
				case 'object' : this.loadItems( items, false ); break;
			}
		},
		lookup        : function( item ) {
			if ( typeof item == 'string' )
				item = Mgr.get( item );

			if ( is_obj( item ) && !item.id && item.cmpId )
				item.id = this.id + '-' + item.cmpId;

			if ( !is_obj( item ) )
				error( {
					cmp     : this,
					item    : item,
					message : 'Incorrect Type: cannot add item - ' + JSON.stringify( item ) + ' – to ' + this.id,
					method  : 'lookup',
					name    : error.code.BOX_ITEM_LOOKUP
				} );

			return lib.is( this.applyDefaults( item ), Name + '.Component' ) ? item : create( item );
		},
		onLoadItems   : function( append, items ) {
			append === true || this.clear( true );

			!( !Array.isArray( items ) || !is_obj( items ) ) || this.add( items );

			this.broadcast( 'load:items:complete' );
		}
	} );

	getClass( 'Box' ).count = 999;



/*~  src/Form.js  ~*/

	define( namespace( 'Form' ), function() {
		function toJSON( val, field ) {
			val[field.name || field.cmpId || field.id] = field.value;

			return val;
		}

		function toFormData( fd, field ) {
			fd.append( field.name, field.value );

			return fd;
		}

		return {
// class configuration
			constructor    : function Form() {
				this.parent( arguments );
			},
			extend       : Name + '.Box',
			module       : __lib__,
// instance configuration
			async        : true,
			clsBase      : 'w-form',
			clsDefault   : 'w-form',
			proxy        : null,
			upload       : false,
// accessors
			valid        : { get : function() {
				return this.fields.pluck( 'valid' ).every( util );
			} },
			value        : { get : function() {
				return this.fields.reduce( this.upload === true ? toFormData : toJSON, this.upload === true ? new FormData() : util.obj()  );
			} },
// public properties
// internal properties

// public methods
			reset        : function() {
				!this.interactive || this.broadcast( 'before:reset' ) === false || this.onReset().broadcast( 'reset' );
			},
			submit       : function() {
				if ( !this.interactive ) return;

				var valid = this.valid;

				if ( !valid ) {
					this.onInvalid();
					return;
				}

				this.onValid().broadcast( 'before:submit' ) === false || this.onSubmit().broadcast( 'submit' );
			},
// stub overwrite methods
			afterRender  : function() {
				this.parent( arguments );

				addDOMListener( this.$el, 'keyup', this.id + '::onKeyPress' );

				if ( this.async === false && this.proxy ) {
					this.$el.attr( {
						 action       : this.proxy.urlBase,
						 method       : this.proxy.method
					} );
					addDOMListener( this.$el, 'submit', this.id + '::handleSubmit' );
					if ( this.upload === true )
						this.$el.attr( 'enctype', 'multipart/form-data' );
				}
			},
			onAdd        : function( item ) {
				if ( item = this.parent( arguments ) ) {
					if ( item instanceof getClass( 'Field' ) )
						this.fields.push( item.observe( 'dom:blur', this.onTab, this ) );
						item.relayEvents( this, 'change', 'validate' );
				}
			},
			onChange     : function() { },
			onInvalid    : function() {
				this.$el.removeClass( this.clsValid ).addClass( this.clsInvalid );
			},
			onLoad       : function() {
				console.log( 'load: ', this, arguments );
			},
			onLoadError  : function() {
				console.log( 'loadend: ', this, arguments );
			},
			onLoadStart  : function() {
				console.log( 'loadstart: ', this, arguments );
			},
			onRemove     : function( item ) {
				if ( item.parentBox === this )
					util.remove( this.fields, item );

				this.parent( arguments );
			},
			onReset      : function() {
				this.$el.removeClass( this.clsInvalid ).removeClass( this.clsValid );
				this.fields.invoke( 'reset' );
			},
			onSubmit     : function() {
				if ( this.async === false )
					this.el.submit();
				else if ( this.proxy )
					this.proxy.load( this.value );
			},
			onTab        : function( field, evt ) {
				if ( !evt ) return;

				var i = this.fields.indexOf( field );

				if ( !~i ) return;

				i = i + ( evt.shiftKey === true ? -1 : 1 );

				!this.fields[i] || this.fields[i].focus();
			},
			onValid      : function() {
				this.$el.removeClass( this.clsInvalid ).addClass( this.clsValid );
			},
			onValidate   : function() { },
// dom event listener methods
			handleSubmit : function( evt ) {
				if ( this.async !== false || !this.valid )
					evt.stop( '11' );
			},
			onKeyPress   : function( evt ) {
				var kc = api.$.event.KEY_CODE;

				if ( evt.which === kc.ENTER || evt.which === kc.RETURN )
					this.submit();
			},
// internal methods
			init         : function() {
				this.clsList += ' invalid valid';
				this.fields   = [];

				if ( this.async === false )
					this.tagName = 'form';

				this.parent( arguments ).initProxy();
			},
			initProxy    : function() {
				if ( typeof this.proxy == 'string' )
					this.proxy  = { urlBase : this.proxy };

				if ( this.proxy = lookupProxy( this.proxy ) )
					this.proxy.observe( {
						error     : 'onLoadError', load    : 'onLoad',
						loadstart : 'onLoadStart', timeout : 'onLoadError',
						ctx       : this
					} );
			},
			registerEvents : function() {
				this.parent( arguments ).observe( {
					change   : 'onChange',
					validate : 'onValidate',
					ctx      : this
				} );
			}
		};
	}() );



/*~  src/Field.js  ~*/

	define( namespace( 'Field' ), function() {
		return {
			constructor    : function Field() {
				this.parent( arguments );
			},
			extend         : Name + '.Component',
			mixins         : {
				validation : Name + '.mixins.Validation'
			},
			module         : __lib__,
// instance configuration
			clsBase        : 'w-field',
			errorMsg       : null,
			format         : null,
			inputType      : null,
			multiLine      : false,
			name           : null,
			toolTip        : null,
			tpl            : Name_lc + '.field',
			watchInterval  : 10,
// accessors
			label          : {
				get        : function() {
					return cached( this ).label;
				},
				set        : function( label ) {
					cached( this ).label = label;

					if ( this.ready )
						this.$elLabel.html( cached( this ).label );

					return this.label;
				}
			},
			valid          : { get : function() {
				return this.validate( true );
			} },
			value          : {
				get        : function() {
					return cached( this ).value;
				},
				set        : function( raw ) {
					var c = cached( this ),
						v = this.rawToVal( raw ),
						r = this.valToRaw( v );

					if ( util.empty( raw ) && !util.empty( c.value ) ) {
						c.val_prev = c.value;
						c.value    = UNDEF;

						this.broadcast( 'change', c.value, c.val_prev );
					}
					else if ( v !== c.value ) {
						if ( this.isValid( v ) ) {
							c.val_prev = c.value;
							c.value    = v;

							if ( this.ready ) {
								this.inputType == 'file' || this.$elField.val( this.valToRaw( v ) );
								this.broadcast( 'change', v, c.val_prev );
							}

						}
						else {
							if ( this.ready ) {
								this.inputType == 'file' || this.$elField.val( this.valToRaw( c.value ) );
								this.broadcast( 'change', c.value, c.val_prev );
							}
						}
					}

					return c.value;
				}
			},
// public properties
// internal properties
			_iid           : null,
			_inputType     : null,
			$elField       : null,
			$elLabel       : null,
			elField        : null,
			elLabel        : null,
// public methods
			clear          : function() {
				!this.interactive || this.broadcast( 'before:clear' ) === false || this.onClear().broadcast( 'clear' );
			},
			reset          : function() {
				!this.interactive || this.broadcast( 'before:reset' ) === false || this.onReset().broadcast( 'reset' );
			},
			rawToVal       : function( val ) {
				return __lib__.Validate[this.inputType].val( this, val );
			},
			valToRaw       : function( val ) {
				return __lib__.Validate[this.inputType].raw( this, val );
			},
// stub overwrite methods
			afterRender    : function() {
				this.parent( arguments );
				this.$elField.val( this.value );
				switch ( this.inputType ) {
					case 'checkbox' : case 'radio' :
						addDOMListener( this.elField, 'click', this.id + '::onFocus' );
						break;
					case 'file'     : addDOMListener( this.elField, 'change', this.id + '::handleChange' );
				}
			},
			onBlur         : function() {
				this.parent( arguments ).watchStop().validate();
			},
			onClear        : function() {
				this.$elField.val( '' );
				this.handleChange();
			},
			onFocus        : function() {
				this.parent( arguments ).watchStart().validate();
			},
			onReset        : function() {
				this.$elField.val( cached( this ).val_initial );
				this.handleChange();
			},
// dom event listener methods
			handleBlur     : function( evt ) {
				!evt || evt.target !== this.elFocus || this.broadcast( 'dom:blur', evt );
			},
			handleChange   : function() {
				var val = this.$elField.val();
				this.value = this.inputType == 'file' && util.ntype( val ) == 'filelist' ? val[0] : val;
			},
			handleFocus    : function( evt ) {
				!evt || evt.target !== this.elFocus || this.broadcast( 'dom:focus', evt );
			},
// internal methods
			init           : function() {
				this.clsList      += ' invalid valid';
				this.slcFocus      = '.' + this.clsBase + '-input';

				this.name          = this.name || this.cmpId || this.id;

				this.handleChange_ = this.handleChange.bind( this );

				if ( this.inputType === 'date' && !this.format )
					this.format = 'c';

				this._inputType = this.inputType === 'number' ? 'text' : this.inputType;

				this.parent( arguments ).mixin( 'validation' );

				var c = cached( this );

				c.val_initial = this.value;
			},
			registerEvents : function() {
				this.parent( arguments ).mixin( 'validation', arguments );
			},
			watchStart     : function() {
				if ( this._iid !== null ) return;

				this._iid = setInterval( this.handleChange_, this.watchInterval );

				this.handleChange();
			},
			watchStop      : function() {
				if ( this._iid === null ) return;

				clearInterval( this._iid ); this._iid = null;

				this.handleChange();
			}
		};
	}() );



/*~  src/Error.js  ~*/

	lib.define( namespace( 'Error' ), function() {
		return {
			constructor : function CustomError( config ) {
				if ( !is_obj( config ) )
					config = typeof config == 'string' ? { message : config } : {};

				util.copy( this, config );

				this.trace().parent();
			},
			extend      : Error,
			module      : __lib__,
			name        : capitalize( Name ) + 'Error',
			toString    : function() { return this.message; },
			trace       : Error.caputureStackTrace ? function() { //noinspection FallthroughInSwitchStatementJS
				switch ( typeof this.method ) {
					case 'string'   : if ( !this.cmp || typeof this.cmp[this.method] != 'function' ) break;
									  this.method = this.cmp[this.method];
					case 'function' : Error.captureStackTrace( this, this.method );        break;
				}
			} : util.noop
		}
	}() );

	function error( e ) {
		if ( 'type' in Object( e ) ) {
			if ( util.has( error.code, e.type ) )
				e.name = error.code[e.type];
			delete e.type;
		}

		e = lib( namespace( 'Error' ), e );

		if ( __lib__.debug )
			throw e;
		else
			console.log( e );

		return e;
	}

	error.code = {
		BOX_ITEM_LOOKUP       : 'BoxItemLookupError'
	};



/*~  src/bootstrap.js  ~*/

;!function() {
	if ( util.ENV == 'browser' ) {
//		api.$( global ).on( 'resize', '[data-]', handleCapture );

		var events_bubble  = [
				'blur', 'focus', 'resize', /*'scroll',*/ 'click', 'dblclick',
				'change', 'select', 'submit', 'keydown', 'keypress', 'keyup',
//				'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
				'animationend', 'animationiteration', 'animationstart', 'transitionend'
			],
			events_capture = [
				'orientationchange', 'resize'
			];

		 if ( ua.desktop )
		 	events_bubble.push( 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup' );

		 events_bubble.map( function( event ) {
			this.on( event, '[data-' + event + ']', handleBubble );
		}, api.$( doc ) );

		events_capture.map( function( event ) {
			this.on( event, '[data-' + event + ']', handleCapture );
		}, api.$( global ).on( 'scroll' , '[data-scroll]', handleBubble ) );
	}
}();



/*~  src/Viewport.js  ~*/

//	Viewport = lib.Class( {
//		constructor : function Viewport() {
//			this.parent( arguments );
//		},
//		extend      : namespace( 'Box' )//,
//		module      : __lib__,
//		singleton   : {
//			clsBase : 'w-viewport',
//			$ct     : api.$( doc.documentElement ),
//			ct      : doc.documentElement ,
//			id      : 'viewport'
//		},
//		$_items     : '$el'
//	} );

	api.$.ready( function() {
		var vp = create( namespace( 'Box' ), {
			$_items : '$el',
			clsBase : 'w-viewport',
			$ct     : api.$( doc.documentElement ),
			ct      : doc.documentElement,
			id      : 'viewport'
		} );

		vp.$el      = api.$( vp.el   = doc.body );
		vp.rendered = true;

		vp.$el.addClass( vp.clsBase ).attr( 'id', vp.id );
//		vp.$elCt = api.$.toElement( '<div class="w-viewport-ct"></div>' );
//		vp.$elCt.appendTo( vp.el );

// goddamn chrome v26 is intermittently doing some weird shizzle, so need to remove singletons for now
		util.def( __lib__, 'Viewport', { value : vp }, 'cw' );

		vp.broadcast( 'viewport:ready' );
	} );




// at this point we don't know if id8 is available or not, and as such do not know what environment we are in.
// so, we check and do what is required.
}( ( typeof id8 != 'undefined' ? id8 : typeof require != 'undefined' ? require( 'id8' ) : null ), 'widgie' );
