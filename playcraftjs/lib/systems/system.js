
pc.systems = {};

pc.systems.System = pc.Base.extend('pc.System',
    { },
    {
        layer: null,
        componentTypes: null,
        systemManager: null, // injected by system manager when a system is added

        /**
         * Constructor for a system
         */
        init: function(componentTypes)
        {
            this._super();
            if (!componentTypes instanceof Array)
                throw "Invalid component types array";
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

