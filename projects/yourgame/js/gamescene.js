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

            // all we need is the render and effects systems
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Effects());

            for (var i = 0; i < 10; i++)
            {
                var box = pc.Entity.create(this.gameLayer);
                box.addComponent(pc.components.Rect.create({ color:[ pc.Math.rand(0, 255), pc.Math.rand(0, 255), pc.Math.rand(0, 255) ] }));
                box.addComponent(pc.components.Spin.create({ rate:20, clockwise:true }));
                box.addComponent(pc.components.Scale.create({ growX:0.02, growY:0.04 }));
                box.addComponent(pc.components.Spatial.create({ x:200 + (i * 50), y:200, w:100, h:100 }));

                box.addTag('test');
                box.removeTag('test');
            }



        },

        process:function ()
        {
            // clear the background
            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // always call the super
            this._super();

            //
            // ... do extra processing in here
            //
        }
    });
