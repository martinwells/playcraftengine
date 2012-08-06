

pc.components.DebugInfo = pc.components.Component.extend('pc.components.DebugInfo',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        init: function(options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
        }

    });
