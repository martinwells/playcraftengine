/**
 * Playcraft Engine - (C)2013 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Mover
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Mover'>pc.systems.Mover</a>]
 * <p>
 * Moves an entity to a target location, with tweening effects.
 * <p>
 * Just add a Mover component to make an entity move around, i.e.
 * <pre><code>
 * box.addComponent(pc.components.Mover.create(
 * {
 *   targetPos: { x:200, y:200 },
 *   easing: pc.Easing.QUADRATIC_IN_OUT,
 *   duration: 3000
 * }));
 *
 * myLayer.addSystem( new pc.systems.Mover() );
 * </code></pre>
 * You can look at all the easing types in the pc.Easing class (inside math.js)
 */
pc.components.Mover = pc.components.Component.extend('pc.components.Mover',
  /** @lends pc.components.Mover */
  {
    /**
     * Constructs (or acquires from the pool) a mover component
     * @param {pc.Point} options.targetPos Position to move the entity to
     * @param {Number} options.duration How long to take to move there (in ms)
     * @param {pc.Easing} options.easing Type of easing to use
     * @param {Function} options.onComplete Function to call once the entity has reached it's destination
     * @return {pc.components.Mover} A newly configured mover component
     */
    create: function (options)
    {
      var n = this._super();
      n.config(options);
      return n;
    }
  },
  /** @lends pc.components.Mover.prototype */
  {
    /** target position for the entity to be moved to */
    targetPos:0,
    /** time frame to move over (how fast we move) */
    duration:0,
    /** optional callback when completed movement */
    onComplete: null,
    /** type of easing to use; default is linear */
    easing: pc.Easing.LINEAR,

    _distanceLeft: 0,
    _bound: false,
    _startTime: 0,

    /**
     * Constructs a new component. See create method for options
     */
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
      this.onComplete = options.onComplete;
      this.easing = pc.checked(options.easing, pc.Easing.LINEAR);
    }

  });




