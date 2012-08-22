/**
 * Playcraft Engine - (c) 2012 Playcraft Labs, Inc.
 */

pc.Entity = pc.Pooled.extend('pc.Entity',
    {
        create: function(layer)
        {
            var n = this._super();
            n.config(layer);
            return n;
        }
    },
    {
        layer: null,            // the game layer this entity is in -- used to reference the correct entitymanager
        tags: [],               // readonly: tags assigned to this entity
        active: true,           // readonly: controlled by entity manager
        _componentCache: null,  // cache of components for entity -- not to be used for anything but speed reading

        init: function(layer)
        {
            this._super();
            this._componentCache = new pc.Hashmap();
            if (pc.valid(layer))
                this.config(layer);
        },

        config: function(layer)
        {
            this.layer = layer;
            this.active = true;
            layer.entityManager.add(this);
        },

        release: function()
        {
            this.tags.length = 0;
            this.active = false;
            this._componentCache.clear();
            this._super();
        },

        //
        // Convenience functions so you can operate on entities using a more direction API
        // Nothing really happens here though, it's all about the entity manager and systems
        //

        /**
         * @see pc.EntityManager.addTag
         */
        addTag: function(tag)
        {
            this.layer.entityManager.addTag(this, tag);
        },

        /**
         * Tests if this entity has a given tag
         * @param tag The tag to look for
         * @return {Boolean} true if the tag exists on this entity
         */
        hasTag: function(tag)
        {
            for (var i=0; i < this.tags.length; i++)
                if (this.tags[i].toLowerCase() === tag.toLowerCase()) return true;
            return false;
        },

        removeTag: function(tag)
        {
            this.layer.entityManager.removeTag(this, tag);
        },

        addComponent: function(component)
        {
            return this.layer.entityManager.addComponent(this, component);
        },

        removeComponent: function(component)
        {
            this.layer.entityManager.removeComponent(this, component);
        },

        removeComponentByType: function(componentType)
        {
            this.removeComponent(this._componentCache.get(componentType));
        },

        getComponent: function(componentType)
        {
            return this._componentCache.get(componentType);
        },

        /**
         * Get the components in this entity
         * @return {pc.Hashtable} A hashtable of component objects keyed by component type
         */
        getAllComponents: function()
        {
            return this._componentCache;
            //return this.layer.entityManager.getComponents(this);
        },

        getComponentTypes: function()
        {
            // todo: could optimize this if required by caching the types as well (instead of generating
            // an array on every check
            return this._componentCache.keys();
        },

        hasComponentOfType: function(componentType)
        {
            return this._componentCache.hasKey(componentType);
            //return this.layer.entityManager.hasComponentOfType(this, componentType);
        },

        remove: function()
        {
            this.layer.entityManager.remove(this);
        },

        // INTERNALS
        _handleComponentRemoved: function(component)
        {
            this._componentCache.remove(component.getType());
        },

        _handleComponentAdded: function(component)
        {
            this._componentCache.put(component.getType(), component);
        }



    });


/**
 * EntityFactory -- for creating entities (mostly just an interface class
 * you extend from to create an entity factory
 */
pc.EntityFactory = pc.Base.extend('pc.EntityFactory',
    { },
    {
        createEntity:function (layer, type, x, y, w, h, options)
        { }
    });
