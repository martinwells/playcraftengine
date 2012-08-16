/**
 * Playcraft Engine. (C)2012 Playcraft Labs, Inc.
 */

/**
 * @class pc.EntityManager
 * Contains and manages all entities in a game
 */

pc.EntityManager = pc.Base.extend('pc.EntityManager',
    {},
    {
        entitiesByTag: null,                // arbitrary tagging of entities
        componentsByEntity: null,           // all the components indexed by entityID (as a linked list)
        componentsByEntityPlusType: null,   // all the components, indexed by entityId and componentType (catted)

        entities: null,                     // all the entities (todo: is this still required?)
        entitySuicides: null,               // entities to be removed at the end of processing
        systemManager: null,
        layer: null,                        // the layer this entitymanager is within (set by the layer)

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

        remove: function(entity)
        {
            if (!this.entitySuicides.has(entity))
            {
                this.entitySuicides.add(entity);
                entity.active = false;
            }
        },

        removeComponent: function(entity, component)
        {
            this._removeFromComponentMap(entity, component);
            this.systemManager._handleComponentRemoved(entity, component);
            entity._handleComponentRemoved(component);
        },

        addTag: function(entity, tag)
        {
            this.entitiesByTag.add(tag, entity);
            entity.tags.push(tag);
        },

        removeTag: function(entity, tag)
        {
            this.entitiesByTag.remove(tag, entity);
            entity.tags.remove(tag);
        },

        getTagged: function(tag)
        {
            return this.entitiesByTag.get(tag);
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

        deactivate: function(entity)
        {
            if (!entity.active) return;

            // remove from the systems - we still keep it in the entitymanager lists, but remove it
            // from the systems so it wont be processed anymore
            this.systemManager._handleEntityRemoved(entity);

            // mark as inactive
            entity.active = false;
        },

        /**
         * @param tag Entity tag, such as 'enemies', or 'powerups'
         * @return {pc.LinkedList} List of all the entities that have this tag string
         */
        getEntitiesWithTag: function(tag)
        {
            return this.entitiesByTag.get(tag);
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

        addComponent: function(entity, component)
        {
            // make sure this entity is in the correct component maps
            this._addToComponentMap(entity, component);
            entity._handleComponentAdded(component);
            this.systemManager._handleComponentAdded(entity, component);
            return component;
        },

        /**
         * Get a component of a given class from an entity
         * @param entity Entity that has the component you're looking for
         * @param componentType Class of component to get (e.g. pc.component.Position)
         */
        getComponent: function(entity, componentType)
        {
            return this.componentsByEntityPlusType.get(entity.objectId + ':' + componentType);
        },

        /**
         * Gets the components in an entity
         * @param entity Entity you want the components of
         * @return {pc.Hashtable} a hashtable of components keyed by component type
         */
        getComponents: function(entity)
        {
            return this.componentsByEntity.get(entity.objectId);
        },

        /**
         * Checks if a given entity contains a component of a given type
         * @param entity
         * @param componentType
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

