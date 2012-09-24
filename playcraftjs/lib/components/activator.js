/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Activator
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Activation'>pc.systems.Activation</a>]
 * <p>
 * Causes an entity to be inactive (no rendering or physics etc) until another entity moves into range of it
 */
pc.components.Activator = pc.components.Component.extend('pc.components.Activator',
    /** @lends pc.components.Activator */
    {
        /**
         * Constructs a new activator component (by acquiring it from the pool).
         * @param {String} options.tag test
         * @return {pc.components.Activator} The component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Activator.prototype */
    {
        /**
         * entities with this tag to track -- if entity moves within range, the entity with this component will become active
         */
        tag:null,

        /**
         * Layer name to look for the activation entity, default is the same layer as the entity (null)
         */
        layer: null,
        _cacheLayer: null,

        /**
         * Range (in pixels) to cause activation.
         */
        range:0,

        /**
         * Whether the entity should stay active once activated, otherwise if the range exceeds the distance the
         * entity will go back to sleep
         */
        stayActive: false,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            if (!options.tag)
                throw 'Activator requires an entity to track against';

            this.tag = options.tag;
            this.layer = pc.checked(options.layer, null);
            this.range = pc.checked(options.range, 300);
            this.stayActive = pc.checked(options.stayActive, false);
        }



    });

