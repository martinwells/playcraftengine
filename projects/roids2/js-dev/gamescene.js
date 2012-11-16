RoidsScene = pc.Scene.extend('RoidsScene',
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
		
		//weap1LastFired:0,
		//weap2LastFired:0,
		//weap3LastFired:0,
		//weap4LastFired:0,
		
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
        	this.Fighter2 = new Fighter('Fighter',6,3,35,3.0,60,750,60,300,1250);
        	this.Fighter3 = new Fighter('Frigate',7,4,45,3.5,80,1000,70,250,1000);
        	this.Fighter4 = new Fighter('Destroyer',8,5,55,4.0,100,1250,80,200,750);
        	this.Fighter5 = new Fighter('Dreadnaught',9,6,65,4.5,120,1500,90,100,500);

			this.Fighter = this.Fighter1;
			
            if (pc.device.devMode) { this.info('Initializing sound'); }

            // start the music
            if (pc.device.soundEnabled)
            {
                this.fireSound = pc.device.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
                this.music = pc.device.loader.get('music').resource;
                this.music.setVolume(0.2);
                //this.music.play(true);
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
            // hud layer overlay
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Creating HUD Layer'); }
			this.hudLayer = this.addLayer(new HudLayer('hudLayer', pc.device.canvasWidth, pc.device.canvasHeight));
            
            //-----------------------------------------------------------------------------
            // setup the starting entities           
            //-----------------------------------------------------------------------------
            if (pc.device.devMode) { this.info('Initializing Player'); }
            this.player = createEntity(this, this.gameLayer, 'player', (this.gameLayer.scene.viewPort.w / 2)-40, (this.gameLayer.scene.viewPort.h / 2)-40, 0);
            this.engine = createEntity(this, this.gameLayer, 'engine', (this.gameLayer.scene.viewPort.w / 2), (this.gameLayer.scene.viewPort.h / 2), 0, this.player);
            this.leftTurret = createEntity(this, this.gameLayer, 'leftTurret', (this.gameLayer.scene.viewPort.w / 2), (this.gameLayer.scene.viewPort.h / 2), 0, this.player);
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
            pc.device.input.bindState(this, 'turning right', 'RIGHT');				//Turn Right
            pc.device.input.bindState(this, 'turning left', 'LEFT');				//Turn Left
            pc.device.input.bindState(this, 'thrusting', 'UP');						//Accellerate
            pc.device.input.bindState(this, 'reversing', 'DOWN');					//Decellerate
			//Activate/Deactivate Weapons Systems
            pc.device.input.bindState(this, 'weapon1', '1');
            pc.device.input.bindState(this, 'weapon2', '2');
            pc.device.input.bindState(this, 'weapon3', '3');
            pc.device.input.bindState(this, 'weapon4', '4');
            pc.device.input.bindState(this, 'allweapons', '5');

			//***** CHEATS Remove before release *******//
            pc.device.input.bindAction(this, 'changeship', '0');
		
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
			if (actionName == 'changeship') { 
				if (this.Fighter.desc=='Scout') this.Fighter = this.Fighter2
				else if (this.Fighter.desc=='Fighter') this.Fighter = this.Fighter3; 
				else if (this.Fighter.desc=='Frigate') this.Fighter = this.Fighter4; 
				else if (this.Fighter.desc=='Destroyer') this.Fighter = this.Fighter5; 
				else if (this.Fighter.desc=='Dreadnaught') this.Fighter = this.Fighter1; 
			}
			//if (actionName == 'Scout') { this.Fighter = this.Fighter1; }
			//if (actionName == 'Fighter') { this.Fighter = this.Fighter2; }
			//if (actionName == 'Frigate') { this.Fighter = this.Fighter3; }
			//if (actionName == 'Destroyer') { this.Fighter = this.Fighter4; }
			//if (actionName == 'Dreadnaught') { this.Fighter = this.Fighter5; }
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
				if (this.Fighter.canFire(1)) {
				//if (this.Fighter.energy > this.Fighter.weap1.energy) {
					var half = (this.weap1FireSheet.frameWidth / 2);
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
					var half = (this.weap2FireSheet.frameWidth / 2);
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
					var half = (this.weap4FireSheet.frameWidth / 2);
					this.Fighter.energy = this.Fighter.energy - this.Fighter.weap4.energy;
					tc.subtract(half, half);
					tc.moveInDir(this.playerSpatial.dir - 15, 45);
					createEntity(this, this.gameLayer, 'gravitron', tc.x, tc.y, this.playerSpatial.dir);
                    createEntity(this, this.gameLayer, 'gravitron', tc.x, tc.y, this.playerSpatial.dir);
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
