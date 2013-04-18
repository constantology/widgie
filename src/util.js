	function capitalize( str ) {
		str = String( str );
		return str.charAt( 0 ).toUpperCase() + str.substring( 1 );
	}

	function is_arr( item )  { return Array.isArray( item ); }
	function is_bool( item ) { return util.ntype( item ) == 'boolean'; }
	function is_date( item ) { return util.ntype( item ) == 'date'; }
	function is_dom( item )  { return util.type( item )  == 'htmlelement'; }
	function is_el( item )   { return util.ntype( item ) == 'element[]'; }
	function is_evt( item )  { return util.ntype( item ) == 'event'; }
	function is_fun( item )  { return util.ntype( item ) == 'function'; }
	function is_obj( item )  { return util.ntype( item ) == 'object'; }
	function is_num( item )  { return util.type( item )  == 'number'; }
	function is_str( item )  { return util.ntype( item ) == 'string'; }
	function is_true( v )    { return v === true; }

	function namespace( ClassName ) { return '^' + Name + '.' + ClassName; }

	function to_obj( val, prop ) {
		val[prop] = true;
		return val;
	}
