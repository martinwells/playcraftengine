/**
 * PlayCraft Engine
 * DataResource: a generic resource you can load (json, xml, etc)
 * @class
 */

pc.DataResource = pc.Base.extend('pc.DataResource', {},
    {
        data:null,
        request:null,
        src:null,
        name: null,
        loaded:false,
        onLoadCallback:null,
        onErrorCallback:null,

        /**
         * Loads data from a remote (URI) resource.
         * @param src URI for the data
         * @param onLoadCallback Function to be called once the image has been loaded
         * @param onErrorCallback Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.src = pc.device.loader.makeUrl(src);
            this.name = name;
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;
            this.request = new XMLHttpRequest();
            this.request.onreadystatechange = this.onReadyStateChange.bind(this);
            this.request.onload = this.onReadyStateChange.bind(this);
            this.request.onloadend = this.onReadyStateChange.bind(this);
            this.load();
        },

        /**
         * Load script
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            this.request.open('get', this.src);
            this.request.send(null);
        },

        /**
         * Force a reload
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        onReadyStateChange:function()
        {
            if (this.loaded) return;

            if (this.request.readyState == 4)
            {
                if (this.request.status == 200)
                {
                    this.loaded = true;

                    this.data = this.request.responseText;

                    if (this.onLoadCallback)
                        this.onLoadCallback(this);
                } else
                if (this.request.status == 404)
                {
                    this.warn('resource ' + this.src + ' error ' + this.request.status);
                    if (this.onErrorCallback)
                        this.onErrorCallback(this);
                }
            }
        },


    });
