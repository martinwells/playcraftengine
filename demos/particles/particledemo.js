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
        plasmaSheet: null,
        currentEmitter:null,
        particleCountText: null,
        current:0,
        total:10,

        init:function ()
        {
            this._super();

            // ------------------------------------------------------------------------------------
            // Init the game layer
            // ------------------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game'));

            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            // ------------------------------------------------------------------------------------
            // Setup sprite sheets
            // ------------------------------------------------------------------------------------
            var starsImage = pc.device.loader.get('stars').resource;
            this.starSheet = new pc.SpriteSheet({sourceX:20, image:starsImage, frameWidth:20, frameHeight:20, framesWide:3, framesHigh:3});

            this.flareSheet = new pc.SpriteSheet({ image:pc.device.loader.get('flare').resource, frameWidth:30, frameHeight:30 });
            this.flareSheet.addAnimation({ name:'floating', frameCount: 16, time:400, dirAcross:true });

            this.explosionSheet = new pc.SpriteSheet(
                {
                    image:pc.device.loader.get('explosions').resource,
                    frameWidth:64, frameHeight:64, useRotation:true
                });

            this.explosionSheet.addAnimation({ name:'explode', frameY:7, loops:1, frameCount:15, time:800} );

            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource,
                    frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.smokeSheet.addAnimation({ name:'smoking', frameCount:1, time:300 });

            this.snowSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('snow').resource,
                    frameWidth:32, frameHeight:32, framesWide:1, framesHigh:1});
            this.snowSheet.addAnimation({ name:'snowy', frameCount:1, scaleX:0.6, scaleY:0.6 });

            this.plasmaSheet = new pc.SpriteSheet({image:pc.device.loader.get('plasma').resource, framesWide:4, framesHigh:4});
            this.plasmaSheet.addAnimation({ name:'glowing', frameCount:16, scaleX:0.4, scaleY:0.4, time:1000 });

            this.plasmaGreenSheet = new pc.SpriteSheet({image:pc.device.loader.get('plasma-green').resource, framesWide:16 });
            this.plasmaGreenSheet.addAnimation({ name:'glowing', frameCount:16, time:1000 });

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
            pc.device.input.bindAction(this, 'next', 'TOUCH');
            pc.device.input.bindAction(this, 'next', 'space');
            pc.device.input.bindAction(this, 'stats', 'D');
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
                case 'stats':
                    console.log(pc.Pool.getStats());
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
                    this.displayText((type + 1) + ' of ' + this.total + ": Balrog's dinner");
                    // Balrog's sneeze
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.explosionSheet,
                            burst:1,
                            delay:150,
                            thrustMin:3,
                            thrustTime:1500,
                            maxVelX:8, maxVelY:8,
                            scaleXMin:1,
                            scaleYMin:1,
                            angleMin:-110, angleMax:-70,
                            lifeMin:1200,
                            fadeOutTime:500,
                            compositeOperation:'lighter'
                        }));

                    return e;

                case 2:
                    this.displayText((type+1) + ' of ' + this.total + ": Exploding vortex");
                    // Exploding vortex
                    e = pc.Entity.create(this.gameLayer);

                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:40, h:40 }));
                    e.addComponent(pc.components.ParticleEmitter.create({ spriteSheet:this.flareSheet, burst:3, delay:20,
                        thrustMin:50, angleMin:-0, angleMax:359, scaleXMin: 0.3, scaleYMin:0.3, fadeOutTime: 100, lifeMin:400,
                        compositeOperation:'lighter',
                        rotateSprite:true }));
                    return e;

                case 3:
                    this.displayText((type + 1) + ' of ' + this.total + ': Gas powered');
                    // Gas-powered
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x-this.plasmaSheet.frameWidth/2,
                            y:y-this.plasmaSheet.frameHeight/2, dir:dir, w:10, h:50 }));

                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.plasmaSheet,
                            burst:1,
                            delay:40,
                            thrustMin:10,
                            thrustTime:1000,
                            maxVelX:10, maxVelY:10,
                            angleMin:-100, angleMax:-80,
                            lifeMin:800,
                            fadeOutTime:800,
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
                            burst:25,
                            delay:60,
                            fadeInTime: 100,
                            lifeMin:600,
                            rangeX:200,
                            rangeY:5,
                            gravityY: 0.1,
                            scaleXMin: 2, scaleXMax:6,
                            scaleYMin: 2, scaleYMax:6,
                            fadeOutTime:200,
                            compositeOperation:'lighter'
                        }));

                    return e;

                case 6:
                    // Green hornets
                    this.displayText((type + 1) + ' of ' + this.total + ': Green hornets');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.plasmaGreenSheet,
                            burst:5,
                            delay:30,
                            thrustMin:10, thrustMax:20,
                            angleMin:0, angleMax:359,
                            scaleXMin:1, scaleYMin:2,
                            scaleXMax:1, scaleYMax:15,
                            lifeMin:1000,
                            spinMin:-300, spinMax:300,
                            fadeOutTime:500,
                            rotateSprite:true,
                            compositeOperation:'lighter'

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
                            burst:4,
                            delay:30,
                            thrustMin: 10, thrustMax: 20,
                            angleMin: 0, angleMax: 359,
                            scaleXMin:1, scaleYMin:10,
                            scaleXMax:1, scaleYMax:30,
                            lifeMin:1000,
                            spinMin: -300, spinMax: 300,
                            fadeOutTime:500,
                            rotateSprite: true,
                            compositeOperation:'lighter'
                        }));
                    return e;

                case 8:
                    // Snow fall
                    this.displayText((type + 1) + ' of ' + this.total + ': Snowed in');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.snowSheet,
                            burst:15,
                            delay:20,
                            maxVelX:2, maxVelY:2,
                            lifeMin:800,
                            rangeX:300,
                            rangeY:300,
                            gravityY:0.05,
                            rotateSprite: true,
                            spinMin: -100, spinMax: 200,
                            fadeInTime:200,
                            fadeOutTime:200
                        }));

                    return e;

                case 9:
                    // OMG Blue!
                    this.displayText((type + 1) + ' of ' + this.total + ': OMG Blue!');
                    e = pc.Entity.create(this.gameLayer);
                    e.addComponent(pc.components.Spatial.create({x:x-120, y:y-120, dir:dir, w:10, h:50 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.plasmaSheet,
                            burst:2,
                            delay:30,
                            thrustMin:5, thrustMax:30,
                            angleMin:0, angleMax:359,
                            scaleXMin:10, scaleYMin:40,
                            scaleXMax:10, scaleYMax:40,
                            lifeMin:1000,
                            spinMin:-300, spinMax:300,
                            rotateSprite:true
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
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('stars', 'stars.png'));
            pc.device.loader.add(new pc.Image('smoke', 'smoke1.png'));
            pc.device.loader.add(new pc.Image('snow', 'snow.png'));
            pc.device.loader.add(new pc.Image('explosions', 'explosions.png'));
            pc.device.loader.add(new pc.Image('flare', 'flareblue16.png'));
            pc.device.loader.add(new pc.Image('plasma', 'plasma.png'));
            pc.device.loader.add(new pc.Image('plasma-green', 'plasmagreen.png'));

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


