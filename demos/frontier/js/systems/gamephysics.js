GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        smokeSheet:null,
        explosionSound:null,
        encouragements:null,

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
                            this.layer.scene.createEntity(this.layer, 'asteroid-small',
                                sp.getCenterPos().x + pc.Math.rand(-10, 10),
                                sp.getCenterPos().y + pc.Math.rand(-10, 10));

                        entityA.layer.scene.asteroidsLeft += count;
                    }
                }
            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        }

    });
