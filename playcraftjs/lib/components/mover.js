

// Moves an entity to a target location over time
pc.components.Mover = pc.components.Component.extend('pc.components.Mover',
  {
    create: function (options)
    {
      var n = this._super();
      n.config(options);
      return n;
    }
  },
  {
    targetPos:0, // where am I headed
    time:0, // time frame to move over (how fast we move)
    onComplete: null, // optional callback when completed movement

    _timeLeft: 0,

    init:function (options)
    {
      this._super('mover');
      if (pc.valid(options))
        this.config(options);
    },

    config:function (options)
    {
      this.targetPos = options.targetPos;
      this.time = pc.checked(options.time, 500);
      this.onComplete = options.onComplete;
      this._timeLeft = this.time;
    }
  });




