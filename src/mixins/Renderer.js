	define( namespace( 'mixins.Renderer' ), {
// class configuration
		extend          : Object,
		module          : __lib__,

// instance configuration
		slcCt           : 'body',
		tpl             :  Name + '.component',

// flags
		dead            : { get : function() {
			return this.destroyed || this.destroying;
		} },
		destroyed       : false,
		destroying      : false,
		ready           : { get : function() {
			return this.rendered && !this.dead;
		} },
		rendered        : false,
		rendering       : false,

// properties
		$ct             : null,
		$el             : null,
		ct              : null,
		el              : null,
		suspendUpdate   : 0,

// public methods
		render          : function( ct ) {
			if ( this.ready || this.dead || this.broadcast( 'before:render' ) === false )
				return;
			this.rendering = true;
			this.assignContainer( ct ).onRender().afterRender();
			this.rendering = false;
		},
		prepareFragment : function( data, tpl ) {
			var html; // noinspection FallthroughInSwitchStatementJS
			switch ( util.type( data ) ) {
				case 'object'                :
				case 'nullobject'            :
				case 'array'                 :
				case Name_lc + '-data-store' : html = this.parse( tpl, data ); break;
				case 'string'                :                                             break;
				case 'null'                  : html = '';                                  break;
				case 'htmlelement'           :
				case 'documentfragment'      : return data;
				case 'htmlcollection'        :
				case 'element[]'             : html = data;                                break;
				default                      : return null;
			}

			if ( is_str( html ) )
				html = html.trim();

			return this.fragmentalize( html ? html : '' );
		},
		toElement       : function( tpl, data ) {
			return api.$( this.parse( tpl, data ) );
		},
// stub methods
		afterRender     : function() {
			 this.broadcast( 'after:render' );

			!is_bool( this.active ) || this[( this.active === true ? '' : 'de' ) + 'activate']();

			if ( this.focusable !== false ) {
				addDOMListener( this.$elFocus, 'blur',  this.id + '::blur' );
				addDOMListener( this.$elFocus, 'focus', this.id + '::focus' );

				if ( this.focused === true  ) {
					this.focused = false;
					this.focus();
				}
			}
		},
		onAppend        : function( frag ) {
			this[this.updateTarget][0].appendChild( frag );
		},
		onDestroy       : function() {
			if ( this.rendered ) {
				this.rendered = false;
				this.$el.remove();
				util.remove( this, '$ct $el ct el'.split( ' ' ) );
			}
		},
		onRender        : function() {
			this.createDOM();

			this.$el.appendTo( this.ct );

			this.rendered = true;

			this.broadcast( 'render' );

			if ( !( this.updateTarget in this ) )
				this.updateTarget = this.$elCt ? '$elCt' : '$el';
		},
		onUpdate        : function( frag ) {
			this[this.updateTarget].html( null )[0].appendChild( frag );
//			( this.$elCt || this.$el ).html( html );
		},
// internal methods
		assignContainer : function( ct ) {
			var type = util.type( ct );
			if ( util.exists( ct ) ) {
				if ( type == 'element[]' )
					this.$ct = ct;
				else if ( type == 'string' || type == 'htmlelement' )
					this.$ct = api.$( ct );
				else if ( lib.is( ct, Name + '.Box' ) )
					this.$ct = ct[ct.prop.ctItems] || ct.$elCt || ct.$el;
				else if ( this.slcCt )
					this.$ct = api.$( this.slcCt );
			}

			if ( this.$ct )
				this.ct = this.$ct[0];
		},
		createDOM       : function() {
			this.$el = this.toElement( this.tpl, null ).attr( 'id', this.id ).data( 'transitionend', 'afterTransition' );
			this.el  = this.$el[0];

			!this.$el.hasClass( this.clsDefault ) || this.$el.addClass( this.clsDefault );

			if ( !!~this.el.firstElementChild.className.indexOf( this.clsBase + '-ct' ) ) {
				this.elCt  = this.el.firstElementChild;
				this.$elCt = api.$( this.elCt );
			}
		},
		fragmentalize   : function( html ) {
			var frag = doc.createDocumentFragment();

			api.$( html ).appendTo( frag );

			return frag;
		},
		init            : function() {
			this.tpl = api.tpl.create( this.tpl );
		}
	} );
