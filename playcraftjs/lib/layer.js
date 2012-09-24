/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Layer
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A layer is a container for drawing and processing game elements. Layer's are contained with a
 * <a href='pc.Scene'>pc.Scene</a> which automatically handles calling the process and draw methods.
 * <p>
 * You can use the pc.Layer class to create your own custom layers, though typically <a href='pc.TileLayer'>
 * pc.TileLayer</a> and <a href='pc.EntityLayer'>pc.EntityLayer</a> should be used for typical game levels.
 * <p>
 * To create your own custom level, derive from pc.Level and override the draw and process methods:
 * <pre><code>
 * // construct a scene and add it to the game
 * myGameScene = new GameScene();
 *
 * // create your own layer class
 * MyLayer = pc.Layer.extend('MyLayer',
 * {},
 * {
 *    // override draw to do custom layer drawing
 *    draw:function()
 *    {
 *       // draw a rectangle
 *       pc.device.ctx.fillStyle = '#fff';
 *       pc.device.ctx.fillRect(0, 0, 10, 10);
 *    }
 *
 *    // override process to update or change things
 *    process:function()
 *    { }
 * });
 *
 * // construct the custom layer and add it to the scene
 * var myLayer = new MyLayer('Test layer', 1);
 * myGameScene.addLayer(myLayer);
 * </code></pre>
 * <h5>Pause/Resume</h5>
 * Layers can be paused/resumed, which will stop drawing and processing of a layer.
 * <pre><code>
 * myLayer.pause();
 * myLayer.resume();
 * </code></pre>
 * <h5>Z-Order Drawing</h5>
 * Layers support z-order draw sorting within their scenes. To change the z-order, either construct the layer
 * using a zIndex parameter, or call setZIndex to change the draw order layer
 * <p>
 * <h5>Origins and Parallax</h5>
 * A layer has an optional origin that can be used to use the layer as a viewport into a large world.
 * By changing the origin you can pan and move a layer. You should then use screenX() and screenY() to
 * modify where an element is drawn relative to layer's current origin offset.
 * <p>
 * <pre><code>
 * draw:function()
 * {
 *    // draw a rectangle (at world coordinate 100, 100)
 *    pc.device.ctx.fillStyle = '#fff';
 *    pc.device.ctx.fillRect(this.screenX(100), this.screenY(100), 10, 10);
 * }
 *
 * // override process to update or change things
 * process:function()
 * {
 *    // pan the origin to the right by 1 pixel every cycle
 *    this.setOrigin( this.origin.x + 1, 0);
 * }
 * </code></pre>
 * <p>
 * To center a layer around a player object set its origin to position the player at half the viewport width
 * and height. This should be done on every game update:
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 * }
 * </pre></code>
 * <p>
 * You can achieve parallax effects by panning one layer at a different rate to others. For example, changing
 * the origin of a background layer at a ratio to the main layer (this is most commonly done in a scene.process method):
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 *
 *    // pan the background at 10% of the speed of the
 *    myBackgroundLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2) / 10,
 *       playerPos.y - (this.viewPort.h / 2) / 10);
 * }
 * </pre></code>
 * <p>
 * When you have many layers tracking a single origin it can be a pain to keep them all up to date, so to make life easier
 * you can have a layer automatically track another layer's origin, including a ratio for parallax effects:
 * <pre><code>
 * // Automatically keep the background layer's origin relative to myLayer's
 * // at a ratio of 10:1 (slow panning)
 * myBackgroundLayer.setOriginTrack( myLayer, 10 );
 * </code></pre>
 */

