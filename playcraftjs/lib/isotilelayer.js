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
 * var tileMap = new pc.TileMap(new pc.TileSet(tileSheet), 100, 100, 32, 32);
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

      var screen_center = this.scene.viewPort.w / 2 - tile_width / 2;

      var x, y, factor = 0.25;
      for (y = 0; y < tile_y; y++) {
        var ypos = tile_height * (y + x) * factor;
        for (x = 0; x < tile_x; x++) {
          var xpos;
//          if (x < y) {
//            xpos = screen_center + tile_width * (x - y) * factor;
//            ypos = tile_height * (y + x) * factor;
//          } else if (x > y) {
//            xpos = screen_center - tile_width * (y - x) * factor;
//            ypos = tile_height * (x + y) * factor;
//          } else {
//            xpos = screen_center;
//            ypos = tile_height * y;
//          }
          xpos = (x - y) * tile_width/2 + screen_center;
          ypos = (x + y) * tile_height * factor;
          this.tileMap.drawTileTo(
              pc.device.ctx, x, y,
              this.screenX(xpos), this.screenY(ypos));
        }
      }
    }
  });