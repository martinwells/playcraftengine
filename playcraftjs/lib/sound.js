/**
 * PlayCraft Engine
 * Sound: a basic sound resource
 * @class
 */

pc.Sound = pc.Base.extend('pc.Sound', {},
    {
        sounds: [],
        src:null,
        name: null,
        numLoaded: 0,
        loaded:false,
        errored:false,
        channels:1,
        onLoadCallback:null,
        onErrorCallback:null,

        /**
         * Loads an sound from a remote (URI) resource. This will automatically
         * add this sound into the resource manager if the game is still in an init
         * phase.
         * @param name Resource name (tag) you want to use
         * @param src URI for the sound
         * @param channels Number of channels this sound can play at once
         * @param onLoadCallback Function to be called once the sound has been loaded (including all channels)
         * @param onErrorCallback Function to be called if the sound fails to load (on first error)
         */
        init:function (name, src, formats, channels, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.name = name;
            this.channels = channels;

            // append an extension to the src attribute that matches the format with what the device can play
            var canplay = false;
            for (var i=0; i < formats.length; i++)
            {
                if (pc.device.canPlay(formats[i]))
                {
                    this.src = pc.device.loader.makeUrl(src + '.' + formats[i]);
                    canplay = true;
                    break; // we set the src based on the first type we find (in the order they are provided)
                }
            }

            if (canplay)
            {
                if (pc.device.loader.started) // load now if the loader has already been started
                    this.load(onLoadCallback, onErrorCallback);
            } else
                this.errored = true;
        },

        /**
         * Pauses the sound
         */
        pause: function()
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].pause();
        },

        /**
         * Stop playing a sound (including all channels) -- actually just a synonym for pause
         */
        stop: function()
        {
            if (!this.canPlay()) return;
            this.pause();
        },

        /**
         * Volume to play the sound at
         * @param volume Volume as a range from 0 to 1 (0.5 is half volume)
         */
        setVolume: function(volume)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].volume = volume;
        },

        /**
         * Start playing the sound at the specified time (instead of 0)
         * @param time time (in milliseconds to start at)
         */
        setPlayPosition: function(time)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].currentTime = time;
        },

        /**
         * Load a sound. If the game hasn't started then the sound resource
         * will be added to the resource manager's queue.
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            // user customized callbacks
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback)
            {
                this.onLoadCallback(this);
                return;
            }
            // load up multiple copies of the sound, one for each channel
            for (var i=0; i < this.channels; i++)
            {
                var n = new Audio();
                n.preload = 'auto';

                // setup event handlers for this class -- we'll call the callbacks from there
                n.addEventListener("canplaythrough", this.onLoad.bind(this), false);
//                n.addEventListener("onload", this.onLoad.bind(this), false);
                n.addEventListener("error", this.onError.bind(this), false);
                n.onerror = this.onError.bind(this);
//                n.onLoad = this.onLoad.bind(this);
                n.src = this.src;
                this.sounds.push(n);

                if (pc.device.isAppMobi)
                    // force an onload for appmodi -- since it wont create one and the load is almost instant
                    this.onLoad(null);
            }

        },

        /**
         * Force this sound to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.errored = false;
            this.load();
        },

        onLoad:function (ev)
        {
            this.numLoaded++;

            // remove the event listener so we don't get this happening multiple times
            if (!pc.device.isAppMobi)
                ev.target.removeEventListener("canplaythrough", this.onLoad.bind(this), false);

            if (this.numLoaded == this.channels)
            {
                this.loaded = true;
                this.errored = false;
                if (this.onLoadCallback)
                    this.onLoadCallback(this);
            }
        },

        onError:function ()
        {
            this.errored = true;
            this.loaded = false;
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Plays a sound
         * @param loop True if you want the sound to just keep looking.
         */
        play:function(loop)
        {
            if (!this.canPlay()) return;

            // find a free channel and play the sound (if there is one free)
            for (var i=0, len=this.sounds.length; i < len; i++)
            {
                if (this.sounds[i].paused || this.sounds[i].ended)
                {
                    if (loop)
                        this.sounds[i].loop = true;
                    this.sounds[i].play();
                    return this.sounds[i];
                }
            }

            // no sounds were free, so we just do nothing
            this.warn(this.name + ' - all channels are in use');
        },

        /**
         * @return true if the sound can be played
         */
        canPlay: function()
        {
            return (this.loaded && pc.device.soundEnabled && !this.errored);
        }


    });

