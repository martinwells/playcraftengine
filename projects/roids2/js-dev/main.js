/**
 * Package com.I2TM.web.RoidsOnRoids
 */
var GAMENAME = 'Roids Playcraft Demo';
var GAMEVERSION = '0.6.0-alpha';
var GAMETAG = GAMENAME + ' v' + GAMEVERSION;
 
PlayerStatus =
{
    IDLE:	0x0000,
    DEAD:	0x0001,
    ALIVE:	0x0002
};

CollisionType =
{
    NONE:		0x0000, // BIT MAP
    BULLETS:	0x0001, // 0000001
    ENEMY:		0x0002, // 0000010
    FRIENDLY:	0x0004 // 0000100
};

var Weapon = pc.Base.extend('Weapon',
{},
{
	name: '',
    avail: false,		//Is the system available
	energy:0,			//Energy used to fire single shot
	speed:0,			//Max traveling speed
	force:0,			//Amount of force on impact
	delay:0,			//time between firing (ms)
	life:0,				//Life time of bullet before vanishing
	lastFired:0,		//time last shot was fired.
	
	init:function(na,en,bs,bf,bd,bl)
	{
		this.name = na;
		this.avail = false;
		this.energy = en;
		this.speed = bs;
		this.force = bf;
		this.delay = bd;
		this.life = bl;
	},

	canFire:function(shipEnergy)
	{
		if (shipEnergy > this.energy)
			return true
		else 
			return false;
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

	//bulletSpeed:1000,
	//bulletForce:0,
	//bulletDelay:0,
	//bulletLife:0,

	weap1:null,
	weap2:null,
	weap3:null,
	weap4:null,
	
	regen: 0,
	energy:0,
	health:0,
	status:0,  

	numFired:0,
	numHit:0,

	init: function(de,ma,re,ms,th,jt,bs,bf,bd,bl)    // instance constructor
	{
		this.weap1 = new Weapon ('Mass_Projector',30);
		this.weap2 = new Weapon('Plasma_Cannons',30);
		this.weap3 = new Weapon('Laser_Pods',40);
		this.weap4 = new Weapon('Gravibombs',60);
		
		this.desc = de;
		this.mass = ma;
		this.regen = re;
		this.maxSpeed = ms;
		this.thrust = th;
		this.jets = jt;
		//this.bulletSpeed = bs;
		//this.bulletForce = bf;
		//this.bulletDelay = bd;
		//this.bulletLife = bl;
		
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
				if (this.weap1.canFire(this.energy)) return true; else	return false;
			case 2: 
				if (this.weap2.canFire(this.energy)) return true; else	return false;
			case 3: 
				if (this.weap3.canFire(this.energy)) return true; else	return false;
			case 4: 
				if (this.weap4.canFire(this.energy)) return true; else	return false;
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
        RoidsScene:null,
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
            pc.device.loader.add(new pc.Image('hudenergybase', 'images/hudenergybase.png'));
            pc.device.loader.add(new pc.Image('hudarmorbase', 'images/hudarmorbase.png'));
            pc.device.loader.add(new pc.Image('hudenergybars', 'images/hudenergybars.png'));
            pc.device.loader.add(new pc.Image('hudarmorbars', 'images/hudarmorbars.png'));

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
			if (this.RoidsScene === null) {
				this.RoidsScene = new RoidsScene();
				this.addScene(this.RoidsScene);
			}
        }

    });

