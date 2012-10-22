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
        RADIAN_TO_DEGREE:(180 / Math.PI),
        /** Quick lookup to convert degrees to radians */
        DEGREE_TO_RADIAN:(Math.PI / 180),
        /** Quick lookup for Math.PI */
        PI:Math.PI,

        /** Quick lookup for Math.round */
        round:Math.round,
        /** Quick lookup for Math.random */
        random:Math.random,
        /** Quick lookup for Math.floor */
        floor:Math.floor,

        /**
         * Find the square of a number
         * @param {Number} number The square of the number
         */
        sqr:function (number)
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
        rand:function (min, max)
        {
            return pc.Math.round((pc.Math.random() * (max - min)) + min);
        },

        /**
         * Returns a random float within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
         * @param {Number} min the start of the range
         * @param {Number} max the end of the range
         * @returns {Number} A random number between (and including) the range
         */
        randFloat:function (min, max)
        {
            return (pc.Math.random() * (max - min)) + min;
        },

        /**
         * Rotates a given angle by an amount in degrees
         * @param {Number} angle Original angle
         * @param {Number} by Amount to add in degrees (can be negative)
         * @return {Number} A new angle, rotated by the amount given
         */
        rotate:function (angle, by)
        {
            var newDir = angle + by;
            while (newDir > 359)
                newDir -= 359;
            while (newDir < 0)
                newDir = 359 + newDir;
            return newDir;
        },

        /**
         * Calcuates the angle difference based on two angles and a direction (clockwise or counterclockwise)
         * @param {Number} angleA Starting angle in degrees
         * @param {Number} angleB Ending angle in degrees
         * @param {Boolean} clockwise True if the difference should be calculated in a clockwise direction
         * @return {Number} Angle difference in degrees
         */
        angleDiff: function(angleA, angleB, clockwise)
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
        isClockwise:function (angleA, angleB)
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
        isFacingRight: function(angle)
        {
            if (angle > 270 || angle < 90) return true;
            return false;
        },

        /**
         * Converts radians to degrees
         * @param {Number} radians Radians
         * @return {Number} Radians from degrees
         */
        radToDeg:function (radians)
        {
            return (radians * pc.Math.RADIAN_TO_DEGREE);
        },

        /**
         * Converts degrees to radains
         * @param {Number} degrees Degrees to convert
         * @return {Number} Number of radians
         */
        degToRad:function (degrees)
        {
            return degrees * pc.Math.DEGREE_TO_RADIAN;
        },

        /**
         * Gives you the angle of a given vector x, y
         * @param {Number} x x component of the 2d vector
         * @param {Number} y y component of the 2d vector
         * @return Angle in degrees
         */
        angleFromVector:function (x, y)
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
        vectorFromAngle: function(angle)
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
        isPointInRect:function (x, y, rx, ry, rw, rh)
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
        isRectInRect:function (x, y, w, h, rx, ry, rw, rh)
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
        isRectColliding:function (x, y, w, h, rx, ry, rw, rh)
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
        limit:function (v, lowest, highest)
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
        limitAdd:function (v, inc, lowest, highest)
        {
            if (v+inc < lowest) return lowest;
            if (v+inc > highest) return highest;
            return v+inc;
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
         * @param x x-position of the top left of the rectangle
         * @param y y-position of the top left of the rectangle
         * @param w width of the rectangle
         * @param h height of the rectangle
         * @return {pc.Rect} A new rectangle (acquired from the free object pool}
         */
        create:function (x, y, w, h)
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
        x:0,
        /** y position of the top left of the rectangle */
        y:0,
        /** width of the rectangle */
        w:0,
        /** height of the rectangle */
        h:0,

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
        containsRect:function (x, y, w, h, rx, ry, rw, rh)
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
        containsPoint:function (p)
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
        overlaps:function (rx, ry, rw, rh, dir)
        {
            var w = rw;
            var h = rh;

            if (pc.valid(dir) && dir != 0)
            {
                // calculate using a rotated rectangle
                var s = Math.sin(pc.Math.degToRad(dir));
                var c = Math.cos(pc.Math.degToRad(dir));
                if (s < 0) s= -s;
                if (c < 0) c= -c;
                w = rh*s + rw*c; // width of AABB
                h = rh*c + rw*s; // height of AABB
            }
            return !(this.y + this.h < ry || this.y > ry + h ||
                this.x + this.w < rx || this.x > rx + w);
        },

        /**
         * @return {String} A nice string representation of the rectangle
         */
        toString:function ()
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
        create:function (x, y)
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
        x:0,
        /** y position of the point */
        y:0,

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        match:function (p)
        {
            this.x = p.x;
            this.y = p.y;
        },

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        set: function(p)
        {
            this.match(p);
        },

        /**
         * Sets the x and y of the point
         * @param {Number} x x position to set
         * @param {Number} y y position to set
         * @return {pc.Point} This point
         */
        setXY: function(x, y)
        {
            this.x = x;
            this.y = y;
            return this;
        },

        /**
         * Adds to the point
         * @param {Number} x Amount to add to x
         * @param {Number} y Amount to add to y
         * @return {pc.Point} This point
         */
        add: function(x, y)
        {
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
        subtract:function (x, y)
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
        dirTo:function (p)
        {
            var a = Math.abs(p.x - this.x);
            var b = Math.abs(p.y - this.y);
            if (a == 0) a = 1;
            if (b == 0) b = 1;

            var bovera = b / a;
            var angleInRadians = Math.atan(bovera);
            var angle = pc.Math.radToDeg(angleInRadians);

            if (p.x < this.x)
            {
                // left side
                if (p.y < this.y)
                    return angle + 180;
                return (90 - angle) + 90;
            } else
            {
                // right side
                if (p.y < this.y)
                    return (90 - angle) + 270;
                return angle;
            }
        },

        /**
         * Modifies the point by moving along at a projected angle (dir) by the distance
         * @param {Number} dir Direction to move, in degrees
         * @param {Number} distance Distance to move
         */
        moveInDir:function (dir, distance)
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
        moveTowards:function (to, distance)
        {
            this.moveInDir(this.dirTo(to), distance);
        },

        /**
         * Get the distance between this point and another
         * @param {pc.Point} p Another point
         * @return {Number} Distance between this point and another
         */
        distance:function (p)
        {
            return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
        },

        /**
         * A nice string representing this point
         * @return {String}
         */
        toString:function ()
        {
            return this.x + 'x' + this.y;
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


