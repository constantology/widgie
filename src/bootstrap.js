;!function() {
	if ( util.ENV == 'browser' ) {
//		api.$( global ).on( 'resize', '[data-]', handleCapture );

		var events_bubble  = [
				'blur', 'focus', 'resize', /*'scroll',*/ 'click', 'dblclick',
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
		}, api.$( doc ) );

		events_capture.map( function( event ) {
			this.on( event, '[data-' + event + ']', handleCapture );
		}, api.$( global ).on( 'scroll' , '[data-scroll]', handleBubble ) );
	}
}();
