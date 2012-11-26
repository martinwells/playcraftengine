HealthBar = pc.components.Component('HealthBar',
    {
        create:function (healthEntity, width, height, offsetX, offsetY)
        {
            var n = this._super();
            n.config(healthEntity, width, height, offsetX, offsetY);
            return n;
        }
    },
    {
        healthEntity:null, // entity whose health this bar represents
        width:0,
        height:0,
        offsetX:0,
        offsetY:0,

        init:function ()
        {
            this._super(this.Class.shortName);
        },

        config:function (healthEntity, width, height, offsetX, offsetY)
        {
            this.healthEntity = healthEntity;
            this.width = width;
            this.height = height;
            this.offsetX = pc.checked(offsetX, 0);
            this.offsetY = pc.checked(offsetY, 0);
        }

    });

