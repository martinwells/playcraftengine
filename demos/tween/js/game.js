/**
 * Tutorial demo code to show off tween/sequencing
 */

TweenLayer = pc.EntityLayer.extend('TweenLayer',
  {},
  {
    init: function ()
    {
      this._super('my layer', 1);

      // add a simple entity with a rectangle
      var box = pc.Entity.create(this);
      box.addComponent(pc.components.Spatial.create({ x: 100, y: 100, w: 20, h: 20 }));
      box.addComponent(pc.components.Rect.create( {color:'#ff0000' } ));

      box.addComponent(pc.components.Mover.create(
      {
        targetPos: { x:200, y:200 },
        easing: pc.Easing.BOUNCE_OUT,
        duration: 1000
      }));

      this.addSystem(new pc.systems.Render());
      this.addSystem(new pc.systems.Mover());
    }

  });


GameScene = pc.Scene.extend('GameScene',
  { },
  {
    gameLayer: null,

    init: function ()
    {
      this._super();
      this.gameLayer = this.addLayer(new TweenLayer());
    },

    process: function ()
    {
      // clear the background
      pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

      // always call the super so the layers get processed
      this._super();
    }
  });


TheGame = pc.Game.extend('TheGame',
  { },
  {
    gameScene: null,

    onReady: function ()
    {
      this._super();
      pc.device.loader.start(null, this.onLoaded.bind(this));
    },

    onLoaded: function ()
    {
      this.gameScene = new GameScene();
      this.addScene(this.gameScene);
    }
  });


