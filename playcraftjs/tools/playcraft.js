/**
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = [],
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!memory;
			}
		};

	return self;
};




var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			state = "pending",
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,

				state: function() {
					return state;
				},

				// Deprecated
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					deferred.resolveWith( deferred, args );
				}
			};
		}
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ),
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var privateCache, thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
			isEvents = name === "events";

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Users should not attempt to inspect the internal events object using jQuery.data,
		// it is undocumented and subject to change. But does anyone listen? No.
		if ( isEvents && !thisCache[ name ] ) {
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ internalKey ] : internalKey;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split( " " );
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );
	if ( defer &&
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery._data( elem, queueDataKey ) &&
				!jQuery._data( elem, markDataKey ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.fire();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = ( type || "fx" ) + "mark";
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
			if ( count ) {
				jQuery._data( elem, key, count );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		var q;
		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			q = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			jQuery._data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				jQuery.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue " + type + ".run", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
				count++;
				tmp.add( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set;

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Determine handlers that should run if there are delegated events
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			// Pregenerate a single jQuery object for reuse with .is()
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery.clean(arguments) );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) {
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ first ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase();
	if ( nodeName === "input" ) {
		fixDefaultChecked( elem );
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?
				elem.cloneNode( true ) :
				shimCloneNode( elem );

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment
					if ( context === document ) {
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div );
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div );
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) {
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight,
		i = 0,
		len = which.length;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			for ( ; i < len; i++ ) {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
				}
			}
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
			}
		}
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			this[ type ]() :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			this[ type ]() :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNumeric( ret ) ? ret : orig;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * class.js
 * Classes and objects
 */

/**
 * @Class
 * A modified version of class.js to cater to static inheritance and deep object cloning
 * Based almost completely on class.js (Javascript MVC -- Justin Meyer, Brian Moschel, Michael Mayer and others)
 * (http://javascriptmvc.com/contribute.html)
 * Some portions adapted from Prototype JavaScript framework, version 1.6.0.1 (c) 2005-2007 Sam Stephenson
 * <p>
 * Class system for javascript
 * <p>
 * <code>
 *   var Fighter = gamecore.Base.extend('Fighter',
 *   {
 *       // static (this is inherited as well)
 *       firingSpeed: 1000
 *   },
 *   {
 *       // instance
 *
 *       hp: 0,
 *       lastFireTime: 0,
 *
 *       init: function(hp)
 *       {
 *           this.hp = hp;
 *       },
 *
 *       fire: function()
 *       {
 *           this._super(); // super methods!
 *
 *           // do firing!
 *       }
 *   });
 *
 *  var gunship = new Fighter(100);
 * </code>
 *
 * Introspection:
 * <code>
 *   gamecore.Base.extend(‘Fighter.Gunship’);
 *   Fighter.Gunship.shortName; // ‘Gunship’
 *   Fighter.Gunship.fullName;  // ‘Fighter.Gunship’
 *   Fighter.Gunship.namespace; // ‘Fighter’
 * </code>
 * <p>
 * Setup method will be called prior to any init -- nice if you want to do things without needing the
 * users to call _super in the init, as well as for normalizing parameters.
 * <code>
 *   setup: function()
 *   {
 *      this.objectId = this.Class.totalObjects++;
 *      this.uniqueId = this.Class.fullName + ':' + this.objectId;
 *   }
 * </code>
 */

// compatible with jquery classing
(function ($)
{
    var regs = {
        undHash: /_|-/,
        colons: /::/,
        words: /([A-Z]+)([A-Z][a-z])/g,
        lowUp: /([a-z\d])([A-Z])/g,
        dash: /([a-z\d])([A-Z])/g,
        replacer: /\{([^\}]+)\}/g,
        dot: /\./
    },
        getNext = function (current, nextPart, add)
        {
            return current[nextPart] || ( add && (current[nextPart] = {}) );
        },
        isContainer = function (current)
        {
            var type = typeof current;
            return type && (  type == 'function' || type == 'object' );
        },
        getObject = function (objectName, roots, add)
        {
            var parts = objectName ? objectName.split(regs.dot) : [],
                length = parts.length,
                currents = $.isArray(roots) ? roots : [roots || window],
                current,
                ret,
                i,
                c = 0,
                type;

            if (length == 0)
            {
                return currents[0];
            }
            while (current = currents[c++])
            {
                for (i = 0; i < length - 1 && isContainer(current); i++)
                {
                    current = getNext(current, parts[i], add);
                }
                if (isContainer(current))
                {

                    ret = getNext(current, parts[i], add);

                    if (ret !== undefined)
                    {

                        if (add === false)
                        {
                            delete current[parts[i]];
                        }
                        return ret;

                    }

                }
            }
        },

        /**
         * @class jQuery.String
         *
         * A collection of useful string helpers.
         *
         */
            str = $.String = $.extend($.String || {}, {
            /**
             * @function
             * Gets an object from a string.
             * @param {String} name the name of the object to look for
             * @param {Array} [roots] an array of root objects to look for the name
             * @param {Boolean} [add] true to add missing objects to
             *  the path. false to remove found properties. undefined to
             *  not modify the root object
             */
            getObject: getObject,
            /**
             * Capitalizes a string
             * @param {String} s the string.
             * @return {String} a string with the first character capitalized.
             */
            capitalize: function (s, cache)
            {
                return s.charAt(0).toUpperCase() + s.substr(1);
            },
            /**
             * Capitalizes a string from something undercored. Examples:
             * @codestart
             * jQuery.String.camelize("one_two") //-> "oneTwo"
             * "three-four".camelize() //-> threeFour
             * @codeend
             * @param {String} s
             * @return {String} a the camelized string
             */
            camelize: function (s)
            {
                s = str.classize(s);
                return s.charAt(0).toLowerCase() + s.substr(1);
            },
            /**
             * Like camelize, but the first part is also capitalized
             * @param {String} s
             * @return {String} the classized string
             */
            classize: function (s, join)
            {
                var parts = s.split(regs.undHash),
                    i = 0;
                for (; i < parts.length; i++)
                {
                    parts[i] = str.capitalize(parts[i]);
                }

                return parts.join(join || '');
            },
            /**
             * Like [jQuery.String.classize|classize], but a space separates each 'word'
             * @codestart
             * jQuery.String.niceName("one_two") //-> "One Two"
             * @codeend
             * @param {String} s
             * @return {String} the niceName
             */
            niceName: function (s)
            {
                str.classize(parts[i], ' ');
            },

            /**
             * Underscores a string.
             * @codestart
             * jQuery.String.underscore("OneTwo") //-> "one_two"
             * @codeend
             * @param {String} s
             * @return {String} the underscored string
             */
            underscore: function (s)
            {
                return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowUp, '$1_$2').replace(regs.dash, '_').toLowerCase();
            },
            /**
             * Returns a string with {param} replaced values from data.
             *
             *     $.String.sub("foo {bar}",{bar: "far"})
             *     //-> "foo far"
             *
             * @param {String} s The string to replace
             * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
             * objects can be used.
             * @param {Boolean} [remove] if a match is found, remove the property from the object
             */
            sub: function (s, data, remove)
            {
                var obs = [];
                obs.push(s.replace(regs.replacer, function (whole, inside)
                {
                    //convert inside to type
                    var ob = getObject(inside, data, typeof remove == 'boolean' ? !remove : remove),
                        type = typeof ob;
                    if ((type === 'object' || type === 'function') && type !== null)
                    {
                        obs.push(ob);
                        return "";
                    } else
                    {
                        return "" + ob;
                    }
                }));
                return obs.length <= 1 ? obs[0] : obs;
            }
        });

})(jQuery);
(function ($)
{

    // if we are initializing a new class
    var initializing = false,
        makeArray = $.makeArray,
        isFunction = $.isFunction,
        isArray = $.isArray,
        extend = $.extend,

        /**
         *
         */
        cloneObject = function(object)
        {
            if (!object || typeof(object) != 'object')
                return object;

            // special case handling of array (deep copy them)
            if (object instanceof Array)
            {
                var clone = [];
                for (var c = 0; c < object.length; c++)
                    clone[c] = cloneObject(object[c]);
                return clone;
            }
            else // otherwise, it's a normal object, clone it's properties
            {
                var cloneObj = {};
                for (var prop in object)
                    cloneObj[prop] = cloneObject(object[prop]);
                return cloneObj;
            }
        },

        concatArgs = function (arr, args)
        {
            return arr.concat(makeArray(args));
        },
        // tests if we can get super in .toString()
        fnTest = /xyz/.test(function ()
        {
            xyz;
        }) ? /\b_super\b/ : /.*/,
        // overwrites an object with methods, sets up _super
        // newProps - new properties
        // oldProps - where the old properties might be
        // addTo - what we are adding to
        inheritProps = function (newProps, oldProps, addTo)
        {
            addTo = addTo || newProps
            for (var name in newProps)
            {
                // Check if we're overwriting an existing function
                addTo[name] = isFunction(newProps[name]) &&
                    isFunction(oldProps[name]) &&
                    fnTest.test(newProps[name]) ? (function (name, fn)
                {
                    return function ()
                    {
                        var tmp = this._super,
                            ret;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = oldProps[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, newProps[name]) : newProps[name];
            }
        },


        /**
         * @class jQuery.Class
         * @plugin jquery/class
         * @tag core
         * @download dist/jquery/jquery.class.js
         * @test jquery/class/qunit.html
         *
         * Class provides simulated inheritance in JavaScript. Use clss to bridge the gap between
         * jQuery's functional programming style and Object Oriented Programming. It
         * is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class]
         * Inheritance library.  Besides prototypal inheritance, it includes a few important features:
         *
         *   - Static inheritance
         *   - Introspection
         *   - Namespaces
         *   - Setup and initialization methods
         *   - Easy callback function creation
         *
         *
         * ## Static v. Prototype
         *
         * Before learning about Class, it's important to
         * understand the difference between
         * a class's __static__ and __prototype__ properties.
         *
         *     //STATIC
         *     MyClass.staticProperty  //shared property
         *
         *     //PROTOTYPE
         *     myclass = new MyClass()
         *     myclass.prototypeMethod() //instance method
         *
         * A static (or class) property is on the Class constructor
         * function itself
         * and can be thought of being shared by all instances of the
         * Class. Prototype propertes are available only on instances of the Class.
         *
         * ## A Basic Class
         *
         * The following creates a Monster class with a
         * name (for introspection), static, and prototype members.
         * Every time a monster instance is created, the static
         * count is incremented.
         *
         * @codestart
         * $.Class.extend('Monster',
         * /* @static *|
         * {
         *   count: 0
         * },
         * /* @prototype *|
         * {
         *   init: function( name ) {
         *
         *     // saves name on the monster instance
         *     this.name = name;
         *
         *     // sets the health
         *     this.health = 10;
         *
         *     // increments count
         *     this.Class.count++;
         *   },
         *   eat: function( smallChildren ){
         *     this.health += smallChildren;
         *   },
         *   fight: function() {
         *     this.health -= 2;
         *   }
         * });
         *
         * hydra = new Monster('hydra');
         *
         * dragon = new Monster('dragon');
         *
         * hydra.name        // -> hydra
         * Monster.count     // -> 2
         * Monster.shortName // -> 'Monster'
         *
         * hydra.eat(2);     // health = 12
         *
         * dragon.fight();   // health = 8
         *
         * @codeend
         *
         *
         * Notice that the prototype <b>init</b> function is called when a new instance of Monster is created.
         *
         *
         * ## Inheritance
         *
         * When a class is extended, all static and prototype properties are available on the new class.
         * If you overwrite a function, you can call the base class's function by calling
         * <code>this._super</code>.  Lets create a SeaMonster class.  SeaMonsters are less
         * efficient at eating small children, but more powerful fighters.
         *
         *
         *     Monster.extend("SeaMonster",{
         *       eat: function( smallChildren ) {
         *         this._super(smallChildren / 2);
         *       },
         *       fight: function() {
         *         this.health -= 1;
         *       }
         *     });
         *
         *     lockNess = new SeaMonster('Lock Ness');
         *     lockNess.eat(4);   //health = 12
         *     lockNess.fight();  //health = 11
         *
         * ### Static property inheritance
         *
         * You can also inherit static properties in the same way:
         *
         *     $.Class.extend("First",
         *     {
         *         staticMethod: function() { return 1;}
         *     },{})
         *
         *     First.extend("Second",{
         *         staticMethod: function() { return this._super()+1;}
         *     },{})
         *
         *     Second.staticMethod() // -> 2
         *
         * ## Namespaces
         *
         * Namespaces are a good idea! We encourage you to namespace all of your code.
         * It makes it possible to drop your code into another app without problems.
         * Making a namespaced class is easy:
         *
         * @codestart
         * $.Class.extend("MyNamespace.MyClass",{},{});
         *
         * new MyNamespace.MyClass()
         * @codeend
         * <h2 id='introspection'>Introspection</h2>
         * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
         * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class
         * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
         * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
         * @codestart
         * $.Class.extend("MyOrg.MyClass",{},{})
         * MyOrg.MyClass.shortName //-> 'MyClass'
         * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
         * @codeend
         * The fullName (with namespaces) and the shortName (without namespaces) are added to the Class's
         * static properties.
         *
         *
         * <h2>Setup and initialization methods</h2>
         * <p>
         * Class provides static and prototype initialization functions.
         * These come in two flavors - setup and init.
         * Setup is called before init and
         * can be used to 'normalize' init's arguments.
         * </p>
         * <div class='whisper'>PRO TIP: Typically, you don't need setup methods in your classes. Use Init instead.
         * Reserve setup methods for when you need to do complex pre-processing of your class before init is called.
         *
         * </div>
         * @codestart
         * $.Class.extend("MyClass",
         * {
         *   setup: function() {} //static setup
         *   init: function() {} //static constructor
         * },
         * {
         *   setup: function() {} //prototype setup
         *   init: function() {} //prototype constructor
         * })
         * @codeend
         *
         * <h3>Setup</h3>
         * <p>Setup functions are called before init functions.  Static setup functions are passed
         * the base class followed by arguments passed to the extend function.
         * Prototype static functions are passed the Class constructor function arguments.</p>
         * <p>If a setup function returns an array, that array will be used as the arguments
         * for the following init method.  This provides setup functions the ability to normalize
         * arguments passed to the init constructors.  They are also excellent places
         * to put setup code you want to almost always run.</p>
         * <p>
         * The following is similar to how [jQuery.Controller.prototype.setup]
         * makes sure init is always called with a jQuery element and merged options
         * even if it is passed a raw
         * HTMLElement and no second parameter.
         * </p>
         * @codestart
         * $.Class.extend("jQuery.Controller",{
         *   ...
         * },{
         *   setup: function( el, options ) {
         *     ...
         *     return [$(el),
         *             $.extend(true,
         *                this.Class.defaults,
         *                options || {} ) ]
         *   }
         * })
         * @codeend
         * Typically, you won't need to make or overwrite setup functions.
         * <h3>Init</h3>
         *
         * <p>Init functions are called after setup functions.
         * Typically, they receive the same arguments
         * as their preceding setup function.  The Foo class's <code>init</code> method
         * gets called in the following example:
         * </p>
         * @codestart
         * $.Class.Extend("Foo", {
         *   init: function( arg1, arg2, arg3 ) {
         *     this.sum = arg1+arg2+arg3;
         *   }
         * })
         * var foo = new Foo(1,2,3);
         * foo.sum //-> 6
         * @codeend
         * <h2>Callbacks</h2>
         * <p>Similar to jQuery's proxy method, Class provides a
         * [jQuery.Class.static.callback callback]
         * function that returns a callback to a method that will always
         * have
         * <code>this</code> set to the class or instance of the class.
         * </p>
         * The following example uses this.callback to make sure
         * <code>this.name</code> is available in <code>show</code>.
         * @codestart
         * $.Class.extend("Todo",{
         *   init: function( name ) { this.name = name }
         *   get: function() {
         *     $.get("/stuff",this.callback('show'))
         *   },
         *   show: function( txt ) {
         *     alert(this.name+txt)
         *   }
         * })
         * new Todo("Trash").get()
         * @codeend
         * <p>Callback is available as a static and prototype method.</p>
         * <h2>Demo</h2>
         * @demo jquery/class/class.html
         *
         * @constructor Creating a new instance of an object that has extended jQuery.Class
         *     calls the init prototype function and returns a new instance of the class.
         *
         */

        clss = $.Class = function ()
        {
            if (arguments.length)
            {
                return clss.extend.apply(clss, arguments);
            }
        };

    /* @Static*/
    extend(clss, {
        /**
         * @function callback
         * Returns a callback function for a function on this Class.
         * The callback function ensures that 'this' is set appropriately.
         * @codestart
         * $.Class.extend("MyClass",{
         *     getData: function() {
         *         this.showing = null;
         *         $.get("data.json",this.callback('gotData'),'json')
         *     },
         *     gotData: function( data ) {
         *         this.showing = data;
         *     }
         * },{});
         * MyClass.showData();
         * @codeend
         * <h2>Currying Arguments</h2>
         * Additional arguments to callback will fill in arguments on the returning function.
         * @codestart
         * $.Class.extend("MyClass",{
         *    getData: function( <b>callback</b> ) {
         *      $.get("data.json",this.callback('process',<b>callback</b>),'json');
         *    },
         *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
         *        jsonData.processed = true;
         *        callback(jsonData);
         *    }
         * },{});
         * MyClass.getData(showDataFunc)
         * @codeend
         * <h2>Nesting Functions</h2>
         * Callback can take an array of functions to call as the first argument.  When the returned callback function
         * is called each function in the array is passed the return value of the prior function.  This is often used
         * to eliminate currying initial arguments.
         * @codestart
         * $.Class.extend("MyClass",{
         *    getData: function( callback ) {
         *      //calls process, then callback with value from process
         *      $.get("data.json",this.callback(['process2',callback]),'json')
         *    },
         *    process2: function( type,jsonData ) {
         *        jsonData.processed = true;
         *        return [jsonData];
         *    }
         * },{});
         * MyClass.getData(showDataFunc);
         * @codeend
         * @param {String|Array} fname If a string, it represents the function to be called.
         * If it is an array, it will call each function in order and pass the return value of the prior function to the
         * next function.
         * @return {Function} the callback function.
         */
        callback: function (funcs)
        {
            //args that should be curried
            var args = makeArray(arguments),
                self;

            funcs = args.shift();

            if (!isArray(funcs))
            {
                funcs = [funcs];
            }

            self = this;

            return function class_cb()
            {
                var cur = concatArgs(args, arguments),
                    isString,
                    length = funcs.length,
                    f = 0,
                    func;

                for (; f < length; f++)
                {
                    func = funcs[f];
                    if (!func)
                        continue;

                    isString = typeof func == "string";
                    if (isString && self._set_called)
                        self.called = func;

                    cur = (isString ? self[func] : func).apply(self, cur || []);
                    if (f < length - 1)
                        cur = !isArray(cur) || cur._use_call ? [cur] : cur
                }
                return cur;
            }
        },
        /**
         *   @function getObject
         *   Gets an object from a String.
         *   If the object or namespaces the string represent do not
         *   exist it will create them.
         *   @codestart
         *   Foo = {Bar: {Zar: {"Ted"}}}
         *   $.Class.getobject("Foo.Bar.Zar") //-> "Ted"
         *   @codeend
         *   @param {String} objectName the object you want to get
         *   @param {Object} [current=window] the object you want to look in.
         *   @return {Object} the object you are looking for.
         */
        getObject: $.String.getObject,
        /**
         * @function newInstance
         * Creates a new instance of the class.  This method is useful for creating new instances
         * with arbitrary parameters.
         * <h3>Example</h3>
         * @codestart
         * $.Class.extend("MyClass",{},{})
         * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
         * @codeend
         * @return {class} instance of the class
         */
        newInstance: function ()
        {
            var inst = this.rawInstance();
            var args;

            if (inst.setup)
                args = inst.setup.apply(inst, arguments);

            // Added by martin@playcraftlabs.com -- fix for deep cloning of properties
            for (var prop in inst.__proto__)
                inst[prop] = cloneObject(inst[prop]);

            if (inst.init)
                inst.init.apply(inst, isArray(args) ? args : arguments);

            return inst;
        },
        /**
         * Setup gets called on the inherting class with the base class followed by the
         * inheriting class's raw properties.
         *
         * Setup will deeply extend a static defaults property on the base class with
         * properties on the base class.  For example:
         *
         *     $.Class("MyBase",{
         *       defaults : {
         *         foo: 'bar'
         *       }
         *     },{})
         *
         *     MyBase("Inheriting",{
         *       defaults : {
         *         newProp : 'newVal'
         *       }
         *     },{}
         *
         *     Inheriting.defaults -> {foo: 'bar', 'newProp': 'newVal'}
         *
         * @param {Object} baseClass the base class that is being inherited from
         * @param {String} fullName the name of the new class
         * @param {Object} staticProps the static properties of the new class
         * @param {Object} protoProps the prototype properties of the new class
         */
        setup: function (baseClass, fullName)
        {
            this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
            return arguments;
        },
        rawInstance: function ()
        {
            initializing = true;
            var inst = new this();
            initializing = false;
            return inst;
        },
        /**
         * Extends a class with new static and prototype functions.  There are a variety of ways
         * to use extend:
         * @codestart
         * //with className, static and prototype functions
         * $.Class.extend('Task',{ STATIC },{ PROTOTYPE })
         * //with just classname and prototype functions
         * $.Class.extend('Task',{ PROTOTYPE })
         * //With just a className
         * $.Class.extend('Task')
         * @codeend
         * @param {String} [fullName]  the classes name (used for classes w/ introspection)
         * @param {Object} [klass]  the new classes static/class functions
         * @param {Object} [proto]  the new classes prototype functions
         * @return {jQuery.Class} returns the new class
         */
        extend: function (fullName, klass, proto)
        {
            // figure out what was passed
            if (typeof fullName != 'string')
            {
                proto = klass;
                klass = fullName;
                fullName = null;
            }
            if (!proto)
            {
                proto = klass;
                klass = null;
            }

            proto = proto || {};
            var _super_class = this,
                _super = this.prototype,
                name, shortName, namespace, prototype;

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            prototype = new this();
            initializing = false;
            // Copy the properties over onto the new prototype
            inheritProps(proto, _super, prototype);

            // The dummy class constructor

            function Class()
            {
                // All construction is actually done in the init method
                if (initializing) return;

                if (this.constructor !== Class && arguments.length)
                { //we are being called w/o new
                    return arguments.callee.extend.apply(arguments.callee, arguments)
                } else
                { //we are being called w/ new
                                   // copy objects

                    return this.Class.newInstance.apply(this.Class, arguments)
                }
            }

            // Copy old stuff onto class
            for (name in this)
                if (this.hasOwnProperty(name))
                    Class[name] = cloneObject(this[name]);

            // copy new props on class
            inheritProps(klass, this, Class);

            // do namespace stuff
            if (fullName)
            {
                var parts = fullName.split(/\./);
                var shortName = parts.pop();

                // Martin Wells (playcraft): bug fix. Don't add a namespace object if the class name
                // has no namespace elements (i.e. it's just "MyClass", not "MyProject.MyClass")
                if (parts.length > 0)
                {
                    current = clss.getObject(parts.join('.'), window, true),
                    namespace = current;
                }

                current[shortName] = Class;
            }

            // set things that can't be overwritten
            extend(Class, {
                prototype: prototype,
                namespace: namespace,
                shortName: shortName,
                constructor: Class,
                fullName: fullName
            });

            //make sure our prototype looks nice
            Class.prototype.Class = Class.prototype.constructor = Class;


            /**
             * @attribute fullName
             * The full name of the class, including namespace, provided for introspection purposes.
             * @codestart
             * $.Class.extend("MyOrg.MyClass",{},{})
             * MyOrg.MyClass.shortName //-> 'MyClass'
             * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
             * @codeend
             */

            var args = Class.setup.apply(Class, concatArgs([_super_class], arguments));

            if (Class.init)
            {
                Class.init.apply(Class, args || []);
            }

            /* @Prototype*/
            return Class;
            /**
             * @function setup
             * If a setup method is provided, it is called when a new
             * instances is created.  It gets passed the same arguments that
             * were given to the Class constructor function (<code> new Class( arguments ... )</code>).
             *
             *     $.Class("MyClass",
             *     {
             *        setup: function( val ) {
             *           this.val = val;
             *         }
             *     })
             *     var mc = new MyClass("Check Check")
             *     mc.val //-> 'Check Check'
             *
             * Setup is called before [jQuery.Class.prototype.init init].  If setup
             * return an array, those arguments will be used for init.
             *
             *     $.Class("jQuery.Controller",{
             *       setup : function(htmlElement, rawOptions){
             *         return [$(htmlElement),
             *                   $.extend({}, this.Class.defaults, rawOptions )]
             *       }
             *     })
             *
             * <div class='whisper'>PRO TIP:
             * Setup functions are used to normalize constructor arguments and provide a place for
             * setup code that extending classes don't have to remember to call _super to
             * run.
             * </div>
             *
             * Setup is not defined on $.Class itself, so calling super in inherting classes
             * will break.  Don't do the following:
             *
             *     $.Class("Thing",{
             *       setup : function(){
             *         this._super(); // breaks!
             *       }
             *     })
             *
             * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is
             * called with those arguments; otherwise, the original arguments are used.
             */
            //break up
            /**
             * @function init
             * If an <code>init</code> method is provided, it gets called when a new instance
             * is created.  Init gets called after [jQuery.Class.prototype.setup setup], typically with the
             * same arguments passed to the Class
             * constructor: (<code> new Class( arguments ... )</code>).
             *
             *     $.Class("MyClass",
             *     {
             *        init: function( val ) {
             *           this.val = val;
             *        }
             *     })
             *     var mc = new MyClass(1)
             *     mc.val //-> 1
             *
             * [jQuery.Class.prototype.setup Setup] is able to modify the arguments passed to init.  Read
             * about it there.
             *
             */
            //Breaks up code
            /**
             * @attribute Class
             * References the static properties of the instance's class.
             * <h3>Quick Example</h3>
             * @codestart
             * // a class with a static classProperty property
             * $.Class.extend("MyClass", {classProperty : true}, {});
             *
             * // a new instance of myClass
             * var mc1 = new MyClass();
             *
             * //
             * mc1.Class.classProperty = false;
             *
             * // creates a new MyClass
             * var mc2 = new mc.Class();
             * @codeend
             * Getting static properties via the Class property, such as it's
             * [jQuery.Class.static.fullName fullName] is very common.
             */
        }

    })


    clss.prototype.
    /**
     * @function callback
     * Returns a callback function.  This does the same thing as and is described better in [jQuery.Class.static.callback].
     * The only difference is this callback works
     * on a instance instead of a class.
     * @param {String|Array} fname If a string, it represents the function to be called.
     * If it is an array, it will call each function in order and pass the return value of the prior function to the
     * next function.
     * @return {Function} the callback function
     */
        callback = clss.callback;


})(jQuery);/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * gamecore.js
 * Namespace wrappers and the base class
 */

window.gamecore = {};
gamecore.Class = $.Class;

/**
 * @class gamecore.Base
 * A base class providing logging, object counting and unique object id's
 * Examples:
 *
 * Unique ID and total objects:
 * <code>
 * var Fighter = gamecore.Base.extend('Fighter', {}, {});
 * var fighter1 = new Fighter();
 * var fighter2 = new Fighter();
 * fighter1.uniqueId;    // -> 'Fighter:0'
 * fighter2.uniqueId;    // -> 'Fighter:1'
 * Fighter.totalObjects; // -> 2
 * </code>
 *
 * Logging: (log, info, warn, error, debug)
 * <code>
 * fighter1.warn('oops'); // == console.log('Fighter:0 [WARN] oops');
 */

gamecore.Base = gamecore.Class('gamecore.Base',
    ///
    /// STATIC
    ///
    {
        totalObjects: 0,
        WARN: 'WARN',
        DEBUG: 'DEBUG',
        ERROR: 'ERROR',
        INFO: 'INFO',

        log: function(id, type, message)
        {
            var idString = '';
            if (id) idString = ':'+id;
            console.log(this.fullName + idString + ' [' + type + '] ' + message);
        },

        warn: function (message)
        {
            this.log(null, this.WARN, message);
        },

        debug: function (message)
        {
            this.log(null, this.DEBUG, message);
        },

        error: function (message)
        {
            this.log(null, this.ERROR, message);
        },

        info: function (message)
        {
            this.log(null, this.INFO, message);
        },

        assert: function(msg, condition)
        {
            if (!condition)
                throw msg;
        }

    },
    ///
    /// INSTANCE
    ///
    {
        objectId: 0,
        uniqueId: null,

        init: function()
        {
        },

        setup: function()
        {
            this.objectId = this.Class.totalObjects++;
            this.uniqueId = this.Class.fullName + ':' + this.objectId;
        },

        /**
         * @returns {String} A system-wide unique Id for this object instance
         */
        getUniqueId: function()
        {
            // if you see a null error here, then likely you have forgotten to call
            // this._super in a subclassed init method.
            return this.uniqueId;
        },

        /**
         * @returns {String} A hash matching this object. Override this to implement different
         * kinds of object hashing in derived classes.
         */
        hashCode: function()
        {
            return this.getUniqueId();
        },

        warn: function (message)
        {
            this.Class.log(this.objectId, this.Class.WARN, message);
        },
        debug: function (message)
        {
            this.Class.log(this.objectId, this.Class.DEBUG, message);
        },
        error: function (message)
        {
            this.Class.log(this.objectId, this.Class.ERROR, message);
        },
        info: function (message)
        {
            this.Class.log(this.objectId, this.Class.INFO, message);
        },

        toString: function()
        {
            return this.Class.fullName + ' [id: ' + this.objectId + ']';
        }
    });

/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 2.1
 * Build date: 21 March 2010
 * Website: http://www.timdown.co.uk/jshashtable
 *
 * (Slight mod to add to gamecore namespace -- martin@playcraftlabs.com)
 */

/**
 * jshashtable
 *
 * jshashtable is a JavaScript implementation of a hash table. It creates a single constructor function called Hashtable
 * in the global scope.
 * Example:
 * <code>
 *     var map = new gamecore.Hashtable();
 *     map.put('test1', obj);
 *     var obj = map.get('test1');
 * </code>
 */

gamecore.Hashtable = (function ()
{
    var FUNCTION = "function";

    var arrayRemoveAt = (typeof Array.prototype.splice == FUNCTION) ?
        function (arr, idx)
        {
            arr.splice(idx, 1);
        } :

        function (arr, idx)
        {
            var itemsAfterDeleted, i, len;
            if (idx === arr.length - 1)
            {
                arr.length = idx;
            } else
            {
                itemsAfterDeleted = arr.slice(idx + 1);
                arr.length = idx;
                for (i = 0, len = itemsAfterDeleted.length; i < len; ++i)
                {
                    arr[idx + i] = itemsAfterDeleted[i];
                }
            }
        };

    function hashObject(obj)
    {
        var hashCode;
        if (typeof obj == "string")
        {
            return obj;
        } else if (typeof obj.hashCode == FUNCTION)
        {
            // Check the hashCode method really has returned a string
            hashCode = obj.hashCode();
            return (typeof hashCode == "string") ? hashCode : hashObject(hashCode);
        } else if (typeof obj.toString == FUNCTION)
        {
            return obj.toString();
        } else
        {
            try
            {
                return String(obj);
            }
            catch (ex)
            {
                // For host objects (such as ActiveObjects in IE) that have no toString() method and throw an error when
                // passed to String()
                return Object.prototype.toString.call(obj);
            }
        }
    }

    function equals_fixedValueHasEquals(fixedValue, variableValue)
    {
        return fixedValue.equals(variableValue);
    }

    function equals_fixedValueNoEquals(fixedValue, variableValue)
    {
        return (typeof variableValue.equals == FUNCTION) ?
            variableValue.equals(fixedValue) : (fixedValue === variableValue);
    }

    function createKeyValCheck(kvStr)
    {
        return function (kv)
        {
            if (kv === null)
            {
                throw new Error("null is not a valid " + kvStr);
            } else if (typeof kv == "undefined")
            {
                throw new Error(kvStr + " must not be undefined");
            }
        };
    }

    var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");

    /*----------------------------------------------------------------------------------------------------------------*/

    function Bucket(hash, firstKey, firstValue, equalityFunction)
    {
        this[0] = hash;
        this.entries = [];
        this.addEntry(firstKey, firstValue);

        if (equalityFunction !== null)
        {
            this.getEqualityFunction = function ()
            {
                return equalityFunction;
            };
        }
    }

    var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;

    function createBucketSearcher(mode)
    {
        return function (key)
        {
            var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
            while (i--)
            {
                entry = this.entries[i];
                if (equals(key, entry[0]))
                {
                    switch (mode)
                    {
                        case EXISTENCE:
                            return true;
                        case ENTRY:
                            return entry;
                        case ENTRY_INDEX_AND_VALUE:
                            return [ i, entry[1] ];
                    }
                }
            }
            return false;
        };
    }

    function createBucketLister(entryProperty)
    {
        return function (aggregatedArr)
        {
            var startIndex = aggregatedArr.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                aggregatedArr[startIndex + i] = this.entries[i][entryProperty];
            }
        };
    }

    Bucket.prototype = {
        getEqualityFunction:function (searchValue)
        {
            return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
        },

        getEntryForKey:createBucketSearcher(ENTRY),

        getEntryAndIndexForKey:createBucketSearcher(ENTRY_INDEX_AND_VALUE),

        removeEntryForKey:function (key)
        {
            var result = this.getEntryAndIndexForKey(key);
            if (result)
            {
                arrayRemoveAt(this.entries, result[0]);
                return result[1];
            }
            return null;
        },

        addEntry:function (key, value)
        {
            this.entries[this.entries.length] = [key, value];
        },

        keys:createBucketLister(0),

        values:createBucketLister(1),

        getEntries:function (entries)
        {
            var startIndex = entries.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                // Clone the entry stored in the bucket before adding to array
                entries[startIndex + i] = this.entries[i].slice(0);
            }
        },

        containsKey:createBucketSearcher(EXISTENCE),

        containsValue:function (value)
        {
            var i = this.entries.length;
            while (i--)
            {
                if (value === this.entries[i][1])
                {
                    return true;
                }
            }
            return false;
        }
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Supporting functions for searching hashtable buckets

    function searchBuckets(buckets, hash)
    {
        var i = buckets.length, bucket;
        while (i--)
        {
            bucket = buckets[i];
            if (hash === bucket[0])
            {
                return i;
            }
        }
        return null;
    }

    function getBucketForHash(bucketsByHash, hash)
    {
        var bucket = bucketsByHash[hash];

        // Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
        return ( bucket && (bucket instanceof Bucket) ) ? bucket : null;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    function Hashtable(hashingFunctionParam, equalityFunctionParam)
    {
        var that = this;
        var buckets = [];
        var bucketsByHash = {};

        var hashingFunction = (typeof hashingFunctionParam == FUNCTION) ? hashingFunctionParam : hashObject;
        var equalityFunction = (typeof equalityFunctionParam == FUNCTION) ? equalityFunctionParam : null;

        this.put = function (key, value)
        {
            checkKey(key);
            checkValue(value);
            var hash = hashingFunction(key), bucket, bucketEntry, oldValue = null;

            // Check if a bucket exists for the bucket key
            bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it already contains this key
                bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so replace old value and we're done.
                    oldValue = bucketEntry[1];
                    bucketEntry[1] = value;
                } else
                {
                    // The bucket does not contain an entry for this key, so add one
                    bucket.addEntry(key, value);
                }
            } else
            {
                // No bucket exists for the key, so create one and put our key/value mapping in
                bucket = new Bucket(hash, key, value, equalityFunction);
                buckets[buckets.length] = bucket;
                bucketsByHash[hash] = bucket;
            }
            return oldValue;
        };

        this.get = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it contains this key
                var bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so return the value.
                    return bucketEntry[1];
                }
            }
            return null;
        };

        this.containsKey = function (key)
        {
            checkKey(key);
            var bucketKey = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, bucketKey);

            return bucket ? bucket.containsKey(key) : false;
        };

        this.containsValue = function (value)
        {
            checkValue(value);
            var i = buckets.length;
            while (i--)
            {
                if (buckets[i].containsValue(value))
                {
                    return true;
                }
            }
            return false;
        };

        this.clear = function ()
        {
            buckets.length = 0;
            bucketsByHash = {};
        };

        this.isEmpty = function ()
        {
            return !buckets.length;
        };

        var createBucketAggregator = function (bucketFuncName)
        {
            return function ()
            {
                var aggregated = [], i = buckets.length;
                while (i--)
                {
                    buckets[i][bucketFuncName](aggregated);
                }
                return aggregated;
            };
        };

        this.keys = createBucketAggregator("keys");
        this.values = createBucketAggregator("values");
        this.entries = createBucketAggregator("getEntries");

        this.remove = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key), bucketIndex, oldValue = null;

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);

            if (bucket)
            {
                // Remove entry from this bucket for this key
                oldValue = bucket.removeEntryForKey(key);
                if (oldValue !== null)
                {
                    // Entry was removed, so check if bucket is empty
                    if (!bucket.entries.length)
                    {
                        // Bucket is empty, so remove it from the bucket collections
                        bucketIndex = searchBuckets(buckets, hash);
                        arrayRemoveAt(buckets, bucketIndex);
                        delete bucketsByHash[hash];
                    }
                }
            }
            return oldValue;
        };

        this.size = function ()
        {
            var total = 0, i = buckets.length;
            while (i--)
            {
                total += buckets[i].entries.length;
            }
            return total;
        };

        this.each = function (callback)
        {
            var entries = that.entries(), i = entries.length, entry;
            while (i--)
            {
                entry = entries[i];
                callback(entry[0], entry[1]);
            }
        };

        this.putAll = function (hashtable, conflictCallback)
        {
            var entries = hashtable.entries();
            var entry, key, value, thisValue, i = entries.length;
            var hasConflictCallback = (typeof conflictCallback == FUNCTION);
            while (i--)
            {
                entry = entries[i];
                key = entry[0];
                value = entry[1];

                // Check for a conflict. The default behaviour is to overwrite the value for an existing key
                if (hasConflictCallback && (thisValue = that.get(key)))
                {
                    value = conflictCallback(key, thisValue, value);
                }
                that.put(key, value);
            }
        };

        this.clone = function ()
        {
            var clone = new Hashtable(hashingFunctionParam, equalityFunctionParam);
            clone.putAll(that);
            return clone;
        };

        /**
         * Added by martin@playcratlabs.com to support debug dumping of hash arrays
         */
        this.toString = function ()
        {
            var result = '';
            var keys = this.keys();
            for (var i = 0; i < keys.length; i++)
            {
                var obj = this.get(keys[i]);
                result += keys[i].toString() + ' = ' + obj.toString() + '\n';
            }

            return result;
        }
    }

    return Hashtable;
})();/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * device.js
 * Access to device capabilities
 */

