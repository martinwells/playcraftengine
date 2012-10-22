/**
 * Asteroids -- game.js
 */


GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        smokeSheet:null,
        explosionSound:null,
        encouragements: null,

        init:function (options)
        {
            this._super(options);
            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource,
                    frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.smokeSheet.addAnimation({ name:'smoking', time:1000, loops:1 });

            if (pc.device.soundEnabled)
            {
                this.explosionSound = pc.device.loader.get('explosion').resource;
                this.explosionSound.setVolume(0.8);
            }

            this.encouragements =
                ['Nice job!', 'Wow', "I wouldn't want to be an asteroid right now", 'Kapingo!',
                'Boom! Roidshot!', "SMASH!", 'Another one bites the moondust', 'YUM!', 'Do you ever miss?'];
        },

        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {
        },

        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            if ((entityB.hasTag('ASTEROID') || entityB.hasTag('ASTEROID-SMALL')) && entityA.hasTag('BULLET'))
            {
                // halt the bullet, turning off collision detection as well, then remove it
                entityA.getComponent('physics').setCollisionMask(0);
                entityA.getComponent('physics').setLinearVelocity(0, 0);
                entityA.remove();

                this.explosionSound.play(false);

                // change the asteroid (entityB in this case)
                if (!entityB.hasComponentOfType('expiry'))
                {
                    entityA.layer.scene.asteroidsLeft--;
                    entityB.getComponent('physics').setCollisionMask(0);
                    entityB.getComponent('physics').setLinearVelocity(0, 0);

                    // switch the asteroid sprite into a smoke explosion
                    entityB.getComponent('sprite').sprite.setSpriteSheet(this.smokeSheet);
                    entityB.addComponent(pc.components.Expiry.create({ lifetime:2500 }));

                    // if a big asteroid is blowing up, then spawn some little asteroids
                    if (entityB.hasTag('ASTEROID'))
                    {
                        var sp = entityB.getComponent('spatial');
                        var count = 3;//pc.Math.rand(2, 5);
                        for (var i = 0; i < count; i++)
                        {
                            var addX = 0;
                            var addY = 0;
                            if (sp.pos.x < sp.dim.x) addX += sp.dim.x + 1;
                            if (sp.pos.y < sp.dim.y) addY += sp.dim.y + 1;
                            if (sp.pos.x > pc.device.canvasWidth - sp.dim.x) addX = -sp.dim.x + 1;
                            if (sp.pos.y > pc.device.canvasHeight - sp.dim.y) addY = -sp.dim.y + 1;
                            this.layer.scene.createEntity('asteroid-small', this.layer, sp.pos.x + addX, sp.pos.y + addY);
                        }

                        entityA.layer.scene.asteroidsLeft += count;
                    }
                }

                entityA.layer.scene.leftCounter.getComponent('text').text[0] = 'Asteroids Left: ' + entityA.layer.scene.asteroidsLeft;
                entityA.layer.scene.displayText(this.encouragements[pc.Math.rand(0, this.encouragements.length-1)]);
            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        }

    });


CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004 // 0000100
};


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        entityFactory:null,
        player:null,
        playerPhysics:null,
        playerSpatial:null,
        engine:null,
        asteroidsLeft:0,
        leftCounter:null,
        level:0,

        starsLayer:null,
        nebulaLayer:null,
        gameLayer:null,
        uiLayer:null,
        asteroidSheet:null,
        smallAsteroidSheet:null,
        playerSheet:null,
        plasmaFireSheet:null,
        explosionSheet:null,
        music:null,
        musicPlaying:true,
        fireSound:null,

        init:function ()
        {
            this._super();

            // start the music
            if (pc.device.soundEnabled)
            {
                this.fireSound = pc.device.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
                this.music = pc.device.loader.get('music1').resource;
                this.music.setVolume(0.2);
//                this.music.play(true);
                this.musicPlaying = true;
            }

            // setup the sprites used in the game scene
            this.asteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid1').resource, useRotation:true, frameWidth:64, frameHeight:64 });
            this.asteroidSheet.addAnimation({ name:'floating', time:500, frameCount:20 });

            this.smallAsteroidSheet = new pc.SpriteSheet({ image:pc.device.loader.get('asteroid-small').resource, useRotation:true, frameWidth:24, frameHeight:24 });
            this.smallAsteroidSheet.addAnimation({ name:'floating', time:500, frameCount:20 });

            this.playerSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('player-ship').resource, frameWidth:40, frameHeight:40, useRotation:true});
            this.playerSheet.addAnimation({ name:'floating', frameCount:1});

            this.plasmaFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('plasma-fire').resource, frameWidth:30, frameHeight:30 });
            this.plasmaFireSheet.addAnimation({ name:'floating', time:400, dirAcross:true });

            this.explosionSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('explosions').resource,
                    frameWidth:24, frameHeight:24, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'exploding', frameY:3, framesCount:16, time:1600, loops:1 });

            //-----------------------------------------------------------------------------
            // stars layer
            //-----------------------------------------------------------------------------
            this.starSheet = new pc.SpriteSheet({  image:pc.device.loader.get('stars').resource, frameWidth:512, frameHeight:512 });
            var tileMap = new pc.TileMap(new pc.TileSet(this.starSheet),
                2 + (pc.device.canvasWidth / this.starSheet.frameWidth),
                2 + (pc.device.canvasHeight / this.starSheet.frameHeight),
                this.starSheet.frameHeight, this.starSheet.frameHeight);
            tileMap.generate(0);
            tileMap.setTile(1, 0, 1);
            this.starsLayer = this.addLayer(new pc.TileLayer('star layer', false, tileMap));

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            // fire up the systems we need for the game layer
            this.gameLayer.addSystem(new GamePhysics({ gravity:{ x:0, y:0 }, debug:false }));
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            // setup the starting entities
            this.player = this.createEntity('player', this.gameLayer,
                (this.gameLayer.scene.viewPort.w / 2)-24, (this.gameLayer.scene.viewPort.h / 2)-24, 0);
            this.engine = this.createEntity('engine', this.gameLayer,
                this.gameLayer.scene.viewPort.w / 2, this.gameLayer.scene.viewPort.h / 2, 0, this.player);
            this.playerPhysics = this.player.getComponent('physics');
            this.playerSpatial = this.player.getComponent('spatial');

            // create some boundary walls on the edges of the screen
            this.createWall(this.gameLayer, 0, 0, 1, pc.device.canvasHeight); // left
            this.createWall(this.gameLayer, 0, 0, pc.device.canvasWidth, 1); // top
            this.createWall(this.gameLayer, pc.device.canvasWidth, 0, 1, pc.device.canvasHeight); // right
            this.createWall(this.gameLayer, 0, pc.device.canvasHeight, pc.device.canvasWidth, 1); // bottom

            // create some asteroids
            this.newLevel();

            this.createEntity('instructions', this.gameLayer);
            this.createLevelAlert(this.gameLayer, 1);
            this.createLeftCounter();

            // setup the controls
            pc.device.input.bindState(this, 'turning right', 'D');
            pc.device.input.bindState(this, 'turning right', 'RIGHT');
            pc.device.input.bindState(this, 'turning left', 'A');
            pc.device.input.bindState(this, 'turning left', 'LEFT');
            pc.device.input.bindState(this, 'thrusting', 'W');
            pc.device.input.bindState(this, 'thrusting', 'UP');
            pc.device.input.bindState(this, 'reversing', 'S');
            pc.device.input.bindState(this, 'reversing', 'DOWN');
            pc.device.input.bindState(this, 'firing', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindState(this, 'firing', 'SPACE');
            pc.device.input.bindAction(this, 'toggle debug', 'F');
            pc.device.input.bindAction(this, 'toggle music', 'M');
        },

        displayText:function (s)
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1000, holdTime:1000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#e65cba', text:[s], fontHeight:20 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{left:30 }}));
        },

        createEntity:function (type, layer, x, y, dir, attachTo)
        {
            var e = null;

            switch (type)
            {
                case 'asteroid-small':
                    e = pc.Entity.create(layer);
                    e.addTag('ASTEROID-SMALL');

                    e.addComponent(pc.components.Sprite.create(
                        {
                            currentFrame:pc.Math.rand(0, 10),
                            animSpeedOffset:pc.Math.rand(500, 1000),
                            spriteSheet:this.smallAsteroidSheet, animationStart:'floating'
                        }));
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x, y:y,
                            dir:pc.Math.rand(0, 359),
                            w:this.smallAsteroidSheet.frameWidth,
                            h:this.smallAsteroidSheet.frameHeight
                        }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            force:25,
                            mass:2,
                            bounce:1,
                            shapes:[{shape:pc.CollisionShape.CIRCLE}],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                        }));

                    return e;

                case 'asteroid':
                    e = pc.Entity.create(layer);
                    e.addTag('ASTEROID');

                    // pick a random spot for the asteroid, but make sure it's not near the center
                    var x1 = 0;
                    var y1 = 0;
                    do
                    {
                        x1 = pc.Math.rand(50, pc.device.canvasWidth - 50);
                        y1 = pc.Math.rand(50, pc.device.canvasHeight - 50);

                    } while (pc.Math.isPointInRect(x1, y1, (pc.device.canvasWidth / 2) - 100, (pc.device.canvasHeight / 2) - 100, 200, 200));

                    e.addComponent(pc.components.Sprite.create(
                        {
                            currentFrame:pc.Math.rand(0, 10),
                            animSpeedOffset:pc.Math.rand(500, 1000),
                            spriteSheet:this.asteroidSheet, animationStart:'floating'
                        }));
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x1, y:y1,
                            dir:pc.Math.rand(0, 359),
                            w:this.asteroidSheet.frameWidth,
                            h:this.asteroidSheet.frameHeight
                        }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            impulse:35,
                            mass:10,
                            bounce:1,
                            shapes:[ {shape:pc.CollisionShape.CIRCLE} ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                        }));

                    return e;

                case 'player':
                    e = pc.Entity.create(layer);
                    e.addTag('PLAYER');

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.playerSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.playerSheet.frameWidth, h:this.playerSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:50, y:50},
                            linearDamping:0.1,
                            mass:20,
                            shapes:[
                                {
                                    shape:pc.CollisionShape.CIRCLE
                                }
                            ],
                            collisionCategory:CollisionType.FRIENDLY,
                            collisionMask:CollisionType.ENEMY
                        }));
                    return e;

                case 'engine':
                    // attach the engine emitter (it's an entity so it can be attached to the back of the ship)
                    var engine = pc.Entity.create(layer);
                    engine.addComponent(pc.components.Spatial.create({ dir:dir, w:20, h:20}));
                    engine.addComponent(pc.components.Physics.create({ shapes:[ { shape:pc.CollisionShape.CIRCLE } ] }));
                    engine.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.explosionSheet,
                            burst:1,
                            delay:20,
                            thrustMin:8, thrustMax:8,
                            thrustTime:100,
                            lifeMin:400,
                            fadeOutTime:400,
                            spinMin:65,
                            rotateSprite:true,
                            emitting:true
                        }));

                    engine.addComponent(pc.components.Joint.create(
                        {
                            attachedTo:attachTo,
                            type:pc.JointType.REVOLUTE,
                            offset:{x:-15, y:0}
                        }));

                    return engine;

                case 'plasmaFire':
                    e = pc.Entity.create(layer);

                    e.addTag('BULLET');
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.plasmaFireSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Expiry.create({ lifetime:3000 }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.plasmaFireSheet.frameWidth, h:this.plasmaFireSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:80, y:80},
                            force:80,
                            shapes:[ { offset:{w:-25}, shape:pc.CollisionShape.CIRCLE } ],
                            collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY
                        }));

                    return e;

                case 'instructions':
                    e = pc.Entity.create(layer);
                    e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
                    e.addComponent(pc.components.Fade.create({ startDelay:1000, fadeInTime:3500, holdTime:3000, fadeOutTime:1500 }));
                    e.addComponent(pc.components.Text.create({ text:['Arrow keys=move', 'Space=fire', 'F9=toggle debug', 'F11=toggle music'], lineWidth:0,
                        fontHeight:14, offset:{x:25, y:-65} }));
                    e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:85 }));
                    e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'right', margin:{ right:80 } }));

                    return e;
            }

            return null;
        },

        createWall:function (layer, x, y, w, h)
        {
            var e = pc.Entity.create(layer);
            e.addTag('WALL');
            e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, w:w, h:h }));
            e.addComponent(pc.components.Physics.create({ immovable:true,
                collisionCategory:CollisionType.ENEMY, collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));
        },

        createLevelAlert:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#666666', text:['Level ' + this.level], lineWidth:2,
                fontHeight:44 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:60 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:80, left:80 } }));
        },

        createLeftCounter:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Asteroids Left: ' + this.asteroidsLeft],
                lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{ top:30, left:30 } }));
            this.leftCounter = e;
        },

        createLevelComplete:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Level Complete'],
                lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'center' }));
        },

        newLevel:function ()
        {
            this.level++;
            var count = 2 + (this.level * 2);
            for (var i = 0; i < count; i++)
                this.createEntity('asteroid', this.gameLayer);
            this.asteroidsLeft += count;
        },

        onAction:function (actionName, event, pos)
        {
            if (actionName === 'toggle debug')
            {
                var ph = this.gameLayer.getSystemsByComponentType('physics').first.object();
                ph.setDebug(!ph.debug);
            }

            if (actionName === 'toggle music')
            {
                if (this.musicPlaying)
                {
                    this.music.stop();
                    this.musicPlaying = false;
                } else
                {
                    this.music.play();
                    this.musicPlaying = true;
                }
            }
        },

        lastFireTime:0,
        fireDelay:150,

        process:function ()
        {
            if (!pc.device.loader.finished) return;
            if (!this.asteroidsLeft)
            {
                // end the level
                this.createLevelComplete();
                this.newLevel();
                this.createLevelAlert();
            }

            if (pc.device.input.isInputState(this, 'turning left'))
                this.playerPhysics.applyTurn(-40);
            if (pc.device.input.isInputState(this, 'turning right'))
                this.playerPhysics.applyTurn(40);

            if (!(pc.device.input.isInputState(this, 'turning left')) && !(pc.device.input.isInputState(this, 'turning right')))
                this.playerPhysics.applyTurn(0);

            if (pc.device.input.isInputState(this, 'thrusting'))
            {
                this.playerPhysics.applyForce(10);
                this.engine.getComponent('emitter').emitting = true;
            } else
            {
                this.engine.getComponent('emitter').emitting = false;
            }

            if (pc.device.input.isInputState(this, 'reversing'))
                this.playerPhysics.applyForce(-10);

            if (pc.device.input.isInputState(this, 'firing'))
            {
                var sinceLastFire = pc.device.now - this.lastFireTime;
                if (sinceLastFire > this.fireDelay)
                {
                    this.fireSound.play(false);
                    var tc = this.playerSpatial.getCenterPos();
                    tc.subtract(15, 15);
                    tc.moveInDir(this.playerSpatial.dir, 20);
                    this.createEntity('plasmaFire', this.gameLayer, tc.x, tc.y, this.playerSpatial.dir);
                    this.lastFireTime = pc.device.now;
                }
            }

            this._super();
        }
    });


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
            pc.device.loader.add(new pc.Image('player-ship', 'images/ship1.png'));
            pc.device.loader.add(new pc.Image('stars', 'images/stars.png'));
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
            ctx.fillText('Asteroids', 40, (pc.device.canvasHeight / 2) - 50);
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


