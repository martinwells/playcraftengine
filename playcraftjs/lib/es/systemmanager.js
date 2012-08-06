
pc.SystemManager = pc.Base.extend('pc.SystemManager',
    {},
    {
        systems: null,
        systemsByComponentType: null,
        layer: null,    // set by the layer when it creates the system manager

        init: function()
        {
            this.systems = new pc.LinkedList();
            this.systemsByComponentType = new pc.Hashtable();
        },

        add: function(system)
        {
            system.layer = this.layer;
            system.systemManager = this;

            this.systems.add(system);

            for (var i=0; i < system.componentTypes.length; i++)
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

            system.onAddedToLayer(this.layer);
        },

        remove: function(system)
        {
            system.onRemovedFromLayer(system.layer);
            this.systems.remove(system);

            for (var i=0; i < system.componentTypes; i++)
            {
                var list = this.systemsByComponentType.get(system.componentTypes[i].toLowerCase());
                assert(list != null, "Oops, trying to remove a system and it's not in the by type list");

                system.systemManager = null;
                list.remove(system);
            }
        },

        _handleEntityAdded: function(entity)
        {
            // grab a list of all the component types from the entity
            var componentTypes = entity.getComponentTypes();
            for (var i=0; i < componentTypes.length; i++)
            {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems)
                {
                    var next = systems.first;
                    while(next)
                    {
                        // add will check to make sure this entity isn't in there already
                        next.obj.add(entity);
                        next = next.nextLinked;
                    }
                }
            }
        },

        _handleEntityRemoved: function(entity)
        {
            // grab a list of all the component types from the entity
            var componentMap = entity.getAllComponents();
            if (componentMap == null) return;
            var componentTypes = componentMap.keys();

            for (var i=0; i < componentTypes.length; i++)
            {
                // for every type, grab all the systems that use this type and add this entity
                var systems = this.systemsByComponentType.get(componentTypes[i].toLowerCase());
                if (systems)
                {
                    var next = systems.first;
                    while(next)
                    {
                        // just a plain removal, since this entity is going entirely
                        next.obj.remove(entity);
                        next = next.nextLinked;
                    }
                }
            }
        },

        _handleComponentAdded: function(entity, component)
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
                next = next.nextLinked;
            }
        },

        _handleComponentRemoved: function(entity, component)
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
                next = next.nextLinked;
            }

        },

        processAll: function()
        {
            var next = this.systems.first;
            while(next)
            {
                // get a list of entities with the components that match this one
                next.obj.processAll();
                next = next.nextLinked;
            }
        },

        onResize:function (width, height)
        {
            var next = this.systems.first;
            while(next)
            {
                next.obj.onResize(width, height);
                next = next.nextLinked;
            }
        }



    });