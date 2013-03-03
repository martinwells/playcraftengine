/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.HexTileLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * A specialized tile layer capable of rendering 6-sided (flat) hex tiles.
 */

pc.HexTileLayer = pc.TileLayer.extend('pc.HexTileLayer',
  /** @lends pc.HexTileLayer */
  {
  },
  /** @lends pc.HexTileLayer.prototype */
  {
    _hexSide: 0,
    _halfHexSide: 0,
    _yInc: 0,

    /**
     * Constructor for the tile layer
     * @param {String} name Name of the layer
     * @param {pc.TileMap} [tileMap] Tile map data used for the tile layer
     * @param {pc.TileSet} [tileSet] If no tile map is supplied, you can optional provide a tile set and a
     * tile map will be constructed using this tile set
     */
    init: function (name, tileMap, tileSet)
    {
      // call my parent, but force prerendering off
      this._super(name, false, tileMap, tileSet);
      this._hexSide = this.tileMap.tileHeight / Math.sqrt(3);
      this._halfHexSide = this._hexSide / 2;
      this._yInc = this.tileMap.tileHeight - this._halfHexSide;

      // temps
      this._worldPosTemp = pc.Point.create(0, 0);
    },

    _worldPosTemp: null,

    /**
     * Get the tile x, y position given a screen position
     * @param screenPos {pc.Point}
     * @param {pc.Point} [returnPos] Optional return point (so you can pass in a point to be set)
     * @returns {pc.Point}
     */
    screenToTilePos: function (screenPos, returnPos)
    {
      if (!returnPos) returnPos = pc.Point.create(0,0);
      // convert the screen position into a world relative position
      this.worldPos(screenPos, this._worldPosTemp);
      return this.worldToTilePos(this._worldPosTemp, returnPos)
    },

    /**
     * Get the tile x, y position given a world position
     * @param worldPos {pc.Point}
     * @param {pc.Point} [returnPos] Optional return point (so you can pass in a point to be set)
     * @returns {pc.Point}
     */
    worldToTilePos: function(worldPos, returnPos)
    {
      if (!returnPos) returnPos = pc.Point.create(0,0);

      // figure out which tile is at that position
      var ty = Math.floor(worldPos.y / this._yInc);
      // offset for hex grid (every second row is off by a half tile wifth
      if (ty % 2)
        worldPos.x -= Math.floor(this.tileMap.tileWidth / 2);

      returnPos.x = Math.floor(worldPos.x / this.tileMap.tileWidth);
      returnPos.y = Math.floor(ty);
      return returnPos;
    },

    /**
     * Get the world position of a given tile x, y
     * @param tilePos {pc.Point}
     * @param {pc.Point} [returnPos] Optional return point (so you can pass in a point to be set)
     * @returns {pc.Point}
     */
    tileToWorldPos: function(tilePos, returnPos)
    {
      if (!returnPos) returnPos = pc.Point.create(0,0);

      returnPos.y = Math.floor( tilePos.y * this._yInc );
      returnPos.x = Math.floor( tilePos.x * this.tileMap.tileWidth);
      if (tilePos.y % 2)
        returnPos.x += Math.floor(this.tileMap.tileWidth / 2);

      return returnPos;
    },

    /**
     * Draws the hex tiles
     */
    drawTiled: function ()
    {
      var tx = Math.floor(this.origin.x / this.tileMap.tileWidth);
      if (tx < 0) tx = 0;
      var ty = Math.floor(this.origin.y / this.tileMap.tileHeight);
      if (ty < 0) ty = 0;

      var tw = (Math.ceil((this.origin.x + this.scene.viewPort.w) / this.tileMap.tileWidth) - tx);
      if (tx + tw >= this.tileMap.tilesWide - 1) tw = this.tileMap.tilesWide - 1 - tx;
      var th = (Math.ceil((this.origin.y + this.scene.viewPort.h) / this.tileMap.tileHeight) - ty);
      if (ty + th >= this.tileMap.tilesHigh - 1) th = this.tileMap.tilesHigh - 1 - ty;

      for (var hy = ty, c = th + ty; hy < c + 1; hy++)
      {
        // y is increased by a special amount relative to the hex size
        var ypos = hy * this._yInc;

        for (var hx = tx, d = tw + tx; hx < d; hx++)
        {
          var xpos = hx * this.tileMap.tileWidth;

          // offset every second row
          if (hy % 2)
            xpos += this.tileMap.tileWidth / 2;

          var tileType = this.tileMap.tiles[hy][hx];

          if (tileType >= 0)  // -1 means no tile
          {
            this.tileMap.drawTile(hx, hy, this.screenX(xpos), this.screenY(ypos));
          }
        }
      }
    }


  });

