/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileMap
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * @description
 * A map of tiles using by pc.TileLayer to what to draw. See <a href='pc.TileLayer'>pc.TileLayer</a> for details
 * on using a tile map with a tile layer.
 * <p>
 * A tile map contains both a 2d array of tile data, size of each tile and the size of the map. It also links to
 * a spritesheet which contains the tile images to render.
 * <p>
 * An example tile map setup:
 * <pre><code>
 * var tileMap = new pc.TileMap(new pc.TileSet(tileSheet), 100, 100, 32, 32);
 *
 * // set all the tiles to empty
 * tileMap.generate(0);
 *
 * // set the tile at tile position x=3, y=2 to tile number 1
 * tileMap.setTile(3, 2, 1);
 * </code></pre>
 * <p>
 * You can directly access tile data using the tiles member:
 * <pre><code>
 * tileMap.tiles[tileY][tileX] = tileType;
 * </code></pre>
 * <p>
 * If you do modify the tile map though, and you're using prerendering you will need to call prerender on the tile
 * layer so the prerendered images are updated.
 */

pc.TileMap = pc.Base.extend('pc.TileMap',
    /** @lends pc.TileMap */
    {
        EMPTY_TILE:-1
    },
    /** @lends pc.TileMap.prototype */
    {
        /** 2d array of tile data */
        tiles:null,
        /** Number of tiles the map is wide */
        tilesWide:0,
        /** Number of tiles the map is high */
        tilesHigh:0,
        /** Width of each tile */
        tileWidth:0,
        /** Height of each tile */
        tileHeight:0,
        /** Current tile set */
        tileSet:null,

        /**
         * Constructs a new tile map using the supplied dimensions and tile set
         * @param {pc.TileSet} tileSet Tile set to use
         * @param {Number} tilesWide Number of tiles the map is wide
         * @param {Number} tilesHigh Number of tiles the map is high
         * @param {Number} tileWidth Width of each tile (e.g. 32)
         * @param {Number} tileHeight Height of each tile (e.g. 32)
         * @param {Array} tiles An array of tile data ordered by y then x
         */
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
         * @param {Number} tileX X tile location to check
         * @param {Number} tileY Y tile location to check
         * @param {String} property Property string to check for
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
         * @param {Number} tileType Type of tile to set the map to. Leave off to leave the tile map empty
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
         * @param {Number} x tile X position to start the paint
         * @param {Number} y tile Y position to start the paint
         * @param {Number} w How wide to paint
         * @param {Number} h How high to paint
         * @param {Number} tileType Type of tile to paint
         */
        paint:function (x, y, w, h, tileType)
        {
            for (var aty = y; aty < y + h; aty++)
                for (var atx = x; atx < x + w; atx++)
                    this.tiles[aty][atx] = tileType;
        },

        /**
         * Checks if a given tile location is within the tile map dimensions
         * @param {Number} x Tile x
         * @param {Number} y Tile y
         * @return {Boolean} true if the location is on the map
         */
        isOnMap:function (x, y)
        {
            return (x >= 0 && x < this.tilesWide && y >= 0 && y < this.tilesHigh);
        },

        /**
         * Clear a region of the tile map (setting the tiles to 0)
         * @param {Number} tx Starting tile x
         * @param {Number} ty Starting tile y
         * @param {Number} tw Number of tiles wide to clear
         * @param {Number} th Number of tiles high to clear
         */
        clear:function (tx, ty, tw, th)
        {
            this.paint(tx, ty, tw, th, this.Class.EMPTY_TILE);
        },

        /**
         * Sets a tile at a given location
         * @param {Number} tx Tile x
         * @param {Number} ty Tile y
         * @param {Number} tileType Type to set
         */
        setTile:function (tx, ty, tileType)
        {
            this.tiles[ty][tx] = tileType;
        },

        /**
         * Get the tile type at a given tile location
         * @param {Number} tx Tile x
         * @param {Number} ty Tile y
         * @return {Number} type of tile at that location or -1 if not on the map
         */
        getTile:function (tx, ty)
        {
            if (!this.isOnMap(tx, ty)) return -1;
            return this.tiles[ty][tx];
        },

        /**
         * Loads a tile map from a TMX formatted data stream
         * @param {String} layerXML XML string loaded from a Tiled TMX file
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