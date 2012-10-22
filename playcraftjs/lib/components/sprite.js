/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Sprite
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a sprite to an entity. See the core <a href='pc.Sprite'>sprite</a> class for information on sprites.
 */
pc.components.Sprite = pc.components.Component.extend('pc.components.Sprite',
    /** @lends pc.components.Sprite */
    {
        /**
         * Constructs (or acquires from the pool) a sprite component.
         * @param {pc.Sprite} options.sprite Sprite object to use
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the sprite.
         * @return {pc.components.Sprite} A newly configured sprite component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Sprite.prototype */
    {
        /** sprite object */
        sprite:null,
        /** Offset position of the text relative to the entity spatial */
        offset:null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.sprite = pc.Sprite.create();
            this.offset = pc.Point.create(0,0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x, 0);
                this.offset.y = pc.checked(options.offset.y, 0);
            } else
            {
                this.offset.x = 0;
                this.offset.y = 0;
            }

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);

            this.sprite.currentFrame = pc.checked(options.currentFrame, 0);
        }



    });

