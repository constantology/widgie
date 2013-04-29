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
