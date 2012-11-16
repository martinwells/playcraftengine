/**
 * Package com.I2TM.web.RoidsOnRoids
 */
var GAMENAME = 'Roids on Roids';
var GAMEVERSION = '0.5.8';
var GAMETAG = GAMENAME + ' v' + GAMEVERSION;
 
PlayerStatus =
{
    IDLE:0x0000,
    DEAD:0x0001,
    ALIVE:0x0002
};

CollisionType =
{
    NONE:0x0000, // BIT MAP
    BULLETS:0x0001, // 0000001
    ENEMY:0x0002, // 0000010
    FRIENDLY:0x0004 // 0000100
};

var Weapon = pc.Base.extend('Weapon',
{},
{
	name: '',
    avail: false,		//Is the system available
	energy:0,
	lastFired:0,
	
	init:function(na,en)
	{
		this.name=na;
		this.avail=false;
		this.energy=en;
	},
	
	setAvailable:function() 
	{
		this.avail = true;
	},
	
	setUnavailable:function() 
	{
		this.avail = false;
	}
});
 
var Fighter = pc.Base.extend('Fighter',
{ },
{
	desc:'',
	mass:0,
	maxSpeed: 0,
	thrust: 0.0,
	jets: 0,
	maxEnergy:1000,

	bulletSpeed:1000,
	bulletForce:0,
	bulletDelay:0,
	bulletLife:0,

	weap1:null,
	weap2:null,
	weap3:null,
	
	regen: 0,
	energy:0,
	health:0,
	status:0,  

	numFired:0,
	numHit:0,

	init: function(de,ma,re,ms,th,jt,bs,bf,bd,bl)    // instance constructor
	{
		this.weap1 = new Weapon ('Mass_Projector',30);
		this.weap2 = new Weapon('Plasma_Cannons',60);
		this.weap3 = new Weapon('Laser_Pods',90);
		this.weap4 = new Weapon('Gravibombs',120);
		
		this.desc = de;
		this.mass = ma;
		this.regen = re;
		this.maxSpeed = ms;
		this.thrust = th;
		this.jets = jt;
		this.bulletSpeed = bs;
		this.bulletForce = bf;
		this.bulletDelay = bd;
		this.bulletLife = bl;
		this.energy = 1000;
		this.health = 100;
		this.status = PlayerStatus.ALIVE;
	},

	regenerate:function() {
		this.energy += this.regen;
		if (this.energy > this.maxEnergy) {
			this.energy = this.maxEnergy;
		}
		
		this.health += 0.01;
		if (this.health > 100) {
			this.health = 100;
		}
	},
	
	canFire:function(weapon) 
	{
		switch (weapon) {
			case 1: 
				if (this.weap1.avail && this.energy > this.weap1.energy) return true; else	return false;
			case 2: 
				if (this.weap2.avail && this.energy > this.weap2.energy) return true; else	return false;
			case 3: 
				if (this.weap3.avail && this.energy > this.weap3.energy) return true; else	return false;
			case 4: 
				if (this.weap4.avail && this.energy > this.weap4.energy) return true; else	return false;
		}
	},
	
	getThrust:function() {return this.thrust;}
	
	
});

GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        smokeSheet:null,
        explosionSound:null,

        init:function (options)
        {
            this._super(options);
            this.smokeSheet = new pc.SpriteSheet({image:pc.device.loader.get('smoke').resource, frameWidth:32, frameHeight:32, framesWide:16, framesHigh:1});
            this.smokeSheet.addAnimation({ name:'smoking', time:1000, loops:1 });

            if (pc.device.soundEnabled)
            {
                this.explosionSound = pc.device.loader.get('explosion').resource;
                this.explosionSound.setVolume(0.5);
            }
        },

        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
			function updateScoreHealth(entityA,entityB) {
				if (!entityA.hasTag('WALL')) {
					entityB.layer.scene.Fighter.numHit++;
					entityB.layer.scene.score += entityB.points;
					//Asteroid hit the player, take away health
					if (entityA.hasTag('PLAYER')) {
						entityA.layer.scene.Fighter.health = (entityA.layer.scene.Fighter.health - (entityB.points / 10));
						if (entityA.layer.scene.Fighter.health < 1) {
							entityA.getComponent('physics').setCollisionMask(0);
							entityA.getComponent('physics').setLinearVelocity(0, 0);
							entityA.remove();
							entityA.layer.scene.Fighter.status = PlayerStatus.DEAD;
					}
				}
				}
			}
			
			//Asteroid <-> Bullet Collision
            if ((entityB.hasTag('ASTEROID-LARGE') || entityB.hasTag('ASTEROID-MEDIUM') || entityB.hasTag('ASTEROID-SMALL')) && (entityA.hasTag('BULLET') || entityA.hasTag('PLAYER')))
            {
                // halt the bullet, turning off collision detection as well, then remove it
                if (entityA.hasTag('BULLET')) {
					entityA.getComponent('physics').setCollisionMask(0);
					entityA.getComponent('physics').setLinearVelocity(0, 0);
					entityA.remove();
				}
				
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

                    var sp = entityB.getComponent('spatial');

                    // if a big asteroid is blowing up, then spawn some medium asteroids
                    if (entityB.hasTag('ASTEROID-LARGE')) {
                        var count = pc.Math.rand(2,  5 + Math.floor(entityA.layer.scene.level/2));
                        for (var i = 0; i < count; i++)
                        {
                            var addX = 0;
                            var addY = 0;
                            if (sp.pos.x < sp.dim.x) { addX += sp.dim.x + 1;}
                            if (sp.pos.y < sp.dim.y) { addY += sp.dim.y + 1;}
                            if (sp.pos.x > pc.device.canvasWidth - sp.dim.x) { addX = -sp.dim.x + 1;}
                            if (sp.pos.y > pc.device.canvasHeight - sp.dim.y) { addY = -sp.dim.y + 1;}
                            createEntity(entityB.layer.scene, entityB.layer, 'asteroid-medium', sp.pos.x + addX, sp.pos.y + addY);
                        }

                        entityA.layer.scene.asteroidsLeft += count;
                    } else if (entityB.hasTag('ASTEROID-MEDIUM'))                      
                        {
                    		// if a medium asteroid is blowing up, then spawn some small asteroids
                            var sp = entityB.getComponent('spatial');
							var count = pc.Math.rand(2, 5 + Math.floor(entityA.layer.scene.level/2));
                            for (var i = 0; i < count; i++)
                            {
                                var addX = 0;
                                var addY = 0;
                                if (sp.pos.x < sp.dim.x) { addX += sp.dim.x + 1; }
                                if (sp.pos.y < sp.dim.y) { addY += sp.dim.y + 1; }
                                if (sp.pos.x > pc.device.canvasWidth - sp.dim.x) { addX = -sp.dim.x + 1; }
                                if (sp.pos.y > pc.device.canvasHeight - sp.dim.y) { addY = -sp.dim.y + 1; }
                                createEntity(entityB.layer.scene, entityB.layer, 'asteroid-small', sp.pos.x + addX, sp.pos.y + addY);
                            }

                            entityA.layer.scene.asteroidsLeft += count;
                        }
                }

				updateScoreHealth(entityA,entityB);
	
				//HUD Asteroids Left Top-Left
                entityA.layer.scene.hudAsteroids.getComponent('text').text[0] = 'Asteroids Left: ' + entityA.layer.scene.asteroidsLeft;
            } //End Asteroid <-> Bullet Collisoon
			
			//Start Bullet <-> Wall Collision
			else if ((entityB.hasTag('BULLET') && entityA.hasTag('WALL')) || (entityB.hasTag('BULLET') && entityA.hasTag('WALL'))) {
				entityB.getComponent('physics').setCollisionMask(0);
				entityB.getComponent('physics').setLinearVelocity(0, 0);
				entityB.remove();
            }

			//Start Asteroid <-> Wall Collision
			else if ((entityB.hasTag('ASTEROID-LARGE') || entityB.hasTag('ASTEROID-MEDIUM') || entityB.hasTag('ASTEROID-SMALL')) && entityA.hasTag('WALL')) {
				var i = 0;
            }
        }
    });

