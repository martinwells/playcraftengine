/**
 * A system that processes entities. update and draw methods will be called matching the entities
 * that contain the componentTypes specified in the constructor.
 */

pc.EntitySystem = pc.System.extend('pc.EntitySystem',
    {},
    {
        componentTypes: null,
        entities: null, // list of entities that are to be process by this system
        suicides: null, // holding place for entities that are to be removed at the end of each cycle

        /**
         * Constructor for a system
         * @param componentTypes An array of component types this system is interested in. Any entity with
         * a component matching this type will be sent to this system for processing
         */
        init: function(componentTypes)
        {
            this._super(componentTypes);
            this.entities = new pc.LinkedList();
            this.suicides = new pc.LinkedList();
        },

        /**
         * Adds an entity to this system, but only if the entity has a component type matching one of the types
         * used by this system (this.componentTypes)
         * @param entity
         */
        addIfMatched: function(entity)
        {
            // checks the entity to see if it should be added to this system
            for (var i=0; i < this.componentTypes.length; i++)
                if (entity.hasComponentOfType(this.componentTypes[i]))
                {
                    this.entities.add(entity);
                    this.onEntityAdded(entity);
                    return; // we only need to add an entity once
                }
        },

        add: function(entity)
        {
            if (this.entities.has(entity)) return; // already in the list
            this.entities.add(entity);
            this.onEntityAdded(entity);
        },

        /**
         * Removes an entity from this system -- ignored if the entity isn't there
         * @param entity
         */
        remove: function(entity)
        {
            if (this.entities.remove(entity)) // return true if one was removed
                this.onEntityRemoved(entity);
        },

        /**
         * Removes an entity from this system, but checks to see if it still matches first (has a component of
         * the correct type). This is called by the entity manager when a component is removed
         * @param entity
         */
        removeIfNotMatched: function(entity)
        {
            // checks the entity to see if it should be added to this system
            for (var i=0; i < this.componentTypes.length; i++)
            {
                if (entity.hasComponentOfType(this.componentTypes[i]))
                    return; // still matches, abort removing
            }

            // we got to here, so nothing matched, ok to remove the entity
            this.remove(entity);
        },

        processAll: function(elapsed)
        {
            var next = this.entities.first;
            while (next)
            {
                if (next.obj.active)
                    this.process(next.obj);
                next = next.nextLinked;
            }

            // clear suicides
            // todo: is this needed?
            next = this.suicides.first;
            while (next)
            {
                this.remove(next.obj);
                next = next.nextLinked;
            }
            this.suicides.clear();

        },

        /**
         * Override this in your system to handle updating of matching entities
         * @param entity Entity to update
         */
        process: function(entity) {},

        suicide: function(entity)
        {
            this.suicides.add(entity);

        },

        /**
         * Called when an entity has been added to this system
         * @param entity
         */
        onEntityAdded: function(entity) {},

        /**
         * Called when an entity has been removed from this system
         * @param entity
         */
        onEntityRemoved: function(entity) {},

        /**
         * Called when a component is added to an entity
         * @param entity
         * @param component
         */
        onComponentAdded: function(entity, component) {},

        /**
         * Called when a component is removed from an entity
         * @param entity
         * @param component
         */
        onComponentRemoved: function(entity, component) {}

    });

