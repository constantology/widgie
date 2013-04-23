	define( namespace( 'Field' ), function() {
		return {
			constructor    : function Field() {
				this.parent( arguments );
			},
			extend         : Name + '.Component',
			mixins         : {
				validation : Name + '.mixins.Validation'
			},
			module         : __lib__,
// instance configuration
			clsBase        : 'w-field',
			errorMsg       : null,
			format         : null,
			inputType      : null,
			multiLine      : false,
			name           : null,
			toolTip        : null,
			tpl            : Name_lc + '.field',
			watchInterval  : 10,
// accessors
			label          : {
				get        : function() {
					return cached( this ).label;
				},
				set        : function( label ) {
					cached( this ).label = label;

					if ( this.ready )
						this.$elLabel.html( cached( this ).label );

					return this.label;
				}
			},
			valid          : { get : function() {
				return this.validate( true );
			} },
			value          : {
				get        : function() {
					return cached( this ).value;
				},
				set        : function( raw ) {
					var c = cached( this ),
						v = this.rawToVal( raw ),
						r = this.valToRaw( v );

					if ( util.empty( raw ) && !util.empty( c.value ) ) {
						c.val_prev = c.value;
						c.value    = UNDEF;

						this.broadcast( 'change', c.value, c.val_prev );
					}
					else if ( v !== c.value ) {
						if ( this.isValid( v ) ) {
							c.val_prev = c.value;
							c.value    = v;

							if ( this.ready ) {
								this.$elField.val( this.valToRaw( v ) );
								this.broadcast( 'change', v, c.val_prev );
							}

						}
						else {
							if ( this.ready ) {
								this.$elField.val( this.valToRaw( c.value ) );
								this.broadcast( 'change', c.value, c.val_prev );
							}
						}
					}

					return c.value;
				}
			},
// public properties
// internal properties
			_iid           : null,
			_inputType     : null,
			$elField       : null,
			$elLabel       : null,
			elField        : null,
			elLabel        : null,
// public methods
			clear          : function() {
				!this.interactive || this.broadcast( 'before:clear' ) === false || this.onClear().broadcast( 'clear' );
			},
			reset          : function() {
				!this.interactive || this.broadcast( 'before:reset' ) === false || this.onReset().broadcast( 'reset' );
			},
			rawToVal       : function( val ) {
				return __lib__.Validate[this.inputType].val( this, val );
			},
			valToRaw       : function( val ) {
				return __lib__.Validate[this.inputType].raw( this, val );
			},
// stub overwrite methods
			afterRender    : function() {
				this.parent( arguments );
				this.$elField.val( this.value );
				switch ( this.inputType ) {
					case 'checkbox' : case 'radio' :
						this.$elField.attr( 'data-click', this.id + '::onFocus' );
				}
			},
			onBlur         : function() {
				this.parent( arguments ).watchStop().validate();
			},
			onClear        : function() {
				this.$elField.val( '' );
				this.handleChange();
			},
			onFocus        : function() {
				this.parent( arguments ).watchStart().validate();
			},
			onReset        : function() {
				this.$elField.val( cached( this ).val_initial );
				this.handleChange();
			},
// dom event listener methods
			handleBlur     : function( evt ) {
				!evt || evt.target !== this.elFocus || this.broadcast( 'dom:blur', evt );
			},
			handleChange   : function() {
				this.value = this.$elField.val();
			},
			handleFocus    : function( evt ) {
				!evt || evt.target !== this.elFocus || this.broadcast( 'dom:focus', evt );
			},
// internal methods
			init           : function() {
				this.clsList      += ' invalid valid';
				this.slcFocus      = '.' + this.clsBase + '-input';

				this.name          = this.name || this.cmpId || this.id;

				this.handleChange_ = this.handleChange.bind( this );

				if ( this.inputType === 'date' && !this.format )
					this.format = 'c';

				this._inputType = this.inputType === 'number' ? 'text' : this.inputType;

				this.parent( arguments ).mixin( 'validation' );

				var c = cached( this );

				c.val_initial = this.value;
			},
			registerEvents : function() {
				this.parent( arguments ).mixin( 'validation', arguments );
			},
			watchStart     : function() {
				if ( this._iid !== null ) return;

				this._iid = setInterval( this.handleChange_, this.watchInterval );

				this.handleChange();
			},
			watchStop      : function() {
				if ( this._iid === null ) return;

				clearInterval( this._iid ); this._iid = null;

				this.handleChange();
			}
		};
	}() );
