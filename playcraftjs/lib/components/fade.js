/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Fade
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Adds a fade effects to the entity. e.g.
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Fade.create( { holdTime: 1300, fadeOutTime:200 } ) );
 * </code></pre>
 */
pc.components.Fade = pc.components.Component.extend('pc.components.Fade',
    /** @lends pc.components.Fade */
    {
        /**
         * Constructs (or acquires from the pool) a fade component
         * @param {Number} options.startDelay ms to wait before doing anything
         * @param {Number} options.fadeInTime time to fade in (in ms)
         * @param {Number} options.fadeOutTime time to fade out (in ms)
         * @param {Number} options.holdTime time to hold between fading in and fading out (in ms)
         * @param {Number} options.loops number of loops (0=infinite)
         * @return {pc.components.Fade} A configured fade component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Fade.prototype */
    {
        /** ms to wait before doing anything */
        startDelay:0,
        /** time to fade in (in ms) */
        fadeInTime:0,
        /** time to fade out (in ms) */
        fadeOutTime:0,
        /** time to hold between fading in and fading out (in ms) */
        holdTime:0,
        /** when the current state started */
        startTime:0,
        /** how long before we need to change states */
        timeLimit:0,
        /** current state */
        state:0,
        /** number of loops (0=infinite) */
        loops:1,

        /** read-only for how many loops have been completed */
        loopsSoFar:0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
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
            this.startDelay = pc.checked(options.startDelay, 0);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.holdTime = pc.checked(options.holdTime, 0);
            this.loops = pc.checked(options.loops, 1);
            this.timeLimit = 0;
            this.state = 0;
            this.loopsSoFar = 0;
        }
    });