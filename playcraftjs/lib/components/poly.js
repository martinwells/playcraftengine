/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Poly
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Draw a polygon
 */
pc.components.Poly = pc.components.Component.extend('pc.components.Poly',
    /** @lends pc.components.Poly */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.lineColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {Number} options.points Array of points to draw
         * @return {pc.components.Poly} The new component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Poly.prototype */
    {
        /** pc.Color representing fill color */
        color:null,
        /** pc.Color representing stroke color */
        lineColor:null,
        /** Stroke width */
        lineWidth:0,
        /** array of points to draw */
        points:[],

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
            if (options.points.length < 3)
                throw 'Invalid polygon, requires at least 3 points';
            this.points = options.points;
        }

    });

