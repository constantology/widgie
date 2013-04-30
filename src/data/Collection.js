	define( namespace( 'data.Collection' ), function() {
		var count     = 999,
			filters   = {
				date    : function( f, v, model ) {
					return +model.get( f ) === +v;
				},
				default : function( f, v, model ) {
					return model.get( f ) === v;
				},
				regexp  : function( f, v, model ) {
					return v.test( model.get( f ) );
				},
				string  : function( f, v, model ) {
					return String( model.get( f ) ).toLowerCase() === v;
				}
			},
			sort_dir  = {
				asc     : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : -1;
				},
				desc    : function( a, b ) {
					return a[0] === b[0] ? 0 : a[0] < b[0] ? 1 : -1;
				}
			};

		return {
// class configuration
			constructor   : function DataCollection( config ) {
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
			model         : null,
			proxy         : null,
			schema        : null,
// accessors
			changes       : {
				get       : function() {
					return this.data.reduce( function( models, model ) {
						!model.dirty || models.push( model );
						return models;
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

				var model = this.onAdd( data );
				!model || this.broadcast( 'add', model ).onChangeData( silent );
			},
			bindView      : function( cmp ) {
				this.data.values.invoke( 'bindView', cmp );
			},
			byId          : function( id ) {
				if ( is_obj( id ) )
					return id instanceof this.model && this.data.key( id )
						 ? id
						 : this.data.get( id[this.model.__schema__.mappings.id] ) || this.data.get( id.id );

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
				this.updateView( this.view.ovalues.filter( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this ) );
			},
			filterBy      : function( f, v ) {
				this.filter( ( filters[util.ntype( v )] || filters.default ).bind( this, f, v ) );
			},
			find          : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.find( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this );
			},
			findAll       : function( fn, ctx ) {
				ctx || ( ctx = this );
				return this.data.ovalues.filter( function( model, i ) {
					return fn.call( ctx, model, i, this );
				}, this );
			},
			first         : function() { return this.getAt( 0 ); },
			get           : function( model ) {
				if ( is_obj( model ) )
					return model instanceof this.model && this.data.key( model )
						 ? model
						 : this.data.get( model[this.model.__schema__.mappings.id] ) || this.data.get( model.id );

				return this.byId( model ) || this.getAt( model ) || null;
			},
			getAt         : function( i ) {
				return this.data.ovalues[i > - 1 ? i : this.data.length + i] || null;
			},
			getBoundEls   : function( cmp ) {
				return this.data.values.invoke( 'getBoundEl', cmp );
			},
			indexOf       : function( model, use_view ) {
				model = this.get( model ); // todo: shouls this use use_view too?
				return model ? ( use_view === true ? this.view : this.data ).ovalues.indexOf( model ) : -1;
			},
			last          : function() { return this.getAt( -1 ); },
			load          : function( raw, options ) {
				var data = this.readResponse( raw );

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
			next          : function( model ) {
				var i = this.indexOf( model, true );
				return !!~i ? this.view.ovalues[i + 1] || null : null;
			},
			prev          : function( model ) {
				var i = this.indexOf( model, true );
				return !!~i ? this.view.ovalues[i - 1] || null : null;
			},
			reduce        : function( fn, val, ctx ) {
				ctx || ( ctx = this );
				return this.view.ovalues.reduce( function( v, model ) {
					return fn.call( ctx, v, model );
				}, val );
			},
			remove        : function( model, silent ) {
				model = this.get( model );

				if ( !model || !this.onRemove( model ) ) return;

				this.broadcast( 'remove', model );
				silent === true || this.onChangeData( silent );
			},
			readResponse  : function( raw ) {
				return this.model.__schema__.prepare( raw );
			},
			revert        : function( model, silent ) {
				if ( model ) {
					model = this.get( model );
					if ( model.dirty ) {
						model.revert();
						silent === true || this.broadcast( 'revert', model ).onChangeData();
					}
					return;
				}

				if ( is_bool( model ) )
					silent = model;

				model = this.changes;

				if ( model.length ) {
					model.invoke( 'revert' );
					silent === true || this.broadcast( 'revert', model ).onChangeData();
				}
			},
			setModel      : function( model ) {
				if ( this.model = lookupModel( model ) )
					this.broadcast( 'set:model' );
			},
			setProxy      : function( proxy ) {
				if ( this.proxy instanceof getClass( 'proxy.Ajax' ) ) {
					this.proxy.ignore( 'error',     'onLoadError', this )
							  .ignore( 'load',      'onLoad',      this )
							  .ignore( 'loadstart', 'onLoadStart', this )
							  .ignore( 'timeout',   'onLoadError', this );

					delete this.proxy;
				}

				if ( is_str( proxy ) )
					proxy = lookupProxy( proxy ) || { urlBase : proxy };

				if ( this.proxy = lookupProxy( proxy ) ) {
						this.proxy.observe( {
							error     : 'onLoadError', load    : 'onLoad',
							loadstart : 'onLoadStart', timeout : 'onLoadError',
							ctx       : this
						} );

						this.broadcast( 'set:proxy' );
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
				return this.view.ovalues.invoke( 'toJSON' );
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
				var existing, model;

				if ( !( data instanceof this.model ) )
					model = this.model.create( data );

				if ( existing = this.data.get( model.id ) )
					return existing;

				this.data.set( model.id, model );

				model.observe( {
					'before:destroy' : 'remove',
					 change          : 'onChangeData',
					 sync            : 'onModelSync',
					 ctx             : this
				} );

				return model;
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
			onModelSync    : function( model, command ) {
				if ( command === 'create' ) {
					var key = this.data.key( model );
					this.data.remove( key );
					this.data.set( model.id, model );
				}
			},
			onLoad         : function( proxy, data, status, xhr, config ) {
				this.broadcast( 'load:complete', data, status, xhr, config ).load( data, config.options );
			},
			onLoadError    : function( proxy, err, status, xhr, config ) {
				this.broadcast( 'load:error', err, status, xhr, config.options );
			},
			onLoadStart    : function() {
				this.broadcast( 'load:start' );
			},
			onRemove       : function( model ) {
				var id = model.id;

				!this.current || this.current.remove( id );
				this.stache.invoke( 'remove', id );

				return this.data.remove( id );
			},
			prepare       : function( params ) {
				return util.update( params || util.obj(), this.defaultData );
			},

// internal methods
			init          : function() {
				this.parent( arguments );
				this.stache = [];

				var data    = this.data,
					model   = this.model,
					proxy   = this.proxy;

				util.remove( this, 'data', 'model', 'proxy' );

				this.data   = lib( 'Hash' );

				this.setModel( model )
					.setProxy( proxy );

				if ( !is_obj( this.defaultData ) )
					this.defaultData = util.obj();

				switch ( util.ntype( data ) ) {
					case 'object' : this.load( data ); break;
					case 'array'  : this.add( data );                        break;
				}
			}
		};

		function add( model ) {
			this.set( model.id, model );
		}

		function sort_prepare( collection, f ) {
			return collection.view.ovalues.map( function( model ) {
				return [model.get( f ), model];
			} );
		}
	}() );
