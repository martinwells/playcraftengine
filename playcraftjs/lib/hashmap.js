
pc.Hashmap = pc.Base.extend('pc.Hashmap',
    {},
    {
        length: 0,
        items: {},

        put: function(key, value)
        {
            if (!pc.valid(key)) throw "invaid key";
            this.items[key] = value;
            this.length++;
        },

        get: function(key)
        {
           return this.items[key];
        },

        hasKey: function(key)
        {
            return this.items.hasOwnProperty(key);
        },
   
        remove: function(key)
        {
            if (this.hasKey(key))
            {
                this.length--;
                delete this.items[key];
            }
        },

        keys: function()
        {
            var keys = [];
            for (var k in this.items)
                keys.push(k);
            return keys;
        },

        values: function()
        {
            var values = [];
            for (var k in this.items)
                values.push(this.items[k]);
            return values;
        },

        clear: function()
        {
            // todo: creating a new object on clear -- slow?
            this.items = {};
            this.length = 0;
        }
    });