pc.Layer = pc.Base.extend('pc.Layer', {},
    /** @lends pc.Layer.prototype */
    {
        /** Name of the layer */
        name:null,
        /** whether the layer is presently paused */
        paused:false,
        /** whether the layer is active (isActive should be used over this as it also checks whether
         * the scene is active */
        active:false,
        /** the scene this layer is within */
        scene:null,
        /** draw order of this layer, lower draws first (use setZIndex method to change in order to update the scene) */
        zIndex:0,
        /** current origin track -- layer's origin will automatically match the origin of another layer */
        originTrack:null,
        /** ratio of origin tracking on X */
        originTrackXRatio:1,
        /** ratio of origin tracking on Y */
        originTrackYRatio:1,

        /**
         * World coordinate origin for this layer
         */
        origin:null,

        /**
         * @constructs pc.Layer
         * @param {String} name Name you want to give the layer
         * @param {Number} zIndex Draw order for this layer within it's scene (lower draws earlier)
         */
        init:function (name, zIndex)
        {
            this._super();

            this.name = name;
            this.origin = pc.Point.create(0, 0);
            this._worldPos = pc.Point.create(0, 0);
            this._screenPos = pc.Point.create(0, 0);
            this.zIndex = pc.checked(zIndex, 0);
            this.originTrack = null;
            this.originTrackXRatio = 0;
            this.originTrackYRatio = 0;
        },

        /**
         * @return {String} A nice string representation of the layer
         */
        toString:function ()
        {
            return '' + this.name + ' (origin: ' + this.origin + ', zIndex: ' + this.zIndex + ')';
        },

        release:function ()
        {
            this.origin.release();
        },

        /**
         * @return {Boolean} Is this layer active, and is it within a scene that is active
         */
        isActive:function ()
        {
            if (this.scene != null)
                if (!this.scene.active) return false;
            return this.active;
        },

        /**
         * Make this layer active
         */
        setActive:function ()
        {
            this.scene.setLayerActive(this);
        },

        /**
         * Make this layer inactive
         */
        setInactive:function ()
        {
            this.scene.setLayerInactive(this);
        },

        /**
         * Change the z order drawing for this layer (lower draws earlier)
         * @param {Number} z index as a value > 0
         */
        setZIndex:function (z)
        {
            this.zIndex = z;
            if (this.scene)
                this.scene.sortLayers();
        },

        _worldPos:null, // cached temp

        /**
         * Gets the world position of a screen position.
         * @param pos {pc.Point} World position of this layer (cached, so you don't need to release it)
         */
        worldPos:function (pos)
        {
            this._worldPos.x = pos.x + this.origin.x;
            this._worldPos.y = pos.y + this.origin.y;
            return this._worldPos;
        },

        _screenPos:null, // cached temp
        /**
         * Get a screen relative position from a world coordinate.
         * @param {pc.Point} pos World relative position
         */
        screenPos:function (pos)
        {
            this._screenPos.x = this.worldYToScreen(pos.x);
            this._screenPos.y = this.worldYToScreen(pos.y);
            return this._screenPos;
        },

        /**
         * @param {Number} x X position in world co-ordinates
         * @return {Number} X position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenX:function (x)
        {
            return x + this.scene.viewPort.x - this.origin.x;
        },

        /**
         * @param {Number} y Y position in world co-ordinates
         * @return {Number} Y position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenY:function (y)
        {
            return y + this.scene.viewPort.y - this.origin.y;
        },

        /**
         * A layer uses whatever screen rectangle is defined by the scene it sits within,
         * so this is just a helper method (and makes it compliant for things like input checking)
         */
        getScreenRect:function ()
        {
            return this.scene.getScreenRect();
        },

        /**
         * Draw the layer's scene. Use the scene's viewport and origin members to correctly position things.
         * Typical used for simple/custom layers with no entities or tiles.
         */
        draw:function ()
        {
        },

        /**
         * Sets tracking for this origin to always follow the origin of another layer. The ratio can be used
         * to parallax the layer.
         * @param {pc.Layer} trackLayer Layer to track
         * @param {Number} [xRatio] Ratio to track horizontally (i.e. trackLayer.origin.x * xRatio)
         * @param {Number} [yRatio] Ratio to track vertically (i.e. trackLayer.origin.y * yRatio)
         */
        setOriginTrack:function (trackLayer, xRatio, yRatio)
        {
            this.originTrack = trackLayer;
            this.originTrackXRatio = pc.checked(xRatio, 1);
            this.originTrackYRatio = pc.checked(yRatio, 1);
        },

        /**
         * Sets the origin world point of the top left of this layer.
         * @param {Number} x Set offset origin for the layer to x
         * @param {Number} y Set offset origin for the layer to y
         */
        setOrigin:function (x, y)
        {
            if (this.origin.x == Math.round(x) && this.origin.y == Math.round(y))
                return false;
            this.origin.x = Math.round(x);
            this.origin.y = Math.round(y);
            return true;
        },

        /**
         * Process the layer (if you overide this method make sure you call this._super();
         */
        process:function ()
        {
            if (this.originTrack)
            {
                this.setOrigin(this.originTrack.origin.x * this.originTrackXRatio,
                    this.originTrack.origin.y * this.originTrackYRatio);
            }
        },

        /**
         * Pauses this layer
         */
        pause:function ()
        {
            this.paused = true;
        },

        /**
         * Resumes all active layers
         */
        resume:function ()
        {
            this.paused = false;
        },

        /**
         * Called when the layer changes size (triggered by a browser or device resize event)
         * @param {Number} width New width of the underlying canvas
         * @param {Number} height New height of the underlying canvas
         */
        onResize:function (width, height)
        {
        },

        /**
         * Notification call when this layer has been added to a scene
         */
        onAddedToScene:function ()
        {
        },

        /**
         * Notification call when this layer has been removed from a scene
         */
        onRemovedFromScene:function ()
        {
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your layer to do something about it.
         * @param {String} actionName The name of the action that happened
         * @param {Object} event Raw event object
         * @param {pc.Point} pos Position, such as a touch input or mouse position
         * @param {pc.Base} uiTarget the uiTarget where the action occurred
         */
        onAction:function (actionName, event, pos, uiTarget)
        {
        }

    });








