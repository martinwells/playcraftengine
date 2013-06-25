/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Math
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of math tools you can use. This is a static class, so you do not need to construct it, and all
 * methods/members are accessed using pc.Math.
 */
pc.Math = pc.Base('pc.Math',
  /** @lends pc.Math */
  {
    /** Quick lookup to convert radians to degrees */
    RADIAN_TO_DEGREE: (180 / Math.PI),
    /** Quick lookup to convert degrees to radians */
    DEGREE_TO_RADIAN: (Math.PI / 180),
    /** Quick lookup for Math.PI */
    PI: Math.PI,

    /** Quick lookup for Math.round */
    round: Math.round,
    /** Quick lookup for Math.random */
    random: Math.random,
    /** Quick lookup for Math.floor */
    floor: Math.floor,

    /**
     * Find the square of a number
     * @param {Number} number The square of the number
     */
    sqr: function (number)
    {
      return number * number;
    },

    /**
     * Returns a random integer within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
     * If you need a float random use randFloat.
     * @param {Number} min the start of the range
     * @param {Number} max the end of the range
     * @returns {Number} A random number between (and including) the range
     */
    rand: function (min, max)
    {
      return pc.Math.round((pc.Math.random() * (max - min)) + min);
    },

    /**
     * Returns a random float within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
     * @param {Number} min the start of the range
     * @param {Number} max the end of the range
     * @returns {Number} A random number between (and including) the range
     */
    randFloat: function (min, max)
    {
      return (pc.Math.random() * (max - min)) + min;
    },

    /**
     * Rotates a given angle by an amount in degrees
     * @param {Number} angle Original angle
     * @param {Number} by Amount to add in degrees (can be negative)
     * @return {Number} A new angle, rotated by the amount given
     */
    rotate: function (angle, by)
    {
      var newDir = angle + by;
      while (newDir > 359)
        newDir -= 360;
      while (newDir < 0)
        newDir = 360 + newDir;
      return newDir;
    },

    /**
     * Resolve an angle to 0 to 360 (if the angle is negative)
     * @param angle
     * @returns {Number} an angle between
     */
    simplifyAngle: function(angle)
    {
      // if the angle is negative we add 360
      if (angle < 0)
        return angle + 360;
      if (angle > 360)
        return angle % 360;

      return angle;
    },

    /**
     * Calculates the angle difference based on two angles and a direction (clockwise or counterclockwise)
     * @param {Number} angleA Starting angle in degrees
     * @param {Number} angleB Ending angle in degrees
     * @param {Boolean} clockwise True if the difference should be calculated in a clockwise direction
     * @return {Number} Angle difference in degrees
     */
    angleDiff: function (angleA, angleB, clockwise)
    {
      if (!clockwise)
      {
        var diff = angleA - angleB;
        if (diff < 0) diff += 360;
        return diff;
      } else
      {
        if (angleB < angleA) // wrapping around 0/360
          angleB += 360;
        return angleB - angleA;
      }
    },

    /**
     * Is the first angle closest by going clockwise of the second angle
     * @param {Number} angleA Angle to target
     * @param {Number} angleB Angle clockwise is relative to
     * @return {Boolean} True if angle A is clockwise to angle B
     */
    isClockwise: function (angleA, angleB)
    {
      if (angleA > angleB)
        return (Math.abs(angleA - angleB)) < (angleB + (360 - angleA));
      else
        return (angleA + (360 - angleB)) < (Math.abs(angleB - angleA));
    },

    /**
     * Returns whether an angle is facing to the right from a side-scrolling 2d perspective
     * @param {Number} angle Angle to test
     * @return {Boolean} true is facing to the right, otherwise false (meaning it's facing left)
     */
    isFacingRight: function (angle)
    {
      if (angle > 270 || angle < 90) return true;
      return false;
    },

    /**
     * Converts radians to degrees
     * @param {Number} radians Radians
     * @return {Number} Radians from degrees
     */
    radToDeg: function (radians)
    {
      return (radians * pc.Math.RADIAN_TO_DEGREE);
    },

    /**
     * Converts degrees to radains
     * @param {Number} degrees Degrees to convert
     * @return {Number} Number of radians
     */
    degToRad: function (degrees)
    {
      return degrees * pc.Math.DEGREE_TO_RADIAN;
    },

    /**
     * Gives you the angle of a given vector x, y
     * @param {Number} x x component of the 2d vector
     * @param {Number} y y component of the 2d vector
     * @return Angle in degrees
     */
    angleFromVector: function (x, y)
    {
      // angle to vector
      var a = pc.Math.radToDeg(Math.atan2(y, x));
      if (a < 0) a += 360;
      return a;
    },

    /**
     * Gives you the x, y vector of a given angle in degrees. This method creates a pc.Point which you should
     * release after use
     * @param {Number} angle Angle in degrees
     * @return {pc.Point} A newly acquired pc.Point with the vector.
     */
    vectorFromAngle: function (angle)
    {
      var vx = Math.cos(pc.Math.degToRad(angle));
      var vy = Math.sin(pc.Math.degToRad(angle));
      return pc.Point.create(vx, vy);
    },

    /**
     * A fast check if a point is within a rectangle
     * @param {Number} x x-position of the point to test
     * @param {Number} y y-position of the point to test
     * @param {Number} rx x-position of the rectangle
     * @param {Number} ry y-position of the rectangle
     * @param {Number} rw width of the rectangle
     * @param {Number} rh height of the rectangle
     * @return {Boolean} true is the point is within the rectangle
     */
    isPointInRect: function (x, y, rx, ry, rw, rh)
    {
      return x >= rx && x <= (rx + rw) &&
        y >= ry && y <= (ry + rh);
    },

    /**
     * Checks if one rectangle is completely contained in another
     * @param {Number} x x-position of the point to test
     * @param {Number} y y-position of the point to test
     * @param {Number} w height of the rectangle to test
     * @param {Number} h width of the rectangle to test
     * @param {Number} rx x-position of the rectangle
     * @param {Number} ry y-position of the rectangle
     * @param {Number} rw width of the rectangle
     * @param {Number} rh height of the rectangle
     * @return {Boolean} true is the rectangle is fully within the other
     */
    isRectInRect: function (x, y, w, h, rx, ry, rw, rh)
    {
      if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
      if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
      if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
      return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
    },

    /**
     * Fast test if one rectangle is overlapping another at any point
     * @param {Number} x x-position of the point to test
     * @param {Number} y y-position of the point to test
     * @param {Number} w height of the rectangle to test
     * @param {Number} h width of the rectangle to test
     * @param {Number} rx x-position of the rectangle
     * @param {Number} ry y-position of the rectangle
     * @param {Number} rw width of the rectangle
     * @param {Number} rh height of the rectangle
     * @return {Boolean} true if the rectangle overlaps anywhere
     */
    isRectColliding: function (x, y, w, h, rx, ry, rw, rh)
    {
      return !(y + h < ry || y > ry + rh ||
        x + w < rx || x > rx + rw);
    },

    /**
     * Forces a given value to be within a range (lowest to highest)
     * @param {Number} v The value to check
     * @param {Number} lowest Lowest value it can be
     * @param {Number} highest Highest value it can be
     * @return {Number} Original value or the edge of the fence if needed
     */
    limit: function (v, lowest, highest)
    {
      if (v < lowest) return lowest;
      if (v > highest) return highest;
      return v;
    },

    /**
     * Same as limit, but allows an increment value as well (which can be negative)
     * @param {Number} v Original value
     * @param {Number} inc Amount to add (can be negative)
     * @param {Number} lowest Lowest value to fence
     * @param {Number} highest Highest value to fence
     * @return {Number} Value with inc added fenced by the lowest and highest limits
     */
    limitAdd: function (v, inc, lowest, highest)
    {
      if (v + inc < lowest) return lowest;
      if (v + inc > highest) return highest;
      return v + inc;
    }
  },
  {
    // No instance, since this is an all static class
  });


