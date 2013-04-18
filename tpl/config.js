{
	"compiled"  : true,
	"execute"   : function( cmp, method ) {
		return typeof cmp[method] == 'function'
			 ? cmp[method].apply( cmp, Array.coerce( arguments, 2 ) )
			 : '';
	},
	"prepare"   : function( cmp ) {
		return cmp.prepare( cmp.data ? cmp.data : null );
	},
	"sort"      : function( items, field ) { //schwartzian transform
		return items.values.map( function( item ) {
			return [item[field], item];
		} ).sort( function( a, b ) {
			return a[0] == b[0] ? 0 : a[0] < b[0] ? 1 : -1;
		} ).map( function( item ) {
			return item[1];
		} );
	},
	"toJSON"    : function( items ) {
		return items.valueOf();
	}
}
