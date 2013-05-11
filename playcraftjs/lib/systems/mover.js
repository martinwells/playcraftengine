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

      // how far left to move
      var distancePerMS = spatial.pos.distance(mover.targetPos) / mover.time;

      var dir = spatial.pos.dirTo(mover.targetPos);
      spatial.pos.moveInDir(dir, distancePerMS * pc.device.elapsed);

      if (spatial.pos == mover.targetPos)
      {
        mover.active = false;
        if (mover.onComplete)
          mover.onComplete(entity);
        entity.removeComponent(mover);
      }
      else
      // this is reset every cycle by processAll
        this.numMoving++;
    }

  });


