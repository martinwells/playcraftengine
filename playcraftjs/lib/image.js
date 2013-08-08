/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */


pc.BaseImage = pc.Base.extend('pc.BaseImage',
    {},
    {
      /** Width of the image; set upon loading, can be overridden after load */
      width:0,
      /** Height of the image; set upon loading, can be overridden after load */
      height:0,
      /** Source image element */
      image:null,
      /** x-scale to draw the image at */
      scaleX:1,
      /** y-scale to draw the image at */
      scaleY:1,
      /** alpha level to draw the image at (0.5=50% transparent) */
      alpha:1,
      /** Composite operation to draw the image with, e.g. 'lighter' */
      compositeOperation:null,


      /**
       * Change the alpha level to draw the image at (0.5 = 50% transparent)
       * @param {Number} a Alpha level
       */
      setAlpha:function (a)
      {
        this.alpha = a;
      },

      /**
       * Change the x and/or y scale to draw the image at. If you want to scale an image to a particular size,
       * just generate the scale by dividing one size by another, e.g. current image size 500, 500 and you want to
       * scale to 750, 750, then do setScale( 750/500, 750/500 ).
       * @param {Number} scaleX x-scale to draw at (2 = 200% wide, -1 = reversed normal on x)
       * @param {Number} scaleY y-scale to draw at (2 = 200% high, -1 = reversed normal on y)
       */
      setScale:function (scaleX, scaleY)
      {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
      },

      /**
       * Sets the componsite drawing operation for this image.
       * @param {String} o Operation to use (e.g. 'lighter')
       */
      setCompositeOperation:function (o)
      {
        this.compositeOperation = o;
      },

      /**
       * Draw the image onto a context
       * @param {Context} ctx Context to draw the sprite image on
       * @param {Number} sx Source position in the image (or detination x if only 3 params)
       * @param {Number} sy Source position in the image (or destination y if only 3 params)
       * @param {Number} x x-position destination x position to draw the image at
       * @param {Number} y y-position destination y position to draw the image at
       * @param {Number} width Width to draw (will clip the image edge)
       * @param {Number} height Height to draw (will clip the image edge)
       * @param {Number} rotationAngle Angle to draw the image at
       */
      draw:function (ctx, sx, sy, x, y, width, height, rotationAngle)
      {
        // scale testing
        if (this.compositeOperation != null)
          ctx.globalCompositeOperation = this.compositeOperation;

        // simple version of draw, no source x, y, just draw the image at x, y
        if (arguments.length == 3)
        {
          ctx.save();
          if (this.alpha != 1)
            ctx.globalAlpha = this.alpha;
          ctx.translate(sx + (this.width / 2), sy + (this.height / 2));
          ctx.scale(this.scaleX, this.scaleY);
          ctx.drawImage(this.image, 0, 0, this.width, this.height, (-this.width / 2),
              (-this.height / 2), this.width, this.height);
          ctx.restore();
        }
        else
        {
          if (typeof(rotationAngle) == 'number' && rotationAngle != 0)
          {
            ctx.save();

            if (this.alpha != 1)
              ctx.globalAlpha = this.alpha;

            ctx.translate(
                x + (this.scaleX > 0 ? width/2 : 0),
                y + (this.scaleY > 0 ? height/2 : 0)
            );

            ctx.rotate(rotationAngle * (Math.PI / 180));
            ctx.scale(this.scaleX, this.scaleY);
            ctx.drawImage(this.image, sx, sy, width, height, (-width / 2), (-height / 2), width, height);
            ctx.restore();
          }
          else
          {
            ctx.save();

            if (this.alpha != 1)
              ctx.globalAlpha = this.alpha;

            ctx.translate(
                x + (this.scaleX < 0 ? width : 0),
                y + (this.scaleY < 0 ? height : 0)
            );

            ctx.scale(this.scaleX, this.scaleY);
            ctx.drawImage(this.image, sx, sy, width, height, 0, 0, width, height);
            ctx.restore();
          }
        }

        if (this.compositeOperation != null)
          ctx.globalCompositeOperation = 'source-over';
        pc.device.elementsDrawn++;

      },


    })
/**
 * @class pc.Image
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A basic image resource. You can use this class to acquire images (loaded from a URI) and then draw them on-screen
 * with effects such as scaling, rotation, compositing and alpha.<p>
 */
