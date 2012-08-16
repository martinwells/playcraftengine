/**
 * PlayCraft Engine
 * Image: a basic image class
 * @class
 */

pc.Image = pc.Base.extend('pc.Image', {},
    {
        width:0,
        height:0,
        image:null,
        src:null,
        name: null,
        loaded:false,
        onLoadCallback:null,
        onErrorCallback:null,
        scaleX:1,
        scaleY:1,
        compositeOperation: null,

        /**
         * Loads an image from a remote (URI) resource. This will automatically
         * add this image into the resource manager if the game is still in an init
         * phase.
         * @param src URI for the image
         * @param onLoadCallback Function to be called once the image has been loaded
         * @param onErrorCallback Function to be called if the image fails to load
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
            this.image.onload = this.onLoad.bind(this);
            this.image.onerror = this.onError.bind(this);
            this.scaleX = 1;
            this.scaleY = 1;

            if (pc.device.loader.started) // load now if the loader has already been started
                this.load();
        },

        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this image. Set to null to clear it back to the default.
         * @param o
         */
        setCompositeOperation: function(o)
        {
            this.compositeOperation = o;
        },

        /**
         * Load an image. If the game hasn't started then the image resource
         * will be added to the resource manager's queue.
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) this.onLoadCallback(this);

            this.image.onload = this.onLoad.bind(this);
            this.image.onerror = this.onError.bind(this);
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

        draw:function (ctx, sx, sy, x, y, width, height, rotationAngle)
        {
            // scale testing
            if (this.scaleX != 1 || this.scaleY != 1)
                if (width * this.scaleX <= 0 || height * this.scaleY <=0) return;
            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = this.compositeOperation;

            if (arguments.length == 3)
            {
                ctx.drawImage(this.image, sx * this.scaleX, sy * this.scaleY);
            }
            else
            {
                if (pc.valid(rotationAngle))
                {
                    ctx.save();
                    ctx.translate(x+(width/2), y+(height/2));
                    ctx.rotate(rotationAngle * (Math.PI / 180));
                    ctx.drawImage(this.image, sx, sy, width, height, (-width/2)*this.scaleX, (-height/2)*this.scaleY, width*this.scaleX, height*this.scaleY);
                    ctx.restore();
                } else
                {
                    ctx.drawImage(this.image, sx, sy,
                        width, height,
                        x, y, width * this.scaleX, height * this.scaleY);
                }
            }

            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = 'source-over';
            pc.device.elementsDrawn++;

        },

        onLoad:function ()
        {
            this.loaded = true;

            this.width = this.image.width;
            this.height = this.image.height;

            if (this.onLoadCallback)
                this.onLoadCallback(this);
        },

        onError:function ()
        {
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        resize:function (scaleX, scaleY)
        {
            var sw = this.width * scaleX;
            var sh = this.height * scaleY;

            // todo: fix this code
            var startingImage = document.createElement('canvas');
            startingImage.width = this.width;
            startingImage.height = this.height;

            var startingCtx = startingImage.getContext('2d');
            startingCtx.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var startingPixels = startingCtx.getImageData(0, 0, this.width, this.height);

            var result = document.createElement('canvas');
            result.width = sw;
            result.height = sh;

            var ctx = result.getContext('2d');
            var resultPixels = ctx.getImageData(0, 0, sw, sh);

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
            if ( width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx, sy);
            else
                ctx.drawImage(this.canvas, sx, sy, width, height, x*this.scaleX, y*this.scaleY,
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
        rotate: function(image, w, h, directions)
        {
            // create an destination canvas big enough
            var resultCanvas = document.createElement('canvas');
            resultCanvas.width = w * directions;
            resultCanvas.height = h;

            var ctx = resultCanvas.getContext('2d');

            // find center of the source image
            var cx = w/2;
            var cy = h/2;

            for (var d=0; d < directions; d++)
            {
                ctx.save();
                ctx.translate(d * w + (w/2), h/2);
                ctx.rotate( ((360/directions)*d) * (Math.PI/180));
                ctx.drawImage(image, -(w/2), -(h/2));
                ctx.restore();
            }

            return new pc.CanvasImage(resultCanvas);
        }


    },
    {});