
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
    duration:0, // time frame to move over (how fast we move)
    speed:0, // speed to move at
    onComplete: null, // optional callback when completed movement
    easing: pc.Easing.LINEAR,

    _distanceLeft: 0,
    _bound: false,
    _startTime: 0,

    init:function (options)
    {
      this._super('mover');
      if (pc.valid(options))
        this.config(options);
    },

    config:function (options)
    {
      this._distanceLeft = 0;
      this._bound = false;

      this.targetPos = options.targetPos;
      this.duration = options.duration;
      this.speed = options.speed;
      if (this.speed != null && this.time != null)
        throw 'Use either time or speed, not both';
      if (this.speed)
        this.speed /= 100;
      this.onComplete = options.onComplete;
      this.easing = pc.checked(options.easing, pc.Easing.LINEAR);
    },

    onRelease:function()
    {
      // clean up temps
      this._startPos.release(); // set on binding by the system
    }

  });




