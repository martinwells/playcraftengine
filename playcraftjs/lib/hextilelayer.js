/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.HexTileLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * A specialized tile layer capable of rendering 6-sided hex tiles.
 */

pc.HexTileLayer = pc.TileLayer.extend('pc.HexTileLayer',
    /** @lends pc.HexTileLayer */
    {
    },
    /** @lends pc.HexTileLayer.prototype */
    {
        /**
         * Constructor for the tile layer
         * @param {String} name Name of the layer
         * @param {pc.TileMap} [tileMap] Tile map data used for the tile layer
         * @param {pc.TileSet} [tileSet] If no tile map is supplied, you can optional provide a tile set and a
         * tile map will be constructed using this tile set
         */
        init:function (name, tileMap, tileSet)
        {
            this._super(name);
            this.tileMap = pc.checked(tileMap, new pc.TileMap(tileSet));
            this.usePrerendering = false;
        },

        /**
         * Draws the hex tiles
         */
        drawTiled:function ()
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
                var ypos = hy * this.tileMap.tileHeight;

                for (var hx = tx, d = tw + tx; hx < d; hx++)
                {
                    var xpos = hx * this.tileMap.tileWidth;

                    // offset every second row
                    if (hy % 2)
                        xpos += this.tileMap.tileWidth / 2;

                    var tileType = this.tileMap.tiles[hy][hx];

                    if (tileType >= 0)  // -1 means no tile
                    {
                        this.tileMap.tileSet.drawTile(
                            pc.device.ctx, tileType,
                            this.screenX(xpos), this.screenY(ypos));
                    }
                }
            }
        }


    });

