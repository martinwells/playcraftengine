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

Health = pc.components.Component('Health',
    {
        create:function (hp)
        {
            var n = this._super();
            n.config(hp);
            return n;
        }
    },
    {
        hp:0,

        init:function (hp)
        {
            this._super(this.Class.shortName);
            this.config(hp);
        },

        config:function (hp)
        {
            this.hp = hp;
        },

        takeDamage:function (hp)
        {
            this.hp -= hp;
        },

        isDead:function ()
        {
            return this.hp <= 0;
        }
    });


Brain = pc.components.Component('Brain',
    {
        State:{
            NONE:0,
            STANDING:1,
            WALKING:2,
            ATTACKING:4,
            DYING:5,
            RECOILING:6,
            JUMPING:7,
            BLOCKING:8,
            CLIMBING:9
        },

        create:function ()
        {
            var n = this._super();
            n.config();
            return n;
        },

        getStateName:function (state)
        {
            switch (state)
            {
                case this.State.NONE:
                    return 'none';
                case this.State.WALKING:
                    return 'walking';
                case this.State.STANDING:
                    return 'standing';
                case this.State.ATTACKING:
                    return 'attacking';
                case this.State.RECOILING:
                    return 'recoiling';
                case this.State.DYING:
                    return 'dying';
                case this.State.JUMPING:
                    return 'jumping';
                case this.State.BLOCKING:
                    return 'blocking';
                case this.State.CLIMBING:
                    return 'climbing';
            }
            throw "It's life jim, but not as we know it -- oops, unknown state";
        }

    },
    {
        stateChangeDelay:0,
        stateStartTime:0,
        facingRight:false,
        tookHit:false,
        collidedWith:null,
        startingJump:false,
        wantsToWalk:false,
        state:0,
        onGround:false,
        attacked:false, // whether we've attacked this attacking cycle yet
        blocking:false,

        init:function ()
        {
            this._super(this.Class.shortName);
            this.entitiesInWeaponSensor = new pc.LinkedList();
            this.config();
        },

        config:function ()
        {
            this.entitiesInWeaponSensor.clear();
            this.stateChangeDelay = pc.Math.rand(5000, 8000);
            this.facingRight = pc.Math.rand(0, 1) ? true : false;
            this.state = this.Class.State.WALKING;
            this.collidedWith = null;
            this.tookHit = false;
            this.onGround = false;
            this.startingJump = false;
            this.wantsToWalk = false;
            this.attacked = false;
            this.blocking = false;
        },

        /**
         * Changes state from one to another
         * @param sprite Associated sprite (so the corresponding animation can be set)
         * @param newState The new state to switch to
         * @param force Force the state change (usually to reset an animation)
         * @return {Boolean} False if the state did not change (already in that state), otherwise true
         */
        changeState:function (sprite, newState, force)
        {
            if (this.state == newState && !force) return false;

            if (this.state == Brain.State.DYING)
                throw 'oops, no changing states after dying';

            this.state = newState;
            if (this.state != Brain.State.NONE)
                sprite.sprite.setAnimation(Brain.getStateName(this.state) + ' ' +
                    (this.facingRight ? 'right' : 'left'), 0, false);
            return true;
        }

    });