pc.Image = pc.BaseImage.extend('pc.Image',
    /** @lends pc.Image */
    {},
    /** @lends pc.Image.prototype */
    {
        /** Source URI used to load the image */
        src:null,
        /** Resource name */
        name:null,
        /** Whether the image has been loaded yet */
        loaded:false,
        /** Optional function called after this image loads */
        onLoadCallback:null,
        /** Optional function called if this image fails to load */
        onErrorCallback:null,

        /**
         * Constructs a new pc.Image. If the pc.device.loader has already started then the image will be
         * immediately loaded, otherwise it will wait for the resource loader to handle the loading.
         *
         * Width and height will be set automatically on load.
         *
         * @param {String} name Name to give the image resource
         * @param {String} src URI for the image
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();

            this.name = name;
            this.src = pc.device.loader.makeUrl(src);
            this.image = new Image();

            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            // setup our own handlers
            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;

            if (pc.device.loader.started) // load now if the loader has already been started
                this.load();
        },

        /**
         * Load an image directly
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) this.onLoadCallback(this);

            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.image.src = this.src;
        },

        /**
         * Force this image to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        _onLoad:function ()
        {
            this.loaded = true;

            this.width = this.image.width;
            this.height = this.image.height;

            if (this.onLoadCallback)
                this.onLoadCallback(this);
        },

        _onError:function ()
        {
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Expands the image by adding blank pixels to the bottom and side
         * @param {Number} extraWidth Amount of width to add
         * @param {Number} extraHeight Amount of height to add
         */
        expand:function (extraWidth, extraHeight)
        {
            this.image.width = this.width + extraWidth;
            this.image.height = this.height + extraHeight;
            this.width = this.image.width;
            this.height = this.image.height;
        },

        /**
         * Resizes an image using a given scale. This will create a new image internally, which can be
         * expensive. Generally you should use setScale on the image to change it's size, which will let
         * the hardware take care of it. If this is slow, or the results are not what you want, then you
         * can use this method to do a nicer resize (but keep in mind it's slow and memory expensive)
         * @param {Number} scaleX Scale to increase X by (can be negative)
         * @param {Number} scaleY Scale to increase Y by (can be negative)
         * @return {pc.Image} This image object
         */
        resize:function (scaleX, scaleY)
        {
            var sw = this.width * scaleX;
            var sh = this.height * scaleY;

            var startingImage = document.createElement('canvas');
            startingImage.width = this.width;
            startingImage.height = this.height;

            var result = document.createElement('canvas');
            result.width = sw;
            result.height = sh;

            var ctx = result.getContext('2d');
            var resultPixels = ctx.getImageData(0, 0, sw, sh);

            var startingCtx = startingImage.getContext('2d');
            startingCtx.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var startingPixels = startingCtx.getImageData(0, 0, this.width, this.height);

            for (var y = 0; y < sh; y++)
            {
                for (var x = 0; x < sw; x++)
                {
                    var i = (Math.floor(y / scaleY) * this.width + Math.floor(x / scaleX)) * 4;
                    var is = (y * sw + x) * 4;
                    for (var j = 0; j < 4; j++)
                        resultPixels.data[is + j] = startingPixels.data[i + j];
                }
            }

            ctx.putImageData(resultPixels, 0, 0);
            this.image = result;
            return this;
        }


    });

/**
 * A wrapper around a Canvas element supporting the same API as pc.Image.  It can
 * be used to render or pre-render graphics that can be used in APIs that expect an
 * Image object.
 */
pc.CanvasImage = pc.BaseImage.extend('pc.CanvasImage', {},
    {

        canvas:null,
        loaded:true,

        init:function (canvas)
        {
            this.canvas = this.image = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.loaded = true;
        },

        draw:function (ctx, sx, sy, x, y, width, height, rotationAngle)
        {
            if (width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx, sy);
            else {
              if (pc.valid(rotationAngle))
              {
                ctx.save();

                if (this.alpha != 1)
                  ctx.globalAlpha = this.alpha;
                if (this.scaleX < 0 || this.scaleY < 0)
                {
                  var yf = this.scaleY == 1 ? 0 : this.scaleY;
                  var xf = this.scaleX == 1 ? 0 : this.scaleX;

                  ctx.translate((x + (width / 2) * xf), (y + (height / 2) * yf));
                } else
                  ctx.translate(x + (width / 2), y + (height / 2));

                ctx.rotate(rotationAngle * (Math.PI / 180));
                ctx.scale(this.scaleX, this.scaleY);
                ctx.drawImage(this.canvas, sx, sy, width, height, (-width / 2), (-height / 2), width, height);
                ctx.restore();
              }
              else
              {
                ctx.save();

                if (this.alpha != 1)
                  ctx.globalAlpha = this.alpha;
                if (this.scaleX < 0 || this.scaleY < 0)
                {
                  var yf2 = this.scaleY == 1 ? 0 : this.scaleY;
                  var xf2 = this.scaleX == 1 ? 0 : this.scaleX;

                  ctx.translate(x + (-(width / 2) * xf2), y + (-(height / 2) * yf2));
                } else
                  ctx.translate(x, y);

                ctx.scale(this.scaleX, this.scaleY);
                ctx.drawImage(this.canvas, sx, sy, width, height, 0, 0, width, height);
                ctx.restore();
              }
            }
        },

        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }

    });


