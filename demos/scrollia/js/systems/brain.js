

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
                if ((entity.hasTag('zombie') || entity.hasTag('ogre')) && brain.state != Brain.State.RECOILING)
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
                                    if (pc.Math.rand(1, 3) == 1)
                                        pc.device.game.soundManager.play('zombie-brains');

                                brain.wantsToWalk = true;
                            } else
                            {

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
                            {x:sp.pos.x + (sp.dim.x / 2) - 15, y:(sp.pos.y + (sp.dim.y / 2)) - 10, dir:brain.facingRight ? 0 : 180, w:10, h:10}));
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


