
	 function addDOMListener( el, event, listener ) {
	 	var existing, el = api.$( el );

	 	if ( el.length ) {
			existing = el.attr( 'data-' + event );

			if ( existing ) {
				existing = existing.split( '|' );
				if ( !~existing.indexOf( listener ) )
					listener = existing.join( '|' ) + '|' + listener;
			}

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

		if ( typeof what != 'string' )
			what = 'widgie.Component';

		var Widgie = getClass( what ) || __lib__.Component;

		return Widgie.create( how );
	}

	function define( what, how ) {
		if ( is_obj( what ) || typeof what == 'function' ) {
			how  = what;
			if ( typeof how == 'function' )
				how = how();
		}

		if ( typeof what != 'string' ) {
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
		switch ( evt.type ) {
			case 'blur'  :
			case 'focus' :
				if ( evt.target === doc.activeElement
				 && evt.target.getAttribute( 'tabindex' )
				 && evt.target !== evt.currentTarget )
					return;
		}
		takeAction( evt.currentTarget, evt );
	}

	function handleCapture( evt ) {
		Array.coerce( doc.querySelectorAll( '[data-' + evt.type + ']' ) ).forEach( function( el ) {
			takeAction( el, evt );
		} );
	}

// todo: make all these static methods #lookup on their respective classes
	function lookupModel( model ) {
		switch ( typeof model ) {
			case 'string'   : return getClass( model ); break;
			case 'function' : return model.prototype instanceof getClass( 'data.Model' ) ? model : null;
		}

		return null;
	}
	function lookupProxy( proxy, ProxyClass ) { // noinspection FallthroughInSwitchStatementJS
		switch ( util.ntype( proxy ) ) {
			case 'object'   : proxy = proxy instanceof getClass( 'proxy.Ajax' )
									 ? proxy
									 : create( ( ProxyClass || 'proxy.Ajax' ), proxy );
									   break;
			case 'string'   : proxy = getClass( proxy ); // allow fall-through
			case 'function' : proxy = new proxy; break;
			default         : proxy = null;
		}

		return proxy || null;
	}

	function lookupSchema( schema, SchemaClass ) { // noinspection FallthroughInSwitchStatementJS
		switch ( util.ntype( schema ) ) {
			case 'array'    : schema = { properties : schema }; // allow fall-through
			case 'object'   : schema = schema instanceof getClass( 'data.Schema' )
									 ? schema
									 : create( SchemaClass || 'data.Schema', schema );
									   break;
			case 'string'   : schema = getClass( schema );      // allow fall-through
			case 'function' : schema = new schema; break;
			default         : schema = null;
		}

		return schema || null
	}
	function lookupStore( store ) {
		switch ( typeof store ) {
			case 'string'   : return getClass( store ); break;
			case 'function' : return store instanceof getClass( 'data.Store' ) ? store : null;
		}

		return null;
	}

	function register( what, Widgie ) {
		var i = what.indexOf( 'widgie' ),
			internal;

		if ( i === 0 || i === 1 )
			internal = what.split( '.' ).slice( 1 ).join( '.' );

		if ( typeof internal == 'string' )
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

				el.attr( 'data-' + event, listeners.length ? listeners.join( '|' ) : null );
			}
	 	}

	 	return __lib__;
	}

	function takeAction( el, evt ) {
		if ( el === doc || el === global )
			el = doc.body;

		var actions = el.getAttribute( 'data-' + evt.type );

		if ( typeof actions != 'string' ) return;

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
