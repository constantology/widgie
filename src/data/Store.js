	define( namespace( 'data.Store' ), function() {
		var DataNode = getClass( 'data.Node' ),
			count    = 999,
			filters  = {
				date    : function( f, v, node ) {
					return +node.get( f ) === +v;
				},
				default : function( f, v, node ) {
					return node.get( f ) === v;
				},
				regexp  : function( f, v, node ) {
					return v.test( node.get( f ) );
				},
				string  : function( f, v, node ) {
					return String( node.get( f ) ).toLowerCase() === v;
				}
			},
			sort_dir = {
				asc     : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : -1;
				},
				desc    : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] < b[0] ? 1 : -1;
				}
			};

		return {
// class configuration
			constructor   : function DataStore( config ) {
				this.mixin( 'observer', is_obj( config ) ? config.observers : [] ).parent( arguments );
			},
			extend        : lib.Source,
			mixins        : {
				observer  : 'Observer'
			},
			module        : __lib__,
// instance configuration properties
			data          : null,
			id            : null,
			proxy         : null,
			schema        : null,
// accessors
			changes       : {
				get       : function() {
					return this.data.reduce( function( nodes, node ) {
						!node.dirty || nodes.push( node );
						return nodes;
					}, [] );
				},
				set       : function() { return this.changes; }
			},
			dirty         : {
				get       : function() { return this.data.values.pluck( 'dirty' ).some( is_true ); },
				set       : function() { return this.dirty; }
			},
			size          : {
				get       : function() { return this.data.length; },
				set       : function() { return this.size; }
			},
			view          : {
				get       : function() { return this.current || this.data; },
				set       : function() { return this.view; }
			},
// public properties
			loading       : false,
// internal properties
			current       : null,
			stache        : null,
			suspendChange : 0,

// public methods
			add           : function( data, silent ) {
				if ( is_arr( data ) ) {
					 this.suspendChange || ++this.suspendChange;
					 data.forEach( this.add, this );
					!this.suspendChange || --this.suspendChange;
					 return this.onChangeData( silent );
				}

				var node = this.onAdd( data );
				!node || this.onChangeData( silent );
			},
			bindView      : function( cmp ) {
				this.data.values.invoke( 'bindView', cmp );
			},
			byId          : function( id ) {
				if ( is_obj( id ) )
					return id instanceof DataNode && this.data.key( id )
						 ? id
						 : this.data.get( id[this.schema.mappings.id] ) || this.data.get( id.id );

				return this.data.get( id ) || null;
			},
			clear         : function( silent ) {
				this.data.clear();

				silent === true || this.broadcast( 'clear' );
				this.onChangeData( silent );
			},
			clearFilters  : function( silent ) {
				this.emptyStash( silent );
			},
			commit        : function() {},
			contains      : function( item ) {
				return !!this.byId( item );
			},
			each          : function( fn, ctx ) {
				this.view.ovalues.forEach( fn, ctx || this );
			},
			emptyStash    : function( silent ) {
				delete this.current;
				this.stache.length = 0;
				silent === true || this.broadcast( 'empty:stash' );
				this.onChangeView( silent );
			},
			fetch         : function( params, options ) {
				if ( this.proxy ) {
					this.proxy.load( this.prepare( params ), options );
					this.loading = this.proxy.loading;
				}
			},
			filter        : function( fn, ctx ) {
				ctx || ( ctx = this );
				this.updateView( this.view.ovalues.filter( function( node, i ) {
					return fn.call( ctx, node, i, this );
				}, this ) );
			},
			filterBy      : function( f, v ) {
				this.filter( ( filters[util.ntype( v )] || filters.default ).bind( this, f, v ) );
			},
			find          : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.find( function( node, i ) {
					return fn.call( ctx, node, i, this );
				}, this );
			},
			findAll       : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.filter( function( node, i ) {
					return fn.call( ctx, node, i, this );
				}, this );
			},
			first         : function() { return this.getAt( 0 ); },
			get           : function( node ) {
				if ( is_obj( node ) )
					return node instanceof DataNode && this.data.key( node )
						 ? node
						 : this.data.get( node[this.schema.mappings.id] ) || this.data.get( node.id );

				return this.byId( node ) || this.getAt( node ) || null;
			},
			getAt         : function( i ) {
				return this.data.ovalues[i > - 1 ? i : this.data.length + i] || null;
			},
			getBoundEls   : function( cmp ) {
				return this.data.values.invoke( 'getBoundEl', cmp );
			},
			indexOf       : function( node, use_view ) {
				node = this.get( node ); // todo: shouls this use use_view too?
				return node ? ( use_view === true ? this.view : this.data ).ovalues.indexOf( node ) : -1;
			},
			last          : function() { return this.getAt( -1 ); },
			load          : function( data, options ) {
				if ( data.success && data.items ) {
					this.add( data.items, !!options );
					!options || this.onChangeData( false, options );
				}
				else
					this.broadcast( 'load:empty', data, options );
			},
			map           : function( fn, ctx ) {
				return this.view.ovalues.map( fn, ctx || this );
			},
			next          : function( node ) {
				var i = this.indexOf( node, true );
				return !!~i ? this.view.ovalues[i + 1] || null : null;
			},
			prev          : function( node ) {
				var i = this.indexOf( node, true );
				return !!~i ? this.view.ovalues[i - 1] || null : null;
			},
			reduce        : function( fn, val, ctx ) {
				ctx || ( ctx = this );
				return this.view.ovalues.reduce( function( v, node ) {
					return fn.call( ctx, v, node );
				}, val );
			},
			remove        : function( node, silent ) {
				node = this.get( node );

				!node || !this.onRemove( node ) || silent === true || this.onChangeData();
			},
			revert        : function( node, silent ) {
				if ( node ) {
					node = this.get( node );
					if ( node.dirty ) {
						node.revert();
						silent === true || this.broadcast( 'revert', node ).onChangeData();
					}
					return;
				}

				if ( is_bool( node ) )
					silent = node;

				node = this.changes;

				if ( node.length ) {
					node.invoke( 'revert' );
					silent === true || this.broadcast( 'revert', node ).onChangeData();
				}
			},
			setProxy      : function( proxy ) {
				if ( this.proxy ) {
					this.proxy.ignore( 'error',     'onLoadError', this )
							  .ignore( 'load',      'onLoad',      this )
							  .ignore( 'loadstart', 'onLoadStart', this )
							  .ignore( 'timeout',   'onLoadError', this );

					delete this.proxy;
				}
				// noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( proxy ) ) { // todo: when we have other proxies we can add support for them
					case 'string' : proxy = { urlBase : proxy }; // allow fall-through
					case 'object' :
						if ( !( proxy instanceof getClass( 'proxy.Ajax' ) ) )
							proxy = create( 'proxy.Ajax', proxy );

						this.proxy = proxy;

						this.proxy.observe( {
							error     : 'onLoadError', load    : 'onLoad',
							loadstart : 'onLoadStart', timeout : 'onLoadError',
							ctx       : this
						} );

						this.broadcast( 'set:proxy' );
						break;
				}
			},
			setSchema     : function( schema ) { // noinspection FallthroughInSwitchStatementJS
				switch ( util.ntype( schema ) ) {
					case 'array'  : schema = { properties : schema }; // allow fall-through
					case 'object' :
						if ( !( schema instanceof getClass( 'data.Schema' ) ) )
							schema = create( 'data.Schema', schema );

						this.schema = schema;

						this.broadcast( 'set:schema' );
						break;
				}
			},
			sort          : function( fn, ctx ) {
				this.updateView( this.view.ovalues.slice().sort( fn.bind( ctx || this ) ) );
			},
			sortBy        : function( f, d ) {
				this.updateView( sort_prepare( this, f ).sort( sort_dir[String( d ).toLowerCase()] || sort_dir.asc ).pluck( 1 ) );
			},
			stash         : function() {
				if ( this.current ) {
					this.stache.push( this.current.clone() );
					delete this.current;
					this.broadcast( 'stash' );
				}
			},
			toJSON        : function() {
				return this.view.ovalues.pluck( 'src' );
			},
			undo          : function( n ) {
				if ( this.stache.length ) {
					if ( isNaN( n ) || n < 0 )
						n = 0;

					var stash = this.stache[n];

					this.stache.splice( 0, n + 1 );

					this.current = stash;

					this.onChangeView();
				}
				else if ( delete this.current )
					this.onChangeView();
			},
			updateView    : function( view ) {
				this.stash();

				this.current = lib( 'Hash' );

				view.forEach( add, this.current );

				this.onChangeView();
			},
