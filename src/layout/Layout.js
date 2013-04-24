	define( namespace( 'layout.Layout' ), {
// class configuartion
		constructor      : function Layout( config ) {
			util.copy( this, config || {} );

			this.afterLayout_ = this.afterLayout.callback( { ctx : this, delay : 50 } );

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
		forceLayout       : function() {
			this.layout( true );
		},
		layout           : function( force ) {
			force = force === true;

			if ( this.cmp && this.cmp.rendered && !this.el ) this.init();

			if ( this.disabled || this.busy ) return;

			if ( this.refresh( force ).beforeLayout( force ) === false ) {
				this.busy = false;
				return;
			}

			this.onLayout( force )
				.afterLayout_( force );

			return;
		},
// stub method over-writes
		afterLayout      : function( force ) {
			this.busy = false;
		},
		beforeLayout     : function( force ) {
			this.busy = true;
		},
		onLayout         : function( force ) { },
		refresh          : function( force ) { },
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
				'change:dom' : 'forceLayout',
				 ctx         :  this,
				 options     : { delay : 200 }
			} );

			!cmp.rendered || !cmp.active || this.layout();
		}
	} );
