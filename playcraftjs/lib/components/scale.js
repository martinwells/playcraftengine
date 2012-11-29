/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Scale
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Change the draw scale of an entity
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Scale.create( { x: 0.1, y: 0.1, growX: 4, growY: 4, maxX: 8, maxY: 8 } ) );
 * </code></pre>
 */
pc.components.Scale = pc.components.Component.extend('pc.components.Scale',
    /** @lends pc.components.Scale */
    {
        /**
         * Constructs (or acquires from the pool) a scale component
         * @param {Number} options.x initial x-axis scale
         * @param {Number} options.y initial y-axis scale
         * @param {Number} options.growX amount to grow x-axis per second (can be negative)
         * @param {Number} options.growY amount to grow y-axis per second (can be negative)
         * @param {Number} options.maxX maximum x-axis scale change
         * @param {Number} options.maxY maximum y-axis scale change
         * @return {pc.components.Scale} A configured component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Scale.prototype */
    {
        /** original scale applied to the spatial (only done once when binding the component) */
        x:1,
        /** original scale applied to the spatial (only done once when binding the component) */
        y:1,
        /** rate to grow the x-axis scale (can be negative) */
        growX:0,
        /** rate to grow the y-axis scale (can be negative) */
        growY:0,
        /** maximum x-axis scale change (positive or negative) */
        maxX:0,
        /** maximum y-axis scale change (positive or negative) */
        maxY:0,
        /** amount we have scaled so far (read-only) */
        scaledXSoFar:0,
        /** amount we have scaled so far (read-only) */
        scaledYSoFar:0,
        /** still scaling or not */
        scaling: true,

        _bound:false,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super('scale');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.x = pc.checked(options.x, 1);
            this.y = pc.checked(options.y, 1);
            this.growX = pc.checked(options.growX, 0);
            this.growY = pc.checked(options.growY, 0);
            this.maxX = pc.checked(options.maxX, 0);
            this.maxY = pc.checked(options.maxY, 0);
            this.scaledXSoFar = 0;
            this.scaledYSoFar = 0;
        }
    });
