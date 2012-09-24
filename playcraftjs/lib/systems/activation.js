/**
 * Playcraft Engine. (C)2012 Playcraft Labs, Inc.
 */

/**
 * @class pc.ActivatorSystem
 * Handles activating entities when they get within a certain range of another entity
 */

pc.systems.Activation = pc.systems.EntitySystem.extend('pc.systems.Activation',
    {},
    {
        /**
         * Constructor for the activation system
         * @param delay Time between system runs in milliseconds. Default is 2000 (2 seconds).
         */
        init:function(delay)
        {
            this._super(['activator'], delay);
        },

        onEntityAdded:function (entity)
        {
            entity.active = false;
        },

        process:function (entity)
        {
            var a = entity.getComponent('activator');

            if (entity.active && a.stayActive) return;
            if (!a._cacheLayer)
            {
                if (a.layer)
                    a._cacheLayer = entity.layer.scene.get(a.layer);
                else
                    a._cacheLayer = entity.layer;
            }

            var entities = a._cacheLayer.getEntityManager().getTagged(a.tag);

            if (!entities) return;

            var e = entities.first;
            while(e)
            {
                var thisSP = entity.getComponent('spatial');
                var otherSP = e.object().getComponent('spatial');

                var distance = thisSP.getCenterPos().distance(otherSP.getCenterPos());
                if (!entity.active)
                {
                    // is the other entity close enough
                    if (distance < a.range)
                        entity.active = true;
                } else
                {
                    if (distance >= a.range)
                        entity.active = false;
                }

                e = e.next();
            }
        }

    });




