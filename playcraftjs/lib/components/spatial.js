
pc.components.Spatial = pc.components.Component.extend('pc.components.Spatial',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        /**
         * Last movement in 2D space
         */
        lastMove: null,

        pos: null,
        dim: null,
        dir: 0,

        _centerPos: null,

        init: function(options)
        {
            this._super(this.Class.shortName);

            this.pos = pc.Point.create(0, 0);
            this.dim = pc.Dim.create(0, 0);
            this._centerPos = pc.Point.create(0, 0);
            this.lastMove = pc.Dim.create(0, 0);

            if (pc.valid(options))
                this.config(options);
        },

        config: function(settings)
        {
            this.pos.x = pc.checked(settings.x, 0);
            this.pos.y = pc.checked(settings.y, 0);
            this.dir = pc.checked(settings.dir, 0);
            this.dim.x = pc.checked(settings.w, 0);
            this.dim.y = pc.checked(settings.h, 0);

            this._centerPos.x = 0;
            this._centerPos.y = 0;
            this.lastMove.x = 0;
            this.lastMove.y = 0;
        },

        getCenterPos: function()
        {
            this._centerPos.x = this.pos.x + (this.dim.x/2);
            this._centerPos.y = this.pos.y + (this.dim.y/2);
            return this._centerPos;
        },

        toString: function()
        {
            return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z + ' dir: '+ this.dir;
        }


    });