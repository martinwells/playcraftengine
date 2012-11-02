/**
 * Package com.I2TM.web.RoidsOnRoids
 */
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
 
var Fighter = pc.Base.extend('Fighter',
{ },
{	  desc:'',
	  mass:0,
	  maxSpeed: 0,
	  thrust: 0.0,
	  jets: 0,
	  maxEnergy:1000,
	  
	  bulletSpeed:1000,
	  bulletForce:0,
	  bulletDelay:0,
	  bulletLife:0,
	
	  regen: 0,
	  energy:0,
	  health:0,
	  status:0,  
	  
	  numFired:0,
	  numHit:0,

  init: function(de,ma,re,ms,th,jt,bs,bf,bd,bl)    // instance constructor
  {
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
 
  getThrust:function() {return this.thrust;}
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
			this.background = pc.device.loader.get(bkName).resource;
		}
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


SplashLayer = pc.Layer.extend('splashLayer',
{},
{
	background:null,				//The image being drawn
	selected:0,						//The current backdrop in use [1-7]
	saved:0,						//Saved Selected index
	
	init:function() 
	{
		this._super('splashLayer',1);
		this.background = pc.device.loader.get('splash').resource;
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


//var starsLayer = new StarsLayer('stars layer', 1);
//gameScene.addLayer(starsLayer);


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
                            this.layer.scene.createEntity('asteroid-medium', this.layer, sp.pos.x + addX, sp.pos.y + addY);
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
                                this.layer.scene.createEntity('asteroid-small', this.layer, sp.pos.x + addX, sp.pos.y + addY);
                            }

                            entityA.layer.scene.asteroidsLeft += count;
                        }
                }

				updateScoreHealth(entityA,entityB);
	
				//HUD Asteroids Left Top-Left
                entityA.layer.scene.hudAsteroids.getComponent('text').text[0] = 'Asteroids Left: ' + entityA.layer.scene.asteroidsLeft;
            } //End Asteroid <-> Bullet Collisoon
			
			//Start Bullet <-> Wall Collision
			else if (entityB.hasTag('BULLET') && entityA.hasTag('WALL')) {
				entityB.getComponent('physics').setCollisionMask(0);
				entityB.getComponent('physics').setLinearVelocity(0, 0);
				entityB.remove();
            }

			//Start Asteroid <-> Wall Collision
			else if ((entityB.hasTag('ASTEROID-LARGE') || entityB.hasTag('ASTEROID-MEDIUM') || entityB.hasTag('ASTEROID-SMALL')) && entityA.hasTag('WALL')) {
				var i = 0;
            }

			entityA.layer.scene.hudShipType.getComponent('text').text[0] = 'Ship Level: ' + entityA.layer.scene.Fighter.desc;
			entityA.layer.scene.hudScore.getComponent('text').text[0] = 'Score: ' + entityA.layer.scene.score;
			//HUD Bottom
			//entityA.layer.scene.hudEnergy.getComponent('text').text[0] = 'Energy: ' + entityA.layer.scene.Fighter.energy;
			//entityA.layer.scene.hudHealth.getComponent('text').text[0] = 'Health: ' + entityA.layer.scene.Fighter.health;
        }
    });

