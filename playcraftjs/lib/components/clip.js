/**
 * @class pc.components.Clip
 * Clips all rendering for an entity to be within the specified rect (in layer relative coordinates)
 * You can also specify an entity, which will clip based on the spatial rectangle of the other entity
 * You can also do both entity clipping as well as stacking a rectangle clip on top
 */
pc.components.Clip = pc.components.Component.extend('pc.components.Clip',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        /**
         * Clip this entity to the bounding rectangle of another entity
         */
        entity: null,

        /**
         * Manual clipping rectangle
         */
        x:0,
        y:0,
        w:0,
        h:0,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.entity = pc.checked(options.entity, null);
            this.x = pc.checked(options.x, 0);
            this.y = pc.checked(options.y, 0);
            this.w = pc.checked(options.w, 0);
            this.h = pc.checked(options.h, 0);
        }

    });

