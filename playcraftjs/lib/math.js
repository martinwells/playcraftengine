/**
 * PlayCraft Engine
 * Tools: A placeholder for useful tools
 * @class
 */


pc.Math = pc.Base('pc.Math',
    {
        RADIAN_TO_DEGREE:(180 / Math.PI),
        DEGREE_TO_RADIAN:(Math.PI / 180),
        PI:Math.PI,

        round:Math.round, // quick lokoups for speed
        random:Math.random,
        floor:Math.floor,

        /**
         * find the square root of a number
         * @param number
         */
        sqr:function (number)
        {
            return number * number;
        },

        /**
         * pick a random integer within the specified range.
         * @example
         * rand(10, 20) // returns a value between 10 and 20
         * @param min the start of the range
         * @param max
         */
        rand:function (min, max)
        {
            return pc.Math.round((pc.Math.random() * (max - min)) + min);
        },

        randFloat:function (min, max)
        {
            return (pc.Math.random() * (max - min)) + min;
        },

        rotate:function (dir, by)
        {
            var newDir = dir + by;
            while (newDir > 359)
                newDir -= 359;
            while (newDir < 0)
                newDir = 359 + newDir;
            return newDir;
        },

        /**
         * Calcuates the angle difference based on two angles and a direction (clockwise or counterclockwise)
         * @param angleA Starting angle in degrees
         * @param angleB Ending angle in degrees
         * @param clockwise True if the difference should be calculated in a clockwise direction
         * @return Angle difference in degrees
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
         * Is the first angle closest by going clockwise (to the right as such) of the second angle
         * @param angleA Angle to target
         * @param angleB Angle clockwise is relative to
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
         * @param angle Angle to test
         * @return true is facing to the right, otherwise false (meaning it's facing left)
         */
        isFacingRight: function(angle)
        {
            if (angle > 270 || angle < 90) return true;
            return false;
        },

        radToDeg:function (radians)
        {
            return (radians * pc.Math.RADIAN_TO_DEGREE);
        },

        degToRad:function (degrees)
        {
            return degrees * pc.Math.DEGREE_TO_RADIAN;
        },

        /**
         * Gives you the angle of a given vector x, y
         * @param x x component of the 2d vector
         * @param y y component of the 2d vector
         */
        angleFromVector:function (x, y)
        {
            // angle to vector
            var a = pc.Math.radToDeg(Math.atan2(y, x));
            if (a < 0) a += 360;
            return a;
        },

        vectorFromAngle: function(angle)
        {
            var vx = Math.cos(pc.Math.degToRad(angle));
            var vy = Math.sin(pc.Math.degToRad(angle));
            return pc.Math.create(vx, vy);
        },

        /*
         * A fast check if a point is within a rectangle
         */
        isPointInRect:function (x, y, rx, ry, rw, rh)
        {
            return x >= rx && x <= (rx + rw) &&
                y >= ry && y <= (ry + rh);

        },

        /**
         * Checks if one rectangle is completely contained in another
         */
        isRectInRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        isRectColliding:function (x, y, w, h, rx, ry, rw, rh)
        {
            return !(y + h < ry || y > ry + rh ||
                x + w < rx || x > rx + rw);
        },

        /**
         * Forces a given value to be within a range (lowest to highest)
         * @param v The value to check
         * @param lowest Lowest value it can be
         * @param highest Highest value it can be
         * @return Original value or the edge of the fence if needed
         */
        limit:function (v, lowest, highest)
        {
            if (v < lowest) return lowest;
            if (v > highest) return highest;
            return v;
        },

        /**
         * Same as limit, but allows an increment value as well (which can be negative)
         * @param v
         * @param lowest
         * @param highest
         * @return {*}
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


pc.Rect = pc.Pooled('pc.Rect',
    //
    // STATIC
    //
    {
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
    //
    // INSTANCE
    //
    {
        x:0, y:0, w:0, h:0,

        /**
         * Checks if one rectangle is completely contained in another
         */
        containsRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        containsPoint:function (p)
        {
            return p.x >= this.x && p.x <= (this.x + this.w) &&
                p.y >= this.y && p.y <= (this.y + this.h);

        },

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

        toString:function ()
        {
            return this.x + ' x ' + this.y + ' by ' + this.w + ' x ' + this.h;
        }



    });


pc.Point = pc.Pooled('pc.Point',
    //
    // STATIC
    //
    {
        create:function (x, y)
        {
            var n = this._super();
            n.x = x;
            n.y = y;
            return n;
        }
    },
    //
    // INSTANCE
    //
    {
        x:0, y:0,

        /**
         * Makes this point match another
         * @param p The other point to match
         */
        match:function (p)
        {
            this.x = p.x;
            this.y = p.y;
        },

        set: function(p)
        {
            this.match(p);
        },

        setXY: function(x, y)
        {
            this.x = x;
            this.y = y;
            return this;
        },

        add: function(x, y)
        {
            this.x += x;
            this.y += y;
            return this;
        },

        subtract:function (x, y)
        {
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * @param p Another point
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
         * Rotates the point by the given angle around a given origin point
         * @param angle Angle in degrees
         * @param origin Origin point to rotate around
         */
        rotate: function(angle, origin)
        {
            var a = $V([this.x,this.y]);
            var b = $V([origin.x,origin.y]);

            var c = a.rotate(pc.Math.degToRad(angle), b);
            this.x = c.elements[0];
            this.y = c.elements[1];
            return this;
        },

        /**
         * Modifies the point by moving along at a projected angle (dir) by the distance
         * @param dir Direction to move, in degrees
         * @param distance Distance to move
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
         * @param to {pc.Point} Ending position
         * @param distance {Number} Amount to move
         */
        moveTowards:function (to, distance)
        {
            this.moveInDir(this.dirTo(to), distance);
        },

        /**
         * @param p Another point
         * @return Distance between this point and another
         */
        distance:function (p)
        {
            return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
        },

        toString:function ()
        {
            return this.x + 'x' + this.y;
        }


    });


/**
 * Convenience version of a point for dimensions
 */
pc.Dim = pc.Point;

/**
 * Convenience version of a point for vectors
 */
pc.Vector = pc.Point;


