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
        canvasId:null,
        /** canvas element upon which all drawing will occur */
        canvas:null,
        /** width of the current canvas */
        canvasWidth:0,
        /** height of the current canvas */
        canvasHeight:0,
        /** resource loader */
        loader:null,

        timer:null,
        /** current 2D draw context */
        ctx:null,
        started:false,
        /** current requested frame rate */
        fps:0,
        /** last cycle frame rate */
        currentFPS:0,
        tick:0, // ms per cycle (just 1000/fps for convenience)

        /** whether the device is running */
        running:true,

        /** global render scale */
        scale:1,
        xmlParser:null,

        // debug related
        debugPanel:null,
        /** whether the debug panel should be updated/drawn */
        showDebug:true,
        /** whether the game is running in development mode; false = production */
        devMode: true,
        enablePooling:true,
        /** whether sound is enabled */
        soundEnabled:true,

        /** number of elements drawn in the last cycle */
        elementsDrawn:0,
        /** how long in ms the last process cycle took */
        lastProcessMS:0,
        /** how long in ms the last draw cycle took */
        lastDrawMS:0,

        // device information
        /** pc.Rect of the current screen dimensions */
        screen:null, // the device's screen dimensions (i.e. the display)
        /** pixel ratio of the screen -- typically 1 unless on a retina display where it's 2 */
        pixelRatio:1,
        /** is this device an iPhone */
        isiPhone:false,
        /** is this device an iPhone 4 */
        isiPhone4:false,
        /** is this device an iPad*/
        isiPad:false,
        /** is this device an Android*/
        isAndroid:false,
        /** is this a touch device */
        isTouch:false,

        requestAnimFrame:null,
        /** pc.Input handler global instance */
        input:null,
        /** the name of the game class that was constructed */
        gameClass: null,
        /** the game object constructed at startup */
        game: null, // the currently running instance of the gameClass

        /** amount of time the last cycle took in ms */
        elapsed:0,
        /** time the last frame cycle was started */
        lastFrame:0,
        /** the time now */
        now:Date.now(),

        /**
         * Setup the system interface for the game. Typically this will just be automatically called
         * by the game object and you don't need to worry about it.
         */
        boot:function (canvasId, gameClass)
        {
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

            window.onresize = this.onResize.bind(this);
            this.onReady();
        },

        /**
         * Indicates whether a sound format is playable on the current device
         * @param {String} format Sound format to test: 'mp3', 'ogg' or 'wav'
         * @return {Boolean} True is the format can be played
         */
        canPlay: function(format)
        {
            return gamecore.Device.canPlay(format);
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
                if (this.isiPad || this.isiPhone)
                {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;

                } else
                {
                    if (this.panelElement)
                    {
                        this.canvas.width = this.panelElement.offsetWidth;
                        this.canvas.height = this.panelElement.offsetHeight;
                    }
                }

                this.canvasWidth = this.canvas.width;
                this.canvasHeight = this.canvas.height;

                this.screen = pc.Dim.create(this.canvasWidth, this.canvasHeight);

            }
        },

        /**
         * Automatically called once the device is ready
         */
        onReady:function ()
        {
            if (this.isiPad)
            {
                this.showDebug = false;
                this.soundEnabled = false;
            }

            if (this.started) return; // check we haven't already started
            this.game = eval('new ' + this.gameClass + '()');
            if (!this.game)
                throw "Invalid game class";

            this.canvas = document.getElementById(this.canvasId);
            if (!this.canvas)
                throw 'Abort! Could not attach to a canvas element using the id [' + this.canvasId + ']. ' +
                    'Add a canvas element to your HTML, such as <canvas id="pcGameCanvas"></canvas>';
            this.input._onReady();
            this.ctx = this.canvas.getContext('2d');

            // automatically resize to match my parent container
            this.panelElement = this.canvas.parentNode;
            this.onResize();

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

        startTime:0,

        /**
         * Called once per game cycle
         * @param time System time in ms
         */
        cycle:function (time)
        {
            if (this.running !== false)
            {
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

                if (this.showDebug)
                {
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

            var flip = false;
            if (typeof window.orientation !== 'undefined' && window.orientation != 0)
                flip = true;

            if (flip)
            {
                // in landscape, flip things around
                var w = this.canvas.width;
                this.canvas.width = this.canvas.height;
                this.canvas.height = w;
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
        }

    });


// the singleton system by which we reference the device and setup events
pc.device = new pc.Device();
