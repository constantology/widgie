	define( namespace( 'layout.Layout' ), {
// class configuartion
		constructor      : function Layout( config ) {
			util.copy( this, config || {} );

			if ( this.cmp.rendered )
				this.init();
			else
				this.cmp.once( 'after:render', 'init', this );
		},
		extend           : Object,
// instance configuration
// accessors
// public properties
		$el              : null,
		cmp              : null,
		disabled         : false,
		el               : false,
		items            : null,
// internal properties
		slcItem          : null,
// public methods
		disable          : function() {
			this.disabled = true;
		},
		enable           : function() {
			this.disabled = false;
		},
		layout           : function() {
			if ( this.cmp && this.cmp.rendered && !this.el ) this.init();

			if ( this.disabled || this.busy || this.refresh().beforeLayout() === false ) return;

			this.onLayout()
				.afterLayout();
		},
// stub method over-writes
		afterLayout      : function() {
			this.busy = false;
		},
		beforeLayout     : function() {
			this.busy = true;
		},
		onLayout         : function() { },
		refresh          : function() { },
		sync             : function() { },
// internal methods
		init             : function() {
			var cmp = this.cmp,
				el  = cmp.el;

			this.$el      = cmp.$el;
			this.el       = el;
			this.slcItem  = cmp.slcItem;

			this.elOffset = /absolute|relative/.test( global.getComputedStyle( el, null ).position )
						   ? el
						   : el.offsetParent;

			cmp.observe( {
				append : 'layout',
				update : 'layout',
				ctx    : this
			} );

			!cmp.rendered || !cmp.active || this.layout();
		}
	} );
