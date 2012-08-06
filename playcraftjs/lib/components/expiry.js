pc.components.Expiry = pc.components.Component.extend('pc.components.Expiry',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        lifetime: 0,

        init: function(options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);
        },

        decrease: function(time)    { this.lifetime -= time;  },
        hasExpired: function()      { return this.lifetime <= 0; }
    });

