	define( namespace( 'mixins.Validation' ), {
// class configuration
		extend         : Object,
		module         : __lib__,

// instance configuration
		allowDecimals  : true,
		max            : Number.POSITIVE_INFINITY,
		min            : Number.NEGATIVE_INFINITY,
		pattern        : null,
		required       : false,

// public methods
		isValid        : function( value ) {
			return __lib__.Validate[this.inputType].valid( this, value );
		},
		validate       : function( silent ) {
			var value = this.value,
				valid = this.isValid( value ) && this.onValidate( value );

			silent === true || this.broadcast( 'validate' ).broadcast( ( valid ? '' : 'in' ) + 'valid' );

			if ( this.interactive ) {
				this.$el.removeClass( this.clsValid ).removeClass( this.clsInvalid );
				if ( silent !== true )
					this.$el.addClass( this['cls' + ( valid ? 'Valid' : 'Invalid' )] );
				else
					this.$elField.val() != '' || this.$el.addClass( this['cls' + ( valid ? 'Valid' : 'Invalid' )] );
			}

			return valid;
		},
// stub overwrite methods
		onValidate     : function( value ) {
			return this.required !== true || __lib__.Validate[this.inputType].minmax( this, value );
		},
// internal methods

		init           : function() {
		},
		registerEvents : function() {
			this.observe( 'change', 'validate', this );
		}
	} );
