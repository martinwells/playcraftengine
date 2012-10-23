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
        maxHP:0,

        init:function (hp)
        {
            this._super(this.Class.shortName);
            this.config(hp);
        },

        config:function (hp)
        {
            this.hp = hp;
            this.maxHP = hp;
        },

        takeDamage:function (hp)
        {
            this.hp -= hp;
        },

        addHealth:function (hp)
        {
            this.hp += hp;
        },

        isDead:function ()
        {
            return this.hp <= 0;
        }
    });


HealthBar = pc.components.Component('HealthBar',
    {
        create:function (healthEntity, width, height, offsetX, offsetY)
        {
            var n = this._super();
            n.config(healthEntity, width, height, offsetX, offsetY);
            return n;
        }
    },
    {
        healthEntity:null, // entity whose health this bar represents
        width:0,
        height:0,
        offsetX:0,
        offsetY:0,

        init:function ()
        {
            this._super(this.Class.shortName);
        },

        config:function (healthEntity, width, height, offsetX, offsetY)
        {
            this.healthEntity = healthEntity;
            this.width = width;
            this.height = height;
            this.offsetX = pc.checked(offsetX, 0);
            this.offsetY = pc.checked(offsetY, 0);
        }

    });

/**
 * Takes care of updating the health bar component on the UI for the player
 */
HealthBarSystem = pc.systems.EntitySystem(
    {},
    {
        healthBar:null, // health bar that appears on the UI

        init:function ()
        {
            this._super([ 'healthbar' ]);
        },

        process:function (entity)
        {
            // we only expect one entity to be processed (the on-screen health bar)
            var healthBar = entity.getComponent('healthbar');
            var health = healthBar.healthEntity.getComponent('health');
            var spatial = entity.getComponent('spatial');
            var alpha = entity.getComponent('alpha');

            var perc = health.hp / health.maxHP;
            var percWidth = Math.max(healthBar.width * perc, 0);

            // custom render the health bar
            var ctx = pc.device.ctx;
            ctx.globalAlpha = 0.5;
            if (alpha && alpha.level != 1)
                ctx.globalAlpha = alpha.level;
            if (ctx.globalAlpha > 0.5)
                ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#115511';
            ctx.fillRect(healthBar.offsetX + entity.layer.screenX(spatial.pos.x),
                healthBar.offsetY + entity.layer.screenY(spatial.pos.y),
                healthBar.width, healthBar.height);
            if (percWidth)
            {
                ctx.fillStyle = '#44ff44';
                ctx.fillRect(healthBar.offsetX + entity.layer.screenX(spatial.pos.x),
                    healthBar.offsetY + entity.layer.screenY(spatial.pos.y), percWidth, healthBar.height);
            }
            ctx.globalAlpha = 1;
        }

    });


