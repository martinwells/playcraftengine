/**
 * AngryCannons
 */

CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004, // 0000100
    WALL:0x0008
};

GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        smokeSheet:null,
        debrisSheet: null,
        explosionSheet: null,
        smashSound: null,

        init:function (options)
        {
            this._super(options);

            // sound for the crates smashing
            if (pc.device.soundEnabled)
            {
                this.smashSound = pc.device.loader.get('smash').resource;
                this.smashSound.setVolume(0.2);
            }

            // smoke
            this.smokeSheet = new pc.SpriteSheet({image:pc.device.loader.get('smoke').resource,
                    frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.smokeSheet.addAnimation({ name:'smoking', frameCount:16 });

            // explosion
            this.explosionSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('explosions').resource, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'exploding', frameY:5, frameCount:16, time:500, loops:1 });

            // crate debris
            this.debrisSheet = new pc.SpriteSheet(
                {image:pc.device.loader.get('crate-debris').resource, frameWidth: 42, frameHeight: 42, framesWide:2, framesHigh:1});
        },

        onCollision:function (objAType, objBType, entityA, entityB, force)
        {
            if (entityB.hasTag('CRATE') && entityA.hasTag('BULLET') && force > 3.5)
            {
                // change the crate (entityB in this case)
                if (!entityB.hasComponentOfType('expiry'))
                {
                    // play the smashing sound
                    if (this.smashSound)
                        this.smashSound.play();

                    // throw out some debris
                    entityB.addComponent(pc.components.ParticleEmitter.create(
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

                    // stop it moving
                    entityB.getComponent('physics').setLinearVelocity(0, 0);

                    // make sure we no longer collide
                    entityB.getComponent('physics').setCollisionMask(0);

                    // expire the crate entity (after the debris emitter has had a chance to run)
                    entityB.addComponent(pc.components.Expiry.create({ lifetime:2000 }));
                    // change to an explosion sprite
                    entityB.removeComponentByType('sprite');
                    entityB.addComponent(pc.components.Sprite.create({ spriteSheet:this.explosionSheet }));

                    entityB.layer.scene.crateCount--;
                    if (entityB.layer.scene.crateCount <= 0)
                    {
                        entityB.layer.scene.createReminder();
                    }

                }
            }
        },

        onCollisionStart:function (objAType, objBType, entityA, entityB)
        {
        },

        onCollisionEnd:function (objAType, objBType, entityA, entityB)
        {
        }

    });


