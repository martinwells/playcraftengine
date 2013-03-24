/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.components = {};

/**
 * @class pc.components.Component
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * The base class for components you want to create.
 */
pc.components.Component = pc.Pooled.extend('pc.components.Component',
    /** @lends pc.components.Component */
    {
        /**
         * Constructor that acquires the component from an object pool.
         * @return {pc.components.Component} A component object
         */
        create:function ()
        {
          var c = this._super();
          c.active = true;
          return  c;
        }
    },
    /** @lends pc.components.Component.prototype */
    {
        /** entity I am on, or null if I'm not on an entity */
        _entity: null,

        _type:null,

        /** whether the component is currently active */
        active: true,

        /**
         * Constructs a new component using the given type string
         * @param {String} type The type to assign the component
         */
        init:function (type)
        {
            this._super();
            this._type = type;
            this.active = true;
        },

        /**
         * Get the component type
         * @return {String} The type
         */
        getType:function ()
        {
            return this._type.toLowerCase();
        },

        /**
         * Get the entity this component is currently in; null if not in an entity
         * @return {pc.Entity} Entity
         */
        getEntity: function()
        {
            return this._entity;
        },

        /**
         * Called when the system is about to remove this component, which gives you a chance
         * to override and do something about it
         */
        onBeforeRemoved:function ()
        {
        }


    });

