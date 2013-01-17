
MenuScene = pc.Scene('MenuScene',
    {

    },
    {
        starFieldLayer:null, // note: this layer is also referenced by the game scene
        menuLayer:null,

        init:function ()
        {
            this._super('menu');

            // create the background layer
            this.starFieldLayer1 = theGame.starFieldLayer1;
            this.addLayer(this.starFieldLayer1);
            this.starFieldLayer2 = theGame.starFieldLayer2;
            this.addLayer(this.starFieldLayer2);
            this.starFieldLayer3 = theGame.starFieldLayer3;
            this.addLayer(this.starFieldLayer3);
            this.menuLayer = new MenuLayer();
            this.addLayer(this.menuLayer);
        },

        update:function (elapsed)
        {
            this._super(elapsed);

            this.starFieldLayer1.origin.x += 0.25;
            this.starFieldLayer1.origin.y += 0.25;
            this.starFieldLayer2.origin.x += 0.5;
            this.starFieldLayer2.origin.y += 0.5;
            this.starFieldLayer3.origin.x += 1;
            this.starFieldLayer3.origin.y += 1;
        }

    });

MenuLayer = pc.ElementLayer('MenuLayer',
    {
    },
    {
        showingTitle:true,
        menuOptions:['Continue', 'New Game', 'Leaders', 'Options'],
        menuElements:[],
        faders:[],
        MENU_CONTINUE:0,
        MENU_NEW_GAME:1,
        MENU_LEADERS:2,
        MENU_OPTIONS:3,
        current:0,
        menuY: 0,
        menuX: 0,
        fader: null,

        init:function ()
        {
            this._super('menu');
        },

        // a layout manager basically handles positioning and onresize events
        // it's something that you can add to a layer

        onAddedToScene:function ()
        {
            this.menuY = (this.scene.viewPortHeight / 2.8);

            var logo = pc.Element.create(this, this.scene.viewPortWidth / 15 - 10, this.menuY-120, 0, 388, 100);
            logo.setSprite(new pc.SpriteSheet(pc.system.loader.get('logo').resource, 388, 100));

            var poweredBy = pc.Element.create(this, this.scene.viewPortWidth - 410, this.scene.viewPortHeight-109, 0, 350, 79);
            poweredBy.setSprite(new pc.SpriteSheet(pc.system.loader.get('poweredby').resource, 350, 79));

            // create the text elements
            var fontSize = this.scene.viewPortHeight/12;

            var detailFont = (fontSize/3.5) + 'px Helvetica';
            var detailFontColor = [70, 70, 70, 1];
            pc.TextElement.create(this, 'Version 1.03'.toUpperCase(), null, detailFontColor, detailFont,
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-75, 200, 20);
            pc.TextElement.create(this, 'Copyright 2012 Playcraft Labs, Inc.'.toUpperCase(), null, detailFontColor, detailFont,
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-60, 200, 20);
            pc.TextElement.create(this, 'All rights reserved.'.toUpperCase(), null, detailFontColor, detailFont,
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-45, 200, 20);
            pc.TextElement.create(this, 'Code: Martin Wells   Art: Colin Pyle   Level Design: Blake Wells'.toUpperCase(), null, detailFontColor, detailFont,
                this.scene.viewPortWidth / 15, this.scene.viewPortHeight-30, 200, 20);

            for (var i = 0; i < this.menuOptions.length; i++)
            {
                var menuElement = pc.TextElement.create(this, this.menuOptions[i], [100, 100, 100, 1],
                    [0, 0, 0, 1], fontSize + 'px Helvetica',
                    this.scene.viewPortWidth / 10, this.menuY + (i * (fontSize-(fontSize/5))), 200, 50);
                this.menuElements.push(menuElement);

                // setup the mouse/touch interaction
                pc.system.input.bindAction(this, 'execute-' + this.menuOptions[i], 'MOUSE_BUTTON_LEFT_DOWN', menuElement);
                pc.system.input.bindAction(this, 'execute-' + this.menuOptions[i], 'TOUCH', menuElement);

                var fader = pc.FadeEffect.create({ fadeInTime:500, holdTime:100, fadeOutTime:500, loops:99999} );
                fader.active = false;
                menuElement.add(fader);
                this.faders.push(fader);
            }

            this.current = 1;
            this.menuElements[this.current].setFillColor([255,255,255,1]);
            this.faders[this.current].reset();
            this.faders[this.current].active = true;

            // setup input
            if (!pc.system.isTouch)
            {
                pc.system.input.bindAction(this, 'up', 'UP');
                pc.system.input.bindAction(this, 'down', 'DOWN');
                pc.system.input.bindAction(this, 'execute', 'ENTER');
                pc.system.input.bindAction(this, 'execute', 'SPACE');
            }


        },

        onAction:function (actionName, event, pos, uiTarget)
        {
            if (actionName.indexOf('execute') == 0)
            {
                var menuItem = this.current;

                // handle the menu ops from mouse or touch
                if (actionName.indexOf('execute-') == 0)
                    menuItem = this.menuElements.indexOf(uiTarget);

                switch (menuItem)
                {
                    case this.MENU_CONTINUE:
                        break;

                    case this.MENU_NEW_GAME:
                        theGame.startGame();
                        break;

                    case this.MENU_LEADERS:
                        break;

                    case this.MENU_OPTIONS:
                        break;
                }
            }

            if (actionName == 'down' || actionName == 'up')
            {
                // remove the fader off the current item
                this.faders[this.current].active = false;
                this.faders[this.current].setAlpha(1);
                this.menuElements[this.current].setFillColor([0,0,0,1]);

                if (actionName == 'down')
                    this.current++;
                if (actionName == 'up')
                    this.current--;

                if (this.current > this.menuOptions.length - 1)
                    this.current = 0;
                if (this.current < 0) this.current = this.menuOptions.length - 1;

                // add an effect to show the selected item
                this.menuElements[this.current].setFillColor([255,255,255,1]);
                this.faders[this.current].reset();
                this.faders[this.current].active = true;
            }

        }


    });

