Health = pc.components.Component('Health',
    {
        create:function (hp, regenDelay)
        {
            var n = this._super();
            n.config(hp, regenDelay);
            return n;
        }
    },
    {
        hp:0,
        maxHP:0,
        regenTime:0,
        _lastRegenTime:0,

        init:function (hp, regenDelay)
        {
            this._super(this.Class.shortName);
            this.config(hp, regenDelay);
        },

        config:function (hp, regenDelay)
        {
            this.hp = hp;
            this.maxHP = hp;
            this.regenDelay = regenDelay;
        },

        takeDamage:function (hp)
        {
            this.hp -= hp;
        },

        addHealth:function (hp)
        {
            this.hp += hp;
            if (this.hp > this.maxHP)
                this.hp = this.maxHP;
        },

        isDead:function ()
        {
            return this.hp <= 0;
        }

    });