/**
 * @class pc.Rect
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a rectangle.
 */
pc.Rect = pc.Pooled('pc.Rect',
  /** @lends pc.Rect */
  {
    /**
     * Constructs a new rectangle
     * @param {Number} x x-position of the top left of the rectangle
     * @param {Number} y y-position of the top left of the rectangle
     * @param {Number} w width of the rectangle
     * @param {Number} h height of the rectangle
     * @return {pc.Rect} A new rectangle (acquired from the free object pool}
     */
    create: function (x, y, w, h)
    {
      var newDim = this._super();
      newDim.x = x;
      newDim.y = y;
      newDim.w = w;
      newDim.h = h;
      return newDim;
    }
  },
  /** @lends pc.Rect.prototype */
  {
    /** x position of the top left of the rectangle */
    x: 0,
    /** y position of the top left of the rectangle */
    y: 0,
    /** width of the rectangle */
    w: 0,
    /** height of the rectangle */
    h: 0,

    /**
     * Checks if one rectangle is completely contained in another
     * @param {Number} x x-position of the point to test
     * @param {Number} y y-position of the point to test
     * @param {Number} w height of the rectangle to test
     * @param {Number} h width of the rectangle to test
     * @param {Number} rx x-position of the rectangle
     * @param {Number} ry y-position of the rectangle
     * @param {Number} rw width of the rectangle
     * @param {Number} rh height of the rectangle
     * @return {Boolean} true is the rectangle is fully within the other
     */
    containsRect: function (x, y, w, h, rx, ry, rw, rh)
    {
      if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
      if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
      if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
      return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
    },

    /**
     * Checks if a point is within the rectangle
     * @param {pc.Point} p A pc.point (or any object with a .x and .y property
     * @return {Boolean} true if the point is within the rectangle
     */
    containsPoint: function (p)
    {
      return p.x >= this.x && p.x <= (this.x + this.w) &&
        p.y >= this.y && p.y <= (this.y + this.h);
    },

    /**
     * Checks if this rectangle overlaps another (including rotation support)
     * @param {Number} rx x-position of the rectangle
     * @param {Number} ry y-position of the rectangle
     * @param {Number} rw width of the rectangle
     * @param {Number} rh height of the rectangle
     * @param {Number} dir Direction to rotate the angle to
     * @return {Boolean} true if the rectangle overlaps another
     */
    overlaps: function (rx, ry, rw, rh, dir)
    {
      var w = rw;
      var h = rh;

      if (pc.valid(dir) && dir != 0)
      {
        // calculate using a rotated rectangle
        var s = Math.sin(pc.Math.degToRad(dir));
        var c = Math.cos(pc.Math.degToRad(dir));
        if (s < 0) s = -s;
        if (c < 0) c = -c;
        w = rh * s + rw * c; // width of AABB
        h = rh * c + rw * s; // height of AABB
      }
      return !(this.y + this.h < ry || this.y > ry + h ||
        this.x + this.w < rx || this.x > rx + w);
    },

    /**
     * @return {String} A nice string representation of the rectangle
     */
    toString: function ()
    {
      return this.x + ' x ' + this.y + ' by ' + this.w + ' x ' + this.h;
    }



  });

