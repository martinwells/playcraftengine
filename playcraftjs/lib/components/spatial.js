/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Spatial
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>, <a href='pc.systems.Physics'>pc.systems.Physics</a>,
 * <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Represents where an entity exists in 2D space (x, y, width and height). This component is mostly for use by other
 * systems to update and use.
 */
pc.components.Spatial = pc.components.Component.extend('pc.components.Spatial',
    /** @lends pc.components.Spatial */
    {
        /**
         * Constructs (or acquires from the pool) a spatial component configuring it with the given options
         * @param {Number} [options.x=0] Entity horizontal coordinate (pixels from the left)
         * @param {Number} [options.y=0] Entity vertical coordinate (pixels from the top)
         * @param {Number} [options.w=0] Entity width (pixels)
         * @param {Number} [options.h=0] Entity height (pixels)
         * @param {Number} [options.dir=0] Rotation; 0 is upright, rotation is clockwise
         * @param {Number} [options.scaleX=1] Horizontal scaling factor (1 is no scaling, -1 flips horizontally)
         * @param {Number} [options.scaleY=1] Vertical scaling factor (1 is no scaling, -1 flips vertically)
         * @return {pc.components.Spatial} A shiney new component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Spatial.prototype */
    {
        /** Last movement in 2D space */
        lastMove: null,

        /** position of the entity as a pc.Point object (use pos.x and pos.y). */
        pos: null,
        /** dimension of the entity as a pc.Dim object (use dim.x for width and dim.y for height) */
        dim: null,
        /** amount the spatial is scaled on x-axis */
        scaleX: 0,
        /** amount the spatial is scaled on y-axis */
        scaleY: 0,
        dir: 0,

        _centerPos: null, // cache of the current center
        _screenRect: null, // cache of the getScreenRect return

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super('spatial');

            this.pos = pc.Point.create(0, 0);
            this.dim = pc.Dim.create(0, 0);
            this._screenRect = pc.Rect.create(0, 0, 0, 0);
            this._centerPos = pc.Point.create(0, 0);
            this._unscaledPos = pc.Point.create(0,0);
            this._unscaledDim = pc.Point.create(0,0);
            this.lastMove = pc.Dim.create(0, 0);
            this.scaleX = 1;
            this.scaleY = 1;

            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.pos.x = pc.checked(options.x, 0);
            this.pos.y = pc.checked(options.y, 0);
            this.dim.x = pc.checked(options.w, 0);
            this.dim.y = pc.checked(options.h, 0);
            this.dir = pc.checked(options.dir, 0);
            this.scaleX = pc.checked(options.scaleX, 1);
            this.scaleY = pc.checked(options.scaleY, 1);

            this._centerPos.x = 0;
            this._centerPos.y = 0;
            this._screenRect.x = 0;
            this._screenRect.y = 0;
            this._screenRect.w = 0;
            this._screenRect.h = 0;
            this.lastMove.x = 0;
            this.lastMove.y = 0;
        },

        /**
         * Get the current position
         * @return {pc.Point} the current position
         */
        getPos: function()
        {
            return this.pos;
        },

        /**
         * Get the current dimensions (x, y)
         * @return {pc.Dim} Reference to the current pc.Dim for this spatial
         */
        getDim: function()
        {
            return this.dim;
        },

        /**
         * Increase the dimensions of the spatial by the given x and y scales. Scaling occurs relative to the
         * center of the spatial, so the position is moved accordingly
         * @param {Number} x x-axis scale to apply (can be negative to shrink)
         * @param {Number} y y-axis scale to apply (can be negative to shrink)
         */
        addScale:function(x, y)
        {
            this.pos.x -= Math.abs((this.dim.x - (this.dim.x * x)) / 2);
            this.pos.y -= Math.abs((this.dim.y - (this.dim.y * y)) / 2);
            this.dim.x *= (x);
            this.dim.y *= (y);
            this.scaleX += x;
            this.scaleY += y;
        },

        _unscaledPos: null,

        /**
         * Gets the spatial position, without any scaling effects
         * @return {pc.Point} The unscaled position
         */
        getUnscaledPos:function()
        {
            this._unscaledPos.x = this.pos.x / this.scaleX;
            this._unscaledPos.y = this.pos.y / this.scaleY;
            return this._unscaledPos;
        },

        _unscaledDim: null,

        /**
         * Gets the spatial dimensions, without any scaling effects
         * @return {pc.Dim} The unscaled dimensions
         */
        getUnscaledDim:function()
        {
            this._unscaledDim.x = this.dim.x / this.scaleX;
            this._unscaledDim.y = this.dim.y / this.scaleY;
            return this._unscaledDim;
        },

        /**
         * Reduces the scale of the spatial. See addScale for details
         * @param {Number} x x-axis scale to reduce by
         * @param {Number} y y-axis scale to reduce by
         */
        subtractScale:function (x, y)
        {
            this.addScale(-x, -y);
        },

        /**
         * Set the spatial direction
         * @param {Number} d Direction to set
         */
        setDir:function(d)
        {
            this.dir = d;
        },

        /**
         * Get the current direction
         * @return {Number} Direction
         */
        getDir:function ()
        {
            return this.dir;
        },

        /**
         * Get the center pos of the spatial (calculated when you call this)
         * @return {pc.Point} A pc.Point representing the center of the spatial (cached so you do not need to release it)
         */
        getCenterPos: function()
        {
            this._centerPos.x = this.pos.x + (this.dim.x/2);
            this._centerPos.y = this.pos.y + (this.dim.y/2);
            return this._centerPos;
        },

        /**
         * Gets a pc.Rect of the screen relative location of this spatial (i.e. not world space)
         * @return {pc.Rect} on-screen rectangle (cached, so you should not release it). Null if not on a layer.
         */
        getScreenRect: function()
        {
            if (this._entity && this._entity.layer)
            {
                this._screenRect.x = this._entity.layer.screenX(this.pos.x);
                this._screenRect.y = this._entity.layer.screenY(this.pos.y);
                this._screenRect.w = this.dim.x;
                this._screenRect.h = this.dim.y;
                return this._screenRect;
            }
            return null;
        },

        /**
         * A nice string representation of the spatial
         * @return {String} A string representation
         */
        toString: function()
        {
            return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z + ' dir: '+ this.dir;
        }


    });