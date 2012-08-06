


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
            if (pc.valid(options))
                this.config(options);
        },

        sprite: null,

        config: function(options)
        {
            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);

            this.sprite.currentFrame = pc.checked(options.currentFrame, 0);
        }



    });