/**
 * @class gamecore.Device
 * Staic class with lots of device information.
 */

gamecore.Device = gamecore.Base.extend('gamecore.Device',
    {
        pixelRatio:0,
        isiPhone:false,
        isiPhone4:false,
        isiPad:false,
        isAndroid:false,
        isTouch:false,
        isFirefox:false,
        isChrome:false,
        isOpera:false,
        isIE:false,
        ieVersion:0,
        requestAnimFrame:null,
        hasMemoryProfiling:false,
        canPlayOgg: false,
        canPlayMP3: false,
        canPlayWav: false,

        init:function ()
        {
            this.pixelRatio = window.devicePixelRatio || 1;
            this.isiPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
            this.isiPhone4 = (this.pixelRatio == 2 && this.isiPhone);
            this.isiPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;
            this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') != -1;
            this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
            this.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
            this.isOpera = navigator.userAgent.toLowerCase().indexOf('opera') != -1;
            this.isTouch = "ontouchstart" in window;

            if (window.performance != undefined)
                this.hasMemoryProfiling = (window.performance.memory);

            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
            {
                this.ieVersion = new Number(RegExp.$1);
                this.isIE = true;
            }

            // determine what sound formats we can play
            var check = new Audio();
            if (check.canPlayType('audio/ogg')) this.canPlayOgg = true;
            if (check.canPlayType('audio/mpeg')) this.canPlayMP3 = true;
            if (check.canPlayType('audio/x-wav')) this.canPlayWav = true;

            this.requestAnimFrame = (function ()
            {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element)
                        {
                            window.setTimeout(callback, 1000 / this.fps);
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element)
                {
                    request.apply(window, [callback, element]);
                };
            })();

            // todo:
            // highres timer
            // game pads
            // fullscreen api
            // mouse lock
        },

        canPlay: function(format)
        {
            if (format.toLowerCase() === 'mp3' && this.canPlayMP3) return true;
            if (format.toLowerCase() === 'ogg' && this.canPlayOgg) return true;
            if (format.toLowerCase() === 'wav' && this.canPlayWav) return true;
            return false;
        },

        getUsedHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.usedJSHeapSize : 0;
        },

        getTotalHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.totalJSHeapSize : 0;
        }


    },
    {
        // Singleton static class, so nothing required here
    });/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * perf.js
 * Simple performance monitoring tools.
 */

/**
 * @class gamecore.PerformanceMeasure
 * Example:
 * <code>
 * var measure = new gamecore.PerformanceMeasure('A test');
 * // ... do something
 * console.log(measure.end()); // end returns a string you can easily log
 * </code>
 *
 * The memory count is an idea based on a delta of the useJSHeapSize exposed by Chrome.
 * You will need to restart Chrome with --enable-memory-info to have this exposed.
 * It is however, not very reliable as the value will jump around due to gc runs (I think).
 * So far it seems to produce reliable results that are consistent, however memStart > memEnd
 * cases still occur and it would be good to understand this more (is it limited only to GC
 * runs? if so, why is it so consistent?).
 */

gamecore.PerformanceMeasure = gamecore.Base.extend('PerformanceMeasure',
{
    history: [],

    /**
     * Clears the performance history
     */
    clearHistory: function()
    {
        history.length = 0;
    }
},
{
    timeStart: 0,
    timeEnd: 0,
    timeDelat: 0,
    memStart: 0,
    memEnd: 0,
    memDelta: 0,
    description: null,

    /**
     * Constructs a new performance measure with description
     * @param description
     */
    init: function(description)
    {
        this.description = description;
        this.start();
        this.Class.history.push(this);
    },

    /**
     * Starts a performance measure
     */
    start: function()
    {
        this.timeStart = Date.now();
        this.memStart = gamecore.Device.getUsedHeap();
    },

    /**
     * Ends a performance measure, and for convenience returns a toString of the measurement
     * @return String representing the measurement
     */
    end: function()
    {
        this.timeEnd = Date.now();
        this.timeDelta = this.timeEnd - this.timeStart;
        this.memEnd = gamecore.Device.getUsedHeap();

        if (this.memEnd < this.memStart)
            this.memDelta = 0;
        else
            this.memDelta = this.memEnd - this.memStart;
        return this.toString();
    },

    /**
     * Reports the performance measurement in a nice clean way
     */
    toString: function()
    {
        return this.description + ' took ' + this.timeDelta + 'ms, ' +
            (this.memDelta == 0 ? 'unknown':this.memDelta) + ' byte(s)';
    }

});/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * linkedlist.js
 * A high-perforance doubly-linked list intended for use in gaming
 */

/**
 * @class gamecore.LinkedNode
 * @extends gamecore.Base
 * Internal node storage class for gamecore.Linkedist
 * @see gamecore.LinkedList
 */
gamecore.LinkedListNode = gamecore.Base('gamecore.LinkedNode', {},
{
    obj: null,          // the object reference
    nextLinked: null,   // link to next object in the list
    prevLinked: null,   // link to previous object in the list
    free: true
});

/**
 * @class gamecore.LinkedList
 * @extends gamecore.Base
 *
 * A high-speed doubly linked list of objects. Note that for speed reasons (using a dictionary lookup of
 * cached nodes) there can only be a single instance of an object in the list at the same time. Adding the same
 * object a second time will result in a silent return from the add method.
 *
 * In order to keep a track of node links, an object must be able to identify itself with a getUniqueId() function.
 *
 * To add an item use:
 * <code>
 *   list.add(newItem);
 * </code>
 *
 * You can iterate using the first and nextLinked members, such as:
 * <code>
 *   var next = list.first;
 *   while (next)
 *   {
 *       next.obj.DOSOMETHING();
 *       next = next.nextLinked;
 *   }
 * </code>
 *
 * Todo: consider moving away from LinkedListNode by adding properties to the contained object that are unique to each
 * list, i.e. clientObj['' + this.uniqueId + '_linkedlist'] or some such. Adding properties feels messy though, and a
 * performance test is needed. The offsetting advantage is we don't need to lookup nodes (probably only a small increase
 * in performance), less memory for large lists and you can place an object in a list more than once (making the prop
 * addition an array?).
 *
 * The other advantage of moving to a property node model would be objects would no longer need to implement a uniqueId
 * to be contained in a list (cleaner).
 */

gamecore.LinkedList = gamecore.Base('gamecore.LinkedList',

    //
    // STATICS
    //
    {
    },
    //
    // INSTANCE
    //
    {
        first:  null,
        last:   null,
        count:  0,
        objToNodeMap: null,   // a quick lookup list to map linked list nodes to objects

        /**
         * Constructs a new linked list
         */
        init: function()
        {
            this._super();
            this.objToNodeMap = new gamecore.Hashtable();
        },

        /**
         * Get the LinkedListNode for this object.
         * @param obj The object to get the node for
         */
        getNode: function(obj)
        {
            // objects added to a list must implement a getUniqueId which returns a unique object identifier string
            // or just extend gamecore.Base to get it for free
            return this.objToNodeMap.get(obj.getUniqueId());
        },

        /**
         * Adds a specific node to the list -- typically only used internally unless you're doing something funky
         * Use add() to add an object to the list, not this.
         */
        addNode: function(obj)
        {
            var node = new gamecore.LinkedNode();
            node.obj = obj;
            node.prevLinked = null;
            node.nextLinked = null;
            node.free = false;
            this.objToNodeMap.put(obj.getUniqueId(), node);
            return node;
        },

        /**
         * Add an item to the list
         * @param obj The object to add
         */
        add: function(obj)
        {
            var node = this.getNode(obj);
            if (node == null)
            {
                node = this.addNode(obj);
            } else
            {
                // if the object is already in the list just return (can't add an object more than once)
                if (node.free == false)
                    throw 'Attempting to add object: ' + obj.getUniqueId() + ' twice to list ' + this.getUniqueId();

                // reusing a node, so we clean it up
                // this caching of node/object pairs is the reason an object can only exist
                // once in a list -- which also makes things faster (not always creating new node
                // object every time objects are moving on and off the list
                node.obj = obj;
                node.free = false;
                node.nextLinked = null;
                node.prevLinked = null;
            }

            // append this obj to the end of the list
            if (this.first == null) // is this the first?
            {
                this.first = node;
                this.last = node;
                node.nextLinked = null; // clear just in case
                node.prevLinked = null;
            } else
            {
                if (this.last == null)
                    throw "Hmm, no last in the list -- that shouldn't happen here";

                // add this entry to the end of the list
                this.last.nextLinked = node; // current end of list points to the new end
                node.prevLinked = this.last;
                this.last = node;            // new object to add becomes last in the list
                node.nextLinked = null;      // just in case this was previously set
            }
            this.count++;

            if (this.showDebug) this.dump('after add');
        },

        /**
         * Removes an item from the list
         * @param obj The object to remove
         * @returns boolean true if the item was removed, false if the item was not on the list
         */
        remove: function(obj)
        {
            if (this.showDebug) this.dump('before remove of ' + obj);
            var node = this.getNode(obj);
            if (node == null || node.free == true)
                return false; // ignore this error (trying to remove something not there
                //throw ('Error: trying to remove a node (' + obj + ') that isnt on the list ');

            // pull this object out and tie up the ends
            if (node.prevLinked != null)
                node.prevLinked.nextLinked = node.nextLinked;
            if (node.nextLinked != null)
                node.nextLinked.prevLinked = node.prevLinked;

            // fix first and last
            if (node.prevLinked == null) // if this was first on the list
                this.first = node.nextLinked; // make the next on the list first (can be null)
            if (node.nextLinked == null) // if this was the last
                this.last = node.prevLinked; // then this nodes previous becomes last

            node.free = true;
            node.prevLinked = null;
            node.nextLinked = null;

            this.count--;
            if (this.showDebug) this.dump('after remove');

            return true;
        },

        /**
         * Clears the list out
         */
        clear: function()
        {
            // sweep the list and free all the nodes
            var next = this.first;
            while (next != null)
            {
                next.free = true;
                next = next.nextLinked;
            }
            this.first = null;
            this.count = 0;
        },

        /**
         * Outputs the contents of the current list. Usually for debugging.
         */
        dump: function(msg)
        {
            this.debug('====================' + msg + '=====================');
            var a = this.first;
            while (a != null)
            {
                this.debug("{" + a.obj + "} previous=" + ( a.prevLinked ? a.prevLinked.obj : "NULL"));
                a = a.nextLinked;
            }
            this.debug("===================================");
            this.debug("Last: {" + (this.last ? this.last.obj : 'NULL') + "} " +
                       "First: {" + (this.first ? this.first.obj : 'NULL') + "}");
        }

    });


