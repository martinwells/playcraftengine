/**
 * Playcraft Engine
 * game.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 */

/**
 * @class pc.Game
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * pc.Game is the primary base class for creating a game and drives resources, core processing (cycling) your
 * game, and serves as a placeholder for scenes.
 * <h5>Basic Usage</h5>
 * <p>
 * Typically a pc.Game is constructed by the pc.start method call made from within your games index.html:
 * <pre><code>
 * &ltscript&gt
 *    // pc.start will construct an instance of TheGame once the device (browser) is ready
 *    pc.start('pcGameCanvas', 'TheGame', '/mygame/js/', ['mygame.js']);
 * &lt/script&gt
 * </code></pre>
 * When the pc.start system has finished preparing everything, it will dynamically construct an instance of
 * the class parameter (in the above example 'TheGame'). You can always gain access to the game from the global
 * pc.device:
 * <pre><code>
 * var myGame = pc.device.game;
 * </code></pre>
 * <p>
 * To create a pc.Game, extend it and override what you need:
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     // onReady is called when the browser DOM is ready
 *     onReady:function ()
 *     {
 *         this._super();
 *
 *         // load resources
 *         // declare a base URL; saves you typing
 *         pc.device.loader.setBaseUrl('images/');
 *
 *         // add an image to the resource loader's queue
 *         pc.device.loader.add(new pc.Image('player-ship', 'ship1.png'));
 *
 *         // start the resource loader
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // draw title screen -- with loading bar
 *     }
 *
 * });
 * </code></pre>
 * See the pc.Loader for more information on using the resource loader and the onLoading/onLoaded callbacks.
 * <p>

 * <h5>Pause/Resume</h5>
 * <p>
 * You can pause/resume individual scenes, or you can pause/resume all scenes by calling pause on the game:
 * <pre><code>
 * myGame.pause();
 * myGame.resume();
 * myGame.togglePauseResume();
 * </code></pre>
 *
 * <h5>Debugging</h5>
 * pc.Game sets up the following default input keys for debugging:
 * <ul>
 *     <li>F9 to enable/disable physics debugging across all layers.</li>
 *     <li>F10 to dump stats on the object pools.</li>
 *     <li>F11 toggle sound.</li>
 * </ul>
 */

