/**
 * PlayCraft Engine
 * Tools: A placeholder for useful tools
 * @class
 */

pc.Tools = pc.Base.extend('pc.Tools',
    {
        /**
         * Checks if a param is valid (null or undefined) in which case the default value will be returned
         * @param p Parameter to check
         * @param def Default value to return if p is either null or undefined
         * @return p if valid, otherwise def (default)
         */
        checked: function(p, def)
        {
            if (!pc.valid(p))
                return def;
            return p;
        },

        /**
         * Check if a value is valid (not null or undefined)
         * @param p A value
         * @return {Boolean} true if the value is not undefined and not null
         */
        isValid: function(p)
        {
            return !(p == null || typeof p === 'undefined');
        },

        assert: function(test, error)
        {
            if (!test) throw error;
        },

        arrayRemove:function (array, e)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (array[i] == e)
                    array.splice(i, 1);
            }
        },

        /**
         * adds an element to an array, but only if it isn't already there
         * @param array the array to add to
         * @param e the element to add
         */
        arrayExclusiveAdd:function (array, e)
        {
            if (array.indexOf(e) == -1)
                array.push(e);
        }



    },

    {
        // Static class, so nothing required here
    });


pc.tools = new pc.Tools();

// quick short cuts for common tools
pc.valid = pc.Tools.isValid;
pc.checked = pc.Tools.checked;
pc.assert = pc.Tools.assert;
