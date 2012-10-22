/**
 * Tutorial demo code (see http://playcraftlabs.com/develop/guides/drawingimages)
 */


MyLayer = pc.Layer.extend('MyLayer',
    {},
    {
        spaceShip:null,

        init:function ()
        {
            this._super('my layer', 1);

            // grab the spaceship image resource from the loader
            this.spaceShip = pc.device.loader.get('spaceship').resource;
        },

        draw:function ()
        {
            // draw the spaceship at 100, 100
            this.spaceShip.draw(pc.device.ctx, 100, 100);

            // draw the ship at a source x 10, y 10, on screen at 100, 150, 30 pixels wide and high:
            this.spaceShip.draw(pc.device.ctx, 10, 10, 100, 150, 30, 30);

            // draw the ship on screen at 100, 200, 40 pixels wide and high:
            // at 45 degrees
            this.spaceShip.draw(pc.device.ctx, 0, 0, 100, 200, 40, 40, 45);

            // draw the spaceship scaled on the x-axis by 5, and the y-axis by 2
            this.spaceShip.setScale(5, 2);
            this.spaceShip.draw(pc.device.ctx, 100, 300);

            // draw reversed on the x-axis
            this.spaceShip.setScale(-1, 1);
            this.spaceShip.draw(pc.device.ctx, 100, 400);

            // set the scale back to normal, otherwise the next cycle will
            // draw everything scaled
            this.spaceShip.setScale(1, 1);

            // draw the spaceship at half translucent
            this.spaceShip.setAlpha(0.5);
            this.spaceShip.draw(pc.device.ctx, 200, 100);
            this.spaceShip.setAlpha(1);

            // draw a rectangle to give us something to composite against
            pc.device.ctx.fillStyle = '#f44';
            pc.device.ctx.fillRect(200, 150, 40, 40);
            // set the composite to xor to 'cut out' the spaceship from the rectangle
            this.spaceShip.setCompositeOperation('xor');
            this.spaceShip.draw(pc.device.ctx, 200, 150);
            // restore things back to normal
            this.spaceShip.setCompositeOperation('source-over');
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

            pc.device.loader.add(new pc.Image('spaceship', 'images/ship1.png'));
            pc.device.loader.start(null, this.onLoaded.bind(this));
        },

        onLoaded:function ()
        {
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }
    });


