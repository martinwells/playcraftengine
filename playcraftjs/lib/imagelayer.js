/**
 * Layer that draws a single image, optionally repeated.
 * This implements the image layer feature of the Tiled map editor
 * but undoubtedly has other uses.
 */
pc.ImageLayer = pc.Layer.extend('pc.ImageLayer',
    {

    },
    {
      /** image to draw - must implement the draw function */
      image: null,
      /** Left edge to start drawing at */
      x: 0,
      /** Top edge to start drawing at */
      y: 0,
      /** If true, repeat horizontally to fill the canvas */
      repeatX: false,
      /** If true, repeat vertically to fill the canvas */
      repeatY: false,

      /**
       * Initialize the layer.
       *
       * @param name Name to use (passed up to pc.Layer)
       * @param image Image to use; must implement draw() just like pc.Image
       * @param zIndex zIndex to use
       * @param opts More options: repeatX, repeatY
       */
      init:function(name, image, zIndex, opts) {
        this._super(name, zIndex);
        this.image = image;
        if(arguments.length > 3) {
          this.repeatX = pc.checked(opts.repeatX, this.repeatX);
          this.repeatY = pc.checked(opts.repeatY, this.repeatY);
        }
      },

      draw:function() {
        var x = this.screenX(this.x);
        var y = this.screenY(this.y);
        var w = this.image.width*this.image.scaleX;
        var h = this.image.height*this.image.scaleY;
        var adjustX = (w-this.image.width)/2;
        var adjustY = (h-this.image.height)/2;
        var cw = pc.device.canvasWidth;
        var ch = pc.device.canvasHeight;
        var drawnTimes = 0;
        var ctx = pc.device.ctx;
        for(var yy = y; yy < ch; yy += h) {
          if(yy > -h) {
            for(var xx = x; xx < cw; xx += w) {
              if(xx > -w) {
                this.image.draw(ctx,xx+adjustX,yy+adjustY);
              }
              if(!this.repeatX)
                break;
            }
          }
          if(!this.repeatY)
            break;
        }
      },

      /**
       * Scale the image so that it will always fill the screen.
       *
       * @param width Screen width to use
       * @param height Screen height to use
       */
      fitTo:function(width,height) {
        var scale = Math.min(width/this.image.width, height/this.image.height);
        this.image.setScale(scale,scale);
      },

      moveToBottom:function(height) {
        this.repeatY = false;
        this.y = height - (this.image.height / this.image.scaleY);
      }
    }
);
