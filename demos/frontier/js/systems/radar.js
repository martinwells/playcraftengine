RadarSystem = pc.systems.EntitySystem.extend('RadarSystem',
    {},
    {
        entityManager:null,
        gameLayer:null,
        mapSize:null,
        player:null,
        playerSpatial:null,
        scaleX:0,
        scaleY:0,
        lastBlinkTime:0,
        blinkDelay:300,
        blinkOn:true,

        init:function (gameLayer)
        {
            this._super([ 'radar' ]);
            this.gameLayer = gameLayer;
            this.entityManager = gameLayer.entityManager;
        },

        process:function (entity)
        {
            var radar = entity.getComponent('radar');
            var spatial = entity.getComponent('spatial');

            if (!this.player)
            {
                this.player = this.entityManager.getTagged('PLAYER').first.obj;
                this.playerSpatial = this.player.getComponent('spatial');
            }

            var drawX = spatial.pos.x;
            var drawY = spatial.pos.y;

            // our scale is based on the size of the world (10000
            this.scaleX = spatial.dim.x / this.gameLayer.worldSize.x;
            this.scaleY = spatial.dim.y / this.gameLayer.worldSize.y;

            // draw player
            var sinceLastBlink = pc.device.now - this.lastBlinkTime;
            if (sinceLastBlink > this.blinkDelay)
            {
                this.blinkOn = !this.blinkOn;
                this.lastBlinkTime = pc.device.now;
            }

            if (this.blinkOn)
            {
                pc.device.ctx.fillStyle = '#ffdb14';
                var px = Math.floor(this.playerSpatial.getCenterPos().x * this.scaleX);
                var py = Math.floor(this.playerSpatial.getCenterPos().y * this.scaleY);
                pc.device.ctx.fillRect(drawX + px, drawY + py, 3, 3);
            }

            var enemies = this.entityManager.getTagged('ENEMY');
            if (enemies)
            {
                var next = enemies.first;
                while (next)
                {
                    var sp = next.obj.getComponent('spatial');
                    var sx = Math.floor(sp.pos.x * this.scaleX);
                    var sy = Math.floor(sp.pos.y * this.scaleY);

                    //                if (sx  && ety >= py && etx < px + this.mapSize.x && ety < py + this.mapSize.y)
                    pc.device.ctx.fillStyle = '#ffffff';
                    pc.device.ctx.fillRect(drawX + sx, drawY + sy, sp.dim.y * this.scaleX, sp.dim.x * this.scaleY);

                    next = next.nextLinked;
                }
            }
        }


    });