pc.Game = pc.Base.extend('pc.Game', {},
    /** @lends pc.Game.prototype */
    {
        /** (pc.LinkedList) List of all scenes in the game */
        scenes:null,
        /** (pc.LinkedList) List of scenes current active */
        activeScenes:null,
        /** (Boolean) Whether the game is currently paused. You can theGame.paused=true; to suspend all scenes **/
        paused:false,

        /**
         * Constructs a new game using the supplied canvas element ID and fps
         * @param {String} canvasId Id of the canvas element that will serve as the game canvas
         * @param {Number} fps Base frame rate in frames per second (fastest cycle time)
         */
        init:function (canvasId, fps)
        {
            this._super();

            this.scenes = new pc.LinkedList();
            this.activeScenes = new pc.LinkedList();

            if (pc.device.devMode)
            {
                // bind some special keys for general debugging use
                pc.device.input.bindAction(this, 'physics debug', 'F9');
                pc.device.input.bindAction(this, 'pool dump', 'F10');
                pc.device.input.bindAction(this, 'toggle sound', 'F11');
            }
        },

        /**
         * Processes all active scenes (called automatically by pc.Device.cycle)
         * @return {Boolean} false indicates the device should stop running the game loop
         */
        process:function ()
        {
            if (this.paused) return true;

            var scene = this.getFirstActiveScene();
            while (scene)
            {
                scene.object().process();
                scene = scene.next();
            }

            return true; // return false to quit the update loop
        },

        stopAllSounds: function()
        {
            // stop any current sounds from playing
            var sounds = pc.device.loader.getAllSounds();
            for (var i = 0; i < sounds.length; i++)
            {
                if (pc.device.soundEnabled)
                    sounds[i].stop();
            }
        },

        /**
         * Base handler for input actions. This gives the game a chance to intercept and act on actions like
         * F9 and F10 for debugging. See pc.Input for more information on input handlers
         * @param {String} actionName Name of the action to be handled
         */
        onAction:function (actionName)
        {
            if (actionName === 'toggle sound')
            {
                this.stopAllSounds();
                // toggle the sound
                pc.device.soundEnabled = !pc.device.soundEnabled;
            }

            if (actionName === 'pool dump')
            {
                console.log(pc.Pool.getStats());
            }

            if (actionName === 'physics debug')
            {
                // find all physics systems, and toggle debug
                var sceneNode = this.getFirstScene();
                while (sceneNode)
                {
                    var layerNode = sceneNode.object().getFirstActiveLayer();
                    while (layerNode)
                    {
                        var layer = layerNode.object();
                        if (layer.Class.isA('pc.EntityLayer'))
                        {
                            var systemNode = layer.systemManager.systems.first;
                            while (systemNode)
                            {
                                var system = systemNode.object();
                                if (system.Class.isA('pc.systems.Physics'))
                                    system.setDebug(!system.debug);
                                systemNode = systemNode.next();
                            }
                        }
                        layerNode = layerNode.next();
                    }
                    sceneNode = sceneNode.next();
                }

            }
        },

        //
        // SCENES
        //
        /**
         * Add a scene to the game. Automatically makes the scene active. Once added, the game's onSceneAdded method
         * will be called.
         * @param {pc.Scene} scene Scene to add
         */
        addScene:function (scene)
        {
            this.scenes.add(scene);
            this.activeScenes.add(scene);
            this.onSceneAdded(scene);
        },

        /**
         * Called whenever a scene is added to the game. Useful for handling setup or detecting when new scenes are
         * being added.
         * @param {pc.Scene} scene Scene that was added
         */
        onSceneAdded:function (scene)
        {
        },

        /**
         * Removes a scene from the game. Will trigger a notifier call to onSceneRemoved
         * @param {pc.Scene} scene Scene to remove
         */
        removeScene:function (scene)
        {
            this.scenes.remove(scene);
            this.activeScenes.remove(scene);
            this.onSceneRemoved(scene);
        },

        /**
         * Notifier callback when a scene is removed from this game
         * @param {pc.Scene} scene Scene being removed
         */
        onSceneRemoved:function (scene)
        {
        },

        /**
         * Activates a scene (it will be rendered and processed)
         * @param {pc.Scene} scene Scene you want to make active
         */
        activateScene:function (scene)
        {
            if (scene.active) return;

            this.activeScenes.add(scene);
            scene.active = true;
            this.onSceneActivated(scene);
            scene.onActivated();
        },

        /**
         * Called when a scene has been activated.
         * @param {pc.Scene} scene Scene that has been activated.
         */
        onSceneActivated:function (scene)
        {
        },

        /**
         * Deactivate a given scene
         * @param {pc.Scene} scene Scene to deactivate
         */
        deactivateScene:function (scene)
        {
            if (!scene.active) return;

            this.activeScenes.remove(scene);
            scene.active = false;
            this.onSceneDeactivated(scene);
            scene.onDeactivated();
        },

        /**
         * Called when a scene has been deactviated
         * @param {pc.Scene} scene Scene that was deactivated
         */
        onSceneDeactivated:function (scene)
        {
        },

        /**
         * Get the first active scene from the active scenes linked list
         * @return {pc.LinkedNode} Linked list node pointing to the first active scene (use getFirstActiveScene().object())
         * to get the scene.
         */
        getFirstActiveScene:function ()
        {
            return this.activeScenes.first;
        },

        /**
         * Get the first scene from the scene linkedlist
         * @return {pc.LinkedNode} Linked node pointing to the first scene
         */
        getFirstScene:function ()
        {
            return this.scenes.first;
        },

        //
        // lifecycle
        //

        /**
         * Pauses all scenes, which means no drawing or updates will occur. If you wish to pause game play and leave a menu
         * still running, then just pause the scene associated with game play, and not the menu scenes.
         */
        pause:function ()
        {
            this.paused = true;

            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.object().pause();
                nextScene = nextScene.next();
            }
        },

        /**
         * @return {Boolean} True is the game is active (not paused)
         */
        isActive:function ()
        {
            return !this.paused;
        },

        /**
         * Resumes all scenes (after being paused)
         */
        resume:function ()
        {
            this.paused = false;

            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.object().resume();
                nextScene = nextScene.next();
            }
        },

        /**
         * Toggles pause/resume of the game
         */
        togglePauseResume:function ()
        {
            if (pc.system.game.paused)
                pc.system.game.resume();
            else
                pc.system.game.pause();
        },

        /**
         * Resets all scenes back to their starting state (by calling reset() on all scenes), then calling
         * clear() on all scenes, before finally calling the game class onReady
         */
        reset:function ()
        {
            // clear all scenes, layers, entities
            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.obj.reset();
                nextScene = nextScene.next();
            }

            this.scenes.clear();
            this.activeScenes.clear();

            // then restart the game
            this.onReady();
        },

        /**
         * Called by the pc.Device when the game is ready to be started (also called when a reset() is done)
         */
        onReady:function ()
        {
        },

        /**
         * Called when the device canvas changes size (such as when a browser is resized)
         * @param width Width of the canvas
         * @param height Height of the canvas
         */
        onResize:function (width, height)
        {
            var nextScene = this.getFirstActiveScene();
            while (nextScene)
            {
                nextScene.obj.onResize(width, height);
                nextScene = nextScene.next();
            }
        },

        /**
         * Convenience fucntion to grab the size of the associated device screen
         * @return {pc.Rect} Rectangle of the current canvas
         */
        getScreenRect:function ()
        {
            return pc.Rect.create(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
        }


    });



