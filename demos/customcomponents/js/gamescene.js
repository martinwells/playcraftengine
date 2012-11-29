/**
 * GameScene
 * A template game scene
 */
GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,

        init:function ()
        {
            this._super();

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            // all we need is the render system
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Physics({ debug:true }));

            // add our custom system - defined in systems/mousehover.js
            this.gameLayer.addSystem(new MouseHoverSystem());

            var box = pc.Entity.create(this.gameLayer);
            box.addComponent(pc.components.Rect.create({ color:[ pc.Math.rand(0, 255), pc.Math.rand(0, 255), pc.Math.rand(0, 255) ] }));
            box.addComponent(pc.components.Spatial.create({ x:200, y:200, w:100, h:100 }));

            // add our custom component - defined in components/mousehover.js
            box.addComponent(MouseHover.create());
        },

        process:function ()
        {
            //
            // ... do extra processing in here
            //

            // clear the background
            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // always call the super
            this._super();
        }
    });