/**
 * @class pc.Point
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a 2D point.
 */
pc.Point = pc.Pooled('pc.Point',
  /** @lends pc.Point */
  {
    /**
     * Constructs a new point (from the pool)
     * @param {Number} x x position
     * @param {Number} y y position
     * @return {pc.Point} A shiny new point
     */
    create: function (x, y)
    {
      var n = this._super();
      n.x = x;
      n.y = y;
      return n;
    }
  },
  /** @lends pc.Point.prototype */
  {
    /** x position of the point */
    x: 0,
    /** y position of the point */
    y: 0,

    init: function(x, y)
    {
      this._super();
      this.x = x;
      this.y = y;
    },

    /**
     * Tests whether one point is equal to another
     * @param {pc.Point} other Other point to test against
     */
    equals: function (other)
    {
      return (this.x == other.x && this.y == other.y);
    },

    /**
     * Makes this point match another
     * @param {pc.Point} p The other point to match
     */
    match: function (p)
    {
      this.x = p.x;
      this.y = p.y;
    },

    /**
     * Returns a new point with the same x, y as this one
     * @returns {pc.Point} New point from the pool
     */
    clone: function()
    {
      return pc.Point.create(this.x, this.y);
    },

    /**
     * Makes this point match another
     * @param {pc.Point} p The other point to match
     */
    set: function (p)
    {
      this.match(p);
    },

    /**
     * Sets the x and y of the point
     * @param {Number} x x position to set
     * @param {Number} y y position to set
     * @return {pc.Point} This point
     */
    setXY: function (x, y)
    {
      this.x = x;
      this.y = y;
      return this;
    },

    /**
     * Adds to the point
     * @param {Number|pc.Point} xOrPoint Amount to add to x (or alternatively a pc.Point to add)
     * @param {Number} y Amount to add to y
     * @return {pc.Point} This point
     */
    add: function (xOrPoint, y)
    {
      if (arguments.length == 1)
      {
        this.x += xOrPoint.x;
        this.y += xOrPoint.y;
        return this;
      }

      this.x += x;
      this.y += y;
      return this;
    },

    /**
     * Subtracts from the point
     * @param {Number} x Amount to subtract from x
     * @param {Number} y Amount to subtract from y
     * @return {pc.Point} This point
     */
    subtract: function (x, y)
    {
      this.x -= x;
      this.y -= y;
      return this;
    },

    /**
     * Gives you the angle from this point to another
     * @param {pc.Point} p Another point
     * @return {Number} Facing direction (in degrees) from this point to another
     */
    dirTo: function (p)
    {
      return Math.atan2(p.y - this.y, p.x - this.x) * 180 / Math.PI;
    },

    /**
     * Modifies the point by moving along at a projected angle (dir) by the distance
     * @param {Number} dir Direction to move, in degrees
     * @param {Number} distance Distance to move
     */
    moveInDir: function (dir, distance)
    {
      this.x += distance * Math.cos(pc.Math.degToRad(dir));
      this.y += distance * Math.sin(pc.Math.degToRad(dir));
      return this;
    },

    /**
     * Changes the from position by an amount of pixels in the direction of the to position
     * ultimately reaching that point
     * @param {pc.Point} to Ending position
     * @param {Number} distance Amount to move
     */
    moveTowards: function (to, distance)
    {
      this.moveInDir(this.dirTo(to), distance);
    },

    /**
     * Get the distance between this point and another
     * @param {pc.Point} p Another point
     * @return {Number} Distance between this point and another
     */
    distance: function (p)
    {
      return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
    },

    /**
     * A nice string representing this point
     * @return {String}
     */
    toString: function ()
    {
      return this.x + 'x' + this.y;
    }


  });

