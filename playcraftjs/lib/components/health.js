pc.components.Health = pc.components.Component.extend('pc.components.Health',
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

        hp: 0,

        config: function(hp)
        {
            this.hp = hp;
        },

        decrease: function(hp)
        {
            this.hp -= hp;
        },

        isDead: function()
        {
            return (this.hp <= 0)
        }
    });