pc.ImageTools = pc.Base.extend('pc.ImageTools',
    {
        /**
         * Rotates an image by the given number of directions
         * @param image Source image
         * @param w Width of the image
         * @param h Height of the image
         * @param directions Number of directions you want back
         * @return {pc.CanvasImage} A new pc.CanvasImage with the rotations
         */
        rotate:function (image, w, h, directions)
        {
            // create an destination canvas big enough
            var resultCanvas = document.createElement('canvas');
            resultCanvas.width = w * directions;
            resultCanvas.height = h;

            var ctx = resultCanvas.getContext('2d');

            // find center of the source image
            var cx = w / 2;
            var cy = h / 2;

            for (var d = 0; d < directions; d++)
            {
                ctx.save();
                ctx.translate(d * w + (w / 2), h / 2);
                ctx.rotate(((360 / directions) * d) * (Math.PI / 180));
                ctx.drawImage(image, -(w / 2), -(h / 2));
                ctx.restore();
            }

            return new pc.CanvasImage(resultCanvas);
        }


    },
    {});

pc.Subimage = pc.BaseImage.extend('pc.Subimage', {},
    {
      /** X offset into the base image */
      sourceX:0,
      /** Y offset into the base image */
      sourceY:0,

      /** Base image */
      baseImage:null,

      init:function(baseImage, config) {
        this.baseImage = baseImage;
        this.loaded = true;
        if(!pc.valid(baseImage)) throw new Error('Subimage without base image!');
        this.sourceX = pc.checked(config.x, 0);
        this.sourceY = pc.checked(config.y, 0);
        this.width = pc.checked(config.w, 0);
        this.height = pc.checked(config.h, 0);
        this.scaleX = pc.checked(config.scaleX, 1.0);
        this.scaleY = pc.checked(config.scaleY, 1.0);
        this.alpha = pc.checked(config.alpha, 1.0);
        if(!baseImage.loaded) console.log("Warning: Subimage of not-loaded image");
        this.compositeOperation = pc.checked(config.compositeOperation, null);
      },

      /**
       * Change the alpha level to draw the image at (0.5 = 50% transparent)
       * @param {Number} a Alpha level
       */
      setAlpha:function (a)
      {
        this.alpha = a;
      },

      /**
       * Change the x and/or y scale to draw the image at. If you want to scale an image to a particular size,
       * just generate the scale by dividing one size by another, e.g. current image size 500, 500 and you want to
       * scale to 750, 750, then do setScale( 750/500, 750/500 ).
       * @param {Number} scaleX x-scale to draw at (2 = 200% wide, -1 = reversed normal on x)
       * @param {Number} scaleY y-scale to draw at (2 = 200% high, -1 = reversed normal on y)
       */
      setScale:function (scaleX, scaleY)
      {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
      },

      /**
       * Sets the componsite drawing operation for this image.
       * @param {String} o Operation to use (e.g. 'lighter')
       */
      setCompositeOperation:function (o)
      {
        this.compositeOperation = o;
      },

      /**
       * Draw the image onto a context
       * @param {Context} ctx Context to draw the sprite image on
       * @param {Number} sx Source position in the image (or detination x if only 3 params)
       * @param {Number} sy Source position in the image (or destination y if only 3 params)
       * @param {Number} x x-position destination x position to draw the image at
       * @param {Number} y y-position destination y position to draw the image at
       * @param {Number} width Width to draw (will clip the image edge)
       * @param {Number} height Height to draw (will clip the image edge)
       * @param {Number} rotationAngle Angle to draw the image at
       */
      draw:function (ctx, sx, sy, x, y, width, height, rotationAngle)
      {
        if (!this.baseImage.loaded) return;

        if (this.scaleX != 1 || this.scaleY != 1)
          this.baseImage.setScale(this.scaleX, this.scaleY);

        if (this.alpha != 1)
          this.baseImage.setAlpha(this.alpha);

        if (this.compositeOperation != null)
          this.baseImage.setCompositeOperation(this.compositeOperation);

        if(arguments.length == 3) {
          this.baseImage.draw(ctx, this.sourceX, this.sourceY, sx, sy, this.width, this.height, rotationAngle);
        } else {
          this.baseImage.draw(ctx, this.sourceX+sx, this.sourceY+sy, x, y,
              Math.min(width, this.width-sx),
              Math.min(height, this.height-sy),
              rotationAngle);
        }

        // restore scaling (as images can be used amongst spritesheets, we need to be nice)
        if (this.scaleX != 1 || this.scaleY != 1)
          this.baseImage.setScale(1, 1);

        // set the alpha back to normal
        if (this.alpha != 1)
          this.baseImage.setAlpha(1);

        if (this.compositeOperation != null)
          this.baseImage.setCompositeOperation('source-over');
      }
});