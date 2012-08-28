/**
 * @class pc.components.Input
 * Bind input controls to an entity
 */
pc.components.Input = pc.components.Component.extend('pc.components.Input',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        states:null,
        actions: null,

        _bound: false,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            if (!options.states && !options.actions)
                throw 'Input requires at least an action or state set';

            this.states = options.states;
            this.actions = options.actions;
        }


    });

