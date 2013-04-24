	define( namespace( 'data.Node' ), function() {
		var count = 999;

		return {
// class configuration
			constructor : function DataNode( schema, raw ) {
				this.changes = util.obj();
				this.dom     = util.obj();
				this.raw     = raw;
				this.schema  = schema;
				this.src     = schema.coerceItem( raw );
				var id       = this.src[schema.mappings.id] || raw[schema.mappings.id];
				this.exists  = !!id;
				this.set( 'id', id );
			},
			extend      : Object,
			module      : __lib__,

// accessors
			dirty       : {
				get     : function() { return !!util.len( this.changes ); },
				set     : function() { return this.dirty; }
			},

// public properties
			changes     : null,
			id          : null,
// internal properties
			dom         : null,
			exists      : false,
			raw         : null,
			schema      : null,
			slc         : null,
			src         : null,

// public methods
			get         : function( key ) {
				return this.src[key];
			},
			getBoundEl  : function( cmp ) {
				return this.dom[is_str( cmp ) ? cmp : cmp.id] || null;
			},
			revert      : function( key ) {
				if ( !is_str( key ) ) {
					Object.keys( this.changes ).forEach( this.revert, this );
					return;
				}
				if ( key in this.changes ) {
					this.set( key, this.changes[key] );
					delete this.changes[key];
				}
			},
			set         : function( key, val, noupdate ) {
				if ( is_obj( key ) ) {
					if ( is_bool( val ) )
						noupdate = val;

					Object.reduce( key, function( ctx, v, k ) {
						return ctx.set( k, v, true );
					}, this );

					noupdate === true || this.syncView();

					return;
				}

				var clean, schema = this.schema, prop = schema.prop;

				this.raw[key] = val;

				if ( key in prop ) {
					clean = prop[key].coerce( val );
					if ( clean !== this.src[key] ) {
						this.changes[key] = this.src[key];
						this.src[key]     = clean;
					}
				}

				if ( key === schema.mappings.id ) {
					this.id  = this.src[key] || val;
					this.slc = '[data-id="' + this.id + '"], [data-node-id="' + this.id + '"]';
				}

				noupdate === true || this.syncView();
			},
			toJSON         : function( extras ) {
				var json = Object.reduce( this.src, toJSON, util.obj() );

				if ( this.exists )
					json.id = this.id;
				else
					delete json.id;

				return json;
			},
// internal methods
			bindView    : function( cmp, el ) {
				switch ( util.type( el ) ) {
					case 'element[]'   :                   break;
					case 'htmlelement' : el = api.$( el ); break;
					default            :
						if ( !( el = cmp.$el.find( this.slc ) ).size )
							return;
				}

				this.dom[cmp.id] = el.attr( 'data-node-id', this.id );
			},
			syncView    : function() {
				Object.reduce( this.dom, syncView, this );
			}
		};

		function syncView( node, el, cmp_id ) {
			el.attr( 'data-node-id', node.id );

			Object.keys( node.changes ).forEach( function( key ) { // we're looping through changed properties to save time
				el.find( '[data-node-binding="' + key + '"]' ).html( this[key] ); // but we're applying the new values
			}, node.src );

			return node;
		}
		function toJSON( json, val, key ) {
			json[key] = util.merge( val );

			return json;
		}
	}() );
