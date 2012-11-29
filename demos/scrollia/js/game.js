/**
 * Scrollia
 */

CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004, // 0000100
    WALL:0x0008
};

TheGame = pc.Game.extend('TheGame',
    {},
    {
        gameScene:null,
        loadingScene: null,
        loadingLayer: null,
        soundManager: null,

        onReady:function ()
        {
            this._super();

            // load resources
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('cave', 'images/tiles.png'));
            pc.device.loader.add(new pc.Image('player', 'images/armsman.png'));
            pc.device.loader.add(new pc.Image('zombie', 'images/zombie.png'));
            pc.device.loader.add(new pc.Image('cavern-backdrop', 'images/cavern_backdrop.png'));
            pc.device.loader.add(new pc.Image('cavern-window', 'images/cavern_window.png'));
            pc.device.loader.add(new pc.Image('zombie', 'images/zombie.png'));
            pc.device.loader.add(new pc.Image('lightrays', 'images/lightRays_window.png'));
            pc.device.loader.add(new pc.Image('blood', 'images/bloodParticles.png'));
            pc.device.loader.add(new pc.Image('explosions', 'images/explosions.png'));
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke1.png'));
            pc.device.loader.add(new pc.Image('crate1', 'images/crate1.png'));
            pc.device.loader.add(new pc.Image('crate2', 'images/crate2.png'));
            pc.device.loader.add(new pc.Image('crate-debris', 'images/crate_debris.png'));
            pc.device.loader.add(new pc.Image('plank', 'images/plank.png'));
            pc.device.loader.add(new pc.Image('rock', 'images/rock.png'));
            pc.device.loader.add(new pc.Image('lava', 'images/lavaSpew.png'));
            pc.device.loader.add(new pc.Image('ogre', 'images/ogre.png'));

            pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx'));

            if (pc.device.soundEnabled)
            {
                pc.device.loader.add(new pc.Sound('fireball-cast', 'sounds/fireball_cast', ['ogg', 'mp3'], 5));
                pc.device.loader.add(new pc.Sound('fireball-explode', 'sounds/fireball_explode', ['ogg', 'mp3'], 5));
                pc.device.loader.add(new pc.Sound('wood-explode', 'sounds/woodsmash', ['ogg', 'mp3'], 5));
                pc.device.loader.add(new pc.Sound('sword-swing', 'sounds/swordSwing1', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('zombie-alert', 'sounds/zombie_alert1', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('zombie-brains', 'sounds/zombie_brains', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('player-pain1', 'sounds/player_pain1', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('player-pain2', 'sounds/player_pain2', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('blood-hit1', 'sounds/blood_hit1', ['ogg', 'mp3'], 2));
                pc.device.loader.add(new pc.Sound('blood-hit2', 'sounds/blood_hit2', ['ogg', 'mp3'], 2));
            }

            this.loadingScene = new pc.Scene();
            this.loadingLayer = new pc.Layer('loading');
            this.loadingScene.addLayer(this.loadingLayer);

            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
        },

        onLoading:function (percentageComplete)
        {
            var ctx = pc.device.ctx;
            ctx.clearRect(0,0,pc.device.canvasWidth, pc.device.canvasHeight);
            ctx.font = "normal 50px Times";
            ctx.fillStyle = "#bbb";
            ctx.fillText('Scrollia', 40, (pc.device.canvasHeight / 2)-50);
            ctx.font = "normal 14px Verdana";
            ctx.fillStyle = "#777";
            ctx.fillText('Loading: ' + percentageComplete + '%', 40, pc.device.canvasHeight/2);
        },

        onLoaded:function ()
        {
            this.soundManager = new SoundManager();
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }

    });

