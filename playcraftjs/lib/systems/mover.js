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
        mover._distanceLeft = spatial.pos.distance(mover.targetPos);
        mover._bound = true;
      }

      var speed = mover.speed;
      if (mover.time)
        speed = spatial.pos.distance(mover.targetPos) / mover.time;

      var dir = spatial.pos.dirTo(mover.targetPos);

      // figure out how far to move this cycle
      var distanceThisCycle = speed * pc.device.elapsed;
      // check we aren't jumping over where we need to be
      if (mover._distanceLeft - distanceThisCycle < 0)
        distanceThisCycle = mover._distanceLeft;

      spatial.pos.moveInDir(dir, distanceThisCycle);
      mover._distanceLeft -= distanceThisCycle;

      if (mover._distanceLeft <= 0)
      {
        mover.active = false;

        // force a move to the final position (to be exact)
        spatial.pos = mover.targetPos;

        if (mover.onComplete)
          mover.onComplete(entity);
        entity.removeComponent(mover);
      }
      else
      // this is reset every cycle by processAll
        this.numMoving++;
    }

  });


