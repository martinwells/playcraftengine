/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 */

/**
 * @class pc.Scene
 * Scene - a scene is comprised of one or more layers. It also manages and contains distinct systems by
 * containing a pc.SystemsManager.
 */
pc.Scene = pc.Base.extend('pc.Scene',
    {},
    {
        name:null,
        layersByName:null,
        layers:null,
        activeLayers:null,
        paused:false,
        active:true,

        // todo: systems! -- systems contain entities! we use this to sort which entities to process and draw... so systems need to be in here

        viewPort: null,
        viewPortCenter: null, // readonly, changes when you call setViewPort

        offset:null,           // a flexible origin you can apply to all layers (nice for camera shaking etc)

        init:function (name)
        {
            this._super();
            this.name = name;
            this.layersByName = new pc.Hashtable();
            this.layers = new pc.LinkedList();
            this.activeLayers = new pc.LinkedList();
            this.systemManager = new pc.SystemManager();
            this.offset = pc.Point.create(0,0);

            this.viewPort = pc.Rect.create(0, 0, 0, 0); // set by setViewPort below
            this.viewPortCenter = pc.Point.create(0, 0);

            // set the view port to be the default size of the system canvas
            this.setViewPort(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // if the system has already started, then automatically call the onReady
            if (pc.device.started)
                this.onReady();
        },

        onReady:function ()
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
        onActivated:function ()
        {
        },

        /**
         * Called when this scene has been deactviated
         */
        onDeactivated:function ()
        {
        },

        /**
         * Event notifier when the underlying game canvas is being resized
         * @param width New width of the game canvas
         * @param height New height of the game canvas
         */
        onResize:function (width, height)
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
        setViewPort:function (x, y, width, height)
        {
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
        getScreenRect:function ()
        {
            return this.viewPort;
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your subclass to do something about it.
         * @param actionName The name of the action that happened
         * @param event Raw event object
         * @param pos Position, such as a touch input or mouse position
         */
        onAction:function (actionName, event, pos)
        {
        },

        isActive:function ()
        {
            return this.active;
        },

        get:function (name)
        {
            return this.layersByName.get(name);
        },

        addLayer:function (layer)
        {
            this.layersByName.put(layer.name, layer);
            this.layers.add(layer);
            this.activeLayers.add(layer);
            if (layer.collidable)
                this.collidableLayers.add(layer);
            layer.active = true;
            layer.scene = this;
            layer.onAddedToScene();

            return layer;
        },

        removeLayer:function (layer)
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

        setLayerActive:function (layer)
        {
            this.activeLayers.add(layer);
            layer.active = true;

        },

        setLayerInactive:function (layer)
        {
            this.activeLayers.remove(layer);
            layer.active = false;
        },

        getFirstActiveLayer:function ()
        {
            return this.activeLayers.first;
        },

        getFirstLayer:function ()
        {
            return this.layers.first;
        },

        //
        // LIFECYCLE
        //
        startTime: 0,

        process:function ()
        {
            // draw all the layers
            var next = this.activeLayers.first;
            while (next)
            {
                if (!next.obj.paused)
                {
                    next.obj.process();

                    this.startTime = Date.now();
                    next.obj.draw();
                    pc.device.lastDrawMS += (Date.now() - this.startTime);
                }
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
        collisionCheckEntity:function (e, xMove, yMove)
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
        pause:function ()
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
        resume:function ()
        {
            this.paused = false;
            var next = this.activeLayers.first;
            while (next)
            {
                next.obj.resume();
                next = next.nextLinked;
            }
        },

        reset:function ()
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
        entitiesUnderXY:function (x, y)
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
        loadFromTMX:function (levelData)
        {
            var xmlDoc = pc.device.parseXML(levelData.data);
            var mapXML = xmlDoc.getElementsByTagName('map')[0];

            var tileWidth = parseInt(mapXML.getAttribute('tilewidth'));
            var tileHeight = parseInt(mapXML.getAttribute('tileheight'));

            // load up the tilesets (note: only 1 is supported right now)
            // todo: add support for multiple tile sets
            var tileSet = xmlDoc.getElementsByTagName('tileset')[0];
            var tsName = tileSet.getAttribute('name');
            var tsImageWidth = tileSet.getAttribute('width');
            var tsImageHeight = tileSet.getAttribute('height');
            var tsImageResource = pc.device.loader.get(tsName).resource;
            var tsSpriteSheet = new pc.SpriteSheet(tsImageResource, tileWidth, tileHeight, tsImageWidth / tileWidth,
                tsImageHeight / tileHeight);


            // load tiled layers
            var layers = xmlDoc.getElementsByTagName('layer');
            for (var m = 0; m < layers.length; m++)
            {
                // partial construction
                var newLayer = new pc.TileLayer(null, tsSpriteSheet);
                // fill in the rest using the data from the TMX file
                newLayer.loadFromTMX(layers[m]);
                this.addLayer(newLayer);
            }

            // load entity layers
            var objectGroups = xmlDoc.getElementsByTagName('objectgroup');
            for (var i = 0; i < objectGroups.length; i++)
            {
                // partial construction
                var n = new pc.EntityLayer(null);

                // fill in the rest using the data from the TMX file
                n.loadFromTMX(objectGroups[i]);
                this.addLayer(n);
            }

        }




    });