/**
 * The base brain code for player/monsters. Basically a container for state and decisions to control the movement
 * of any complex creature in the game
 */
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
            throw "It's life jim, but not as we know it";
        }

    },
    {
        stateChangeDelay:0,
        stateStartTime:0,
        facingRight:false,
        tookHit:0,          // took damage in the last cycle: value = level of damage, 0 = didn't take damage
        collidedWith:null,
        startingJump:false,
        wantsToWalk:false,
        state:0,
        onGround:0,     // 0 = not on the ground, otherwise the number of contacts with the foot sensor
        attacked:false, // whether we've attacked this attacking cycle yet
        blocking:false,
        wantsToClimbUp:false,
        wantsToClimbDown:false,
        lastCastTime:0,

        init:function ()
        {
            this._super(this.Class.shortName);
            this.config();
        },

        config:function ()
        {
            this.stateChangeDelay = pc.Math.rand(5000, 8000);
            this.facingRight = pc.Math.rand(0, 1) ? true : false;
            this.state = this.Class.State.WALKING;
            this.collidedWith = null;
            this.tookHit = 0;
            this.onGround = 0;
            this.startingJump = false;
            this.wantsToWalk = false;
            this.attacked = false;
            this.blocking = false;
            this.lastCastTime = 0;
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

            // debugging states
            //console.log('state: ' + this.Class.getStateName(this.state) +  ' -> ' + this.Class.getStateName(newState));

            this.state = newState;
            if (this.state != Brain.State.NONE)
            {
                if (this.state == Brain.State.CLIMBING)
                {
                    // climbing has no left/right to it
                    sprite.sprite.setAnimation(Brain.getStateName(this.state), 0, false);
                }
                else
                {
                    sprite.sprite.setAnimation(Brain.getStateName(this.state) + ' ' +
                        (this.facingRight ? 'right' : 'left'), 0, false);
                }
            }

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
                        health.takeDamage(brain.tookHit / 5);
                    else
                        health.takeDamage(brain.tookHit);

                    if (entity.hasTag('zombie') || entity.hasTag('ogre'))
                    {
                        pc.device.game.soundManager.play('blood-hit' + pc.Math.rand(1, 2));

                        var emitter = entity.getComponent('emitter');
                        emitter.reset();
                        if (brain.tookHit > 50)
                        {
                            emitter.scaleXMin = 5;
                            emitter.scaleYMin = 5;
                            emitter.lifeMin = 1000;
                            emitter.angleMin = -180;
                            emitter.angleMax = 0;
                        } else
                        {
                            emitter.scaleXMin = 1;
                            emitter.scaleYMin = 1;
                            emitter.lifeMin = 400;
                            emitter.angleMin = -180;
                            emitter.angleMax = 0;
                        }

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
                    } else
                    {
                        pc.device.game.soundManager.play('player-pain' + pc.Math.rand(1, 2));
                    }

                    if (brain.state != Brain.State.BLOCKING && !entity.hasTag('ogre'))
                        brain.changeState(sprite, Brain.State.RECOILING);
                    physics.applyForce(brain.state == Brain.State.BLOCKING ? 20 : 60, (brain.facingRight) ? 180 : 0);
                }

                brain.collidedWith = null;
                brain.tookHit = 0;
            }

            if (health.isDead())
            {
                if (brain.state != Brain.State.DYING)
                {
                    if (entity.hasTag('zombie') || entity.hasTag('ogre'))
                    {
                        // emit blood by turning on the particle emitter
                        emitter = entity.getComponent('emitter');
                        emitter.reset();
                        emitter.active = true;
                    }

                    // once dead, just collide with the walls (not anything else) -- whilst the body goes through
                    // the death animation then fades out
                    physics.setCollisionMask(CollisionType.WALL);

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
                if ((entity.hasTag('zombie')||entity.hasTag('ogre')) && brain.state != Brain.State.RECOILING)
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
                                if (brain.changeState(sprite, Brain.State.ATTACKING))
                                    if (pc.Math.rand(1, 3) == 1)
                                        pc.device.game.soundManager.play('zombie-alert');

                                brain.wantsToWalk = false;
                                brain.attacked = false;
                            }
                            else if (distance < 400)
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

                                if (brain.changeState(sprite, Brain.State.WALKING))
                                    if (pc.Math.rand(1, 3)==1)
                                        pc.device.game.soundManager.play('zombie-brains');

                                brain.wantsToWalk = true;
                            } else {

                                brain.changeState(sprite, Brain.State.STANDING);
                            }
                        }
                    }
                }

                if (brain.blocking && brain.state != Brain.State.BLOCKING && brain.state != Brain.State.DYING)
                {
                    brain.changeState(sprite, Brain.State.BLOCKING);
                }

                if (brain.wantsToWalk && brain.state != Brain.State.BLOCKING)
                {
                    var f = (entity.hasTag('zombie')) ? 0.2 : 1;
                    if (entity.hasTag('ogre')) f = 1;
                    if (brain.state == Brain.State.CLIMBING)
                        f /= 3;
                    physics.applyImpulse(f, brain.facingRight ? 0 : 180);
                }

                // if we are attacking, then change states once the animation is done
                if (brain.state == Brain.State.ATTACKING)
                {
                    // if the attacking animation is at the right point, shoot out a collision bullet
                    // to trigger a hit (if they are close enough)
                    if (sprite.sprite.currentFrame > 5 && !brain.attacked)
                    {
                        pc.device.game.soundManager.play('sword-swing');

                        var sp = entity.getComponent('spatial');

                        // fire a bullet -- which is used to simulate the sword attack (in physics only)
                        // need a damager component to handle all these exceptions generically
                        var bullet = pc.Entity.create(entity.layer);
                        bullet.addTag('bullet');
                        bullet.addTag('hurts');
                        bullet.addTag('swordhit');
                        if (entity.hasTag('player'))
                            bullet.addTag('fromPlayer');
                        if (entity.hasTag('ogre'))
                            bullet.addTag('fromOgre');

                        brain.attacked = true;
                        bullet.addComponent(pc.components.Spatial.create(
                            {x:sp.pos.x + (sp.dim.x / 2) - 15, y:(sp.pos.y + (sp.dim.y/2)) - 10, dir:brain.facingRight ? 0 : 180, w:10, h:10}));
                        bullet.addComponent(pc.components.Physics.create(
                            {
                                maxSpeed:{x:60, y:60},
                                force:entity.hasTag('player') ? 350 : 280,
                                isBullet:true,
                                bounce:0,
                                sensorOnly:true,
                                collisionGroup:1,
                                collisionCategory:entity.hasTag('enemy') ? CollisionType.ENEMY : CollisionType.FRIENDLY,
                                collisionMask:entity.hasTag('enemy') ? CollisionType.FRIENDLY : CollisionType.ENEMY
                            }));

                        // very short life, since we are simulating a sword hit
                        bullet.addComponent(pc.components.Expiry.create({lifetime:300}));
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

                    if (brain.state == Brain.State.CLIMBING)
                    {
                        // if not moving vertically, then put a hold on the climbing animation
                        sprite.sprite.hold = !(Math.abs(yVel) > 0.01 || Math.abs(xVel) > 0.01);

                    } else
                    {
                        // if we are moving vertically, then we're jumping (or falling)
                        if (!brain.onGround)
                        {
                            if (brain.state != Brain.State.JUMPING && Math.abs(yVel) > 1)
                                brain.changeState(sprite, Brain.State.JUMPING);
                        }
                        else if (Math.abs(xVel) > 2 && brain.onGround)
                            // otherwise, if there's enough horizontal movement, we are walking
                            brain.changeState(sprite, Brain.State.WALKING);
                        else
                            // otherwise, we're standing
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

            if (this.isInputState(entity, 'casting'))
            {
                if (pc.device.now - brain.lastCastTime > 300)
                {
                    pc.device.game.soundManager.play('fireball-cast');

                    var sp = entity.getComponent('spatial');
                    var fb = entity.layer.scene.entityFactory.createEntity(entity.layer, 'fireball',
                        sp.getCenterPos().x + (brain.facingRight ? 0 : -50),
                        sp.getCenterPos().y - 40,
                        brain.facingRight ? 340 : 200);
                    brain.lastCastTime = pc.device.now;
                }

            }

            brain.wantsToWalk = false;
            brain.wantsToClimbUp = false;
            brain.wantsToClimbDown = false;

            if (brain.state != Brain.State.CLIMBING)
            {
                if (this.isInputState(entity, 'attacking'))
                {
                    var sprite = entity.getComponent('sprite');
                    brain.changeState(sprite, Brain.State.ATTACKING);
                }
            }

            if (this.isInputState(entity, 'moving left') && brain.state != Brain.State.BLOCKING)
            {
                sprite = entity.getComponent('sprite');

                var faceChange = false;
                if (brain.facingRight)
                {
                    brain.facingRight = false;
                    faceChange = true;
                }
                if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING &&
                    brain.state != Brain.State.CLIMBING)
                    brain.changeState(sprite, Brain.State.WALKING, faceChange);

                if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                    brain.wantsToWalk = true;
            }

            if (this.isInputState(entity, 'moving right') && brain.state != Brain.State.BLOCKING)
            {
                sprite = entity.getComponent('sprite');

                faceChange = false;
                if (!brain.facingRight)
                {
                    brain.facingRight = true;
                    faceChange = true;
                }
                if (brain.state != Brain.State.JUMPING && brain.state != Brain.State.ATTACKING &&
                    brain.state != Brain.State.CLIMBING)
                    brain.changeState(sprite, Brain.State.WALKING, faceChange);

                if (!brain.wantsToWalk)// && brain.state != Brain.State.JUMPING)
                    brain.wantsToWalk = true;
            }

            if (this.isInputState(entity, 'jumping'))
            {
                // are we in a climbable area?
                // get the tile from the background layer
                if (this.onClimbableTile(entity))
                {
                    var physics = entity.getComponent('physics');

                    // climb!
                    if (brain.state != Brain.State.CLIMBING)
                    {
                        brain.changeState(entity.getComponent('sprite'), Brain.State.CLIMBING);
                        physics.setGravity(0, 0);
                        physics.setLinearVelocity(0, 0);
                        physics.maxSpeed.y = 18;
                    }

                    // check to see if the tile above is not a ladder, if so, restrict them by not allowing
                    // the movement
                    var spatial = entity.getComponent('spatial');
                    var tw = entity.layer.scene.overlayLayer.tileMap.tileWidth;
                    var th = entity.layer.scene.overlayLayer.tileMap.tileHeight;
                    var tileX = Math.floor(spatial.getCenterPos().x / tw);
                    var tileY = Math.floor(((spatial.getCenterPos().y - 3) / th)); // one tile up
                    if (entity.layer.scene.backgroundOverlayLayer.tileMap.tileHasProperty(tileX, tileY, 'climbable'))
                    {
                        physics.applyImpulse(2, 270);
                        brain.wantsToClimbUp = true;
                    }

                } else
                {
                    brain = entity.getComponent('brain');
                    if (brain.state != Brain.State.JUMPING && brain.onGround && !brain.startingJump)
                        brain.startingJump = true;
                }
            }

            if (this.isInputState(entity, 'blocking'))
            {
                if (this.onClimbableTile(entity))
                {
                    physics = entity.getComponent('physics');

                    // climb!
                    if (brain.state != Brain.State.CLIMBING)
                    {
                        brain.changeState(entity.getComponent('sprite'), Brain.State.CLIMBING);
                        physics.setGravity(0, 0);
                        physics.setLinearVelocity(0, 0);
                    }
                    brain.wantsToClimbDown = true;
                    physics.maxSpeed.y = 18;
                    physics.applyImpulse(2, 90);

                } else
                    brain.blocking = true;
                brain.wantsToWalk = false;

            } else if (brain.blocking)
            {
                brain.blocking = false;
                brain.changeState(entity.getComponent('sprite'), Brain.State.STANDING);
            }

            // Climbing - if we are climbing, check that we are still on a climbable tile, if not, then
            // drop back to walking
            if (brain.state == Brain.State.CLIMBING)
            {
                if (!this.onClimbableTile(entity))
                {
                    physics = entity.getComponent('physics');
                    physics.clearGravity();
                    brain.changeState(entity.getComponent('sprite'), Brain.State.STANDING);
                    physics.maxSpeed.y = 150;
                } else
                {
                    if (!brain.wantsToClimbUp && !brain.wantsToClimbDown && !brain.wantsToWalk)
                        entity.getComponent('physics').setLinearVelocity(0, 0);
                }
            }

        },

        onClimbableTile:function (entity)
        {
            var spatial = entity.getComponent('spatial');
            var tileX = Math.floor(spatial.getCenterPos().x / entity.layer.scene.overlayLayer.tileMap.tileWidth);
            var tileY = Math.floor(spatial.getCenterPos().y / entity.layer.scene.overlayLayer.tileMap.tileHeight);
            return (entity.layer.scene.backgroundOverlayLayer.tileMap.tileHasProperty(tileX, tileY, 'climbable'));
        }
    });


GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        explosionSheet: null,
        smokeSheet: null,
        debrisSheet: null,

        init: function(options)
        {
            this._super(options);

            this.explosionSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('explosions').resource, scaleX:0.3, scaleY:0.3, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'explosion', frameY:1, frameCount:15, loops:1, time:600});

            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('smoke').resource, framesWide:16, framesHigh:1, useRotation:true});
            this.smokeSheet.addAnimation({ name:'smoke', frameCount:16, time:600});

            // crate debris
            this.debrisSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('crate-debris').resource, scaleX: 0.1, scaleY: 0.1, frameWidth:42, frameHeight:42, framesWide:2, framesHigh:1});
        },

        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {
            // player, enemy hits -- keep in mind that sword bullets are sensors only, so they will not be
            // handled here - sensors only generate onCollisionStart and onCollisionEnd events
            if (aType == pc.BodyType.ENTITY && bType == pc.BodyType.ENTITY)
            {
                // todo: convert the hurts and damage modifier to be a "damager" component with varying levels
                if (entityA.hasTag('hurts') || entityB.hasTag('hurts'))
                {
                    // a bullet collided
                    var bullet = entityA.hasTag('hurts') ? entityA : entityB;
                    var other = (bullet == entityA) ? entityB : entityA;

                    // DAMAGE CHECKING
                    // if the thing the bullet collided with has a brain (is a monster/player)
                    var otherBrain = other.getComponent('brain');
                    if (otherBrain)
                    {
                        // rocks and fireballs don't hurt players
                        if (!( (other.hasTag('player') && (bullet.hasTag('rock') || bullet.hasTag('fireball')) )))
                        {
                            if (bullet.hasTag('rock'))
                                otherBrain.tookHit = 100;
                            else if (bullet.hasTag('fireball'))
                                otherBrain.tookHit = 50;
                            else
                                otherBrain.tookHit = 10;
                        }
                    }

                    if (bullet.hasTag('fireball') && otherBrain && !other.hasTag('player'))
                        this.explodeFireball(bullet);
                    if (other.hasTag('wooden') && (bullet.hasTag('bullet') || bullet.hasTag('rock')))
                    {
                        if (force > 10)
                            this.explodeWood(other);

                        if (bullet.hasTag('fireball'))
                        {
                            this.explodeWood(other);
                            this.explodeFireball(bullet);
                        }
                    }
                }
            }
        },

        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            // is someone hitting the ground?
            if (aType == pc.BodyType.TILE || bType == pc.BodyType.TILE)
            {
                var entity = entityA ? entityA : entityB;
                var t = entityA ? fixtureAType : fixtureBType;

                if (t == 1) // feet
                {
                    var sprite = entity.getComponent('sprite');
                    var brain = entity.getComponent('brain');
                    if (brain.state != Brain.State.DYING)
                        brain.onGround++;
                }

                // uncomment to make fireballs explode instead of bounce (off of walls)
                // if (entity.hasTag('fireball'))
                //    this.explodeFireball(entity);
            }


            // player, enemy and bullet hits
            if (aType == pc.BodyType.ENTITY && bType == pc.BodyType.ENTITY)
            {
                // todo: convert the hurts and damage modifier to be a "damager" component with varying levels
                if (entityA.hasTag('swordhit') || entityB.hasTag('swordhit'))
                {
                    // a bullet collided
                    var bullet = entityA.hasTag('swordhit') ? entityA : entityB;
                    var other = (bullet == entityA) ? entityB : entityA;

                    // DAMAGE CHECKING
                    // if the thing the bullet collided with has a brain (is a monster/player)
                    var otherBrain = other.getComponent('brain');
                    if (otherBrain)
                    {
                        otherBrain.tookHit = 10;
                        if (bullet.hasTag('fromOgre'))
                            otherBrain.tookHit = 30;

                        if (other.hasTag('player') && bullet.hasTag('fromPlayer'))
                            otherBrain.tookHit = 0;
                    }

                    if (other.hasTag('wooden'))
                        this.explodeWood(other);
                }

                player = entityA.hasTag('player') ? entityA : entityB;

                // if we are dealing with the player hitting another entity
                if (entityA.hasTag('player') || entityB.hasTag('player'))
                {
                    var player = entityA.hasTag('player') ? entityA : entityB;
                    other = (player == entityA) ? entityB : entityA;
                    t = player == entityA ? fixtureAType : fixtureBType; // foot sensor?

                    // is it the feet that are hitting this thing
                    if (t == 1)
                    {
                        // landing on an entity, which counts as hitting the ground
                        brain = player.getComponent('brain');
                        if (brain.state != Brain.State.DYING)
                            brain.onGround++;
                    }
                    player.getComponent('brain').collidedWith = other;
                }

            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            // check if an entity with a foot sensor is leaving the ground, and decrement the number of foot
            // contacts we have
            if (fixtureAType == 1 || fixtureBType == 1)
            {
                var entity = fixtureAType == 1 ? entityA : entityB;
                var brain = entity.getComponent('brain');
                if (brain.onGround > 0)
                    brain.onGround--;
            }
        },

        explodeFireball: function(fireball)
        {
            // explode in a ball of flames and stuff
            pc.device.game.soundManager.play('fireball-explode');
            fireball.removeComponent(fireball.getComponent('emitter'));
            var spatial = fireball.getComponent('spatial');

            fireball.addComponent(pc.components.ParticleEmitter.create(
                {
                    spriteSheet:this.explosionSheet,
                    burst:pc.Math.rand(8, 12),
                    shots:1,
                    thrustMin:28, thrustMax:36,
                    thrustTime:100,
                    lifeMin:800,
                    fadeOutTime:200,
                    spinMin:-200, spinMax:400,
                    angleMin:180,
                    angleMax:360,
                    relativeAngle: false,
                    gravityY:0.09,
                    rotateSprite:true,
                    compositeOperation:'lighter'

                }));
            fireball.getComponent('physics').setCollisionMask(0);
            fireball.getComponent('physics').setCollisionGroup(0);
            // already have an expiry component, so set/reset the lifetime to give us time
            // to die/explode
            fireball.getComponent('expiry').lifetime = 800;

        },

        explodeWood: function(entity)
        {
            pc.device.game.soundManager.play('wood-explode');

            if (entity.getComponent('expiry')) return; // already exploding

            // throw out wood pieces using an emitter
            entity.addComponent(pc.components.ParticleEmitter.create(
                {
                    spriteSheet:this.debrisSheet,
                    burst:pc.Math.rand(5, 12),
                    delay:20,
                    scaleXMin:0.2,
                    scaleYMin:0.2,
                    shots:1,
                    thrustMin:38, thrustMax:56,
                    thrustTime:100,
                    lifeMin:800,
                    fadeOutTime:200,
                    spinMin:-200, spinMax:400,
                    angleMin:-180, angleMax:0,
                    gravityY:0.09,
                    rotateSprite:true
                }));

            entity.getComponent('physics').setLinearVelocity(0, 0);
            entity.getComponent('physics').setCollisionMask(0);
            entity.getComponent('physics').setCollisionGroup(0);
            entity.addComponent(pc.components.Expiry.create({ lifetime:2000 }));

            // change to an explosion sprite
            entity.removeComponentByType('sprite');
            entity.addComponent(pc.components.Sprite.create({ spriteSheet:this.explosionSheet }));

        }
    });


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        backgroundLayer:null,
        backgroundOverlayLayer: null,
        gameLayer:null,
        bgLayer:null,
        tileLayer:null,
        overlayLayer:null,
        uiLayer:null,
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
            this.loadFromTMX(pc.device.loader.get('level1').resource, this.entityFactory);

            // These are the tile and entity layers contained in the TMX map file (from Tiled)
            // we grab references to the layers so we can manually set the drawing order through
            // the z-index. The backgroundOverlayLayer also has a special function in that
            // the movement code will check for the presence of tiles with the climable property
            // set to detect ladders/vines etc.
            this.bgEntityLayer = this.get('backgroundEntity');
            this.bgEntityLayer.setZIndex(2);
            this.bgLayer = this.get('background');
            this.bgLayer.setZIndex(9);
            this.backgroundOverlayLayer = this.get('background-overlay');
            this.backgroundOverlayLayer.setZIndex(10);
            this.tileLayer = this.get('tiles');
            this.tileLayer.setZIndex(11);
            this.overlayLayer = this.get('overlay');
            this.overlayLayer.setZIndex(13);
            this.bgEntityLayer.addSystem(new pc.systems.Render());
            this.bgEntityLayer.addSystem(new pc.systems.Particles());
            this.bgEntityLayer.addSystem(new pc.systems.Activation());

            //------------------------------------------------------------------------------------------------
            // Game Layer
            //------------------------------------------------------------------------------------------------

            // generate the shadow background map
            this.gameLayer = this.get('entity');
            this.gameLayer.setZIndex(20);

            // setup origin tracking (these layers will maintain an origin linked to the main game layer)
            this.tileLayer.setOriginTrack(this.gameLayer);
            this.backgroundOverlayLayer.setOriginTrack(this.gameLayer);
            this.overlayLayer.setOriginTrack(this.gameLayer);
            this.bgLayer.setOriginTrack(this.gameLayer);
            this.bgEntityLayer.setOriginTrack(this.gameLayer);

            // get the player entity
            this.player = this.gameLayer.entityManager.getTagged('PLAYER').first.object();
            this.playerSpatial = this.player.getComponent('spatial');

            // fire up the systems we need for the game layer. tiles from the tileLayer are added to this layer
            // as a collision map
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
            this.gameLayer.addSystem(new HealthBarSystem());
            this.gameLayer.addSystem(new BrainSystem());
            this.gameLayer.addSystem(new PlayerControlSystem());

            // create the health bar
            //------------------------------------------------------------------------------------------------
            // UI Layer
            //------------------------------------------------------------------------------------------------

            this.uiLayer = new pc.EntityLayer('ui layer');
            this.uiLayer.addSystem(new pc.systems.Layout());
            this.uiLayer.addSystem(new pc.systems.Render());
            this.uiLayer.addSystem(new pc.systems.Effects());
            this.uiLayer.addSystem(new pc.systems.Expiration());
            this.uiLayer.addSystem(new pc.systems.Input());
            this.uiLayer.addSystem(new HealthBarSystem());
            this.uiLayer.setZIndex(100);
            this.addLayer(this.uiLayer);

            var healthBar = pc.Entity.create(this.uiLayer);
            healthBar.addComponent(HealthBar.create(this.player, pc.device.canvasWidth / 5, 15));
            healthBar.addComponent(pc.components.Spatial.create({ }));
            healthBar.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{left:10, top:10 } }));

            // add some simple instructions
            var e = pc.Entity.create(this.uiLayer);
            e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
            e.addComponent(pc.components.Fade.create({ startDelay:1000, holdTime:2000, fadeInTime:1500, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ text:['Left/right to move', 'Space to attack', 'F for fireballs'], lineWidth:0,
                fontHeight:14, offset:{x:25, y:-45} }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:70 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{ left:80 } }));

            // if this is a touch device, construct a UI layer entity for the left/right arrows
            // then redirect the touch events to the player
