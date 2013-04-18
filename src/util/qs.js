	QueryString = lib.Class( {
		constructor : function() {
			this._decode_ = this._decode.bind( this );
			this._encode_ = this._encode.bind( this );
		},
		extend      : Object,
//		module      : __lib__,
//		singleton   : true,

		decode      : function( qs ) {
			qs = qs.indexOf( '?' ) === 0 ? qs.substring( 1 ) : qs;
			var qso = util.obj();
			return qs.length ? qs.split( '&' ).reduce( this._decode_, qso ) : qso;
		},
		encode      : function( qs ) {
			return '?' + Object.reduce( qs, this._encode_, '' ).substring( 1 );
		},
		_decode     : function( qs, item ) {
			item = item.split( '=' );

			var key = decodeURI( item.shift() ), val = decodeURI( item.shift() );

			if ( key in qs ) {
				if ( !Array.isArray( qs[key] ) )
					qs[key] = [qs[key]];
				qs[key].push( val );
			}
			else qs[key] = val;

			return qs;
		},
		_encode     : function( qs, val, key ) {
			key = '&' + encodeURI( key ) + '='; // noinspection FallthroughInSwitchStatementJS
			switch ( util.ntype( val ) ) {
				case 'array'   : qs += key + val.map( encodeURI ).join( key ); break;
				case 'date'    : val = +val;                                // allow fall-through
				case 'boolean' : case 'number' : case 'string' : qs += key + encodeURI( val );
			}
			return qs;
		}
	} );

// goddamn chrome v26 is intermittently doing some weird shizzle, so need to remove singletons for now
	util.def( __lib__, 'qs', { value : new QueryString }, 'cw' );
