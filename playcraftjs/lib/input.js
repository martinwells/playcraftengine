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
        getEventPosition:function(e, pos)
        {
            if (this._eventPos == null)
                this._eventPos = pc.Point.create(0,0);

            var r = pos;
            if (!pc.Tools.isValid(pos))
                r = this._eventPos;

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
    /** @lends pc.Input.prototype */
    {
        /** Current state bindings */
        stateBindings:null,
        /** Currently active states */
        states:null,
        /** Action bindings */
        actionBindings:null,
        /** Current position of the mouse on-screen, updated continuously */
        mousePos: null,
        /** indicates if the left mouse button is currently down */
        mouseLeftButtonDown: false,
        /** indicates if the right mouse button is currently down */
        mouseRightButtonDown: false,

        init:function ()
        {
            this._super();
            this.stateBindings = new pc.Hashtable();
            this.states = new pc.Hashtable();
            this.actionBindings = new pc.Hashtable();
            this.mousePos = pc.Point.create(0,0);
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
        bindState:function (obj, stateName, input, uiTarget)
        {
            if (obj.uniqueId == null)
                throw "Oops, you can't bind a state to an object if it doesn't have a uniqueId function";

            input = input.toUpperCase();
            // There can be many bindings associated with a particular input, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var binding = { stateName:stateName, object:obj, input:input, state:{on:false, event:null}, uiTarget:uiTarget };
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
        isInputState:function (obj, stateName)
        {
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
        getInputState:function (obj, stateName)
        {
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
         * pc.device.input.bindAction(menuLayer, 'new game', 'MOUSE_LEFT_BUTTON', menuOption);
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
        bindAction:function (obj, actionName, input, uiTarget)
        {
            // There can be many bindings associated with a particular input event, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            input = input.toUpperCase();

            var bindingSet = this.actionBindings.get(input);
            if (bindingSet == null)
                this.actionBindings.put(input, [
                    { actionName:actionName, object:obj, input:input, uiTarget:uiTarget }
                ]);
            else
                // otherwise append a new binding
                bindingSet.push({ actionName:actionName, input:input, object:obj, uiTarget:uiTarget });
        },

        /**
         * Triggers an action to be fired. Typically this will be fired in response to an input, but it can
         * also be used to simulate an event.
         * @param {Number} eventCode event code
         * @param {Event} event An event object
         */
        fireAction:function (eventCode, event)
        {
            var bindingSet = this.actionBindings.get(pc.InputType.getName(eventCode));
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and fire the object callbacks
            for (var i = 0; i < bindingSet.length; i++)
            {
                var binding = bindingSet[i];
                var obj = bindingSet[i].object;
                if (!obj.isActive || obj.isActive())
                {
                    // if it's a positional event type (like a mouse down or move, then we only
                    // fire events to objects where the event is within its spatial bounds
                    if (pc.InputType.isPositional(eventCode))
                    {
                        var pos = this.Class.getEventPosition(event);
                        var er = null;
                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = obj.getScreenRect ? obj.getScreenRect() : null;

                        if (er && er.containsPoint(pos))
                            obj.onAction(binding.actionName, event, pos, binding.uiTarget);
                    } else
                        obj.onAction(binding.actionName);
                }
            }
            return true;
        },



        /*** INTERNALS **/

        _onReady:function ()
        {
            // touch input
            pc.device.canvas.addEventListener('touchstart', this._touchStart.bind(this), true);
            pc.device.canvas.addEventListener('touchend', this._touchEnd.bind(this), true);
            pc.device.canvas.addEventListener('touchmove', this._touchMove.bind(this), true);

            // mouse input
            pc.device.canvas.addEventListener('mouseup', this._mouseUp.bind(this), true);
            pc.device.canvas.addEventListener('mousedown', this._mouseDown.bind(this), true);
            pc.device.canvas.addEventListener('mousemove', this._mouseMove.bind(this), true);
            pc.device.canvas.addEventListener('mousewheel', this._mouseWheel.bind(this), true);
            pc.device.canvas.addEventListener('contextmenu', this._contextMenu.bind(this), true);

            // key input
            window.addEventListener('keydown', this._keyDown.bind(this), true);
            window.addEventListener('keyup', this._keyUp.bind(this), true);
        },

        _positionals: [], // array of bindings that need to be checked against positional events like mouse move and touch

        // Checks the positional event to see if it's a new event INSIDE an on-screen rectangle that has been
        // bound to a state. This is so when a positional event, like a mouse move, 'slides' over an element
        // we can turn the state on, as well as detecting when it slides out of the area of the uiTarget

        _checkPositional: function(moveEvent)
        {
            // check existing tracked states -- did we move out of an element
            for (var i=0; i < this._positionals.length; i++)
            {
                var binding = this._positionals[i];

                if (moveEvent.type == 'mousemove' && pc.InputType.isTouch(pc.InputType.getCode(binding.input)))
                    continue;

                if (moveEvent.type == 'touchmove' && !pc.InputType.isTouch(pc.InputType.getCode(binding.input)))
                    continue;

                if (pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_LEFT_BUTTON && !this.mouseLeftButtonDown)
                    continue;

                if (pc.InputType.getCode(binding.input) == pc.InputType.MOUSE_RIGHT_BUTTON && !this.mouseRightButtonDown)
                    continue;

                var er = null;
                if (pc.valid(binding.uiTarget))
                    er = binding.uiTarget.getScreenRect();
                else
                    er = binding.object.getScreenRect ? binding.object.getScreenRect() : null;

                if (er)
                {
                    if (!er.containsPoint( this.Class.getEventPosition(moveEvent) ))
                    {
                        // no longer in the right position, turn state off
                        var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state.on = false;
                        state.event = moveEvent;
                    } else
                    {
                        // moved into position, turn back on
                        var state2 = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state2.on = true;
                        state2.event = moveEvent;
                    }
                }
            }
        },

        _changeState:function (eventCode, stateOn, event)
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
                if (!binding.object.isActive || binding.object.isActive())
                {
                    if (pc.InputType.isPositional(eventCode))
                    {
                        // if binding has a uiElement, then make sure the event hit is within the on-screen
                        // rectangle
                        var pos = this.Class.getEventPosition(event);
                        var er = null;

                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = binding.object.getScreenRect ? binding.object.getScreenRect() : null;

                        if (er)
                        {
                            if (er.containsPoint(pos))
                            {
                                var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                                state.on = stateOn;
                                state.event = event;
                            }
                        } else
                        {
                            // positional, but no uiTarget
                            state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                            state.on = stateOn;
                            state.event = event;
                        }
                    }
                    else
                    {
                        state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state.on = stateOn;
                        state.event = event;
                    }
                }
            }
            return true;
        },

        _lastMouseMove: null,

        /**
         * Called by the pc.device main loop to process any move events received. We only handle events
         * here so they are processed once per cycle, not every time we get them (i.e. stop handling
         * a flood of mouse move or touch events
         */
        process: function()
        {
            if (this._lastMouseMove)
            {
                this._checkPositional(this._lastMouseMove);
                this.fireAction(pc.InputType.MOUSE_MOVE, this._lastMouseMove);
                this.Class.getEventPosition(this._lastMouseMove, this.mousePos);
                this._lastMouseMove = null;
            }
        },

        ///////////////////////////////////////////////////////////////////////////////////
        //
        //  EVENT HANDLERS
        //
        ///////////////////////////////////////////////////////////////////////////////////

        _keyDown:function (event)
        {
            if (this._changeState(event.keyCode, true, event))
                event.preventDefault();

            if (this.fireAction(event.keyCode, event))
                event.preventDefault();

        },

        _keyUp:function (event)
        {
            if (this._changeState(event.keyCode, false, event))
                event.preventDefault();
        },

        _touchStart:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
            {
                this._changeState(pc.InputType.TOUCH, true, event.touches[i]);
                this.fireAction(pc.InputType.TOUCH, event.touches[i]);
            }
            event.preventDefault();
        },

        _touchEnd:function (event)
        {
            for(var i=0, len=event.changedTouches.length; i < len; i++)
                this._changeState(pc.InputType.TOUCH, false, event.changedTouches[i]);
            event.preventDefault();
        },

        _touchMove:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
                this._checkPositional(event.touches[i]);
            event.preventDefault();
        },

        _mouseUp:function (event)
        {
            if (event.button == 0 || event.button == 1)
            {
                this._changeState(pc.InputType.MOUSE_LEFT_BUTTON, false, event);
                this.mouseLeftButtonDown = false;
            } else
            {
                this._changeState(pc.InputType.MOUSE_RIGHT_BUTTON, false, event);
                this.mouseRightButtonDown = false;
            }

            // turn off specific states
            event.preventDefault();
        },

        _mouseDown:function (event)
        {
            if (event.button == 0 || event.button == 1)
            {
                this._changeState(pc.InputType.MOUSE_LEFT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_LEFT_BUTTON, event);
                this.mouseLeftButtonDown = true;
            } else
            {
                this._changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
                this.mouseRightButtonDown = true;
            }
            event.preventDefault();
        },

        _mouseMove:function (event)
        {
            this._lastMouseMove = event;
            event.preventDefault();
        },

        _contextMenu: function(event)
        {
            this._changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
            this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
        },

        _mouseWheel:function (event)
        {
            if (event.wheel > 0)
                this.fireAction(pc.InputType.MOUSE_WHEEL_UP, event);
            else
                this.fireAction(pc.InputType.MOUSE_WHEEL_DOWN, event);
            event.preventDefault();
        }
    });

pc.InputType = pc.Base.extend('pc.InputType',
    {
        // STATICS
        nameToCode:null,
        codeToName:null,

        POSITIONAL_EVENT_START:1000,
        MOUSE_LEFT_BUTTON: 1100,
        MOUSE_RIGHT_BUTTON: 1101,
        MOUSE_WHEEL_UP: 1102,
        MOUSE_WHEEL_DOWN: 1103,
        MOUSE_MOVE: 1104,
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
            this.addInput(this.MOUSE_RIGHT_BUTTON, 'MOUSE_RIGHT_BUTTON');
            this.addInput(this.MOUSE_WHEEL_UP, 'MOUSE_WHEEL_UP');
            this.addInput(this.MOUSE_WHEEL_DOWN, 'MOUSE_WHEEL_DOWN');
            this.addInput(this.MOUSE_MOVE, 'MOUSE_MOVE');
        },

        isTouch:function(inputCode)
        {
            return inputCode == this.TOUCH;
        },

        isPositional:function (inputCode)
        {
            return inputCode >= this.POSITIONAL_EVENT_START;
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

