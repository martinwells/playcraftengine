
/**
 * @class pc.components.OverlaySprite
 * Used to lay another sprite over an entity, with options to automagically expire after a certain time limit.
 * Good for things like smoke, explosive damage or muzzle flashs, and where you don't need to create a complete
 * entity
 */
pc.components.Overlay = pc.components.Component.extend('pc.components.Overlay',
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
        sprite: null,

        init: function(options)
        {
            this._super(this.Class.shortName);
            this.sprite = pc.Sprite.create();
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);

            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);
        },

        decrease: function(time)    { this.lifetime -= time;  },
        hasExpired: function()      { return this.lifetime <= 0; }

    });

