/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.SpriteSheet
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Spritesheets are a tool used to configure an image into being a sprite. A spritesheet defines the frame size,
 * source placement and the animations that make up a sprite.
 * <p>
 * To create an on-screen sprite you need to setup a sprite sheet template, then construct a pc.Sprite object
 * using the sheet.
 * <p>
 * To create a sprite sheet you must first load an image resource using the resource loader. You can then use that
 * to construct a sprite sheet:
 * <p>
 * <pre><code>
 * // grab the zombie image resource from the loader
 * var zombieImage = pc.device.loader.get('zombie').resource;
 *
 * // create the spritesheet
 * var zombieSpriteSheet = new pc.SpriteSheet(
 *      { image:zombieImage, frameWidth:80, frameHeight:72 });
 * </code></pre>
 * The sprite sheet class is pretty flexible in how you define the frames. You can actually just specify the number of
 * frames wide and high the sheet is and it will figure our the frame size for you.
 * <p>
 * <h5>Adding Animations</h5>
 * To define the walk animation for the zombie, you just use addAnimation:
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'walking right', frameCount:16, time:1400 });
 * </code></pre>
 * Here we've defined an animation with the tag 'walking right', a frame count of 16 and a total animation time of 1400.
 * <p>
 * Notice we didn't say where in the image the frames start, that's because the default starting frame is 0 for both
 * x and y.
 * <p>
 * To specify a starting frame use the frameX and frameY options.
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'attacking right', frameX: 0, frameY: 2, frameCount:16, time:500 });
 * </code></pre>
 * In this case, the attack animation starts at frame 0 on the x-axis, and the 3rd frame down. It is then 16 frames
 * long.
 * <h5>Making Sprites</h5>
 * To make an actual sprite you can draw on the screen, use the <a href='pc.Sprite'>pc.Sprite</a> class.
 */

