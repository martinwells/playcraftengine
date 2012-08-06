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

        _eventPos: null, // cached for speed
        /**
         * Extracts the position from an event (in a cross-browser way,and then sets the passed in pos
         * @param e Event to extract the position from
         * @param pos [Optional] Position object to set. Leave out to have a new (pooled) point returned
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
    {
        stateBindings:null, // the connection between an input i.e. 'DOWN' and a state
        states:null, // the present state of an input (mouse left button down etc)
        actionBindings:null, // bindings for actions/events that occur, like 'FIRE' or 'JUMP'

        mousePos: null,

        init:function ()
        {
            this._super();
            this.stateBindings = new pc.Hashtable();
            this.states = new pc.Hashtable();
            this.actionBindings = new pc.Hashtable();
            this.mousePos = pc.Point.create(0,0);
        },

        onReady:function ()
        {
            // touch input
            pc.device.canvas.addEventListener('touchstart', this.touchStart.bind(this), true);
            pc.device.canvas.addEventListener('touchend', this.touchEnd.bind(this), true);
            pc.device.canvas.addEventListener('touchmove', this.touchMove.bind(this), true);

            // mouse input
            pc.device.canvas.addEventListener('mouseup', this.mouseUp.bind(this), true);
            pc.device.canvas.addEventListener('mousedown', this.mouseDown.bind(this), true);
            pc.device.canvas.addEventListener('mousemove', this.mouseMove.bind(this), true);
            pc.device.canvas.addEventListener('mousewheel', this.mouseWheel.bind(this), true);
            pc.device.canvas.addEventListener('contextmenu', this.contextMenu.bind(this), true);

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
         * @param uiTarget Optional UI object to bind the input to (layer, scene or element)
         */
        bindState:function (obj, stateName, input, uiTarget)
        {
            if (obj.uniqueId == null)
                throw "Oops, you can't bind a state to an object if it doesn't have a uniqueId function";

            // There can be many bindings associated with a particular input, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var bindingSet = this.stateBindings.get(input);
            if (bindingSet == null)
                this.stateBindings.put(input, [
                    { stateName:stateName, object:obj, state:{on:false, event:null}, uiTarget:uiTarget }
                ]);
            else
                // otherwise append a new binding
                bindingSet.push({ stateName:stateName, object:obj, state:{ on:false, event:null }, uiTarget:uiTarget });

            // now setup a state for this object/input combination
            this.states.put(obj.uniqueId + '\\\\' + stateName, {on: false, event: null});
        },

        // todo: rate limit the input by holding input events in a queue which are processed only
        // once at the beginning of a cycle (in input.update, only store the last event of any type
        // mouse move especially

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
                    if (pc.InputType.isPositional(eventCode))
                    {
                        // if binding has a uiElement, then make sure the event hit is within the on-screen
                        // rectangle
                        var pos = this.Class.getEventPosition(event);
                        var er = null;

                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = binding.object.getScreenRect();

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
         * the mouse out of a uitarget's surrounding rectangle, or having an entity move out from under the mouse.
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
                var er = null;
                if (pc.valid(next.uiTarget))
                    er = next.uiTarget.getScreenRect();
                else
                    er = next.object.getScreenRect();

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
         * <p>
         * For positional events (such as a mouse or touch input) the action will only fire if the position
         * of the event is within the bounds of the object (based on a call to getScreenRect). You can optionally
         * provide a uiTarget object to provide a different bounding rectangle.
         * <p><code>
         * For example:
         * var menuLayer = new Layer();                     // a menu layer
         * var menuOption = new TextElement('New Game');    // a menu item
         *
         * // trigger the 'new game' action for the menuLayer, when a mouse click occurs within the menuOption element
         * pc.device.input.bindAction(menuLayer, 'new game', 'MOUSE_LEFT_BUTTON', menuOption);
         * </code><p>
         * Note: If the uiTarget element is not provided, the bounding rectangle of the obj is used
         *
         * @param obj The entity, layer or scene to bind this action to (must implement onAction, and getScreenRect
         * (unless a uiTarget is provided)
         * @param actionName The name of the action, e.g. 'FIRE' or 'JUMP'
         * @param input The input code as a string
         * @param uiTarget An optional element to limit the input to only within the bounds of the element (must
         * implement getScreenRect)
         */
        bindAction:function (obj, actionName, input, uiTarget)
        {
            // There can be many bindings associated with a particular input event, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var bindingSet = this.actionBindings.get(input);
            if (bindingSet == null)
                this.actionBindings.put(input, [
                    { actionName:actionName, object:obj, uiTarget:uiTarget }
                ]);
            else
            // otherwise append a new binding
                bindingSet.push({ actionName:actionName, object:obj, uiTarget:uiTarget });

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
                var binding = bindingSet[i];
                var obj = bindingSet[i].object;
                if (obj.isActive())
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
                            er = obj.getScreenRect();

                        // debug
//                        alert('binding: ' + binding.actionName + ' uiTarget: ' + binding.uiTarget + ' pos: ' + pos +
//                            ' er: ' + er);

                        if (er.containsPoint(pos))
                            obj.onAction(binding.actionName, event, pos, binding.uiTarget);
                    } else
                        obj.onAction(binding.actionName);
                }
            }
            return true;
        },

        /**
         * Called by the pc.device main loop to process any events received. We only handle events
         * here so they are processed once per cycle, not every time we get them (i.e. stop handling
         * a flood of mouse move or touch events
         */
        _lastMouseMove: null,

        process: function()
        {
            if (this._lastMouseMove)
            {
                this._checkState(this._lastMouseMove);
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
            if (event.button == 0 || event.button == 1)
            {
                this.changeState(pc.InputType.MOUSE_LEFT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_LEFT_BUTTON, event);
            } else
            {
                this.changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
            }
            event.preventDefault();
        },

        mouseMove:function (event)
        {
            this._lastMouseMove = event;
            event.preventDefault();
        },

        contextMenu: function(event)
        {
            this.changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
            this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
        },

        mouseWheel:function (event)
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

