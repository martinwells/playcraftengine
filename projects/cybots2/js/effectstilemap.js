/**
 * CustomTileMap
 *
 * A specialized tile map that adds a second array of custom drawing options
 *
 */

EffectsTileMap = pc.TileMap.extend('EffectsTileMap',
    {
        // bit masks for special draw effects
        NONE:0x0000,
        FOG_DARK:0x0001,
        FOG_LIGHT:0x0002,
        HIGHLIGHT: 0x0004
    },
    {
        effectTiles:null,
        hexGreyImage:null,

        init:function (tileSet, tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
        {
            // construct the underlying tilemap as normal
            this._super(tileSet, tilesWide, tilesHigh, tileWidth, tileHeight, tiles);

            // create the effects tileset - we use this in drawTile below
            this.hexGreyImage = pc.device.loader.get('hex-grey').resource;

            // but also create a special tiles array we'll use to check against when drawing
            this.effectTiles = new Array(this.tilesHigh);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.effectTiles[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.effectTiles[aty][atx] = this.Class.NONE;
            }
        },

        setEffect:function(tileX, tileY, effect)
        {
            this.effectTiles[tileY][tileX] = effect;
        },

        /**
         * Custom draw override that checks if special highlights or other things should be done
         * @param tileX
         * @param tileY
         * @param x
         * @param y
         */
        drawTile:function (tileX, tileY, x, y)
        {
            // draw the underlying tile
            this._super(tileX, tileY, x, y);

            // now add the effects over the top
            var effect = this.effectTiles[tileY][tileX];

//            if ((effect & this.Class.HIGHLIGHT) != 0)
//                this.effectsTileSet.drawTile(pc.device.ctx, 0, x, y);
            if ((effect & this.Class.FOG_LIGHT) != 0)
            {
//                this.hexGreyImage.setAlpha(0.1);
                this.hexGreyImage.draw(pc.device.ctx, x, y);
            }
            if ((effect & this.Class.FOG_DARK) != 0)
            {
//                this.hexGreyImage.setAlpha(0.2);
                this.hexGreyImage.draw(pc.device.ctx, x, y);
            }
        }

    });