/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * pool.js
 */

/**
 * @class gamecore.Pool
 * Easy (high-performance) object pooling
 *
 * A pool of objects for use in situations where you want to minimize object life cycling (and
 * subsequently garbage collection). It also serves as a very high speed, minimal overhead
 * collection for small numbers of objects.
 * <p>
 * This class maintains mutual set of doubly-linked lists in order to differentiate between
 * objects that are in use and those that are unallocated from the pool. This allows for much
 * faster cycling of only the in-use objects.
 * <p>
 * Pools are managed by class type, and will auto-expand as required. You can create a custom initial pool
 * size by deriving from the Pool class and statically overriding INITIAL_POOL_SIZE.
 * <p>
 * Keep in mind that objects that are pooled are not constructed; they are "reset" when handed out.
 * You need to "acquire" one and then reset its state, usually via a static create factory method.
 * <p>
 * Example:
 * <code>
 * Point = gamecore.Pooled('Point',
 * {
 *   // Static constructor
 *   create:function (x, y)
 *   {
 *      var n = this._super();
 *      n.x = x;
 *      n.y = y;
 *      return n;
 *   }
 * },
 * {
 *    x:0, y:0,   // instance
 *
 *    init: function(x, y)
 *    {
 *       this.x = x;
 *       this.y = y;
 *    }
 * }
 * </code>
 * To then access the object from the pool, use create, instead of new. Then release it.
 * <code>
 * var p = Point.create(100, 100);
 * // ... do something
 * p.release();
 * </code>
 *
 */

gamecore.Pool = gamecore.Base.extend('gamecore.Pool',

    ///
    /// STATICS
    ///
    {
        INITIAL_POOL_SIZE: 1,

        pools: new gamecore.Hashtable(), // all your pools belong to us
        totalPooled: 0,

        /**
         * Acquire an object from a pool based on the class[name]. Typically this method is
         * automatically called from
         * @param classType Class of object to create
         */
        acquire: function(classType)
        {
            var pool = this.getPool(classType);
            if (pool == undefined || pool == null)
            {
                // create a pool for this type of class
                //this.info('Constructing a new pool for ' + classType.fullName + ' objects.');
                pool = new gamecore.Pool(classType, this.INITIAL_POOL_SIZE);
                this.pools.put(classType.fullName, pool);
            }

            return pool.acquire();
        },

        /**
         * Releases an object back into it's corresponding object pool
         * @param pooledObj Object to return to the pool
         */
        release: function(pooledObj)
        {
            var pool = this.pools.get(pooledObj.Class.fullName);
            if (pool == undefined)
                throw "Oops, trying to release an object of type " + pooledObj.Class.fullName +
                    " but no pool exists";

            pool.release(pooledObj);
        },

        /**
         * Returns the pool associated with the given classType, or null if no pool currently exists
         */
        getPool: function(classType)
        {
            return this.pools.get(classType.fullName);
        }


    },
    ///
    /// INSTANCE
    ///
    {
        freeList: null,
        usedList: null,
        initialSize:   0, // size of the initial object pool
        classType:  null, // the class of object in this pool

        /**
         * Constructs a pool using a base of objects passed in as an array.
         * @param classType Class name of the type of objects in the pool
         * @param initial Starting number of objects in the pool
         */
        init:function (classType, initial)
        {
            this._super();
            this.classType = classType;
            this.freeList = new gamecore.LinkedList();
            this.usedList = new gamecore.LinkedList();

            // instantiate the initial objects for the pool
            this.initialSize = initial;
            this.expand(initial);
        },

        /**
         * Expand the pool of objects by constructing a bunch of new ones. The pool will
         * automatically expand itself by 10% each time it runs out of space, so generally you
         * shouldn't need to use this.
         * @param howMany Number of new objects you want to add
         */
        expand: function(howMany)
        {
            //this.info('Expanding ' + this.classType.fullName + ' pool from ' + this.size() +
            //    ' to ' + (this.size() + howMany) + ' objects');
            gamecore.Pool.totalPooled += howMany;
            for (var i=0; i < howMany; i++)
                this.freeList.add(new this.classType());
        },

        /**
         * Returns the next free object by moving it from the free pool to the used
         * one. If no free objects are available it returns the oldest from the used
         * pool.
         * access to the object
         */
        returnObj: null,

        acquire:function ()
        {
            // check if we have anymore to give out
            if (this.freeList.first == null)
                // create some more space (expand by 20%, minimum 1)
                this.expand(Math.round(this.size() / 5) + 1);

            this.returnObj = this.freeList.first.obj;
            this.freeList.remove(this.returnObj);
            this.returnObj.destroyed = false;

            this.usedList.add(this.returnObj);
            return this.returnObj;
        },

        /**
         * Releases an object by moving it from the used list back to the free list.
         * @param obj {pc.Base} The obj to release back into the pool
         */
        release:function (obj)
        {
            this.freeList.add(obj);
            this.usedList.remove(obj);
            obj.destroyed = true;
        },

        dump: function(msg)
        {
            this.info('================== ' + msg + ' ===================');
            this.info('FREE');
            this.freeList.dump();
            this.info('USED');
            this.usedList.dump();
        },

        /**
         * Returns the number of objects in the pool
         */
        size: function()
        {
            return this.freeList.count + this.usedList.count;
        },

        /**
         * Returns the LinkedList of currently free objects in the pool
         */
        getFreeList: function()
        {
            return this.freeList;
        },

        /**
         * Returns the LinkedList of current used objects in the pool
         * @return {*}
         */
        getUsedList: function()
        {
            return this.usedList;
        }




    });


/**
 * @class gamecore.Pooled
 * Used as a base class for objects which are life cycle managed in an object pool.
 */
gamecore.Pooled = gamecore.Base('gamecore.Pooled',
    ///
    /// STATICS
    ///
    {
        /**
         * Static factory method for creating a new object based on its class. This method
         * should be called using this._super from the Class.create that derives from this.
         * @returns An object from the pool
         */
        create: function ()
        {
            return gamecore.Pool.acquire(this);
        },

        getPool: function()
        {
            return gamecore.Pool.getPool(this);
        }

    },
    ///
    /// INSTANCE
    ///
    {
        destroyed: false,

        init: function()
        {
            this._super();
        },

        release: function ()
        {
            this.onRelease();
            gamecore.Pool.release(this);
        },

        onRelease: function()
        {
        }

    });
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = [];
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output.push(String.fromCharCode(chr1));
 
			if (enc3 != 64) {
				output.push(String.fromCharCode(chr2));
			}
			if (enc4 != 64) {
				output.push(String.fromCharCode(chr3));
			}
 
		}
 
//		output = Base64._utf8_decode(output);

        output.join('');
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
};
// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} ex The error to create a stacktrace from (optional)
     * @param {String} mode Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        // examine exception properties w/o debugger
        //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            // e.message.indexOf("Backtrace:") > -1 -> opera
            // !e.stacktrace -> opera
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            // 'opera#sourceloc' in e -> opera9, opera10a
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return 'opera9'; // use e.message
            }
            // e.stacktrace && !e.stack -> opera10a
            if (!e.stack) {
                return 'opera10a'; // use e.stacktrace
            }
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        } else if (e.stack) {
            return 'firefox';
        }
        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+(at eval )?at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    opera11: function(e) {
        // "Error thrown at line 42, column 12 in <anonymous function>() in file://localhost/G:/js/stacktrace.js:\n"
        // "Error thrown at line 42, column 12 in <anonymous function: createException>() in file://localhost/G:/js/stacktrace.js:\n"
        // "called from line 7, column 4 in bar(n) in file://localhost/G:/js/test/functional/testcase1.html:\n"
        // "called from line 15, column 3 in file://localhost/G:/js/test/functional/testcase1.html:\n"
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1]? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && curr['arguments'] && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                //req.overrideMimeType('text/plain');
                //req.overrideMimeType('text/javascript');
                req.send(null);
                //return req.status == 200 ? req.responseText : '';
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]);
                if (m) { // If falsey, we did not get any file/line information
                    var file = m[1], lineno = m[2], charno = m[3] || 0;
                    if (file && this.isSameDomain(file) && lineno) {
                        var functionName = this.guessAnonymousFunction(file, lineno, charno);
                        stack[i] = frame.replace('{anonymous}', functionName);
                    }
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};
/**
 * Playcraft Engine
 */

    // init the engine namespace
(function (window)
{
    window.pc = {};

})(window);

pc.VERSION = '0.33';

pc.Pool = gamecore.Pool;
pc.Hashtable = gamecore.Hashtable;
pc.Pooled = gamecore.Pooled;
pc.LinkedList = gamecore.LinkedList;

pc.Base = gamecore.Base('pc.Base',
    ///
    /// STATIC
    ///
    {

    },
    ///
    /// INSTANCE
    ///
    {

    });


// todo -- more robust? move to tools?
if (!Function.prototype.bind)
{
    Function.prototype.bind = function (oThis)
    {
        if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function ()
            {
            },
            fBound = function ()
            {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}
/**
 * Playcraft Engine
 *
 * Allows for input to be accepted by binding device inputs to game actions.
 * This is mostly an internal class. To manage input use the game bindInputEvent
 * and bindInputState methods to scenes, layers and entities.
 *
 * Input is limited to one event state per cycle. For example, moving the mouse
 * might generate hundreds of events per cycle, but the system will only generate one
 * action on every update.
 *
 */

pc.Input = pc.Base('pc.Input',
    {
        /**
         * Extracts the position from an event (in a cross-browser way,and then sets the passed in pos
         * @param e Event to extract the position from
         * @param pos [Optional] Position object to set. Leave out to have a new (pooled) point returned
         */
        getEventPosition:function(e, pos)
        {
            var r = pos;
            if (!pc.Tools.isValid(pos))
                r = pc.Point.create(0, 0);

            if (e.pageX || e.pageY)
            {
                r.x = e.pageX;
                r.y = e.pageY;
            } else
            {
                r.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                r.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return r;
        }

    },
    {
        stateBindings:null, // the connection between an input i.e. 'DOWN' and a state
        states:null, // the present state of an input (mouse left button down etc)
        actionBindings:null, // bindings for actions/events that occur, like 'FIRE' or 'JUMP'

        init:function ()
        {
            this._super();
            this.stateBindings = new pc.Hashtable();
            this.states = new pc.Hashtable();
            this.actionBindings = new pc.Hashtable();
        },

        onReady:function ()
        {
            // touch input
            pc.system.canvas.addEventListener('touchstart', this.touchStart.bind(this), true);
            pc.system.canvas.addEventListener('touchend', this.touchEnd.bind(this), true);
            pc.system.canvas.addEventListener('touchmove', this.touchMove.bind(this), true);

            // mouse input
            pc.system.canvas.addEventListener('mouseup', this.mouseUp.bind(this), true);
            pc.system.canvas.addEventListener('mousedown', this.mouseDown.bind(this), true);
            pc.system.canvas.addEventListener('mousemove', this.mouseMove.bind(this), true);
            pc.system.canvas.addEventListener('mousewheel', this.mouseWheel.bind(this), true);
            pc.system.canvas.addEventListener('contextmenu', this.contextMenu.bind(this), true);

            // key input
            window.addEventListener('keydown', this.keyDown.bind(this), true);
            window.addEventListener('keyup', this.keyUp.bind(this), true);
        },

        /**
         * Adds an input state for the game, like 'turning left' or 'firing' and binds that state
         * to an input code. You can bind an input to a layer, scene or entity. The input will not
         * trigger if the object is not presently active.
         * If you specify a UIElement (optional), the state is only triggered if the event occurs inside
         * the bounds of the element (typically a positional event like a touch start or mouse move)
         * @param obj An object that will be notified of the event (scene, layer or entity)
         * @param stateName The name of the state, e.g. "turning_left"
         * @param input The name of the input, i.e. 'LEFT' (see pc.InputNames)
         * @param uiElement Optional UIElement to bind the input to
         */
        bindState:function (obj, stateName, input, uiElement)
        {
            if (obj.uniqueId == null)
            {
                // todo: throw an exception?
            }

            // There can be many bindings associated with a particular input, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var bindingSet = this.stateBindings.get(input);
            if (bindingSet == null)
                this.stateBindings.put(input, [
                    { stateName:stateName, object:obj, state:{on:false, event:null}, uiElement:uiElement }
                ]);
            else
                // otherwise append a new binding
                bindingSet.push({ stateName:stateName, object:obj, state:{ on:false, event:null }, uiElement:uiElement });

            // now setup a state for this object/input combination
            this.states.put(obj.uniqueId + '\\\\' + stateName, {on: false, event: null});
        },

        // todo: rate limit the input

        changeState:function (eventCode, stateOn, event)
        {
            // grab all the bindings to this event code
            var keyName = pc.InputType.getName(eventCode);
            if (keyName == null)
            {
                this.log("Unknown keycode = " + eventCode);
                return false;
            }

            var bindingSet = this.stateBindings.get(keyName);
            //console.log('change state = ' + this.inputType.getName(event.keyCode,+ ' bindings=' + bindingSet);
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and change the state
            for (var i = 0; i < bindingSet.length; i++)
            {
                var binding = bindingSet[i];
                if (binding.object.isActive())
                {
                    if (binding.uiElement)
                    {
                        // if binding has a uiElement, then make sure the event hit is within the on-screen
                        // rectangle
                        var pos = this.Class.getEventPosition(event);
                        var er = binding.uiElement.getScreenRect();

                        if (er.containsPoint(pos))
                        {
                            var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                            state.on = stateOn;
                            state.event = event;

                            // start tracking the movement for this element
                            if (state.on)
                                this._tracks.push(binding);
                            else
                                // todo: array too slow?
                                pc.Tools.arrayRemove(this._tracks, binding);
                        }

                        er.release();
                        pos.release();
                    }
                    else
                    {
                        var state2 = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state2.on = stateOn;
                        state2.event = event;
                    }
                }
            }
            return true;
        },

        /**
         * Clears any on states related to an object
         * @param obj
         */
        clearStates:function (obj)
        {
            var bindings = this.stateBindings.entries();

            for (var b=0; b < bindings.length; b++)
            {
                var bindingSet = bindings[b];
                for (var i = 0; i < bindingSet.length; i++)
                {
                    var binding = bindingSet[i];
                    if (binding.object == obj)
                    {
                        var state = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                        state.on = false;
                        state.event = null;
                        pc.tools.arrayRemove(this._tracks, binding);
                    }
                }
            }
        },

        /**
         * Tracks states that are active, by watching to see if the mouse has moved beyond the region (such as moving
         * the mouse out of a UIElement's surrounding rectangle, or having an entity move out from under the mouse.
         * Since you can have multiple overlapping elements, we support multiple tracked selections simultaneously.
         */
        _tracks: [], // a linked list of bindings we are currently tracking

        _checkState: function(moveEvent)
        {
            // check existing tracked states -- did we move out of an element
            for (var i=0; i < this._tracks.length; i++)
            {
                var next = this._tracks[i];
                var pos = this.Class.getEventPosition(moveEvent);
                var er = next.uiElement.getScreenRect();

                if (!er.containsPoint(pos))
                {
                    // no longer in the right position, turn state off
                    var state = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                    state.on = false;
                    state.event = moveEvent;
                } else
                {
                    // moved into position, turn back on
                    var state2 = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                    state2.on = true;
                    state2.event = moveEvent;
                }

                er.release();
                pos.release();
            }

            // todo: check if we moved INTO an element, this is just checking for moving out

        },

        /**
         * Returns true if the named state is currently active. If you need anything more than the state boolean
         * use getInputState, which includes the actual event.
         * @param stateName A string representing a previously setup state, i.e. 'turning left'
         */
        isInputState:function (obj, stateName)
        {
            // lookup is very slow; have to find the state for a certain stateName and object
            // todo: oops this is creating strings for every check (usually every frame)-- get rid of it
            var state = this.states.get(obj.uniqueId + '\\\\' + stateName);
            if (state == null) throw 'Ooops, unknown state ' + stateName;
            return state.on;
        },

        /**
         * Gets the present input state object (which includes the event data).
         * @param obj
         * @param stateName
         */
        getInputState:function (obj, stateName)
        {
            return this.states.get(obj.uniqueId + '\\\\' + stateName);
        },

        /**
         * Binds an input event to an action and object; e.g. bindAction(playerShip, 'fire', 'CTRL')
         * will trigger an action callback on the playerShip entity when the CTRL key is pressed down.
         * You can bind an input to a layer, scene or entity. The input will not trigger if the object
         * is not presently active.
         * @param obj The entity, layer or scene to bind this action to
         * @param actionName The name of the action, e.g. 'FIRE' or 'JUMP'
         * @param input The input code as a string
         */
        bindAction:function (obj, actionName, input)
        {
            // There can be many bindings associated with a particular input event, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var bindingSet = this.actionBindings.get(input);
            if (bindingSet == null)
                this.actionBindings.put(input, [
                    { actionName:actionName, object:obj }
                ]);
            else
            // otherwise append a new binding
                bindingSet.push({ actionName:actionName, object:obj });

//            console.log('BINDINGS: ' + obj + ' actionName: ' + actionName + ' input: ' + input);
//            console.log(this.actionBindings.toString());

        },

        fireAction:function (eventCode, event)
        {
            var bindingSet = this.actionBindings.get(pc.InputType.getName(eventCode));
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and fire the object callbacks
            for (var i = 0; i < bindingSet.length; i++)
            {
                var obj = bindingSet[i].object;
                if (obj.isActive())
                {
                // if it's a positional event type (like a mouse down or move,then we only
                // fire events to objects where the event is within its spatial bounds
                    if (pc.InputType.isPositional(eventCode))
                    {
                        var pos = this.Class.getEventPosition(event);
                        var er = obj.getScreenRect();

                        if (er.containsPoint(pos))
                            bindingSet[i].object.onAction(bindingSet[i].actionName, event, pos);

                        pos.release();
                        er.release();
                    } else
                        bindingSet[i].object.onAction(bindingSet[i].actionName);
                }
            }
            return true;
        },

        ///////////////////////////////////////////////////////////////////////////////////
        //
        //  EVENT HANDLERS
        //
        ///////////////////////////////////////////////////////////////////////////////////

        keyDown:function (event)
        {
            if (this.changeState(event.keyCode, true, event))
                event.preventDefault();

            if (this.fireAction(event.keyCode, event))
                event.preventDefault();

        },

        keyUp:function (event)
        {
            if (this.changeState(event.keyCode, false, event))
                event.preventDefault();
        },

        touchStart:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
            {
                this.changeState(pc.InputType.TOUCH, true, event.touches[i]);
                this.fireAction(pc.InputType.TOUCH, event.touches[i]);
            }
            event.preventDefault();
        },

        touchEnd:function (event)
        {
            this._tracks.length = 0;
            for(var i=0, len=event.changedTouches.length; i < len; i++)
            {
                this.changeState(pc.InputType.TOUCH, false, event.changedTouches[i]);
            }
            event.preventDefault();
        },

        touchMove:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
            {
                this._checkState(event.touches[i]);
            }
            event.preventDefault();
        },

        mouseUp:function (event)
        {
            // kill all the mouse tracks (mouse is up)
            // todo: need separate tracks for different buttons
            this._tracks.length = 0;
            // turn off specific states
            this.changeState(pc.InputType.MOUSE_LEFT_BUTTON, false, event);
            event.preventDefault();
        },

        mouseDown:function (event)
        {
            this.changeState(pc.InputType.MOUSE_LEFT_BUTTON, true, event);
            this.fireAction(pc.InputType.MOUSE_LEFT_BUTTON, event);
            event.preventDefault();
        },

        mouseMove:function (event)
        {
            this._checkState(event);
            this.fireAction(pc.InputType.MOUSE_MOVE, event);
            event.preventDefault();
        },

        mouseWheel:function (event)
        {
            event.preventDefault();
        },

        contextMenu:function (event)
        {
        }

    });

pc.InputType = pc.Base.extend('pc.InputType',
    {
        // STATICS
        nameToCode:null,
        codeToName:null,

        POSITIONAL_EVENT_START:1000,
        MOUSE_LEFT_BUTTON: 1100,
        MOUSE_MOVE: 1101,
        TOUCH: 1000,

        init:function ()
        {
            this.nameToCode = new pc.Hashtable();
            this.codeToName = new pc.Hashtable();

            this.addInput(8, 'BACKSPACE');
            this.addInput(9, 'TAB');
            this.addInput(13, 'ENTER');
            this.addInput(16, 'SHIFT');
            this.addInput(17, 'CTRL');
            this.addInput(18, 'ALT');
            this.addInput(19, 'PAUSE');
            this.addInput(20, 'CAPS');
            this.addInput(27, 'ESC');
            this.addInput(32, 'SPACE');
            this.addInput(33, 'PAGE_UP');
            this.addInput(34, 'PAGE_DOWN');
            this.addInput(35, 'END');
            this.addInput(36, 'HOME');
            this.addInput(37, 'LEFT');
            this.addInput(38, 'UP');
            this.addInput(39, 'RIGHT');
            this.addInput(40, 'DOWN');
            this.addInput(45, 'INSERT');
            this.addInput(46, 'DELETE');

            // add alphanumierics
            for (var c=48; c < 91; c++)
            {
                var ch = String.fromCharCode(c);
                this.addInput(c, ch);
            }

            this.addInput(91, 'WINDOW_LEFT');
            this.addInput(92, 'WINDOW_RIGHT');
            this.addInput(93, 'SELECT');
            this.addInput(96, 'NUM_0');
            this.addInput(97, 'NUM_1');
            this.addInput(98, 'NUM_2');
            this.addInput(99, 'NUM_3');
            this.addInput(100, 'NUM_4');
            this.addInput(101, 'NUM_5');
            this.addInput(102, 'NUM_6');
            this.addInput(103, 'NUM_7');
            this.addInput(104, 'NUM_8');
            this.addInput(105, 'NUM_9');
            this.addInput(106, '*');
            this.addInput(107, '+');
            this.addInput(109, '-');
            this.addInput(110, '.');
            this.addInput(111, '/');
            this.addInput(112, 'F1');
            this.addInput(113, 'F2');
            this.addInput(114, 'F3');
            this.addInput(115, 'F4');
            this.addInput(116, 'F5');
            this.addInput(117, 'F6');
            this.addInput(118, 'F7');
            this.addInput(119, 'F8');
            this.addInput(120, 'F9');
            this.addInput(121, 'F10');
            this.addInput(122, 'F11');
            this.addInput(123, 'F12');
            this.addInput(144, 'NUM_LOCK');
            this.addInput(145, 'SCROLL_LOCK');
            this.addInput(186, ';');
            this.addInput(187, '=');
            this.addInput(188, ',');
            this.addInput(189, '-');
            this.addInput(190, '.');
            this.addInput(191, '/');
            this.addInput(192, '`');
            this.addInput(219, '[');
            this.addInput(220, '\\');
            this.addInput(221, ']');
            this.addInput(222, '\'');

            this.addInput(this.TOUCH, 'TOUCH');
//            this.addInput(1001, 'touchmove');
//            this.addInput(1002, 'touchend');

            this.addInput(this.MOUSE_LEFT_BUTTON, 'MOUSE_LEFT_BUTTON');
            this.addInput(this.MOUSE_MOVE, 'MOUSE_MOVE');
        },

        isPositional:function (inputCode)
        {
            return inputCode > this.POSITIONAL_EVENT_START;
        },

        /**
         * Private utility method used by the constructor to add the input codes and lookup
         * names to both indexes/hash tables
         * @param inputCode event input code (i.e. event.keyCode)
         * @param inputName the human name of the input
         */
        addInput:function (inputCode, inputName)
        {
            this.codeToName.put(inputCode, inputName);
            this.nameToCode.put(inputName, inputCode);
        },

        /**
         * Returns the name of an input based on the event code
         * @param inputCode
         */
        getName:function (inputCode)
        {
            return this.codeToName.get(inputCode);
        },

        /**
         * Returns the code of an input based on the input name
         * @param inputName
         */
        getCode:function (inputName)
        {
            return this.nameToCode.get(inputName);
        }


    },
    {}
);

/**
 * PlayCraft Engine
 * Tools: A placeholder for useful tools
 * @class
 */

pc.Tools = pc.Base.extend('pc.Tools',
    {
        /**
         * Checks if a param is valid (null or undefined) in which case the default value will be returned
         * @param p Parameter to check
         * @param def Default value to return if p is either null or undefined
         * @return p if valid, otherwise def (default)
         */
        checkParam: function(p, def)
        {
            if (!this.isValid(p))
                return def;
            return p;
        },

        /**
         * Check if a value is valid (not null or undefined)
         * @param p A value
         * @return {Boolean} true if the value is not undefined and not null
         */
        isValid: function(p)
        {
            return !(p == null || typeof p === 'undefined');
        },

        arrayRemove:function (array, e)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (array[i] == e)
                    array.splice(i, 1);
            }
        },

        /**
         * adds an element to an array, but only if it isn't already there
         * @param array the array to add to
         * @param e the element to add
         */
        arrayExclusiveAdd:function (array, e)
        {
            if (array.indexOf(e) == -1)
                array.push(e);
        },

        lightenDarkenColor:function (col, amt)
        {
            var usePound = false;

            if (col[0] == "#")
            {
                col = col.slice(1);
                usePound = true;
            }

            var num = parseInt(col, 16);

            var r = (num >> 16) + amt;

            if (r > 255) r = 255;
            else if (r < 0) r = 0;

            var b = ((num >> 8) & 0x00FF) + amt;

            if (b > 255) b = 255;
            else if (b < 0) b = 0;

            var g = (num & 0x0000FF) + amt;

            if (g > 255) g = 255;
            else if (g < 0) g = 0;

            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
        }



    },

    {
        // Static class, so nothing required here
    });

