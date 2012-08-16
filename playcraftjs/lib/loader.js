/**
 * Playcraft Engine
 * Loader - the resource loader and manager
 *
 * The Loader takes care of loading resources (downloading) and then notifying you when everything
 * is ready.
 */


pc.Loader = pc.Base.extend('pc.Loader', {},
{
    State: { QUEUED:0, LOADING:1, READY:2, FAILED:3 },

    resources: new pc.Hashtable(),
    loadingListener: null,
    loadedListener: null,
    progress: 0,
    totalBeingLoaded: 0,
    errored: 0,
    baseUrl: '',

    /**
     * @property started {Boolean} True if loader.start() has been called. Typically resources use this to check
     * if they should just load immediately (after game start) or hold on loading until the loader calls (triggered
     * by loader.start()
     */
    started: false,
    finished: false,

    _noCacheString: '',

    /**
     * Init the loader.
     * Listener will be called with a param (0 to 1) representing % complete.
     */
    init: function()
    {
        this._super();
    },

    /**
     * Tells the resource loader to disable caching in the browser by modifying the resource src
     * by appending the current date/time
     */
    setDisableCache: function()
    {
        this._noCacheString = '?nocache=' + Date.now();
    },

    setBaseUrl: function(url)
    {
        this.baseUrl = url;
    },

    setListener: function(loadingListener, loadedListener)
    {
        this.loadingListener = loadingListener;
        this.loadedListener = loadedListener;
    },

    add: function(resource)
    {
        // resource.src already has the baseUrl set by the resource class (i.e. pc.Image)
        // so no need to add it here
        this.resources.put(resource.name.toLowerCase(), { resource: resource, state: this.State.QUEUED } );
        this.info('Adding resource ' + resource.src + ' to the queue.');
    },

    get: function(name)
    {
        var res = this.resources.get(name.toLowerCase());
        if (!res)
            this.warn("Attempting to get a resource that hasn't been added: " + name);
        return res;
    },

    start: function(loadingListener, loadedListener)
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
                res.resource.load(this.onLoad.bind(this), this.onError.bind(this));
                res.state = this.State.LOADING;
                this.totalBeingLoaded++;
            }
        }
        this.info('Started loading ' + this.totalBeingLoaded + ' resource(s).');
    },

    makeUrl: function(src)
    {
        return this.baseUrl + src + this._noCacheString;
    },

    /**
     * Called from the resource once it's been loaded
     * @param resource The resource that has been loaded, such as a pc.Image or pc.Sound
     */
    onLoad: function(resource)
    {
        var res = this.resources.get(resource.name);
        res.state = this.State.READY;
        this.progress++;

        if (this.loadingListener != null)
            this.loadingListener(Math.round((this.progress / this.totalBeingLoaded) * 100));

        this.info(resource.name + ' loaded (' + Math.round((this.progress / this.totalBeingLoaded)*100) + '% done)');

        this.checkAllDone();
    },

    /**
     * Called from the resource if it fails to load
     * @param resource The resource that has failed, such as a pc.Image or pc.Sound
     */
    onError: function(resource)
    {
        var res = this.resources.get(resource.name);
        res.state = this.State.FAILED;
        this.progress++;
        this.errored++;

        if (this.loadingListener != null)
            this.loadingListener(this.progress / this.totalBeingLoaded);
        this.warn(resource.name + ' (' + resource.src + ') failed.');

        this.checkAllDone();
    },

    checkAllDone: function()
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