BrainSystem = pc.systems.EntitySystem.extend('BrainSystem',
    {},
    {
        bloodSheet:null,

        init:function ()
        {
            this._super([ 'brain' ]);

            this.bloodSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('blood').resource, framesWide:4 });
        },

        process:function (entity)
        {
            var brain = entity.getComponent('brain');
            var spatial = entity.getComponent('spatial');
            var physics = entity.getComponent('physics');
            var health = entity.getComponent('health');
            var sprite = entity.getComponent('sprite');

            // collisions (collidedWith) is when entities collide, tookhit is when weapons fire hits an entity
            if (brain.tookHit)
            {
                if (brain.state != Brain.State.DYING && brain.state != Brain.State.RECOILING)
                {
                    if (brain.state == Brain.State.BLOCKING)
                        health.takeDamage(2);
                    else
                        health.takeDamage(10);

                    if (entity.hasTag('zombie'))
                    {
                        var emitter = entity.getComponent('emitter');
                        emitter.reset();
                        emitter.active = true;

                        // face the thing that hit me. if it's to the right, make sure I'm facing right
                        if (brain.collidedWith)
                        {
                            if (brain.collidedWith.getComponent('spatial').getCenterPos().x >
                                entity.getComponent('spatial').getCenterPos().x)
                            {
                                if (!brain.facingRight)
                                    brain.facingRight = true;
                            } else
                            {
                                if (brain.facingRight)
                                    brain.facingRight = false;
                            }
                        }
                    }

                    if (brain.state != Brain.State.BLOCKING)
                        brain.changeState(sprite, Brain.State.RECOILING);
                    physics.applyForce(brain.state == Brain.State.BLOCKING ? 40 : 100, (brain.facingRight) ? 180 : 0);
                }

                brain.collidedWith = null;
                brain.tookHit = false;
            }

            if (health.isDead())
            {
                if (brain.state != Brain.State.DYING)
                {
                    if (entity.hasTag('zombie'))
                    {
                        // emit blood by turning on the particle emitter
                        emitter = entity.getComponent('emitter');
                        emitter.reset();
                        emitter.active = true;
                    }

                    // once dead, just collide with the walls (not anything else) -- whilst the body goes through
                    // the death animation then fades out
                    physics.setCollisionMask(CollisionType.WALL);
//                    physics.applyForce(0.7, brain.facingRight ? 180 : 0);

                    brain.changeState(sprite, Brain.State.DYING);
                    entity.addComponent(pc.components.Fade.create({holdTime:sprite.sprite.currentAnim.time, fadeOutTime:3000 }));
                    entity.addComponent(pc.components.Expiry.create({ lifetime:sprite.sprite.currentAnim.time + 3000 }));

                }
            } else if (brain.state == Brain.State.RECOILING)
            {
                if (sprite.sprite.loopCount == 1)
                    brain.changeState(sprite, Brain.State.WALKING);
            } else
            {
                if (brain.startingJump && brain.onGround)
                {
                    if (brain.facingRight)
                        physics.applyForce(158, 325);
                    else
                        physics.applyForce(158, 215);
                    brain.startingJump = false;
                }

                // attacking
                if (entity.hasTag('zombie') && brain.state != Brain.State.RECOILING)
                {
                    // how far away is the player
                    var player = entity.layer.scene.player;
                    var playerSpatial = entity.layer.scene.playerSpatial;

                    if (player.getComponent('brain').state == Brain.State.DYING)
                        brain.changeState(sprite, Brain.State.STANDING);
                    else
                    {
                        var distance = spatial.getCenterPos().distance(playerSpatial.getCenterPos());

                        // if the player is close, then attack (fire a bullet)
                        if (brain.state != Brain.State.ATTACKING)
                        {
                            if (distance < 60)
                            {
                                brain.changeState(sprite, Brain.State.ATTACKING);
                                brain.wantsToWalk = false;
                                brain.attacked = false;
                            }
                            else if (distance < 200)
                            {
                                if (playerSpatial.getCenterPos().x > spatial.getCenterPos().x)
                                {
                                    if (!brain.facingRight)
                                        brain.facingRight = true;
                                } else
                                {
                                    if (brain.facingRight)
                                        brain.facingRight = false;
                                }

                                brain.changeState(sprite, Brain.State.WALKING);
                                brain.wantsToWalk = true;
                            } else
                                brain.changeState(sprite, Brain.State.STANDING);
                        }
                    }
                }

                if (brain.blocking && brain.state != Brain.State.BLOCKING && brain.state != Brain.State.DYING)
                {
                    brain.changeState(sprite, Brain.State.BLOCKING);
                }

                if (brain.wantsToWalk && brain.state != Brain.State.BLOCKING)
                    physics.applyImpulse(entity.hasTag('zombie') ? 0.2 : 1, brain.facingRight ? 0 : 180);

                // if we are attacking, then change states once the animation is done
                if (brain.state == Brain.State.ATTACKING)
                {
                    // if the attacking animation is at the right point, shoot out a collision bullet
                    // to trigger a hit (if they are close enough)
                    if (sprite.sprite.currentFrame > 5 && !brain.attacked)
                    {
                        var sp = entity.getComponent('spatial');

                        // fire a bullet -- which is used to simulate the sword attack (in physics only)
                        var bullet = pc.Entity.create(entity.layer);
                        bullet.addTag('bullet');

                        brain.attacked = true;
                        bullet.addComponent(pc.components.Spatial.create({x:sp.pos.x + (sp.dim.x / 2) - 15, y:sp.pos.y + 10, dir:brain.facingRight ? 0 : 180, w:10, h:10}));
                        bullet.addComponent(pc.components.Physics.create(
                            {
                                maxSpeed:{x:60, y:60},
                                force:entity.hasTag('player') ? 350 : 280,
                                isBullet:true,
                                bounce:0,
                                sensorOnly:true,
                                collisionCategory:entity.hasTag('enemy') ? CollisionType.ENEMY : CollisionType.FRIENDLY,
                                collisionMask:entity.hasTag('enemy') ? CollisionType.FRIENDLY : CollisionType.ENEMY
                            }));
                        // very short life, since we are simulating a sword hit
                        bullet.addComponent(pc.components.Expiry.create({lifetime:200}));
                    }

                    if (sprite.sprite.loopCount == 1)
                    {
                        brain.changeState(sprite, Brain.State.STANDING);
                        brain.attacked = false;
                    }

                } else if (brain.state != Brain.State.DYING && brain.state != Brain.State.BLOCKING)
                {
                    var xVel = physics.getLinearVelocity().x;
                    var yVel = physics.getLinearVelocity().y;

                    // if we are moving vertically, then we're jumping (or falling)
                    if (!brain.onGround)
                    {
                        if (brain.state != Brain.State.JUMPING && Math.abs(yVel) > 1)
                            brain.changeState(sprite, Brain.State.JUMPING);
                    }
                    else if (Math.abs(xVel) > 2 && (physics.getVelocityAngle() == 0 || physics.getVelocityAngle() == 180))
                    // otherwise, if there's enough horizontal movement, we are walking
                        brain.changeState(sprite, Brain.State.WALKING);
                    else
                    {
                        if (brain.state != Brain.State.STANDING)
                            brain.changeState(sprite, Brain.State.STANDING);
                    }
                }
            }
        }
    });


