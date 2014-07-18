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
    /** X scale to draw the image at */
    scaleX: 1,
    /** Y scale to draw the image at */
    scaleY: 1,
    /** source x position where frames start in the image */
    sourceX: 0,
    /** source y position where frames start in the image */
    sourceY: 0,
    /** alpha level to draw the image at */
    alpha: 1,
    /** whether rotation should be used, or ignored when rendering frames */
    useRotation: false,
    /** composite drawing operation */
    compositeOperation: null,
    /** total number of frames (read-only) */
    totalFrames: 0,
    /** Hashtable of animations keyed by animation name */
    animations: null,

    frameOffsetX: 0,
    frameOffsetY: 0,

    /**
     * Array of frame information; each element is an array with
     * the positional values:
     *
     * [0] - x position
     * [1] - y position
     * [2] - width
     * [3] - height
     * [4] - image to draw from
     * [5] - registration x
     * [6] - regsitration y
     */
    frames: null,

    /**
     * Constructs a new sprite sheet with options. You can use either framesWide or frameWidth, and the logical
     * default will be assumed. Frame width is assumed to be image.width / framesWide or frames wide will default to
     * image.width/frameWidth.
     * @param {pc.Image} options.image Image to use for the sheet
     * @param {Number} options.framesWide Number of frames wide the sprite sheet is
     * @param {Number} options.framesHigh Number of frames high the sprite sheet is
     * @param {Number} options.frameHeight Height of each frame in pixels
     * @param {Number} options.frameWidth Width of each frame in pixels
     * @param {Number} options.scaleX X Scale to draw the image at
     * @param {Number} options.scaleY Y Scale to draw the image at
     * @param {Number} options.sourceX Source x position in the image
     * @param {Number} options.sourceY Source y position in the image
     * @param {Number} options.frameOffsetX Offset frame drawing on the x-axis
     * @param {Number} options.frameOffsetY Offset frame drawing on the y-axis
     * @param {Number} options.alpha Alpha level to draw the image at (0.5 is 50% visible)
     * @param {Boolean} options.useRotation True means the canvas rotation will be used to draw images as an angle
     * @param {Array} options.frames Specific definitions for each frame; defaults to a grid calculated from above options
     * @param {Array} options.frames[n] Array with positional frame information
     * @param {Array} options.frames[n][0] Left edge of the frame
     * @param {Array} options.frames[n][1] Top edge of the frame
     * @param {Array} options.frames[n][2] Width of the frame
     * @param {Array} options.frames[n][3] Height of the frame
     * @param {Array} options.frames[n][4] Source image for the frame
     * @param {Array} options.frames[n][5] Registration X for the frame
     * @param {Array} options.frames[n][6] Registration Y for the frame
     */
    init: function (options)
    {
      this._super();

      var image = options.image;
      var frameWidth = this.frameWidth =
          ('frameWidth' in options) ? options.frameWidth :
          ('framesWide' in options && options.framesWide > 0 && 'image' in options) ?
              Math.floor(options.image.width / options.framesWide) :
          ('image' in options) ? options.image.width :
          0; // No fixed width

      var frameHeight = this.frameHeight =
          ('frameHeight' in options) ? options.frameHeight :
          ('framesHigh' in options && options.framesHigh > 0 && 'image' in options) ?
              Math.floor(options.image.height / options.framesHigh) :
          ('image' in options) ? options.image.height :
          0; // No fixed height

      var framesWide = this.framesWide =
        ('framesWide' in options) ? options.framesWide :
        ('image' in options && frameWidth > 0) ?
            Math.floor(options.image.width / frameWidth) :
        ('frames' in options) ? options.frames.length :
        1;
      var framesHigh = this.framesHigh =
        ('framesHigh' in options) ? options.framesHigh :
        ('image' in options && 'frameHeight' in options) ?
            Math.floor(options.image.height / frameHeight) :
        1;

      this.scaleX = pc.checked(options.scaleX, 1);
      this.scaleY = pc.checked(options.scaleY, 1);
      this.sourceX = pc.checked(options.sourceX, 0);
      this.sourceY = pc.checked(options.sourceY, 0);
      this.frameOffsetX = pc.checked(options.frameOffsetX, 0);
      this.frameOffsetY = pc.checked(options.frameOffsetY, 0);
      this.alpha = pc.checked(options.alpha, 1);
      this.useRotation = pc.checked(options.useRotation, true);

      this.options = options; //DELME

      this.animations = new pc.Hashtable();
      if('frames' in options)
      {
        this.frames = options.frames;
        this.totalFrames = options.frames.length;
      }
      else if(pc.valid(image))
      {
        // In this case, used a fixed size grid over the image provided
        if (!image.width || !image.height)
          throw "Invalid image (zero width or height)";

        this.image = image;
        this.totalFrames = framesWide * framesHigh;
        this.frames = [];
        var frameIndex = 0;
        for (var fy = 0; fy < framesHigh; fy++)
        {
          for (var fx = 0; fx < framesWide; fx++)
          {
            // x, y, width, height, image, regX, regY
            this.frames.push([
              fx * frameWidth,
              fy * frameHeight,
              frameWidth,
              frameHeight,
              image, 0, 0
            ]);
          }
        }
      }
      else
      {
        if(frameWidth || frameHeight)
        {
          // Probably a mistake
          throw new Error('No image provided for sprite sheet grid');
        }
        // Add frames later
        this.frames = [];
        this.totalFrames = 0;
      }

      if('animations' in options)
      {
        if('forEach' in options.animations)
        {
          options.animations.forEach(this.addAnimation, this);
        }
        else
        {
          for(var animName in options.animations)
          {
            if(options.animations.hasOwnProperty(animName))
            {
              var anim = options.animations[animName];
              if(!('name' in anim))
                anim.name = animName;
              this.addAnimation(anim);
            }
          }
        }
      }
    },

    /**
     * Defines an animation
     * @param {String} options.name A descriptive name for the animation (required)
     * @param {Number} [options.frameX] The starting frame X position (in frames, not pixels) defaults to 0
     * @param {Number} [options.frameY] The starting frame Y position (in frames, not pixels) defaults to 0
     * @param {Number} [options.frames] A 2d-array of frame numbers ([ [0, 0], [0, 1] ]) , note these are OFFSET by frameX and frameY. Use null
     * to automatically sequence through all frames across the image, or specify frame count
     * @param {Number} [options.frameCount] number of frames to use, starting from frameX, frameY and stepping forward across the spritesheet
     * @param {Number} [options.frameRate] Frames per second; by default, calculated from "time"
     * @param {Number} [options.time=1000] Milliseconds to loop through entire sequence; ignored if frameRate specified.
     * @param {Number} [options.loops=0] Number of times to cycle through this animation, use 0 to loop infinitely
     * @param {Boolean} [options.holdOnEnd] Whether to hold the last frame when the animation has played through
     * @param {Number} [options.scaleX] X scaling to apply (negative values reverse the image)
     * @param {Number} [options.scaleY] Y scaling to apply (negative values reverse the image)
     * @param {Number} [options.framesWide] Number of frames to go across before stepping down
     * @param {Number} [options.framesHigh] Number of frames down
     * @param {String} [options.allowDroppedFrames] True means frames may be skipped if needed in attempt to "tween" over the time
     */
    addAnimation: function (options)
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
      options.frameCount = pc.checked(options.frameCount, 0);
      options.allowDroppedFrames = pc.checked(options.allowDroppedFrames, false);

      // no frames specified, create the frames array automagically
      if (!pc.valid(options.frames))
      {
        var frames = options.frames = [];

        // If they don't provide a frameCount, calculate
        // it from framesWide/framesHigh.
        // TODO This is a pretty confusing and probably incorrect feature ...
        if (options.frameCount == 0)
          options.frameCount = options.framesWide * options.framesHigh;

        var startFrame = options.frameX + (options.frameY * this.framesWide);
        var endFrame = startFrame + options.frameCount;

        // start at frameX, frameY and move across and down.  When
        // moving to the next row, fall back to the start of the row.
        for(var n = startFrame; n < endFrame; n++)
        {
          x = n % this.framesWide
          y = Math.floor(n / this.framesWide)
          frames.push([x, y]);
        }
      }

      options.frameCount = options.frames.length;


      if('frameRate' in options)
      {
        options.frameTime = 1000 / options.frameRate;
        options.time = options.frameTime * options.frames.length;
      }
      else
      {
        options.frameRate = options.frames.length / options.time;
        options.frameTime = options.time / options.frames.length;
      }

      this.animations.put(options.name, options);
    },

    /**
     * Change this sprites animation. Animation frames always start from 0 again.
     * @param name Key name of the animation to switch to.
     */
    setAnimation: function (state, name, speedOffset)
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
    hasAnimation: function (name)
    {
      return (this.animations.get(name) != null);
    },

    /**
     * Sets the scale to draw the image at
     * @param {Number} scaleX Value to multiply the image width by (e.g. width * scaleX)
     * @param {Number} scaleY Value to multiply the image height by (e.g. height * scaleX)
     */
    setScale: function (scaleX, scaleY)
    {
      this.scaleX = scaleX;
      this.scaleY = scaleY;
    },

    /**
     * Sets the componsite drawing operation for this sprite sheet. Set to null to clear it back to the default.
     * @param {String} o Composite drawing operation
     */
    setCompositeOperation: function (o)
    {
      this.compositeOperation = o;
    },

    dirTmp: 0,

    /**
     * Draw a sprite using a frame from the sprite sheet
     * @param {pc.Sprite} state Sprite to draw
     * @param {Number} x On-screen x position
     * @param {Number} y On-screen y position
     * @param {Number} dir The facing direction (in degrees)
     */
    draw: function (ctx, state, x, y, dir)
    {
      var frame;
      var offsetX;
      var offsetY;
      var scaleX = this.scaleX;
      var scaleY = this.scaleY;
      if(state.currentAnim == null)
      {
        frame = this.frames[state.currentFrame];
        offsetX = offsetY = 0;
      }
      else
      {
        var fx = state.currentAnim.frames[state.currentFrame][0];
        var fy = state.currentAnim.frames[state.currentFrame][1];
        offsetX = state.currentAnim.offsetX;
        offsetY = state.currentAnim.offsetY;
        scaleX *= state.currentAnim.scaleX;
        scaleY *= state.currentAnim.scaleY;
        frame = this.frames[fx + fy*this.framesWide];
      }
      if(!pc.valid(frame))
        throw new Error('Frame out of bounds: '+state.currentFrame);

      var frameSourceX = frame[0];
      var frameSourceY = frame[1];
      var frameWidth = frame[2];
      var frameHeight = frame[3];
      var frameImage = frame[4];
      var frameRegX = frame[5];
      var frameRegY = frame[6];

      if (!frameImage.loaded || state == null || !state.active) return;

      if (scaleX != 1 || scaleY != 1)
        frameImage.setScale(scaleX, scaleY);

      if (state.alpha != 1)
        frameImage.alpha = state.alpha;

      if (this.compositeOperation != null)
        frameImage.setCompositeOperation(this.compositeOperation);

      frameImage.draw(ctx,
        this.sourceX + frameSourceX,
        this.sourceY + frameSourceY,
        Math.round(x + offsetX + this.frameOffsetX - frameRegX),
        Math.round(y + offsetY + this.frameOffsetY - frameRegY),
        frameWidth, frameHeight,
        this.useRotation ? dir : 0);

      // restore scaling (as images can be used amongst spritesheets, we need to be nice)
      if (scaleX != 1 || scaleY != 1)
        frameImage.setScale(1, 1);

      // set the alpha back to normal
      if (state.alpha != 1)
        frameImage.alpha = 1;

      if (this.compositeOperation != null)
        frameImage.setCompositeOperation('source-over');

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
    drawFrame: function (ctx, frameX, frameY, x, y, angle)
    {
      var frame = this.frames[frameX + frameY * this.framesWide];
      if(!pc.valid(frame))
        throw new Error('Frame out of bounds: '+x+','+y);

      var frameSourceX = frame[0];
      var frameSourceY = frame[1];
      var frameWidth = frame[2];
      var frameHeight = frame[3];
      var frameImage = frame[4];
      var frameRegX = frame[5];
      var frameRegY = frame[6];

      if (this.alpha != 1)
        ctx.globalAlpha = this.alpha;

      if (this.scaleX != 1 || this.scaleY != 1)
        frameImage.setScale(this.scaleX, this.scaleY);

      if (this.compositeOperation != null)
        frameImage.setCompositeOperation(this.compositeOperation);

      frameImage.draw(ctx,
        this.sourceX + frameSourceX,
        this.sourceY + frameSourceY,
        pc.Math.round(x) + this.frameOffsetX - frameRegX,
        pc.Math.round(y) + this.frameOffsetY - frameRegY,
        frameWidth, frameHeight, angle);

      if (this.scaleX != 1 || this.scaleY != 1)
        frameImage.setScale(1, 1);
      if (this.alpha != 1) ctx.globalAlpha = 1;
      if (this.compositeOperation != null)
        frameImage.setCompositeOperation('source-over');

      return frame;
    },

    /**
     * Draw all the frames of a sprite sheet according to the image and parameters you set it
     * up with. Primarily this is intended for debugging or sprite testing.
     * @param {Context} ctx Context to draw on
     * @param {Number} x Starting x position to draw on the given context
     * @param {Number} y Starting y position to draw on the given context
     */
    drawAllFrames: function (ctx, x, y)
    {
      for (var fy = 0; fy < this.framesHigh; fy++)
        for (var fx = 0; fx < this.framesWide; fx++)
          this.drawFrame(ctx, fx, fy, x + (fx * this.frameWidth), y + (fy * this.frameHeight));
    },

    getFrameInfo: function(x, y)
    {
      return this.frames[pc.checked(x, 0) + (pc.checked(y, 0) * this.framesWide)];
    },

    /**
     * Get the width of a given frame on the source image
     *
     * @param {Number} [x=0] Spritesheet grid x
     * @param {Number} [y=0] Spritesheet grid y
     */
    getFrameWidth: function(x, y)
    {
      return this.getFrameInfo(x, y)[2];
    },

    /**
     * Get the height of a given frame on the source image
     *
     * @param {Number} [x=0] Spritesheet grid x
     * @param {Number} [y=0] Spritesheet grid y
     */
    getFrameHeight: function(x, y)
    {
      return this.getFrameInfo(x, y)[2];
    },

    /**
     * Get a sprite off the sheet as a Subimage that
     * can be used indepently to draw or create another
     * spritesheet.
     *
     * @param {Number} [x=0] Spritesheet grid x
     * @param {Number} [y=0] Spritesheet grid y
     */
    getFrameAsImage: function(x, y)
    {
      var frame = this.getFrameInfo(x,y);
      return new pc.Subimage(frame[4], {
        x:frame[0],
        y:frame[1],
        w:frame[2],
        h:frame[3]
      });
    },

    /**
     * Update the sprite based on the current animation, frame and timing. Typically called automatically
     * from the sprite class
     * @param {pc.Sprite} state Sprite to update
     * @param {Number} delta Amount of time to move forward by
     */
    update: function (state, delta)
    {
      if (state.currentAnim == null || !state.active || state.held) return;

      if (state.currentAnim.frames.length <= 1) return;

      if (state.currentAnim.allowDroppedFrames)
      {
        this._updateWithTimePriority(state, delta);

      } else
      {
        this._updateWithFramePriority(state, delta);
      }
    },

    /**
    * Play each frame.
    * @param {pc.Sprite} state Sprite to update
    * @param {Number} delta Amount of time to move forward by
    */
    _updateWithFramePriority: function (state, delta)
    {
      // see if enough time has past to increment the frame count
      if (state._acDelta > (state.currentAnim.frameTime + state.animSpeedOffset))
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
        state._acDelta -= state.currentAnim.frameTime;
      } else
      {
        state._acDelta += delta;
      }
    },

    /**
    * Drop frames if needed, in attempt to play the animation uniformly over the allotted time
    * @param {pc.Sprite} state Sprite to update
    * @param {Number} delta Amount of time to move forward by
    */
    _updateWithTimePriority: function (state, delta)
    {
      var elapsedCount;

      // see if enough time has past to increment the frame count
      if (state._acDelta > (state.currentAnim.frameTime + state.animSpeedOffset))
      {
        elapsedCount = Math.floor(state._acDelta / (state.currentAnim.frameTime + state.animSpeedOffset));
        state.currentFrame += elapsedCount;
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
                state.currentFrame = state.currentAnim.frames.length - 1;
              }
              else
                state.active = false;
            }

          if (!state.held) state.currentFrame = 0; // take it from the top
        }
        state._acDelta -= elapsedCount * state.currentAnim.frameTime;
      }
      state._acDelta += delta;
    },

    /**
     * Clear the sprite by nulling the image and animations
     */
    reset: function ()
    {
      this.image = null;
      this.animations = null;
      this.frames = null;
    }

  });
