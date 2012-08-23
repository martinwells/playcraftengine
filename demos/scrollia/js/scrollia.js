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

PlayerState =
{
    NONE:0,
    STANDING:1,
    WALKING:2,
    JUMPING:3,
    ATTACKING:4,
    BLOCKING:5
};

ZombieBrain = pc.components.Component('ZombieBrain',
    { },
    {
        init:function ()
        {
            this._super(this.Class.shortName);
            this.stateChangeDelay = pc.Math.rand(2000, 3000);
            this.facingRight = pc.Math.rand(0,1) ? true : false;
        },

        stateChangeDelay:5000, // how long before deciding to do something different
        stateStartTime: 0, // time zombie started this state
        facingRight: false
    });

ZombieBrainSystem = pc.EntitySystem.extend('ZombieBrainSystem',
    {},
    {
        init:function ()
        {
            this._super([ 'zombiebrain' ]);
        },

        process: function(entity)
        {
            var brain = entity.getComponent('zombiebrain');
            var physics = entity.getComponent('physics');

            // is the player close?

            // walk towards, or attack if close enough

            // am I near an edge? if so, turn around

            // otherwise, do something
            if (pc.device.now - brain.stateStartTime > brain.stateChangeDelay)
            {
                // pick a new action
                this.collided(entity);
                brain.stateStartTime = pc.device.now;
            }

            if (brain.facingRight)
                physics.applyForce(1, 0);
            else
                physics.applyForce(1, 180);


        },

        collided: function(entity)
        {
            // turn around
            var brain = entity.getComponent('zombiebrain');
            brain.facingRight = !brain.facingRight;

            var sprite = entity.getComponent('sprite');
            sprite.sprite.setAnimation('walking ' + (brain.facingRight ? 'right' : 'left'), 0, false);
        }

    });


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        backgroundLayer:null,
        gameLayer:null,
        bgLayer: null,
        tileLayer:null,
        overlayLayer:null,
        level:1,
        entityFactory:null,
        player:null,
        playerPhysics:null,
        playerSprite:null,
        playerSpatial:null,
        music: null,

        init:function ()
        {
            this._super();

            if (pc.device.soundEnabled)
            {
//                this.music = pc.device.loader.get('music1').resource;
//                this.music.setVolume(2);
//                this.music.play(true);
            }

            this.entityFactory = new EntityFactory();

            //-----------------------------------------------------------------------------
            // sprite sheet setup
            //-----------------------------------------------------------------------------

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.loadFromTMX(pc.device.loader.get('start').resource, this.entityFactory);

            this.bgEntityLayer = this.get('backgroundEntity');
            this.bgEntityLayer.setZIndex(2);
            this.bgLayer = this.get('background');
            this.bgLayer.setZIndex(9);
            this.tileLayer = this.get('tiles');
            this.tileLayer.setZIndex(10);
            this.overlayLayer = this.get('overlay');
            this.overlayLayer.setZIndex(13);
            this.bgEntityLayer.addSystem(new pc.systems.Render());

            var layer = this.activeLayers.first;
            while (layer)
            {
                console.log(layer.object().name);
                layer = layer.next();
            }

            // generate the shadow background map
//            this.generateBackgroundLayer(this.tileLayer);
            this.gameLayer = this.get('entity');
            this.gameLayer.setZIndex(20);

            // setup origin tracking (these layers will maintain an origin linked to the main game layer)
            this.tileLayer.setOriginTrack(this.gameLayer);
            this.overlayLayer.setOriginTrack(this.gameLayer);
            this.bgLayer.setOriginTrack(this.gameLayer);
            this.bgEntityLayer.setOriginTrack(this.gameLayer);

            // get the player entity
            this.player = this.gameLayer.entityManager.getTagged('PLAYER').first.object();
            this.player.facingRight = true;
            this.playerPhysics = this.player.getComponent('physics');
            this.playerSprite = this.player.getComponent('sprite');
            this.playerSpatial = this.player.getComponent('spatial');

            this.playerPhysics.setDir(0);

            // fire up the systems we need for the game layer
            this.gameLayer.addSystem(new GamePhysics(
                {
                    gravity:{ x:0, y:70 },
                    debug:false,
                    tileCollisionMap:{
                        tileMap:this.tileLayer.tileMap,
                        collisionCategory:CollisionType.FRIENDLY,
                        collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                    }
                }));

            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());
            this.gameLayer.addSystem(new ZombieBrainSystem());

            pc.device.input.bindState(this, 'moving right', 'D');
            pc.device.input.bindState(this, 'moving right', 'TOUCH');
            pc.device.input.bindState(this, 'moving right', 'RIGHT');
            pc.device.input.bindState(this, 'moving left', 'A');
            pc.device.input.bindState(this, 'moving left', 'LEFT');
            pc.device.input.bindState(this, 'jumping', 'W');
            pc.device.input.bindState(this, 'jumping', 'UP');
            pc.device.input.bindState(this, 'blocking', 'S');
            pc.device.input.bindState(this, 'blocking', 'DOWN');
            pc.device.input.bindState(this, 'attacking', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindState(this, 'attacking', 'SPACE');
        },

        generateBackgroundLayer:function (tileLayer)
        {
            // Dark background

            // create a massive background tile layer with the darkened tiles
            // we do this for speed (so we can use big blocks of tiles rather than smaller ones
            // which would leave the entire game screen filled with tiles

            var tw = tileLayer.tileSpriteSheet.frameWidth;
            var th = tileLayer.tileSpriteSheet.frameHeight;

            // generate a big chunky tile from the smaller ones
            var bgCanvas = document.createElement('canvas');
            bgCanvas.width = tw * 8;
            bgCanvas.height = th * 8;
            var ctx = bgCanvas.getContext('2d');

            // draw lots of tiles on it
            for (var y = 0; y < 8; y++)
                for (var x = 0; x < 8; x++)
                    tileLayer.tileSpriteSheet.drawFrame(ctx, 0, 0, x * tw, y * th);

            // draw an alpha layer over the top to make it dark and spooky; well dark at least
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

            // create the background tile map
            var bgTileMap = new pc.TileMap((tileLayer.tileMap.tilesWide / 8) + 1, (tileLayer.tileMap.tilesHigh / 8) + 1, tw * 8, th * 8);
            bgTileMap.generate(0);

            var bgLayer = new pc.TileLayer('background tiles',
                new pc.SpriteSheet({ image:new pc.CanvasImage(bgCanvas) }), false,
                bgTileMap);
            bgLayer.setZIndex(0);
            this.addLayer(bgLayer);
        },

        /**
         * State machine design thoughts
         *
         * create a BehaviorSystem
         * add BehaviorComponents, which contains behaviors and transitions
         * feed input states and animations to the tree? wow, how cool would that be!
         * You can set out the behavior of actors using a set of states PlayerFSM, MonsterFSM etc
         */

        playerState:0,

        process:function ()
        {
            if (!pc.device.loader.finished) return;

            //
            // PLAYER
            //
            // set the game layer's origin to center on the player, the other layers are set to track this one
            this.gameLayer.setOrigin(
                this.playerSpatial.getCenterPos().x - (this.viewPort.w / 2),
                this.playerSpatial.getCenterPos().y - (this.viewPort.h / 2));

            //
            // Player state -- based on movement
            //

            // if we are attacking, then change states once the animation is done
            if (this.playerState == PlayerState.ATTACKING)
            {
                if (this.playerSprite.sprite.loopCount == 1)
                {
                    // need a change state function so we flip to standing anim properly
                    this.playerState = PlayerState.NONE;
                }
            }

            if (this.playerState != PlayerState.ATTACKING && this.playerState != PlayerState.JUMPING)
            {
                var xVel = this.playerPhysics.getLinearVelocity().x;
                var yVel = this.playerPhysics.getLinearVelocity().y;

                // if we are moving vertically, then we're jumping (or falling)
                if (!this.player.onGround)
                {
                    if (this.playerState != PlayerState.JUMPING && Math.abs(yVel) > 60)
                    {
                        this.playerState = PlayerState.JUMPING;
                        this.playerSprite.sprite.setAnimation('jumping ' + (this.player.facingRight ? 'right':'left'), 0, false);
                    }
                }

                // otherwise, if there's enough horizontal movement, we are walking
                else if (Math.abs(xVel) > 3 &&
                    (this.playerPhysics.getVelocityAngle() == 0 || this.playerPhysics.getVelocityAngle() == 180))
                {
                    if (this.playerState != PlayerState.WALKING)
                        this.playerState = PlayerState.WALKING;

                    this.playerSprite.sprite.setAnimation('walking ' + (this.player.facingRight ? 'right' : 'left'), 0, false);
                }

                // otherwise, we're standing
                else if (this.playerState != PlayerState.STANDING)
                {
                    this.playerState = PlayerState.STANDING;
                    this.playerSprite.sprite.setAnimation('standing ' + (this.player.facingRight ? 'right' : 'left'), 0, false);
                }
            }

            //
            // Input handling
            //
            if (pc.device.input.isInputState(this, 'attacking'))
            {
                this.playerState = PlayerState.ATTACKING;
                this.playerSprite.sprite.setAnimation('attacking ' + (this.player.facingRight ? 'right' : 'left'), 0, false);
            }

            if (pc.device.input.isInputState(this, 'moving left'))// && this.playerPhysics.getLinearVelocity().x > -30)
            {
                this.player.facingRight = false;
                this.playerPhysics.applyForce(2, 180);
            }

            if (pc.device.input.isInputState(this, 'moving right'))// && this.playerPhysics.getLinearVelocity().x < 30)
            {
                this.player.facingRight = true;
                this.playerPhysics.applyForce(2, 0);
            }

            if (pc.device.input.isInputState(this, 'jumping') && this.playerState != PlayerState.JUMPING && this.player.onGround)
            {
                if (this.player.facingRight)
                    this.playerPhysics.applyForce(58, 325);
                else
                    this.playerPhysics.applyForce(58, 215);
            }

            pc.device.ctx.fillStyle = '#000';
            pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            this._super();
        }

    });


