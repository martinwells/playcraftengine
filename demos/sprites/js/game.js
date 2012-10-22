/**
 * Tutorial demo code (see http://playcraftlabs.com/develop/guides/spritesandanimation)
 */


MyLayer = pc.Layer.extend('MyLayer',
    {},
    {
        zombieSprite:null,

        init:function ()
        {
            this._super('my layer', 1);

            // grab the zombie image resource from the loader
            var zombieImage = pc.device.loader.get('zombie').resource;
            var zombieSpriteSheet = new pc.SpriteSheet(
                { image:zombieImage, frameWidth:80, frameHeight:72, useRotation:false });

            zombieSpriteSheet.addAnimation({ name:'walking right', frameCount:16, time:1400 });
            zombieSpriteSheet.addAnimation({ name:'attacking right', frameX:0, frameY:2, frameCount:16, time:500 });

            this.zombieSprite = new pc.Sprite( zombieSpriteSheet );
            this.zombieSprite.setAnimation('walking right');
        },

        draw:function ()
        {
            this.zombieSprite.draw(pc.device.ctx, 100, 100);
        },

        process: function()
        {
            this.zombieSprite.update(pc.device.elapsed);
        }

    });


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,

        init:function ()
        {
            this._super();
            this.gameLayer = this.addLayer(new MyLayer());
        },

        process:function ()
        {
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

            pc.device.loader.add(new pc.Image('zombie', 'images/zombie.png'));
            pc.device.loader.start(null, this.onLoaded.bind(this));
        },

        onLoaded:function ()
        {
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }
    });