GameScene = pc.Scene.extend('GameScene',
    { },
    {
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
        splashLayer:null,
        largeAsteroidSheet:null,
        mediumAsteroidSheet:null,
        smallAsteroidSheet:null,
        playerSheet:null,
        bulletFireSheet:null,
		exhaustSheet:null,
        //music:null,
        musicPlaying:true,
        fireSound:null,

        init:function ()
        {
			if (pc.device.devMode) { this.info('init Method'); }
            this._super();
        	this.Fighter1 = new Fighter('Scout',5,1,25,2.0,20,500,50,350,1500);
        	this.Fighter2 = new Fighter('Fighter',6,25,35,2.3,30,750,60,300,1250);
        	this.Fighter3 = new Fighter('Frigate',7,30,45,2.6,40,1000,70,250,1000);
        	this.Fighter4 = new Fighter('Destroyer',8,40,55,2.9,50,1250,80,200,750);
        	this.Fighter5 = new Fighter('Dreadnaught',9,45,65,3.2,60,1500,90,100,500);

			this.Fighter = this.Fighter1;
			
            pc.device.devMode = !pc.packed;
            if (pc.device.devMode) { this.info('Initializing Game'); }

            // start the music
            if (pc.device.soundEnabled)
            {
                this.fireSound = pc.device.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
                //this.music = pc.device.loader.get('music').resource;
                //this.music.setVolume(0.2);
                //this.music.play(true);
                //this.musicPlaying = true;
            }          
            
            // setup the sprites used in the game scene
            if (pc.device.devMode) { this.info('Initializing Sprites'); }
            
			
            //-----------------------------------------------------------------------------
            // Initialize asteroid sprites
            //-----------------------------------------------------------------------------
            this.largeAsteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid-large').resource, useRotation:true, frameWidth:96, frameHeight:96 });
            this.largeAsteroidSheet.addAnimation({ name:'floating', time:200, frameCount:20 });

            this.mediumAsteroidSheet = new pc.SpriteSheet({  image:pc.device.loader.get('asteroid-medium').resource, useRotation:true, frameWidth:64, frameHeight:64 });
            this.mediumAsteroidSheet.addAnimation({ name:'floating', time:400, frameCount:20 });
            
            this.smallAsteroidSheet = new pc.SpriteSheet({ image:pc.device.loader.get('asteroid-small').resource, useRotation:true, frameWidth:24, frameHeight:24 });
            this.smallAsteroidSheet.addAnimation({ name:'floating', time:600, frameCount:20 });

            //-----------------------------------------------------------------------------
            // Initialize player sprites
            //-----------------------------------------------------------------------------			
            this.playerSheet = new pc.SpriteSheet({ image:pc.device.loader.get('player-ship').resource, frameWidth:80, frameHeight:80, useRotation:true});
            this.playerSheet.addAnimation({ name:'floating', frameCount:1});

            this.playerDebris = new pc.SpriteSheet({ image:pc.device.loader.get('player-debris').resource, frameWidth:600, frameHeight:600, useRotation:false});
            this.playerDebris.addAnimation({ name:'floating', frameCount:1});
			
            this.bulletFireSheet = new pc.SpriteSheet({ image:pc.device.loader.get('bullets').resource, frameWidth:8, frameHeight:80 });
            this.bulletFireSheet.addAnimation({ name:'floating', time:400, dirAcross:true });

            this.exhaustSheet = new pc.SpriteSheet({image:pc.device.loader.get('exhaust').resource,frameWidth:24, frameHeight:24, framesWide:20, framesHigh:1, useRotation:true});
			this.exhaustSheet.addAnimation({ name:'thrusting', time:2000, loops:1 });
			
			
            //-----------------------------------------------------------------------------
            // stars layer (Backdrop)
            //-----------------------------------------------------------------------------
			this.starsLayer = this.addLayer(new StarsLayer('stars layer', 1));

            //-----------------------------------------------------------------------------
            // game layer (Main Game)
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Game Layer'); }
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            //-----------------------------------------------------------------------------
            // splash layer (Title/Splash screen)
            //-----------------------------------------------------------------------------
			//this.splashLayer = this.addLayer(new SplashLayer('splashLayer', 1));
			
            //-----------------------------------------------------------------------------
            // fire up the systems we need for the game layer
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Game Physics'); }
            this.gameLayer.addSystem(new GamePhysics({ gravity:{ x:0, y:0 }, debug:pc.device.devMode }));
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            
            //-----------------------------------------------------------------------------
            // setup the starting entities           
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Player Ship & Physics'); }
            this.player = this.createEntity('player', this.gameLayer,(this.gameLayer.scene.viewPort.w / 2)-40, (this.gameLayer.scene.viewPort.h / 2)-40, 0);
            this.engine = this.createEntity('engine', this.gameLayer,(this.gameLayer.scene.viewPort.w / 2), (this.gameLayer.scene.viewPort.h / 2), 0, this.player);
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

            this.createEntity('instructions', this.gameLayer);
            this.createLevelAlert(this.gameLayer, 1);
            this.createhudAsteroids();
            this.createhudShipType();
			this.createhudScore();
			this.createhudEnergy();
			this.createhudHealth();

            this.starsLayer.setZIndex(1);
            this.gameLayer.setZIndex(2);
            
            //-----------------------------------------------------------------------------
            // setup the controls
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Input'); }
            pc.device.input.bindState(this, 'turning right', 'D');
            pc.device.input.bindState(this, 'turning right', 'RIGHT');
            pc.device.input.bindState(this, 'turning left', 'A');
            pc.device.input.bindState(this, 'turning left', 'LEFT');
            pc.device.input.bindState(this, 'thrusting', 'W');
            pc.device.input.bindState(this, 'thrusting', 'UP');
            pc.device.input.bindState(this, 'reversing', 'S');
            pc.device.input.bindState(this, 'reversing', 'DOWN');
            pc.device.input.bindState(this, 'firing', 'MOUSE_LEFT_BUTTON');
            pc.device.input.bindState(this, 'firing', 'SPACE');
            pc.device.input.bindAction(this, 'toggle music', 'F10');
        },

        displayText:function (s)
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1000, holdTime:1000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#e65cba', text:[s], fontHeight:20 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{left:30 }}));
        },

        createEntity:function (type, layer, x, y, dir, attachTo)
        {
            //if (pc.device.devMode) { this.info('Creating Entity '+type); }
            var e = null;

            switch (type)
            {
                case 'asteroid-small':
                    e = pc.Entity.create(layer);
                    e.addTag('ASTEROID-SMALL');
					e.points = 100;

                    e.addComponent(pc.components.Sprite.create(
                        {
                            currentFrame:pc.Math.rand(0, 10),
                            animSpeedOffset:pc.Math.rand(500, 1000),
                            spriteSheet:this.smallAsteroidSheet, animationStart:'floating'
                        }));
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x, y:y,
                            dir:pc.Math.rand(0, 359),
                            w:this.smallAsteroidSheet.frameWidth,
                            h:this.smallAsteroidSheet.frameHeight
                        }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            force:20,
                            mass:3,
                            bounce:1,
                            shapes:[{shape:pc.CollisionShape.CIRCLE}],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                        }));

                    return e;

                case 'asteroid-medium':
                    e = pc.Entity.create(layer);
                    e.addTag('ASTEROID-MEDIUM');
					e.points = 200;

                    e.addComponent(pc.components.Sprite.create(
                        {
                            currentFrame:pc.Math.rand(0, 10),
                            animSpeedOffset:pc.Math.rand(500, 1000),
                            spriteSheet:this.mediumAsteroidSheet, animationStart:'floating'
                        }));
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x, y:y,
                            dir:pc.Math.rand(0, 359),
                            w:this.mediumAsteroidSheet.frameWidth,
                            h:this.mediumAsteroidSheet.frameHeight
                        }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            force:10,
                            mass:5,
                            bounce:1,
                            shapes:[{shape:pc.CollisionShape.CIRCLE}],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                        }));

                    return e;
                    
                case 'asteroid-large':
                    e = pc.Entity.create(layer);
                    e.addTag('ASTEROID-LARGE');
					e.points = 400;

                    // pick a random spot for the asteroid, but make sure it's not near the center
                    var x1 = 0;
                    var y1 = 0;
                    do
                    {
                        x1 = pc.Math.rand(100, pc.device.canvasWidth - 100);
                        y1 = pc.Math.rand(100, pc.device.canvasHeight - 100);

                    } while (pc.Math.isPointInRect(x1, y1, (pc.device.canvasWidth / 2) - 100, (pc.device.canvasHeight / 2) - 100, 200, 200));

                    e.addComponent(pc.components.Sprite.create(
                        {
                            currentFrame:pc.Math.rand(0, 10),
                            animSpeedOffset:pc.Math.rand(500, 1000),
                            spriteSheet:this.largeAsteroidSheet, animationStart:'floating'
                        }));
                    e.addComponent(pc.components.Spatial.create(
                        {
                            x:x1, y:y1,
                            dir:pc.Math.rand(0, 359),
                            w:this.largeAsteroidSheet.frameWidth,
                            h:this.largeAsteroidSheet.frameHeight
                        }));
                    e.addComponent(pc.components.Physics.create(
                        {
                            impulse:10,
                            mass:7,
                            bounce:0.5,
                            shapes:[ {shape:pc.CollisionShape.CIRCLE} ],
                            collisionCategory:CollisionType.ENEMY,
                            collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                        }));

                    return e;

                case 'player':
					this.Fighter.status = PlayerStatus.ALIVE;
                    e = pc.Entity.create(layer);
                    e.addTag('PLAYER');

                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.playerSheet, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,
                        w:this.playerSheet.frameWidth, h:this.playerSheet.frameHeight}));

                    e.addComponent(pc.components.Physics.create(
                        {
                            maxSpeed:{x:this.Fighter.maxSpeed, y:this.Fighter.maxSpeed},
                            linearDamping:0.0,
                            mass:this.Fighter.mass,
                            shapes:[{shape:pc.CollisionShape.CIRCLE}],
                            collisionCategory:CollisionType.FRIENDLY,
                            collisionMask:CollisionType.ENEMY
                        }));
                    return e;

                case 'debris':
                    e = pc.Entity.create(layer);
                    e.addTag('DEBRIS');
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.playerDebris, animationStart:'floating' }));
                    e.addComponent(pc.components.Spatial.create({x:(pc.device.canvasWidth / 2) - 300, y:(pc.device.canvasHeight / 2) - 300, dir:pc.Math.rand(0, 359),
                        w:this.playerDebris.frameWidth, h:this.playerSheet.frameHeight}));
                    return e;
					
                case 'engine':
                    // attach the engine emitter (it's an entity so it can be attached to the back of the ship)
                    var e = pc.Entity.create(layer);
                    e.addComponent(pc.components.Spatial.create({ dir:dir, w:24, h:24}));
                    e.addComponent(pc.components.Physics.create({ shapes:[ { shape:pc.CollisionShape.CIRCLE } ] }));
                    e.addComponent(pc.components.ParticleEmitter.create({spriteSheet:this.exhaustSheet,burst:1,delay:10,thrustMin:2, thrustMax:4,thrustTime:250,lifeMin:400,fadeOutTime:800,spinMin:65,rotateSprite:true,emitting:true}));
                    e.addComponent(pc.components.Joint.create({attachedTo:attachTo,type:pc.JointType.REVOLUTE,offset:{x:-40, y:0}}));                   
                    return e;

                case 'bullet':
					var e = pc.Entity.create(layer);
					e.addTag('BULLET');
					e.addComponent(pc.components.Sprite.create({ spriteSheet:this.bulletFireSheet, animationStart:'floating'  }));
					e.addComponent(pc.components.Expiry.create({ lifetime:this.Fighter.bulletLife }));
					e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:dir,	w:this.bulletFireSheet.frameWidth, h:this.bulletFireSheet.frameHeight}));
					e.addComponent(pc.components.Physics.create({maxSpeed:{x:this.Fighter.bulletSpeed, y:this.Fighter.bulletSpeed},	force:Fighter.bulletForce, shapes:[ { shape:pc.CollisionShape.CIRCLE } ], CollisionCategory:CollisionType.FRIENDLY, collisionMask:CollisionType.ENEMY}));
					return e;
														
                case 'instructions':
                    e = pc.Entity.create(layer);
                    e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
                    e.addComponent(pc.components.Fade.create({ startDelay:1000, fadeInTime:3500, holdTime:3000, fadeOutTime:1500 }));
                    e.addComponent(pc.components.Text.create({ text:['Arrow keys=move', 'Space=fire', 'F9=toggle debug', 'F10=toggle music'], lineWidth:0, fontHeight:14, offset:{x:25, y:-65} }));
                    e.addComponent(pc.components.Expiry.create({ lifetime:8000 }));
                    e.addComponent(pc.components.Spatial.create({ dir:0, w :170, h:85 }));
                    e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'right', margin:{ right:80 } }));
                    return e;
            }

            return null;
        },

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

		
        createYourToastAlert:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:3000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Text.create({ color:'#2d2929', strokeColor:'#631212', text:['Your Toast!'], lineWidth:2,fontHeight:80 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:280, h:80 }));
            e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center' }));
            //e.addComponent(pc.components.Layout.create({ vertical:'center', horizontal:'center', margin:{ bottom:0, left:0 } }));
        },
		
        createLevelAlert:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Fade.create({ fadeInTime:1500, holdTime:2000, fadeOutTime:1500 }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:44 }));
			if (this.level > 1) {
				e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['Level ' + this.level+' Your average was '+this.average+'%'], lineWidth:2, fontHeight:44 }));
				e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'center', margin:{ bottom:170, right:550 } }));
			} else {
				e.addComponent(pc.components.Text.create({ color:'#000000', strokeColor:'#6666ff', text:['Level ' + this.level], lineWidth:2, fontHeight:44 }));
				e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'center', margin:{ bottom:170, left:0 } }));
			}
        },

        createhudAsteroids:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Asteroids Left: ' + this.asteroidsLeft],
                lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{ top:30, left:30 } }));
            this.hudAsteroids = e;
        },

        createhudShipType:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Ship Level: ' + this.Fighter.desc],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'center', margin:{ top:30, left:30 } }));
            this.hudShipType = e;
        },

        createhudScore:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Score: ' + this.score],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'right', margin:{ top:30, right:30 } }));
            this.hudScore = e;
        },

        createhudEnergy:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Energy: ' + this.Fighter.energy],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'left', margin:{ bottom:30, left:30 } }));
            this.hudEnergy = e;
        },

        createhudHealth:function ()
        {
            var e = pc.Entity.create(this.gameLayer);
            e.addComponent(pc.components.Text.create({ color:'#ffffff', text:['Health: ' + this.Fighter.health],lineWidth:0, fontHeight:20 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:20 }));
            e.addComponent(pc.components.Layout.create({ vertical:'bottom', horizontal:'right', margin:{ bottom:30, right:30 } }));
            this.hudHealth = e;
        },
		
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
			this.Fighter.numHit = 0;
			this.Fighter.numFired = 0;
            //-----------------------------------------------------------------------------
            // Determine With Stage we are on and set appropiate backdrop
            //-----------------------------------------------------------------------------
            var old_stage = this.stage;
            if (this.level <=3) {
                this.stage = 1;
				this.Fighter = this.Fighter1;
            } if (this.level >=4 && this.level <=8) {
                this.stage = 2;
				this.Fighter = this.Fighter2;
            } if (this.level >=9 && this.level <=15) {
                this.stage = 3;
				this.Fighter = this.Fighter3;
            } if (this.level >=16 && this.level <=26) {
                this.stage = 4;
				this.Fighter = this.Fighter4;
            } if (this.level >=27 && this.level <=37) {
                this.stage = 5;
				this.Fighter = this.Fighter5;
            } if (this.level >=38 && this.level <=48) {
                this.stage = 6;
            } else if (this.level >= 48) {
                this.stage = 7;
            }

        	if (pc.device.devMode) { this.info('Creating level '+this.level+' stage '+this.stage); }
            if (this.stage !== old_stage) {
            	this.starsLayer.setBackdrop(this.stage);
            }
            
            var count = 2 + this.level;
            for (var i = 0; i < count; i++) {
                this.createEntity('asteroid-large', this.gameLayer);
            }
            this.asteroidsLeft += count;
        },

        onAction:function (actionName, event, pos)
        {
			//if (pc.device.devMode) { this.info('onAction Event Method'); }
            if (actionName === 'toggle debug')
            {
                var ph = this.gameLayer.getSystemsByComponentType('physics').first.object();
                ph.setDebug(!ph.debug);
            }
        },

        process:function ()
        {
			//if (pc.device.devMode) { this.info('process Method'); }
            if (!pc.device.loader.finished) { return; }

			if (this.Fighter.status == PlayerStatus.DEAD) {
				this.createEntity('debris', this.gameLayer);
				//this.createYourToastAlert();
				this.Fighter.status = PlayerStatus.IDLE;
			} else if (this.Fighter.status == PlayerStatus.IDLE) {
				var i = 0;
			} else {
				this.Fighter.regenerate();

				if (!this.asteroidsLeft)
				{
					// end the level
					this.createLevelComplete();
					this.newLevel();
					this.createLevelAlert();
				}

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

				if (pc.device.input.isInputState(this, 'firing'))
				{
					if (this.Fighter.energy > 50) {
						var sinceLastFire = pc.device.now - this.lastFireTime;
						if (sinceLastFire > this.Fighter.bulletDelay)
						{
							this.Fighter.numFired++;
							this.Fighter.energy = this.Fighter.energy - 50;
							this.fireSound.play(false);
							var tc = this.playerSpatial.getCenterPos();
//							tc.subtract(15, 15);
							tc.moveInDir(this.playerSpatial.dir, 15);
							this.createEntity('bullet', this.gameLayer, tc.x, tc.y-40, this.playerSpatial.dir, this.player);
							this.lastFireTime = pc.device.now;
						}
					}
				}
				this.hudEnergy.getComponent('text').text[0] = 'Energy: ' + Math.floor(this.Fighter.energy);
				this.hudHealth.getComponent('text').text[0] = 'Health: ' + Math.floor(this.Fighter.health);			
			}
			//HUD Bottom
            this._super();
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
			if (pc.device.devMode) { this.info('onReady Event Method'); }
            this._super();

            // load resources
            pc.device.loader.setDisableCache();
            pc.device.loader.add(new pc.Image('splash', 'images/splash.png'));
            pc.device.loader.add(new pc.Image('player-ship', 'images/ship5.png'));
            pc.device.loader.add(new pc.Image('player-debris', 'images/ship_debris.png'));
            pc.device.loader.add(new pc.Image('backdrop1', 'images/backdrop01.png'));
            //pc.device.loader.add(new pc.Image('backdrop2', 'images/backdrop02.png'));
            //pc.device.loader.add(new pc.Image('backdrop3', 'images/backdrop03.png'));
            //pc.device.loader.add(new pc.Image('backdrop4', 'images/backdrop04.png'));
            //pc.device.loader.add(new pc.Image('backdrop5', 'images/backdrop05.png'));
            //pc.device.loader.add(new pc.Image('backdrop6', 'images/backdrop06.png'));
            //pc.device.loader.add(new pc.Image('backdrop7', 'images/backdrop07.png'));
            pc.device.loader.add(new pc.Image('explosions', 'images/smallexplosions.png'));
            pc.device.loader.add(new pc.Image('exhaust', 'images/exhaust.png'));
            pc.device.loader.add(new pc.Image('bullets', 'images/gun5.png'));
            pc.device.loader.add(new pc.Image('asteroid-large', 'images/asteroid-large.png'));
            pc.device.loader.add(new pc.Image('asteroid-medium', 'images/asteroid-medium.png'));
            pc.device.loader.add(new pc.Image('asteroid-small', 'images/asteroid-small.png'));
            pc.device.loader.add(new pc.Image('smoke', 'images/smoke1.png'));

            if (pc.device.soundEnabled)
            {
                pc.device.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg'], 32));
                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg'], 32));
                //pc.device.loader.add(new pc.Sound('music', 'sounds/PushTheLimits', ['mp3'], 1));
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
            ctx.fillStyle = "#88f";
            ctx.fillText('Roids on Roids', 40, (pc.device.canvasHeight / 2) - 50);
            ctx.font = "normal 18px Verdana";
            ctx.fillStyle = "#777";
            ctx.fillText('Loading: ' + percentageComplete + '%', 40, pc.device.canvasHeight / 2);
        },

        onLoaded:function ()
        {
            if (this.gameScene === null) {
				this.gameScene = new GameScene();
				this.addScene(this.gameScene);
			} else {
				if (pc.device.devMode) { this.info('GameScene already exits. Not creating again.'); }
			}
        }

    });


