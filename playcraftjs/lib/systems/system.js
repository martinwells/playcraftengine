/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.systems = {};

/**
 * @class pc.systems.System
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The base class for all systems. See the entity systems guide for more information on creating your own systems.
 */

pc.systems.System = pc.Base.extend('pc.System',
    /** @lends pc.systems.System */
    { },
    /** @lends pc.systems.System.prototype */
    {
        /** layer this system is on */
        layer: null,
        /** array of string component types this system handles */
        componentTypes: null,
        /** reference to the systems system manager (read-only) */
        systemManager: null,
        /** optional delay for running this system, default is 0 (which means run every cycle) */
        delay: 0,

        _lastRun: 0,

        /**
         * Constructs a new system
         * @param {Array} componentTypes Array of strings representing the component types this system will handle
         * @param {Number} delay Amount of time delay in ms between runs. i.e. systems that don't need to run every.
         */
        init: function(componentTypes, delay)
        {
            this._super();
            this.delay = pc.checked(delay, 0);
            if (!componentTypes instanceof Array)
                throw "Invalid component types array. Use a blank array ([]) if there are no components handled by the system.";
            this.componentTypes = componentTypes;
        },

        /**
         * Called by the system manager to allow this system to take care of business. This default does nothing.
         */
        processAll: function()
        {
        },

        /**
         * Called by the system when the layer has changed size
         */
        onResize: function()
        {
        },

        /**
         * Called by the system when the origin changes
         */
        onOriginChange: function(x, y)
        {
        },

        /**
         * Called when this system instance is added to a layer
         */
        onAddedToLayer: function(layer)
        {
        },

        /**
         * Called when this system instance is removed from a layer
         */
        onRemovedFromLayer:function (layer)
        {
        }
    });

