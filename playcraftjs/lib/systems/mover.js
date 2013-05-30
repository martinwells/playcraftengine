pc.systems.Mover = pc.systems.EntitySystem.extend('MoverSystem',
  {},
  {
    numMoving: 0,

    init:function ()
    {
      this._super(['mover']);
      this.numMoving = 0;
    },

    processAll: function()
    {
      // reset the number of moving entities
      this.numMoving = 0;
      // this will call process for every entity
      this._super();
    },

    process:function (entity)
    {
      var mover = entity.getComponent('mover');
      var spatial = entity.getComponent('spatial');

      if (!mover._bound)
      {
        // set the distance we need to cover on the first run through
        mover._bound = true;
        mover._startTime = pc.device.now;
        mover._startPos = spatial.pos.clone();
      }

      var elapsed = ( pc.device.now - mover._startTime ) / mover.duration;
      elapsed = elapsed > 1 ? 1 : elapsed;

      var value = pc.Easing.ease(mover.easing, elapsed);
      spatial.pos.x = mover._startPos.x + ( mover.targetPos.x - mover._startPos.x ) * value;
      spatial.pos.y = mover._startPos.y + ( mover.targetPos.y - mover._startPos.y ) * value;

      // are we at an end?
      if (elapsed == 1)
      {
        mover.active = false;
        // force a move to the final position (to be exact)
        spatial.pos = mover.targetPos;
        if (mover.onComplete)
          mover.onComplete(entity);
        entity.removeComponent(mover);
      }
      else
        // keep count of the number of things moving in this system
        this.numMoving++; // this is reset at the start of every cycle by processAll above
    }

  });


