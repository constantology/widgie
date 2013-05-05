	function capitalize( str ) {
		str = String( str );
		return str.charAt( 0 ).toUpperCase() + str.substring( 1 );
	}

	function is_date( item ) { return util.ntype( item ) == 'date'; }
	function is_dom( item )  { return util.type( item )  == 'htmlelement'; }
	function is_el( item )   { return util.ntype( item ) == 'element[]'; }
	function is_evt( item )  { return util.ntype( item ) == 'event'; }
	function is_obj( item )  { return util.ntype( item ) == 'object'; }
	function is_num( item )  { return typeof item == 'number' && !isNaN( item ); }
	function is_true( v )    { return v === true; }

	function namespace( ClassName ) { return '^' + Name + '.' + ClassName; }

	function to_obj( val, prop ) {
		val[prop] = true;
		return val;
	}
