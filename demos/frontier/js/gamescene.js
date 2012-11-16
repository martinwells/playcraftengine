


GameScene = pc.Scene('GameScene',
    {},
    {
        gameLayer:null,
        playerShip:null,
        energyBarLayer:null,
        spaceStationLayer:null,
        radarLayer:null,
        state:0,
        originTarget:null,
        starFieldLayer1:null,
        starFieldLayer2:null,
        starFieldLayer3:null,
        uiLayer:null,
        level:1,

        init:function ()
        {
            this._super('game');
        },

        onReady:function ()
        {
            // create the background layer
            this.starFieldLayer1 = theGame.starFieldLayer1;
            this.starFieldLayer3 = theGame.starFieldLayer3;
            this.addLayer(this.starFieldLayer1);
//            this.addLayer(this.starFieldLayer2); // was a bit slow with this running in firefox
            this.addLayer(this.starFieldLayer3);
            this.planetLayer = new PlanetLayer();
            this.addLayer(this.planetLayer);

            // create the player ship -- not in a layer/level till startLevel is called
            this.playerShip = Gunstar.create();

            // sets up input states and binds them to the player entity
            // you can have multiple inputs result in a different state
            if (!pc.system.isTouch)
            {
                pc.system.input.bindState(this.playerShip, 'moving_right', 'RIGHT');
                pc.system.input.bindState(this.playerShip, 'moving_right', 'D');
                pc.system.input.bindState(this.playerShip, 'moving_left', 'LEFT');
                pc.system.input.bindState(this.playerShip, 'moving_left', 'A');
                pc.system.input.bindState(this.playerShip, 'moving_up', 'UP');
                pc.system.input.bindState(this.playerShip, 'moving_up', 'W');
                pc.system.input.bindState(this.playerShip, 'moving_down', 'DOWN');
                pc.system.input.bindState(this.playerShip, 'moving_down', 'S');
                //            pc.system.input.bindState(this.playerShip, 'firing', 'SPACE');
                pc.system.input.bindState(this.playerShip.turret, 'firing2', 'MOUSE_LEFT_BUTTON', this);
                //                    pc.system.input.bindState(this.playerShip.turret, 'firing', 'SPACE');
                pc.system.input.bindAction(this, 'aiming', 'MOUSE_MOVE');

                pc.system.input.bindState(this.playerShip.turret, 'firing', 'SPACE', this);

                pc.system.input.bindAction(this, 'escape', 'ESC');
                pc.system.input.bindAction(this, 'toggleCollisions', 'T');
                pc.system.input.bindAction(this, 'toggleDebugGrid', 'G');
                pc.system.input.bindAction(this, 'toggleSound', 'M');
                pc.system.input.bindAction(this, 'togglePause', 'P');
                pc.system.input.bindAction(this, 'dumpPoolStats', 'X');
            } else
            {
                // UI controls layer will setup the input for touch input
            }

            this.uiLayer = new ControlsLayer();
            this.addLayer(this.uiLayer);

            this.radarLayer = new RadarLayer();
            this.addLayer(this.radarLayer);

            this.startLevel(1);
        },

        startLevel:function (level)
        {
            this.level = level;

            // load up the map
            this.loadFromTMX(pc.system.loader.get('level' + this.level).resource);
            this.spaceStationLayer = this.get('station');
            this.gameLayer = this.get('Object Layer 1');
            this.spaceStationLayer.origin = this.gameLayer.origin;

            // add/remove the ui layer so it's always drawn last (z-order drawing for layers soon)
            this.removeLayer(this.uiLayer);
            this.addLayer(this.uiLayer);

            // add the player ship into the new game level
            this.gameLayer.addElement(this.playerShip);
            // todo: get the player ship start object (from the map), and move the ship to the same spot
            // then reset the ships shields etc

            // tell the radar about the new level
            this.radarLayer.setLayers(this.spaceStationLayer, this.gameLayer);

            var levelAlert = pc.TextElement.create(this.uiLayer, 'Level ' + this.level, [0, 0, 0], [200, 200, 200], '30pt Calibri',
                (this.viewPortWidth / 20), this.viewPortHeight / 2, 200, 30);
            levelAlert.add(pc.FadeEffect.create({ fadeInTime:4000, holdTime:1000, fadeOutTime:4000}));
            levelAlert.setLifetime(10000);

            var levelTitle = pc.TextElement.create(this.uiLayer, 'Discovery', [0, 0, 0], [120, 120, 120], '30pt Calibri',
                (this.viewPortWidth / 20), (this.viewPortHeight / 2) + 30, 200, 30);
            levelTitle.add(pc.FadeEffect.create({ fadeInTime:4000, holdTime:1000, fadeOutTime:4000}));
            levelTitle.setLifetime(10000);

            if (level == 1)
            {
                // show some instructions
                var boxX = (this.viewPortWidth / 2) - 295;
                var boxY = (this.viewPortHeight / 2) - 60;
                var rect = pc.ui.Rect.create(this.uiLayer, [100, 100, 100], [20, 20, 20], 10,
                    boxX, boxY, 275, 40);

                // add effects

                var keys = pc.ui.Text.create(this.uiLayer, 'Use W,S,D,A to move', null, [120, 120, 120], '20pt Calibri',
                    boxX + 20, boxY - 32, 200, 60);
                var fadeEffect = pc.effects.Fade.create({startDelay:3000, fadeInTime:2000, holdTime:0, fadeOutTime:2000});
                keys.add(fadeEffect);
                rect.add(fadeEffect);

                boxX -= 100;
                boxY -= 100;
                var rect2 = pc.RectElement.create(this.uiLayer, [100, 100, 100], [20, 20, 20], 10,
                    boxX, boxY, 275, 40);
                var keys2 = pc.TextElement.create(this.uiLayer, 'Mouse to aim and fire', null, [120, 120, 120], '20pt Calibri',
                    boxX + 20, boxY - 32, 200, 60);
                var fadeEffect2 = pc.FadeEffect.create({startDelay:4000, fadeInTime:2000, holdTime:0, fadeOutTime:2000});
                keys2.add(fadeEffect2);
                rect2.add(fadeEffect2);

                var arrow = pc.TextElement.create(this.uiLayer, 'Enemies are this way >>>>>>', null, [120, 120, 200], '20pt Calibri',
                    boxX + 250, boxY, 200, 60);
                arrow.add(pc.FadeEffect.create({startDelay:8000, fadeInTime:3000, holdTime:0, fadeOutTime:3000}));

                var arrow2 = pc.TextElement.create(this.uiLayer, 'What are you waiting for? Go get em!', null, [120, 200, 120], '20pt Calibri',
                    boxX + 250, boxY, 200, 60);
                arrow2.add(pc.FadeEffect.create({startDelay:14000, fadeInTime:3000, holdTime:0, fadeOutTime:3000}));

                var arrow3 = pc.TextElement.create(this.uiLayer, "Don't be afraid. You have a big gun.", null, [200, 120, 120], '20pt Calibri',
                    boxX + 250, boxY, 200, 60);
                arrow3.add(pc.FadeEffect.create({startDelay:20000, fadeInTime:3000, holdTime:0, fadeOutTime:3000}));

                // wait timer, then show direction keys, then wait, then mouse aiming
                // then game demo stuff (like toggle debug)
            }
        },

        onAction:function (actionName, event, pos)
        {
            if (actionName === 'dumpPoolStats')
                this.debug(pc.Pool.getStats());

            if (actionName === 'aiming')
                this.playerShip.turret.onAction('aiming', event, pos);

            if (actionName === 'toggleCollisions')
                pc.system.setDebugCollisions(!pc.system.debugCollisions);

            // todo: go through and pause all sounds - this just disables playing of new sounds
            if (actionName === 'toggleSound')
                pc.system.soundEnabled = (!pc.system.soundEnabled);

            if (actionName === 'toggleDebugGrid')
            {
                this.spaceStationLayer.debugShowGrid = (!this.spaceStationLayer.debugShowGrid);
                this.planetLayer.debugShowGrid = (!this.planetLayer.debugShowGrid);
                this.starFieldLayer.debugShowGrid = (!this.starFieldLayer.debugShowGrid);
            }

            if (actionName === 'escape')
                theGame.startMenu();

            if (actionName === 'dumpPool')
            {
                console.log(pc.Pool.getStats());
            }

            if (actionName === 'togglePause')
                this.togglePauseResume();
        },

        update:function (elapsed)
        {
            this._super(elapsed);

            this.gameLayer.origin.x = this.playerShip.centerPos.x - (this.viewPortWidth / 2);
            this.gameLayer.origin.y = this.playerShip.centerPos.y - (this.viewPortHeight / 2);
            this.spaceStationLayer.origin.match(this.gameLayer.origin);

            this.starFieldLayer1.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 7;
            this.starFieldLayer1.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 7;
//            this.starFieldLayer2.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 5;
//            this.starFieldLayer2.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 5;
            this.starFieldLayer3.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 3;
            this.starFieldLayer3.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 3;
//
            this.planetLayer.origin.x = (this.playerShip.pos.x - (this.viewPortWidth / 6)) / 20;
            this.planetLayer.origin.y = (this.playerShip.pos.y - (this.viewPortHeight / 2)) / 20;

            return true; // return false to quit
        },

        draw:function (ctx)
        {
            this._super(ctx);
        }




    });


