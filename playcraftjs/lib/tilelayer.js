/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * A tile layer is a specialized layer capable of managing and rendering large graphics layers using tiles of a
 * set dimension. Tile layers are more efficient to edit, update and render due to the set size of each tile.
 * <p>
 * To create a tile layer, first create a <a href='pc.TileMap'>tile map</a> containing the tile images and map data:
 * <pre><code>
 * // grab a tile sheet previously added to the resource loader
 * var tileSheet = new pc.SpriteSheet(
 *    { image:pc.device.loader.get('myTiles').resource,
 *      frameWidth:32, frameHeight:32 });
 *
 * // create a tile map to hold our tile data, using the supplied tile sheet
 * // 100 tiles wide by 100 tiles high with a tile height and width of 32
 * var tileMap = new pc.TileMap(new pc.TileSet(tileSheet), 100, 100, 32, 32);
 *
 * // set all the tiles to empty
 * tileMap.generate(0);
 *
 * // set the tile at tile position x=3, y=2 to tile number 1
 * tileMap.setTile(3, 2, 1);
 *
 * // create the tile layer using the supplied tile map
 * var myTileLayer = new pc.TileLayer('my tile layer', true, tileMap);
 * </code></pre>
 * <p>
 * Refer to <a href='pc.TileMap'>pc.TileMap</a> and <a href='pc.TileSet'>pc.TileSet</a> for more information on tile
 * graphics and maps.
 * <p>
 * <h5>Tiled Editor Integration</h5>
 * You can dynamically construct a tile layer using XML data from the Tiled map editor using the static loadFromTMX
 * constructor. Typically this is not used directly; you should use the pc.Scene loadFromTMX method for more information
 * on loading levels using Tiled.
 * <p>
 * <h5>Prerendering</h5>
 * By default, tile layers will use prerendering in order to "prebake" large blocks of tiles into cached images.
 * These images are then drawn instead of the individual tiles. This results in a large performance boost (5x to 10x) in
 * rendering speed. Prerendering is enabled by default.
 * <p>
 * There are some cases where prerendering may not be the best option, these include:
 * <ul>
 *     <li>When tile maps are regularly changing during a game - you will need to constantly re-render the tile blocks
 *     which is a slow process (relative to just drawing the tiles on each update)</li>
 *     <li>If the size of tiles is greater than 256x256 you may find only a minor speed difference (at the expense
 *     of graphics memory). Prerendering is disabled by default if you specify a tile map with a tile size greater
 *     than 256x256.</li>
 * </ul>
 * <p>
 * You can disable prerendering using the constructor option:
 * <pre><code>
 * // false indicates prerendering should not be used
 * var myTileLayer = new pc.TileLayer('my tile layer', false);
 * </code></pre>
 * <p>
 * If you change the tile map, you can use the prerender method to update the cache images.
 */

