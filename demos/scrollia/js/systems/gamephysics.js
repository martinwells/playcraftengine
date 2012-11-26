GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        explosionSheet:null,
        smokeSheet:null,
        debrisSheet:null,

        init:function (options)
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
                {image:pc.device.loader.get('crate-debris').resource, scaleX:0.1, scaleY:0.1, frameWidth:42, frameHeight:42, framesWide:2, framesHigh:1});
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

        explodeFireball:function (fireball)
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
                    relativeAngle:false,
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

        explodeWood:function (entity)
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