pc.SpriteSheet = pc.Base.extend('pc.SpriteSheet',
    /** @lends pc.SpriteSheet */
    {},
    /** @lends pc.SpriteSheet.prototype */
    {
        /** The source pc.Image resource */
        image:null,
        /** width of each frame (read-only) */
        frameWidth:0,
        /** height of each frame (read-only) */
        frameHeight:0,
        /** number of frames wide the sheet is (read-only) */
        framesWide:1,
        /** number of frames high the sheet is (read-only) */
        framesHigh:1,
        /** X scale to draw the image at */
        scaleX:1,
        /** Y scale to draw the image at */
        scaleY:1,
        /** source x position where frames start in the image */
        sourceX:0,
        /** source y position where frames start in the image */
        sourceY:0,
        /** alpha level to draw the image at */
        alpha:1,
        /** whether rotation should be used, or ignored when rendering frames */
        useRotation:false,
        /** composite drawing operation */
        compositeOperation:null,
        /** total number of frames (read-only) */
        totalFrames:0,
        /** Hashtable of animations keyed by animation name */
        animations:null,

        _frameXPos:null,
        _frameYPos:null,

        /**
         * Constructs a new sprite sheet with options. You can use either framesWide or frameWidth, and the logical
         * default will be assumed. Frame width is assumed to be image.width / framesWide or frames wide will default to
         * image.width/frameWidth.
         * @param {Number} options.framesWide Number of frames wide the sprite sheet is
         * @param {Number} options.framesHigh Number of frames high the sprite sheet is
         * @param {Number} options.frameHeight Height of each frame in pixels
         * @param {Number} options.frameWidth Width of each frame in pixels
         * @param {Number} options.scaleX X Scale to draw the image at
         * @param {Number} options.scaleY Y Scale to draw the image at
         * @param {Number} options.sourceX Source x position in the image
         * @param {Number} options.sourceY Source y position in the image
         * @param {Number} options.alpha Alpha level to draw the image at (0.5 is 50% visible)
         * @param {Boolean} options.useRotation True means the canvas rotation will be used to draw images as an angle
         */
        init:function (options)
        {
            this._super();

            if (pc.checked(options.image))
                this.image = options.image;
            else
                throw "No image supplied";

            if (!pc.valid(options.frameWidth))
            {
                if (pc.valid(options.framesWide) && options.framesWide > 0)
                    this.frameWidth = this.image.width / options.framesWide;
                else
                    this.frameWidth = this.image.width;
            } else
                this.frameWidth = options.frameWidth;

            if (!pc.valid(options.frameHeight))
            {
                if (pc.valid(options.framesHigh) && options.framesHigh > 0)
                    this.frameHeight = this.image.height / options.framesHigh;
                else
                    this.frameHeight = this.image.height;
            } else
                this.frameHeight = options.frameHeight;

            this.framesWide = pc.checked(options.framesWide, this.image.width / this.frameWidth);
            this.framesHigh = pc.checked(options.framesHigh, this.image.height / this.frameHeight);
            this.scaleX = pc.checked(options.scaleX, 1);
            this.scaleY = pc.checked(options.scaleY, 1);
            this.sourceX = pc.checked(options.sourceX, 0);
            this.sourceY = pc.checked(options.sourceY, 0);
            this.alpha = pc.checked(options.alpha, 1);
            this.useRotation = pc.checked(options.useRotation, true);

            this.totalFrames = this.framesWide * this.framesHigh;
            this.animations = new pc.Hashtable();

            // pre-calcs for speed
            this._frameXPos = [];
            for (var fx = 0; fx < this.framesWide; fx++)
                this._frameXPos.push(fx * this.frameWidth);
            this._frameYPos = [];
            for (var fy = 0; fy < this.framesHigh; fy++)
                this._frameYPos.push(fy * this.frameHeight);
        },

        /**
         * Defines an animation
         * @param {String} options.name A descriptive name for the animation (required)
         * @param {Number} options.frameX The starting frame X position (in frames, not pixels) defaults to 0
         * @param {Number} options.frameY The starting frame Y position (in frames, not pixels) defaults to 0
         * @param {Number} options.frames A 2d-array of frame numbers ([ [0, 0], [0, 1] ]) , note these are OFFSET by frameX and frameY. Use null
         * to automatically sequence through all frames across the image, or specify frame count
         * @param {Number} options.frameCount number of frames to use, starting from frameX, frameY and stepping forward across the spritesheet
         * @param {Number} options.time Seconds to loop through entire sequence defaults to 1000
         * @param {Number} options.loops Number of times to cycle through this animation, use 0 to loop infinitely (defaults to 0)
         * @param {Boolean} options.holdOnEnd Whether to hold the last frame when the animation has played through
         * @param {Number} options.scaleX X scaling to apply (negative values reverse the image)
         * @param {Number} options.scaleY Y scaling to apply (negative values reverse the image)
         * @param {Number} options.framesWide Number of frames to go across before stepping down
         * @param {Number} options.framesHigh Number of frames down
         */
        addAnimation:function (options)
        {
            if (!pc.valid(options.name)) throw "Animation requires a name for reference";

            options.frameX = pc.checked(options.frameX, 0);
            options.frameY = pc.checked(options.frameY, 0);
            options.directions = pc.checked(options.directions, 1);
            options.time = pc.checked(options.time, 1000);
            options.loops = pc.checked(options.loops, 0);
            options.holdOnEnd = pc.checked(options.holdOnEnd, false);
            options.dirAcross = pc.checked(options.dirAcross, false);
            options.scaleX = pc.checked(options.scaleX, 1);
            options.scaleY = pc.checked(options.scaleY, 1);
            options.offsetX = pc.checked(options.offsetX, 0);
            options.offsetY = pc.checked(options.offsetY, 0);
            options.framesWide = pc.checked(options.framesWide, this.framesWide);
            options.framesHigh = pc.checked(options.framesHigh, this.framesHigh);
            options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);

            if (options.frameCount == 0)
            {
                options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);
            }

            // no frames specified, create the frames array automagically
            if (!pc.valid(options.frames))
            {
                var frameStart = options.frameX + (options.frameY * options.framesWide);
                options.frames = [];
                // use the frameCount and frameX, frameY
                for (var frame = frameStart; frame < frameStart + options.frameCount; frame++)
                {
                    options.frames.push([frame % options.framesWide, Math.floor(frame / options.framesWide) ]);
                }
            }

            options.frameRate = (options.time / options.frames.length);
            options.degreesPerDir = (360 / options.directions);

            this.animations.put(options.name, options);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param name Key name of the animation to switch to.
         */
        setAnimation:function (state, name, speedOffset)
        {
            state.currentAnim = this.animations.get(name);
            if (state.currentAnim == null)
                this.warn('attempt to set unknown animation [' + name + ']');
            state.currentFrame = 0;
            state.held = false;
            state.animSpeedOffset = pc.checked(speedOffset, 0);
        },

        /**
         * Checks if this sheet has an animation of a given name
         * @param {String} name Animation name
         * @return {Boolean} true if the animation exists on this sheet
         */
        hasAnimation:function (name)
        {
            return (this.animations.get(name) != null);
        },

        /**
         * Sets the scale to draw the image at
         * @param {Number} scaleX Value to multiply the image width by (e.g. width * scaleX)
         * @param {Number} scaleY Value to multiply the image height by (e.g. height * scaleX)
         */
        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this sprite sheet. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation
         */
        setCompositeOperation:function (o)
        {
            this.compositeOperation = o;
        },

        dirTmp:0,

        /**
         * Draw a sprite using a frame from the sprite sheet
         * @param {pc.Sprite} state Sprite to draw
         * @param {Number} x On-screen x position
         * @param {Number} y On-screen y position
         * @param {Number} dir The facing direction (in degrees)
         */
        draw:function (ctx, state, x, y, dir)
        {
            if (!this.image.loaded || state == null || !state.active) return;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (state.alpha != 1)
                this.image.alpha = state.alpha;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            if (state.currentAnim == null)
            {
                if (this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(this.scaleX, this.scaleY);
                this.image.draw(ctx, this.sourceX, this.sourceY,
                    Math.round(x), Math.round(y), this.frameWidth, this.frameHeight,
                    this.useRotation ? dir : 0);
            } else
            {
                var fx = 0;
                var fy = 0;

                if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);

                if (this.useRotation)
                {
                    // rotation/direction drawing is done using canvas rotation (slower)
                    fx = state.currentAnim.frames[state.currentFrame][0];
                    fy = state.currentAnim.frames[state.currentFrame][1];

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx],
                        this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x),
                        state.currentAnim.offsetY + pc.Math.round(y), this.frameWidth, this.frameHeight, dir);
                }
                else
                {
                    // rely on the sprite images to draw rotation

                    this.dirTmp = Math.round(dir / state.currentAnim.degreesPerDir);

                    if (this.dirTmp > state.currentAnim.directions - 1) this.dirTmp = 0; // accommodate the edge case causing by rounding back

//                if (!state.currentAnim.dirAcross)
//                {
//                    fx = this.dirTmp + state.currentAnim.frameX;
//                    fy = state.currentAnim.frames[state.currentFrame][0] + state.currentAnim.frameY;
//                } else
                    {
                        fx = state.currentAnim.frames[state.currentFrame][1] + this.dirTmp;
                        fy = state.currentAnim.frames[state.currentFrame][0];
                    }

                    if (state.currentAnim.directions == 1)
                    {
                        fy = state.currentAnim.frames[state.currentFrame][1];
                        fx = state.currentAnim.frames[state.currentFrame][0];
                    }

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx], this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x),
                        state.currentAnim.offsetY + pc.Math.round(y),
                        this.frameWidth, this.frameHeight);

                    if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                        this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);
                }

            }

            // restore scaling (as images can be used amongst spritesheets, we need to be nice)
            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);

            // set the alpha back to normal
            if (state.alpha != 1)
                this.image.alpha = 1;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');

        },

        /**
         * Draw a single frame from the sprite sheet
         * @param {Context} ctx Device context to draw on
         * @param {Number} frameX The x-pos of the frame to draw
         * @param {Number} frameY The y-pos of the frame to draw
         * @param {Number} x x-pos to draw on the target context
         * @param {Number} y y-pos to draw on the target context
         * @param {Number} angle Angle to draw the frame at
         */
        drawFrame:function (ctx, frameX, frameY, x, y, angle)
        {
            if (!this.image.loaded) return;
            if (this.alpha < 1) ctx.globalAlpha = this.alpha;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            this.image.draw(ctx,
                this.sourceX + this._frameXPos[frameX],
                this.sourceY + this._frameYPos[frameY], pc.Math.round(x), pc.Math.round(y),
                this.frameWidth, this.frameHeight, angle);

            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);
            if (this.alpha < 1) ctx.globalAlpha = 1;
            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');
        },

        /**
         * Draw all the frames of a sprite sheet according to the image and parameters you set it
         * up with. Primarily this is intended for debugging or sprite testing.
         * @param {Context} ctx Context to draw on
         * @param {Number} x Starting x position to draw on the given context
         * @param {Number} y Starting y position to draw on the given context
         */
        drawAllFrames:function (ctx, x, y)
        {
            for (var fy = 0; fy < this.framesHigh; fy++)
                for (var fx = 0; fx < this.framesWide; fx++)
                    this.drawFrame(ctx, fx, fy, x + (fx * this.frameWidth), y + (fy * this.frameHeight));
        },

        /**
         * Update the sprite based on the current animation, frame and timing. Typically called automatically
         * from the sprite class
         * @param {pc.Sprite} state Sprite to update
         * @param {Number} delta Amount of time to move forward by
         */
        update:function (state, delta)
        {
            if (state.currentAnim == null || !state.active || state.held) return;

            // see if enough time has past to increment the frame count
            if (state.currentAnim.frames.length <= 1) return;

            if (state._acDelta > (state.currentAnim.frameRate + state.animSpeedOffset))
            {
                state.currentFrame++;
                if (state.currentFrame >= state.currentAnim.frames.length)
                {
                    state.loopCount++;
                    // checked if we have looped the animation enough times
                    if (state.currentAnim.loops) // 0 means loop forever
                        if (state.loopCount >= state.currentAnim.loops)
                        {
                            if (state.currentAnim.holdOnEnd)
                            {
                                state.held = true;
                                if (state.currentFrame) state.currentFrame--;
                            }
                            else
                                state.active = false;
                        }

                    if (!state.held) state.currentFrame = 0; // take it from the top
                }
                state._acDelta -= state.currentAnim.frameRate;
            } else
            {
                state._acDelta += delta;
            }
        },

        /**
         * Clear the sprite by nulling the image and animations
         */
        reset:function ()
        {
            this.image = null;
            this.animations = null;
        }

    });
