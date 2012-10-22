/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Loader
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The Loader takes care of loading resources (downloading) and then notifying you when everything
 * is ready. The loader is a static class that will always be constructed by the engine and accessible through th
 * pc.device.loader member.
 * <p>
 * Using the loader you can load <a href='pc.Image'>pc.Image</a>'s, <a href='pc.DataResource'>pc.DataResources</a>'s,
 * and <a href='pc.Sound'>pc.Sound</a>'s.
 * <p>
 * Typically you use the loader from within your game class onReady method (called automatically by the engine).
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     onReady:function ()
 *     {
 *         this._super(); // call the base class' onReady
 *
 *         // disable caching when developing
 *         if (pc.device.devMode)
 *             pc.device.loader.setDisableCache();
 *
 *         // load up resources
 *         pc.device.loader.add(new pc.Image('spaceship', 'images/spaceship.png'));
 *
 *         // fire up the loader (with a callback once done)
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // display progress, such as a loading bar
 *     },
 *
 *     onLoaded:function ()
 *     {
 *         // we're ready; make the magic happen
 *     }
 * });
 * </code></pre>
 * You can disable caching using setDisableCache. This is the default when in devMode (when the engine has not been
 * packed/minified.
 */

pc.Loader = pc.Base.extend('pc.Loader',
    {},
    /** @lends pc.Loader.prototype */
    {
        State:{ QUEUED:0, LOADING:1, READY:2, FAILED:3 },

        /** A hashtable of all the resources, keyed by the resource name */
        resources:new pc.Hashtable(),
        /** Function called after each new resource has been loaded */
        loadingListener:null,
        /** Function called after all resources have been loaded or errored */
        loadedListener:null,
        /** Progress of the loader (number of items loaded so far) */
        progress:0,
        /** Total number of resources to be loaded */
        totalBeingLoaded:0,
        /** Number of resources that had a problem */
        errored:0,
        /** Optional baseURI prepended to resource URI's */
        baseUrl:'',

        /**
         * True if loader.start() has been called. Typically resources use this to check
         * if they should just load immediately (after game start) or hold on loading until the loader calls (triggered
         * by loader.start()
         */
        started:false,
        /** True if the resource loader has finished loading everything */
        finished:false,

        _noCacheString:'',

        /**
         * Constructor -- typically called by the engine to automatically construct pc.device.loader.
         */
        init:function ()
        {
            this._super();
        },

        /**
         * Tells the resource loader to disable caching in the browser by modifying the resource src
         * by appending the current date/time
         */
        setDisableCache:function ()
        {
            this._noCacheString = '?nocache=' + Date.now();
        },

        /**
         * Sets a base URI to save you type. Applies to all resources added until the next setBaseURL is called.
         * @param {String} url URI to preprend
         */
        setBaseUrl:function (url)
        {
            this.baseUrl = url;
        },

        /**
         * Sets an optional listener
         * @param {Function} loadingListener Function to call when each resource is loaded
         * @param {Function} loadedListener Function to call when all resources have been loaded
         */
        setListener:function (loadingListener, loadedListener)
        {
            this.loadingListener = loadingListener;
            this.loadedListener = loadedListener;
        },

        /**
         * Add a resource to the loader queue
         * @param {pc.Image|pc.Sound|pc.DataResource} resource Resource to load
         */
        add:function (resource)
        {
            // resource.src already has the baseUrl set by the resource class (i.e. pc.Image)
            // so no need to add it here
            this.resources.put(resource.name.toLowerCase(), { resource:resource, state:this.State.QUEUED });
            this.info('Adding resource ' + resource.src + ' to the queue.');
        },

        /**
         * Retrieve a resource from the loader
         * @param {String} name Name of the resource
         * @return {pc.Image|pc.Sound|pc.DataResource} Resource
         */
        get:function (name)
        {
            var res = this.resources.get(name.toLowerCase());
            if (!res)
                this.warn("Attempting to get a resource that hasn't been added: " + name);
            return res;
        },

        /**
         * Get all the sound resources
         * @return {Array} An array of all the sounds
         */
        getAllSounds:function ()
        {
            var sounds = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]).resource;
                if (res.Class.isA('pc.Sound'))
                    sounds.push(res);
            }
            return sounds;
        },

        /**
         * Get all the image resources
         * @return {Array} An array of all the images
         */
        getAllImages:function ()
        {
            var images = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]);
                if (res.isA('pc.Image'))
                    images.push(res);
            }

            return images;
        },

        /**
         * Starts the resource loader
         * @param {Function} loadingListener Function to call after each resource is loaded
         * @param {Function} loadedListener Function to call after all resources have been loaded or errored.
         */
        start:function (loadingListener, loadedListener)
        {
            this.setListener(loadingListener, loadedListener);

            this.progress = 0;
            this.errored = 0;

            // ask all of the resources to get busy loading
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]);
                if (res.state == this.State.QUEUED)
                {
                    res.resource.load(this._onLoad.bind(this), this._onError.bind(this));
                    res.state = this.State.LOADING;
                    this.totalBeingLoaded++;
                }
            }
            this.info('Started loading ' + this.totalBeingLoaded + ' resource(s).');
        },

        /**
         * Generates a URL using a src string (by prepending the baseURL and appending the optional no-cache string
         * @param {String} src Source URI
         * @return {String} A full resource URI
         */
        makeUrl:function (src)
        {
            return this.baseUrl + src + this._noCacheString;
        },

        _onLoad:function (resource)
        {
            var res = this.resources.get(resource.name);
            res.state = this.State.READY;
            this.progress++;

            if (this.loadingListener != null)
                this.loadingListener(Math.round((this.progress / this.totalBeingLoaded) * 100));

            this.info(resource.name + ' loaded (' + Math.round((this.progress / this.totalBeingLoaded) * 100) + '% done)');

            this._checkAllDone();
        },

        _onError:function (resource)
        {
            var res = this.resources.get(resource.name);
            res.state = this.State.FAILED;
            this.progress++;
            this.errored++;

            if (this.loadingListener != null)
                this.loadingListener(this.progress / this.totalBeingLoaded);
            this.warn(resource.name + ' (' + resource.src + ') failed.');

            this._checkAllDone();
        },

        _checkAllDone:function ()
        {
            if (this.progress >= this.totalBeingLoaded)
            {
                this.finished = true;
                this.loadedListener(this.progress, this.errored);
                this.progress = 0;
                this.errored = 0;
                this.totalBeingLoaded = 0;
            }

        }

    });



