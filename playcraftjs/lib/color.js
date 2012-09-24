/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Color
 * @augments pc.Pooled
 * @description
 * A general purpose representation of a color. You can create a color either an array [R,G,B] or using a hex color
 * string in the form of #RRGGBB. (For alpha see the pc.component.Alpha and pc.components.Fade).
 * <p>
 *     Create a color using either new:
 * <pre><code>
 * var color = new pc.Color([255, 0, 0]); // super red
 * var color2 = new pc.Color('#00FF00'); // super green
 * </code></pre>
 * <p>
 *     Or, as a pooled object:
 * <pre><code>
 * var color = pc.Color.create([255, 0, 0]); // super red
 * </code></pre>
 */
pc.Color = pc.Pooled.extend('pc.Color',
    /** @lends pc.Color */
    {
        /**
         * Constructs a color object using the passed in color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        create: function(color)
        {
            var n = this._super();
            n.config(color);
            return n;
        }
    },
    /** @lends pc.Color.prototype */
    {
        /** Array of current colors */
        rgb: [],
        /** Representation of the current color as an rgb string. Automatically updates as you change color */
        color: null,

        /**
         * Constructs a new color using the passed in color string. Used if you call new pc.Color, but typically
         * you should be using pc.Color.create as this is a pooled class
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        init: function(color)
        {
            if (color != undefined)
                this.config(color);
        },

        /**
         * Configure this color object with a given color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        config: function(color)
        {
            if (Array.isArray(color))
                this.rgb = color;
            else
            {
                if (color.charAt(0) === '#')
                {
                    this.rgb[0] = parseInt(color.substring(1,3), 16);
                    this.rgb[1] = parseInt(color.substring(3,5), 16);
                    this.rgb[2] = parseInt(color.substring(5,7), 16);
                } else
                    throw "Invalid color: use either array [r,g,b] or '#RRGGBB'";
            }
            this._updateColorCache();
        },

        /**
         * Sets this color object to a given color (synonym for config(color)
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        set: function(color)        { this.config(color); },

        /**
         * Sets the red component of the color
         * @param {Number} r Red component of the color to set
         */
        setRed: function(r)     { this.rgb[0] = pc.Math.limit(r, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the red component of the color
         * @param {Number} r Red component
         */
        addRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], r, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the red component of the color
         * @param {Number} r Red component
         */
        subRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], -r, 0, 255); this._updateColorCache(); },

        /**
         * Sets the green component of the color
         * @param {Number} g Green component of the color to set
         */
        setGreen: function(g)   { this.rgb[1] = pc.Math.limit(g, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the green component of the color
         * @param {Number} g Green component
         */
        addGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], g, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the green component of the color
         * @param {Number} g Green component
         */
        subGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], -g, 0, 255); this._updateColorCache(); },

        /**
         * Sets the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        setBlue: function(b)    { this.rgb[2] = pc.Math.limit(b, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        addBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], b, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the blue component of the color
         * @param {Number} b Blue component
         */
        subBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], -b, 0, 255); this._updateColorCache(); },

        /**
         * Darkens the color by the given value (1..255)
         * @param {Number} amt Amount to darken the color by
         */
        darken:function (amt)
        {
            this.subRed(amt);
            this.subGreen(amt);
            this.subBlue(amt);
        },

        /**
         * Lightens the color by the given amount (1..255)
         * @param {Number} amt Amount to lighten the color by
         */
        lighten: function(amt)
        {
            this.addRed(amt);
            this.addGreen(amt);
            this.addBlue(amt);
        },

        _updateColorCache: function()
        {
            // todo: this is constructing a string on every adjustment: can we save on that?
            this.color = 'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')';
        }


    });