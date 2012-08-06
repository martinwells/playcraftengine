/**
 * Playcraft Engine (C)2011-2012 Playcraft Labs, Inc.
 * Particle System Demo
 */

GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,
        starSheet:null,
        explosionSheet:null,
        flareSheet:null,
        smokeSheet:null,
        snowSheet:null,
        currentEmitter:null,
        particleCountText: null,
        current:0,
        total:8,

        init:function ()
        {
            this._super();

            // ------------------------------------------------------------------------------------
            // Init the game layer
            // ------------------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game'));

            this.gameLayer.systemManager.add(new pc.systems.Particles());
            this.gameLayer.systemManager.add(new pc.systems.Effects());
            this.gameLayer.systemManager.add(new pc.systems.Render());
            this.gameLayer.systemManager.add(new pc.systems.Expiration());
            this.gameLayer.systemManager.add(new pc.systems.Layout());

            // ------------------------------------------------------------------------------------
            // Setup sprite sheets
            // ------------------------------------------------------------------------------------
            var starsImage = pc.device.loader.get('stars').resource;
            this.starSheet = new pc.SpriteSheet({sourceX:20, image:starsImage, frameWidth:20, frameHeight:20, framesWide:3, framesHigh:3});

            this.flareSheet = new pc.SpriteSheet({ image:pc.device.loader.get('flare').resource, frameWidth:30, frameHeight:30 });
            this.flareSheet.addAnimationWithDirections('floating', 0, 0, null, 1, 400, 0, true);

            this.explosionSheet = new pc.SpriteSheet(
                {
                    image:pc.device.loader.get('explosions').resource,
                    frameWidth:64, frameHeight:64, framesWide:16, framesHigh:8, useRotation:true
                });

            this.explosionSheet.addAnimation('explode', 0, 1,
                [ 15, 13, 12, 10, 8, 6, 5, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 800, 0);

            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource,
                    frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.smokeSheet.addAnimation('snowy', 0, 0, [1], 300, 1);

            this.snowSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource,
                    frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.snowSheet.addAnimation('snowy', 0, 0, [3, 4, 5, 7, 7, 8, 9, 10], 1000, 1);

            // provide some instructions
            this.displayTitle();
            this.displayAlert('[Mouse click to see more]');

            // create the particle counter
            this.particleCountText = pc.Entity.create(this.gameLayer);
            this.particleCountText.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Particles: 0'],
                lineWidth:0, fontHeight:20 }));
            this.particleCountText.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            this.particleCountText.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'right',
                margin:{ top:30, right:30 } }));

            // create the first emitter
            this.currentEmitter = this.createEmitter(this.current);

            // ------------------------------------------------------------------------------------
            // Setup the controls
            // ------------------------------------------------------------------------------------
            pc.device.input.bindAction(this, 'next', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindAction(this, 'next', 'space');
        },

        lastUpdatedCount:0,

        process:function ()
        {
            // clear the background
            pc.device.ctx.fillStyle = '#000';
            pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            if (pc.device.now - this.lastUpdatedCount > 1000)
            {
                this.particleCountText.getComponent('text').text[0] = 'Particles: ' +
                    this.currentEmitter.getComponent('emitter')._particles.length();
                this.lastUpdatedCount = pc.device.now;
            }

            // then let the system process/draw everything
            this._super();
        },

        onAction:function (action, event, pos)
        {
            switch (action)
            {
                case 'next':
                    this.currentEmitter.remove();
                    this.current++;
                    if (this.current >= this.total) this.current = 0;
                    this.currentEmitter = this.createEmitter(this.current);
                    break;
            }
        },

        createEmitter:function (type)
        {
            var e = null;
            var x = pc.device.canvasWidth / 2;
            var y = pc.device.canvasHeight / 2;
            var dir = 0;

            switch (type)
            {
                case 0:
                    // Pretty stars
                    this.displayText((type + 1) + ' of ' + this.total + ": There are unicorns?");

                    e = pc.Entity.create(this.gameLayer);

                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.starSheet,
                            burst:3,
                            delay:20,
                            thrustMin:8, thrustTime:300,
                            maxVelX:5, maxVelY:5,
                            rangeX:10, rangeY:10, // x axis modification: 10 equals -5 position.x to +5 position.x
                            scaleXMin:0, scaleYMin:0,
                            angleMin:-100, angleMax:-80,
                            lifeMin:2300,
                            alphaMin:0, alphaMax:1, alphaDelay:50,
                            gravityY:0.02,
                            compositeOperation:'lighter',
                            spinMin:-80, spinMax:80,
                            rotateSprite:true
                        }));
                    return e;

                case 1:
                    this.displayText((type + 1) + ' of ' + this.total + ": Balrog's sneeze");
                    // Balrog's sneeze
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.explosionSheet,
                            burst:1,
                            delay:20,
                            thrustMin:3,
                            thrustTime:2500,
                            maxVelX:10, maxVelY:10,
                            scaleXMin:0.5,
                            scaleYMin:0.5,
                            angleMin:-110, angleMax:-70,
                            lifeMin:1200,
                            fadeOutTime:500,
                            gravityY:0,
                            spinMin:900,
                            rotateSprite:true
                        }));

                    return e;

                case 2:
                    this.displayText((type+1) + ' of ' + this.total + ": Exploding vortex");
                    // Exploding vortex
                    e = pc.Entity.create(this.gameLayer);

                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:40, h:40 }));
                    e.addComponent(pc.components.ParticleEmitter.create({ spriteSheet:this.explosionSheet, burst:3, delay:20,
                        thrustMin:50, angleMin:-0, angleMax:359, scaleXMin: 0.3, scaleYMin:0.3, fadeOutTime: 100, lifeMin:400, rotateSprite:true }));
                    return e;

                case 3:
                    this.displayText((type + 1) + ' of ' + this.total + ': Firelight');
                    // Fire light
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.explosionSheet,
                            burst:1,
                            delay:40,
                            thrustMin:3,
                            thrustTime:500,
                            maxVelX:10, maxVelY:10,
                            scaleXMin:0.5,
                            scaleYMin:0.5,
                            angleMin:-110, angleMax:-70,
                            lifeMin:800,
                            fadeOutTime:700,
                            compositeOperation:'lighter',
                            rotateSprite:true
                        }));

                    return e;

                case 4:
                    // Flaring wall of light saberness
                    this.displayText((type + 1) + ' of ' + this.total + ': Flaring walls');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.flareSheet,
                            burst:12,
                            delay:20,
                            thrustMin:8,
                            thrustTime:500,
                            maxVelX:10, maxVelY:10,
                            angleMin:-180, angleMax:0,
                            lifeMin:800,
                            rangeX: 200,
                            fadeOutTime:700,
                            compositeOperation:'lighter'
                        }));

                    return e;

                case 5:
                    // Spewing ash
                    this.displayText((type + 1) + ' of ' + this.total + ': Lava spew');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.smokeSheet,
                            burst:22,
                            delay:30,
                            fadeInTime: 100,
                            lifeMin:1300,
                            rangeX:200,
                            rangeY:1,
                            gravityY: 0.1,
                            fadeOutTime:200,
                            compositeOperation:'lighter'
                        }));

                    return e;

                case 6:
                    // Snow fall
                    this.displayText((type + 1) + ' of ' + this.total + ': Snowed in');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.snowSheet,
                            burst:8,
                            delay:20,
                            fadeInTime:100,
                            maxVelX:10, maxVelY:10,
                            scaleXMin:0.5, scaleYMin:0.5,
                            scaleXMax:0.5, scaleYMax:0.5,
                            lifeMin:1000,
                            rangeX:300,
                            rangeY:100,
                            gravityY:0.1,
                            fadeOutTime:200
                        }));

                    return e;

                case 7:
                    // Sparkle storm
                    this.displayText((type + 1) + ' of ' + this.total + ': Sparkle storm');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.starSheet,
                            burst:8,
                            delay:30,
                            thrustMin: 10, thrustMax: 20,
                            angleMin: 0, angleMax: 359,
                            scaleXMin:1, scaleYMin:10,
                            scaleXMax:1, scaleYMax:30,
                            lifeMin:1000,
                            spinMin: -300, spinMax: 300,
                            fadeOutTime:500,
                            rotateSprite: true
                        }));

                    return e;
            }
        },

        displayTitle:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#228822', text:['PARTICLE DEMO'], fontHeight:24 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:30 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{ left: 30, top:30 } }));
        },

        displayText: function(s)
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#7777bb', text:[s], fontHeight:24 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin: { left:30, bottom:20 } }));
        },

        displayAlert:function (s)
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#66bb66', text:[ s ], fontHeight:18 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:30 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{ left:30 } }));
        }



    });


TheGame = pc.Game.extend('TheGame',
    {},
    {
        onReady:function ()
        {
            this._super();

            // Load up all the resources we need
            pc.device.loader.setBaseUrl('/demos/particles/');
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('stars', 'stars.png'));
            pc.device.loader.add(new pc.Image('smoke', 'smoke1.png'));
            pc.device.loader.add(new pc.Image('explosions', 'explosions.png'));
            pc.device.loader.add(new pc.Image('flare', 'flareblue16.png'));

            // Tell the loader to get going
            pc.device.loader.start(null, this.onLoaded.bind(this));
        },

        onLoaded:function ()
        {
            // once we're done, kick off the game scene
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }

    }
);


