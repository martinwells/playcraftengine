/**
 * HyperGate -- game.js
 */



CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004 // 0000100
};


TheGame = pc.Game.extend('TheGame',
    {},
    {
        gameScene:null,
        loadingScene:null,
        loadingLayer:null,

        onReady:function ()
        {
            this._super();

            // load resources
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('playerShip', 'images/ship1.png'));
            pc.device.loader.add(new pc.Image('stars', 'images/stars.png'));
            pc.device.loader.add(new pc.Image('planet1', 'images/planet_01.png'));
            pc.device.loader.add(new pc.Image('planet2', 'images/planet_02.png'));
            pc.device.loader.add(new pc.Image('stars-dim', 'images/stars-dim.png'));
            pc.device.loader.add(new pc.Image('nebula-blobs', 'images/nebula-blobs.png'));
            pc.device.loader.add(new pc.Image('explosions', 'images/smallexplosions.png'));
            pc.device.loader.add(new pc.Image('plasma-fire', 'images/flareblue16.png'));
            pc.device.loader.add(new pc.Image('asteroid1', 'images/asteroid1.png'));
            pc.device.loader.add(new pc.Image('asteroid-small', 'images/asteroid-small.png'));
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke1.png'));

            if (pc.device.soundEnabled)
            {
                pc.device.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg', 'mp3'], 15));
                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg', 'mp3'], 12));
                pc.device.loader.add(new pc.Sound('music1', 'sounds/flashforward', ['ogg', 'mp3'], 1));
            }

            this.loadingScene = new pc.Scene();
            this.loadingLayer = new pc.Layer('loading');
            this.loadingScene.addLayer(this.loadingLayer);

            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
        },

        onLoading:function (percentageComplete)
        {
            var ctx = pc.device.ctx;
            ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            ctx.font = "normal 50px Verdana";
            ctx.fillStyle = "#88f";
            ctx.fillText('Frontier', 40, (pc.device.canvasHeight / 2) - 50);
            ctx.font = "normal 18px Verdana";
            ctx.fillStyle = "#777";
            ctx.fillText('Loading: ' + percentageComplete + '%', 40, pc.device.canvasHeight / 2);
        },

        onLoaded:function ()
        {
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }

    });


