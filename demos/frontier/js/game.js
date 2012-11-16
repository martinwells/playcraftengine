/**
 * HyperGate -- game.js
 */



NavigationSystem = pc.EntitySystem.extend('NavigationSystem',
    {},
    {
        init:function ()
        {
            this._super(['targeting']);
        },

        process:function (entity)
        {
            var brain = entity.getComponent('targeting');
            var ph = entity.getComponent('physics');

            if (pc.device.now - brain._lastTurnTime > brain.timeBetweenTurns)
            {
                ph.applyTurn(pc.Math.rand(-15, 15));
                ph.applyForce(20);
                brain._lastTurnTime = pc.device.now;


            }
        }

    });

BirdBrain = pc.components.Component.extend('BirdBrain',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        timeBetweenTurns:0,
        _lastTurnTime:0,

        init:function (options)
        {
            this._super('targeting');
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.timeBetweenTurns = pc.checked(options.timeBetweenTurns, 100);
            this._lastTurnTime = 0;
        }

    });


GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        init:function (options)
        {
            this._super(options);
        },

        onEntityCollision:function (entity, force)
        {
        },

        onEntityCollisionStart:function (entity)
        {
            //entity.addComponent( pc.components.Fade.create({ fadeOutTime: 500 }) );
            if (entity.hasTag('BULLET'))
                entity.remove();
        },

        onEntityCollisionEnd:function (collision)
        {
        }


    });


CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004      // 0000100
};

