pc.components = {};

/**
 * @type {*}
 */
pc.components.Component = pc.Pooled.extend('pc.components.Component',
    {
        create: function()
        {
            return this._super();
        }
    },
    {
        _type: null,

        init: function(type)
        {
            this._super();
            this._type = type;
        },

        getType: function()
        {
            return this._type.toLowerCase();
        },

        setType: function(t)
        {
            this._type = t;
        },

        /**
         * Called when the system is about to remove this component, which gives you a chance
         * to override and do something about it
         */
        onBeforeRemoved: function()
        {
        }

    });

