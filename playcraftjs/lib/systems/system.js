
pc.systems = {};

pc.systems.System = pc.Base.extend('pc.System',
    { },
    {
        layer: null,
        componentTypes: null,
        systemManager: null, // injected by system manager when a system is added
        delay: 0, // optional delay for running this system, default is 0 (which means run every cycle)

        _lastRun: 0,

        /**
         * Constructor for a system
         */
        init: function(componentTypes, delay)
        {
            this._super();
            this.delay = pc.checked(delay, 0);
            if (!componentTypes instanceof Array)
                throw "Invalid component types array. Use a blank array ([]) if there are no components handled by the system.";
            this.componentTypes = componentTypes;
        },

        processAll: function()
        {
        },

        /**
         * Called by the system when the layer has changed size
         */
        onResize: function()
        {
        },

        onOriginChange: function(x, y)
        {
        },

        onAddedToLayer: function(layer)
        {
        },

        onRemovedFromLayer:function (layer)
        {
        }
    });

