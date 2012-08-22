/**
 * @class pc.components.OriginShifter
 * Shifts the origin of the entity relative to the origin of the layer it's on, with an additional origin ratio
 * adjuster. You can use this to make an entity shift around as the layer origin moves (parallax within parallax)
 */
pc.components.OriginShifter = pc.components.Component.extend('pc.components.OriginShifter',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        ratio:1,
        _offsetX: 0,    // the amount of shift made so far
        _offsetY: 0,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.ratio = pc.checked(options.ratio, 1);
        }

    });

