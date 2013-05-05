	define( namespace( 'Component' ), {
// class configuration
		constructor     : function Component( config ) {
			this.parent( arguments )
				.mixin( 'observer', [this.__config__.observers] )
				.mixin( 'processor' )
				.registerEvents();
		},
		extend          : lib.Source,
		mixins          : {
			clslc       : Name + '.mixins.ClsSlc',
//			dataview    : Name + '.mixins.DataView',
			observer    : 'Observer',
			processor   : Name + '.mixins.DataProcessor',
			domrefs     : Name + '.mixins.DOMRefs',
			renderer    : Name + '.mixins.Renderer'
		},
		module          : __lib__,
// instance configuration
		autoLoad        :  true,
		bound           :  null,
		cls             :  null,
		clsAnim         : 'w-anim',
		clsBase         : 'w-cmp',
		clsDefault      : 'w-cmp',
		focusable       :  true,
		html            :  null,
		layout          :  null,
		slcFocus        :  null,
		tagName         : 'div',
		updateTarget    : '$elCt',
// accessors
		collapsed       : {
			get : function() {
				return this.ready && this.$el.hasClass( this.clsCollapsed );
			},
			set : function( val ) {
				val = !!val;

				if ( this.collapsed !== val )
					this[val ? 'collapse' : 'expand']();

				return val;
			}
		},
		visible         : {
			get : function() {
				return this.ready && !( this.$el.hasClass( this.clsHidden ) || !this.$el.displayed() );
			},
			set : function( val ) {
				val = !!val;

				if ( this.visible !== val )
					this[val ? 'show' : 'hide']();

				return val;
			}
		},
// flags
		active          : null,
		focused         : false,
		disabled        : false,
		interactive     : { get : function() {
			return this.ready && this.visible && !this.disabled;// && ( !this.parentBox || this.parentBox.interactive );
		} },
// properties
		id              : null,
// public methods
		activate        : function() {
			this.active === true || !this.interactive || this.broadcast( 'before:activate' ) === false || this.onActivate().broadcast( 'activate' );
		},
		append          : function( data, tpl ) {
			if ( this.dead ) return;
			if ( !this.rendered ) this.render();
			data === UNDEF || this.disabled || this.broadcast( 'before:append', data, tpl ) === false || this.onAppend( data, tpl || this.tplContent );
		},
		blur            : function( evt ) {
			!this.interactive || this.focusable === false || !this.focused || this.broadcast( 'before:blur', evt ) === false || this.onBlur().broadcast( 'blur', evt );
		},
		collapse        : function() {
			 this.collapsed || !this.interactive || this.broadcast( 'before:collapse' ) === false || this.onCollapse().broadcast( 'collapse' );
		},
		deactivate      : function() {
			this.active === false || !this.interactive || this.broadcast( 'before:deactivate' ) === false || this.onDeactivate().broadcast( 'deactivate' );
		},
		destroy         : function() {
			!this.interactive || this.mixin( 'observer' );
		},
		disable         : function() {
			 this.disabled || this.broadcast( 'before:disable' ) === false || this.onDisable().broadcast( 'disable' );
		},
		enable          : function() {
			!this.disabled || this.broadcast( 'before:enable'  ) === false || this.onEnable().broadcast( 'enable' );
		},
		expand          : function() {
			!this.collapsed || !this.interactive || this.broadcast( 'before:expand' ) === false || this.onExpand().broadcast( 'expand' );
		},
		focus           : function( evt ) {
			!this.interactive || this.focusable === false || this.focused || this.broadcast( 'before:focus', evt ) === false || this.onFocus().broadcast( 'focus', evt );
		},
		hide            : function() {
			if ( !this.rendered ) this.render();
			!this.visible || !this.interactive || this.broadcast( 'before:hide' ) === false || this.onHide();
		},
		load            : function( config ) {
			this.suspendApply || ++this.suspendApply;

			if ( this.disabled || this.broadcast( 'before:load', config ) === false ) return;

			this.store.fetch( config );

			this.broadcast( 'load:start', config );
		},
		loadAppend      : function( config ) {
			this.suspendApply || ++this.suspendApply;

			if ( this.disabled || this.broadcast( 'before:load', config ) === false ) return;

			this.store.fetch( config, { append : true } );

			this.broadcast( 'load:start', config );
		},
		refreshView     : function( store, options ) {
			!this.suspendApply || --this.suspendApply;
			this.applySelectors();
			if ( this.store ) {
				this[is_obj( options ) && options.append === true ? 'append' : 'update']( this.store.toJSON() );
//				this.replaceCached().updateBindings();
				this.store.findAll( function( node ) {
					return !this.has( node.id );
				}, this.store.view ).invoke( 'getBoundEl', this ).invoke( 'remove' );
			}
		},
		replaceCached   : function() {
			!this.bound || this[this.updateTarget].find( '.replace-cached' ).map( this._replaceCached, this );
		},
		show            : function() {
			if ( !this.rendered ) this.render();
			!this.ready || this.visible || this.broadcast( 'before:show' ) === false || this.onShow();
		},
		update          : function( data, tpl ) {
			if ( this.dead ) return;
			if ( !this.rendered ) this.render();
			if ( this.suspendUpdate ) return;
			if ( ( !data || data === this ) && this.store )
				data = this.store;
			data === UNDEF || this.disabled || this.broadcast( 'before:update', data, tpl ) === false || this.onUpdate( data, tpl || this.tplContent );
		},
		updateBindings  : function() {
			this.store.bindView( this );
			this.bound = this.store.data.aggregate( this.bound || util.obj(), this._updateBindings, this );
		},
// stub methods
		afterActivate   : function() { this.broadcast( 'after:activate' ); },
		afterAppend     : function() {
			this[this.updateTarget].find( '.replace-cached' ).remove();
			!this.store  || this.replaceCached().updateBindings();
//			!this.layout || this.layout.layout();
			this.broadcast( 'append' ).broadcast( 'change:dom' );
		},
		afterCollapse   : function() { this.broadcast( 'after:collapse' ); },
		afterDeactivate : function() { this.broadcast( 'after:deactivate' ); },
		afterExpand     : function() { this.broadcast( 'after:expand' ); },
		afterHide       : function() { this.broadcast( 'after:hide' ); },
		afterShow       : function() { this.broadcast( 'after:show' ); },
		afterUpdate     : function() {
			!this.store  || this.replaceCached().updateBindings();
//			!this.layout || this.layout.layout();
			 this.broadcast( 'update' ).broadcast( 'change:dom' );
		},
		afterTransition : function() {
			typeof this[this.afterEvent] != 'function' || this[this.afterEvent]();
			delete this.afterEvent;
		},
		onActivate      : function() {
			this.afterEvent = 'afterActivate';
			this.active     = true;
			this.$el.addClass( this.clsActive );
		},
		onAppend        : function( data, tpl ) {
			var frag = this.prepareFragment( data, tpl );
			!frag || this.mixin( 'renderer', [frag] ).afterAppend();
		},
		onBlur          : function() {
			 this.focused = false;
			 this.$el.removeClass( this.clsFocused );
			!this.elFocus || this.elFocus.blur();
		},
		onCollapse      : function() {
			if ( !this.ready ) return;
			this.afterEvent = 'afterCollapse';
			this.$el.addClass( this.clsCollapsed );
		},
		onDeactivate    : function() {
			this.afterEvent = 'afterDeactivate';
			this.active     = false;
			this.$el.removeClass( this.clsActive );
		},
		onDestroy       : function() {
			uncache( this );
			this.mixin( 'renderer' );
		},
		onDisable       : function() {
			 this.disabled = true;
			!this.ready || this.$el.addClass( this.clsDisabled );
		},
		onEnable        : function() {
			 this.disabled = false;
			!this.ready || this.$el.removeClass( this.clsDisabled );
		},
		onExpand        : function() {
			if ( !this.ready ) return;
			this.afterEvent = 'afterExpand';
			this.$el.removeClass( this.clsCollapsed );
		},
		onFocus         : function() {
			 this.focused = true;
			 this.$el.addClass( this.clsFocused );
			!this.elFocus || this.elFocus.focus();
		},
		onHide          : function() {
			this.afterEvent = 'afterHide';
			this.$el.addClass( this.clsHidden );
		},
		onRender        : function() {
//			this.$el.on( api.event.transitionend, this.afterTransition_ );
			if ( this.store ) {
				if ( this.store.size )
					this.once( 'after:render', this.update, this );
				else if ( this.autoLoad !== false )
					this.load();
			}

			 this.mixin( 'renderer' );

			!this.disabled || this.disable();

			if ( this.hidden === true ) {
				this.hide();
				delete this.hidden;
			}
		},
		onShow          : function() {
			this.afterEvent = 'afterShow';
			this.$el.removeClass( this.clsHidden );
		},
		onUpdate        : function( data, tpl ) {
			var frag = this.prepareFragment( data, tpl );
			!frag || this.mixin( 'renderer', [frag] ).afterUpdate();
		},
		registerEvents  : function() {
			this.mixin( 'dataview' )
				.mixin( 'domrefs' );

			this.once( 'before:render', 'initLayout', this );

			!this.store || this.store.observe( {
				'change:data' : 'refreshView',
				'change:view' : 'refreshView',
				 ctx          :  this
			} );
		},
// internal methods,
		_replaceCached  : function( replacer ) {
			var id  = replacer.getAttribute( 'data-replace-id' ),
				elp = replacer.parentNode,
				el  = this.bound[id],
				data;

			if ( el ) {
				data = api.$( replacer ).data();
				delete data.replaceId;
				elp.replaceChild( el.data( data )[0], replacer );
			}
			else // just to play it safe
				elp.removeChild( replacer );
		},
		_updateBindings : function( bound, node, id ) {
			var el = node.getBoundEl( this.id );

			if ( el ) bound[id] = el;

			return bound;
		},
		init            : function() {
			this.parent()
				.mixin( 'clslc' )
				.mixin( 'dataview' )
				.mixin( 'domrefs' )
				.mixin( 'renderer' )
				.initStore();

			if ( this.tplContent )
				this.tplContent = api.tpl.create( this.tplContent ) || null;

			if ( !this.updateTarget )
				this.updateTarget = '$elCt';

			Mgr.include( this );
		},
		initConfig      : function( config ) {
			config = this.parent( arguments );

			this.id = this.id || config.id || this.clsBase + '-' + ( ++getClass( util.type( this ) ).count );

			delete config.id;

			return config;
		},
		initLayout      : function() {
			if ( this.layout instanceof getClass( 'layout.Layout' ) ) return;

			switch ( util.type( this.layout ) ) {
				case 'string' :
					var Layout = getClass( this.layout );

					if ( Layout.prototype instanceof getClass( 'layout.Layout' ) )
						this.layout = Layout.create( { cmp : this } );

					break;
				case 'object' :
					this.layout.cmp = this;
					this.layout     = create( this.layout );

					break;
				default       : this.layout = null;
			}
		},
		initStore       : function() {
			var s = this.store;                  // noinspection FallthroughInSwitchStatementJS
			switch ( util.type( s ) ) {
				case 'string'     :
				case 'function'   :
					s = lookupStore( s );
					if ( s ) this.store = new s;
					break;
				case 'object'     :
					this.store = s instanceof getClass( 'data.Collection' ) ? s : widgie.create( 'data.Collection', s );
			}
		},
		onAction        : function( action, evt ) {
			if ( typeof this[action] == 'function' )
				this[action]( evt );
		},
		syncSize        : function() {}
	} );

	getClass( 'Component' ).count = 999;

	util.defs( __lib__, {
		Mgr : { value : ( Mgr = lib( Name + '.TypedHash', { Type : __lib__.Component } ) ) },
		get : Mgr.get.bind( Mgr )
	}, 'r' );
