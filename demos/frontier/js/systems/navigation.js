NavigationSystem = pc.EntitySystem.extend('NavigationSystem',
    {},
    {
        init:function ()
        {
            this._super(['targeting']);
        },

        process:function (entity)
        {
            var brain = entity.getComponent('targeting');
            var ph = entity.getComponent('physics');

            if (pc.device.now - brain._lastTurnTime > brain.timeBetweenTurns)
            {
                ph.applyTurn(pc.Math.rand(-15, 15));
                ph.applyForce(20);
                brain._lastTurnTime = pc.device.now;


            }
        }

    });

