	define( namespace( 'mixins.DataProcessor' ), {
// class configuration
		constructor : function DataProcessor() {},
		extend      : Object,
		module      : __lib__,

// instance configuration

// public methods
		parse       : function( tpl, data ) { return tpl ? api.tpl.parse( tpl, this.prepare( data ) ) : ''; },
		prepare     : function( data ) {
			var dict = { '@' : this };
			return typeof data == 'object' ? util.copy( dict, this.process( data ), true ) : dict;
		},

// internal methods
		process     : function( data ) {
			switch ( util.type( data ) ) {
				case 'object'                :
				case 'nullobject'            : return 'items' in data ? data.items.map( this.processItem, this ) : data;
				case 'array'                 : return { items : data.map( this.processItem, this  ) };
				case Name_lc + '-data-store' : return { items : data.view.ovalues.map( this.processItem, this  ) };
			}
			return { items : [] };
		},
		processItem : function( item ) { return item.toJSON ? item.toJSON() : item.src || item; }
	} );