DeviceID =
{
    APPLE:		0x0000,
    ANDROID:	0x0001,
    PC:			0x0002
};

TheGame = pc.Game.extend('TheGame',
    {},
    {
		device:null,
		useTouchpad:false,
        gameScene:null,
		splashScene:null,
        loadingScene:null,
        loadingLayer:null,

		detectDevice:function() 
		{
			if (pc.device.isiPhone || pc.device.isiPhone4 || pc.device.isiPad) {
					this.device = DeviceID.APPLE;
					this.useTouchPad = true;
			} else if (pc.device.isAndroid) {
				this.device = DeviceID.ANDROID;
				this.useTouchPad = true;
			} else {
				this.device = DeviceID.PC;
				this.useTouchPad = false;
			}
		},

		goFullScreen:function() 
		{
			if (pc.device.canvas) {		
				if (pc.device.canvas.requestFullscreen) {
					pc.device.canvas.requestFullscreen();
				}
				else if (pc.device.canvas.mozRequestFullScreen) {
					pc.device.canvas.mozRequestFullScreen();
				}
				else if (pc.device.canvas.webkitRequestFullScreen) {
					pc.device.canvas.webkitRequestFullScreen();
				}
			
			}
		},
		
		preloadGraphics:function() 
		{
			//Fullscreen Images
            pc.device.loader.add(new pc.Image('titlescreen', 'images/titlescreen.png'));	

			//HUD Images
            //pc.device.loader.add(new pc.Image('hudEnergy', 'images/hudenergybase.png'));
            //pc.device.loader.add(new pc.Image('hudEnergyBars', 'images/hudenergybars.png'));
            //pc.device.loader.add(new pc.Image('hudArmor', 'images/hudarmorbase.png'));
            //pc.device.loader.add(new pc.Image('hudArmorBars', 'images/hudarmorbars.png'));

            pc.device.loader.add(new pc.Image('backdrop1', 'images/backdrop01.png'));
            pc.device.loader.add(new pc.Image('backdrop2', 'images/backdrop02.png'));
            pc.device.loader.add(new pc.Image('backdrop3', 'images/backdrop03.png'));
            pc.device.loader.add(new pc.Image('backdrop4', 'images/backdrop04.png'));
            pc.device.loader.add(new pc.Image('backdrop5', 'images/backdrop05.png'));
            pc.device.loader.add(new pc.Image('backdrop6', 'images/backdrop06.png'));
            pc.device.loader.add(new pc.Image('backdrop7', 'images/backdrop07.png'));
			//Player Related Images
            pc.device.loader.add(new pc.Image('playership', 'images/ship5.png'));
            pc.device.loader.add(new pc.Image('playerdebris', 'images/ship_debris.png'));
            pc.device.loader.add(new pc.Image('exhaust', 'images/exhaust.png'));
            pc.device.loader.add(new pc.Image('weap1', 'images/weap1-massprojector.png'));
            pc.device.loader.add(new pc.Image('weap2', 'images/weap2-dualplasmacanons.png'));
            pc.device.loader.add(new pc.Image('weap3', 'images/weap3-duallaserpods.png'));
            pc.device.loader.add(new pc.Image('weap4', 'images/weap4.png'));
			//Asteroid Images
            pc.device.loader.add(new pc.Image('asteroid-large', 'images/asteroid-large.png'));
            pc.device.loader.add(new pc.Image('asteroid-medium', 'images/asteroid-medium.png'));
            pc.device.loader.add(new pc.Image('asteroid-small', 'images/asteroid-small.png'));
			//Misc Images
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke1.png'));
            pc.device.loader.add(new pc.Image('explosions', 'images/smallexplosions.png'));
		},
		
		preloadAudio:function()
		{
            if (pc.device.soundEnabled)
            {
                pc.device.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg'], 32));
                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg'], 32));
                pc.device.loader.add(new pc.Sound('music', 'sounds/pushthelimits', ['ogg'], 1));
            }
		},
		
        onReady:function ()
        {
            this._super();
            pc.device.devMode = !pc.packed;
         
			this.detectDevice();
			
			//Go Fullscreen if we can
			this.goFullScreen();
			
            // load resources
			if (pc.device.devMode)
				pc.device.loader.setDisableCache();
				
			if (this.useTouchPad) {
				//Load & Initialize Onscreen touchpad and Input
			} else {
			
			}

			this.preloadGraphics();
			this.preloadAudio();

            this.loadingScene = new pc.Scene();
            this.loadingLayer = new pc.Layer('loading');
            this.loadingScene.addLayer(this.loadingLayer);

            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
        },
		
		//onSceneActivated: function(scene) 
		//{
		//	if (scene == this.splashScene) {
		//		pc.device.game.deactivateScene(this.gameScene);
		//	} else if (scene == this.gameScene) {
		//		pc.device.game.deactivateScene(this.splashScene);
		//	}
		//},
		
        //onSceneDeactivated:function (scene)
        //{
		//	if (scene == this.splashScene) {
		//		pc.device.game.activateScene(this.gameScene);
		//	} else if (scene == this.gameScene) {
		//		pc.device.game.activateScene(this.splashScene);
		//	}
        //},
		
        onLoading:function (percentageComplete)
        {
            var ctx = pc.device.ctx;
            ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            ctx.font = "normal 50px Verdana";
            ctx.fillStyle = "#88f";
			ctx.fillText(GAMETAG, 40, (pc.device.canvasHeight / 2) - 50);
            ctx.font = "normal 18px Verdana";
            ctx.fillStyle = "#777";
            ctx.fillText('Loading: ' + percentageComplete + '%', 40, pc.device.canvasHeight / 2);
        },

        onLoaded:function ()
        {
            //if (this.splashScene === null) {
			//	this.splashScene = new SplashScene();
			//	this.addScene(this.splashScene);
			//}
			
			if (this.gameScene === null) {
				this.gameScene = new GameScene();
				this.addScene(this.gameScene);
			}
			//pc.device.game.deactivateScene(this.gameScene);
			//pc.device.game.activateScene(this.splashScene);
        }

    });