EntityFactory = pc.EntityFactory.extend('EntityFactory',
    { },
    {
        enemySheet:null,
        turretSmallSheet:null,
        turretLargeSheet:null,
        cruiserSheet:null,
        bulletFireSheet:null,
        shellFire:null,
        plasmaFireSheet:null,
        smokeSheet:null,

        init:function ()
        {
            // setup sprites
            // todo: move the spritesheets into some kind of setup/templating system for entities
            this.enemySheet = new pc.SpriteSheet({ image:pc.device.loader.get('enemy-ship').resource, frameWidth:48, frameHeight:48 });
            this.enemySheet.addAnimationWithDirections('floating', 0, 3, [0], 16, 500, 0);
            this.enemySheet.addAnimationWithDirections('turning_left', 0, 4, [0], 16, 500, 0);
            this.enemySheet.addAnimationWithDirections('turning_right', 0, 5, [0], 16, 500, 0);

            this.cruiserSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('player-ship').resource, frameWidth:192, frameHeight:192, useRotation:true});
            this.cruiserSheet.addAnimationWithDirections('floating', 0, 0, [0], 1, 250, 0);

            this.bulletFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('bullet-fire').resource, frameWidth:16, frameHeight:16, useRotation:true});
            this.bulletFireSheet.addAnimationWithDirections('floating', 0, 0, null, 1, 400, 0, true);

            this.shellFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('shell-fire').resource, frameWidth:32, frameHeight:32, useRotation:true});
            this.shellFireSheet.addAnimationWithDirections('floating', 0, 0, null, 1, 400, 0, true);

            this.plasmaFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('plasma-fire').resource, frameWidth:30, frameHeight:30 });
            this.plasmaFireSheet.addAnimationWithDirections('floating', 0, 0, null, 1, 400, 0, true);

            this.turretSmallSheet = new pc.SpriteSheet({ image:pc.device.loader.get('turret-small').resource, frameWidth:32, frameHeight:32, useRotation:true});
            this.turretSmallSheet.addAnimationWithDirections('floating', 0, 0, [0], 1, 0, 0);

            this.turretLargeSheet = new pc.SpriteSheet({ image:pc.device.loader.get('turret-large').resource, frameWidth:48, frameHeight:48, useRotation:true});
            this.turretLargeSheet.addAnimationWithDirections('floating', 0, 0, [0], 1, 0, 0);


            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource,
                    frameWidth:64, frameHeight:64, framesWide:16, framesHigh:8, useRotation:true});
            this.smokeSheet.addAnimation('explode', 0, 1, null, 800, 0);
        },

        createEntity:function (type, layer, x, y, dir, attachTo)
        {
            var e = null;

            switch (type)
            {
                case 'cruiser':
                    e = pc.Entity.create(layer);
                    e.addTag('PLAYER');

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.cruiserSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.cruiserSheet.frameWidth, h:this.cruiserSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:5,
                            margin:0,
                            shape:pc.CollisionShape.RECT,
                            category:CollisionType.ENEMY,
                            mask:CollisionType.FRIENDLY
                        }));

                    // create the turret entities and attach them to the cruiser
                    var turretOffsets = [
                        [16, 0],
                        // forward main gun
                        [-57, 0],
                        // aft main gun
                        [23, -36],
                        // port fore gun
                        [-56, -36],
                        // port aft gun
                        [23, 34],
                        // starboard fore gun
                        [-56, 34]    // starboard aft gun
                    ];
                    // TURRET 1 - Forward battery
                    for (var i = 0; i < 6; i++)
                    {
                        var tSheet = this.turretLargeSheet;
                        var tag1 = 'TURRETMAIN';
                        var tag2 = 'TURRET';

                        if (i > 1)
                        {
                            tSheet = this.turretSmallSheet;
                            var tag1 = 'TURRETSMALL';
                        }

                        var t = pc.Entity.create(layer);
                        t.addTag(tag1);
                        t.addTag(tag2);
                        t.addComponent(pc.components.Sprite.create({ spriteSheet:tSheet, animationStart:'floating' }));
                        t.addComponent(pc.components.Spatial.create({ dir:dir, w:tSheet.frameWidth, h:tSheet.frameHeight}));
                        t.addComponent(pc.components.Physics.create(
                            {
                                shape:pc.CollisionShape.CIRCLE,
                                category:CollisionType.ENEMY,
                                mask:CollisionType.FRIENDLY,
                                allowRotate:true
                            }));
                        t.addComponent(pc.components.Attachment.create(
                            {
                                attachedTo:e,
                                type:pc.AttachmentType.REVOLUTE,
                                offset:{x:turretOffsets[i][0], y:turretOffsets[i][1]}
                            }));
                    }
                    return e;

                case 'enemy':
                    e = pc.Entity.create(layer);

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.enemySheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.enemySheet.frameWidth, h:this.enemySheet.frameHeight}));
                    return e;

                case 'bulletFire':
                    e = pc.Entity.create(layer);
                    e.addTag('BULLET');
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.bulletFireSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Health.create(10));
                    e.addComponent(pc.components.Expiry.create({ lifetime:1250 + pc.Math.rand(-250, 250)}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir + pc.Math.rand(-5, 5),
                        w:this.bulletFireSheet.frameWidth, h:this.bulletFireSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:50,
                            force:40 + pc.Math.rand(-5, 5),
                            margin:5,
                            category:CollisionType.ENEMY,
                            mask:CollisionType.FRIENDLY
                        }));

                    return e;

                case 'shellFire':
                    e = pc.Entity.create(layer);
                    e.addTag('BULLET');
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.shellFireSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Health.create(10));
                    e.addComponent(pc.components.Expiry.create({ lifetime:11250 + pc.Math.rand(-250, 250)}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir + pc.Math.rand(-5, 5),
                        w:this.shellFireSheet.frameWidth, h:this.shellFireSheet.frameHeight}));
                    e.addComponent(BirdBrain.create({ timeBetweenTurns: 100 }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:200,
                            force:5,
                            mass: 10,
                            margin:20,
                            category:CollisionType.ENEMY,
                            mask:CollisionType.FRIENDLY,
                            centerOfMass: { x: 0, y:0 }
                        }));

                    return e;

                case 'plasmaFire':
                    e = pc.Entity.create(layer);
                    e.addTag('BULLET');
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.plasmaFireSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Health.create(10));
                    e.addComponent(pc.components.Expiry.create({ lifetime:3000 }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.plasmaFireSheet.frameWidth, h:this.plasmaFireSheet.frameHeight}));


                    // e.addComponent(pc.components.ParticleEmitter.create(
                    //  {
                    //      spriteSheet: this.smokeSheet,
                    //      burst: 2,
                    //      delay: 15,
                    //      thrustMin:8, thrustMax: 12,
                    //      thrustTime: 200,
                    //      maxVelX: 3, maxVelY: 3,
                    //      angleMin: -110, angleMax: -70,
                    //      lifeMin: 3000,
                    //      fadeOutTime: 100,
                    //      gravityX: -0.03,
                    //      gravityY: 0.03,
                    //      rotateSprite: false
                    //  } ));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:50,
                            force:50,
                            margin:20,
                            category:CollisionType.ENEMY,
                            mask:CollisionType.FRIENDLY
                        }));

                    return e;

                case 'base':

                    for (i = 0; i < 25; i++)
                    {
                        e = pc.Entity.create(layer);
                        e.addTag('ENEMY');
                        e.addComponent(pc.components.Rect.create({ }));
                        e.addComponent(pc.components.Spatial.create({x:150 + (i * 100), y:400, dir:0, w:80, h:200 }));
                        e.addComponent(pc.components.Physics.create({ maxVelocity:{x:5, y:5}, mass:150, speed:0,
                            margin:0, category:CollisionType.FRIENDLY, mask:CollisionType.ENEMY | CollisionType.FRIENDLY,
                            shape:pc.CollisionShape.RECT}));

                    }

                    return e;

            }
        }

    });

