/**
 * PlayCraft Engine
 * Sprite: a sprite is an instance of a graphical/animating object.
 * @class
 */

/**
 * Sprite
 * This class represents and instance of a sprite -- a multiframe image
 * which may also have animation.
 * @class
 */
pc.Sprite = pc.Pooled.extend('pc.Sprite',
    {
        create:function (spriteSheet)
        {
            var n = this._super();
            n.config(spriteSheet);
            return n;
        }
    },
    {
        currentFrame:0,
        currentAnim:null,
        spriteSheet:null,
        acDelta:0, // accumulated delta time
        animSpeedOffset:0,
        currentAnimName:null,
        alpha:1,
        scaleX: 1,
        scaleY: 1,
        active:true,
        loopCount:0,
        compositeOperation: null,

        init:function(spriteSheet)
        {
            this._super();
            this.config(spriteSheet);
        },

        config: function(spriteSheet)
        {
            this.spriteSheet = pc.checked(spriteSheet, null);
            if (this.spriteSheet)
                this.reset();
        },

        reset:function ()
        {
            this.currentFrame = 0;
            this.alpha = 1;
            this.loopCount = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.active = true;
            if (this.spriteSheet.animations.size() > 0)
            {
                this.currentAnim = this.spriteSheet.animations.get(this.spriteSheet.animations.keys()[0]);
                this.currentFrame = 0;

            } else
                this.currentAnim = null;
        },

        setSpriteSheet: function(spriteSheet)
        {
            this.spriteSheet = spriteSheet;
            this.reset();
        },

        setScale: function(scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this sprite. Set to null to clear it back to the default.
         * @param o
         */
        setCompositeOperation: function(o)
        {
            this.compositeOperation = o;
        },

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

        update:function (elapsed)
        {
            if (this.currentAnim == null || !this.active) return;

            // call the spritesheet class to actually to a sprite update, keep in mind though that the spritesheet
            // doesn't retain any present state, it just sets the state object, which in this case is passed in as the
            // this param -- this is so spritesheets (and the underlying image) may be used by more than one sprite
            // at the same time
            this.spriteSheet.update(this, elapsed);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param name Key name of the animation to switch to.
         * @param speedOffset allows you to modify the animation speed for this instance of a sprite
         *                    good for randomizing animations on sprite so they all don't look the same
         * @param force Restart the animation, even if this is the currently playing animation (default is true)
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

        setAnimationSpeedOffset: function(speedOffset)
        {
            this.animSpeedOffset = speedOffset;
        },

        setCurrentFrame: function(frame)
        {
            this.currentFrame = frame;
        },

        getAnimation:function ()
        {
            return this.currentAnimName;
        },

        setAlpha:function (a)
        {
            this.alpha = a;
        },

        addAlpha:function (a)
        {
            this.alpha += a;
            if (this.alpha > 1) this.alpha = 1;
        },

        subAlpha:function (a)
        {
            this.alpha -= a;
            if (this.alpha < 0) this.alpha = 0;
        }


    });

