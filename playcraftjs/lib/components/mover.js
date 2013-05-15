

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
    _bound: false,

    targetPos:0, // where am I headed
    time:0, // time frame to move over (how fast we move)
    speed:0, // speed to move at
    onComplete: null, // optional callback when completed movement

    _distanceLeft: 0,

    init:function (options)
    {
      this._super('mover');
      if (pc.valid(options))
        this.config(options);
    },

    config:function (options)
    {
      this.targetPos = options.targetPos;
      this.time = options.time;
      this.speed = options.speed;
      if (this.speed != null && this.time != null)
        throw 'Use either time or speed, not both';
      if (this.speed)
        this.speed /= 100;
      this.onComplete = options.onComplete;
    }
  });