/**
 * PlayerControlSystem
 * Handle input for the player
 */

PlayerControlSystem = pc.systems.Input.extend('PlayerControlSystem',
    { },
    {
        init:function ()
        {
            this._super([ 'input' ], 60);
        },

        process:function (entity)
        {
            this._super(entity);

            var brain = entity.getComponent('brain');
            if (brain.state == Brain.State.DYING)
                return; // no input if you're dead -- todo: add a way to disable input - set input component to inactive?

            brain.wantsToWalk = false;

            if (this.isInputState(entity, 'attacking'))
            {
                var sprite = entity.getComponent('sprite');
                brain.changeState(sprite, Brain.State.ATTACKING);
            }

            if (this.isInputState(entity, 'moving left') && brain.state != Brain.State.BLOCKING)
            {
                sprite = entity.getComponent('sprite');
                brain.facingRight = false;
                if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING)
                    brain.changeState(sprite, Brain.State.WALKING);

                if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                    brain.wantsToWalk = true;
            }

            if (this.isInputState(entity, 'moving right') && brain.state != Brain.State.BLOCKING)
            {
                sprite = entity.getComponent('sprite');
                brain.facingRight = true;
                if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING)
                    brain.changeState(sprite, Brain.State.WALKING, true);

                if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                    brain.wantsToWalk = true;
            }

            if (this.isInputState(entity, 'jumping'))
            {
                // are we in a climbable area?
                // get the tile from the background layer
                var spatial = entity.getComponent('spatial');
                var overlayTiles = entity.layer.scene.overlayLayer;

                var tileX = Math.round(spatial.getCenterPos().x / overlayTiles.tileMap.tileWidth);
                var tileY = Math.round(spatial.getCenterPos().y / overlayTiles.tileMap.tileHeight);

                if (overlayTiles.tileMap.tileHasProperty(tileX, tileY, 'climbable'))
                {
                    // climb!
                    brain.changeState(Brain.State.CLIMBING);
                    brain.wantsToClimbUp = true;

                } else
                {
                    brain = entity.getComponent('brain');
                    if (brain.state != Brain.State.JUMPING && brain.onGround && !brain.startingJump)
                        brain.startingJump = true;
                }
            }

            if (this.isInputState(entity, 'blocking'))
            {
                var tileX = Math.round(spatial.getCenterPos().x / overlayTiles.tileMap.tileWidth);
                var tileY = Math.round(spatial.getCenterPos().y / overlayTiles.tileMap.tileHeight);

                if (overlayTiles.tileMap.tileHasProperty(tileX, tileY, 'climbable'))
                {
                    // climb!
                    brain.changeState(Brain.State.CLIMBING);
                    brain.wantsToClimbUp = true;

                } else
                    brain.blocking = true;
                brain.wantsToWalk = false;

            } else if (brain.blocking)
            {
                brain.blocking = false;
                brain.changeState(entity.getComponent('sprite'), Brain.State.STANDING);
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
            // is someone hitting the ground?
            if (aType == pc.BodyType.TILE || bType == pc.BodyType.TILE)
            {
                var entity = entityA ? entityA : entityB;
                var t = entityA ? fixtureAType : fixtureBType;

                if (entity.hasTag('enemy') || (entity.hasTag('player') && t == 1)) // feet
                {
                    var sprite = entity.getComponent('sprite');
                    var brain = entity.getComponent('brain');
                    if (!brain.onGround && brain.state != Brain.State.DYING)
                    {
                        if (brain.state != Brain.State.ATTACKING)
                            brain.changeState(sprite, Brain.State.STANDING);
                        brain.onGround = true;
                    }
                }
            }

            // player, enemy and bullet hits
            if (aType == pc.BodyType.ENTITY && bType == pc.BodyType.ENTITY)
            {
                if (entityA.hasTag('player') || entityB.hasTag('player'))
                {
                    var player = entityA.hasTag('player') ? entityA : entityB;
                    var enemy = (bullet == entityA) ? entityB : entityA;

                    player.getComponent('brain').collidedWith = enemy;
                }

                if (entityA.hasTag('bullet') || entityB.hasTag('bullet'))
                {
                    // a bullet collided
                    var bullet = entityA.hasTag('bullet') ? entityA : entityB;
                    var other = (bullet == entityA) ? entityB : entityA;
                    if (!other.hasTag('bullet'))
                        other.getComponent('brain').tookHit = true;
                }
            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            // is the player leaving the ground?

            var entity = entityA ? entityA : entityB;
            var hittingType = entityA ? bType : aType; // are we hitting a tile
            var fixType = entityA ? fixtureAType : fixtureBType; // need to know if it's the feet fixture leaving contact

            if (entity && entity.hasTag('player'))
            {
                var brain = entity.getComponent('brain');
                if (hittingType == pc.BodyType.TILE && fixType == 1 && brain.onGround)
                    brain.onGround = false;
            }
        }
    });


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        backgroundLayer:null,
        gameLayer:null,
        bgLayer:null,
        tileLayer:null,
        overlayLayer:null,
        level:1,
        entityFactory:null,
        player:null,
        playerSpatial:null,
        music:null,

        init:function ()
        {
            this._super();

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

            // generate the shadow background map
            this.gameLayer = this.get('entity');
            this.gameLayer.setZIndex(20);

            // setup origin tracking (these layers will maintain an origin linked to the main game layer)
            this.tileLayer.setOriginTrack(this.gameLayer);
            this.overlayLayer.setOriginTrack(this.gameLayer);
            this.bgLayer.setOriginTrack(this.gameLayer);
            this.bgEntityLayer.setOriginTrack(this.gameLayer);

            // get the player entity
            this.player = this.gameLayer.entityManager.getTagged('PLAYER').first.object();
            this.playerSpatial = this.player.getComponent('spatial');

            // fire up the systems we need for the game layer
            this.gameLayer.addSystem(new GamePhysics(
                {
                    gravity:{ x:0, y:70 },
                    debug:false,
                    tileCollisionMap:{
                        tileMap:this.tileLayer.tileMap,
                        collisionCategory:CollisionType.WALL,
                        collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                    }
                }));

            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Activation(2000));
            this.gameLayer.addSystem(new pc.systems.Layout());
            this.gameLayer.addSystem(new BrainSystem());
            this.gameLayer.addSystem(new PlayerControlSystem());
        },

        /**
         * State machine design thoughts
         *
         * create a BehaviorSystem
         * add BehaviorComponents, which contains behaviors and transitions
         * feed input states and animations to the tree? wow, how cool would that be!
         * You can set out the behavior of actors using a set of states PlayerFSM, MonsterFSM etc
         */

        process:function ()
        {
            if (!pc.device.loader.finished) return;

            // set the game layer's origin to center on the player, the other layers are set to track this one
            this.gameLayer.setOrigin(
                this.playerSpatial.getCenterPos().x - (this.viewPort.w / 2),
                this.playerSpatial.getCenterPos().y - (this.viewPort.h / 2));

            pc.device.ctx.fillStyle = '#000';
            pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            this._super();
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
                frames:[
                    [0, 2],
                    [1, 2],
                    [2, 2],
                    [3, 2],
                    [4, 2],
                    [5, 2],
                    [6, 2],
                    [7, 2],
                    [0, 3],
                    [1, 3],
                    [2, 3],
                    [0, 8],
                    [1, 8]
                ],
                offsetX:10, offsetY:-11, time:500, loops:1 });
            this.playerSheet.addAnimation({ name:'attacking left',
                frames:[
                    [0, 2],
                    [1, 2],
                    [2, 2],
                    [3, 2],
                    [4, 2],
                    [5, 2],
                    [6, 2],
                    [7, 2],
                    [0, 3],
                    [1, 3],
                    [2, 3],
                    [0, 8],
                    [1, 8]
                ],
                frameY:2, scaleX:-1, offsetX:25, offsetY:-11, time:500, loops:1 });
            this.playerSheet.addAnimation({ name:'blocking right', frameCount:1, frameX:4, frameY:3, offsetX:10, offsetY:-11, time:500, loops:0 });
            this.playerSheet.addAnimation({ name:'blocking left', frameCount:1, frameX:4, frameY:3, offsetX:25, offsetY:-11, time:500, scaleX:-1, loops:0 });

            this.playerSheet.addAnimation({ name:'recoiling right', frames:[
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 0]
            ], frameX:4, frameY:3, offsetX:10, offsetY:-11, time:500, loops:1 });
            this.playerSheet.addAnimation({ name:'recoiling left', frames:[
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 0]
            ], frameX:4, frameY:3, offsetX:25, offsetY:-11, time:500, scaleX:-1, loops:1 });

            this.playerSheet.addAnimation({ name:'dying right', frameCount:16, frameX:0, frameY:6, offsetX:10, offsetY:-11, holdOnEnd:true, time:3000, loops:1 });
            this.playerSheet.addAnimation({ name:'dying left', frameCount:16, frameX:0, frameY:6, offsetX:25, offsetY:-11, holdOnEnd:true, time:3000, scaleX:-1, loops:1 });
            this.playerSheet.addAnimation({ name:'climbing', frameCount:4, frameX:5, frameY:3, offsetX:10, offsetY:-11, time:400 });

            //
            // ZOMBIE
            //
            this.zombieSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('zombie').resource, frameWidth:80, frameHeight:72, useRotation:false });

            this.zombieSheet.addAnimation({ name:'standing right', frameX:0, frameY:4, offsetX:15, offsetY:-11, frameCount:11, time:1900 });
            this.zombieSheet.addAnimation({ name:'standing left', frameX:0, frameY:4, offsetX:25, offsetY:-11, frameCount:11, time:1900, scaleX:-1});
            this.zombieSheet.addAnimation({ name:'walking right', frameCount:16, offsetX:15, offsetY:-11, time:1400 });
            this.zombieSheet.addAnimation({ name:'walking left', frameCount:16, offsetX:25, offsetY:-11, scaleX:-1, time:1400 });
            this.zombieSheet.addAnimation({ name:'jumping right', frameCount:1, frameX:3, frameY:3, offsetX:15, offsetY:-11, time:500 });
            this.zombieSheet.addAnimation({ name:'jumping left', frameCount:1, frameX:3, frameY:3, offsetX:25, offsetY:-11, scaleX:-1, time:300 });
            this.zombieSheet.addAnimation({ name:'attacking right', frameCount:11, frameY:2, offsetX:10, offsetY:-11, time:1500, loops:1 });
            this.zombieSheet.addAnimation({ name:'attacking left', frameCount:11, frameY:2, scaleX:-1, offsetX:25, offsetY:-11, time:1500, loops:1 });
            this.zombieSheet.addAnimation({ name:'dying right', frameCount:15, frameX:3, frameY:5, offsetX:10, offsetY:-11, holdOnEnd:true, time:1500, loops:1 });
            this.zombieSheet.addAnimation({ name:'dying left', frameCount:15, frameX:3, frameY:5, offsetX:25, offsetY:-11, holdOnEnd:true, time:1500, scaleX:-1, loops:1 });
            this.zombieSheet.addAnimation({ name:'recoiling right', frameCount:5, frameX:3, frameY:5, offsetX:10, offsetY:-11, time:1000, loops:1 });
            this.zombieSheet.addAnimation({ name:'recoiling left', frameCount:5, frameX:3, frameY:5, offsetX:42, offsetY:-11, time:1000, scaleX:-1, loops:1 });
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
                    e.addComponent(Health.create(100));
                    e.addComponent(Brain.create());

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:24, y:150},
                            friction:0.1,
                            fixedRotation:true,
                            bounce:0,
                            mass:1.8,
                            shapes:[
                                // upper torso/head
                                { type:0, offset:{y:-20, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // middle torso
                                { type:0, offset:{y:-3, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // leg area
                                { type:0, offset:{y:12, w:-60}, shape:pc.CollisionShape.CIRCLE },
                                // feet
                                { type:1, sensorOnly:true, shape:pc.CollisionShape.CIRCLE, offset:{y:20, w:-62} }
                            ],

                            collisionCategory:CollisionType.FRIENDLY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY | CollisionType.WALL
                        }));

                    // input control
                    e.addComponent(pc.components.Input.create(
                        {
                            states:[
                                ['moving right', ['D', 'TOUCH', 'RIGHT']],
                                ['moving left', ['A', 'LEFT']],
                                ['jumping', ['W', 'UP']],
                                ['blocking', ['S', 'DOWN']],
                                ['attacking', ['SPACE', 'MOUSE_LEFT_DOWN']]
                            ]
                        }));
                    return e;

                case 'zombie':
                    e = pc.Entity.create(layer);
                    e.addTag('enemy');
                    e.addTag('zombie');

                    e.addComponent(pc.components.Sprite.create(
                        {
                            spriteSheet:this.zombieSheet,
                            animationStart:'standing left',
                            animationStartDelay:pc.Math.rand(0, 300)

                        }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.zombieSheet.frameWidth, h:this.zombieSheet.frameHeight}));
                    e.addComponent(pc.components.Activator.create({ tag:'player', range:1000 }));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:3, y:150},
                            friction:0.1,
                            fixedRotation:true,
                            bounce:0,
                            mass:1.8,
                            shapes:[
                                { shape:pc.CollisionShape.RECT, offset:{x:6, y:-10, w:-62, h:-30} }
                            ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.WALL
                        }));

                    var bloodSheet = new pc.SpriteSheet(
                        { image:pc.device.loader.get('blood').resource, framesWide:4 });

                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            active:false,
                            spriteSheet:bloodSheet,
                            burst:5,
                            delay:20,
                            shots:10,
                            thrustMin:7, thrustTime:300,
                            maxVelX:15, maxVelY:15,
                            angleMin:-60, angleMax:60,
                            lifeMin:400,
                            alphaMin:0, alphaMax:1, alphaDelay:50,
                            gravityY:0.07,
                            offsetX:40,
                            offsetY:20,
                            rotateSprite:true
                        }));

                    e.addComponent(Health.create(50));
                    e.addComponent(Brain.create());

                    return e;

                case 'cavernBackdrop':
                    // NOTE: origin shifter adjusts an entities position based on the origin of the layer, including a ratio
                    // an origin within an origin (if you know what I mean)
                    var backdrop = pc.Entity.create(layer);
                    var backdropSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cavern-backdrop').resource });
                    backdrop.addComponent(pc.components.Sprite.create({ spriteSheet:backdropSheet }));
                    backdrop.addComponent(pc.components.Spatial.create({ dir:0, x:x - 200, y:y - 100,
                        w:backdropSheet.frameWidth, h:backdropSheet.frameHeight }));
                    backdrop.addComponent(pc.components.OriginShifter.create({ ratio:0.2 }));

                    var backdrop2 = pc.Entity.create(layer);
                    backdrop2.addComponent(pc.components.Sprite.create({ spriteSheet:backdropSheet }));
                    backdrop2.addComponent(pc.components.Spatial.create({ dir:0, x:x + (backdropSheet.frameWidth - 201), y:y - 100,
                        w:backdropSheet.frameWidth, h:backdropSheet.frameHeight }));
                    backdrop2.addComponent(pc.components.OriginShifter.create({ ratio:0.2 }));

                    // window
                    e = pc.Entity.create(layer);
                    var backdropWindowSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cavern-window').resource });
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:backdropWindowSheet }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, x:x, y:y,
                        w:backdropWindowSheet.frameWidth, h:backdropWindowSheet.frameHeight }));
                    e.addComponent(pc.components.OriginShifter.create({ ratio:0.1 }));

                    // make the backdrop clip to within the boundary of the window
                    backdrop.addComponent(pc.components.Clip.create({ entity:e, x:1, y:1 }));
                    backdrop2.addComponent(pc.components.Clip.create({ entity:e, x:1, y:1, w:-20}));

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
            pc.device.loader.add(new pc.Image('blood', 'images/bloodParticles.png'));
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


