/**
 * A sample game.js for you to work from
 */


MouseHover = pc.components.Input.extend('MouseHover',
    {
        create:function()
        {
            return this._super({
                states:[
                    [ 'hover', ['MOUSE_MOVE'] ]
            ]});
        }
    },
    {
//        init:function()
//        {
//            this._super();
//        }
    });


MouseHoverSystem = pc.systems.Input.extend('MouseHoverSystem',
    {
    },
    {
        init:function ()
        {
            this._super([ 'input' ]);
        },

        process:function (entity)
        {
            this._super(entity);

            if (this.isInputState(entity, 'hover'))
                entity.getComponent("spatial").pos.x += 5;
        }

    });

/**
 * GameScene
 * A template game scene
 */
GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,
        box:null,

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
            this.gameLayer.addSystem(new MouseHoverSystem());

            for (var i = 0; i < 10; i++)
            {
                this.box = pc.Entity.create(this.gameLayer);
                this.box.addComponent(pc.components.Rect.create({ color:[ pc.Math.rand(0, 255), pc.Math.rand(0, 255), pc.Math.rand(0, 255) ] }));
//                this.box.addComponent(pc.components.Spin.create({ rate:20, clockwise:true }));
//                this.box.addComponent(pc.components.Scale.create({ growX:0.02, growY:0.04 }));
                this.box.addComponent(pc.components.Spatial.create({ x:200 + (i * 50), y:200, w:100, h:100 }));
                this.box.addComponent(MouseHover.create());
            }

            // a simple move action bound to the space key
            pc.device.input.bindAction(this, 'move', 'UP');
        },

        onAction:function (actionName, event, pos)
        {
            if (actionName === 'move')
                this.box.getComponent('spatial').pos.x += 10;
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


TheGame = pc.Game.extend('TheGame',
    { },
    {
        gameScene:null,

        onReady:function ()
        {
            this._super();

            // disable caching when developing
            if (pc.device.devMode)
                pc.device.loader.setDisableCache();

            /*

             // no resources are loaded in this template, so this is all commented out
             pc.device.loader.add(new pc.Image('an id', 'images/an image.png'));

             if (pc.device.soundEnabled)
             pc.device.loader.add(new pc.Sound('fire', 'sounds/fire', ['ogg', 'mp3'], 15));

             // fire up the loader
             pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));

             */

            // and instead, we just start the game (otherwise you should do it in the loader callback below)
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        },

        onLoading:function (percentageComplete)
        {
            // draw title screen -- with loading bar
        },

        onLoaded:function ()
        {
            // resources are all ready, start the main game scene
            // (or a menu if you have one of those)
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }
    });


