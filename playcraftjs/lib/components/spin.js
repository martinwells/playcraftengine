/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Spin
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Makes an entity spin
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Spin.create( { rate: 15 } ) );
 * </code></pre>
 */
pc.components.Spin = pc.components.Component.extend('pc.components.Spin',
    /** @lends pc.components.Spin */
    {
        /**
         * Constructs (or acquires from the pool) a fade component
         * @param {Number} options.rate rate of spin in degrees per second (default is 15)
         * @param {Number} options.max Amount to spin (optional, default is 0 - unlimited)
         * @param {Boolean} options.clockwise Whether to spin in a clockwise direction (default is true)
         * @return {pc.components.Spin} A configured component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Spin.prototype */
    {
        /** rate of spin in degrees per second */
        rate:0,
        /** number of degrees to spin */
        max:0,
        /** spin clockwise or counter clockwise */
        clockwise: true,
        /** degrees spun so far */
        spinSoFar: 0,
        /** still spinning */
        spinning: true,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super('spin');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.rate = pc.checked(options.rate, 15);
            this.max = pc.checked(options.max, 0);
            this.clockwise = pc.checked(options.clockwise, true);
            this.spinSoFar = 0;
            this.spinning = true;
        }
    });
