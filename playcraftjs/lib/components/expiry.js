/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Expiry
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Expiry'>pc.systems.Expiry</a>]
 * <p>
 * Automatically expires an entity after a given time. Great for things like bullets that have a known lifetime;
 * just add the expiry component and it will happily kill itself (release) after the given time
 */
pc.components.Expiry = pc.components.Component.extend('pc.components.Expiry',
    /** @lends pc.components.Expiry */
    {
        /**
         * Constructs (or acquires from the pool) an expiry component.
         * @param {Number} options.lifetime Life time before expiry (in ms)
         * @return {pc.components.Expiry} The shiny new component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Expiry.prototype */
    {
        /** lifetime of the expiry */
        lifetime: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);
        },

        /**
         * Reduce the lifetime
         * @param {Number} time Amount to reduce the lifetime by
         */
        decrease: function(time)    { this.lifetime -= time;  },

        /**
         * Gets whether the lifetime has expired (typically only the expiry system will use this)
         * @return {Boolean} True if it has expired
         */
        hasExpired: function()      { return this.lifetime <= 0; }
    });

