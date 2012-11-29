/**
 * Manages health (regenerate over time mostly)
 */
HealthSystem = pc.systems.EntitySystem.extend('HealthSystem',
    {},
    {
        init:function ()
        {
            this._super([ 'health' ]);
        },

        process:function (entity)
        {
            var health = entity.getComponent('health');
            if (entity.hasTag('player'))
            {
                if (pc.device.now - health._lastRegenTime > health.regenDelay)
                {
                    health._lastRegenTime = pc.device.now;
                    health.addHealth(1);
                }
            }
        }

    });


