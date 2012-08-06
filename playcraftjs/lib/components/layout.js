/**
 * Lays out an element on a layer
 */
pc.components.Layout = pc.components.Component.extend('pc.components.Layout',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        vertical:null,        // where to anchor the entity certically (top, bottom, middle)
        horizontal:null,      // where to anchor the entity horizontally (left, right, center)

        margin:null,          // the margin (all around)

        init:function (options)
        {
            this._super(this.Class.shortName);
            this.margin = {};
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.anchor = pc.checked(options.anchor);

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