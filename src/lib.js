
	 function addDOMListener( el, event, listener ) {
	 	var existing, el = api.$( el );

	 	if ( el.length ) {
			existing = el.attr( 'data-' + event );
			if ( existing )
				listener += '|' + existing;

			el.attr( 'data-' + event, listener );
	 	}

	 	return __lib__;
	}

	function cached( cmp ) { return priv8[cmp.id] || ( priv8[cmp.id] = util.obj() ); }

	function closest( el ) {
		id = el.getAttribute( 'data-cmp-id' ) || el.id;

		if ( id && ( cmp = Mgr.get( id ) ) )
			return cmp;

		var cmp, id, pel = el;

		do {
			if ( !pel.id )
				continue;
			else if ( cmp = Mgr.get( pel.id ) ) {
				el.setAttribute( 'data-cmp-id', pel.id );
				return cmp;
			}
		} while ( pel = pel.parentElement );

		return null;
	}

	function create( what, how ) {
		if ( is_obj( what ) ) {
			how  = what;
			what = how.widgie || how.type;
		}

		if ( !is_str( what ) )
			what = 'widgie.Component';

		var Widgie = getClass( what ) || __lib__.Component;

		return Widgie.create( how );
	}

	function define( what, how ) {
		if ( is_obj( what ) || is_fun( what ) ) {
			how  = what;
			if ( is_fun( how ) )
				how = how();
		}

		if ( !is_str( what ) ) {
			what = how.namespace || capitalize( how.type );
			delete how.namespace;
		}

		return register( what, lib.define( what, how ) );
	}

	function getClass( Class ) {
		var Widgie = lib.get( Class ) || widgies[Class];        // trying to find a Widgie

		if ( !Widgie ) {
			Class  = Class.toLowerCase();
			Widgie = lib.get( 'w.' + Class ) || widgies[Class]; // trying a little harder

			if ( !Widgie ) {
				Class  = Class.replace( /\./g, '-' );
				Widgie = lib.get( Class ) || widgies[Class];    // trying even harder!!!
			}
		}

		return Widgie || null;
	}

	function handleBubble( evt ) {
		takeAction( evt.currentTarget, evt );
	}

	function handleCapture( evt ) {
		Array.coerce( doc.querySelectorAll( '[data-' + evt.type + ']' ) ).forEach( function( el ) {
			takeAction( el, evt );
		} );
	}

	function register( what, Widgie ) {
		var i = what.indexOf( 'widgie' ),
			internal;

		if ( i === 0 || i === 1 )
			internal = what.split( '.' ).slice( 1 ).join( '.' );

		if ( is_str( internal ) )
			widgies[internal.toLowerCase().split( '.' ).join( '-' )] = widgies[internal] = Widgie;

		return Widgie;
	}
	function removeDOMListener( el, event, listener ) {
	 	var i, listeners, el = api.$( el );

	 	if ( el.length ) {
			listeners = el.attr( 'data-' + event ).split( '|' );

			if ( listeners.length ) {
				if ( !!~( i = listeners.indexOf( listener ) ) )
					listeners.splice( i, 1 );

				el.attr( 'data-' + event, listeners.join( '|' ) );
			}
	 	}

	 	return __lib__;
	}

	function takeAction( el, evt ) {
		if ( el === doc || el === global )
			el = doc.body;

		var actions = el.getAttribute( 'data-' + evt.type );

		if ( !is_str( actions ) ) return;

		actions.split( '|' ).forEach( function( action ) {
			var cmp; action = action.split( '::' );

			switch ( action.length ) {
				case 1 : action = action.shift(); break;
				case 2 : cmp    = Mgr.get( action.shift() );
						 action = action.shift();
						 !lib.is( cmp, Name + '.Component' ) || cmp.onAction( action, evt );
						 return;
			}

			!( cmp = closest( el ) ) || cmp.onAction( action, evt );
		} );
	}

	function uncache( cmp ) { return delete priv8[cmp.id]; }
