//	Viewport = lib.Class( {
//		constructor : function Viewport() {
//			this.parent( arguments );
//		},
//		extend      : namespace( 'Box' )//,
//		module      : __lib__,
//		singleton   : {
//			clsBase : 'w-viewport',
//			$ct     : api.$( doc.documentElement ),
//			ct      : doc.documentElement ,
//			id      : 'viewport'
//		},
//		$_items     : '$el'
//	} );

	api.$.ready( function() {
		var vp = create( namespace( 'Box' ), {
			$_items : '$el',
			clsBase : 'w-viewport',
			$ct     : api.$( doc.documentElement ),
			ct      : doc.documentElement ,
			id      : 'viewport'
		} );

		vp.$el      = api.$( vp.el   = doc.body );
		vp.rendered = true;

		vp.$el.addClass( vp.clsBase ).attr( 'id', vp.id );

// goddamn chrome v26 is intermittently doing some weird shizzle, so need to remove singletons for now
		util.def( __lib__, 'Viewport', { value : vp }, 'cw' );

		vp.broadcast( 'viewport:ready' );
	} );
