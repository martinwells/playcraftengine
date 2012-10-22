/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * An entity layer is a container for <a href='pc.Entity'>entities</a> and systems.
 * See the <a href='../guides/entitysystems'>entity systems</a> guide for more information on how components,
 * entities and systems work together.
 * <p>
 * An entity layer is constructed similarly to a regular layer, except it also has a distinct 'world' size
 * which can be referenced by systems.
 * <pre><code>
 * var entityLayer = new pc.EntityLayer('my entity layer', 10000, 10000);
 * </code></pre>
 * The entity layer will automatically construct both an <a href='pc.EntityManager'>pc.EntityManager</a> and a
 * <a href='pc.SystemManager'>pc.SystemManager</a>.
 * <p>
 * Once you have an entity layer created you will need to add it to the scene:
 * <pre><code>
 * myScene.addLayer(entityLayer);
 * </code></pre>
 * You can then add entities to the layer:
 * <pre><code>
 * // create a new entity (it will automatically be added to the
 * // entity layer specified in the constructor
 * var box = pc.Entity.create(entityLayer);
 * box.addComponent( pc.components.Rect.create({ color:#ffffff }) );
 * </code></pre>
 * Entity layers are driven by systems, which must be added to the layer in order for anything to happen.
 * When you add components to an entity, you must also remember to add the corresponding system to the layer where
 * the entity exists. You can see which systems are required for components in the "used by" list in the component
 * API documentation.
 * <p>
 * To add a system, just construct it and call addSystem:
 * <pre><code>
 * // fire up the systems we need for the game layer
 * entityLayer.addSystem(new pc.systems.Physics());
 * entityLayer.addSystem(new pc.systems.Particles());
 * entityLayer.addSystem(new pc.systems.Effects());
 * entityLayer.addSystem(new pc.systems.Render());
 * </code></pre>
 *
 */
pc.EntityLayer = pc.Layer.extend('pc.EntityLayer',
    /** @lends pc.EntityLayer */
    {
        /**
         * Creates an entity layer from a TMX layer XML data resource
         * @param {String} scene
         * @param {String} groupXML
         * @param {pc.EntityFactory} entityFactory
         */
        loadFromTMX:function (scene, groupXML, entityFactory)
        {
            var layerName = groupXML.getAttribute('name');

            // create the new layer and add it to the scene - when you have the name
            var n = new pc.EntityLayer(layerName);
            scene.addLayer(n);

            // Parse object xml instances and turn them into entities
            // XML = <object type="EnemyShip" x="2080" y="256" width="32" height="32"/>
            var objs = groupXML.getElementsByTagName('object');
            for (var i = 0; i < objs.length; i++)
            {
                var objData = objs[i];
                var entityType = null;
                var x = parseInt(objData.getAttribute('x'));
                var y = parseInt(objData.getAttribute('y'));
                var w = parseInt(objData.getAttribute('width'));
                var h = parseInt(objData.getAttribute('height'));
                var props = objData.getElementsByTagName("properties")[0].getElementsByTagName("property");

                var options = {};
                for (var p = 0; p < props.length; p++)
                {
                    var name = props[p].getAttribute("name");
                    var value = props[p].getAttribute("value");
                    options[name] = value;
                    if (name === 'entity')
                        entityType = value;
                }

                // create a new entity
                // ask the entity factory to create entity of this type and on this layer
                //
                if (entityType)
                    entityFactory.createEntity(n, entityType, x, y, w, h, options);
                else
                    this.warn('Entity loaded from map with no "entity" type property set. x=' + x + ' y=' + y)
            }

        }

    },
    /** @lends pc.EntityLayer.prototype */
    {
        /** Size of the world */
        worldSize:null,

        /** Entity manager for this layer */
        entityManager:null,

        /** System manager for this layer */
        systemManager:null,

        /**
         * @param {String} name Name of the layer
         * @param {Number} worldSizeX X size of the world in pixels
         * @param {Number} worldSizeY Y size of the world in pixels
         * @param {pc.EntityFactory} entityFactory Optional factory class to use to construct entities (primarily
         * used by level loaders to create entities specified in map files.
         */
        init:function (name, worldSizeX, worldSizeY, entityFactory)
        {
            this._super(name);
            this.entityFactory = entityFactory;
            this.systemManager = new pc.SystemManager();
            this.entityManager = new pc.EntityManager(this.systemManager);
            this.entityManager.layer = this;
            this.systemManager.layer = this;

            this.worldSize = pc.Dim.create(pc.checked(worldSizeX, 10000), pc.checked(worldSizeY, 10000));
        },

        /**
         * Sets the origin for the layer
         * @param {Number} x x origin to set
         * @param {Number} y y origin to set
         * @return {Boolean} Whether the origin actually changed (was it already set to the passed in origin)
         */
        setOrigin:function (x, y)
        {
            var didChange = this._super(x, y);
            if (didChange)
                this.systemManager.onOriginChange(x, y);
            return didChange;
        },

        /**
         * Get the entity manager for this layer
         * @return {pc.EntityManager}
         */
        getEntityManager:function ()
        {
            return this.entityManager;
        },

        /**
         * Get the system manager for this layer
         * @return {pc.SystemManager}
         */
        getSystemManager:function ()
        {
            return this.systemManager;
        },

        /**
         * Add a system to the layer
         * @param {pc.systems.System} system The system to add to the layer
         */
        addSystem:function (system)
        {
            this.systemManager.add(system, this.entityManager);
        },

        /**
         * Gets all the systems that can handle a given component type, such as 'physics'
         * @param {String} componentType Type of component to match
         * @return {pc.LinkedList} Linked list of systems that match
         */
        getSystemsByComponentType:function (componentType)
        {
            return this.systemManager.getByComponentType(componentType);
        },

        /**
         * Removes a system from this layer's system manager
         * @param {pc.systems.System} system The system to remove
         */
        removeSystem:function (system)
        {
            this.systemManager.remove(system);
        },

        /**
         * Master process for the layer
         */
        process:function ()
        {
            this._super();
            this.systemManager.processAll();
            this.entityManager.cleanup();
        },

        /**
         * Called automatically when the viewport is changing size.
         * @param {Number} width Width to resize to
         * @param {Number} height Height to resize to
         */
        onResize:function (width, height)
        {
            this.systemManager.onResize(width, height);
        }


    });