pc.tools = new pc.Tools();

// a shortcut for param validation
pc.valid = pc.Tools.isValid;

/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 * Element --  a base (interface) for elements contained within layers
 * An element is
 *  - contained within a layer
 *  - has a position and size (dimension)
 *  - has a direction
 *  - will get notified when the game is ready
 *  - can be destroyed
 *  - is updated
 *  - is drawn
 *  - can be reset
 *  - has a graphical sprite (which can be animated)
 */

// todo: add effects/transitions to an element
// components list! yah!

/**
 * @class pc.Effect
 * Add an effect to an element.
 * An effect 'modifies' an element, it's not an element in and of itself
 */
pc.Effect = pc.Pooled('pc.Effect',
    {
    },
    {
        element:null,
        active: true,

        init:function () {},
        update:function () {},

        /**
         * Called when this effect is added to an element
         * @param element
         */
        onAdded: function(element)
        {
            this.element = element;
        },

        onRemoved: function(element)
        {
            this.element = null;
        },

        release: function()
        {
            // remove the component from the element (if it's in one)
            if (this.element != null)
                this.element.remove(this);

        },

        /**
         * Resets the effect back to the start
         */
        reset: function()
        {
        }

    });


pc.FadeEffect = pc.Effect('pc.FadeEffect',
    {
        // todo: replace with state machine code (overkill?)
        STATE_FADING_IN: 0,
        STATE_HOLDING: 1,
        STATE_FADING_OUT: 2,

        create: function(fadeInTime, holdTime, fadeOutTime, loops)
        {
            var n = this._super();
            n.fadeInTime = fadeInTime;
            n.fadeOutTime = fadeOutTime;
            n.holdTime = holdTime;
            n.loops = loops;
            if (n.loops == undefined) n.loops = 1;

            n.reset();
            return n;
        }
    },
    {
        fadeInTime: 0,
        fadeOutTime: 0,
        holdTime: 0,
        startTime: 0, // start time of the current state
        timeLimit: 0, // how long before we need to change states
        state: 0,
        loops: 1,
        loopsSoFar: 0,

        init: function()
        {
        },

        /**
         * Resets the effect back to the start
         * @private
         */
        reset: function()
        {
            // reset the element's alpha channel to on (1)
            if (this.element)
                this.element.setAlpha(1);

            this.startTime = pc.system.now;
            this.loopsSoFar = 0;

            if (this.fadeInTime > 0)
            {
                this.state = this.Class.STATE_FADING_IN;
                this.timeLimit = this.fadeInTime;
                // if we have a fade in element, then start alpha at 0
                if (this.element)
                    this.element.setAlpha(0);
            }
            else if (this.holdTime > 0)
            {
                this.state = this.Class.STATE_HOLDING;
                this.timeLimit = this.holdTime;
            }
            else if (this.fadeOutTime > 0)
            {
                this.state = this.Class.STATE_FADING_OUT;
                this.timeLimit = this.fadeOutTime;
            }
        },

        update: function(elapsed)
        {
            if (!this.active) return;

            var timeSinceStart = pc.system.now - this.startTime;

            // do something about the current state, and change states if it's time.
            switch (this.state)
            {
                case this.Class.STATE_FADING_IN:
                    this.element.addAlpha((elapsed * (100/this.timeLimit))/100);
                    if (timeSinceStart > this.timeLimit)
                    {
                        this.timeLimit = this.holdTime;
                        this.startTime = pc.system.now;
                        this.state = this.Class.STATE_HOLDING;
                    }
                    break;
                case this.Class.STATE_HOLDING:
                    // do nothing whilst holding
                    if (timeSinceStart > this.timeLimit)
                    {
                        this.timeLimit = this.fadeOutTime;
                        this.startTime = pc.system.now;
                        this.state = this.Class.STATE_FADING_OUT;
                    }
                    break;
                case this.Class.STATE_FADING_OUT:
                    // reverse the alpha fade
                    this.element.addAlpha(-(elapsed * (100/this.timeLimit))/100);
                    if (timeSinceStart > this.timeLimit)
                    {
                        // all done, kill thyself
                        if (this.loops > 1)
                        {
                            this.loopsSoFar++;
                            this.startTime = pc.system.now;
                            this.timeLimit = this.fadeInTime;
                            this.state = this.Class.STATE_FADING_IN;
                        }

                        if (this.loopsSoFar >= this.loops && this.loops != 0)
                            this.release();
                    }
                    break;
            }
        }

    });


pc.Timer = pc.Pooled('pc.Timer',
    {
        create:function()
        {
            var n = this._super();
            n.time = 0;
            n.timeStart = 0;
            return n;
        }
    },
    {
        time: 0,
        timeStart: 0,

        init: function()
        {},

        start: function(time)
        {
            this.timeStart = pc.system.now();
        },

        isDone: function()
        {
            return (pc.system.now - this.timeStart > this.time);
        }


    });

pc.Element = pc.Pooled('pc.Element',
    {
        create:function (layer, x, y, dir, width, height)
        {
            var n = this._super(x, y, width, height);
            n.pos.x = x;
            n.pos.y = y;
            n.dir = dir;
            n.dim.x = width;
            n.dim.y = height;
            n.centerPos.x = n.pos.x + (n.dim.x / 2);
            n.centerPos.y = n.pos.y + (n.dim.y / 2);
            n.drawOffsetX = 0;
            n.drawOffsetY = 0;
            n._lifetime = 0;
            n._timeAlive = 0;
            n.borderColor = null;
            n.visible = true;
            n.suiciding = false;
            if (n.sprite)
                n.sprite.alpha = 0;

            if (pc.Tools.isValid(layer))
                layer.addElement(n);
            return n;
        }
    },
    {
        layer:null,
        pos:null, // position in world coords
        dir:0, // facing direction (in 0..359 degrees)
        dim:null,
        active:false,
        visible:true,
        borderColor:null,
        sprite:null,
        suiciding:false,
        lastMovePos:null,
        centerPos:null,
        _lifetime:0,
        _timeAlive:0, // time the element has been alive, only update if lifetime > 0
        _componentCache: null,

        /**
         * Base constructor -- called when you new an object; typically you should use the
         * object pool instead -- call Element.create()
         */
        init:function ()
        {
            this._super();
            this.pos = pc.Point.create(0, 0);
            this.dim = pc.Dim.create(0, 0);
            this.centerPos = pc.Point.create(0, 0);
            this.lastMovePos = pc.Dim.create(0, 0);
            this._componentCache = new pc.LinkedList();
        },

        onReady:function ()
        {
        },

        suicide:function ()
        {
            if (!this.suiciding)
            {
                this.layer.removeElement(this);
                this.suiciding = true;
            }
        },

        setAlpha: function(a)
        {
            if (pc.Tools.isValid(this.sprite))
                this.sprite.alpha = a;
        },

        getAlpha: function()
        {
            if (pc.Tools.isValid(this.sprite))
                return this.sprite.alpha;
            else
                return 0;
        },

        onResize:function (width, height)
        {
            this.dim.x = width;
            this.dim.y = height;
        },

        setLifetime:function (lifetime)
        {
            this._lifetime = lifetime;
            this._timeAlive = 0;
        },

        add: function(component)
        {
            // tell the component about us
            component.onAdded(this);
            this._componentCache.add(component);
        },

        remove: function(component)
        {
            component.onRemoved(this);
            this._componentCache.remove(component);
        },

        onAddedToLayer: function(layer)
        {
        },

        onRemovedFromLayer: function(layer)
        {
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your element object to do something about it.
         * @param actionName The name of the action that happened
         * @param event Raw event object
         * @param pos Position, such as a touch input or mouse position
         */
        onAction:function (actionName, event, pos)
        {
        },

        /**
         * Find all the elements under the x, y screen position
         * @param x the screen x position
         * @param y the screen y position
         */
        elementsUnderXY:function (x, y)
        {
            var found = [];

            var next = this.getFirstElement();
            var e = null;
            while (next)
            {
                e = next.obj;

                // is this entity on-screen?
                if (pc.Math.isPointInRect(x, y, e.x - this.offset.x, e.y - this.offset.y, e.dim.x, e.dim.y))
                    found.push(e);
                next = next.nextLinked;
            }

            return found;
        },

        /**
         * Sets the spritesheet for this entity.
         * @param spriteSheet
         */
        setSprite:function (spriteSheet)
        {
            // we create a sprite object, which just contains the state of a sprite (i.e. animation
            // frame, speed offsets and delta time).
            if (this.sprite == null)
                this.sprite = new pc.Sprite(spriteSheet, this);
            else
            {
                if (this.sprite.spriteSheet == spriteSheet)
                    this.sprite.reset();
                else
                    this.sprite = new pc.Sprite(spriteSheet, this);
            }
        },

        getSprite:function ()
        {
            return this.sprite;
        },

        /**
         * Checks whether the current input state is active or not
         * @param stateName The name of the input state to check
         * @returns true if the state is active (i.e. the key is down) otherwise false
         */
        isInputState:function (stateName)
        {
            return pc.system.input.isInputState(this, stateName);
        },

        /**
         * Returns the full state object related to a given state
         * @param stateName The name of the state to get the state object for
         */
        getInputState:function (stateName)
        {
            return pc.system.input.getInputState(this, stateName);
        },

        /**
         * Clears all input states -- for things like when an entity is destroyed in battle
         */
        clearStates:function ()
        {
            pc.system.input.clearStates(this);

        },

        // todo: setanimation has to go through the entity
        // wait and see how ai/state changing works
        setAnimation:function (name, speedOffset)
        {
            this.sprite.setAnimation(name, speedOffset);
        },

        getAnimation:function ()
        {
            return this.sprite.getAnimation();
        },

        /**
         * Get the on-screen position of any positioned object, which can be a UIElement, Layer or Entity (anything
         * that implements getPos. We use the layer's origin (for world positioning) and the scene's viewport.
         * This method creates a new pc.Rect which you should release after use
         */
        getScreenRect:function ()
        {

            var sc = this.layer.scene;
            return pc.Rect.create(this.pos.x + sc.viewPortX - this.layer.origin.x,
                this.pos.x + sc.viewPortY - this.layer.origin.y, this.dim.x, this.dim.y);
        },

        moveBy:function (x, y)
        {
            this.setPos(this.pos.x + x, this.pos.y + y);
            this.lastMovePos.x = x;
            this.lastMovePos.y = y;
        },

        setPos:function (x, y)
        {
            this.pos.x = x;
            this.pos.y = y;
            this.centerPos.x = this.pos.x + (this.dim.x / 2);
            this.centerPos.y = this.pos.y + (this.dim.y / 2);
        },

        getPos:function ()
        {
            return this.pos;
        },

        /**
         * Get a screen relative position of the entity on the screen (based on the current layer's world origin and the
         * viewports top left corner).
         * This method creates a new pc.Pos which you should release after use
         */
        getScreenPos:function ()
        {
            if (!pc.valid(this.layer)) return null;
            var sc = this.layer.scene;
            return pc.Point.create(this.pos.x + sc.viewPortX - this.layer.origin.x,
                this.pos.y + sc.viewPortY - this.layer.origin.y);
        },

        /**
         * Get a screen relative center position of the entity on the screen (based on the current layer's world
         * origin and the viewports top left corner).
         * This method creates a new pc.Pos which you should release after use
         */
        getScreenCenterPos:function ()
        {
            if (!pc.valid(this.layer)) return null;
            return pc.Point.create(this.centerPos.x + this.layer.scene.viewPortX - this.layer.origin.x,
                this.centerPos.y + this.layer.scene.viewPortY - this.layer.origin.y);
        },

        /**
         * Call from the layer system to draw the entity. x and y are the screen
         * offset for the layer (in pixels).
         * @param screenOffsetX
         * @param screenOffsetY
         * @return false if the element was drawn
         */
        draw:function (ctx, screenOffsetX, screenOffsetY, dir)
        {
            if (this.sprite == null || !this.visible) return false;

            //            if (this.Class.fullName == 'Torpedo')
            //            {
            //                this.drawOffsetX = 13;
            //                this.drawOffsetY = 13;
            //            }

            this.sprite.draw(ctx, this.pos.x + screenOffsetX - this.drawOffsetX, this.pos.y + screenOffsetY - this.drawOffsetY, dir);
            if (this.borderColor != null)
            {
                ctx.save();
                ctx.strokeStyle = this.borderColor;
                ctx.strokeRect(this.pos.x + screenOffsetX, this.pos.y + screenOffsetY, this.dim.x, this.dim.y);
                ctx.restore();
            }

            pc.system.elementsDrawn++;
            return true;
        },

        /**
         * Update cycle for the element.
         * @param elapsed
         */
        update:function (elapsed)
        {
            if (this.sprite != null)
                this.sprite.update(elapsed);

            // cycle all the components
            var next = this._componentCache.first;
            while(next)
            {
                next.obj.update(elapsed);
                next = next.nextLinked;
            }

            if (this._lifetime > 0)
            {
                this._timeAlive += elapsed;
                if (this._timeAlive > this._lifetime)
                    this.suicide();
            }
        },

        reset:function ()
        {
            if (this.sprite != null)
                this.sprite.reset();
        },


        setActive:function (goActive)
        {
            // are we going inactive? tell the layer
            if (this.active && !goActive)
                this.layer.setElementInactive(this);

            // are we going active? tell the layer
            if (!this.active && goActive)
                this.layer.setElementActive(this);

            this.active = goActive;
        },

        isActive:function ()
        {
            if (this.layer != null)
                if (!this.layer.active) return false;
            return this.active;
        }



    });






pc.DebugPanel = pc.Base('pc.DebugPanel', {}, {

    x: 0,
    y: 0,
    panelHeight: 0,
    panelWidth: 0,
    game: null,
    canvas: null,
    ctx: null,
    statusText: null,
    active: false,
    timeGraph: null,
    memGraph: null,
    entityGraph: null,
    poolGraph: null,
    currentMem: 0,
    lastMem: 0,

    init: function()
    {
        this._super();
    },

    onReady: function()
    {
        this.attach('debug');
    },
    
    attach: function(canvasElement)
    {
        this.canvas = document.getElementById(canvasElement);
        if (this.canvas == null)
        {
            this.warn('Showing debug requires a div with an id of "debug" to be added to your dom.');
            pc.system.showDebug = false;
            return;
        }

        // resize the canvas to be the size of it's parent (containing element)
        this.panelElement = this.canvas.parentNode;
        this.ctx = this.canvas.getContext('2d');
        this.game = pc.system.game;
        this.onResize();

        var np = 4;
        // create the graphs
        this.timeGraph = new pc.CanvasLineGraph(this.ctx, 'Performance', '', 10,
            [{name:'update (ms)', color:'#f55'}, { name:'render (ms)', color:'#5f5'} ], 10, 10, (this.panelWidth /np) - 10, this.panelHeight-20);

        if (typeof console.memory === 'undefined' || console.memory.totalJSHeapSize == 0)
        {
            this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', 'Memory profiling not available', 0,
                [{name:'mem used (mb)', color:'#55f'}], (this.panelWidth/np)+10, 10, (this.panelWidth/np)-10, this.panelHeight-20);
        } else
        {
            this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', '', ((console.memory.totalJSHeapSize/1024/1024) * 1.2),
                [{name:'mem used (mb)', color:'#55f'}], (this.panelWidth/np)+10, 10, (this.panelWidth/np)-10, this.panelHeight-20);
        }
        
        this.poolGraph = new pc.CanvasLineGraph(this.ctx, 'Pool Size', '', 100,
            [{ name:'pooled (total)', color:'#ef880f'} ], this.panelWidth - ((this.panelWidth/np)*2)+10, 10, (this.panelWidth/np)-20, this.panelHeight-20);

        this.entityGraph = new pc.CanvasLineGraph(this.ctx, 'Entities', '', 100,
            [{ name:'drawn (total)', color:'#f9f007'} ], this.panelWidth - (this.panelWidth/np)+10, 10, (this.panelWidth/np)-20, this.panelHeight-20);

        this.active = true;
    },

    onResize: function()
    {
        if (this.canvas == null) return;

        this.canvas.width = this.panelElement.offsetWidth;
        this.canvas.height = this.panelElement.offsetHeight;
        this.panelWidth = this.panelElement.offsetWidth;
        this.panelHeight = this.panelElement.offsetHeight;

        // clear the background
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);

        var np=4;
        if (this.timeGraph != null)
            this.timeGraph.resize(10, 10, this.panelWidth/np-10, this.panelHeight-20);
        if (this.memGraph != null)
            this.memGraph.resize(this.panelWidth/np + 10, 10, this.panelWidth/np-10, this.panelHeight-20);
        if (this.poolGraph != null)
            this.poolGraph.resize(this.panelWidth-((this.panelWidth/np)*2) + 20, 10, this.panelWidth/np-20, this.panelHeight-20);
        if (this.entityGraph != null)
            this.entityGraph.resize(this.panelWidth-(this.panelWidth/np) + 10, 10, this.panelWidth/np-20, this.panelHeight-20);

    },

    _timeSince: 0,

    update: function(delta)
    {
        if (!this.active) return;

        // update the averages
        this._timeSince += delta;
        if (this._timeSince > 30)
        {
            this._timeSince = 0;
            if (this.timeGraph != null)
                this.timeGraph.addLine2(pc.system.lastUpdateMS, pc.system.lastDrawMS);
            if (this.entityGraph != null)
                this.entityGraph.addLine1(pc.system.elementsDrawn);
            if (this.memGraph != null)
                if (typeof console.memory !== 'undefined')
                    if (console.memory.totalJSHeapSize != 0)
                        this.memGraph.addLine1( (window.performance.memory.usedJSHeapSize/1024/1024) );
            if (this.poolGraph != null)
                this.poolGraph.addLine1(pc.Pool.totalPooled);
        }
    },

    draw: function()
    {
        if (!this.active) return;

        if (this.timeGraph != null)
            this.timeGraph.draw();
        if (this.entityGraph != null)
            this.entityGraph.draw();
        if (this.memGraph != null) this.memGraph.draw();
        if (this.poolGraph != null) this.poolGraph.draw();
    }
    
});


/**
 * CanvasLineGraph -- a line bar graph designed to be update quickly (optimized drawing)
 * rendered onto a canvas. Used primarily by the debug panel to display pretty graphs
 * of performance, memory, entity and network graphs.
 */
pc.CanvasLineGraph = pc.Base.extend('pc.CanvasLineGraph', {

    height: 0,
    width: 0,
    ctx: null,
    data: null,
    maxY: 0,    // top most range value
    x: 0,
    y: 0,
    labels: null,
    graphName: null,
    bgCanvas: null,     // off screen canvas for background (grid etc)
    graphCanvas: null,      // off screen canvas for graph
    message: null,
    cursor: 0,          // position in the data array that is the head of the data

    init: function(ctx, graphName, message, maxY, labels, x, y, width, height)
    {
        this._super();

        this.ctx = ctx;
        this.message = message;
        this.graphName = graphName;
        this.maxY = maxY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.labels = labels;
        this.graphX = this.x + this.graphLeftMargin;
        this.graphY = this.y + 20;
        this.cursor = 0;

        this.graphCanvas = document.createElement('canvas');
        this.bgCanvas = document.createElement('canvas');

        this.resize(x, y, width, height);
    },

    resize: function(x, y, width, height)
    {
        // if the current graph line data is too big we need to resize it down
        if (this.width > width)
            this.data = this.data.slice(this.width - width, width);

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        // size the graph component
        this.graphHeight = this.height - 40;
        this.graphWidth = this.width - (this.graphLeftMargin + this.graphRightMargin);
        this.graphX = this.graphLeftMargin;
        this.graphY = 20;

        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.graphCanvas.width = this.graphWidth;
        this.graphCanvas.height = this.graphHeight;

        // resize the data array?
        this.resizeDataArray(this.graphWidth, this.labels.length);
        this.renderBackground();
    },

    resizeDataArray: function(newSize, numDataPoints)
    {
        var start = 0;
        if (newSize <= 0) return;

        if (this.data == null)
            this.data = [];
        else
        {
            // resize the array
            if (newSize > this.data.length) // growing?
            {
                start = this.data.length-1;
            }
            else
            {
                // shrinking -- we cut from the begining
                this.data.splice(0, newSize-this.data.length);
                if (this.cursor > this.data.length-1)
                    this.cursor = this.data.length-1;
                return; // job done, no new init needed (it's smaller)
            }
        }

        // add some new data -- the array is expanding
        for (var i=start; i < newSize; i++)
            this.data.push( new Array(numDataPoints) );
    },

    _totalAdded: 0,
    linesSinceLastPeak: 0, // set a new peak every n lines
    lastPeak: 0,
    _total: 0,

    // we use this to add multiple data items -- saves using variable length arrays (which chew
    // memory, thus we only currently support graphs with up to two data elements to a line.
    // if you want more, add an addLine3 method
    addLine2: function(lineData1, lineData2)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1 + lineData2;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this.data[this.cursor][1] = lineData2;
        this._updateGraph(this._total);
    },

    addLine1: function(lineData1)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this._updateGraph(lineData1);
    },

    checkMaxRange: function(max)
    {
        if (max > this.maxY)
        {
            this.maxY = max * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;
            this.renderBackground();
            this.renderGraph(true);
        }
    },

    _updateGraph: function(total)
    {
        this.linesSinceLastPeak++;
        if (this.linesSinceLastPeak > this.width * 1.5)
        {
            this.linesSinceLastPeak++;
            this.maxY = total * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;

            this.lastPeak = total * 1.4;
            this.renderBackground();
            this.linesSinceLastPeak = 0;
        }

        if (total > this.lastPeak)
            this.lastPeak = total * 1.4;

        this.cursor++;
        if (this.cursor > this.data.length-1)
            this.cursor = 0;

    },

    margin: 20,
    linePixelSize: 0,
    yline: 0,
    unit: 0,
    gridY: 0,
    i:0,
    n:0,
    graphLeftMargin: 30,
    graphRightMargin: 15,
    graphHeight: 0,
    graphWidth: 0,
    graphX: 0,
    graphY: 0,
    gridLineInc: 15,

    /**
     * Renders to an offscreen background canvas, which is only drawn on or resize
     */
    renderBackground: function()
    {
        var ctx = this.bgCanvas.getContext('2d');
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // graph title
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.fillText(this.graphName, this.graphX, this.graphY- 6);

        // draw the surround rectangle
        ctx.strokeStyle = '#111';
        ctx.strokeRect(this.graphX+0.5, this.graphY+0.5, this.graphWidth, this.graphHeight);

        // DRAW GRID AND MARKERS (Y AXIS)
        this.unit = (this.graphHeight) / this.maxY; // figure out the y scale
        var graphLines = (this.graphHeight + this.gridLineInc) / this.gridLineInc;
        var axisInc = this.maxY / graphLines;
        var axisValue = 0;
        var lineCount = 0;

        for (this.gridY=this.graphHeight+this.graphY; this.gridY > this.graphY+1; this.gridY -= this.gridLineInc)
        {
            lineCount++;
            ctx.textAlign = 'right';
            (lineCount % 2 == 0) ? ctx.fillStyle = '#111' : ctx.fillStyle = '#000';

            var lineHeight = this.gridLineInc;
            if (this.gridY-lineHeight < this.graphY)
            {
                lineHeight = (this.gridY - this.graphY);
                ctx.fillRect(this.graphX+1, this.graphY+1, this.graphWidth-2, lineHeight-1);
            } else
                ctx.fillRect(this.graphX+1, this.gridY - lineHeight - 1, this.graphWidth-2, lineHeight);

            axisValue = Math.round(axisInc * lineCount);
            ctx.fillStyle = '#777';
            ctx.fillText('' + axisValue, this.graphX - 5, this.gridY);
        }

        // DRAW LEGEND
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        var legendY = this.height - 13;
        var textX = this.graphLeftMargin + 3;

        for (this.n=0; this.n < this.labels.length; this.n++)
        {
            ctx.fillStyle = this.labels[this.n].color;
            ctx.fillRect(textX, legendY, 5, 5);
            ctx.fillStyle = '#888';
            ctx.fillText(this.labels[this.n].name, textX + 8, legendY + 6);
            textX += ctx.measureText(this.labels[this.n].name).width + 18;
        }

        this.renderGraph(true);
    },

    renderGraph: function(completeRedraw)
    {
        if (!this.data) return;

        var gtx = this.graphCanvas.getContext('2d');
        if (completeRedraw)
        {
            gtx.fillStyle = '#000';
            gtx.fillRect(0, 0, this.graphWidth, this.graphHeight );
        } else
            if (this._totalAdded > this.graphWidth) // we are appending a line
                gtx.drawImage(this.graphCanvas, -1, 0); // so draw the previous graph shift by one

        // now draw a new line on the far right side
        var len = 0;

        if (completeRedraw)
        {
            len = this.data.length-1;
            this.dx = 1;
            
        } else
        {
            // draw the first set of lines across, prior to scrolling
            if (this._totalAdded < this.graphWidth)
                this.dx = this.cursor;
            else
                this.dx = this.graphWidth-1;
            len = this.dx+1;
        }

        if (len == 0) return;

        // dx is the count of pixels across the screen
        // dpos is the cursor being drawn pointing inside the array
        var dpos = this.cursor-1;
        if (dpos < 0) dpos = this.data.length-1;

        for (; this.dx < len; this.dx++)
        {
            if (dpos > this.data.length-1) dpos = 0;

            gtx.fillStyle = '#000';
            gtx.fillRect(this.dx, 0, 1, this.graphHeight );

            this.yline = this.graphHeight; // start at the bottom of the graph

            for (this.i=0; this.i < this.data[dpos].length; this.i++)
            {
                this.linePixelSize = (this.data[dpos][this.i] * this.unit);

                gtx.strokeStyle = this.labels[this.i].color;
                gtx.beginPath();
                gtx.moveTo(this.dx, this.yline);

                var lineY = this.yline - this.linePixelSize;
                if (lineY < 0)
                    lineY = 0;
                gtx.lineTo(this.dx, lineY);
                gtx.closePath();
                gtx.stroke();

                this.yline -= this.linePixelSize;
            }
            dpos++;
        }

    },

    draw: function()
    {
        this.ctx.save();
        this.ctx.drawImage(this.bgCanvas, this.x, this.y);
        this.renderGraph(false);
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(this.graphCanvas, this.x + this.graphX, this.y + this.graphY);

        // draw the message over the top, if there is one
        this.ctx.font = '13px sans-serif';
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.message, this.x + this.width/2, this.y + this.height/2 - 9);

        this.ctx.restore();
    }

});

