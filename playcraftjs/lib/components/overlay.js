/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Overlay
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Used to lay another sprite over an entity, with options to automagically expire after a certain time limit.
 * Good for things like smoke, explosive damage or muzzle flashs, and where you don't need to create a complete
 * entity.
 */
pc.components.Overlay = pc.components.Component.extend('pc.components.Overlay',
    /** @lends pc.components.Overlay */
    {
        /**
         * Constructs (or acquires an object from the pool) with the given options.
         * @param {Number} options.lifetime Lifetime of the overlay (will automatically remove itself)
         * @param {pc.SpriteSheet} options.spriteSheet Sprite sheet to use for the animation
         * @param {String} options.animationStart Which animation to play in the sprite
         * @param {Number} options.animationStartDelay Amount of time in ms to increase or decrease the animation speed
         * @return {pc.components.Overlay} An overlay component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Overlay.prototype */
    {
        /** lifetime the overlay will display for */
        lifetime: 0,
        /** sprite object this overlay displays */
        sprite: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.sprite = pc.Sprite.create();
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);

            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);
        },

        /**
         * Descreases the amount of time the sprite should stay alive for
         * @param {Number} time Time to reduce by in ms
         */
        decrease: function(time)    { this.lifetime -= time;  },

        /**
         * Tests if the sprite has expired already
         * @return {Boolean} True if it has expired
         */
        hasExpired: function()      { return this.lifetime <= 0; }

    });

