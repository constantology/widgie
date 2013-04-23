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
					method : 'POST',
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
			create         : function( data, options ) {
				this.onAPICall( 'create', data, options );
			},
			delete         : function( data, options ) {
				this.onAPICall( 'delete', data, options );
			},
			read           : function( data, options ) {
				this.onAPICall( 'read', data, options );
			},
			update         : function( data, options ) {
				this.onAPICall( 'update', data, options );
			},
// stub overwrite methods
			onAPICall      : function( command, data, options ) {
				var api = this.api[command];
				if ( api && this.interactive && this.broadcast( 'before:' + command, data, options ) !== false )
					this.onLoadStart( api.url, api.method, data = this.prepareData( data, api ), options, command );
			},
			onReqAbort     : function( xhr, options ) {
				this.broadcast( 'abort:' + options.type, xhr, status, err );
			},
			onReqError     : function( xhr, status, err, options ) {
				this.broadcast( 'error:' + options.type, xhr, status, err );
			},
			onReqLoad      : function( data, status, xhr, options ) {
				this.broadcast( options.type, data, status, xhr );
			},
			onLoadStart     : function( url, method, data, options, command ) {
				return this.parent( url, method, data, options, command || 'read' );
			},
// internal methods
			initTransport  : function( url, method, data, type ) {
				var transport = this.parent( arguments );

				transport.type = type;

				return transport;
			},
			prepareData     : function( data, api ) {
				return is_fun( api.data ) ? api.data( data ) : data;
			},
// constructor methods
			init            : function() {
				this.parent( arguments ).initAPI();
			},
			initAPI         : function() {
				if ( !is_obj( this.api ) )
					this.api = util.obj();

				Object.reduce( default_api, this.initAPIMethod, this );
			},
			initAPIMethod   : function( ctx, config, command ) {
				var api = ctx.api, cmd;

				if ( command in api ) {
					cmd = api[command];

					if ( is_str( cmd ) )
						cmd = { url : cmd };

					if ( is_str( ctx.urlBase ) && is_str( cmd.url ) )
						cmd.url = ctx.urlBase + ( cmd.url.indexOf( '/' ) === 0 ? '' : '/' ) + cmd.url;

					api[command] = util.update( cmd, config );
				}

				return ctx;
			}
		};
	}() );