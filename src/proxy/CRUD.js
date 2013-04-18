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
			create         : function( data ) {
				this.onAPICall( 'create', data );
			},
			delete         : function( data ) {
				this.onAPICall( 'read', data );
			},
			read           : function( data ) {
				this.onAPICall( 'read', data );
			},
			update         : function( data ) {
				this.onAPICall( 'update', data );
//				if ( this.interactive && this.broadcast( 'before:update', data ) !== false )
//					this.onLoadStart( this.api.update.url, this.api.update.method, data = this.prepareData( data ), 'update' );
			},
// stub overwrite methods
			onAPICall      : function( command, data ) {
				var api = this.api[command];
				if ( api && this.interactive && this.broadcast( 'before:' + command, data ) !== false )
					this.onLoadStart( api.url, api.method, data = this.prepareData( data, api ), command );
			},
			onReqAbort     : function( xhr, status, err ) {
				var trans = this.lastOptions;
				this.broadcast( 'abort:' + trans.type, xhr, status, err );
			},
			onReqError     : function( xhr, status, err ) {
				var trans = this.lastOptions;
				this.broadcast( 'error:' + trans.type, xhr, status, err );
			},
			onReqLoad      : function( data, status, xhr ) {
				var trans = this.lastOptions;
				this.broadcast( trans.type, data, status, xhr );
			},
			onLoadStart     : function( url, method, data, type ) {
				return this.parent( url, method, data, type || 'read' );
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
