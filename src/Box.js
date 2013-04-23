	define( namespace( 'Box' ), {
		constructor   : function Box( config ) {
			this.parent( arguments )
				.initItems( this.items );
		},
// class configuration
		extend        : namespace( 'Component' ),
		mixins        : {
			dataview  : util.obj(),
			renderer  : Name + '.mixins.BoxRenderer'
		},
		module        : __lib__,
// instance configuration
		$_items       : '$elCt',
		clsBase       : 'w-box',
		tpl           : Name + '.box',
// public methods
		add           : function( item ) {
			if ( arguments.length > 1 && isNaN( arguments[1] ) )
				item = Array.coerce( arguments );

			if ( is_arr( item ) ) {
				this.suspendEvents();
				item = item.map( this.add, this );
				this.resumeEvents().broadcast( 'add', item );
				return item;
			}

			if ( this.broadcast( 'before:add', item ) !== false ) {
				if ( item = this.onAdd( item ) ) {
					this.broadcast( 'add', item );
					return item;
				}
			}
			return null;
		},
		clear         : function( silent ) {
			if ( !this.items.length || !this.ready || this.disabled || this.broadcast( 'before:clear' ) === false )
				return;

			if ( silent === true )
				this.suspendEvents();

			this.onClear().resumeEvents().broadcast( 'clear' );
		},
		contains      : function( item ) {
			item = this.get( item );
			return item && item.parentBox === this;
		},
		get           : function( item ) {
//if ( typeof item == 'string' && item.indexOf( 'box' ) > -1 ) debugger;
			if ( this.items.length )  // noinspection FallthroughInSwitchStatementJS
				switch ( util.type( item ) ) {
					case 'event'     : item = item.currentTarget;                          // allow fall-through
					case 'element[]' : case 'htmlelement' : item = api.$( item ).data( 'id' ); // allow fall-through
					case 'number'    : case 'string'      : return this.items[item] || this.map[item] || this.map[this.id + '-' + item] || null;
					default          : return util.got( item, 'id', 'cmpId' ) ? this.get( item.id ) || this.get( this.id + '-' + item.cmpId ) : null;
				}
			return null;
		},
		insert        : function( index, item ) {
			if ( this.broadcast( 'before:add', item, index ) === false ) return null;

			item = this.onAdd( item, index );

			this.broadcast( 'add', item );

			return item;
		},
		loadItems     : function( items, append ) {
			if ( typeof items == 'string' )
				 items = { url : items };

			items.success = this.onLoadItems.bind( this, append );

			if ( this.disabled || this.broadcast( 'before:load:items', items ) === false ) return;

			this.broadcast( 'load:items:start', api.xhr( items ) );
		},
		remove        : function( item, destroy ) {
			if ( !item || !( item = this.get( item ) ) || this.broadcast( 'before:remove', item ) === false )
				return null;

			this.onRemove( item );

			destroy !== true || item.dead || item.destroy();

			this.broadcast( 'remove', item );
		},
// stub methods
		onAdd         : function( item, index ) {
			var existing = this.get( item );

			!existing || !item.parentBox || item.parentBox.remove( existing );

			if ( item = this.lookup( item ) ) {
				this.adopt( item, index );

				item.observe( 'destroy', 'onRemove', this );

				return item;
			}

			return null;
		},
		onClear       : function() {
			while ( this.items.length )
				this.remove( this.items[0], true );
		},
		onRemove      : function( item ) {
			util.remove( this.items, item );

			delete this.map[item.id];

			this.mixin( 'renderer', arguments );

			if ( item.parentBox === this )
				delete item.parentBox;
		},
		onRender      : function() {
			this.parent();

//			!this.tb || this.tb.render( this.$el );
//			!this.fb || this.fb.render( this.$el );
		},
// internal methods
		adopt         : function( item, index ) {
			var insert        = util.type( index ) == 'number';
			this.map[item.id] = item;

			!item.parentBox || item.parentBox.remove( item, false );

			item.parentBox = this;

			this.mixin( 'renderer', [item, insert, index] );

			if ( insert )
				this.items.splice( index, 0, item );
			else
				this.items.push( item );
		},
		applyDefaults : function( item ) {
			return util.copy( item, this.defaults, true );
		},
		init          : function() {
			this.parent();

			if ( !is_obj( this.defaults ) )
				this.defaults = {};

//			if ( this.fb && !lib.is( this.fb, 'w.toolbar' ) )
//				this.fb = lib( 'w.toolbar', this.fb );
//			if ( this.tb && !lib.is( this.tb, 'w.toolbar' ) )
//				this.tb = lib( 'w.toolbar', this.tb );
		},
		initItems     : function( items ) {
			this.items = [];
			this.map   = util.obj();

			switch ( util.ntype( items ) ) {
				case 'array'  : this.add( items );              break;
				case 'string' :
				case 'object' : this.loadItems( items, false ); break;
			}
		},
		lookup        : function( item ) {
			if ( is_str( item ) )
				item = Mgr.get( item );

			if ( is_obj( item ) && !item.id && item.cmpId )
				item.id = this.id + '-' + item.cmpId;

			if ( !is_obj( item ) )
				error( {
					cmp     : this,
					item    : item,
					message : 'Incorrect Type: cannot add item - ' + JSON.stringify( item ) + ' – to ' + this.id,
					method  : 'lookup',
					name    : error.code.BOX_ITEM_LOOKUP
				} );

			return lib.is( this.applyDefaults( item ), Name + '.Component' ) ? item : create( item );
		},
		onLoadItems   : function( append, items ) {
			append === true || this.clear( true );

			!( !is_arr( items ) || !is_obj( items ) ) || this.add( items );

			this.broadcast( 'load:items:complete' );
		}
	} );

	getClass( 'Box' ).count = 999;
