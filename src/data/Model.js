	define( namespace( 'data.Model' ), function() {
		var count = 999;

		return {
// class configuration
			afterdefine    : function( Model ) {
				var p = Model.prototype, schema = p.schema; // noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( schema ) ) {
					case 'array'    : schema = { properties : schema }; // allow fall-through
					case 'object'   : schema = schema instanceof getClass( 'data.Schema' )
											 ? schema
											 : create( 'data.Schema', schema );
											   break;
					case 'function' : schema = new Schema;
				}
				Model.__schema__ = schema;
			},
			beforeinstance : function( Model, instance ) {
				instance.schema = Model.__schema__;
			},
			constructor    : function DataModel( raw ) {
				this.changes = util.obj();
				this.dom     = util.obj();
				this.raw     = raw;
				this.src     = this.schema.coerceItem( raw );

				var id       = this.src[schema.mappings.id] || raw[schema.mappings.id];
				this.exists  = !!id;
				this.id      = id || 'phantom-' + ( ++count );

				this.setProxy( this.proxy );

				if ( this.exists ) {
					util.len( this.src ) || this.autoLoad === false || this.sync();
					this.set( 'id', id );
				}
			},
			extend         : 'Observer',
			module         :  __lib__,

			proxy          : null,
			schema         : null,
// instance configuration
			autoLoad       : true,
			autoSync       : false,
// accessors
			dirty          : {
				get        : function() { return !!util.len( this.changes ); },
				set        : function() { return this.dirty; }
			},
// public properties
			changes        : null,
			id             : null,
// internal properties
			dom            : null,
			exists         : false,
			raw            : null,
			slc            : null,
			src            : null,
			suspendChange  : 0,
			suspendSync    : 0,

// public methods
			get            : function( key ) {
				return this.src[key];
			},
			getBoundEl     : function( cmp ) {
				return this.dom[is_str( cmp ) ? cmp : cmp.id] || null;
			},
			revert         : function( key ) {
				if ( !is_str( key ) ) {
					Object.keys( this.changes ).forEach( this.revert, this );
					return;
				}
				if ( key in this.changes ) {
					this.set( key, this.changes[key] );
					delete this.changes[key];
				}
			},
			set            : function( key, val, noupdate ) {
				if ( is_obj( key ) ) {
					if ( is_bool( val ) )
						noupdate = val;

					this.suspendChange || ++this.suspendChange;
					Object.reduce( key, function( ctx, v, k ) {
						return ctx.onSet( k, v, true );
					}, this );
					!this.suspendChange || --this.suspendChange;

					noupdate === true || this.syncView();

					this.broadcast( 'change' );

					return;
				}

				this.onSet( key, val, noupdate );

				noupdate === true || this.syncView();
			},
			sync           : function() {
				if ( this.suspendSync ) return;

				this.proxy.sync( this );
			},
			toJSON         : function() {
				var json = Object.reduce( this.src, toJSON, util.obj() );

				if ( this.exists )
					json.id = this.id;
				else
					delete json.id;

				return json;
			},
// internal methods
			bindView       : function( cmp, el ) {
				switch ( util.type( el ) ) {
					case 'element[]'   :                   break;
					case 'htmlelement' : el = api.$( el ); break;
					default            :
						if ( !( el = cmp.$el.find( this.slc ) ).size )
							return;
				}

				this.dom[cmp.id] = el.attr( 'data-node-id', this.id );
			},
			onSet         : function( key, val, noupdate ) {
				var change = false, clean, schema = this.schema, prop = schema.prop;

				if ( key in prop ) {
					clean = prop[key].coerce( val );
					if ( clean !== this.src[key] ) {
						this.raw[key]     = val;
						this.changes[key] = this.src[key];
						this.src[key]     = clean;
						this.suspendChange || this.broadcast( 'change' );
						this.broadcast( 'change:' + key, this.src[key], this.changes[key] );
					}
				}

				if ( key === schema.mappings.id ) {
					this.id  = this.src[key] || val;
					this.slc = '[data-id="' + this.id + '"], [data-node-id="' + this.id + '"]';
				}
			},
			setProxy      : function( proxy ) { // noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( proxy ) ) {
					case 'string' : proxy = { urlBase : proxy }; // allow fall-through
					case 'object' :
						if ( !( proxy instanceof getClass( 'proxy.Ajax' ) ) )
							proxy  = create( 'proxy.ModelSync', proxy );

						this.proxy = proxy;
						break;
					default       : ++this.suspendSync;
				}
			},
			setSchema     : function( schema ) { // noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( schema ) ) {
					case 'array'  : schema = { properties : schema }; // allow fall-through
					case 'object' :
						if ( !( schema instanceof getClass( 'data.Schema' ) ) )
							schema  = create( 'data.Schema', schema );

						this.schema = schema;
						break;
				}
			},
			syncView       : function() {
				Object.reduce( this.dom, syncView, this );
			}
		};

		function syncData( cmd, proxy, data, status, xhr ) {
			var id, m = this.schema.mappings;
			if ( is_obj( data ) )
				id   = data[m.id]   || data[m.item][m.id];
				data = data[m.item] || data;

			if ( is_obj( data ) ) { // noinspection FallthroughInSwitchStatementJS
				switch ( cmd ) {
					case 'read'   :
					case 'update' : this.set( data );                      break;
					case 'create' : !id || this.set( 'id', this.id = id ); break;
				}

				this.broadcast( cmd, data, status, xhr );
			}
		}
		function syncView( node, el, cmp_id ) {
			el.attr( 'data-node-id', node.id );

			Object.keys( node.changes ).forEach( function( key ) { // we're looping through changed properties to save time
				el.find( '[data-node-binding="' + key + '"]' ).html( this[key] ); // but we're applying the new values
			}, node.src );

			return node;
		}
		function toJSON( json, val, key ) {
//			var prop = this.schema.prop;

//			if ( prop[key] && prop[key].model instanceof getClass( 'data.Model' ) )
//				json[key] = val.toJSON();
//			else
				json[key] = val;

			return json;
		}
	}() );