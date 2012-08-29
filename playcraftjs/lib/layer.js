/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 */

pc.Layer = pc.Base.extend('pc.Layer', {}, {

    name:null,
    paused:false,
    active:false,
    scene:null,
    zIndex:0,
    originTrack: null,
    originTrackXRatio: 1,
    originTrackYRatio: 1,

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
        this.originTrack = null;
        this.originTrackXRatio = 0;
        this.originTrackYRatio = 0;
    },

    toString: function()
    {
        return '' + this.name + ' (origin: ' + this.origin + ', zIndex: ' + this.zIndex + ')';
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
     * Draw the layer's scene. Use the scene's viewport and origin members to correctly position things.
     * Typical used for simple/custom layers with no entities or tiles.
     */
    draw:function ()
    {
    },

    /**
     * Sets tracking for this origin to always follow the origin of another layer. The ratio can be used
     * to parallax the layer.
     * @param trackLayer Layer to track
     * @param [xRatio] Ratio to track horizontally (i.e. trackLayer.origin.x * xRatio)
     * @param [yRatio] Ratio to track vertically (i.e. trackLayer.origin.y * yRatio)
     */
    setOriginTrack:function (trackLayer, xRatio, yRatio)
    {
        this.originTrack = trackLayer;
        this.originTrackXRatio = pc.checked(xRatio, 1);
        this.originTrackYRatio = pc.checked(yRatio, 1);
    },

    /**
     * Sets the origin world point of the top left of this layer.
     */
    setOrigin:function (x, y)
    {
        if (this.origin.x == Math.round(x) && this.origin.y == Math.round(y))
            return false;
        this.origin.x = Math.round(x);
        this.origin.y = Math.round(y);
        return true;
    },

    process:function ()
    {
        if (this.originTrack)
        {
            this.setOrigin(this.originTrack.origin.x * this.originTrackXRatio,
                this.originTrack.origin.y * this.originTrackYRatio);
        }
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
pc.EntityLayer = pc.Layer('pc.EntityLayer',
    {},
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

        getSystemsByComponentType: function(componentType)
        {
            return this.systemManager.getByComponentType(componentType);
        },

        removeSystem: function(system)
        {
            this.systemManager.remove(system);
        },

        process:function ()
        {
            this._super();
            this.systemManager.processAll();
            this.entityManager.cleanup();
        },

        setOrigin:function (x, y)
        {
            var didChange = this._super(x, y);
            if (didChange)
                this.systemManager.onOriginChange(x, y);
            return didChange;
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


pc.TileSet = pc.Base.extend('pc.TileSet',
    {},
    {
        tileSpriteSheet: null,
        props: null,

        init: function(spriteSheet)
        {
            this.tileSpriteSheet = spriteSheet;
            this.props = new Array(spriteSheet.totalFrames);
            for (var i=0; i < this.props.length; i++)
            {
                this.props[i] = new pc.Hashmap();
            }
        },

        drawTile: function(ctx, tileNumber, x, y)
        {
            this.tileSpriteSheet.drawFrame(
                ctx,
                tileNumber % this.tileSpriteSheet.framesWide,
                pc.Math.floor(tileNumber / this.tileSpriteSheet.framesWide),
                x, y);
        },

        addProperty: function(tileNumber, key, value)
        {
            this.props[tileNumber].put(key, value);
        },

        hasProperty: function(tileNumber, key)
        {
            return this.props[tileNumber].hasKey(key);
        },

        getProperties: function(tileNumber)
        {
            return this.props[tileNumber];
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
        tileSet: null,

        init:function (tileSet, tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
        {
            this.tiles = tiles;
            this.tileWidth = pc.Math.round(tileWidth);
            this.tileHeight = pc.Math.round(tileHeight);
            this.tilesWide = pc.Math.round(tilesWide);
            this.tilesHigh = pc.Math.round(tilesHigh);
            this.tileSet = tileSet;
        },

        /**
         * Checks against this tilemap's tileset to see if the tile at a given location has a property set
         * @param tileX
         * @param tileY
         * @param property
         */
        tileHasProperty:function (tileX, tileY, property)
        {
            // get the number of the tile at tileX, tileY
            var tileNumber = this.getTile(tileX, tileY);
            if (tileNumber >= 0)
                return this.tileSet.hasProperty(tileNumber, property);
            return false;
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
            this.paint(tx, ty, tw, th, this.Class.EMPTY_TILE);
        },

        setTile:function (tx, ty, tileType)
        {
            this.tiles[ty][tx] = tileType;
        },

        getTile:function(tx, ty)
        {
            if (!this.isOnMap(tx, ty)) return -1;
            return this.tiles[ty][tx];
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
        debugShowGrid:false,    // true to show a nice grid helping with debugging
        prerenders: null,       // array of prerendered images of the tiles (improves rendering speed)
        usePrerendering: true,
        prerenderSize: 512,

        init:function (name, usePrerendering, tileMap, tileSet)
        {
            this._super(name);
            this.tileMap = pc.checked(tileMap, new pc.TileMap(tileSet));

            this.usePrerendering = pc.checked(usePrerendering, true);
            if (this.tileMap && this.tileMap.tileWidth > 256)
                this.usePrerendering = false;
        },

        setTileMap: function(tileMap)
        {
            this.tileMap = tileMap;
            if (this.usePrerendering)
                this.prerender();
        },

        prerender: function()
        {
            var totalWidth = this.tileMap.tilesWide * this.tileMap.tileWidth;
            var totalHeight = this.tileMap.tilesHigh * this.tileMap.tileHeight;

            var prerendersWide = Math.ceil(totalWidth / this.prerenderSize);
            var rows = Math.ceil(totalHeight / this.prerenderSize);

            this.prerenders = [];
            for (var cy = 0; cy < rows; cy++)
            {
                this.prerenders[cy] = [];

                for (var cx = 0; cx < prerendersWide; cx++)
                {
                    var prw = (x == prerendersWide - 1) ? totalWidth - x * this.prerenderSize : this.prerenderSize;
                    var prh = (y == rows - 1) ? totalHeight - y * this.prerenderSize : this.prerenderSize;

                    // draw the tiles in this prerender area
                    var tw = prw / this.tileMap.tileWidth + 1;
                    var th = prh / this.tileMap.tileHeight + 1;

                    var nx = (cx * this.prerenderSize) % this.tileMap.tileWidth,
                        ny = (cy * this.prerenderSize) % this.tileMap.tileHeight;

                    var tx = Math.floor(cx * this.prerenderSize / this.tileMap.tileWidth),
                        ty = Math.floor(cy * this.prerenderSize / this.tileMap.tileHeight);

                    var canvas = document.createElement('canvas');
                    canvas.width = prw;
                    canvas.height = prh;
                    var ctx = canvas.getContext('2d');

                    for (var x = 0; x < tw; x++)
                    {
                        for (var y = 0; y < th; y++)
                        {
                            if (x + tx < this.tileMap.tilesWide && y + ty < this.tileMap.tilesHigh)
                            {
                                var tileType = this.tileMap.getTile(x + tx, y + ty);
                                if (tileType >= 0)  // -1 means no tile
                                {
                                    this.tileMap.tileSet.drawTile(
                                        ctx,
                                        tileType,
                                        (x * this.tileMap.tileWidth) - nx,
                                        (y * this.tileMap.tileHeight) - ny);
                                }
                            }
                        }
                    }

                    this.prerenders[cy][cx] = canvas;
                }
            }
        },

        draw:function ()
        {
            this._super();
            if (!this.tileMap || !this.tileMap.tilesWide) return;

            if (this.usePrerendering)
                this.drawPrerendered();
            else
                this.drawTiled();
        },

        drawTiled: function()
        {
            // figure out which tiles are on screen
            var tx = Math.floor(this.origin.x / this.tileMap.tileWidth);
            if (tx < 0) tx = 0;
            var ty = Math.floor(this.origin.y / this.tileMap.tileHeight);
            if (ty < 0) ty = 0;

            var tw = (Math.ceil((this.origin.x + this.scene.viewPort.w) / this.tileMap.tileWidth) - tx) + 2;
            if (tx + tw >= this.tileMap.tilesWide - 1) tw = this.tileMap.tilesWide - 1 - tx;
            var th = (Math.ceil((this.origin.y + this.scene.viewPort.h) / this.tileMap.tileHeight) - ty) + 2;
            if (ty + th >= this.tileMap.tilesHigh - 1) th = this.tileMap.tilesHigh - 1 - ty;

            for (var y = ty, c=ty+th; y < c + 1; y++)
            {
                var ypos = (y * this.tileMap.tileHeight) - this.origin.y + this.scene.viewPort.y;

                for (var x = tx, d=tx+tw; x < d; x++)
                {
                    var tileType = this.tileMap.tiles[y][x];
                    if (tileType >= 0)  // -1 means no tile
                    {
                        this.tileMap.tileSet.drawTile(
                            pc.device.ctx, tileType,
                            (x * this.tileMap.tileWidth) - this.origin.x + this.scene.viewPort.x, ypos);
                    }

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

        drawPrerendered:function ()
        {
            if (!this.prerenders)
                this.prerender();

            var drawX = -(this.origin.x) + this.scene.viewPort.x;
            var drawY = -(this.origin.y) + this.scene.viewPort.y;
            var startPX = Math.max(Math.floor(this.origin.x / this.prerenderSize), 0);
            var startPY = Math.max(Math.floor(this.origin.y / this.prerenderSize), 0);
            var maxPX = startPX+Math.ceil((this.origin.x + this.scene.viewPort.w) / this.prerenderSize);
            var maxPY = startPY+Math.ceil((this.origin.y + this.scene.viewPort.h) / this.prerenderSize);

            maxPX = Math.min(maxPX, this.prerenders[0].length);
            maxPY = Math.min(maxPY, this.prerenders.length);

            for (var cy = startPY; cy < maxPY; cy++)
                for (var cx = startPX; cx < maxPX; cx++)
                    pc.device.ctx.drawImage(this.prerenders[cy % this.prerenders.length][cx % this.prerenders[0].length],
                        drawX + (cx * this.prerenderSize), drawY + (cy * this.prerenderSize));
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





