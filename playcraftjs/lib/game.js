/**
 * Playcraft Engine -- the game template. Derive and add what you need
 */


pc.Game = pc.Base.extend('pc.Game', {},
{
    systemManager: null,
    entityManager: null,
    scenes: null,
    activeScenes: null,
    paused: false,

    init: function(canvasId, fps)
    {
        this._super();

        this.systemManager = new pc.SystemManager(this);
        this.entityManager = new pc.EntityManager(this, this.systemManager);

        this.scenes = new pc.LinkedList();
        this.activeScenes = new pc.LinkedList();
    },

    process: function()
    {
        if (this.paused) return;
        var nextScene = this.getFirstActiveScene();
        while (nextScene)
        {
            nextScene.obj.process();
            nextScene = nextScene.nextLinked;
        }

        return true; // return false to quit the update loop
    },

    //
    // SCENES
    //
    addScene: function(scene)
    {
        this.scenes.add(scene);
        this.activeScenes.add(scene);
        this.onSceneAdded(scene);
    },

    onSceneAdded: function(scene)
    {},

    removeScene: function(scene)
    {
        this.scenes.remove(scene);
        this.activeScenes.remove(scene);
        this.onSceneRemoved(scene);
    },

    onSceneRemoved: function(scene)
    {},

    activateScene: function(scene)
    {
        if (scene.active) return;

        this.activeScenes.add(scene);
        scene.active = true;
        this.onSceneActivated(scene);
        scene.onActivated();
    },

    onSceneActivated: function(scene)
    {},

    deactivateScene: function(scene)
    {
        if (!scene.active) return;

        this.activeScenes.remove(scene);
        scene.active = false;
        this.onSceneDeactivated(scene);
        scene.onDeactivated();
    },

    onSceneDeactivated: function(scene)
    {},

    getFirstActiveScene: function()
    {
        return this.activeScenes.first;
    },

    getFirstScene: function()
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
    pause: function()
    {
        this.paused = true;

        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.pause();
            nextScene = nextScene.nextLinked;
        }
    },

    isActive: function()
    {
        return true;//!this.paused;
    },

    /**
     * Resumes all scenes (hopefully after being paused)
     */
    resume: function()
    {
        this.paused = false;

        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.resume();
            nextScene = nextScene.nextLinked;
        }
    },

    togglePauseResume: function()
    {
        if (pc.system.game.paused)
            pc.system.game.resume();
        else
            pc.system.game.pause();
    },

    reset: function()
    {
        // clear all scenes, layers, entities
        var nextScene = this.getFirstScene();
        while (nextScene)
        {
            nextScene.obj.reset();
            nextScene = nextScene.nextLinked;
        }

        this.scenes.clear();
        this.activeScenes.clear();

        // then restart the game
        this.onReady();
    },

    onReady: function()
    {
    },

    onResize: function(width, height)
    {
        var nextScene = this.getFirstActiveScene();
        while (nextScene)
        {
            nextScene.obj.onResize(width, height);
            nextScene = nextScene.nextLinked;
        }
    },

    getScreenRect: function()
    {
        return pc.Rect.create(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
    }


});