/*******************************************************************************************
 * Used to create entities and add to requested scene/layer
 * @package: com.i2tm.web.roidsonroids
 * @param {Scene} scene The scene to insert this entity into 
 * @param {Scene} layer The Layer to insert this entity into 
 * @param {String} type The type of entity to create 
 * @param {integer} x The X position to create the entity at 
 * @param {integer} y The Y position to create the entity at 
 * @param {integer} dir The Direction (0-359) to point the entity at 
 * @param {Entity} attachTo The entity to attach this entity to 
 *******************************************************************************************/
function createEntity(scene, layer, type, x, y, dir, attachTo)
{
	var e = pc.Entity.create(layer);
	//var bouncy = (1 + (scene.level/10));

	switch (type)
	{
        /*******************************************************************************************
		 * Create a small asteroid
		 *******************************************************************************************/
		case 'asteroid-small':
			e.addTag('ASTEROID-SMALL');
			e.points = 100;
			e.addComponent(pc.components.Sprite.create({currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.smallAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x, y:y,dir:pc.Math.rand(0, 359),	w:scene.smallAsteroidSheet.frameWidth,h:scene.smallAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({force:20+scene.levelBounce,mass:1, bounce:scene.levelBounce, shapes:[{shape:pc.CollisionShape.CIRCLE}], collisionCategory:CollisionType.ENEMY, collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));
			return e;

        /*******************************************************************************************
		 * Create a medium asteroid
		 *******************************************************************************************/
		case 'asteroid-medium':
			e.addTag('ASTEROID-MEDIUM');
			e.points = 200;
			e.addComponent(pc.components.Sprite.create(	{currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.mediumAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x, y:y,dir:pc.Math.rand(0, 359),w:scene.mediumAsteroidSheet.frameWidth,h:scene.mediumAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({force:40+scene.levelBounce,mass:2,bounce:scene.levelBounce,shapes:[{shape:pc.CollisionShape.CIRCLE}],collisionCategory:CollisionType.ENEMY,collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));
			return e;
			
        /*******************************************************************************************
		 * Create a large asteroid
		 *******************************************************************************************/
		case 'asteroid-large':
			e.addTag('ASTEROID-LARGE');
			e.points = 400;

			// pick a random spot for the asteroid, but make sure it's not near the center
			var x1 = 0;	var y1 = 0;
			do
			{
				x1 = pc.Math.rand(100, pc.device.canvasWidth - 100);
				y1 = pc.Math.rand(100, pc.device.canvasHeight - 100);

			} while (pc.Math.isPointInRect(x1, y1, (pc.device.canvasWidth / 2) - 100, (pc.device.canvasHeight / 2) - 100, 200, 200));

			e.addComponent(pc.components.Sprite.create({currentFrame:pc.Math.rand(0, 10),animSpeedOffset:pc.Math.rand(500, 1000),spriteSheet:scene.largeAsteroidSheet, animationStart:'floating'}));
			e.addComponent(pc.components.Spatial.create({x:x1, y:y1,dir:pc.Math.rand(0, 359),w:scene.largeAsteroidSheet.frameWidth,h:scene.largeAsteroidSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({impulse:10+scene.levelBounce,mass:3,bounce:scene.levelBounce,shapes:[ {shape:pc.CollisionShape.CIRCLE} ],collisionCategory:CollisionType.ENEMY,collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY}));

			return e;

        /*******************************************************************************************
		 * Create the players ship
		 *******************************************************************************************/
		case 'player':
			scene.Fighter.status = PlayerStatus.ALIVE;
			e.addTag('PLAYER');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.playerSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,w:scene.playerSheet.frameWidth, h:scene.playerSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({maxSpeed:{x:scene.Fighter.maxSpeed, y:scene.Fighter.maxSpeed},linearDamping:0.0,mass:scene.Fighter.mass,shapes:[{shape:pc.CollisionShape.CIRCLE}],collisionCategory:CollisionType.FRIENDLY,collisionMask:CollisionType.ENEMY}));
			return e;

        /*******************************************************************************************
		 * Create the players debris field when they die.
		 *******************************************************************************************/
		case 'debris':
			e.addTag('DEBRIS');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.playerDebris, animationStart:'floating' }));
			e.addComponent(pc.components.Spatial.create({x:(pc.device.canvasWidth / 2) - 300, y:(pc.device.canvasHeight / 2) - 300, dir:pc.Math.rand(0, 359),w:scene.playerDebris.frameWidth, h:scene.playerSheet.frameHeight}));
			return e;
			
        /*******************************************************************************************
		 * Create the engine thrust and attach to back of players ship
		 *******************************************************************************************/
		case 'engine':
			// attach the engine emitter (it's an entity so it can be attached to the back of the ship)
			e.addComponent(pc.components.Spatial.create({ dir:dir, w:24, h:24}));
			e.addComponent(pc.components.Physics.create({ shapes:[ { shape:pc.CollisionShape.CIRCLE } ] }));
			e.addComponent(pc.components.ParticleEmitter.create({spriteSheet:scene.exhaustSheet,burst:1,delay:10,thrustMin:2, thrustMax:4,thrustTime:250,lifeMin:400,fadeOutTime:800,spinMin:65,rotateSprite:true,emitting:true}));
			e.addComponent(pc.components.Joint.create({attachedTo:attachTo,type:pc.JointType.REVOLUTE,offset:{x:-40, y:0}}));                   
			return e;

        /*******************************************************************************************
		 * Create the players Nose Mass Driver when fired
		 *******************************************************************************************/
		case 'projector': //Nose Gun
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap1FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:3000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap1FireSheet.frameWidth, h:scene.weap1FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:40, y:40}, force:160, shapes:[ { offset:{w:-25}, shape:pc.CollisionShape.CIRCLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));

			return e;
					
        /*******************************************************************************************
		 * Create the players dual plama cannons when fired
		 *******************************************************************************************/
		case 'plasma':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap2FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:300 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap2FireSheet.frameWidth, h:scene.weap2FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:100, y:100}, force:150, shapes:[ { offset:{w:-2,h:-2}, shape:pc.CollisionShape.RECTANGLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));00
			return e;

		/*******************************************************************************************
		 * Create the players dual lasers when fired
		 *******************************************************************************************/
		case 'laser':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap3FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:6000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap3FireSheet.frameWidth, h:scene.weap3FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:200, y:200}, force:75, shapes:[ { offset:{w:0}, shape:pc.CollisionShape.RECTANGLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));
			return e;

		/*******************************************************************************************
		 * Create the players dual lasers when fired
		 *******************************************************************************************/
		case 'gravitron':
			e.addTag('BULLET');
			e.addComponent(pc.components.Sprite.create({ spriteSheet:scene.weap4FireSheet, animationStart:'floating' }));
			e.addComponent(pc.components.Expiry.create({ lifetime:10000 }));
			e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:scene.weap4FireSheet.frameWidth, h:scene.weap4FireSheet.frameHeight}));
			e.addComponent(pc.components.Physics.create({ maxSpeed:{x:20, y:20}, force:500, shapes:[ { offset:{w:-4}, shape:pc.CollisionShape.CIRCLE } ],collisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));
			return e;
					
        /*******************************************************************************************
		 * Create the instructions that popup when the game starts for a few seconds
		 *******************************************************************************************/
		case 'instructions':
			e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
			e.addComponent(pc.components.Fade.create({ startDelay:1000, fadeInTime:3500, holdTime:3000, fadeOutTime:1500 }));
			e.addComponent(pc.components.Text.create({ text:['Arrow keys=move', 'Space=fire', '-- DEBUG --', 'F9=Toggle Debug', 'F10=Toggle Pool Dump','F11=Toggle Sound'], lineWidth:0, fontHeight:14, offset:{x:25, y:-65} }));
			e.addComponent(pc.components.Expiry.create({ lifetime:8000 }));
			e.addComponent(pc.components.Spatial.create({ dir:0, w :170, h:85 }));
			e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'middle', margin:{ right:80 } }));
			return e;
			
        /*******************************************************************************************
		 * Create the YOUR TOAST message fr use when player dies
		 *******************************************************************************************/
		case 'yourdead':
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:3000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#2d2929', strokeColor:'#631212', text:['Your Toast!'], lineWidth:2,fontHeight:80 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:280, h:80 }));
            e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center' }));
            //e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center', margin:{ bottom:0, left:0 } }));
			return e;			
		
		return null;
	}
};

