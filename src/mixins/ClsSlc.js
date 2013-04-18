	define( namespace( 'mixins.ClsSlc' ), {
// class configuration
		extend       : Object,
		module       : __lib__,

// instance configuration
		clsList      : 'active collapsed focused disabled expanded hidden item',

// internal methods
		init         : function() {
			this.slcBase = '.' + this.clsBase; //noinspection FallthroughInSwitchStatementJS

			switch ( util.ntype( this.clsList ) ) {
				case 'string' : this.clsList = this.clsList.split( ' ' ); // allow fall-through
				case 'array'  : this.clsList.map( this.prefixClsSlc, this ); break;
			}
		},
		prefixClsSlc : function( state ) {
			var left  = state.split( '-' ).map( capitalize ).join( '' ),
				right = '-' + state;

			this['cls' + left] = this.clsBase + right;
			this['slc' + left] = this.slcBase + right;
		}
	} );
