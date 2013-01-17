/**
 * GameScene
 * A template game scene
 */
GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,
        box: null,

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

            this.box = pc.Entity.create(this.gameLayer);
            this.box.addComponent(pc.components.Spatial.create({ x:300, y:300, w:100, h:100 }));
            this.box.addComponent(pc.components.Sprite.create(
                {
                    spriteSheet:new pc.SpriteSheet({ image:pc.device.loader.get('rect100').resource, frameCount:1 })
                }));

            for (var i = 0; i < 1; i++)
            {
                this.box = pc.Entity.create(this.gameLayer);
                this.box.addComponent(pc.components.Spatial.create({ x:100, y:100, w:100, h:100 }));
//                this.box.addComponent(pc.components.Spatial.create({ x:200 + (i * 50), y:200, w:100, h:100 }));
//                this.box.addComponent(pc.components.Rect.create({ color:[ pc.Math.rand(0, 255), pc.Math.rand(0, 255), pc.Math.rand(0, 255) ] }));
//                box.addComponent(pc.components.Spin.create({ rate:20, clockwise:true }));

                this.box.addComponent(pc.components.Sprite.create(
                    {
                        spriteSheet:new pc.SpriteSheet({ image:pc.device.loader.get('rect100').resource, frameCount:1 })
                    }));

                this.box.addComponent(pc.components.Scale.create({ x: 2, y:2 }));
            }

        },

        process:function ()
        {
            // clear the background
            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // always call the super
            this._super();

            this.box.getComponent('spatial').pos.x--;

            //
            // ... do extra processing in here
            //
        }
    });
