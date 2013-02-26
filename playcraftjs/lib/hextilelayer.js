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
        init:function (name, tileMap, tileSet)
        {
            // call my parent, but force prerendering off
            this._super(name, false, tileMap, tileSet);
            this._hexSide = this.tileMap.tileHeight / Math.sqrt(3);
            this._halfHexSide = this._hexSide / 2;
            this._yInc = this.tileMap.tileHeight - this._halfHexSide;
        },

        _tileXY: null, // cached, so we're not constructing/or pooling
        getTileXYAtScreenPoint:function(pos)
        {
            if (!this._tileXY)
                this._tileXY = pc.Point.create(0,0);

            // convert the screen position into a world relative position
            var worldPos = this.worldPos(pos);

            // figure out which tile is at that position
            var ty = Math.round(worldPos.y / this._yInc);

            if (!(ty % 2))
            {
                worldPos.x += Math.floor(this.tileMap.tileWidth / 2);
                console.log('offset row');
            }

            this._tileXY.x = Math.floor(worldPos.x / this.tileMap.tileWidth);
            this._tileXY.y = Math.floor(ty);

            console.log("world=" + worldPos + " tileXY=" + this._tileXY);
            return this._tileXY;
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