// stub methods
			onAdd          : function( data ) {
				var existing, node;

				if ( data instanceof DataNode )
					node = data.schema === this.schema && this.schema.valid( data.src )
						 ? data
						 : DataNode.create( this.schema, data.raw || data.src );
				else
					node = DataNode.create( this.schema, data );

				existing = this.data.get( node.id );

				existing ? existing.set( node.raw ) : this.data.set( node.id, node );

				return node;
			},
			onChangeData   : function( silent, options ) {
				if ( this.suspendChange ) return;

				this.emptyStash( true );
				silent === true || this.broadcast( 'change:data', options );

				if ( this.proxy )
					this.loading = this.proxy.loading;
			},
			onChangeView   : function( silent ) {
				this.suspendChange || silent === true || this.broadcast( 'change:view' );
			},
			onLoad         : function( proxy, data, status, xhr, config ) {
				this.broadcast( 'load:complete', data, status, xhr, config ).load( this.schema.coerce( data ), config.options );
			},
			onLoadError    : function( proxy, err, status, xhr, config ) {
				this.broadcast( 'load:error', err, status, xhr, config.options );
			},
			onLoadStart    : function() {
				this.broadcast( 'load:start' );
			},
			onRemove       : function( node ) {
				var id = node.id;

				!this.current || this.current.remove( id );
				this.stache.invoke( 'remove', id );

				return this.data.remove( id );
			},
			prepare       : function( params ) {
				return params;
			},

// internal methods
			init          : function() {
				this.parent( arguments );
				this.stache = [];

				var data    = this.data,
					proxy   = this.proxy,
					schema  = this.schema;

				util.remove( this, 'data', 'proxy', 'schema' );

				this.data   = lib( 'Hash' );

				this.setProxy( proxy )
					.setSchema( schema );

				switch ( util.ntype( data ) ) {
					case 'object' : this.load( this.schema.coerce( data ) ); break;
					case 'array'  : this.add( data );                        break;
				}
			}
		};

		function add( node ) {
			this.set( node.id, node );
		}

		function sort_prepare( store, f ) {
			return store.view.ovalues.map( function( node ) {
				return [node.get( f ), node];
			} );
		}
	}() );
