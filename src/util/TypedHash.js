	lib.define( namespace( 'TypedHash' ), function() {
		return {
			constructor : function TypedHash( config ) {
				var data;
				if ( !is_obj( config ) )
					config = {};

				if ( util.got( config, 'Type', 'data', 'propId' ) ) {
					this.Type   = typeof config.Type == 'function' ? config.Type : lib.get( config.Type ) || Object;
					this.propId = config.propId || 'id';
					data        = config.data;
				}
				else if ( !util.empty( config ) )
					data = config;

				this.parent( data );
			},
			extend      : 'Hash',
			module      : __lib__,
	// public properties
			propId      : 'id',
			Type        : null,
	// public methods
			add         : function( data ) {
				var item = data instanceof this.Type ? data : this.Type.create.apply( this.Type, arguments );
				this.set( item[this.propId] || util.id( item ), item );
				return item;
			},
			get         : function( id ) {
				if ( !util.exists( id ) )
					return null;
				if ( typeof id != 'string' )
					id = id[this.propId];
				return this.parent( id );
			},
			has         : function( id ) {
				if ( typeof id != 'string' )
					id = id[this.propId];
				return this.parent( id );
			},
			include     : function( data ) {
				return this.has( data ) ? false : this.add( data );
			},
			set         : function( o, v ) {
				if ( is_obj( o ) && o.constructor === Object )
					this.parent( o );
				else if ( v instanceof this.Type )
					this.parent( o, v );
			}
		};
	}() );
