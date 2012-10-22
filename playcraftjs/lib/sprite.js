/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sprite
 * @description
 * [Extends <a href='pc.Sprite'>pc.Pooled</a>]
 * <p>
 * Sprites are instances of a sprite sheet used for rendering.
 * <p>
 * To create a sprite, pass a sprite sheet into the constructor:
 * <pre><code>
 * var zombieSprite = new pc.Sprite( zombieSpriteSheet );
 * </code></pre>
 * You can then use setAnimation to select an animation from the sheet:
 * <pre><code>
 * zombieSprite.setAnimation('attacking right');
 * </code></pre>
 * To draw the sprite, use the draw method:
 * <pre><code>
 * zombieSprite.draw(pc.device.ctx, 100, 100);
 * </code></pre>
 * To cycle animations, call update:
 * <pre><code>
 * zombieSprite.update(pc.device.elapsed);
 * </code></pre>
 * <p>
 * Check the <a href='http://playcraftlabs.com/develop/guide/spritesandanimation'>sprites and animation guide</a> for
 * more information and features.
 */

pc.Sprite = pc.Pooled.extend('pc.Sprite',
    {
        /**
         * Construct a new sprite object by acquiring it from the free pool and configuring it
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to use
         * @return {pc.Sprite} A sprite object
         */
        create:function (spriteSheet)
        {
            var n = this._super();
            n.config(spriteSheet);
            return n;
        }
    },
    {
        /** Current animation frame */
        currentFrame:0,
        /** Current animation object reference */
        currentAnim:null,
        /** pc.SpriteSheet used by this sprite */
        spriteSheet:null,
        /** speed different this instance uses, versus the animation speed */
        animSpeedOffset:0,
        /** Name of the current animation */
        currentAnimName:null,
        /** Alpha level */
        alpha:1,
        /** X-scale for drawing */
        scaleX: 1,
        /** Y-scale for drawing */
        scaleY: 1,
        /** Whether the sprite is active; false = not drawn or updated */
        active:true,
        /** Whether the sprite is held. Won't progress on animation, but will still draw */
        hold: false,
        /** Number of times the animation has played */
        loopCount:0,
        /** Current composite drawing operation to use */
        compositeOperation: null,

        _acDelta: 0,

        /**
         * Constructs a new sprite using the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to use
         */
        init:function(spriteSheet)
        {
            this._super();
            this.config(spriteSheet);
        },

        /**
         * Configure the sprite object with a given sprite sheet - typically called by init or create
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to configure with
         */
        config: function(spriteSheet)
        {
            this.spriteSheet = pc.checked(spriteSheet, null);
            if (this.spriteSheet)
                this.reset();
        },

        /**
         * Clear the sprite back to a starting state (using first animation)
         */
        reset:function ()
        {
            this.currentFrame = 0;
            this.alpha = 1;
            this.loopCount = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.active = true;
            this.hold = false;
            if (this.spriteSheet.animations.size() > 0)
            {
                this.currentAnim = this.spriteSheet.animations.get(this.spriteSheet.animations.keys()[0]);
                this.currentFrame = 0;

            } else
                this.currentAnim = null;
        },

        /**
         * Change the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to change to
         */
        setSpriteSheet: function(spriteSheet)
        {
            this.spriteSheet = spriteSheet;
            this.reset();
        },

        /**
         * Change the drawing scale of this sprite instance
         * @param {Number} scaleX x-scale to use
         * @param {Number} scaleY y-scale to use
         */
        setScale: function(scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the composite drawing operation for this sprite. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation to use
         */
        setCompositeOperation: function(o)
        {
            this.compositeOperation = o;
        },

        /**
         * Draw the sprite using the given context at a given location, and a certain direction
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} dir Direction to draw it at
         */
        draw:function (ctx, x, y, dir)
        {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            this.spriteSheet.draw(ctx, this, x, y, dir);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Draws a single frame of the current sprite sheet
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} frameX The frame to draw (x)
         * @param {Number} frameY The frame to draw (y)
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} angle Direction to draw it at
         */
        drawFrame: function(ctx, frameX, frameY, x, y, angle)
        {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            this.spriteSheet.drawFrame(ctx, frameX, frameY, x, y, angle);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Updates the sprite animation based on the time elapsed
         * @param {Number} elapsed Amount of time to move the animation forward by
         */
        update:function (elapsed)
        {
            if (this.currentAnim == null || !this.active || this.hold) return;

            // call the spritesheet class to actually do a sprite update, keep in mind though that the spritesheet
            // doesn't retain any present state, it just sets the state object, which in this case is passed in as the
            // this param -- this is so spritesheets (and the underlying image) may be used by more than one sprite
            // at the same time
            this.spriteSheet.update(this, elapsed);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param {String} name Key name of the animation to switch to.
         * @param {Number} speedOffset allows you to modify the animation speed for this instance of a sprite
         * @param {Number} force Restart the animation, even if this is the currently playing animation (default is true)
         */
        setAnimation:function (name, speedOffset, force)
        {
            var f = pc.checked(force, true);
            if (!f)
                if (this.currentAnim.name === name) return;

            this.currentAnim = this.spriteSheet.animations.get(name);
            this.currentFrame = 0;
            this.loopCount = 0;
            this.active = true;
            this.held = false;
            this.animSpeedOffset = pc.checked(speedOffset, 0);
            this.currentAnimName = name;
        },

        /**
         * Changes the speed of animation by the given offset. Good for randomizing when you have lots of the same
         * sprite on-screen
         * @param {Number} speedOffset Time in ms to offset by (can be negative to slow an animation down)
         */
        setAnimationSpeedOffset: function(speedOffset)
        {
            this.animSpeedOffset = speedOffset;
        },

        /**
         * Changes the current frame
         * @param {Number} frame Frame to change to
         */
        setCurrentFrame: function(frame)
        {
            this.currentFrame = frame;
        },

        /**
         * Returns the name of the current animation
         * @return {String} Current animation name
         */
        getAnimation:function ()
        {
            return this.currentAnimName;
        },

        /**
         * Changes the draw alpha for the sprite
         * @param {Number} a Alpha level to change to (0.5 = 50% transparent)
         */
        setAlpha:function (a)
        {
            this.alpha = a;
        },

        /**
         * Adds to the current alpha level
         * @param {Number} a Amount to add
         */
        addAlpha:function (a)
        {
            this.alpha += a;
            if (this.alpha > 1) this.alpha = 1;
        },

        /**
         * Subtracts from the current alpha level
         * @param {Number} a Amount to subtract
         */
        subAlpha:function (a)
        {
            this.alpha -= a;
            if (this.alpha < 0) this.alpha = 0;
        }


    });

