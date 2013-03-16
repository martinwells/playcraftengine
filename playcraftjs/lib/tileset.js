/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileSet
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * @description
 * A set of tiles consisting of a spritesheet, types and properties map. You can use a tile set to define the types
 * of tiles you want to appear in a <a href='pc.TileMap'>tile map</a> (and thus a <a href='pc.TileLayer'>tile layer</a>).
 * <p>
 * To construct a tile set, use a spritesheet containing the tile images you want to use:
 * <pre><code>
 * var tileSet = new pc.TileSet(tileSheet);
 * </code></pre>
 * Tiles are references by number, sequentially from the top and then across the spritesheet. Each tile number
 * corresponds to one frame of the spritsheet. There is presently no support for animated tiles.
 * <p>
 * You can also set properties on tiles which can later be used to indicate special areas of a map:
 * <pre><code>
 * tileSet.addProperty(0, 'climbable', 'true');
 * </code></pre>
 * To later check if a tile has a particular property use the hasProperty method:
 * <pre><code>
 * var tileNumber = this.getTile(1, 1);
 * if (tileNumber >= 0)
 *    if (tileSet.hasProperty(tileNumber, 'climable');
 *       // climb
 * </code></pre>
 * For convenience, you should probably just use the tileHasProperty method in the <a href='pc.TileMap'>pc.TileMap</a>
 * class.
 * <pre><code>
 * tileLayer.tileMap.tileHasProperty(1, 1, 'climbable')
 * </code></pre>
 */


pc.TileSet = pc.Base.extend('pc.TileSet',
    {},
    /** @lends pc.TileSet.prototype */
    {
        /** sprite sheet used for tiles */
        tileSpriteSheet:null,
        /** pc.Hashmap of properties */
        props:null,
        /** First tile ID in this set */
        idOffset:0,

        /**
         * Constructs a new tile set using the supplied tile sheet
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to use for tile images
         */
        init:function (spriteSheet, idOffset)
        {
            this.tileSpriteSheet = pc.checked(spriteSheet, null);
            this.idOffset = pc.checked(idOffset, 0);
            if (this.tileSpriteSheet)
            {
                this.props = new Array(spriteSheet.totalFrames);
                for (var i = 0; i < this.props.length; i++)
                {
                    this.props[i] = new pc.Hashmap();
                }
            }
        },

        /**
         * Draw a tile; typically for debugging or other strange purposes. Usually drawing is handled by the tile layer
         * @param {Object} ctx Context to draw the tile upon
         * @param {Number} tileNumber
         * @param {Number} x Frame x position within the sprite sheet
         * @param {Number} y Frame y position within the sprite sheet
         */
        drawTile:function (ctx, tileNumber, x, y)
        {
            this.tileSpriteSheet.drawFrame(
                ctx,
                tileNumber % this.tileSpriteSheet.framesWide,
                pc.Math.floor(tileNumber / this.tileSpriteSheet.framesWide),
                x, y);
        },

        /**
         * Adds a key/value property to a tile type
         * @param {Number} tileNumber Tile number to add the tile to
         * @param {String} key Key string
         * @param {String} value Value to add
         */
        addProperty:function (tileNumber, key, value)
        {
            this.props[tileNumber].put(key, value);
        },

        /**
         * Checks if a particular tile number (tile type) has a given property set
         * @param {Number} tileNumber Tile number to check
         * @param {String} key The key to test for
         * @return {Boolean} true if the property is set
         */
        hasProperty:function (tileNumber, key)
        {
            return this.props[tileNumber].hasKey(key);
        },

        /**
         * Gets all the properties associated with a given tile number
         * @param {Number} tileNumber Tile number to get properties for
         * @return {pc.Hashmap} Hashmap of the properties
         */
        getProperties:function (tileNumber)
        {
            return this.props[tileNumber];
        },

        /**
         * Returns the width of tiles in the tile set. By default this is the tile width from the sprite sheet, but
         * feel free to override if you want to get all funky.
         * @return {Number} width of tiles
         */
        getTileWidth:function()
        {
            return this.tileSpriteSheet.frameWidth;
        },

        /**
         * Returns the height of tiles in the tile set. By default this is the tile height from the sprite sheet, but
         * feel free to override if you want to get all funky.
         * @return {Number} height of tiles
         */
        getTileHeight:function ()
        {
            return this.tileSpriteSheet.frameHeight;
        },

        /**
         * Returns the total number of tiles in the tile set.  By default this is the total number of tiles
         * in the sprite sheet.
         * @return {Number} count of tiles
         */
        getTotalTiles:function ()
        {
          return this.tileSpriteSheet.totalFrames;
        }


    });