/**
 * Playcraft Engine
 * System - the interface between the device (the real world) and the game
 */

pc.System = pc.Base.extend('pc.System',
    {
    },
    {
        canvasId:null,
        canvas:null,
        canvasWidth:0,
        canvasHeight:0,
        game:null,
        loader:null,
        timer:null,
        ctx:null,
        started:false,
        fps:0,
        currentFPS:0,
        tick:0, // ms per cycle (just 1000/fps for convenience)
        requestAnim:null, // the cross-browser compatible animation function
        running:true,
        scale:1,
        xmlParser:null,

        // debug related
        debugPanel:null,
        editor:null,
        showDebug:true,
        debugCollisions:false,
        enablePooling:true,
        soundEnabled:true,

        elementsDrawn:0,
        lastUpdateMS:0,
        lastDrawMS:0,

        // device information
        screen:null, // the device's screen dimensions (i.e. the display)
        pixelRatio:1,
        isiPhone:false,
        isiPhone4:false,
        isiPad:false,
        isAndroid:false,
        isAppMobi:false,
        isTouch:false,
        device: null, // todo: replace the above with pc.device. calls (to use gamecore)

        requestAnimFrame:null,
        input:null,

        // temps
        elapsed:0, // delta time between frames
        lastFrame:0, // time of the previous frame
        now:Date.now(),

        /**
         * The system object is globally constructed, however since the game objects is designed to
         * be the primary interface to the developer -- i.e. you only have to create a game object
         * and it will take care of constructing the system object -- we don't do a lot on construction
         * as the game will call setup (along with the required canvas ID etc params.
         */
        init:function ()
        {
            this._super();

            // start up the input handler
            this.input = new pc.Input();

        }, // default constructor does nothing

        /**
         * Setup the system interface for the game. Typically this will just be automatically called
         * by the game object and you don't need to worry about it.
         * @param canvasId The class ID of the canvas to render to
         * @param game The game class this system is setup against (one to one)
         * @param maxFPS The maximum framerate to run at
         */
        create:function (canvasId, game, maxFPS)
        {
            this.info('Playcraft Engine v' + pc.VERSION + ' starting.');
            this.canvasId = canvasId;
            this.game = game;
            this.fps = maxFPS;
            this.tick = 1000 / this.fps;

            this.debugPanel = new pc.DebugPanel();
            //            this.editor = new pc.Editor();
            this.loader = new pc.Loader();
            this.isAppMobi = (typeof AppMobi != "undefined");

            // todo: move this to pc.Device = gamecore.Device
            this.pixelRatio = gamecore.Device.pixelRatio;
            this.isiPhone = gamecore.Device.isiPhone;
            this.isiPhone4 = gamecore.Device.isiPhone4;
            this.isiPad = gamecore.Device.isiPad;
            this.isAndroid = gamecore.Device.isAndroid;
            this.isTouch = gamecore.Device.isTouch;
            this.device = gamecore.Device;

            this.requestAnimFrame = gamecore.Device.requestAnimFrame;
            this.requestAnimFrame = (function ()
            {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element)
                        {
                            window.setTimeout(callback, 1000 / this.fps);
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element)
                {
                    request.apply(window, [callback, element]);
                };
            })();

            if (!this.isAppMobi)
                document.addEventListener("DOMContentLoaded", this.onReady.bind(this), false);
            else
            {
                alert('118');
                document.addEventListener("appMobi.device.ready", this.onReadyAppMobi.bind(this), false);
            }

            window.onresize = this.onResize();//addEventListener("resize", this.resize.bind(this), false);
            // since the above wont work with IE we fall back
            // window.onload = this.start();
        },

        onReadyAppMobi:function ()
        {
            AppMobi.display.useViewport(document.body.offsetWidth, document.body.offsetHeight);

            //lock orientation
            AppMobi.device.setRotateOrientation("landscape");
            AppMobi.device.setAutoRotate(false);

            //manage power
            AppMobi.device.managePower(true, false);
            AppMobi.device.hideSplashScreen();

            this.onReady();
        },

        _calcScreenSize:function ()
        {
            if (this.isAppMobi)
            {
                if (this.screen != null)
                    this.screen.release();
                this.screen = pc.Dim.create(document.body.offsetWidth, document.body.offsetHeight);

                this.canvas.width = this.screen.x;
                this.canvas.height = this.screen.y;
                this.canvas.innerWidth = this.screen.x;
                this.canvas.innerHeight = this.screen.y;
                this.canvasWidth = this.screen.x;
                this.canvasHeight = this.screen.y;
            } else
            {
                // if the game canvas is in a surrounding div, size based on that
                if (this.panelElement)
                {
                    this.canvas.width = this.panelElement.offsetWidth;
                    this.canvas.height = this.panelElement.offsetHeight;
                    this.canvasWidth = this.canvas.width;
                    this.canvasHeight = this.canvas.height;
                }

                this.screen = pc.Dim.create(this.canvasWidth, this.canvasHeight);

            }

        },

        onReady:function ()
        {
            try
            {
                if (this.started) return; // check we haven't already started

                this.canvas = document.getElementById(this.canvasId);
                this.input.onReady();
                this.ctx = this.canvas.getContext('2d');

                // automatically resize to match my parent container
                this.panelElement = this.canvas.parentNode;
                this.onResize();

                // experimental webgl renderer
                //                            WebGL2D.enable(this.canvas); // adds "webgl-2d" to cvs
                //                            this.ctx = this.canvas.getContext('webgl-2d');

                // init the debug panel
                this.debugPanel.onReady();

                // start the editor
                if (this.editor)
                    this.editor.onReady();

                this.lastFrame = Date.now();

                // give the game a chance to do something at the start
                this.game.onReady();

                // start the central game timer
                this.requestAnimFrame(this.cycle.bind(this));

                this.started = true;
            }

            catch (e)
            {
                if (this.isAppMobi)
                    alert(e + ' trace: ' + printStackTrace(e));
                else
                    throw e; // throw it on so the browser's can report nice error logs
            }
        },

        startTime:0,

        cycle:function (time)
        {
            if (this.running !== false)
            {
                this.now = Date.now();
                this.elapsed = Date.now() - this.lastFrame;

                // do not render frame when delta is too high
                if (this.elapsed < 2000)
                {
                    this.currentFPS = Math.round(1000.0 / this.elapsed);
                    this.elementsDrawn = 0;

                    this.startTime = Date.now();
                    this.running = this.update(this.elapsed);
                    this.lastUpdateMS = Date.now() - this.startTime;

                    this.startTime = Date.now();
                    this.draw(this.ctx);

                    this.lastDrawMS = Date.now() - this.startTime;

                    if (this.showDebug)
                    {
                        this.debugPanel.update(this.elapsed);
                        this.debugPanel.draw(this.ctx);
                    }
                }
                this.lastFrame = this.now;
                this.requestAnimFrame(this.cycle.bind(this));
            }

        },

        resize:function (w, h)
        {
            this.canvas.width = w;
            this.canvas.height = h;
            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize(this.canvasWidth, this.canvasHeight);
        },

        /**
         * Called when the primary display canvas has changed size in the browser
         */
        onResize:function ()
        {
            if (this.canvas == null) return;

            this._calcScreenSize();

            if (this.isiPhone || this.isiPad)
            {
                //                this.canvas.width = this.screen.w;
                //                this.canvas.height = this.screen.h;
            }

            var flip = false;
            if (typeof window.orientation !== 'undefined' && window.orientation != 0)
                flip = true;

            if (typeof AppMobi !== 'undefined' && AppMobi.device.orientation != '0')
                flip = true;

            if (flip)
            {
                // in landscape, flip things around
                var w = this.canvas.width;
                this.canvas.width = this.canvas.height;
                this.canvas.height = w;

                if (this.isiPad) // todo: weird appmobi issue for frontier -- performance dies when rendering past 1000 pixels (with starfield on)
                    this.canvas.width = 1000;
            }

            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize();
        },


        update:function (delta)
        {
            return this.game.update(delta);
        },

        draw:function (ctx)
        {
            this.game.draw(ctx);
            // draw current FPS
            //            ctx.fillStyle='#ffffff';
            //            ctx.font = '' + (8 * this.pixelRatio) + 'pt Calibri';
            //            ctx.fillText('' + this.currentFPS, 2, 18);
        },

        // Helpers
        isOnScreen:function (x, y, w, h)
        {
            return pc.Math.isRectColliding(x, y, w, h, 0, 0, this.canvasWidth, this.canvasHeight);
        },

        /**
         * Parses XML and returns an XMLDoc
         */
        parseXML:function (xml)
        {
            if (window.DOMParser)
            {
                // standard
                if (!this.xmlParser)
                    this.xmlParser = new DOMParser();
                return this.xmlParser.parseFromString(xml, "text/xml");

            } else // ie
            {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.loadXML(xml);
                return xmlDoc;
            }
        },

        setDebugCollisions:function (debug)
        {
            this.debugCollisions = debug;
            var c = null;

            if (debug)
                c = '#33ff33';

            // go through all the objects and turn on the collision rectangle
            var nextScene = this.game.getFirstScene();
            while (nextScene)
            {
                var nextLayer = nextScene.obj.getFirstLayer();
                while (nextLayer)
                {
                    if (nextLayer.getFirstElement != undefined)
                    {
                        var nextElement = nextLayer.obj.getFirstElement();
                        while (nextElement)
                        {
                            nextElement.obj.borderColor = c;
                            nextElement = nextElement.nextLinked;
                        }
                    }
                    nextLayer = nextLayer.nextLinked;
                }
                nextScene = nextScene.nextLinked;
            }

        }

    });


// the singleton system by which we reference the device and setup events
pc.system = new pc.System();
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 */

/**
 * Layers are components of a scene.
 *
 * There are three types:
 *
 * Layers
 * TileLayers
 * EntityLayers
 *
 */
pc.Layer = pc.Base.extend('pc.Layer', {}, {

    name:null,
    paused:false,
    active:false,
    scene:null,
    origin:null,
    collidable:false,

    init:function (name, collidable)
    {
        this._super();

        this.name = name;
        this.collidable = collidable;
        this.origin = pc.Point.create(0, 0);
    },

    release:function ()
    {
        this.origin.release();
    },

    isActive:function ()
    {
        if (this.scene != null)
            if (!this.scene.active) return false;
        return this.active;
    },

    setActive:function ()
    {
        this.scene.setLayerActive(this);
    },

    setInactive:function ()
    {
        this.scene.setLayerInactive(this);
    },

    /**
     * Sets the origin world point of the top left of this layer.
     * @param p {pc.Point} the origin point to use
     */
    setOrigin:function (p)
    {
        this.origin.x = p.x;
        this.origin.y = p.y;
    },

    /**
     * Returns the actual on-screen position of a given world X position
     */
    worldXToScreen:function (x)
    {
        return x - this.origin.x;
    },

    /**
     * Returns the actual on-screen position of a given world Y position
     */
    worldYToScreen:function (y)
    {
        return y - this.origin.y;
    },

    /**
     * Get a screen relative position from a world coordinate. You should release the position
     * object after use
     * @param pos World relative position
     */
    screenPos:function (pos)
    {
        return pc.Point.create(pos.x + this.scene.viewPortX - this.layer.origin.x,
            pos.y + this.scene.viewPortY - this.layer.origin.y);
    },

    /**
     * This method is typically called by this layer's scene. The view port is the screen
     * coordinates relatively to the physical canvas upon which we are drawing. It is
     * explicitely not in world coordinates -- this is a primary separation of a layer
     * and a scene (scene's deal in screen coordinates, layer's deal in world coordinates
     * which are relative for entities
     * @param ctx
     * @param vx The left position of the view port
     * @param vy The top position of the view port
     * @param vw The width of the view port
     * @param vh The height of the view port
     */
    draw:function (ctx, vx, vy, vw, vh)
    {
    },

    update:function (delta)
    {
    },

    /**
     * Pauses this layer
     */
    pause:function ()
    {
        this.paused = true;
    },

    /**
     * Resumes all active layers
     */
    resume:function ()
    {
        this.paused = false;
    },

    onResize:function (width, height)
    {
    },

    onAddedToScene: function()
    {
    },

    onRemoveFromScene: function()
    {},

    /**
     * Fired when a bound event/action is triggered in the input system. Use bindAction
     * to set one up. Override this in your object to do something about it.
     * @param actionName The name of the action that happened
     * @param event Raw event object
     * @param pos Position, such as a touch input or mouse position
     */
    onAction:function (actionName, event, pos)
    {
    }

});


/**
 * ElementLayer -- a layer that can contain pc.Elements (such as UIElement's and Entities)
 * It's different to a layer in that it has:
 * - Elements
 */
pc.ElementLayer = pc.Layer('pc.ElementLayer', {}, {

    elements:null,
    activeElements:null,
    suicides:null,

    init:function (name, collidable)
    {
        this._super(name);
        this.collidable = pc.Tools.checkParam(collidable, false);
        this.elements = new pc.LinkedList();
        this.activeElements = new pc.LinkedList();
        this.suicides = new pc.LinkedList();
    },

    setElementActive:function (e)
    {
        this.activeElements.add(e);
        e.active = true;
    },

    setElementInactive:function (e)
    {
        this.activeElements.remove(e);
        e.active = false;
    },

    getFirstActiveElement:function ()
    {
        return this.activeElements.first;
    },

    getFirstElement:function ()
    {
        return this.elements.first;
    },

    addElement:function (e)
    {
        this.elements.add(e);
        e.layer = this;
        this.setElementActive(e);
        e.onAddedToLayer(this);
    },

    /**
     * Removes an element from the current layer. Note that the actual removal will happen at the
     * end of any current cycle (such as a draw or update) in order to keep things stable
     * @param e
     */
    removeElement:function (e)
    {
        this.suicides.add(e);
        e.onRemovedFromLayer(this);
    },

    /**
     * Does the actual removal of the element from the layer, called by the suicide handler at the end of each update
     * @param e Element to be removed
     */
    _removeElement:function (e)
    {
        this.setElementInactive(e);
        this.elements.remove(e);
        e.layer = null;
        e.release();
    },

    update:function (delta)
    {
        this._super(delta);

        // Primary update cycle -- for all active elements
        var next = this.getFirstActiveElement();
        while (next)
        {
        	//alert('update: ' + next.obj);
            next.obj.update(delta);
            next = next.nextLinked;
        }

        // Now that the primary cycle is complete, go through and safely remove all the elements that
        // were destroyed
        next = this.suicides.first;
        while (next)
        {
            var e = next.obj;
            this._removeElement(e);
            next = next.nextLinked;
        }

        this.suicides.clear();
    },

    onReady:function ()
    {
        this._super();
        var next = this.getFirstElement();
        while (next)
        {
            next.onReady();
            next = next.nextLinked;
        }
    },

    /**
     * Draw the layer - note that since a UI layer is in screen coordinates, origin has no impact
     * @param ctx
     * @param vx The left position of the view port
     * @param vy The top position of the view port
     * @param vw The width of the view port
     * @param vh The height of the view port
     */
    draw:function (ctx, vx, vy, vw, vh)
    {
        this._super(ctx, vx, vy, vw, vh);
        var next = this.getFirstActiveElement();
        while (next)
        {
            next.obj.draw(ctx, vx - this.origin.x, vy - this.origin.y);
            next = next.nextLinked;
        }
    },

    onResize:function (width, height)
    {
        this._super(width, height);
        var next = this.getFirstElement();
        while (next)
        {
            next.obj.onResize(width, height);
            next = next.nextLinked;
        }
    }

});

/**
 * Adds collision detection to the element layer
 */
pc.EntityLayer = pc.ElementLayer('pc.EntityLayer', {},
    {
        collidableEntities:null,

        init:function (name, collidable)
        {
            this._super(name, collidable);
            this.collidableEntities = new pc.LinkedList();

        },

        /**
         * @param e {pc.Entity} Entity that is being checked for collisions
         */
        checkCollision:function (e, xMove, yMove)
        {
            if (!e._collidable) return;

            var next = this.collidableEntities.first;
            while (next)
            {
                if (next.obj != e && next.obj._collidable)
                {
                    if (pc.Math.isRectColliding(e.pos.x + xMove + e.collisionMargin, e.pos.y + yMove, e.dim.x- + e.collisionMargin, e.dim.y- + e.collisionMargin,
                        next.obj.pos.x+ next.obj.collisionMargin, next.obj.pos.y-next.obj.collisionMargin,
                        next.obj.dim.x- next.obj.collisionMargin, next.obj.dim.y- next.obj.collisionMargin))
                    {
                        // find if this is a current collision
                        var collision = e.getCollisionWithEntity(next.obj);
                        if (!collision)
                        {
                            // nope, create a new collision
                            // todo: add axis detection on entity hits

                            collision = pc.EntityCollision.create(next.obj, xMove, yMove);
                            e.onCollisionStart(collision);

                            // create the opposing collision as well
                            var otherCollision = pc.EntityCollision.create(e, xMove, yMove);
                            next.obj.onCollisionStart(otherCollision);

                        } else
                        {
                            collision.current = true;
                            e.onCollision(collision);

                            // todo: oncollision reactions for non-moving entities
                            // presently the opposing colliding object may not get an onCollision if
                            // it's not moving, this will have to be resolved by moving away from movement
                            // based detection of collisions to something more general (which also means
                            // we need axis detection on collision hits based on last movement
                        }

                    }
                }
                next = next.nextLinked;
            }

            // check the other collisions for this entity, clear them if they are no longer current
            var nextCollision = e.currentCollisions.first;
            while (nextCollision)
            {
                if (nextCollision.obj.type == pc.Collision.ENTITY_TYPE)
                {
                    if (!nextCollision.obj.current)
                    {
                        // send an onCollisionEnd to the opposing entity as well
                        var opposingCollision = nextCollision.obj.entity.getCollisionWithEntity(e);
                        if (opposingCollision)
                            nextCollision.obj.entity.onCollisionEnd(opposingCollision);

                        // fire the collision end event and then kill this collision object (no longer needed)
                        e.onCollisionEnd(nextCollision.obj);

                    }
                    else
                        // was current, so clear it for next time
                        nextCollision.obj.current = false;
                }

                nextCollision = nextCollision.next;
            }



        },

        setElementActive:function (e)
        {
            this._super(e);
            if (e._collidable)
                this.collidableEntities.add(e);
        },

        setElementInactive:function (e)
        {
            this._cleanupCollisions(e);

            this._super(e);
            if (e._collidable)
            {
                this.collidableEntities.remove(e);
                e._colliable = false;
            }
        },

        _cleanupCollisions:function(e)
        {
            // check for any collisions that exist with this entity and bring about their demise
            var nextCollision = e.currentCollisions.first;
            while (nextCollision)
            {
                if (nextCollision.obj.type == pc.Collision.ENTITY_TYPE)
                {
                    var opposingCollision = nextCollision.obj.entity.getCollisionWithEntity(e);
                    if (opposingCollision)
                        nextCollision.obj.entity.onCollisionEnd(opposingCollision);
                    e.onCollisionEnd(nextCollision.obj);

                }

                nextCollision = nextCollision.next;
            }
        },

        _removeElement: function(e)
        {
            this._cleanupCollisions(e);
            // call the super last so we know we're dealing with a first-class undeleted entity object
            this._super(e);
        },

        loadFromTMX:function (groupXML)
        {
            this.name = groupXML.getAttribute('name');

            // Parse object xml instances and turn them into entities
            // XML = <object type="EnemyShip" x="2080" y="256" width="32" height="32"/>
            var objs = groupXML.getElementsByTagName('object');
            for (var i = 0; i < objs.length; i++)
            {
                var objData = objs[i];
                var objClass = objData.getAttribute('type');
                var x = parseInt(objData.getAttribute('x'));
                var y = parseInt(objData.getAttribute('y'));
                // we ignore the size at the moment (since entities take care of that already)

                // create a new entity
                var n = eval('new ' + objClass + '()');
                n.Class.create(this, x, y);
            }
        }

    });


