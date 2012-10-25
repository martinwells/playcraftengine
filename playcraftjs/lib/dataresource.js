/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DataResource
 * @augments pc.Base
 * @description
 * A generic resource you can load data, such as JSON, XML or config files from a URL, just like an image or sound file.
 * <p>
 * To load a resource, use the pc.Loader to add a resource:
 * <pre><code>
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx'));
 * </code></pre>
 * <p>
 * Once you have the resource loaded you can access the contents of the resource using the data member:
 * <pre><code>
 * var xmlData = pc.device.loader.get('level1').resource.data;
 * </code></pre>
 * <p>
 * You can optionally provide a function to be called when the resource has finished loading or has an error.
 * <pre><code>
 * function onLevelDataLoaded(dataResource)
 * {
 *    // dataResource.data
 * }
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx', onLevelDataLoaded));
 * </code></pre>
 * <p>
 * The Scrollia demo game has an example using that loads the level.tmx file from the editor as a data resource which
 * is passed to pc.Scene to construct entities and layers.
 */
pc.DataResource = pc.Base.extend('pc.DataResource',
    {},
    /** @lends pc.DataResource.prototype */
    {
        /** Data resource that has been loaded */
        data:null,
        /** HTTP request object used to load the data */
        request:null,
        /** src URL */
        src:null,
        /** Short name for this resource */
        name: null,
        /** boolean indicating whether the resource has been loaded yet */
        loaded:false,
        /** current callback when the resource has been loaded */
        onLoadCallback:null,
        /** current callback if an error occurs whilst loading the resource */
        onErrorCallback:null,

        /**
         * Loads data from a remote (URI) resource.
         * @param {String} name Name to give the resource
         * @param {String} src URI for the data
         * @param {function} [onLoadCallback] Function to be called once the image has been loaded
         * @param {function} [onErrorCallback] Function to be called if the image fails to load
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
         * Triggers an immediate load of the resource. Use only if you're manually loading a resource, otherwise
         * the pc.Loader will automatically call load when it starts.
         * @param {function} [onLoadCallback] Optional function called when the resource has finished loading
         * @param {function} [onErrorCallback] Optional function called if the resource fails to load
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            this.request.open('get', this.src);
            this.request.send(null);
        },

        /**
         * Force the reloading of a resource (by marking it not loaded and calling load
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        /**
         * Called when the resource is loaded/ready. Generally this is used internally, and you should use the
         * onLoadCallback function optionally pass to the load method or constructor
         */
        onReadyStateChange:function()
        {
            if (this.loaded) return;

            if (this.request.readyState == 4)
            {
                if (this.request.status == 200 || this.request.status == 0)
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
        }


    });
