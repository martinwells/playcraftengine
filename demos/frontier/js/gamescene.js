GameScene = pc.Scene.extend('GameScene',
    { },
    {
        entityFactory:null,
        player:null,
        playerPhysics:null,
        playerSpatial:null,
        engine:null,
        leftCounter:null,
        level:0,

        starsLayer:null,
        nebulaLayer:null,
        gameLayer:null,
        uiLayer:null,
        asteroidSheet:null,
        smallAsteroidSheet:null,
        playerSheet:null,
        plasmaFireSheet:null,
        explosionSheet:null,
        music:null,
        musicPlaying:true,
        fireSound:null,

        init:function ()
        {
            this._super();

            this.entityFactory = new EntityFactory();

            // start the music
            if (pc.device.soundEnabled)
            {
                this.fireSound = pc.device.loader.get('fire').resource;
                this.fireSound.setVolume(0.2);
                this.music = pc.device.loader.get('music1').resource;
                this.music.setVolume(0.2);
//                this.music.play(true);
                this.musicPlaying = true;
            }


            //-----------------------------------------------------------------------------
            // stars layer
            //-----------------------------------------------------------------------------
            this.starsLayer = this.addLayer(new StarFieldLayer(0, 10000, 10000));
            this.nebulaLayer = this.addLayer(new StarFieldLayer(2, 10000, 10000));
            this.planetLayer = this.addLayer(new PlanetLayer());

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            // fire up the systems we need for the game layer
            this.gameLayer.addSystem(new GamePhysics({ gravity:{ x:0, y:0 }, debug:false }));
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Layout());

            //-----------------------------------------------------------------------------
            // ui layer
            //-----------------------------------------------------------------------------
            this.uiLayer = this.addLayer(new pc.EntityLayer('ui', pc.device.canvasWidth, pc.device.cavnasHeight));
            this.uiLayer.addSystem(new pc.systems.Render());
            this.uiLayer.addSystem(new pc.systems.Expiration());
            this.uiLayer.addSystem(new pc.systems.Effects());
//            this.uiLayer.systemManager.add(new RadarSystem(this.gameLayer));
            this.uiLayer.addSystem(new pc.systems.Layout({ margin:{ top:10, left:10, bottom:10, right:10 } }));
//            this.uiLayer.systemManager.add(new RadarSystem(this.gameLayer));

            var e = pc.Entity.create(this.uiLayer);
            e.addComponent(pc.components.Rect.create({ color:'#000000', lineWidth:0 }));
            e.addComponent(pc.components.Alpha.create({level:0.6}));
            e.addComponent(RadarComponent.create());
            e.addComponent(pc.components.Spatial.create({ w:150, h:150 }));
            e.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'right',
                margin:{ top:0, left:10, bottom:10, right:0 }}));

            // add origin tracking, this causes these layers to shift there origin (scroll) at a given ratio
            // to the game layer, which creates nice parallax effects on the backgrounds
            this.starsLayer.setOriginTrack(this.gameLayer, 0.03, 0.03);
            this.nebulaLayer.setOriginTrack(this.gameLayer, 0.05, 0.05);
            this.planetLayer.setOriginTrack(this.gameLayer, 0.1, 0.1);

            // create some asteroids
            this.newLevel();

            // setup the controls
            pc.device.input.bindState(this, 'turning right', 'D');
            pc.device.input.bindState(this, 'turning right', 'RIGHT');
            pc.device.input.bindState(this, 'turning left', 'A');
            pc.device.input.bindState(this, 'turning left', 'LEFT');
            pc.device.input.bindState(this, 'thrusting', 'W');
            pc.device.input.bindState(this, 'thrusting', 'UP');
            pc.device.input.bindState(this, 'reversing', 'S');
            pc.device.input.bindState(this, 'reversing', 'DOWN');
            pc.device.input.bindState(this, 'firing', 'MOUSE_BUTTON_LEFT_DOWN');
            pc.device.input.bindState(this, 'firing', 'SPACE');
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

        startLevel:function (level)
        {
            this.level = level;

            // load up the map
            this.loadFromTMX(pc.system.loader.get('level' + this.level).resource);
            this.spaceStationLayer = this.get('station');
            this.gameLayer = this.get('Object Layer 1');
            this.spaceStationLayer.origin = this.gameLayer.origin;

            // make sure the uiLayer is drawn last
            this.uiLayer.setZIndex(10);

            // tell the radar about the new level
//            this.radarLayer.setLayers(this.spaceStationLayer, this.gameLayer);

            // setup the starting entities
            this.player = this.createEntity(this.gameLayer, 'player',
                (this.gameLayer.scene.viewPort.w / 2) - 24, (this.gameLayer.scene.viewPort.h / 2) - 24, 0);
            this.playerPhysics = this.player.getComponent('physics');
            this.playerSpatial = this.player.getComponent('spatial');

        },

        lastFireTime:0,
        fireDelay:150,

        process:function ()
        {
            if (!pc.device.loader.finished) return;

            this.gameLayer.origin.x = this.playerSpatial.getCenterPos().x - (this.viewPort.w / 2);
            this.gameLayer.origin.y = this.playerSpatial.getCenterPos().y - (this.viewPort.h / 2);
            // because the star and nebular layers are set to origin track the game layer, we don't need to
            // adjust them here; it's automatic

            if (pc.device.input.isInputState(this, 'turning left'))
                this.playerPhysics.applyTurn(-40);
            if (pc.device.input.isInputState(this, 'turning right'))
                this.playerPhysics.applyTurn(40);

            if (!(pc.device.input.isInputState(this, 'turning left')) && !(pc.device.input.isInputState(this, 'turning right')))
                this.playerPhysics.applyTurn(0);

            if (pc.device.input.isInputState(this, 'thrusting'))
            {
                this.playerPhysics.applyForce(10);
                this.engine.getComponent('emitter').emitting = true;
            } else
            {
                this.engine.getComponent('emitter').emitting = false;
            }

            if (pc.device.input.isInputState(this, 'reversing'))
                this.playerPhysics.applyForce(-10);

            if (pc.device.input.isInputState(this, 'firing'))
            {
                var sinceLastFire = pc.device.now - this.lastFireTime;
                if (sinceLastFire > this.fireDelay)
                {
                    this.fireSound.play(false);
                    var tc = this.playerSpatial.getCenterPos();
                    // offset the size of the bullet (the center of the 30x30 image)
                    tc.subtract(15, 15);
                    // move outward in the direction of the ship so the bullets appear to be coming from the front
                    tc.moveInDir(this.playerSpatial.dir, 20);
                    this.createEntity(this.gameLayer, 'plasmaFire', tc.x, tc.y, this.playerSpatial.dir);
                    this.lastFireTime = pc.device.now;
                }
            }

            this._super();
        }
    });

