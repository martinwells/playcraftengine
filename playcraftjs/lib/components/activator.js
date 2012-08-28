/**
 * @class pc.components.Activator
 * Causes an entity to be inactive (no rendering or physics etc) until another entity moves into range of it
 */
pc.components.Activator = pc.components.Component.extend('pc.components.Activator',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        /**
         * entities with this tag to track -- if entity moves within range, the entity with this component will become active
         */
        tag:null,

        /**
         * Range (in pixels) to cause activation.
         */
        range:0,

        /**
         * Whether the entity should stay active once activated, otherwise if the range exceeds the distance the
         * entity will go back to sleep
         */
        stayActive: false,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            if (!options.tag)
                throw 'Activator requires an entity to track against';

            this.tag = options.tag;
            this.range = pc.checked(options.range, 300);
            this.stayActive = pc.checked(options.stayActive, false);
        }


    });