//            if (pc.device.isTouch)
            {
                var h = 80;
                var w = 80;

                // left arrow direction control
                var leftArrow = pc.Entity.create(this.uiLayer);
                leftArrow.addComponent(pc.components.Spatial.create({x:0, y:this.viewPort.h-h, dir:0, w:w, h:h}));
                leftArrow.addComponent(pc.components.Poly.create({ color:'#888888', points:[
                    [0, h/2],
                    [w, 0],
                    [w, h],
                    [0, h/2]
                ] }));
                leftArrow.addComponent(pc.components.Alpha.create({ level:0.2 }));
                leftArrow.addComponent(pc.components.Input.create(
                    {
                        target:this.player, // actions/states will be sent/set on the player, not this arrow
                        states:[
                            ['moving left', ['TOUCH', 'MOUSE_LEFT_BUTTON'], true]
                        ]
                    }));

                // right arrow direction control
                var rightArrow = pc.Entity.create(this.uiLayer);
                rightArrow.addComponent(pc.components.Spatial.create({x:w+5, y:this.viewPort.h - h, dir:0, w:w, h:h}));
                rightArrow.addComponent(pc.components.Poly.create({ color:'#888888', points:[
                    [0, 0],
                    [w, h/2],
                    [0, h],
                    [0, 0]
                ] }));
                rightArrow.addComponent(pc.components.Alpha.create({ level:0.2 }));
                rightArrow.addComponent(pc.components.Input.create(
                    {
                        target:this.player, // actions/states will be sent/set on the player, not this arrow
                        states:[
                            ['moving right', ['TOUCH', 'MOUSE_LEFT_BUTTON'], true]
                        ]
                    }));

            }

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

            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            //fillStyle = '#000';
            //pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            this._super();
        }

    });