pc.Poly = pc.Pooled('pc.Poly',
  /** @lends pc.Poly */
  {
    create: function (x, y, points)
    {
      var n = this._super();
      n.x = x;
      n.y = y;
      n.points = points;
      return n;
    }
  },
  /** @lends pc.Poly.prototype */
  {
    /** x position of the polygon */
    x: 0,
    /** y position of the polygon */
    y: 0,
    /** array of points representing the polygon (relative to x, y) */
    points: null,

    _boundingRect: null,

    init: function (x, y, points)
    {
      this.x = x;
      this.y = y;
      this.points = points;
      this._boundingRect = pc.Rect.create(0, 0, 0, 0);
    },

    getBoundingRect: function ()
    {
      // todo
    },

    containsPoint: function (p)
    {
      for (var c = false, i = -1, l = this.points.length, j = l - 1; ++i < l; j = i)
      {
        ((this.points[i].y <= p.y && p.y < this.points[j].y) || (this.points[j].y <= p.y && p.y < this.points[i].y))
          && (p.x < (this.points[j].x - this.points[i].x) * (p.y - this.points[i].y) / (this.points[j].y - this.points[i].y) + this.points[i].x)
        && (c = !c);
      }
      return c;
    }
  });


/**
 * @class pc.Dim
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Dim = pc.Point;

/**
 * @class pc.Vector
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Vector = pc.Point;


/**
 * @class pc.Easing
 * @description
 * <p>
 * A collection of useful easing functions - partially from https://github.com/sole/tween.js
 */
