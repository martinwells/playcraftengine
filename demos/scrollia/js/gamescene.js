GameScene = pc.Scene.extend('GameScene',
    { },
    {
        backgroundLayer:null,
        backgroundOverlayLayer:null,
        gameLayer:null,
        bgLayer:null,
        tileLayer:null,
        overlayLayer:null,
        uiLayer:null,
        level:1,
        entityFactory:null,
        player:null,
        playerSpatial:null,
        music:null,

        init:function ()
        {
            this._super();

            this.entityFactory = new EntityFactory();

            //-----------------------------------------------------------------------------
            // sprite sheet setup
            //-----------------------------------------------------------------------------

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.loadFromTMX(pc.device.loader.get('level1').resource, this.entityFactory);

            // These are the tile and entity layers contained in the TMX map file (from Tiled)
            // we grab references to the layers so we can manually set the drawing order through
            // the z-index. The backgroundOverlayLayer also has a special function in that
            // the movement code will check for the presence of tiles with the climable property
            // set to detect ladders/vines etc.
            this.bgEntityLayer = this.get('backgroundEntity');
            this.bgEntityLayer.setZIndex(2);
            this.bgLayer = this.get('background');
            this.bgLayer.setZIndex(9);
            this.backgroundOverlayLayer = this.get('background-overlay');
            this.backgroundOverlayLayer.setZIndex(10);
            this.tileLayer = this.get('tiles');
            this.tileLayer.setZIndex(11);
            this.overlayLayer = this.get('overlay');
            this.overlayLayer.setZIndex(13);
            this.bgEntityLayer.addSystem(new pc.systems.Render());
            this.bgEntityLayer.addSystem(new pc.systems.Particles());
            this.bgEntityLayer.addSystem(new pc.systems.Activation());

            //------------------------------------------------------------------------------------------------
            // Game Layer
            //------------------------------------------------------------------------------------------------

            // generate the shadow background map
            this.gameLayer = this.get('entity');
            this.gameLayer.setZIndex(20);

            // setup origin tracking (these layers will maintain an origin linked to the main game layer)
            this.tileLayer.setOriginTrack(this.gameLayer);
            this.backgroundOverlayLayer.setOriginTrack(this.gameLayer);
            this.overlayLayer.setOriginTrack(this.gameLayer);
            this.bgLayer.setOriginTrack(this.gameLayer);
            this.bgEntityLayer.setOriginTrack(this.gameLayer);

            // get the player entity
            this.player = this.gameLayer.entityManager.getTagged('PLAYER').first.object();
            this.playerSpatial = this.player.getComponent('spatial');

            // fire up the systems we need for the game layer. tiles from the tileLayer are added to this layer
            // as a collision map
            this.gameLayer.addSystem(new GamePhysics(
                {
                    gravity:{ x:0, y:70 },
                    tileCollisionMap:{
                        tileMap:this.tileLayer.tileMap,
                        collisionCategory:CollisionType.WALL,
                        collisionMask:CollisionType.FRIENDLY | CollisionType.ENEMY
                    }
                }));

            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());
            this.gameLayer.addSystem(new pc.systems.Activation(2000));
            this.gameLayer.addSystem(new pc.systems.Layout());
            this.gameLayer.addSystem(new HealthBarSystem());
            this.gameLayer.addSystem(new HealthSystem());
            this.gameLayer.addSystem(new BrainSystem());
            this.gameLayer.addSystem(new PlayerControlSystem());

            // create the health bar
            //------------------------------------------------------------------------------------------------
            // UI Layer
            //------------------------------------------------------------------------------------------------

            this.uiLayer = new pc.EntityLayer('ui layer');
            this.uiLayer.addSystem(new pc.systems.Layout());
            this.uiLayer.addSystem(new pc.systems.Render());
            this.uiLayer.addSystem(new pc.systems.Effects());
            this.uiLayer.addSystem(new pc.systems.Expiration());
            this.uiLayer.addSystem(new pc.systems.Input());
            this.uiLayer.addSystem(new HealthBarSystem());
            this.uiLayer.setZIndex(100);
            this.addLayer(this.uiLayer);

            var healthBar = pc.Entity.create(this.uiLayer);
            healthBar.addComponent(HealthBar.create(this.player, pc.device.canvasWidth / 5, 15));
            healthBar.addComponent(pc.components.Spatial.create({ }));
            healthBar.addComponent(pc.components.Layout.create({ vertical:'top', horizontal:'left', margin:{left:10, top:10 } }));

            // add some simple instructions
            var e = pc.Entity.create(this.uiLayer);
//            e.addComponent(pc.components.Fade.create({ startDelay:1000, holdTime:2000, fadeInTime:1500, fadeOutTime:1500 }));
//            e.addComponent(pc.components.Alpha.create({ level:0 }));
            e.addComponent(pc.components.Rect.create({ color:'#222222', lineColor:'#888888', lineWidth:3 }));
//            e.addComponent(pc.components.Scale.create({ growX: 0.2, growY: 0.2, maxX:5, maxY:5 }));
//            e.addComponent(pc.components.Spin.create({ rate:90, max:720, clockwise:false }));
            e.addComponent(pc.components.Text.create({ text:['Left/right to move', 'Space to attack', 'F for fireballs'], lineWidth:0,
                fontHeight:14, offset:{x:25, y:-45} }));
            e.addComponent(pc.components.Expiry.create({ lifetime:6500 }));
            e.addComponent(pc.components.Spatial.create({ dir:0, w:170, h:70 }));
            e.addComponent(pc.components.Layout.create({ vertical:'middle', horizontal:'left', margin:{ left:80 } }));

            // if this is a touch device, construct a UI layer entity for the left/right arrows
            // then redirect the touch events to the player
            var h = 80;
            var w = 80;

            // left arrow direction control
            var leftArrow = pc.Entity.create(this.uiLayer);
            leftArrow.addComponent(pc.components.Spatial.create({x:0, y:this.viewPort.h - h, dir:0, w:w, h:h}));
            leftArrow.addComponent(pc.components.Poly.create({ color:'#888888', lineColor:'#ff0000', lineWidth:12, points:[
                [0, h / 2],
                [w, 0],
                [w, h],
                [0, h / 2]
            ] }));
            leftArrow.addComponent(pc.components.Alpha.create({ level:0.2 }));
            leftArrow.addComponent(pc.components.Input.create(
                {
                    target:this.player, // actions/states will be sent/set on the player, not this arrow
                    states:[
                        ['moving left', ['TOUCH', 'MOUSE_BUTTON_LEFT_DOWN'], true]
                    ]
                }));

            // right arrow direction control
            var rightArrow = pc.Entity.create(this.uiLayer);
            rightArrow.addComponent(pc.components.Spatial.create({x:w + 5, y:this.viewPort.h - h, dir:0, w:w, h:h}));
            rightArrow.addComponent(pc.components.Poly.create({ color:'#888888', lineColor:'#ff0000', lineWidth:12, points:[
                [0, 0],
                [w, h / 2],
                [0, h],
                [0, 0]
            ] }));
            rightArrow.addComponent(pc.components.Alpha.create({ level:0.2 }));
            rightArrow.addComponent(pc.components.Input.create(
                {
                    target:this.player, // actions/states will be sent/set on the player, not this arrow
                    states:[
                        ['moving right', ['TOUCH', 'MOUSE_BUTTON_LEFT_DOWN'], true]
                    ]
                }));

            // jump button
            var jump = pc.Entity.create(this.uiLayer);
            jump.addComponent(pc.components.Spatial.create({x:this.viewPort.w - w, y:this.viewPort.h - h, dir:0, w:w, h:h}));
            jump.addComponent(pc.components.Circle.create({ lineColor:'#ff0000', color:'#ffffff', lineWidth:12  }));
            jump.addComponent(pc.components.Text.create({ text:['JUMP'], lineWidth:0, fontHeight:14, offset:{x:20, y:-(h / 2) + 5} }));
            jump.addComponent(pc.components.Alpha.create({ level:0.2 }));
            jump.addComponent(pc.components.Input.create(
                {
                    target:this.player, // actions/states will be sent/set on the player, not this arrow
                    states:[
                        ['jumping', ['TOUCH', 'MOUSE_BUTTON_LEFT_DOWN'], true]
                    ]
                }));

            // cast button
            var cast = pc.Entity.create(this.uiLayer);
            cast.addComponent(pc.components.Spatial.create({x:this.viewPort.w - (w * 2), y:this.viewPort.h - h, dir:0, w:w, h:h}));
            cast.addComponent(pc.components.Circle.create({ lineColor:'#ff0000', color:'#ffffff', lineWidth:12  }));
            cast.addComponent(pc.components.Text.create({ text:['CAST'], lineWidth:0, fontHeight:14, offset:{x:20, y:-(h / 2) + 5} }));
            cast.addComponent(pc.components.Alpha.create({ level:0.2 }));
            cast.addComponent(pc.components.Input.create(
                {
                    target:this.player, // actions/states will be sent/set on the player, not this arrow
                    states:[
                        ['casting', ['TOUCH', 'MOUSE_BUTTON_LEFT_DOWN'], true]
                    ]
                }));

        },

        /**
         * State machine design thoughts
         *
         * create a BehaviorSystem
         * add BehaviorComponents, which contains behaviors and transitions
         * feed input states and animations to the tree? wow, how cool would that be!
         * You can set out the behavior of actors using a set of states PlayerFSM, MonsterFSM etc
         */

        process:function ()
        {
            if (!pc.device.loader.finished) return;

            // set the game layer's origin to center on the player, the other layers are set to track this one
            this.gameLayer.setOrigin(
                this.playerSpatial.getCenterPos().x - (this.viewPort.w / 2),
                this.playerSpatial.getCenterPos().y - (this.viewPort.h / 2));

            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
            //fillStyle = '#000';
            //pc.device.ctx.fillRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            this._super();
        }

    });
