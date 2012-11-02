/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Rect
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a rectangle to an entity.
 */
pc.components.Rect = pc.components.Component.extend('pc.components.Rect',
    /** @lends pc.components.Rect */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {Number} options.cornerRadius Radius of the corners (defaults to 0)
         * @return {pc.components.Rect} A rectangle component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Rect.prototype */
    {
        /** pc.Color representing fill color */
        color:null,
        /** pc.Color representing stroke color */
        lineColor:null,
        /** Stroke width */
        lineWidth:0,
        /** radius of the corners (0=straight edges) */
        cornerRadius:0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.lineColor = pc.Color.create('#888888');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (!options.color)
                this.color.set('#ffffff');
            else
                this.color.set(pc.checked(options.color, '#ffffff'));

            if (!options.lineColor)
                this.lineColor.set('#ffffff');
            else
                this.lineColor.set(pc.checked(options.lineColor, '#888888'));

            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.cornerRadius = pc.checked(options.cornerRadius, 0);
        }

    });

