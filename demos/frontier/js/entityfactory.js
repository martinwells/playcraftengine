EntityFactory = pc.EntityFactory.extend('EntityFactory',
    { },
    {
        enemySheet:null,
        plasmaFireSheet:null,
        smokeSheet:null,
        smallAsteroidSheet: null,
        asteroidSheet: null,

        init:function ()
        {
            // setup the sprites used in the game scene
            this.asteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid1').resource, useRotation:true, frameWidth:64, frameHeight:64 });
            this.asteroidSheet.addAnimation({ name:'floating', time:500, frameCount:20 });

            this.smallAsteroidSheet = new pc.SpriteSheet({ image:pc.device.loader.get('asteroid-small').resource, useRotation:true, frameWidth:24, frameHeight:24 });
            this.smallAsteroidSheet.addAnimation({ name:'floating', time:500, frameCount:20 });

            this.playerSheet = new pc.SpriteSheet(
                { image:pc.device.loader.get('playerShip').resource, frameWidth:40, frameHeight:40, useRotation:true});
            this.playerSheet.addAnimation({ name:'floating', frameCount:1});

            this.plasmaFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('plasma-fire').resource, frameWidth:30, frameHeight:30 });
            this.plasmaFireSheet.addAnimation({ name:'floating', time:400, dirAcross:true });

            this.explosionSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('explosions').resource,
                    frameWidth:24, frameHeight:24, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'exploding', frameY:3, framesCount:16, time:1600, loops:1 });
        },

        createEntity:function (type, layer, x, y, dir)
        {
            var e = null;

            switch (type)
            {
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

                    // attach the engine emitter (it's an entity so it can be attached to the back of the ship)
                    var engine = pc.Entity.create(layer);
                    engine.addComponent(pc.components.Spatial.create({ dir:dir, w:20, h:20}));
                    engine.addComponent(pc.components.Physics.create({ shapes:[
                        { shape:pc.CollisionShape.CIRCLE }
                    ] }));
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
                            attachedTo:e,
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
                            shapes:[
                                { offset:{w:-25}, shape:pc.CollisionShape.CIRCLE }
                            ],
                            collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY
                        }));

                    return e;

                case 'enemy':
                    e = pc.Entity.create(layer);

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.enemySheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.enemySheet.frameWidth, h:this.enemySheet.frameHeight}));
                    return e;

            }

            throw "unknown entity type: " + type;
        }

    });
