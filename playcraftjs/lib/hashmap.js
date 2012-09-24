/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Hashmap
 * @description
 * [Extends <a href='pc.Layer'>pc.Base</a>]
 * <p>
 * An implementation of a simple hashmap you can use to store key value pairs.
 * <p>
 * <pre><code>
 * // create a hashmap
 * var map = new pc.Hashmap();
 * map.put('key', 'value');
 * map.get('key') === 'value';
 * map.hasKey('key'); // true
 * map.remove('key');
 * </code></pre>
 */

pc.Hashmap = pc.Base.extend('pc.Hashmap',
    {},
    /** @lends pc.Hashmap.prototype */
    {
        /** number of items in the map */
        length: 0,
        /** an object containing all the items as properties */
        items: {},

        /**
         * Put a key, value pair into the map
         * @param {String} key Key to map the value to
         * @param {Object} value The value
         */
        put: function(key, value)
        {
            if (!pc.valid(key)) throw "invaid key";
            this.items[key] = value;
            this.length++;
        },

        /**
         * Get a value using a key
         * @param {String} key The key
         * @return {Object} Value mapped to the key
         */
        get: function(key)
        {
           return this.items[key];
        },

        /**
         * Indicates whether a key exists in the map
         * @param {String} key The key
         * @return {Boolean} True if the key exists in the map
         */
        hasKey: function(key)
        {
            return this.items.hasOwnProperty(key);
        },

        /**
         * Remove an element from the map using the supplied key
         * @param {String} key Key of the item to remove
         */
        remove: function(key)
        {
            if (this.hasKey(key))
            {
                this.length--;
                delete this.items[key];
            }
        },

        /**
         * @return {Array} Returns an array of all the keys in the map
         */
        keys: function()
        {
            var keys = [];
            for (var k in this.items)
                keys.push(k);
            return keys;
        },

        /**
         * @return {Array} Returns an array of all the values in the map
         */
        values: function()
        {
            var values = [];
            for (var k in this.items)
                values.push(this.items[k]);
            return values;
        },

        /**
         * Removes all items in the map
         */
        clear: function()
        {
            this.items = {};
            this.length = 0;
        }
    });
