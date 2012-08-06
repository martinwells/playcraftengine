/**
 * Changes the alpha drawing of an associated drawable object (sprite, shape, text etc).
 */
pc.components.Alpha = pc.components.Component.extend('pc.components.Alpha',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        level:1, // 0=fully transparent

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.level = pc.checked(options.level, 1);
        },

        setAlpha: function(a)   { this.level = a;  this._fix(this.level); },
        addAlpha: function(a)   { this.level += a; this._fix(this.level); },
        subAlpha: function(a)   { this.level -= a; this._fix(this.level); },

        _fix: function(c)
        {
            if (c > 1) return 1;
            if (c < 0) return 0;
            this.level = c;
        }

    });