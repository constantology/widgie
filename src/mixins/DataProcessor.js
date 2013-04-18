	define( namespace( 'mixins.DataProcessor' ), {
// class configuration
		constructor : function DataProcessor() { //noinspection FallthroughInSwitchStatementJS
			switch ( util.ntype( this.schema ) ) {
				case 'array' : case 'object' :
					if ( !( this.schema instanceof getClass( 'DataTransform' ) ) )
						this.schema = create( 'DataTransform', this.schema );
					break;
			}
		},
		extend      : Object,
		module      : __lib__,

// instance configuration
		itemsProp   : 'items',
		schema      : null,

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
		processItem : function( item ) { return item.src || item; }
	} );
