/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Rect
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a rectangle to an entity.
 * <p>
 * To modify rectangle color at runtime, you can change the value of the lineColor and color
 * members by calling set (they are instances of pc.Color). For example:
 * <pre><code>
 *     myEntity.getComponent('rect').lineColor.set( [128, 128, 128] )
 * </code></pre>
 */
pc.components.Rect = pc.components.Component.extend('pc.components.Rect',
  /** @lends pc.components.Rect */
  {
    /**
     * Constructs (or acquires from the pool) a rectangle component.
     * @param {String} options.color Fill color in the form of #RRGGBB.
     * @param {String} options.lineColor Line color in the form of #RRGGBB
     * @param {Number} options.lineWidth Stroke width
     * @param {Number} options.cornerRadius Radius of the corners (defaults to 0)
     * @return {pc.components.Rect} A rectangle component
     */
    create: function (options)
    {
      var n = this._super();
      n.config(options);
      return n;
    }
  },
  /** @lends pc.components.Rect.prototype */
  {
    /** pc.Color representing fill color */
    color: null,
    /** pc.Color representing stroke color */
    lineColor: null,
    /** Stroke width */
    lineWidth: 0,
    /** radius of the corners (0=straight edges) */
    cornerRadius: 0,

    /**
     * Constructs a new component. See create method for options
     * @param {Object} options Options
     */
    init: function (options)
    {
      this._super('rect');
      this.color = null;
      this.lineColor = null;
      if (pc.valid(options))
        this.config(options);
    },

    /**
     * Configures the component. See create method for options
     * @param {Object} options Options
     */
    config: function (options)
    {
      if (options.color)
      {
        if (this.color == null)
          this.color = pc.Color.create();

        this.color.set(options.color); // can be null
      } else
        this.color = null;

      if (options.lineColor)
      {
        if (!this.lineColor)
          this.lineColor = pc.Color.create();

        this.lineColor.set(options.lineColor);
      } else
        this.lineColor = null;

      this.lineWidth = pc.checked(options.lineWidth, 1);
      this.cornerRadius = pc.checked(options.cornerRadius, 0);
    }

  });

