/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.IsoTileLayer
 * @description
 * [Extends <a href='pc.TileLayer'>pc.TileLayer</a>]
 * <p>
 * An Iso tile layer is a specialized layer capable of managing and rendering large graphics isometric layers using tiles of a
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
 * var tileMap = new pc.TileMap([new pc.TileSet(tileSheet)], 100, 100, 32, 32);
 *
 * // set all the tiles to empty
 * tileMap.generate(0);
 *
 * // set the tile at tile position x=3, y=2 to tile number 1
 * tileMap.setTile(3, 2, 1);
 *
 * // create the tile layer using the supplied tile map
 * var myTileLayer = new pc.IsoTileLayer('my tile layer', true, tileMap);
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
 * By default, iso tile layers have prerendering disabled by the time being.
 * <p>
 * If you change the tile map, you can use the prerender method to update the cache images.
 */
pc.IsoTileLayer = pc.TileLayer.extend("IsoTileLayer",
  {
    /**
     * Constructs a iso tile layer using data from a TMX formatted (XML base 64) data stream
     * @param {pc.Scene} scene Scene to add the new layer to
     * @param {String} layerXML XML data for layer
     * @param {Number} tileWidth Width of each tile
     * @param tileHeight Height of each tile
     * @param tileSets {Array} Array of TileSets
     */
    loadFromTMX: function (scene, layerXML, tileWidth, tileHeight, tileSets) {
      var name = layerXML.getAttribute('name');
      var newLayer = new pc.IsoTileLayer(name, true, null, tileSets);

      // fill in the rest using the data from the TMX file
      newLayer.configFromTMX(layerXML);
      newLayer.tileMap.loadFromTMX(layerXML, tileWidth, tileHeight);
      scene.addLayer(newLayer);
    },

    /**
     * Constructs a iso tile layer using data from a javascript object
     * @param {pc.Scene} scene Scene to add the new layer to
     * @param {String} Information about the layer
     * @param {Number} tileWidth Width of each tile
     * @param tileHeight Height of each tile
     * @param tileSets {Array} Array of TileSets
     */
    loadFromJson: function (scene, info, tileWidth, tileHeight, tileSets) {
      var name = info.name;
      var newLayer = new pc.IsoTileLayer(name, true, null, tileSets);

      // fill in the rest using the data from the TMX file
      newLayer.configFromJson(info);
      newLayer.tileMap.loadFromJson(info, tileWidth, tileHeight);
      scene.addLayer(newLayer);
    }
  },
  {
    /**
     * Constructor for the tile layer
     * @param {String} name Name of the layer
     * @param {Boolean} [usePrerendering] Whether prerendering should be used (defaults to false)
     * @param {pc.TileMap} [tileMap] Tile map data used for the tile layer
     * @param {Array} [tileSets] If no tile map is supplied, you can optional provide a tile set and a
     * tile map will be constructed using this tile set
     */
    init: function (name, usePrerendering, tileMap, tileSets) {
      this._super(name, pc.checked(usePrerendering, false), tileMap, tileSets);
    },
    
    /**
     * Draws the tiled version of the layer (called automatically by a call to draw if prerendering is not used)
     */
    drawTiled: function () {
      // Figure out which tiles are on screen
      var tile_x = this.tileMap.tiles[0].length;
      if (tile_x < 0) {
        tile_x = 0;
      }

      var tile_y = this.tileMap.tiles.length;
      if (tile_y < 0) {
        tile_y = 0;
      }

      var screen_width = this.scene.viewPort.w;
      var screen_height = this.scene.viewPort.h;

      var tile_width = this.tileMap.tileWidth;
      var tile_height = this.tileMap.tileHeight;

      var center_x = (this.scene.viewPort.w - tile_width) / 2;
      var x, y;
      for (y = 0; y < tile_y; y++) {
        for (x = 0; x < tile_x; x++) {
          var xpos = (x - y) * tile_width/2 + center_x;
          var ypos = (x + y) * tile_height/2;
          this.tileMap.drawTileTo(
              pc.device.ctx, x, y,
              this.screenX(xpos), this.screenY(ypos));
        }
      }
    },

    /**
     * Calculate the pixel offset into this layer of the given tile.  This returns
     * the X coordinate of the center of the tile.
     *
     * @param tileX Tile column
     * @param tileY Tile row
     * @returns {number} X coordinate relative to the layer for the center of the tile
     */
    tileWorldX:function(tileX,tileY) {
      return ((tileX - tileY - 1) * this.tileMap.tileWidth + this.scene.viewPort.w) / 2;
    },

    /**
     * Calculate the screen (well, viewport really) relative position of the tile.
     *
     * @param tileX Tile column
     * @param tileY Tile row
     * @returns {number} X coordinate relative to the left of the screen/viewport
     */
    tileScreenX:function(tileX,tileY) {
      return this.screenX(this.tileWorldX(tileX,tileY));
    },

    /**
     * Calculate the pixel offset into this layer of the given tile.  This returns
     * the Y coordinate of the top edge of the tile.
     *
     * @param tileX Tile column
     * @param tileY Tile row
     * @returns {number} Y coordinate relative to the layer origin
     */
    tileWorldY:function(tileX,tileY) {
      return (tileX + tileY - 1) * this.tileMap.tileHeight/2;
    },

    /**
     * Calculate the screen (well, viewport really) relative position of the tile.
     *
     * @param tileX Tile column
     * @param tileY Tile row
     * @returns {number} Y coordinate relative to the top of the screen/viewport
     */
    tileScreenY:function(tileX,tileY) {
      return this.screenY(this.tileWorldY(tileX,tileY));
    },

    /**
     * Convert a coordinate relative to the layer into a tile
     * column number.  The number is not rounded to a whole number,
     * the caller can do this using Math.floor().
     *
     * @param worldX Layer X coordinate
     * @param worldY Layer Y coordinate
     */
    worldTileX:function(worldX, worldY) {
      var screenWidth = this.scene.viewPort.w;
      var tileWidth = this.tileMap.tileWidth;
      var tileHeight = this.tileMap.tileHeight;
      return (worldX - screenWidth/2) / tileWidth + worldY / tileHeight;
    },

    /**
     * Convert a coordinate relative to the layer into a tile
     * row number.  The number is not rounded to a whole number,
     * the caller must do this themself using Math.floor().
     *
     * @param worldX Layer X coordinate
     * @param worloY Layer Y coordinate
     */
    worldTileY:function(worldX, worldY) {
      var screenWidth = this.scene.viewPort.w;
      var tileWidth = this.tileMap.tileWidth;
      var tileHeight = this.tileMap.tileHeight;
      return worldY / tileHeight - (worldX - screenWidth/2) / tileWidth;
    },

    /**
     * Take a screen location and translate it into a
     * tile column value.  The result is not rounded to
     * a whole number - use Math.floor() to get the
     * integer column number.
     *
     * @param screenX Screen x coordinate in pixels
     * @param screenY Screen y coordinate in pixels
     * @returns {number} World tile x coordinate in tiles
     */
    screenTileX:function(screenX,screenY) {
      var worldX = this.worldX(screenX);
      var worldY = this.worldY(screenY);
      return this.worldTileX(worldX, worldY);
    },

    /**
     * Take a screen location and translate it into a
     * tile row value.  The result is not rounded to
     * a whole number - use Math.floor() to get the
     * integer row number.
     *
     * @param screenX Screen x coordinate in pixels
     * @param screenY Screen y coordinate in pixels
     * @returns {number} World tile x coordinate in tiles
     */
    screenTileY:function(screenX,screenY) {
      var worldX = this.worldX(screenX);
      var worldY = this.worldY(screenY);
      return this.worldTileY(worldX, worldY);
    }
  });