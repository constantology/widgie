	define( namespace( 'proxy.ModelSync' ), function () {
		return {
			extend         : namespace( 'proxy.CRUD' ),
			module         : __lib__,

// instance configuration
			api            : null,

// public methods
			sync           : function( model ) {
				var cmd = 'read';

				if ( model.dirty )
					cmd = this.exists ? 'update' : 'create';

				!( cmd in this ) || this[cmd]( model );
			},
// stub overwrite methods
			onLoadStart     : function( model ) {
				this.queue[model.id] = model;

			},
// internal methods
			initTransport   : function( model ) {
				var args      = Array.coerce( arguments, 1 ),
					transport = this.parent.apply( this, args );

				transport.model = model;

				return transport;
			},
// constructor methods
			init            : function() {
				this.parent( arguments );
				this.queue = util.obj();
			}
		};
	}() );
