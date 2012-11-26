BirdBrain = pc.components.Component.extend('BirdBrain',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        timeBetweenTurns:0,
        _lastTurnTime:0,

        init:function (options)
        {
            this._super('targeting');
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.timeBetweenTurns = pc.checked(options.timeBetweenTurns, 100);
            this._lastTurnTime = 0;
        }

    });


