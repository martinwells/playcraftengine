


pc.components.Sprite = pc.components.Component.extend('pc.components.Sprite',
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
            this.sprite = pc.Sprite.create();
            this.offset = pc.Point.create(0,0);
            if (pc.valid(options))
                this.config(options);
        },

        sprite: null,
        offset: null, // drawing offset

        config: function(options)
        {
            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x, 0);
                this.offset.y = pc.checked(options.offset.y, 0);
            } else
            {
                this.offset.x = 0;
                this.offset.y = 0;
            }

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);

            this.sprite.currentFrame = pc.checked(options.currentFrame, 0);
        }



    });