TriggerSystem = pc.Base.extend('Triggers',
    {},
    {
        onTriggerStart:function (triggerName)
        {
            switch (triggerName)
            {
                case 'earthquake':
                    break;
            }
        },

        onTrigger:function (triggerName)
        {
            switch (triggerName)
            {
                case 'firetrap':
            }
        },

        onTriggerEnd:function (triggerName)
        {
            switch (triggerName)
            {
                case 'firetrap':
            }
        }
    });

GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {
        },

        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            if (aType == pc.BodyType.ENTITY && entityA.hasTag('player') && bType == pc.BodyType.TILE && fixtureAType == 1 &&
                !entityA.layer.scene.player.onGround)
            {
                var scene = entityA.layer.scene;
                scene.playerState = PlayerState.STANDING;
                scene.playerSprite.sprite.setAnimation('standing ' +
                    (scene.player.facingRight?'right':'left'), 0, false);
                scene.playerPhysics.applyForce(scene.playerPhysics.getLinearVelocity().x, scene.player.facingRight ? 0 : 180);
                scene.player.onGround = true;
            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            if (aType == pc.BodyType.ENTITY && entityA.hasTag('player') && bType == pc.BodyType.TILE && fixtureAType == 1 &&
                entityA.layer.scene.player.onGround)
                entityA.layer.scene.player.onGround = false;
        }
    });

