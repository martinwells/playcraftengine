/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.SystemManager
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Manages systems that are within a layer.
 *
 * Unless you are building your own systems in a complex way, you should be using the pc.EntityLayer to handle
 * general system management.
 */
pc.SystemManager = pc.Base.extend('pc.SystemManager',
    /** @lends pc.SystemManager */
    {},
    /** @lends pc.SystemManager.prototype */
    {
        /** pc.LinkedList of systems */
        systems:null,
        /** Index of the systems by component type */
        systemsByComponentType:null,
        /** layer the system is on -- set by the system */
        layer:null,

        /**
         * Constructs a system manager.
         */
        init:function ()
        {
            this.systems = new pc.LinkedList();
            this.systemsByComponentType = new pc.Hashtable();
        },

        /**
         * Adds a system to the system manager
         * @param {pc.systems.System} system System to add
         * @param {pc.EntityManager} entityManager Entity manager the system is on
         */
        add:function (system, entityManager)
        {
            system.layer = this.layer;
            system.systemManager = this;

            this.systems.add(system);

            if (!pc.valid(system.componentTypes))
                throw 'Invalid component types: it can be empty, but not undefined. Did you forget to ' +
                    'add an init method to your system and/or not call this._super(componentTypes)';

            for (var i = 0; i < system.componentTypes.length; i++)
            {
                var ctype = system.componentTypes[i].toLowerCase();

                var list = this.systemsByComponentType.get(ctype);
                if (list == null)
                {
                    // create a new linked list for systems matching this component type
                    list = new pc.LinkedList();
                    this.systemsByComponentType.put(ctype, list);
                }

                // add this system to the component type map, but only if it hasn't been added already
                if (!list.has(system))
                    list.add(system);
            }

            // add all the entities to this system
            var entity = entityManager.entities.first;
            while (entity)
            {
                this._handleEntityAdded(entity.object());
                entity = entity.next();
            }

            system.onAddedToLayer(this.layer);
        },

        /**
         * Removes a system from the system manager
         * @param {pc.systems.System} system System to remove
         */
        remove:function (system)
        {
            system.onRemovedFromLayer(system.layer);
            this.systems.remove(system);

            for (var i = 0; i < system.componentTypes; i++)
            {
                var list = this.systemsByComponentType.get(system.componentTypes[i].toLowerCase());
                assert(list != null, "Oops, trying to remove a system and it's not in the by type list");

                system.systemManager = null;
                list.remove(system);
            }
        },

        /**
         * Gets systems based on a component type
         * @param {String} componentType Component type
         * @return {pc.LinkedList} A linked list of the systems that have the given component type
         */
        getByComponentType:function (componentType)
        {
            return this.systemsByComponentType.get(componentType);
        },

        /**
         * Called when the origin of the layer changes
         * @param {Number} x x-position of the origin
         * @param {Number} y y-position of the origin
         */
        onOriginChange:function (x, y)
        {
            var system = this.systems.first;
            while (system)
            {
                system.object().onOriginChange(x, y);
                system = system.next();
            }
        },

        _handleEntityAdded:function (entity)
        {
            // grab a list of all the component types from the entity
            var componentTypes = entity.getComponentTypes();
            for (var i = 0; i < componentTypes.length; i++)
            {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems)
                {
                    var next = systems.first;
                    while (next)
                    {
                        // add will check to make sure this entity isn't in there already
                        next.obj.add(entity);
                        next = next.next();
                    }
                }
            }
        },

        _handleEntityRemoved:function (entity)
        {
            // grab a list of all the component types from the entity
            var componentMap = entity.getAllComponents();
            if (componentMap == null) return;
            var componentTypes = componentMap.keys();

            for (var i = 0; i < componentTypes.length; i++)
            {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems)
                {
                    var next = systems.first;
                    while (next)
                    {
                        // just a plain removal, since this entity is going entirely
                        next.obj.remove(entity);
                        next = next.next();
                    }
                }
            }
        },

        _handleComponentAdded:function (entity, component)
        {
            // get a list of all the systems that are processing components of this type
            // then ask that system to add this entity, if it's not already there
            var list = this.systemsByComponentType.get(component.getType());
            if (list == null)
            {
                // this.warn('Entity (' + entity.toString() + ' added component ' + component + ' but no system is ' +
                //    ' handling components of type: ' + component.getType() +'. Did you forget to add a system' +
                //    ' to the system manager (and was it added to the same layer as this entity)?');
                return;
            }

            // todo: the systemsByComponentType map doesn't work well if systems support
            // multiple components; need to take a fresh look at that if multiple component types
            // support is added to systems (probably change the systemsByComponentType map support combinations
            // of components as a compound key (which map to a set of matching systems with no duplicates
            var next = list.first;
            while (next)
            {
                next.obj.add(entity);
                next.obj.onComponentAdded(entity, component);
                next = next.next();
            }
        },

        _handleComponentRemoved:function (entity, component)
        {
            // get a list of all the systems that are processing components of a given type
            var list = this.systemsByComponentType.get(component.getType());
            if (list == null) return;

            var next = list.first;
            while (next)
            {
                // then ask that system to remove this entity, but be careful that it no longer matches
                // another type might still apply to a given system
                next.obj.removeIfNotMatched(entity);
                next.obj.onComponentRemoved(entity, component);
                next = next.next();
            }

        },

        /**
         * Process all the systems
         */
        processAll:function ()
        {
            var next = this.systems.first;
            while (next)
            {
                if (next.obj.delay == 0 || (pc.device.now - next.obj._lastRun > next.obj.delay))
                {
                    next.obj.processAll();
                    if (next.obj.delay != 0)
                        next.obj._lastRun = pc.device.now;
                }
                next = next.next();
            }
        },

        /**
         * Called when the layer resizes
         * @param {Number} width Width of the layer
         * @param {Number} height Height of the layer
         */
        onResize:function (width, height)
        {
            var next = this.systems.first;
            while (next)
            {
                next.obj.onResize(width, height);
                next = next.next();
            }
        }



    });