	util.def( __lib__, 'Validate', { value : {
		checkbox : {
			minmax : function( field, value ) {
				return true;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return !field.elField || field.elField.checked === true;
			}
		},
		date     : {
			minmax : function( field, value ) {
				return value <= field.max && value >= field.min;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return util.ntype( value ) == 'date' && value <= field.max && value >= field.min;
			}
		},
		file     : { // todo: add mime-type validation and multiple file support
			minmax : function( field, value ) {
				return true;
			},
			raw    : function( field, value ) {
				return field.elField.files[0];
			},
			val    : function( field, value ) {
				return field.elField.files[0];
			},
			valid  : function( field, value ) {
				return true;
			}
		},
		number   : {
			minmax : function( field, value ) {
				return value <= field.max && value >= field.min;
			},
			raw    : function( field, value ) {
			},
			val    : function( field, value ) {
			},
			valid  : function( field, value ) {
				return util.type( value ) == 'number' && ( field.allowDecimals || Math.floor( value ) === value );
			}
		},
		text     : {
			minmax : function( field, value ) {
				return value.length <= field.max && value.length >= field.min;
			},
			raw    : function( field, value ) {
				return value;
			},
			val    : function( field, value ) {
				return value;
			},
			valid  : function( field, value ) {
				return typeof value == 'string' && ( !field.pattern || field.pattern.test( value ) );
			}
		}
	} }, 'cw' );
	__lib__.Validate.radio = __lib__.Validate.checkbox;
	__lib__.Validate.email = __lib__.Validate.hidden = __lib__.Validate.number = __lib__.Validate.password = __lib__.Validate.text;