/**
 * @class pc.TiledLayer
 * TiledLayer provides tools for generating tiled map layers.
 * The primary reason to use a tile map is speed. You *could* generate a map simply by
 * creating entities on the screen at fixed, regular positions. A tile map makes
 * things a lot faster due to it's granularity. It's easy to figure out which
 * tiles should be drawn because the tile size is fixed, and therefore we can
 * order entities in a 2d array.
 *
 * Tilemaps are nice because:
 * 1. It's much faster to figure out what to draw, since we can store them in a spatial 2d array
 * 2. Collision detection is faster (due to both the 2d spatial storage, tile granularity and
 *    lack of collision detection)
 * 3. For many cases you can store a simplified tile type, instead of a full object reference
 *    which is yummy because it saves you some memory on large maps
 *
 * The catches with using tilemaps are:
 * 1. Entities can only move in tile increments (or multiples)
 * 2. All the entities have to have a size in multiples of the base tile size
 * 3. There's no collision detection between other tiles (though entities on other
 *    layers can collide with tiles
 *
 * Note: if you want to have entities moving (beyond just tile granularity), then use an EntityLayer
 * as this implements fast sorting and collision detection to accomodate lots of moving objects.
 * You can have both a tile and entity layer work together in the same scene.
 *
 * There are two types of tiles you can place in a tile map:
 * 1. A basic tiled image -- such as ground or buildings (they can be animated for things like water)
 * 2. An entity -- adds AI, entity creation and can be customized with your own code (rocket towers)
 *
 * And then there's the mid-case of animated tiles. You don't need a full scale entity, but you
 * do want the tile to animate a little. You can achieve this by creating a tile type based
 * on a SpriteSheet. The tile will then animate nicely. Think of water on land that animated slightly
 * or a flickering dungeon torch.
 *
 * Only one catch, if you use a lot of this same tile, all of them animate exactly the same, which
 * is like watching olympic synchronize swimming, only worse. The trick we use to help here is to set
 * an animation offset based on the position of the tile on the map. This randomizes the animation
 * state so they all look different; and doesn't require us to store animation state separately for
 * every instance of the tile, thus keeping things nice and quick.
 */

    // todo: support fixed position entities in tile layers

pc.TiledLayer = pc.Layer.extend('pc.TiledLayer', {},
    {
        tileMap:null, // the tile array can contain either entities or tile types

        tileTypes:[], // an array of all the tile types on the map. These can be spritesheets or entities
        // i.e.
        // 0: towerEntity0 (instance of a TowerEntity)
        // 1: SpriteSheet('flaming torch)
        // todo: support different tile types
        tileWidth:0,
        tileHeight:0,
        tileSpriteSheet:null,
        tilesWide:0,
        tilesHigh:0,
        debugShowGrid:false,

        init:function (name, collidable, tileSpriteSheet, tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
        {
            this._super(name, collidable);
            this.tileSpriteSheet = tileSpriteSheet;
            this.tileMap = tiles;
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;
            this.tilesWide = tilesWide;
            this.tilesHigh = tilesHigh;
        },

        generate:function (tw, th, tile)
        {
            this.tileMap = new Array(th);

            for (var aty = 0; aty < th; aty++)
            {
                this.tileMap[aty] = new Array(tw);
                for (var atx = 0; atx < tw; atx++)
                    this.tileMap[aty][atx] = tile;
            }
        },

        setRegion:function (tx, ty, tw, th, tile)
        {
            for (var aty = ty; aty < ty + th; aty++)
                for (var atx = tx; atx < tx + tw; atx++)
                    this.tileMap[aty][atx] = tile;
        },

        clear:function (tx, ty, tw, th)
        {
            this.setRegion(-1, tx, ty, tw, th);
        },

        setTile:function (tx, ty, tileType)
        {
            // todo: for now, tiletype corresponds to the spritesheet frame. no animation support
            this.tileMap[ty][tx] = tileType;
        },

        setTileSpriteSheet:function (tileSpriteSheet)
        {
            this.tileSpriteSheet = tileSpriteSheet;
        },

        draw:function (ctx, vx, vy, vw, vh)
        {
            this._super(ctx, vx, vy, vw, vh);

            // figure out which tiles are on screen
            var tx = Math.floor(this.origin.x / this.tileWidth);
            if (tx < 0) tx = 0;
            var ty = Math.floor(this.origin.y  / this.tileHeight);
            if (ty < 0) ty = 0;

            var tw = (Math.ceil((this.origin.x + vw)/this.tileWidth) - tx) + 2;
            if (tx + tw >= this.tilesWide - 1) tw = this.tilesWide - 1 - tx;
            var th = (Math.ceil((this.origin.y + vh)/this.tileHeight) - ty) + 2;
            if (ty + th >= this.tilesHigh - 1) th = this.tilesHigh - 1 - ty;

            var yh = ty + th;
            var xh = tx + tw;

            for (var y = ty; y < yh + 1; y++)
            {
                var ypos = (y * this.tileHeight) - this.origin.y + vy;

                for (var x = tx; x < xh; x++)
                {
                    var tileType = this.tileMap[y][x];
                    var tty = pc.Math.floor(tileType / this.tileSpriteSheet.framesWide);
                    var ttx = tileType % this.tileSpriteSheet.framesWide;
                    if (tileType >= 0)  // -1 means no tile
                        this.tileSpriteSheet.drawFrame(ctx, ttx, tty,
                            (x * this.tileWidth) - this.origin.x + vx, ypos);

                    if (this.debugShowGrid)
                    {
                        ctx.save();
                        ctx.strokeStyle = '#222222';
                        ctx.strokeRect((x * this.tileWidth) - this.origin.x, (y * this.tileHeight) - this.origin.y,
                            this.tileWidth, this.tileHeight);
                        ctx.restore();
                    }
                }
            }
        },

        checkCollisionTile:function (tx, ty)
        {
            if (!this.isOnMap(tx, ty))
                return;

            return (this.tileMap[ty][tx] >= 0);
        },

        isOnMap: function(tx, ty)
        {
            return !(ty < 0 || ty >= this.tilesHigh || tx < 0 || tx >= this.tilesWide);
        },

        tilesHit: [],
        checkCollision:function (e, xMove, yMove)
        {
            var xAxisCollision = false;
            var yAxisCollision = false;
            var tx = 0;
            var ty = 0;
            var collisionX = 0;
            var collisionY = 0;


            // collisions dont work if you push through

            if (xMove != 0)
            {
                var startTY = Math.floor((e.pos.y + e.collisionMargin) / this.tileHeight);
                var endTY = Math.ceil((e.pos.y + e.dim.y - e.collisionMargin) / this.tileHeight);

                if (xMove > 0)
                {
                    // moving right (test the right edges)
                    tx = Math.floor((e.pos.x + e.dim.x + xMove - e.collisionMargin) / this.tileWidth);
                    for (ty = startTY; ty < endTY; ty++)
                    {
                        if (this.checkCollisionTile(tx, ty))
                        {
                            xAxisCollision = true;
                            collisionX = tx;
                            collisionY = ty;
                        }
                    }
                }
                else
                {
                    // moving left (test the left edges)
                    tx = Math.floor((e.pos.x + xMove + e.collisionMargin) / this.tileWidth);
                    for (ty = startTY; ty < endTY; ty++)
                    {
                        if (this.checkCollisionTile(tx, ty))
                        {
                            xAxisCollision = true;
                            collisionX = tx;
                            collisionY = ty;
                        }
                    }
                }
            }

            // y-axis
            if (yMove != 0)
            {
                var startTX = Math.floor((e.pos.x + e.collisionMargin) / this.tileWidth);
                var endTX = Math.ceil((e.pos.x + e.dim.x - e.collisionMargin) / this.tileWidth);

                if (yMove > 0)
                {
                    // moving down
                    ty = Math.floor((e.pos.y + e.dim.y + yMove - e.collisionMargin) / this.tileHeight);
                    for (tx = startTX; tx < endTX; tx++)
                    {
                        if (this.checkCollisionTile(tx, ty))
                        {
                            yAxisCollision = true;
                            collisionX = tx;
                            collisionY = ty;
                        }
                    }
                }
                else
                {
                    // moving up
                    ty = Math.floor((e.pos.y + yMove + e.collisionMargin) / this.tileHeight);
                    for (tx = startTX; tx < endTX; tx++)
                    {
                        if (this.checkCollisionTile(tx, ty))
                        {
                            yAxisCollision = true;
                            collisionX = tx;
                            collisionY = ty;
                        }
                    }
                }
            }

            if (xAxisCollision || yAxisCollision)
            {
                var collision = e.getCollisionWithTile(collisionX, collisionY);
                if (!collision)
                {
                    collision = pc.TileCollision.create(collisionX, collisionY, xAxisCollision, yAxisCollision, xMove, yMove);
                    e.onCollisionStart(collision);

                } else
                {
                    collision.current = true; // mark as current
                    e.onCollision(collision);
                }
            }

            // check all present tile collisions for this entity, clear them if they are no longer current
            var nextCollision = e.currentCollisions.first;
            while (nextCollision)
            {
                if (nextCollision.obj.type == pc.Collision.TILE_TYPE)
                {
                    if (!nextCollision.obj.current)
                        // fire the collision over event and then kill this collision object (no longer needed)
                        e.onCollisionEnd(nextCollision.obj);
                    else
                        // was current, so clear it for next time
                        nextCollision.obj.current = false;
                }
                nextCollision = nextCollision.next;
            }
        },

        loadFromTMX:function (layerXML)
        {
//            var xmlDoc = pc.system.parseXML(levelDataResource.data);

//            var mapXML = xmlDoc.getElementsByTagName('map')[0];
//            this.tileWidth = parseInt(mapXML.getAttribute('tilewidth'));
//            this.tileHeight = parseInt(mapXML.getAttribute('tileheight'));

//            var layerXML = null;
//            var layers = xmlDoc.getElementsByTagName('layer');

            this.name = layerXML.getAttribute('name');
            this.tilesWide = parseInt(layerXML.getAttribute('width'));
            this.tilesHigh = parseInt(layerXML.getAttribute('height'));

            var data = layerXML.getElementsByTagName('data')[0];
            if (data.getAttribute('compression'))
            {
                this.error('map: ' + name + ': TMX map compression not supported');
                return;
            }

            if (data.getAttribute('encoding') == 'base64')
            {
                // convert the base64 data to tiles
                var tileData = '';
                for (var n = 0; n < data.childNodes.length; n++)
                    tileData += data.childNodes[n].nodeValue;

                // trim
                tileData = tileData.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                var decoded = atob(tileData);//Base64.decode(tileData);

                // decode as an array
                var a = [];
                for (var i = 0; i < decoded.length / 4; i++)
                {
                    a[i] = 0;
                    for (var j = 3; j >= 0; --j)
                        a[i] += decoded.charCodeAt((i * 4) + j) << (j << 3);
                }
            }

            // todo: merge this with the above decode to speed up map setup
            this.tileMap = new Array(this.tilesHigh);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.tileMap[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.tileMap[aty][atx] = a[aty * this.tilesWide + atx] - 1;
            }
        },

        loadFromJSON:function ()
        {
//            var data = JSON.parse(levelDataResource.data);
//            var layerData = data.layers[0];

            // array of tiles from tiled json data format, we need to break this into a 2d array
            // and offset the tile indexes by 1 (since tiled uses 0 as empty and we use -1)
//            var tilesWide = layerData.width;
//            var tilesHigh = layerData.height;

            // TBD

        }
    });


pc.UIElement = pc.Element('pc.UIElement',

    ///
    /// STATICS
    ///
    {
    },

    ///
    /// INSTANCE
    ///
    {
        /**
         * Call from the layer system to draw the entity. x and y are the screen
         * offset for the layer (in pixels).
         * @param screenOffsetX
         * @param screenOffsetY
         */
        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            this._super(ctx, screenOffsetX, screenOffsetY, 0);
        }

    });






/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 * Entity - the basic building block of a game element
 *
 * In additon to an element, an entity has:
 * - physics (simple)
 * - collision detection
 */

pc.Entity = pc.Element('pc.Entity',

    ///
    /// STATICS
    ///
    {
        /**
         * Factory for creating new entities (which will be pooled)
         * @param layer {pc.EntityLayer} Layer this entity is a part of
         * @param x
         * @param y
         * @param dir
         * @param width
         * @param height
         */
        create: function (layer, x, y, dir, width, height, collidable)
        {
            var n = this._super(layer, x, y, dir, width, height);
            n.velX = 0;
            n.velY = 0;
            n.maxVelX = 5;
            n.maxVelY = 5;
            n.thrust = 0;
            n.accelX = 0;
            n.accelY = 0;
            n.thrust = 0;
            n.faceVel = false;
            n.setCollidable(collidable);
            n.currentCollisions.clear();
            if (n.getSprite())
                n.getSprite().reset();
            return n;
        }

    },
    ///
    /// INSTANCE
    ///
    {
        physics: null,

        // basic physics
        velX: 0, velY: 0,
        maxVelX: 5, maxVelY: 5,
        bounce: 0.5,
        faceVel: false,  // direction will always match velocity direction

        accelX: 0, accelY: 0,
        drawOffsetX: 0, drawOffsetY: 0,
        thrust: 0,
        drawStats: false,
        collisionMargin: 0,

        _collidable: false,
        currentCollisions: null,

        /**
         * Base constructor -- called when you new an object; typically you should use the
         * object pool instead -- call Entity.create()
         */
        init: function()
        {
            this._super();
            this.currentCollisions = new pc.LinkedList();
        },

        onAddedToLayer: function(layer)
        {
            // make sure the collidable is added to the layer
            this.setCollidable(this._collidable);
        },

        setCollidable: function(collidable)
        {
            if (collidable && this._collidable) return; // already done
            if (!collidable && !this._collidable) return; // already done

            if (!this._collidable)
            {
                if (pc.Tools.isValid(this.layer))
                    this.layer.collidableEntities.add(this);
                this._collidable = true;

            } else
            {
                if (pc.Tools.isValid(this.layer))
                    this.layer.collidableEntities.remove(this);
                this._collidable = false;
            }
        },

        /**
         * Returns the collision object between this entity and another; or null if no collision exists
         * @param entity Entity the collision might be with
         */
        getCollisionWithEntity: function(entity)
        {
            var next = this.currentCollisions.first;
            while (next)
            {
                if (next.obj.type == pc.Collision.ENTITY_TYPE && next.obj.entity == entity)
                    return next.obj;
                next = next.nextLinked;
            }
            return null;
        },

        /**
         * Gets the collision object between this entity and a given tile
         * @param tileX
         * @param tileY
         * @return {pc.Collision} Collision object, or null if no collision is currently happening
         */
        getCollisionWithTile: function(tileX, tileY)
        {
            var next = this.currentCollisions.first;
            while (next)
            {
                if (next.obj.type == pc.Collision.TILE_TYPE && next.obj.tileX == tileX && next.obj.tileY == tileY)
                    return next.obj;

                next = next.nextLinked;
            }
            return null;
        },

        setAI: function (ai)
        {
            this.ai = ai;
        },

        /**
         * Call from the layer system to draw the entity. x and y are the screen
         * offset for the layer (in pixels).
         * @param screenOffsetX
         * @param screenOffsetY
         * @return true if the entity was drawn
         */
        // todo: remove ctx and offset, it should all be taken automatically from the layer
        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
            if (!this._super(ctx, screenOffsetX, screenOffsetY, this.dir)) return false;

            if (this.drawStats)
            {
                var screenX = this.pos.x + screenOffsetX + this.drawOffsetX;
                var screenY = this.pos.y + screenOffsetY + this.drawOffsetY;
                ctx.save();
                ctx.fillStyle = '#222222';
                ctx.fillRect(screenX+15, screenY-95, 90, 90);
                ctx.fillStyle = '#ffffff';
                ctx.fillText('vel.x: ' + this.velX, screenX + 20, screenY - 80);
                ctx.fillText('vel.y: ' + this.velY, screenX + 20, screenY - 60);
                ctx.fillText('acc.x: ' + this.accelX, screenX + 20, screenY - 40);
                ctx.fillText('acc.y: ' + this.accelY, screenX + 20, screenY - 20);
                ctx.restore();
            }
            return true;

        },

        /**
         * Update cycle for the entity.
         * @param elapsed
         */

        update: function (elapsed)
        {
            this._super(elapsed);
            if (this.ai != null) this.ai.update(elapsed);

            if (this.thrust != 0)
            {
                // todo: move to accel per second

                // calc acceleration
                this.accelX = this.thrust * Math.cos( pc.Math.degToRad(this.dir) );
                this.accelY = this.thrust * Math.sin( pc.Math.degToRad(this.dir) );

                this.velX += (this.accelX * (elapsed/1000));
                this.velY += (this.accelY * (elapsed/1000));

                // cap velocity
                this.velX = pc.Math.limit(this.velX, -this.maxVelX, this.maxVelX);
                this.velY = pc.Math.limit(this.velY, -this.maxVelY, this.maxVelY);

                // make direction match the velocity path -- needs testing
                if (this.faceVel)
                {
                    var vel = pc.Point.create(this.velX, this.velY);
                    var zero = pc.Point.create(0, 0);
                    this.dir = zero.dirTo(vel);
                }
            }

            if (this.velX != 0 || this.velY != 0)
                this.moveBy(this.velX, this.velY);

        },

        /**
         * Moves the entity by the given x, y (collisions checks will be triggered)
         * @param x
         * @param y
         */
        moveBy: function(x, y)
        {
            this._super(x, y);
            // tell the layer we moved
            if (this._collidable)
                this.layer.scene.collisionCheckEntity(this, x, y);
        },

        /**
         * Called when an entity first collides with something
         * @param collision Collision that is ending
         */
        onCollisionStart: function(collision)
        {
            this.currentCollisions.add(collision);

            if (pc.system.debugCollisions)
                this.borderColor = '#ff3333';

            if (collision.type == pc.Collision.TILE_TYPE)
                this._tileCollisionReact(collision);
        },

        /**
         * Called during a current collision (repeatedly on every update)
         * @param collision
         */
        onCollision: function(collision)
        {
            if (collision.type == pc.Collision.TILE_TYPE)
                this._tileCollisionReact(collision);
        },

        /**
         * Internal helper to react to a tile collision
         * @param collision
         * @private
         */
        _tileCollisionReact: function(collision)
        {
            // kill velocity based on the axis we collided on, then bounce away
            // oh, and don't allow the movement to go ahead
            if (collision.yAxis)
            {
                this.pos.y -= collision.yMove;
                if (this.bounce)
                    this.velY *= -this.bounce;
                else
                    this.velY = 0;
            }
            if (collision.xAxis)
            {
                this.pos.x -= collision.xMove;
                if (this.bounce)
                    this.velX *= -this.bounce;
                else
                    this.velX = 0;
            }

        },

        /**
         * Called when a collision state comes to an end
         * @param collision Collision that is ending
         */
        onCollisionEnd: function(collision)
        {
            this.currentCollisions.remove(collision);
            collision.release();

            if (pc.system.debugCollisions)
                this.borderColor = '#33ff33';
        },

        /**
         * Increases velocity as a factor of current speed
         * @example incVel(2) doubles current speed
         * @param speed
         */
        incVel: function (speed)
        {
            // todo: replace with lookup tables
            this.velX += speed * Math.cos( pc.Math.degToRad(this.dir));
            this.velY += speed * Math.sin( pc.Math.degToRad(this.dir));
        },

        /**
         * Reduces the velocity as a factor of current speed
         * @example decVel(2) cuts speed in half
         * @param speed
         */
        decVel: function (speed)
        {
            this.velX -= speed * Math.cos(pc.Math.degToRad(this.dir));
            this.velY -= speed * Math.sin(pc.Math.degToRad(this.dir));
        },

        /**
         * Sets the velocity of the entity (based on the current direction)
         * @param speed
         */
        setVel: function (speed)
        {
            this.velX = speed * Math.cos(pc.Math.degToRad(this.dir));
            this.velY = speed * Math.sin(pc.Math.degToRad(this.dir));
        },

        /**
         * Sets the maximum velocity for this entity
         * @param x
         * @param y
         */
        setMaxVel: function(x, y)
        {
            this.maxVelX = x;
            this.maxVelY = y;
        },

        /**
         * @return Angle of the velocity this entity is heading in. This is distinct from the facing direction.
         */
        angleOfVel: function()
        {
            return pc.Math.angleFromVector(this.velX, this.velY);
        }

    });






/**
 * ParticleEmitter
 */

pc.Emitter = pc.Entity('pc.Emitter',
    //
    // STATICS
    //
    {
        /**
         * Create a particle emitter. By default particle emitter's are non-collidable
         * @param layer Layer to add the emitter to
         * @param x The x position where particles will be emitted from
         * @param y The y position where particles will be emitted from
         * @param width If larger than 0, particles will be randomly emitted from any point in the
         * rectangle
         * @param height If larger than 0, particles will be randomly emitted form any point in the
         * rectangle
         * @param emitInterval Time between emissions, in milliseconds. Use 0 to have 'burst' number of
         * particles emitted all in one go, after which the emitter will go inactive
         * @param burst Number of particles to emit on each emission
         * @param particleEntityClass String representing the class name of the entity being spawned
         */
        create: function (layer, x, y, dir, width, height, emitInterval, burst, particleEntityClass)
        {
            var newEmitter = this._super(layer, x, y, dir, width, height);

            newEmitter.emitInterval = emitInterval;
            newEmitter.particleEntityClass = particleEntityClass;
            newEmitter.burst = burst;
            newEmitter.setCollidable(false);
            newEmitter.emissions = 0;
            newEmitter.emitting = false;
            newEmitter._emitTime = 0;
            return newEmitter;
        }
    },
    //
    // INSTANCE
    //
    {
        emitInterval: 0, // MS between emissions
        particleEntityClass: null,
        burst: 0,
        emitting: true,
        emissions: 0,

        setEmitting: function(emit)
        {
            this.emitting = emit;
        },

        release: function()
        {
            this._super();
            this.setEmitting(false);
        },

        _emitTime: 0,

        update: function (delta)
        {
            this._emitTime += delta;

            if (this.emitting && this._emitTime > this.emitInterval)
            {
                for (var i = 0; i < this.burst; i++)
                    this.particleEntityClass.create(this.layer, this.pos.x, this.pos.y, this.dir, this.velX, this.velY, false);
                this._emitTime = 0;
                this.emissions++;
            }

            if (this.emitInterval == 0)
                this.emitting = false;
        }

    });


/**
 * @class ParticleEntity
 * A standard particle entity that supports most types of particle creation
 */
pc.ParticleEntity = pc.Entity('pc.ParticleEntity',
    //
    // STATICS
    //
    {
        create: function (layer, x, y, dir, velX, velY)
        {
            return this._super(layer, x, y, dir, velX, velY);
        }
    },
    //
    // INSTANCE
    //
    {

    });


pc.Collision = pc.Pooled('pc.Collision',
    {
        TILE_TYPE: 0,
        ENTITY_TYPE: 1,

        create: function(xMove, yMove)
        {
            var n = this._super();
            n.xMove = xMove;
            n.yMove = yMove;
            n.current = true;
            n.type = -1;
            return n;
        }
    },
    {
        xMove: 0,
        yMove: 0,
        type: -1,

        // marking a collision as current is done by the collisions sweeper (the layer.update). Collisions not marked
        // as current on each update are how onCollisionEnd events are detected -- it was colliding, but after a sweep
        // it's no longer current so the collision is now over
        current: true,

        init: function()
        {
            this._super();
        },

        toString: function()
        {
            return ' xMove: ' + this.xMove + ' yMove: ' + this.yMove + ' current:' + this.current;
        }

    });


pc.EntityCollision = pc.Collision('pc.EntityCollision',
    {
        create: function(entity, xMove, yMove)
        {
            var n = this._super(xMove, yMove);
            n.entity = entity;
            n.type = pc.Collision.ENTITY_TYPE;
            return n;
        }
    },
    {
        entity: null,

        toString: function()
        {
            return this._super() + ' With: ' + this.entity.uniqueId;
        }

    });

/**
 * Represents a collision with a single tile
 * @type {pc.TileCollision}
 */
pc.TileCollision = pc.Collision('pc.TileCollision',
    {
        create: function(tileX, tileY, xAxis, yAxis, xMove, yMove)
        {
            var n = this._super();
            n.tileX = tileX;
            n.tileY = tileY;
            n.xAxis = xAxis;
            n.yAxis = yAxis;
            n.xMove = xMove;
            n.yMove = yMove;
            n.type = pc.Collision.TILE_TYPE;
            return n;
        }
    },
    {
        xAxis: false,
        yAxis: false,
        xMove: 0,
        yMove: 0,
        tileX: 0,
        tileY: 0,

        toString: function()
        {
            return this._super() + ' xAxis: ' + this.xAxis + ' yAxis: ' + this.yAxis +
                   ' xMove: ' + this.xMove + ' yMove: ' + this.yMove + ' tileX: ' + this.tileX + ' tileY: ' + this.tileY;
        }

    });/**
 * SpriteSheet -- an animated, directional image.
 */

