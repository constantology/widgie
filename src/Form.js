	define( namespace( 'Form' ), function() {
		function toJSON( val, field ) {
			val[field.name || field.cmpId || field.id] = field.value;

			return val;
		}

		function toFormData( fd, field ) {
			fd.append( field.name, field.value );

			return fd;
		}

		return {
// class configuration
			constructor    : function Form() {
				this.parent( arguments );
			},
			extend       : Name + '.Box',
			module       : __lib__,
// instance configuration
			async        : true,
			clsBase      : 'w-form',
			clsDefault   : 'w-form',
			proxy        : null,
			upload       : false,
// accessors
			valid        : { get : function() {
				return this.fields.pluck( 'valid' ).every( util );
			} },
			value        : { get : function() {
				return this.fields.reduce( this.upload === true ? toFormData : toJSON, this.upload === true ? new FormData() : util.obj()  );
			} },
// public properties
// internal properties
// public methods
			reset        : function() {
				!this.interactive || this.broadcast( 'before:reset' ) === false || this.onReset().broadcast( 'reset' );
			},
			submit       : function() {
				if ( !this.interactive ) return;

				var valid = this.valid;

				if ( !valid ) {
					this.onInvalid();
					return;
				}

				this.onValid().broadcast( 'before:submit' ) === false || this.onSubmit().broadcast( 'submit' );
			},
// stub overwrite methods
			afterRender  : function() {
				this.parent( arguments );

				addDOMListener( this.$el, 'keyup', this.id + '::onKeyPress' );

				if ( this.async === false && this.proxy ) {
					this.$el.attr( {
						 action       : this.proxy.urlBase,
						 method       : this.proxy.method
					} );
					addDOMListener( this.$el, 'submit', this.id + '::handleSubmit' );
					if ( this.upload === true )
						this.$el.attr( 'enctype', 'multipart/form-data' );
				}
			},
			onAdd        : function( item ) {
				if ( item = this.parent( arguments ) ) {
					if ( item instanceof getClass( 'Field' ) )
						this.fields.push( item.observe( 'dom:blur', this.onTab, this ) );
						item.relayEvents( this, 'change', 'validate' );
				}
			},
			onChange     : function() { },
			onInvalid    : function() {
				this.$el.removeClass( this.clsValid ).addClass( this.clsInvalid );
			},
			onLoad       : function() { },
			onLoadError  : function() { },
			onLoadStart  : function() { },
			onRemove     : function( item ) {
				if ( item.parentBox === this )
					util.remove( this.fields, item );

				this.parent( arguments );
			},
			onReset      : function() {
				this.$el.removeClass( this.clsInvalid ).removeClass( this.clsValid );
				this.fields.invoke( 'reset' );
			},
			onSubmit     : function() {
				if ( this.async === false )
					this.el.submit();
				else if ( this.proxy )
					this.proxy.load( this.value );
			},
			onTab        : function( field, evt ) {
				if ( !evt ) return;

				var i = this.fields.indexOf( field );

				if ( !~i ) return;

				i = i + ( evt.shiftKey === true ? -1 : 1 );

				!this.fields[i] || this.fields[i].focus();
			},
			onValid      : function() {
				this.$el.removeClass( this.clsInvalid ).addClass( this.clsValid );
			},
			onValidate   : function() { },
// dom event listener methods
			handleSubmit : function( evt ) {
				if ( this.async !== false || !this.valid )
					evt.stop( '11' );
			},
			onKeyPress   : function( evt ) {
				var kc = api.$.event.KEY_CODE;

				if ( evt.which === kc.ENTER || evt.which === kc.RETURN )
					this.submit();
			},
// internal methods
			init         : function() {
				this.clsList += ' invalid valid';
				this.fields   = [];

				if ( this.async === false )
					this.tagName = 'form';

				this.parent( arguments ).initProxy();
			},
			initProxy    : function() {
				if ( typeof this.proxy == 'string' )
					this.proxy  = { urlBase : this.proxy };

				if ( this.proxy = lookupProxy( this.proxy ) )
					this.proxy.observe( {
						error     : 'onLoadError', load    : 'onLoad',
						loadstart : 'onLoadStart', timeout : 'onLoadError',
						ctx       : this
					} );
			},
			registerEvents : function() {
				this.parent( arguments ).observe( {
					change   : 'onChange',
					validate : 'onValidate',
					ctx      : this
				} );
			}
		};
	}() );
