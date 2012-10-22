/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Clip
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Clips all rendering for an entity to be within the specified rect (in layer relative coordinates)
 * You can also specify an entity, which will clip based on the spatial rectangle of the other entity
 * You can also do both entity clipping as well as stacking a rectangle clip on top
 */
pc.components.Clip = pc.components.Component.extend('pc.components.Clip',
    /** @lends pc.components.Clip */
    {
        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Clip.prototype */
    {
        /** Clip this entity to the bounding rectangle of another entity */
        clipEntity:null,
        /** x-position of the top left of the clipping rectangle */
        x:0,
        /** y-position of the top left of the clipping rectangle */
        y:0,
        /** Width the clipping rectangle */
        w:0,
        /** Height the clipping rectangle */
        h:0,

        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.clipEntity = pc.checked(options.clipEntity, null);
            this.x = pc.checked(options.x, 0);
            this.y = pc.checked(options.y, 0);
            this.w = pc.checked(options.w, 0);
            this.h = pc.checked(options.h, 0);
        }

    });