function createWeapon(scene, layer, type, tc, forewardoffset) 
{
	var half = (scene.weap4FireSheet.frameWidth / 2)
	tc.subtract(half, half);
	tc.moveInDir(scene.playerSpatial.dir, forewardoffset);
	createEntity(scene, layer, 'gravitron', tc.x, tc.y, this.playerSpatial.dir);
}GameScene = pc.Scene.extend('GameScene',
    { },
    {
		lastTimer:0,							//Gernic internal timing variable
    	Fighter:null,
		Fighter1:null,
    	Fighter2:null,
    	Fighter3:null,
    	Fighter4:null,
    	Fighter5:null,
    	player:null,
        playerPhysics:null,
        playerSpatial:null,
        engine:null,
        asteroidsLeft:0,
        level:0,
        stage:0,
		score:0,
		average:0,
        lastFireTime:0,
		//UI Stuff
        hudAsteroids:null,
        hudShipType:null,
        hudScore:null,
		hudEnergy:null,
		hudHealth:null,
		
        starsLayer:null,
        gameLayer:null,
		hudLayer:null,
        largeAsteroidSheet:null,
        mediumAsteroidSheet:null,
        smallAsteroidSheet:null,
        playerSheet:null,
		weap1FireSheet:null,
		weap2FireSheet:null,
		weap3FireSheet:null,
		weap4FireSheet:null,
		exhaustSheet:null,
        music:null,
        musicPlaying:true,
        fireSound:null,
		
		levelBounce:1,
		
		weap1LastFired:0,
		weap2LastFired:0,
		weap3LastFired:0,
		weap4LastFired:0,
		
		timer:function(start)
		{
			if (start) {
				this.lastTimer = pc.device.now;
			} else {
				//return (pc.device.now - this.lastTimer);
				var e = (pc.device.now - this.lastTimer);
				return e;
			}
		},

        init:function ()
        {
			this.timer(true);
			if (pc.device.devMode) { this.info('Initializing Game'); }
            this._super();
        	this.Fighter1 = new Fighter('Scout',5,1,25,2.5,40,500,50,350,1500);
        	this.Fighter2 = new Fighter('Fighter',6,2,35,3.0,60,750,60,300,1250);
        	this.Fighter3 = new Fighter('Frigate',7,3,45,3.5,80,1000,70,250,1000);
        	this.Fighter4 = new Fighter('Destroyer',8,4,55,4.0,100,1250,80,200,750);
        	this.Fighter5 = new Fighter('Dreadnaught',9,5,65,4.5,120,1500,90,100,500);

			this.Fighter = this.Fighter1;
			
            if (pc.device.devMode) { this.info('Initializing sound'); }

            // start the music
            if (pc.device.soundEnabled)
            {
                this.fireSound = pc.device.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
                this.music = pc.device.loader.get('music').resource;
                this.music.setVolume(0.2);
                this.music.play(true);
                this.musicPlaying = true;
            }          
            
            // setup the sprites used in the game scene
            if (pc.device.devMode) { this.info('Initializing Sprites'); }
            
			
            //-----------------------------------------------------------------------------
            // Initialize asteroid sprites
            //-----------------------------------------------------------------------------
            this.largeAsteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid-large').resource, useRotation:true, frameWidth:96, frameHeight:96 });
            this.largeAsteroidSheet.addAnimation({ name:'floating', time:900, frameCount:20 });

            this.mediumAsteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid-medium').resource, useRotation:true, frameWidth:64, frameHeight:64 });
            this.mediumAsteroidSheet.addAnimation({ name:'floating', time:600, frameCount:20 });
            
            this.smallAsteroidSheet = new pc.SpriteSheet({ image:pc.device.loader.get('asteroid-small').resource, useRotation:true, frameWidth:24, frameHeight:24 });
            this.smallAsteroidSheet.addAnimation({ name:'floating', time:300, frameCount:20 });

            //-----------------------------------------------------------------------------
            // Initialize player sprites
            //-----------------------------------------------------------------------------			
            this.playerSheet = new pc.SpriteSheet({ image:pc.device.loader.get('playership').resource, frameWidth:80, frameHeight:80, useRotation:true});
            this.playerSheet.addAnimation({ name:'floating', frameCount:1});

            this.playerDebris = new pc.SpriteSheet({ image:pc.device.loader.get('playerdebris').resource, frameWidth:600, frameHeight:600, useRotation:false});
            this.playerDebris.addAnimation({ name:'floating', frameCount:1});
			
            this.weap1FireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('weap1').resource, frameWidth:30, frameHeight:30 });
            this.weap1FireSheet.addAnimation({ name:'floating', time:500, dirAcross:true });

            this.weap2FireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('weap2').resource, frameWidth:28, frameHeight:28 }); 
            this.weap2FireSheet.addAnimation({ name:'floating', time:400, dirAcross:true });

            this.weap3FireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('weap3').resource, frameWidth:40, frameHeight:40 });
            this.weap3FireSheet.addAnimation({ name:'floating', time:20, dirAcross:true });

            this.weap4FireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('weap4').resource, frameWidth:16, frameHeight:16 }); //TODO need to be square
            this.weap4FireSheet.addAnimation({ name:'floating', time:100, dirAcross:true });
			
            this.exhaustSheet = new pc.SpriteSheet({image:pc.device.loader.get('exhaust').resource,frameWidth:24, frameHeight:24, framesWide:20, framesHigh:1, useRotation:true});
			this.exhaustSheet.addAnimation({ name:'thrusting', time:2000, loops:1 });
			
			
            //-----------------------------------------------------------------------------
            // stars layer (Backdrop)
            //-----------------------------------------------------------------------------
			if (pc.device.devMode) { this.info('Creating Space Layer'); }
			this.starsLayer = this.addLayer(new StarsLayer('stars layer', 1));

            //-----------------------------------------------------------------------------
            // game layer (Main Game)
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Creating Game Layer'); }
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            //-----------------------------------------------------------------------------
            // hud layer overlay
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Creating HUD Layer'); }
			this.hudLayer = this.addLayer(new HudLayer('hudLayer', 1));
					
            //-----------------------------------------------------------------------------
            // fire up the systems we need for the game layer
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Physics Engine'); }
            this.gameLayer.addSystem(new GamePhysics({ gravity:{ x:0, y:0 }, debug:pc.device.devMode }));
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            
            //-----------------------------------------------------------------------------
            // setup the starting entities           
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Player'); }
            this.player = createEntity(this, this.gameLayer, 'player', (this.gameLayer.scene.viewPort.w / 2)-40, (this.gameLayer.scene.viewPort.h / 2)-40, 0);
            this.engine = createEntity(this, this.gameLayer, 'engine', (this.gameLayer.scene.viewPort.w / 2), (this.gameLayer.scene.viewPort.h / 2), 0, this.player);
            this.playerPhysics = this.player.getComponent('physics');
            this.playerSpatial = this.player.getComponent('spatial');

            //-----------------------------------------------------------------------------
            // create some boundary walls on the edges of the screen
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Boundry Wall'); }
            this.createWall(this.gameLayer, 0, 0, 1, pc.device.canvasHeight); // left
            this.createWall(this.gameLayer, 0, 0, pc.device.canvasWidth, 1); // top
            this.createWall(this.gameLayer, pc.device.canvasWidth, 0, 1, pc.device.canvasHeight); // right
            this.createWall(this.gameLayer, 0, pc.device.canvasHeight, pc.device.canvasWidth, 1); // bottom

            //-----------------------------------------------------------------------------
            // create some asteroids
            //-----------------------------------------------------------------------------
            this.newLevel();

            //createEntity(this, this.gameLayer, 'instructions');
            //this.createLevelAlert(this.gameLayer, 1);

            this.starsLayer.setZIndex(1);
            this.gameLayer.setZIndex(2);
			this.hudLayer.setZIndex(3);
			this.initHUD();
			
			this.initPlayerInput()
            pc.device.input.bindAction(this, 'Toggle Pause/Help/Resume', 'ESC');
            pc.device.input.bindAction(this, 'Toggle Sound', 'F10');
           if (pc.device.devMode) { this.info('Game Initialization Done. ('+this.timer(false)+'ms)'); }
		},
		
		//-----------------------------------------------------------------------------
		// setup the controls
		//-----------------------------------------------------------------------------
		initPlayerInput:function() 
		{
            if (pc.device.devMode) { this.info('Initializing Player Input'); }
			//Turn Right
            pc.device.input.bindState(this, 'turning right', 'D');
            pc.device.input.bindState(this, 'turning right', 'RIGHT');
			//Turn Left
            pc.device.input.bindState(this, 'turning left', 'A');
            pc.device.input.bindState(this, 'turning left', 'LEFT');
			//Accellerate
            pc.device.input.bindState(this, 'thrusting', 'W');
            pc.device.input.bindState(this, 'thrusting', 'UP');
			//Decellerate
            pc.device.input.bindState(this, 'reversing', 'S');
            pc.device.input.bindState(this, 'reversing', 'DOWN');
			//Activate/Deactivate Weapons Systems
            pc.device.input.bindState(this, 'weapon1', '1');
            pc.device.input.bindState(this, 'weapon2', '2');
            pc.device.input.bindState(this, 'weapon3', '3');
            pc.device.input.bindState(this, 'weapon4', '4');
            pc.device.input.bindState(this, 'allweapons', '5');
		},
		
		initHUD:function()
		{
            if (pc.device.devMode) { this.info('Initializing HUD'); }
            this.createhudAsteroids();
            this.createhudShipType();
			this.createhudScore();
			this.createhudEnergy();
			this.createhudHealth();
		},
		
		//onResize:function(width, height) {
		//		this._super(width, height);
		//},
				
        displayText:function (s)
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1000, holdTime:1000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#e65cba', text:[s], fontHeight:20 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{left:30 }}));
        },

		//TODO: Move into CreateEntity()
        createWall:function (layer, x, y, w, h)
        {
            var e = pc.Entity.create(layer);
            e.addTag('WALL');
            e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, w:w, h:h }));
            e.addComponent(pc.components.Physics.create({ immovable:true,
                collisionCategory:CollisionType.ENEMY, collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY,
                bounce:(this.level/10),
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));
        },
		
		//TODO: Move into CreateEntity()
        createStageAlert:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1000, holdTime:4000, fadeOutTime:2000 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:7000 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:44 }));
			if (this.stage == 1) {
				e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['3 Waves to Stage 2'], lineWidth:2, fontHeight:44 }));
			} else if (this.stage >= 2 && this.stage <= 4) {
				e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['Stage '+this.stage+' complete','5 Waves to Stage '+this.stage+1,'Ship upgraded to '+this.Fighter.desc], lineWidth:2, fontHeight:44 }));
			} else {
				e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['Stage '+this.stage+' complete','5 Waves to Stage '+this.stage+1], lineWidth:2, fontHeight:44 }));
			}
			e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'center', margin:{ bottom:170, left:0 } }));
        },

        createLevelAlert:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1000, holdTime:4000, fadeOutTime:2000 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:7000 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:44 }));
			e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['Level ' + this.level], lineWidth:2, fontHeight:44 }));
			e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'center', margin:{ bottom:170, left:0 } }));
        },
		
		//TODO: Move into CreateEntity()
        createhudAsteroids:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Asteroids Left: ' + this.asteroidsLeft],
                lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{ top:30, left:30 } }));
            this.hudAsteroids = e;
        },

		//TODO: Move into CreateEntity()
        createhudShipType:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Ship Level: ' + this.Fighter.desc],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'center', margin:{ top:30, left:30 } }));
            this.hudShipType = e;
        },

		//TODO: Move into CreateEntity()
        createhudScore:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Score: ' + this.score],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'right', margin:{ top:30, right:30 } }));
            this.hudScore = e;
        },

		//TODO: Move into CreateEntity()
        createhudEnergy:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Energy: ' + this.Fighter.energy],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:30, left:30 } }));
            this.hudEnergy = e;
        },

		//TODO: Move into CreateEntity()
        createhudHealth:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Health: ' + this.Fighter.health],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:30, right:30 } }));
            this.hudHealth = e;
        },
		
		//TODO: Move into CreateEntity()
        createLevelComplete:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Level '+this.level+' Complete'], lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'center' }));
        },
		       
        newLevel:function ()
        {			
            this.level++;
			this.average = (Math.floor(this.Fighter.numHit / this.Fighter.numFired)*100);
			this.createLevelAlert();
			this.Fighter.numHit = 0;
			this.Fighter.numFired = 0;
            //-----------------------------------------------------------------------------
            // Determine With Stage we are on and set appropiate backdrop
            //-----------------------------------------------------------------------------
            var old_stage = this.stage;
            if (this.level <=3) {
                this.stage = 1;
				this.Fighter = this.Fighter1;
				this.Fighter.weap1.avail = true;
            } if (this.level >=4 && this.level <=8) {
                this.stage = 2;
				this.Fighter = this.Fighter2;
				this.Fighter.weap1.avail = true;
				this.Fighter.weap2.avail = true;
            } if (this.level >=9 && this.level <=13) {
                this.stage = 3;
				this.Fighter = this.Fighter3;
				this.Fighter.weap1.avail = true;
				this.Fighter.weap2.avail = true;
				this.Fighter.weap3.avail = true;
            } if (this.level >=14 && this.level <=18) {
                this.stage = 4;
				this.Fighter = this.Fighter4;
				this.Fighter.weap1.avail = true;
				this.Fighter.weap2.avail = true;
				this.Fighter.weap3.avail = true;
				this.Fighter.weap4.avail = true;
            } if (this.level >=19 && this.level <=24) {
                this.stage = 5;
				this.Fighter = this.Fighter5;
            } if (this.level >=25 && this.level <=29) {
                this.stage = 6;
            } else if (this.level >= 30) {
                this.stage = 7;
            }

            if (this.stage !== old_stage) {
				this.createStageAlert();
				this.levelBounce+=0.01;
            	this.starsLayer.setBackdrop(this.stage);
            }
            
            var count = 1 + this.level;
            for (var i = 0; i < count; i++) {
                createEntity(this, this.gameLayer, 'asteroid-large');
            }
            this.asteroidsLeft += count;
        },
		
        onAction:function (actionName, event, pos)
        {
			if (pc.device.devMode) { this.info('onAction Event Method'); }
			/********** IM A CHEATER REMOVE THIS BEFORE RELEASE *************/
			if (actionName == 'Scout') { this.Fighter = this.Fighter1; }
			if (actionName == 'Fighter') { this.Fighter = this.Fighter2; }
			if (actionName == 'Frigate') { this.Fighter = this.Fighter3; }
			if (actionName == 'Destroyer') { this.Fighter = this.Fighter4; }
			if (actionName == 'Dreadnaught') { this.Fighter = this.Fighter5; }
			/********** IM A CHEATER REMOVE THIS BEFORE RELEASE *************/
			
            if (actionName === 'toggle debug')
            {
                var ph = this.gameLayer.getSystemsByComponentType('physics').first.object();
                ph.setDebug(!ph.debug);
            }

            if (actionName === 'toggle music')
            {
                if (this.musicPlaying)
                {
                    this.music.stop();
                    this.musicPlaying = false;
                } else
                {
                    this.music.play();
                    this.musicPlaying = true;
                }
            }
        },

		fireWeap1:function(tc) 
		{
			var sinceLastFire = pc.device.now - this.Fighter.weap1.lastFired;
			if (sinceLastFire > 300) {
				this.Fighter.weap1.lastFired = pc.device.now;
				if (this.Fighter.energy > this.Fighter.weap1.energy) {
					var half = (this.weap1FireSheet.frameWidth / 2)
					this.Fighter.energy = this.Fighter.energy - this.Fighter.weap1.energy;
					tc.subtract(half, half);
					tc.moveInDir(this.playerSpatial.dir, 60);
					createEntity(this, this.gameLayer, 'projector', tc.x, tc.y, this.playerSpatial.dir);
					this.fireSound.play(false);
					this.Fighter.numFired++;
				}
			}
		},
		
		fireWeap2:function(tc) 
		{
			var sinceLastFire = pc.device.now - this.Fighter.weap2.lastFired;
			if (sinceLastFire > 50) {
				this.Fighter.weap2.lastFired = pc.device.now;
				if (this.Fighter.energy > this.Fighter.weap2.energy) {
					var half = (this.weap2FireSheet.frameWidth / 2)
					this.Fighter.energy = this.Fighter.energy - this.Fighter.weap2.energy;
					tc.subtract(half, half);
					tc.moveInDir(this.playerSpatial.dir, 40);
					createEntity(this, this.gameLayer, 'plasma', tc.x, tc.y, this.playerSpatial.dir);
					this.fireSound.play(false);
					this.Fighter.numFired++;
				}
			}
		},
		
		fireWeap3:function(tc)  
		{
			var sinceLastFire = pc.device.now - this.Fighter.weap3.lastFired;
			if (sinceLastFire > 200) {
				this.Fighter.weap3.lastFired = pc.device.now;
				if (this.Fighter.energy > this.Fighter.weap3.energy) {
					var half = (this.weap3FireSheet.frameWidth / 2)
					this.Fighter.energy = this.Fighter.energy - this.Fighter.weap3.energy;
					tc.subtract(half, half);
					tc.moveInDir(this.playerSpatial.dir, 30);
					createEntity(this, this.gameLayer, 'laser', tc.x, tc.y, this.playerSpatial.dir);
					this.fireSound.play(false);
					this.Fighter.numFired++;
				}
			}
		},
		
		fireWeap4:function(tc) 
		{
			var sinceLastFire = pc.device.now - this.Fighter.weap4.lastFired;
			if (sinceLastFire > 1200) {
				this.Fighter.weap4.lastFired = pc.device.now;
				if (this.Fighter.energy > this.Fighter.weap4.energy) {
					var half = (this.weap4FireSheet.frameWidth / 2)
					this.Fighter.energy = this.Fighter.energy - this.Fighter.weap4.energy;
					tc.subtract(half, half);
					tc.moveInDir(this.playerSpatial.dir, 30);
					createEntity(this, this.gameLayer, 'gravitron', tc.x, tc.y-35, this.playerSpatial.dir);
					createEntity(this, this.gameLayer, 'gravitron', tc.x, tc.y+35, this.playerSpatial.dir);
					this.fireSound.play(false);
					this.Fighter.numFired++;
				}
			}
		},
		
		fireWeapAll:function(tc)  
		{
			this.fireWeap1(tc);
			this.fireWeap2(tc);
			this.fireWeap3(tc);
			this.fireWeap4(tc);
		},
		
        process:function ()
        {
			//Whoa! We are not done loading? Come back later.
            if (!pc.device.loader.finished) { return; }

			if (this.Fighter.status == PlayerStatus.DEAD) {
				createEntity(this, this.gameLayer, 'debris');
				//this.createEntity(this,this.gameLayer,'yourdead');
				this.Fighter.status = PlayerStatus.IDLE;
			} else if (this.Fighter.status == PlayerStatus.IDLE) {
				var i = 0;
			} else {
				this.Fighter.regenerate();

				if (!this.asteroidsLeft)
				{
					// end the level
					//this.createLevelComplete();
					this.newLevel();
				}
				
				var tmp = pc.device.input.isInputState(this, 'turning left');
				
				if (pc.device.input.isInputState(this, 'turning left')) {
					this.playerPhysics.applyTurn(-this.Fighter.jets);
				} else if (pc.device.input.isInputState(this, 'turning right')) {
					this.playerPhysics.applyTurn(this.Fighter.jets);
				} else {
					this.playerPhysics.applyTurn(0);
				}

				//-------------------------------------------------------
				// Player Thrusters
				//-------------------------------------------------------            
				if (pc.device.input.isInputState(this, 'thrusting'))
				{
					this.playerPhysics.applyForce(this.Fighter.thrust);
					this.engine.getComponent('emitter').emitting = true;
				} 
				else if (pc.device.input.isInputState(this, 'reversing')) {
						this.playerPhysics.applyForce(-this.Fighter.thrust);
				} else
				{
					this.engine.getComponent('emitter').emitting = false;
				}
			
				var tc = this.playerSpatial.getCenterPos();
				if (this.Fighter.canFire(1)) if (pc.device.input.isInputState(this, 'weapon1')) this.fireWeap1(tc);
				if (this.Fighter.canFire(2)) if (pc.device.input.isInputState(this, 'weapon2')) this.fireWeap2(tc);
				if (this.Fighter.canFire(3)) if (pc.device.input.isInputState(this, 'weapon3')) this.fireWeap3(tc);
				if (this.Fighter.canFire(4)) if (pc.device.input.isInputState(this, 'weapon4')) this.fireWeap4(tc);
				if (this.Fighter.canFire(1)&&this.Fighter.canFire(2)&&this.Fighter.canFire(3)&&this.Fighter.canFire(4)) 
				{
					if (pc.device.input.isInputState(this, 'allweapons')) this.fireWeapAll(tc);
				}
				this.hudShipType.getComponent('text').text[0] = 'Ship Type: ' + this.Fighter.desc;
				this.hudScore.getComponent('text').text[0] = 'Score: ' + this.score;
				this.hudEnergy.getComponent('text').text[0] = 'Energy: ' + Math.floor(this.Fighter.energy)+' (Bounce:'+this.levelBounce+')';
				this.hudHealth.getComponent('text').text[0] = 'Health: ' + Math.floor(this.Fighter.health);			
			}
			//HUD Bottom
            this._super();
        }
});
HudLayer = pc.Layer.extend('hudLayer',
{},
{
	sheetEnergy:null,					
	sheetEnergyBars:null,				
	sheetArmor:null,					
	sheetArmorBars:null,				

	hudEnergy:null,					
	hudEnergyBars:null,				
	hudArmor:null,					
	hudArmorBars:null,				
	
	selected:0,						//The current backdrop in use [1-7]
	saved:0,						//Saved Selected index
	
	//pc.device.game.gameScene
	init:function() 
	{
		this._super('hudLayer',1);
		//this.createHudEnergy();
		//this.createHudArmor();
	},
		
	createHudEnergy:function ()
	{
        this.sheetEnergy = new pc.SpriteSheet({ image:pc.device.loader.get('hudEnergy').resource});
		this.hudEnergy = pc.Entity.create(this);
		this.hudEnergy.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetEnergy}));
		this.hudEnergy.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetEnergy.frameWidth, h:this.sheetEnergy.frameHeight}));
		this.hudEnergy.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:30, left:30 } }));

        this.sheetEnergyBars = new pc.SpriteSheet({ image:pc.device.loader.get('hudEnergyBars').resource});
		this.hudEnergyBars = pc.Entity.create(this);
		this.hudEnergyBars.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetEnergyBars}));
		this.hudEnergyBars.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetEnergyBars.frameWidth, h:this.sheetEnergyBars.frameHeight}));
		this.hudEnergyBars.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:60, left:30 } }));
	},

	createHudArmor:function ()
	{
        this.sheetArmor = new pc.SpriteSheet({ image:pc.device.loader.get('hudArmor').resource});
		this.hudArmor = pc.Entity.create(this);
		this.hudArmor.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetArmor}));
		this.hudArmor.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetArmor.frameWidth, h:this.sheetArmor.frameHeight}));
		this.hudArmor.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:30, right:30 } }));

        this.sheetArmorBars = new pc.SpriteSheet({ image:pc.device.loader.get('hudArmorBars').resource});
		this.hudArmorBars = pc.Entity.create(this);
		this.hudArmorBars.addComponent(pc.components.Sprite.create({ spriteSheet:this.sheetArmorBars}));
		this.hudArmorBars.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.sheetArmorBars.frameWidth, h:this.sheetArmorBars.frameHeight}));
		this.hudArmorBars.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:60, right:30 } }));
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      //this.hudEnergy.draw(pc.device.ctx, 0, 0);
      //this.hudArmor.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   { }

});
SceneID =
{
    PUBLISHER:0x0000,
    TITLE:0x0001,
    CREDITS:0x0002
};

