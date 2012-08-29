/**
 * Playcraft Engine
 * System - the interface between the device (the real world) and the game
 */

pc.Device = pc.Base.extend('pc.Device',
    { },
    {
        canvasId:null,
        canvas:null,
        canvasWidth:0,
        canvasHeight:0,
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
        showDebug:true,
        devMode: true,
        debugCollisions:false,
        enablePooling:true,
        soundEnabled:true,

        elementsDrawn:0,
        lastProcessMS:0,
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

        requestAnimFrame:null,
        input:null,
        gameClass: null,

        // temps
        elapsed:0, // delta time between frames
        lastFrame:0, // time of the previous frame
        now:Date.now(),

        /**
         * Setup the system interface for the game. Typically this will just be automatically called
         * by the game object and you don't need to worry about it.
         */
        boot:function (canvasId, gameClass)
        {
            this.info('Playcraft Engine v' + pc.VERSION + ' starting.');
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

//            if (!this.isAppMobi)
//                document.addEventListener("DOMContentLoaded", this.onReady.bind(this), false);
//            else
//                document.addEventListener("appMobi.device.ready", this.onReadyAppMobi.bind(this), false);

            window.onresize = this.onResize();
            this.onReady();
        },

        canPlay: function(format)
        {
            return gamecore.Device.canPlay(format);
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
            this.input.onReady();
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

            if (this.isiPad)
                flip = true;

            if (flip)
            {
                // in landscape, flip things around
                var w = this.canvas.width;
                this.canvas.width = this.canvas.height;
                this.canvas.height = w;
            }

/*  iPad 3/4s retina fixing; not done yet
            if (this.pixelRatio == 2)
            {
                this.canvas.setAttribute('height', window.innerHeight * 2);
                this.canvas.setAttribute('width', window.innerWidth * 2);
//                this.ctx.scale(2, 2);
            } else
 */           {
                this.canvasWidth = this.canvas.width;
                this.canvasHeight = this.canvas.height;
            }
            // debugging screen size on devices
            //alert('size: ' + this.canvasWidth + ' x ' + this.canvasHeight+ ' is:' + this.isiPad + ' pr: ' + this.pixelRatio);

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize();
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
        }

    });


// the singleton system by which we reference the device and setup events
pc.device = new pc.Device();
