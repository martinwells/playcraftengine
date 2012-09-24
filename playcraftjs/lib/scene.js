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
    {},
    {
        name:null,
        layersByName:null,
        layers:null,
        activeLayers:null,
        paused:false,
        active:true,
        viewPort: null,
        viewPortCenter: null, // readonly, changes when you call setViewPort

        init:function (name)
        {
            this._super();
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

        onReady:function ()
        {
            // signal all the layers that we're ready
            var next = this.layers.first;
            while (next)
            {
                next.obj.onReady();
                next = next.next();
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
                next = next.next();
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
         * Resorts layer processing/drawing order based on each layers zIndex value
         */
        sortLayers: function()
        {
            this.activeLayers.sort(
                function(a, b)
                {
                    return a.zIndex - b.zIndex;
                });
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
            layer.active = true;
            layer.scene = this;
            layer.onAddedToScene();
            this.sortLayers();

            return layer;
        },

        removeLayer:function (layer)
        {
            this.layersByName.remove(layer.name);
            this.layers.remove(layer);
            this.activeLayers.remove(layer);
            layer.active = false;
            layer.scene = null;
            layer.onRemovedFromScene();
        },

        setLayerActive:function (layer)
        {
            this.activeLayers.add(layer);
            this.sortLayers();
            layer.active = true;
        },

        setLayerInactive:function (layer)
        {
            this.activeLayers.remove(layer);
            layer.active = false;
        },

        toggleLayerActive: function(layer)
        {
            if (layer.active)
                this.setLayerInactive(layer);
            else
                this.setLayerActive(layer);
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
                next = next.next();
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
                next = next.next();
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
                next = next.next();
            }
        },

        reset:function ()
        {
            var next = this.layers.first;
            while (next)
            {
                next.obj.reset();
                next = next.next();
            }

            this.layers.clear();
            this.activeLayers.clear();
        },

        /**
         * Ask all the layers etc for any entities under the x, y position
         * @param x the screen x position
         * @param y the screen y position
         */
        entitiesUnderXY:function (x, y)
        {
            var found = [];
            var next = this.layers.first;
            while (next)
            {
                found.push(next.obj.entitiesUnderXY(x, y));
                next = next.next();
            }
        },


        /**
         * Loads all of the layers from a Tiled (TMX) map file. Tile layers will become instances of
         * TileLayer, objectgroups will become EntityLayers. Tile sets must have a name that matches an
         * available spritesheet image resource. Note that only a single tilesheet is currently supported.
         * @param levelData
         */
        loadFromTMX:function (levelData, entityFactory)
        {
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
            var tsSpriteSheet = new pc.SpriteSheet({ image:tsImageResource, frameWidth:tileWidth, frameHeight:tileHeight });

            // create a tileset object which marries (one or more spritesheet's) and contains tileproperty data
            // pulled from tiled

            var tileSet = new pc.TileSet(tsSpriteSheet);

            // load all the tile properties
            var tiles = xmlDoc.getElementsByTagName('tile');
            for (var p = 0; p < tiles.length; p++)
            {
                var tile = tiles[p];
                var tileId = parseInt(tile.getAttribute('id'));

                var pr = tile.getElementsByTagName('properties')[0];
                var props = pr.getElementsByTagName('property');

                for (var b = 0; b < props.length; b++)
                {
                    var prop = props[b];
                    var name = prop.getAttribute('name');
                    var value = prop.getAttribute('value');
                    tileSet.addProperty(tileId, name, value);
                }
            }

            //
            // LAYERS
            //
            var layers = xmlDoc.getElementsByTagName('layer');
            for (var m = 0; m < layers.length; m++)
            {
                pc.TileLayer.loadFromTMX(this, layers[m], tileWidth, tileHeight, tileSet);
            }

            // load entity layers
            var objectGroups = xmlDoc.getElementsByTagName('objectgroup');
            for (var i = 0; i < objectGroups.length; i++)
            {
                // partial construction

                // fill in the rest using the data from the TMX file
                pc.EntityLayer.loadFromTMX(this, objectGroups[i], entityFactory);
            }

        }




    });
