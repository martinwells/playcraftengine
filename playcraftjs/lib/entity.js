/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Entity
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Entities are the primary 'things' that are in a game. They serve as the primary container for components.
 * <p>
 * To add an entity to a game you must place it within an <a href='pc.EntityLayer'>entity layer</a>.
 * <p>
 * <pre><code>
 * var entityLayer = new pc.EntityLayer('my entity layer', 10000, 10000);
 * </code></pre>
 * <p>
 * You can then construct an entity by allocating it from the entity pool, and assigning it to the layer:
 * <pre><code>
 * var newEntity = pc.Entity.create(entityLayer);
 * </code></pre>
 * <h5>Components</h5>
 * To add functionality to the entity, you need to add components. Components are discreet bits of functionality
 * you can use across many entities. A spaceship for example, might have a sprite component for the artwork, a spatial
 * component (where it is in the world), an input handling component and a physics component. All of these components
 * combine together let you create an awesome flying menace.
 * <p>
 * For example, to create a simple entity that consists of a red box, we add two components, one for the spatial (its
 * position and dimensions), and one to indicate we want to draw a rectangle.
 * <pre><code>
 * // add a spatial component
 * box.addComponent( pc.components.Spatial.create({ x:100, y: 100, w:50, h:50 }) );
 *
 * // add a red rectangle
 * box.addComponent( pc.components.Rect.create({ color:'#ff2222' }) );
 * </code></pre>
 * <h5>Tagging</h5>
 * Entities can be tagged and searched for. You can add multiple tags to a single entity to categorize it in different
 * ways. Tags are the primary way you should 'type' an entity - as opposed to using a class hierarchy.
 * <p>
 * To add a tag an entity use:
 * <pre><code>
 * entity.addTag('enemy');
 * entity.addTag('monster');
 * </code></pre>
 * You can then grab all entities in a layer that have a tag:
 * <pre><code>
 * entityLayer.entityManager.getTagged('enemy'); // return a pc.LinkedList
 * </code></pre>
 * You can remove a tag:
 * <pre><code>
 * entity.removeTag('monster');
 * </code></pre>
 * And quickly test if an entity has a tag:
 * <pre><code>
 * entity.hasTag('enemy') == true;
 * </code></pre>
 * And finally, you can inspect all the tags an entity has by looking at the tags member:
 * <pre><code>
 * entity.tags[0] === 'enemy';
 * </code></pre>
 */

pc.Entity = pc.Pooled.extend('pc.Entity',
    /** @lends pc.Entity */
    {
        /**
         * Constructs an entity by acquiring it from the object pool
         * @param {pc.Layer} layer Layer the entity should be added to
         * @return {pc.Entity} A pc.Entity
         */
        create: function(layer)
        {
            var n = this._super();
            pc.assert(layer, 'Entity requires a valid layer to be placed on');
            n.config(layer);
            return n;
        }
    },
    /** @lends pc.Entity.prototype */
    {
        /** layer this entity is on */
        layer: null,
        /** array of strings representing the tags this entity has (read-only) */
        tags: [],
        /** whether this entity is presently active (read-only) */
        active: true,

        _componentCache: null,  // cache of components for entity -- not to be used for anything but speed reading

        /**
         * Constructs a new entity by acquiring it from the object pool
         * @param {pc.Layer} layer Layer the entity should be added to
         */
        init: function(layer)
        {
            this._super();
            this._componentCache = new pc.Hashmap();
            if (pc.valid(layer))
                this.config(layer);
        },

        /**
         * Configures an entity with the given layer (typically this is called by create or init and does not
         * need to be called directly.
         * @param {pc.EntityLayer} layer Layer to add the entity too
         */
        config: function(layer)
        {
            this.layer = layer;
            this.active = true;
            layer.entityManager.add(this);
        },

        /**
         * Releases the entity back into the object pool. Should not be used directly unless you know what you're
         * doing. Use entity.remove for most sitations.
         */
        release: function()
        {
            this.tags.length = 0;
            this.active = false;
            this._componentCache.clear();
            this._super();
        },

        /**
         * Add a tag to the entity - actually just a pass through function to entity.layer.entityManager.addTag
         * @param {String} tag Tag to add to the entity.
         */
        addTag: function(tag)
        {
            this.layer.entityManager.addTag(this, tag);
        },

        /**
         * Tests if this entity has a given tag
         * @param {String} tag The tag to look for
         * @return {Boolean} true if the tag exists on this entity
         */
        hasTag: function(tag)
        {
            for (var i=0; i < this.tags.length; i++)
                if (this.tags[i].toLowerCase() === tag.toLowerCase()) return true;
            return false;
        },

        /**
         * Removes a tag from an entity
         * @param {String} tag Tag to remove
         */
        removeTag: function(tag)
        {
            this.layer.entityManager.removeTag(this, tag);
        },

        /**
         * Add a component to this entity
         * @param {pc.components.Component} component Component to add
         * @return {pc.components.Component} Component that was added
         */
        addComponent: function(component)
        {
            return this.layer.entityManager.addComponent(this, component);
        },

        /**
         * Remove a component from the entity
         * @param {pc.components.Component} component Component to remove
         */
        removeComponent: function(component)
        {
            this.layer.entityManager.removeComponent(this, component);
        },

        /**
         * Remove the component of a given type
         * @param {String} componentType Component type to remove (e.g. 'physics')
         */
        removeComponentByType: function(componentType)
        {
            this.removeComponent(this._componentCache.get(componentType));
        },

        /**
         * Retrieves a reference to a component on the entity using a given type
         * @param {String} componentType Type string of the component to get
         * @return {pc.components.Component} The component matching the type
         */
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
            // use internal cache for speed
            return this._componentCache;
            //return this.layer.entityManager.getComponents(this);
        },

        /**
         * Get an array containing strings of all the types of components on this entity
         * @return {Array} Array of strings with all the component types
         */
        getComponentTypes: function()
        {
            // todo: could optimize this if required by caching the types as well (instead of generating
            // an array on every check. Don't think it's used very often though.
            return this._componentCache.keys();
        },

        /**
         * Check whether the entity has a component of a given type
         * @param {String} componentType Component type to check for
         * @return {Boolean} true if a component with the given type is on the entity
         */
        hasComponentOfType: function(componentType)
        {
            return this._componentCache.hasKey(componentType);
            //return this.layer.entityManager.hasComponentOfType(this, componentType);
        },

        /**
         * Remove this entity from the layer
         */
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
