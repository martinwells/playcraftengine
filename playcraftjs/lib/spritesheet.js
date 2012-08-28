/**
 * SpriteSheet -- an animated, directional image.
 */

pc.SpriteSheet = pc.Base.extend('pc.SpriteSheet', {},
{
    image: null,    // the source image for all sprite frames
    frameWidth: 0,
    frameHeight: 0,
    framesWide: 1,
    framesHigh: 1,
    scaleX: 1,
    scaleY: 1,
    sourceX: 0,
    sourceY: 0,
    alpha: 1,
    useRotation: false,
    compositeOperation: null,

    // animations
    totalFrames: 0,
    animations: null,

    // precalcs (arrays of frame positions)
    frameXPos: null,
    frameYPos: null,

    init: function(options)
    {
        this._super();

        if (pc.checked(options.image))
            this.image = options.image;
        else
            throw "No image supplied";

        if (!pc.valid(options.frameWidth))
        {
            if (pc.valid(options.framesWide) && options.framesWide > 0)
                this.frameWidth = this.image.width/options.framesWide;
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

        this.framesWide = pc.checked(options.framesWide, this.image.width/this.frameWidth);
        this.framesHigh = pc.checked(options.framesHigh, this.image.height/this.frameHeight);
        this.scaleX = pc.checked(options.scaleX, 1);
        this.scaleY = pc.checked(options.scaleY, 1);
        this.sourceX = pc.checked(options.sourceX, 0);
        this.sourceY = pc.checked(options.sourceY, 0);
        this.alpha = pc.checked(options.alpha, 1);
        this.useRotation = pc.checked(options.useRotation, true);

        this.totalFrames = this.framesWide * this.framesHigh;
        this.animations = new pc.Hashtable();

        // precalcs
        this.frameXPos = [];
        for (var fx=0; fx < this.framesWide; fx++)
            this.frameXPos.push(fx * this.frameWidth);
        this.frameYPos = [];
        for (var fy=0; fy < this.framesHigh; fy++)
            this.frameYPos.push(fy * this.frameHeight);
    },

    /**
     * Adds an animation that has multiple directions
     * @param options An object containing the following options:
     * name A descriptive name for the animation (required)
     * frameX - The starting frame X position (in frames, not pixels) defaults to 0
     * frameY - The starting frame Y position (in frames, not pixels) defaults to 0
     * frames - A 2d-array of frame numbers ([ [0, 0], [0, 1] ]) , note these are OFFSET by frameX and frameY. Use null
     * to automatically sequence through all frames across the image, or specify frame count
     * frameCount - number of frames to use, starting from frameX, frameY and stepping forward across the spritesheet
     * directions - the number of directions this animation has (assumes a row is used for each direction)
     * time - Seconds to loop through entire sequence defaults to 1000
     * loops - Number of times to cycle through this animation, use 0 to loop infinitely (defaults to 0)
     */
    addAnimation: function(options)
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
        options.frameCount = pc.checked(options.frameCount, this.framesWide*this.framesHigh);

        if (options.frameCount == 0)
        {
            options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);
        }

        // no frames specified, create the frames array automagically
        if (!pc.valid(options.frames))
        {
            var frameStart = options.frameX + (options.frameY*options.framesWide);
            options.frames = [];
            // use the frameCount and frameX, frameY
            for (var frame=frameStart; frame < frameStart+options.frameCount; frame++)
            {
                options.frames.push( [frame % options.framesWide, Math.floor(frame / options.framesWide) ] );
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
    setAnimation: function(state, name, speedOffset)
    {
        state.currentAnim = this.animations.get(name);
        if (state.currentAnim == null)
            this.warn('attempt to set unknown animation [' + name + ']');
        state.currentFrame = 0;
        state.held = false;
        state.animSpeedOffset = pc.checked(speedOffset,0);
    },

    hasAnimation: function(name)
    {
        return (this.animations.get(name) != null);
    },

    /**
     * Sets the scale to draw the image at
     * @param scaleX {number} Value to multiply the image width by (e.g. width * scaleX)
     * @param scaleY {number} Value to multiply the image height by (e.g. height * scaleX)
     */
    setScale: function(scaleX, scaleY)
    {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    },

    /**
     * Sets the componsite drawing operation for this sprite sheet. Set to null to clear it back to the default.
     * @param o
     */
    setCompositeOperation: function(o)
    {
        this.compositeOperation = o;
    },

    /**
     * Draw this sprite
     * @param x On-screen x position
     * @param y On-screen y position
     * @param dir The facing direction (in degrees)
     */
    dirTmp: 0,

    draw: function(ctx, state, x, y, dir)
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
                    this.sourceX + this.frameXPos[fx],
                    this.sourceY + this.frameYPos[fy],
                    state.currentAnim.offsetX +pc.Math.round(x),
                    state.currentAnim.offsetY +pc.Math.round(y), this.frameWidth, this.frameHeight, dir);
            }
            else
            {
                // rely on the sprite images to draw rotation

                this.dirTmp = Math.round( dir / state.currentAnim.degreesPerDir);

                if (this.dirTmp > state.currentAnim.directions-1) this.dirTmp = 0; // accommodate the edge case causing by rounding back

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
                    this.sourceX + this.frameXPos[fx], this.sourceY + this.frameYPos[fy],
                    state.currentAnim.offsetX +pc.Math.round(x),
                    state.currentAnim.offsetY +pc.Math.round(y),
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

    drawFrame: function(ctx, frameX, frameY, x, y, angle)
    {
        if (!this.image.loaded) return;
        if (this.alpha < 1) ctx.globalAlpha = this.alpha;

        if (this.scaleX != 1 || this.scaleY != 1)
            this.image.setScale(this.scaleX, this.scaleY);

        if (this.compositeOperation != null)
            this.image.setCompositeOperation(this.compositeOperation);

        this.image.draw(ctx,
            this.sourceX + this.frameXPos[frameX],
            this.sourceY + this.frameYPos[frameY], pc.Math.round(x), pc.Math.round(y),
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
     * @param ctx Context to draw on
     * @param x Starting x position to draw on the given context
     * @param y Starting y position to draw on the given context
     */
    drawAllFrames: function(ctx, x, y)
    {
        for (var fy=0; fy < this.framesHigh; fy++)
            for (var fx=0; fx < this.framesWide; fx++)
                this.drawFrame(ctx, fx, fy, x+(fx*this.frameWidth), y+(fy*this.frameHeight));
    },

    update: function(state, delta)
    {
        if (state.currentAnim == null || !state.active || state.held) return;

        // see if enough time has past to increment the frame count
        if (state.currentAnim.frames.length <= 1) return;

        if (state.acDelta > (state.currentAnim.frameRate + state.animSpeedOffset))
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
            state.acDelta -= state.currentAnim.frameRate;
        } else
        {
            state.acDelta += delta;
        }
    },

    reset: function()
    {
        this.image = null;
        this.animations = null;
    }



});
