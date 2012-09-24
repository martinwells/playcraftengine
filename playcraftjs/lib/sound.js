/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sound
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A sound resource can be loaded from a URI and played, including support for managing multichannel sound
 * (playing multiple sounds at once) and different formats used by different browsers.
 * <p>
 * In order to support all modern browsers, sounds need to be provided in both 'ogg' and 'mp3' formats. This is
 * becuase IE supports mp3 (but not ogg), chrome supports ogg and mp3, but safari and firefox only supports ogg. You
 * will need to create sound files into both ogg and mp3 to support all browsers.
 * <p>
 * To play a sound, you first need to load it from a URI:
 * <p><pre><code>
 * // check if sound is enabled
 * if (pc.device.soundEnabled)
 * {
 *    // add the sound to the resource loader
 *    pc.device.loader.add(
 *       // construct a new sound named shotgun, loading formats for
 *       // ogg and mp3 (shotgun.mp3 and shotgun.ogg)
 *       // and setup to play up to 5 of these sounds simultaneously
 *       new pc.Sound('shotgun', 'sounds/shotgun', ['ogg', 'mp3'], 5));
 * }
 * </code></pre>
 * <p>
 * Once you have the sound loaded you can play it:
 * <pre><code>
 * // grab the sound resource from the resource loader
 * var shotgunSound = pc.device.loader.get('shotgun').resource;
 * // play the sound (without looping)
 * shotgunSound.play(false);
 * </code></pre>
 * <p>
 * If the sound is looping, or it's a long sound you can stop it:
 * <pre><code>
 * shotgunSound.stop();
 * </code></pre>
 * You can adjust the volume of a sound:
 * <pre><code>
 * // set the volume to 50%
 * shotgunSound.setVolume(0.5);
 * </code></pre>
 * <p>
 * You can also change the starting position of sound or music using setPlayPosition:
 * <pre><code>
 * // start half way through
 * shotgunSound.setPlayPosition( shotgunSound.getDuration() / 2 );
 * </code></pre>
 */

pc.Sound = pc.Base.extend('pc.Sound', {},
    /** @lends pc.Sound.prototype */
    {
        /** Array of the sound elements -- multichannel sound requires multiple element copies to play */
        sounds: [],
        /** Source URI for the sound resource */
        src:null,
        /** String name for the sound */
        name: null,
        /** Number of sounds loaded */
        numLoaded: 0,
        /** Whether the sound is loaded */
        loaded:false,
        /** Whether an error occured loading the sound */
        errored:false,
        /** Number of channels for the sound. No more than this number can be played at once */
        channels:1,
        /** Optional call back once the sound is loaded */
        onLoadCallback:null,
        /** Optional call back if the sound errors whilst loading */
        onErrorCallback:null,

        /**
         * Construct a new sound, if the resource loader has already start the sound will be immediately loaded.
         * @param {String} name Resource name (tag) you want to use
         * @param {String} src URI for the sound
         * @param {Number} channels Number of channels this sound can play at once
         * @param {Function} [onLoadCallback] Function to be called once the sound has been loaded (including all channels)
         * @param {Function} [onErrorCallback] Function to be called if the sound fails to load (on first error)
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
         * Pauses the sound (on all channels)
         */
        pause: function()
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].pause();
        },

        /**
         * Stop playing a sound (on all channels) -- actually just a synonym for pause
         */
        stop: function()
        {
            if (!this.canPlay()) return;
            this.pause();
        },

        /**
         * Volume to play the sound at
         * @param {Number} volume Volume as a range from 0 to 1 (0.5 is half volume)
         */
        setVolume: function(volume)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].volume = volume;
        },

        /**
         * Gets the duration of the sound in seconds
         * @return {Number} The duration in seconds
         */
        getDuration: function()
        {
            if (!this.canPlay()) return -1;
            return this.sounds[0].duration;
        },

        /**
         * Sets the playback rate of the sound where 0 is not playing and 2 is double speed. Negative values cause
         * the sound to play backwards.
         * WARNING: Only currently supported by Safari and Chrome.
         * @param {Number} r The speed to play the sound at
         */
        setPlaybackRate:function (r)
        {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].playbackRate = r;
        },

        /**
         * Start playing the sound at the specified time (instead of 0)
         * @param {Number} time time (in seconds to start at)
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
         * @param {Function} onLoadCallback function to call once the sound is loaded
         * @param {Function} onLoadCallback function to call if the sound errors
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
                n.addEventListener("error", this.onError.bind(this), false);
                n.onerror = this.onError.bind(this);
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
         * @param {Boolean} loop True if you want the sound to just keep looking.
         * @return {Object} Sound element that was played
         */
        play:function(loop)
        {
            if (!this.canPlay()) return null;

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
            return null;
        },

        /**
         * @return {Boolean} true if the sound can be played
         */
        canPlay: function()
        {
            return (this.loaded && pc.device.soundEnabled && !this.errored);
        }


    });

