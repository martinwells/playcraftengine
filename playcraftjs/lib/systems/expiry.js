/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Expiration
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Expiry system. See the <a href='pc.components.Expiry'>expiry component</a> for more information.
 */
pc.systems.Expiration = pc.systems.EntitySystem.extend('pc.systems.Expiration',
    /** @lends pc.systems.Expiration */
    {},
    /** @lends pc.systems.Expiration.prototype */
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
