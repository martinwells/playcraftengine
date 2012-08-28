

pc.systems.Expiration = pc.systems.EntitySystem.extend('pc.systems.Expiration',
    {},
    {
        init: function()
        {
            this._super(['expiry']);
        },

        process: function(entity)
        {
            var c = entity.getComponent('expiry');
            c.decrease(pc.device.elapsed);
            if (c.hasExpired())
                entity.remove();
        }

    });
