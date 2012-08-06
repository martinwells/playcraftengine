pc.components.Fade = pc.components.Component.extend('pc.components.Fade',
    {
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        startDelay:0,
        fadeInTime:0,
        fadeOutTime:0,
        holdTime:0,
        startTime:0, // start time of the current state
        timeLimit:0, // how long before we need to change states
        state:0,
        loops:1,
        loopsSoFar:0,

        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        config:function (options)
        {
            this.startDelay = pc.checked(options.startDelay, 0);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.holdTime = pc.checked(options.holdTime, 0);
            this.loops = pc.checked(options.loops, 1);
            this.timeLimit = 0;
            this.state = 0;
            this.loopsSoFar = 0;
        }
    });