pc.SpriteSheet = pc.Base.extend('pc.SpriteSheet', {},
{
    image: null,    // the source image for all sprite frames
    frameWidth: 0,
    frameHeight: 0,
    framesWide: 1,
    framesHigh: 1,
    scaleX: 1,
    scaleY: 1,
    alpha: 0,

    // animations
    totalFrames: 0,
    animations: null,

    // precalcs (arrays of frame positions)
    frameXPos: null,
    frameYPos: null,

    init: function(image, frameWidth, frameHeight, framesWide, framesHigh)
    {
        this._super();

        this.image = image;
        if (arguments[1])
        {
            this.frameWidth = frameWidth;
            if (this.frameWidth > image.width)
                this.warn(image.src + ' - frameWidth:' + frameWidth + ' > image width:' + image.width);
        }
        if (arguments[2])
        {
            this.frameHeight = frameHeight;
            if (this.frameHeight > image.height)
                this.warn(image.src + ' - frameHeight:' + frameHeight + ' > image height:' + image.height);
        }

        arguments[3] ? this.framesWide = framesWide : this.framesWide = this.image.width/frameWidth;
        arguments[4] ? this.framesHigh = framesHigh : this.framesHigh = this.image.height/frameHeight;

        this.totalFrames = this.framesWide * this.framesHigh;
        this.scaleX = 1;
        this.scaleY = 1;
        this.animations = new pc.Hashtable();

        // precalcs
        this.frameXPos = [];
        for (var fx=0; fx < this.framesWide; fx++)
            this.frameXPos.push(fx * this.frameWidth);
        this.frameYPos = [];
        for (var fy=0; fy < this.framesHigh; fy++)
            this.frameYPos.push(fy * this.frameHeight);
    },

    /**
     * Adds an animation that has multiple directions
     * @param name A descriptive name for the animation
     * @param frameX The starting frame X position (in frames, not pixels)
     * @param frameY The starting frame Y position (in frames, not pixels)
     * @param frames An array of frame numbers, note these are OFFSET by frameX and frameY. Use null
     * to automatically sequence through all frames across the image
     * @param directions the number of directions this animation has (assumes a row is used for each direction)
     * @param time Seconds to loop through entire sequence
     * @param loops Number of times to cycle through this animation, use 0 to loop infinitely
     */
    addAnimationWithDirections: function(name, frameX, frameY, frames, directions, time, loops, dirAcross)
    {
        var aframes = frames;
        if (aframes == null)
        {
            aframes = [];
            for (var i=0; i < this.framesWide; i++)
                aframes.push( i );
        }

        this.animations.put(name, { frameX:frameX, frameY:frameY, dirAcross: pc.Tools.checkParam(dirAcross, false),
            frames:aframes, directions: directions, frameRate: (time/aframes.length), degreesPerDir: (360/directions),
            loops: loops });
    },

    addAnimation: function(name, frameX, frameY, frames, time, loops)
    {
        this.addAnimationWithDirections(name, frameX, frameY, frames, 1, time, loops);
    },

    /**
     * Change this sprites animation. Animation frames always start from 0 again.
     * @param name Key name of the animation to switch to.
     */
    setAnimation: function(state, name, speedOffset)
    {
        state.currentAnim = this.animations.get(name);
        if (state.currentAnim == null)
            this.warn('attempt to set unknown animation [' + name + ']');
        state.currentFrame = 0;
        state.animSpeedOffset = speedOffset;
    },

    hasAnimation: function(name)
    {
        return (this.animations.get(name) != null);
    },

    /**
     * Sets the scale to draw the image at
     * @param scaleX {number} Value to multiply the image width by (e.g. width * scaleX)
     * @param scaleY {number} Value to multiply the image height by (e.g. height * scaley)
     */
    setScale: function(scaleX, scaleY)
    {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    },

    /**
     * Draw this sprite
     * @param x On-screen x position
     * @param y On-screen y position
     * @param dir The facing direction (in degrees)
     */
    dirTmp: 0,

    draw: function(ctx, state, x, y, dir)
    {
        if (!this.image.loaded || state == null || !state.active) return;

        this._fixScale();
        if (this.alpha > 0)
            ctx.gobalAlpha = this.alpha;

        if (state.currentAnim == null)
        {
            this.image.draw(ctx, 0, 0, Math.round(x), Math.round(y), this.frameWidth, this.frameHeight);

        } else
        {
            this.dirTmp = Math.round( dir / state.currentAnim.degreesPerDir);
            if (this.dirTmp > state.currentAnim.directions-1) this.dirTmp = 0; // accommodate the edge case causing by rounding back

            var fx = 0;
            var fy = 0;

            if (!state.currentAnim.dirAcross)
            {
                fx = this.dirTmp + state.currentAnim.frameX;
                fy = state.currentAnim.frames[state.currentFrame] + state.currentAnim.frameY;
            } else
            {
                fx = state.currentAnim.frames[state.currentFrame] + state.currentAnim.frameX + this.dirTmp;
                fy = state.currentAnim.frameY;
            }

            if (state.currentAnim.directions == 1)
            {
                fy = state.currentAnim.frameY;
                fx = state.currentAnim.frames[state.currentFrame] + state.currentAnim.frameX;
            }

            this.image.draw(ctx,
                this.frameXPos[fx], this.frameYPos[fy], pc.Math.round(x), pc.Math.round(y), this.frameWidth, this.frameHeight);
        }

        // restore scaling (as images can be used amongst spritesheets, we need to be nice)
        this.image.setScale(1, 1);

        // set the alpha back to normal
        if (this.alpha > 0)
            ctx.gobalAlpha = 1;

    },

    drawFrame: function(ctx, frameX, frameY, x, y)
    {
        // todo: refactor this method?
        if (this.alpha > 0)
            ctx.gobalAlpha = this.alpha;

        if (!this.image.loaded) return;
        this._fixScale();

        this.image.draw(ctx,
            this.frameXPos[frameX], this.frameYPos[frameY], pc.Math.round(x), pc.Math.round(y), this.frameWidth, this.frameHeight);

        if (this.alpha > 0)
            ctx.gobalAlpha = 1;
    },

    /**
     * Draw all the frames of a sprite sheet according to the image and parameters you set it
     * up with. Primarily this is intended for debugging or sprite testing.
     * @param ctx Context to draw on
     * @param x Starting x position to draw on the given context
     * @param y Starting y position to draw on the given context
     */
    drawAllFrames: function(ctx, x, y)
    {
        for (var fy=0; fy < this.framesHigh; fy++)
            for (var fx=0; fx < this.framesWide; fx++)
                this.drawFrame(ctx, fx, fy, x+(fx*this.frameWidth), y+(fy*this.frameHeight));
    },

    _fixScale: function()
    {
        if (this.scaleX != 1 || this.scaleY != 1)
            this.image.setScale(this.scaleX, this.scaleY);
    },

    update: function(state, delta)
    {
        if (state.currentAnim == null || !state.active) return;

        // see if enough time has past to increment the frame count
        if (state.currentAnim.frames.length <= 1) return;

//        if (state.currentAnim.dirAcross)
//            delta = delta;  BROKEN!

        if (state.acDelta > (state.currentAnim.frameRate + state.animSpeedOffset))
        {
            state.currentFrame++;
            if (state.currentFrame >= state.currentAnim.frames.length-1)
            {
                state.loopCount++;
                // checked if we have looped the animation enough times
                if (state.currentAnim.loops) // 0 means loop forever
                    if (state.loopCount >= state.currentAnim.loops)
                        state.active = false;

                state.currentFrame = 0; // take it from the top
            }
            state.acDelta -= state.currentAnim.frameRate;
        } else
        {
            state.acDelta += delta;
        }
    },

    reset: function()
    {
        this.image = null;
        this.animations = null;
    }



});
/**
 * PlayCraft Engine
 * Sprite: a sprite is an instance of a graphical/animating object.
 * @class
 */

/**
 * Sprite
 * This class represents and instance of a sprite -- a multiframe image
 * which may also have animation.
 * @class
 */
pc.Sprite = pc.Base.extend('pc.Sprite', {}, {

    currentFrame: 0,
    currentAnim: null,
    spriteSheet: null,
    acDelta: 0, // accumulated delta time
    entity: null,
    animSpeedOffset: 0,
    currentAnimName: null,
    alpha: 0,
    active: true,
    loopCount: 0,

    init: function(spriteSheet, entity)
    {
        this._super();
        this.spriteSheet = spriteSheet;
        this.entity = entity;
        this.reset();
    },

    reset: function()
    {
        this.currentFrame = 0;
        this.loopCount = 0;
        this.active = true;
        if (this.spriteSheet.animations.size() > 0)
        {
            this.currentAnim = this.spriteSheet.animations.get(this.spriteSheet.animations.keys()[0]);
//            this.currentFrame = this.currentAnim.frameX;
            this.currentFrame = 0;

        } else
            this.currentAnim = null;
    },

    draw: function(ctx, x, y, dir)
    {
        if (this.alpha > 0)
            this.spriteSheet.alpha = this.alpha;
        this.spriteSheet.draw(ctx, this, x, y, dir);
    },

    update: function(delta)
    {
        if (this.currentAnim == null || !this.active) return;

        // call the spritesheet class to actually to a sprite update, keep in mind though that the spritesheet
        // doesn't retain any present state, it just sets the state object, which in this case is passed in as the
        // this param -- this is so spritesheets (and the underlying image) may be used by more than one sprite
        // at the same time
        this.spriteSheet.update(this, delta);
    },

    /**
     * Change this sprites animation. Animation frames always start from 0 again.
     * @param name Key name of the animation to switch to.
     * @param speedOffset allows you to modify the animation speed for this instance of a sprite
     *                    good for randomizing animations on sprite so they all don't look the same
     */
    setAnimation: function(name, speedOffset)
    {
        this.currentAnim = this.spriteSheet.animations.get(name);
        this.currentFrame = 0;
        this.loopCount = 0;
        this.active = true;
        this.animSpeedOffset = speedOffset;
        this.currentAnimName = name;
    },

    getAnimation: function()
    {
        return this.currentAnimName;
    }


});

/**
 * PlayCraft Engine
 * Tools: A placeholder for useful tools
 * @class
 */


pc.Math = pc.Base('pc.Math',
    {
        RADIAN_TO_DEGREE:(180 / Math.PI),
        DEGREE_TO_RADIAN:(Math.PI / 180),
        PI:Math.PI,

        round:Math.round, // quick lokoups for speed
        random:Math.random,
        floor:Math.floor,

        /**
         * find the square root of a number
         * @param number
         */
        sqr:function (number)
        {
            return number * number;
        },

        /**
         * pick a random integer within the specified range.
         * @example
         * rand(10, 20) // returns a value between 10 and 20
         * @param min the start of the range
         * @param max
         */
        rand:function (min, max)
        {
            return pc.Math.round((pc.Math.random() * (max - min)) + min);
        },

        randFloat:function (min, max)
        {
            return (pc.Math.random() * (max - min)) + min;
        },

        rotate:function (dir, by)
        {
            var newDir = dir + by;
            if (newDir > 359)
                newDir -= 359;
            if (newDir < 0)
                newDir = 359 + newDir;
            return newDir;
        },

        /**
         * Calcuates the angle difference based on two angles and a direction (clockwise or counterclockwise)
         * @param angleA Starting angle in degrees
         * @param angleB Ending angle in degrees
         * @param clockwise True if the difference should be calculated in a clockwise direction
         * @return Angle difference in degrees
         */
        angleDiff: function(angleA, angleB, clockwise)
        {
            if (!clockwise)
            {
                var diff = angleA - angleB;
                if (diff < 0) diff += 360;
                return diff;
            } else
            {
                if (angleB < angleA) // wrapping around 0/360
                    angleB += 360;
                return angleB - angleA;
            }
        },

        /**
         * Is the first angle closest by going clockwise (to the right as such) of the second angle
         * @param angleA Angle to target
         * @param angleB Angle clockwise is relative to
         * @return {Boolean} True if angle A is clockwise to angle B
         */
        isClockwise:function (angleA, angleB)
        {
            if (angleA > angleB)
                return (Math.abs(angleA - angleB)) < (angleB + (360 - angleA));
            else
                return (angleA + (360 - angleB)) < (Math.abs(angleB - angleA));
        },

        radToDeg:function (radians)
        {
            return (radians * pc.Math.RADIAN_TO_DEGREE);
        },

        degToRad:function (degrees)
        {
            return degrees * pc.Math.DEGREE_TO_RADIAN;
        },

        /**
         * Gives you the angle of a given vector x, y
         * @param x x component of the 2d vector
         * @param y y component of the 2d vector
         */
        angleFromVector:function (x, y)
        {
            // angle to vector
            var a = pc.Math.radToDeg(Math.atan2(y, x));
            if (a < 0) a += 360;
            return a;
        },

        vectorFromAngle: function(angle)
        {
            var vx = Math.cos(pc.Math.degToRad(angle));
            var vy = Math.sin(pc.Math.degToRad(angle));
            return pc.Math.create(vx, vy);
        },

        /*
         * A fast check if a point is within a rectangle
         */
        isPointInRect:function (x, y, rx, ry, rw, rh)
        {
            return x >= rx && x <= (rx + rw) &&
                y >= ry && y <= (ry + rh);

        },

        /**
         * Checks if one rectangle is completely contained in another
         */
        isRectInRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        isRectColliding:function (x, y, w, h, rx, ry, rw, rh)
        {
            return !(y + h < ry || y > ry + rh ||
                x + w < rx || x > rx + rw);
        },

        /**
         * Forces a given value to be within a range (lowest to highest)
         * @param v The value to check
         * @param lowest Lowest value it can be
         * @param highest Highest value it can be
         * @return Original value or the edge of the fence if needed
         */
        limit:function (v, lowest, highest)
        {
            if (v < lowest) return lowest;
            if (v > highest) return highest;
            return v;
        },

        lightenDarkenColor:function (col, amt)
        {
            var usePound = false;

            if (col[0] == "#")
            {
                col = col.slice(1);
                usePound = true;
            }

            var num = parseInt(col, 16);

            var r = (num >> 16) + amt;

            if (r > 255) r = 255;
            else if (r < 0) r = 0;

            var b = ((num >> 8) & 0x00FF) + amt;

            if (b > 255) b = 255;
            else if (b < 0) b = 0;

            var g = (num & 0x0000FF) + amt;

            if (g > 255) g = 255;
            else if (g < 0) g = 0;

            return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
        }



    },
    {
        // No instance, since this is an all static class
    });


pc.Rect = pc.Pooled('pc.Rect',
    //
    // STATIC
    //
    {
        create:function (x, y, w, h)
        {
            var newDim = this._super();
            newDim.x = x;
            newDim.y = y;
            newDim.w = w;
            newDim.h = h;
            return newDim;
        }
    },
    //
    // INSTANCE
    //
    {
        x:0, y:0, w:0, h:0,

        /**
         * Checks if one rectangle is completely contained in another
         */
        containsRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        containsPoint:function (p)
        {
            return p.x >= this.x && p.x <= (this.x + this.w) &&
                p.y >= this.y && p.y <= (p.y + this.h);

        },

        overlaps:function (rx, ry, rw, rh)
        {
            return !(this.y + this.h < ry || this.y > ry + rh ||
                this.x + this.w < rx || this.x > rx + rw);
        },

        toString:function ()
        {
            return this.x + ' x ' + this.y + ' by ' + this.w + ' x ' + this.h;
        }



    });


pc.Point = pc.Pooled('pc.Point',
    //
    // STATIC
    //
    {
        create:function (x, y)
        {
            var n = this._super();
            n.x = x;
            n.y = y;
            return n;
        }
    },
    //
    // INSTANCE
    //
    {
        x:0, y:0,

        /**
         * Makes this point match another
         * @param p The other point to match
         */
        match:function (p)
        {
            this.x = p.x;
            this.y = p.y;
        },

        subtract:function (x, y)
        {
            this.x -= x;
            this.y -= y;
        },

        /**
         * @param p Another point
         * @return {Number} Facing direction (in degrees) from this point to another
         */
        dirTo:function (p)
        {
            var a = Math.abs(p.x - this.x);
            var b = Math.abs(p.y - this.y);
            if (a == 0) a = 1;
            if (b == 0) b = 1;

            var bovera = b / a;
            var angleInRadians = Math.atan(bovera);
            var angle = pc.Math.radToDeg(angleInRadians);

            if (p.x < this.x)
            {
                // left side
                if (p.y < this.y)
                    return angle + 180;
                return (90 - angle) + 90;
            } else
            {
                // right side
                if (p.y < this.y)
                    return (90 - angle) + 270;
                return angle;
            }

        },

        /**
         * Modifies the point by moving along at a projected angle (dir) by the distance
         * @param dir Direction to move, in degrees
         * @param distance Distance to move
         */
        moveInDir:function (dir, distance)
        {
            this.x += distance * Math.cos(pc.Math.degToRad(dir));
            this.y += distance * Math.sin(pc.Math.degToRad(dir));
        },

        /**
         * Changes the from position by an amount of pixels in the direction of the to position
         * ultimately reaching that point
         * @param to {pc.Point} Ending position
         * @param distance {Number} Amount to move
         */
        moveTowards:function (to, distance)
        {
            this.moveInDir(this.dirTo(to), distance);
        },

        /**
         * @param p Another point
         * @return Distance between this point and another
         */
        distance:function (p)
        {
            return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
        },

        toString:function ()
        {
            return this.x + ' x ' + this.y;
        }


    });


/**
 * Convenience version of a point for dimensions
 */
pc.Dim = pc.Point;

/**
 * Convenience version of a point for vectors
 */
pc.Vector = pc.Point;


/**
 * PlayCraft Engine
 * Image: a basic image class
 * @class
 */

pc.Image = pc.Base.extend('pc.Image', {},
    {
        width:0,
        height:0,
        image:null,
        src:null,
        name: null,
        loaded:false,
        onLoadCallback:null,
        onErrorCallback:null,
        scale:1,

        /**
         * Loads an image from a remote (URI) resource. This will automatically
         * add this image into the resource manager if the game is still in an init
         * phase.
         * @param src URI for the image
         * @param onLoadCallback Function to be called once the image has been loaded
         * @param onErrorCallback Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();

            this.name = name;
            this.src = pc.system.loader.makeUrl(src);
            this.image = new Image();

            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            // setup our own handlers
            this.image.onload = this.onLoad.bind(this);
            this.image.onerror = this.onError.bind(this);
            this.scale = 1;

            if (pc.system.loader.started) // load now if the loader has already been started
                this.load();
        },

        setScale:function (scale)
        {
            this.scale = scale;
        },

        /**
         * Load an image. If the game hasn't started then the image resource
         * will be added to the resource manager's queue.
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) this.onLoadCallback(this);

            this.image.onload = this.onLoad.bind(this);
            this.image.onerror = this.onError.bind(this);
            this.image.src = this.src;
        },

        /**
         * Force this image to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        draw:function (ctx, sx, sy, x, y, width, height)
        {
            if (arguments.length == 3)
                ctx.drawImage(this.image, sx * pc.system.scale, sy * pc.system.scale);
            else
                ctx.drawImage(this.image, sx * pc.system.scale, sy * pc.system.scale,
                    width * pc.system.scale, height * pc.system.scale,
                    x * pc.system.scale, y * pc.system.scale, width * pc.system.scale,
                    height * pc.system.scale);
        },

        onLoad:function ()
        {
            this.loaded = true;

            this.width = this.image.width;
            this.height = this.image.height;
            if (pc.system.scale != 1 || this.scale != 1)
                this.resize(pc.system.scale * this.scale);

            if (this.onLoadCallback)
                this.onLoadCallback(this);
        },

        onError:function ()
        {
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        resize:function (scale)
        {
            var sw = this.width * scale;
            var sh = this.height * scale;

            // todo: fix this code
            var startingImage = document.createElement('canvas');
            startingImage.width = this.width;
            startingImage.height = this.height;

            var startingCtx = startingImage.getContext('2d');
            startingCtx.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var startingPixels = startingCtx.getImageData(0, 0, this.width, this.height);

            var result = document.createElement('canvas');
            result.width = sw;
            result.height = sh;

            var ctx = result.getContext('2d');
            var resultPixels = ctx.getImageData(0, 0, sw, sh);

            for (var y = 0; y < sh; y++)
            {
                for (var x = 0; x < sw; x++)
                {
                    var i = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
                    var is = (y * sw + x) * 4;
                    for (var j = 0; j < 4; j++)
                        resultPixels.data[is + j] = startingPixels.data[i + j];
                }
            }

            ctx.putImageData(resultPixels, 0, 0);
            this.image = result;
        }


    });

// todo: this should be derived from image (or at least a common base -- merge things like scaling factor api)
pc.CanvasImage = pc.Base.extend('pc.CanvasImage', {},
    {

        width:0,
        height:0,
        canvas:null,
        loaded:true,
        scale:1,

        init:function (canvas)
        {
            this.canvas = canvas;
        },

        draw:function (ctx, sx, sy, x, y, width, height)
        {
            if ( width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx * pc.system.scale, sy * pc.system.scale);
            else
                ctx.drawImage(this.canvas, sx * pc.system.scale, sy * pc.system.scale,
                    width * pc.system.scale, height * pc.system.scale,
                    x * pc.system.scale, y * pc.system.scale, width * pc.system.scale, height * pc.system.scale);
        },

        setScale:function (scale)
        {
            this.scale = scale;
        }

    });
/**
 * PlayCraft Engine
 * Sound: a basic sound resource
 * @class
 */

pc.Sound = pc.Base.extend('pc.Sound', {},
    {
        sounds: [],
        src:null,
        name: null,
        numLoaded: 0,
        loaded:false,
        errored:false,
        channels:1,
        onLoadCallback:null,
        onErrorCallback:null,

        /**
         * Loads an sound from a remote (URI) resource. This will automatically
         * add this sound into the resource manager if the game is still in an init
         * phase.
         * @param name Resource name (tag) you want to use
         * @param src URI for the sound
         * @param channels Number of channels this sound can play at once
         * @param onLoadCallback Function to be called once the sound has been loaded (including all channels)
         * @param onErrorCallback Function to be called if the sound fails to load (on first error)
         */
        init:function (name, src, formats, channels, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.name = name;
            this.channels = channels;

            // append an extension to the src attribute that matches the format with what the device can play
            var canplay = false;
            for (var i=0; i < formats.length; i++)
            {
                if (pc.system.device.canPlay(formats[i]))
                {
                    this.src = pc.system.loader.makeUrl(src + '.' + formats[i]);
                    canplay = true;
                    break; // we set the src based on the first type we find (in the order they are provided)
                }
            }

            if (canplay)
            {
                if (pc.system.loader.started) // load now if the loader has already been started
                    this.load(onLoadCallback, onErrorCallback);
            } else
                this.errored = true;
        },

        /**
         * Pauses the sound
         */
        pause: function()
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].pause();
        },

        /**
         * Stop playing a sound (including all channels) -- actually just a synonym for pause
         */
        stop: function()
        {
            if (!this.canPlay()) return;
            this.pause();
        },

        /**
         * Volume to play the sound at
         * @param volume Volume as a range from 0 to 1 (0.5 is half volume)
         */
        setVolume: function(volume)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].volume = volume;
        },

        /**
         * Start playing the sound at the specified time (instead of 0)
         * @param time time (in milliseconds to start at)
         */
        setPlayPosition: function(time)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].currentTime = time;
        },

        /**
         * Load a sound. If the game hasn't started then the sound resource
         * will be added to the resource manager's queue.
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            // user customized callbacks
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback)
            {
                this.onLoadCallback(this);
                return;
            }
            // load up multiple copies of the sound, one for each channel
            for (var i=0; i < this.channels; i++)
            {
                var n = new Audio();
                n.preload = 'auto';

                // setup event handlers for this class -- we'll call the callbacks from there
                n.addEventListener("canplaythrough", this.onLoad.bind(this), false);
//                n.addEventListener("onload", this.onLoad.bind(this), false);
                n.addEventListener("error", this.onError.bind(this), false);
                n.onerror = this.onError.bind(this);
//                n.onLoad = this.onLoad.bind(this);
                n.src = this.src;
                this.sounds.push(n);

                if (pc.system.isAppMobi)
                    // force an onload for appmodi -- since it wont create one and the load is almost instant
                    this.onLoad(null);
            }

        },

        /**
         * Force this sound to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.errored = false;
            this.load();
        },

        onLoad:function (ev)
        {
            this.numLoaded++;

            // remove the event listener so we don't get this happening multiple times
            if (!pc.system.isAppMobi)
                ev.target.removeEventListener("canplaythrough", this.onLoad.bind(this), false);

            if (this.numLoaded == this.channels)
            {
                this.loaded = true;
                this.errored = false;
                if (this.onLoadCallback)
                    this.onLoadCallback(this);
            }
        },

        onError:function ()
        {
            this.errored = true;
            this.loaded = false;
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Plays a sound
         * @param loop True if you want the sound to just keep looking.
         */
        play:function(loop)
        {
            if (!this.canPlay()) return;

            // find a free channel and play the sound (if there is one free)
            for (var i=0, len=this.sounds.length; i < len; i++)
            {
                if (this.sounds[i].paused || this.sounds[i].ended)
                {
                    if (loop)
                        this.sounds[i].loop = true;
                    this.sounds[i].play();
                    return;
                }
            }

            // no sounds were free, so we just do nothing
            this.warn(this.name + ' - all channels are in use');
        },

        /**
         * @return true if the sound can be played
         */
        canPlay: function()
        {
            return (this.loaded && pc.system.soundEnabled && !this.errored);
        }


    });

