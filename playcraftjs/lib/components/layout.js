/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Layout
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Automatically positions an entity on screen using a variety of layout options.
 * <p>
 * To use automated layout, add the layout system to the layer containing the entity:
 * <pre><code>
 * gameLayer.addSystem(new pc.systems.Layout());
 * </code></pre>
 * You can then add a layout component to an entity. The layout system will then automatically position the entity
 * bassed on the chosen alignment, and accomodating a given margin.
 * <pre><code>
 * entity.addComponent(pc.components.Layout.create(
 *     { vertical:'middle', horizontal:'right', margin:{ right:80 } }));
 * </code></pre>
 * Multiple items will be stacked vertically.
 */
pc.components.Layout = pc.components.Component.extend('pc.components.Layout',
    /** @lends pc.components.Layout */
    {
        /**
         * Constructs (or acquires from the pool) a layout component
         * @param {String} options.vertical Vertical positioning: 'top', 'middle', 'bottom'
         * @param {String} options.horizontal Horizontal positioning: 'left', 'center', 'right'
         * @param {Object} options.margin Margin for the entity (ie. margin.left, right, top, bottom)
         * @return {pc.components.Layout} A newly configured layout component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Layout.prototype */
    {
        /** Vertical positioning: 'top', 'middle', 'bottom' */
        vertical:null,
        /** Horizontal positioning: 'left', 'center', 'right' */
        horizontal:null,
        /** margin offset to the position */
        margin:null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.margin = {};
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (pc.checked(options.margin))
            {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else
            {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }

            this.horizontal = pc.checked(options.horizontal, 'left');
            this.vertical = pc.checked(options.vertical, 'top');
        }


    });