pc.Easing = {

  LINEAR: 0,
  QUADRATIC_IN: 1,
  QUADRATIC_OUT: 2,
  QUADRATIC_IN_OUT: 3,
  CUBIC_IN: 4,
  CUBIC_OUT: 5,
  CUBIC_IN_OUT: 6,
  EXPONENTIAL_IN: 7,
  EXPONENTIAL_OUT: 8,
  EXPONENTIAL_IN_OUT: 9,
  CIRCULAR_IN: 10,
  CIRCULAR_OUT: 11,
  CIRCULAR_IN_OUT: 12,
  ELASTIC_IN: 13,
  ELASTIC_OUT: 14,
  ELASTIC_IN_OUT: 15,
  BOUNCE_IN: 16,
  BOUNCE_OUT: 17,
  BOUNCE_IN_OUT: 18,
  BACK_IN: 19,
  BACK_OUT: 20,
  BACK_IN_OUT: 21,

  ease: function(type, k)
  {
    switch (type)
    {
      case this.LINEAR: return this.linear(k);
      case this.QUADRATIC_IN: return this.quadraticIn(k);
      case this.QUADRATIC_OUT: return this.quadraticOut(k);
      case this.QUADRATIC_IN_OUT: return this.quadraticInOut(k);
      case this.CUBIC_IN: return this.cubicIn(k);
      case this.CUBIC_OUT: return this.cubicOut(k);
      case this.CUBIC_IN_OUT: return this.cubicInOut(k);
      case this.EXPONENTIAL_IN: return this.exponentialIn(k);
      case this.EXPONENTIAL_OUT: return this.exponentialOut(k);
      case this.EXPONENTIAL_IN_OUT: return this.exponentialInOut(k);
      case this.CIRCULAR_IN: return this.circularIn(k);
      case this.CIRCULAR_OUT: return this.circularOut(k);
      case this.CIRCULAR_IN_OUT: return this.circularInOut(k);
      case this.ELASTIC_IN: return this.elasticIn(k);
      case this.ELASTIC_OUT: return this.elasticOut(k);
      case this.ELASTIC_IN_OUT: return this.elasticInOut(k);
      case this.BOUNCE_IN: return this.bounceIn(k);
      case this.BOUNCE_OUT: return this.bounceOut(k);
      case this.BOUNCE_IN_OUT: return this.bounceInOut(k);
      case this.BACK_IN: return this.backIn(k);
      case this.BACK_OUT: return this.backOut(k);
      case this.BACK_IN_OUT: return this.backInOut(k);
    }

    return this.linear(k);

  },

  linear: function (k)
  {
    return k;
  },

  quadraticIn: function (k)
  {
    return k * k;
  },

  quadraticOut: function (k)
  {
    return k * ( 2 - k );
  },

  quadraticInOut: function (k)
  {
    if (( k *= 2 ) < 1) return 0.5 * k * k;
    return -0.5 * ( --k * ( k - 2 ) - 1 );
  },

  cubicIn: function (k)
  {
    return k * k * k;
  },

  cubicOut: function (k)
  {
    return --k * k * k + 1;
  },

  cubicInOut: function (k)
  {
    if (( k *= 2 ) < 1) return 0.5 * k * k * k;
    return 0.5 * ( ( k -= 2 ) * k * k + 2 );
  },

  exponentialIn: function (k)
  {
    return k === 0 ? 0 : Math.pow(1024, k - 1);
  },

  exponentialOut: function (k)
  {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
  },

  exponentialInOut: function (k)
  {
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (( k *= 2 ) < 1) return 0.5 * Math.pow(1024, k - 1);
    return 0.5 * ( -Math.pow(2, -10 * ( k - 1 )) + 2 );
  },

  circularIn: function ( k )
  {
    return 1 - Math.sqrt( 1 - k * k );
  },

  circularOut: function ( k )
  {
    return Math.sqrt( 1 - ( --k * k ) );
  },

  circularInOut: function (k)
  {
    if (( k *= 2 ) < 1) return -0.5 * ( Math.sqrt(1 - k * k) - 1);
    return 0.5 * ( Math.sqrt(1 - ( k -= 2) * k) + 1);
  },

  elasticIn: function (k)
  {

    var s, a = 0.1, p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!a || a < 1)
    {
      a = 1;
      s = p / 4;
    }
    else s = p * Math.asin(1 / a) / ( 2 * Math.PI );
    return -( a * Math.pow(2, 10 * ( k -= 1 )) * Math.sin(( k - s ) * ( 2 * Math.PI ) / p) );

  },

  elasticOut: function (k)
  {
    var s, a = 0.1, p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!a || a < 1)
    {
      a = 1;
      s = p / 4;
    }
    else s = p * Math.asin(1 / a) / ( 2 * Math.PI );
    return ( a * Math.pow(2, -10 * k) * Math.sin(( k - s ) * ( 2 * Math.PI ) / p) + 1 );
  },

  elasticInOut: function (k)
  {
    var s, a = 0.1, p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!a || a < 1)
    {
      a = 1;
      s = p / 4;
    }
    else s = p * Math.asin(1 / a) / ( 2 * Math.PI );
    if (( k *= 2 ) < 1) return -0.5 * ( a * Math.pow(2, 10 * ( k -= 1 )) * Math.sin(( k - s ) * ( 2 * Math.PI ) / p) );
    return a * Math.pow(2, -10 * ( k -= 1 )) * Math.sin(( k - s ) * ( 2 * Math.PI ) / p) * 0.5 + 1;
  },

  backIn: function (k)
  {

    var s = 1.70158;
    return k * k * ( ( s + 1 ) * k - s );

  },

  backOut: function (k)
  {
    var s = 1.70158;
    return --k * k * ( ( s + 1 ) * k + s ) + 1;
  },

  backInOut: function (k)
  {
    var s = 1.70158 * 1.525;
    if (( k *= 2 ) < 1) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
    return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
  },

  bounceIn: function (k)
  {
    return 1 - this.bounceOut(1 - k);
  },

  bounceOut: function (k)
  {
    if (k < ( 1 / 2.75 ))
    {
      return 7.5625 * k * k;
    } else if (k < ( 2 / 2.75 ))
    {
      return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
    } else if (k < ( 2.5 / 2.75 ))
    {
      return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
    } else
    {
      return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
    }
  },

  bounceInOut: function (k)
  {
    if (k < 0.5) return this.bounceIn(k * 2) * 0.5;
    return this.bounceOut(k * 2 - 1) * 0.5 + 0.5;
  }

};

