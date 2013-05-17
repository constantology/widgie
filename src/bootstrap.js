;!function() {
	if ( util.ENV == 'browser' ) {
//		api.$( global ).on( 'resize', '[data-]', handleCapture );

		var cb_bubble      = handleBubble.callback( { buffer : 200 } ),
			cb_capture     = handleCapture.callback( { buffer : 200 } ),
			events_bubble  = [
				'blur', 'focus', 'resize', 'click', 'dblclick',
				'change', 'select', 'submit', 'keydown', 'keypress', 'keyup',
//				'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
				'animationend', 'animationiteration', 'animationstart', 'transitionend'
			],
			events_capture = [
				'orientationchange', 'resize'
			];

		 if ( ua.desktop )
		 	events_bubble.push( 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup' );

		events_bubble.map( function( event ) {
			this.on( event, '[data-' + event + ']', handleBubble );
		}, api.$( ua.ie ? global : doc ) );

// todo: orientationchange not working on android when passed through dinero fix this
		if ( ua.android ) {
			global.addEventListener( 'resize', cb_capture, true );
			global.addEventListener( 'orientationchange', cb_capture, true );
		}
		else {
			events_capture.map( function( event ) {
				this.on( event, '[data-' + event + ']', cb_capture );
			}, api.$( global ) );

			if ( ua.ie )
				global.addEventListener( 'scroll', cb_bubble, true );
			else
				api.$( ua.ie ? global : doc ).on( 'scroll', '[data-scroll]', cb_bubble );
		}
	}
}();