EntityFactory = pc.EntityFactory.extend('EntityFactory',
    { },
    {
        playerSheet:null,
        zombieSheet:null,
        explosionSheet:null,
        crate1Sheet: null,
        crate2Sheet: null,
        plankSheet: null,
        rockSheet: null,
        smokeSheet: null,

        init:function ()
        {
            // setup sprites
            this.explosionSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('explosions').resource, scaleX:0.5, scaleY:0.5, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'fireball1', frameY:1, frameCount:15, time:200});

            this.crate1Sheet = new pc.SpriteSheet({ image:pc.device.loader.get('crate1').resource, useRotation:true });
            this.crate2Sheet = new pc.SpriteSheet({ image:pc.device.loader.get('crate2').resource, useRotation:true });
            this.plankSheet = new pc.SpriteSheet({ image:pc.device.loader.get('plank').resource, useRotation:true });
            this.rockSheet = new pc.SpriteSheet({ image:pc.device.loader.get('rock').resource, useRotation:true });

            this.smokeSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('lava').resource,
                    frameWidth:64, frameHeight:64, framesWide:4, framesHigh:1, useRotation:false});

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
            this.playerSheet.addAnimation({ name:'climbing', frameCount:4, frameX:5, frameY:3, offsetX:16, offsetY:-11, time:400 });

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

            //
            // OGRE
            //
            this.ogreSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('ogre').resource, framesWide:6, framesHigh:10, useRotation:false });

            this.ogreSheet.addAnimation({ name:'standing right', frameX:0, frameY:0, frameCount:9, offsetY: -30, offsetX: 25, time:1900 });
            this.ogreSheet.addAnimation({ name:'standing left', frameX:0, frameY:0, frameCount:9, offsetY: -30, offsetX: 65, time:1900, scaleX:-1});
            this.ogreSheet.addAnimation({ name:'attacking right', frameCount:14, frameX:3, frameY:1, offsetY:-30, offsetX:25, time:1500, loops:1 });
            this.ogreSheet.addAnimation({ name:'attacking left', frameCount:14, frameX:3, frameY: 1, offsetY:-30, offsetX:65, scaleX:-1, time:1500, loops:1 });
            this.ogreSheet.addAnimation({ name:'jumping right', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:25, time:2400 });
            this.ogreSheet.addAnimation({ name:'jumping left', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:65, scaleX:-1, time:2400 });
            this.ogreSheet.addAnimation({ name:'walking right', frameCount:15, frameX: 5, frameY: 3, offsetY:-30, offsetX:25, time:2400 });
            this.ogreSheet.addAnimation({ name:'walking left', frameCount:15, frameX: 5, frameY: 3, offsetY:-30, offsetX:65, scaleX:-1, time:2400 });
            this.ogreSheet.addAnimation({ name:'dying right', frameCount:15, frameX:2, frameY:6, offsetY:-30, offsetX:25, holdOnEnd:true, time:2500, loops:1 });
            this.ogreSheet.addAnimation({ name:'dying left', frameCount:15, frameX:2, frameY:6, offsetY:-30, offsetX:65, holdOnEnd:true, time:2500, scaleX:-1, loops:1 });
            this.ogreSheet.addAnimation({ name:'recoiling right', frameCount:5, frameX:5, frameY:8, offsetY:-30, offsetX:25, time:1000, loops:1 });
            this.ogreSheet.addAnimation({ name:'recoiling left', frameCount:5, frameX:5, frameY:8, offsetY:-30, offsetX:65, time:1000, scaleX:-1, loops:1 });
        },

        createEntity:function (layer, type, x, y, dir)
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
                                { type:1, sensorOnly:true, shape:pc.CollisionShape.CIRCLE, offset:{y:20, w:-68} }
                            ],

                            collisionGroup:1,
                            collisionCategory:CollisionType.FRIENDLY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY | CollisionType.WALL
                        }));

                    // input control
                    e.addComponent(pc.components.Input.create(
                        {
                            states:[
                                ['moving right', ['D', 'RIGHT']],
                                ['moving left', ['A', 'LEFT']],
                                ['jumping', ['W', 'UP']],
                                ['blocking', ['S', 'DOWN']],
                                ['attacking', ['SPACE']],
                                ['casting', ['F', 'ENTER']]
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
                    e.addComponent(pc.components.Activator.create({ tag:'player', range:1500 }));
                    e.addComponent(HealthBar.create(e, 26, 5, 26, 0));

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

                case 'ogre':
                    e = pc.Entity.create(layer);
                    e.addTag('enemy');
                    e.addTag('ogre');

                    e.addComponent(pc.components.Sprite.create(
                        {
                            spriteSheet:this.ogreSheet,
                            animationStart:'standing left',
                            animationStartDelay:pc.Math.rand(0, 300)

                        }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.ogreSheet.frameWidth, h:this.ogreSheet.frameHeight}));
                    e.addComponent(pc.components.Activator.create({ tag:'player', range:1200 }));
                    e.addComponent(HealthBar.create(e, 42, 8, 60, 0));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:3, y:150},
                            friction:0.1,
                            fixedRotation:true,
                            bounce:0,
                            mass:1.8,
                            shapes:[
                                { shape:pc.CollisionShape.RECT, offset:{x:6, y:-10, w:-122, h:-60} }
                            ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.WALL
                        }));

                    bloodSheet = new pc.SpriteSheet(
                        { image:pc.device.loader.get('blood').resource, framesWide:4 });

                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            active:false,
                            spriteSheet:bloodSheet,
                            burst:5,
                            delay:20,
                            shots:5,
                            thrustMin:10, thrustTime:300,
                            maxVelX:15, maxVelY:15,
                            angleMin:-60, angleMax:60,
                            scaleXMin: 2.5, scaleYMin: 2.5,
                            lifeMin:400,
                            alphaMin:0, alphaMax:1, alphaDelay:50,
                            gravityY:0.07,
                            offsetX:72,
                            offsetY:60,
                            rangeY: 10,
                            rotateSprite:true
                        }));

                    e.addComponent(Health.create(500));
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
                    backdrop.addComponent(pc.components.Clip.create({ clipEntity:e, x:1, y:1 }));
                    backdrop2.addComponent(pc.components.Clip.create({ clipEntity:e, x:1, y:1, w:-20}));

                    return e;

                case 'lightrays':
                    e = pc.Entity.create(layer);
                    var lightraysSheet = new pc.SpriteSheet({ image:pc.device.loader.get('lightrays').resource });
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:lightraysSheet }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, x:x, y:y,
                        w:lightraysSheet.frameWidth, h:lightraysSheet.frameHeight }));
                    return e;

                case 'fireball':
                    e = pc.Entity.create(layer);
                    e.addTag('bullet');
                    e.addTag('fireball');
                    e.addTag('hurts');

                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.explosionSheet,
                            burst:1,
                            delay:10,
                            lifeMin:120,
                            fadeOutTime:120,
                            compositeOperation:'lighter'
                        }));
                    e.addComponent(pc.components.Spatial.create({ dir:dir, x:x, y:y,
                        w:this.explosionSheet.frameWidth, h:this.explosionSheet.frameHeight }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:250, y:250},
                            friction:0.1,
                            fixedRotation:true,
                            force:140,
                            bounce:0.6,
                            gravity:{x:0, y:3},
                            shapes:[
                                { shape:pc.CollisionShape.CIRCLE, offset:{w:-50} }
                            ],
                            collisionCategory:CollisionType.FRIENDLY,
                            collisionGroup:1,
                            collisionMask:CollisionType.ENEMY | CollisionType.WALL
                        }));
                    e.addComponent(pc.components.Fade.create({ holdTime: 1300, fadeOutTime:200 }));
                    e.addComponent(pc.components.Expiry.create({ lifetime:1500 }));
                    return e;

                case 'crate':
                    e = pc.Entity.create(layer);
                    e.addTag('crate');
                    e.addTag('wooden'); // make me destructible with wood debris

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:pc.Math.rand(0, 1) == 0 ? this.crate1Sheet : this.crate2Sheet}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.crate1Sheet.frameWidth, h:this.crate1Sheet.frameHeight}));
                    e.addComponent(pc.components.Physics.create({
                        collisionCategory:CollisionType.FRIENDLY,
                        collisionMask:CollisionType.ENEMY | CollisionType.FRIENDLY| CollisionType.WALL,
                        collisionGroup:1,
                        bounce:0.01,        // crates don't bounce much
                        mass:2,
                        angularDamping:60   // and don't rotate much
                    }));
                    return e;

                case 'plank':
                    e = pc.Entity.create(layer);
                    e.addTag('plank');
                    e.addTag('wooden'); // make me destructible with wood debris

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.plankSheet}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.plankSheet.frameWidth, h:this.plankSheet.frameHeight}));
                    e.addComponent(pc.components.Physics.create({
                        collisionCategory:CollisionType.FRIENDLY,
                        collisionMask:CollisionType.ENEMY | CollisionType.FRIENDLY | CollisionType.WALL,
                        collisionGroup:1,
                        mass:1
                    }));
                    return e;

                case 'rock':
                    e = pc.Entity.create(layer);
                    e.addTag('rock');
                    e.addTag('hurts');

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.rockSheet}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.rockSheet.frameWidth, h:this.rockSheet.frameHeight}));
                    e.addComponent(pc.components.Physics.create({
                        collisionCategory:CollisionType.FRIENDLY,
                        collisionMask:CollisionType.ENEMY | CollisionType.FRIENDLY | CollisionType.WALL,
                        collisionGroup:1,
                        shapes:[
                            { shape:pc.CollisionShape.CIRCLE, offset:{w:0} }
                        ],
                        bounce:0.01,
                        mass:4,
                        angularDamping:60
                    }));
                    return e;

                case 'lava':
                    e = pc.Entity.create(layer);
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, h:5, w:10 }));
                    e.addComponent(pc.components.ParticleEmitter.create(
                        {
                            spriteSheet:this.smokeSheet,
                            burst:1,
                            delay:180,
                            lifeMin:3000,
                            angleMin: 0, angleMax:0,
                            thrustMin: 0,
                            rangeX:60,
                            rangeY:3,
                            gravityY:0.04,
                            gravityX:0,
                            //scaleXMin:1, scaleXMax:1,
                            scaleYMin:0.05, scaleYMax:0.25,
                            //scaleXMin:-1, scaleXMax:1,
                            growYMin:2,
                            growXMin:0.5,
                            fadeOutTime:500,
                            fadeInTime:300,
                            compositeOperation:'lighter',
                            /*
                            spriteSheet:this.smokeSheet,
                            burst:2,
                            delay:120,
                            lifeMin:1200,
                            rangeX:40,
                            rangeY:2,
                            gravityY:0.04,
                            scaleXMin:2.5, scaleXMax:2.5,
                            scaleYMin:4.5, scaleYMax:4.5,
                            fadeOutTime:200,
                            compositeOperation:'lighter'
                            */

                        }));
                    e.addComponent(pc.components.Activator.create({ layer: 'entity', tag:'player', range:2000 }));

                    return e;

            }
        }
    });

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


