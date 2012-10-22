/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Alpha
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Changes the alpha drawing of an associated drawable object (sprite, shape, text etc).
 */
pc.components.Alpha = pc.components.Component.extend('pc.components.Alpha',
    /** @lends pc.components.Alpha */
    {
        /**
         * Constructs (or acquires) an alpha component.
         * @param {Number} options.level Amount of initial alpha to set
         * @return {pc.components.Alpha} The new alpha object
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Alpha.prototype */
    {
        /** Current alpha level 0=fully transparent */
        level:1,

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
            this.level = pc.checked(options.level, 1);
        },

        /**
         * Set the alpha level
         * @param {Number} a Level to set alpha to
         */
        setAlpha: function(a)   { this.level = a;  this._fix(this.level); },

        /**
         * Add to the alpha level
         * @param {Number} a Amount to increase alpha by
         */
        addAlpha: function(a)   { this.level += a; this._fix(this.level); },

        /**
         * Subtract from the alpha level
         * @param {Number} a Amount o subtract
         */
        subAlpha: function(a)   { this.level -= a; this._fix(this.level); },

        _fix: function(c)
        {
            if (c > 1) return;
            if (c < 0) return;
            this.level = c;
        }

    });