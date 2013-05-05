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
