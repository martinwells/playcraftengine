/**
 * PlaycraftJS (C)2010-2012 Playcraft Labs, Inc.
 */

ControlsLayer = pc.ElementLayer('ControlsLayer',
    {},
    {
        bcs: 60, // base control size
        CONTROL_STYLE: 'rgba(200, 200, 200, 0.1)',

        init:function ()
        {
            this._super('ui', false);

        },

        onAddedToScene:function()
        {
            this._super();

            this.bcs *= pc.system.pixelRatio;

            // add all the ui elements
            EnergyBar.create(this, 10*pc.system.pixelRatio, 10, 0, (this.scene.viewPortWidth / 6) + 6, 19);

            if (pc.system.isTouch)
            {
//                TurnLeftArrow.create(this, 10, this.scene.viewPortHeight - (this.bcs * 2), this.bcs, this.bcs);
//                TurnRightArrow.create(this, 10 + this.bcs * 2, this.scene.viewPortHeight - (this.bcs * 2), this.bcs, this.bcs);
//                ForwardArrow.create(this, 10 + this.bcs, this.scene.viewPortHeight - (this.bcs * 3), this.bcs, this.bcs);
//                ReverseArrow.create(this, 10 + this.bcs, this.scene.viewPortHeight - this.bcs, this.bcs, this.bcs);
                DirControlButton.create(this, 10, this.scene.viewPortHeight - (this.bcs*2) - 10, 0, this.bcs*2, this.bcs*2);
                FireControlButton.create(this, this.scene.viewPortWidth - (this.bcs*2) - 10,
                                    this.scene.viewPortHeight - (this.bcs*2) - 10, 0, this.bcs*2, this.bcs*2);

//                FireButton.create(this, this.scene.viewPortWidth - (this.bcs*2) - 10,
//                    this.scene.viewPortHeight - (this.bcs*2) - 10, this.bcs*2, this.bcs*2);
            }
        },

        onResize: function(width, height)
        {
        },

        draw: function (ctx, screenOffsetX, screenOffsetY)
        {
//            if (pc.system.isTouch)
//            {
//                draw a circle around
//                ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
//
//                ctx.beginPath();
//                ctx.arc(screenOffsetX + 10 + (this.bcs*1.5), screenOffsetX + this.scene.viewPortHeight - (this.bcs*1.5),
//                    this.bcs*1.5, 0, pc.Math.PI * 2, true);
//                ctx.closePath();
//                ctx.fill();
//            }
            this._super(ctx, screenOffsetX, screenOffsetY);
        }

    });

PosControlButton = pc.Element('PosControlButton',
    { },
    {
        clickPos: null,

        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(this, 'pressed', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(this, 'pressed', 'TOUCH', this);
            this.clickPos = pc.Point.create(0, 0);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/2, 0, pc.Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/3, 0, pc.Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            // debug
//            if (this.clickPos != null)
//            {
//                ctx.fillStyle = '#ff4444';
//                ctx.fillRect(this.clickPos.x, this.clickPos.y, 10, 10);
//            }

        },

        update: function(delta)
        {
            this._super(delta);
//            return;
            var state = this.getInputState('pressed');
            if (state.on)
            {
                // get the event so we can read the position
                pc.Input.getEventPosition(state.event, this.clickPos);
            }

            // pass it through to the subclasses
            this.handleState(state.on, this.clickPos);
        },

        handleState: function(on, pos) {}

    });

DirControlButton = PosControlButton.extend('DirControlButton',
    { },
    {
        handleState: function(on, pos)
        {
            if (on)
            {
                theGame.gameScene.playerShip.dir = this.centerPos.dirTo(pos);
                theGame.gameScene.playerShip.thrust = 2;


            } else
            {
                theGame.gameScene.playerShip.thrust = 0;
            }
        }
    });

FireControlButton = PosControlButton.extend('FireControlButton',
    { },
    {
        handleState: function(on, pos)
        {
            if (on)
            {
                alert('firing');
                theGame.gameScene.playerShip.turret.dir = this.centerPos.dirTo(pos);
                theGame.gameScene.playerShip.turret.fire();
            }
        }
    });



EnergyBar = pc.Element('EnergyBar',
    {},
    {
        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            this._super(ctx, screenOffsetX, screenOffsetY);

            // draw the energy bar
            ctx.save();
            var color = '#44bb44';
            if (theGame.gameScene.playerShip.energy < 25)
                color = '#dd4444';

            var darkColor = '#333333';
            var barSize = this.dim.x;
            // figure out the % of the bar relative to the ship's energy

            // todo: energybar should be linked to a playership, not reference a global like this
            var perc = theGame.gameScene.playerShip.energy / theGame.gameScene.playerShip.maxEnergy;
            var pixels = barSize * perc;

            // draw the base bar
            ctx.fillStyle = darkColor;
            ctx.fillRect(this.pos.x + 5 - screenOffsetX, this.pos.y + 5 - screenOffsetY, barSize + 6, this.dim.y);
            // draw the energy left
            ctx.fillStyle = color;
            ctx.fillRect(this.pos.x + 5 + 3 - screenOffsetX, this.pos.y + 3 + 5 - screenOffsetY, pixels, this.dim.y - 6);

            ctx.restore();
        }
    });



FireButton = pc.Element('FireButton',
    { },
    {
        init:function ()
        {
            this._super();
            // todo: remove global, pass in a ship reference
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'firing', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'firing', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x+(width/2), y+(width/2), width/3, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    });


TurnLeftArrow = pc.Element('TurnLeftArrow',
    { },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_left', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_left', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            ctx.fillStyle = this.layer.CONTROL_STYLE;

            // left arrow
            ctx.beginPath();
            ctx.moveTo(x, y + (height / 2));
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x, y + (height / 2));
            ctx.fill();
            ctx.closePath();
        }
    });

TurnRightArrow = pc.Element('TurnRightArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_right', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'turning_right', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y + (height / 2));
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        }
    });


ForwardArrow = pc.Element('ForwardArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'forward_thrusting', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'forward_thrusting', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x + (width / 2), y);
            ctx.lineTo(x + (width), y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x + (width / 2), y);
            ctx.fill();
            ctx.closePath();
        }
    });

ReverseArrow = pc.Element('ReverseArrow',
    {
    },
    {
        init:function ()
        {
            this._super();
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'backward_thrusting', 'MOUSE_LEFT_BUTTON', this);
            theGame.gameScene.input.bindState(theGame.gameScene.playerShip, 'backward_thrusting', 'TOUCH', this);
        },

        draw:function (ctx, screenOffsetX, screenOffsetY)
        {
            var x = this.pos.x - screenOffsetX;
            var y = this.pos.y - screenOffsetY;
            var width = this.dim.x;
            var height = this.dim.y;

            // right arrow
            ctx.fillStyle = this.layer.CONTROL_STYLE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (width), y);
            ctx.lineTo(x + (width / 2), y + height);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.closePath();
        }
    });