/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 * Scene - a scene is comprised of one or more layers
 * In a game, a typical division of scenes is: intro animation, main menu, game.
 * Each of these scenes has layers, e.g. the game scene might have background, main game, minimap and inventory layers
 * You can bind input to either a scene or a layer.
 */


pc.Scene = pc.Base.extend('pc.Scene', {}, {

    name: null,
    layersByName: null,
    layers: null,
    activeLayers: null,
    collidableLayer: null,
    paused: false,
    active: true,
    viewPortX: 0,   // pixel placement on the screen
    viewPortY: 0,
    viewPortWidth: 200,
    viewPortHeight: 200,
    offsetX: 0,     // a flexible origin you can apply to all layers (nice for camera shaking etc)
    offsetY: 0,

    init: function (name)
    {
        this._super();
        this.name = name;
        this.layersByName = new pc.Hashtable();
        this.layers = new pc.LinkedList();
        this.activeLayers = new pc.LinkedList();
        this.collidableLayers = new pc.LinkedList();

        // set the view port to be the default size of the system canvas
        this.setViewPort(0, 0, pc.system.canvasWidth, pc.system.canvasHeight);

        // if the system has already started, then automatically call the onReady
        if (pc.system.started)
            this.onReady();
    },

    onReady: function ()
    {
        // signal all the layers that we're ready
        var next = this.layers.first;
        while (next)
        {
            next.obj.onReady();
            next = next.nextLinked;
        }
    },

    /**
     * Called when this scene is being activated
     */
    onActivated: function()
    { },

    /**
     * Called when this scene has been deactviated
     */
    onDeactivated: function()
    { },

    /**
     * Event notifier when the underlying game canvas is being resized
     * @param width New width of the game canvas
     * @param height New height of the game canvas
     */
    onResize: function(width, height)
    {
        var next = this.layers.first;
        while (next)
        {
            next.obj.onResize(width, height);
            next = next.nextLinked;
        }
    },

    /**
     * Sets the view port to the given top left postion (x, y) and dimensions (width and height)
     * The view port represents the on-screen pixels dimensions of the game relative to the
     * associated canvas. Use the view port dimensions to render different scenes at different
     * positions on screen. e.g. a game layer would typically be 0, 0, canvas.width, canvas.height
     * whereas a mini map may just be in the top left corner of the screen (0, 0, 100, 100).
     * @param x X position to render the scene within the canvas (in screen pixels)
     * @param y Y position to render the scene within the canvas (in screen pixels)
     * @param width The maximum width to render (in screen pixels)
     * @param height The maximum height to render (in screen pixels)
     */
    setViewPort: function (x, y, width, height)
    {
        this.viewPortX = x;
        this.viewPortY = y;
        this.viewPortWidth = width;
        this.viewPortHeight = height;
    },

    getScreenRect: function()
    {
        return pc.Rect.create(this.viewPortX,
                              this.viewPortY, this.viewPortWidth, this.viewPortHeight);
    },

    /**
     * Fired when a bound event/action is triggered in the input system. Use bindAction
     * to set one up. Override this in your subclass to do something about it.
     * @param actionName The name of the action that happened
     * @param event Raw event object
     * @param pos Position, such as a touch input or mouse position
     */
    onAction: function (actionName, event, pos)
    {
    },

    isActive: function ()
    {
        return this.active;
    },

    get: function (name)
    {
        return this.layersByName.get(name);
    },

    addLayer: function (layer)
    {
        this.layersByName.put(layer.name, layer);
        this.layers.add(layer);
        this.activeLayers.add(layer);
        if (layer.collidable)
            this.collidableLayers.add(layer);
        layer.active = true;
        layer.scene = this;
        layer.onAddedToScene();
    },

    removeLayer: function (layer)
    {
        this.layersByName.remove(layer.name);
        this.layers.remove(layer);
        this.activeLayers.remove(layer);
        if (layer.collidable)
            this.collidableLayers.remove(layer);
        layer.active = false;
        layer.scene = null;
        layer.onRemovedFromScene();
    },

    setLayerActive: function (layer)
    {
        this.activeLayers.add(layer);
        layer.active = true;

    },

    setLayerInactive: function (layer)
    {
        this.activeLayers.remove(layer);
        layer.active = false;
    },

    getFirstActiveLayer: function()
    {
        return this.activeLayers.first;
    },

    getFirstLayer: function()
    {
        return this.layers.first;
    },

    /**
     * Fired when a bound event/action is triggered in the input system. Use bindAction
     * to set one up. Override this in your object to do something about it.
     * @param actionName The name of the action that happened
     */
    action: function (actionName)
    {
    },

    //
    // LIFECYCLE
    //

    draw: function (ctx)
    {
        // draw all the layers
        var next = this.activeLayers.first;
        while (next)
        {
            if (!next.obj.paused)
                next.obj.draw(ctx, this.viewPortX - this.offsetX, this.viewPortY - this.offsetY, this.viewPortWidth, this.viewPortHeight);
            next = next.nextLinked;
        }
    },

    update: function (delta)
    {
        // draw all the layers
        // todo: avoid this double looping over all the entities (once to draw, once to update) -- how??
        var next = this.activeLayers.first;
        while (next)
        {
            if (!next.obj.paused)
                next.obj.update(delta);
            next = next.nextLinked;
        }
    },

    /**
     * Notification that an entity in a layer is shifting it's position, so we do collision detection
     * across all the layer. If a collision occurs, the parties are notified with an onCollision call.
     * @param e {pc.Entity} Entity that is about to move
     * @param xMove {Number} X movement (prior to movement occurring)
     * @param yMove {Number} Y movement (prior to movement occurring)
     */
    collisionCheckEntity: function (e, xMove, yMove)
    {
        if (!e._collidable) return;

        // check to see if we collided with anything (across all layers)
        var layer = this.collidableLayers.first;
        while (layer)
        {
            if (layer.obj.collidable && layer.obj.active)
                layer.obj.checkCollision(e, xMove, yMove);
            layer = layer.nextLinked;
        }
    },

    /**
     * Pauses all active layers
     */
    pause: function ()
    {
        this.paused = true;
        var next = this.activeLayers.first;
        while (next)
        {
            next.obj.pause();
            next = next.nextLinked;
        }
    },

    /**
     * Resumes all active layers
     */
    resume: function ()
    {
        this.paused = false;
        var next = this.activeLayers.first;
        while (next)
        {
            next.obj.resume();
            next = next.nextLinked;
        }
    },

    reset: function ()
    {
        var next = this.layers.first;
        while (next)
        {
            next.obj.reset();
            next = next.nextLinked;
        }

        this.layers.clear();
        this.activeLayers.clear();
    },

    /**
     * Ask all the layers etc for any entities under the x, y position
     * @param x the screen x position
     * @param y the screen y position
     */
    // todo: fix this with a linked list result
    entitiesUnderXY: function (x, y)
    {
        var found = [];
        var next = this.layers.first;
        while (next)
        {
            found.push(next.obj.entitiesUnderXY(x, y));
            next = next.nextLinked;
        }

    },


    /**
     * Loads all of the layers from a Tiled (TMX) map file. Tile layers will become instances of
     * TileLayer, objectgroups will become EntityLayers. Tile sets must have a name that matches an
     * available spritesheet image resource. Note that only a single tilesheet is currently supported.
     * @param levelData
     */
    loadFromTMX: function(levelData)
    {
        var xmlDoc = pc.system.parseXML(levelData.data);
        var mapXML = xmlDoc.getElementsByTagName('map')[0];

        var tileWidth = parseInt(mapXML.getAttribute('tilewidth'));
        var tileHeight = parseInt(mapXML.getAttribute('tileheight'));

        // load up the tilesets (note: only 1 is supported right now)
        // todo: add support for multiple tile sets
        var tileSet = xmlDoc.getElementsByTagName('tileset')[0];
        var tsName = tileSet.getAttribute('name');
        var tsImageWidth = tileSet.getAttribute('width');
        var tsImageHeight = tileSet.getAttribute('height');
        var tsImageResource = pc.system.loader.get(tsName).resource;
        var tsSpriteSheet = new pc.SpriteSheet(tsImageResource, tileWidth, tileHeight, tsImageWidth / tileWidth,
            tsImageHeight / tileHeight);


        // load tiled layers
        var layers = xmlDoc.getElementsByTagName('layer');
        for (var m=0; m < layers.length; m++)
        {
            // partial construction
            var newLayer = new pc.TiledLayer(null, true, tsSpriteSheet, 0, 0, tileWidth, tileHeight);
            // fill in the rest using the data from the TMX file
            newLayer.loadFromTMX(layers[m]);
            this.addLayer(newLayer);
        }

        // load entity layers
        var objectGroups = xmlDoc.getElementsByTagName('objectgroup');
        for (var i=0; i < objectGroups.length; i++)
        {
            // partial construction
            var n = new pc.EntityLayer(null, true);

            // fill in the rest using the data from the TMX file
            n.loadFromTMX(objectGroups[i]);
            this.addLayer(n);
        }

    }




});
/**
 * Playcraft Engine -- the game template. Derive and add what you need
 */


pc.Game = pc.Base.extend('pc.Game', {},
{
    map: null,
    scenes: null,
    activeScenes: null,
    paused: false,

    init: function(canvasId, fps)
    {
        this._super();

        // since the game is the primary interface to the developer, we setup the playcraft
        // system here.
        pc.system.create(canvasId, this, fps);
        this.scenes = new pc.LinkedList();
        this.activeScenes = new pc.LinkedList();

    },

    onReady: function()
    {
        // signal all the scenes
        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.onReady();
            nextScene = nextScene.nextLinked;
        }
    },

    update: function(elapsed)
    {
        if (this.paused) return;
        var nextScene = this.getFirstActiveScene();
        while (nextScene)
        {
            nextScene.obj.update(elapsed);
            nextScene = nextScene.nextLinked;
        }

        return true; // return false to quit the update loop
    },

    draw: function(ctx)
    {
        if (this.paused) return; // if the entire game is paused we don't draw
        var nextScene = this.getFirstActiveScene();
        while (nextScene)
        {
            nextScene.obj.draw(ctx);
            nextScene = nextScene.nextLinked;
        }
    },

    //
    // SCENES
    //
    addScene: function(scene)
    {
        this.scenes.add(scene);
        this.activeScenes.add(scene);
        this.onSceneAdded(scene);
    },

    onSceneAdded: function(scene)
    {},

    removeScene: function(scene)
    {
        this.scenes.remove(scene);
        this.activeScenes.remove(scene);
        this.onSceneRemoved(scene);
    },

    onSceneRemoved: function(scene)
    {},

    activateScene: function(scene)
    {
        if (scene.active) return;

        this.activeScenes.add(scene);
        scene.active = true;
        this.onSceneActivated(scene);
        scene.onActivated();
    },

    onSceneActivated: function(scene)
    {},

    deactivateScene: function(scene)
    {
        if (!scene.active) return;

        this.activeScenes.remove(scene);
        scene.active = false;
        this.onSceneDeactivated(scene);
        scene.onDeactivated();
    },

    onSceneDeactivated: function(scene)
    {},

    getFirstActiveScene: function()
    {
        return this.activeScenes.first;
    },

    getFirstScene: function()
    {
        return this.scenes.first;
    },

    //
    // lifecycle
    //

    /**
     * Pauses all scenes, which means no drawing or updates will occur. If you wish to pause game play and leave a menu
     * still running, then just pause the scene associated with game play, and not the menu scenes.
     */
    pause: function()
    {
        this.paused = true;

        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.pause();
            nextScene = nextScene.nextLinked;
        }
    },

    isActive: function()
    {
        return true;//!this.paused;
    },

    /**
     * Resumes all scenes (hopefully after being paused)
     */
    resume: function()
    {
        this.paused = false;

        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.resume();
            nextScene = nextScene.nextLinked;
        }
    },

    togglePauseResume: function()
    {
        if (pc.system.game.paused)
            pc.system.game.resume();
        else
            pc.system.game.pause();
    },

    reset: function()
    {
        // clear all scenes, layers, entities
        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.reset();
            nextScene = nextScene.nextLinked;
        }

        this.scenes.clear();
        this.activeScenes.clear();
        
        // then restart the game
        this.onReady();
    },

    onResize: function(width, height)
    {
        // todo: this will override a player set viewport -- need a better model, or better handling of viewports
        // just say users have to override this method to handle viewport customizations? feels clunky
        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.onResize(width, height);
//            this.scenes[i].setViewPort(this.scenes[i].viewPortX, this.scenes[i].viewPortY, width, height);
            nextScene = nextScene.nextLinked;
        }
    },

    /**
     * Fired when a bound event/action is triggered in the input system. Use bindAction
     * to set one up. Override this in your object to do something about it.
     * @param actionName The name of the action that happened
     */
    onAction: function (actionName)
    {
    },

    /**
     * Ask all the scenes/layers etc for any entities under the x, y position
     * @param x the screen x position
     * @param y the screen y position
     */
    entitiesUnderXY: function(x, y)
    {
        var found = [];
        var nextScene = this.getFirstActiveScene();
        while (nextScene)
        {
            found.concat(nextScene.obj.entitiesUnderXY(x, y));
            nextScene = nextScene.nextLinked;
        }
        return found;
    }

});





pc.IsoTools = {

    generateTileImage: function(width, height, depth, color, shadeLevel, outlineColor)
    {
        var hh = height /2, hw = width/2;
        var x = 0;
        var y = 0;

        var isoTileImage = new Image();
        isoTileImage.width = width;
        isoTileImage.height = height + depth;

        if (shadeLevel > 0)
        {
            var cubeDark = pc.tools.lightenDarkenColor(color, -(shadeLevel));
        }

        // grab the context and draw a rectangle
        var element = document.createElement('canvas');
        var ctx = element.getContext('2d');

        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y + hh);  // left side - in iso terms
        ctx.lineTo(x + hw, y);  // top
        ctx.lineTo(x + width, y+hh);  // right
        ctx.lineTo(x + hw, y + height); // bottom
        ctx.lineTo(x, y +hh);
        ctx.closePath();
        if (outlineColor != undefined)
        {
            ctx.strokeStyle = outlineColor;
            ctx.stroke();
        }

        ctx.fillStyle = color;
        if (shadeLevel > 0)
        {
            var grd = ctx.createLinearGradient(x + hw, y, x+hw, y+ height);
            grd.addColorStop(0, cubeDark);
            grd.addColorStop(1, color);
            ctx.fillStyle = grd;
        }
        ctx.fill();

        // now give it depth
        ctx.beginPath();
        ctx.moveTo(x, y + hh);  // left side - in iso terms
        ctx.lineTo(x, y + hh + depth); // left side (depth component)
        ctx.lineTo(x + hw, y + depth + height); // bottom
        ctx.lineTo(x + hw, y + height); // bottom center line (upwards)
        ctx.closePath();
        if (outlineColor != undefined)
        {
            ctx.strokeStyle = outlineColor;
            ctx.stroke();
        }

        ctx.fillStyle = color;
        if (shadeLevel > 0)
        {
            var grd2 = ctx.createLinearGradient(x, y + height + depth, x+hw, y + height);
            grd2.addColorStop(0, cubeDark);
            grd2.addColorStop(1, color);
            ctx.fillStyle = grd2;
        }
        ctx.fill();

        ctx.beginPath();

        ctx.moveTo(x + hw, y + depth+ height); // back to bottom again
        ctx.lineTo(x + width, y + depth + hh); // line to right side
        ctx.lineTo(x + width, y + hh); // line up to right side
        ctx.lineTo(x+ hw, y + height);
        ctx.closePath();
        if (outlineColor != undefined)
        {
            ctx.strokeStyle = outlineColor;
            ctx.stroke();
        }

        ctx.fillStyle = color;
        if (shadeLevel > 0)
        {
            var grd3 = ctx.createLinearGradient(x + width, y + height + depth, x+hw, y + hh);
            grd3.addColorStop(0, cubeDark);
            grd3.addColorStop(1, color);
            ctx.fillStyle = grd3;
        }
        ctx.fill();

        // now convert the context into an image
        isoTileImage.src = element.toDataURL();
        return isoTileImage;
    }


};
/**
 * Playcraft UI -- tools to help you manage UI elements in a scene
 *
 */

pc.LayoutManager = pc.Base('pc.LayoutManager',
    {},
    {}
);


pc.TextElement = pc.Element('pc.TextElement',
    {
        create: function (layer, label, strokeColor, fillColor, font, x, y, w, h)
        {
            // todo: add support for strings pass in # and rgba (strip them out)
            var n = this._super(layer, x, y, 0, w, h);
            n.label = label;
            n.strokeColor = strokeColor;
            n.fillColor = fillColor;
            // fix the alpha, since they are optional
            if (n.fillColor.length == 3) n.fillColor[3] = 0;
            if (n.strokeColor.length == 3) n.strokeColor[3] = 0;

            n.font =  font;
            n._updateColorCache();
            return n;
        }
    },
    {
        label: null,
        strokeColor: null,
        fillColor: null,
        font: null,
        alpha: 0, // alpha override of all alpha channels as an offset value (includes stroke and fill)

        // cache the color rgba strings so we don't have to create it every draw
        strokeColorCache: null,
        fillColorCache: null,

        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
            ctx.strokeStyle = this.strokeColorCache;
            ctx.fillStyle = this.fillColorCache;
            ctx.font = this.font;
            ctx.lineWidth = 1;
            ctx.fillText(this.label, this.pos.x + screenOffsetX, this.pos.y + screenOffsetY);
            ctx.strokeText(this.label, this.pos.x + screenOffsetX, this.pos.y + screenOffsetY);
        },

        setAlpha: function(a)
        {
            this.alpha = a;
            this.strokeColor[3] = a;
            this.fillColor[3] = a;
            this._updateColorCache();
        },

        addAlpha: function(a)
        {
            this.alpha += a;
            this.strokeColor[3] += a;
            this.fillColor[3] += a;
            this._updateColorCache();
        },

        getAlpha: function()
        {
            return this.alpha;
        },

        setFillColor: function(c)
        {
            this.fillColor = c;
            this._updateColorCache();
        },

        setStrokeColor: function(c)
        {
            this.strokeColor = c;
            this._updateColorCache();
        },

        //
        // INTERNALS
        //
        _updateColorCache: function()
        {
            // todo: this is constructing a string on every adjustment: can we save on that? maybe adjusting
            this.strokeColorCache = 'rgba(' + this.strokeColor[0] + ',' + this.strokeColor[1] + ','
                + this.strokeColor[2] + ',' + this.strokeColor[3] + ')';
            this.fillColorCache = 'rgba(' + this.fillColor[0] + ',' + this.fillColor[1] + ','
                + this.fillColor[2] + ',' + this.fillColor[3] + ')';
        }



    });

/**
 * Playcraft Engine
 * Loader - the resource loader and manager
 *
 * The Loader takes care of loading resources (downloading) and then notifying you when everything
 * is ready.
 */


pc.Loader = pc.Base.extend('pc.Loader', {},
{
    State: { QUEUED:0, LOADING:1, READY:2, FAILED:3 },

    resources: new pc.Hashtable(),
    loadingListener: null,
    loadedListener: null,
    progress: 0,
    totalBeingLoaded: 0,
    errored: 0,
    baseUrl: '',

    /**
     * @property started {Boolean} True if loader.start() has been called. Typically resources use this to check
     * if they should just load immediately (after game start) or hold on loading until the loader calls (triggered
     * by loader.start()
     */
    started: false,

    _noCacheString: '',

    /**
     * Init the loader.
     * Listener will be called with a param (0 to 1) representing % complete.
     */
    init: function()
    {
        this._super();
    },

    /**
     * Tells the resource loader to disable caching in the browser by modifying the resource src
     * by appending the current date/time
     */
    setDisableCache: function()
    {
        this._noCacheString = '?nocache=' + Date.now();
    },

    setBaseUrl: function(url)
    {
        this.baseUrl = url;
    },

    setListener: function(loadingListener, loadedListener)
    {
        this.loadingListener = loadingListener;
        this.loadedListener = loadedListener;
    },

    add: function(resource)
    {
        // resource.src already has the baseUrl set by the resource class (i.e. pc.Image)
        // so no need to add it here
        this.resources.put(resource.name, { resource: resource, state: this.State.QUEUED } );
        this.info('Adding resource ' + resource.src + ' to the queue.');
    },

    get: function(name)
    {
        var res = this.resources.get(name);
        if (!res)
            this.warn("Attempting to get a resource that hasn't been added: " + name);
        return res;
    },

    start: function(loadingListener, loadedListener)
    {
        this.setListener(loadingListener, loadedListener);
        
        this.progress = 0;
        this.errored = 0;

        // ask all of the resources to get busy loading
        var keys = this.resources.keys();

        for (var i = 0; i < keys.length; i++)
        {
            var res = this.resources.get(keys[i]);
            if (res.state == this.State.QUEUED)
            {
                res.resource.load(this.onLoad.bind(this), this.onError.bind(this));
                res.state = this.State.LOADING;
                this.totalBeingLoaded++;
            }
        }
        this.info('Started loading ' + this.totalBeingLoaded + ' resource(s).');
    },

    makeUrl: function(src)
    {
        return this.baseUrl + src + this._noCacheString;
    },

    /**
     * Called from the resource once it's been loaded
     * @param resource The resource that has been loaded, such as a pc.Image or pc.Sound
     */
    onLoad: function(resource)
    {
        var res = this.resources.get(resource.name);
        res.state = this.State.READY;
        this.progress++;

        if (this.loadingListener != null)
            this.loadingListener(Math.round((this.progress / this.totalBeingLoaded) * 100));

        this.info(resource.name + ' loaded (' + Math.round((this.progress / this.totalBeingLoaded)*100) + '% done)');

        this.checkAllDone();
    },

    /**
     * Called from the resource if it fails to load
     * @param resource The resource that has failed, such as a pc.Image or pc.Sound
     */
    onError: function(resource)
    {
        var res = this.resources.get(resource.name);
        res.state = this.State.FAILED;
        this.progress++;
        this.errored++;

        if (this.loadingListener != null)
            this.loadingListener(this.progress / this.totalBeingLoaded);
        this.warn(resource.name + ' (' + resource.src + ') failed.');

        this.checkAllDone();
    },

    checkAllDone: function()
    {
        if (this.progress >= this.totalBeingLoaded)
        {
            this.loadedListener(this.progress, this.errored);
            this.progress = 0;
            this.errored = 0;
            this.totalBeingLoaded = 0;
        }

    }

});



/**
 * PlayCraft Engine
 * DataResource: a generic resource you can load (json, xml, etc)
 * @class
 */

pc.DataResource = pc.Base.extend('pc.DataResource', {},
    {
        data:null,
        request:null,
        src:null,
        name: null,
        loaded:false,
        onLoadCallback:null,
        onErrorCallback:null,

        /**
         * Loads data from a remote (URI) resource.
         * @param src URI for the data
         * @param onLoadCallback Function to be called once the image has been loaded
         * @param onErrorCallback Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.src = pc.system.loader.makeUrl(src);
            this.name = name;
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;
            this.request = new XMLHttpRequest();
            this.request.onreadystatechange = this.onReadyStateChange.bind(this);
            this.request.onload = this.onReadyStateChange.bind(this);
            this.request.onloadend = this.onReadyStateChange.bind(this);
            this.load();
        },

        /**
         * Load script
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            this.request.open('get', this.src);
            this.request.send(null);
        },

        /**
         * Force a reload
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        onReadyStateChange:function()
        {
            if (this.loaded) return;

            if (this.request.readyState == 4)
            {
                if (this.request.status == 200)
                {
                    this.loaded = true;

                    this.data = this.request.responseText;

                    if (this.onLoadCallback)
                        this.onLoadCallback(this);
                } else
                if (this.request.status == 404)
                {
                    this.warn('resource ' + this.src + ' error ' + this.request.status);
                    if (this.onErrorCallback)
                        this.onErrorCallback(this);
                }
            }
        },


    });
