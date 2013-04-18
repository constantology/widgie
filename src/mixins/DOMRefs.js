	define( namespace( 'mixins.DOMRefs' ), function() {
		var $1 = '$1', re = /^\$?el(.*)/;
		return {
// class configuration
			extend           : Object,
			module           : __lib__,

// instance configuration
			selectors        :  null,
			slcRef           : '[data-ref]',

// properties
			refs             : null,
			suspendApply     : 0,

// public methods
			getRef           : function( ref, dom ) {
				dom = Boolean.coerce( dom );
				ref = String( ref ).replace( re, $1 );

				ref = ( !dom ? '$' : '' ) + 'el' + ref.split( '-' ).map( capitalize );

				return this[ref] || null;
			},
			applySelectors   : function() {
				if ( this.suspendApply ) return;

				this.applyDOMRefs();

				!is_obj( this.refs ) || Object.reduce( this.refs, this.applySelector, this );

				if ( !this.refs.focus && !this.elFocus ) {
					this.$elFocus = this.$el;
					this.elFocus  = this.el;
				}

				this.broadcast( 'refs:applied' );
			},
			unapplySelectors : function() {
				!is_obj( this.refs ) || Object.reduce( this.refs, this.unapplySelector, this );

				this.broadcast( 'refs:unapplied' );
			},
			updateEl         : function( ref, html ) {
				   !this.interactive
				|| !( ref = this.getRef( ref ) )
				|| this.broadcast( 'before:update:element', ref, html ) === false
				|| this.onUpdateEl( ref, html ).broadcast( 'update:element', ref );
			},
// stub methods
			onUpdateEl       : function( ref, html ) { ref.html( html ); },
// internal methods
			applyDOMRef      : function( el, ref ) {
				switch( util.type( el ) ) {
					case 'element[]'   :                           break;
					case 'htmlelement' : el = api.$( el );         break;
					case 'string'      : el = this.$el.find( el ); break;
					default            : return;
				}

				if ( typeof ref != 'string' )
					ref = el.data( 'ref' );

				if ( el && el.length ) {
					ref             = 'el' + capitalize( ref );
					this['$' + ref] = el;
					this[ref]       = this['$' + ref][0];
				}
			},
			applyDOMRefs     : function() { // we could simplify this, but then janeQuery/zepto would not work correctly
				Array.coerce( this.$el.find( this.slcRef ) ).map( this.applyDOMRef, this );
			},
			applySelector    : function( ctx, slc, ref ) { return ctx.applyDOMRef( slc, ref ); },
			init             : function() {
				this.prepareRefs();

				if ( !is_obj( this.refs ) )
					this.refs = {};

				if ( this.slcFocus ) {
					this.refs.focus = this.slcFocus;
					delete this.slcFocus;
				}

				!is_obj( this.selectors ) || util.copy( this.refs, this.selectors, true );
			},
			prepareRefs      : util.noop,
			registerEvents   : function() {
				this.observe( {
					destroy : 'unapplySelectors',
					render  : 'applySelectors',
					update  : 'applySelectors'
				} );
			},
			unapplySelector  : function( ctx, slc, ref ) {
				ref = 'el' + capitalize( ref );
				util.remove( this, [ref, '$' + ref] );
				return ctx; // note reduce works differently to other iterators, this is why we are returning the instance here
			}
		};
	}() );
