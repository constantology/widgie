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

		return function xhr( options ) {
			var data, hd, method, req = new XMLHttpRequest();

			req._options    = options;
			data            = options.data;
			options.headers = hd = util.copy( options.headers || util.obj(), headers, true );
			method          = options.method;
			method          = method ? method.toUpperCase() : 'GET';

			req.addEventListener( 'error', req._onerror = onerror.bind( req ), true );
			req.addEventListener( 'load',  req._onload  = onload.bind( req ), true );

			req.open( method, options.url, true );

			if ( POSTISH.test( method ) && hd['Content-Type'] === headers['Content-Type'] && options.sendJSON !== true )
				hd['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

			!req.overrideMimeType || req.overrideMimeType( hd['Content-Type'] );

			Object.reduce( options.headers, setHeader, req );

//			req.responseType = 'json';   // noinspection FallthroughInSwitchStatementJS
			switch ( util.ntype( data ) ) {
				case 'string'   :
				case 'formdata' :                                                  break;
				case 'array'    :
				case 'object'   : data = options.sendJSON === true
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

			delete req._onerror; delete req._onload; delete req._options;

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
				case 'xml'         : return is_str( req.response ) ? req.responseXML : req.response;
				case 'text'        :
				case ''            : return req.responseText;
			}

			return tryAndParse( req );
		}

		function onabort( evt ) {
			var options = this._options;

			!is_fun( options.abort ) || options.abort( cleanup( this ), options );
		}

		function onerror( evt ) {
			var req     = this,
				options = req._options;

			!is_fun( options.error ) || options.error( data( req ), req.status, cleanup( req ), options );
		}

		function onload( evt ) {
			var req     = this,
				options = req._options;

			!is_fun( options.success ) || options.success( data( req ), req.status, cleanup( req ), options );
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
