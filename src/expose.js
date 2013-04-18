	util.iter( PACKAGE ) || ( PACKAGE = util.ENV == 'commonjs' ? module : global );

	util.defs( __lib__ = util.expose( __lib__, Name, PACKAGE ), {
		api               : { value : api },
		gestureEnabled    : ua.touch,
		ua                : { value : ua  },
		addDOMListener    : addDOMListener,
		closest           : closest,
		create            : create,
		define            : define,
		error             : error,
		doc               : doc,
		getClass          : getClass,
		global            : global,
		lib               : lib,
		removeDOMListener : removeDOMListener,
		takeAction        : takeAction,
		util              : util
	}, 'r' );

	util.expose( lib,  __lib__ ); // store a reference to id8 on widgie
	util.expose( util, __lib__ ); // store a reference to m8 on widgie
