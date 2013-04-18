	define( namespace( 'proxy.Ajax' ), function () {
		function onAbort( xhr, status, err ) {
			 this.loading = false;
			!this.interactive || status == 'abort'   || this.onReqAbort( xhr, status, err ).broadcast( 'error', err, status, xhr );
		}

		function onError ( xhr, status, err ) {
			 this.loading = false;
			!this.interactive || this.onReqError( xhr, status, err ).broadcast( 'error', err, status, xhr );
		}

		function onLoad ( data, status, xhr ) {
			 this.loading = false;
			!this.interactive || typeof data !== 'object' || this.onReqLoad( data, status, xhr ).broadcast( 'load', data, status, xhr );
		}

		function onTimeout() {
			this.loading = false;
			this.current.abort();
			this.onReqTimeout( this.current ).broadcast( 'timeout', this.current );
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
			tid            : null,

// public methods
			abort          : function( silent ) {
				!this.current   || this.current.abort();
				silent === true || this.broadcast( 'abort', this.current );
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
			load           : function ( data, method ) {
				if ( !method || typeof method != 'string' )
					method = this.method || 'GET';

				method = method.toUpperCase();

				/*if ( !navigator.onLine )
					this.broadcast( 'error:	offline' );

				else*/ if ( this.interactive && this.broadcast( 'before:load', data, method ) !== false )
					this.onLoadStart( this.createUrl( data = this.prepareData( data ) ), method, data );
			},
			reload         : function() {
				if ( this.lastOptions && this.interactive && this.broadcast( 'before:reload' ) !== false )
					this.doRequest( this.lastOptions );
			},
// stub overwrite methods
			onReqAbort     : function() {},
			onReqError     : function() {},
			onReqLoad      : function() {},
			onReqTimeout   : function() {},
// internal methods
			createUrl      : function ( params ) {
				return this.urlBase;
			},
			doRequest      : function( transport ) {
				this.lastOptions = transport;
				this.loading     = true;
				this.current     = api.xhr( transport );
				this.tid         = setTimeout( this.onTimeout, this.timeout );

				this.broadcast( 'loadstart' );

				return this.current;
			},
			initTransport  : function( url, method, data ) {
				var transport = {
					error   : this.onError,
					headers : this.headers,
					method  : method || this.method,
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
			onLoadStart     : function( url, method, data ) {
				return this.doRequest( this.initTransport.apply( this, arguments ) );
			},
// constructor methods
			init            : function () {
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
