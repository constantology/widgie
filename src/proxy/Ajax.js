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