/**
 * A simple sound manager to take care of finding sounds by name, holding references and setting volume
 * (plus detecting if sound is enabled in one play)
 * @type {*}
 */
SoundManager = pc.Base.extend('SoundManager',
    { },
    {
        sounds:null,

        init:function ()
        {
            if (pc.device.soundEnabled)
            {
                this.sounds = new pc.Hashmap();

                // volume adjustments
                pc.device.loader.get('fireball-cast').resource.setVolume(0.5);
                pc.device.loader.get('fireball-explode').resource.setVolume(0.8);
                pc.device.loader.get('wood-explode').resource.setVolume(0.2);
                pc.device.loader.get('sword-swing').resource.setVolume(0.5);
                pc.device.loader.get('zombie-alert').resource.setVolume(0.3);
                pc.device.loader.get('zombie-brains').resource.setVolume(0.3);
                pc.device.loader.get('player-pain1').resource.setVolume(0.8);
                pc.device.loader.get('player-pain2').resource.setVolume(0.8);
                pc.device.loader.get('blood-hit1').resource.setVolume(0.8);
                pc.device.loader.get('blood-hit2').resource.setVolume(0.8);

                // add them to the lookup map for quick access
                // todo: replace this by for looping through pc.device.loader.getAllSounds()
                this.sounds.put('fireball-cast', pc.device.loader.get('fireball-cast').resource);
                this.sounds.put('fireball-explode', pc.device.loader.get('fireball-explode').resource);
                this.sounds.put('wood-explode', pc.device.loader.get('wood-explode').resource);
                this.sounds.put('sword-swing', pc.device.loader.get('sword-swing').resource);
                this.sounds.put('zombie-alert', pc.device.loader.get('zombie-alert').resource);
                this.sounds.put('zombie-brains', pc.device.loader.get('zombie-brains').resource);
                this.sounds.put('player-pain1', pc.device.loader.get('player-pain1').resource);
                this.sounds.put('player-pain2', pc.device.loader.get('player-pain2').resource);
                this.sounds.put('blood-hit1', pc.device.loader.get('blood-hit1').resource);
                this.sounds.put('blood-hit2', pc.device.loader.get('blood-hit2').resource);
            }
        },

        play:function (sound)
        {
            if (!pc.device.soundEnabled)
                return;

            var s = this.sounds.get(sound);
            if (!s) throw 'Oops, invalid sound name: ' + sound;
            s.play();
        }

    });

