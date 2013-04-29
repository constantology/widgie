	;!function() {
		define( namespace( 'data.Schema' ), {
	// class configuration
			afterdefine    : function( Schema ) {
				var p    = Schema.prototype;

				Schema.__mappings__   = p.mappings;
				Schema.__properties__ = p.properties;

				delete p.mappings; delete p.properties;
			},
			beforeinstance : function( Schema, instance, args ) {
				var has_config = is_obj( args[0] );

				if ( is_obj( Schema.__mappings__ ) ) {
					instance.mappings   = has_config
										? util.update( args[0].mappings   || util.obj(), Schema.__mappings__   )
										: util.update( Schema.__mappings__   );
					!has_config || delete args[0].mappings;
				}
				if ( typeof Schema.__properties__ == 'object' ) {
					instance.properties = has_config
										? util.update( args[0].properties || util.obj(), Schema.__properties__ )
										: util.update( Schema.__properties__ );
					!has_config || delete args[0].properties;
				}
			},
			constructor : function DataSchema( config ) {
				if ( is_arr( config ) )
					config = { properties : config };

				if ( !is_obj( config ) )
					config = util.obj();

				this.mappings   = util.update( config.mappings || this.mappings || util.obj(), DEFAULT_MAPPINGS );
				this.properties = ( config.properties || this.properties ).map( to_property, this );
				this.property   = this.properties.reduce( to_prop_map, util.obj() );
			},
			extend      : Object,
			module      : __lib__,

	// instance configuration properties
			mappings    : null,
			properties  : null,

	// public properties
			property    : null,
	// public methods
			coerce      : function( raw, json ) {
				var items, success, total;

				switch ( util.ntype( raw ) ) {
					case 'array'  : items = raw; success = true; total = items.length; break;
					case 'object' :
						items   = this.getRoot( raw );
						total   = this.mappings.total   in raw ? raw[this.mappings.total]   : items.length;
						success = this.mappings.success in raw ? raw[this.mappings.success] : !!total;
						break;
					default       : items = []; success = false; total = -1;
				}

				return {
					items   : items.map( this[json === true ? 'coerceItem' : 'toNode'], this ),
					success : success,
					total   : total
				};
			},
			coerceItem  : function( raw ) {
				var data = util.obj();
				this.properties.invoke( 'process', util.update( this.getItemRoot( raw ) ), data );
				return data;
			},
			getItemRoot : function( raw ) {
				var item = this.mappings.item;
				return item && item in raw ? raw[item] : raw;
			},
			getRoot     : function( raw ) {
				var items = this.mappings.items;
				return items && items in raw ? raw[items] : raw;
			},
			toNode      : function( raw ) {
				return __lib__.data.Node.create( this, raw );
			},
			valid       : function( data ) {
				return Object.keys( data ).every( function( prop ) {
					return prop in this && this[prop].valid( data[prop] );
				}, this.property );
			}
		} );

		define( namespace( 'data.Schema.Property' ), {
	// class configuration
			constructor : function DataSchemaProperty( config ) {
				util.copy( this, config || {} );

				if ( !this.cite && this.id )
					this.cite = this.id;
				if ( !this.id && this.cite )
					this.id   = this.cite;

				if ( !~this.id.indexOf( '.' ) ) {
					this._id  = this.id;
					this.path = '';
				}
				else {
					this.path = this.id.split( '.' );
					this._id  = this.path.pop();
					this.path = this.path.join( '.' );
				}

				switch ( util.ntype( this.type ) ) {
					case 'function' : break;
					case 'string'   :
						if ( this.default === null && this.type !== 'object' )
							this.default = DEFAULT[this.type];

						this.type = TYPE[this.type];

						break;
				}

				is_fun( this.type ) || error( {
					instance : this,
					method   : 'constructor',
					message  : 'Invalid data.Schema.Property#type',
					name     : error.code.DATA_SCHEMA_TYPE
				} );

				// noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( this.format ) ) {
					case 'function' :
					case 'string'   : break;
					default         : this.format = util;
				}

				this.fmt = FORMAT[util.ntype( this.format )] || this.fmt;

				if ( this.schema ) // noinspection FallthroughInSwitchStatementJS
					switch ( util.ntype( this.schema ) ) {
						case 'array'    : this.schema = { properties : this.schema }; // allow fall-through
						case 'object'   : this.schema = this.schema instanceof getClass( 'data.Schema' )
												 ? this.schema
												 : create( 'data.Schema', this.schema );
												   break;
						case 'string'   : this.schema = getClass( this.schema );      // allow fall-through
						case 'function' : this.schema = new this.schema;
					}
			},
			extend      : Object,
			module      : __lib__,

	// instance configuration properties
			cite        : null,
			default     : null,
			format      : null,
			id          : null,
			schema      : null,
			type        : 'object',

	// internal properties
			_id         : null,

	// public methods
			coerce      : function( val, raw, data ) {
				return this.fmt( val, this.format, raw, data );
			},
			process     : function( raw, data ) {
				return this.assign( this.coerce( this.val( raw, data ), raw, data ), data );
			},
			valid       : function( v ) {
				return util.ntype( v ) === this.type.id;
			},
			value       : util,
	// internal methods
			assign      : function( val, data ) {
				var root       = util.bless( this.path, data );
				root[this._id] = val;
				return data;
			},
			fmt         : util,
			val         : function( raw, data ) {
				var val = this.value( Object.value( raw, this.cite ) || null, raw, data );
				return val === this || val === UNDEF ? null : val;
			}
		} );

		var DataSchema       = getClass( 'data.Schema' ),
			DEFAULT_MAPPINGS = DataSchema.DEFAULT_MAPPINGS = {
				id      : 'id',      items : 'items',
				success : 'success', total : 'total'
			},
			DEFAULT          = {
				boolean :  false,
				date    : 'now',
				number  :  0,
				string  : ''
			},
			FORMAT           = {
				'function' : function( v, f, raw, data ) {
					return f.call( this, this.type( v ), raw, data );
				},
				 string    : function( v, f ) {
					return this.type( v, f );
				}
			},
			TYPE             = DataSchema.TYPE = { // todo: these may need a lil' more work
				array   : function( v ) {
					if ( this.schema )
						return this.schema.coerce( v );
					return Array.isArray( v ) ? v : util.exists( v ) ? Array.coerce( v ) : [];
				},
				boolean : function( v ) {
					return Boolean.coerce( v );
				},
				date    : function( v, f ) {
					if ( is_date( v ) ) return v;

					var date; f || ( f = this.format );

					if ( v !== null ) {
						switch ( util.ntype( f ) ) {
							case 'string'   : date = api.date.coerce( v, f ); break;
							case 'function' : date = f( v );                  break;
							default         : date = new Date( v );
						}
					}
					else date = NaN;

					return isNaN( +date ) ? this.default == 'now' ? new Date() : new Date( +this.default ) : date;
				},
				number  : function( v ) {
					return Number( v ) == v ? Number( v ) : this.default;
				},
				object  : function( v ) {
					if ( this.schema )
						return this.schema.coerceItem( v );
					return v === UNDEF ? this.default : v;
				},
				string  : function( v ) {
					return String( v ) == v ? String( v ).trim() : this.default;
				}
			};

		Object.keys( TYPE ).forEach( function( t ) {
			this[t].id = t;
		}, TYPE );

		function to_prop_map( map, property ) {
			map[property.id] = property;
			return map;
		}
		function to_property( property ) {
			return property instanceof DataSchema.Property ? property : widgie.create( 'data.Schema.Property', property );
		}
	}();