GameScene = pc.Scene.extend('GameScene',
    { },
    {
        entityFactory:null,

        cruiser:null,
        cruiserPhysics:null,
        cruiserSpatial:null,
        turrets:null,
        turretBig:null,
        turretSmall:null,
        starsLayer:null,
        nebulaLayer:null,
        gameLayer:null,
        uiLayer:null,

        init:function ()
        {
            this._super();

            // fire up the systems
            this.entityFactory = new EntityFactory();

            this.muzzleFlashSheet = new pc.SpriteSheet({ image:pc.device.loader.get('muzzle-flash').resource, frameWidth:128, frameHeight:128, useRotation:true});

            // create the layers
            this.starsLayer = this.addLayer(new StarFieldLayer(0, 10000, 10000));
            this.nebulaLayer = this.addLayer(new StarFieldLayer(2, 10000, 10000));

            this.gameLayer = this.addLayer(new pc.EntityLayer('game', 10000, 10000));

            // fire up the systems we need for the game layer
            this.gameLayer.systemManager.add(new GamePhysics({ gravity:{ x:0, y:0 }, debug:false }));
            this.gameLayer.systemManager.add(new pc.systems.Render());
            this.gameLayer.systemManager.add(new pc.systems.Expiration());
            this.gameLayer.systemManager.add(new pc.systems.Effects());
            this.gameLayer.systemManager.add(new pc.systems.Particles());
            this.gameLayer.systemManager.add(new NavigationSystem());

            // create a test base to hit against
            this.entityFactory.createEntity('base', this.gameLayer);

            // setup the starting entities
            this.cruiser = this.entityFactory.createEntity('cruiser', this.gameLayer, 500, 700, 0);
            this.cruiserPhysics = this.cruiser.getComponent('physics');
            this.cruiserSpatial = this.cruiser.getComponent('spatial');

            this.turrets = this.gameLayer.entityManager.getTagged('TURRET');
            this.turretBig = this.gameLayer.entityManager.getTagged('TURRETMAIN');
            this.turretSmall = this.gameLayer.entityManager.getTagged('TURRETSMALL');

            // ---------------- UI ----------------
            this.uiLayer = this.addLayer(new pc.EntityLayer('ui'));
            this.uiLayer.systemManager.add(new pc.systems.Render());
            this.uiLayer.systemManager.add(new pc.systems.Expiration());
            this.uiLayer.systemManager.add(new pc.systems.Effects());
            this.uiLayer.systemManager.add(new RadarSystem(this.gameLayer));
            this.uiLayer.systemManager.add(new pc.systems.Layout({ margin: { top: 10, left:10, bottom:10, right:10 } }));

            // radar
            var e = pc.Entity.create(this.uiLayer);
            e.addComponent(pc.components.Rect.create({ color:'#000000', lineWidth: 0 }));
            e.addComponent(pc.components.Alpha.create({level:0.6}));
            e.addComponent(RadarComponent.create());
            e.addComponent(pc.components.Spatial.create({ w:150, h:150 } ));
            e.addComponent(pc.components.Layout.create( { vertical:'top', horizontal: 'right',
                margin: { top:0, left:10, bottom: 10, right:0 }} ));

            // setup the controls
            pc.device.input.bindAction(this, 'turning right', 'D');
            pc.device.input.bindAction(this, 'turning left', 'A');
            pc.device.input.bindAction(this, 'thrusting', 'W');
            pc.device.input.bindAction(this, 'reversing', 'S');
            pc.device.input.bindState(this, 'firing', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindState(this, 'turningLeft', 'L');
            pc.device.input.bindAction(this, 'bombard', 'B');
        },

        // todo: firing component
        lastFireTime:0,
        fireDelay:150,
        lastTurretDirUpdate: 0,

        process:function ()
        {
            if (!pc.device.loader.finished) return;


            // set the cruiser to be the center of the world
            this.gameLayer.origin.x = this.cruiserSpatial.getCenterPos().x - (this.viewPort.w / 2);
            this.gameLayer.origin.y = this.cruiserSpatial.getCenterPos().y - (this.viewPort.h / 2);

            this.starsLayer.origin.x = (this.cruiserSpatial.getCenterPos().x - (this.viewPort.w / 2)) / 3;
            this.starsLayer.origin.y = (this.cruiserSpatial.getCenterPos().y - (this.viewPort.h / 2)) / 3;

            this.nebulaLayer.origin.x = (this.cruiserSpatial.getCenterPos().x - (this.viewPort.w / 2)) / 2;
            this.nebulaLayer.origin.y = (this.cruiserSpatial.getCenterPos().y - (this.viewPort.h / 2)) / 2;


//            pc.device.ctx.fillStyle = '#000';
//            pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            pc.device.ctx.fillStyle = '#fff';
            if (this.cruiser)
            {
                pc.device.ctx.font = '15px Calibri';
                pc.device.ctx.fillText('speed ' + this.cruiserPhysics.getSpeed(), 10, 20);
            }

            if (pc.device.input.isInputState(this, 'turningLeft'))
            {
                    var cs = this.cruiser.getComponent('spatial');
                    this.cruiserPhysics.applyTurn(0.3);
            }

            // check for global input states
            if (pc.device.input.isInputState(this, 'firing'))
            {
                var sinceLastFire = Date.now() - this.lastFireTime;
                if (sinceLastFire > this.fireDelay)
                {
//                    if (pc.system.soundEnabled)
//                        this.fireSound.play();

                    // FIRE ALL GUNS!

                    var next = this.turretSmall.first;
                    while (next)
                    {
                        var turret = next.obj;
                        var ts = turret.getComponent('spatial');
                        var tc = ts.getCenterPos();

                        this.entityFactory.createEntity('bulletFire', this.gameLayer, tc.x - 2, tc.y - 3, ts.dir);

                        if (!turret.hasComponentOfType('overlay'))
                            turret.addComponent(
                                pc.components.Overlay.create({ spriteSheet:this.muzzleFlashSheet, lifetime: 100 }));

                        next = next.nextLinked;
                    }
                    this.lastFireTime = Date.now();
                }
            }

            // update the turret directions
            if (this.turrets)
            {
                if (pc.device.now - this.lastTurretDirUpdate > 50)
                {
                    var next = this.turrets.first;
                    while (next)
                    {
                        var tp = next.obj.getComponent('physics');
                        var ts = next.obj.getComponent('spatial');

                        // translate the mouse position to a world coord
                        var worldMousePos = this.gameLayer.worldPos(pc.device.input.mousePos);
                        tp.setDir(ts.getCenterPos().dirTo(worldMousePos));
                        next = next.nextLinked;
                    }
                    this.lastTurretDirUpdate = pc.device.now;
                }
            }


            this._super();
        },

        onAction:function (action, event, pos)
        {
            switch (action)
            {
                case 'turning right':
                    var cs = this.cruiser.getComponent('spatial');
                    this.cruiserPhysics.applyTurn(0.3);
                    break;
                case 'turning left':
                    cs = this.cruiser.getComponent('spatial');
                    this.cruiserPhysics.applyTurn(-0.3);
                    break;
                case 'thrusting':
                    this.cruiserPhysics.applyForce(20);
                    break;
                case 'reversing':
                    this.cruiserPhysics.applyForce(-10);
                    break;
                case 'bombard':
                    var next = this.turretBig.first;
                    while (next)
                    {
                        var turret = next.obj;
                        var ts = turret.getComponent('spatial');
                        var tc = ts.getCenterPos();
                        this.entityFactory.createEntity('shellFire', this.gameLayer, tc.x - 2, tc.y - 3, ts.dir);

                        if (!turret.hasComponentOfType('overlay'))
                            turret.addComponent(
                                pc.components.Overlay.create({ spriteSheet:this.muzzleFlashSheet, lifetime: 100 }));
                        next = next.nextLinked;
                    }
                    break;
            }
        }


    });


TheGame = pc.Game.extend('TheGame',
    {},
    {
        init:function ()
        {
            this._super('gameCanvas', 30);

            // tracing example
//            var p = pc.EntityCollision.create({}); // make sure the pool has been created
//            gamecore.Pool.getPool(pc.EntityCollision).startTracing();
//            p.release();
        },

        onReady:function ()
        {
            this._super();

            // start the resource loading
            pc.device.loader.setBaseUrl('/demos/hypergate/');
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('enemy-ship', 'images/enemy1.png'));
            pc.device.loader.add(new pc.Image('player-ship', 'images/battleCruiser-hull.png'));
            pc.device.loader.add(new pc.Image('stars', 'images/stars.png'));
            pc.device.loader.add(new pc.Image('planet1', 'images/planet_01.png'));
            pc.device.loader.add(new pc.Image('planet2', 'images/planet_02.png'));
            pc.device.loader.add(new pc.Image('stars-dim', 'images/stars-dim.png'));
            pc.device.loader.add(new pc.Image('nebula-blobs', 'images/nebula-blobs.png'));
//            pc.device.loader.add(new pc.Image('small-explosions', 'images/smallexplosions.png'));
//            pc.device.loader.add(new pc.Image('big-explosions', 'images/explosions.png'));
            pc.device.loader.add(new pc.Image('turret-small', 'images/turretSmall.png'));
            pc.device.loader.add(new pc.Image('turret-large', 'images/turretLarge.png'));
//            pc.device.loader.add(new pc.Image('plasma-shield', 'images/plasmaballfront80.png'));
            pc.device.loader.add(new pc.Image('bullet-fire', 'images/tracer.png'));
            pc.device.loader.add(new pc.Image('plasma-fire', 'images/flareblue16.png'));
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke.png'));
            pc.device.loader.add(new pc.Image('muzzle-flash', 'images/muzzleFlash1.png'));
            pc.device.loader.add(new pc.Image('shell-fire', 'images/rocket1.png'));

//            pc.device.loader.add(new pc.Image('plasma-weave', 'images/plasmaweave16-dark.png'));
//            pc.device.loader.add(new pc.Image('logo', 'images/logo.png'));
//            pc.device.loader.add(new pc.Image('poweredby', 'images/poweredbyplaycraft.png'));

            // sounds
            if (pc.device.soundEnabled)
            {
//                pc.device.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg', 'mp3'], 10));
//                pc.device.loader.add(new pc.Sound('fire2', 'sounds/shoot', ['ogg', 'mp3'], 10));
//                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg', 'mp3'], 3));
//                pc.device.loader.add(new pc.Sound('athmo1', 'sounds/athmo1', ['ogg', 'mp3'], 1));
//                pc.device.loader.add(new pc.Sound('music3', 'sounds/music3', ['ogg', 'mp3'], 1));
//                pc.device.loader.add(new pc.Sound('shield-hit', 'sounds/shieldimpact', ['ogg', 'mp3'], 5));
//                pc.device.loader.add(new pc.Sound('shield-hit2', 'sounds/shieldimpact2', ['ogg', 'mp3'], 5));
            }

            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
        },

        onLoading:function (percentageComplete)
        {
            // todo: draw title screen -- with loading bar
        },

        onLoaded:function ()
        {
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }

    }
);


var theGame = new TheGame();
