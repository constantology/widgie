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
