/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * Special include file added to the playcraft library when it's been built and packed. This file is not included
 * when the developer loader is used to run the game.
 */

if (!window.pc)
    window.pc = {};

pc.packed = true;

// first playcraft script loaded -- used to init anything before the rest of the engine is loaded
pc.Hashtable = gamecore.Hashtable;

/**
 * @class pc.Base
 * @augments gamecore.Base
 */
pc.Base = gamecore.Base('pc.Base',
    /** @lends gamecore.Base */
    {},
    /** @lends gamecore.Base.prototype */
    {});

/**
 * @class pc.Pool
 * @augments gamecore.Pool
 */
pc.Pool = gamecore.Pool.extend('pc.Pool',
    /** @lends gamecore.Pool */
    {},
    /** @lends gamecore.Pool.prototype */
    {});

/**
 * @class pc.Pooled
 * @augments gamecore.Pooled
 */
pc.Pooled = gamecore.Pooled.extend('pc.Pooled',
    /** @lends gamecore.Pooled */
    {},
    /** @lends gamecore.Pooled.prototype */
    {});

/**
 * @class pc.LinkedList
 * @augments gamecore.LinkedList
 */
pc.LinkedList = gamecore.LinkedList.extend('pc.LinkedList',
    /** @lends gamecore.LinkedList */
    {},
    /** @lends gamecore.LinkedList.prototype */
    {});

/**
 * @class pc.LinkedListNode
 * @augments gamecore.LinkedListNode
 */
pc.LinkedListNode = gamecore.LinkedListNode.extend('pc.LinkedListNode',
    /** @lends gamecore.LinkedListNode */
    {},
    /** @lends gamecore.LinkedListNode.prototype */
    {});

/**
 * @class pc.HashList
 * @augments gamecore.HashList
 */
pc.HashList = gamecore.HashList.extend('pc.HashList',
    /** @lends gamecore.HashList */
    {},
    /** @lends gamecore.HashList.prototype */
    {});

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}


/**
 * Playcraft Engine
 */

/*
 (function (globalNamespace)
 {
 var req = typeof module !== 'undefined' && module.exports
 ? require("requirejs")
 : require;

 var pc = {};

 pc.start = function ()
 {
 req("loader", function ()
 {
 // loaded
 });
 };

 // Always add it to the global namespace
 globalNamespace.pc = pc;

 if (typeof define === 'function')
 { // AMD Module
 define(function ()
 {
 return pc;
 });
 } else if (typeof module !== 'undefined' && module.exports)
 { // Node.js Module
 module.exports = pc;
 }

 }).call(this);
 */


if (!window.pc)
    window.pc = {};

pc.VERSION = '0.5.6';


/**
 * Simple javascript loader. Loads sources in a linear order (the order they are added to the loader).
 * This ensures dependencies based on the order of loading. It isn't particularly super efficient, but is
 * generally only used for development; and the difference in loading times over fast connections is minimal.
 * For production deployment you should be packing/minimizing the game into a single file.
 */
