	define( namespace( 'data.Model' ), function() {
		var count = 999;

		return {
// class configuration
			afterdefine    : function( Model ) {
				var p = Model.prototype;

				if ( Model.__proxy__  = lookupProxy(  p.proxy,  'proxy.ModelSync' ) )
					delete p.proxy;
				if ( Model.__schema__ = lookupSchema( p.schema ) )
					delete p.schema;
			},
			beforeinstance : function( Model, instance ) {
				instance.proxy  = Model.__proxy__;
				instance.schema = Model.__schema__;
			},
			constructor    : function DataModel( raw ) {
				this.parent();

				this.changes = util.obj();
				this.dom     = util.obj();
				this.raw     = raw || util.obj();
				this.src     = raw ? this.schema.coerceItem( raw ) : util.obj();

				var schema   = this.schema,
					id       = this.src[schema.mappings.id] || this.raw[schema.mappings.id];

				this.exists  = !!id;
				this.id      = id || 'phantom-' + ( ++count );

				if ( this.exists ) {
					( util.len( raw ) - 1 ) || this.autoLoad === false || this.sync();
					this.set( 'id', id );
				}
				else if ( util.len( this.src ) > 0 && this.autoSync === true )
					this.sync();
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
// flags
			deleted        : false,
			syncing        : false,
// public properties
			changes        : null,
			id             : null,
// internal properties
			dom            : null,
			exists         : false,
			raw            : null,
			slc            : null,
			src            : null,
			strict         : false, // todo: implement this
			suspendChange  : 0,
			suspendSync    : 0,

// public methods
			destroy        : function( success ) {
				if ( this.autoSync === true ) {
					if ( success === true )
						this.parent( arguments );
					this.proxy.delete( this );
				}
				else
					this.deleted = true;
			},
			get            : function( key ) {
				return this.src[key] === UNDEF ? null : this.src[key];
			},
			getBoundEl     : function( cmp ) {
				return this.dom[typeof cmp == 'string' ? cmp : cmp.id] || null;
			},
			revert         : function( key ) {
				if ( typeof key != 'string' ) {
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
					if ( typeof val == 'boolean' )
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

				!this.dirty || this.autoSync === false || this.sync();
			},
			sync           : function() {
				if ( this.suspendSync ) return;

				this.syncing = true;

				this.proxy.sync( this );
			},
			toJSON         : function() {
				var json = util.obj();

				if ( this.destroyed || this.deleted ) {
					json.deleted = true;
					return json;
				}

				json.syncing = this.syncing;

				Object.reduce( this.src, toJSON.bind( this ), json );

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

				this.dom[cmp.id] = el.attr( 'data-model-id', this.id );
			},
			onDestroy     : function() {
				this.parent( arguments );
				this.destroyed = true;
				delete this.changes; delete this.dom;
				delete this.exists;  delete this.id;
				delete this.raw;     delete this.src;
			},
			onSet         : function( key, val, noupdate ) {
				var change = false, clean,
					schema = this.schema,
					prop   = schema.property;

				if ( key in prop ) {
					if ( prop[key].store ) {
						this.src[key].load( val );
						this.suspendChange || prop[key].track === false || this.broadcast( 'change' );
						prop[key].track === false || this.broadcast( 'change:' + key );
					}
					else {
						clean = prop[key].coerce( val );
						if ( clean !== this.src[key] ) {
							this.raw[key]     = val;
							this.changes[key] = this.src[key];
							this.src[key]     = clean;
							this.suspendChange || prop[key].track === false || this.broadcast( 'change' );
							prop[key].track === false || this.broadcast( 'change:' + key, this.src[key], this.changes[key] );
						}
					}
				}

				if ( key === schema.mappings.id ) {
					this.id  = this.src[key] || val;
					this.slc = '[data-id="' + this.id + '"], [data-model-id="' + this.id + '"]';
				}
			},
			onSync        : function( raw, command ) {
				this.syncing = false;

				if ( !raw ) return; // todo: throw an error?

				util.remove( this.dom, Object.keys( this.dom ) );

				if ( command === 'delete' )
					return this.destroy( true );

				var raw_item = this.schema.getItemRoot( raw );

				if ( !raw_item ) return;

//				this.suspendEvents();
				util.copy( this.src, this.schema.coerceItem( raw_item ) );
//				Object.keys( raw ).forEach( removeChange, this.changes );
				this.raw = raw_item;

				if ( command === 'create' ) {
					this.id     = this.src.id;
					this.exists = !!this.id;
				}

				if ( command === 'read' )
					util.remove( this.changes, Object.keys( this.changes ) );

				this/*.resumeEvents()*/.broadcast( 'sync', command, raw ).broadcast( 'change' );
			},
			onSyncAbort   : function( command ) {
				this.syncing = false;
				this.broadcast( 'sync:abort', command );
			},
			onSyncError   : function( err, command ) {
				this.syncing = false;
				this.broadcast( 'sync:error', command, err );
			},
			syncView       : function() {
				Object.reduce( this.dom, syncView, this );
			}
		};

		function removeChange( key ) { delete this[key]; }

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
			el.attr( 'data-model-id', node.id );

			Object.keys( node.changes ).forEach( function( key ) { // we're looping through changed properties to save time
				el.find( '[data-model-binding="' + key + '"]' ).html( this[key] ); // but we're applying the new values
			}, node.src );

			return node;
		}
		function toJSON( json, val, key ) {
			var property = this.schema.property[key];

			if ( property && property.stringify !== false ) {
				if ( property.store )
					json[key] = val.toJSON();
				else
					json[key] = util.merge( val );
			}

			return json;
		}
	}() );