EntityFactory = pc.EntityFactory.extend('EntityFactory',
    { },
    {
        playerSheet:null,
        zombieSheet:null,

        init:function ()
        {
            // setup sprites
            this.playerSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('player').resource, frameWidth:80, frameHeight:72, useRotation:false });

            this.playerSheet.addAnimation({ name:'standing right', frameX:1, frameY:4, offsetX:15, offsetY:-11, frameCount:15, time:900 });
            this.playerSheet.addAnimation({ name:'standing left', frameX:1, frameY:4, offsetX:25, offsetY:-11, frameCount:15, time:900, scaleX:-1});
            this.playerSheet.addAnimation({ name:'walking right', frameCount:16, offsetX:15, offsetY:-11, time:500 });
            this.playerSheet.addAnimation({ name:'walking left', frameCount:16, offsetX:25, offsetY:-11, scaleX:-1, time:500 });
            this.playerSheet.addAnimation({ name:'jumping right', frameCount:1, frameX:3, frameY:3, offsetX:15, offsetY:-11, time:500 });
            this.playerSheet.addAnimation({ name:'jumping left', frameCount:1, frameX:3, frameY:3, offsetX:25, offsetY:-11, scaleX:-1, time:300 });

            this.playerSheet.addAnimation({ name:'attacking right',
                frames: [ [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [0, 3], [1, 3], [2, 3], [0, 8], [1, 8] ],
                offsetX:10, offsetY:-11, time:500, loops:1 });
            this.playerSheet.addAnimation({ name:'attacking left',
                frames:[ [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [0, 3], [1, 3], [2, 3], [0, 8], [1, 8] ],
                frameY:2, scaleX:-1, offsetX:25, offsetY:-11, time:500, loops:1 });

            this.playerSheet.addAnimation({ name:'dying right', frameCount:16, frameX:0, frameY:6, offsetX:10, offsetY:-11, time:5000, loops:1 });
            this.playerSheet.addAnimation({ name:'dying left', frameCount:16, frameX:0, frameY:6, offsetX:10, offsetY:-11, time:5000, scaleX:-1, loops:1 });

            this.zombieSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('zombie').resource, frameWidth:80, frameHeight:72, useRotation:false });

            this.zombieSheet.addAnimation({ name:'standing right', frameX:0, frameY:4, offsetX:15, offsetY:-11, frameCount:11, time:1900 });
            this.zombieSheet.addAnimation({ name:'standing left', frameX:0, frameY:4, offsetX:25, offsetY:-11, frameCount:11, time:1900, scaleX:-1});
            this.zombieSheet.addAnimation({ name:'walking right', frameCount:16, offsetX:15, offsetY:-11, time:1400 });
            this.zombieSheet.addAnimation({ name:'walking left', frameCount:16, offsetX:25, offsetY:-11, scaleX:-1, time:1400 });
            this.zombieSheet.addAnimation({ name:'jumping right', frameCount:1, frameX:3, frameY:3, offsetX:15, offsetY:-11, time:500 });
            this.zombieSheet.addAnimation({ name:'jumping left', frameCount:1, frameX:3, frameY:3, offsetX:25, offsetY:-11, scaleX:-1, time:300 });
            this.zombieSheet.addAnimation({ name:'attacking right', frameCount:11, frameY:2, offsetX:10, offsetY:-11, time:700, loops:1 });
            this.zombieSheet.addAnimation({ name:'attacking left', frameCount:11, frameY:2, scaleX:-1, offsetX:25, offsetY:-11, time:700, loops:1 });

            this.zombieSheet.addAnimation({ name:'dying right', frameCount:15, frameX:3, frameY:5, offsetX:10, offsetY:-11, time:700, loops:0 });
            this.zombieSheet.addAnimation({ name:'dying left', frameCount:15, frameX:3, frameY:5, offsetX:10, offsetY:-11, time:700, scaleX:-1, loops:0 });
        },

        createEntity:function (layer, type, x, y, w, h, options)
        {
            var e = null;

            switch (type)
            {
                case 'player':
                    e = pc.Entity.create(layer);
                    e.addTag('PLAYER');

                    e.addComponent(pc.components.Sprite.create(
                        {
                            spriteSheet:this.playerSheet,
                            animationStart:'standing right'
                        }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.playerSheet.frameWidth, h:this.playerSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:24, y:150},
                            friction: 0.1,
                            fixedRotation:true,
                            bounce:0,
                            mass:0.8,
                            shapes:[
                                // upper torso/head
                                { type:0, offset:{y:-20, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // middle torso
                                { type:0, offset:{y:-3, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // leg area
                                { type:0, offset:{y:12, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // feet
                                { type:1, sensorOnly:true, shape:pc.CollisionShape.RECT, offset:{x:6, y:100, w:-62, h:-25} }
                            ],

                            collisionCategory:CollisionType.FRIENDLY,
                            collisionMask:CollisionType.FRIENDLY
                        }));

                    return e;

                case 'zombie':
                    e = pc.Entity.create(layer);
                    e.addTag('ENEMY');

                    e.addComponent(pc.components.Sprite.create(
                        {
                            spriteSheet:this.zombieSheet,
                            animationStart:'standing left',
                            animationStartDelay: pc.Math.rand(0, 300)

                        }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.zombieSheet.frameWidth, h:this.zombieSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:3, y:150},
                            friction:0.1,
                            fixedRotation:true,
                            bounce:0,
                            mass:0.8,
                            shapes:[ { shape:pc.CollisionShape.RECT, offset:{x:6, y:100, w:-62, h:-25} } ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY
                        }));
                    e.addComponent(ZombieBrain.create());

                    return e;

                case 'cavernBackdrop':
                    // NOTE: origin shifter adjusts an entities position based on the origin of the layer, including a ratio
                    // an origin within an origin (if you know what I mean)
                    var backdrop = pc.Entity.create(layer);
                    var backdropSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cavern-backdrop').resource });
                    backdrop.addComponent(pc.components.Sprite.create({ spriteSheet: backdropSheet }));
                    backdrop.addComponent(pc.components.Spatial.create({ dir:0, x:x-200, y:y-100,
                        w:backdropSheet.frameWidth, h:backdropSheet.frameHeight }));
                    backdrop.addComponent(pc.components.OriginShifter.create({ ratio: 0.3 }));

                    var backdrop2 = pc.Entity.create(layer);
                    backdrop2.addComponent(pc.components.Sprite.create({ spriteSheet:backdropSheet }));
                    backdrop2.addComponent(pc.components.Spatial.create({ dir:0, x:x+(backdropSheet.frameWidth-201), y:y-100,
                        w:backdropSheet.frameWidth, h:backdropSheet.frameHeight }));
                    backdrop2.addComponent(pc.components.OriginShifter.create({ ratio:0.3 }));
//
                    // window
                    e = pc.Entity.create(layer);
                    var backdropWindowSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cavern-window').resource });
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:backdropWindowSheet }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, x:x, y:y,
                        w:backdropWindowSheet.frameWidth, h:backdropWindowSheet.frameHeight }));
                    e.addComponent(pc.components.OriginShifter.create({ ratio:0.2 }));

                    // make the backdrop clip to within the boundary of the window
                    backdrop.addComponent(pc.components.Clip.create({ entity: e, x:1, y:1 }));
                    backdrop2.addComponent(pc.components.Clip.create({ entity:e, x:1, y:1, w: -20}));

                    return e;

                case 'lightrays':
                    // NOTE: origin shifter adjusts an entities position based on the origin of the layer, including a ratio
                    // an origin within an origin (if you know what I mean)
                    e = pc.Entity.create(layer);
                    var lightraysSheet = new pc.SpriteSheet({ image:pc.device.loader.get('lightrays').resource });
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:lightraysSheet }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, x:x, y:y,
                        w:lightraysSheet.frameWidth, h:lightraysSheet.frameHeight }));
            }
        }
    });

TheGame = pc.Game.extend('TheGame',
    {},
    {
        gameScene:null,

        onReady:function ()
        {
            this._super();

            // load resources
            pc.device.loader.setBaseUrl('/demos/scrollia/');
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('cave', 'images/tiles.png'));
            pc.device.loader.add(new pc.Image('player', 'images/armsman.png'));
            pc.device.loader.add(new pc.Image('zombie', 'images/zombie.png'));
            pc.device.loader.add(new pc.Image('cavern-backdrop', 'images/cavern_backdrop.png'));
            pc.device.loader.add(new pc.Image('cavern-window', 'images/cavern_window.png'));
            pc.device.loader.add(new pc.Image('zombie', 'images/zombie.png'));
            pc.device.loader.add(new pc.Image('lightrays', 'images/lightRays_window.png'));
            pc.device.loader.add(new pc.DataResource('start', 'data/level1.tmx'));
            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));

            if (pc.device.soundEnabled)
            {
//                pc.device.loader.add(new pc.Sound('music1', 'images/marsh', ['ogg', 'mp3'], 1));
            }
        },

        onLoading:function (percentageComplete)
        {
            // draw title screen -- with loading bar
        },

        onLoaded:function ()
        {
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }

    });