pc.TileLayer = pc.Layer.extend('pc.TileLayer',
    /** @lends pc.TileLayer */
    {
        /**
         * Constructs a tile layer using data from a TMX formatted (XML base 64) data stream
         * @param {pc.Scene} scene Scene to add the new layer to
         * @param {String} layerXML XML data for layer
         * @param {Number} tileWidth Width of each tile
         * @param tileHeight Height of each tile
         */
        loadFromTMX:function (scene, layerXML, tileWidth, tileHeight, tileSet)
        {
            var name = layerXML.getAttribute('name');
            var newLayer = new pc.TileLayer(name, true, null, tileSet);

            // fill in the rest using the data from the TMX file

            newLayer.tileMap.loadFromTMX(layerXML, tileWidth, tileHeight);
            scene.addLayer(newLayer);
        }
    },
    /** @lends pc.TileLayer.prototype */
    {
        /** pc.TileMap data used for this tile layer */
        tileMap:null,
        /** show a debugging grid around all the tiles */
        debugShowGrid:false,
        /** array of prerendered images */
        prerenders:null,
        /** indicates if prerendering is currently in use */
        usePrerendering:true,
        /** the size of the prerender chunks - default is 512 */
        prerenderSize:512,

        /**
         * Constructor for the tile layer
         * @param {String} name Name of the layer
         * @param {Boolean} [usePrerendering] Whether prerendering should be used (defaults to true)
         * @param {pc.TileMap} [tileMap] Tile map data used for the tile layer
         * @param {pc.TileSet} [tileSet] If no tile map is supplied, you can optional provide a tile set and a
         * tile map will be constructed using this tile set
         */
        init:function (name, usePrerendering, tileMap, tileSet)
        {
            this._super(name);
            this.tileMap = pc.checked(tileMap, new pc.TileMap(tileSet));

            this.usePrerendering = pc.checked(usePrerendering, true);
            if (this.tileMap && this.tileMap.tileWidth > 256)
                this.usePrerendering = false;
        },

        /**
         * Set the tile map
         * @param {pc.TileMap} tileMap The tile map to set
         */
        setTileMap:function (tileMap)
        {
            this.tileMap = tileMap;
            if (this.usePrerendering)
                this.prerender();
        },

        /**
         * Prerender using the current tilemap and tileset. Called automatically when a tile map is changed or when
         * the tile layer is constructed. Only needs to be called again if you change the tile map or tile set.
         */
        prerender:function ()
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

        /**
         * Draws the tile layer to the current context (typically called automatically by the scene)
         */
        draw:function ()
        {
            this._super();
            if (!this.tileMap || !this.tileMap.tilesWide) return;

            if (this.usePrerendering)
                this.drawPrerendered();
            else
                this.drawTiled();
        },

        /**
         * Draws the tiled version of the layer (called automatically by a call to draw if prerendering is not used)
         */
        drawTiled:function ()
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

            for (var y = ty, c = ty + th; y < c + 1; y++)
            {
                var ypos = this.screenY(y * this.tileMap.tileHeight);

                for (var x = tx, d = tx + tw; x < d; x++)
                {
                    var tileType = this.tileMap.tiles[y][x];
                    if (tileType >= 0)  // -1 means no tile
                    {
                        this.tileMap.tileSet.drawTile(
                            pc.device.ctx, tileType,
                            this.screenX(x * this.tileMap.tileWidth), ypos);
                    }

                    if (this.debugShowGrid)
                    {
                        pc.device.ctx.save();
                        pc.device.ctx.strokeStyle = '#222222';
                        pc.device.ctx.strokeRect(this.screenX(x * this.tileMap.tileWidth), this.screenY(y * this.tileMap.tileHeight),
                            this.tileMap.tileWidth, this.tileMap.tileHeight);
                        pc.device.ctx.restore();
                    }
                }
            }
        },

        /**
         * Draws the prerendered version of the layer (called automatically by a call to draw if prerendering is used)
         */
        drawPrerendered:function ()
        {
            if (!this.prerenders)
                this.prerender();

            var drawX = -(this.origin.x) + this.scene.viewPort.x;
            var drawY = -(this.origin.y) + this.scene.viewPort.y;
            var startPX = Math.max(Math.floor(this.origin.x / this.prerenderSize), 0);
            var startPY = Math.max(Math.floor(this.origin.y / this.prerenderSize), 0);
            var maxPX = startPX + Math.ceil((this.origin.x + this.scene.viewPort.w) / this.prerenderSize);
            var maxPY = startPY + Math.ceil((this.origin.y + this.scene.viewPort.h) / this.prerenderSize);

            maxPX = Math.min(maxPX, this.prerenders[0].length);
            maxPY = Math.min(maxPY, this.prerenders.length);

            for (var cy = startPY; cy < maxPY; cy++)
                for (var cx = startPX; cx < maxPX; cx++)
                    pc.device.ctx.drawImage(this.prerenders[cy % this.prerenders.length][cx % this.prerenders[0].length],
                        drawX + (cx * this.prerenderSize), drawY + (cy * this.prerenderSize));
        }



    });