GameScene = pc.Scene.extend('GameScene',
    { },
    {
        cannonBarrel:null,
        barrelSpatial: null,
        barrelPhysics:null,
        barrelJoint:null,

        backgroundLayer:null,
        gameLayer:null,
        foregroundLayer: null,

        cannonBaseSheet: null,
        cannonBarrelSheet: null,
        cannonBall: null,
        crate1Sheet: null,
        crate2Sheet: null,
        floorY: 0,
        fireSound: null,
        crateCount: 0,

        init:function ()
        {
            this._super();

            // center the game a little for big screens
            this.floorY = pc.device.canvasHeight - 30;
            if (pc.device.canvasHeight > 500)
                this.floorY -= (pc.device.canvasHeight-500)/2;

            //-----------------------------------------------------------------------------
            // sounds
            //-----------------------------------------------------------------------------
            if (pc.device.soundEnabled)
                this.fireSound = pc.device.loader.get('explosion').resource;

            //-----------------------------------------------------------------------------
            // sprite sheet setup
            //-----------------------------------------------------------------------------
            this.cannonBaseSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cannon-base').resource});
            this.cannonBarrelSheet = new pc.SpriteSheet(
                {
                    image: pc.device.loader.get('cannon-barrel').resource,
                    useRotation: true
                });
            this.cannonBallSheet = new pc.SpriteSheet({ image:pc.device.loader.get('cannon-ball').resource });
            this.crate1Sheet = new pc.SpriteSheet({ image:pc.device.loader.get('crate1').resource, useRotation:true });
            this.crate2Sheet = new pc.SpriteSheet({ image:pc.device.loader.get('crate2').resource, useRotation:true });

            var backdropLeftSheet = new pc.SpriteSheet({ image:pc.device.loader.get('backdrop-left').resource });
            var backdropRightSheet = new pc.SpriteSheet({ image:pc.device.loader.get('backdrop-right').resource });

            // stretch the 4 pixel background to be 1600 wide
            var stretchedBackdropRepeat = pc.device.loader.get('backdrop-repeat').resource.resize(400, 1);
            var backdropRepeatSheet = new pc.SpriteSheet({image:stretchedBackdropRepeat, frameWidth:1600, frameHeight:451 });

            //-----------------------------------------------------------------------------
            // background layer
            //-----------------------------------------------------------------------------
            this.backgroundLayer = this.addLayer(new pc.EntityLayer('background layer', 10000, 10000));
            this.backgroundLayer.addSystem(new pc.systems.Render());

            var backgroundMiddle = pc.Entity.create(this.backgroundLayer);
            backgroundMiddle.addComponent(pc.components.Sprite.create({ spriteSheet:backdropRepeatSheet }));
            backgroundMiddle.addComponent(pc.components.Spatial.create({ dir:0, y:this.floorY-510, h:451 }));

            var backgroundLeft = pc.Entity.create(this.backgroundLayer);
            backgroundLeft.addComponent(pc.components.Sprite.create({ spriteSheet:backdropLeftSheet }));
            backgroundLeft.addComponent(pc.components.Spatial.create({ dir:0, y:this.floorY-510, w:618, h:451 }));

            // add a right panel if we have room
            if (pc.device.canvasWidth > (backdropLeftSheet.frameWidth+backdropRightSheet.frameWidth))
            {
                var backgroundRight = pc.Entity.create(this.backgroundLayer);
                backgroundRight.addComponent(pc.components.Sprite.create({ spriteSheet:backdropRightSheet }));
                backgroundRight.addComponent(pc.components.Spatial.create(
                    { dir:0, x:pc.device.canvasWidth-371, y:this.floorY-510, w:371, h:451 }));
            }

            // background grass (behind cannon)
            for (var i = 0; i < (pc.device.canvasWidth/256)+1; i++)
            {
                var e = pc.Entity.create(this.backgroundLayer);
                e.addComponent(pc.components.Sprite.create(
                    { spriteSheet:new pc.SpriteSheet({ image:pc.device.loader.get('grass-far').resource }) }));
                e.addComponent(pc.components.Spatial.create({ dir:0, x:i * 256, y:this.floorY - 100, w:256, h:87 }));
            }

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            // fire up the systems we need for the game layer
            this.gameLayer.addSystem(new GamePhysics({ gravity:{ x:0, y:15 }, debug:false }));
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            // setup the starting entities
            // create a floor
            this.createWall(this.gameLayer, 0, this.floorY-30, pc.device.canvasWidth, 1); // bottom
            this.createWall(this.gameLayer, pc.device.canvasWidth-10, 0, 1, pc.device.canvasHeight); // right side

            // create some rocks
            this.createCrates();

            // add some instructions
            this.createInstructions();

            // create the cannon base and barrel
            this.cannonBarrel = this.createCannon(100, this.floorY - this.cannonBaseSheet.frameHeight - 30);
            this.barrelSpatial = this.cannonBarrel.getComponent('spatial');

            //--------------------------------------------------------------------------------------------
            // foreground layer -- primarily so things appear to fall into the grass which is painted last
            //--------------------------------------------------------------------------------------------

            this.foregroundLayer = this.addLayer(new pc.EntityLayer('foreground layer', 10000, 10000));
            this.foregroundLayer.addSystem(new pc.systems.Render());

            // layover grass
            for (var j = 0; j < (pc.device.canvasWidth / 256) + 1; j++)
            {
                var f = pc.Entity.create(this.foregroundLayer);
                f.addComponent(pc.components.Sprite.create(
                    { spriteSheet:new pc.SpriteSheet({ image:pc.device.loader.get('grass-near').resource }) }));
                f.addComponent(pc.components.Spatial.create({ dir:0, x:j * 256, y:this.floorY - 60, w:256, h:139 }));
            }

            // foreground grass (so much grass)
            for (var k = 0; k < (pc.device.canvasWidth / 256) + 1; k++)
            {
                var grassFore = pc.Entity.create(this.foregroundLayer);
                grassFore.addComponent(pc.components.Sprite.create(
                    { spriteSheet:new pc.SpriteSheet({ image:pc.device.loader.get('grass-foreground').resource }) }));
                grassFore.addComponent(pc.components.Spatial.create({ dir:0, x:k*256-(pc.Math.rand(1, 55)), y:this.floorY+7, w:256, h:72 }));
            }

            // the grey block at the bottom(to cover things falling through if it's not full screen
            var bottomCover = pc.Entity.create(this.foregroundLayer);
            bottomCover.addComponent(pc.components.Rect.create({ color:'#222222', lineWidth:0 }));
            bottomCover.addComponent(pc.components.Spatial.create({ x:0, y:this.floorY+79,
                w:pc.device.canvasWidth, h:pc.device.canvasHeight-(this.floorY+79) }));

            // setup the controls
            pc.device.input.bindState(this, 'aim upwards', 'W');
            pc.device.input.bindState(this, 'aim upwards', 'UP');
            pc.device.input.bindState(this, 'aim downwards', 'S');
            pc.device.input.bindState(this, 'aim downwards', 'DOWN');
            pc.device.input.bindAction(this, 'make crate', 'C');
            pc.device.input.bindAction(this, 'toggle layer 1', '1');
            pc.device.input.bindAction(this, 'toggle layer 2', '2');
            pc.device.input.bindAction(this, 'toggle layer 3', '3');
            pc.device.input.bindState(this, 'firing', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindState(this, 'firing', 'TOUCH');
            pc.device.input.bindState(this, 'firing', 'SPACE');

        },


        createCrates: function()
        {
            // bottom row of our pyramid stack
            var placeY = this.floorY - 60;
            var placeX = pc.device.canvasWidth - 180 - (48*8);
            for (var i=0; i < 5; i++)
                this.createCrate(placeX+(i*48),
                    placeY - this.crate1Sheet.frameHeight-2);
            for (i = 0; i < 4; i++)
                this.createCrate(placeX + (i * 48),
                    placeY - 100 - this.crate1Sheet.frameHeight - 48 - 2 );
            for (i = 0; i < 2; i++)
                this.createCrate(placeX + 32 + (i * 64),
                    placeY - 100 - this.crate1Sheet.frameHeight - 96 - 2);
        },

        createCrate: function(x, y)
        {
            if (this.crateCount > 25) return;
            this.crateCount++;

            var crate = pc.Entity.create(this.gameLayer);
            crate.addTag('CRATE');
            crate.addComponent(pc.components.Sprite.create({ spriteSheet:pc.Math.rand(0,1) == 0 ? this.crate1Sheet : this.crate2Sheet}));
            crate.addComponent(pc.components.Spatial.create({x:x, y:y + (pc.Math.rand(6, 24)), dir:pc.Math.rand(0, 20),
                w:this.crate1Sheet.frameWidth, h:this.crate1Sheet.frameHeight}));
            crate.addComponent(pc.components.Physics.create({
                collisionCategory:CollisionType.ENEMY,
                collisionGroup: 1,
                collisionMask:CollisionType.FRIENDLY,
                bounce:0.01,        // crates don't bounce much
                mass:1,
                angularDamping:60   // and don't rotate much
            }));

        },

        //
        // Create the cannon
        //
        createCannon:function (x, y)
        {
            // cannon barrel
            var barrel = pc.Entity.create(this.gameLayer);
            barrel.addComponent(pc.components.Sprite.create({ spriteSheet:this.cannonBarrelSheet }));
            barrel.addComponent(pc.components.Spatial.create({ dir:330, w:this.cannonBarrelSheet.frameWidth,
                h: this.cannonBarrelSheet.frameHeight}));
            this.barrelPhysics = barrel.addComponent(pc.components.Physics.create({
                collisionCategory:CollisionType.FRIENDLY,
                collisionMask:CollisionType.ENEMY|CollisionType.FRIENDLY, mass: 1,
                fixedRotation:true,
                centerOfMass: { x:15, y:2 } // offset the center of mass of the barrel so it turns on the right pivot
            }));

            // base of the cannon
            var cannonBase = pc.Entity.create(this.gameLayer);
            cannonBase.addComponent(pc.components.Sprite.create({ spriteSheet:this.cannonBaseSheet }));
            cannonBase.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0,
                w:this.cannonBaseSheet.frameWidth, h:this.cannonBaseSheet.frameHeight}));
            cannonBase.addComponent(pc.components.Physics.create({
                fixedRotation:true,
                collisionCategory:CollisionType.FRIENDLY,
                collisionMask:CollisionType.FRIENDLY, mass: 10
            }));

            // attach the barrel to the base
            this.barrelJoint = barrel.addComponent(pc.components.Joint.create(
                {
                    attachedTo:cannonBase,
                    type:pc.JointType.REVOLUTE,
                    offset:{x:18, y:-20},               // where on the barrel the joint is
                    attachmentOffset:{x:-15, y:0}       // where on the cannon base the joint is
                }));

            return barrel;
        },

        createCannonBall:function (x, y, dir)
        {
            var e = pc.Entity.create(this.gameLayer);

            e.addTag('BULLET');
            e.addComponent(pc.components.Sprite.create({ spriteSheet:this.cannonBallSheet }));
            e.addComponent(pc.components.Expiry.create({ lifetime:5000 }));
            e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                w:this.cannonBallSheet.frameWidth, h:this.cannonBallSheet.frameHeight}));

            e.addComponent(pc.components.Physics.create(
                {
                    maxSpeed:{x:80, y:80},
                    force:140,
                    bounce:0.1,
                    collisionCategory:CollisionType.FRIENDLY,
                    collisionMask:CollisionType.FRIENDLY|CollisionType.ENEMY
                }));
        },

        createInstructions:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
            e.addComponent(pc.components.Fade.create({ startDelay:1000, holdTime: 2000, fadeInTime:1500, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ text:['Up/Down to Aim', 'Space to fire', 'C for more crates'], lineWidth:0,
                fontHeight:14, offset:{x:25, y:-45} }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:70 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{ left:80 } }));

            return e;
        },

        createReminder:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
            e.addComponent(pc.components.Fade.create({ holdTime:2500, fadeInTime:500, fadeOutTime:500 }));
            e.addComponent(pc.components.Text.create({ text:['Press C to add more crates'], lineWidth:0,
                fontHeight:14, offset:{x:10, y:-15} }));
            e.addComponent(pc.components.Expiry.create({ lifetime:4000 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:200, h:40 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'right', margin:{ right:80 } }));

            return e;
        },

        createWall:function (layer, x, y, w, h)
        {
            var e = pc.Entity.create(layer);
            e.addTag('WALL');
            e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, w:w, h:h }));
            e.addComponent(pc.components.Physics.create({ immovable:true,
                collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY }));
        },

        lastFireTime:0,
        fireDelay:400,
        angle: 330,

        process:function ()
        {
            if (!pc.device.loader.finished) return;

            if (pc.device.input.isInputState(this, 'aim downwards'))
            {
                this.angle = pc.Math.rotate(this.angle, 1);
                if (this.angle > 10 && this.angle < 300)
                    this.angle -= 1;
                this.barrelPhysics.setDir(this.angle);
            }

            if (pc.device.input.isInputState(this, 'aim upwards'))
            {
                this.angle = pc.Math.rotate(this.angle, -1);
                if (this.angle < 300 && this.angle > 45)
                    this.angle += 1;
                this.barrelPhysics.setDir(this.angle);

            }

            if (pc.device.input.isInputState(this, 'firing'))
            {
                var sinceLastFire = pc.device.now - this.lastFireTime;
                if (sinceLastFire > this.fireDelay)
                {
                    var tc = this.barrelSpatial.getCenterPos();
                    tc.moveInDir(this.barrelSpatial.dir, 50);
                    this.createCannonBall(tc.x-6, tc.y-6, this.barrelSpatial.dir);

                    if (this.fireSound)
                        this.fireSound.play();

                    this.lastFireTime = pc.device.now;
                }
            }

            pc.device.ctx.fillStyle = '#333';
            pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            this._super();
        },

        onAction:function (actionName, event, pos)
        {
            if (actionName === 'toggle layer 1') this.toggleLayerActive(this.backgroundLayer);
            if (actionName === 'toggle layer 2') this.toggleLayerActive(this.gameLayer);
            if (actionName === 'toggle layer 3') this.toggleLayerActive(this.foregroundLayer);

            if (actionName === 'make crate')
            {
                var crateX = pc.Math.rand(pc.device.canvasWidth - 250 - (48 * 6), pc.device.canvasWidth - 250 -  (48 * 3));
                var crateY = this.floorY - 360;
                this.createCrate(crateX, crateY);
            }
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
            pc.device.loader.add(new pc.Image('explosions', 'images/explosions.png'));
            pc.device.loader.add(new pc.Image('cannon-ball', 'images/cannon_ball.png'));
            pc.device.loader.add(new pc.Image('cannon-base', 'images/cannon_base.png'));
            pc.device.loader.add(new pc.Image('cannon-barrel', 'images/cannon_barrel.png'));
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke1.png'));
            pc.device.loader.add(new pc.Image('crate1', 'images/crate2.png'));
            pc.device.loader.add(new pc.Image('crate2', 'images/crate3.png'));
            pc.device.loader.add(new pc.Image('crate-damage', 'images/crate_damage.png'));
            pc.device.loader.add(new pc.Image('crate-debris', 'images/crate_debris.png'));
            pc.device.loader.add(new pc.Image('backdrop-left', 'images/backdrop_left.png'));
            pc.device.loader.add(new pc.Image('backdrop-right', 'images/backdrop_right.png'));
            pc.device.loader.add(new pc.Image('backdrop-repeat', 'images/backdrop_repeat.png'));
            pc.device.loader.add(new pc.Image('grass-far', 'images/grass_far.png'));
            pc.device.loader.add(new pc.Image('grass-foreground', 'images/grass_foreground.png'));
            pc.device.loader.add(new pc.Image('grass-near', 'images/grass_near.png'));

            if (pc.device.soundEnabled)
            {
                pc.device.loader.add(new pc.Sound('smash', 'sounds/woodsmash', ['ogg', 'mp3'], 10));
                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg', 'mp3'], 12));
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
            ctx.fillStyle = "#8f8";
            ctx.fillText('Angry Cannons', 40, (pc.device.canvasHeight / 2) - 50);
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


