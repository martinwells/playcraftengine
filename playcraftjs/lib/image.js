/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Image
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A basic image resource. You can use this class to acquire images (loaded from a URI) and then draw them on-screen
 * with effects such as scaling, rotation, compositing and alpha.<p>
 */
pc.Image = pc.Base.extend('pc.Image',
    /** @lends pc.Image */
    {},
    /** @lends pc.Image.prototype */
    {
        /** Width of the image; set upon loading, can be overridden after load */
        width:0,
        /** Height of the image; set upon loading, can be overridden after load */
        height:0,
        /** Source image element */
        image:null,
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
        /** x-scale to draw the image at */
        scaleX:1,
        /** y-scale to draw the image at */
        scaleY:1,
        /** alpha level to draw the image at (0.5=50% transparent) */
        alpha:1,
        /** Composite operation to draw the image with, e.g. 'lighter' */
        compositeOperation:null,

        /**
         * Constructs a new pc.Image. If the pc.device.loader has already started then the image will be
         * immediately loaded, otherwise it will wait for the resource loader to handle the loading.
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
         * Change the alpha level to draw the image at (0.5 = 50% transparent)
         * @param {Number} a Alpha level
         */
        setAlpha:function (a)
        {
            this.alpha = a;
        },

        /**
         * Change the x and/or y scale to draw the image at.
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
                    ctx.drawImage(this.image, sx, sy, width, height, (-width / 2), (-height / 2), width, height);
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
                    ctx.drawImage(this.image, sx, sy, width, height, 0, 0, width, height);
                    ctx.restore();
                }
            }

            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = 'source-over';
            pc.device.elementsDrawn++;

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

// todo: this should be derived from image (or at least a common base -- merge things like scaling factor api)
pc.CanvasImage = pc.Base.extend('pc.CanvasImage', {},
    {

        width:0,
        height:0,
        canvas:null,
        loaded:true,
        scaleX:1,
        scaleY:1,

        init:function (canvas)
        {
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
        },

        draw:function (ctx, sx, sy, x, y, width, height)
        {
            if (width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx, sy);
            else
                ctx.drawImage(this.canvas, sx, sy, width, height, x * this.scaleX, y * this.scaleY,
                    width * this.scaleX, height * this.scaleY);
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