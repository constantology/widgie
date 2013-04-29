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
			delete         : function( data, options ) {
				var id = options.model.schema.mappings.id;
				this.parent( { id : data[id] || options.model[id] }, options );
			},
			read           : function( data, options ) {
				var id = options.model.schema.mappings.id;
				this.parent( { id : data[id] || options.model[id] }, options );
			},
			sync           : function( model, options ) {
				var command = 'read';

				if ( model.dirty )
					command = this.exists ? 'update' : 'create';

				if ( !is_obj( options ) )
					options = util.obj();

				options.model = model;

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