pc.JSLoader = function () {
    this.progress = 0;
    this.canvasId = null;
    this.current = 0;
    this.baseUrl = '';
    this.started = false;
    this.finished = false;
    this._noCacheString = '';
    this.gameClass = null;
    this.resources = [];

    /**
     * Tells the resource loader to disable caching in the browser by modifying the resource src
     * by appending the current time
     */
    this.setDisableCache = function () {
        this._noCacheString = '?nocache=' + Date.now();
    };

    this.setBaseUrl = function (url) {
        this.baseUrl = url;
    };

    this.makeUrl = function (src) {
        return this.baseUrl + src + this._noCacheString;
    };

    this.add = function (src) {
        this.resources.push(this.makeUrl(src));
    };

    this.start = function (canvasId, gameClass) {
        this.current = 0;
        this.canvasId = canvasId;
        this.gameClass = gameClass;
        this.loadNextScript();
    };

    this.loadNextScript = function () {
        var src = this.resources[this.current];
        var script = document.createElement("script");
        script.type = "application/javascript";
        script.src = src;

        script.onload = this.checkAllDone.bind(this);
        script.onerror = function () {
            throw('Could not load javascript file: ' + script.src);
        };

        console.log('Loading ' + src);
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    this.checkAllDone = function () {
        if (this.resources.length - 1 == this.current) {
            this.finished = true;
            pc.device.boot(this.canvasId, this.gameClass);
        } else {
            this.current++;
            this.loadNextScript();
        }
    }
};


pc.start = function (canvasId, gameClass, gameBaseUrl, scripts, engineBaseURL) {
    var loader = new pc.JSLoader();
//    loader.setDisableCache();

    // if we're not packed/minified, then load the source directly here
    if (pc.packed == undefined) {
        if (engineBaseURL == undefined)
            engineBaseURL = '/playcraftjs/lib/';
        loader.setBaseUrl(engineBaseURL);

        // Externals
        loader.add('ext/gamecore.js/src/gamecore.js');
        loader.add('ext/gamecore.js/src/class.js');
        loader.add('ext/gamecore.js/src/base.js');
        loader.add('ext/gamecore.js/src/jhashtable.js');
        loader.add('ext/gamecore.js/src/device.js');
        loader.add('ext/gamecore.js/src/perf.js');
        loader.add('ext/gamecore.js/src/linkedlist.js');
        loader.add('ext/gamecore.js/src/hashlist.js');
        loader.add('ext/gamecore.js/src/stacktrace.js');
        loader.add('ext/gamecore.js/src/pooled.js');
        loader.add('ext/box2dweb.2.1a-pc.js');

        // Playcraft Engine
        loader.add('boot.js'); // <--- must be first for engine scripts (sets up some translations)
        loader.add('input.js');
        loader.add('input.js');
        loader.add('hashmap.js');
        loader.add('tools.js');
        loader.add('color.js');
        loader.add('debug.js');
        loader.add('device.js');
        loader.add('sound.js');
        loader.add('layer.js');
        loader.add('entitylayer.js');
        loader.add('tileset.js');
        loader.add('tilemap.js');
        loader.add('tilelayer.js');
        loader.add('hextilelayer.js');
        loader.add('entity.js');
        loader.add('sprite.js');
        loader.add('spritesheet.js');
        loader.add('math.js');
        loader.add('image.js');
        loader.add('scene.js');
        loader.add('game.js');
        loader.add('loader.js');
        loader.add('dataresource.js');
        loader.add('components/component.js');
        loader.add('components/physics.js');
        loader.add('components/alpha.js');
        loader.add('components/joint.js');
        loader.add('components/expiry.js');
        loader.add('components/originshifter.js');
        loader.add('components/spatial.js');
        loader.add('components/overlay.js');
        loader.add('components/clip.js');
        loader.add('components/activator.js');
        loader.add('components/input.js');
        loader.add('components/fade.js');
        loader.add('components/spin.js');
        loader.add('components/scale.js');
        loader.add('components/rect.js');
        loader.add('components/poly.js');
        loader.add('components/circle.js');
        loader.add('components/text.js');
        loader.add('components/sprite.js');
        loader.add('components/layout.js');
        loader.add('components/particleemitter.js');
        loader.add('systems/system.js');
        loader.add('es/entitymanager.js');
        loader.add('es/systemmanager.js');
        loader.add('systems/entitysystem.js');
        loader.add('systems/physics.js');
        loader.add('systems/effects.js');
        loader.add('systems/particles.js');
        loader.add('systems/input.js');
        loader.add('systems/expiry.js');
        loader.add('systems/activation.js');
        loader.add('systems/render.js');
        loader.add('systems/layout.js');
    }

    // now load the game scripts
    loader.setBaseUrl(gameBaseUrl);
    for (var i = 0; i < scripts.length; i++)
        loader.add(scripts[i]);

    loader.start(canvasId, gameClass);
};
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Input
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * This class provides a way of binding and reacting to input in a convenient and device independent way. The
 * engine will automatically construct a single, global input class which is accessible via the global pc.device.input.
 * <p>
 * There are two kinds of inputs that can be handled, actions and states. An action is a single event that occurs
 * as a reaction to an input such as clicking the mouse or pressing a key. Typical actions are having a player jump, or
 * open a door. States are when an input is in an on/off state, such as turning a ship or firing a weapon.
 * <p>
 * <h5>Actions</h5>
 * Reacting to action involves 'binding' an action, such as 'open door' or 'jump' to an object in the game which will
 * trigger a call to the object's onAction method.
 * <pre><code>
 * MyGame = pc.Game('MyGame',
 * {},
 * {
 *    onLoaded:function (loaded, errored)
 *    {
 *       // bind the jump action to the space key
 *       this.input.bindAction(this, 'jump', 'SPACE');
 *       // as well as a mouse click
 *       this.input.bindAction(this, 'jump', 'MOUSE_LEFT_CLICK');
 *    },
 *
 *    // this onAction method will be called when an action relating to
 *    // this object is triggered
 *    onAction:function(actionName)
 *    {
 *       if (actionName === 'jump')
 *       {
 *          // player.jump!
 *       }
 *    }
 *
 * });
 * </code></pre>
 * <p>
 * Events will continue to propagate through all active bindings. If you wish to stop handling of an action from
 * within an onAction method you can optionally return false
 * <p>
 * <h5>States</h5>
 * States are used to indicate when a key or input control is currently active or not. Typically a state is used
 * when you want to react for the entire time an input is engaged, such as holding down a key to accelerate a car.
 * <p>
 * To use an input state, bind it to an object the same way you do an action. You will then need to separately check
 * if the state is on at the appropriate time for your game. Most commonly this is done in a process function. See
 * the <a href='pc.Game'>game</a>, <a href='pc.Layer'>layer</a> or <a href='pc.Scene'>scene</a> classes for more
 * information on overriding a process function.
 * <pre><code>
 * // bind the state to an input and an object
 * this.input.bindState(this, 'moving left', 'LEFT');
 *
 * // check for the state being active in the game, layer or scene process
 * process:function ()
 * {
 *    if (pc.device.input.isInputState(this, 'moving left'))
 *       // move the player left
 * }
 * </code></pre>
 * You can see an example of both input actions and states in the Asteroids sample game.
 * <p>
 * Rather than using this class directly, you can also use the <a href='pc.components.Input'>input component</a>
 * and <a href='pc.systems.Input'>system</a> which lets you bind input to an entity as a component.
 */
pc.Input = pc.Base('pc.Input',
    /** @lends pc.Input */
    {
        _eventPos: null, // cached for speed

        /**
         * Extracts the position from an event (in a cross-browser way),and then sets the passed in pos
         * @param {Object} e Event to extract the position from
         * @param {pc.Point} [pos] Position object to set. Leave out to have a new (pooled) point returned
         */
        getEventPosition: function (e, pos) {
            if (this._eventPos == null)
                this._eventPos = pc.Point.create(0, 0);

            var r = pos;
            if (!pc.Tools.isValid(pos))
                r = this._eventPos;

            if (e.pageX || e.pageY) {
                r.x = e.pageX;
                r.y = e.pageY;
            } else {
                r.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                r.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            if (pc.Tools.isValid(e.alpha)) {
                r.x = e.alpha;
                r.y = e.gamma;
            }

            return r;
        }

    },
    /** @lends pc.Input.prototype */
    {
        /** Current state bindings */
        stateBindings: null,
        /** Currently active states */
        states: null,
        /** Action bindings */
        actionBindings: null,
        /** Current position of the mouse on-screen, updated continuously */
        mousePos: null,
        /** indicates if the left mouse button is currently down */
        mouseLeftButtonDown: false,
        /** indicates if the right mouse button is currently down */
        mouseRightButtonDown: false,
        /** Current device orientation, updated continuously */
        deviceOrientation: null,

        init: function () {
            this._super();
            this.stateBindings = new pc.Hashtable();
            this.states = new pc.Hashtable();
            this.actionBindings = new pc.Hashtable();
            this.mousePos = pc.Point.create(0, 0);
            this.deviceOrientation = pc.Point.create(0, 0);
        },

        /**
         * Binds an input state to an object, such as 'turning left' or 'firing' to an input code.
         * You can bind an input to any object, however typically it's to a layer, scene or game. The input will not
         * trigger if the object is not presently active.
         * If you specify a UIElement (optional), the state is only triggered if the event occurs inside
         * the bounds of the element (typically a positional event like a touch start or mouse move)
         * @param {Object} obj An object to bind the state to
         * @param {String} stateName The name of the state, e.g. "turning left"
         * @param {String} input The name of the input, i.e. 'LEFT' (see pc.InputType)
         * @param {Object} [uiTarget] Optional UI object to bind the input to
         */
        bindState: function (obj, stateName, input, uiTarget) {
            if (obj.uniqueId == null)
                throw "Oops, you can't bind a state to an object if it doesn't have a uniqueId function";
            if (!pc.InputType.getCode(input))
                throw "Unknown input code " + input + ' - see pc.InputType for a list of input names';

            input = input.toUpperCase();
            // There can be many bindings associated with a particular input, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var binding = { stateName: stateName, object: obj, input: input, state: {on: false, event: null}, uiTarget: uiTarget };
            var bindingSet = this.stateBindings.get(input);
            if (bindingSet == null)
                this.stateBindings.put(input, [ binding ]);
            else
            // otherwise append a new binding
                bindingSet.push(binding);

            // now setup a state for this object/input combination
            this.states.put(obj.uniqueId + '\\\\' + stateName, {on: false, event: null});

            // if this is a positional type binding, add it to the positional tracking array
            if (pc.InputType.isPositional(pc.InputType.getCode(input)))
                this._positionals.push(binding);
        },


        /**
         * Clears any on states related to an object.
         * @param {Object} obj The object to clear states for
         */
        clearStates: function (obj) {
            var bindings = this.stateBindings.entries();

            for (var b = 0; b < bindings.length; b++) {
                var bindingSet = bindings[b];
                for (var i = 0; i < bindingSet.length; i++) {
                    var binding = bindingSet[i];
                    if (binding.object == obj) {
                        var state = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                        state.on = false;
                        state.event = null;
                        if (pc.InputType.isPositional(binding.input))
                            pc.tools.arrayRemove(this._positionals, binding);
                    }
                }
            }
        },

        /**
         * Returns true if the named state is currently active. If you need anything more than the state boolean
         * use getInputState, which includes the actual event.
         * @param {Object} obj Object to check the binding against
         * @param {String} stateName A string representing a previously setup state, i.e. 'turning left'
         * @returns {Boolean} true if the state is currently on (such as a key being down)
         */
        isInputState: function (obj, stateName) {
            // lookup is very slow; have to find the state for a certain stateName and object
            // todo: oops this is creating strings for every check (usually every frame)-- get rid of it
            // add a state property to the bound object and update it when the state changes
            var state = this.states.get(obj.uniqueId + '\\\\' + stateName);
            if (state == null) throw 'Ooops, unknown state ' + stateName;
            return state.on;
        },

        /**
         * Gets the present input state object (which includes the event data).
         * @param {Object} obj Object to check against (such as a layer, scene or game)
         * @param {String} stateName Name of the state to check for
         * @return {Object} state object containing the state.state and state.event data
         */
        getInputState: function (obj, stateName) {
            return this.states.get(obj.uniqueId + '\\\\' + stateName);
        },

        /**
         * Binds an input event to an action and object; e.g. bindAction(playerShip, 'fire', 'CTRL')
         * will trigger an action callback on the playerShip entity when the CTRL key is pressed down.
         * You can bind an input to a layer, scene or entity. The input will not trigger if the object
         * is not presently active.
         * <p>
         * For positional events (such as a mouse or touch input) the action will only fire if the position
         * of the event is within the bounds of the object (based on a call to getScreenRect). You can optionally
         * provide a uiTarget object to provide a different bounding rectangle. If the object provides no getScreenRect
         * method, then no bounding check will be carried out.
         * <pre><code>
         * For example:
         * var menuLayer = new Layer();                     // a menu layer
         * var menuOption = new TextElement('New Game');    // a menu item
         *
         * // trigger the 'new game' action for the menuLayer, when a mouse click occurs within the menuOption element
         * pc.device.input.bindAction(menuLayer, 'new game', 'MOUSE_BUTTON_LEFT_DOWN', menuOption);
         * </code></pre>
         * Note: If the uiTarget element is not provided, the bounding rectangle of the obj is used (as long as
         * the object provides a getScreenRect() method, otherwise there is no checking
         *
         * @param {pc.Base} obj The entity, layer or scene to bind this action to (must implement onAction)
         * @param {String} actionName The name of the action, e.g. 'FIRE' or 'JUMP'
         * @param {String} input The input code as a string
         * @param {pc.Base} [uiTarget] An optional element to limit the input to only within the bounds of the element (must
         * implement getScreenRect)
         */
        bindAction: function (obj, actionName, input, uiTarget) {
            // There can be many bindings associated with a particular input event, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            input = input.toUpperCase();

            var bindingSet = this.actionBindings.get(input);
            if (bindingSet == null)
                this.actionBindings.put(input, [
                    { actionName: actionName, object: obj, input: input, uiTarget: uiTarget }
                ]);
            else
            // otherwise append a new binding
                bindingSet.push({ actionName: actionName, input: input, object: obj, uiTarget: uiTarget });
        },

        /**
         * Triggers an action to be fired. Typically this will be fired in response to an input, but it can
         * also be used to simulate an event.
         * @param {Number} eventCode event code
         * @param {Event} event An event object
         */
        fireAction: function (eventCode, event) {
            var bindingSet = this.actionBindings.get(pc.InputType.getName(eventCode));
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and fire the object callbacks
            for (var i = 0; i < bindingSet.length; i++) {
                var binding = bindingSet[i];
                var obj = bindingSet[i].object;
                if (!obj.isActive || obj.isActive()) {
                    // if it's a positional event type (like a mouse down or move, then we only
                    // fire events to objects where the event is within its spatial bounds
                    if (pc.InputType.isPositional(eventCode)) {
                        var pos = this.Class.getEventPosition(event);

                        if (pc.InputType.isDeviceOrientation(eventCode)) {
                            obj.onAction(binding.actionName, event, pos, binding.uiTarget);
                            return true;
                        }

                        var er = null;
                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = obj.getScreenRect ? obj.getScreenRect() : null;

                        if (er && er.containsPoint(pos)) {
                            var res = obj.onAction(binding.actionName, event, pos, binding.uiTarget);
                            if (pc.valid(res) && !res)
                                break;
                        }
                    } else {
                        var r = obj.onAction(binding.actionName);
                        if (pc.valid(r) && !r)
                            break;
                    }
                }
            }
            return true;
        },


        /*** INTERNALS **/

        _onReady: function () {
            // touch input
            pc.device.canvas.addEventListener('touchstart', this._touchStart.bind(this), true);
            pc.device.canvas.addEventListener('touchend', this._touchEnd.bind(this), true);
            pc.device.canvas.addEventListener('touchmove', this._touchMove.bind(this), true);

            // mouse input
            pc.device.canvas.addEventListener('mouseup', this._mouseUp.bind(this), true);
            pc.device.canvas.addEventListener('mousedown', this._mouseDown.bind(this), true);
            pc.device.canvas.addEventListener('mousemove', this._mouseMove.bind(this), true);

            if (!pc.device.isCocoonJS) {
                pc.device.canvas.addEventListener('mousewheel', this._mouseWheel.bind(this), true);
                pc.device.canvas.addEventListener('contextmenu', this._contextMenu.bind(this), true);

                // key input
                window.addEventListener('keydown', this._keyDown.bind(this), true);
                window.addEventListener('keyup', this._keyUp.bind(this), true);
            }

            // device orientation
            window.addEventListener('deviceorientation', this._deviceOrientation.bind(this), true);

        },

        _positionals: [], // array of bindings that need to be checked against positional events like mouse move and touch

        // Checks the positional event to see if it's a new event INSIDE an on-screen rectangle that has been
        // bound to a state. This is so when a positional event, like a mouse move, 'slides' over an element
        // we can turn the state on, as well as detecting when it slides out of the area of the uiTarget

        _checkPositional: function (moveEvent) {
            // check existing tracked states -- did we move out of an element
            for (var i = 0; i < this._positionals.length; i++) {
                var binding = this._positionals[i];

                if (moveEvent.type == 'mousemove' && pc.InputType.isTouch(pc.InputType.getCode(binding.input)))
                    continue;

                if (moveEvent.type == 'touchmove' && !pc.InputType.isTouch(pc.InputType.getCode(binding.input)))
                    continue;

                if (pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_BUTTON_LEFT_UP ||
                    pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_BUTTON_LEFT_DOWN ||
                    pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_BUTTON_RIGHT_UP ||
                    pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_BUTTON_RIGHT_DOWN
                    )
                    continue;

                var er = null;
                if (pc.valid(binding.uiTarget))
                    er = binding.uiTarget.getScreenRect();
                else
                    er = binding.object.getScreenRect ? binding.object.getScreenRect() : null;

                if (er) {
                    if (!er.containsPoint(this.Class.getEventPosition(moveEvent))) {
                        // no longer in the right position, turn state off
                        var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state.on = false;
                        state.event = moveEvent;
                    } else {
                        // moved into position, turn back on
                        var state2 = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state2.on = true;
                        state2.event = moveEvent;
                    }
                }
            }
        },

        _changeState: function (eventCode, stateOn, event) {
            // grab all the bindings to this event code
            var keyName = pc.InputType.getName(eventCode);
            if (keyName == null) {
                this.log("Unknown keycode = " + eventCode);
                return false;
            }

            var bindingSet = this.stateBindings.get(keyName);
            //console.log('change state = ' + this.inputType.getName(event.keyCode,+ ' bindings=' + bindingSet);
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and change the state
            for (var i = 0; i < bindingSet.length; i++) {
                var binding = bindingSet[i];
                if (!binding.object.isActive || binding.object.isActive()) {
                    if (pc.InputType.isPositional(eventCode)) {
                        // if binding has a uiElement, then make sure the event hit is within the on-screen
                        // rectangle
                        var pos = this.Class.getEventPosition(event);
                        var er = null;

                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = binding.object.getScreenRect ? binding.object.getScreenRect() : null;

                        if (er) {
                            if (er.containsPoint(pos)) {
                                var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                                state.on = stateOn;
                                state.event = event;
                            }
                        } else {
                            // positional, but no uiTarget
                            state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                            state.on = stateOn;
                            state.event = event;
                        }
                    }
                    else {
                        state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state.on = stateOn;
                        state.event = event;
                    }
                }
            }
            return true;
        },

        _lastMouseMove: null,

        _lastDeviceOrientation: null,

        /**
         * Called by the pc.device main loop to process any move events received. We only handle events
         * here so they are processed once per cycle, not every time we get them (i.e. stop handling
         * a flood of mouse move or touch events
         */
        process: function () {
            if (this._lastMouseMove) {
                this._checkPositional(this._lastMouseMove);
                this.fireAction(pc.InputType.MOUSE_MOVE, this._lastMouseMove);
                this.Class.getEventPosition(this._lastMouseMove, this.mousePos);
                this._lastMouseMove = null;
            }

            if (this._lastDeviceOrientation) {
                this._changeState(pc.InputType.DEVICE_ORIENTATION, true, this._lastDeviceOrientation);
                this.fireAction(pc.InputType.DEVICE_ORIENTATION, this._lastDeviceOrientation);
                this.Class.getEventPosition(this._lastDeviceOrientation, this.deviceOrientation);
                this._lastDeviceOrientation = null;
            }
        },

        ///////////////////////////////////////////////////////////////////////////////////
        //
        //  EVENT HANDLERS
        //
        ///////////////////////////////////////////////////////////////////////////////////

        _keyDown: function (event) {
            this._changeState(event.keyCode, true, event);
            this.fireAction(event.keyCode, event);
        },

        _keyUp: function (event) {
            this._changeState(event.keyCode, false, event);
        },

        _deviceOrientation: function (event) {
            this._lastDeviceOrientation = event;
        },

        _touchStart: function (event) {
            for (var i = 0, len = event.touches.length; i < len; i++) {
                this._changeState(pc.InputType.TOUCH, true, event.touches[i]);
                this.fireAction(pc.InputType.TOUCH, event.touches[i]);
            }

        },

        _touchEnd: function (event) {
            for (var i = 0, len = event.changedTouches.length; i < len; i++) {
                this._checkPositional(event.changedTouches[i]);
                this._changeState(pc.InputType.TOUCH_END, false, event.changedTouches[i]);
                this.fireAction(pc.InputType.TOUCH_END, event.changedTouches[i]);
            }
        },

        _touchMove: function (event) {
            for (var i = 0, len = event.touches.length; i < len; i++) {
                this._checkPositional(event.touches[i]);
                this._changeState(pc.InputType.TOUCH_MOVE, false, event.changedTouches[i]);
                this.fireAction(pc.InputType.TOUCH_MOVE, event.touches[i]);
            }
        },

        _mouseUp: function (event) {
            if (event.button == 0 || event.button == 1) {
                this._changeState(pc.InputType.MOUSE_BUTTON_LEFT_DOWN, false, event);
                this._changeState(pc.InputType.MOUSE_BUTTON_LEFT_UP, true, event);
                this.fireAction(pc.InputType.MOUSE_BUTTON_LEFT_UP, event);
                this.mouseLeftButtonDown = false;
            } else {
                this._changeState(pc.InputType.MOUSE_BUTTON_RIGHT_DOWN, false, event);
                this._changeState(pc.InputType.MOUSE_BUTTON_RIGHT_UP, true, event);
                this.fireAction(pc.InputType.MOUSE_BUTTON_RIGHT_UP, event);
                this.mouseRightButtonDown = false;
            }
        },

        _mouseDown: function (event) {
            if (event.button == 0 || event.button == 1) {
                this._changeState(pc.InputType.MOUSE_BUTTON_LEFT_DOWN, true, event);
                this._changeState(pc.InputType.MOUSE_BUTTON_LEFT_UP, false, event);
                this.fireAction(pc.InputType.MOUSE_BUTTON_LEFT_DOWN, event);
                this.mouseLeftButtonDown = true;
            } else {
                this._changeState(pc.InputType.MOUSE_BUTTON_RIGHT_DOWN, true, event);
                this._changeState(pc.InputType.MOUSE_BUTTON_RIGHT_UP, false, event);
                this.fireAction(pc.InputType.MOUSE_BUTTON_RIGHT_DOWN, event);
                this.mouseRightButtonDown = true;
            }
        },

        _mouseMove: function (event) {
            this._lastMouseMove = event;
        },

        _contextMenu: function (event) {
            this._changeState(pc.InputType.MOUSE_BUTTON_RIGHT_UP, true, event);
            this.fireAction(pc.InputType.MOUSE_BUTTON_RIGHT_UP, event);
        },

        _mouseWheel: function (event) {
            if (event.wheel > 0)
                this.fireAction(pc.InputType.MOUSE_WHEEL_UP, event);
            else
                this.fireAction(pc.InputType.MOUSE_WHEEL_DOWN, event);
        }
    });

pc.InputType = pc.Base.extend('pc.InputType',
    {
        // STATICS
        nameToCode: null,
        codeToName: null,

        POSITIONAL_EVENT_START: 1000,
        MOUSE_MOVE: 1100, // Basic mouse movement
        MOUSE_BUTTON_LEFT_UP: 1110,
        MOUSE_BUTTON_LEFT_DOWN: 1111,
        MOUSE_BUTTON_RIGHT_UP: 1120,
        MOUSE_BUTTON_RIGHT_DOWN: 1121,
        MOUSE_WHEEL_UP: 1130,
        MOUSE_WHEEL_DOWN: 1131,
        TOUCH: 1000,
        TOUCH_MOVE: 1001,
        TOUCH_END: 1002,
        DEVICE_ORIENTATION: 1020,

        init: function () {
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
            for (var c = 48; c < 91; c++) {
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

            this.addInput(this.DEVICE_ORIENTATION, 'DEVICE_ORIENTATION');

            this.addInput(this.TOUCH, 'TOUCH');
            this.addInput(this.TOUCH_MOVE, 'TOUCH_MOVE');
            this.addInput(this.TOUCH_END, 'TOUCH_END');

            this.addInput(this.MOUSE_BUTTON_LEFT_DOWN, 'MOUSE_BUTTON_LEFT_DOWN');
            this.addInput(this.MOUSE_BUTTON_LEFT_UP, 'MOUSE_BUTTON_LEFT_UP');
            this.addInput(this.MOUSE_BUTTON_RIGHT_DOWN, 'MOUSE_BUTTON_RIGHT_DOWN');
            this.addInput(this.MOUSE_BUTTON_RIGHT_UP, 'MOUSE_BUTTON_RIGHT_UP');

            // add some legacy support for the old MOUSE_BUTTON refs
            this.nameToCode.put("MOUSE_LEFT_BUTTON", this.MOUSE_BUTTON_LEFT_UP);
            this.nameToCode.put("MOUSE_RIGHT_BUTTON", this.MOUSE_BUTTON_RIGHT_UP);

            this.addInput(this.MOUSE_WHEEL_UP, 'MOUSE_WHEEL_UP');
            this.addInput(this.MOUSE_WHEEL_DOWN, 'MOUSE_WHEEL_DOWN');
            this.addInput(this.MOUSE_MOVE, 'MOUSE_MOVE');
        },

        isDeviceOrientation: function (inputCode) {
            return inputCode == this.DEVICE_ORIENTATION;
        },

        isTouch: function (inputCode) {
            return inputCode == this.TOUCH;
        },

        isPositional: function (inputCode) {
            return inputCode >= this.POSITIONAL_EVENT_START;
        },

        /**
         * Private utility method used by the constructor to add the input codes and lookup
         * names to both indexes/hash tables
         * @param inputCode event input code (i.e. event.keyCode)
         * @param inputName the human name of the input
         */
        addInput: function (inputCode, inputName) {
            this.codeToName.put(inputCode, inputName);
            this.nameToCode.put(inputName, inputCode);
        },

        /**
         * Returns the name of an input based on the event code
         * @param inputCode
         */
        getName: function (inputCode) {
            return this.codeToName.get(inputCode);
        },

        /**
         * Returns the code of an input based on the input name
         * @param inputName
         */
        getCode: function (inputName) {
            return this.nameToCode.get(inputName);
        }


    },
    {}
);

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Hashmap
 * @description
 * [Extends <a href='pc.Layer'>pc.Base</a>]
 * <p>
 * An implementation of a simple hashmap you can use to store key value pairs.
 * <p>
 * <pre><code>
 * // create a hashmap
 * var map = new pc.Hashmap();
 * map.put('key', 'value');
 * map.get('key') === 'value';
 * map.hasKey('key'); // true
 * map.remove('key');
 * </code></pre>
 */

pc.Hashmap = pc.Base.extend('pc.Hashmap',
    {},
    /** @lends pc.Hashmap.prototype */
    {
        init: function () {
            this._super();//console.log(this.items.toString());
            this.items = {};
        },

        /** number of items in the map */
        length: 0,
        /** an object containing all the items as properties */
        items: {},

        /**
         * Put a key, value pair into the map
         * @param {String} key Key to map the value to
         * @param {Object} value The value
         */
        put: function (key, value) {
            if (!pc.valid(key)) throw "invaid key";
            this.items[key] = value;
            this.length++;
        },

        /**
         * Get a value using a key
         * @param {String} key The key
         * @return {Object} Value mapped to the key
         */
        get: function (key) {
            return this.items[key];
        },

        /**
         * Indicates whether a key exists in the map
         * @param {String} key The key
         * @return {Boolean} True if the key exists in the map
         */
        hasKey: function (key) {
            return this.items.hasOwnProperty(key);
        },

        /**
         * Remove an element from the map using the supplied key
         * @param {String} key Key of the item to remove
         */
        remove: function (key) {
            if (this.hasKey(key)) {
                this.length--;
                delete this.items[key];
            }
        },

        /**
         * @return {Array} Returns an array of all the keys in the map
         */
        keys: function () {
            var keys = [];
            for (var k in this.items)
                keys.push(k);
            return keys;
        },

        /**
         * @return {Array} Returns an array of all the values in the map
         */
        values: function () {
            var values = [];
            for (var k in this.items)
                values.push(this.items[k]);
            return values;
        },

        /**
         * Removes all items in the map
         */
        clear: function () {
            this.items = {};
            this.length = 0;
        }
    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 *
 * xmlToJSON function:
 * This work is licensed under Creative Commons GNU LGPL License.
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * Version: 0.9
 * Author:  Stefan Goessner/2006
 * Web:     http://goessner.net/
 */

/**
 * @class pc.Tools
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of useful tools. This is a static class, so you can just call methods directly, i.e.
 * <p><pre><code>
 * var cleanValue = pc.Tools.checked(value, 'default');
 * </code></pre>
 * There are shortcuts for the following common tools functions to make like a little easier:
 * <p><pre><code>
 * pc.valid = pc.Tools.isValid;
 * pc.checked = pc.Tools.checked;
 * pc.assert = pc.Tools.assert;
 * </code></pre>
 */
pc.Tools = pc.Base.extend('pc.Tools',
    /** @lends pc.Tools */
    {
        /**
         * Checks if a param is valid (null or undefined) in which case the default value will be returned
         * @param {*} p Parameter to check
         * @param {*} def Default value to return if p is either null or undefined
         * @return {*} p if valid, otherwise def (default)
         */
        checked: function (p, def) {
            if (!pc.valid(p))
                return def;
            return p;
        },

        /**
         * Check if a value is valid (not null or undefined)
         * @param {*} p A value
         * @return {Boolean} true if the value is not undefined and not null
         */
        isValid: function (p) {
            return !(p == null || typeof p === 'undefined');
        },

        /**
         * Tests a boolean evaluation and throws an exception with the error string.
         * @param {Boolean} test A boolean result test
         * @param {String} error A string to throw with the exception
         */
        assert: function (test, error) {
            if (!test) throw error;
        },

        /**
         * Removes an element from an array
         * @param {Array} array The array to remove the element from
         * @param {*} e The element to remove
         */
        arrayRemove: function (array, e) {

            //for (var i = 0; i < array.length; i++)
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] == e)
                    array.splice(i, 1);
            }
        },

        /**
         * Adds an element to an array, but only if it isn't already there
         * @param array the array to add to
         * @param e the element to add
         */
        arrayExclusiveAdd: function (array, e) {
            if (array.indexOf(e) == -1)
                array.push(e);
        },

        /**
         * Convers XML to a json string
         * @param {String} xml XML source data as a string
         * @param {String} tab String to use for tabulation
         * @return {String} JSON string form of the XML
         */
        xmlToJson: function (xml, tab) {
            var X = {
                toObj: function (xml) {
                    var o = {};
                    if (xml.nodeType == 1) {   // element node ..
                        if (xml.attributes.length)   // element with attributes  ..
                            for (var i = 0; i < xml.attributes.length; i++)
                                o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                        if (xml.firstChild) { // element has child nodes ..
                            var textChild = 0, cdataChild = 0, hasElementChild = false;
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 1) hasElementChild = true;
                                else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                                else if (n.nodeType == 4) cdataChild++; // cdata section node
                            }
                            if (hasElementChild) {
                                if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                    X.removeWhite(xml);
                                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                                        if (n.nodeType == 3)  // text node
                                            o["#text"] = X.escape(n.nodeValue);
                                        else if (n.nodeType == 4)  // cdata node
                                            o["#cdata"] = X.escape(n.nodeValue);
                                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                                            if (o[n.nodeName] instanceof Array)
                                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                            else
                                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                        else  // first occurence of element..
                                            o[n.nodeName] = X.toObj(n);
                                    }
                                }
                                else { // mixed content
                                    if (!xml.attributes.length)
                                        o = X.escape(X.innerXml(xml));
                                    else
                                        o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                            else if (textChild) { // pure text
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                            else if (cdataChild) { // cdata
                                if (cdataChild > 1)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                        o["#cdata"] = X.escape(n.nodeValue);
                            }
                        }
                        if (!xml.attributes.length && !xml.firstChild) o = null;
                    }
                    else if (xml.nodeType == 9) { // document.node
                        o = X.toObj(xml.documentElement);
                    }
                    else
                        alert("unhandled node type: " + xml.nodeType);
                    return o;
                },
                toJson: function (o, name, ind) {
                    var json = name ? ("\"" + name + "\"") : "";
                    if (o instanceof Array) {
                        for (var i = 0, n = o.length; i < n; i++)
                            o[i] = X.toJson(o[i], "", ind + "\t");
                        json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                    }
                    else if (o == null)
                        json += (name && ":") + "null";
                    else if (typeof(o) == "object") {
                        var arr = [];
                        for (var m in o)
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                        json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                    }
                    else if (typeof(o) == "string")
                        json += (name && ":") + "\"" + o.toString() + "\"";
                    else
                        json += (name && ":") + o.toString();
                    return json;
                },
                innerXml: function (node) {
                    var s = ""
                    if ("innerHTML" in node)
                        s = node.innerHTML;
                    else {
                        var asXml = function (n) {
                            var s = "";
                            if (n.nodeType == 1) {
                                s += "<" + n.nodeName;
                                for (var i = 0; i < n.attributes.length; i++)
                                    s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                                if (n.firstChild) {
                                    s += ">";
                                    for (var c = n.firstChild; c; c = c.nextSibling)
                                        s += asXml(c);
                                    s += "</" + n.nodeName + ">";
                                }
                                else
                                    s += "/>";
                            }
                            else if (n.nodeType == 3)
                                s += n.nodeValue;
                            else if (n.nodeType == 4)
                                s += "<![CDATA[" + n.nodeValue + "]]>";
                            return s;
                        };
                        for (var c = node.firstChild; c; c = c.nextSibling)
                            s += asXml(c);
                    }
                    return s;
                },
                escape: function (txt) {
                    return txt.replace(/[\\]/g, "\\\\")
                        .replace(/[\"]/g, '\\"')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r');
                },
                removeWhite: function (e) {
                    e.normalize();
                    for (var n = e.firstChild; n;) {
                        if (n.nodeType == 3) {  // text node
                            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                                var nxt = n.nextSibling;
                                e.removeChild(n);
                                n = nxt;
                            }
                            else
                                n = n.nextSibling;
                        }
                        else if (n.nodeType == 1) {  // element node
                            X.removeWhite(n);
                            n = n.nextSibling;
                        }
                        else                      // any other node
                            n = n.nextSibling;
                    }
                    return e;
                }
            };
            if (xml.nodeType == 9) // document node
                xml = xml.documentElement;
            var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
            return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
        }
    },
    {
        // Static class, so nothing required here
    }
)
;


pc.tools = new pc.Tools();

// quick short cuts for common tools
pc.valid = pc.Tools.isValid;
pc.checked = pc.Tools.checked;
pc.assert = pc.Tools.assert;


/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/




pc.Base64 = pc.Base.extend('pc.Base64',
    {
        // private property
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = pc.Base64._utf8_encode(input);

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
        decode: function (input) {
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

            return output.join('');

        },

        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
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
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    },
    {});

// fix for browsers that don't natively support atob or btoa (ie. IE)
if (!window.btoa) window.btoa = pc.Base64.encode
if (!window.atob) window.atob = pc.Base64.decode
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Color
 * @augments pc.Pooled
 * @description
 * A general purpose representation of a color. You can create a color either an array [R,G,B] or using a hex color
 * string in the form of #RRGGBB. (For alpha see the pc.component.Alpha and pc.components.Fade).
 * <p>
 *     Create a color using either new:
 * <pre><code>
 * var color = new pc.Color([255, 0, 0]); // super red
 * var color2 = new pc.Color('#00FF00'); // super green
 * </code></pre>
 * <p>
 *     Or, as a pooled object:
 * <pre><code>
 * var color = pc.Color.create([255, 0, 0]); // super red
 * </code></pre>
 */
pc.Color = pc.Pooled.extend('pc.Color',
    /** @lends pc.Color */
    {
        /**
         * Constructs a color object using the passed in color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        create: function (color) {
            var n = this._super();
            n.config(color);
            return n;
        }
    },
    /** @lends pc.Color.prototype */
    {
        /** Array of current colors */
        rgb: [],
        /** Representation of the current color as an rgb string. Automatically updates as you change color */
        color: null,

        /**
         * Constructs a new color using the passed in color string. Used if you call new pc.Color, but typically
         * you should be using pc.Color.create as this is a pooled class
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        init: function (color) {
            if (color != undefined)
                this.config(color);
        },

        /**
         * Configure this color object with a given color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        config: function (color) {
            if (!color) return;

            if (Array.isArray(color))
                this.rgb = color;
            else {
                if (color.charAt(0) === '#') {
                    this.rgb[0] = parseInt(color.substring(1, 3), 16);
                    this.rgb[1] = parseInt(color.substring(3, 5), 16);
                    this.rgb[2] = parseInt(color.substring(5, 7), 16);
                } else
                    throw "Invalid color: use either array [r,g,b] or '#RRGGBB'";
            }
            this._updateColorCache();
        },

        /**
         * Sets this color object to a given color (synonym for config(color)
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        set: function (color) {
            this.config(color);
        },

        /**
         * Sets the red component of the color
         * @param {Number} r Red component of the color to set
         */
        setRed: function (r) {
            this.rgb[0] = pc.Math.limit(r, 0, 255);
            this._updateColorCache();
        },

        /**
         * Adds to the red component of the color
         * @param {Number} r Red component
         */
        addRed: function (r) {
            this.rgb[0] = pc.Math.limitAdd(this.rgb[0], r, 0, 255);
            this._updateColorCache();
        },

        /**
         * Subtracts from the red component of the color
         * @param {Number} r Red component
         */
        subRed: function (r) {
            this.rgb[0] = pc.Math.limitAdd(this.rgb[0], -r, 0, 255);
            this._updateColorCache();
        },

        /**
         * Sets the green component of the color
         * @param {Number} g Green component of the color to set
         */
        setGreen: function (g) {
            this.rgb[1] = pc.Math.limit(g, 0, 255);
            this._updateColorCache();
        },

        /**
         * Adds to the green component of the color
         * @param {Number} g Green component
         */
        addGreen: function (g) {
            this.rgb[1] = pc.Math.limitAdd(this.rgb[1], g, 0, 255);
            this._updateColorCache();
        },

        /**
         * Subtracts from the green component of the color
         * @param {Number} g Green component
         */
        subGreen: function (g) {
            this.rgb[1] = pc.Math.limitAdd(this.rgb[1], -g, 0, 255);
            this._updateColorCache();
        },

        /**
         * Sets the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        setBlue: function (b) {
            this.rgb[2] = pc.Math.limit(b, 0, 255);
            this._updateColorCache();
        },

        /**
         * Adds to the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        addBlue: function (b) {
            this.rgb[2] = pc.Math.limitAdd(this.rgb[2], b, 0, 255);
            this._updateColorCache();
        },

        /**
         * Subtracts from the blue component of the color
         * @param {Number} b Blue component
         */
        subBlue: function (b) {
            this.rgb[2] = pc.Math.limitAdd(this.rgb[2], -b, 0, 255);
            this._updateColorCache();
        },

        /**
         * Darkens the color by the given value (1..255)
         * @param {Number} amt Amount to darken the color by
         */
        darken: function (amt) {
            this.subRed(amt);
            this.subGreen(amt);
            this.subBlue(amt);
        },

        /**
         * Lightens the color by the given amount (1..255)
         * @param {Number} amt Amount to lighten the color by
         */
        lighten: function (amt) {
            this.addRed(amt);
            this.addGreen(amt);
            this.addBlue(amt);
        },

        _updateColorCache: function () {
            // todo: this is constructing a string on every adjustment: can we save on that?
            this.color = 'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')';
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DebugPanel
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * This class is used to create the real-time debugging panels. An instance of this class is automatically constructed
 * by the pc.device system. When onReady is triggered the panel will automatically attach to a canvas element with the
 * id 'debug'.
 * <p>
 * <pre><code>
 * &ltcanvas id="debug"&gt&lt/canvas&gt
 * </code></pre>
 * The debug panel will automatically size to the available space in the canvas element.
 * <p>
 * You can gain access to the debug panel through pc.device.debugPanel member.
 */

pc.DebugPanel = pc.Base('pc.DebugPanel',
    {},
    /** @lends pc.DebugPanel.prototype */
    {
        x: 0,
        y: 0,
        panelHeight: 0,
        panelWidth: 0,
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

        init: function () {
            this._super();
        },

        onReady: function () {
            this.attach('pcDebug');
        },

        /**
         * Attach the debug panel to a canvas element with the supplied id
         * @param {String} canvasElement Id of a canvas element to attach to
         */
        attach: function (canvasElement) {
            this.canvas = document.getElementById(canvasElement);
            if (this.canvas == null) {
                this.warn('Showing debug requires a div with an id of "debug" to be added to your dom.');
                pc.device.showDebug = false;
                return;
            }

            // resize the canvas to be the size of it's parent (containing element)
            this.panelElement = this.canvas.parentNode;
            this.ctx = this.canvas.getContext('2d');
            this.onResize();

            var np = 4;
            // create the graphs
            this.timeGraph = new pc.CanvasLineGraph(this.ctx, 'Performance', '', 10,
                [
                    {name: 'process (ms)', color: '#f55'},
                    { name: 'render (ms)', color: '#5f5'}
                ], 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);

            if (typeof console.memory === 'undefined' || console.memory.totalJSHeapSize == 0) {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', 'Memory profiling not available', 0,
                    [
                        {name: 'mem used (mb)', color: '#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            } else {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', '', ((console.memory.totalJSHeapSize / 1024 / 1024) * 1.2),
                    [
                        {name: 'mem used (mb)', color: '#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            }

            this.poolGraph = new pc.CanvasLineGraph(this.ctx, 'Pool Size', '', 100,
                [
                    {name: 'pooled', color: '#5b1654'}
                ], this.panelWidth - ((this.panelWidth / np) * 2) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.entityGraph = new pc.CanvasLineGraph(this.ctx, 'Entities', '', 100,
                [
                    { name: 'drawn (total)', color: '#f9f007'}
                ], this.panelWidth - (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.active = true;
        },

        onResize: function () {
            if (this.canvas == null) return;

            this.canvas.width = this.panelElement.offsetWidth;
            this.canvas.height = this.panelElement.offsetHeight;
            this.panelWidth = this.panelElement.offsetWidth;
            this.panelHeight = this.panelElement.offsetHeight;

            // clear the background
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);

            var np = 4;
            if (this.timeGraph != null)
                this.timeGraph.resize(10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.memGraph != null)
                this.memGraph.resize(this.panelWidth / np + 10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.poolGraph != null)
                this.poolGraph.resize(this.panelWidth - ((this.panelWidth / np) * 2) + 20, 10, this.panelWidth / np - 20, this.panelHeight - 20);
            if (this.entityGraph != null)
                this.entityGraph.resize(this.panelWidth - (this.panelWidth / np) + 10, 10, this.panelWidth / np - 20, this.panelHeight - 20);

        },

        _timeSince: 0,

        update: function (delta) {
            if (!this.active) return;

            // update the averages
            this._timeSince += delta;
            if (this._timeSince > 30) {
                this._timeSince = 0;
                if (this.timeGraph != null)
                    this.timeGraph.addLine2(pc.device.lastProcessMS, pc.device.lastDrawMS);
                if (this.entityGraph != null)
                    this.entityGraph.addLine1(pc.device.elementsDrawn);
                if (this.memGraph != null)
                    if (typeof console.memory !== 'undefined')
                        if (console.memory.totalJSHeapSize != 0)
                            this.memGraph.addLine1((window.performance.memory.usedJSHeapSize / 1024 / 1024));
                if (this.poolGraph != null)
                    this.poolGraph.addLine1(gamecore.Pool.totalPooled);
            }
        },

        draw: function () {
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
    maxY: 0, // top most range value
    x: 0,
    y: 0,
    labels: null,
    graphName: null,
    bgCanvas: null, // off screen canvas for background (grid etc)
    graphCanvas: null, // off screen canvas for graph
    message: null,
    cursor: 0, // position in the data array that is the head of the data

    init: function (ctx, graphName, message, maxY, labels, x, y, width, height) {
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

    resize: function (x, y, width, height) {
        this.width = Math.max(width, 1);
        this.height = Math.max(height, 1);
        this.x = x;
        this.y = y;

        // size the graph component
        this.graphHeight = this.height - 40;
        this.graphWidth = this.width - (this.graphLeftMargin + this.graphRightMargin);
        this.graphX = this.graphLeftMargin;
        this.graphY = 20;

        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.graphCanvas.width = Math.max(this.graphWidth, 1);
        this.graphCanvas.height = Math.max(this.graphHeight, 1);

        // resize the data array?
        this.resizeDataArray(this.graphWidth, this.labels.length);
        this.renderBackground();
    },

    resizeDataArray: function (newSize, numDataPoints) {
        var start = 0;
        if (newSize <= 0) newSize = 1;

        if (this.data == null)
            this.data = [];
        else {
            // resize the array
            if (newSize + 1 > this.data.length) // growing?
            {
                start = this.data.length - 1;
            }
            else {
                // shrinking -- we cut from the begining
                this.data.slice(0, newSize - this.data.length);
                if (this.cursor > this.data.length - 1)
                    this.cursor = this.data.length - 1;
                return; // job done, no new init needed (it's smaller)
            }
        }

        // add some new data -- the array is expanding
        for (var i = start; i < newSize; i++)
            this.data.push(new Array(numDataPoints));
    },

    _totalAdded: 0,
    linesSinceLastPeak: 0, // set a new peak every n lines
    lastPeak: 0,
    _total: 0,

    // we use this to add multiple data items -- saves using variable length arrays (which chew
    // memory, thus we only currently support graphs with up to two data elements to a line.
    // if you want more, add an addLine3 method
    addLine2: function (lineData1, lineData2) {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1 + lineData2;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this.data[this.cursor][1] = lineData2;
        this._updateGraph(this._total);
    },

    addLine1: function (lineData1) {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this._updateGraph(lineData1);
    },

    checkMaxRange: function (max) {
        if (max > this.maxY) {
            this.maxY = max * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;
            this.renderBackground();
            this.renderGraph(true);
        }
    },

    _updateGraph: function (total) {
        this.linesSinceLastPeak++;
        if (this.linesSinceLastPeak > this.width * 1.5) {
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
        if (this.cursor > this.data.length - 1)
            this.cursor = 0;

    },

    margin: 20,
    linePixelSize: 0,
    yline: 0,
    unit: 0,
    gridY: 0,
    i: 0,
    n: 0,
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
    renderBackground: function () {
        var ctx = this.bgCanvas.getContext('2d');

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // graph title
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.fillText(this.graphName, this.graphX, this.graphY - 6);

        // draw the surround rectangle
        ctx.strokeStyle = '#111';
        ctx.strokeRect(this.graphX + 0.5, this.graphY + 0.5, this.graphWidth, this.graphHeight);

        // DRAW GRID AND MARKERS (Y AXIS)
        this.unit = (this.graphHeight) / this.maxY; // figure out the y scale
        var graphLines = (this.graphHeight + this.gridLineInc) / this.gridLineInc;
        var axisInc = this.maxY / graphLines;
        var axisValue = 0;
        var lineCount = 0;

        for (this.gridY = this.graphHeight + this.graphY; this.gridY > this.graphY + 1; this.gridY -= this.gridLineInc) {
            lineCount++;
            ctx.textAlign = 'right';
            (lineCount % 2 == 0) ? ctx.fillStyle = '#111' : ctx.fillStyle = '#000';

            var lineHeight = this.gridLineInc;
            if (this.gridY - lineHeight < this.graphY) {
                lineHeight = (this.gridY - this.graphY);
                ctx.fillRect(this.graphX + 1, this.graphY + 1, this.graphWidth - 2, lineHeight - 1);
            } else
                ctx.fillRect(this.graphX + 1, this.gridY - lineHeight - 1, this.graphWidth - 2, lineHeight);

            axisValue = Math.round(axisInc * lineCount);
            ctx.fillStyle = '#777';
            ctx.fillText('' + axisValue, this.graphX - 5, this.gridY);
        }

        // DRAW LEGEND
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        var legendY = this.height - 13;
        var textX = this.graphLeftMargin + 3;

        for (this.n = 0; this.n < this.labels.length; this.n++) {
            ctx.fillStyle = this.labels[this.n].color;
            ctx.fillRect(textX, legendY, 5, 5);
            ctx.fillStyle = '#888';
            ctx.fillText(this.labels[this.n].name, textX + 8, legendY + 6);
            textX += ctx.measureText(this.labels[this.n].name).width + 18;
        }

        this.renderGraph(true);
    },

    renderGraph: function (completeRedraw) {
        if (!this.data) return;

        var gtx = this.graphCanvas.getContext('2d');
        if (completeRedraw) {
            gtx.fillStyle = '#000';
            gtx.fillRect(0, 0, this.graphWidth, this.graphHeight);
        } else if (this._totalAdded > this.graphWidth) // we are appending a line
            gtx.drawImage(this.graphCanvas, -1, 0); // so draw the previous graph shift by one

        // now draw a new line on the far right side
        var len = 0;

        if (completeRedraw) {
            len = this.data.length - 1;
            this.dx = 1;

        } else {
            // draw the first set of lines across, prior to scrolling
            if (this._totalAdded < this.graphWidth)
                this.dx = this.cursor;
            else
                this.dx = this.graphWidth - 1;
            len = this.dx + 1;
        }

        if (len == 0) return;

        // dx is the count of pixels across the screen
        // dpos is the cursor being drawn pointing inside the array
        var dpos = this.cursor - 1;
        if (dpos < 0) dpos = this.data.length - 1;

        for (; this.dx < len; this.dx++) {
            if (dpos > this.data.length - 1) dpos = 0;

            gtx.fillStyle = '#000';
            gtx.fillRect(this.dx, 0, 1, this.graphHeight);

            this.yline = this.graphHeight; // start at the bottom of the graph

            for (this.i = 0; this.i < this.data[dpos].length; this.i++) {
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

    draw: function () {
        this.ctx.save();
        this.ctx.drawImage(this.bgCanvas, this.x, this.y);
        this.renderGraph(false);
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(this.graphCanvas, this.x + this.graphX, this.y + this.graphY);

        // draw the message over the top, if there is one
        if (this.message) {
            this.ctx.font = '13px sans-serif';
            this.ctx.fillStyle = '#333';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.message, this.x + this.width / 2, this.y + this.height / 2 - 9);
        }
        this.ctx.restore();
    }

});

/**
 * Playcraft Engine
 * System - the interface between the device (the real world) and the game
 */

/**
 * @class pc.Device
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * pc.Device is the primary interface between your game and the underlying hardware. It's a singleton instance
 * that will be constructed automatically and is globally accessible at all times as pc.device
 * <p>
 * pc.device will automatically be setup once pc.JSLoader has completed loading all required javascipt through a call
 * to pc.device.boot passing in the Id of the canvas element for your game as well as the name of the game class
 * which pc.device will then dynamically construct. Typically you do not need to construct your own pc.Device, pc.start
 * will take care of it for you.
 */
pc.Device = pc.Base.extend('pc.Device',
    { },
    /** @lends pc.Device.prototype */
    {
        /** element Id of the game canvas */
        canvasId: null,
        /** canvas element upon which all drawing will occur */
        canvas: null,
        /** width of the current canvas */
        canvasWidth: 0,
        /** height of the current canvas */
        canvasHeight: 0,
        /** resource loader */
        loader: null,

        timer: null,
        /** current 2D draw context */
        ctx: null,
        started: false,
        /** current requested frame rate */
        fps: 0,
        /** last cycle frame rate */
        currentFPS: 0,
        tick: 0, // ms per cycle (just 1000/fps for convenience)

        /** whether the device is running */
        running: true,

        /** global render scale */
        scale: 1,
        xmlParser: null,

        // debug related
        debugPanel: null,
        /** whether the debug panel should be updated/drawn */
        showDebug: true,
        /** whether the game is running in development mode; false = production */
        devMode: true,
        enablePooling: true,
        /** whether sound is enabled */
        soundEnabled: true,

        /** number of elements drawn in the last cycle */
        elementsDrawn: 0,
        /** how long in ms the last process cycle took */
        lastProcessMS: 0,
        /** how long in ms the last draw cycle took */
        lastDrawMS: 0,

        // device information
        /** pc.Rect of the current screen dimensions */
        screen: null, // the device's screen dimensions (i.e. the display)
        /** pixel ratio of the screen -- typically 1 unless on a retina display where it's 2 */
        pixelRatio: 1,
        /** is this device an iPhone */
        isiPhone: false,
        /** is this device an iPhone 4 */
        isiPhone4: false,
        /** is this device an iPad*/
        isiPad: false,
        /** is this device an Android*/
        isAndroid: false,
        /** is this a touch device */
        isTouch: false,
        /** is this an ios device */
        isiOS: false,
        /** is this an iPod device */
        isiPod: false,
        /* is running inside cocoonjs */
        isCocoonJS: false,

        requestAnimFrame: null,
        /** pc.Input handler global instance */
        input: null,
        /** the name of the game class that was constructed */
        gameClass: null,
        /** the game object constructed at startup */
        game: null, // the currently running instance of the gameClass

        /** amount of time the last cycle took in ms */
        elapsed: 0,
        /** time the last frame cycle was started */
        lastFrame: 0,
        /** the time now */
        now: Date.now(),

        /**
         * Setup the system interface for the game. Typically this will just be automatically called
         * by the game object and you don't need to worry about it.
         */
        boot: function (canvasId, gameClass) {
            if (this.devMode)
                this.info('Playcraft Engine v' + pc.VERSION + ' starting');
            this.canvasId = canvasId;
            this.gameClass = gameClass;
            this.fps = 60;
            this.tick = 1000 / this.fps;

            this.debugPanel = new pc.DebugPanel();
            this.input = new pc.Input();
            this.loader = new pc.Loader();
            this.isAppMobi = (typeof AppMobi != "undefined");
            this.isCocoonJS = navigator.isCocoonJS;

            this.pixelRatio = gamecore.Device.pixelRatio;
            this.isiPhone = gamecore.Device.isiPhone;
            this.isiPhone4 = gamecore.Device.isiPhone4;
            this.isiPad = gamecore.Device.isiPad;
            this.isAndroid = gamecore.Device.isAndroid;
            this.isTouch = gamecore.Device.isTouch;
            this.isiOS = (this.isiPhone || this.isiPad);
            this.device = gamecore.Device;

            this.requestAnimFrame = gamecore.Device.requestAnimFrame;
            this.requestAnimFrame = (function () {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element) {
                            window.setTimeout(callback, 1000 / 60, Date.now());
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element) {
                    request.apply(window, [callback, element]);
                };
            })();

            window.onresize = this.onResize.bind(this);
            this.onReady();
        },

        /**
         * Indicates whether a sound format is playable on the current device
         * @param {String} format Sound format to test: 'mp3', 'ogg' or 'wav'
         * @return {Boolean} True is the format can be played
         */
        canPlay: function (format) {
            return gamecore.Device.canPlay(format);
        },

        _calcScreenSize: function () {
            if (this.isAppMobi) {
                if (this.screen != null)
                    this.screen.release();
                this.screen = pc.Dim.create(document.body.offsetWidth, document.body.offsetHeight);

                this.canvas.width = this.screen.x;
                this.canvas.height = this.screen.y;
                this.canvas.innerWidth = this.screen.x;
                this.canvas.innerHeight = this.screen.y;
                this.canvasWidth = this.screen.x;
                this.canvasHeight = this.screen.y;
            } else {
                // if the game canvas is in a surrounding div, size based on that
                if (this.isiPad || this.isiPhone) {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;

                } else {
                    if (this.panelElement) {
                        this.canvas.width = this.panelElement.offsetWidth;
                        this.canvas.height = this.panelElement.offsetHeight;
                    }
                }

                this.canvasWidth = this.canvas.width;
                this.canvasHeight = this.canvas.height;

                if (this.screen != null)
                    this.screen.release();
                this.screen = pc.Dim.create(this.canvasWidth, this.canvasHeight);
            }
        },

        /**
         * Automatically called once the device is ready
         */
        onReady: function () {
            if (this.isiOS) {
                this.showDebug = false;
                this.soundEnabled = false;
            }

            if (this.started) return; // check we haven't already started
            this.game = eval('new ' + this.gameClass + '()');
            if (!this.game)
                throw "Invalid game class";

            if (this.isCocoonJS)
                this.canvas = document.createElement('screencanvas');
            else
                this.canvas = document.getElementById(this.canvasId);

            if (!this.canvas)
                throw 'Abort! Could not attach to a canvas element using the id [' + this.canvasId + ']. ' +
                    'Add a canvas element to your HTML, such as <canvas id="pcGameCanvas"></canvas>';
            this.input._onReady();
            this.ctx = this.canvas.getContext('2d');

            // automatically resize to match my parent container
            this.panelElement = this.canvas.parentNode;
            this.onResize();
            this.info('Canvas is ' + this.screen);

            // experimental webgl renderer
            // WebGL2D.enable(this.canvas); // adds "webgl-2d" to cvs
            // this.ctx = this.canvas.getContext('webgl-2d');

            // init the debug panel
            if (this.showDebug)
                this.debugPanel.onReady();

            // start the editor
            //if (this.editor)
            //    this.editor.onReady();

            this.lastFrame = Date.now();

            // give the game a chance to do something at the start
            // construct the game class and fire onReady

            this.game.onReady();

            // start the central game timer
            this.requestAnimFrame(this.cycle.bind(this));

            this.started = true;
        },

        startTime: 0,

        /**
         * Called once per game cycle
         * @param time System time in ms
         */
        cycle: function (time) {
            if (this.running !== false) {
                this.now = Date.now();
                this.elapsed = this.now - this.lastFrame;
                this.lastDrawMS = 0;

                this.currentFPS = Math.round(1000.0 / this.elapsed);
                this.elementsDrawn = 0;

                this.startTime = Date.now();
                // do not render frame when delta is too high
                if (this.elapsed < 200)
                    this.running = this.game.process();
                this.lastProcessMS = (Date.now() - this.startTime) - this.lastDrawMS;

                // process the input system
                pc.device.input.process();

                if (this.showDebug) {
                    this.debugPanel.update(this.elapsed);
                    this.debugPanel.draw(this.ctx);
                }
                this.lastFrame = this.now;
                this.requestAnimFrame(this.cycle.bind(this));
            }

        },

        /**
         * Requests a resize of the canvas based on the supplied dimensions
         * @param {Number} w Width of the canvas
         * @param {Number} h Hight of the canvas
         */
        resize: function (w, h) {
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
        onResize: function () {
            if (this.canvas == null) return;

            this._calcScreenSize();

            var flip = false;
            if (typeof window.orientation !== 'undefined' && window.orientation != 0)
                flip = true;

            if (flip) {
                // in landscape, flip things around
//                var w = this.canvas.width;
//                this.canvas.width = this.canvas.height;
//                this.canvas.height = w;
            }

            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize();
        },

        /**
         * Test whether a given rectangle overlaps any part of the device screen
         * @param {Number} x x position of the top left of the rectangle to test
         * @param {Number} y y position of the top left of the rectangle to test
         * @param {Number} w width of the rectangle
         * @param {Number} h height of the rectangle
         * @return {Boolean} true is it's on screen
         */
        isOnScreen: function (x, y, w, h) {
            return pc.Math.isRectColliding(x, y, w, h, 0, 0, this.canvasWidth, this.canvasHeight);
        },

        /**
         * Parses XML and returns an XMLDoc
         */
        parseXML: function (xml) {
            if (window.DOMParser) {
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
        }

    });


// the singleton system by which we reference the device and setup events
pc.device = new pc.Device();
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sound
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A sound resource can be loaded from a URI and played, including support for managing multichannel sound
 * (playing multiple sounds at once) and different formats used by different browsers.
 * <p>
 * In order to support all modern browsers, sounds need to be provided in both 'ogg' and 'mp3' formats. This is
 * becuase IE supports mp3 (but not ogg), chrome supports ogg and mp3, but safari and firefox only supports ogg. You
 * will need to create sound files into both ogg and mp3 to support all browsers.
 * <p>
 * To play a sound, you first need to load it from a URI:
 * <p><pre><code>
 * // check if sound is enabled
 * if (pc.device.soundEnabled)
 * {
 *    // add the sound to the resource loader
 *    pc.device.loader.add(
 *       // construct a new sound named shotgun, loading formats for
 *       // ogg and mp3 (shotgun.mp3 and shotgun.ogg)
 *       // and setup to play up to 5 of these sounds simultaneously
 *       new pc.Sound('shotgun', 'sounds/shotgun', ['ogg', 'mp3'], 5));
 * }
 * </code></pre>
 * <p>
 * Once you have the sound loaded you can play it:
 * <pre><code>
 * // grab the sound resource from the resource loader
 * var shotgunSound = pc.device.loader.get('shotgun').resource;
 * // play the sound (without looping)
 * shotgunSound.play(false);
 * </code></pre>
 * <p>
 * If the sound is looping, or it's a long sound you can stop it:
 * <pre><code>
 * shotgunSound.stop();
 * </code></pre>
 * You can adjust the volume of a sound:
 * <pre><code>
 * // set the volume to 50%
 * shotgunSound.setVolume(0.5);
 * </code></pre>
 * <p>
 * You can also change the starting position of sound or music using setPlayPosition:
 * <pre><code>
 * // start half way through
 * shotgunSound.setPlayPosition( shotgunSound.getDuration() / 2 );
 * </code></pre>
 */

pc.Sound = pc.Base.extend('pc.Sound', {},
    /** @lends pc.Sound.prototype */
    {
        /** Array of the sound elements -- multichannel sound requires multiple element copies to play */
        sounds: [],
        /** Source URI for the sound resource */
        src: null,
        /** String name for the sound */
        name: null,
        /** Number of sounds loaded */
        numLoaded: 0,
        /** Whether the sound is loaded */
        loaded: false,
        /** Whether an error occured loading the sound */
        errored: false,
        /** Number of channels for the sound. No more than this number can be played at once */
        channels: 1,
        /** Optional call back once the sound is loaded */
        onLoadCallback: null,
        /** Optional call back if the sound errors whilst loading */
        onErrorCallback: null,

        /**
         * Construct a new sound, if the resource loader has already start the sound will be immediately loaded.
         * @param {String} name Resource name (tag) you want to use
         * @param {String} src URI for the sound
         * @param {Number} channels Number of channels this sound can play at once
         * @param {Function} [onLoadCallback] Function to be called once the sound has been loaded (including all channels)
         * @param {Function} [onErrorCallback] Function to be called if the sound fails to load (on first error)
         */
        init: function (name, src, formats, channels, onLoadCallback, onErrorCallback) {
            this._super();
            this.name = name;
            this.channels = channels;

            // append an extension to the src attribute that matches the format with what the device can play
            var canplay = false;
            for (var i = 0; i < formats.length; i++) {
                if (pc.device.canPlay(formats[i])) {
                    this.src = pc.device.loader.makeUrl(src + '.' + formats[i]);
                    canplay = true;
                    break; // we set the src based on the first type we find (in the order they are provided)
                }
            }

            if (canplay) {
                if (pc.device.loader.started) // load now if the loader has already been started
                    this.load(onLoadCallback, onErrorCallback);
            } else
                this.errored = true;
        },

        /**
         * Pauses the sound (on all channels)
         */
        pause: function () {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].pause();
        },

        /**
         * Stop playing a sound (on all channels) -- actually just a synonym for pause
         */
        stop: function () {
            if (!this.canPlay()) return;
            this.pause();
        },

        /**
         * Volume to play the sound at
         * @param {Number} volume Volume as a range from 0 to 1 (0.5 is half volume)
         */
        setVolume: function (volume) {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].volume = volume;
        },

        /**
         * Gets the duration of the sound in seconds
         * @return {Number} The duration in seconds
         */
        getDuration: function () {
            if (!this.canPlay()) return -1;
            return this.sounds[0].duration;
        },

        /**
         * Sets the playback rate of the sound where 0 is not playing and 2 is double speed. Negative values cause
         * the sound to play backwards.
         * WARNING: Only currently supported by Safari and Chrome.
         * @param {Number} r The speed to play the sound at
         */
        setPlaybackRate: function (r) {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].playbackRate = r;
        },

        /**
         * Start playing the sound at the specified time (instead of 0)
         * @param {Number} time time (in seconds to start at)
         */
        setPlayPosition: function (time) {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].currentTime = time;
        },

        /**
         * Load a sound. If the game hasn't started then the sound resource
         * will be added to the resource manager's queue.
         * @param {Function} onLoadCallback function to call once the sound is loaded
         * @param {Function} onLoadCallback function to call if the sound errors
         */
        load: function (onLoadCallback, onErrorCallback) {
            // user customized callbacks
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) {
                this.onLoadCallback(this);
                return;
            }
            // load up multiple copies of the sound, one for each channel
            for (var i = 0; i < this.channels; i++) {
                var n = new Audio();
                n.preload = 'auto';

                // setup event handlers for this class -- we'll call the callbacks from there
                n.addEventListener("canplaythrough", this.onLoad.bind(this), false);
                n.addEventListener("error", this.onError.bind(this), false);
                n.onerror = this.onError.bind(this);
                n.onload = this.onLoad.bind(this);
                n.src = this.src;
                n.load();
                this.sounds.push(n);

                if (pc.device.isAppMobi)
                // force an onload for appmodi -- since it wont create one and the load is almost instant
                    this.onLoad(null);
            }
        },

        /**
         * Force this sound to be reloaded
         */
        reload: function () {
            this.loaded = false;
            this.errored = false;
            this.load();
        },

        onLoad: function (ev) {
            this.numLoaded++;

            // remove the event listener so we don't get this happening multiple times
            if (!pc.device.isAppMobi)
                ev.target.removeEventListener("canplaythrough", this.onLoad.bind(this), false);

            if (this.numLoaded == this.channels) {
                this.loaded = true;
                this.errored = false;
                if (this.onLoadCallback)
                    this.onLoadCallback(this);
            }
        },

        onError: function () {
            this.errored = true;
            this.loaded = false;
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Plays a sound
         * @param {Boolean} loop True if you want the sound to just keep looking.
         * @return {Object} Sound element that was played
         */
        play: function (loop) {
            if (!this.canPlay()) return null;

            // find a free channel and play the sound (if there is one free)
            for (var i = 0, len = this.sounds.length; i < len; i++) {
                if (this.sounds[i].paused || this.sounds[i].ended) {
                    if (loop)
                        this.sounds[i].loop = true;
                    this.sounds[i].play();
                    return this.sounds[i];
                }
            }

            // no sounds were free, so we just do nothing
            this.warn(this.name + ' - all channels are in use');
            return null;
        },

        /**
         * @return {Boolean} true if the sound can be played
         */
        canPlay: function () {
            return (this.loaded && pc.device.soundEnabled && !this.errored);
        }


    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Layer
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A layer is a container for drawing and processing game elements. Layer's are contained with a
 * <a href='pc.Scene'>pc.Scene</a> which automatically handles calling the process and draw methods.
 * <p>
 * You can use the pc.Layer class to create your own custom layers, though typically <a href='pc.TileLayer'>
 * pc.TileLayer</a> and <a href='pc.EntityLayer'>pc.EntityLayer</a> should be used for typical game levels.
 * <p>
 * To create your own custom level, derive from pc.Level and override the draw and process methods:
 * <pre><code>
 * // construct a scene and add it to the game
 * myGameScene = new GameScene();
 *
 * // create your own layer class
 * MyLayer = pc.Layer.extend('MyLayer',
 * {},
 * {
 *    // override draw to do custom layer drawing
 *    draw:function()
 *    {
 *       // draw a rectangle
 *       pc.device.ctx.fillStyle = '#fff';
 *       pc.device.ctx.fillRect(0, 0, 10, 10);
 *    }
 *
 *    // override process to update or change things
 *    process:function()
 *    { }
 * });
 *
 * // construct the custom layer and add it to the scene
 * var myLayer = new MyLayer('Test layer', 1);
 * myGameScene.addLayer(myLayer);
 * </code></pre>
 * <h5>Pause/Resume</h5>
 * Layers can be paused/resumed, which will stop drawing and processing of a layer.
 * <pre><code>
 * myLayer.pause();
 * myLayer.resume();
 * </code></pre>
 * <h5>Z-Order Drawing</h5>
 * Layers support z-order draw sorting within their scenes. To change the z-order, either construct the layer
 * using a zIndex parameter, or call setZIndex to change the draw order layer
 * <p>
 * <h5>Origins and Parallax</h5>
 * A layer has an optional origin that can be used to use the layer as a viewport into a large world.
 * By changing the origin you can pan and move a layer. You should then use screenX() and screenY() to
 * modify where an element is drawn relative to layer's current origin offset.
 * <p>
 * <pre><code>
 * draw:function()
 * {
 *    // draw a rectangle (at world coordinate 100, 100)
 *    pc.device.ctx.fillStyle = '#fff';
 *    pc.device.ctx.fillRect(this.screenX(100), this.screenY(100), 10, 10);
 * }
 *
 * // override process to update or change things
 * process:function()
 * {
 *    // pan the origin to the right by 1 pixel every cycle
 *    this.setOrigin( this.origin.x + 1, 0);
 * }
 * </code></pre>
 * <p>
 * To center a layer around a player object set its origin to position the player at half the viewport width
 * and height. This should be done on every game update:
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 * }
 * </pre></code>
 * <p>
 * You can achieve parallax effects by panning one layer at a different rate to others. For example, changing
 * the origin of a background layer at a ratio to the main layer (this is most commonly done in a scene.process method):
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 *
 *    // pan the background at 10% of the speed of the
 *    myBackgroundLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2) / 10,
 *       playerPos.y - (this.viewPort.h / 2) / 10);
 * }
 * </pre></code>
 * <p>
 * When you have many layers tracking a single origin it can be a pain to keep them all up to date, so to make life easier
 * you can have a layer automatically track another layer's origin, including a ratio for parallax effects:
 * <pre><code>
 * // Automatically keep the background layer's origin relative to myLayer's
 * // at a ratio of 10:1 (slow panning)
 * myBackgroundLayer.setOriginTrack( myLayer, 10 );
 * </code></pre>
 */

pc.Layer = pc.Base.extend('pc.Layer', {},
    /** @lends pc.Layer.prototype */
    {
        /** Name of the layer */
        name: null,
        /** whether the layer is presently paused */
        paused: false,
        /** whether the layer is active (isActive should be used over this as it also checks whether
         * the scene is active */
        active: false,
        /** the scene this layer is within */
        scene: null,
        /** draw order of this layer, lower draws first (use setZIndex method to change in order to update the scene) */
        zIndex: 0,
        /** offset all drawing by this x, y amount */
        offset: null,
        /** current origin track -- layer's origin will automatically match the origin of another layer */
        originTrack: null,
        /** ratio of origin tracking on X */
        originTrackXRatio: 1,
        /** ratio of origin tracking on Y */
        originTrackYRatio: 1,

        /**
         * World coordinate origin for this layer
         */
        origin: null,

        /**
         * @constructs pc.Layer
         * @param {String} name Name you want to give the layer
         * @param {Number} zIndex Draw order for this layer within it's scene (lower draws earlier)
         */
        init: function (name, zIndex) {
            this._super();

            this.name = name;
            this.origin = pc.Point.create(0, 0);
            this._worldPos = pc.Point.create(0, 0);
            this._screenPos = pc.Point.create(0, 0);
            this.zIndex = pc.checked(zIndex, 0);
            this.offset = pc.Point.create(0, 0);
            this.originTrack = null;
            this.originTrackXRatio = 0;
            this.originTrackYRatio = 0;
        },

        /**
         * @return {String} A nice string representation of the layer
         */
        toString: function () {
            return '' + this.name + ' (origin: ' + this.origin + ', zIndex: ' + this.zIndex + ')';
        },

        release: function () {
            this.origin.release();
        },

        /**
         * @return {Boolean} Is this layer active, and is it within a scene that is active
         */
        isActive: function () {
            if (this.scene != null)
                if (!this.scene.active) return false;
            return this.active;
        },

        /**
         * Make this layer active
         */
        setActive: function () {
            this.scene.setLayerActive(this);
        },

        /**
         * Make this layer inactive
         */
        setInactive: function () {
            this.scene.setLayerInactive(this);
        },

        /**
         * Change the z order drawing for this layer (lower draws earlier)
         * @param {Number} z index as a value > 0
         */
        setZIndex: function (z) {
            this.zIndex = z;
            if (this.scene)
                this.scene.sortLayers();
        },

        _worldPos: null, // cached temp

        /**
         * Gets the world position of a screen position.
         * @param {pc.Point} pos World position of this layer (cached, so you don't need to release it)
         * @param {pc.Point} [returnPos] Optional return point (so you can pass in a point to be set)
         */
        worldPos: function (pos, returnPos) {
            if (returnPos) {
                returnPos.x = pos.x + this.origin.x;
                returnPos.y = pos.y + this.origin.y;
                return this._worldPos;
            } else {
                this._worldPos.x = pos.x + this.origin.x;
                this._worldPos.y = pos.y + this.origin.y;
                return this._worldPos;
            }
        },

        /**
         * @param {Number} x X position in world co-ordinates
         * @return {Number} X position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenX: function (x) {
            return x + this.scene.viewPort.x - this.origin.x + this.offset.x;
        },

        /**
         * @param {Number} y Y position in world co-ordinates
         * @return {Number} Y position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenY: function (y) {
            return y + this.scene.viewPort.y - this.origin.y + this.offset.y;
        },

        /**
         * Adjust the offset for drawing the layer (think of it like the top left starting position for the layer
         * @param x
         * @param y
         */
        setOffset: function (x, y) {
            this.offset.x = x;
            this.offset.y = y;
        },

        /**
         * A layer uses whatever screen rectangle is defined by the scene it sits within,
         * so this is just a helper method (and makes it compliant for things like input checking)
         */
        getScreenRect: function () {
            return this.scene.getScreenRect();
        },

        /**
         * Draw the layer's scene. Use the scene's viewport and origin members to correctly position things.
         * Typical used for simple/custom layers with no entities or tiles.
         */
        draw: function () {
        },

        /**
         * Sets tracking for this origin to always follow the origin of another layer. The ratio can be used
         * to parallax the layer.
         * @param {pc.Layer} trackLayer Layer to track
         * @param {Number} [xRatio] Ratio to track horizontally (i.e. trackLayer.origin.x * xRatio)
         * @param {Number} [yRatio] Ratio to track vertically (i.e. trackLayer.origin.y * yRatio)
         */
        setOriginTrack: function (trackLayer, xRatio, yRatio) {
            this.originTrack = trackLayer;
            this.originTrackXRatio = pc.checked(xRatio, 1);
            this.originTrackYRatio = pc.checked(yRatio, 1);
        },

        /**
         * Sets the origin world point of the top left of this layer.
         * @param {Number} x Set offset origin for the layer to x
         * @param {Number} y Set offset origin for the layer to y
         */
        setOrigin: function (x, y) {
            if (this.origin.x == Math.round(x) && this.origin.y == Math.round(y))
                return false;
            this.origin.x = Math.round(x);
            this.origin.y = Math.round(y);
            return true;
        },

        /**
         * Process the layer (if you overide this method make sure you call this._super();
         */
        process: function () {
            if (this.originTrack) {
                this.setOrigin(this.originTrack.origin.x * this.originTrackXRatio,
                    this.originTrack.origin.y * this.originTrackYRatio);
            }
        },

        /**
         * Pauses this layer
         */
        pause: function () {
            this.paused = true;
        },

        /**
         * Resumes all active layers
         */
        resume: function () {
            this.paused = false;
        },

        /**
         * Called when the layer changes size (triggered by a browser or device resize event)
         * @param {Number} width New width of the underlying canvas
         * @param {Number} height New height of the underlying canvas
         */
        onResize: function (width, height) {
        },

        /**
         * Notification call when this layer has been added to a scene
         */
        onAddedToScene: function () {
        },

        /**
         * Notification call when this layer has been removed from a scene
         */
        onRemovedFromScene: function () {
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your layer to do something about it.
         * @param {String} actionName The name of the action that happened
         * @param {Object} event Raw event object
         * @param {pc.Point} pos Position, such as a touch input or mouse position
         * @param {pc.Base} uiTarget the uiTarget where the action occurred
         */
        onAction: function (actionName, event, pos, uiTarget) {
        }

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * An entity layer is a container for <a href='pc.Entity'>entities</a> and systems.
 * See the <a href='../guides/entitysystems'>entity systems</a> guide for more information on how components,
 * entities and systems work together.
 * <p>
 * An entity layer is constructed similarly to a regular layer, except it also has a distinct 'world' size
 * which can be referenced by systems.
 * <pre><code>
 * var entityLayer = new pc.EntityLayer('my entity layer', 10000, 10000);
 * </code></pre>
 * The entity layer will automatically construct both an <a href='pc.EntityManager'>pc.EntityManager</a> and a
 * <a href='pc.SystemManager'>pc.SystemManager</a>.
 * <p>
 * Once you have an entity layer created you will need to add it to the scene:
 * <pre><code>
 * myScene.addLayer(entityLayer);
 * </code></pre>
 * You can then add entities to the layer:
 * <pre><code>
 * // create a new entity (it will automatically be added to the
 * // entity layer specified in the constructor
 * var box = pc.Entity.create(entityLayer);
 * box.addComponent( pc.components.Rect.create({ color:#ffffff }) );
 * </code></pre>
 * Entity layers are driven by systems, which must be added to the layer in order for anything to happen.
 * When you add components to an entity, you must also remember to add the corresponding system to the layer where
 * the entity exists. You can see which systems are required for components in the "used by" list in the component
 * API documentation.
 * <p>
 * To add a system, just construct it and call addSystem:
 * <pre><code>
 * // fire up the systems we need for the game layer
 * entityLayer.addSystem(new pc.systems.Physics());
 * entityLayer.addSystem(new pc.systems.Particles());
 * entityLayer.addSystem(new pc.systems.Effects());
 * entityLayer.addSystem(new pc.systems.Render());
 * </code></pre>
 *
 */
pc.EntityLayer = pc.Layer.extend('pc.EntityLayer',
    /** @lends pc.EntityLayer */
    {
        /**
         * Creates an entity layer from a TMX layer XML data resource
         * @param {String} scene
         * @param {String} groupXML
         * @param {pc.EntityFactory} entityFactory
         */
        loadFromTMX: function (scene, groupXML, entityFactory, worldSizeX, worldSizeY) {
            var layerName = groupXML.getAttribute('name');

            // create the new layer and add it to the scene - when you have the name
            var n = new pc.EntityLayer(layerName, worldSizeX, worldSizeY, entityFactory);
            scene.addLayer(n);

            // Parse object xml instances and turn them into entities
            // XML = <object type="EnemyShip" x="2080" y="256" width="32" height="32"/>
            var objs = groupXML.getElementsByTagName('object');
            for (var i = 0; i < objs.length; i++) {
                var objData = objs[i];
                var entityType = null;
                var x = parseInt(objData.getAttribute('x'));
                var y = parseInt(objData.getAttribute('y'));
                var w = parseInt(objData.getAttribute('width'));
                var h = parseInt(objData.getAttribute('height'));
                var shape = null;

                // either it's a polygon shape, or it's a rectangle (has w and h)
                var polygon = objData.getElementsByTagName("polygon");
                if (polygon.length > 0) {
                    var pointsString = polygon[0].getAttribute('points');
                    var points = [];
                    var pairs = pointsString.split(' ');
                    for (var j = 0; j < pairs.length; j++) {
                        var nums = pairs[j].split(',');
                        points.push([parseInt(nums[0]), (parseInt(nums[1]))]);
                    }
                    shape = pc.Poly.create(x, y, points);
                }
                else {
                    // plain rectangle (just need the width and height)
                    shape = pc.Dim.create(w, h);
                }

                // parse parameters into options
                var options = {};
                var ps = objData.getElementsByTagName("properties");

                if (ps.length) {
                    var props = ps[0].getElementsByTagName("property");
                    for (var p = 0; p < props.length; p++) {
                        var name = props[p].getAttribute("name");
                        var value = props[p].getAttribute("value");
                        options[name] = value;
                        if (name === 'entity')
                            entityType = value;
                    }
                }

                // create a new entity
                // ask the entity factory to create entity of this type and on this layer
                //
                if (entityType)
                    entityFactory.createEntity(n, entityType, x, y, 0, shape, options);
                else
                    this.warn('Entity loaded from map with no "entity" type property set. x=' + x + ' y=' + y)
            }

        }

    },
    /** @lends pc.EntityLayer.prototype */
    {
        /** Size of the world */
        worldSize: null,

        /** Entity manager for this layer */
        entityManager: null,

        /** System manager for this layer */
        systemManager: null,

        /**
         * @param {String} name Name of the layer
         * @param {Number} worldSizeX X size of the world in pixels
         * @param {Number} worldSizeY Y size of the world in pixels
         * @param {pc.EntityFactory} entityFactory Optional factory class to use to construct entities (primarily
         * used by level loaders to create entities specified in map files.
         */
        init: function (name, worldSizeX, worldSizeY, entityFactory) {
            this._super(name);
            this.entityFactory = entityFactory;
            this.systemManager = new pc.SystemManager(this);
            this.entityManager = new pc.EntityManager(this);

            this.worldSize = pc.Dim.create(pc.checked(worldSizeX, 10000), pc.checked(worldSizeY, 10000));
        },

        /**
         * Sets the origin for the layer
         * @param {Number} x x origin to set
         * @param {Number} y y origin to set
         * @return {Boolean} Whether the origin actually changed (was it already set to the passed in origin)
         */
        setOrigin: function (x, y) {
            var didChange = this._super(x, y);
            if (didChange)
                this.systemManager.onOriginChange(x, y);
            return didChange;
        },

        /**
         * Get the entity manager for this layer
         * @return {pc.EntityManager}
         */
        getEntityManager: function () {
            return this.entityManager;
        },

        /**
         * Get the system manager for this layer
         * @return {pc.SystemManager}
         */
        getSystemManager: function () {
            return this.systemManager;
        },

        /**
         * Add a system to the layer
         * @param {pc.systems.System} system The system to add to the layer
         */
        addSystem: function (system) {
            this.systemManager.add(system, this.entityManager);
        },

        /**
         * Gets all the systems that can handle a given component type, such as 'physics'
         * @param {String} componentType Type of component to match
         * @return {pc.LinkedList} Linked list of systems that match
         */
        getSystemsByComponentType: function (componentType) {
            return this.systemManager.getByComponentType(componentType);
        },

        /**
         * Removes a system from this layer's system manager
         * @param {pc.systems.System} system The system to remove
         */
        removeSystem: function (system) {
            this.systemManager.remove(system);
        },

        /**
         * Master process for the layer
         */
        process: function () {
            this._super();
            this.systemManager.processAll();
            this.entityManager.cleanup();
        },

        /**
         * Called automatically when the viewport is changing size.
         * @param {Number} width Width to resize to
         * @param {Number} height Height to resize to
         */
        onResize: function (width, height) {
            this.systemManager.onResize(width, height);
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Entity
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Entities are the primary 'things' that are in a game. They serve as the primary container for components.
 * <p>
 * To add an entity to a game you must place it within an <a href='pc.EntityLayer'>entity layer</a>.
 * <p>
 * <pre><code>
 * var entityLayer = new pc.EntityLayer('my entity layer', 10000, 10000);
 * </code></pre>
 * <p>
 * You can then construct an entity by allocating it from the entity pool, and assigning it to the layer:
 * <pre><code>
 * var newEntity = pc.Entity.create(entityLayer);
 * </code></pre>
 * <h5>Components</h5>
 * To add functionality to the entity, you need to add components. Components are discreet bits of functionality
 * you can use across many entities. A spaceship for example, might have a sprite component for the artwork, a spatial
 * component (where it is in the world), an input handling component and a physics component. All of these components
 * combine together let you create an awesome flying menace.
 * <p>
 * For example, to create a simple entity that consists of a red box, we add two components, one for the spatial (its
 * position and dimensions), and one to indicate we want to draw a rectangle.
 * <pre><code>
 * // add a spatial component
 * box.addComponent( pc.components.Spatial.create({ x:100, y: 100, w:50, h:50 }) );
 *
 * // add a red rectangle
 * box.addComponent( pc.components.Rect.create({ color:'#ff2222' }) );
 * </code></pre>
 * <h5>Tagging</h5>
 * Entities can be tagged and searched for. You can add multiple tags to a single entity to categorize it in different
 * ways. Tags are the primary way you should 'type' an entity - as opposed to using a class hierarchy.
 * <p>
 * To add a tag an entity use:
 * <pre><code>
 * entity.addTag('enemy');
 * entity.addTag('monster');
 * </code></pre>
 * You can then grab all entities in a layer that have a tag:
 * <pre><code>
 * entityLayer.entityManager.getTagged('enemy'); // return a pc.LinkedList
 * </code></pre>
 * You can remove a tag:
 * <pre><code>
 * entity.removeTag('monster');
 * </code></pre>
 * And quickly test if an entity has a tag:
 * <pre><code>
 * entity.hasTag('enemy') == true;
 * </code></pre>
 * And finally, you can inspect all the tags an entity has by looking at the tags member:
 * <pre><code>
 * entity.tags[0] === 'enemy';
 * </code></pre>
 */

pc.Entity = pc.Pooled.extend('pc.Entity',
    /** @lends pc.Entity */
    {
        /**
         * Constructs an entity by acquiring it from the object pool
         * @param {pc.Layer} layer Layer the entity should be added to
         * @return {pc.Entity} A pc.Entity
         */
        create: function (layer) {
            var n = this._super();
            if (!layer) throw 'Entity requires a valid layer to be placed on';
            if (!layer.Class.isA) throw 'Entity requires a valid layer to be placed on';
            if (!layer.Class.isA('pc.EntityLayer')) throw 'Entities can only be placed on pc.EntityLayer objects';
            n.config(layer);
            return n;
        }
    },
    /** @lends pc.Entity.prototype */
    {
        /** layer this entity is on */
        layer: null,
        /** array of strings representing the tags this entity has (read-only) */
        tags: [],
        /** whether this entity is presently active (read-only) */
        active: true,

        _componentCache: null,  // cache of components for entity -- not to be used for anything but speed reading

        /**
         * Constructs a new entity by acquiring it from the object pool
         * @param {pc.Layer} layer Layer the entity should be added to
         */
        init: function (layer) {
            this._super();
            this.tags = [];
            this.layer = null;
            this.active = true;
            this._componentCache = new pc.Hashmap();
            if (pc.valid(layer))
                this.config(layer);
        },

        /**
         * Configures an entity with the given layer (typically this is called by create or init and does not
         * need to be called directly.
         * @param {pc.EntityLayer} layer Layer to add the entity too
         */
        config: function (layer) {
            this.layer = layer;
            this.active = true;
            layer.entityManager.add(this);
        },

        /**
         * Releases the entity back into the object pool. Should not be used directly unless you know what you're
         * doing. Use entity.remove for most sitations.
         */
        release: function () {
            this.tags.length = 0;
            this.active = false;
            this._componentCache.clear();
            this._super();
        },

        /**
         * Add a tag to the entity - actually just a pass through function to entity.layer.entityManager.addTag
         * @param {String} tag Tag to add to the entity.
         */
        addTag: function (tag) {
            this.layer.entityManager.addTag(this, tag);
        },

        /**
         * Tests if this entity has a given tag
         * @param {String} tag The tag to look for
         * @return {Boolean} true if the tag exists on this entity
         */
        hasTag: function (tag) {
            for (var i = 0; i < this.tags.length; i++)
                if (this.tags[i].toLowerCase() === tag.toLowerCase()) return true;
            return false;
        },

        /**
         * Removes a tag from an entity
         * @param {String} tag Tag to remove
         */
        removeTag: function (tag) {
            this.layer.entityManager.removeTag(this, tag);
        },

        /**
         * Add a component to this entity
         * @param {pc.components.Component} component Component to add
         * @return {pc.components.Component} Component that was added
         */
        addComponent: function (component) {
            return this.layer.entityManager.addComponent(this, component);
        },

        /**
         * Remove a component from the entity
         * @param {pc.components.Component} component Component to remove
         */
        removeComponent: function (component) {
            this.layer.entityManager.removeComponent(this, component);
        },

        /**
         * Remove the component of a given type
         * @param {String} componentType Component type to remove (e.g. 'physics')
         */
        removeComponentByType: function (componentType) {
            this.removeComponent(this._componentCache.get(componentType));
        },

        /**
         * Retrieves a reference to a component on the entity using a given type
         * @param {String} componentType Type string of the component to get
         * @return {pc.components.Component} The component matching the type
         */
        getComponent: function (componentType) {
            return this._componentCache.get(componentType);
        },

        /**
         * Get the components in this entity
         * @return {pc.Hashtable} A hashtable of component objects keyed by component type
         */
        getAllComponents: function () {
            // use internal cache for speed
            return this._componentCache;
            //return this.layer.entityManager.getComponents(this);
        },

        /**
         * Get an array containing strings of all the types of components on this entity
         * @return {Array} Array of strings with all the component types
         */
        getComponentTypes: function () {
            // todo: could optimize this if required by caching the types as well (instead of generating
            // an array on every check. Don't think it's used very often though.
            return this._componentCache.keys();
        },

        /**
         * Check whether the entity has a component of a given type
         * @param {String} componentType Component type to check for
         * @return {Boolean} true if a component with the given type is on the entity
         */
        hasComponentOfType: function (componentType) {
            return this._componentCache.hasKey(componentType);
            //return this.layer.entityManager.hasComponentOfType(this, componentType);
        },

        /**
         * Remove this entity from the layer
         */
        remove: function () {
            this.layer.entityManager.remove(this);
        },

        // INTERNALS
        _handleComponentRemoved: function (component) {
            this._componentCache.remove(component.getType());
        },

        _handleComponentAdded: function (component) {
            this._componentCache.put(component.getType(), component);
        }



    });


/**
 * EntityFactory -- for creating entities (mostly just an interface class you extend from to create an entity factory).
 */
pc.EntityFactory = pc.Base.extend('pc.EntityFactory',
    { },
    {
        /**
         * Called by the entity loader
         * @param {pc.Layer} layer Layer the entity should be placed on
         * @param {String} type String type of the entity to create
         * @param {Number} x X position
         * @param {Number} y Y position
         * @param {Number} dir Facing angle
         * @param {Object} shape Collision shape (either pc.Dim for rectangle or pc.Poly for polygons)
         * @param {Object} options Properties assigned to the entity
         */
        createEntity: function (layer, type, x, y, dir, shape, options) {
        }
    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sprite
 * @description
 * [Extends <a href='pc.Sprite'>pc.Pooled</a>]
 * <p>
 * Sprites are instances of a sprite sheet used for rendering.
 * <p>
 * To create a sprite, pass a sprite sheet into the constructor:
 * <pre><code>
 * var zombieSprite = new pc.Sprite( zombieSpriteSheet );
 * </code></pre>
 * You can then use setAnimation to select an animation from the sheet:
 * <pre><code>
 * zombieSprite.setAnimation('attacking right');
 * </code></pre>
 * To draw the sprite, use the draw method:
 * <pre><code>
 * zombieSprite.draw(pc.device.ctx, 100, 100);
 * </code></pre>
 * To cycle animations, call update:
 * <pre><code>
 * zombieSprite.update(pc.device.elapsed);
 * </code></pre>
 * <p>
 * Check the <a href='http://playcraftlabs.com/develop/guide/spritesandanimation'>sprites and animation guide</a> for
 * more information and features.
 */

pc.Sprite = pc.Pooled.extend('pc.Sprite',
    /** @lends pc.Sprite */
    {
        /**
         * Construct a new sprite object by acquiring it from the free pool and configuring it
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to use
         * @return {pc.Sprite} A sprite object
         */
        create: function (spriteSheet) {
            var n = this._super();
            n.config(spriteSheet);
            return n;
        }
    },
    /** @lends pc.Sprite.prototype */
    {
        /** Current animation frame */
        currentFrame: 0,
        /** Current animation object reference */
        currentAnim: null,
        /** pc.SpriteSheet used by this sprite */
        spriteSheet: null,
        /** speed different this instance uses, versus the animation speed */
        animSpeedOffset: 0,
        /** Name of the current animation */
        currentAnimName: null,
        /** Alpha level */
        alpha: 1,
        /** X-scale for drawing */
        scaleX: 1,
        /** Y-scale for drawing */
        scaleY: 1,
        /** Whether the sprite is active; false = not drawn or updated */
        active: true,
        /** Whether the sprite is held. Won't progress on animation, but will still draw */
        hold: false,
        /** Number of times the animation has played */
        loopCount: 0,
        /** Current composite drawing operation to use */
        compositeOperation: null,

        _acDelta: 0,

        /**
         * Constructs a new sprite using the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to use
         */
        init: function (spriteSheet) {
            this._super();
            this.config(spriteSheet);
        },

        /**
         * Configure the sprite object with a given sprite sheet - typically called by init or create
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to configure with
         */
        config: function (spriteSheet) {
            this.spriteSheet = pc.checked(spriteSheet, null);
            if (this.spriteSheet)
                this.reset();
        },

        /**
         * Clear the sprite back to a starting state (using first animation)
         */
        reset: function () {
            this.currentFrame = 0;
            this.alpha = 1;
            this.loopCount = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.active = true;
            this.hold = false;
            if (this.spriteSheet.animations.size() > 0) {
                this.currentAnim = this.spriteSheet.animations.get(this.spriteSheet.animations.keys()[0]);
                this.currentFrame = 0;

            } else
                this.currentAnim = null;
        },

        /**
         * Change the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to change to
         */
        setSpriteSheet: function (spriteSheet) {
            this.spriteSheet = spriteSheet;
            this.reset();
        },

        /**
         * Change the drawing scale of this sprite instance
         * @param {Number} scaleX x-scale to use
         * @param {Number} scaleY y-scale to use
         */
        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the composite drawing operation for this sprite. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation to use
         */
        setCompositeOperation: function (o) {
            this.compositeOperation = o;
        },

        /**
         * Draw the sprite using the given context at a given location, and a certain direction
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} dir Direction to draw it at
         */
        draw: function (ctx, x, y, dir) {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            this.spriteSheet.draw(ctx, this, x, y, dir);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Draws a single frame of the current sprite sheet
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} frameX The frame to draw (x)
         * @param {Number} frameY The frame to draw (y)
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} angle Direction to draw it at
         */
        drawFrame: function (ctx, frameX, frameY, x, y, angle) {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            this.spriteSheet.drawFrame(ctx, frameX, frameY, x, y, angle);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Updates the sprite animation based on the time elapsed
         * @param {Number} elapsed Amount of time to move the animation forward by
         */
        update: function (elapsed) {
            if (this.currentAnim == null || !this.active || this.hold) return;

            // call the spritesheet class to actually do a sprite update, keep in mind though that the spritesheet
            // doesn't retain any present state, it just sets the state object, which in this case is passed in as the
            // this param -- this is so spritesheets (and the underlying image) may be used by more than one sprite
            // at the same time
            this.spriteSheet.update(this, elapsed);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param {String} name Key name of the animation to switch to.
         * @param {Number} speedOffset allows you to modify the animation speed for this instance of a sprite
         * @param {Number} force Restart the animation, even if this is the currently playing animation (default is true)
         */
        setAnimation: function (name, speedOffset, force) {
            var f = pc.checked(force, true);
            if (!f)
                if (this.currentAnim.name === name) return;

            this.currentAnim = this.spriteSheet.animations.get(name);
            this.currentFrame = 0;
            this.loopCount = 0;
            this.active = true;
            this.held = false;
            this.animSpeedOffset = pc.checked(speedOffset, 0);
            this.currentAnimName = name;
        },

        /**
         * Changes the speed of animation by the given offset. Good for randomizing when you have lots of the same
         * sprite on-screen
         * @param {Number} speedOffset Time in ms to offset by (can be negative to slow an animation down)
         */
        setAnimationSpeedOffset: function (speedOffset) {
            this.animSpeedOffset = speedOffset;
        },

        /**
         * Changes the current frame
         * @param {Number} frame Frame to change to
         */
        setCurrentFrame: function (frame) {
            this.currentFrame = frame;
        },

        /**
         * Returns the name of the current animation
         * @return {String} Current animation name
         */
        getAnimation: function () {
            return this.currentAnimName;
        },

        /**
         * Changes the draw alpha for the sprite
         * @param {Number} a Alpha level to change to (0.5 = 50% transparent)
         */
        setAlpha: function (a) {
            this.alpha = a;
        },

        /**
         * Adds to the current alpha level
         * @param {Number} a Amount to add
         */
        addAlpha: function (a) {
            this.alpha += a;
            if (this.alpha > 1) this.alpha = 1;
        },

        /**
         * Subtracts from the current alpha level
         * @param {Number} a Amount to subtract
         */
        subAlpha: function (a) {
            this.alpha -= a;
            if (this.alpha < 0) this.alpha = 0;
        }


    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.SpriteSheet
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Spritesheets are a tool used to configure an image into being a sprite. A spritesheet defines the frame size,
 * source placement and the animations that make up a sprite.
 * <p>
 * To create an on-screen sprite you need to setup a sprite sheet template, then construct a pc.Sprite object
 * using the sheet.
 * <p>
 * To create a sprite sheet you must first load an image resource using the resource loader. You can then use that
 * to construct a sprite sheet:
 * <p>
 * <pre><code>
 * // grab the zombie image resource from the loader
 * var zombieImage = pc.device.loader.get('zombie').resource;
 *
 * // create the spritesheet
 * var zombieSpriteSheet = new pc.SpriteSheet(
 *      { image:zombieImage, frameWidth:80, frameHeight:72 });
 * </code></pre>
 * The sprite sheet class is pretty flexible in how you define the frames. You can actually just specify the number of
 * frames wide and high the sheet is and it will figure our the frame size for you.
 * <p>
 * <h5>Adding Animations</h5>
 * To define the walk animation for the zombie, you just use addAnimation:
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'walking right', frameCount:16, time:1400 });
 * </code></pre>
 * Here we've defined an animation with the tag 'walking right', a frame count of 16 and a total animation time of 1400.
 * <p>
 * Notice we didn't say where in the image the frames start, that's because the default starting frame is 0 for both
 * x and y.
 * <p>
 * To specify a starting frame use the frameX and frameY options.
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'attacking right', frameX: 0, frameY: 2, frameCount:16, time:500 });
 * </code></pre>
 * In this case, the attack animation starts at frame 0 on the x-axis, and the 3rd frame down. It is then 16 frames
 * long.
 * <h5>Making Sprites</h5>
 * To make an actual sprite you can draw on the screen, use the <a href='pc.Sprite'>pc.Sprite</a> class.
 */

pc.SpriteSheet = pc.Base.extend('pc.SpriteSheet',
    /** @lends pc.SpriteSheet */
    {},
    /** @lends pc.SpriteSheet.prototype */
    {
        /** The source pc.Image resource */
        image: null,
        /** width of each frame (read-only) */
        frameWidth: 0,
        /** height of each frame (read-only) */
        frameHeight: 0,
        /** number of frames wide the sheet is (read-only) */
        framesWide: 1,
        /** number of frames high the sheet is (read-only) */
        framesHigh: 1,
        /** X scale to draw the image at */
        scaleX: 1,
        /** Y scale to draw the image at */
        scaleY: 1,
        /** source x position where frames start in the image */
        sourceX: 0,
        /** source y position where frames start in the image */
        sourceY: 0,
        /** alpha level to draw the image at */
        alpha: 1,
        /** whether rotation should be used, or ignored when rendering frames */
        useRotation: false,
        /** composite drawing operation */
        compositeOperation: null,
        /** total number of frames (read-only) */
        totalFrames: 0,
        /** Hashtable of animations keyed by animation name */
        animations: null,

        frameOffsetX: 0,
        frameOffsetY: 0,

        _frameXPos: null,
        _frameYPos: null,

        /**
         * Constructs a new sprite sheet with options. You can use either framesWide or frameWidth, and the logical
         * default will be assumed. Frame width is assumed to be image.width / framesWide or frames wide will default to
         * image.width/frameWidth.
         * @param {pc.Image} options.image Image to use for the sheet
         * @param {Number} options.framesWide Number of frames wide the sprite sheet is
         * @param {Number} options.framesHigh Number of frames high the sprite sheet is
         * @param {Number} options.frameHeight Height of each frame in pixels
         * @param {Number} options.frameWidth Width of each frame in pixels
         * @param {Number} options.scaleX X Scale to draw the image at
         * @param {Number} options.scaleY Y Scale to draw the image at
         * @param {Number} options.sourceX Source x position in the image
         * @param {Number} options.sourceY Source y position in the image
         * @param {Number} options.frameOffsetX Offset frame drawing on the x-axis
         * @param {Number} options.frameOffsetY Offset frame drawing on the y-axis
         * @param {Number} options.alpha Alpha level to draw the image at (0.5 is 50% visible)
         * @param {Boolean} options.useRotation True means the canvas rotation will be used to draw images as an angle
         */
        init: function (options) {
            this._super();

            if (pc.checked(options.image))
                this.image = options.image;
            else
                throw "No image supplied";

            if (!this.image.width || !this.image.height)
                throw "Invalid image (zero width or height)";

            if (!pc.valid(options.frameWidth)) {
                if (pc.valid(options.framesWide) && options.framesWide > 0)
                    this.frameWidth = Math.floor(this.image.width / options.framesWide);
                else
                    this.frameWidth = this.image.width;
            } else
                this.frameWidth = options.frameWidth;

            if (!pc.valid(options.frameHeight)) {
                if (pc.valid(options.framesHigh) && options.framesHigh > 0)
                    this.frameHeight = Math.floor(this.image.height / options.framesHigh);
                else
                    this.frameHeight = this.image.height;
            } else
                this.frameHeight = options.frameHeight;

            this.framesWide = Math.floor(pc.checked(options.framesWide, this.image.width / this.frameWidth));
            this.framesHigh = Math.floor(pc.checked(options.framesHigh, this.image.height / this.frameHeight));
            this.scaleX = pc.checked(options.scaleX, 1);
            this.scaleY = pc.checked(options.scaleY, 1);
            this.sourceX = pc.checked(options.sourceX, 0);
            this.sourceY = pc.checked(options.sourceY, 0);
            this.frameOffsetX = pc.checked(options.frameOffsetX, 0);
            this.frameOffsetY = pc.checked(options.frameOffsetY, 0);
            this.alpha = pc.checked(options.alpha, 1);
            this.useRotation = pc.checked(options.useRotation, true);

            this.totalFrames = this.framesWide * this.framesHigh;
            this.animations = new pc.Hashtable();

            // pre-calcs for speed
            this._frameXPos = [];
            for (var fx = 0; fx < this.framesWide; fx++)
                this._frameXPos.push(fx * this.frameWidth);
            this._frameYPos = [];
            for (var fy = 0; fy < this.framesHigh; fy++)
                this._frameYPos.push(fy * this.frameHeight);
        },

        /**
         * Defines an animation
         * @param {String} options.name A descriptive name for the animation (required)
         * @param {Number} options.frameX The starting frame X position (in frames, not pixels) defaults to 0
         * @param {Number} options.frameY The starting frame Y position (in frames, not pixels) defaults to 0
         * @param {Number} options.frames A 2d-array of frame numbers ([ [0, 0], [0, 1] ]) , note these are OFFSET by frameX and frameY. Use null
         * to automatically sequence through all frames across the image, or specify frame count
         * @param {Number} options.frameCount number of frames to use, starting from frameX, frameY and stepping forward across the spritesheet
         * @param {Number} options.time Seconds to loop through entire sequence defaults to 1000
         * @param {Number} options.loops Number of times to cycle through this animation, use 0 to loop infinitely (defaults to 0)
         * @param {Boolean} options.holdOnEnd Whether to hold the last frame when the animation has played through
         * @param {Number} options.scaleX X scaling to apply (negative values reverse the image)
         * @param {Number} options.scaleY Y scaling to apply (negative values reverse the image)
         * @param {Number} options.framesWide Number of frames to go across before stepping down
         * @param {Number} options.framesHigh Number of frames down
         */
        addAnimation: function (options) {
            if (!pc.valid(options.name)) throw "Animation requires a name for reference";

            options.frameX = pc.checked(options.frameX, 0);
            options.frameY = pc.checked(options.frameY, 0);
            options.directions = pc.checked(options.directions, 1);
            options.time = pc.checked(options.time, 1000);
            options.loops = pc.checked(options.loops, 0);
            options.holdOnEnd = pc.checked(options.holdOnEnd, false);
            options.dirAcross = pc.checked(options.dirAcross, false);
            options.scaleX = pc.checked(options.scaleX, 1);
            options.scaleY = pc.checked(options.scaleY, 1);
            options.offsetX = pc.checked(options.offsetX, 0);
            options.offsetY = pc.checked(options.offsetY, 0);
            options.framesWide = pc.checked(options.framesWide, this.framesWide);
            options.framesHigh = pc.checked(options.framesHigh, this.framesHigh);
            options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);

            if (options.frameCount == 0) {
                options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);
            }

            // no frames specified, create the frames array automagically
            if (!pc.valid(options.frames)) {
                var frameStart = options.frameX + (options.frameY * options.framesWide);
                options.frames = [];
                // use the frameCount and frameX, frameY
                for (var frame = frameStart; frame < frameStart + options.frameCount; frame++) {
                    options.frames.push([frame % options.framesWide, Math.floor(frame / options.framesWide) ]);
                }
            }

            options.frameRate = (options.time / options.frames.length);
            options.degreesPerDir = (360 / options.directions);

            this.animations.put(options.name, options);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param name Key name of the animation to switch to.
         */
        setAnimation: function (state, name, speedOffset) {
            state.currentAnim = this.animations.get(name);
            if (state.currentAnim == null)
                this.warn('attempt to set unknown animation [' + name + ']');
            state.currentFrame = 0;
            state.held = false;
            state.animSpeedOffset = pc.checked(speedOffset, 0);
        },

        /**
         * Checks if this sheet has an animation of a given name
         * @param {String} name Animation name
         * @return {Boolean} true if the animation exists on this sheet
         */
        hasAnimation: function (name) {
            return (this.animations.get(name) != null);
        },

        /**
         * Sets the scale to draw the image at
         * @param {Number} scaleX Value to multiply the image width by (e.g. width * scaleX)
         * @param {Number} scaleY Value to multiply the image height by (e.g. height * scaleX)
         */
        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this sprite sheet. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation
         */
        setCompositeOperation: function (o) {
            this.compositeOperation = o;
        },

        dirTmp: 0,

        /**
         * Draw a sprite using a frame from the sprite sheet
         * @param {pc.Sprite} state Sprite to draw
         * @param {Number} x On-screen x position
         * @param {Number} y On-screen y position
         * @param {Number} dir The facing direction (in degrees)
         */
        draw: function (ctx, state, x, y, dir) {
            if (!this.image.loaded || state == null || !state.active) return;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (state.alpha != 1)
                this.image.alpha = state.alpha;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            if (state.currentAnim == null) {
                if (this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(this.scaleX, this.scaleY);

                this.image.draw(ctx,
                    this.sourceX + this._frameXPos[state.currentFrame % this.framesWide],
                    this.sourceY + this._frameYPos[Math.floor(state.currentFrame / this.framesWide)],
                    Math.round(x + this.frameOffsetX), Math.round(y + this.frameOffsetY),
                    this.frameWidth, this.frameHeight,
                    this.useRotation ? dir : 0);
            } else {
                var fx = 0;
                var fy = 0;

                if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);

                if (this.useRotation) {
                    // rotation/direction drawing is done using canvas rotation (slower)
                    fx = state.currentAnim.frames[state.currentFrame][0];
                    fy = state.currentAnim.frames[state.currentFrame][1];

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx],
                        this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x) + this.frameOffsetX,
                        state.currentAnim.offsetY + pc.Math.round(y) + this.frameOffsetY, this.frameWidth, this.frameHeight, dir);
                }
                else {
                    // rely on the sprite images to draw rotation

                    this.dirTmp = Math.round(dir / state.currentAnim.degreesPerDir);

                    if (this.dirTmp > state.currentAnim.directions - 1) this.dirTmp = 0; // accommodate the edge case causing by rounding back

//                if (!state.currentAnim.dirAcross)
//                {
//                    fx = this.dirTmp + state.currentAnim.frameX;
//                    fy = state.currentAnim.frames[state.currentFrame][0] + state.currentAnim.frameY;
//                } else
                    {
                        fx = state.currentAnim.frames[state.currentFrame][1] + this.dirTmp;
                        fy = state.currentAnim.frames[state.currentFrame][0];
                    }

                    if (state.currentAnim.directions == 1) {
                        fy = state.currentAnim.frames[state.currentFrame][1];
                        fx = state.currentAnim.frames[state.currentFrame][0];
                    }

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx], this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x) + this.frameOffsetX,
                        state.currentAnim.offsetY + pc.Math.round(y) + this.frameOffsetY,
                        this.frameWidth, this.frameHeight);

                    if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                        this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);
                }

            }

            // restore scaling (as images can be used amongst spritesheets, we need to be nice)
            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);

            // set the alpha back to normal
            if (state.alpha != 1)
                this.image.alpha = 1;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');

        },

        /**
         * Draw a single frame from the sprite sheet
         * @param {Context} ctx Device context to draw on
         * @param {Number} frameX The x-pos of the frame to draw
         * @param {Number} frameY The y-pos of the frame to draw
         * @param {Number} x x-pos to draw on the target context
         * @param {Number} y y-pos to draw on the target context
         * @param {Number} angle Angle to draw the frame at
         */
        drawFrame: function (ctx, frameX, frameY, x, y, angle) {
            if (!this.image.loaded) return;
            if (this.alpha < 1) ctx.globalAlpha = this.alpha;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            this.image.draw(ctx,
                this.sourceX + this._frameXPos[frameX],
                this.sourceY + this._frameYPos[frameY],
                pc.Math.round(x) + this.frameOffsetX,
                pc.Math.round(y) + this.frameOffsetY,
                this.frameWidth, this.frameHeight, angle);

            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);
            if (this.alpha < 1) ctx.globalAlpha = 1;
            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');
        },

        /**
         * Draw all the frames of a sprite sheet according to the image and parameters you set it
         * up with. Primarily this is intended for debugging or sprite testing.
         * @param {Context} ctx Context to draw on
         * @param {Number} x Starting x position to draw on the given context
         * @param {Number} y Starting y position to draw on the given context
         */
        drawAllFrames: function (ctx, x, y) {
            for (var fy = 0; fy < this.framesHigh; fy++)
                for (var fx = 0; fx < this.framesWide; fx++)
                    this.drawFrame(ctx, fx, fy, x + (fx * this.frameWidth), y + (fy * this.frameHeight));
        },

        /**
         * Update the sprite based on the current animation, frame and timing. Typically called automatically
         * from the sprite class
         * @param {pc.Sprite} state Sprite to update
         * @param {Number} delta Amount of time to move forward by
         */
        update: function (state, delta) {
            if (state.currentAnim == null || !state.active || state.held) return;

            // see if enough time has past to increment the frame count
            if (state.currentAnim.frames.length <= 1) return;

            if (state._acDelta > (state.currentAnim.frameRate + state.animSpeedOffset)) {
                state.currentFrame++;
                if (state.currentFrame >= state.currentAnim.frames.length) {
                    state.loopCount++;
                    // checked if we have looped the animation enough times
                    if (state.currentAnim.loops) // 0 means loop forever
                        if (state.loopCount >= state.currentAnim.loops) {
                            if (state.currentAnim.holdOnEnd) {
                                state.held = true;
                                if (state.currentFrame) state.currentFrame--;
                            }
                            else
                                state.active = false;
                        }

                    if (!state.held) state.currentFrame = 0; // take it from the top
                }
                state._acDelta -= state.currentAnim.frameRate;
            } else {
                state._acDelta += delta;
            }
        },

        /**
         * Clear the sprite by nulling the image and animations
         */
        reset: function () {
            this.image = null;
            this.animations = null;
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Math
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of math tools you can use. This is a static class, so you do not need to construct it, and all
 * methods/members are accessed using pc.Math.
 */
pc.Math = pc.Base('pc.Math',
    /** @lends pc.Math */
    {
        /** Quick lookup to convert radians to degrees */
        RADIAN_TO_DEGREE: (180 / Math.PI),
        /** Quick lookup to convert degrees to radians */
        DEGREE_TO_RADIAN: (Math.PI / 180),
        /** Quick lookup for Math.PI */
        PI: Math.PI,

        /** Quick lookup for Math.round */
        round: Math.round,
        /** Quick lookup for Math.random */
        random: Math.random,
        /** Quick lookup for Math.floor */
        floor: Math.floor,

        /**
         * Find the square of a number
         * @param {Number} number The square of the number
         */
        sqr: function (number) {
            return number * number;
        },

        /**
         * Returns a random integer within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
         * If you need a float random use randFloat.
         * @param {Number} min the start of the range
         * @param {Number} max the end of the range
         * @returns {Number} A random number between (and including) the range
         */
        rand: function (min, max) {
            return pc.Math.round((pc.Math.random() * (max - min)) + min);
        },

        /**
         * Returns a random float within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
         * @param {Number} min the start of the range
         * @param {Number} max the end of the range
         * @returns {Number} A random number between (and including) the range
         */
        randFloat: function (min, max) {
            return (pc.Math.random() * (max - min)) + min;
        },

        /**
         * Rotates a given angle by an amount in degrees
         * @param {Number} angle Original angle
         * @param {Number} by Amount to add in degrees (can be negative)
         * @return {Number} A new angle, rotated by the amount given
         */
        rotate: function (angle, by) {
            var newDir = angle + by;
            while (newDir > 359)
                newDir -= 360;
            while (newDir < 0)
                newDir = 360 + newDir;
            return newDir;
        },

        /**
         * Resolve an angle to 0 to 360 (if the angle is negative)
         * @param angle
         * @returns {Number} an angle between
         */
        simplifyAngle: function (angle) {
            // if the angle is negative we add 360
            if (angle < 0)
                return angle + 360;
            if (angle > 360)
                return angle % 360;

            return angle;
        },

        /**
         * Calculates the angle difference based on two angles and a direction (clockwise or counterclockwise)
         * @param {Number} angleA Starting angle in degrees
         * @param {Number} angleB Ending angle in degrees
         * @param {Boolean} clockwise True if the difference should be calculated in a clockwise direction
         * @return {Number} Angle difference in degrees
         */
        angleDiff: function (angleA, angleB, clockwise) {
            if (!clockwise) {
                var diff = angleA - angleB;
                if (diff < 0) diff += 360;
                return diff;
            } else {
                if (angleB < angleA) // wrapping around 0/360
                    angleB += 360;
                return angleB - angleA;
            }
        },

        /**
         * Is the first angle closest by going clockwise of the second angle
         * @param {Number} angleA Angle to target
         * @param {Number} angleB Angle clockwise is relative to
         * @return {Boolean} True if angle A is clockwise to angle B
         */
        isClockwise: function (angleA, angleB) {
            if (angleA > angleB)
                return (Math.abs(angleA - angleB)) < (angleB + (360 - angleA));
            else
                return (angleA + (360 - angleB)) < (Math.abs(angleB - angleA));
        },

        /**
         * Returns whether an angle is facing to the right from a side-scrolling 2d perspective
         * @param {Number} angle Angle to test
         * @return {Boolean} true is facing to the right, otherwise false (meaning it's facing left)
         */
        isFacingRight: function (angle) {
            if (angle > 270 || angle < 90) return true;
            return false;
        },

        /**
         * Converts radians to degrees
         * @param {Number} radians Radians
         * @return {Number} Radians from degrees
         */
        radToDeg: function (radians) {
            return (radians * pc.Math.RADIAN_TO_DEGREE);
        },

        /**
         * Converts degrees to radains
         * @param {Number} degrees Degrees to convert
         * @return {Number} Number of radians
         */
        degToRad: function (degrees) {
            return degrees * pc.Math.DEGREE_TO_RADIAN;
        },

        /**
         * Gives you the angle of a given vector x, y
         * @param {Number} x x component of the 2d vector
         * @param {Number} y y component of the 2d vector
         * @return Angle in degrees
         */
        angleFromVector: function (x, y) {
            // angle to vector
            var a = pc.Math.radToDeg(Math.atan2(y, x));
            if (a < 0) a += 360;
            return a;
        },

        /**
         * Gives you the x, y vector of a given angle in degrees. This method creates a pc.Point which you should
         * release after use
         * @param {Number} angle Angle in degrees
         * @return {pc.Point} A newly acquired pc.Point with the vector.
         */
        vectorFromAngle: function (angle) {
            var vx = Math.cos(pc.Math.degToRad(angle));
            var vy = Math.sin(pc.Math.degToRad(angle));
            return pc.Point.create(vx, vy);
        },

        /**
         * A fast check if a point is within a rectangle
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the point is within the rectangle
         */
        isPointInRect: function (x, y, rx, ry, rw, rh) {
            return x >= rx && x <= (rx + rw) &&
                y >= ry && y <= (ry + rh);
        },

        /**
         * Checks if one rectangle is completely contained in another
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the rectangle is fully within the other
         */
        isRectInRect: function (x, y, w, h, rx, ry, rw, rh) {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        /**
         * Fast test if one rectangle is overlapping another at any point
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true if the rectangle overlaps anywhere
         */
        isRectColliding: function (x, y, w, h, rx, ry, rw, rh) {
            return !(y + h < ry || y > ry + rh ||
                x + w < rx || x > rx + rw);
        },

        /**
         * Forces a given value to be within a range (lowest to highest)
         * @param {Number} v The value to check
         * @param {Number} lowest Lowest value it can be
         * @param {Number} highest Highest value it can be
         * @return {Number} Original value or the edge of the fence if needed
         */
        limit: function (v, lowest, highest) {
            if (v < lowest) return lowest;
            if (v > highest) return highest;
            return v;
        },

        /**
         * Same as limit, but allows an increment value as well (which can be negative)
         * @param {Number} v Original value
         * @param {Number} inc Amount to add (can be negative)
         * @param {Number} lowest Lowest value to fence
         * @param {Number} highest Highest value to fence
         * @return {Number} Value with inc added fenced by the lowest and highest limits
         */
        limitAdd: function (v, inc, lowest, highest) {
            if (v + inc < lowest) return lowest;
            if (v + inc > highest) return highest;
            return v + inc;
        }
    },
    {
        // No instance, since this is an all static class
    });


/**
 * @class pc.Rect
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a rectangle.
 */
pc.Rect = pc.Pooled('pc.Rect',
    /** @lends pc.Rect */
    {
        /**
         * Constructs a new rectangle
         * @param {Number} x x-position of the top left of the rectangle
         * @param {Number} y y-position of the top left of the rectangle
         * @param {Number} w width of the rectangle
         * @param {Number} h height of the rectangle
         * @return {pc.Rect} A new rectangle (acquired from the free object pool}
         */
        create: function (x, y, w, h) {
            var newDim = this._super();
            newDim.x = x;
            newDim.y = y;
            newDim.w = w;
            newDim.h = h;
            return newDim;
        }
    },
    /** @lends pc.Rect.prototype */
    {
        /** x position of the top left of the rectangle */
        x: 0,
        /** y position of the top left of the rectangle */
        y: 0,
        /** width of the rectangle */
        w: 0,
        /** height of the rectangle */
        h: 0,

        /**
         * Checks if one rectangle is completely contained in another
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the rectangle is fully within the other
         */
        containsRect: function (x, y, w, h, rx, ry, rw, rh) {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        /**
         * Checks if a point is within the rectangle
         * @param {pc.Point} p A pc.point (or any object with a .x and .y property
         * @return {Boolean} true if the point is within the rectangle
         */
        containsPoint: function (p) {
            return p.x >= this.x && p.x <= (this.x + this.w) &&
                p.y >= this.y && p.y <= (this.y + this.h);
        },

        /**
         * Checks if this rectangle overlaps another (including rotation support)
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @param {Number} dir Direction to rotate the angle to
         * @return {Boolean} true if the rectangle overlaps another
         */
        overlaps: function (rx, ry, rw, rh, dir) {
            var w = rw;
            var h = rh;

            if (pc.valid(dir) && dir != 0) {
                // calculate using a rotated rectangle
                var s = Math.sin(pc.Math.degToRad(dir));
                var c = Math.cos(pc.Math.degToRad(dir));
                if (s < 0) s = -s;
                if (c < 0) c = -c;
                w = rh * s + rw * c; // width of AABB
                h = rh * c + rw * s; // height of AABB
            }
            return !(this.y + this.h < ry || this.y > ry + h ||
                this.x + this.w < rx || this.x > rx + w);
        },

        /**
         * @return {String} A nice string representation of the rectangle
         */
        toString: function () {
            return this.x + ' x ' + this.y + ' by ' + this.w + ' x ' + this.h;
        }



    });

/**
 * @class pc.Point
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a 2D point.
 */
pc.Point = pc.Pooled('pc.Point',
    /** @lends pc.Point */
    {
        /**
         * Constructs a new point (from the pool)
         * @param {Number} x x position
         * @param {Number} y y position
         * @return {pc.Point} A shiny new point
         */
        create: function (x, y) {
            var n = this._super();
            n.x = x;
            n.y = y;
            return n;
        }
    },
    /** @lends pc.Point.prototype */
    {
        /** x position of the point */
        x: 0,
        /** y position of the point */
        y: 0,

        /**
         * Tests whether one point is equal to another
         * @param {pc.Point} other Other point to test against
         */
        equals: function (other) {
            return (this.x == other.x && this.y == other.y);
        },

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        match: function (p) {
            this.x = p.x;
            this.y = p.y;
        },

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        set: function (p) {
            this.match(p);
        },

        /**
         * Sets the x and y of the point
         * @param {Number} x x position to set
         * @param {Number} y y position to set
         * @return {pc.Point} This point
         */
        setXY: function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        },

        /**
         * Adds to the point
         * @param {Number} x Amount to add to x
         * @param {Number} y Amount to add to y
         * @return {pc.Point} This point
         */
        add: function (x, y) {
            this.x += x;
            this.y += y;
            return this;
        },

        /**
         * Subtracts from the point
         * @param {Number} x Amount to subtract from x
         * @param {Number} y Amount to subtract from y
         * @return {pc.Point} This point
         */
        subtract: function (x, y) {
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * Gives you the angle from this point to another
         * @param {pc.Point} p Another point
         * @return {Number} Facing direction (in degrees) from this point to another
         */
        dirTo: function (p) {
            return Math.atan2(p.y - this.y, p.x - this.x) * 180 / Math.PI;
        },

        /**
         * Modifies the point by moving along at a projected angle (dir) by the distance
         * @param {Number} dir Direction to move, in degrees
         * @param {Number} distance Distance to move
         */
        moveInDir: function (dir, distance) {
            this.x += distance * Math.cos(pc.Math.degToRad(dir));
            this.y += distance * Math.sin(pc.Math.degToRad(dir));
            return this;
        },

        /**
         * Changes the from position by an amount of pixels in the direction of the to position
         * ultimately reaching that point
         * @param {pc.Point} to Ending position
         * @param {Number} distance Amount to move
         */
        moveTowards: function (to, distance) {
            this.moveInDir(this.dirTo(to), distance);
        },

        /**
         * Get the distance between this point and another
         * @param {pc.Point} p Another point
         * @return {Number} Distance between this point and another
         */
        distance: function (p) {
            return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
        },

        /**
         * A nice string representing this point
         * @return {String}
         */
        toString: function () {
            return this.x + 'x' + this.y;
        }


    });

pc.Poly = pc.Pooled('pc.Poly',
    /** @lends pc.Poly */
    {
        create: function (x, y, points) {
            var n = this._super();
            n.x = x;
            n.y = y;
            n.points = points;
            return n;
        }
    },
    /** @lends pc.Poly.prototype */
    {
        /** x position of the polygon */
        x: 0,
        /** y position of the polygon */
        y: 0,
        /** array of points representing the polygon (relative to x, y) */
        points: null,

        _boundingRect: null,

        init: function (x, y, points) {
            this.x = x;
            this.y = y;
            this.points = points;
            this._boundingRect = pc.Rect.create(0, 0, 0, 0);
        },

        getBoundingRect: function () {
            // todo
        },

        containsPoint: function (p) {
            for (var c = false, i = -1, l = this.points.length, j = l - 1; ++i < l; j = i) {
                ((this.points[i].y <= p.y && p.y < this.points[j].y) || (this.points[j].y <= p.y && p.y < this.points[i].y))
                    && (p.x < (this.points[j].x - this.points[i].x) * (p.y - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)
                && (c = !c);
            }
            return c;
        }
    });


/**
 * @class pc.Dim
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Dim = pc.Point;

/**
 * @class pc.Vector
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Vector = pc.Point;


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Image
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A basic image resource. You can use this class to acquire images (loaded from a URI) and then draw them on-screen
 * with effects such as scaling, rotation, compositing and alpha.<p>
 */
pc.Image = pc.Base.extend('pc.Image',
    /** @lends pc.Image */
    {},
    /** @lends pc.Image.prototype */
    {
        /** Width of the image; set upon loading, can be overridden after load */
        width: 0,
        /** Height of the image; set upon loading, can be overridden after load */
        height: 0,
        /** Source image element */
        image: null,
        /** Source URI used to load the image */
        src: null,
        /** Resource name */
        name: null,
        /** Whether the image has been loaded yet */
        loaded: false,
        /** Optional function called after this image loads */
        onLoadCallback: null,
        /** Optional function called if this image fails to load */
        onErrorCallback: null,
        /** x-scale to draw the image at */
        scaleX: 1,
        /** y-scale to draw the image at */
        scaleY: 1,
        /** alpha level to draw the image at (0.5=50% transparent) */
        alpha: 1,
        /** Composite operation to draw the image with, e.g. 'lighter' */
        compositeOperation: null,

        /**
         * Constructs a new pc.Image. If the pc.device.loader has already started then the image will be
         * immediately loaded, otherwise it will wait for the resource loader to handle the loading.
         * @param {String} name Name to give the image resource
         * @param {String} src URI for the image
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        init: function (name, src, onLoadCallback, onErrorCallback) {
            this._super();

            this.name = name;
            this.src = pc.device.loader.makeUrl(src);
            this.image = new Image();

            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            // setup our own handlers
            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;

            if (pc.device.loader.started) // load now if the loader has already been started
                this.load();
        },

        /**
         * Change the alpha level to draw the image at (0.5 = 50% transparent)
         * @param {Number} a Alpha level
         */
        setAlpha: function (a) {
            this.alpha = a;
        },

        /**
         * Change the x and/or y scale to draw the image at. If you want to scale an image to a particular size,
         * just generate the scale by dividing one size by another, e.g. current image size 500, 500 and you want to
         * scale to 750, 750, then do setScale( 750/500, 750/500 ).
         * @param {Number} scaleX x-scale to draw at (2 = 200% wide, -1 = reversed normal on x)
         * @param {Number} scaleY y-scale to draw at (2 = 200% high, -1 = reversed normal on y)
         */
        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this image.
         * @param {String} o Operation to use (e.g. 'lighter')
         */
        setCompositeOperation: function (o) {
            this.compositeOperation = o;
        },

        /**
         * Load an image directly
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        load: function (onLoadCallback, onErrorCallback) {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) this.onLoadCallback(this);

            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.image.src = this.src;
        },

        /**
         * Force this image to be reloaded
         */
        reload: function () {
            this.loaded = false;
            this.load();
        },

        /**
         * Draw the image onto a context
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} sx Source position in the image (or detination x if only 3 params)
         * @param {Number} sy Source position in the image (or destination y if only 3 params)
         * @param {Number} x x-position destination x position to draw the image at
         * @param {Number} y y-position destination y position to draw the image at
         * @param {Number} width Width to draw (will clip the image edge)
         * @param {Number} height Height to draw (will clip the image edge)
         * @param {Number} rotationAngle Angle to draw the image at
         */
        draw: function (ctx, sx, sy, x, y, width, height, rotationAngle) {
            // scale testing
            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = this.compositeOperation;

            // simple version of draw, no source x, y, just draw the image at x, y
            if (arguments.length == 3) {
                ctx.save();
                if (this.alpha != 1)
                    ctx.globalAlpha = this.alpha;
                ctx.translate(sx + (this.width / 2), sy + (this.height / 2));
                ctx.scale(this.scaleX, this.scaleY);
                ctx.drawImage(this.image, 0, 0, this.width, this.height, (-this.width / 2),
                    (-this.height / 2), this.width, this.height);
                ctx.restore();
            }
            else {
                if (pc.valid(rotationAngle)) {
                    ctx.save();

                    if (this.alpha != 1)
                        ctx.globalAlpha = this.alpha;
                    if (this.scaleX < 0 || this.scaleY < 0) {
                        var yf = this.scaleY == 1 ? 0 : this.scaleY;
                        var xf = this.scaleX == 1 ? 0 : this.scaleX;

                        ctx.translate((x + (width / 2) * xf), (y + (height / 2) * yf));
                    } else
                        ctx.translate(x + (width / 2), y + (height / 2));

                    ctx.rotate(rotationAngle * (Math.PI / 180));
                    ctx.scale(this.scaleX, this.scaleY);
                    ctx.drawImage(this.image, sx, sy, width, height, (-width / 2), (-height / 2), width, height);
                    ctx.restore();
                }
                else {
                    ctx.save();

                    if (this.alpha != 1)
                        ctx.globalAlpha = this.alpha;
                    if (this.scaleX < 0 || this.scaleY < 0) {
                        var yf2 = this.scaleY == 1 ? 0 : this.scaleY;
                        var xf2 = this.scaleX == 1 ? 0 : this.scaleX;

                        ctx.translate(x + (-(width / 2) * xf2), y + (-(height / 2) * yf2));
                    } else
                        ctx.translate(x, y);

                    ctx.scale(this.scaleX, this.scaleY);
                    ctx.drawImage(this.image, sx, sy, width, height, 0, 0, width, height);
                    ctx.restore();
                }
            }

            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = 'source-over';
            pc.device.elementsDrawn++;

        },

        _onLoad: function () {
            this.loaded = true;

            this.width = this.image.width;
            this.height = this.image.height;

            if (this.onLoadCallback)
                this.onLoadCallback(this);
        },

        _onError: function () {
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Expands the image by adding blank pixels to the bottom and side
         * @param {Number} extraWidth Amount of width to add
         * @param {Number} extraHeight Amount of height to add
         */
        expand: function (extraWidth, extraHeight) {
            this.image.width = this.width + extraWidth;
            this.image.height = this.height + extraHeight;
            this.width = this.image.width;
            this.height = this.image.height;
        },

        /**
         * Resizes an image using a given scale. This will create a new image internally, which can be
         * expensive. Generally you should use setScale on the image to change it's size, which will let
         * the hardware take care of it. If this is slow, or the results are not what you want, then you
         * can use this method to do a nicer resize (but keep in mind it's slow and memory expensive)
         * @param {Number} scaleX Scale to increase X by (can be negative)
         * @param {Number} scaleY Scale to increase Y by (can be negative)
         * @return {pc.Image} This image object
         */
        resize: function (scaleX, scaleY) {
            var sw = this.width * scaleX;
            var sh = this.height * scaleY;

            var startingImage = document.createElement('canvas');
            startingImage.width = this.width;
            startingImage.height = this.height;

            var result = document.createElement('canvas');
            result.width = sw;
            result.height = sh;

            var ctx = result.getContext('2d');
            var resultPixels = ctx.getImageData(0, 0, sw, sh);

            var startingCtx = startingImage.getContext('2d');
            startingCtx.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var startingPixels = startingCtx.getImageData(0, 0, this.width, this.height);

            for (var y = 0; y < sh; y++) {
                for (var x = 0; x < sw; x++) {
                    var i = (Math.floor(y / scaleY) * this.width + Math.floor(x / scaleX)) * 4;
                    var is = (y * sw + x) * 4;
                    for (var j = 0; j < 4; j++)
                        resultPixels.data[is + j] = startingPixels.data[i + j];
                }
            }

            ctx.putImageData(resultPixels, 0, 0);
            this.image = result;
            return this;
        }


    });

// todo: this should be derived from image (or at least a common base -- merge things like scaling factor api)
pc.CanvasImage = pc.Base.extend('pc.CanvasImage', {},
    {

        width: 0,
        height: 0,
        canvas: null,
        loaded: true,
        scaleX: 1,
        scaleY: 1,

        init: function (canvas) {
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
        },

        draw: function (ctx, sx, sy, x, y, width, height) {
            if (width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx, sy);
            else
                ctx.drawImage(this.canvas, sx, sy, width, height, x * this.scaleX, y * this.scaleY,
                    width * this.scaleX, height * this.scaleY);
        },

        setScale: function (scaleX, scaleY) {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }

    });


pc.ImageTools = pc.Base.extend('pc.ImageTools',
    {
        /**
         * Rotates an image by the given number of directions
         * @param image Source image
         * @param w Width of the image
         * @param h Height of the image
         * @param directions Number of directions you want back
         * @return {pc.CanvasImage} A new pc.CanvasImage with the rotations
         */
        rotate: function (image, w, h, directions) {
            // create an destination canvas big enough
            var resultCanvas = document.createElement('canvas');
            resultCanvas.width = w * directions;
            resultCanvas.height = h;

            var ctx = resultCanvas.getContext('2d');

            // find center of the source image
            var cx = w / 2;
            var cy = h / 2;

            for (var d = 0; d < directions; d++) {
                ctx.save();
                ctx.translate(d * w + (w / 2), h / 2);
                ctx.rotate(((360 / directions) * d) * (Math.PI / 180));
                ctx.drawImage(image, -(w / 2), -(h / 2));
                ctx.restore();
            }

            return new pc.CanvasImage(resultCanvas);
        }


    },
    {});
/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 */

/**
 * @class pc.Scene
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A game is primarily a container for various "scenes", with each scene containing one or more layers. You can
 * construct a scene, and use addScene to add it to the game. This is typically done once all the queued resources
 * have been loaded:
 * <pre><code>
 * onLoaded:function ()
 * {
 *    // construct the game scene
 *    this.gameScene = new GameScene();
 *
 *    // add it to the game
 *    this.addScene(this.gameScene);
 * }
 * </code></pre>
 * Active scenes will be updated and drawn by the system, inactive ones will not. Adding a scene makes it active by
 * default.
 * <p>
 * To activate a scene (such as displaying a menu scene):
 * <pre><code>
 * myGame.activateScene(myMenuScene);
 * </code></pre>
 * You can likewise deactivate a scene (it will no longer be rendered or processed):
 * <pre><code>
 * myGame.deactivateScene(myMenuScene);
 * </code></pre>
 * Upon activating a scene, the game's onSceneActivated is called passing in the scene that became active. Likewise
 * onSceneDeactivated will be called when a scene is deactivated.
 * <p>
 * You can access scenes by calling getFirstScene or getFirstActiveScene which will return a pc.LinkedListNode you can
 * use to loop through the list of scenes:
 * <pre><code>
 * var sceneNode = myGame.getFirstScene();
 * while (sceneNode)
 * {
 *    var scene = sceneNode.object();
 *    // scene.doSomething();
 *
 *    // move to the next one (will be null if done)
 *    sceneNode = sceneNode.next();
 * }
 * </code></pre>
 */
pc.Scene = pc.Base.extend('pc.Scene',
    /** @lends pc.Scene */
    {},
    /** @lends pc.Scene.prototype */
    {
        /** Name of the scene */
        name: null,
        /** An index of layers by name */
        layersByName: null,
        /** Linked list of all layers in the scene */
        layers: null,
        /** Linked list of all active layers */
        activeLayers: null,
        /** Whether the scene is currently paused (read-only) */
        paused: false,
        /** Whether the scene is active (read-only) */
        active: false,
        /** pc.Rect of the current viewport */
        viewPort: null,

        viewPortCenter: null, // readonly, changes when you call setViewPort

        /**
         * Constructs a new scene with the given name
         * @param {String} name Name of the scene, i.e. 'menu'
         */
        init: function (name) {
            this._super();
            this.active = false;
            this.name = name;
            this.layersByName = new pc.Hashtable();
            this.layers = new pc.LinkedList();
            this.activeLayers = new pc.LinkedList();

            this.viewPort = pc.Rect.create(0, 0, 0, 0); // set by setViewPort below
            this.viewPortCenter = pc.Point.create(0, 0);

            // set the view port to be the default size of the system canvas
            this.setViewPort(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // if the system has already started, then automatically call the onReady
            if (pc.device.started)
                this.onReady();
        },

        /**
         * Called when the device is ready
         */
        onReady: function () {
            // signal all the layers that we're ready
            var next = this.layers.first;
            while (next) {
                next.obj.onReady();
                next = next.next();
            }
        },

        /**
         * Called when this scene is being activated
         */
        onActivated: function () {
        },

        /**
         * Called when this scene has been deactivated
         */
        onDeactivated: function () {
        },

        /**
         * Event notifier when the underlying game canvas is being resized
         * @param {Number} width New width of the game canvas
         * @param {Number} height New height of the game canvas
         */
        onResize: function (width, height) {
            this.setViewPort(this.viewPort.x, this.viewPort.y, width, height);

            var next = this.layers.first;
            while (next) {
                next.obj.onResize(width, height);
                next = next.next();
            }
        },

        /**
         * Sets the view port to the given top left postion (x, y) and dimensions (width and height)
         * The view port represents the on-screen pixels dimensions of the game relative to the
         * associated canvas. Use the view port dimensions to render different scenes at different
         * positions on screen. e.g. a game layer would typically be 0, 0, canvas.width, canvas.height
         * whereas a mini map may just be in the top left corner of the screen (0, 0, 100, 100).
         * @param {Number} x X position to render the scene within the canvas (in screen pixels)
         * @param {Number} y Y position to render the scene within the canvas (in screen pixels)
         * @param {Number} width The maximum width to render (in screen pixels)
         * @param {Number} height The maximum height to render (in screen pixels)
         */
        setViewPort: function (x, y, width, height) {
            this.viewPort.x = x;
            this.viewPort.y = y;
            this.viewPort.w = width;
            this.viewPort.h = height;
            this.viewPortCenter.x = this.viewPort.w / 2;
            this.viewPortCenter.y = this.viewPort.h / 2;
        },

        /**
         * Gets the current viewport (essentially an alias for viewPort used by abstract interfaces (such as
         * the input system). You can use it to if you want to write generic code that again layers, scenes and
         * entities, since this method is the same across all. Otherwise you can just read the viewport member
         * directly.
         */
        getScreenRect: function () {
            return this.viewPort;
        },

        /**
         * Resorts layer processing/drawing order based on each layers zIndex value
         */
        sortLayers: function () {
            this.activeLayers.sort(
                function (a, b) {
                    return a.zIndex - b.zIndex;
                });
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your subclass to do something about it.
         * @param {String} actionName The name of the action that happened
         * @param {Event} event Raw event object
         * @param {pc.Point} pos Position, such as a touch input or mouse position
         */
        onAction: function (actionName, event, pos) {
        },

        /**
         * Gets whether the scene is active or not
         * @return {Boolean} True if active
         */
        isActive: function () {
            return this.active;
        },

        /**
         * Gets a layer using a name
         * @param {String} name Name of the layer you want
         * @return {pc.Layer} The layer
         */
        get: function (name) {
            return this.layersByName.get(name);
        },

        /**
         * Adds a layer to the scene. The added layer will automatically be made active.
         * @param {pc.Layer} layer Layer you want to add
         * @return {pc.Layer} The layer you added, for convenience.
         */
        addLayer: function (layer) {
            if (!pc.valid(layer))
                throw "Error: invalid layer";
            if (!pc.valid(layer.name))
                throw "Error: trying to add a layer that has no name (forget to call this._super in your layer init?)";

            this.layersByName.put(layer.name, layer);
            this.layers.add(layer);
            this.activeLayers.add(layer);
            layer.active = true;
            layer.scene = this;
            layer.onAddedToScene();
            this.sortLayers();

            return layer;
        },

        /**
         * Remove a layer
         * @param {pc.Layer} layer The layer you want to remove
         */
        removeLayer: function (layer) {
            this.layersByName.remove(layer.name);
            this.layers.remove(layer);
            this.activeLayers.remove(layer);
            layer.active = false;
            layer.scene = null;
            layer.onRemovedFromScene();
        },

        /**
         * Sets the layer to active
         * @param {pc.Layer} layer Layer you want to make active
         */
        setLayerActive: function (layer) {
            this.activeLayers.add(layer);
            this.sortLayers();
            layer.active = true;
        },

        /**
         * Sets the layer to inactive
         * @param {pc.Layer} layer Layer you want to make inactive
         */
        setLayerInactive: function (layer) {
            this.activeLayers.remove(layer);
            layer.active = false;
        },

        /**
         * Toggles a layer to active or inactive
         * @param {pc.Layer} layer Layer you want to toggle
         */
        toggleLayerActive: function (layer) {
            if (layer.active)
                this.setLayerInactive(layer);
            else
                this.setLayerActive(layer);
        },

        /**
         * Gets the linked list node of the first active layer
         * @return {pc.LinkedListNode} Node pointing to the first layer
         */
        getFirstActiveLayer: function () {
            return this.activeLayers.first;
        },

        /**
         * Gets the linked list node of the first layer
         * @return {pc.LinkedListNode} Node pointing to the first layer
         */
        getFirstLayer: function () {
            return this.layers.first;
        },

        //
        // LIFECYCLE
        //
        startTime: 0,

        process: function () {
            // draw all the layers
            var next = this.activeLayers.first;
            while (next) {
                if (!next.obj.paused) {
                    next.obj.process();

                    this.startTime = Date.now();
                    next.obj.draw();
                    pc.device.lastDrawMS += (Date.now() - this.startTime);
                }
                next = next.next();
            }
        },

        /**
         * Pauses all active layers
         */
        pause: function () {
            this.paused = true;
            var next = this.activeLayers.first;
            while (next) {
                next.obj.pause();
                next = next.next();
            }
        },

        /**
         * Resumes all active layers
         */
        resume: function () {
            this.paused = false;
            var next = this.activeLayers.first;
            while (next) {
                next.obj.resume();
                next = next.next();
            }
        },

        /**
         * Resets all layers
         */
        reset: function () {
            var next = this.layers.first;
            while (next) {
                next.obj.reset();
                next = next.next();
            }

            this.layers.clear();
            this.activeLayers.clear();
        },

        /**
         * Ask all the layers etc for any entities under the x, y position
         * @param {Number} x the screen x position
         * @param {Number} y the screen y position
         */
        entitiesUnderXY: function (x, y) {
            var found = [];
            var next = this.layers.first;
            while (next) {
                found.push(next.obj.entitiesUnderXY(x, y));
                next = next.next();
            }
        },


        /**
         * Loads all of the layers from a Tiled (TMX) map file. Tile layers will become instances of
         * TileLayer, objectgroups will become EntityLayers. Tile sets must have a name that matches an
         * available spritesheet image resource. Note that only a single tilesheet is currently supported.
         * @param {String} levelData XML formatted TMX data
         */
        loadFromTMX: function (levelData, entityFactory) {
            var xmlDoc = pc.device.parseXML(levelData.data);
            var mapXML = xmlDoc.getElementsByTagName('map')[0];

            var tileWidth = parseInt(mapXML.getAttribute('tilewidth'));
            var tileHeight = parseInt(mapXML.getAttribute('tileheight'));

            // load up the tilesets (note: only 1 is supported right now)
            // todo: add support for multiple tile sets

            //
            // TILESET
            //
            var tileSetXML = xmlDoc.getElementsByTagName('tileset')[0];
            var tsName = tileSetXML.getAttribute('name');
            var tsImageWidth = tileSetXML.getAttribute('width');
            var tsImageHeight = tileSetXML.getAttribute('height');
            var tileSheet = pc.device.loader.get(tsName);
            pc.assert(tileSheet, 'Unable to locate tile image resource: ' + tsName + '. It must match the tileset name in tiled.');

            var tsImageResource = pc.device.loader.get(tsName).resource;
            var tsSpriteSheet = new pc.SpriteSheet({ image: tsImageResource, frameWidth: tileWidth, frameHeight: tileHeight });

            // create a tileset object which marries (one or more spritesheet's) and contains tileproperty data
            // pulled from tiled

            var tileSet = new pc.TileSet(tsSpriteSheet);

            // load all the tile properties
            var tiles = xmlDoc.getElementsByTagName('tile');
            for (var p = 0; p < tiles.length; p++) {
                var tile = tiles[p];
                var tileId = parseInt(tile.getAttribute('id'));

                var pr = tile.getElementsByTagName('properties')[0];
                if (pr) {
                    var props = pr.getElementsByTagName('property');

                    for (var b = 0; b < props.length; b++) {
                        var prop = props[b];
                        var name = prop.getAttribute('name');
                        var value = prop.getAttribute('value');
                        tileSet.addProperty(tileId, name, value);
                    }
                }
            }

            //
            // LAYERS
            //
            var layers = xmlDoc.getElementsByTagName('layer');
            for (var m = 0; m < layers.length; m++) {
                switch (mapXML.getAttribute('orientation')) {
                    case 'isometric':
                        pc.IsoTileLayer.loadFromTMX(this, layers[m], tileWidth, tileHeight, tileSet);
                        break;

                    default:
                        pc.TileLayer.loadFromTMX(this, layers[m], tileWidth, tileHeight, tileSet);
                        break;
                }
            }

            // load entity layers
            var objectGroups = xmlDoc.getElementsByTagName('objectgroup');
            for (var i = 0; i < objectGroups.length; i++) {
                // partial construction

                // fill in the rest using the data from the TMX file
                var group = objectGroups[i];
                var tilesWide = parseInt(group.getAttribute('width'));
                var tilesHigh = parseInt(group.getAttribute('height'));
                pc.EntityLayer.loadFromTMX(this, group, entityFactory, tilesWide * tileWidth, tilesHigh * tileHeight);
            }

        }




    });
/**
 * Playcraft Engine
 * game.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 */

/**
 * @class pc.Game
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * pc.Game is the primary base class for creating a game and drives resources, core processing (cycling) your
 * game, and serves as a placeholder for scenes.
 * <h5>Basic Usage</h5>
 * <p>
 * Typically a pc.Game is constructed by the pc.start method call made from within your games index.html:
 * <pre><code>
 * &ltscript&gt
 *    // pc.start will construct an instance of TheGame once the device (browser) is ready
 *    pc.start('pcGameCanvas', 'TheGame', '/mygame/js/', ['mygame.js']);
 * &lt/script&gt
 * </code></pre>
 * When the pc.start system has finished preparing everything, it will dynamically construct an instance of
 * the class parameter (in the above example 'TheGame'). You can always gain access to the game from the global
 * pc.device:
 * <pre><code>
 * var myGame = pc.device.game;
 * </code></pre>
 * <p>
 * To create a pc.Game, extend it and override what you need:
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     // onReady is called when the browser DOM is ready
 *     onReady:function ()
 *     {
 *         this._super();
 *
 *         // load resources
 *         // declare a base URL; saves you typing
 *         pc.device.loader.setBaseUrl('images/');
 *
 *         // add an image to the resource loader's queue
 *         pc.device.loader.add(new pc.Image('player-ship', 'ship1.png'));
 *
 *         // start the resource loader
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // draw title screen -- with loading bar
 *     }
 *
 * });
 * </code></pre>
 * See the pc.Loader for more information on using the resource loader and the onLoading/onLoaded callbacks.
 * <p>

 * <h5>Pause/Resume</h5>
 * <p>
 * You can pause/resume individual scenes, or you can pause/resume all scenes by calling pause on the game:
 * <pre><code>
 * myGame.pause();
 * myGame.resume();
 * myGame.togglePauseResume();
 * </code></pre>
 *
 * <h5>Debugging</h5>
 * pc.Game sets up the following default input keys for debugging:
 * <ul>
 *     <li>F9 to enable/disable physics debugging across all layers.</li>
 *     <li>F10 to dump stats on the object pools.</li>
 *     <li>F11 toggle sound.</li>
 * </ul>
 */

pc.Game = pc.Base.extend('pc.Game', {},
    /** @lends pc.Game.prototype */
    {
        /** (pc.LinkedList) List of all scenes in the game */
        scenes: null,
        /** (pc.LinkedList) List of scenes current active */
        activeScenes: null,
        /** (Boolean) Whether the game is currently paused. You can theGame.paused=true; to suspend all scenes **/
        paused: false,

        /**
         * Constructs a new game object
         */
        init: function () {
            this._super();

            this.scenes = new pc.LinkedList();
            this.activeScenes = new pc.LinkedList();

            if (pc.device.devMode) {
                // bind some special keys for general debugging use
                pc.device.input.bindAction(this, 'physics debug', 'F9');
                pc.device.input.bindAction(this, 'pool dump', 'F10');
                pc.device.input.bindAction(this, 'toggle sound', 'F11');
            }
        },

        /**
         * Processes all active scenes (called automatically by pc.Device.cycle)
         * @return {Boolean} false indicates the device should stop running the game loop
         */
        process: function () {
            if (this.paused) return true;

            var scene = this.getFirstActiveScene();
            while (scene) {
                scene.object().process();
                scene = scene.next();
            }

            return true; // return false to quit the update loop
        },

        stopAllSounds: function () {
            // stop any current sounds from playing
            var sounds = pc.device.loader.getAllSounds();
            for (var i = 0; i < sounds.length; i++) {
                if (pc.device.soundEnabled)
                    sounds[i].stop();
            }
        },

        /**
         * Base handler for input actions. This gives the game a chance to intercept and act on actions like
         * F9 and F10 for debugging. See pc.Input for more information on input handlers
         * @param {String} actionName Name of the action to be handled
         */
        onAction: function (actionName) {
            if (actionName === 'toggle sound') {
                this.stopAllSounds();
                // toggle the sound
                pc.device.soundEnabled = !pc.device.soundEnabled;
            }

            if (actionName === 'pool dump') {
                console.log(pc.Pool.getStats());
            }

            if (actionName === 'physics debug') {
                // find all physics systems, and toggle debug
                var sceneNode = this.getFirstScene();
                while (sceneNode) {
                    var layerNode = sceneNode.object().getFirstActiveLayer();
                    while (layerNode) {
                        var layer = layerNode.object();
                        if (layer.Class.isA('pc.EntityLayer')) {
                            var systemNode = layer.systemManager.systems.first;
                            while (systemNode) {
                                var system = systemNode.object();
                                if (system.Class.isA('pc.systems.Physics'))
                                    system.setDebug(!system.debug);
                                systemNode = systemNode.next();
                            }
                        }
                        layerNode = layerNode.next();
                    }
                    sceneNode = sceneNode.next();
                }

            }
        },

        //
        // SCENES
        //
        /**
         * Add a scene to the game. Automatically makes the scene active. Once added, the game's onSceneAdded method
         * will be called.
         * @param {pc.Scene} scene Scene to add
         * @param {boolean} [activate] Make the scene active on adding it (defaults to true)
         */
        addScene: function (scene, activate) {
            this.scenes.add(scene);
            this.onSceneAdded(scene);
            if (pc.checked(activate, true))
                this.activateScene(scene);
        },

        /**
         * Called whenever a scene is added to the game. Useful for handling setup or detecting when new scenes are
         * being added.
         * @param {pc.Scene} scene Scene that was added
         */
        onSceneAdded: function (scene) {
        },

        /**
         * Removes a scene from the game. Will trigger a notifier call to onSceneRemoved
         * @param {pc.Scene} scene Scene to remove
         */
        removeScene: function (scene) {
            this.scenes.remove(scene);
            this.activeScenes.remove(scene);
            this.onSceneRemoved(scene);
        },

        /**
         * Notifier callback when a scene is removed from this game
         * @param {pc.Scene} scene Scene being removed
         */
        onSceneRemoved: function (scene) {
        },

        /**
         * Activates a scene (it will be rendered and processed)
         * @param {pc.Scene} scene Scene you want to make active
         */
        activateScene: function (scene) {
            if (scene.active) return;

            this.activeScenes.add(scene);
            scene.active = true;
            this.onSceneActivated(scene);
            scene.onActivated();
        },

        /**
         * Called when a scene has been activated.
         * @param {pc.Scene} scene Scene that has been activated.
         */
        onSceneActivated: function (scene) {
        },

        /**
         * Deactivate a given scene
         * @param {pc.Scene} scene Scene to deactivate
         */
        deactivateScene: function (scene) {
            if (!scene.active) return;

            this.activeScenes.remove(scene);
            scene.active = false;
            this.onSceneDeactivated(scene);
            scene.onDeactivated();
        },

        /**
         * Called when a scene has been deactviated
         * @param {pc.Scene} scene Scene that was deactivated
         */
        onSceneDeactivated: function (scene) {
        },

        /**
         * Get the first active scene from the active scenes linked list
         * @return {pc.LinkedNode} Linked list node pointing to the first active scene (use getFirstActiveScene().object())
         * to get the scene.
         */
        getFirstActiveScene: function () {
            return this.activeScenes.first;
        },

        /**
         * Get the first scene from the scene linkedlist
         * @return {pc.LinkedNode} Linked node pointing to the first scene
         */
        getFirstScene: function () {
            return this.scenes.first;
        },

        //
        // lifecycle
        //

        /**
         * Pauses all scenes, which means no drawing or updates will occur. If you wish to pause game play and leave a menu
         * still running, then just pause the scene associated with game play, and not the menu scenes.
         */
        pause: function () {
            this.paused = true;

            var nextScene = this.getFirstScene();
            while (nextScene) {
                nextScene.object().pause();
                nextScene = nextScene.next();
            }
        },

        /**
         * @return {Boolean} True is the game is active (not paused)
         */
        isActive: function () {
            return !this.paused;
        },

        /**
         * Resumes all scenes (after being paused)
         */
        resume: function () {
            this.paused = false;

            var nextScene = this.getFirstScene();
            while (nextScene) {
                nextScene.object().resume();
                nextScene = nextScene.next();
            }
        },

        /**
         * Toggles pause/resume of the game
         */
        togglePauseResume: function () {
            if (pc.device.game.paused)
                pc.device.game.resume();
            else
                pc.device.game.pause();
        },

        /**
         * Resets all scenes back to their starting state (by calling reset() on all scenes), then calling
         * clear() on all scenes, before finally calling the game class onReady
         */
        reset: function () {
            // clear all scenes, layers, entities
            var nextScene = this.getFirstScene();
            while (nextScene) {
                nextScene.obj.reset();
                nextScene = nextScene.next();
            }

            this.scenes.clear();
            this.activeScenes.clear();

            // then restart the game
            this.onReady();
        },

        /**
         * Called by the pc.Device when the game is ready to be started (also called when a reset() is done)
         */
        onReady: function () {
        },

        /**
         * Called when the device canvas changes size (such as when a browser is resized)
         * @param width Width of the canvas
         * @param height Height of the canvas
         */
        onResize: function (width, height) {
            var nextScene = this.getFirstActiveScene();
            while (nextScene) {
                nextScene.obj.onResize(width, height);
                nextScene = nextScene.next();
            }
        },

        /**
         * Convenience fucntion to grab the size of the associated device screen
         * @return {pc.Rect} Rectangle of the current canvas
         */
        getScreenRect: function () {
            return pc.Rect.create(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
        }


    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Loader
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The Loader takes care of loading resources (downloading) and then notifying you when everything
 * is ready. The loader is a static class that will always be constructed by the engine and accessible through th
 * pc.device.loader member.
 * <p>
 * Using the loader you can load <a href='pc.Image'>pc.Image</a>'s, <a href='pc.DataResource'>pc.DataResources</a>'s,
 * and <a href='pc.Sound'>pc.Sound</a>'s.
 * <p>
 * Typically you use the loader from within your game class onReady method (called automatically by the engine).
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     onReady:function ()
 *     {
 *         this._super(); // call the base class' onReady
 *
 *         // disable caching when developing
 *         if (pc.device.devMode)
 *             pc.device.loader.setDisableCache();
 *
 *         // load up resources
 *         pc.device.loader.add(new pc.Image('spaceship', 'images/spaceship.png'));
 *
 *         // fire up the loader (with a callback once done)
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // display progress, such as a loading bar
 *     },
 *
 *     onLoaded:function ()
 *     {
 *         // we're ready; make the magic happen
 *     }
 * });
 * </code></pre>
 * You can disable caching using setDisableCache. This is the default when in devMode (when the engine has not been
 * packed/minified.
 */

pc.Loader = pc.Base.extend('pc.Loader',
    {},
    /** @lends pc.Loader.prototype */
    {
        State: { QUEUED: 0, LOADING: 1, READY: 2, FAILED: 3 },

        /** A hashtable of all the resources, keyed by the resource name */
        resources: new pc.Hashtable(),
        /** Function called after each new resource has been loaded */
        loadingListener: null,
        /** Function called after all resources have been loaded or errored */
        loadedListener: null,
        /** Progress of the loader (number of items loaded so far) */
        progress: 0,
        /** Total number of resources to be loaded */
        totalBeingLoaded: 0,
        /** Number of resources that had a problem */
        errored: 0,
        /** Optional baseURI prepended to resource URI's */
        baseUrl: '',

        /**
         * True if loader.start() has been called. Typically resources use this to check
         * if they should just load immediately (after game start) or hold on loading until the loader calls (triggered
         * by loader.start()
         */
        started: false,
        /** True if the resource loader has finished loading everything */
        finished: false,

        _noCacheString: '',

        /**
         * Constructor -- typically called by the engine to automatically construct pc.device.loader.
         */
        init: function () {
            this._super();
        },

        /**
         * Tells the resource loader to disable caching in the browser by modifying the resource src
         * by appending the current date/time
         */
        setDisableCache: function () {
            this._noCacheString = '?nocache=' + Date.now();
        },

        /**
         * Sets a base URI to save you type. Applies to all resources added until the next setBaseURL is called.
         * @param {String} url URI to prepend
         */
        setBaseUrl: function (url) {
            this.baseUrl = url;
        },

        /**
         * Sets an optional listener
         * @param {Function} loadingListener Function to call when each resource is loaded
         * @param {Function} loadedListener Function to call when all resources have been loaded
         */
        setListener: function (loadingListener, loadedListener) {
            this.loadingListener = loadingListener;
            this.loadedListener = loadedListener;
        },

        /**
         * Add a resource to the loader queue
         * @param {pc.Image|pc.Sound|pc.DataResource} resource Resource to load
         */
        add: function (resource) {
            // resource.src already has the baseUrl set by the resource class (i.e. pc.Image)
            // so no need to add it here
            resource.name = resource.name.toLowerCase();
            this.resources.put(resource.name.toLowerCase(), { resource: resource, state: this.State.QUEUED });
            this.info('Adding resource ' + resource.src + ' to the queue.');
        },

        /**
         * Retrieve a resource from the loader
         * @param {String} name Name of the resource
         * @return {pc.Image|pc.Sound|pc.DataResource} Resource
         */
        get: function (name) {
            var res = this.resources.get(name.toLowerCase());
            if (!res)
                throw "Attempting to get a resource that hasn't been added: " + name;
            if (res.state < this.State.READY)
                throw "Attempting to get a resource that hasn't been loaded yet (calling before onLoaded?)";
            return res;
        },

        /**
         * Get all the sound resources
         * @return {Array} An array of all the sounds
         */
        getAllSounds: function () {
            var sounds = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++) {
                var res = this.resources.get(keys[i]).resource;
                if (res.Class.isA('pc.Sound'))
                    sounds.push(res);
            }
            return sounds;
        },

        /**
         * Get all the image resources
         * @return {Array} An array of all the images
         */
        getAllImages: function () {
            var images = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++) {
                var res = this.resources.get(keys[i]);
                if (res.isA('pc.Image'))
                    images.push(res);
            }

            return images;
        },

        /**
         * Starts the resource loader
         * @param {Function} loadingListener Function to call after each resource is loaded
         * @param {Function} loadedListener Function to call after all resources have been loaded or errored.
         */
        start: function (loadingListener, loadedListener) {
            this.setListener(loadingListener, loadedListener);

            this.progress = 0;
            this.errored = 0;

            // ask all of the resources to get busy loading
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++) {
                var res = this.resources.get(keys[i]);
                if (res.state == this.State.QUEUED) {
                    res.resource.load(this._onLoad.bind(this), this._onError.bind(this));
                    res.state = this.State.LOADING;
                    this.totalBeingLoaded++;
                }
            }
            this.info('Started loading ' + this.totalBeingLoaded + ' resource(s).');
            this._checkAllDone();
        },

        /**
         * Generates a URL using a src string (by prepending the baseURL and appending the optional no-cache string
         * @param {String} src Source URI
         * @return {String} A full resource URI
         */
        makeUrl: function (src) {
            return this.baseUrl + src + this._noCacheString;
        },

        /**
         * Andrew:
         *    fixed minor bug where if you used uppercase characters in key name res would return null
         *    because it did not fins the key in the hashtable. Just displayed and error notice to console.
         */
        _onLoad: function (resource) {
            var res = this.resources.get(resource.name);
            if (res == null) {
                this.error('Unable to get resource [' + resource.name + '] - Please make sure you are using all lowercase.');
            } else {
                res.state = this.State.READY;
                this.progress++;

                if (this.loadingListener != null)
                    this.loadingListener(Math.round((this.progress / this.totalBeingLoaded) * 100));

                this.info(resource.name + ' loaded (' + Math.round((this.progress / this.totalBeingLoaded) * 100) + '% done)');
            }
            this._checkAllDone();
        },

        _onError: function (resource) {
            var res = this.resources.get(resource.name);
            res.state = this.State.FAILED;
            this.progress++;
            this.errored++;

            if (this.loadingListener != null)
                this.loadingListener(this.progress / this.totalBeingLoaded);
            this.warn(resource.name + ' (' + resource.src + ') failed.');

            this._checkAllDone();
        },

        _checkAllDone: function () {
            if (this.progress >= this.totalBeingLoaded) {
                this.finished = true;
                this.loadedListener(this.progress, this.errored);
                this.progress = 0;
                this.errored = 0;
                this.totalBeingLoaded = 0;
            }

        }

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DataResource
 * @augments pc.Base
 * @description
 * A generic resource you can load data, such as JSON, XML or config files from a URL, just like an image or sound file.
 * <p>
 * To load a resource, use the pc.Loader to add a resource:
 * <pre><code>
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx'));
 * </code></pre>
 * <p>
 * Once you have the resource loaded you can access the contents of the resource using the data member:
 * <pre><code>
 * var xmlData = pc.device.loader.get('level1').resource.data;
 * </code></pre>
 * <p>
 * You can optionally provide a function to be called when the resource has finished loading or has an error.
 * <pre><code>
 * function onLevelDataLoaded(dataResource)
 * {
 *    // dataResource.data
 * }
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx', onLevelDataLoaded));
 * </code></pre>
 * <p>
 * The Scrollia demo game has an example using that loads the level.tmx file from the editor as a data resource which
 * is passed to pc.Scene to construct entities and layers.
 */
pc.DataResource = pc.Base.extend('pc.DataResource',
    {},
    /** @lends pc.DataResource.prototype */
    {
        /** Data resource that has been loaded */
        data: null,
        /** HTTP request object used to load the data */
        request: null,
        /** src URL */
        src: null,
        /** Short name for this resource */
        name: null,
        /** boolean indicating whether the resource has been loaded yet */
        loaded: false,
        /** current callback when the resource has been loaded */
        onLoadCallback: null,
        /** current callback if an error occurs whilst loading the resource */
        onErrorCallback: null,

        /**
         * Loads data from a remote (URI) resource.
         * @param {String} name Name to give the resource
         * @param {String} src URI for the data
         * @param {function} [onLoadCallback] Function to be called once the image has been loaded
         * @param {function} [onErrorCallback] Function to be called if the image fails to load
         */
        init: function (name, src, onLoadCallback, onErrorCallback) {
            this._super();
            this.src = pc.device.loader.makeUrl(src);
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
         * Triggers an immediate load of the resource. Use only if you're manually loading a resource, otherwise
         * the pc.Loader will automatically call load when it starts.
         * @param {function} [onLoadCallback] Optional function called when the resource has finished loading
         * @param {function} [onErrorCallback] Optional function called if the resource fails to load
         */
        load: function (onLoadCallback, onErrorCallback) {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            this.request.open('get', this.src);
            this.request.send(null);
        },

        /**
         * Force the reloading of a resource (by marking it not loaded and calling load
         */
        reload: function () {
            this.loaded = false;
            this.load();
        },

        /**
         * Called when the resource is loaded/ready. Generally this is used internally, and you should use the
         * onLoadCallback function optionally pass to the load method or constructor
         */
        onReadyStateChange: function () {
            if (this.loaded) return;

            if (this.request.readyState == 4) {
                if (this.request.status == 200) {
                    this.loaded = true;

                    this.data = this.request.responseText;

                    if (this.onLoadCallback)
                        this.onLoadCallback(this);
                } else if (this.request.status == 404) {
                    this.warn('resource ' + this.src + ' error ' + this.request.status);
                    if (this.onErrorCallback)
                        this.onErrorCallback(this);
                }
            }
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.components = {};

/**
 * @class pc.components.Component
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * The base class for components you want to create.
 */
pc.components.Component = pc.Pooled.extend('pc.components.Component',
    /** @lends pc.components.Component */
    {
        /**
         * Constructor that acquires the component from an object pool.
         * @return {pc.components.Component} A component object
         */
        create: function () {
            return this._super();
        }
    },
    /** @lends pc.components.Component.prototype */
    {
        /** entity I am on, or null if I'm not on an entity */
        _entity: null,

        _type: null,

        /** whether the component is currently active */
        active: true,

        /**
         * Constructs a new component using the given type string
         * @param {String} type The type to assign the component
         */
        init: function (type) {
            this._super();
            this._type = type;
            this.active = true;
        },

        /**
         * Get the component type
         * @return {String} The type
         */
        getType: function () {
            return this._type.toLowerCase();
        },

        /**
         * Get the entity this component is currently in; null if not in an entity
         * @return {pc.Entity} Entity
         */
        getEntity: function () {
            return this._entity;
        },

        /**
         * Called when the system is about to remove this component, which gives you a chance
         * to override and do something about it
         */
        onBeforeRemoved: function () {
        }


    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Alpha
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Changes the alpha drawing of an associated drawable object (sprite, shape, text etc).
 */
pc.components.Alpha = pc.components.Component.extend('pc.components.Alpha',
    /** @lends pc.components.Alpha */
    {
        /**
         * Constructs (or acquires) an alpha component.
         * @param {Number} options.level Amount of initial alpha to set
         * @return {pc.components.Alpha} The new alpha object
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Alpha.prototype */
    {
        /** Current alpha level 0=fully transparent */
        level: 1,

        /**
         * Constructs a new component. See create method for options
         */
        init: function () {
            this._super('alpha');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.level = pc.checked(options.level, 1);
        },

        /**
         * Set the alpha level
         * @param {Number} a Level to set alpha to
         */
        setAlpha: function (a) {
            this.level = a;
            this._fix(this.level);
        },

        /**
         * Add to the alpha level
         * @param {Number} a Amount to increase alpha by
         */
        addAlpha: function (a) {
            this.level += a;
            this._fix(this.level);
        },

        /**
         * Subtract from the alpha level
         * @param {Number} a Amount o subtract
         */
        subAlpha: function (a) {
            this.level -= a;
            this._fix(this.level);
        },

        _fix: function (c) {
            if (c > 1) return;
            if (c < 0) return;
            this.level = c;
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.JointType = {
    WELD: 0,
    REVOLUTE: 1,
    DISTANCE: 2
};

/**
 * @class pc.components.Joint
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Physics'>pc.systems.Physics</a>]
 * <p>
 * Creates a joint that holds to physics entities together.
 */
pc.components.Joint = pc.components.Component.extend('pc.components.Joint',
    /** @lends pc.components.Joint */
    {
        /**
         * Construct (or acquires) a new component with the options supplied
         * @param {pc.Entity} options.attachTo Entity to attach the joint to
         * @param {pc.Dim} options.offset Dim x, y of the pixel offset the joint is relative to the source entity
         * @param {pc.Dim} options.attachmentOffset Dim x, y of the offset of the joint on the attached entity
         * @param {Number} options.distance How long the joint is
         * @param {pc.JointType} options.type Type of joint (pc.JointType.WELD, pc.JointType.REVOLUTE, pc.JointType.DISTANCE)
         * @param {Number} options.dampingRatio Ratio for damping motion
         * @param {Number} options.lowerAngleLimit Limit angular movement this angle at the lowest
         * @param {Number} options.upperAngleLimit Limit angular movement this angle at the highest
         * @param {Boolean} options.enableLimit True is anglular limiting is enabled
         * @param {Number} options.maxMotorTorque Highest torque that motor can power to
         * @param {Number} options.motorSpeed Speed of the motor that drives joint turn
         * @param {Boolean} options.enableMotor Whether to engage the motor
         * @param {Number} options.angle Angle of the joint
         * @return {pc.components.Joint} A configured joint component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Joint.prototype */
    {
        /** The entity this joint attaches to */
        attachTo: null,
        /** Position offset of the joint on the source entity */
        offset: null,
        /** Position offset of the joint on the atached to entity */
        attachmentOffset: null,
        /** Distance / length of the joint */
        distance: 0,
        /** Type of joint -- see pc.JointType */
        type: 0,

        /** Frequency of the joint (distance joints only) */
        frequency: 0,
        /** Damping ratio (distance joints only) */
        dampingRatio: 0,

        /** Angle of the joint (revolute joints only) */
        angle: 0,
        /** Lower angle limit (revolute joints only) */
        lowerAngleLimit: 0,
        /** Upper angle limit (revolute joints only) */
        upperAngleLimit: 0,
        /** Whether angule limiting is in play (revolute joints only) */
        enableLimit: false,
        /** Maxmium torque of the motor (revolute joints only) */
        maxMotorTorque: 0,
        /** Whether the motor is enabled (revolute joints only) */
        enableMotor: 0,
        /** Speed of the motor (revolute joints only) */
        motorSpeed: 0,

        _joint: null,

        /**
         * Constructs a new joint (via new). See create method for options details.
         */
        init: function (options) {
            this._super('joint');
            this.offset = pc.Point.create(0, 0);
            this.attachmentOffset = pc.Point.create(0, 0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures a joint. See create method for options details.
         */
        config: function (options) {
            this.attachTo = pc.checked(options.attachedTo, null);
            if (options.offset)
                this.offset.setXY(pc.checked(options.offset.x, 0), pc.checked(options.offset.y, 0));
            if (options.attachmentOffset)
                this.attachmentOffset.setXY(pc.checked(options.attachmentOffset.x, 0), pc.checked(options.attachmentOffset.y, 0));

            this.distance = pc.checked(options.distance, 0);
            this.type = pc.checked(options.type, pc.JointType.WELD);

            this.dampingRatio = pc.checked(options.dampingRatio, 0);
            this.lowerAngleLimit = pc.checked(options.lowerAngleLimit, 0);
            this.upperAngleLimit = pc.checked(options.upperAngleLimit, 359);
            this.enableLimit = pc.checked(options.enableLimit, false);
            this.maxMotorTorque = pc.checked(options.maxMotorTorque, 100);
            this.enableMotor = pc.checked(options.enableMotor, false);
            this.motorSpeed = pc.checked(options.motorSpeed, 0);
            this.angle = pc.checked(options.angle, 0);

            this._joint = null;
        },

        /**
         * Gets the current angle of the joint
         * @return {Number} Angle
         */
        getAngle: function () {
            return pc.Math.radToDeg(this._joint.GetJointAngle());
        },

        /**
         * Gets the current speed of the motor
         * @return {Number} Current speed
         */
        getSpeed: function () {
            return this._joint.GetJointSpeed();
        },

        /**
         * Sets the motor speed
         * @param {Number} s Speed
         */
        setMotorSpeed: function (s) {
            this.motorSpeed = s;
            this._joint.SetMotorSpeed(s);
        },

        /**
         * Gets the current torque of the motor
         * @return {Number} Torque
         */
        getMotorTorque: function () {
            return this._joint.GetMotorTorque();
        },

        /**
         * Gets whether the angle limits are on
         * @return {Boolean} True is they are on
         */
        isLimitEnabled: function () {
            return this.enableLimit;
        },

        /**
         * Gets whether the motor is presently enabled
         * @return {Boolean} True is the motor is enabled
         */
        isMotorEnabled: function () {
            return this.enableMotor;
        },

        /**
         * Sets the max motor torque level (how fast she'll spin)
         * @param {Number} m Maxium
         */
        setMaxMotorTorque: function (m) {
            this.maxMotorTorque = m;
            this._joint.SetMaxMotorTorque(m);
        },

        /**
         * Gets the current max motor torque
         * @return {Number} The max
         */
        getMaxMotorTorque: function () {
            return this.maxMotorTorque;
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Expiry
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Expiry'>pc.systems.Expiry</a>]
 * <p>
 * Automatically expires an entity after a given time. Great for things like bullets that have a known lifetime;
 * just add the expiry component and it will happily kill itself (release) after the given time
 */
pc.components.Expiry = pc.components.Component.extend('pc.components.Expiry',
    /** @lends pc.components.Expiry */
    {
        /**
         * Constructs (or acquires from the pool) an expiry component.
         * @param {Number} options.lifetime Life time before expiry (in ms)
         * @return {pc.components.Expiry} The shiny new component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Expiry.prototype */
    {
        /** lifetime of the expiry */
        lifetime: 0,

        /**
         * Constructs a new component. See create method for options
         */
        init: function () {
            this._super('expiry');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.lifetime = pc.checked(options.lifetime, 1000);
        },

        /**
         * Reduce the lifetime
         * @param {Number} time Amount to reduce the lifetime by
         */
        decrease: function (time) {
            this.lifetime -= time;
        },

        /**
         * Gets whether the lifetime has expired (typically only the expiry system will use this)
         * @return {Boolean} True if it has expired
         */
        hasExpired: function () {
            return this.lifetime <= 0;
        }
    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.OriginShifter
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Shifts the origin of the entity relative to the origin of the layer it's on, with an additional origin ratio
 * adjuster. You can use this to make an entity shift around as the layer origin moves (parallax within parallax)
 */
pc.components.OriginShifter = pc.components.Component.extend('pc.components.OriginShifter',
    /** @lends pc.components.OriginShifter */
    {
        /**
         * Constructs (or acquires from the pool) a component, configuring it with the given options.
         * @param {Number} options.ratio The ratio to shift the position by
         * @return {*}
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.OriginShifter.prototype */
    {
        /** current shift ratio */
        ratio: 1,

        _offsetX: 0,
        _offsetY: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('originshifter');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.ratio = pc.checked(options.ratio, 1);
        }

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Spatial
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>, <a href='pc.systems.Physics'>pc.systems.Physics</a>,
 * <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Represents where an entity exists in 2D space (x, y, width and height). This component is mostly for use by other
 * systems to update and use.
 */
pc.components.Spatial = pc.components.Component.extend('pc.components.Spatial',
    /** @lends pc.components.Spatial */
    {
        /**
         * Constructs (or acquires from the pool) a spatial component configuring it with the given options
         * @param {pc.Point} options.pos Position (containing x, y) to place the entity
         * @param {pc.Dim} options.dim Size (containing x, y) of the entity (x=width, y=height)
         * @return {pc.components.Spatial} A shiney new component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Spatial.prototype */
    {
        /** Last movement in 2D space */
        lastMove: null,

        /** position of the entity as a pc.Point object (use pos.x and pos.y). */
        pos: null,
        /** dimension of the entity as a pc.Dim object (use dim.x for width and dim.y for height) */
        dim: null,
        /** amount the spatial is scaled on x-axis */
        scaleX: 0,
        /** amount the spatial is scaled on y-axis */
        scaleY: 0,
        dir: 0,

        _centerPos: null, // cache of the current center
        _screenRect: null, // cache of the getScreenRect return

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('spatial');

            this.pos = pc.Point.create(0, 0);
            this.dim = pc.Dim.create(0, 0);
            this._screenRect = pc.Rect.create(0, 0, 0, 0);
            this._centerPos = pc.Point.create(0, 0);
            this._unscaledPos = pc.Point.create(0, 0);
            this._unscaledDim = pc.Point.create(0, 0);
            this.lastMove = pc.Dim.create(0, 0);
            this.scaleX = 1;
            this.scaleY = 1;

            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.pos.x = pc.checked(options.x, 0);
            this.pos.y = pc.checked(options.y, 0);
            this.dim.x = pc.checked(options.w, 0);
            this.dim.y = pc.checked(options.h, 0);
            this.dir = pc.checked(options.dir, 0);
            this.scaleX = pc.checked(options.scaleX, 1);
            this.scaleY = pc.checked(options.scaleY, 1);

            this._centerPos.x = 0;
            this._centerPos.y = 0;
            this._screenRect.x = 0;
            this._screenRect.y = 0;
            this._screenRect.w = 0;
            this._screenRect.h = 0;
            this.lastMove.x = 0;
            this.lastMove.y = 0;
        },

        /**
         * Get the current position
         * @return {pc.Point} the current position
         */
        getPos: function () {
            return this.pos;
        },

        /**
         * Get the current dimensions (x, y)
         * @return {pc.Dim} Reference to the current pc.Dim for this spatial
         */
        getDim: function () {
            return this.dim;
        },

        /**
         * Increase the dimensions of the spatial by the given x and y scales. Scaling occurs relative to the
         * center of the spatial, so the position is moved accordingly
         * @param {Number} x x-axis scale to apply (can be negative to shrink)
         * @param {Number} y y-axis scale to apply (can be negative to shrink)
         */
        addScale: function (x, y) {
            this.pos.x -= Math.abs((this.dim.x - (this.dim.x * x)) / 2);
            this.pos.y -= Math.abs((this.dim.y - (this.dim.y * y)) / 2);
            this.dim.x *= (x);
            this.dim.y *= (y);
            this.scaleX += x;
            this.scaleY += y;
        },

        _unscaledPos: null,

        /**
         * Gets the spatial position, without any scaling effects
         * @return {pc.Point} The unscaled position
         */
        getUnscaledPos: function () {
            this._unscaledPos.x = this.pos.x / this.scaleX;
            this._unscaledPos.y = this.pos.y / this.scaleY;
            return this._unscaledPos;
        },

        _unscaledDim: null,

        /**
         * Gets the spatial dimensions, without any scaling effects
         * @return {pc.Dim} The unscaled dimensions
         */
        getUnscaledDim: function () {
            this._unscaledDim.x = this.dim.x / this.scaleX;
            this._unscaledDim.y = this.dim.y / this.scaleY;
            return this._unscaledDim;
        },

        /**
         * Reduces the scale of the spatial. See addScale for details
         * @param {Number} x x-axis scale to reduce by
         * @param {Number} y y-axis scale to reduce by
         */
        subtractScale: function (x, y) {
            this.addScale(-x, -y);
        },

        /**
         * Set the spatial direction
         * @param {Number} d Direction to set
         */
        setDir: function (d) {
            this.dir = d;
        },

        /**
         * Get the current direction
         * @return {Number} Direction
         */
        getDir: function () {
            return this.dir;
        },

        /**
         * Get the center pos of the spatial (calculated when you call this)
         * @return {pc.Point} A pc.Point representing the center of the spatial (cached so you do not need to release it)
         */
        getCenterPos: function () {
            this._centerPos.x = this.pos.x + (this.dim.x / 2);
            this._centerPos.y = this.pos.y + (this.dim.y / 2);
            return this._centerPos;
        },

        /**
         * Gets a pc.Rect of the screen relative location of this spatial (i.e. not world space)
         * @return {pc.Rect} on-screen rectangle (cached, so you should not release it). Null if not on a layer.
         */
        getScreenRect: function () {
            if (this._entity && this._entity.layer) {
                this._screenRect.x = this._entity.layer.screenX(this.pos.x);
                this._screenRect.y = this._entity.layer.screenY(this.pos.y);
                this._screenRect.w = this.dim.x;
                this._screenRect.h = this.dim.y;
                return this._screenRect;
            }
            return null;
        },

        /**
         * A nice string representation of the spatial
         * @return {String} A string representation
         */
        toString: function () {
            return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z + ' dir: ' + this.dir;
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Overlay
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Used to lay another sprite over an entity, with options to automagically expire after a certain time limit.
 * Good for things like smoke, explosive damage or muzzle flashs, and where you don't need to create a complete
 * entity.
 */
pc.components.Overlay = pc.components.Component.extend('pc.components.Overlay',
    /** @lends pc.components.Overlay */
    {
        /**
         * Constructs (or acquires an object from the pool) with the given options.
         * @param {Number} options.lifetime Lifetime of the overlay (will automatically remove itself)
         * @param {pc.SpriteSheet} options.spriteSheet Sprite sheet to use for the animation
         * @param {String} options.animationStart Which animation to play in the sprite
         * @param {Number} options.animationStartDelay Amount of time in ms to increase or decrease the animation speed
         * @return {pc.components.Overlay} An overlay component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Overlay.prototype */
    {
        /** lifetime the overlay will display for */
        lifetime: 0,
        /** sprite object this overlay displays */
        sprite: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('overlay');
            this.sprite = pc.Sprite.create();
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.lifetime = pc.checked(options.lifetime, 1000);

            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);
        },

        /**
         * Descreases the amount of time the sprite should stay alive for
         * @param {Number} time Time to reduce by in ms
         */
        decrease: function (time) {
            this.lifetime -= time;
        },

        /**
         * Tests if the sprite has expired already
         * @return {Boolean} True if it has expired
         */
        hasExpired: function () {
            return this.lifetime <= 0;
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Clip
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Clips all rendering for an entity to be within the specified rect (in layer relative coordinates)
 * You can also specify an entity, which will clip based on the spatial rectangle of the other entity
 * You can also do both entity clipping as well as stacking a rectangle clip on top
 */
pc.components.Clip = pc.components.Component.extend('pc.components.Clip',
    /** @lends pc.components.Clip */
    {
        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Clip.prototype */
    {
        /** Clip this entity to the bounding rectangle of another entity */
        clipEntity: null,
        /** x-position of the top left of the clipping rectangle */
        x: 0,
        /** y-position of the top left of the clipping rectangle */
        y: 0,
        /** Width the clipping rectangle */
        w: 0,
        /** Height the clipping rectangle */
        h: 0,

        /**
         * Constructs (or acquires) a clipping component
         */
        init: function () {
            this._super('clip');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.clipEntity = pc.checked(options.clipEntity, null);
            this.x = pc.checked(options.x, 0);
            this.y = pc.checked(options.y, 0);
            this.w = pc.checked(options.w, 0);
            this.h = pc.checked(options.h, 0);
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Activator
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Activation'>pc.systems.Activation</a>]
 * <p>
 * Causes an entity to be inactive (no rendering or physics etc) until another entity moves within range of it.
 * Great for autosleeping all your monsters until the player gets close.
 */
pc.components.Activator = pc.components.Component.extend('pc.components.Activator',
    /** @lends pc.components.Activator */
    {
        /**
         * Constructs a new activator component (by acquiring it from the pool).
         * @param {String} options.tag Tag to look for. When an entity with this tag gets close... bing!
         * @param {pc.Layer} options.layer The layer the target enitty is on
         * @param {Number} options.range How close the tagged entity has to be to cause activation
         * @param {Boolean} options.stayActive Stay active once active, otherwise go inactive if range exceeds (default false)
         * @return {pc.components.Activator} The component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Activator.prototype */
    {
        /**
         * entities with this tag to track -- if entity moves within range, the entity with this component will become active
         */
        tag: null,

        /**
         * Layer name to look for the activation entity, default is the same layer as the entity (null)
         */
        layer: null,

        /**
         * Range (in pixels) to cause activation.
         */
        range: 0,

        /**
         * Whether the entity should stay active once activated, otherwise if the range exceeds the distance the
         * entity will go back to sleep
         */
        stayActive: false,

        _cacheLayer: null,

        /**
         * Constructs a clipping component
         */
        init: function () {
            this._super('activator');
        },

        /**
         * Configures the component. See create method for options.
         * @param {Object} options Options
         */
        config: function (options) {
            if (!options.tag)
                throw 'Activator requires an entity to track against';

            this.tag = options.tag;
            this.layer = pc.checked(options.layer, null);
            this.range = pc.checked(options.range, 300);
            this.stayActive = pc.checked(options.stayActive, false);
        }



    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Input
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Input'>pc.systems.Input</a>]
 * <p>
 * Convenience component that lets you bind input states and actions to an entity.
 * In options provide an array of states and actions, with the associated input, e.g.
 * <pre><code>
 * states:
 * [
 *      ['moving right', ['D', 'TOUCH', 'RIGHT']],
 *      ['moving left', ['A', 'LEFT']],
 *      ['jumping', ['W', 'UP']],
 *      ['jumping', ['MOUSE_BUTTON_LEFT_DOWN', 'SPACE'], false],
 * ],
 * actions:
 * [
 *      ['fire', ['SPACE']]
 * ]
 * </code></pre>
 * Note the use of a positional input (the mouse left button click for attack). This takes an optional extra
 * boolean to set whether the positional event should be contained with the on-screen spatial rectangle of the entity.
 * In this case, true means only engage the attack state if the click is on the player; false means you can click
 * anywhere on-screen.
 */
pc.components.Input = pc.components.Component.extend('pc.components.Input',
    /** @lends pc.components.Input */
    {
        /**
         * Constructs (or acquires from the pool) an input component.
         * @param {Array} options.states Array of states, e.g. states:['fire',['SPACE','D']];
         * @param {Array} options.actions Array of actions, e.g. actions:['fire',['SPACE','D']];
         * @param {pc.Entity} [options.target] Optional target entity. If set, actions and states will be set on this,
         * not the entity that contains the component. It will only be used for spatial positional.
         * @return {pc.components.Spatial} A shiny new input component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Input.prototype */
    {
        /** target entity where states and actions will be sent */
        target: null,

        /** array of input states */
        states: null,
        /** array of input actions */
        actions: null,

        _bound: false,

        /**
         * Internal constructor: use .create
         */
        init: function (options) {
            this._super('input');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            if (!options.states && !options.actions)
                throw 'Input requires at least an action or state set';

            this.states = options.states;
            this.actions = options.actions;
            this.target = options.target;
        }
    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Fade
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Adds a fade effects to the entity. e.g.
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Fade.create( { holdTime: 1300, fadeOutTime:200 } ) );
 * </code></pre>
 */
pc.components.Fade = pc.components.Component.extend('pc.components.Fade',
    /** @lends pc.components.Fade */
    {
        /**
         * Constructs (or acquires from the pool) a fade component
         * @param {Number} options.startDelay ms to wait before doing anything
         * @param {Number} options.fadeInTime time to fade in (in ms)
         * @param {Number} options.fadeOutTime time to fade out (in ms)
         * @param {Number} options.holdTime time to hold between fading in and fading out (in ms)
         * @param {Number} options.loops number of loops (0=infinite)
         * @return {pc.components.Fade} A configured fade component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Fade.prototype */
    {
        /** ms to wait before doing anything */
        startDelay: 0,
        /** time to fade in (in ms) */
        fadeInTime: 0,
        /** time to fade out (in ms) */
        fadeOutTime: 0,
        /** time to hold between fading in and fading out (in ms) */
        holdTime: 0,
        /** when the current state started */
        startTime: 0,
        /** how long before we need to change states */
        timeLimit: 0,
        /** current state */
        state: 0,
        /** number of loops (0=infinite) */
        loops: 1,

        /** read-only for how many loops have been completed */
        loopsSoFar: 0,

        /**
         * Constructs a new component. See create method for options
         */
        init: function () {
            this._super('fade');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.startDelay = pc.checked(options.startDelay, 0);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.holdTime = pc.checked(options.holdTime, 0);
            this.loops = pc.checked(options.loops, 1);
            this.timeLimit = 0;
            this.state = 0;
            this.loopsSoFar = 0;
        }
    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Spin
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Makes an entity spin
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Spin.create( { rate: 15 } ) );
 * </code></pre>
 */
pc.components.Spin = pc.components.Component.extend('pc.components.Spin',
    /** @lends pc.components.Spin */
    {
        /**
         * Constructs (or acquires from the pool) a fade component
         * @param {Number} options.rate rate of spin in degrees per second (default is 15)
         * @param {Number} options.max Amount to spin (optional, default is 0 - unlimited)
         * @param {Boolean} options.clockwise Whether to spin in a clockwise direction (default is true)
         * @return {pc.components.Spin} A configured component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Spin.prototype */
    {
        /** rate of spin in degrees per second */
        rate: 0,
        /** number of degrees to spin */
        max: 0,
        /** spin clockwise or counter clockwise */
        clockwise: true,
        /** degrees spun so far */
        spinSoFar: 0,
        /** still spinning */
        spinning: true,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('spin');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.rate = pc.checked(options.rate, 15);
            this.max = pc.checked(options.max, 0);
            this.clockwise = pc.checked(options.clockwise, true);
            this.spinSoFar = 0;
            this.spinning = true;
        }
    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Scale
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Change the draw scale of an entity
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Scale.create( { x: 0.1, y: 0.1, growX: 4, growY: 4, maxX: 8, maxY: 8 } ) );
 * </code></pre>
 */
pc.components.Scale = pc.components.Component.extend('pc.components.Scale',
    /** @lends pc.components.Scale */
    {
        /**
         * Constructs (or acquires from the pool) a scale component
         * @param {Number} options.x initial x-axis scale
         * @param {Number} options.y initial y-axis scale
         * @param {Number} options.growX amount to grow x-axis per second (can be negative)
         * @param {Number} options.growY amount to grow y-axis per second (can be negative)
         * @param {Number} options.maxX maximum x-axis scale change
         * @param {Number} options.maxY maximum y-axis scale change
         * @return {pc.components.Scale} A configured component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Scale.prototype */
    {
        /** original scale applied to the spatial (only done once when binding the component) */
        x: 1,
        /** original scale applied to the spatial (only done once when binding the component) */
        y: 1,
        /** rate to grow the x-axis scale (can be negative) */
        growX: 0,
        /** rate to grow the y-axis scale (can be negative) */
        growY: 0,
        /** maximum x-axis scale change (positive or negative) */
        maxX: 0,
        /** maximum y-axis scale change (positive or negative) */
        maxY: 0,
        /** amount we have scaled so far (read-only) */
        scaledXSoFar: 0,
        /** amount we have scaled so far (read-only) */
        scaledYSoFar: 0,
        /** still scaling or not */
        scaling: true,

        _bound: false,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('scale');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.x = pc.checked(options.x, 1);
            this.y = pc.checked(options.y, 1);
            this.growX = pc.checked(options.growX, 0);
            this.growY = pc.checked(options.growY, 0);
            this.maxX = pc.checked(options.maxX, 0);
            this.maxY = pc.checked(options.maxY, 0);
            this.scaledXSoFar = 0;
            this.scaledYSoFar = 0;
        }
    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Rect
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a rectangle to an entity.
 * <p>
 * To modify rectangle color at runtime, you can change the value of the lineColor and color
 * members by calling set (they are instances of pc.Color). For example:
 * <pre><code>
 *     myEntity.getComponent('rect').lineColor.set( [128, 128, 128] )
 * </code></pre>
 */
pc.components.Rect = pc.components.Component.extend('pc.components.Rect',
    /** @lends pc.components.Rect */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {Number} options.cornerRadius Radius of the corners (defaults to 0)
         * @return {pc.components.Rect} A rectangle component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Rect.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        lineColor: null,
        /** Stroke width */
        lineWidth: 0,
        /** radius of the corners (0=straight edges) */
        cornerRadius: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('rect');
            this.color = null;
            this.lineColor = null;
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            if (options.color) {
                if (this.color == null)
                    this.color = pc.Color.create();

                this.color.set(options.color); // can be null
            } else
                this.color = null;

            if (options.lineColor) {
                if (!this.lineColor)
                    this.lineColor = pc.Color.create();

                this.lineColor.set(options.lineColor);
            } else
                this.lineColor = null;

            this.lineWidth = pc.checked(options.lineWidth, 1);
            this.cornerRadius = pc.checked(options.cornerRadius, 0);
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Poly
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Draw a polygon
 */
pc.components.Poly = pc.components.Component.extend('pc.components.Poly',
    /** @lends pc.components.Poly */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {Number} options.points Array of points to draw
         * @return {pc.components.Poly} The new component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Poly.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        lineColor: null,
        /** Stroke width */
        lineWidth: 0,
        /** array of points to draw */
        points: [],

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('poly');
            this.color = pc.Color.create('#ffffff');
            this.lineColor = null;
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            if (!options.color)
                this.color.set('#ffffff');
            else
                this.color.set(pc.checked(options.color, '#ffffff'));

            if (pc.valid(options.lineColor)) {
                if (this.lineColor == null)
                    this.lineColor = pc.Color.create(options.lineColor);
                else
                    this.lineColor.set(pc.checked(options.lineColor, '#888888'));
            }
            this.lineWidth = pc.checked(options.lineWidth, 0);
            if (options.points.length < 3)
                throw 'Invalid polygon, requires at least 3 points';
            this.points = options.points;
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Circle
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Draw a circle. The size is based on the width and height of the associated spatial.
 */
pc.components.Circle = pc.components.Component.extend('pc.components.Circle',
    /** @lends pc.components.Circle */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @return {pc.components.Circle} The new component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Circle.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        lineColor: null,
        /** Stroke width */
        lineWidth: 0,

        /**
         * Constructs a new component. See create method for options
         */
        init: function () {
            this._super('circle');
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            if (options.color) {
                if (this.color == null)
                    this.color = pc.Color.create(options.color);
                else
                    this.color.set(options.color);
            } else
                this.color = null;

            if (options.lineColor) {
                if (this.lineColor == null)
                    this.lineColor = pc.Color.create(options.lineColor);
                else
                    this.lineColor.set(options.lineColor);
            } else
                this.lineColor = null;

            this.lineWidth = pc.checked(options.lineWidth, 0);
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Text
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds display text to an entity.
 */
pc.components.Text = pc.components.Component.extend('pc.components.Text',
    /** @lends pc.components.Text */
    {
        /**
         * Constructs (or acquires from the pool) a text component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.strokeColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {String} options.font Name of the font
         * @param {Number} options.fontHeight Size/height of the font (i.e. 20 for 20pt)
         * @param {String} options.text String to display
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the text.
         * @return {pc.components.Text} A text component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Text.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        strokeColor: null,
        /** Font name (read-only - use setFont) */
        font: null,
        /** Font size: 20 = 20pt (read-only - use setHeight) */
        fontHeight: 0,
        /** Display text */
        text: null,
        /** Stroke width */
        lineWidth: 0,
        /** Offset position of the text relative to the entity spatial */
        offset: null,

        _fontCache: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('text');
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            this.text = [];
            this.font = 'Calibri';
            this.fontHeight = 20;
            this.offset = pc.Dim.create(0, 0);
            this._fontCache = '';
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this.color.set(pc.checked(options.color, '#ffffff'));
            this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));
            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.text = pc.checked(options.text, ['']);
            this.font = pc.checked(options.font, 'Arial');
            this.fontHeight = pc.checked(options.fontHeight, 20);
            if (pc.valid(options.offset)) {
                this.offset.x = pc.checked(options.offset.x);
                this.offset.y = pc.checked(options.offset.y);
            }
            this._updateFont();
        },

        /**
         * Sets the font height
         * @param {Number} height Height in points (20=20pt)
         */
        setHeight: function (height) {
            this.fontHeight = height;
            this._updateFont();
        },

        /**
         * Sets the font
         * @param {String} font Name of the font (i.e. 'Arial')
         */
        setFont: function (font) {
            this.font = font;
            this._updateFont();
        },

        _updateFont: function () {
            this._fontCache = '' + this.fontHeight + 'px ' + this.font;
        }


    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Sprite
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a sprite to an entity. See the core <a href='pc.Sprite'>sprite</a> class for information on sprites.
 */
pc.components.Sprite = pc.components.Component.extend('pc.components.Sprite',
    /** @lends pc.components.Sprite */
    {
        /**
         * Constructs (or acquires from the pool) a sprite component.
         * @param {pc.Sprite} options.sprite Sprite object to use
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the sprite.
         * @return {pc.components.Sprite} A newly configured sprite component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Sprite.prototype */
    {
        /** sprite object */
        sprite: null,
        /** Offset position of the sprite relative to the entity spatial */
        offset: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('sprite');
            this.sprite = pc.Sprite.create();
            this.offset = pc.Point.create(0, 0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            if (pc.valid(options.offset)) {
                this.offset.x = pc.checked(options.offset.x, 0);
                this.offset.y = pc.checked(options.offset.y, 0);
            } else {
                this.offset.x = 0;
                this.offset.y = 0;
            }

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);

            this.sprite.currentFrame = pc.checked(options.currentFrame, 0);
        }



    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Layout
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Automatically positions an entity on screen using a variety of layout options.
 * <p>
 * To use automated layout, add the layout system to the layer containing the entity:
 * <pre><code>
 * gameLayer.addSystem(new pc.systems.Layout());
 * </code></pre>
 * You can then add a layout component to an entity. The layout system will then automatically position the entity
 * bassed on the chosen alignment, and accomodating a given margin.
 * <pre><code>
 * entity.addComponent(pc.components.Layout.create(
 *     { vertical:'middle', horizontal:'right', margin:{ right:80 } }));
 * </code></pre>
 * Multiple items will be stacked vertically.
 */
pc.components.Layout = pc.components.Component.extend('pc.components.Layout',
    /** @lends pc.components.Layout */
    {
        /**
         * Constructs (or acquires from the pool) a layout component
         * @param {String} options.vertical Vertical positioning: 'top', 'middle', 'bottom'
         * @param {String} options.horizontal Horizontal positioning: 'left', 'center', 'right'
         * @param {Object} options.margin Margin for the entity (ie. margin.left, right, top, bottom)
         * @return {pc.components.Layout} A newly configured layout component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Layout.prototype */
    {
        /** Vertical positioning: 'top', 'middle', 'bottom' */
        vertical: null,
        /** Horizontal positioning: 'left', 'center', 'right' */
        horizontal: null,
        /** margin offset to the position */
        margin: null,

        /**
         * Constructs a new component. See create method for options
         */
        init: function () {
            this._super('layout');
            this.margin = {};
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            if (pc.checked(options.margin)) {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }

            this.horizontal = pc.checked(options.horizontal, 'left');
            this.vertical = pc.checked(options.vertical, 'top');
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.ParticleEmitter
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Particles'>pc.systems.Particles</a>]
 * <p>
 * A particle generator.
 */
pc.components.ParticleEmitter = pc.components.Component.extend('pc.components.ParticleEmitter',
    /** @lends pc.components.ParticleEmitter */
    {
        /**
         * Constructs (or acquires from the pool) a particle emitter component
         * @param {Object} options See member list for available options
         * @return {pc.components.ParticleEmitter} A newly configured emitter component
         */
        create: function (options) {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.ParticleEmitter.prototype */
    {
        /** set to false to pause the emitter (and all emissions) */
        active: true,
        /** set to false to stop new emissions, but still update existing ones */
        emitting: true,
        /** minimum amount to grow particles at (negative values shrink) x-axis */
        growXMin: 0,
        /** maximum amount to grow particles at x-axis (defaults to growXMin) */
        growXMax: 0,
        /** minimum amount to grow particles at (negative values shrink) y-axis */
        growYMin: 0,
        /** maximum amount to grow particles at y-axis (defaults to growYMin) */
        growYMax: 0,
        /** scaling of the image on x-axis (minimum) */
        scaleXMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleXMax: 0,
        /** scaling of the image on y-axis (minimum) */
        scaleYMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleYMax: 0,
        /** time to spend fading in the particle */
        fadeInTime: 0,
        /** time spent fading out the particle */
        fadeOutTime: 0,
        /** minimum angle (direction) to fire a particle in */
        angleMin: 0,
        /** maximum angle (direction) to fire a particle in */
        angleMax: 0,
        /** minimum speed */
        thrustMin: 0,
        /** (optional) maximum speed (default is speed minimum */
        thrustMax: 0,
        /** how long to thrust for */
        thrustTime: 0,
        /** min amount of spin on the particle (in degrees per second) */
        spinMin: 0,
        /** max spin (random spin chosen between min and max) */
        spinMax: 0,
        /** distribution of particles over x range */
        rangeX: 1,
        /** distribution of particles over y */
        rangeY: 1,
        /** number to fire out on each emission */
        burst: 1,
        /** delay time between emissions in ms */
        delay: 25,
        /** spritesheet to use (a particle = a frame) */
        spriteSheet: null,
        /** minimum life span of particles */
        lifeMin: 0,
        /** max life span (random life span = max-min) */
        lifeMax: 0,
        /** whether sprite should rotate with angle changes */
        rotateSprite: false,
        /** x position offset (from the position of the entity) */
        offsetX: null,
        /** y position offset (from the position of the entity) */
        offsetY: null,
        /** composite operation on the image */
        compositeOperation: null,
        /** whether particle angles should be relative to the entity I'm attached to */
        relativeAngle: true,
        /** number of shots the emitter shold fire (self destructs after this). 0=repeat continuously */
        shots: 0,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMin: 1,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMax: 1,
        /** delay before changing alpha */
        alphaDelay: 0,

        _particles: null,
        _lastEmitTime: 0,
        _shotCount: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function (options) {
            this._super('emitter');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Reset the emitter to start again
         */
        reset: function () {
            this._shotCount = 0;
            this._lastEmitTime = 0;
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function (options) {
            this._lastEmitTime = 0;
            this._shotCount = 0;

            this.active = pc.checked(options.active, true);
            this.emitting = pc.checked(options.emitting, true);
            this.growXMin = pc.checked(options.growXMin, 0);
            this.growXMax = pc.checked(options.growXMax, this.growXMin);
            this.growYMin = pc.checked(options.growYMin, 0);
            this.growYMax = pc.checked(options.growYMax, this.growYMin);
            this.scaleXMin = pc.checked(options.scaleXMin, 1);
            this.scaleYMin = pc.checked(options.scaleYMin, 1);
            this.scaleXMax = pc.checked(options.scaleXMax, 1);
            this.scaleYMax = pc.checked(options.scaleYMax, 1);
            this.compositeOperation = pc.checked(options.compositeOperation, null);
            this.alphaMin = pc.checked(options.alphaMin, 1);
            this.alphaMax = pc.checked(options.alphaMax, this.alphaMin);
            this.alphaDelay = pc.checked(options.alphaDelay, 50);
            this.shots = pc.checked(options.shots, 0);
            this.relativeAngle = pc.checked(options.relativeAngle, true);

            this.rangeX = pc.checked(options.rangeX, 1);
            this.rangeY = pc.checked(options.rangeY, 1);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.angleMin = pc.checked(options.angleMin, 0);
            this.angleMax = pc.checked(options.angleMax, 359);
            this.thrustMin = pc.checked(options.thrustMin, 1);
            this.thrustMax = pc.checked(options.thrustMax, this.thrustMin);
            this.thrustTime = pc.checked(options.thrustTime, 100);
            this.burst = pc.checked(options.burst, 1);
            this.delay = pc.checked(options.delay, 25);
            this.lifeMin = pc.checked(options.lifeMin, 100);
            this.lifeMax = pc.checked(options.lifeMin, this.lifeMin);
            this.rotateSprite = pc.checked(options.rotateSprite, false);
            this.spinMin = pc.checked(options.spinMin, 0);
            this.spinMax = pc.checked(options.spinMax, this.spinMin);
            this.offsetX = pc.checked(options.offsetX, 0);
            this.offsetY = pc.checked(options.offsetY, 0);
            this.gravityX = pc.checked(options.gravityX, 0);
            this.gravityY = pc.checked(options.gravityY, 0);
            this.maxVelX = pc.checked(options.maxVelX, 50);
            this.maxVelY = pc.checked(options.maxVelY, 50);

            if (!pc.valid(options.spriteSheet))
                throw "A spritesheet is required for the emitter";
            else
                this.spriteSheet = options.spriteSheet;

            if (!Array.isArray(this._particles))
                this._particles = new pc.LinkedList();
            else
                this._particles.clear();
        },

        onBeforeRemoved: function () {
            // being removed from entity, so need to release any particles that
            // are left back into the pool
            var p = this._particles.first;
            while (p) {
                p.obj.release();
                p = p.next();
            }
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.systems = {};

/**
 * @class pc.systems.System
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The base class for all systems. See the entity systems guide for more information on creating your own systems.
 */

pc.systems.System = pc.Base.extend('pc.System',
    /** @lends pc.systems.System */
    { },
    /** @lends pc.systems.System.prototype */
    {
        /** layer this system is on */
        layer: null,
        /** array of string component types this system handles */
        componentTypes: null,
        /** reference to the systems system manager (read-only) */
        systemManager: null,
        /** optional delay for running this system, default is 0 (which means run every cycle) */
        delay: 0,

        _lastRun: 0,

        /**
         * Constructs a new system
         * @param {Array} componentTypes Array of strings representing the component types this system will handle
         * @param {Number} delay Amount of time delay in ms between runs. i.e. systems that don't need to run every.
         */
        init: function (componentTypes, delay) {
            this._super();
            this.delay = pc.checked(delay, 0);
            if (!componentTypes instanceof Array)
                throw "Invalid component types array. Use a blank array ([]) if there are no components handled by the system.";
            this.componentTypes = componentTypes;
        },

        /**
         * Called by the system manager to allow this system to take care of business. This default does nothing.
         */
        processAll: function () {
        },

        /**
         * Called by the system when the layer has changed size
         */
        onResize: function () {
        },

        /**
         * Called by the system when the origin changes
         */
        onOriginChange: function (x, y) {
        },

        /**
         * Called when this system instance is added to a layer
         */
        onAddedToLayer: function (layer) {
        },

        /**
         * Called when this system instance is removed from a layer
         */
        onRemovedFromLayer: function (layer) {
        }
    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityManager
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Manages entities in a layer. This is the primary entity manager for the entity system. It contains, indexes and
 * handles the lifecycle of all entities.
 *
 * Unless you are building your own systems in a complex way, you should be using the pc.EntityLayer to handle
 * general entity management.
 */
pc.EntityManager = pc.Base.extend('pc.EntityManager',
    /** @lends pc.EntityManager */
    {},
    /** @lends pc.EntityManager.prototype */
    {
        /** Index of all entities by tag */
        entitiesByTag: null,
        /** All the components indexed by entityID (as a linked list) */
        componentsByEntity: null,
        /** All the components, indexed by entityId and componentType (catted) */
        componentsByEntityPlusType: null,

        /** Linked list of all entities */
        entities: null,
        /** entities to be removed at the end of processing */
        entitySuicides: null,
        /** the layer this entitymanager is within (set by the layer class) */
        layer: null,

        /**
         * Constructs a new entity manager
         * @param {pc.EntityLayer} layer The entity layer this entity manager is doing work for
         */
        init: function (layer) {
            this.layer = layer;
            this.entitiesByTag = new pc.HashList();
            this.entities = new pc.LinkedList();
            this.componentsByEntity = new pc.Hashmap();
            this.componentsByEntityPlusType = new pc.Hashmap();
            this.entitySuicides = new pc.LinkedList();
        },

        /**
         * Called by the core game loop to give the manager a chance to cleanup
         */
        cleanup: function () {
            var entity = this.entitySuicides.first;
            while (entity) {
                this._doRemoveEntity(entity.object());
                entity = entity.next();
            }

            this.entitySuicides.clear();
        },

        /**
         * Adds an entity to the manager
         * @param {pc.Entity} entity Entity to add
         * @param {String} [tag] A convenient way to add an entity and tag at the same time
         */
        add: function (entity, tag) {
            // add the entity to our big global map
            this.entities.add(entity);
            if (tag != undefined)
                this.entitiesByTag.add(tag, entity);

            // add this entity to the component type indexes
            var componentMap = entity.getAllComponents();
            if (componentMap != null) {
                var components = componentMap.values();
                for (var i = 0; i < components.length; i++)
                    this._addToComponentMap(entity, components[i]);
            }

            // let the system manager take care of business
            this.layer.systemManager._handleEntityAdded(entity);
        },

        /**
         * Removes an entity from the manager
         * @param {pc.Entity} entity Entity to remove
         */
        remove: function (entity) {
            if (!this.entitySuicides.has(entity)) {
                this.entitySuicides.add(entity);
                entity.active = false;
            }
        },

        /**
         * Removes a component from an entity, and releases it back to the pool
         * @param {pc.Entity} entity Entity to remove the component from
         * @param {pc.components.Component} component Component to remove
         */
        removeComponent: function (entity, component) {
            this._removeFromComponentMap(entity, component);
            this.layer.systemManager._handleComponentRemoved(entity, component);
            entity._handleComponentRemoved(component);
            component._entity = null;
        },

        /**
         * Adds a tag to an entity
         * @param {pc.Entity} entity Entity to add the tag to
         * @param {String} tag Tag to assign to the entity
         */
        addTag: function (entity, tag) {
            if (entity.tags.indexOf(tag.toLowerCase()) != -1) return;

            this.entitiesByTag.add(tag.toLowerCase(), entity);
            entity.tags.push(tag.toLowerCase());
        },

        /**
         * Removes a tag from an entity
         * @param {pc.Entity} entity Entity to remove the tag from
         * @param {String} tag Tag to remove
         */
        removeTag: function (entity, tag) {
            this.entitiesByTag.remove(tag.toLowerCase(), entity);
            pc.Tools.arrayRemove(entity.tags, tag.toLowerCase());
        },

        /**
         * Gets all the entities that have a given tag
         * @param {String} tag Tag to match
         * @return {pc.LinkedList} List of entities
         */
        getTagged: function (tag) {
            return this.entitiesByTag.get(tag.toLowerCase());
        },

        /**
         * Makes an entity active (processed by systems).
         * @param entity {pc.Entity} Entity to make active
         */
        activate: function (entity) {
            if (entity.active) return;

            this.layer.systemManager._handleEntityAdded(entity);
            entity.active = true;
        },

        /**
         * Makes an entity inactive (no longer processed)
         * @param {pc.Entity} entity Entity to deactivate
         */
        deactivate: function (entity) {
            if (!entity.active) return;

            // remove from the systems - we still keep it in the entitymanager lists, but remove it
            // from the systems so it wont be processed anymore
            this.layer.systemManager._handleEntityRemoved(entity);

            // mark as inactive
            entity.active = false;
        },

        _doRemoveEntity: function (entity) {
            this.entities.remove(entity);
            var componentMap = entity.getAllComponents();
            if (componentMap != null) {
                var components = componentMap.values();
                for (var i = 0; i < components.length; i++)
                    this._removeFromComponentMap(entity, components[i]);
            }

            // remove entities from any tag map it exists in
            for (var t = 0; t < entity.tags.length; t++)
                this.entitiesByTag.remove(entity.tags[t], entity);

            this.layer.systemManager._handleEntityRemoved(entity);

            entity.release();
        },

        /**
         * Add a component to an entity
         * @param {pc.Entity} entity Entity to add the component to
         * @param {pc.components.Component} component Component to add
         * @return {pc.components.Component} Component that was added (for convience)
         */
        addComponent: function (entity, component) {
            // make sure this entity is in the correct component maps
            this._addToComponentMap(entity, component);
            entity._handleComponentAdded(component);
            this.layer.systemManager._handleComponentAdded(entity, component);
            component._entity = entity;
            return component;
        },

        /**
         * Get a component of a given class from an entity
         * @param {pc.Entity} entity Entity that has the component you're looking for
         * @param {String} componentType Class of component to get (e.g. pc.component.Position)
         */
        getComponent: function (entity, componentType) {
            return this.componentsByEntityPlusType.get(entity.objectId + ':' + componentType);
        },

        /**
         * Gets the components in an entity
         * @param {pc.Entity} entity Entity you want the components of
         * @return {pc.Hashtable} Hashtable of components keyed by component type
         */
        getComponents: function (entity) {
            return this.componentsByEntity.get(entity.objectId);
        },

        /**
         * Checks if a given entity contains a component of a given type
         * @param {pc.Entity} entity Entity to check
         * @param {String} componentType Type to check for
         */
        hasComponentOfType: function (entity, componentType) {
            return this.componentsByEntityPlusType.containsKey(entity.objectId + ':' + componentType);
        },

        //
        // INTERNALS
        //
        _addToComponentMap: function (entity, component) {
            // Seeing a getType error here? Likely, you didn't call .create on your component? just maybe? hint hint
            if (this.componentsByEntityPlusType.get(entity.objectId + ':' + component.getType())) {
                // multiple components of the same type are not supported due to performance reasons
                throw ('adding component ' + component.getType() +
                    ' to entity ' + entity + ' when it already has one of that type');
            }
            this.componentsByEntityPlusType.put(entity.objectId + ':' + component.getType(), component);
            // seeing a getType error above? -- you forgot to use .create when constructing the component
            this.componentsByEntity.put(entity.objectId, component);
        },

        _removeFromComponentMap: function (entity, component) {
            // need to handle removing an entity that has attachments, remove the attached entities as well
            component.onBeforeRemoved();

            this.componentsByEntityPlusType.remove(entity.objectId + ':' + component.getType());
            this.componentsByEntity.remove(entity.objectId);
            component.release();
        }



    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.SystemManager
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Manages systems that are within a layer.
 *
 * Unless you are building your own systems in a complex way, you should be using the pc.EntityLayer to handle
 * general system management.
 */
pc.SystemManager = pc.Base.extend('pc.SystemManager',
    /** @lends pc.SystemManager */
    {},
    /** @lends pc.SystemManager.prototype */
    {
        /** pc.LinkedList of systems */
        systems: null,
        /** Index of the systems by component type */
        systemsByComponentType: null,
        /** layer the system is on */
        layer: null,

        /**
         * Constructs a system manager.
         */
        init: function (layer) {
            this.systems = new pc.LinkedList();
            this.systemsByComponentType = new pc.Hashtable();
            this.layer = layer;
        },

        /**
         * Adds a system to the system manager
         * @param {pc.systems.System} system System to add
         */
        add: function (system) {
            system.layer = this.layer;
            system.systemManager = this;

            this.systems.add(system);

            if (!pc.valid(system.componentTypes))
                throw 'Invalid component types: it can be empty, but not undefined. Did you forget to ' +
                    'add an init method to your system and/or not call this._super(componentTypes)';

            for (var i = 0; i < system.componentTypes.length; i++) {
                var ctype = system.componentTypes[i].toLowerCase();

                var list = this.systemsByComponentType.get(ctype);
                if (list == null) {
                    // create a new linked list for systems matching this component type
                    list = new pc.LinkedList();
                    this.systemsByComponentType.put(ctype, list);
                }

                // add this system to the component type map, but only if it hasn't been added already
                if (!list.has(system))
                    list.add(system);
            }

            // add all the entities to this system
            var entity = this.layer.entityManager.entities.first;
            while (entity) {
                this._handleEntityAdded(entity.object());
                entity = entity.next();
            }

            system.onAddedToLayer(this.layer);
        },

        /**
         * Removes a system from the system manager
         * @param {pc.systems.System} system System to remove
         */
        remove: function (system) {
            system.onRemovedFromLayer(system.layer);
            this.systems.remove(system);

            for (var i = 0; i < system.componentTypes; i++) {
                var list = this.systemsByComponentType.get(system.componentTypes[i].toLowerCase());
                assert(list != null, "Oops, trying to remove a system and it's not in the by type list");

                system.systemManager = null;
                list.remove(system);
            }
        },

        /**
         * Gets systems based on a component type
         * @param {String} componentType Component type
         * @return {pc.LinkedList} A linked list of the systems that have the given component type
         */
        getByComponentType: function (componentType) {
            return this.systemsByComponentType.get(componentType);
        },

        /**
         * Called when the origin of the layer changes
         * @param {Number} x x-position of the origin
         * @param {Number} y y-position of the origin
         */
        onOriginChange: function (x, y) {
            var system = this.systems.first;
            while (system) {
                system.object().onOriginChange(x, y);
                system = system.next();
            }
        },

        _handleEntityAdded: function (entity) {
            // grab a list of all the component types from the entity
            var componentTypes = entity.getComponentTypes();
            for (var i = 0; i < componentTypes.length; i++) {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems) {
                    var next = systems.first;
                    while (next) {
                        // add will check to make sure this entity isn't in there already
                        next.obj.add(entity);
                        next = next.next();
                    }
                }
            }
        },

        _handleEntityRemoved: function (entity) {
            // grab a list of all the component types from the entity
            var componentMap = entity.getAllComponents();
            if (componentMap == null) return;
            var componentTypes = componentMap.keys();

            for (var i = 0; i < componentTypes.length; i++) {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems) {
                    var next = systems.first;
                    while (next) {
                        // just a plain removal, since this entity is going entirely
                        next.obj.remove(entity);
                        next = next.next();
                    }
                }
            }
        },

        _handleComponentAdded: function (entity, component) {
            // get a list of all the systems that are processing components of this type
            // then ask that system to add this entity, if it's not already there
            var list = this.systemsByComponentType.get(component.getType());
            if (list == null) {
                // this.warn('Entity (' + entity.toString() + ' added component ' + component + ' but no system is ' +
                //    ' handling components of type: ' + component.getType() +'. Did you forget to add a system' +
                //    ' to the system manager (and was it added to the same layer as this entity)?');
                return;
            }

            // todo: the systemsByComponentType map doesn't work well if systems support
            // multiple components; need to take a fresh look at that if multiple component types
            // support is added to systems (probably change the systemsByComponentType map support combinations
            // of components as a compound key (which map to a set of matching systems with no duplicates
            var next = list.first;
            while (next) {
                next.obj.add(entity);
                next.obj.onComponentAdded(entity, component);
                next = next.next();
            }
        },

        _handleComponentRemoved: function (entity, component) {
            // get a list of all the systems that are processing components of a given type
            var list = this.systemsByComponentType.get(component.getType());
            if (list == null) return;

            var next = list.first;
            while (next) {
                // then ask that system to remove this entity, but be careful that it no longer matches
                // another type might still apply to a given system
                next.obj.removeIfNotMatched(entity);
                next.obj.onComponentRemoved(entity, component);
                next = next.next();
            }

        },

        /**
         * Process all the systems
         */
        processAll: function () {
            var next = this.systems.first;
            while (next) {
                if (next.obj.delay == 0 || (pc.device.now - next.obj._lastRun > next.obj.delay)) {
                    next.obj.processAll();
                    if (next.obj.delay != 0)
                        next.obj._lastRun = pc.device.now;
                }
                next = next.next();
            }
        },

        /**
         * Called when the layer resizes
         * @param {Number} width Width of the layer
         * @param {Number} height Height of the layer
         */
        onResize: function (width, height) {
            var next = this.systems.first;
            while (next) {
                next.obj.onResize(width, height);
                next = next.next();
            }
        }



    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.EntitySystem
 * @description
 * [Extends <a href='pc.Base'>pc.System</a>]
 * <p>
 * A system that processes entities.
 */
pc.systems.EntitySystem = pc.systems.System.extend('pc.systems.EntitySystem',
    /** @lends pc.systems.EntitySystem */
    {},
    /** @lends pc.systems.EntitySystem.prototype */
    {
        /** list of entities that are to be process by this system */
        entities: null,
        /** holding place for entities that are to be removed at the end of each cycle */
        suicides: null,

        /**
         * Constructor for a system
         * @param {Array} componentTypes An array of component types this system is interested in. Any entity with
         * a component matching this type will be sent to this system for processing.
         * @param {Number} delay Amount of time between cycles for this system (default = 0)
         */
        init: function (componentTypes, delay) {
            this._super(componentTypes, delay);
            this.entities = new pc.LinkedList();
            this.suicides = new pc.LinkedList();
        },

        /**
         * Adds an entity to this system, but only if the entity has a component type matching one of the types
         * used by this system (this.componentTypes)
         * @param {pc.Entity} entity Entity to add (if the entity's component type matches the systems
         */
        addIfMatched: function (entity) {
            // checks the entity to see if it should be added to this system
            for (var i = 0; i < this.componentTypes.length; i++)
                if (entity.hasComponentOfType(this.componentTypes[i])) {
                    this.entities.add(entity);
                    this.onEntityAdded(entity);
                    return; // we only need to add an entity once
                }
        },

        /**
         * Adds an entity to the system
         * @param {pc.Entity} entity Entity to add
         */
        add: function (entity) {
            if (this.entities.has(entity)) return; // already in the list
            this.entities.add(entity);
            this.onEntityAdded(entity);
        },

        /**
         * Removes an entity from this system -- ignored if the entity isn't there
         * @param {pc.Entity} entity Entity to remove
         */
        remove: function (entity) {
            if (this.entities.remove(entity)) // return true if one was removed
                this.onEntityRemoved(entity);
        },

        /**
         * Removes an entity from this system, but checks to see if it still matches first (has a component of
         * the correct type). This is called by the entity manager when a component is removed
         * @param {pc.Entity} entity Entity to remove
         */
        removeIfNotMatched: function (entity) {
            // checks the entity to see if it should be added to this system
            for (var i = 0; i < this.componentTypes.length; i++) {
                if (entity.hasComponentOfType(this.componentTypes[i]))
                    return; // still matches, abort removing
            }

            // we got to here, so nothing matched, ok to remove the entity
            this.remove(entity);
        },

        /**
         * Processes all entities. If you override this method, make sure you call this._super() to give the entity
         * system a chance to process and clean up all entities.
         */
        processAll: function () {
            var next = this.entities.first;
            while (next) {
                this.process(next.obj);
                next = next.next();
            }

            next = this.suicides.first;
            while (next) {
                this.remove(next.obj);
                next = next.next();
            }
            this.suicides.clear();

        },

        /**
         * Override this in your system to handle updating of matching entities
         * @param {pc.Entity} entity Entity to update
         */
        process: function (entity) {
        },

        /**
         * Adds the entity to the suicide list; it will be removed at the end of the cycle.
         * @param entity
         */
        suicide: function (entity) {
            this.suicides.add(entity);
        },

        /**
         * Called when an entity has been added to this system
         * @param {pc.Entity} entity Entity that was added
         */
        onEntityAdded: function (entity) {
        },

        /**
         * Called when an entity has been removed from this system
         * @param {pc.Entity} entity Entity that was removed
         */
        onEntityRemoved: function (entity) {
        },

        /**
         * Called when a component is added to an entity
         * @param {pc.Entity} entity Entity the component was added to
         * @param {pc.components.Component} component Component that was added
         */
        onComponentAdded: function (entity, component) {
        },

        /**
         * Called when a component is removed from an entity
         * @param {pc.Entity} entity Entity the component was removed from
         * @param {pc.components.Component} component Component that was removed
         */
        onComponentRemoved: function (entity, component) {
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Effects
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A effects system that drives effects like fade.
 */
pc.systems.Effects = pc.systems.EntitySystem.extend('pc.systems.Effects',
    /** @lends pc.systems.Effects */
    {
        FadeState: {
            NOT_STARTED: 0,
            DELAYING: 1,
            FADING_IN: 2,
            HOLDING: 3,
            FADING_OUT: 4,
            DONE: 5
        }
    },
    /** @lends pc.systems.Effects.prototype */
    {
        /**
         * Constructs a new systems with options.
         */
        init: function () {
            this._super([ 'fade', 'spin', 'scale' ]);
        },

        /**
         * Processes all the entities with effect components
         */
        processAll: function () {
            var next = this.entities.first;
            while (next) {
                var entity = next.obj;
                if (entity.active) {
                    var fade = entity.getComponent('fade');
                    if (fade && fade.active) {
                        var alpha = entity.getComponent('alpha');
                        if (!alpha)
                            alpha = entity.addComponent(pc.components.Alpha.create({}));

                        if (fade.state != this.Class.FadeState.DONE) {
                            if (!this._fade(alpha, fade))
                                entity.removeComponent(fade);
                        }
                    }
                    var spin = entity.getComponent('spin');
                    if (spin && spin.spinning && spin.active) {
                        var spatial = entity.getComponent('spatial');
                        var a = spin.rate / pc.device.elapsed;

                        if (spin.max > 0 && spin.spinSoFar + a >= spin.max) {
                            spin.spinning = false;
                            a = (spin.max - spin.spinSoFar);
                        }
                        spin.spinSoFar += a;
                        spatial.setDir(pc.Math.rotate(spatial.getDir(), spin.clockwise ? a : -a));
                    }

                    var scale = entity.getComponent('scale');
                    if (scale && scale.scaling && scale.active) {
                        spatial = entity.getComponent('spatial');

                        if (!scale._bound && (scale.x != 1 || scale.y != 1)) {
                            spatial.addScale(scale.x, scale.y);
                            scale._bound = true;
                            if (scale.growX == 0 && scale.growY == 0)
                                scale.scaling = false;
                        }

                        var sx = scale.growX / pc.device.elapsed;
                        var sy = scale.growY / pc.device.elapsed;

                        if (scale.maxX != 0 && (scale.scaledXSoFar > 0 && scale.scaledXSoFar + sx >= scale.maxX))
                            sx = (scale.maxX - scale.scaledXSoFar);
                        if (scale.maxY != 0 && (scale.scaledYSoFar > 0 && scale.scaledYSoFar + sy >= scale.maxY))
                            sy = (scale.maxY - scale.scaledYSoFar);

                        if (sx != 0 && sy != 0) {
                            scale.scaledXSoFar += sx;
                            scale.scaledYSoFar += sy;
                            spatial.addScale(sx, sy);
                        }

                        if ((scale.maxX != 0 && scale.scaledXSoFar >= scale.maxX) &&
                            (scale.maxY != 0 && scale.scaledYSoFar >= scale.maxY))
                            scale.scaling = false;

                        scale._bound = true
                    }
                }

                next = next.next();
            }
        },

        _fade: function (alpha, fader) {
            var timeSinceStart = pc.device.now - fader.startTime;

            // do something about the current state, and change states if it's time.
            switch (fader.state) {
                case this.Class.FadeState.NOT_STARTED:
                    fader.startTime = pc.device.now;

                    if (fader.startDelay > 0) {
                        fader.state = this.Class.FadeState.DELAYING;
                        fader.timeLimit = fader.startDelay;
                        alpha.setAlpha(0);

                    } else if (fader.fadeInTime > 0) {
                        fader.state = this.Class.FadeState.FADING_IN;
                        fader.timeLimit = fader.fadeInTime;
                        // if we have a fade in element, then start alpha at 0
                        alpha.setAlpha(0);
                    }
                    else if (fader.holdTime > 0) {
                        fader.state = this.Class.FadeState.HOLDING;
                        fader.timeLimit = fader.holdTime;
                    }
                    else if (fader.fadeOutTime > 0) {
                        fader.state = this.Class.FadeState.FADING_OUT;
                        fader.timeLimit = fader.fadeOutTime;
                    }
                    break;

                case this.Class.FadeState.DELAYING:
                    // do nothing whilst holding
                    if (timeSinceStart > fader.timeLimit) {
                        fader.timeLimit = fader.fadeInTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_IN;
                    }
                    break;
                case this.Class.FadeState.FADING_IN:
                    alpha.addAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    if (timeSinceStart > fader.timeLimit) {
                        fader.timeLimit = fader.holdTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.HOLDING;
                    }
                    break;
                case this.Class.FadeState.HOLDING:
                    if (timeSinceStart > fader.timeLimit) {
                        fader.timeLimit = fader.fadeOutTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_OUT;
                    }
                    // do nothing whilst holding
                    break;
                case this.Class.FadeState.FADING_OUT:
                    if (timeSinceStart > fader.timeLimit) {
                        fader.loopsSoFar++;

                        if (fader.loops > 1 || fader.loops == 0) // restart?
                        {
                            fader.startTime = pc.device.now;
                            fader.timeLimit = fader.fadeInTime;
                            fader.state = this.Class.FadeState.FADING_IN;
                            if (fader.timeLimit > 0) alpha.setAlpha(0);
                        }

                        if (fader.loopsSoFar >= fader.loops && fader.loops) {
                            // all done, kill thyself
                            fader.state = this.Class.FadeState.DONE;
                            if (fader.timeLimit > 0) alpha.setAlpha(0);
                            return false;
                        }
                    } else {
                        alpha.subAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    }

                    break;
            }
            return true;
        }


    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Particles
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A particle system. See the particle component for more information.
 */
pc.systems.Particles = pc.systems.EntitySystem.extend('pc.systems.Particles',
    /** @lends pc.systems.Particles */
    { },
    /** @lends pc.systems.Particles.prototype */
    {
        /**
         * Constructs a new particle system
         */
        init: function () {
            this._super([ 'emitter' ]);
        },

        _drawStartTime: 0,

        process: function (entity) {
            if (!entity.active) return;

            var em = entity.getComponent('emitter');
            if (!em.active) return;

            var sp = entity.getComponent('spatial');
            if (!sp)
                sp = entity.addComponent(new pc.components.Spatial({}));

            if (em) {
                if (!em.active) return;

                // New emissions
                if (em.emitting && Date.now() - em._lastEmitTime > em.delay && (em.shots == 0 || em._shotCount < em.shots)) {
                    for (var b = 0; b < em.burst; b++) {
                        // if this sprite sheet has no animations, then we just use the spritesheet frames
                        var frame = 0;
                        if (em.spriteSheet.animations.size() == 0)
                        // pick a random frame to use
                            frame = pc.Math.rand(0, (em.spriteSheet.framesHigh * em.spriteSheet.framesWide) - 1);

                        em._particles.add(
                            pc._Particle.create(
                                sp.pos.x + em.offsetX + pc.Math.rand(-(em.rangeX / 2), em.rangeX / 2),
                                sp.pos.y + em.offsetY + pc.Math.rand(-(em.rangeY / 2), em.rangeY / 2),
                                pc.Math.rotate(em.relativeAngle ? sp.dir : 0, pc.Math.rand(em.angleMin, em.angleMax)),
                                pc.Math.randFloat(em.thrustMin, em.thrustMax),
                                pc.Math.randFloat(em.lifeMin, em.lifeMax),
                                pc.Math.randFloat(em.spinMin, em.spinMax),
                                pc.Math.randFloat(em.growXMin, em.growXMax),
                                pc.Math.randFloat(em.growYMin, em.growYMax),
                                pc.Math.randFloat(em.scaleXMin, em.scaleXMax),
                                pc.Math.randFloat(em.scaleYMin, em.scaleYMax),
                                em.fadeInTime, em.fadeOutTime,
                                em.alphaMin, em.alphaMax,
                                em.spriteSheet,
                                em.compositeOperation,
                                frame));
                    }

                    em._lastEmitTime = Date.now();
                    em._shotCount++;
                }

                // update all the particles
                var next = em._particles.first;
                while (next) {
                    var p = next.obj;

                    // move the particles in the right direction
                    if (pc.device.now - p.start > em.thrustTime)
                        p.thrust = 0;

                    var accelX = p.thrust * Math.cos(pc.Math.degToRad(p.dir));
                    var accelY = p.thrust * Math.sin(pc.Math.degToRad(p.dir));

                    // add the acceleration to velocity
                    p.velX += (accelX * (pc.device.elapsed / 1000)) + em.gravityX;
                    p.velY += (accelY * (pc.device.elapsed / 1000)) + em.gravityY;
                    p.velX = pc.Math.limit(p.velX, -em.maxVelX, em.maxVelX);
                    p.velY = pc.Math.limit(p.velY, -em.maxVelY, em.maxVelY);
                    p.x += p.velX;
                    p.y += p.velY;

                    // render aspects (spin, grow, fade etc)
                    if (p.spin)
                        p.rotation = pc.Math.rotate(p.rotation, p.spin * (pc.device.elapsed / 1000));
                    if (p.growXRate != 0 || p.growYRate != 0) {
                        p.scaleX += p.growXRate * (pc.device.elapsed / 1000);
                        p.scaleY += p.growYRate * (pc.device.elapsed / 1000);
                    }

                    if (p.fadeState == 0) // fading in
                    {
                        p.sprite.addAlpha((pc.device.elapsed * (100 / p.fadeInTime)) / 100);
                        if (pc.device.now - p.fadeStateStart > p.fadeInTime) {
                            p.fadeState++;
                            p.fadeStateStart = pc.device.now;
                        }
                    }

                    if (p.fadeState == 1) {
                        if (pc.device.now - p.fadeStateStart > p.holdTime) {
                            p.fadeState++;
                            p.fadeStateStart = pc.device.now;
                        }
                    }

                    if (p.fadeState == 2) // fading out
                    {
                        if (p.fadeOutTime > 0)// && p.sprite.alpha > 0)
                        {
                            var fa = (pc.device.elapsed * (100 / p.fadeOutTime)) / 100;
                            p.sprite.subAlpha(fa);
                            // doesn't need to time ending because lifetime will take over
                            // down below and kill this particle
                        }
                    }

                    // pick a random alpha
                    if (p.alphaMin != 1 || p.alphaMax != 1) {
                        if (pc.device.now - p.lastAlpha > em.alphaDelay) {
                            p.sprite.setAlpha(pc.Math.rand(p.alphaMin, p.alphaMax));
                            p.lastAlpha = pc.device.now;
                        }
                    }

                    // draw it
                    this.drawStartTime = Date.now();
                    if (p.scaleX != 1 || p.scaleY != 1)
                        em.spriteSheet.setScale(p.scaleX, p.scaleY);

                    if (!p.sprite.currentAnim) {
                        p.sprite.drawFrame(pc.device.ctx, p.frame % em.spriteSheet.framesWide,
                            Math.floor(p.frame / em.spriteSheet.framesWide),
                            p.x - entity.layer.origin.x - entity.layer.scene.viewPort.x,
                            p.y - entity.layer.origin.y - entity.layer.scene.viewPort.y,
                            em.rotateSprite ? p.rotation : p.dir);
                        pc.device.lastDrawMS += (Date.now() - this.drawStartTime);
                    }
                    else {
                        p.sprite.draw(pc.device.ctx,
                            p.x - entity.layer.origin.x - entity.layer.scene.viewPort.x,
                            p.y - entity.layer.origin.y - entity.layer.scene.viewPort.y,
                            p.dir);
                        pc.device.lastDrawMS += (Date.now() - this.drawStartTime);
                        p.sprite.update(pc.device.elapsed);
                    }

                    if (p.scaleX != 1 || p.scaleY != 1)
                        em.spriteSheet.setScale(1, 1);

                    // assign next before we (maybe) remove this one
                    next = next.next();

                    // time to die?
                    if (pc.device.now - p.start > p.lifetime) {
                        p.release();
                        em._particles.remove(p);
                    }
                }

                // if all the particles are done, and the shot count is finished, time to kill the emitter
                if (em.shots != 0) {
                    if (em._particles.first == null && em._shotCount >= em.shots)
                        em.active = false;
                }

            }
        }


    });


pc._Particle = pc.Pooled.extend('pc._Particle',
    {
        create: function (x, y, dir, thrust, lifetime, spin, growXRate, growYRate, scaleX, scaleY, fadeInTime, fadeOutTime, alphaMin, alphaMax, spriteSheet, compositeOperation, frame) {
            var n = this._super();
            n.x = x;
            n.y = y;
            n.dir = dir;
            n.thrust = thrust;
            n.frame = frame;
            n.lifetime = lifetime;
            n.spin = spin;
            n.growXRate = growXRate;
            n.growYRate = growYRate;
            n.scaleX = scaleX;
            n.scaleY = scaleY;
            if (n.sprite == null)
                n.sprite = pc.Sprite.create(spriteSheet);
            else
                n.sprite.setSpriteSheet(spriteSheet);
            n.start = pc.device.now;
            n.fadeStart = 0;
            n.velX = 0;
            n.velY = 0;
            n.rotation = 0;
            n.alphaMin = alphaMin;
            n.alphaMax = alphaMax;
            n.lastAlpha = pc.device.now;
            n.fadeInTime = fadeInTime;
            n.fadeOutTime = fadeOutTime;
            n.holdTime = n.lifetime - (n.fadeInTime + n.fadeOutTime);
            if (compositeOperation)
                n.sprite.setCompositeOperation(compositeOperation);
            else
                n.sprite.setCompositeOperation('source-over');

            n.fadeState = 1;    // 0=fading in, 1 = displaying, 2 = fading out
            n.fadeStateStart = pc.device.now;
            if (n.fadeInTime > 0) {
                n.fadeState = 0;
                n.sprite.setAlpha(0);
            } else
                n.sprite.setAlpha(1);

            return n;
        }
    },
    {
        x: 0,
        y: 0,
        dir: 0,
        rotation: 0,
        thrust: 0,
        sprite: null,
        start: 0,
        frame: 0,
        fadeStart: 0,
        velX: 0,
        velY: 0,
        spin: 0,
        growXRate: 0,
        growYRate: 0,
        scaleX: 1,
        scaleY: 1,
        fadeInTime: 0,
        fadeOutTime: 0,
        fadeStateStart: 0,
        holdTime: 0,
        fadeState: 1,
        alphaMin: 1,
        alphaMax: 1,
        lastAlpha: 0 // time of last alpha change

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Input
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Input system. See the <a href='pc.components.Input'>input component</a> for more information.
 */
pc.systems.Input = pc.systems.EntitySystem.extend('pc.systems.Input',
    /** @lends pc.systems.Input */
    {},
    /** @lends pc.systems.Input.prototype */
    {
        /**
         * Constructs a new input system.
         */
        init: function () {
            this._super(['input']);
        },

        process: function (entity) {
            var input = entity.getComponent('input');
            if (!input.active) return;

            if (!input._bound) {
                var uiSpatial = entity.getComponent('spatial');
                var eventTarget = entity;

                // if there is a target specified for the events, then we flip things around a little
                // we bind the input to the entity target, and make this entity (the one with the entity component
                // on it the uiTarget (bounding rectangle)
                if (input.target)
                    eventTarget = input.target;

                // bind all the inputs we want
                if (input.states) {
                    for (var i = 0; i < input.states.length; i++) {
                        var keys = input.states[i][1];
                        for (var k = 0; k < keys.length; k++) {
                            var ts = uiSpatial;
                            if (pc.valid(input.states[i][2]) && input.states[i][2] == false)
                                ts = null;
                            pc.device.input.bindState(eventTarget, input.states[i][0], keys[k], ts);
                        }
                    }
                }

                if (input.actions) {
                    //eventTarget = this;
                    for (i = 0; i < input.actions.length; i++) {
                        keys = input.actions[i][1];
                        for (k = 0; k < keys.length; k++) {
                            ts = uiSpatial;
                            if (pc.valid(input.actions[i][2]) && input.actions[i][2] == false)
                                ts = null;
                            pc.device.input.bindAction(eventTarget, input.actions[i][0], keys[k], ts);
                        }
                    }
                }

                input._bound = true;
            }
        },

        /**
         * Override to react to the actions
         * @param {String} actionName Name of the action
         * @param {Event} event Event object that caused the input
         * @param {pc.Point} pos Position the input occurred
         * @param {Object} uiTarget The target that received the input (spatial of an entity if bound)
         */
        onAction: function (actionName, event, pos, uiTarget) {
        },

        /**
         * Gets whether an input state is active
         * @param {pc.Entity} entity Entity testing the active state for
         * @param {String} state The state to test
         * @return {Boolean} true if the state is presently on
         */
        isInputState: function (entity, state) {
            if (entity.getComponent('input')._bound)
                return pc.device.input.isInputState(entity, state);
            return false;
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Expiration
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Expiry system. See the <a href='pc.components.Expiry'>expiry component</a> for more information.
 */
pc.systems.Expiration = pc.systems.EntitySystem.extend('pc.systems.Expiration',
    /** @lends pc.systems.Expiration */
    {},
    /** @lends pc.systems.Expiration.prototype */
    {
        init: function () {
            this._super(['expiry']);
        },

        process: function (entity) {
            var c = entity.getComponent('expiry');
            if (!c.active) return;

            c.decrease(pc.device.elapsed);
            if (c.hasExpired())
                entity.remove();
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Activation
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Handles activating entities when they get within a certain range of another entity.
 * See the <a href='pc.components.Activator'>activator component</a> for more information.
 */
pc.systems.Activation = pc.systems.EntitySystem.extend('pc.systems.Activation',
    /** @lends pc.systems.Activation */
    {},
    /** @lends pc.systems.Activation.prototype */
    {
        /**
         * Constructor for the activation system
         * @param {Number} delay Time between system runs in milliseconds. Default is 2000 (2 seconds).
         */
        init: function (delay) {
            this._super(['activator'], delay);
        },

        onEntityAdded: function (entity) {
            entity.active = false;
        },

        process: function (entity) {
            var a = entity.getComponent('activator');
            if (!a.active) return;

            if (entity.active && a.stayActive) return;
            if (!a._cacheLayer) {
                if (a.layer)
                    a._cacheLayer = entity.layer.scene.get(a.layer);
                else
                    a._cacheLayer = entity.layer;
            }

            var entities = a._cacheLayer.getEntityManager().getTagged(a.tag);

            if (!entities) return;

            var e = entities.first;
            while (e) {
                var thisSP = entity.getComponent('spatial');
                var otherSP = e.object().getComponent('spatial');

                var distance = thisSP.getCenterPos().distance(otherSP.getCenterPos());
                if (!entity.active) {
                    // is the other entity close enough
                    if (distance < a.range)
                        entity.active = true;
                } else {
                    if (distance >= a.range)
                        entity.active = false;
                }

                e = e.next();
            }
        }

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Layout
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Manages the layout of entities
 */
pc.systems.Layout = pc.systems.EntitySystem.extend('pc.systems.Layout',
    /** @lends pc.systems.Layout */
    {},
    /** @lends pc.systems.Layout.prototype */
    {
        /** current margin (left, right, top, bottom) */
        margin: null,

        /**
         * Constructs a new layout system.
         * @param {Number} options.margin.left Default left margin for all entities
         * @param {Number} options.margin.right Default right margin for all entities
         * @param {Number} options.margin.top Default top margin for all entities
         * @param {Number} options.margin.bottom Default bottom margin for all entities
         */
        init: function (options) {
            this._super([ 'layout' ]);
            this.margin = {};
            if (pc.checked(options) && pc.checked(options.margin)) {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }
        },

        _getAnchorLocation: function (horizontal, vertically) {
            if (horizontal === 'left') {
                if (vertically === 'top') return 'top-left';
                if (vertically === 'middle') return 'middle-left';
                if (vertically === 'bottom') return 'bottom-left';
            }

            if (horizontal === 'center') {
                if (vertically === 'top') return 'top-center';
                if (vertically === 'middle') return 'middle-center';
                if (vertically === 'bottom') return 'bottom-center';
            }

            if (horizontal === 'right') {
                if (vertically === 'top') return 'top-right';
                if (vertically === 'middle') return 'middle-right';
                if (vertically === 'bottom') return 'bottom-right';
            }

            return null;
        },

        /**
         * Processes all the entities and lays them out according to the anchoring options.
         * Typically this is called whenever a new entity with a layout component is added to the
         * system, but you can call it manually if you really want to (such as when an entity changed size or moves)
         */
        doLayout: function () {
            var layouts = new pc.HashList(); // a list for each of the anchors

            var next = this.entities.first;
            while (next) {
                var entity = next.obj;
                var spatial = entity.getComponent('spatial');
                if (!spatial)
                    entity.addComponent(pc.components.Spatial({}));

                var layout = entity.getComponent('layout');

                // add entities to the layout sides; this just sorts them
                var al = this._getAnchorLocation(layout.horizontal, layout.vertical);
                layouts.add(al, next.obj);
                //console.log(' adding: ' + next.obj.toString() + ' to anchor group: ' + al);
                next = next.next();
            }

            // now go through all the anchor groups and lay things out
            var layoutKeys = layouts.hashtable.keys();
            for (var i = 0; i < layoutKeys.length; i++) {
                var anchor = layoutKeys[i];
                var list = layouts.get(layoutKeys[i]);

                // if it's centered we need to know the height of all the entities being laid out
                // before we place the first item.

                var dim = this._getEntityDimensions(list);
                var cx = this.margin.left;
                var cy = this.margin.top;

                // set the starting position
                switch (anchor) {
                    case 'top-left':
                        break;
                    case 'middle-left':
                        cy += ( this.layer.getScreenRect().h / 2) - (dim.y / 2);
                        break;
                    case 'bottom-left':
                        cy = this.layer.getScreenRect().h - dim.y - this.margin.bottom;
                        break;
                    case 'top-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x / 2);
                        break;
                    case 'middle-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x / 2);
                        cy += ( this.layer.getScreenRect().h / 2) - (dim.y / 2);
                        break;
                    case 'bottom-center':
                        cx = this.layer.getScreenRect().w / 2 - (dim.x / 2) - this.margin.bottom;
                        cy += this.layer.getScreenRect().h - dim.y;
                        break;
                    case 'top-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        break;
                    case 'middle-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy += ( this.layer.getScreenRect().h / 2) - (dim.y / 2);
                        break;
                    case 'bottom-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy = this.layer.getScreenRect().h - dim.y - this.margin.bottom;
                        break;
                }

                // whilst this while loop below looks like it's handling all anchor types, keep in mind
                // each loop is only handling one type (since they are sorted/grouped above)
                var listNext = list.first;
                while (listNext) {
                    entity = listNext.obj;
                    spatial = entity.getComponent('spatial');
                    layout = entity.getComponent('layout');

                    cy += layout.margin.top;

                    switch (anchor) {
                        case 'top-left':
                        case 'middle-left':
                        case 'bottom-left':
                            cx = layout.margin.left + this.margin.left;
                            break;
                        case 'top-center':
                        case 'middle-center':
                        case 'bottom-center':
                            cx = layout.margin.left + (this.layer.getScreenRect().w / 2) - (spatial.dim.x / 2);
                            break;
                        case 'top-right':
                        case 'middle-right':
                        case 'bottom-right':
                            cx = this.layer.getScreenRect().w - spatial.dim.x - layout.margin.right - this.margin.right;
                            break;
                    }

                    spatial.pos.x = cx;
                    spatial.pos.y = cy;

                    cy += spatial.dim.y + layout.margin.bottom;

                    listNext = listNext.next();
                }

            }
        },

        _entityDim: null,

        _getEntityDimensions: function (list) {
            if (!this._entityDim)
                this._entityDim = new pc.Dim();

            this._entityDim.x = 0;
            this._entityDim.y = 0;

            var listNext = list.first;
            while (listNext) {
                var sp = listNext.obj.getComponent('spatial');
                var layout = listNext.obj.getComponent('layout');

                if (sp) {
                    this._entityDim.x += layout.margin.left + sp.dim.x + layout.margin.right;
                    this._entityDim.y += layout.margin.top + sp.dim.y + layout.margin.bottom;
                }

                listNext = listNext.nextLinked;
            }

            return this._entityDim;
        },

        onResize: function (width, height) {
            this.doLayout();
        },

        onEntityAdded: function (entity) {
            this._super();
            this.doLayout();
        },

        onEntityRemoved: function (entity) {
            this._super();
            this.doLayout();
        },

        onComponentAdded: function (entity, component) {
            this._super();
            this.doLayout();
        }



    });
















