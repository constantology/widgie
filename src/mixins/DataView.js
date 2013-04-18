	define( namespace( 'mixins.DataView' ), function() {
		function clear( cmp ) {
			util.remove( cached( cmp ), this );
			return cmp;
		}
		function clear_prop( cmp, prop ) {
			delete cached( cmp )[prop];
			return cmp;
		}

		function elements( cmp, fn, slc, prop ) {
			if ( !cmp.ready ) return api.$();

			var cache = cached( cmp ),
				els   = cache[prop];

			return util.type( els ) == 'element[]'
				 ? els
				 : cache[prop] = cmp.$el[fn]( slc );
		}

		function get_id( el ) {
			return '#' + el.id;
		}

		function handlers_add( attr, val, key ) {
			attr[key] = key.indexOf( 'data-' ) === 0 ? ( this.id + '::' + val ) : val;
			return attr;
		}
		function handlers_rem( attr, val, key ) {
			attr[key] = '';
			return attr;
		}

		var props_all       = 'selectables selected unselected'.split( ' ' ),
			props_selection = props_all.slice( 1 ),
			clear_all       = clear.bind( props_all ),
			clear_selection = clear.bind( props_selection ),
			selection_types = {
				multiple : true,
				none     : true,
				single   : true
			},
			view_attr       = {
				'data-click'      : 'handleItemClick',
				'data-mouseenter' : 'handleItemOver',
				'data-mouseleave' : 'handleItemOut',
				 role             : 'button'
			};

		return {
// class configuration
			extend            : Object,
			module            : __lib__,

// instance configuration

// accessors
			selectables       : { get : function() {
				return elements( this, 'find', this.slcItem, 'selectables' );
			} },
			selected          : { get : function() {
				return elements( this, 'find', this.slcItemSelected, 'selected' );
			} },
			selectionType     : {
				get : function() {
					return cached( this ).selectionType;
				},
				set : function( val ) {
						val   = String( val ).toLowerCase();
					var cache = cached( this ), el,
						oval  = cache.selectionType;

					if ( oval === val || !( val in selection_types ) ) return oval;

					cache.selectionType = val;

					if ( this.ready ) {
						switch( val ) {
							case 'none'   : this.deselectAll(); break;
							case 'single' :
								if ( this.selected.length > 1 ) {
									el = this.selected[0];
									this.select( el );
								}
								break;
						}

						this.broadcast( 'change:selectiontype', this, val, oval );
					}

					return val;
				}
			},
			unselected        : { get : function() {
				return elements( this, 'not', this.slcItemSelected, 'unselected' );
			} },

// public methods
			deselect          : function( item ) {
				   !this.interactive
				|| !this.isSelected( item )
				||  this.broadcast( 'before:deselect:item', ( item = this.getItem( item ) ) ) === false
				||  this.onDeselect( item ).broadcast( 'deselect:item', item );
			},
			deselectAll       : function( silent ) {
				if ( !this.interactive ) return;

				if ( silent === true )
					return this.onDeselectAll();

				clear_prop( this, 'selected' );

				  !this.selected.length
				|| this.broadcast( 'before:deselect:all' ) === false
				|| this.onDeselectAll().broadcast( 'deselect:all' );
			},
			getItem           : function( item ) {
				if ( util.type( item ) == 'element[]' )
					item = item[0];

				switch ( util.type( item ) ) {
					case 'string'      : item = this.$el.find( item )[0] || this.$el.find( '#' + item )[0] || null; break;
					case 'htmlelement' : item = this.$el.contains( item ) ? item : null;                            break;
					default            : return null;
				}

				return item ? api.$( item ) : null;
			},
			invertSelection   : function() {
				!this.interactive || this.broadcast( 'before:select:inverse' ) === false || this.onInvertSelection().broadcast( 'select:inverse' );
			},
			isSelected        : function( item ) {
				return ( item = this.getItem( item ) ) ? item.hasClass( this.clsItemSelected ) : false;
			},
			refreshView       : function() {
				var selected = this.selected;

				clear_all( this );

				switch ( this.selectionType ) {
					case 'multiple' : case 'single' :
						this.selectables.attr( Object.reduce( util.merge( view_attr ), handlers_add.bind( this ), util.obj() ) );

						if ( selected.length ) {
							if ( this.selectionType === 'multiple' )
								Array.coerce( this.$el.find( Array.coerce( selected ).map( get_id ).join( ', ' ) ) ).map( this.select, this );
							else
								this.select( this.$el.find( selected[0] ) );
						}
						break;
					default         :
						this.selectables.attr( Object.reduce( util.merge( view_attr ), handlers_rem.bind( this ), util.obj() ) );
				}
			},
			select            : function( item ) {
				   !this.interactive
				||  this.selectionType === 'none'
				|| !( item = this.getItem( item ) )
				||  this.isSelected( item )
				||  this.broadcast( 'before:select:item', item ) === false
				||  this.onSelect( item ).broadcast( 'select:item', item );
			},
			selectAll         : function( silent ) {
				if ( !this.interactive || this.selectionType !== 'multiple' ) return;

				if ( silent === true )
					return this.onSelectAll();

				clear_prop( this, 'unselected' );

				  !this.unselected.length
				|| this.broadcast( 'before:select:all' ) === false
				|| this.onSelectAll().broadcast( 'select:all' );
			},
			toggle            : function( item ) {
				if ( item = this.getItem( item ) )
					this[this.isSelected( item ) ? 'deselect' : 'select']( item );
			},
// stub methods
			onDeselect        : function( item ) {
				clear_selection( this );

				item.removeClass( this.clsItemSelected );

				clear_selection( this );
			},
			onDeselectAll     : function() {
				clear_selection( this );

				this.selected.removeClass( this.clsItemSelected );

				clear_selection( this );
			},
			onInvertSelection : function() {
				var cls        = this.clsItemSelected,
					selected   = this.selected,
					unselected = this.unselected;

				clear_selection( this );

				selected.removeClass( cls );
				unselected.addClass( cls );

				clear_selection( this );
			},
			onSelect          : function( item ) {
				clear_selection( this );

				if ( this.selectionType === 'single' )
					this.deselect( this.selected );

				item.addClass( this.clsItemSelected );

				clear_selection( this );
			},
			onSelectAll       : function() {
				clear_selection( this );

				this.unselected.addClass( this.clsItemSelected );

				clear_selection( this );
			},
			registerEvents    : function() {
				this.observe( {
					'after:render' : 'refreshView',
					'refs:applied' : 'refreshView'
				} );
			},
// internal methods
			init              : function() {
				if ( !this.selectionType )
					this.selectionType = 'none';

				['', 'collapsed', 'focused', 'over', 'selected'].join( ' item-' ).trim().split( ' ' ).map( this.prefixClsSlc, this );
			},
			handleItemClick   : function( evt ) {
				var el = api.$( evt.currentTarget ).closest( this.slcItem );

				if ( el.length ) {
					this.broadcast( 'item:click', el, evt );

					if ( this.selectionType !== 'none' )
						this.toggle( el );
				}
			},
			handleItemOut     : function( evt ) {
				var el = api.$( evt.currentTarget ).closest( this.slcItem );

				!el.length || !el.hasClass( this.itemOver ) || this.broadcast( 'item:out', el.removeClass( this.clsItemOver ), evt );
			},
			handleItemOver    : function( evt ) {
				var el = api.$( evt.currentTarget ).closest( this.slcItem );

				!el.length || el.hasClass( this.itemOver ) || this.broadcast( 'item:over', el.addClass( this.clsItemOver ), evt );
			}
		};
	}() );
