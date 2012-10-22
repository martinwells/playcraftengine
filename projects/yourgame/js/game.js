/**
 * A sample game.js for you to work from
 */

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

            // all we need is the render system
            this.gameLayer.addSystem(new pc.systems.Render());

            // create a simple box
            this.box = pc.Entity.create(this.gameLayer);

            this.box.addComponent(pc.components.Rect.create({ color:'#ff2222' }));
            this.box.addComponent(pc.components.Spatial.create({ x:100, y: 100, w:50, h:50 }));

            // a simple move action bound to the space key
            pc.device.input.bindAction(this, 'move', 'SPACE');
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


