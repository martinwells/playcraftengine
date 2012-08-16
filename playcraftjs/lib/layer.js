/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 */

pc.Layer = pc.Base.extend('pc.Layer', {}, {

    name:null,
    paused:false,
    active:false,
    scene:null,
    zIndex:0,

    /**
     * World coordinate origin for this layer
     */
    origin:null,

    init:function (name, zIndex)
    {
        this._super();

        this.name = name;
        this.origin = pc.Point.create(0, 0);
        this._worldPos = pc.Point.create(0, 0);
        this._screenPos = pc.Point.create(0, 0);
        this.zIndex = pc.checked(zIndex, 0);
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

    setZIndex:function (z)
    {
        this.zIndex = z;
        if (this.scene)
            this.scene.sortLayers();
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

    _worldPos:null, // cached temp

    /**
     * Gets the world position of a screen position.
     * @param pos {pc.Point} World position of this layer (cached, so you don't need to release it)
     */
    worldPos:function (pos)
    {
        this._worldPos.x = pos.x + this.origin.x;
        this._worldPos.y = pos.y + this.origin.y;
        return this._worldPos;
    },

    _screenPos:null, // cached temp
    /**
     * Get a screen relative position from a world coordinate. You should release the position
     * object after use
     * @param pos World relative position
     */
    screenPos:function (pos)
    {
        this._screenPos.x = pos.x + this.scene.viewPort.x - this.origin.x;
        this._screenPos.y = pos.y + this.scene.viewPort.y - this.origin.y;
        return this._screenPos;
    },

    /**
     * A layer uses whatever screen rectangle is defined by the scene it sits within,
     * so this is just a helper method (and makes it compliant for things like input checking)
     */
    getScreenRect:function ()
    {
        return this.scene.getScreenRect();
    },

    /**
     * This method is typically called by this layer's scene. The view port is the screen
     * coordinates relatively to the physical canvas upon which we are drawing. It is
     * explicitly not in world coordinates -- this is a primary separation of a layer
     * and a scene (scene's deal in screen coordinates, layer's deal in world coordinates
     * which are relative for entities
     */
    draw:function ()
    {
    },

    process:function ()
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

    onAddedToScene:function ()
    {
    },

    onRemovedFromScene:function ()
    {
    },

    /**
     * Fired when a bound event/action is triggered in the input system. Use bindAction
     * to set one up. Override this in your object to do something about it.
     * @param actionName The name of the action that happened
     * @param event Raw event object
     * @param pos Position, such as a touch input or mouse position
     * @param uiTarget the uiTarget where the action occurred
     */
    onAction:function (actionName, event, pos, uiTarget)
    {
    }

});


/**
 * @class pc.EntityLayer - a controllable layer that contains entities
 */
pc.EntityLayer = pc.Layer('pc.Layer', {},
    {
        entityManager:null,
        systemManager:null,
        worldSize:null,

        init:function (name, worldSizeX, worldSizeY, entityFactory)
        {
            this._super(name);
            this.systemManager = new pc.SystemManager();
            this.entityManager = new pc.EntityManager(this.systemManager);
            this.entityManager.layer = this;
            this.systemManager.layer = this;
            this.entityFactory = entityFactory;
            this.worldSize = pc.Dim.create(pc.checked(worldSizeX, 10000), pc.checked(worldSizeY, 10000));
        },

        getEntityManager:function ()
        {
            return this.entityManager;
        },

        getSystemManager:function ()
        {
            return this.systemManager;
        },

        addSystem: function(system)
        {
            this.systemManager.add(system, this.entityManager);
        },

        removeSystem: function(system)
        {
            this.systemManager.remove(system);
        },

        process:function ()
        {
            this.systemManager.processAll();
            this.entityManager.cleanup();
        },

        loadFromTMX:function (groupXML, entityFactory)
        {
            this.name = groupXML.getAttribute('name');

            // Parse object xml instances and turn them into entities
            // XML = <object type="EnemyShip" x="2080" y="256" width="32" height="32"/>
            var objs = groupXML.getElementsByTagName('object');
            for (var i = 0; i < objs.length; i++)
            {
                var objData = objs[i];
                var entityType = null;
                var x = parseInt(objData.getAttribute('x'));
                var y = parseInt(objData.getAttribute('y'));
                var w = parseInt(objData.getAttribute('width'));
                var h = parseInt(objData.getAttribute('height'));
                var props = objData.getElementsByTagName("properties")[0].getElementsByTagName("property");

                var options = {};
                for (var p=0; p < props.length; p++)
                {
                    var name = props[p].getAttribute("name");
                    var value = props[p].getAttribute("value");
                    options[name] = value;
                    if (name === 'entity')
                        entityType = value;
                }

                // create a new entity
                // ask the entity factory to create entity of this type and on this layer
                //
                if (entityType)
                    entityFactory.createEntity(this, entityType, x, y, w, h, options);
                else
                    this.warn('Entity loaded from map with no "entity" type property set. x=' + x + ' y=' + y)
            }
        },

        onResize:function (width, height)
        {
            this.systemManager.onResize(width, height);
        }


    });

/**
 * A map of tiles, typically used to generate physics, or render tiles on a TileLayer
 */
pc.TileMap = pc.Base.extend('pc.TileMap',
    {
        EMPTY_TILE:-1
    },
    {
        tiles:null, // a 2d array of tiles
        tilesWide:0, // number of tiles wide the map is
        tilesHigh:0, // number of tiles high the map is
        tileWidth:0, // width of a tile
        tileHeight:0, // height of a tile

        init:function (tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
        {
            this.tiles = tiles;
            this.tileWidth = pc.Math.round(tileWidth);
            this.tileHeight = pc.Math.round(tileHeight);
            this.tilesWide = pc.Math.round(tilesWide);
            this.tilesHigh = pc.Math.round(tilesHigh);
        },

        /**
         * Generate a new tile map, optionally populating with a given tile type
         * @param tileType Type of tile to set the map to. Leave off to leave the tile map empty
         */
        generate:function (tileType)
        {
            this.tiles = new Array(this.tilesHigh);
            var t = pc.checked(tileType, this.Class.EMPTY_TILE);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.tiles[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.tiles[aty][atx] = t;
            }
        },

        /**
         * Populate an area of the tile map with a given tile type
         * @param x
         * @param y
         * @param w
         * @param h
         * @param tileType
         */
        paint:function (x, y, w, h, tileType)
        {
            for (var aty = y; aty < y + h; aty++)
                for (var atx = x; atx < x + w; atx++)
                    this.tiles[aty][atx] = tileType;
        },

        isOnMap:function (x, y)
        {
            return (x >= 0 && x < this.tilesWide && y >= 0 && y < this.tilesHigh);
        },

        /**
         * Clear a region of the tile map (setting the tiles to 0)
         * @param tx
         * @param ty
         * @param tw
         * @param th
         */
        clear:function (tx, ty, tw, th)
        {
            this.setRegion(this.Class.EMPTY_TILE, tx, ty, tw, th);
        },

        setTile:function (tx, ty, tileType)
        {
            this.tiles[ty][tx] = tileType;
        },

        /**
         * Loads a tile map from a TMX formatted data stream
         * @param layerXML
         */
        loadFromTMX:function (layerXML, tileWidth, tileHeight)
        {
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;

            this.tilesWide = parseInt(layerXML.getAttribute('width'));
            this.tilesHigh = parseInt(layerXML.getAttribute('height'));

            var data = layerXML.getElementsByTagName('data')[0];
            if (data.getAttribute('compression'))
            {
                this.error('map: ' + name + ': TMX map compression not supported, use base64 encoding');
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
                var decoded = atob(tileData);

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
            this.tiles = new Array(this.tilesHigh);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.tiles[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.tiles[aty][atx] = a[aty * this.tilesWide + atx] - 1;
            }
        }


    });

/**
 * @class pc.TiledLayer
 * TiledLayer provides tools for generating tiled map layers.
 * The primary reason to use a tile map is speed. You *could* generate a map simply by
 * creating entities on the screen at fixed, regular positions. A tile map makes
 * things a lot faster due to its granularity. It's easy to figure out which
 * tiles should be drawn because the tile size is fixed, and therefore we can
 * order things in a quick 2d array.
 */
pc.TileLayer = pc.Layer.extend('pc.TileLayer',
    { },
    {
        tileMap:null,
        tileSpriteSheet:null, // the images to use for each tile
        debugShowGrid:false, // true to show a nice grid helping with debugging

        init:function (name, tileSpriteSheet, tileMap)
        {
            this._super(name);
            this.tileMap = pc.checked(tileMap, new pc.TileMap());
            this.tileSpriteSheet = tileSpriteSheet;
        },

        setTileSpriteSheet:function (tileSpriteSheet)
        {
            this.tileSpriteSheet = tileSpriteSheet;
        },

        draw:function (ctx)
        {
            this._super(ctx);

            if (!this.tileMap) return;

            var vx = this.scene.viewPort.x;
            var vy = this.scene.viewPort.y;
            var vw = this.scene.viewPort.w;
            var vh = this.scene.viewPort.h;

            // figure out which tiles are on screen
            var tx = Math.floor(this.origin.x / this.tileMap.tileWidth);
            if (tx < 0) tx = 0;
            var ty = Math.floor(this.origin.y / this.tileMap.tileHeight);
            if (ty < 0) ty = 0;

            var tw = (Math.ceil((this.origin.x + vw) / this.tileMap.tileWidth) - tx) + 2;
            if (tx + tw >= this.tileMap.tilesWide - 1) tw = this.tileMap.tilesWide - 1 - tx;
            var th = (Math.ceil((this.origin.y + vh) / this.tileMap.tileHeight) - ty) + 2;
            if (ty + th >= this.tileMap.tilesHigh - 1) th = this.tileMap.tilesHigh - 1 - ty;

            var yh = ty + th;
            var xh = tx + tw;

            for (var y = ty; y < yh + 1; y++)
            {
                var ypos = (y * this.tileMap.tileHeight) - this.origin.y + vy;

                for (var x = tx; x < xh; x++)
                {
                    var tileType = this.tileMap.tiles[y][x];
                    var tty = pc.Math.floor(tileType / this.tileSpriteSheet.framesWide);
                    var ttx = tileType % this.tileSpriteSheet.framesWide;
                    if (tileType >= 0)  // -1 means no tile
                        this.tileSpriteSheet.drawFrame(pc.device.ctx, ttx, tty,
                            (x * this.tileMap.tileWidth) - this.origin.x + vx, ypos);

                    if (this.debugShowGrid)
                    {
                        pc.device.ctx.save();
                        pc.device.ctx.strokeStyle = '#222222';
                        pc.device.ctx.strokeRect((x * this.tileMap.tileWidth) - this.origin.x, (y * this.tileMap.tileHeight) - this.origin.y,
                            this.tileMap.tileWidth, this.tileMap.tileHeight);
                        pc.device.ctx.restore();
                    }
                }
            }
        },

        /**
         * Loads a tile map from a TMX formatted data stream
         * @param layerXML
         */
        loadFromTMX:function (layerXML, tileWidth, tileHeight)
        {
            this.name = layerXML.getAttribute('name');
            this.tileMap.loadFromTMX(layerXML, tileWidth, tileHeight);
        }


    });





