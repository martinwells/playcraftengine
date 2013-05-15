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
    EMPTY_TILE: -1
  },
  /** @lends pc.TileMap.prototype */
  {
    /** 2d array of tile data */
    tiles: null,
    /** Number of tiles the map is wide */
    tilesWide: 0,
    /** Number of tiles the map is high */
    tilesHigh: 0,
    /** Width of each tile */
    tileWidth: 0,
    /** Height of each tile */
    tileHeight: 0,
    /** Current tile set */
    tileSets: null,

    /**
     * Constructs a new tile map using the supplied dimensions and tile set
     * @param {Array} tileSets Tile sets to use
     * @param {Number} tilesWide Number of tiles the map is wide
     * @param {Number} tilesHigh Number of tiles the map is high
     * @param {Number} tileWidth Width of each tile (e.g. 32)
     * @param {Number} tileHeight Height of each tile (e.g. 32)
     * @param {Array} tiles An array of tile data ordered by y then x
     */
    init: function (tileSets, tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
    {
      this.tiles = tiles;
      this.tilesWide = pc.Math.round(tilesWide);
      this.tilesHigh = pc.Math.round(tilesHigh);
      this.tileWidth = Math.round(pc.checked(tileWidth, tileSets[0].tileSpriteSheet.frameWidth));
      this.tileHeight = Math.round(pc.checked(tileHeight, tileSets[0].tileSpriteSheet.frameHeight));
      this.tileSets = tileSets;
    },

    /**
     * Checks against this tilemap's tileset to see if the tile at a given location has a property set
     * @param {Number} tileX X tile location to check
     * @param {Number} tileY Y tile location to check
     * @param {String} property Property string to check for
     */
    tileHasProperty: function (tileX, tileY, property)
    {
      // get the number of the tile at tileX, tileY
      var tileNumber = this.getTile(tileX, tileY);
      if (tileNumber == 0)
        return false;

      //for(var i=0; i < this.tileSets.length; i++) {

      //}
      return this.getTileSetForTileId(tileNumber).hasProperty(tileNumber, property);
    },

    /**
     * Generate a new tile map, optionally populating with a given tile type
     * @param {Number} tileType Type of tile to set the map to. Leave off to leave the tile map empty
     */
    generate: function (tileType)
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
    paint: function (x, y, w, h, tileType)
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
    isOnMap: function (x, y)
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
    clear: function (tx, ty, tw, th)
    {
      this.paint(tx, ty, tw, th, this.Class.EMPTY_TILE);
    },

    /**
     * Sets a tile at a given location
     * @param {Number} tx Tile x
     * @param {Number} ty Tile y
     * @param {Number} tileType Type to set
     */
    setTile: function (tx, ty, tileType)
    {
      this.tiles[ty][tx] = tileType;
    },

    /**
     * Get the tile type at a given tile location
     * @param {Number} tx Tile x
     * @param {Number} ty Tile y
     * @return {Number} type of tile at that location or -1 if not on the map
     */
    getTile: function (tx, ty)
    {
      if (!this.isValidTile(tx, ty)) return -1;
      return this.tiles[ty][tx];
    },

    /**
     * Given a tile id, locate the tile set it should be in.  For tile ID's that are out of range (too high)
     * this should return the last tile set in the list.
     *
     * The tile set to use is the last tile set whose start offset is less than or equal to the given
     * tile id.
     *
     * This assumes the tileSets list is not empty.
     *
     * @param tileId Tile ID we are looking for
     */
    getTileSetForTileId: function(tileId)
    {
      var i;
      for(i=1; i < this.tileSets.length; i++)
      {
        var tileSet = this.tileSets[i];
        if(tileSet.idOffset >= tileId) {
          break;
        }
      }
      return this.tileSets[i-1];
    },

    /**
     * Draw a given tile from the tile map, at a given screen position
     * @param tileX Tile x to draw (within the tile map)
     * @param tileY Tile y to draw (within the tile map)
     * @param x Screen X to draw the tile at
     * @param y Screen Y to draw the tile at
     */
    drawTile: function (tileX, tileY, x, y)
    {
      this.drawTileByIdTo(pc.device.ctx, tileX, tileY, x, y);
    },

    /**
     * Draw a tile, given by id, using the given graphics context.
     *
     * Used for pre-rendering tiles, mainly.
     *
     * @param ctx Rendering context to draw with
     * @param tileX Tile x to draw (within the tile map)
     * @param tileY Tile y to draw (within the tile map)
     * @param x X position to draw to
     * @param y Y position to draw to
     */
    drawTileTo: function(ctx, tileX, tileY, x, y)
    {
      var tileId = this.tiles[tileY][tileX];
      if(!pc.valid(tileId)) console.log('drawTileTo', this, tileX, tileY, tileId);
      if(tileId != -1) {
        var tileSet = this.getTileSetForTileId(tileId);
        tileSet.drawTile(ctx, tileId, x, y);
        return true;
      } else {
        return false;
      }
    },

    /**
     * Loads a tile map from a TMX formatted data stream
     * @param {String} layerXML XML string loaded from a Tiled TMX file
     * @param tileHeight
     * @param tileWidth
     */
    loadFromTMX: function (layerXML, tileWidth, tileHeight)
    {
      this.tileWidth = tileWidth;
      this.tileHeight = tileHeight;

      this.tilesWide = parseInt(layerXML.getAttribute('width'));
      this.tilesHigh = parseInt(layerXML.getAttribute('height'));

      var data = layerXML.getElementsByTagName('data')[0];
      if (data.getAttribute('compression'))
      {
        this.error('map: ' + name + ': TMX map compression not supported, use base64 (uncompressed)');
        return;
      }

      this.tiles = new Array(this.tilesHigh);
      if (data.getAttribute('encoding') == 'base64')
      {
        // convert the base64 data to tiles
        var tileData = '';
        for (var n = 0; n < data.childNodes.length; n++)
          tileData += data.childNodes[n].nodeValue;

        // trim
        tileData = tileData.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        var decoded = pc.Base64.decode(tileData);

        // decode as an array
        var row = null;
        var atx = 0;
        var aty = 0;
        for (var i = 0; i < decoded.length / 4; i++)
        {
          var b = 0;
          for (var j = 3; j >= 0; --j)
            b += decoded.charCodeAt((i * 4) + j) << (j << 3);
          if(atx == 0)
            this.tiles[aty] = row = new Array(this.tilesWide);
          row[atx] = b-1; // TMX uses zero for "no tile", playcraft uses -1
          atx++;
          if(atx == this.tilesWide)
          {
            atx = 0;
            aty++;
          }
        }
      }
    }


  });






