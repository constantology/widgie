	util.def( __lib__, 'Validate', { value : {
		date   : {
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
		number : {
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
		text   : {
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
	__lib__.Validate.password = __lib__.Validate.text;
