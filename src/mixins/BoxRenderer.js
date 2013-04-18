	define( namespace( 'mixins.BoxRenderer' ), {
// class configuration
		extend      : namespace( 'mixins.Renderer' ),
		module      : __lib__,

// instance configuration
		autoRender  : true,
		tpl         :  Name + '.box',

// stub methods
		onRemove    : function( item ) {
			item.$el.remove();
		},
		onRender    : function() {
			this.parent().renderItems();
		},
// internal methods,
		adopt       : function( item, insert, index ) {
			if ( !this.rendered || this.autoRender === false ) return;

			item.render( this[this.$_items] ).$el.css( 'display', 'none' );

			!insert || item.$el.insertBefore( this.items[index >= 0 ? index : this.items.length + index].el );

			item.$el.css( 'display', '' );
		},
		destroyItem : function( item ) {
			return item.destroy();
		},
		renderItem  : function( item ) {
			if ( item.rendered && this.el.contains( item.el ) )
				return item;
			return item.render( this[this.$_items] );
		},
		renderItems : function() {
			!this.items.length || this.items.map( this.renderItem, this );
		}
	} );
