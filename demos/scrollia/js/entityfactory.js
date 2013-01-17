EntityFactory = pc.EntityFactory.extend('EntityFactory',
    { },
    {
        playerSheet:null,
        zombieSheet:null,
        explosionSheet:null,
        crate1Sheet:null,
        crate2Sheet:null,
        plankSheet:null,
        rockSheet:null,
        smokeSheet:null,

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

            this.ogreSheet.addAnimation({ name:'standing right', frameX:0, frameY:0, frameCount:9, offsetY:-30, offsetX:25, time:1900 });
            this.ogreSheet.addAnimation({ name:'standing left', frameX:0, frameY:0, frameCount:9, offsetY:-30, offsetX:65, time:1900, scaleX:-1});
            this.ogreSheet.addAnimation({ name:'attacking right', frameCount:14, frameX:3, frameY:1, offsetY:-30, offsetX:25, time:1500, loops:1 });
            this.ogreSheet.addAnimation({ name:'attacking left', frameCount:14, frameX:3, frameY:1, offsetY:-30, offsetX:65, scaleX:-1, time:1500, loops:1 });
            this.ogreSheet.addAnimation({ name:'jumping right', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:25, time:2400 });
            this.ogreSheet.addAnimation({ name:'jumping left', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:65, scaleX:-1, time:2400 });
            this.ogreSheet.addAnimation({ name:'walking right', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:25, time:2400 });
            this.ogreSheet.addAnimation({ name:'walking left', frameCount:15, frameX:5, frameY:3, offsetY:-30, offsetX:65, scaleX:-1, time:2400 });
            this.ogreSheet.addAnimation({ name:'dying right', frameCount:15, frameX:2, frameY:6, offsetY:-30, offsetX:25, holdOnEnd:true, time:2500, loops:1 });
            this.ogreSheet.addAnimation({ name:'dying left', frameCount:15, frameX:2, frameY:6, offsetY:-30, offsetX:65, holdOnEnd:true, time:2500, scaleX:-1, loops:1 });
            this.ogreSheet.addAnimation({ name:'recoiling right', frameCount:5, frameX:5, frameY:8, offsetY:-30, offsetX:25, time:1000, loops:1 });
            this.ogreSheet.addAnimation({ name:'recoiling left', frameCount:5, frameX:5, frameY:8, offsetY:-30, offsetX:65, time:1000, scaleX:-1, loops:1 });
        },

        createEntity:function (layer, type, x, y, dir, shape, options)
        {
            var e = null;

            switch (type)
            {
                case 'collidable':
                    e = pc.Entity.create(layer);
                    e.addTag('COLLIDABLE TERRAIN');

                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, w:1, h:1 }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            centered:false,
                            mass:10,
                            immovable:true,
                            shapes:[
                                { points:shape.points, shape:pc.CollisionShape.POLY }
                            ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.WALL
                        }));

                    return e;

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
                    e.addComponent(Health.create(100, 500));
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
                            scaleXMin:2.5, scaleYMin:2.5,
                            lifeMin:400,
                            alphaMin:0, alphaMax:1, alphaDelay:50,
                            gravityY:0.07,
                            offsetX:72,
                            offsetY:60,
                            rangeY:10,
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
                    e.addComponent(pc.components.Fade.create({ holdTime:1300, fadeOutTime:200 }));
                    e.addComponent(pc.components.Expiry.create({ lifetime:1500 }));
                    return e;

                case 'crate':
                    e = pc.Entity.create(layer);
                    e.addTag('crate');
                    e.addTag('wooden'); // make me destructible with wood debris

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:pc.Math.rand(0, 1) == 0 ? this.crate1Sheet : this.crate2Sheet}));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                        w:this.crate1Sheet.frameWidth, h:this.crate1Sheet.frameHeight}));
                    e.addComponent(pc.components.Input.create({ actions:[
                        ['crate pressed', ['MOUSE_BUTTON_LEFT_DOWN'], true]
                    ]}));
                    e.addComponent(pc.components.Physics.create({
                        collisionCategory:CollisionType.FRIENDLY,
                        collisionMask:CollisionType.ENEMY | CollisionType.FRIENDLY | CollisionType.WALL,
                        collisionGroup:1,
                        bounce:0.01, // crates don't bounce much
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
                            angleMin:0, angleMax:0,
                            thrustMin:0,
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
                    e.addComponent(pc.components.Activator.create({ layer:'entity', tag:'player', range:2000 }));

                    return e;

            }

            throw "Unknown entity type: " + type;
        }

    });