SplashScene = pc.Scene.extend('splashScene',
{ },
{
	publisherLayer:null,
	titleLayer:null,
	currentScene:SceneID.TITLE,
	btnLaunch:null,
	btnHelp:null,
	btnFeedback:null,
	btnExit:null,

	init:function ()
	{
		this._super();
		this.btnLaunch = pc.Rect.create(700,464,1320,540);
		this.btnHelp = pc.Rect.create(700,580,910,660);
		this.btnFeedback = pc.Rect.create(700,688,1210,748);
		this.btnExit = pc.Rect.create(700,792,900,856);

		//this.publisherLayer = this.addLayer(new PublisherLayer('publisherLayer', 1));
		this.titleLayer = this.addLayer(new TitleLayer('titleLayer', 1));
		
		//pc.device.input.bindState(this, 'select', 'MOUSE_LEFT_CLICK');
		pc.device.input.bindState(this, 'select', 'SPACE');
	},
	onReady:function()
	{
	},
	
    onAction:function (actionName, event, pos) 
	{
	},
		
    process:function () {
	//setLayerInactive:function (layer)
	//setLayerActive:function (layer)

		if (pc.device.input.isInputState(this, 'select'))
		{
			pc.device.game.deactivateScene(this);
			//TheGame.activateScene(TheGame.gameScene);
		
			//var mouse = pc.device.input.mousePos;
			//	if (isPointInRect(mouse.x, mouse.y, this.btnLaunch)) {
			//		this.setLayerInactive(splashScene);
			//		this.setLayerActive(gameScene);
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnHelp)) {
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnFeedback)) {
			//	} else if (isPointInRect(mouse.x, mouse.y, this.btnExit)) {
			//		this.setLayerInactive(splashScene);
			//		this.setLayerInactive(gameScene);
			//		window.back();
			//	}
		}
		
		this._super();   //CALL LAST
	}
});

