/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Text
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds display text to an entity.
 */
pc.components.Text = pc.components.Component.extend('pc.components.Text',
    /** @lends pc.components.Text */
    {
        /**
         * Constructs (or acquires from the pool) a text component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.strokeColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {String} options.font Name of the font
         * @param {Number} options.height Size/height of the font (i.e. 20 for 20pt)
         * @param {String} options.text String to display
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the text.
         * @return {pc.components.Text} A text component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Text.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        strokeColor: null,
        /** Font name (read-only - use setFont) */
        font: null,
        /** Font size: 20 = 20pt (read-only - use setHeight) */
        fontHeight: 0,
        /** Display text */
        text: null,
        /** Stroke width */
        lineWidth: 0,
        /** Offset position of the text relative to the entity spatial */
        offset: null,

        _fontCache: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            this.text = [];
            this.font = 'Calibri';
            this.fontHeight = 20;
            this.offset = pc.Dim.create(0,0);
            this._fontCache = '';
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.color.set(pc.checked(options.color, '#ffffff'));
            this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));
            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.text = pc.checked(options.text, ['']);
            this.font = pc.checked(options.font, 'Arial');
            this.fontHeight = pc.checked(options.fontHeight, 20);
            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x);
                this.offset.y = pc.checked(options.offset.y);
            }
            this._updateFont();
        },

        /**
         * Sets the font height
         * @param {Number} height Height in points (20=20pt)
         */
        setHeight: function(height)
        {
            this.fontHeight = height;
            this._updateFont();
        },

        /**
         * Sets the font
         * @param {String} font Name of the font (i.e. 'Arial')
         */
        setFont: function(font)
        {
            this.font = font;
            this._updateFont();
        },

        _updateFont: function()
        {
            this._fontCache = '' + this.fontHeight + 'px ' + this.font;
        }


    });


