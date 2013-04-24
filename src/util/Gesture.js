	lib.define( namespace( 'Gesture' ), function() {

		global.addEventListener( 'beforeunload', function() {
			global.removeEventListener( 'scroll',     cancel_cb,   true );
			global.removeEventListener( ua.mspoint ? 'MSPointerUp'   : 'touchend',   touchend,    true );
			global.removeEventListener( ua.mspoint ? 'MSPointerMove' : 'touchmove',  touchmove,   true );
			global.removeEventListener( ua.mspoint ? 'MSPointerDown' : 'touchstart', touchstart,  true );
		}, true );

		var attr        = 'data-gesture-hotspot',
			cache       = util.obj(),
			cancel_cb   = touchcancel.callback( {
				buffer  : 100,
				delay   : 100
			} ),
			current     = null,
			doc         = global.document,
			point       = {
				x       : {
					backward : 'left',  diff : 'diffX', dir   : 'directionX',
					forward  : 'right', id   : 'x',
					last     : 'lastX', page : 'pageX', start : 'startX'
				},
				y       : {
					backward : 'up',    diff : 'diffY', dir   : 'directionY',
					forward  : 'down',  id   : 'y',
					last     : 'lastY', page : 'pageY', start : 'startY'
				}
			},
			props_reset = 'initialRotation initialScale pressure rotation scale touches'.split( ' ' ),
			radian      = 180 / Math.PI,
			slc         = '[' + attr + '="true"]';

		global.addEventListener( 'scroll',     cancel_cb,   true );
		global.addEventListener( ua.mspoint ? 'MSPointerUp'   : 'touchend',   touchend,    true );
		global.addEventListener( ua.mspoint ? 'MSPointerMove' : 'touchmove',  touchmove,   true );
		global.addEventListener( ua.mspoint ? 'MSPointerDown' : 'touchstart', touchstart,  true );

		Touch.prototype = {
			constructor : Touch,
			angle       : -1,
			diffX       : null, diffY       : null,
			directionX  : null, directionY  : null,
			gesture     : null,
			lastX       : null, lastY       : null,
			startX      : null, startY      : null,
			tolerance   : null,
			type        : null,
			x           : null, y           : null,

			end         : function() {
				var x     = Math.abs( is_num( this.x ) ? ( this.startX - this.x ) : this.lastX - this.startX ),
					y     = Math.abs( is_num( this.y ) ? ( this.startY - this.y ) : this.lastY - this.startY ),
					angle = Math.round( Math.atan2( y, x ) * radian ),
					type  = '';

				if ( between( angle, 0, this.tolerance ) )
					type += this.directionX || '';
				else if ( between( angle, 60, 60 + this.tolerance ) )
					type += this.directionY || '';
				else
					type += ( this.directionX || '' ) + ( this.directionY || '' );

				this.angle   = angle;
				this.type    = type;
			},
			process     : function( touch ) {
				this.setCoord( 'x', touch );
				this.setCoord( 'y', touch );
			},
			setCoord    : function( id, touch ) {
				var coord = point[id], delta, diff = coord.diff, dir = coord.dir, last = coord.last, start = coord.start;

				if ( is_num( this[id] ) ) {
					this[last] = this[id];
					this[id]   = touch[coord.page];
					delta      = this[diff] = this[id] - this[last];

					if ( delta < 0 )
						this[dir] = coord.backward;
					else if ( delta > 0 )
						this[dir] = coord.forward;
					else
						this[dir] = null;
				}
				else
					this[id] = this[start] = touch[coord.page];
			}
		};

		return {
			constructor      : function Gesture( config ) {
				this.increasePressure_ = this.increasePressure.bind( this );
				this.mixin( 'observer', is_obj( config ) ? config.observers : [] ).parent( arguments );
			},
			extend           : lib.Source,
			mixins           : {
				observer : 'Observer'
			},
			module           : __lib__,
// public properties
			active           : false,
			destroyed        : false,
			disabled         : false,
			exclusions       : null,
			initialRotation  : null,
			initialScale     : null,
			interactive      : {
				get          : function() { return !this.destroyed && !this.disabled; },
				set          : function() { return this.interactive; }
			},
			longtapDelay     : 700,
			rotation         : null,
			precision        : .17,
			pressInterval    : 100,
			pressure         : null,
			scale            : null,
			tapDelay         : 200,
			tolerance        : 15,
			touches          : null,
// internal properties
			id_dbltap        : null,
			id_lngtap        : null,
			is_dbltap        : false,
			is_lngtap        : false,
			ts_tap           : null,
// public methods
			cancel           : function() {
				if ( !this.active ) return;

				this.active = false;

				this.reset().broadcast( 'cancel' );
			},
			end              : function( evt ) {
				if ( !this.interactive || !this.active || this.broadcast( 'before:end', evt ) === false ) return;

				this.process( evt );

				this.active  = false;

				if ( this.ts_tap )
					this.id_dbltap = setTimeout( this.onEnd.bind( this, evt ), this.tapDelay );
				else
					this.onEnd( evt );
			},
			enable           : function() {
				if ( !this.disabled || this.broadcast( 'before:enable' ) === false ) return;

				this.disabled = false;

				this.broadcast( 'enable' );
			},
			disable          : function() {
				if ( this.disabled || this.broadcast( 'before:disable' ) === false ) return;

				this.disabled = true;

				this.broadcast( 'disable' );
			},
			increasePressure : function() {
				this.pressure += 1;

				if ( this.ts_tap && Date.now() - this.ts_tap >= this.longtapDelay )
					this.is_lngtap = true;
			},
			move             : function( evt ) {
				if ( !this.active || !this.interactive ) return;

				this.process( evt );

				var tolerance = this.tolerance * 2;

				this.diffX < tolerance && this.diffY < tolerance || this.broadcast( 'move', evt );
			},
			reset            : function() {
				this.cleanup();

				if ( this.active || !this.interactive ) return;

				util.remove( this, props_reset );

				this.broadcast( 'reset' );
			},
			start            : function( evt ) {
				if ( !this.interactive || this.active || this.broadcast( 'before:start', evt ) === false ) return;

				if ( this.id_dbltap && between( Date.now() - this.ts_tap, 0, this.tapDelay ) )
					this.cleanup().is_dbltap = this.active = true;
				if ( this.is_dbltap === true || this.is_lngtap === true )
					return;

				this.reset();

				this.active          = true;

				this.initialRotation = evt.rotation;
				this.initialScale    = evt.scale;

				this.pressure        = 0;
				this.touches         = [];

				this.id_lngtap       = setInterval( this.increasePressure_, this.pressInterval );
				this.ts_tap          = Date.now();

				this.process( evt ).broadcast( 'start', evt );

	//			evt.target.tagName.toUpperCase() !== 'IMG' || evt.preventDefault();
			},
			valid            : function( el ) {
				return this.exclusions === null || !api.$( el ).closest( this.exclusions ).length;
			},
// internal methods
			cancelPress      : function() {
				global.clearInterval( this.id_lngtap );
				delete this.id_lngtap;
			},
			cancelTap        : function() {
				global.clearTimeout( this.id_dbltap );
				delete this.id_dbltap;
			},
			cleanup          : function() {
				util.remove( this.cancelPress().cancelTap(), 'is_dbltap', 'is_lngtap', 'ts_tap' );
			},
			init             : function() {
				this.parent( arguments );

				if ( is_str( this.el ) )
					this.el = doc.querySelector( this.el ) || doc.getElementById( this.el ) || null;

				if ( is_dom( this.el ) ) {
					cache[util.id( this.el )] = this;
					this.el.setAttribute( attr, "true" );
				}

				if ( Array.isArray( this.exlusions ) )
					this.exclusions = this.exclusions.join( ', ' );

				this.observe( {
					 move        : this.cleanup,
					 ctx         : this
				} );
			},
			onDestroy        : function() {
				delete cache[util.id( this.el )];
				this.parent( arguments );
			},
			onEnd            : function( evt ) {
				!is_arr( this.touches ) || this.touches.invoke( 'end' );

				var type = this.resolve( evt );

				this.cleanup().broadcast( type, evt ).broadcast( 'end', evt );
			},
			process          : function( evt ) {
				var touches = Array.coerce( evt.touches, 0, 2 );

				this.rotation = evt.rotation;
				this.scale    = evt.scale;

				if ( !touches.length ) return;

				if ( this.touches.length <= touches.length )
					touches.forEach( this.processTouch, this );
			},
			processTouch     : function( touch, i ) {
				if ( !this.touches[i] )
					this.touches[i] = new Touch( this );

				this.touches[i].process( touch );
			},
			resolve          : function( evt ) {
				var touches = this.touches; // noinspection FallthroughInSwitchStatementJS

				switch( touches.length ) {
					case 2  :
						if ( between( this.rotation, -300, -60 ) || between( this.rotation, 60, 300 ) )
							return 'rotate';
						if ( Math.abs( Math.abs( this.initialScale ) - Math.abs( this.scale ) ) > this.precision )
							return this.initialScale > this.scale ? 'pinch' : 'zoom';
						// allow fall-through [conditional]
					default :
						if ( this.is_dbltap === true )
							return 'doubletap';
						if ( this.is_lngtap === true )
							return 'longtap';
						if ( !touches[0].type && Date.now() - this.ts_tap >= this.tapDelay )
							return 'tap';

						return 'swipe' + touches[0].type;
				}
			}
		};

		function Touch( gesture ) {
			this.gesture   = gesture;
			this.tolerance = gesture.tolerance;
		}

		function between( a, b, c ) { return a >=b && a <= c; }

		function touchcancel() {
			!current || current.cancel();
		}

		function touchend( evt ) {
			if ( current )
				current.end( evt );
			else {
				var el = api.$( evt.target ).closest( slc )[0],
					gesture;

				if ( !el ) return;

				gesture = cache[util.id( el )];

				if ( !gesture || !gesture.interactive || !gesture.valid( evt.target ) ) return;

				gesture.end( evt );
			}

			current = null;
		}

		function touchmove( evt ) {
			!current || current.move( evt );
		}

		function touchstart( evt ) {
			var el = api.$( evt.target ).closest( slc )[0],
				gesture;

			if ( !el ) return;

			gesture = cache[util.id( el )];

			if ( !gesture || !gesture.interactive || !gesture.valid( evt.target ) ) return;

			!current || current.cancel();
			current = gesture.start( evt );
		}

	}() );
