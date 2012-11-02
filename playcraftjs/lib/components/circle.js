/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Circle
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Draw a circle. The size is based on the width and height of the associated spatial.
 */
pc.components.Circle = pc.components.Component.extend('pc.components.Circle',
    /** @lends pc.components.Circle */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @return {pc.components.Circle} The new component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Circle.prototype */
    {
        /** pc.Color representing fill color */
        color:null,
        /** pc.Color representing stroke color */
        lineColor:null,
        /** Stroke width */
        lineWidth:0,

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
            if (options.color)
            {
                if (this.color == null)
                    this.color = pc.Color.create(options.color);
                else
                    this.color.set(options.color);
            } else
                this.color = null;

            if (options.lineColor)
            {
                if (this.lineColor == null)
                    this.lineColor = pc.Color.create(options.lineColor);
                else
                    this.lineColor.set(options.lineColor);
            } else
                this.lineColor = null;

            this.lineWidth = pc.checked(options.lineWidth, 0);
        }

    });