PublisherLayer = pc.Layer.extend('publisherLayer',
{},
{
	background:null,				//The image being drawn
	
	init:function() 
	{
		this._super('splashLayer',1);
		this.background = pc.device.loader.get('publisher').resource;
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   { }

});

TitleLayer = pc.Layer.extend('titleLayer',
{},
{
	background:null,				//The image being drawn
	
	init:function() 
	{
		this._super('titleLayer',1);
		this.background = pc.device.loader.get('titlescreen').resource;
	},
		
   // override draw to do custom layer drawing
   draw:function()
   {
      // draw a background
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   {
   }
});
StarsLayer = pc.Layer.extend('starsLayer',
{},
{
	background:null,				//The image being drawn
	selected:0,						//The current backdrop in use [1-7]
	saved:0,						//Saved Selected index
	
	init:function() 
	{
		this._super('starsLayer',1);
		this.setBackdrop(1);
	},
	
	setBackdrop:function(stage) {
		if (this.selected != stage) {
			if (stage < 1) { stage = 1; } 
			if (stage > 7) { stage = 7; } 		
			this.selected = stage;
			var bkName = 'backdrop'+this.selected;
			//TODO: Out of memory. Must load each backdrop as needed and release other
			this.background = pc.device.loader.get(bkName).resource;
			//this.background = pc.device.loader.get('backdrop1').resource;
		}
	},
	
   // override draw to do custom layer drawing
   draw:function()
   {
      this.background.draw(pc.device.ctx, 0, 0);
   },

   // override process to update or change things
   process:function()
   { }

});