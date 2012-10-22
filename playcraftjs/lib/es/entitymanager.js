/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityManager
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Manages entities in a layer. This is the primary entity manager for the entity system. It contains, indexes and
 * handles the lifecycle of all entities.
 *
 * Unless you are building your own systems in a complex way, you should be using the pc.EntityLayer to handle
 * general entity management.
 */
pc.EntityManager = pc.Base.extend('pc.EntityManager',
    /** @lends pc.EntityManager */
    {},
    /** @lends pc.EntityManager.prototype */
    {
        /** Index of all entities by tag */
        entitiesByTag: null,
        /** All the components indexed by entityID (as a linked list) */
        componentsByEntity: null,
        /** All the components, indexed by entityId and componentType (catted) */
        componentsByEntityPlusType: null,

        /** Linked list of all entities */
        entities: null,
        /** entities to be removed at the end of processing */
        entitySuicides: null,
        /** the system manager */
        systemManager: null,
        /** the layer this entitymanager is within (set by the layer class) */
        layer: null,

        /**
         * Constructs a new entity manager
         * @param {pc.SystemManager} systemManager The system manager to use
         */
        init: function(systemManager)
        {
            this.systemManager = systemManager;
            this.entitiesByTag = new pc.HashList();
            this.entities = new pc.LinkedList();
            this.componentsByEntity = new pc.Hashmap();
            this.componentsByEntityPlusType = new pc.Hashmap();
            this.entitySuicides = new pc.LinkedList();
        },

        /**
         * Called by the core game loop to give the manager a chance to cleanup
         */
        cleanup: function()
        {
            var entity = this.entitySuicides.first;
            while (entity)
            {
                this._doRemoveEntity(entity.object());
                entity = entity.next();
            }

            this.entitySuicides.clear();
        },

        /**
         * Adds an entity to the manager
         * @param {pc.Entity} entity Entity to add
         * @param {String} [tag] A convenient way to add an entity and tag at the same time
         */
        add: function(entity, tag)
        {
            // add the entity to our big global map
            this.entities.add(entity);
            if (tag != undefined)
                this.entitiesByTag.add(tag, entity);

            // add this entity to the component type indexes
            var componentMap = entity.getAllComponents();
            if (componentMap != null)
            {
                var components = componentMap.values();
                for (var i=0; i < components.length; i++)
                    this._addToComponentMap(entity, components[i]);
            }

            // let the system manager take care of business
            this.systemManager._handleEntityAdded(entity);
        },

        /**
         * Removes an entity from the manager
         * @param {pc.Entity} entity Entity to remove
         */
        remove: function(entity)
        {
            if (!this.entitySuicides.has(entity))
            {
                this.entitySuicides.add(entity);
                entity.active = false;
            }
        },

        /**
         * Removes a component from an entity, and releases it back to the pool
         * @param {pc.Entity} entity Entity to remove the component from
         * @param {pc.components.Component} component Component to remove
         */
        removeComponent: function(entity, component)
        {
            this._removeFromComponentMap(entity, component);
            this.systemManager._handleComponentRemoved(entity, component);
            entity._handleComponentRemoved(component);
            component._entity = null;
        },

        /**
         * Adds a tag to an entity
         * @param {pc.Entity} entity Entity to add the tag to
         * @param {String} tag Tag to assign to the entity
         */
        addTag: function(entity, tag)
        {
            if (entity.tags.indexOf(tag.toLowerCase()) != -1) return;

            this.entitiesByTag.add(tag.toLowerCase(), entity);
            entity.tags.push(tag.toLowerCase());
        },

        /**
         * Removes a tag from an entity
         * @param {pc.Entity} entity Entity to remove the tag from
         * @param {String} tag Tag to remove
         */
        removeTag: function(entity, tag)
        {
            this.entitiesByTag.remove(tag.toLowerCase(), entity);
            entity.tags.remove(tag.toLowerCase());
        },

        /**
         * Gets all the entities that have a given tag
         * @param {String} tag Tag to match
         * @return {pc.LinkedList} List of entities
         */
        getTagged: function(tag)
        {
            return this.entitiesByTag.get(tag.toLowerCase());
        },

        /**
         * Makes an entity active (processed by systems).
         * @param entity {pc.Entity} Entity to make active
         */
        activate: function(entity)
        {
            if (entity.active) return;

            this.systemManager._handleEntityAdded(entity);
            entity.active = true;
        },

        /**
         * Makes an entity inactive (no longer processed)
         * @param {pc.Entity} entity Entity to deactivate
         */
        deactivate: function(entity)
        {
            if (!entity.active) return;

            // remove from the systems - we still keep it in the entitymanager lists, but remove it
            // from the systems so it wont be processed anymore
            this.systemManager._handleEntityRemoved(entity);

            // mark as inactive
            entity.active = false;
        },

        _doRemoveEntity: function(entity)
        {
            this.entities.remove(entity);
            var componentMap = entity.getAllComponents();
            if (componentMap != null)
            {
                var components = componentMap.values();
                for (var i=0; i < components.length; i++)
                    this._removeFromComponentMap(entity, components[i]);
            }

            // remove entities from any tag map it exists in
            for (var t=0; t < entity.tags.length; t++)
                this.entitiesByTag.remove(entity.tags[t], entity);

            this.systemManager._handleEntityRemoved(entity);

            entity.release();
        },

        /**
         * Add a component to an entity
         * @param {pc.Entity} entity Entity to add the component to
         * @param {pc.components.Component} component Component to add
         * @return {pc.components.Component} Component that was added (for convience)
         */
        addComponent: function(entity, component)
        {
            // make sure this entity is in the correct component maps
            this._addToComponentMap(entity, component);
            entity._handleComponentAdded(component);
            this.systemManager._handleComponentAdded(entity, component);
            component._entity = entity;
            return component;
        },

        /**
         * Get a component of a given class from an entity
         * @param {pc.Entity} entity Entity that has the component you're looking for
         * @param {String} componentType Class of component to get (e.g. pc.component.Position)
         */
        getComponent: function(entity, componentType)
        {
            return this.componentsByEntityPlusType.get(entity.objectId + ':' + componentType);
        },

        /**
         * Gets the components in an entity
         * @param {pc.Entity} entity Entity you want the components of
         * @return {pc.Hashtable} Hashtable of components keyed by component type
         */
        getComponents: function(entity)
        {
            return this.componentsByEntity.get(entity.objectId);
        },

        /**
         * Checks if a given entity contains a component of a given type
         * @param {pc.Entity} entity Entity to check
         * @param {String} componentType Type to check for
         */
        hasComponentOfType: function(entity, componentType)
        {
            return this.componentsByEntityPlusType.containsKey(entity.objectId + ':' + componentType);
        },

        //
        // INTERNALS
        //
        _addToComponentMap: function(entity, component)
        {
            // Seeing a getType error here? Likely, you didn't call .create on your component? just maybe? hint hint
            if (this.componentsByEntityPlusType.get(entity.objectId + ':' + component.getType()))
            {
                // multiple components of the same type are not supported due to performance reasons
                throw ('adding component ' + component.getType() +
                    ' to entity ' + entity + ' when it already has one of that type');
            }
            this.componentsByEntityPlusType.put(entity.objectId + ':' + component.getType(), component);
            // seeing a getType error above? -- you forgot to use .create when constructing the component
            this.componentsByEntity.put(entity.objectId, component);
        },

        _removeFromComponentMap: function(entity, component)
        {
            // need to handle removing an entity that has attachments, remove the attached entities as well
            component.onBeforeRemoved();

            this.componentsByEntityPlusType.remove(entity.objectId + ':' + component.getType());
            this.componentsByEntity.remove(entity.objectId);
            component.release();
        }



    });

