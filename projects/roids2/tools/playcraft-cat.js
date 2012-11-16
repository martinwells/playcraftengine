/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * Special include file added to the playcraft library when it's been built and packed. This file is not included
 * when the developer loader is used to run the game.
 */

if (!window.pc)
    window.pc = {};

pc.packed = true;
/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 */

window.gamecore =
{
    hasOwn:Object.prototype.hasOwnProperty,

    isFunction:function (obj)
    {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },

    isWindow:function (obj)
    {
        return !!(obj && obj.setInterval);
    },

    isArray:Array.isArray || function (obj)
    {
        return (obj.constructor === Array);
    },

    isString:function (obj)
    {
        return (typeof obj == 'string');
    },

    isObject:function (obj)
    {
        return obj === Object(obj);
    },

    isPlainObject:function (obj)
    {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || this.isObject(obj) || obj.nodeType || this.isWindow(obj))
            return false;

        try
        {
            // Not own constructor property must be Object
            if (obj.constructor && !this.hasOwn.call(obj, "constructor") && !this.hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
                return false;

        } catch (e)
        {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // own properties are enumerated firstly, so to speed up, if last one is own, then all properties are own.
        var key;
        for (key in obj)
        {
        }

        return key === undefined || this.hasOwn.call(obj, key);
    },

    extend:function ()
    {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean")
        {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !gamecore.isFunction(target))
            target = {};

        // extend jQuery itself if only one argument is passed
        if (length === i)
        {
            target = this;
            --i;
        }

        for (; i < length; i++)
        {
            // Only deal with non-null/undefined values
            if ((options = arguments[ i ]) != null)
            {
                // Extend the base object
                for (name in options)
                {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if (target === copy)
                    {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && ( this.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ))
                    {
                        if (copyIsArray)
                        {
                            copyIsArray = false;
                            clone = src && this.isArray(src) ? src : [];

                        } else
                        {
                            clone = src && this.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = this.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined)
                    {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

};


gamecore.push = Array.prototype.push;

gamecore.merge = function (first, second)
{
    var i = first.length, j = 0;

    if (typeof second.length === "number")
    {
        for (var l = second.length; j < l; j++)
            first[ i++ ] = second[ j ];
    } else
    {
        while (second[j] !== undefined)
            first[ i++ ] = second[ j++ ];
    }
    first.length = i;
    return first;
};

gamecore.makeArray = function (array, results)
{
    var ret = results || [];

    if (array != null)
    {
        // The window, strings (and functions) also have 'length'
        // Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
        if (array.length == null || gamecore.isString(array) || gamecore.isFunction(array) || gamecore.isWindow(array))
            gamecore.push.call(ret, array);
        else
            gamecore.merge(ret, array);
    }

    return ret;
};


gamecore.each = function (object, callback, args)
{
    var name, i = 0,
        length = object.length,
        isObj = length === undefined || gamecore.isFunction(object);

    if (args)
    {
        if (isObj)
        {
            for (name in object)
            {
                if (callback.apply(object[ name ], args) === false)
                {
                    break;
                }
            }
        } else
        {
            for (; i < length;)
            {
                if (callback.apply(object[ i++ ], args) === false)
                {
                    break;
                }
            }
        }

        // A special, fast, case for the most common use of each
    } else
    {
        if (isObj)
        {
            for (name in object)
            {
                if (callback.call(object[ name ], name, object[ name ]) === false)
                {
                    break;
                }
            }
        } else
        {
            for (; i < length;)
            {
                if (callback.call(object[ i ], i, object[ i++ ]) === false)
                {
                    break;
                }
            }
        }
    }

    return object;
};


gamecore._flagsCache = {};

gamecore.createFlags = function (flags)
{
    var object = gamecore._flagsCache[ flags ] = {}, i, length;
    flags = flags.split(/\s+/);
    for (i = 0, length = flags.length; i < length; i++)
        object[ flags[i] ] = true;
    return object;
};

gamecore.Callbacks = function (flags)
{
    // Convert flags from String-formatted to Object-formatted
    // (we check in cache first)
    flags = flags ? ( gamecore._flagsCache[ flags ] || gamecore.createFlags(flags) ) : {};

    var // Actual callback list
        list = [],
    // Stack of fire calls for repeatable lists
        stack = [],
    // Last fire value (for non-forgettable lists)
        memory,
    // Flag to know if list is currently firing
        firing,
    // First callback to fire (used internally by add and fireWith)
        firingStart,
    // End of the loop when firing
        firingLength,
    // Index of currently firing callback (modified by remove if needed)
        firingIndex,
    // Add one or several callbacks to the list
        add = function (args)
        {
            var i, length, elem, actual;

            for (i = 0, length = args.length; i < length; i++)
            {
                elem = args[ i ];
                if (gamecore.isArray(elem))
                {
                    // Inspect recursively
                    add(elem);
                } else if (gamecore.isFunction(elem))
                {
                    // Add if not in unique mode and callback is not in
                    if (!flags.unique || !self.has(elem))
                    {
                        list.push(elem);
                    }
                }
            }
        },
    // Fire callbacks
        fire = function (context, args)
        {
            args = args || [];
            memory = !flags.memory || [ context, args ];
            firing = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            for (; list && firingIndex < firingLength; firingIndex++)
            {
                if (list[ firingIndex ].apply(context, args) === false && flags.stopOnFalse)
                {
                    memory = true; // Mark as halted
                    break;
                }
            }
            firing = false;
            if (list)
            {
                if (!flags.once)
                {
                    if (stack && stack.length)
                    {
                        memory = stack.shift();
                        self.fireWith(memory[ 0 ], memory[ 1 ]);
                    }
                } else if (memory === true)
                {
                    self.disable();
                } else
                {
                    list = [];
                }
            }
        },
    // Actual Callbacks object
        self = {
            // Add a callback or a collection of callbacks to the list
            add:function ()
            {
                if (list)
                {
                    var length = list.length;
                    add(arguments);
                    // Do we need to add the callbacks to the
                    // current firing batch?
                    if (firing)
                    {
                        firingLength = list.length;
                        // With memory, if we're not firing then
                        // we should call right away, unless previous
                        // firing was halted (stopOnFalse)
                    } else if (memory && memory !== true)
                    {
                        firingStart = length;
                        fire(memory[ 0 ], memory[ 1 ]);
                    }
                }
                return this;
            },
            // Remove a callback from the list
            remove:function ()
            {
                if (list)
                {
                    var args = arguments,
                        argIndex = 0,
                        argLength = args.length;
                    for (; argIndex < argLength; argIndex++)
                    {
                        for (var i = 0; i < list.length; i++)
                        {
                            if (args[ argIndex ] === list[ i ])
                            {
                                // Handle firingIndex and firingLength
                                if (firing)
                                {
                                    if (i <= firingLength)
                                    {
                                        firingLength--;
                                        if (i <= firingIndex)
                                        {
                                            firingIndex--;
                                        }
                                    }
                                }
                                // Remove the element
                                list.splice(i--, 1);
                                // If we have some unicity property then
                                // we only need to do this once
                                if (flags.unique)
                                {
                                    break;
                                }
                            }
                        }
                    }
                }
                return this;
            },
            // Control if a given callback is in the list
            has:function (fn)
            {
                if (list)
                {
                    var i = 0,
                        length = list.length;
                    for (; i < length; i++)
                    {
                        if (fn === list[ i ])
                        {
                            return true;
                        }
                    }
                }
                return false;
            },
            // Remove all callbacks from the list
            empty:function ()
            {
                list = [];
                return this;
            },
            // Have the list do nothing anymore
            disable:function ()
            {
                list = stack = memory = undefined;
                return this;
            },
            // Is it disabled?
            disabled:function ()
            {
                return !list;
            },
            // Lock the list in its current state
            lock:function ()
            {
                stack = undefined;
                if (!memory || memory === true)
                {
                    self.disable();
                }
                return this;
            },
            // Is it locked?
            locked:function ()
            {
                return !stack;
            },
            // Call all callbacks with the given context and arguments
            fireWith:function (context, args)
            {
                if (stack)
                {
                    if (firing)
                    {
                        if (!flags.once)
                        {
                            stack.push([ context, args ]);
                        }
                    } else if (!( flags.once && memory ))
                    {
                        fire(context, args);
                    }
                }
                return this;
            },
            // Call all the callbacks with the given arguments
            fire:function ()
            {
                self.fireWith(this, arguments);
                return this;
            },
            // To know if the callbacks have already been called at least once
            fired:function ()
            {
                return !!memory;
            }
        };

    return self;
};


gamecore.extend({

    Deferred:function (func)
    {
        var doneList = gamecore.Callbacks("once memory"),
            failList = gamecore.Callbacks("once memory"),
            progressList = gamecore.Callbacks("memory"),
            state = "pending",
            lists = {
                resolve:doneList,
                reject:failList,
                notify:progressList
            },
            promise = {
                done:doneList.add,
                fail:failList.add,
                progress:progressList.add,

                state:function ()
                {
                    return state;
                },

                // Deprecated
                isResolved:doneList.fired,
                isRejected:failList.fired,

                then:function (doneCallbacks, failCallbacks, progressCallbacks)
                {
                    deferred.done(doneCallbacks).fail(failCallbacks).progress(progressCallbacks);
                    return this;
                },
                always:function ()
                {
                    deferred.done.apply(deferred, arguments).fail.apply(deferred, arguments);
                    return this;
                },
                pipe:function (fnDone, fnFail, fnProgress)
                {
                    return gamecore.Deferred(function (newDefer)
                    {
                        gamecore.each({
                            done:[ fnDone, "resolve" ],
                            fail:[ fnFail, "reject" ],
                            progress:[ fnProgress, "notify" ]
                        }, function (handler, data)
                        {
                            var fn = data[ 0 ],
                                action = data[ 1 ],
                                returned;
                            if (gamecore.isFunction(fn))
                            {
                                deferred[ handler ](function ()
                                {
                                    returned = fn.apply(this, arguments);
                                    if (returned && gamecore.isFunction(returned.promise))
                                    {
                                        returned.promise().then(newDefer.resolve, newDefer.reject, newDefer.notify);
                                    } else
                                    {
                                        newDefer[ action + "With" ](this === deferred ? newDefer : this, [ returned ]);
                                    }
                                });
                            } else
                            {
                                deferred[ handler ](newDefer[ action ]);
                            }
                        });
                    }).promise();
                },
                // Get a promise for this deferred
                // If obj is provided, the promise aspect is added to the object
                promise:function (obj)
                {
                    if (obj == null)
                    {
                        obj = promise;
                    } else
                    {
                        for (var key in promise)
                        {
                            obj[ key ] = promise[ key ];
                        }
                    }
                    return obj;
                }
            },
            deferred = promise.promise({}),
            key;

        for (key in lists)
        {
            deferred[ key ] = lists[ key ].fire;
            deferred[ key + "With" ] = lists[ key ].fireWith;
        }

        // Handle state
        deferred.done(function ()
        {
            state = "resolved";
        }, failList.disable, progressList.lock).fail(function ()
            {
                state = "rejected";
            }, doneList.disable, progressList.lock);

        // Call given func if any
        if (func)
        {
            func.call(deferred, deferred);
        }

        // All done!
        return deferred;
    },

    // Deferred helper
    when:function (firstParam)
    {
        var args = sliceDeferred.call(arguments, 0),
            i = 0,
            length = args.length,
            pValues = new Array(length),
            count = length,
            pCount = length,
            deferred = length <= 1 && firstParam && gamecore.isFunction(firstParam.promise) ?
                firstParam :
                gamecore.Deferred(),
            promise = deferred.promise();

        function resolveFunc(i)
        {
            return function (value)
            {
                args[ i ] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                if (!( --count ))
                {
                    deferred.resolveWith(deferred, args);
                }
            };
        }

        function progressFunc(i)
        {
            return function (value)
            {
                pValues[ i ] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
                deferred.notifyWith(promise, pValues);
            };
        }

        if (length > 1)
        {
            for (; i < length; i++)
            {
                if (args[ i ] && args[ i ].promise && gamecore.isFunction(args[ i ].promise))
                {
                    args[ i ].promise().then(resolveFunc(i), deferred.reject, progressFunc(i));
                } else
                {
                    --count;
                }
            }
            if (!count)
            {
                deferred.resolveWith(deferred, args);
            }
        } else if (deferred !== firstParam)
        {
            deferred.resolveWith(deferred, length ? [ firstParam ] : []);
        }
        return promise;
    }
});




/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * class.js
 * Classes and objects
 */

/**
 * @Class
 * A modified version of class.js to cater to static inheritance and deep object cloning
 * Based almost completely on class.js (Javascript MVC -- Justin Meyer, Brian Moschel, Michael Mayer and others)
 * (http://javascriptmvc.com/contribute.html)
 * Some portions adapted from Prototype JavaScript framework, version 1.6.0.1 (c) 2005-2007 Sam Stephenson
 * Some portions extracted from jQuery 1.7
 * <p>
 * Class system for javascript
 * <p>
 * <code>
 *   var Fighter = gamecore.Base.extend('Fighter',
 *   {
 *       // static (this is inherited as well)
 *       firingSpeed: 1000
 *   },
 *   {
 *       // instance
 *
 *       hp: 0,
 *       lastFireTime: 0,
 *
 *       init: function(hp)
 *       {
 *           this.hp = hp;
 *       },
 *
 *       fire: function()
 *       {
 *           this._super(); // super methods!
 *
 *           // do firing!
 *       }
 *   });
 *
 *  var gunship = new Fighter(100);
 * </code>
 *
 * Introspection:
 * <code>
 *   gamecore.Base.extend(‘Fighter.Gunship’);
 *   Fighter.Gunship.shortName; // ‘Gunship’
 *   Fighter.Gunship.fullName;  // ‘Fighter.Gunship’
 *   Fighter.Gunship.namespace; // ‘Fighter’
 * </code>
 * <p>
 * Setup method will be called prior to any init -- nice if you want to do things without needing the
 * users to call _super in the init, as well as for normalizing parameters.
 * <code>
 *   setup: function()
 *   {
 *      this.objectId = this.Class.totalObjects++;
 *      this.uniqueId = this.Class.fullName + ':' + this.objectId;
 *   }
 * </code>
 */

(function (gc)
{
    var regs = {
            undHash:/_|-/,
            colons:/::/,
            words:/([A-Z]+)([A-Z][a-z])/g,
            lowUp:/([a-z\d])([A-Z])/g,
            dash:/([a-z\d])([A-Z])/g,
            replacer:/\{([^\}]+)\}/g,
            dot:/\./
        },
        getNext = function (current, nextPart, add)
        {
            return current[nextPart] || ( add && (current[nextPart] = {}) );
        },
        isContainer = function (current)
        {
            var type = typeof current;
            return type && (  type == 'function' || type == 'object' );
        },
        getObject = function (objectName, roots, add)
        {
            var parts = objectName ? objectName.split(regs.dot) : [],
                length = parts.length,
                currents = gc.isArray(roots) ? roots : [roots || window],
                current,
                ret,
                i,
                c = 0,
                type;

            if (length == 0)
            {
                return currents[0];
            }
            while (current = currents[c++])
            {
                for (i = 0; i < length - 1 && isContainer(current); i++)
                {
                    current = getNext(current, parts[i], add);
                }
                if (isContainer(current))
                {

                    ret = getNext(current, parts[i], add);

                    if (ret !== undefined)
                    {

                        if (add === false)
                        {
                            delete current[parts[i]];
                        }
                        return ret;

                    }

                }
            }
        },

        /**
         * A collection of useful string helpers.
         */
        str = gc.String = {
            /**
             * @function
             * Gets an object from a string.
             * @param {String} name the name of the object to look for
             * @param {Array} [roots] an array of root objects to look for the name
             * @param {Boolean} [add] true to add missing objects to
             *  the path. false to remove found properties. undefined to
             *  not modify the root object
             */
            getObject:getObject,
            /**
             * Capitalizes a string
             * @param {String} s the string.
             * @return {String} a string with the first character capitalized.
             */
            capitalize:function (s, cache)
            {
                return s.charAt(0).toUpperCase() + s.substr(1);
            },
            /**
             * Capitalizes a string from something undercored. Examples:
             * @codestart
             * gamecore.String.camelize("one_two") //-> "oneTwo"
             * "three-four".camelize() //-> threeFour
             * @codeend
             * @param {String} s
             * @return {String} a the camelized string
             */
            camelize:function (s)
            {
                s = str.classize(s);
                return s.charAt(0).toLowerCase() + s.substr(1);
            },
            /**
             * Like camelize, but the first part is also capitalized
             * @param {String} s
             * @return {String} the classized string
             */
            classize:function (s, join)
            {
                var parts = s.split(regs.undHash),
                    i = 0;
                for (; i < parts.length; i++)
                {
                    parts[i] = str.capitalize(parts[i]);
                }

                return parts.join(join || '');
            },
            /**
             * Like [gamecore.String.classize|classize], but a space separates each 'word'
             * @codestart
             * gamecore.String.niceName("one_two") //-> "One Two"
             * @codeend
             * @param {String} s
             * @return {String} the niceName
             */
            niceName:function (s)
            {
                return str.classize(s, ' ');
            },

            /**
             * Underscores a string.
             * @codestart
             * gamecore.String.underscore("OneTwo") //-> "one_two"
             * @codeend
             * @param {String} s
             * @return {String} the underscored string
             */
            underscore:function (s)
            {
                return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowUp, '$1_$2').replace(regs.dash, '_').toLowerCase();
            },
            /**
             * Returns a string with {param} replaced values from data.
             *
             *     gamecore.String.sub("foo {bar}",{bar: "far"})
             *     //-> "foo far"
             *
             * @param {String} s The string to replace
             * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
             * objects can be used.
             * @param {Boolean} [remove] if a match is found, remove the property from the object
             */
            sub:function (s, data, remove)
            {
                var obs = [];
                obs.push(s.replace(regs.replacer, function (whole, inside)
                {
                    //convert inside to type
                    var ob = getObject(inside, data, typeof remove == 'boolean' ? !remove : remove),
                        type = typeof ob;
                    if ((type === 'object' || type === 'function') && type !== null)
                    {
                        obs.push(ob);
                        return "";
                    } else
                    {
                        return "" + ob;
                    }
                }));
                return obs.length <= 1 ? obs[0] : obs;
            }
        }

})(gamecore);

(function (gc)
{

    // if we are initializing a new class
    var initializing = false,
        makeArray = gc.makeArray,
        isFunction = gc.isFunction,
        isArray = gc.isArray,
        extend = gc.extend,

        cloneObject = function (object)
        {
            if (!object || typeof(object) != 'object')
                return object;

            // special case handling of array (deep copy them)
            if (object instanceof Array)
            {
                var clone = [];
                for (var c = 0; c < object.length; c++)
                    clone[c] = cloneObject(object[c]);
                return clone;
            }
            else // otherwise, it's a normal object, clone it's properties
            {
                var cloneObj = {};
                for (var prop in object)
                    cloneObj[prop] = cloneObject(object[prop]);
                return cloneObj;
            }
        },

        concatArgs = function (arr, args)
        {
            return arr.concat(makeArray(args));
        },

        // tests if we can get super in .toString()
        fnTest = /xyz/.test(function ()
        {
            xyz;
        }) ? /\b_super\b/ : /.*/,

        inheritProps = function (newProps, oldProps, addTo)
        {
            // overwrites an object with methods, sets up _super
            // newProps - new properties
            // oldProps - where the old properties might be
            // addTo - what we are adding to
            addTo = addTo || newProps
            for (var name in newProps)
            {
                // Check if we're overwriting an existing function
                addTo[name] = isFunction(newProps[name]) &&
                    isFunction(oldProps[name]) &&
                    fnTest.test(newProps[name]) ? (function (name, fn)
                {
                    return function ()
                    {
                        var tmp = this._super, ret;

                        // Add a new ._super() method that is the same method but on the super-class
                        this._super = oldProps[name];

                        // The method only need to be bound temporarily, so we remove it when we're done executing
                        ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, newProps[name]) : newProps[name];
            }
        },

        clss = gc.Class = function ()
        {
            if (arguments.length)
            {
                return clss.extend.apply(clss, arguments);
            }
        };

    /* @Static*/
    extend(clss, {
        callback:function (funcs)
        {
            //args that should be curried
            var args = makeArray(arguments),
                self;

            funcs = args.shift();

            if (!isArray(funcs))
            {
                funcs = [funcs];
            }

            self = this;

            return function class_cb()
            {
                var cur = concatArgs(args, arguments),
                    isString,
                    length = funcs.length,
                    f = 0,
                    func;

                for (; f < length; f++)
                {
                    func = funcs[f];
                    if (!func)
                        continue;

                    isString = typeof func == "string";
                    if (isString && self._set_called)
                        self.called = func;

                    cur = (isString ? self[func] : func).apply(self, cur || []);
                    if (f < length - 1)
                        cur = !isArray(cur) || cur._use_call ? [cur] : cur
                }
                return cur;
            }
        },

        getObject:gc.String.getObject,

        newInstance:function ()
        {
            var inst = this.rawInstance();
            var args;

            if (inst.setup)
                args = inst.setup.apply(inst, arguments);

            // Added by martin@playcraftlabs.com -- fix for deep cloning of properties
            for (var prop in inst.__proto__)
                inst[prop] = cloneObject(inst[prop]);

            if (inst.init)
                inst.init.apply(inst, isArray(args) ? args : arguments);

            return inst;
        },

        setup:function (baseClass, fullName)
        {
            this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
            if (this._types == undefined) this._types = [];
            this._types.push(this.fullName);
            if (this._fullTypeName == undefined) this._fullTypeName = '|';
            this._fullTypeName += this.fullName + '|';
            return arguments;
        },
        rawInstance:function ()
        {
            initializing = true;
            var inst = new this();
            initializing = false;
            return inst;
        },

        extend:function (fullName, klass, proto)
        {
            // figure out what was passed
            if (typeof fullName != 'string')
            {
                proto = klass;
                klass = fullName;
                fullName = null;
            }
            if (!proto)
            {
                proto = klass;
                klass = null;
            }

            proto = proto || {};
            var _super_class = this,
                _super = this.prototype,
                name, shortName, namespace, prototype;

            // append the isA function
            this.isA = function (typeName)
            {
                return this._fullTypeName.indexOf('|' + typeName + '|') != -1;
            };

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            prototype = new this();
            initializing = false;
            // Copy the properties over onto the new prototype
            inheritProps(proto, _super, prototype);

            // The dummy class constructor

            function Class()
            {
                // All construction is actually done in the init method
                if (initializing) return;

                if (this.constructor !== Class && arguments.length)
                { //we are being called w/o new
                    return arguments.callee.extend.apply(arguments.callee, arguments)
                } else
                { //we are being called w/ new
                    // copy objects

                    return this.Class.newInstance.apply(this.Class, arguments)
                }
            }

            // Copy old stuff onto class
            for (name in this)
                if (this.hasOwnProperty(name))
                    Class[name] = cloneObject(this[name]);

            // copy new props on class
            inheritProps(klass, this, Class);

            // do namespace stuff
            if (fullName)
            {
                var parts = fullName.split(/\./);
                var shortName = parts.pop();

                // Martin Wells (playcraft): bug fix. Don't add a namespace object if the class name
                // has no namespace elements (i.e. it's just "MyClass", not "MyProject.MyClass")
                if (parts.length > 0)
                {
                    current = clss.getObject(parts.join('.'), window, true),
                        namespace = current;
                }

                current[shortName] = Class;
            }

            // set things that can't be overwritten
            extend(Class, {
                prototype:prototype,
                namespace:namespace,
                shortName:shortName,
                constructor:Class,
                fullName:fullName
            });

            //make sure our prototype looks nice
            Class.prototype.Class = Class.prototype.constructor = Class;

            var args = Class.setup.apply(Class, concatArgs([_super_class], arguments));

            if (Class.init)
                Class.init.apply(Class, args || []);

            /* @Prototype*/

            return Class;
        }
    });

    clss.prototype.callback = clss.callback;


})(gamecore);
/**
 * @class gamecore.Base
 * @description
 * A base class providing logging, object counting and unique object id's
 * Examples:
 *
 * Unique ID and total objects:
 * <pre><code>
 * var Fighter = gamecore.Base.extend('Fighter', {}, {});
 * var fighter1 = new Fighter();
 * var fighter2 = new Fighter();
 * fighter1.uniqueId;    // -> 'Fighter:0'
 * fighter2.uniqueId;    // -> 'Fighter:1'
 * Fighter.totalObjects; // -> 2
 * </code></pre>
 *
 * Logging: (log, info, warn, error, debug)
 * <pre><code>
 * fighter1.warn('oops'); // == console.log('Fighter:0 [WARN] oops');
 * </code></pre>
 */
gamecore.Base = gamecore.Class('gamecore.Base',
    /** @lends gamecore.Base */
    {
        totalObjects:0,
        WARN:'WARN',
        DEBUG:'DEBUG',
        ERROR:'ERROR',
        INFO:'INFO',

        log:function (id, type, message)
        {
            var idString = '';
            if (id) idString = ':' + id;
            console.log(this.fullName + idString + ' [' + type + '] ' + message);
        },

        warn:function (message)
        {
            this.log(null, this.WARN, message);
        },

        debug:function (message)
        {
            this.log(null, this.DEBUG, message);
        },

        error:function (message)
        {
            this.log(null, this.ERROR, message);
        },

        info:function (message)
        {
            this.log(null, this.INFO, message);
        },

        assert:function (msg, condition)
        {
            if (!condition)
                throw msg;
        }

    },
    /** @lends gamecore.Base.prototype */
    {
        objectId:0,
        uniqueId:null,

        init:function ()
        {
        },

        setup:function ()
        {
            this.objectId = this.Class.totalObjects++;
            this.uniqueId = this.Class.fullName + ':' + this.objectId;
        },

        /**
         * @returns {String} A system-wide unique Id for this object instance
         */
        getUniqueId:function ()
        {
            // if you see a null error here, then likely you have forgotten to call
            // this._super in a subclassed init method.
            return this.uniqueId;
        },

        /**
         * @returns {String} A hash matching this object. Override this to implement different
         * kinds of object hashing in derived classes.
         */
        hashCode:function ()
        {
            return this.getUniqueId();
        },

        warn:function (message)
        {
            this.Class.log(this.objectId, this.Class.WARN, message);
        },
        debug:function (message)
        {
            this.Class.log(this.objectId, this.Class.DEBUG, message);
        },
        error:function (message)
        {
            this.Class.log(this.objectId, this.Class.ERROR, message);
        },
        info:function (message)
        {
            this.Class.log(this.objectId, this.Class.INFO, message);
        },

        toString:function ()
        {
            return this.Class.fullName + ' [id: ' + this.objectId + ']';
        }
    });
/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 2.1
 * Build date: 21 March 2010
 * Website: http://www.timdown.co.uk/jshashtable
 *
 * (Slight mod to add to gamecore namespace -- martin@playcraftlabs.com)
 */

/**
 * jshashtable
 *
 * jshashtable is a JavaScript implementation of a hash table. It creates a single constructor function called Hashtable
 * in the global scope.
 * Example:
 * <code>
 *     var map = new gamecore.Hashtable();
 *     map.put('test1', obj);
 *     var obj = map.get('test1');
 * </code>
 */

gamecore.Hashtable = (function ()
{
    var FUNCTION = "function";

    var arrayRemoveAt = (typeof Array.prototype.splice == FUNCTION) ?
        function (arr, idx)
        {
            arr.splice(idx, 1);
        } :

        function (arr, idx)
        {
            var itemsAfterDeleted, i, len;
            if (idx === arr.length - 1)
            {
                arr.length = idx;
            } else
            {
                itemsAfterDeleted = arr.slice(idx + 1);
                arr.length = idx;
                for (i = 0, len = itemsAfterDeleted.length; i < len; ++i)
                {
                    arr[idx + i] = itemsAfterDeleted[i];
                }
            }
        };

    function hashObject(obj)
    {
        var hashCode;
        if (typeof obj == "string")
        {
            return obj;
        } else if (typeof obj.hashCode == FUNCTION)
        {
            // Check the hashCode method really has returned a string
            hashCode = obj.hashCode();
            return (typeof hashCode == "string") ? hashCode : hashObject(hashCode);
        } else if (typeof obj.toString == FUNCTION)
        {
            return obj.toString();
        } else
        {
            try
            {
                return String(obj);
            }
            catch (ex)
            {
                // For host objects (such as ActiveObjects in IE) that have no toString() method and throw an error when
                // passed to String()
                return Object.prototype.toString.call(obj);
            }
        }
    }

    function equals_fixedValueHasEquals(fixedValue, variableValue)
    {
        return fixedValue.equals(variableValue);
    }

    function equals_fixedValueNoEquals(fixedValue, variableValue)
    {
        return (typeof variableValue.equals == FUNCTION) ?
            variableValue.equals(fixedValue) : (fixedValue === variableValue);
    }

    function createKeyValCheck(kvStr)
    {
        return function (kv)
        {
            if (kv === null)
            {
                throw new Error("null is not a valid " + kvStr);
            } else if (typeof kv == "undefined")
            {
                throw new Error(kvStr + " must not be undefined");
            }
        };
    }

    var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");

    /*----------------------------------------------------------------------------------------------------------------*/

    function Bucket(hash, firstKey, firstValue, equalityFunction)
    {
        this[0] = hash;
        this.entries = [];
        this.addEntry(firstKey, firstValue);

        if (equalityFunction !== null)
        {
            this.getEqualityFunction = function ()
            {
                return equalityFunction;
            };
        }
    }

    var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;

    function createBucketSearcher(mode)
    {
        return function (key)
        {
            var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
            while (i--)
            {
                entry = this.entries[i];
                if (equals(key, entry[0]))
                {
                    switch (mode)
                    {
                        case EXISTENCE:
                            return true;
                        case ENTRY:
                            return entry;
                        case ENTRY_INDEX_AND_VALUE:
                            return [ i, entry[1] ];
                    }
                }
            }
            return false;
        };
    }

    function createBucketLister(entryProperty)
    {
        return function (aggregatedArr)
        {
            var startIndex = aggregatedArr.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                aggregatedArr[startIndex + i] = this.entries[i][entryProperty];
            }
        };
    }

    Bucket.prototype = {
        getEqualityFunction:function (searchValue)
        {
            return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
        },

        getEntryForKey:createBucketSearcher(ENTRY),

        getEntryAndIndexForKey:createBucketSearcher(ENTRY_INDEX_AND_VALUE),

        removeEntryForKey:function (key)
        {
            var result = this.getEntryAndIndexForKey(key);
            if (result)
            {
                arrayRemoveAt(this.entries, result[0]);
                return result[1];
            }
            return null;
        },

        addEntry:function (key, value)
        {
            this.entries[this.entries.length] = [key, value];
        },

        keys:createBucketLister(0),

        values:createBucketLister(1),

        getEntries:function (entries)
        {
            var startIndex = entries.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                // Clone the entry stored in the bucket before adding to array
                entries[startIndex + i] = this.entries[i].slice(0);
            }
        },

        containsKey:createBucketSearcher(EXISTENCE),

        containsValue:function (value)
        {
            var i = this.entries.length;
            while (i--)
            {
                if (value === this.entries[i][1])
                {
                    return true;
                }
            }
            return false;
        }
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Supporting functions for searching hashtable buckets

    function searchBuckets(buckets, hash)
    {
        var i = buckets.length, bucket;
        while (i--)
        {
            bucket = buckets[i];
            if (hash === bucket[0])
            {
                return i;
            }
        }
        return null;
    }

    function getBucketForHash(bucketsByHash, hash)
    {
        var bucket = bucketsByHash[hash];

        // Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
        return ( bucket && (bucket instanceof Bucket) ) ? bucket : null;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    function Hashtable(hashingFunctionParam, equalityFunctionParam)
    {
        var that = this;
        var buckets = [];
        var bucketsByHash = {};

        var hashingFunction = (typeof hashingFunctionParam == FUNCTION) ? hashingFunctionParam : hashObject;
        var equalityFunction = (typeof equalityFunctionParam == FUNCTION) ? equalityFunctionParam : null;

        this.put = function (key, value)
        {
            checkKey(key);
            checkValue(value);
            var hash = hashingFunction(key), bucket, bucketEntry, oldValue = null;

            // Check if a bucket exists for the bucket key
            bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it already contains this key
                bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so replace old value and we're done.
                    oldValue = bucketEntry[1];
                    bucketEntry[1] = value;
                } else
                {
                    // The bucket does not contain an entry for this key, so add one
                    bucket.addEntry(key, value);
                }
            } else
            {
                // No bucket exists for the key, so create one and put our key/value mapping in
                bucket = new Bucket(hash, key, value, equalityFunction);
                buckets[buckets.length] = bucket;
                bucketsByHash[hash] = bucket;
            }
            return oldValue;
        };

        this.get = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it contains this key
                var bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so return the value.
                    return bucketEntry[1];
                }
            }
            return null;
        };

        this.containsKey = function (key)
        {
            checkKey(key);
            var bucketKey = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, bucketKey);

            return bucket ? bucket.containsKey(key) : false;
        };

        this.containsValue = function (value)
        {
            checkValue(value);
            var i = buckets.length;
            while (i--)
            {
                if (buckets[i].containsValue(value))
                {
                    return true;
                }
            }
            return false;
        };

        this.clear = function ()
        {
            buckets.length = 0;
            bucketsByHash = {};
        };

        this.isEmpty = function ()
        {
            return !buckets.length;
        };

        var createBucketAggregator = function (bucketFuncName)
        {
            return function ()
            {
                var aggregated = [], i = buckets.length;
                while (i--)
                {
                    buckets[i][bucketFuncName](aggregated);
                }
                return aggregated;
            };
        };

        this.keys = createBucketAggregator("keys");
        this.values = createBucketAggregator("values");
        this.entries = createBucketAggregator("getEntries");

        this.remove = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key), bucketIndex, oldValue = null;

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);

            if (bucket)
            {
                // Remove entry from this bucket for this key
                oldValue = bucket.removeEntryForKey(key);
                if (oldValue !== null)
                {
                    // Entry was removed, so check if bucket is empty
                    if (!bucket.entries.length)
                    {
                        // Bucket is empty, so remove it from the bucket collections
                        bucketIndex = searchBuckets(buckets, hash);
                        arrayRemoveAt(buckets, bucketIndex);
                        delete bucketsByHash[hash];
                    }
                }
            }
            return oldValue;
        };

        this.size = function ()
        {
            var total = 0, i = buckets.length;
            while (i--)
            {
                total += buckets[i].entries.length;
            }
            return total;
        };

        this.each = function (callback)
        {
            var entries = that.entries(), i = entries.length, entry;
            while (i--)
            {
                entry = entries[i];
                callback(entry[0], entry[1]);
            }
        };

        this.putAll = function (hashtable, conflictCallback)
        {
            var entries = hashtable.entries();
            var entry, key, value, thisValue, i = entries.length;
            var hasConflictCallback = (typeof conflictCallback == FUNCTION);
            while (i--)
            {
                entry = entries[i];
                key = entry[0];
                value = entry[1];

                // Check for a conflict. The default behaviour is to overwrite the value for an existing key
                if (hasConflictCallback && (thisValue = that.get(key)))
                {
                    value = conflictCallback(key, thisValue, value);
                }
                that.put(key, value);
            }
        };

        this.clone = function ()
        {
            var clone = new Hashtable(hashingFunctionParam, equalityFunctionParam);
            clone.putAll(that);
            return clone;
        };

        /**
         * Added by martin@playcratlabs.com to support debug dumping of hash arrays
         */
        this.toString = function ()
        {
            var result = '';
            var keys = this.keys();
            for (var i = 0; i < keys.length; i++)
            {
                var obj = this.get(keys[i]);
                result += keys[i].toString() + ' = ' + obj.toString() + '\n';
            }

            return result;
        }
    }

    return Hashtable;
})();/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * device.js
 * Access to device capabilities
 */

/**
 * @class gamecore.Device
 * Staic class with lots of device information.
 */

gamecore.Device = gamecore.Base.extend('gamecore.Device',
    {
        pixelRatio:0,
        isiPhone:false,
        isiPhone4:false,
        isiPad:false,
        isAndroid:false,
        isTouch:false,
        isFirefox:false,
        isChrome:false,
        isOpera:false,
        isIE:false,
        ieVersion:0,
        requestAnimFrame:null,
        hasMemoryProfiling:false,
        canPlayOgg: false,
        canPlayMP3: false,
        canPlayWav: false,

        init:function ()
        {
            this.pixelRatio = window.devicePixelRatio || 1;
            this.isiPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
            this.isiPhone4 = (this.pixelRatio == 2 && this.isiPhone);
            this.isiPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;
            this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') != -1;
            this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
            this.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
            this.isOpera = navigator.userAgent.toLowerCase().indexOf('opera') != -1;
            this.isTouch = window.ontouchstart !== 'undefined';

            if (window.performance != undefined)
                this.hasMemoryProfiling = (window.performance.memory);

            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
            {
                this.ieVersion = new Number(RegExp.$1);
                this.isIE = true;
            }

            // determine what sound formats we can play
            var check = new Audio();
            if (check.canPlayType('audio/ogg')) this.canPlayOgg = true;
            if (check.canPlayType('audio/mpeg')) this.canPlayMP3 = true;
            if (check.canPlayType('audio/x-wav')) this.canPlayWav = true;

            this.requestAnimFrame = (function ()
            {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element)
                        {
                            window.setTimeout(callback, 16, Date.now());
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element)
                {
                    request.apply(window, [callback, element]);
                };
            })();

            // todo:
            // highres timer
            // game pads
            // fullscreen api
            // mouse lock
        },

        canPlay: function(format)
        {
            if (format.toLowerCase() === 'mp3' && this.canPlayMP3) return true;
            if (format.toLowerCase() === 'ogg' && this.canPlayOgg) return true;
            if (format.toLowerCase() === 'wav' && this.canPlayWav) return true;
            return false;
        },

        getUsedHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.usedJSHeapSize : 0;
        },

        getTotalHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.totalJSHeapSize : 0;
        }


    },
    {
        // Singleton static class, so nothing required here
    });/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * perf.js
 * Simple performance monitoring tools.
 */

/**
 * @class gamecore.PerformanceMeasure
 * Example:
 * <code>
 * var measure = new gamecore.PerformanceMeasure('A test');
 * // ... do something
 * console.log(measure.end()); // end returns a string you can easily log
 * </code>
 *
 * The memory count is an idea based on a delta of the useJSHeapSize exposed by Chrome.
 * You will need to restart Chrome with --enable-memory-info to have this exposed.
 * It is however, not very reliable as the value will jump around due to gc runs (I think).
 * So far it seems to produce reliable results that are consistent, however memStart > memEnd
 * cases still occur and it would be good to understand this more (is it limited only to GC
 * runs? if so, why is it so consistent?).
 */

gamecore.PerformanceMeasure = gamecore.Base.extend('gamecore.PerformanceMeasure',
{
    history: [],

    /**
     * Clears the performance history
     */
    clearHistory: function()
    {
        history.length = 0;
    }
},
{
    timeStart: 0,
    timeEnd: 0,
    timeDelat: 0,
    memStart: 0,
    memEnd: 0,
    memDelta: 0,
    description: null,

    /**
     * Constructs a new performance measure with description
     * @param description
     */
    init: function(description)
    {
        this.description = description;
        this.start();
        this.Class.history.push(this);
    },

    /**
     * Starts a performance measure
     */
    start: function()
    {
        this.timeStart = Date.now();
        this.memStart = gamecore.Device.getUsedHeap();
    },

    /**
     * Ends a performance measure, and for convenience returns a toString of the measurement
     * @return String representing the measurement
     */
    end: function()
    {
        this.timeEnd = Date.now();
        this.timeDelta = this.timeEnd - this.timeStart;
        this.memEnd = gamecore.Device.getUsedHeap();

        if (this.memEnd < this.memStart)
            this.memDelta = 0;
        else
            this.memDelta = this.memEnd - this.memStart;
        return this.toString();
    },

    /**
     * Reports the performance measurement in a nice clean way
     */
    toString: function()
    {
        return this.description + ' took ' + this.timeDelta + 'ms, ' +
            (this.memDelta == 0 ? 'unknown':this.memDelta) + ' byte(s)';
    }

});/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * linkedlist.js
 * A high-perforance doubly-linked list intended for use in gaming
 */

/**
 * @class gamecore.LinkedNode
 * @description
 * Represents an item stored in a linked list.
 */
gamecore.LinkedListNode = gamecore.Base('gamecore.LinkedNode', {},
    /** @lends gamecore.LinkedListNode.prototype */
    {
        obj:null, // the object reference
        nextLinked:null, // link to next object in the list
        prevLinked:null, // link to previous object in the list
        free:true,

        /**
         * @return {pc.LinkedListNode} Next node on the list
         */
        next:function ()
        {
            return this.nextLinked;
        },

        /**
         * @return {Object} Object this node represents on the list
         */
        object:function ()
        {
            return this.obj;
        },

        /**
         * @return {pc.LinkedListNode} Prev node on the list
         */
        prev:function ()
        {
            return this.prevLinked;
        }

    });

/**
 * @class gamecore.LinkedList
 * @description
 * A high-speed doubly linked list of objects. Note that for speed reasons (using a dictionary lookup of
 * cached nodes) there can only be a single instance of an object in the list at the same time. Adding the same
 * object a second time will result in a silent return from the add method.
 * <p>
 * In order to keep a track of node links, an object must be able to identify itself with a getUniqueId() function.
 * <p>
 * To add an item use:
 * <pre><code>
 *   list.add(newItem);
 * </code></pre>
 * <p>
 * You can iterate using the first and next members, such as:
 * <pre><code>
 *   var node = list.first;
 *   while (node)
 *   {
 *       node.object().DOSOMETHING();
 *       node = node.next();
 *   }
 * </code></pre>
 */
gamecore.LinkedList = gamecore.Base('gamecore.LinkedList',
    /** @lends gamecore.LinkedList */
    {
    },
    /** @lends gamecore.LinkedList.prototype */
    {
        first:null,
        last:null,
        count:0,
        objToNodeMap:null, // a quick lookup list to map linked list nodes to objects

        /**
         * Constructs a new linked list
         */
        init:function ()
        {
            this._super();
            this.objToNodeMap = new gamecore.Hashtable();
        },

        /**
         * Get the LinkedListNode for this object.
         * @param obj The object to get the node for
         */
        getNode:function (obj)
        {
            // objects added to a list must implement a getUniqueId which returns a unique object identifier string
            // or just extend gamecore.Base to get it for free
            return this.objToNodeMap.get(obj.getUniqueId());
        },

        /**
         * Adds a specific node to the list -- typically only used internally unless you're doing something funky
         * Use add() to add an object to the list, not this.
         */
        addNode:function (obj)
        {
            var node = new gamecore.LinkedNode();
            node.obj = obj;
            node.prevLinked = null;
            node.nextLinked = null;
            node.free = false;
            this.objToNodeMap.put(obj.getUniqueId(), node);
            return node;
        },

        /**
         * Add an item to the list
         * @param obj The object to add
         */
        add:function (obj)
        {
            var node = this.getNode(obj);
            if (node == null)
            {
                node = this.addNode(obj);
            } else
            {
                // if the object is already in the list just throw an (can't add an object more than once)
                // if you want to quickly check if an item is already in a list, then call list.has(obj)
                if (node.free == false)
                    throw 'Attempting to add object: ' + obj.getUniqueId() + ' twice to list ' + this.getUniqueId();

                // reusing a node, so we clean it up
                // this caching of node/object pairs is the reason an object can only exist
                // once in a list -- which also makes things faster (not always creating new node
                // object every time objects are moving on and off the list
                node.obj = obj;
                node.free = false;
                node.nextLinked = null;
                node.prevLinked = null;
            }

            // append this obj to the end of the list
            if (this.first == null) // is this the first?
            {
                this.first = node;
                this.last = node;
                node.nextLinked = null; // clear just in case
                node.prevLinked = null;
            } else
            {
                if (this.last == null)
                    throw "Hmm, no last in the list -- that shouldn't happen here";

                // add this entry to the end of the list
                this.last.nextLinked = node; // current end of list points to the new end
                node.prevLinked = this.last;
                this.last = node;            // new object to add becomes last in the list
                node.nextLinked = null;      // just in case this was previously set
            }
            this.count++;

            if (this.showDebug) this.dump('after add');
        },

        has:function (obj)
        {
            var node = this.getNode(obj);
            return !(node == null || node.free == true);
        },

        /**
         * Moves this item upwards in the list
         * @param obj
         */
        moveUp:function (obj)
        {
            this.dump('before move up');
            var c = this.getNode(obj);
            if (!c) throw "Oops, trying to move an object that isn't in the list";
            if (c.prevLinked == null) return; // already first, ignore

            // This operation makes C swap places with B:
            // A <-> B <-> C <-> D
            // A <-> C <-> B <-> D

            var b = c.prevLinked;
            var a = b.prevLinked;

            // fix last
            if (c == this.last)
                this.last = b;

            var oldCNext = c.nextLinked;

            if (a)
                a.nextLinked = c;
            c.nextLinked = b;
            c.prevLinked = b.prevLinked;

            b.nextLinked = oldCNext;
            b.prevLinked = c;

            // check to see if we are now first
            if (this.first == b)
                this.first = c;
        },

        /**
         * Moves this item downwards in the list
         * @param obj
         */
        moveDown:function (obj)
        {
            var b = this.getNode(obj);
            if (!b) throw "Oops, trying to move an object that isn't in the list";
            if (b.nextLinked == null) return; // already last, ignore

            // This operation makes B swap places with C:
            // A <-> B <-> C <-> D
            // A <-> C <-> B <-> D

            var c = b.nextLinked;
            this.moveUp(c.obj);

            // check to see if we are now last
            if (this.last == c)
                this.last = b;
        },

        sort:function (compare)
        {
            // take everything off the list and put it in an array
            var sortArray = [];
            var node = this.first;
            while (node)
            {
                sortArray.push(node.object());
                node = node.next();
            }

            this.clear();

            // sort it
            sortArray.sort(compare);

            // then put it back
            for (var i = 0; i < sortArray.length; i++)
                this.add(sortArray[i]);
        },

        /**
         * Removes an item from the list
         * @param obj The object to remove
         * @returns boolean true if the item was removed, false if the item was not on the list
         */
        remove:function (obj)
        {
            if (this.showDebug) this.dump('before remove of ' + obj);
            var node = this.getNode(obj);
            if (node == null || node.free == true)
                return false; // ignore this error (trying to remove something not there
            //throw ('Error: trying to remove a node (' + obj + ') that isnt on the list ');

            // pull this object out and tie up the ends
            if (node.prevLinked != null)
                node.prevLinked.nextLinked = node.nextLinked;
            if (node.nextLinked != null)
                node.nextLinked.prevLinked = node.prevLinked;

            // fix first and last
            if (node.prevLinked == null) // if this was first on the list
                this.first = node.nextLinked; // make the next on the list first (can be null)
            if (node.nextLinked == null) // if this was the last
                this.last = node.prevLinked; // then this nodes previous becomes last

            node.free = true;
            node.prevLinked = null;
            node.nextLinked = null;

            this.count--;
            if (this.showDebug) this.dump('after remove');

            return true;
        },

        /**
         * Clears the list out
         */
        clear:function ()
        {
            // sweep the list and free all the nodes
            var next = this.first;
            while (next != null)
            {
                next.free = true;
                next = next.nextLinked;
            }
            this.first = null;
            this.count = 0;
        },

        /**
         * @return number of items in the list
         */
        length:function ()
        {
            return this.count;
        },

        /**
         * Outputs the contents of the current list. Usually for debugging.
         */
        dump:function (msg)
        {
            this.debug('====================' + msg + '=====================');
            var a = this.first;
            while (a != null)
            {
                this.debug("{" + a.obj.toString() + "} previous=" + ( a.prevLinked ? a.prevLinked.obj : "NULL"));
                a = a.next();
            }
            this.debug("===================================");
            this.debug("Last: {" + (this.last ? this.last.obj : 'NULL') + "} " +
                "First: {" + (this.first ? this.first.obj : 'NULL') + "}");
        }

    })
;



/**
 * @class gamecore.HashList
 * @description
 * A map of linked lists mapped by a string value
 */
gamecore.HashList = gamecore.Base.extend('gamecore.HashList',
    {},
    /** @lends gamecore.HashList */
    {
        /** Internal hash table of lists */
        hashtable: null,

        /**
         * Constructs a new hash list
         */
        init: function()
        {
            this.hashtable = new gamecore.Hashtable();
        },

        /**
         * Add an object to a list based on the given key. If the list doesn't yet exist it will be constructed.
         * @param {String} key Key
         * @param {Object} object Object to store
         */
        add: function(key, object)
        {
            // find the list associated with this key and add the object to it
            var list = this.hashtable.get(key);
            if (list == null)
            {
                // no list associated with this key yet, so let's make one
                list = new pc.LinkedList();
                this.hashtable.put(key, list);
            }
            list.add(object);
        },

        /**
         * Removes an object from the list
         * @param {String} key Key for the list to remove the object from
         * @param {Object} object Object to remove
         */
        remove: function(key, object)
        {
            var list = this.hashtable.get(key);
            if (list == null) throw "No list for a key in hashlist when removing";
            list.remove(object);
        },

        /**
         * Get a list associated with a given key
         * @param {String} key The key
         * @return {gamecore.LinkedList} The list
         */
        get: function(key)
        {
            return this.hashtable.get(key);
        }


    });
// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} ex The error to create a stacktrace from (optional)
     * @param {String} mode Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        // examine exception properties w/o debugger
        //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            // e.message.indexOf("Backtrace:") > -1 -> opera
            // !e.stacktrace -> opera
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            // 'opera#sourceloc' in e -> opera9, opera10a
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return 'opera9'; // use e.message
            }
            // e.stacktrace && !e.stack -> opera10a
            if (!e.stack) {
                return 'opera10a'; // use e.stacktrace
            }
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        } else if (e.stack) {
            return 'firefox';
        }
        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+(at eval )?at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    opera11: function(e) {
        // "Error thrown at line 42, column 12 in <anonymous function>() in file://localhost/G:/js/stacktrace.js:\n"
        // "Error thrown at line 42, column 12 in <anonymous function: createException>() in file://localhost/G:/js/stacktrace.js:\n"
        // "called from line 7, column 4 in bar(n) in file://localhost/G:/js/test/functional/testcase1.html:\n"
        // "called from line 15, column 3 in file://localhost/G:/js/test/functional/testcase1.html:\n"
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1]? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && curr['arguments'] && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                //req.overrideMimeType('text/plain');
                //req.overrideMimeType('text/javascript');
                req.send(null);
                //return req.status == 200 ? req.responseText : '';
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]);
                if (m) { // If falsey, we did not get any file/line information
                    var file = m[1], lineno = m[2], charno = m[3] || 0;
                    if (file && this.isSameDomain(file) && lineno) {
                        var functionName = this.guessAnonymousFunction(file, lineno, charno);
                        stack[i] = frame.replace('{anonymous}', functionName);
                    }
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};
/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * pool.js
 */

/**
 * @class gamecore.Pool
 * Easy (high-performance) object pooling
 *
 * A pool of objects for use in situations where you want to minimize object life cycling (and
 * subsequently garbage collection). It also serves as a very high speed, minimal overhead
 * collection for small numbers of objects.
 * <p>
 * This class maintains mutual an array of objects which are free. If you wish to maintain a list of both
 * free and used then see the gamecore.DualPool.
 * <p>
 * Pools are managed by class type, and will auto-expand as required. You can create a custom initial pool
 * size by deriving from the Pool class and statically overriding INITIAL_POOL_SIZE.
 * <p>
 * Keep in mind that objects that are pooled are not constructed; they are "reset" when handed out.
 * You need to "acquire" one and then reset its state, usually via a static create factory method.
 * <p>
 * Example:
 * <pre><code>
 * Point = gamecore.Pooled('Point',
 * {
 *   // Static constructor
 *   create:function (x, y)
 *   {
 *      var n = this._super();
 *      n.x = x;
 *      n.y = y;
 *      return n;
 *   }
 * },
 * {
 *    x:0, y:0,   // instance
 *
 *    init: function(x, y)
 *    {
 *       this.x = x;
 *       this.y = y;
 *    }
 * }
 * </code></pre>
 * To then access the object from the pool, use create, instead of new. Then release it.
 * <pre><code>
 * var p = Point.create(100, 100);
 * // ... do something
 * p.release();
 * </code></pre>
 *
 */

gamecore.Pool = gamecore.Base.extend('gamecore.Pool',
    /** @lends gamecore.Pool */
    {
        /** Initial size of all object pools */
        INITIAL_POOL_SIZE:1,

        /** Hashtable of ALL the object pools */
        pools:new gamecore.Hashtable(),
        /** total objects in all pools */
        totalPooled:0,
        /** total objects in use right now */
        totalUsed:0,

        /**
         * Acquire an object from a pool based on the class[name]. Typically this method is
         * automatically called from Pooled.create method and should not be used directly.
         * @param {String} classType Class of object to create
         * @return {gamecore.Pooled} A shiny object you can then configure
         */
        acquire:function (classType)
        {
            var pool = this.getPool(classType);
            if (pool == undefined || pool == null)
            {
                // create a pool for this type of class
                //this.info('Constructing a new pool for ' + classType.fullName + ' objects.');
                pool = new gamecore.Pool(classType, this.INITIAL_POOL_SIZE);
                this.pools.put(classType.fullName, pool);
            }

            return pool.acquire();
        },

        /**
         * Releases an object back into it's corresponding object pool
         * @param {gamecore.Pooled} pooledObj Object to return to the pool
         */
        release:function (pooledObj)
        {
            var pool = this.pools.get(pooledObj.Class.fullName);
            if (pool == undefined)
                throw "Oops, trying to release an object of type " + pooledObj.Class.fullName +
                    " but no pool exists. Did you new an object instead of using create.";

            pool.release(pooledObj);
        },

        /**
         * Returns the pool associated with the given classType, or null if no pool currently exists.
         * @return {gamecore.Pool} Object pool associated with the class type
         */
        getPool:function (classType)
        {
            return this.pools.get(classType.fullName);
        },

        /**
         * Gets stats on the usage of all pools.
         * @return {String} Stats string
         */
        getStats:function ()
        {
            var s = '';

            var keys = this.pools.keys();
            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];
                var pool = this.pools.get(key);
                s += key + ': ' + pool.getStats()  + '\n';
            }

            return s;
        }

    },
    /** @lends gamecore.Pool.prototype */
    {
        /** Linked list of currently free objects residing in the pool */
        freeList:null,
        /** Current number of items to expand by: will increase with every expansion */
        expansion: 1,
        /** Array of traces currently active. Tracing must be on. */
        traces: null,

        /**
         * Constructs a pool. Will automatically be called by the static pool method. Generally not called directly.
         * @param {String} classType Class name of the type of objects in the pool
         * @param {Number} initial Starting number of objects in the pool
         */
        init:function (classType, initial)
        {
            this._super();
            this.classType = classType;
            this.freeList = [];

            // instantiate the initial objects for the pool
            this.expand(initial);
        },

        /**
         * Enables tracing on this pool.
         */
        startTracing:function ()
        {
            if (this.tracing) return;
            this.tracing = true;
            if (this.traces)
                this.traces.clear();
            else
                this.traces = new gamecore.Hashtable();
        },

        /**
         * Disables tracing on this pool.
         */
        stopTracing:function ()
        {
            this.tracing = false;
        },

        /**
         * Expand the pool of objects by constructing a bunch of new ones. The pool will
         * automatically expand itself by 10% each time it runs out of space, so generally you
         * shouldn't need to use this.
         * @param {Number} howMany Number of new objects you want to add
         */
        expand:function (howMany)
        {
            gamecore.Pool.totalPooled += howMany;

            //debug: if you want to track expansion
            //this.debug('expanding ' + this.classType.fullName + ' by ' + howMany + ' total=' + gamecore.Pool.totalPooled);

            for (var i = 0; i < howMany; i++)
                this.freeList.push(new this.classType());
        },

        /**
         * Gets the free count of objects left in the pool
         * @return {Number} Number free
         */
        getFreeCount: function()
        {
            return this.freeList.length;
        },

        /**
         * Returns the next free object by moving it from the free pool to the used one. If no free objects are
         * available it will expand the pool
         * @return {gamecore.Pooled} A pooled object
         */
        acquire:function ()
        {
            // check if we have anymore to give out
            if (this.freeList.length <= 0)
            {
                // create some more space (expand by 20%, minimum 1)
                this.expansion = Math.round(this.expansion*1.2)+1;
                this.expand(this.expansion);
            }

            if (this.tracing)
            {
                var stack = printStackTrace();
                var pos = stack.length - 1;
                while (stack[pos].indexOf('Class.addTo') == 0 && pos > 0)
                    pos--;
                var count = this.traces.get(stack[pos]);
                if (count == null)
                    this.traces.put(stack[pos], { value:1 });
                else
                    count.value++;
            }

            return this.freeList.pop();
        },

        /**
         * Releases an object by moving it back onto the free pool
         * @param {gamecore.Pooled} obj The obj to release back into the pool
         */
        release:function (obj)
        {
            this.freeList.push(obj);
        },

        /**
         * Gets stats about the pool
         * @return {String} Stats
         */
        getStats:function ()
        {
            var s = this.Class.fullName + ' stats: ' + this.freeList.length + ' free.';

            if (this.tracing)
            {
                s += 'TRACING\n';
                var traceKeys = this.traces.keys();
                for (var k in traceKeys)
                    s += traceKeys[k] + ' (' + this.traces.get(traceKeys[k]).value + ')\n';
            }
            return s;
        },

        /**
         * Dumps contents of the pool to through info logging (usually console). Mostly used for debugging the pooling
         * system, mostly.
         * @param {String} msg A string to write before the dump
         */
        dump:function (msg)
        {
            this.info('================== ' + msg + ' ===================');
            this.info('FREE');
            this.freeList.dump();
        },

        /**
         * Returns the number of objects in the pool
         * @return {Number} Total objects
         */
        size:function ()
        {
            return this.freeList.length;
        },

        /**
         * Returns the LinkedList of currently free objects in the pool
         * @return {gamecore.LinkedList} List of free objects
         */
        getFreeList:function ()
        {
            return this.freeList;
        }

    });

/**
 * @class gamecore.DualPool
 * @description
 * Easy (high-performance) object pooling
 *
 * A pool of objects for use in situations where you want to minimize object life cycling (and
 * subsequently garbage collection). It also serves as a very high speed, minimal overhead
 * collection for small numbers of objects.
 * <p>
 * This class maintains mutual set of doubly-linked lists in order to differentiate between
 * objects that are in use and those that are unallocated from the pool. This allows for much
 * faster cycling of only the in-use objects.
 * <p>
 * Pools are managed by class type, and will auto-expand as required. You can create a custom initial pool
 * size by deriving from the Pool class and statically overriding INITIAL_POOL_SIZE.
 * <p>
 * Keep in mind that objects that are pooled are not constructed; they are "reset" when handed out.
 * You need to "acquire" one and then reset its state, usually via a static create factory method.
 * <p>
 * Example:
 * <code>
 * Point = gamecore.Pooled('Point',
 * {
 *   // Static constructor
 *   create:function (x, y)
 *   {
 *      var n = this._super();
 *      n.x = x;
 *      n.y = y;
 *      return n;
 *   }
 * },
 * {
 *    x:0, y:0,   // instance
 *
 *    init: function(x, y)
 *    {
 *       this.x = x;
 *       this.y = y;
 *    }
 * }
 * </code>
 * To then access the object from the pool, use create, instead of new. Then release it.
 * <code>
 * var p = Point.create(100, 100);
 * // ... do something
 * p.release();
 * </code>
 *
 */
gamecore.DualPool = gamecore.Pool.extend('gamecore.DualPool',
    /** @lends gamecore.DualPool */
    {
        /**
         * Acquire an object from a pool based on the class[name]. Typically this method is
         * automatically called from Pooled.create method and should not be used directly.
         * @param {String} classType Class of object to create
         * @return {gamecore.Pooled} A shiny object you can then configure
         */
        acquire:function (classType)
        {
            var pool = this.getPool(classType);
            if (pool == undefined || pool == null)
            {
                pool = new gamecore.DualPool(classType, this.INITIAL_POOL_SIZE);
                this.pools.put(classType.fullName, pool);
            }

            return pool.acquire();
        },

        /**
         * Gets stats on the usage of all pools.
         * @return {String} Stats string
         */
        getStats:function ()
        {
            var s = '';

            var keys = this.pools.keys();
            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];
                var pool = this.pools.get(key);
                s += key + ' (free: ' + pool.freeList.length() + ' used: ' + pool.usedList.length() + ')\n';
            }
            return s;
        }
    },
    /** @lends gamecore.DualPool.prototype */
    {
        /** Linked list of currently free objects residing in the pool */
        freeList:null,
        /** Linked list of currently used objects not in the pool */
        usedList:null,

        /**
         * Constructs a pool. Will automatically be called by the static pool method. Generally not called directly.
         * @param {String} classType Class name of the type of objects in the pool
         * @param {Number} initial Starting number of objects in the pool
         */
        init:function (classType, initial)
        {
            this.classType = classType;
            this.usedList = new gamecore.LinkedList();
            this.freeList = new gamecore.LinkedList();

            // instantiate the initial objects for the pool
            this.expand(initial);
        },

        /**
         * Expand the pool of objects by constructing a bunch of new ones. The pool will
         * automatically expand itself by 10% each time it runs out of space, so generally you
         * shouldn't need to use this.
         * @param {Number} howMany Number of new objects you want to add
         */
        expand:function (howMany)
        {
//            this.info('Expanding ' + this.classType.fullName + ' pool from ' + this.size() +
//                ' to ' + (this.size() + howMany) + ' objects');
            gamecore.Pool.totalPooled += howMany;
            for (var i = 0; i < howMany; i++)
                this.freeList.add(new this.classType());
        },

        returnObj:null,

        /**
         * Returns the next free object by moving it from the free pool to the used one.
         * @return {gamecore.DualPooled} A pooled object you can then configure
         */
        acquire:function ()
        {
            // check if we have anymore to give out
            if (this.freeList.first == null)
            // create some more space (expand by 20%, minimum 1)
                this.expand(Math.round(this.size() / 5) + 1);

            this.returnObj = this.freeList.first.obj;
            this.freeList.remove(this.returnObj);
            this.returnObj.destroyed = false;
            this.usedList.add(this.returnObj);

            if (this.tracing)
            {
                var stack = printStackTrace();
                var pos = stack.length - 1;
                while (stack[pos].indexOf('Class.addTo') == 0 && pos > 0)
                    pos--;
                var count = this.traces.get(stack[pos]);
                if (count == null)
                    this.traces.put(stack[pos], { value:1 });
                else
                    count.value++;
            }

            return this.returnObj;
        },

        /**
         * Releases an object by moving it from the used list back to the free list.
         * @param obj {gamecore.DualPooled} The obj to release back into the pool
         */
        release:function (obj)
        {
            this.freeList.add(obj);
            this.usedList.remove(obj);
        },

        /**
         * Dumps stats about usage to the debug info (generally console)
         * @param {String} msg Message to display before the dump
         */
        dump:function (msg)
        {
            this.info('================== ' + msg + ' ===================');
            this.info('FREE');
            this.freeList.dump();
            this.info('USED');
            this.usedList.dump();
        },

        /**
         * Returns the number of objects in both the free and used pool
         */
        size:function ()
        {
            return this.freeList.count + this.usedList.count;
        },

        /**
         * Returns the LinkedList of current used objects
         * @return {gamecore.LinkedList}
         */
        getUsedList:function ()
        {
            return this.usedList;
        }
    });


/**
 * @class gamecore.Pooled
 * @description
 * Used as a base class for objects which are life cycle managed in an object pool.
 */
gamecore.Pooled = gamecore.Base('gamecore.Pooled',
    /** @lends gamecore.Pooled */
    {
        /**
         * Static factory method for creating a new object based on its class. This method
         * should be called using this._super from the Class.create that derives from this.
         * @returns {gamecore.Pooled} An object from the pool
         */
        create:function ()
        {
            return gamecore.Pool.acquire(this);
        },

        /**
         * Get the object pool associated with this object class
         * @return {gamecore.Pool} The object pool
         */
        getPool:function ()
        {
            return gamecore.Pool.getPool(this);
        }

    },
    /** @lends gamecore.Pooled.prototype */
    {
        /** Has the object been destroyed (returned to the pool) */
        destroyed:false,

        /**
         * Constructor for the object (default calls base class init)
         */
        init:function ()
        {
            this._super();
        },

        /**
         * Release the object back into the pool
         */
        release:function ()
        {
            this.onRelease();
            gamecore.Pool.release(this);
        },

        /**
         * Template callback when an object is released; gives you a chance to do your own cleanup / releasing
         */
        onRelease:function ()
        {
        }

    });


/**
 * @class gamecore.DualPooled
 * @description
 * Used as a base class for objects which are life cycle managed in an object pool (the DualPool edition)
 */
gamecore.DualPooled = gamecore.Base('gamecore.DualPooled',
    /** @lends gamecore.DualPool */
    {
        /**
         * Static factory method for creating a new object based on its class. This method
         * should be called using this._super from the Class.create that derives from this.
         * @returns {gamecore.Pooled} An object from the pool
         */
        create:function ()
        {
            return gamecore.DualPool.acquire(this);
        },

        /**
         * Get the object pool associated with this object class
         * @return {gamecore.Pool} The object pool
         */
        getPool:function ()
        {
            return gamecore.DualPool.getPool(this);
        }

    },
    /** @lends gamecore.DualPool.prototype */
    {
        /** Has the object been destroyed (returned to the pool) */
        destroyed:false,

        /**
         * Constructor for the object (default calls base class init)
         */
        init:function ()
        {
            this._super();
        },

        /**
         * Release the object back into the pool
         */
        release:function ()
        {
            this.onRelease();
            gamecore.DualPool.release(this);
        },

        /**
         * Template callback when an object is released; gives you a chance to do your own cleanup / releasing
         */
        onRelease:function ()
        {
        }

    });
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = [];
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output.push(String.fromCharCode(chr1));
 
			if (enc3 != 64) {
				output.push(String.fromCharCode(chr2));
			}
			if (enc4 != 64) {
				output.push(String.fromCharCode(chr3));
			}
 
		}
 
//		output = Base64._utf8_decode(output);

        output.join('');
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
};
/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */
/*
 * Original Box2D created by Erin Catto
 * http://www.gphysics.com
 * http://box2d.org/
 *
 * Box2D was converted to Flash by Boris the Brave, Matt Bush, and John Nesky as Box2DFlash
 * http://www.box2dflash.org/
 *
 * Box2DFlash was converted from Flash to Javascript by Uli Hecht as box2Dweb
 * http://code.google.com/p/box2dweb/
 *
 * box2Dweb was modified to utilize Google Closure, as well as other bug fixes, optimizations, and tweaks by Illandril
 * https://github.com/illandril/box2dweb-closure
 *
 * Playcraft additions:
 * - various bug fixes
 * - debug positioning supports the notion of an origin
 *
 */

goog = {inherits:function (a, b)
{
    function c()
    {
    }

    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a
}};
goog.debug = {};
goog.debug.Error = function (a)
{
    this.stack = Error().stack || "";
    a && (this.message = "" + a)
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.string = {};
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function (a, b)
{
    return 0 == a.lastIndexOf(b, 0)
};
goog.string.endsWith = function (a, b)
{
    var c = a.length - b.length;
    return 0 <= c && a.indexOf(b, c) == c
};
goog.string.caseInsensitiveStartsWith = function (a, b)
{
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length))
};
goog.string.caseInsensitiveEndsWith = function (a, b)
{
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length))
};
goog.string.subs = function (a, b)
{
    for (var c = 1; c < arguments.length; c++)
    {
        var d = ("" + arguments[c]).replace(/\$/g, "$$$$"), a = a.replace(/\%s/, d)
    }
    return a
};
goog.string.collapseWhitespace = function (a)
{
    return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function (a)
{
    return/^[\s\xa0]*$/.test(a)
};
goog.string.isEmptySafe = function (a)
{
    return goog.string.isEmpty(goog.string.makeSafe(a))
};
goog.string.isBreakingWhitespace = function (a)
{
    return!/[^\t\n\r ]/.test(a)
};
goog.string.isAlpha = function (a)
{
    return!/[^a-zA-Z]/.test(a)
};
goog.string.isNumeric = function (a)
{
    return!/[^0-9]/.test(a)
};
goog.string.isAlphaNumeric = function (a)
{
    return!/[^a-zA-Z0-9]/.test(a)
};
goog.string.isSpace = function (a)
{
    return" " == a
};
goog.string.isUnicodeChar = function (a)
{
    return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a
};
goog.string.stripNewlines = function (a)
{
    return a.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function (a)
{
    return a.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function (a)
{
    return a.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function (a)
{
    return a.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function (a)
{
    return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function (a)
{
    return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function (a)
{
    return a.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function (a)
{
    return a.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function (a, b)
{
    var c = ("" + a).toLowerCase(), d = ("" + b).toLowerCase();
    return c < d ? -1 : c == d ? 0 : 1
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function (a, b)
{
    if (a == b)
    {
        return 0
    }
    if (!a)
    {
        return-1
    }
    if (!b)
    {
        return 1
    }
    for (var c = a.toLowerCase().match(goog.string.numerateCompareRegExp_), d = b.toLowerCase().match(goog.string.numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0; f < e; f++)
    {
        var g = c[f], h = d[f];
        if (g != h)
        {
            return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1
        }
    }
    return c.length != d.length ? c.length - d.length : a < b ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function (a)
{
    a = "" + a;
    return!goog.string.encodeUriRegExp_.test(a) ? encodeURIComponent(a) : a
};
goog.string.urlDecode = function (a)
{
    return decodeURIComponent(a.replace(/\+/g, " "))
};
goog.string.newLineToBr = function (a, b)
{
    return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>")
};
goog.string.htmlEscape = function (a, b)
{
    if (b)
    {
        return a.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
    }
    if (!goog.string.allRe_.test(a))
    {
        return a
    }
    -1 != a.indexOf("&") && (a = a.replace(goog.string.amperRe_, "&amp;"));
    -1 != a.indexOf("<") && (a = a.replace(goog.string.ltRe_, "&lt;"));
    -1 != a.indexOf(">") && (a = a.replace(goog.string.gtRe_, "&gt;"));
    -1 != a.indexOf('"') && (a = a.replace(goog.string.quotRe_, "&quot;"));
    return a
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function (a)
{
    return goog.string.contains(a, "&") ? "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a
};
goog.string.unescapeEntitiesUsingDom_ = function (a)
{
    var b = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'}, c = document.createElement("div");
    return a.replace(goog.string.HTML_ENTITY_PATTERN_, function (a, e)
    {
        var f = b[a];
        if (f)
        {
            return f
        }
        if ("#" == e.charAt(0))
        {
            var g = Number("0" + e.substr(1));
            isNaN(g) || (f = String.fromCharCode(g))
        }
        f || (c.innerHTML = a + " ", f = c.firstChild.nodeValue.slice(0, -1));
        return b[a] = f
    })
};
goog.string.unescapePureXmlEntities_ = function (a)
{
    return a.replace(/&([^;]+);/g, function (a, c)
    {
        switch (c)
        {
            case "amp":
                return"&";
            case "lt":
                return"<";
            case "gt":
                return">";
            case "quot":
                return'"';
            default:
                if ("#" == c.charAt(0))
                {
                    var d = Number("0" + c.substr(1));
                    if (!isNaN(d))
                    {
                        return String.fromCharCode(d)
                    }
                }
                return a
        }
    })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function (a, b)
{
    return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b)
};
goog.string.stripQuotes = function (a, b)
{
    for (var c = b.length, d = 0; d < c; d++)
    {
        var e = 1 == c ? b : b.charAt(d);
        if (a.charAt(0) == e && a.charAt(a.length - 1) == e)
        {
            return a.substring(1, a.length - 1)
        }
    }
    return a
};
goog.string.truncate = function (a, b, c)
{
    c && (a = goog.string.unescapeEntities(a));
    a.length > b && (a = a.substring(0, b - 3) + "...");
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.truncateMiddle = function (a, b, c, d)
{
    c && (a = goog.string.unescapeEntities(a));
    if (d && a.length > b)
    {
        d > b && (d = b);
        var e = a.length - d, a = a.substring(0, b - d) + "..." + a.substring(e)
    } else
    {
        a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e))
    }
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function (a)
{
    a = "" + a;
    if (a.quote)
    {
        return a.quote()
    }
    for (var b = ['"'], c = 0; c < a.length; c++)
    {
        var d = a.charAt(c), e = d.charCodeAt(0);
        b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d))
    }
    b.push('"');
    return b.join("")
};
goog.string.escapeString = function (a)
{
    for (var b = [], c = 0; c < a.length; c++)
    {
        b[c] = goog.string.escapeChar(a.charAt(c))
    }
    return b.join("")
};
goog.string.escapeChar = function (a)
{
    if (a in goog.string.jsEscapeCache_)
    {
        return goog.string.jsEscapeCache_[a]
    }
    if (a in goog.string.specialEscapeChars_)
    {
        return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a]
    }
    var b = a, c = a.charCodeAt(0);
    if (31 < c && 127 > c)
    {
        b = a
    } else
    {
        if (256 > c)
        {
            if (b = "\\x", 16 > c || 256 < c)
            {
                b += "0"
            }
        } else
        {
            b = "\\u", 4096 > c && (b += "0")
        }
        b += c.toString(16).toUpperCase()
    }
    return goog.string.jsEscapeCache_[a] = b
};
goog.string.toMap = function (a)
{
    for (var b = {}, c = 0; c < a.length; c++)
    {
        b[a.charAt(c)] = !0
    }
    return b
};
goog.string.contains = function (a, b)
{
    return-1 != a.indexOf(b)
};
goog.string.removeAt = function (a, b, c)
{
    var d = a;
    0 <= b && (b < a.length && 0 < c) && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
    return d
};
goog.string.remove = function (a, b)
{
    var c = RegExp(goog.string.regExpEscape(b), "");
    return a.replace(c, "")
};
goog.string.removeAll = function (a, b)
{
    var c = RegExp(goog.string.regExpEscape(b), "g");
    return a.replace(c, "")
};
goog.string.regExpEscape = function (a)
{
    return("" + a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function (a, b)
{
    return Array(b + 1).join(a)
};
goog.string.padNumber = function (a, b, c)
{
    a = goog.isDef(c) ? a.toFixed(c) : "" + a;
    c = a.indexOf(".");
    -1 == c && (c = a.length);
    return goog.string.repeat("0", Math.max(0, b - c)) + a
};
goog.string.makeSafe = function (a)
{
    return null == a ? "" : "" + a
};
goog.string.buildString = function (a)
{
    return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function ()
{
    return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function (a, b)
{
    for (var c = 0, d = goog.string.trim("" + a).split("."), e = goog.string.trim("" + b).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++)
    {
        var h = d[g] || "", i = e[g] || "", j = RegExp("(\\d*)(\\D*)", "g"), k = RegExp("(\\d*)(\\D*)", "g");
        do {
            var l = j.exec(h) || ["", "", ""], n = k.exec(i) || ["", "", ""];
            if (0 == l[0].length && 0 == n[0].length)
            {
                break
            }
            var c = 0 == l[1].length ? 0 : parseInt(l[1], 10), m = 0 == n[1].length ? 0 : parseInt(n[1], 10), c = goog.string.compareElements_(c, m) || goog.string.compareElements_(0 == l[2].length, 0 == n[2].length) || goog.string.compareElements_(l[2], n[2])
        } while (0 == c)
    }
    return c
};
goog.string.compareElements_ = function (a, b)
{
    return a < b ? -1 : a > b ? 1 : 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function (a)
{
    for (var b = 0, c = 0; c < a.length; ++c)
    {
        b = 31 * b + a.charCodeAt(c), b %= goog.string.HASHCODE_MAX_
    }
    return b
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function ()
{
    return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function (a)
{
    var b = Number(a);
    return 0 == b && goog.string.isEmpty(a) ? NaN : b
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function (a)
{
    return goog.string.toCamelCaseCache_[a] || (goog.string.toCamelCaseCache_[a] = ("" + a).replace(/\-([a-z])/g, function (a, c)
    {
        return c.toUpperCase()
    }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function (a)
{
    return goog.string.toSelectorCaseCache_[a] || (goog.string.toSelectorCaseCache_[a] = ("" + a).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.array = {};
goog.NATIVE_ARRAY_PROTOTYPES = !0;
goog.array.peek = function (a)
{
    return a[a.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, b, c)
} : function (a, b, c)
{
    c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
    if (goog.isString(a))
    {
        return!goog.isString(b) || 1 != b.length ? -1 : a.indexOf(b, c)
    }
    for (; c < a.length; c++)
    {
        if (c in a && a[c] === b)
        {
            return c
        }
    }
    return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, b, null == c ? a.length - 1 : c)
} : function (a, b, c)
{
    c = null == c ? a.length - 1 : c;
    0 > c && (c = Math.max(0, a.length + c));
    if (goog.isString(a))
    {
        return!goog.isString(b) || 1 != b.length ? -1 : a.lastIndexOf(b, c)
    }
    for (; 0 <= c; c--)
    {
        if (c in a && a[c] === b)
        {
            return c
        }
    }
    return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function (a, b, c)
{

    goog.array.ARRAY_PROTOTYPE_.forEach.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        f in e && b.call(c, e[f], f, a)
    }
};
goog.array.forEachRight = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d)
    {
        d in e && b.call(c, e[d], d, a)
    }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.filter.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++)
    {
        if (h in g)
        {
            var i = g[h];
            b.call(c, i, h, a) && (e[f++] = i)
        }
    }
    return e
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.map.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0; g < d; g++)
    {
        g in f && (e[g] = b.call(c, f[g], g, a))
    }
    return e
};
goog.array.reduce = function (a, b, c, d)
{
    if (a.reduce)
    {
        return d ? a.reduce(goog.bind(b, d), c) : a.reduce(b, c)
    }
    var e = c;
    goog.array.forEach(a, function (c, g)
    {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.reduceRight = function (a, b, c, d)
{
    if (a.reduceRight)
    {
        return d ? a.reduceRight(goog.bind(b, d), c) : a.reduceRight(b, c)
    }
    var e = c;
    goog.array.forEachRight(a, function (c, g)
    {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.some.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && b.call(c, e[f], f, a))
        {
            return!0
        }
    }
    return!1
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function (a, b, c)
{

    return goog.array.ARRAY_PROTOTYPE_.every.call(a, b, c)
} : function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && !b.call(c, e[f], f, a))
        {
            return!1
        }
    }
    return!0
};
goog.array.find = function (a, b, c)
{
    b = goog.array.findIndex(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndex = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
    {
        if (f in e && b.call(c, e[f], f, a))
        {
            return f
        }
    }
    return-1
};
goog.array.findRight = function (a, b, c)
{
    b = goog.array.findIndexRight(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndexRight = function (a, b, c)
{
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; d--)
    {
        if (d in e && b.call(c, e[d], d, a))
        {
            return d
        }
    }
    return-1
};
goog.array.contains = function (a, b)
{
    return 0 <= goog.array.indexOf(a, b)
};
goog.array.isEmpty = function (a)
{
    return 0 == a.length
};
goog.array.clear = function (a)
{
    if (!goog.isArray(a))
    {
        for (var b = a.length - 1; 0 <= b; b--)
        {
            delete a[b]
        }
    }
    a.length = 0
};
goog.array.insert = function (a, b)
{
    goog.array.contains(a, b) || a.push(b)
};
goog.array.insertAt = function (a, b, c)
{
    goog.array.splice(a, c, 0, b)
};
goog.array.insertArrayAt = function (a, b, c)
{
    goog.partial(goog.array.splice, a, c, 0).apply(null, b)
};
goog.array.insertBefore = function (a, b, c)
{
    var d;
    2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d)
};
goog.array.remove = function (a, b)
{
    var c = goog.array.indexOf(a, b), d;
    (d = 0 <= c) && goog.array.removeAt(a, c);
    return d
};
goog.array.removeAt = function (a, b)
{

    return 1 == goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length
};
goog.array.removeIf = function (a, b, c)
{
    b = goog.array.findIndex(a, b, c);
    return 0 <= b ? (goog.array.removeAt(a, b), !0) : !1
};
goog.array.concat = function (a)
{
    return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function (a)
{
    if (goog.isArray(a))
    {
        return goog.array.concat(a)
    }
    for (var b = [], c = 0, d = a.length; c < d; c++)
    {
        b[c] = a[c]
    }
    return b
};
goog.array.toArray = function (a)
{
    return goog.isArray(a) ? goog.array.concat(a) : goog.array.clone(a)
};
goog.array.extend = function (a, b)
{
    for (var c = 1; c < arguments.length; c++)
    {
        var d = arguments[c], e;
        if (goog.isArray(d) || (e = goog.isArrayLike(d)) && d.hasOwnProperty("callee"))
        {
            a.push.apply(a, d)
        } else
        {
            if (e)
            {
                for (var f = a.length, g = d.length, h = 0; h < g; h++)
                {
                    a[f + h] = d[h]
                }
            } else
            {
                a.push(d)
            }
        }
    }
};
goog.array.splice = function (a, b, c, d)
{

    return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function (a, b, c)
{

    return 2 >= arguments.length ? goog.array.ARRAY_PROTOTYPE_.slice.call(a, b) : goog.array.ARRAY_PROTOTYPE_.slice.call(a, b, c)
};
goog.array.removeDuplicates = function (a, b)
{
    for (var c = b || a, d = {}, e = 0, f = 0; f < a.length;)
    {
        var g = a[f++], h = goog.isObject(g) ? "o" + goog.getUid(g) : (typeof g).charAt(0) + g;
        Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, c[e++] = g)
    }
    c.length = e
};
goog.array.binarySearch = function (a, b, c)
{
    return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b)
};
goog.array.binarySelect = function (a, b, c)
{
    return goog.array.binarySearch_(a, b, !0, void 0, c)
};
goog.array.binarySearch_ = function (a, b, c, d, e)
{
    for (var f = 0, g = a.length, h; f < g;)
    {
        var i = f + g >> 1, j;
        j = c ? b.call(e, a[i], i, a) : b(d, a[i]);
        0 < j ? f = i + 1 : (g = i, h = !j)
    }
    return h ? f : ~f
};
goog.array.sort = function (a, b)
{

    goog.array.ARRAY_PROTOTYPE_.sort.call(a, b || goog.array.defaultCompare)
};
goog.array.stableSort = function (a, b)
{
    for (var c = 0; c < a.length; c++)
    {
        a[c] = {index:c, value:a[c]}
    }
    var d = b || goog.array.defaultCompare;
    goog.array.sort(a, function (a, b)
    {
        return d(a.value, b.value) || a.index - b.index
    });
    for (c = 0; c < a.length; c++)
    {
        a[c] = a[c].value
    }
};
goog.array.sortObjectsByKey = function (a, b, c)
{
    var d = c || goog.array.defaultCompare;
    goog.array.sort(a, function (a, c)
    {
        return d(a[b], c[b])
    })
};
goog.array.isSorted = function (a, b, c)
{
    for (var b = b || goog.array.defaultCompare, d = 1; d < a.length; d++)
    {
        var e = b(a[d - 1], a[d]);
        if (0 < e || 0 == e && c)
        {
            return!1
        }
    }
    return!0
};
goog.array.equals = function (a, b, c)
{
    if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length)
    {
        return!1
    }
    for (var d = a.length, c = c || goog.array.defaultCompareEquality, e = 0; e < d; e++)
    {
        if (!c(a[e], b[e]))
        {
            return!1
        }
    }
    return!0
};
goog.array.compare = function (a, b, c)
{
    return goog.array.equals(a, b, c)
};
goog.array.compare3 = function (a, b, c)
{
    for (var c = c || goog.array.defaultCompare, d = Math.min(a.length, b.length), e = 0; e < d; e++)
    {
        var f = c(a[e], b[e]);
        if (0 != f)
        {
            return f
        }
    }
    return goog.array.defaultCompare(a.length, b.length)
};
goog.array.defaultCompare = function (a, b)
{
    return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function (a, b)
{
    return a === b
};
goog.array.binaryInsert = function (a, b, c)
{
    c = goog.array.binarySearch(a, b, c);
    return 0 > c ? (goog.array.insertAt(a, b, -(c + 1)), !0) : !1
};
goog.array.binaryRemove = function (a, b, c)
{
    b = goog.array.binarySearch(a, b, c);
    return 0 <= b ? goog.array.removeAt(a, b) : !1
};
goog.array.bucket = function (a, b)
{
    for (var c = {}, d = 0; d < a.length; d++)
    {
        var e = a[d], f = b(e, d, a);
        goog.isDef(f) && (c[f] || (c[f] = [])).push(e)
    }
    return c
};
goog.array.repeat = function (a, b)
{
    for (var c = [], d = 0; d < b; d++)
    {
        c[d] = a
    }
    return c
};
goog.array.flatten = function (a)
{
    for (var b = [], c = 0; c < arguments.length; c++)
    {
        var d = arguments[c];
        goog.isArray(d) ? b.push.apply(b, goog.array.flatten.apply(null, d)) : b.push(d)
    }
    return b
};
goog.array.rotate = function (a, b)
{

    a.length && (b %= a.length, 0 < b ? goog.array.ARRAY_PROTOTYPE_.unshift.apply(a, a.splice(-b, b)) : 0 > b && goog.array.ARRAY_PROTOTYPE_.push.apply(a, a.splice(0, -b)));
    return a
};
goog.array.zip = function (a)
{
    if (!arguments.length)
    {
        return[]
    }
    for (var b = [], c = 0; ; c++)
    {
        for (var d = [], e = 0; e < arguments.length; e++)
        {
            var f = arguments[e];
            if (c >= f.length)
            {
                return b
            }
            d.push(f[c])
        }
        b.push(d)
    }
};
goog.array.shuffle = function (a, b)
{
    for (var c = b || Math.random, d = a.length - 1; 0 < d; d--)
    {
        var e = Math.floor(c() * (d + 1)), f = a[d];
        a[d] = a[e];
        a[e] = f
    }
};
goog.structs = {};
goog.structs.Queue = function ()
{
    this.elements_ = []
};
goog.structs.Queue.prototype.head_ = 0;
goog.structs.Queue.prototype.tail_ = 0;
goog.structs.Queue.prototype.enqueue = function (a)
{
    this.elements_[this.tail_++] = a
};
goog.structs.Queue.prototype.dequeue = function ()
{
    if (this.head_ != this.tail_)
    {
        var a = this.elements_[this.head_];
        delete this.elements_[this.head_];
        this.head_++;
        return a
    }
};
goog.structs.Queue.prototype.peek = function ()
{
    return this.head_ == this.tail_ ? void 0 : this.elements_[this.head_]
};
goog.structs.Queue.prototype.getCount = function ()
{
    return this.tail_ - this.head_
};
goog.structs.Queue.prototype.isEmpty = function ()
{
    return 0 == this.tail_ - this.head_
};
goog.structs.Queue.prototype.clear = function ()
{
    this.tail_ = this.head_ = this.elements_.length = 0
};
goog.structs.Queue.prototype.contains = function (a)
{
    return goog.array.contains(this.elements_, a)
};
goog.structs.Queue.prototype.remove = function (a)
{
    a = goog.array.indexOf(this.elements_, a);
    if (0 > a)
    {
        return!1
    }
    a == this.head_ ? this.dequeue() : (goog.array.removeAt(this.elements_, a), this.tail_--);
    return!0
};
goog.structs.Queue.prototype.getValues = function ()
{
    return this.elements_.slice(this.head_, this.tail_)
};
var Box2D = {Common:{}};

Box2D.Common.Math = {};
Box2D.Common.Math.b2Vec2 = function (a, b)
{

    this.x = a;
    this.y = b
};
Box2D.Common.Math.b2Vec2._freeCache = [];
Box2D.Common.Math.b2Vec2.Get = function (a, b)
{

    if (0 < Box2D.Common.Math.b2Vec2._freeCache.length)
    {
        var c = Box2D.Common.Math.b2Vec2._freeCache.pop();
        c.Set(a, b);
        return c
    }
    return new Box2D.Common.Math.b2Vec2(a, b)
};
Box2D.Common.Math.b2Vec2.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Vec2._freeCache.push(a))
};
Box2D.Common.Math.b2Vec2.prototype.SetZero = function ()
{
    this.y = this.x = 0
};
Box2D.Common.Math.b2Vec2.prototype.Set = function (a, b)
{
    this.x = a;
    this.y = b
};
Box2D.Common.Math.b2Vec2.prototype.SetV = function (a)
{
    this.x = a.x;
    this.y = a.y
};
Box2D.Common.Math.b2Vec2.prototype.GetNegative = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(-this.x, -this.y)
};
Box2D.Common.Math.b2Vec2.prototype.NegativeSelf = function ()
{
    this.x = -this.x;
    this.y = -this.y
};
Box2D.Common.Math.b2Vec2.prototype.Copy = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(this.x, this.y)
};
Box2D.Common.Math.b2Vec2.prototype.Add = function (a)
{
    this.x += a.x;
    this.y += a.y
};
Box2D.Common.Math.b2Vec2.prototype.Subtract = function (a)
{
    this.x -= a.x;
    this.y -= a.y
};
Box2D.Common.Math.b2Vec2.prototype.Multiply = function (a)
{
    this.x *= a;
    this.y *= a
};
Box2D.Common.Math.b2Vec2.prototype.MulM = function (a)
{
    var b = this.x;
    this.x = a.col1.x * b + a.col2.x * this.y;
    this.y = a.col1.y * b + a.col2.y * this.y
};
Box2D.Common.Math.b2Vec2.prototype.MulTM = function (a)
{
    var b = this.x * a.col1.x + this.y * a.col1.y;
    this.y = this.x * a.col2.x + this.y * a.col2.y;
    this.x = b
};
Box2D.Common.Math.b2Vec2.prototype.CrossVF = function (a)
{
    var b = this.x;
    this.x = a * this.y;
    this.y = -a * b
};
Box2D.Common.Math.b2Vec2.prototype.CrossFV = function (a)
{
    var b = this.x;
    this.x = -a * this.y;
    this.y = a * b
};
Box2D.Common.Math.b2Vec2.prototype.MinV = function (a)
{
    this.x = Math.min(this.x, a.x);
    this.y = Math.min(this.y, a.y)
};
Box2D.Common.Math.b2Vec2.prototype.MaxV = function (a)
{
    this.x = Math.max(this.x, a.x);
    this.y = Math.max(this.y, a.y)
};
Box2D.Common.Math.b2Vec2.prototype.Abs = function ()
{
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y)
};
Box2D.Common.Math.b2Vec2.prototype.Length = function ()
{
    return Math.sqrt(this.LengthSquared())
};
Box2D.Common.Math.b2Vec2.prototype.LengthSquared = function ()
{
    return this.x * this.x + this.y * this.y
};
Box2D.Common.Math.b2Vec2.prototype.Normalize = function ()
{
    var a = this.Length();
    if (a < Number.MIN_VALUE)
    {
        return 0
    }
    var b = 1 / a;
    this.x *= b;
    this.y *= b;
    return a
};
Box2D.Common.Math.b2Vec2.prototype.IsValid = function ()
{
    return isFinite(this.x) && isFinite(this.y)
};
Box2D.Common.b2Settings = {};
Box2D.Common.b2Settings.b2MixFriction = function (a, b)
{
    return Math.sqrt(a * b)
};
Box2D.Common.b2Settings.b2MixRestitution = function (a, b)
{
    return a > b ? a : b
};
Box2D.Common.b2Settings.b2Assert = function (a)
{
    if (!a)
    {
        throw"Assertion Failed";
    }
};
Box2D.Common.b2Settings.VERSION = "2.1a-playcraft";
Box2D.Common.b2Settings.USHRT_MAX = 65535;
Box2D.Common.b2Settings.b2_maxManifoldPoints = 2;
Box2D.Common.b2Settings.b2_aabbExtension = 0.1;
Box2D.Common.b2Settings.b2_aabbMultiplier = 2;
Box2D.Common.b2Settings.b2_polygonRadius = 2 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_linearSlop = 0.0050;
Box2D.Common.b2Settings.b2_angularSlop = 2 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_toiSlop = 8 * Box2D.Common.b2Settings.b2_linearSlop;
Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland = 32;
Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland = 32;
Box2D.Common.b2Settings.b2_velocityThreshold = 1;
Box2D.Common.b2Settings.b2_maxLinearCorrection = 0.2;
Box2D.Common.b2Settings.b2_maxAngularCorrection = 8 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_maxTranslation = 2;
Box2D.Common.b2Settings.b2_maxTranslationSquared = Box2D.Common.b2Settings.b2_maxTranslation * Box2D.Common.b2Settings.b2_maxTranslation;
Box2D.Common.b2Settings.b2_maxRotation = 0.5 * Math.PI;
Box2D.Common.b2Settings.b2_maxRotationSquared = Box2D.Common.b2Settings.b2_maxRotation * Box2D.Common.b2Settings.b2_maxRotation;
Box2D.Common.b2Settings.b2_contactBaumgarte = 0.2;
Box2D.Common.b2Settings.b2_timeToSleep = 0.5;
Box2D.Common.b2Settings.b2_linearSleepTolerance = 0.01;
Box2D.Common.b2Settings.b2_linearSleepToleranceSquared = Box2D.Common.b2Settings.b2_linearSleepTolerance * Box2D.Common.b2Settings.b2_linearSleepTolerance;
Box2D.Common.b2Settings.b2_angularSleepTolerance = 2 / 180 * Math.PI;
Box2D.Common.b2Settings.b2_angularSleepToleranceSquared = Box2D.Common.b2Settings.b2_angularSleepTolerance * Box2D.Common.b2Settings.b2_angularSleepTolerance;
Box2D.Common.b2Settings.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
Box2D.Common.Math.b2Mat22 = function ()
{

    this.col1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.col2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.SetIdentity()
};
Box2D.Common.Math.b2Mat22._freeCache = [];
Box2D.Common.Math.b2Mat22.Get = function ()
{

    if (0 < Box2D.Common.Math.b2Mat22._freeCache.length)
    {
        var a = Box2D.Common.Math.b2Mat22._freeCache.pop();
        a.SetZero();
        return a
    }
    return new Box2D.Common.Math.b2Mat22
};
Box2D.Common.Math.b2Mat22.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Mat22._freeCache.push(a))
};
Box2D.Common.Math.b2Mat22.FromAngle = function (a)
{
    var b = Box2D.Common.Math.b2Mat22.Get();
    b.Set(a);
    return b
};
Box2D.Common.Math.b2Mat22.FromVV = function (a, b)
{
    var c = Box2D.Common.Math.b2Mat22.Get();
    c.SetVV(a, b);
    return c
};
Box2D.Common.Math.b2Mat22.prototype.Set = function (a)
{
    var b = Math.cos(a), a = Math.sin(a);
    this.col1.Set(b, a);
    this.col2.Set(-a, b)
};
Box2D.Common.Math.b2Mat22.prototype.SetVV = function (a, b)
{
    this.col1.SetV(a);
    this.col2.SetV(b)
};
Box2D.Common.Math.b2Mat22.prototype.Copy = function ()
{
    var a = Box2D.Common.Math.b2Mat22.Get();
    a.SetM(this);
    return a
};
Box2D.Common.Math.b2Mat22.prototype.SetM = function (a)
{
    this.col1.SetV(a.col1);
    this.col2.SetV(a.col2)
};
Box2D.Common.Math.b2Mat22.prototype.AddM = function (a)
{
    this.col1.Add(a.col1);
    this.col2.Add(a.col2)
};
Box2D.Common.Math.b2Mat22.prototype.SetIdentity = function ()
{
    this.col1.Set(1, 0);
    this.col2.Set(0, 1)
};
Box2D.Common.Math.b2Mat22.prototype.SetZero = function ()
{
    this.col1.Set(0, 0);
    this.col2.Set(0, 0)
};
Box2D.Common.Math.b2Mat22.prototype.GetAngle = function ()
{
    return Math.atan2(this.col1.y, this.col1.x)
};
Box2D.Common.Math.b2Mat22.prototype.GetInverse = function (a)
{
    var b = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    0 !== b && (b = 1 / b);
    a.col1.x = b * this.col2.y;
    a.col2.x = -b * this.col2.x;
    a.col1.y = -b * this.col1.y;
    a.col2.y = b * this.col1.x;
    return a
};
Box2D.Common.Math.b2Mat22.prototype.Solve = function (a, b, c)
{
    var d = this.col1.x * this.col2.y - this.col2.x * this.col1.y;
    0 !== d && (d = 1 / d);
    a.x = d * (this.col2.y * b - this.col2.x * c);
    a.y = d * (this.col1.x * c - this.col1.y * b);
    return a
};
Box2D.Common.Math.b2Mat22.prototype.Abs = function ()
{
    this.col1.Abs();
    this.col2.Abs()
};
Box2D.Common.Math.b2Math = {};
Box2D.Common.Math.b2Math.Dot = function (a, b)
{
    return a.x * b.x + a.y * b.y
};
Box2D.Common.Math.b2Math.CrossVV = function (a, b)
{
    return a.x * b.y - a.y * b.x
};
Box2D.Common.Math.b2Math.CrossVF = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(b * a.y, -b * a.x)
};
Box2D.Common.Math.b2Math.CrossFV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(-a * b.y, a * b.x)
};
Box2D.Common.Math.b2Math.MulMV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.col1.x * b.x + a.col2.x * b.y, a.col1.y * b.x + a.col2.y * b.y)
};
Box2D.Common.Math.b2Math.MulTMV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(b, a.col1), Box2D.Common.Math.b2Math.Dot(b, a.col2))
};
Box2D.Common.Math.b2Math.MulX = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.MulMV(a.R, b);
    c.x += a.position.x;
    c.y += a.position.y;
    return c
};
Box2D.Common.Math.b2Math.MulXT = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.SubtractVV(b, a.position), d = c.x * a.R.col1.x + c.y * a.R.col1.y;
    c.y = c.x * a.R.col2.x + c.y * a.R.col2.y;
    c.x = d;
    return c
};
Box2D.Common.Math.b2Math.AddVV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.x + b.x, a.y + b.y)
};
Box2D.Common.Math.b2Math.SubtractVV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a.x - b.x, a.y - b.y)
};
Box2D.Common.Math.b2Math.Distance = function (a, b)
{
    return Math.sqrt(Box2D.Common.Math.b2Math.DistanceSquared(a, b))
};
Box2D.Common.Math.b2Math.DistanceSquared = function (a, b)
{
    var c = a.x - b.x, d = a.y - b.y;
    return c * c + d * d
};
Box2D.Common.Math.b2Math.MulFV = function (a, b)
{
    return Box2D.Common.Math.b2Vec2.Get(a * b.x, a * b.y)
};
Box2D.Common.Math.b2Math.AddMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.AddVV(a.col1, b.col1), d = Box2D.Common.Math.b2Math.AddVV(a.col2, b.col2), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.MulMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Math.MulMV(a, b.col1), d = Box2D.Common.Math.b2Math.MulMV(a, b.col2), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.MulTMM = function (a, b)
{
    var c = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(a.col1, b.col1), Box2D.Common.Math.b2Math.Dot(a.col2, b.col1)), d = Box2D.Common.Math.b2Vec2.Get(Box2D.Common.Math.b2Math.Dot(a.col1, b.col2), Box2D.Common.Math.b2Math.Dot(a.col2, b.col2)), e = Box2D.Common.Math.b2Mat22.FromVV(c, d);
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    return e
};
Box2D.Common.Math.b2Math.AbsV = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(Math.abs(a.x), Math.abs(a.y))
};
Box2D.Common.Math.b2Math.AbsM = function (a)
{
    var b = Box2D.Common.Math.b2Math.AbsV(a.col1), a = Box2D.Common.Math.b2Math.AbsV(a.col2), c = Box2D.Common.Math.b2Mat22.FromVV(b, a);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(a);
    return c
};
Box2D.Common.Math.b2Math.Clamp = function (a, b, c)
{
    return a < b ? b : a > c ? c : a
};
Box2D.Common.Math.b2Math.ClampV = function (a, b, c)
{
    var d = Box2D.Common.Math.b2Math.Clamp(a.x, b.x, c.x), a = Box2D.Common.Math.b2Math.Clamp(a.y, b.y, c.y);
    return Box2D.Common.Math.b2Vec2.Get(d, a)
};
Box2D.Dynamics = {};
Box2D.Dynamics.Joints = {};
Box2D.Dynamics.Joints.b2JointEdge = function ()
{
};
Box2D.Dynamics.Joints.b2Joint = function (a)
{
    this.m_edgeA = new Box2D.Dynamics.Joints.b2JointEdge;
    this.m_edgeB = new Box2D.Dynamics.Joints.b2JointEdge;
    this.m_localCenterA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localCenterB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    Box2D.Common.b2Settings.b2Assert(a.bodyA != a.bodyB);
    this.m_type = a.type;
    this.m_next = this.m_prev = null;
    this.m_bodyA = a.bodyA;
    this.m_bodyB = a.bodyB;
    this.m_collideConnected = a.collideConnected
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetType = function ()
{
    return this.m_type
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorA = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetAnchorB = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionForce = function ()
{
    return null
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyA = function ()
{
    return this.m_bodyA
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetBodyB = function ()
{
    return this.m_bodyB
};
Box2D.Dynamics.Joints.b2Joint.prototype.GetNext = function ()
{
    return this.m_next
};
Box2D.Dynamics.Joints.b2Joint.prototype.IsActive = function ()
{
    return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
Box2D.Dynamics.Joints.b2Joint.Create = function (a)
{
    return a.Create()
};
Box2D.Dynamics.Joints.b2Joint.prototype.InitVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.SolveVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.FinalizeVelocityConstraints = function ()
{
};
Box2D.Dynamics.Joints.b2Joint.prototype.SolvePositionConstraints = function ()
{
    return!1
};
Box2D.Dynamics.Joints.b2Joint.e_unknownJoint = 0;
Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint = 1;
Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint = 2;
Box2D.Dynamics.Joints.b2Joint.e_distanceJoint = 3;
Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint = 4;
Box2D.Dynamics.Joints.b2Joint.e_mouseJoint = 5;
Box2D.Dynamics.Joints.b2Joint.e_gearJoint = 6;
Box2D.Dynamics.Joints.b2Joint.e_lineJoint = 7;
Box2D.Dynamics.Joints.b2Joint.e_weldJoint = 8;
Box2D.Dynamics.Joints.b2Joint.e_frictionJoint = 9;
Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit = 0;
Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit = 1;
Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit = 2;
Box2D.Dynamics.Joints.b2Joint.e_equalLimits = 3;
Box2D.Dynamics.Joints.b2LineJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat22;
    this.m_impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_localXAxis1.SetV(a.localAxisA);
    this.m_localYAxis1.x = -this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_impulse.SetZero();
    this.m_motorImpulse = this.m_motorMass = 0;
    this.m_lowerTranslation = a.lowerTranslation;
    this.m_upperTranslation = a.upperTranslation;
    this.m_maxMotorForce = a.maxMotorForce;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero()
};
goog.inherits(Box2D.Dynamics.Joints.b2LineJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), a * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.y
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointTranslation = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.GetWorldPoint(this.m_localAnchor1), d = b.GetWorldPoint(this.m_localAnchor2), b = d.x - c.x, c = d.y - c.y, a = a.GetWorldVector(this.m_localXAxis1);
    return a.x * b + a.y * c
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetJointSpeed = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f;
    c = b.m_sweep.c.x + g - (a.m_sweep.c.x + d);
    var f = b.m_sweep.c.y + h - (a.m_sweep.c.y + e), i = a.GetWorldVector(this.m_localXAxis1), j = a.m_linearVelocity, k = b.m_linearVelocity, a = a.m_angularVelocity, b = b.m_angularVelocity;
    return c * -a * i.y + f * a * i.x + (i.x * (k.x + -b * h - j.x - -a * e) + i.y * (k.y + b * g - j.y - a * d))
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableLimit = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerTranslation
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperTranslation
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_lowerTranslation = a;
    this.m_upperTranslation = b
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.IsMotorEnabled = function ()
{
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.EnableMotor = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SetMaxMotorForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_maxMotorForce = a
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMaxMotorForce = function ()
{
    return this.m_maxMotorForce
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.GetMotorForce = function ()
{
    return this.m_motorImpulse
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d, e = 0;
    this.m_localCenterA.SetV(b.GetLocalCenter());
    this.m_localCenterB.SetV(c.GetLocalCenter());
    var f = b.GetTransform();
    c.GetTransform();
    d = b.m_xf.R;
    var g = this.m_localAnchor1.x - this.m_localCenterA.x, h = this.m_localAnchor1.y - this.m_localCenterA.y, e = d.col1.x * g + d.col2.x * h, h = d.col1.y * g + d.col2.y * h, g = e;
    d = c.m_xf.R;
    var i = this.m_localAnchor2.x - this.m_localCenterB.x, j = this.m_localAnchor2.y - this.m_localCenterB.y, e = d.col1.x * i + d.col2.x * j, j = d.col1.y * i + d.col2.y * j, i = e;
    d = c.m_sweep.c.x + i - b.m_sweep.c.x - g;
    e = c.m_sweep.c.y + j - b.m_sweep.c.y - h;
    this.m_invMassA = b.m_invMass;
    this.m_invMassB = c.m_invMass;
    this.m_invIA = b.m_invI;
    this.m_invIB = c.m_invI;
    this.m_axis.SetV(Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localXAxis1));
    this.m_a1 = (d + g) * this.m_axis.y - (e + h) * this.m_axis.x;
    this.m_a2 = i * this.m_axis.y - j * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
    this.m_perp.SetV(Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localYAxis1));
    this.m_s1 = (d + g) * this.m_perp.y - (e + h) * this.m_perp.x;
    this.m_s2 = i * this.m_perp.y - j * this.m_perp.x;
    f = this.m_invMassA;
    g = this.m_invMassB;
    h = this.m_invIA;
    i = this.m_invIB;
    this.m_K.col1.x = f + g + h * this.m_s1 * this.m_s1 + i * this.m_s2 * this.m_s2;
    this.m_K.col1.y = h * this.m_s1 * this.m_a1 + i * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = f + g + h * this.m_a1 * this.m_a1 + i * this.m_a2 * this.m_a2;
    this.m_enableLimit ? (d = this.m_axis.x * d + this.m_axis.y * e, Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits : d <= this.m_lowerTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit && (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit, this.m_impulse.y = 0) : d >= this.m_upperTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit, this.m_impulse.y = 0) : (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse.y = 0)) : this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    !1 == this.m_enableMotor && (this.m_motorImpulse = 0);
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_motorImpulse *= a.dtRatio, a = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x, d = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y, e = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1, f = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2, b.m_linearVelocity.x -=
        this.m_invMassA * a, b.m_linearVelocity.y -= this.m_invMassA * d, b.m_angularVelocity -= this.m_invIA * e, c.m_linearVelocity.x += this.m_invMassB * a, c.m_linearVelocity.y += this.m_invMassB * d, c.m_angularVelocity += this.m_invIB * f) : (this.m_impulse.SetZero(), this.m_motorImpulse = 0)
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = b.m_linearVelocity, e = b.m_angularVelocity, f = c.m_linearVelocity, g = c.m_angularVelocity, h = 0, i = 0, j = 0, k = 0;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (k = this.m_motorMass * (this.m_motorSpeed - (this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e)), h = this.m_motorImpulse, a = a.dt * this.m_maxMotorForce, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + k, -a, a), k = this.m_motorImpulse - h, h = k * this.m_axis.x, i = k * this.m_axis.y, j = k * this.m_a1, k *= this.m_a2, d.x -= this.m_invMassA *
        h, d.y -= this.m_invMassA * i, e -= this.m_invIA * j, f.x += this.m_invMassB * h, f.y += this.m_invMassB * i, g += this.m_invIB * k);
    i = this.m_perp.x * (f.x - d.x) + this.m_perp.y * (f.y - d.y) + this.m_s2 * g - this.m_s1 * e;
    this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit ? (a = this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e, h = this.m_impulse.Copy(), j = Box2D.Common.Math.b2Vec2.Get(0, 0), a = this.m_K.Solve(j, -i, -a), Box2D.Common.Math.b2Vec2.Free(j), this.m_impulse.Add(a), this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? this.m_impulse.y = Math.max(this.m_impulse.y, 0) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_impulse.y = Math.min(this.m_impulse.y, 0)), i = -i - (this.m_impulse.y - h.y) * this.m_K.col2.x, j = 0, j = 0 != this.m_K.col1.x ? i / this.m_K.col1.x + h.x : h.x, this.m_impulse.x = j, a.x = this.m_impulse.x - h.x, a.y = this.m_impulse.y - h.y, Box2D.Common.Math.b2Vec2.Free(h), h = a.x * this.m_perp.x + a.y * this.m_axis.x, i = a.x * this.m_perp.y + a.y * this.m_axis.y, j = a.x * this.m_s1 + a.y * this.m_a1, k = a.x * this.m_s2 + a.y * this.m_a2) : (a = 0, a = 0 != this.m_K.col1.x ? -i /
        this.m_K.col1.x : 0, this.m_impulse.x += a, h = a * this.m_perp.x, i = a * this.m_perp.y, j = a * this.m_s1, k = a * this.m_s2);
    d.x -= this.m_invMassA * h;
    d.y -= this.m_invMassA * i;
    e -= this.m_invIA * j;
    f.x += this.m_invMassB * h;
    f.y += this.m_invMassB * i;
    g += this.m_invIB * k;
    b.m_linearVelocity.SetV(d);
    b.m_angularVelocity = e;
    c.m_linearVelocity.SetV(f);
    c.m_angularVelocity = g
};
Box2D.Dynamics.Joints.b2LineJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.m_sweep.c, d = a.m_sweep.a, e = b.m_sweep.c, f = b.m_sweep.a, g, h = 0, i = 0, j = 0, k = 0, l = g = 0, n = 0, i = !1, m = 0, o = Box2D.Common.Math.b2Mat22.FromAngle(d), j = Box2D.Common.Math.b2Mat22.FromAngle(f);
    g = o;
    var n = this.m_localAnchor1.x - this.m_localCenterA.x, p = this.m_localAnchor1.y - this.m_localCenterA.y, h = g.col1.x * n + g.col2.x * p, p = g.col1.y * n + g.col2.y * p, n = h;
    g = j;
    j = this.m_localAnchor2.x - this.m_localCenterB.x;
    k = this.m_localAnchor2.y - this.m_localCenterB.y;
    h = g.col1.x * j + g.col2.x * k;
    k = g.col1.y * j + g.col2.y * k;
    j = h;
    g = e.x + j - c.x - n;
    h = e.y + k - c.y - p;
    if (this.m_enableLimit)
    {
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(o, this.m_localXAxis1);
        this.m_a1 = (g + n) * this.m_axis.y - (h + p) * this.m_axis.x;
        this.m_a2 = j * this.m_axis.y - k * this.m_axis.x;
        var q = this.m_axis.x * g + this.m_axis.y * h;
        Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? (m = Box2D.Common.Math.b2Math.Clamp(q, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), l = Math.abs(q), i = !0) : q <= this.m_lowerTranslation ? (m = Box2D.Common.Math.b2Math.Clamp(q - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), l = this.m_lowerTranslation - q, i = !0) :
            q >= this.m_upperTranslation && (m = Box2D.Common.Math.b2Math.Clamp(q - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0, Box2D.Common.b2Settings.b2_maxLinearCorrection), l = q - this.m_upperTranslation, i = !0)
    }
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(o, this.m_localYAxis1);
    this.m_s1 = (g + n) * this.m_perp.y - (h + p) * this.m_perp.x;
    this.m_s2 = j * this.m_perp.y - k * this.m_perp.x;
    o = Box2D.Common.Math.b2Vec2.Get(0, 0);
    p = this.m_perp.x * g + this.m_perp.y * h;
    l = Math.max(l, Math.abs(p));
    n = 0;
    i ? (i = this.m_invMassA, j = this.m_invMassB, k = this.m_invIA, g = this.m_invIB, this.m_K.col1.x = i + j + k * this.m_s1 * this.m_s1 + g * this.m_s2 * this.m_s2, this.m_K.col1.y = k * this.m_s1 * this.m_a1 + g * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = i + j + k * this.m_a1 * this.m_a1 + g * this.m_a2 * this.m_a2, this.m_K.Solve(o, -p, -m)) : (i = this.m_invMassA, j = this.m_invMassB, k = this.m_invIA, g = this.m_invIB, m = i + j + k * this.m_s1 * this.m_s1 +
        g * this.m_s2 * this.m_s2, o.x = 0 != m ? -p / m : 0, o.y = 0);
    m = o.x * this.m_perp.x + o.y * this.m_axis.x;
    i = o.x * this.m_perp.y + o.y * this.m_axis.y;
    p = o.x * this.m_s1 + o.y * this.m_a1;
    o = o.x * this.m_s2 + o.y * this.m_a2;
    c.x -= this.m_invMassA * m;
    c.y -= this.m_invMassA * i;
    d -= this.m_invIA * p;
    e.x += this.m_invMassB * m;
    e.y += this.m_invMassB * i;
    f += this.m_invIB * o;
    a.m_sweep.a = d;
    b.m_sweep.a = f;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return l <= Box2D.Common.b2Settings.b2_linearSlop && n <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2JointDef = function ()
{
    this.type = Box2D.Dynamics.Joints.b2Joint.e_unknownJoint;
    this.bodyB = this.bodyA = null;
    this.collideConnected = !1
};
Box2D.Dynamics.Joints.b2LineJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_lineJoint;
    this.localAxisA.Set(1, 0);
    this.enableLimit = !1;
    this.upperTranslation = this.lowerTranslation = 0;
    this.enableMotor = !1;
    this.motorSpeed = this.maxMotorForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2LineJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.localAxisA = this.bodyA.GetLocalVector(d)
};
Box2D.Dynamics.Joints.b2LineJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2LineJoint(this)
};
Box2D.Collision = {};
Box2D.Collision.b2DistanceProxy = function ()
{

    this.m_radius = this.m_count = 0;
    this.m_vertices = []
};
Box2D.Collision.b2DistanceProxy.prototype.SetValues = function (a, b, c)
{
    this.m_count = a;
    this.m_radius = b;
    this.m_vertices = c
};
Box2D.Collision.b2DistanceProxy.prototype.Set = function (a)
{
    a.SetDistanceProxy(this)
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupport = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_count; d++)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return b
};
Box2D.Collision.b2DistanceProxy.prototype.GetSupportVertex = function (a)
{
    return this.m_vertices[this.GetSupport(a)]
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertexCount = function ()
{
    return this.m_count
};
Box2D.Collision.b2DistanceProxy.prototype.GetVertex = function (a)
{
    void 0 === a && (a = 0);
    Box2D.Common.b2Settings.b2Assert(0 <= a && a < this.m_count);
    return this.m_vertices[a]
};
Box2D.Common.Math.b2Sweep = function ()
{

    this.localCenter = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c0 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.c = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.t0 = this.a = this.a0 = null
};
Box2D.Common.Math.b2Sweep.prototype.Set = function (a)
{
    this.localCenter.SetV(a.localCenter);
    this.c0.SetV(a.c0);
    this.c.SetV(a.c);
    this.a0 = a.a0;
    this.a = a.a;
    this.t0 = a.t0
};
Box2D.Common.Math.b2Sweep.prototype.Copy = function ()
{
    var a = new Box2D.Common.Math.b2Sweep;
    a.localCenter.SetV(this.localCenter);
    a.c0.SetV(this.c0);
    a.c.SetV(this.c);
    a.a0 = this.a0;
    a.a = this.a;
    a.t0 = this.t0;
    return a
};
Box2D.Common.Math.b2Sweep.prototype.GetTransform = function (a, b)
{
    void 0 === b && (b = 0);
    a.position.x = (1 - b) * this.c0.x + b * this.c.x;
    a.position.y = (1 - b) * this.c0.y + b * this.c.y;
    a.R.Set((1 - b) * this.a0 + b * this.a);
    var c = a.R;
    a.position.x -= c.col1.x * this.localCenter.x + c.col2.x * this.localCenter.y;
    a.position.y -= c.col1.y * this.localCenter.x + c.col2.y * this.localCenter.y
};
Box2D.Common.Math.b2Sweep.prototype.Advance = function (a)
{
    void 0 === a && (a = 0);
    if (this.t0 < a && 1 - this.t0 > Number.MIN_VALUE)
    {
        var b = (a - this.t0) / (1 - this.t0);
        this.c0.x = (1 - b) * this.c0.x + b * this.c.x;
        this.c0.y = (1 - b) * this.c0.y + b * this.c.y;
        this.a0 = (1 - b) * this.a0 + b * this.a;
        this.t0 = a
    }
};
Box2D.Collision.b2TOIInput = function ()
{

    this.proxyA = new Box2D.Collision.b2DistanceProxy;
    this.proxyB = new Box2D.Collision.b2DistanceProxy;
    this.sweepA = new Box2D.Common.Math.b2Sweep;
    this.sweepB = new Box2D.Common.Math.b2Sweep
};
Box2D.Common.Math.b2Vec3 = function (a, b, c)
{

    this.x = a;
    this.y = b;
    this.z = c
};
Box2D.Common.Math.b2Vec3._freeCache = [];
Box2D.Common.Math.b2Vec3.Get = function (a, b, c)
{

    if (0 < Box2D.Common.Math.b2Vec3._freeCache.length)
    {
        var d = Box2D.Common.Math.b2Vec3._freeCache.pop();
        d.Set(a, b, c);
        return d
    }
    return new Box2D.Common.Math.b2Vec3(a, b, c)
};
Box2D.Common.Math.b2Vec3.Free = function (a)
{
    null != a && ( Box2D.Common.Math.b2Vec3._freeCache.push(a))
};
Box2D.Common.Math.b2Vec3.prototype.SetZero = function ()
{
    this.z = this.y = this.x = 0
};
Box2D.Common.Math.b2Vec3.prototype.Set = function (a, b, c)
{
    this.x = a;
    this.y = b;
    this.z = c
};
Box2D.Common.Math.b2Vec3.prototype.SetV = function (a)
{
    this.x = a.x;
    this.y = a.y;
    this.z = a.z
};
Box2D.Common.Math.b2Vec3.prototype.GetNegative = function ()
{
    return Box2D.Common.Math.b2Vec3.Get(-this.x, -this.y, -this.z)
};
Box2D.Common.Math.b2Vec3.prototype.NegativeSelf = function ()
{
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z
};
Box2D.Common.Math.b2Vec3.prototype.Copy = function ()
{
    return Box2D.Common.Math.b2Vec3.Get(this.x, this.y, this.z)
};
Box2D.Common.Math.b2Vec3.prototype.Add = function (a)
{
    this.x += a.x;
    this.y += a.y;
    this.z += a.z
};
Box2D.Common.Math.b2Vec3.prototype.Subtract = function (a)
{
    this.x -= a.x;
    this.y -= a.y;
    this.z -= a.z
};
Box2D.Common.Math.b2Vec3.prototype.Multiply = function (a)
{
    this.x *= a;
    this.y *= a;
    this.z *= a
};
Box2D.Common.Math.b2Mat33 = function (a, b, c)
{

    this.col1 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col2 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.col3 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    a && this.col1.SetV(a);
    b && this.col2.SetV(b);
    c && this.col3.SetV(c)
};
Box2D.Common.Math.b2Mat33.prototype.SetVVV = function (a, b, c)
{
    this.col1.SetV(a);
    this.col2.SetV(b);
    this.col3.SetV(c)
};
Box2D.Common.Math.b2Mat33.prototype.Copy = function ()
{
    return new Box2D.Common.Math.b2Mat33(this.col1, this.col2, this.col3)
};
Box2D.Common.Math.b2Mat33.prototype.SetM = function (a)
{
    this.col1.SetV(a.col1);
    this.col2.SetV(a.col2);
    this.col3.SetV(a.col3)
};
Box2D.Common.Math.b2Mat33.prototype.AddM = function (a)
{
    this.col1.x += a.col1.x;
    this.col1.y += a.col1.y;
    this.col1.z += a.col1.z;
    this.col2.x += a.col2.x;
    this.col2.y += a.col2.y;
    this.col2.z += a.col2.z;
    this.col3.x += a.col3.x;
    this.col3.y += a.col3.y;
    this.col3.z += a.col3.z
};
Box2D.Common.Math.b2Mat33.prototype.SetIdentity = function ()
{
    this.col1.Set(1, 0, 0);
    this.col2.Set(0, 1, 0);
    this.col3.Set(0, 0, 1)
};
Box2D.Common.Math.b2Mat33.prototype.SetZero = function ()
{
    this.col1.Set(0, 0, 0);
    this.col2.Set(0, 0, 0);
    this.col3.Set(0, 0, 0)
};
Box2D.Common.Math.b2Mat33.prototype.Solve22 = function (a, b, c)
{
    var d = this.col1.x, e = this.col2.x, f = this.col1.y, g = this.col2.y, h = d * g - e * f;
    0 != h && (h = 1 / h);
    a.x = h * (g * b - e * c);
    a.y = h * (d * c - f * b);
    return a
};
Box2D.Common.Math.b2Mat33.prototype.Solve33 = function (a, b, c, d)
{
    var e = this.col1.x, f = this.col1.y, g = this.col1.z, h = this.col2.x, i = this.col2.y, j = this.col2.z, k = this.col3.x, l = this.col3.y, n = this.col3.z, m = e * (i * n - j * l) + f * (j * k - h * n) + g * (h * l - i * k);
    0 != m && (m = 1 / m);
    a.x = m * (b * (i * n - j * l) + c * (j * k - h * n) + d * (h * l - i * k));
    a.y = m * (e * (c * n - d * l) + f * (d * k - b * n) + g * (b * l - c * k));
    a.z = m * (e * (i * d - j * c) + f * (j * b - h * d) + g * (h * c - i * b));
    return a
};
Box2D.Dynamics.Joints.b2PrismaticJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localXAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localYAxis1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_perp = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_K = new Box2D.Common.Math.b2Mat33;
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_localXAxis1.SetV(a.localAxisA);
    this.m_localYAxis1.x = -this.m_localXAxis1.y;
    this.m_localYAxis1.y = this.m_localXAxis1.x;
    this.m_refAngle = a.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = this.m_motorMass = 0;
    this.m_lowerTranslation = a.lowerTranslation;
    this.m_upperTranslation = a.upperTranslation;
    this.m_maxMotorForce = a.maxMotorForce;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_axis.SetZero();
    this.m_perp.SetZero()
};
goog.inherits(Box2D.Dynamics.Joints.b2PrismaticJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), a * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.y
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointTranslation = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.GetWorldPoint(this.m_localAnchor1), d = b.GetWorldPoint(this.m_localAnchor2), b = d.x - c.x, e = d.y - c.y;
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(d);
    a = a.GetWorldVector(this.m_localXAxis1);
    c = a.x * b + a.y * e;
    Box2D.Common.Math.b2Vec2.Free(a);
    return c
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetJointSpeed = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f, f = b.m_sweep.c.x + g - (a.m_sweep.c.x + d), i = b.m_sweep.c.y + h - (a.m_sweep.c.y + e);
    c = a.GetWorldVector(this.m_localXAxis1);
    var j = a.m_linearVelocity, k = b.m_linearVelocity, a = a.m_angularVelocity, b = b.m_angularVelocity, d = f * -a * c.y + i * a * c.x + (c.x * (k.x + -b * h - j.x - -a * e) + c.y * (k.y + b * g - j.y - a * d));
    Box2D.Common.Math.b2Vec2.Free(c);
    return d
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableLimit = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerTranslation
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperTranslation
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_lowerTranslation = a;
    this.m_upperTranslation = b
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.IsMotorEnabled = function ()
{
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.EnableMotor = function (a)
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SetMaxMotorForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_maxMotorForce = a
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.GetMotorForce = function ()
{
    return this.m_motorImpulse
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d, e = 0;
    this.m_localCenterA.SetV(b.GetLocalCenter());
    this.m_localCenterB.SetV(c.GetLocalCenter());
    var f = b.GetTransform();
    d = b.m_xf.R;
    var g = this.m_localAnchor1.x - this.m_localCenterA.x, h = this.m_localAnchor1.y - this.m_localCenterA.y, e = d.col1.x * g + d.col2.x * h, h = d.col1.y * g + d.col2.y * h, g = e;
    d = c.m_xf.R;
    var i = this.m_localAnchor2.x - this.m_localCenterB.x, j = this.m_localAnchor2.y - this.m_localCenterB.y, e = d.col1.x * i + d.col2.x * j, j = d.col1.y * i + d.col2.y * j, i = e;
    d = c.m_sweep.c.x + i - b.m_sweep.c.x - g;
    e = c.m_sweep.c.y + j - b.m_sweep.c.y - h;
    this.m_invMassA = b.m_invMass;
    this.m_invMassB = c.m_invMass;
    this.m_invIA = b.m_invI;
    this.m_invIB = c.m_invI;
    var k = Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localXAxis1);
    this.m_axis.SetV(k);
    Box2D.Common.Math.b2Vec2.Free(k);
    this.m_a1 = (d + g) * this.m_axis.y - (e + h) * this.m_axis.x;
    this.m_a2 = i * this.m_axis.y - j * this.m_axis.x;
    this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
    this.m_motorMass > Number.MIN_VALUE && (this.m_motorMass = 1 / this.m_motorMass);
    f = Box2D.Common.Math.b2Math.MulMV(f.R, this.m_localYAxis1);
    this.m_perp.SetV(f);
    Box2D.Common.Math.b2Vec2.Free(f);
    this.m_s1 = (d + g) * this.m_perp.y - (e + h) * this.m_perp.x;
    this.m_s2 = i * this.m_perp.y - j * this.m_perp.x;
    g = this.m_invMassA;
    h = this.m_invMassB;
    i = this.m_invIA;
    j = this.m_invIB;
    this.m_K.col1.x = g + h + i * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i * this.m_s1 + j * this.m_s2;
    this.m_K.col1.z = i * this.m_s1 * this.m_a1 + j * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i + j;
    this.m_K.col2.z = i * this.m_a1 + j * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = g + h + i * this.m_a1 * this.m_a1 + j * this.m_a2 * this.m_a2;
    this.m_enableLimit ? (d = this.m_axis.x * d + this.m_axis.y * e, Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits : d <= this.m_lowerTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit && (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit, this.m_impulse.z = 0) : d >= this.m_upperTranslation ? this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit, this.m_impulse.z = 0) : (this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse.z = 0)) : this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    !1 == this.m_enableMotor && (this.m_motorImpulse = 0);
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_motorImpulse *= a.dtRatio, a = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x, d = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y, e = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1, g = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) *
        this.m_a2, b.m_linearVelocity.x -= this.m_invMassA * a, b.m_linearVelocity.y -= this.m_invMassA * d, b.m_angularVelocity -= this.m_invIA * e, c.m_linearVelocity.x += this.m_invMassB * a, c.m_linearVelocity.y += this.m_invMassB * d, c.m_angularVelocity += this.m_invIB * g) : (this.m_impulse.SetZero(), this.m_motorImpulse = 0)
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = b.m_linearVelocity, e = b.m_angularVelocity, f = c.m_linearVelocity, g = c.m_angularVelocity, h = 0, i = 0, j = 0, k = 0;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (k = this.m_motorMass * (this.m_motorSpeed - (this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e)), h = this.m_motorImpulse, a = a.dt * this.m_maxMotorForce, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + k, -a, a), k = this.m_motorImpulse - h, h = k * this.m_axis.x, i = k * this.m_axis.y, j = k * this.m_a1, k *= this.m_a2, d.x -= this.m_invMassA *
        h, d.y -= this.m_invMassA * i, e -= this.m_invIA * j, f.x += this.m_invMassB * h, f.y += this.m_invMassB * i, g += this.m_invIB * k);
    j = this.m_perp.x * (f.x - d.x) + this.m_perp.y * (f.y - d.y) + this.m_s2 * g - this.m_s1 * e;
    i = g - e;
    this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit ? (k = this.m_axis.x * (f.x - d.x) + this.m_axis.y * (f.y - d.y) + this.m_a2 * g - this.m_a1 * e, h = this.m_impulse.Copy(), a = Box2D.Common.Math.b2Vec3.Get(0, 0, 0), this.m_K.Solve33(a, -j, -i, -k), this.m_impulse.Add(a), this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? this.m_impulse.z = Math.max(this.m_impulse.z, 0) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
        (this.m_impulse.z = Math.min(this.m_impulse.z, 0)), j = -j - (this.m_impulse.z - h.z) * this.m_K.col3.x, i = -i - (this.m_impulse.z - h.z) * this.m_K.col3.y, k = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(k, j, i), k.x += h.x, k.y += h.y, this.m_impulse.x = k.x, this.m_impulse.y = k.y, Box2D.Common.Math.b2Vec2.Free(k), a.x = this.m_impulse.x - h.x, a.y = this.m_impulse.y - h.y, a.z = this.m_impulse.z - h.z, h = a.x * this.m_perp.x + a.z * this.m_axis.x, i = a.x * this.m_perp.y + a.z *
        this.m_axis.y, j = a.x * this.m_s1 + a.y + a.z * this.m_a1, k = a.x * this.m_s2 + a.y + a.z * this.m_a2, Box2D.Common.Math.b2Vec3.Free(a)) : (a = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(a, -j, -i), this.m_impulse.x += a.x, this.m_impulse.y += a.y, h = a.x * this.m_perp.x, i = a.x * this.m_perp.y, j = a.x * this.m_s1 + a.y, k = a.x * this.m_s2 + a.y, Box2D.Common.Math.b2Vec2.Free(a));
    d.x -= this.m_invMassA * h;
    d.y -= this.m_invMassA * i;
    e -= this.m_invIA * j;
    f.x += this.m_invMassB * h;
    f.y += this.m_invMassB * i;
    g += this.m_invIB * k;
    b.m_linearVelocity.SetV(d);
    b.m_angularVelocity = e;
    c.m_linearVelocity.SetV(f);
    c.m_angularVelocity = g
};
Box2D.Dynamics.Joints.b2PrismaticJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = a.m_sweep.c, d = a.m_sweep.a, e = b.m_sweep.c, f = b.m_sweep.a, g = 0, h = 0, i = 0, j = g = 0, k = 0, l = 0, h = !1, n = 0, m = Box2D.Common.Math.b2Mat22.FromAngle(d), l = this.m_localAnchor1.x - this.m_localCenterA.x, o = this.m_localAnchor1.y - this.m_localCenterA.y, g = m.col1.x * l + m.col2.x * o, o = m.col1.y * l + m.col2.y * o;
    Box2D.Common.Math.b2Mat22.Free(m);
    var l = g, j = Box2D.Common.Math.b2Mat22.FromAngle(f), p = this.m_localAnchor2.x - this.m_localCenterB.x, i = this.m_localAnchor2.y - this.m_localCenterB.y, g = j.col1.x * p + j.col2.x * i, i = j.col1.y * p + j.col2.y * i;
    Box2D.Common.Math.b2Mat22.Free(j);
    p = g;
    g = e.x + p - c.x - l;
    j = e.y + i - c.y - o;
    if (this.m_enableLimit)
    {
        Box2D.Common.Math.b2Vec2.Free(this.m_axis);
        this.m_axis = Box2D.Common.Math.b2Math.MulMV(m, this.m_localXAxis1);
        this.m_a1 = (g + l) * this.m_axis.y - (j + o) * this.m_axis.x;
        this.m_a2 = p * this.m_axis.y - i * this.m_axis.x;
        var q = this.m_axis.x * g + this.m_axis.y * j;
        Math.abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * Box2D.Common.b2Settings.b2_linearSlop ? (n = Box2D.Common.Math.b2Math.Clamp(q, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), k = Math.abs(q), h = !0) : q <= this.m_lowerTranslation ? (n = Box2D.Common.Math.b2Math.Clamp(q - this.m_lowerTranslation + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), k = this.m_lowerTranslation - q, h = !0) :
            q >= this.m_upperTranslation && (n = Box2D.Common.Math.b2Math.Clamp(q - this.m_upperTranslation + Box2D.Common.b2Settings.b2_linearSlop, 0, Box2D.Common.b2Settings.b2_maxLinearCorrection), k = q - this.m_upperTranslation, h = !0)
    }
    Box2D.Common.Math.b2Vec2.Free(this.m_perp);
    this.m_perp = Box2D.Common.Math.b2Math.MulMV(m, this.m_localYAxis1);
    this.m_s1 = (g + l) * this.m_perp.y - (j + o) * this.m_perp.x;
    this.m_s2 = p * this.m_perp.y - i * this.m_perp.x;
    m = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    o = this.m_perp.x * g + this.m_perp.y * j;
    p = f - d - this.m_refAngle;
    k = Math.max(k, Math.abs(o));
    l = Math.abs(p);
    h ? (h = this.m_invMassA, i = this.m_invMassB, g = this.m_invIA, j = this.m_invIB, this.m_K.col1.x = h + i + g * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2, this.m_K.col1.y = g * this.m_s1 + j * this.m_s2, this.m_K.col1.z = g * this.m_s1 * this.m_a1 + j * this.m_s2 * this.m_a2, this.m_K.col2.x = this.m_K.col1.y, this.m_K.col2.y = g + j, this.m_K.col2.z = g * this.m_a1 + j * this.m_a2, this.m_K.col3.x = this.m_K.col1.z, this.m_K.col3.y = this.m_K.col2.z, this.m_K.col3.z = h + i + g * this.m_a1 *
        this.m_a1 + j * this.m_a2 * this.m_a2, this.m_K.Solve33(m, -o, -p, -n)) : (h = this.m_invMassA, i = this.m_invMassB, g = this.m_invIA, j = this.m_invIB, n = g * this.m_s1 + j * this.m_s2, q = g + j, this.m_K.col1.Set(h + i + g * this.m_s1 * this.m_s1 + j * this.m_s2 * this.m_s2, n, 0), this.m_K.col2.Set(n, q, 0), n = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_K.Solve22(n, -o, -p), m.x = n.x, m.y = n.y, Box2D.Common.Math.b2Vec2.Free(n), m.z = 0);
    n = m.x * this.m_perp.x + m.z * this.m_axis.x;
    h = m.x * this.m_perp.y + m.z * this.m_axis.y;
    o = m.x * this.m_s1 + m.y + m.z * this.m_a1;
    p = m.x * this.m_s2 + m.y + m.z * this.m_a2;
    Box2D.Common.Math.b2Vec3.Free(m);
    c.x -= this.m_invMassA * n;
    c.y -= this.m_invMassA * h;
    d -= this.m_invIA * o;
    e.x += this.m_invMassB * n;
    e.y += this.m_invMassB * h;
    f += this.m_invIB * p;
    a.m_sweep.a = d;
    b.m_sweep.a = f;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return k <= Box2D.Common.b2Settings.b2_linearSlop && l <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2PrismaticJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAxisA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_prismaticJoint;
    this.localAxisA.Set(1, 0);
    this.referenceAngle = 0;
    this.enableLimit = !1;
    this.upperTranslation = this.lowerTranslation = 0;
    this.enableMotor = !1;
    this.motorSpeed = this.maxMotorForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2PrismaticJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.localAxisA = this.bodyA.GetLocalVector(d);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2PrismaticJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2PrismaticJoint(this)
};
Box2D.Dynamics.Joints.b2WeldJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33;
    this.m_localAnchorA.SetV(a.localAnchorA);
    this.m_localAnchorB.SetV(a.localAnchorB);
    this.m_referenceAngle = a.referenceAngle
};
goog.inherits(Box2D.Dynamics.Joints.b2WeldJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionForce = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.GetReactionTorque = function (a)
{
    return a * this.m_impulse.z
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchorA.x - d.m_sweep.localCenter.x, g = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchorB.x - e.m_sweep.localCenter.x, i = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    b = d.m_invMass;
    var c = e.m_invMass, j = d.m_invI, k = e.m_invI;
    this.m_mass.col1.x = b + c + g * g * j + i * i * k;
    this.m_mass.col2.x = -g * f * j - i * h * k;
    this.m_mass.col3.x = -g * j - i * k;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = b + c + f * f * j + h * h * k;
    this.m_mass.col3.y = f * j + h * k;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = j + k;
    a.warmStarting ? (this.m_impulse.x *= a.dtRatio, this.m_impulse.y *= a.dtRatio, this.m_impulse.z *= a.dtRatio, d.m_linearVelocity.x -= b * this.m_impulse.x, d.m_linearVelocity.y -= b * this.m_impulse.y, d.m_angularVelocity -= j * (f * this.m_impulse.y - g * this.m_impulse.x + this.m_impulse.z), e.m_linearVelocity.x += c * this.m_impulse.x, e.m_linearVelocity.y += c * this.m_impulse.y, e.m_angularVelocity += k * (h * this.m_impulse.y - i * this.m_impulse.x + this.m_impulse.z)) : this.m_impulse.SetZero()
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolveVelocityConstraints = function ()
{
    var a, b = 0, c = this.m_bodyA, d = this.m_bodyB, e = c.m_linearVelocity, f = c.m_angularVelocity, g = d.m_linearVelocity, h = d.m_angularVelocity, i = c.m_invMass, j = d.m_invMass, k = c.m_invI, l = d.m_invI;
    a = c.m_xf.R;
    var n = this.m_localAnchorA.x - c.m_sweep.localCenter.x, m = this.m_localAnchorA.y - c.m_sweep.localCenter.y, b = a.col1.x * n + a.col2.x * m, m = a.col1.y * n + a.col2.y * m, n = b;
    a = d.m_xf.R;
    var o = this.m_localAnchorB.x - d.m_sweep.localCenter.x, p = this.m_localAnchorB.y - d.m_sweep.localCenter.y, b = a.col1.x * o + a.col2.x * p, p = a.col1.y * o + a.col2.y * p, o = b;
    a = g.x - h * p - e.x + f * m;
    var b = g.y + h * o - e.y - f * n, q = h - f, r = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(r, -a, -b, -q);
    this.m_impulse.Add(r);
    e.x -= i * r.x;
    e.y -= i * r.y;
    f -= k * (n * r.y - m * r.x + r.z);
    g.x += j * r.x;
    g.y += j * r.y;
    h += l * (o * r.y - p * r.x + r.z);
    Box2D.Common.Math.b2Vec3.Free(r);
    c.m_angularVelocity = f;
    d.m_angularVelocity = h
};
Box2D.Dynamics.Joints.b2WeldJoint.prototype.SolvePositionConstraints = function ()
{
    var a, b = 0, c = this.m_bodyA, d = this.m_bodyB;
    a = c.m_xf.R;
    var e = this.m_localAnchorA.x - c.m_sweep.localCenter.x, f = this.m_localAnchorA.y - c.m_sweep.localCenter.y, b = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = b;
    a = d.m_xf.R;
    var g = this.m_localAnchorB.x - d.m_sweep.localCenter.x, h = this.m_localAnchorB.y - d.m_sweep.localCenter.y, b = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = b;
    a = c.m_invMass;
    var b = d.m_invMass, i = c.m_invI, j = d.m_invI, k = d.m_sweep.c.x + g - c.m_sweep.c.x - e, l = d.m_sweep.c.y + h - c.m_sweep.c.y - f, n = d.m_sweep.a - c.m_sweep.a - this.m_referenceAngle, m = 10 * Box2D.Common.b2Settings.b2_linearSlop, o = Math.sqrt(k * k + l * l), p = Math.abs(n);
    o > m && (i *= 1, j *= 1);
    this.m_mass.col1.x = a + b + f * f * i + h * h * j;
    this.m_mass.col2.x = -f * e * i - h * g * j;
    this.m_mass.col3.x = -f * i - h * j;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = a + b + e * e * i + g * g * j;
    this.m_mass.col3.y = e * i + g * j;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i + j;
    m = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass.Solve33(m, -k, -l, -n);
    c.m_sweep.c.x -= a * m.x;
    c.m_sweep.c.y -= a * m.y;
    c.m_sweep.a -= i * (e * m.y - f * m.x + m.z);
    d.m_sweep.c.x += b * m.x;
    d.m_sweep.c.y += b * m.y;
    d.m_sweep.a += j * (g * m.y - h * m.x + m.z);
    Box2D.Common.Math.b2Vec3.Free(m);
    c.SynchronizeTransform();
    d.SynchronizeTransform();
    return o <= Box2D.Common.b2Settings.b2_linearSlop && p <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2WeldJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_weldJoint;
    this.referenceAngle = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2WeldJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(c));
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2WeldJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2WeldJoint(this)
};
Box2D.Collision.b2DistanceOutput = function ()
{

    this.pointA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.pointB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.distance = 0
};
Box2D.Collision.b2SimplexVertex = function ()
{

    this.wA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.wB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.w = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.indexB = this.indexA = this.a = 0
};
Box2D.Collision.b2SimplexVertex.prototype.Set = function (a)
{
    this.wA.SetV(a.wA);
    this.wB.SetV(a.wB);
    this.w.SetV(a.w);
    this.a = a.a;
    this.indexA = a.indexA;
    this.indexB = a.indexB
};
Box2D.Collision.b2Simplex = function ()
{

    this.m_v1 = new Box2D.Collision.b2SimplexVertex;
    this.m_v2 = new Box2D.Collision.b2SimplexVertex;
    this.m_v3 = new Box2D.Collision.b2SimplexVertex;
    this.m_vertices = [this.m_v1, this.m_v2, this.m_v3]
};
Box2D.Collision.b2Simplex._freeCache = [];
Box2D.Collision.b2Simplex.Get = function ()
{
    if (0 < Box2D.Collision.b2Simplex._freeCache.length)
    {
        for (var a = Box2D.Collision.b2Simplex._freeCache.pop(), b = 0; b < a.m_vertices.length; b++)
        {
            var c = a.m_vertices[b];
            null != c.wA && c.wA.Set(0, 0);
            null != c.wB && c.wB.Set(0, 0);
            null != c.w && c.w.Set(0, 0);
            c.indexA = 0;
            c.indexB = 0;
            c.a = 0
        }
        return a
    }
    return new Box2D.Collision.b2Simplex
};
Box2D.Collision.b2Simplex.Free = function (a)
{
    null != a && Box2D.Collision.b2Simplex._freeCache.push(a)
};
Box2D.Collision.b2Simplex.prototype.ReadCache = function (a, b, c, d, e)
{
    Box2D.Common.b2Settings.b2Assert(0 <= a.count && 3 >= a.count);
    var f, g;
    this.m_count = a.count;
    for (var h = this.m_vertices, i = 0; i < this.m_count; i++)
    {
        var j = h[i];
        j.indexA = a.indexA[i];
        j.indexB = a.indexB[i];
        f = b.GetVertex(j.indexA);
        g = d.GetVertex(j.indexB);
        Box2D.Common.Math.b2Vec2.Free(j.wA);
        Box2D.Common.Math.b2Vec2.Free(j.wB);
        Box2D.Common.Math.b2Vec2.Free(j.w);
        j.wA = Box2D.Common.Math.b2Math.MulX(c, f);
        j.wB = Box2D.Common.Math.b2Math.MulX(e, g);
        j.w = Box2D.Common.Math.b2Math.SubtractVV(j.wB, j.wA);
        j.a = 0
    }
    if (1 < this.m_count && (a = a.metric, f = this.GetMetric(), f < 0.5 * a || 2 * a < f || f < Number.MIN_VALUE))
    {
        this.m_count = 0
    }
    0 == this.m_count && (j = h[0], j.indexA = 0, j.indexB = 0, f = b.GetVertex(0), g = d.GetVertex(0), Box2D.Common.Math.b2Vec2.Free(j.wA), Box2D.Common.Math.b2Vec2.Free(j.wB), Box2D.Common.Math.b2Vec2.Free(j.w), j.wA = Box2D.Common.Math.b2Math.MulX(c, f), j.wB = Box2D.Common.Math.b2Math.MulX(e, g), j.w = Box2D.Common.Math.b2Math.SubtractVV(j.wB, j.wA), this.m_count = 1)
};
Box2D.Collision.b2Simplex.prototype.WriteCache = function (a)
{
    a.metric = this.GetMetric();
    a.count = this.m_count;
    for (var b = this.m_vertices, c = 0; c < this.m_count; c++)
    {
        a.indexA[c] = b[c].indexA, a.indexB[c] = b[c].indexB
    }
};
Box2D.Collision.b2Simplex.prototype.GetSearchDirection = function ()
{
    if (1 == this.m_count)
    {
        return this.m_v1.w.GetNegative()
    }
    if (2 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b = this.m_v1.w.GetNegative(), c = Box2D.Common.Math.b2Math.CrossVV(a, b);
        Box2D.Common.Math.b2Vec2.Free(b);
        b = null;
        b = 0 < c ? Box2D.Common.Math.b2Math.CrossFV(1, a) : Box2D.Common.Math.b2Math.CrossVF(a, 1);
        Box2D.Common.Math.b2Vec2.Free(a);
        return b
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Simplex.prototype.GetClosestPoint = function ()
{
    if (1 == this.m_count)
    {
        return this.m_v1.w
    }
    if (2 == this.m_count)
    {
        return Box2D.Common.Math.b2Vec2.Get(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y)
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Simplex.prototype.GetWitnessPoints = function (a, b)
{
    1 == this.m_count ? (a.SetV(this.m_v1.wA), b.SetV(this.m_v1.wB)) : 2 == this.m_count ? (a.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x, a.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y, b.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x, b.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y) : 3 == this.m_count ? (b.x = a.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x, b.y = a.y = this.m_v1.a *
        this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y) : Box2D.Common.b2Settings.b2Assert(!1)
};
Box2D.Collision.b2Simplex.prototype.GetMetric = function ()
{
    if (1 == this.m_count)
    {
        return 0
    }
    if (2 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v1.w, this.m_v2.w), b = a.Length();
        Box2D.Common.Math.b2Vec2.Free(a);
        return b
    }
    if (3 == this.m_count)
    {
        var a = Box2D.Common.Math.b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), c = Box2D.Common.Math.b2Math.SubtractVV(this.m_v3.w, this.m_v1.w), b = Box2D.Common.Math.b2Math.CrossVV(a, c);
        Box2D.Common.Math.b2Vec2.Free(a);
        Box2D.Common.Math.b2Vec2.Free(c);
        return b
    }
    Box2D.Common.b2Settings.b2Assert(!1);
    return 0
};
Box2D.Collision.b2Simplex.prototype.Solve2 = function ()
{
    var a = this.m_v1.w, b = this.m_v2.w, c = Box2D.Common.Math.b2Math.SubtractVV(b, a), a = -(a.x * c.x + a.y * c.y);
    0 >= a ? (Box2D.Common.Math.b2Vec2.Free(c), this.m_count = this.m_v1.a = 1) : (b = b.x * c.x + b.y * c.y, Box2D.Common.Math.b2Vec2.Free(c), 0 >= b ? (this.m_count = this.m_v2.a = 1, this.m_v1.Set(this.m_v2)) : (c = 1 / (b + a), this.m_v1.a = b * c, this.m_v2.a = a * c, this.m_count = 2))
};
Box2D.Collision.b2Simplex.prototype.Solve3 = function ()
{
    var a = this.m_v1.w, b = this.m_v2.w, c = this.m_v3.w, d = Box2D.Common.Math.b2Math.SubtractVV(b, a), e = Box2D.Common.Math.b2Math.Dot(a, d), f = Box2D.Common.Math.b2Math.Dot(b, d), e = -e, g = Box2D.Common.Math.b2Math.SubtractVV(c, a), h = Box2D.Common.Math.b2Math.Dot(a, g), i = Box2D.Common.Math.b2Math.Dot(c, g), j = Box2D.Common.Math.b2Math.CrossVV(d, g);
    Box2D.Common.Math.b2Vec2.Free(d);
    Box2D.Common.Math.b2Vec2.Free(g);
    var d = -h, h = Box2D.Common.Math.b2Math.SubtractVV(c, b), k = Box2D.Common.Math.b2Math.Dot(b, h), g = Box2D.Common.Math.b2Math.Dot(c, h);
    Box2D.Common.Math.b2Vec2.Free(h);
    h = -k;
    k = j * Box2D.Common.Math.b2Math.CrossVV(b, c);
    c = j * Box2D.Common.Math.b2Math.CrossVV(c, a);
    a = j * Box2D.Common.Math.b2Math.CrossVV(a, b);
    0 >= e && 0 >= d ? this.m_count = this.m_v1.a = 1 : 0 < f && 0 < e && 0 >= a ? (i = 1 / (f + e), this.m_v1.a = f * i, this.m_v2.a = e * i, this.m_count = 2) : 0 < i && 0 < d && 0 >= c ? (f = 1 / (i + d), this.m_v1.a = i * f, this.m_v3.a = d * f, this.m_count = 2, this.m_v2.Set(this.m_v3)) : 0 >= f && 0 >= h ? (this.m_count = this.m_v2.a = 1, this.m_v1.Set(this.m_v2)) : 0 >= i && 0 >= g ? (this.m_count = this.m_v3.a = 1, this.m_v1.Set(this.m_v3)) : 0 < g && 0 < h && 0 >= k ? (f = 1 / (g + h), this.m_v2.a =
        g * f, this.m_v3.a = h * f, this.m_count = 2, this.m_v1.Set(this.m_v3)) : (f = 1 / (k + c + a), this.m_v1.a = k * f, this.m_v2.a = c * f, this.m_v3.a = a * f, this.m_count = 3)
};
Box2D.Collision.b2Distance = {};
Box2D.Collision.b2Distance.Distance = function (a, b, c)
{
    var d = Box2D.Collision.b2Simplex.Get();
    d.ReadCache(b, c.proxyA, c.transformA, c.proxyB, c.transformB);
    (1 > d.m_count || 3 < d.m_count) && Box2D.Common.b2Settings.b2Assert(!1);
    for (var e = 0; 20 > e;)
    {
        for (var f = [], g = 0; g < d.m_count; g++)
        {
            f[g] = {}, f[g].indexA = d.m_vertices[g].indexA, f[g].indexB = d.m_vertices[g].indexB
        }
        2 == d.m_count ? d.Solve2() : 3 == d.m_count && d.Solve3();
        if (3 == d.m_count)
        {
            break
        }
        g = d.GetSearchDirection();
        if (g.LengthSquared() < Box2D.Common.b2Settings.MIN_VALUE_SQUARED)
        {
            Box2D.Common.Math.b2Vec2.Free(g);
            break
        }
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].wA);
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].wB);
        Box2D.Common.Math.b2Vec2.Free(d.m_vertices[d.m_count].w);
        var h = g.GetNegative(), i = Box2D.Common.Math.b2Math.MulTMV(c.transformA.R, h);
        Box2D.Common.Math.b2Vec2.Free(h);
        d.m_vertices[d.m_count].indexA = c.proxyA.GetSupport(i);
        Box2D.Common.Math.b2Vec2.Free(i);
        d.m_vertices[d.m_count].wA = Box2D.Common.Math.b2Math.MulX(c.transformA, c.proxyA.GetVertex(d.m_vertices[d.m_count].indexA));
        h = Box2D.Common.Math.b2Math.MulTMV(c.transformB.R, g);
        Box2D.Common.Math.b2Vec2.Free(g);
        d.m_vertices[d.m_count].indexB = c.proxyB.GetSupport(h);
        Box2D.Common.Math.b2Vec2.Free(h);
        d.m_vertices[d.m_count].wB = Box2D.Common.Math.b2Math.MulX(c.transformB, c.proxyB.GetVertex(d.m_vertices[d.m_count].indexB));
        d.m_vertices[d.m_count].w = Box2D.Common.Math.b2Math.SubtractVV(d.m_vertices[d.m_count].wB, d.m_vertices[d.m_count].wA);
        e++;
        h = !1;
        for (g = 0; g < f.length; g++)
        {
            if (d.m_vertices[d.m_count].indexA == f[g].indexA && d.m_vertices[d.m_count].indexB == f[g].indexB)
            {
                h = !0;
                break
            }
        }
        if (h)
        {
            break
        }
        d.m_count++
    }
    d.GetWitnessPoints(a.pointA, a.pointB);
    e = Box2D.Common.Math.b2Math.SubtractVV(a.pointA, a.pointB);
    a.distance = e.Length();
    Box2D.Common.Math.b2Vec2.Free(e);
    d.WriteCache(b);
    Box2D.Collision.b2Simplex.Free(d);
    c.useRadii && (b = c.proxyA.m_radius, c = c.proxyB.m_radius, a.distance > b + c && a.distance > Number.MIN_VALUE ? (a.distance -= b + c, d = Box2D.Common.Math.b2Math.SubtractVV(a.pointB, a.pointA), d.Normalize(), a.pointA.x += b * d.x, a.pointA.y += b * d.y, a.pointB.x -= c * d.x, a.pointB.y -= c * d.y, Box2D.Common.Math.b2Vec2.Free(d)) : (c = Box2D.Common.Math.b2Vec2.Get(0, 0), c.x = 0.5 * (a.pointA.x + a.pointB.x), c.y = 0.5 * (a.pointA.y + a.pointB.y), a.pointA.x = a.pointB.x = c.x, a.pointA.y =
        a.pointB.y = c.y, a.distance = 0, Box2D.Common.Math.b2Vec2.Free(c)))
};
Box2D.Collision.b2SimplexCache = function ()
{

    this.indexA = [0, 0, 0];
    this.indexB = [0, 0, 0]
};
Box2D.Collision.b2DistanceInput = function ()
{

    this.useRadii = !1;
    this.transformB = this.transformA = this.proxyB = this.proxyA = null
};
Box2D.Collision.Shapes = {};
Box2D.Collision.Shapes.b2Shape = function ()
{

    this.m_radius = Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Collision.Shapes.b2Shape.prototype.Set = function (a)
{
    this.m_radius = a.m_radius
};
Box2D.Collision.Shapes.b2Shape.TestOverlap = function (a, b, c, d)
{
    var e = new Box2D.Collision.b2DistanceInput;
    e.proxyA = new Box2D.Collision.b2DistanceProxy;
    e.proxyA.Set(a);
    e.proxyB = new Box2D.Collision.b2DistanceProxy;
    e.proxyB.Set(c);
    e.transformA = b;
    e.transformB = d;
    e.useRadii = !0;
    a = new Box2D.Collision.b2SimplexCache;
    a.count = 0;
    b = new Box2D.Collision.b2DistanceOutput;
    Box2D.Collision.b2Distance.Distance(b, a, e);
    Box2D.Common.Math.b2Vec2.Free(b.pointA);
    Box2D.Common.Math.b2Vec2.Free(b.pointB);
    return b.distance < 10 * Number.MIN_VALUE
};
Box2D.Collision.Shapes.b2Shape.e_startsInsideCollide = -1;
Box2D.Collision.Shapes.b2Shape.e_missCollide = 0;
Box2D.Collision.Shapes.b2Shape.e_hitCollide = 1;
Box2D.Collision.Shapes.b2CircleShape = function (a)
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_radius = a;
    this.m_radiusSquared = a * a;
    this.m_p = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_vertices = [this.m_p]
};
goog.inherits(Box2D.Collision.Shapes.b2CircleShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2CircleShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2CircleShape.NAME
};
Box2D.Collision.Shapes.b2CircleShape.prototype.Copy = function ()
{
    var a = new Box2D.Collision.Shapes.b2CircleShape(this.m_radius);
    a.Set(this);
    return a
};
Box2D.Collision.Shapes.b2CircleShape.prototype.Set = function (a)
{
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, a);
    a instanceof Box2D.Collision.Shapes.b2CircleShape && this.m_p.SetV(a.m_p)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.TestPoint = function (a, b)
{
    var c = b.x - (a.position.x + (a.R.col1.x * this.m_p.x + a.R.col2.x * this.m_p.y)), d = b.y - (a.position.y + (a.R.col1.y * this.m_p.x + a.R.col2.y * this.m_p.y));
    return c * c + d * d <= this.m_radiusSquared
};
Box2D.Collision.Shapes.b2CircleShape.prototype.RayCast = function (a, b, c)
{
    var d = c.R, e = b.p1.x - (c.position.x + (d.col1.x * this.m_p.x + d.col2.x * this.m_p.y)), c = b.p1.y - (c.position.y + (d.col1.y * this.m_p.x + d.col2.y * this.m_p.y)), d = b.p2.x - b.p1.x, f = b.p2.y - b.p1.y, g = e * d + c * f, h = d * d + f * f, i = g * g - h * (e * e + c * c - this.m_radiusSquared);
    if (0 > i || h < Number.MIN_VALUE)
    {
        return!1
    }
    g = -(g + Math.sqrt(i));
    return 0 <= g && g <= b.maxFraction * h ? (g /= h, a.fraction = g, a.normal.x = e + g * d, a.normal.y = c + g * f, a.normal.Normalize(), !0) : !1
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeAABB = function (a, b)
{
    var c = b.R, d = b.position.x + (c.col1.x * this.m_p.x + c.col2.x * this.m_p.y), c = b.position.y + (c.col1.y * this.m_p.x + c.col2.y * this.m_p.y);
    a.lowerBound.Set(d - this.m_radius, c - this.m_radius);
    a.upperBound.Set(d + this.m_radius, c + this.m_radius)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeMass = function (a, b)
{
    var c = b * Math.PI * this.m_radiusSquared;
    a.SetV(c, this.m_p, c * (0.5 * this.m_radiusSquared + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y)))
};
Box2D.Collision.Shapes.b2CircleShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    var c = Box2D.Common.Math.b2Math.MulX(c, this.m_p), e = -(Box2D.Common.Math.b2Math.Dot(a, c) - b);
    if (e < -this.m_radius + Number.MIN_VALUE)
    {
        return Box2D.Common.Math.b2Vec2.Free(c), 0
    }
    if (e > this.m_radius)
    {
        return Box2D.Common.Math.b2Vec2.Free(c), d.SetV(c), Math.PI * this.m_radiusSquared
    }
    b = e * e;
    e = this.m_radiusSquared * (Math.asin(e / this.m_radius) + Math.PI / 2) + e * Math.sqrt(this.m_radiusSquared - b);
    b = -2 / 3 * Math.pow(this.m_radiusSquared - b, 1.5) / e;
    d.x = c.x + a.x * b;
    d.y = c.y + a.y * b;
    Box2D.Common.Math.b2Vec2.Free(c);
    return e
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetDistanceProxy = function (a)
{
    a.SetValues(1, this.m_radius, this.m_vertices)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.GetLocalPosition = function ()
{
    return this.m_p
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetLocalPosition = function (a)
{
    this.m_p.SetV(a)
};
Box2D.Collision.Shapes.b2CircleShape.prototype.GetRadius = function ()
{
    return this.m_radius
};
Box2D.Collision.Shapes.b2CircleShape.prototype.SetRadius = function (a)
{
    this.m_radius = a;
    this.m_radiusSquared = a * a
};
Box2D.Collision.Shapes.b2CircleShape.NAME = "b2CircleShape";
Box2D.Consts = {};
Box2D.Consts.MIN_VALUE_SQUARED = Number.MIN_VALUE * Number.MIN_VALUE;
Box2D.Collision.b2AABB = function ()
{

    this.lowerBound = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.upperBound = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2AABB._freeCache = [];
Box2D.Collision.b2AABB.Get = function ()
{

    if (0 < Box2D.Collision.b2AABB._freeCache.length)
    {
        var a = Box2D.Collision.b2AABB._freeCache.pop();
        a.SetZero();
        return a
    }
    return new Box2D.Collision.b2AABB
};
Box2D.Collision.b2AABB.Free = function (a)
{
    null != a && ( Box2D.Collision.b2AABB._freeCache.push(a))
};
Box2D.Collision.b2AABB.prototype.SetZero = function ()
{
    this.lowerBound.Set(0, 0);
    this.upperBound.Set(0, 0)
};
Box2D.Collision.b2AABB.prototype.IsValid = function ()
{
    return 0 > this.upperBound.x - this.lowerBound.x || 0 > this.upperBound.y - this.lowerBound.y ? !1 : this.lowerBound.IsValid() && this.upperBound.IsValid()
};
Box2D.Collision.b2AABB.prototype.GetCenter = function ()
{
    return Box2D.Common.Math.b2Vec2.Get((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
Box2D.Collision.b2AABB.prototype.SetCenter = function (a)
{
    var b = this.GetCenter();
    this.lowerBound.Subtract(b);
    this.upperBound.Subtract(b);
    this.lowerBound.Add(a);
    this.upperBound.Add(a);
    Box2D.Common.Math.b2Vec2.Free(b)
};
Box2D.Collision.b2AABB.prototype.GetExtents = function ()
{
    return Box2D.Common.Math.b2Vec2.Get((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
Box2D.Collision.b2AABB.prototype.Contains = function (a)
{
    var b;
    return b = (b = (b = (b = this.lowerBound.x <= a.lowerBound.x) && this.lowerBound.y <= a.lowerBound.y) && a.upperBound.x <= this.upperBound.x) && a.upperBound.y <= this.upperBound.y
};
Box2D.Collision.b2AABB.prototype.RayCast = function (a, b)
{
    var c = -Number.MAX_VALUE, d = Number.MAX_VALUE, e = b.p2.x - b.p1.x;
    if (Math.abs(e) < Number.MIN_VALUE)
    {
        if (b.p1.x < this.lowerBound.x || this.upperBound.x < b.p1.x)
        {
            return!1
        }
    } else
    {
        var f = 1 / e, e = (this.lowerBound.x - b.p1.x) * f, f = (this.upperBound.x - b.p1.x) * f, g = -1;
        e > f && (g = e, e = f, f = g, g = 1);
        e > c && (a.normal.x = g, a.normal.y = 0, c = e);
        d = Math.min(d, f);
        if (c > d)
        {
            return!1
        }
    }
    e = b.p2.y - b.p1.y;
    if (Math.abs(e) < Number.MIN_VALUE)
    {
        if (b.p1.y < this.lowerBound.y || this.upperBound.y < b.p1.y)
        {
            return!1
        }
    } else
    {
        if (f = 1 / e, e = (this.lowerBound.y - b.p1.y) * f, f *= this.upperBound.y - b.p1.y, g = -1, e > f && (g = e, e = f, f = g, g = 1), e > c && (a.normal.y = g, a.normal.x = 0, c = e), d = Math.min(d, f), c > d)
        {
            return!1
        }
    }
    a.fraction = c;
    return!0
};
Box2D.Collision.b2AABB.prototype.TestOverlap = function (a)
{
    return 0 < a.lowerBound.x - this.upperBound.x || 0 < a.lowerBound.y - this.upperBound.y || 0 < this.lowerBound.x - a.upperBound.x || 0 < this.lowerBound.y - a.upperBound.y ? !1 : !0
};
Box2D.Collision.b2AABB.Combine = function (a, b)
{
    var c = Box2D.Collision.b2AABB.Get();
    c.Combine(a, b);
    return c
};
Box2D.Collision.b2AABB.prototype.Combine = function (a, b)
{
    this.lowerBound.x = Math.min(a.lowerBound.x, b.lowerBound.x);
    this.lowerBound.y = Math.min(a.lowerBound.y, b.lowerBound.y);
    this.upperBound.x = Math.max(a.upperBound.x, b.upperBound.x);
    this.upperBound.y = Math.max(a.upperBound.y, b.upperBound.y)
};
Box2D.Dynamics.b2FixtureListNode = function (a)
{

    this.fixture = a;
    this.previous = this.next = null
};
Box2D.Dynamics.b2FixtureListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.b2FixtureListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.b2FixtureListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.b2FixtureListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Collision.b2ContactID = function ()
{

    this._incidentVertex = this._incidentEdge = this._referenceEdge = this._key = 0
};
Box2D.Collision.b2ContactID.prototype.GetKey = function ()
{
    return this._key
};
Box2D.Collision.b2ContactID.prototype.SetKey = function (a)
{
    this._key = a;
    this._referenceEdge = this._key & 255;
    this._incidentEdge = (this._key & 65280) >> 8 & 255;
    this._incidentVertex = (this._key & 16711680) >> 16 & 255;
    this._flip = (this._key & 4278190080) >> 24 & 255
};
Box2D.Collision.b2ContactID.prototype.Set = function (a)
{
    this.SetKey(a._key)
};
Box2D.Collision.b2ContactID.prototype.SetReferenceEdge = function (a)
{
    this._referenceEdge = a;
    this._key = this._key & 4294967040 | this._referenceEdge & 255
};
Box2D.Collision.b2ContactID.prototype.SetIncidentEdge = function (a)
{
    this._incidentEdge = a;
    this._key = this._key & 4294902015 | this._incidentEdge << 8 & 65280
};
Box2D.Collision.b2ContactID.prototype.SetIncidentVertex = function (a)
{
    this._incidentVertex = a;
    this._key = this._key & 4278255615 | this._incidentVertex << 16 & 16711680
};
Box2D.Collision.b2ContactID.prototype.SetFlip = function (a)
{
    this._flip = a;
    this._key = this._key & 16777215 | this._flip << 24 & 4278190080
};
Box2D.Collision.b2ContactID.prototype.Copy = function ()
{
    var a = new Box2D.Collision.b2ContactID;
    a.Set(this);
    return a
};
Box2D.Collision.b2ManifoldPoint = function ()
{

    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_id = new Box2D.Collision.b2ContactID;
    this.m_tangentImpulse = this.m_normalImpulse = 0
};
Box2D.Collision.b2ManifoldPoint.prototype.Reset = function ()
{
    this.m_localPoint.SetZero();
    this.m_tangentImpulse = this.m_normalImpulse = 0;
    this.m_id.SetKey(0)
};
Box2D.Collision.b2ManifoldPoint.prototype.Set = function (a)
{
    this.m_localPoint.SetV(a.m_localPoint);
    this.m_normalImpulse = a.m_normalImpulse;
    this.m_tangentImpulse = a.m_tangentImpulse;
    this.m_id.Set(a.m_id)
};
Box2D.Collision.b2DynamicTreeNode = function (a)
{

    this.aabb = Box2D.Collision.b2AABB.Get();
    this.parent = this.child2 = this.child1 = null;
    this.fixture = a
};
Box2D.Collision.b2DynamicTreeNode._freeCache = [];
Box2D.Collision.b2DynamicTreeNode.Get = function (a)
{
    "undefined" == typeof a && (a = null);
    if (0 < Box2D.Collision.b2DynamicTreeNode._freeCache.length)
    {
        var b = Box2D.Collision.b2DynamicTreeNode._freeCache.pop();
        b.fixture = a;
        b.aabb.SetZero();
        return b
    }
    return new Box2D.Collision.b2DynamicTreeNode(a)
};
Box2D.Collision.b2DynamicTreeNode.prototype.Destroy = function ()
{
    this.fixture = this.parent = this.child2 = this.child1 = null;
    Box2D.Collision.b2DynamicTreeNode._freeCache.push(this)
};
Box2D.Collision.b2DynamicTreeNode.prototype.IsLeaf = function ()
{
    return null === this.child1
};
Box2D.Collision.b2RayCastInput = function (a, b, c)
{

    this.p1 = Box2D.Common.Math.b2Vec2.Get(a.x, a.y);
    this.p2 = Box2D.Common.Math.b2Vec2.Get(b.x, b.y);
    this.maxFraction = c
};
Box2D.Collision.b2DynamicTree = function ()
{

    this.m_root = null;
    this.m_insertionCount = this.m_path = 0
};
Box2D.Collision.b2DynamicTree.prototype.CreateProxy = function (a, b)
{
    var c = Box2D.Collision.b2DynamicTreeNode.Get(b), d = Box2D.Common.b2Settings.b2_aabbExtension, e = Box2D.Common.b2Settings.b2_aabbExtension;
    c.aabb.lowerBound.x = a.lowerBound.x - d;
    c.aabb.lowerBound.y = a.lowerBound.y - e;
    c.aabb.upperBound.x = a.upperBound.x + d;
    c.aabb.upperBound.y = a.upperBound.y + e;
    this.InsertLeaf(c);
    return c
};
Box2D.Collision.b2DynamicTree.prototype.DestroyProxy = function (a)
{
    this.RemoveLeaf(a);
    a.Destroy()
};
Box2D.Collision.b2DynamicTree.prototype.MoveProxy = function (a, b, c)
{
    Box2D.Common.b2Settings.b2Assert(a.IsLeaf());
    if (a.aabb.Contains(b))
    {
        return!1
    }
    this.RemoveLeaf(a);
    var d = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(c.x), c = Box2D.Common.b2Settings.b2_aabbExtension + Box2D.Common.b2Settings.b2_aabbMultiplier * Math.abs(c.y);
    a.aabb.lowerBound.x = b.lowerBound.x - d;
    a.aabb.lowerBound.y = b.lowerBound.y - c;
    a.aabb.upperBound.x = b.upperBound.x + d;
    a.aabb.upperBound.y = b.upperBound.y + c;
    this.InsertLeaf(a);
    return!0
};
Box2D.Collision.b2DynamicTree.prototype.Rebalance = function (a)
{
    if (null !== this.m_root)
    {
        for (var b = 0; b < a; b++)
        {
            for (var c = this.m_root, d = 0; !c.IsLeaf();)
            {
                c = this.m_path >> d & 1 ? c.child2 : c.child1, d = d + 1 & 31
            }
            this.m_path++;
            this.RemoveLeaf(c);
            this.InsertLeaf(c)
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.GetFatAABB = function (a)
{
    return a.aabb
};
Box2D.Collision.b2DynamicTree.prototype.Query = function (a, b, c)
{
    if (null !== this.m_root)
    {
        var d = [];
        for (d.push(this.m_root); 0 < d.length;)
        {
            var e = d.pop();
            if (e.aabb.TestOverlap(b))
            {
                if (e.IsLeaf())
                {
                    if (!a.call(c, e.fixture))
                    {
                        break
                    }
                } else
                {
                    d.push(e.child1), d.push(e.child2)
                }
            }
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.RayCast = function (a, b)
{
    if (null !== this.m_root)
    {
        var c = Box2D.Common.Math.b2Math.SubtractVV(b.p1, b.p2);
        c.Normalize();
        var d = Box2D.Common.Math.b2Math.CrossFV(1, c);
        Box2D.Common.Math.b2Vec2.Free(c);
        var c = Box2D.Common.Math.b2Math.AbsV(d), e = b.maxFraction, f = b.p1.x + e * (b.p2.x - b.p1.x), e = b.p1.y + e * (b.p2.y - b.p1.y), g = Box2D.Collision.b2AABB.Get();
        g.lowerBound.x = Math.min(b.p1.x, f);
        g.lowerBound.y = Math.min(b.p1.y, e);
        g.upperBound.x = Math.max(b.p1.x, f);
        g.upperBound.y = Math.max(b.p1.y, e);
        var h = [];
        for (h.push(this.m_root); 0 < h.length;)
        {
            if (f = h.pop(), f.aabb.TestOverlap(g))
            {
                var e = f.aabb.GetCenter(), i = f.aabb.GetExtents(), j = Math.abs(d.x * (b.p1.x - e.x) + d.y * (b.p1.y - e.y)) - c.x * i.x - c.y * i.y;
                Box2D.Common.Math.b2Vec2.Free(e);
                Box2D.Common.Math.b2Vec2.Free(i);
                if (!(0 < j))
                {
                    if (f.IsLeaf())
                    {
                        new Box2D.Collision.b2RayCastInput(b.p1, b.p2, b.maxFraction);
                        e = a(b, f.fixture);
                        if (0 == e)
                        {
                            break
                        }
                        0 < e && (f = b.p1.x + e * (b.p2.x - b.p1.x), e = b.p1.y + e * (b.p2.y - b.p1.y), g.lowerBound.x = Math.min(b.p1.x, f), g.lowerBound.y = Math.min(b.p1.y, e), g.upperBound.x = Math.max(b.p1.x, f), g.upperBound.y = Math.max(b.p1.y, e))
                    } else
                    {
                        h.push(f.child1), h.push(f.child2)
                    }
                }
            }
        }
        Box2D.Common.Math.b2Vec2.Free(d);
        Box2D.Common.Math.b2Vec2.Free(c);
        Box2D.Collision.b2AABB.Free(g)
    }
};
Box2D.Collision.b2DynamicTree.prototype.InsertLeaf = function (a)
{
    this.m_insertionCount++;
    if (null === this.m_root)
    {
        this.m_root = a, this.m_root.parent = null
    } else
    {
        var b = this.GetBestSibling(a), c = b.parent, d = Box2D.Collision.b2DynamicTreeNode.Get();
        d.parent = c;
        d.aabb.Combine(a.aabb, b.aabb);
        if (c)
        {
            b.parent.child1 == b ? c.child1 = d : c.child2 = d;
            d.child1 = b;
            d.child2 = a;
            b.parent = d;
            for (a.parent = d; c && !c.aabb.Contains(d.aabb);)
            {
                c.aabb.Combine(c.child1.aabb, c.child2.aabb), d = c, c = c.parent
            }
        } else
        {
            d.child1 = b, d.child2 = a, b.parent = d, this.m_root = a.parent = d
        }
    }
};
Box2D.Collision.b2DynamicTree.prototype.GetBestSibling = function (a)
{
    for (var a = a.aabb.GetCenter(), b = this.m_root; !b.IsLeaf();)
    {
        var c = b.child1, b = b.child2, d = Math.abs((c.aabb.lowerBound.x + c.aabb.upperBound.x) / 2 - a.x) + Math.abs((c.aabb.lowerBound.y + c.aabb.upperBound.y) / 2 - a.y), e = Math.abs((b.aabb.lowerBound.x + b.aabb.upperBound.x) / 2 - a.x) + Math.abs((b.aabb.lowerBound.y + b.aabb.upperBound.y) / 2 - a.y), b = d < e ? c : b
    }
    Box2D.Common.Math.b2Vec2.Free(a);
    return b
};
Box2D.Collision.b2DynamicTree.prototype.RemoveLeaf = function (a)
{
    if (a == this.m_root)
    {
        this.m_root = null
    } else
    {
        var b = a.parent, c = b.parent, a = b.child1 == a ? b.child2 : b.child1;
        if (c)
        {
            c.child1 == b ? c.child1 = a : c.child2 = a;
            for (a.parent = c; c;)
            {
                a = c.aabb;
                c.aabb.Combine(c.child1.aabb, c.child2.aabb);
                if (a.Contains(c.aabb))
                {
                    break
                }
                c = c.parent
            }
        } else
        {
            this.m_root = a, a.parent = null
        }
        b.Destroy()
    }
};
Box2D.Collision.ClipVertex = function ()
{

    this.v = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID
};
Box2D.Collision.ClipVertex.prototype.Set = function (a)
{
    this.v.SetV(a.v);
    this.id.Set(a.id)
};
Box2D.Collision.b2Manifold = function ()
{

    this.m_type = this.m_pointCount = 0;
    this.m_points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = new Box2D.Collision.b2ManifoldPoint
    }
    this.m_localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Manifold.prototype.Reset = function ()
{
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a].Reset()
    }
    this.m_localPlaneNormal.SetZero();
    this.m_localPoint.SetZero();
    this.m_pointCount = this.m_type = 0
};
Box2D.Collision.b2Manifold.prototype.Set = function (a)
{
    this.m_pointCount = a.m_pointCount;
    for (var b = 0; b < Box2D.Common.b2Settings.b2_maxManifoldPoints; b++)
    {
        this.m_points[b].Set(a.m_points[b])
    }
    this.m_localPlaneNormal.SetV(a.m_localPlaneNormal);
    this.m_localPoint.SetV(a.m_localPoint);
    this.m_type = a.m_type
};
Box2D.Collision.b2Manifold.prototype.Copy = function ()
{
    var a = new Box2D.Collision.b2Manifold;
    a.Set(this);
    return a
};
Box2D.Collision.b2Manifold.e_circles = 1;
Box2D.Collision.b2Manifold.e_faceA = 2;
Box2D.Collision.b2Manifold.e_faceB = 4;
Box2D.Collision.b2Collision = {};
Box2D.Collision.b2Collision.ClipSegmentToLine = function (a, b, c, d)
{
    var e = 0, f = b[0].v, g = b[1].v, h = c.x * f.x + c.y * f.y - d, c = c.x * g.x + c.y * g.y - d;
    0 >= h && a[e++].Set(b[0]);
    0 >= c && a[e++].Set(b[1]);
    0 > h * c && (c = h / (h - c), d = a[e].v, d.x = f.x + c * (g.x - f.x), d.y = f.y + c * (g.y - f.y), a[e].id = 0 < h ? b[0].id : b[1].id, e++);
    return e
};
Box2D.Collision.b2Collision.EdgeSeparation = function (a, b, c, d, e)
{
    for (var f = b.R.col1.x * a.m_normals[c].x + b.R.col2.x * a.m_normals[c].y, g = b.R.col1.y * a.m_normals[c].x + b.R.col2.y * a.m_normals[c].y, h = e.R.col1.x * f + e.R.col1.y * g, i = e.R.col2.x * f + e.R.col2.y * g, j = 0, k = Number.MAX_VALUE, l = 0; l < d.m_vertexCount; l++)
    {
        var n = d.m_vertices[l].x * h + d.m_vertices[l].y * i;
        n < k && (k = n, j = l)
    }
    return(e.position.x + (e.R.col1.x * d.m_vertices[j].x + e.R.col2.x * d.m_vertices[j].y) - (b.position.x + (b.R.col1.x * a.m_vertices[c].x + b.R.col2.x * a.m_vertices[c].y))) * f + (e.position.y + (e.R.col1.y * d.m_vertices[j].x + e.R.col2.y * d.m_vertices[j].y) - (b.position.y + (b.R.col1.y * a.m_vertices[c].x + b.R.col2.y * a.m_vertices[c].y))) * g
};
Box2D.Collision.b2Collision.FindMaxSeparation = function (a, b, c, d)
{
    for (var e = d.position.x + (d.R.col1.x * c.m_centroid.x + d.R.col2.x * c.m_centroid.y), f = d.position.y + (d.R.col1.y * c.m_centroid.x + d.R.col2.y * c.m_centroid.y), e = e - (b.position.x + (b.R.col1.x * a.m_centroid.x + b.R.col2.x * a.m_centroid.y)), f = f - (b.position.y + (b.R.col1.y * a.m_centroid.x + b.R.col2.y * a.m_centroid.y)), g = e * b.R.col1.x + f * b.R.col1.y, f = e * b.R.col2.x + f * b.R.col2.y, e = 0, h = -Number.MAX_VALUE, i = 0; i < a.m_vertexCount; ++i)
    {
        var j = a.m_normals[i].x * g + a.m_normals[i].y * f;
        j > h && (h = j, e = i)
    }
    g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d);
    f = e - 1;
    0 > f && (f = a.m_vertexCount - 1);
    h = Box2D.Collision.b2Collision.EdgeSeparation(a, b, f, c, d);
    i = e + 1;
    i >= a.m_vertexCount && (i = 0);
    var j = Box2D.Collision.b2Collision.EdgeSeparation(a, b, i, c, d), k = 0, l = 0;
    if (h > g && h > j)
    {
        k = f;
        for (l = h; ;)
        {
            if (e = k - 1, 0 > e && (e = a.m_vertexCount - 1), g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d), g > l)
            {
                k = e, l = g
            } else
            {
                break
            }
        }
    } else
    {
        if (j > g)
        {
            k = i;
            for (l = j; ;)
            {
                if (e = k + 1, e >= a.m_vertexCount && (e = 0), g = Box2D.Collision.b2Collision.EdgeSeparation(a, b, e, c, d), g > l)
                {
                    k = e, l = g
                } else
                {
                    break
                }
            }
        } else
        {
            k = e, l = g
        }
    }
    return{bestEdge:k, separation:l}
};
Box2D.Collision.b2Collision.FindIncidentEdge = function (a, b, c, d, e, f)
{
    for (var g = c.R.col1.x * b.m_normals[d].x + c.R.col2.x * b.m_normals[d].y, b = c.R.col1.y * b.m_normals[d].x + c.R.col2.y * b.m_normals[d].y, c = f.R.col1.x * g + f.R.col1.y * b, b = f.R.col2.x * g + f.R.col2.y * b, g = c, c = 0, h = Number.MAX_VALUE, i = 0; i < e.m_vertexCount; i++)
    {
        var j = g * e.m_normals[i].x + b * e.m_normals[i].y;
        j < h && (h = j, c = i)
    }
    g = c + 1;
    g >= e.m_vertexCount && (g = 0);
    a[0].v.x = f.position.x + (f.R.col1.x * e.m_vertices[c].x + f.R.col2.x * e.m_vertices[c].y);
    a[0].v.y = f.position.y + (f.R.col1.y * e.m_vertices[c].x + f.R.col2.y * e.m_vertices[c].y);
    a[0].id.SetReferenceEdge(d);
    a[0].id.SetIncidentEdge(c);
    a[0].id.SetIncidentVertex(0);
    a[1].v.x = f.position.x + (f.R.col1.x * e.m_vertices[g].x + f.R.col2.x * e.m_vertices[g].y);
    a[1].v.y = f.position.y + (f.R.col1.y * e.m_vertices[g].x + f.R.col2.y * e.m_vertices[g].y);
    a[1].id.SetReferenceEdge(d);
    a[1].id.SetIncidentEdge(g);
    a[1].id.SetIncidentVertex(1)
};
Box2D.Collision.b2Collision.MakeClipPointVector = function ()
{
    return[new Box2D.Collision.ClipVertex, new Box2D.Collision.ClipVertex]
};
Box2D.Collision.b2Collision.CollidePolygons = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    var f = b.m_radius + d.m_radius, g = Box2D.Collision.b2Collision.FindMaxSeparation(b, c, d, e);
    if (!(g.separation > f))
    {
        var h = Box2D.Collision.b2Collision.FindMaxSeparation(d, e, b, c);
        if (!(h.separation > f))
        {
            var i = b, j = d, k = c, l = e, n = 0, m = g.bestEdge;
            a.m_type = Box2D.Collision.b2Manifold.e_faceA;
            h.separation > 0.98 * g.separation + 0.0010 && (i = d, j = b, k = e, l = c, m = h.bestEdge, a.m_type = Box2D.Collision.b2Manifold.e_faceB, n = 1);
            b = Box2D.Collision.b2Collision.s_incidentEdge;
            Box2D.Collision.b2Collision.FindIncidentEdge(b, i, k, m, j, l);
            j = i.m_vertices[m];
            i = m + 1 < i.m_vertexCount ? i.m_vertices[m + 1] : i.m_vertices[0];
            Box2D.Collision.b2Collision.s_localTangent.Set(i.x - j.x, i.y - j.y);
            Box2D.Collision.b2Collision.s_localTangent.Normalize();
            Box2D.Collision.b2Collision.s_localNormal.x = Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_localNormal.y = -Box2D.Collision.b2Collision.s_localTangent.x;
            Box2D.Collision.b2Collision.s_planePoint.Set(0.5 * (j.x + i.x), 0.5 * (j.y + i.y));
            Box2D.Collision.b2Collision.s_tangent.x = k.R.col1.x * Box2D.Collision.b2Collision.s_localTangent.x + k.R.col2.x * Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_tangent.y = k.R.col1.y * Box2D.Collision.b2Collision.s_localTangent.x + k.R.col2.y * Box2D.Collision.b2Collision.s_localTangent.y;
            Box2D.Collision.b2Collision.s_tangent2.x = -Box2D.Collision.b2Collision.s_tangent.x;
            Box2D.Collision.b2Collision.s_tangent2.y = -Box2D.Collision.b2Collision.s_tangent.y;
            Box2D.Collision.b2Collision.s_normal.x = Box2D.Collision.b2Collision.s_tangent.y;
            Box2D.Collision.b2Collision.s_normal.y = -Box2D.Collision.b2Collision.s_tangent.x;
            Box2D.Collision.b2Collision.s_v11.x = k.position.x + (k.R.col1.x * j.x + k.R.col2.x * j.y);
            Box2D.Collision.b2Collision.s_v11.y = k.position.y + (k.R.col1.y * j.x + k.R.col2.y * j.y);
            Box2D.Collision.b2Collision.s_v12.x = k.position.x + (k.R.col1.x * i.x + k.R.col2.x * i.y);
            Box2D.Collision.b2Collision.s_v12.y = k.position.y + (k.R.col1.y * i.x + k.R.col2.y * i.y);
            if (!(2 > Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints1, b, Box2D.Collision.b2Collision.s_tangent2, -Box2D.Collision.b2Collision.s_tangent.x * Box2D.Collision.b2Collision.s_v11.x - Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v11.y + f)) && !(2 > Box2D.Collision.b2Collision.ClipSegmentToLine(Box2D.Collision.b2Collision.s_clipPoints2, Box2D.Collision.b2Collision.s_clipPoints1, Box2D.Collision.b2Collision.s_tangent, Box2D.Collision.b2Collision.s_tangent.x *
                Box2D.Collision.b2Collision.s_v12.x + Box2D.Collision.b2Collision.s_tangent.y * Box2D.Collision.b2Collision.s_v12.y + f)))
            {
                a.m_localPlaneNormal.SetV(Box2D.Collision.b2Collision.s_localNormal);
                a.m_localPoint.SetV(Box2D.Collision.b2Collision.s_planePoint);
                k = Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_v11.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_v11.y;
                for (m = i = 0; m < Box2D.Common.b2Settings.b2_maxManifoldPoints; ++m)
                {
                    Box2D.Collision.b2Collision.s_normal.x * Box2D.Collision.b2Collision.s_clipPoints2[m].v.x + Box2D.Collision.b2Collision.s_normal.y * Box2D.Collision.b2Collision.s_clipPoints2[m].v.y - k <= f && (j = Box2D.Collision.b2Collision.s_clipPoints2[m].v.x - l.position.x, b = Box2D.Collision.b2Collision.s_clipPoints2[m].v.y - l.position.y, a.m_points[i].m_localPoint.x = j * l.R.col1.x + b * l.R.col1.y, a.m_points[i].m_localPoint.y = j * l.R.col2.x + b * l.R.col2.y, a.m_points[i].m_id.Set(Box2D.Collision.b2Collision.s_clipPoints2[m].id),
                        a.m_points[i].m_id.SetFlip(n), i++)
                }
                a.m_pointCount = i
            }
        }
    }
};
Box2D.Collision.b2Collision.CollideCircles = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    var f = e.position.x + (e.R.col1.x * d.m_p.x + e.R.col2.x * d.m_p.y) - (c.position.x + (c.R.col1.x * b.m_p.x + c.R.col2.x * b.m_p.y)), c = e.position.y + (e.R.col1.y * d.m_p.x + e.R.col2.y * d.m_p.y) - (c.position.y + (c.R.col1.y * b.m_p.x + c.R.col2.y * b.m_p.y)), e = b.m_radius + d.m_radius;
    f * f + c * c > e * e || (a.m_type = Box2D.Collision.b2Manifold.e_circles, a.m_localPoint.SetV(b.m_p), a.m_localPlaneNormal.SetZero(), a.m_pointCount = 1, a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0))
};
Box2D.Collision.b2Collision.CollidePolygonAndCircle = function (a, b, c, d, e)
{
    a.m_pointCount = 0;
    for (var f = e.position.x + (e.R.col1.x * d.m_p.x + e.R.col2.x * d.m_p.y) - c.position.x, g = e.position.y + (e.R.col1.y * d.m_p.x + e.R.col2.y * d.m_p.y) - c.position.y, e = f * c.R.col1.x + g * c.R.col1.y, c = f * c.R.col2.x + g * c.R.col2.y, f = 0, g = -Number.MAX_VALUE, h = b.m_radius + d.m_radius, i = 0; i < b.m_vertexCount; ++i)
    {
        var j = b.m_normals[i].x * (e - b.m_vertices[i].x) + b.m_normals[i].y * (c - b.m_vertices[i].y);
        if (j > h)
        {
            return
        }
        j > g && (g = j, f = i)
    }
    j = f + 1;
    j >= b.m_vertexCount && (j = 0);
    var i = b.m_vertices[f], k = b.m_vertices[j];
    g < Number.MIN_VALUE ? (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.SetV(b.m_normals[f]), a.m_localPoint.x = 0.5 * (i.x + k.x), a.m_localPoint.y = 0.5 * (i.y + k.y), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) : 0 >= (e - i.x) * (k.x - i.x) + (c - i.y) * (k.y - i.y) ? (e - i.x) * (e - i.x) + (c - i.y) * (c - i.y) > h * h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = e - i.x, a.m_localPlaneNormal.y =
        c - i.y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.SetV(i), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) : 0 >= (e - k.x) * (i.x - k.x) + (c - k.y) * (i.y - k.y) ? (e - k.x) * (e - k.x) + (c - k.y) * (c - k.y) > h * h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = e - k.x, a.m_localPlaneNormal.y = c - k.y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.SetV(k), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)) :
        (j = 0.5 * (i.x + k.x), i = 0.5 * (i.y + k.y), g = (e - j) * b.m_normals[f].x + (c - i) * b.m_normals[f].y, g > h || (a.m_pointCount = 1, a.m_type = Box2D.Collision.b2Manifold.e_faceA, a.m_localPlaneNormal.x = b.m_normals[f].x, a.m_localPlaneNormal.y = b.m_normals[f].y, a.m_localPlaneNormal.Normalize(), a.m_localPoint.Set(j, i), a.m_points[0].m_localPoint.SetV(d.m_p), a.m_points[0].m_id.SetKey(0)))
};
Box2D.Collision.b2Collision.s_incidentEdge = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints1 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_clipPoints2 = Box2D.Collision.b2Collision.MakeClipPointVector();
Box2D.Collision.b2Collision.s_localTangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_localNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_planePoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_tangent2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v11 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2Collision.s_v12 = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Collision.b2SeparationFunction = function ()
{

    this.m_localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_axis = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_proxyB = this.m_proxyA = null
};
Box2D.Collision.b2SeparationFunction.prototype.Initialize = function (a, b, c, d, e)
{
    this.m_proxyA = b;
    this.m_proxyB = d;
    var f = a.count;
    Box2D.Common.b2Settings.b2Assert(0 < f && 3 > f);
    var g, h, i = h = g = 0, j = 0, d = b = 0, k, l, i = 0;
    1 == f ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_points, f = this.m_proxyA.GetVertex(a.indexA[0]), a = this.m_proxyB.GetVertex(a.indexB[0]), l = f, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = a, k = e.R, i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), this.m_axis.x = i - g, this.m_axis.y = j - h, this.m_axis.Normalize()) : a.indexB[0] == a.indexB[1] ?
        (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA, b = this.m_proxyA.GetVertex(a.indexA[0]), d = this.m_proxyA.GetVertex(a.indexA[1]), a = this.m_proxyB.GetVertex(a.indexB[0]), this.m_localPoint.x = 0.5 * (b.x + d.x), this.m_localPoint.y = 0.5 * (b.y + d.y), j = Box2D.Common.Math.b2Math.SubtractVV(d, b), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), l = this.m_axis, k = c.R,
            b = k.col1.x * l.x + k.col2.x * l.y, d = k.col1.y * l.x + k.col2.y * l.y, l = this.m_localPoint, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = a, k = e.R, i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), 0 > (i - g) * b + (j - h) * d && this.m_axis.NegativeSelf()) : a.indexA[0] == a.indexA[0] ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB, g = this.m_proxyB.GetVertex(a.indexB[0]),
        h = this.m_proxyB.GetVertex(a.indexB[1]), f = this.m_proxyA.GetVertex(a.indexA[0]), this.m_localPoint.x = 0.5 * (g.x + h.x), this.m_localPoint.y = 0.5 * (g.y + h.y), j = Box2D.Common.Math.b2Math.SubtractVV(h, g), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), l = this.m_axis, k = e.R, b = k.col1.x * l.x + k.col2.x * l.y, d = k.col1.y * l.x + k.col2.y * l.y, l = this.m_localPoint, k = e.R,
        i = e.position.x + (k.col1.x * l.x + k.col2.x * l.y), j = e.position.y + (k.col1.y * l.x + k.col2.y * l.y), l = f, k = c.R, g = c.position.x + (k.col1.x * l.x + k.col2.x * l.y), h = c.position.y + (k.col1.y * l.x + k.col2.y * l.y), 0 > (g - i) * b + (h - j) * d && this.m_axis.NegativeSelf()) : (b = this.m_proxyA.GetVertex(a.indexA[0]), d = this.m_proxyA.GetVertex(a.indexA[1]), g = this.m_proxyB.GetVertex(a.indexB[0]), h = this.m_proxyB.GetVertex(a.indexB[1]), j = Box2D.Common.Math.b2Math.SubtractVV(d,
        b), i = Box2D.Common.Math.b2Math.MulMV(c.R, j), Box2D.Common.Math.b2Vec2.Free(j), j = Box2D.Common.Math.b2Math.SubtractVV(h, g), k = Box2D.Common.Math.b2Math.MulMV(e.R, j), Box2D.Common.Math.b2Vec2.Free(j), e = i.x * i.x + i.y * i.y, c = k.x * k.x + k.y * k.y, j = Box2D.Common.Math.b2Math.SubtractVV(k, i), a = i.x * j.x + i.y * j.y, f = k.x * j.x + k.y * j.y, Box2D.Common.Math.b2Vec2.Free(j), j = i.x * k.x + i.y * k.y, k = e * c - j * j, i = 0, 0 != k && (i = Box2D.Common.Math.b2Math.Clamp((j *
        f - a * c) / k, 0, 1)), 0 > (j * i + f) / c && (i = Box2D.Common.Math.b2Math.Clamp((j - a) / e, 0, 1)), f = Box2D.Common.Math.b2Vec2.Get(0, 0), f.x = b.x + i * (d.x - b.x), f.y = b.y + i * (d.y - b.y), a = Box2D.Common.Math.b2Vec2.Get(0, 0), a.x = g.x + i * (h.x - g.x), a.y = g.y + i * (h.y - g.y), 0 == i || 1 == i ? (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceB, j = Box2D.Common.Math.b2Math.SubtractVV(h, g), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j,
        1), Box2D.Common.Math.b2Vec2.Free(j), this.m_axis.Normalize(), this.m_localPoint = a) : (this.m_type = Box2D.Collision.b2SeparationFunction.e_faceA, j = Box2D.Common.Math.b2Math.SubtractVV(d, b), Box2D.Common.Math.b2Vec2.Free(this.m_axis), this.m_axis = Box2D.Common.Math.b2Math.CrossVF(j, 1), Box2D.Common.Math.b2Vec2.Free(j), this.m_localPoint = f), 0 > i && this.m_axis.NegativeSelf(), Box2D.Common.Math.b2Vec2.Free(f), Box2D.Common.Math.b2Vec2.Free(a))
};
Box2D.Collision.b2SeparationFunction.prototype.Evaluate = function (a, b)
{
    var c = 0;
    switch (this.m_type)
    {
        case Box2D.Collision.b2SeparationFunction.e_points:
            var c = Box2D.Common.Math.b2Math.MulTMV(a.R, this.m_axis), d = this.m_axis.GetNegative(), e = Box2D.Common.Math.b2Math.MulTMV(b.R, d);
            Box2D.Common.Math.b2Vec2.Free(d);
            var f = this.m_proxyA.GetSupportVertex(c);
            Box2D.Common.Math.b2Vec2.Free(c);
            c = this.m_proxyB.GetSupportVertex(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Math.MulX(a, f);
            f = Box2D.Common.Math.b2Math.MulX(b, c);
            c = (f.x - e.x) * this.m_axis.x + (f.y - e.y) * this.m_axis.y;
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        case Box2D.Collision.b2SeparationFunction.e_faceA:
            d = Box2D.Common.Math.b2Math.MulMV(a.R, this.m_axis);
            f = d.GetNegative();
            e = Box2D.Common.Math.b2Math.MulTMV(b.R, f);
            Box2D.Common.Math.b2Vec2.Free(f);
            c = this.m_proxyB.GetSupportVertex(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Math.MulX(a, this.m_localPoint);
            f = Box2D.Common.Math.b2Math.MulX(b, c);
            c = (f.x - e.x) * d.x + (f.y - e.y) * d.y;
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        case Box2D.Collision.b2SeparationFunction.e_faceB:
            d = Box2D.Common.Math.b2Math.MulMV(b.R, this.m_axis);
            f = d.GetNegative();
            c = Box2D.Common.Math.b2Math.MulTMV(a.R, f);
            Box2D.Common.Math.b2Vec2.Free(f);
            f = this.m_proxyA.GetSupportVertex(c);
            Box2D.Common.Math.b2Vec2.Free(c);
            e = Box2D.Common.Math.b2Math.MulX(a, f);
            f = Box2D.Common.Math.b2Math.MulX(b, this.m_localPoint);
            c = (e.x - f.x) * d.x + (e.y - f.y) * d.y;
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(e);
            Box2D.Common.Math.b2Vec2.Free(f);
            break;
        default:
            Box2D.Common.b2Settings.b2Assert(!1)
    }
    return c
};
Box2D.Collision.b2SeparationFunction.e_points = 1;
Box2D.Collision.b2SeparationFunction.e_faceA = 2;
Box2D.Collision.b2SeparationFunction.e_faceB = 4;
Box2D.Common.Math.b2Transform = function (a, b)
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.R = new Box2D.Common.Math.b2Mat22;
    a && this.position.SetV(a);
    b && this.R.SetM(b)
};
Box2D.Common.Math.b2Transform.prototype.Initialize = function (a, b)
{
    this.position.SetV(a);
    this.R.SetM(b)
};
Box2D.Common.Math.b2Transform.prototype.SetIdentity = function ()
{
    this.position.SetZero();
    this.R.SetIdentity()
};
Box2D.Common.Math.b2Transform.prototype.Set = function (a)
{
    this.position.SetV(a.position);
    this.R.SetM(a.R)
};
Box2D.Common.Math.b2Transform.prototype.GetAngle = function ()
{
    return Math.atan2(this.R.col1.y, this.R.col1.x)
};
Box2D.Collision.b2TimeOfImpact = {};
Box2D.Collision.b2TimeOfImpact.TimeOfImpact = function (a)
{
    Box2D.Collision.b2TimeOfImpact.b2_toiCalls++;
    var b = a.proxyA, c = a.proxyB, d = a.sweepA, e = a.sweepB;
    Box2D.Common.b2Settings.b2Assert(d.t0 == e.t0);
    Box2D.Common.b2Settings.b2Assert(1 - d.t0 > Number.MIN_VALUE);
    var f = b.m_radius + c.m_radius, a = a.tolerance, g = 0, h = 0, i = 0;
    Box2D.Collision.b2TimeOfImpact.s_cache.count = 0;
    for (Box2D.Collision.b2TimeOfImpact.s_distanceInput.useRadii = !1; ;)
    {
        d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, g);
        e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, g);
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyA = b;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.proxyB = c;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformA = Box2D.Collision.b2TimeOfImpact.s_xfA;
        Box2D.Collision.b2TimeOfImpact.s_distanceInput.transformB = Box2D.Collision.b2TimeOfImpact.s_xfB;
        Box2D.Collision.b2Distance.Distance(Box2D.Collision.b2TimeOfImpact.s_distanceOutput, Box2D.Collision.b2TimeOfImpact.s_cache, Box2D.Collision.b2TimeOfImpact.s_distanceInput);
        if (0 >= Box2D.Collision.b2TimeOfImpact.s_distanceOutput.distance)
        {
            g = 1;
            break
        }
        Box2D.Collision.b2TimeOfImpact.s_fcn.Initialize(Box2D.Collision.b2TimeOfImpact.s_cache, b, Box2D.Collision.b2TimeOfImpact.s_xfA, c, Box2D.Collision.b2TimeOfImpact.s_xfB);
        var j = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (0 >= j)
        {
            g = 1;
            break
        }
        0 == h && (i = j > f ? Math.max(f - a, 0.75 * f) : Math.max(j - a, 0.02 * f));
        if (j - i < 0.5 * a)
        {
            if (0 == h)
            {
                g = 1;
                break
            }
            break
        }
        var k = g, l = g, n = 1;
        d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, n);
        e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, n);
        var m = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
        if (m >= i)
        {
            g = 1;
            break
        }
        for (var o = 0; ;)
        {
            var p = 0, p = o & 1 ? l + (i - j) * (n - l) / (m - j) : 0.5 * (l + n);
            d.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfA, p);
            e.GetTransform(Box2D.Collision.b2TimeOfImpact.s_xfB, p);
            var q = Box2D.Collision.b2TimeOfImpact.s_fcn.Evaluate(Box2D.Collision.b2TimeOfImpact.s_xfA, Box2D.Collision.b2TimeOfImpact.s_xfB);
            if (Math.abs(q - i) < 0.025 * a)
            {
                k = p;
                break
            }
            q > i ? (l = p, j = q) : (n = p, m = q);
            o++;
            Box2D.Collision.b2TimeOfImpact.b2_toiRootIters++;
            if (50 == o)
            {
                break
            }
        }
        Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters, o);
        if (k < (1 + 100 * Number.MIN_VALUE) * g)
        {
            break
        }
        g = k;
        h++;
        Box2D.Collision.b2TimeOfImpact.b2_toiIters++;
        if (1E3 == h)
        {
            break
        }
    }
    Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = Math.max(Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters, h);
    return g
};
Box2D.Collision.b2TimeOfImpact.b2_toiCalls = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiRootIters = 0;
Box2D.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0;
Box2D.Collision.b2TimeOfImpact.s_cache = new Box2D.Collision.b2SimplexCache;
Box2D.Collision.b2TimeOfImpact.s_distanceInput = new Box2D.Collision.b2DistanceInput;
Box2D.Collision.b2TimeOfImpact.s_xfA = new Box2D.Common.Math.b2Transform;
Box2D.Collision.b2TimeOfImpact.s_xfB = new Box2D.Common.Math.b2Transform;
Box2D.Collision.b2TimeOfImpact.s_fcn = new Box2D.Collision.b2SeparationFunction;
Box2D.Collision.b2TimeOfImpact.s_distanceOutput = new Box2D.Collision.b2DistanceOutput;
Box2D.Dynamics.b2BodyDef = function ()
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearVelocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.angularDamping = this.linearDamping = this.angularVelocity = this.angle = 0;
    this.awake = this.allowSleep = !0;
    this.bullet = this.fixedRotation = !1;
    this.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
    this.active = !0;
    this.inertiaScale = 1
};
Box2D.Dynamics.b2BodyDef.b2_staticBody = 0;
Box2D.Dynamics.b2BodyDef.b2_kinematicBody = 1;
Box2D.Dynamics.b2BodyDef.b2_dynamicBody = 2;
Box2D.Dynamics.Contacts = {};
Box2D.Dynamics.Contacts.b2Contact = function (a, b)
{

    this.ID = "Contact" + Box2D.Dynamics.Contacts.b2Contact.NEXT_ID++;
    this.m_manifold = new Box2D.Collision.b2Manifold;
    this.m_oldManifold = new Box2D.Collision.b2Manifold;
    this.touching = !1;
    var c = a.GetBody(), d = b.GetBody();
    this.continuous = c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || c.IsBullet() || d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet();
    this.sensor = a.IsSensor() || b.IsSensor();
    this.filtering = !1;
    this.m_fixtureA = a;
    this.m_fixtureB = b;
    this.enabled = !0;
    this.bodyAList = c.GetContactList();
    this.bodyBList = d.GetContactList();
    this.worldList = d.GetWorld().GetContactList();
    this.AddToLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Reset = function (a, b)
{
    this.m_manifold.Reset();
    this.m_oldManifold.Reset();
    this.touching = !1;
    var c = a.GetBody(), d = b.GetBody();
    this.continuous = c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || c.IsBullet() || d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet();
    this.sensor = a.IsSensor() || b.IsSensor();
    this.filtering = !1;
    this.m_fixtureA = a;
    this.m_fixtureB = b;
    this.enabled = !0;
    this.bodyAList = c.GetContactList();
    this.bodyBList = d.GetContactList();
    this.worldList = d.GetWorld().GetContactList();
    this.AddToLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.AddToLists = function ()
{
    this.bodyAList.AddContact(this);
    this.bodyBList.AddContact(this);
    this.worldList.AddContact(this);
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.UpdateLists = function ()
{
    var a = !1, b = !1;
    !this.IsSensor() && this.IsEnabled() && (this.IsTouching() && (a = !0), this.IsContinuous() && (b = !0));
    this.bodyAList.UpdateContact(this, a, b);
    this.bodyBList.UpdateContact(this, a, b);
    this.worldList.UpdateContact(this, a, b)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.RemoveFromLists = function ()
{
    this.bodyAList.RemoveContact(this);
    this.bodyBList.RemoveContact(this);
    this.worldList.RemoveContact(this)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetManifold = function ()
{
    return this.m_manifold
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetWorldManifold = function (a)
{
    var b = this.m_fixtureA.GetBody(), c = this.m_fixtureB.GetBody(), d = this.m_fixtureA.GetShape(), e = this.m_fixtureB.GetShape();
    a.Initialize(this.m_manifold, b.GetTransform(), d.m_radius, c.GetTransform(), e.m_radius)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsTouching = function ()
{
    return this.touching
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsContinuous = function ()
{
    return this.continuous
};
Box2D.Dynamics.Contacts.b2Contact.prototype.SetSensor = function (a)
{
    this.sensor = a;
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsSensor = function ()
{
    return this.sensor
};
Box2D.Dynamics.Contacts.b2Contact.prototype.SetEnabled = function (a)
{
    this.enabled = a;
    this.UpdateLists()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsEnabled = function ()
{
    return this.enabled
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetNext = function ()
{
    return this.m_next
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureA = function ()
{
    return this.m_fixtureA
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetFixtureB = function ()
{
    return this.m_fixtureB
};
Box2D.Dynamics.Contacts.b2Contact.prototype.GetOther = function (a)
{
    var b = this.m_fixtureA.GetBody();
    return b != a ? b : this.m_fixtureB.GetBody()
};
Box2D.Dynamics.Contacts.b2Contact.prototype.FlagForFiltering = function ()
{
    this.filtering = !0
};
Box2D.Dynamics.Contacts.b2Contact.prototype.ClearFiltering = function ()
{
    this.filtering = !1
};
Box2D.Dynamics.Contacts.b2Contact.prototype.IsFiltering = function ()
{
    return this.filtering
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Update = function (a)
{
    var b = this.m_oldManifold;
    this.m_oldManifold = this.m_manifold;
    this.m_manifold = b;
    this.enabled = !0;
    var b = !1, c = this.IsTouching(), d = this.m_fixtureA.GetBody(), e = this.m_fixtureB.GetBody(), f = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
    if (this.sensor)
    {
        f && (b = Box2D.Collision.Shapes.b2Shape.TestOverlap(this.m_fixtureA.GetShape(), d.GetTransform(), this.m_fixtureB.GetShape(), e.GetTransform())), this.m_manifold.m_pointCount = 0
    } else
    {
        this.continuous = d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || d.IsBullet() || e.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || e.IsBullet() ? !0 : !1;
        if (f)
        {
            this.Evaluate();
            b = 0 < this.m_manifold.m_pointCount;
            for (f = 0; f < this.m_manifold.m_pointCount; f++)
            {
                var g = this.m_manifold.m_points[f];
                g.m_normalImpulse = 0;
                for (var h = g.m_tangentImpulse = 0; h < this.m_oldManifold.m_pointCount; h++)
                {
                    var i = this.m_oldManifold.m_points[h];
                    if (i.m_id.GetKey() == g.m_id.GetKey())
                    {
                        g.m_normalImpulse = i.m_normalImpulse;
                        g.m_tangentImpulse = i.m_tangentImpulse;
                        break
                    }
                }
            }
        } else
        {
            this.m_manifold.m_pointCount = 0
        }
        b != c && (d.SetAwake(!0), e.SetAwake(!0))
    }
    this.touching = b;
    b != c && this.UpdateLists();
    !c && b && a.BeginContact(this);
    c && !b && a.EndContact(this);
    this.sensor || a.PreSolve(this, this.m_oldManifold)
};
Box2D.Dynamics.Contacts.b2Contact.prototype.Evaluate = function ()
{
};
Box2D.Dynamics.Contacts.b2Contact.prototype.ComputeTOI = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
    Box2D.Dynamics.Contacts.b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
    Box2D.Dynamics.Contacts.b2Contact.s_input.sweepA = a;
    Box2D.Dynamics.Contacts.b2Contact.s_input.sweepB = b;
    Box2D.Dynamics.Contacts.b2Contact.s_input.tolerance = Box2D.Common.b2Settings.b2_linearSlop;
    return Box2D.Collision.b2TimeOfImpact.TimeOfImpact(Box2D.Dynamics.Contacts.b2Contact.s_input)
};
Box2D.Dynamics.Contacts.b2Contact.s_input = new Box2D.Collision.b2TOIInput;
Box2D.Dynamics.Contacts.b2Contact.NEXT_ID = 0;
Box2D.Collision.Shapes.b2MassData = function ()
{

    this.mass = 0;
    this.center = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.I = 0
};
Box2D.Collision.Shapes.b2MassData._freeCache = [];
Box2D.Collision.Shapes.b2MassData.Get = function ()
{

    if (0 < Box2D.Collision.Shapes.b2MassData._freeCache.length)
    {
        var a = Box2D.Collision.Shapes.b2MassData._freeCache.pop();
        a.mass = 0;
        a.center.SetZero();
        a.I = 0;
        return a
    }
    return new Box2D.Collision.Shapes.b2MassData
};
Box2D.Collision.Shapes.b2MassData.Free = function (a)
{
    null != a && ( Box2D.Collision.Shapes.b2MassData._freeCache.push(a))
};
Box2D.Collision.Shapes.b2MassData.prototype.SetV = function (a, b, c)
{
    this.mass = a;
    this.center.SetV(b);
    this.I = c
};
Box2D.Collision.Shapes.b2MassData.prototype.Set = function (a, b, c, d)
{
    this.mass = a;
    this.center.Set(b, c);
    this.I = d
};
Box2D.Collision.Shapes.b2PolygonShape = function ()
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_centroid = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_vertices = [];
    this.m_normals = []
};
goog.inherits(Box2D.Collision.Shapes.b2PolygonShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2PolygonShape.NAME
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Copy = function ()
{
    var a = new Box2D.Collision.Shapes.b2PolygonShape;
    a.Set(this);
    return a
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Set = function (a)
{
    Box2D.Collision.Shapes.b2Shape.prototype.Set.call(this, a);
    if (a instanceof Box2D.Collision.Shapes.b2PolygonShape)
    {
        this.m_centroid.SetV(a.m_centroid);
        this.m_vertexCount = a.m_vertexCount;
        this.Reserve(this.m_vertexCount);
        for (var b = 0; b < this.m_vertexCount; b++)
        {
            this.m_vertices[b].SetV(a.m_vertices[b]), this.m_normals[b].SetV(a.m_normals[b])
        }
    }
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsArray = function (a)
{
    this.SetAsVector(a)
};
Box2D.Collision.Shapes.b2PolygonShape.AsArray = function (a)
{
    var b = new Box2D.Collision.Shapes.b2PolygonShape;
    b.SetAsArray(a);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsVector = function (a)
{
    var b = a.length;
    Box2D.Common.b2Settings.b2Assert(2 <= b);
    this.m_vertexCount = b;
    this.Reserve(b);
    for (b = b = 0; b < this.m_vertexCount; b++)
    {
        this.m_vertices[b].SetV(a[b])
    }
    for (b = 0; b < this.m_vertexCount; ++b)
    {
        a = Box2D.Common.Math.b2Math.SubtractVV(this.m_vertices[b + 1 < this.m_vertexCount ? b + 1 : 0], this.m_vertices[b]);
        Box2D.Common.b2Settings.b2Assert(a.LengthSquared() > Number.MIN_VALUE);
        var c = Box2D.Common.Math.b2Math.CrossVF(a, 1);
        Box2D.Common.Math.b2Vec2.Free(a);
        this.m_normals[b].SetV(c);
        Box2D.Common.Math.b2Vec2.Free(c);
        this.m_normals[b].Normalize()
    }
    this.m_centroid = Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
Box2D.Collision.Shapes.b2PolygonShape.AsVector = function (a)
{
    var b = new Box2D.Collision.Shapes.b2PolygonShape;
    b.SetAsVector(a);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsBox = function (a, b)
{
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set(-a, -b);
    this.m_vertices[1].Set(a, -b);
    this.m_vertices[2].Set(a, b);
    this.m_vertices[3].Set(-a, b);
    this.m_normals[0].Set(0, -1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set(-1, 0);
    this.m_centroid.SetZero()
};
Box2D.Collision.Shapes.b2PolygonShape.AsBox = function (a, b)
{
    var c = new Box2D.Collision.Shapes.b2PolygonShape;
    c.SetAsBox(a, b);
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsOrientedBox = function (a, b, c, d)
{
    this.m_vertexCount = 4;
    this.Reserve(4);
    this.m_vertices[0].Set(-a, -b);
    this.m_vertices[1].Set(a, -b);
    this.m_vertices[2].Set(a, b);
    this.m_vertices[3].Set(-a, b);
    this.m_normals[0].Set(0, -1);
    this.m_normals[1].Set(1, 0);
    this.m_normals[2].Set(0, 1);
    this.m_normals[3].Set(-1, 0);
    this.m_centroid = c;
    a = new Box2D.Common.Math.b2Mat22;
    a.Set(d);
    c = new Box2D.Common.Math.b2Transform(c, a);
    for (d = 0; d < this.m_vertexCount; ++d)
    {
        this.m_vertices[d] = Box2D.Common.Math.b2Math.MulX(c, this.m_vertices[d]), this.m_normals[d] = Box2D.Common.Math.b2Math.MulMV(c.R, this.m_normals[d])
    }
};
Box2D.Collision.Shapes.b2PolygonShape.AsOrientedBox = function (a, b, c, d)
{
    var e = new Box2D.Collision.Shapes.b2PolygonShape;
    e.SetAsOrientedBox(a, b, c, d);
    return e
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetAsEdge = function (a, b)
{
    this.m_vertexCount = 2;
    this.Reserve(2);
    this.m_vertices[0].SetV(a);
    this.m_vertices[1].SetV(b);
    this.m_centroid.x = 0.5 * (a.x + b.x);
    this.m_centroid.y = 0.5 * (a.y + b.y);
    var c = Box2D.Common.Math.b2Math.SubtractVV(b, a), d = Box2D.Common.Math.b2Math.CrossVF(c, 1);
    Box2D.Common.Math.b2Vec2.Free(c);
    this.m_normals[0] = d;
    Box2D.Common.Math.b2Vec2.Free(d);
    this.m_normals[0].Normalize();
    this.m_normals[1].x = -this.m_normals[0].x;
    this.m_normals[1].y = -this.m_normals[0].y
};
Box2D.Collision.Shapes.b2PolygonShape.AsEdge = function (a, b)
{
    var c = new Box2D.Collision.Shapes.b2PolygonShape;
    c.SetAsEdge(a, b);
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.TestPoint = function (a, b)
{
    var c;
    c = a.R;
    for (var d = b.x - a.position.x, e = b.y - a.position.y, f = d * c.col1.x + e * c.col1.y, g = d * c.col2.x + e * c.col2.y, h = 0; h < this.m_vertexCount; ++h)
    {
        if (c = this.m_vertices[h], d = f - c.x, e = g - c.y, c = this.m_normals[h], 0 < c.x * d + c.y * e)
        {
            return!1
        }
    }
    return!0
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.RayCast = function (a, b, c)
{
    var d = 0, e = b.maxFraction, f = 0, g = 0, h, i, f = b.p1.x - c.position.x, g = b.p1.y - c.position.y;
    h = c.R;
    var j = f * h.col1.x + g * h.col1.y, k = f * h.col2.x + g * h.col2.y, f = b.p2.x - c.position.x, g = b.p2.y - c.position.y;
    h = c.R;
    b = f * h.col1.x + g * h.col1.y - j;
    h = f * h.col2.x + g * h.col2.y - k;
    for (var l = -1, n = 0; n < this.m_vertexCount; ++n)
    {
        i = this.m_vertices[n];
        f = i.x - j;
        g = i.y - k;
        i = this.m_normals[n];
        f = i.x * f + i.y * g;
        g = i.x * b + i.y * h;
        if (0 == g)
        {
            if (0 > f)
            {
                return!1
            }
        } else
        {
            0 > g && f < d * g ? (d = f / g, l = n) : 0 < g && f < e * g && (e = f / g)
        }
        if (e < d - Number.MIN_VALUE)
        {
            return!1
        }
    }
    return 0 <= l ? (a.fraction = d, h = c.R, i = this.m_normals[l], a.normal.x = h.col1.x * i.x + h.col2.x * i.y, a.normal.y = h.col1.y * i.x + h.col2.y * i.y, !0) : !1
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeAABB = function (a, b)
{
    for (var c = b.R, d = this.m_vertices[0], e = b.position.x + (c.col1.x * d.x + c.col2.x * d.y), f = b.position.y + (c.col1.y * d.x + c.col2.y * d.y), g = e, h = f, i = 1; i < this.m_vertexCount; ++i)
    {
        var d = this.m_vertices[i], j = b.position.x + (c.col1.x * d.x + c.col2.x * d.y), d = b.position.y + (c.col1.y * d.x + c.col2.y * d.y), e = e < j ? e : j, f = f < d ? f : d, g = g > j ? g : j, h = h > d ? h : d
    }
    a.lowerBound.x = e - this.m_radius;
    a.lowerBound.y = f - this.m_radius;
    a.upperBound.x = g + this.m_radius;
    a.upperBound.y = h + this.m_radius
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeMass = function (a, b)
{
    if (2 == this.m_vertexCount)
    {
        a.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x), a.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y), a.mass = 0, a.I = 0
    } else
    {
        for (var c = 0, d = 0, e = 0, f = 0, g = 1 / 3, h = 0; h < this.m_vertexCount; ++h)
        {
            var i = this.m_vertices[h], j = h + 1 < this.m_vertexCount ? this.m_vertices[h + 1] : this.m_vertices[0], k = i.x - 0, l = i.y - 0, n = j.x - 0, m = j.y - 0, o = k * m - l * n, p = 0.5 * o, e = e + p, c = c + p * g * (0 + i.x + j.x), d = d + p * g * (0 + i.y + j.y), i = k, f = f + o * (g * (0.25 * (i * i + n * i + n * n) + (0 * i + 0 * n)) + 0 + (g * (0.25 * (l * l + m * l + m * m) + (0 * l + 0 * m)) + 0))
        }
        a.Set(b * e, c * (1 / e), d * (1 / e), b * f)
    }
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    for (var e = Box2D.Common.Math.b2Math.MulTMV(c.R, a), f = b - Box2D.Common.Math.b2Math.Dot(a, c.position), g = [], h = 0, i = -1, b = -1, j = !1, a = a = 0; a < this.m_vertexCount; ++a)
    {
        g[a] = Box2D.Common.Math.b2Math.Dot(e, this.m_vertices[a]) - f;
        var k = g[a] < -Number.MIN_VALUE;
        0 < a && (k ? j || (i = a - 1, h++) : j && (b = a - 1, h++));
        j = k
    }
    Box2D.Common.Math.b2Vec2.Free(e);
    switch (h)
    {
        case 0:
            return j ? (a = Box2D.Collision.Shapes.b2MassData.Get(), this.ComputeMass(a, 1), c = Box2D.Common.Math.b2Math.MulX(c, a.center), d.SetV(c), Box2D.Common.Math.b2Vec2.Free(c), d = a.mass, Box2D.Collision.Shapes.b2MassData.Free(a), d) : 0;
        case 1:
            -1 == i ? i = this.m_vertexCount - 1 : b = this.m_vertexCount - 1
    }
    a = (i + 1) % this.m_vertexCount;
    e = (b + 1) % this.m_vertexCount;
    f = (0 - g[i]) / (g[a] - g[i]);
    g = (0 - g[b]) / (g[e] - g[b]);
    i = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[i].x * (1 - f) + this.m_vertices[a].x * f, this.m_vertices[i].y * (1 - f) + this.m_vertices[a].y * f);
    f = Box2D.Common.Math.b2Vec2.Get(this.m_vertices[b].x * (1 - g) + this.m_vertices[e].x * g, this.m_vertices[b].y * (1 - g) + this.m_vertices[e].y * g);
    b = 0;
    g = Box2D.Common.Math.b2Vec2.Get(0, 0);
    for (h = this.m_vertices[a]; a != e;)
    {
        a = (a + 1) % this.m_vertexCount, j = a == e ? f : this.m_vertices[a], k = 0.5 * ((h.x - i.x) * (j.y - i.y) - (h.y - i.y) * (j.x - i.x)), b += k, g.x += k * (i.x + h.x + j.x) / 3, g.y += k * (i.y + h.y + j.y) / 3, h = j
    }
    Box2D.Common.Math.b2Vec2.Free(i);
    Box2D.Common.Math.b2Vec2.Free(f);
    g.Multiply(1 / b);
    c = Box2D.Common.Math.b2Math.MulX(c, g);
    Box2D.Common.Math.b2Vec2.Free(g);
    d.SetV(c);
    Box2D.Common.Math.b2Vec2.Free(c);
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.SetDistanceProxy = function (a)
{
    a.SetValues(this.m_vertexCount, this.m_radius, this.m_vertices)
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertexCount = function ()
{
    return this.m_vertexCount
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetVertices = function ()
{
    return this.m_vertices
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetNormals = function ()
{
    return this.m_normals
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupport = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_vertexCount; ++d)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return b
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.GetSupportVertex = function (a)
{
    for (var b = 0, c = this.m_vertices[0].x * a.x + this.m_vertices[0].y * a.y, d = 1; d < this.m_vertexCount; ++d)
    {
        var e = this.m_vertices[d].x * a.x + this.m_vertices[d].y * a.y;
        e > c && (b = d, c = e)
    }
    return this.m_vertices[b]
};
Box2D.Collision.Shapes.b2PolygonShape.prototype.Reserve = function (a)
{
    for (var b = 0; b < this.m_vertices.length; b++)
    {
        Box2D.Common.Math.b2Vec2.Free(this.m_vertices[b]), Box2D.Common.Math.b2Vec2.Free(this.m_normals[b])
    }
    this.m_vertices = [];
    this.m_normals = [];
    for (b = 0; b < a; b++)
    {
        this.m_vertices[b] = Box2D.Common.Math.b2Vec2.Get(0, 0), this.m_normals[b] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Collision.Shapes.b2PolygonShape.ComputeCentroid = function (a, b)
{
    for (var c = Box2D.Common.Math.b2Vec2.Get(0, 0), d = 0, e = 1 / 3, f = 0; f < b; ++f)
    {
        var g = a[f], h = f + 1 < b ? a[f + 1] : a[0], i = 0.5 * ((g.x - 0) * (h.y - 0) - (g.y - 0) * (h.x - 0)), d = d + i;
        c.x += i * e * (0 + g.x + h.x);
        c.y += i * e * (0 + g.y + h.y)
    }
    c.x *= 1 / d;
    c.y *= 1 / d;
    return c
};
Box2D.Collision.Shapes.b2PolygonShape.s_mat = new Box2D.Common.Math.b2Mat22;
Box2D.Collision.Shapes.b2PolygonShape.NAME = "b2PolygonShape";
Box2D.Collision.Shapes.b2EdgeShape = function (a, b)
{

    Box2D.Collision.Shapes.b2Shape.call(this);
    this.m_nextEdge = this.m_prevEdge = null;
    this.m_v1 = a;
    this.m_v2 = b;
    this.m_direction = Box2D.Common.Math.b2Vec2.Get(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
    this.m_length = this.m_direction.Normalize();
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(this.m_direction.y, -this.m_direction.x);
    this.m_coreV1 = Box2D.Common.Math.b2Vec2.Get(-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
    this.m_coreV2 = Box2D.Common.Math.b2Vec2.Get(-Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -Box2D.Common.b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
    this.m_cornerDir1 = this.m_normal;
    this.m_cornerDir2 = Box2D.Common.Math.b2Vec2.Get(-this.m_normal.x, -this.m_normal.y);
    this.m_cornerConvex2 = this.m_cornerConvex1 = !1
};
goog.inherits(Box2D.Collision.Shapes.b2EdgeShape, Box2D.Collision.Shapes.b2Shape);
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetTypeName = function ()
{
    return Box2D.Collision.Shapes.b2EdgeShape.NAME
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.TestPoint = function ()
{
    return!1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.RayCast = function (a, b, c)
{
    var d = b.p2.x - b.p1.x, e = b.p2.y - b.p1.y, f = c.R, g = c.position.x + (f.col1.x * this.m_v1.x + f.col2.x * this.m_v1.y), h = c.position.y + (f.col1.y * this.m_v1.x + f.col2.y * this.m_v1.y), i = c.position.y + (f.col1.y * this.m_v2.x + f.col2.y * this.m_v2.y) - h, c = -(c.position.x + (f.col1.x * this.m_v2.x + f.col2.x * this.m_v2.y) - g), f = 100 * Number.MIN_VALUE, j = -(d * i + e * c);
    if (j > f)
    {
        var g = b.p1.x - g, k = b.p1.y - h, h = g * i + k * c;
        if (0 <= h && h <= b.maxFraction * j && (b = -d * k + e * g, -f * j <= b && b <= j * (1 + f)))
        {
            return a.fraction = h / j, b = Math.sqrt(i * i + c * c), a.normal.x = i / b, a.normal.y = c / b, !0
        }
    }
    return!1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeAABB = function (a, b)
{
    var c = b.R, d = b.position.x + (c.col1.x * this.m_v1.x + c.col2.x * this.m_v1.y), e = b.position.y + (c.col1.y * this.m_v1.x + c.col2.y * this.m_v1.y), f = b.position.x + (c.col1.x * this.m_v2.x + c.col2.x * this.m_v2.y), c = b.position.y + (c.col1.y * this.m_v2.x + c.col2.y * this.m_v2.y);
    d < f ? (a.lowerBound.x = d, a.upperBound.x = f) : (a.lowerBound.x = f, a.upperBound.x = d);
    e < c ? (a.lowerBound.y = e, a.upperBound.y = c) : (a.lowerBound.y = c, a.upperBound.y = e)
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeMass = function (a)
{
    a.mass = 0;
    a.center.SetV(this.m_v1);
    a.I = 0
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.ComputeSubmergedArea = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    var e = Box2D.Common.Math.b2Vec2.Get(a.x * b, a.y * b), f = Box2D.Common.Math.b2Math.MulX(c, this.m_v1), c = Box2D.Common.Math.b2Math.MulX(c, this.m_v2), g = Box2D.Common.Math.b2Math.Dot(a, f) - b, a = Box2D.Common.Math.b2Math.Dot(a, c) - b;
    if (0 < g)
    {
        if (0 < a)
        {
            return 0
        }
        f.x = -a / (g - a) * f.x + g / (g - a) * c.x;
        f.y = -a / (g - a) * f.y + g / (g - a) * c.y
    } else
    {
        0 < a && (c.x = -a / (g - a) * f.x + g / (g - a) * c.x, c.y = -a / (g - a) * f.y + g / (g - a) * c.y)
    }
    d.x = (e.x + f.x + c.x) / 3;
    d.y = (e.y + f.y + c.y) / 3;
    return 0.5 * ((f.x - e.x) * (c.y - e.y) - (f.y - e.y) * (c.x - e.x))
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetLength = function ()
{
    return this.m_length
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex1 = function ()
{
    return this.m_v1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetVertex2 = function ()
{
    return this.m_v2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex1 = function ()
{
    return this.m_coreV1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCoreVertex2 = function ()
{
    return this.m_coreV2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNormalVector = function ()
{
    return this.m_normal
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetDirectionVector = function ()
{
    return this.m_direction
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner1Vector = function ()
{
    return this.m_cornerDir1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetCorner2Vector = function ()
{
    return this.m_cornerDir2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner1IsConvex = function ()
{
    return this.m_cornerConvex1
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Corner2IsConvex = function ()
{
    return this.m_cornerConvex2
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetFirstVertex = function (a)
{
    var b = a.R;
    return Box2D.Common.Math.b2Vec2.Get(a.position.x + (b.col1.x * this.m_coreV1.x + b.col2.x * this.m_coreV1.y), a.position.y + (b.col1.y * this.m_coreV1.x + b.col2.y * this.m_coreV1.y))
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetNextEdge = function ()
{
    return this.m_nextEdge
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.GetPrevEdge = function ()
{
    return this.m_prevEdge
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.Support = function (a, b, c)
{
    var d = a.R, e = a.position.x + (d.col1.x * this.m_coreV1.x + d.col2.x * this.m_coreV1.y), f = a.position.y + (d.col1.y * this.m_coreV1.x + d.col2.y * this.m_coreV1.y), g = a.position.x + (d.col1.x * this.m_coreV2.x + d.col2.x * this.m_coreV2.y), a = a.position.y + (d.col1.y * this.m_coreV2.x + d.col2.y * this.m_coreV2.y);
    return e * b + f * c > g * b + a * c ? Box2D.Common.Math.b2Vec2.Get(e, f) : Box2D.Common.Math.b2Vec2.Get(g, a)
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetPrevEdge = function (a, b, c, d)
{
    this.m_prevEdge = a;
    this.m_coreV1 = b;
    this.m_cornerDir1 = c;
    this.m_cornerConvex1 = d
};
Box2D.Collision.Shapes.b2EdgeShape.prototype.SetNextEdge = function (a, b, c, d)
{
    this.m_nextEdge = a;
    this.m_coreV2 = b;
    this.m_cornerDir2 = c;
    this.m_cornerConvex2 = d
};
Box2D.Collision.Shapes.b2EdgeShape.NAME = "b2EdgeShape";
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Reset = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2EdgeShape);
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.Evaluate = function ()
{
    this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function ()
{
};
Box2D.Dynamics.b2TimeStep = function (a, b, c, d, e)
{

    this.Reset(a, b, c, d, e)
};
Box2D.Dynamics.b2TimeStep.prototype.Reset = function (a, b, c, d, e)
{
    this.dt = a;
    var f = 0;
    0 < a && (f = 1 / a);
    this.inv_dt = f;
    this.dtRatio = b;
    this.positionIterations = c;
    this.velocityIterations = d;
    this.warmStarting = e
};
Box2D.Dynamics.Joints.b2FrictionJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_linearMass = new Box2D.Common.Math.b2Mat22;
    this.m_linearImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchorA.SetV(a.localAnchorA);
    this.m_localAnchorB.SetV(a.localAnchorB);
    this.m_linearMass.SetZero();
    this.m_angularMass = 0;
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0;
    this.m_maxForce = a.maxForce;
    this.m_maxTorque = a.maxTorque
};
goog.inherits(Box2D.Dynamics.Joints.b2FrictionJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return new Box2D.Common.Math.b2Vec2.Get(a * this.m_linearImpulse.x, a * this.m_linearImpulse.y)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_angularImpulse
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxForce = a
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxForce = function ()
{
    return this.m_maxForce
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SetMaxTorque = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxTorque = a
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.GetMaxTorque = function ()
{
    return this.m_maxTorque
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchorA.x - d.m_sweep.localCenter.x, g = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchorB.x - e.m_sweep.localCenter.x, i = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    b = d.m_invMass;
    var c = e.m_invMass, j = d.m_invI, k = e.m_invI, l = new b2Mat22;
    l.col1.x = b + c;
    l.col2.x = 0;
    l.col1.y = 0;
    l.col2.y = b + c;
    l.col1.x += j * g * g;
    l.col2.x += -j * f * g;
    l.col1.y += -j * f * g;
    l.col2.y += j * f * f;
    l.col1.x += k * i * i;
    l.col2.x += -k * h * i;
    l.col1.y += -k * h * i;
    l.col2.y += k * h * h;
    l.GetInverse(this.m_linearMass);
    this.m_angularMass = j + k;
    0 < this.m_angularMass && (this.m_angularMass = 1 / this.m_angularMass);
    a.warmStarting ? (this.m_linearImpulse.x *= a.dtRatio, this.m_linearImpulse.y *= a.dtRatio, this.m_angularImpulse *= a.dtRatio, a = this.m_linearImpulse, d.m_linearVelocity.x -= b * a.x, d.m_linearVelocity.y -= b * a.y, d.m_angularVelocity -= j * (f * a.y - g * a.x + this.m_angularImpulse), e.m_linearVelocity.x += c * a.x, e.m_linearVelocity.y += c * a.y, e.m_angularVelocity += k * (h * a.y - i * a.x + this.m_angularImpulse)) : (this.m_linearImpulse.SetZero(), this.m_angularImpulse = 0)
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB, f = d.m_linearVelocity, g = d.m_angularVelocity, h = e.m_linearVelocity, i = e.m_angularVelocity, j = d.m_invMass, k = e.m_invMass, l = d.m_invI, n = e.m_invI;
    b = d.m_xf.R;
    var m = this.m_localAnchorA.x - d.m_sweep.localCenter.x, o = this.m_localAnchorA.y - d.m_sweep.localCenter.y, c = b.col1.x * m + b.col2.x * o, o = b.col1.y * m + b.col2.y * o, m = c;
    b = e.m_xf.R;
    var p = this.m_localAnchorB.x - e.m_sweep.localCenter.x, q = this.m_localAnchorB.y - e.m_sweep.localCenter.y, c = b.col1.x * p + b.col2.x * q, q = b.col1.y * p + b.col2.y * q, p = c;
    b = 0;
    var c = -this.m_angularMass * (i - g), r = this.m_angularImpulse;
    b = a.dt * this.m_maxTorque;
    this.m_angularImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_angularImpulse + c, -b, b);
    c = this.m_angularImpulse - r;
    g -= l * c;
    i += n * c;
    b = Box2D.Common.Math.b2Vec2.Get(-(h.x - i * q - f.x + g * o), -(h.y + i * p - f.y - g * m));
    b.MulM(this.m_linearMass);
    c = this.m_linearImpulse.Copy();
    this.m_linearImpulse.Add(b);
    Box2D.Common.Math.b2Vec2.Free(b);
    b = a.dt * this.m_maxForce;
    this.m_linearImpulse.LengthSquared() > b * b && (this.m_linearImpulse.Normalize(), this.m_linearImpulse.Multiply(b));
    b = Box2D.Common.Math.b2Math.SubtractVV(this.m_linearImpulse, c);
    Box2D.Common.Math.b2Vec2.Free(c);
    f.x -= j * b.x;
    f.y -= j * b.y;
    g -= l * (m * b.y - o * b.x);
    h.x += k * b.x;
    h.y += k * b.y;
    i += n * (p * b.y - q * b.x);
    Box2D.Common.Math.b2Vec2.Free(b);
    d.m_angularVelocity = g;
    e.m_angularVelocity = i
};
Box2D.Dynamics.Joints.b2FrictionJoint.prototype.SolvePositionConstraints = function ()
{
    return!0
};
Box2D.Dynamics.b2DestructionListener = function ()
{
};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeJoint = function ()
{
};
Box2D.Dynamics.b2DestructionListener.prototype.SayGoodbyeFixture = function ()
{
};
Box2D.Dynamics.b2FilterData = function ()
{

    this.categoryBits = 1;
    this.maskBits = 65535;
    this.groupIndex = 0
};
Box2D.Dynamics.b2FilterData.prototype.Copy = function ()
{
    var a = new Box2D.Dynamics.b2FilterData;
    a.categoryBits = this.categoryBits;
    a.maskBits = this.maskBits;
    a.groupIndex = this.groupIndex;
    return a
};
Box2D.Dynamics.b2Fixture = function (a, b, c)
{

    this.ID = "Fixture" + Box2D.Dynamics.b2Fixture.NEXT_ID++;
    this.m_filter = c.filter.Copy();
    this.m_aabb = Box2D.Collision.b2AABB.Get();
    this.m_aabb_temp = Box2D.Collision.b2AABB.Get();
    this.m_body = a;
    this.m_shape = c.shape.Copy();
    this.m_density = c.density;
    this.m_friction = c.friction;
    this.m_restitution = c.restitution;
    this.m_isSensor = c.isSensor
};
Box2D.Dynamics.b2Fixture.prototype.GetShape = function ()
{
    return this.m_shape
};
Box2D.Dynamics.b2Fixture.prototype.SetSensor = function (a)
{
    if (this.m_isSensor != a && (this.m_isSensor = a, null != this.m_body))
    {
        for (a = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            var b = a.contact.GetFixtureA(), c = a.contact.GetFixtureB();
            if (b == this || c == this)
            {
                a.contact.SetSensor(b.IsSensor() || c.IsSensor())
            }
        }
    }
};
Box2D.Dynamics.b2Fixture.prototype.IsSensor = function ()
{
    return this.m_isSensor
};
Box2D.Dynamics.b2Fixture.prototype.SetFilterData = function (a)
{
    this.m_filter = a.Copy();
    if (null != this.m_body)
    {
        for (a = this.m_body.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            (a.contact.GetFixtureA() == this || a.contact.GetFixtureB() == this) && a.contact.FlagForFiltering()
        }
    }
};
Box2D.Dynamics.b2Fixture.prototype.GetFilterData = function ()
{
    return this.m_filter
};
Box2D.Dynamics.b2Fixture.prototype.GetBody = function ()
{
    return this.m_body
};
Box2D.Dynamics.b2Fixture.prototype.TestPoint = function (a)
{
    return this.m_shape.TestPoint(this.m_body.GetTransform(), a)
};
Box2D.Dynamics.b2Fixture.prototype.RayCast = function (a, b)
{
    return this.m_shape.RayCast(a, b, this.m_body.GetTransform())
};
Box2D.Dynamics.b2Fixture.prototype.GetMassData = function (a)
{
    a || (a = Box2D.Collision.Shapes.b2MassData.Get());
    this.m_shape.ComputeMass(a, this.m_density);
    return a
};
Box2D.Dynamics.b2Fixture.prototype.SetDensity = function (a)
{
    this.m_density = a
};
Box2D.Dynamics.b2Fixture.prototype.GetDensity = function ()
{
    return this.m_density
};
Box2D.Dynamics.b2Fixture.prototype.GetFriction = function ()
{
    return this.m_friction
};
Box2D.Dynamics.b2Fixture.prototype.SetFriction = function (a)
{
    this.m_friction = a
};
Box2D.Dynamics.b2Fixture.prototype.GetRestitution = function ()
{
    return this.m_restitution
};
Box2D.Dynamics.b2Fixture.prototype.SetRestitution = function (a)
{
    this.m_restitution = a
};
Box2D.Dynamics.b2Fixture.prototype.GetAABB = function ()
{
    return this.m_aabb
};
Box2D.Dynamics.b2Fixture.prototype.Destroy = function ()
{
    Box2D.Collision.b2AABB.Free(this.m_aabb)
};
Box2D.Dynamics.b2Fixture.prototype.CreateProxy = function (a, b)
{
    this.m_shape.ComputeAABB(this.m_aabb, b);
    this.m_proxy = a.CreateProxy(this.m_aabb, this)
};
Box2D.Dynamics.b2Fixture.prototype.DestroyProxy = function (a)
{
    null != this.m_proxy && (a.DestroyProxy(this.m_proxy), this.m_proxy = null)
};
Box2D.Dynamics.b2Fixture.prototype.Synchronize = function (a, b, c)
{
    this.m_proxy && (this.m_shape.ComputeAABB(this.m_aabb, b), this.m_shape.ComputeAABB(this.m_aabb_temp, c), this.m_aabb.Combine(this.m_aabb, this.m_aabb_temp), b = Box2D.Common.Math.b2Math.SubtractVV(c.position, b.position), a.MoveProxy(this.m_proxy, this.m_aabb, b), Box2D.Common.Math.b2Vec2.Free(b))
};
Box2D.Dynamics.b2Fixture.NEXT_ID = 0;
Box2D.Dynamics.iContactListener = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.BeginContact = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.EndContact = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.PreSolve = function ()
{
};
Box2D.Dynamics.iContactListener.prototype.PostSolve = function ()
{
};
Box2D.Dynamics.Contacts.b2CircleContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2CircleContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollideCircles(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.Evaluate = function ()
{
    this.m_fixtureA.GetBody();
    this.m_fixtureB.GetBody();
    this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), this.m_fixtureA.GetBody().m_xf, this.m_fixtureB.GetShape(), this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function ()
{
};
Box2D.Dynamics.Joints.b2FrictionJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_frictionJoint;
    this.maxTorque = this.maxForce = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2FrictionJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(c))
};
Box2D.Dynamics.Joints.b2FrictionJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2FrictionJoint(this)
};
Box2D.Dynamics.Joints.b2RevoluteJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.K = new Box2D.Common.Math.b2Mat22;
    this.K1 = new Box2D.Common.Math.b2Mat22;
    this.K2 = new Box2D.Common.Math.b2Mat22;
    this.K3 = new Box2D.Common.Math.b2Mat22;
    this.impulse3 = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.impulse2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.reduced = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec3.Get(0, 0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat33;
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_referenceAngle = a.referenceAngle;
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0;
    this.m_lowerAngle = a.lowerAngle;
    this.m_upperAngle = a.upperAngle;
    this.m_maxMotorTorque = a.maxMotorTorque;
    this.m_motorSpeed = a.motorSpeed;
    this.m_enableLimit = a.enableLimit;
    this.m_enableMotor = a.enableMotor;
    this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    this.m_motorMass = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2RevoluteJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    return a * this.m_impulse.z
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointAngle = function ()
{
    return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetJointSpeed = function ()
{
    return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsLimitEnabled = function ()
{
    return this.m_enableLimit
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableLimit = function (a)
{
    this.m_enableLimit = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetLowerLimit = function ()
{
    return this.m_lowerAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetUpperLimit = function ()
{
    return this.m_upperAngle
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetLimits = function (a, b)
{
    void 0 === a && (a = 0);
    void 0 === b && (b = 0);
    this.m_lowerAngle = a;
    this.m_upperAngle = b
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.IsMotorEnabled = function ()
{
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    return this.m_enableMotor
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.EnableMotor = function (a)
{
    this.m_enableMotor = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMotorSpeed = function (a)
{
    void 0 === a && (a = 0);
    this.m_bodyA.SetAwake(!0);
    this.m_bodyB.SetAwake(!0);
    this.m_motorSpeed = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorSpeed = function ()
{
    return this.m_motorSpeed
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SetMaxMotorTorque = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxMotorTorque = a
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.GetMotorTorque = function ()
{
    return this.m_maxMotorTorque
};


Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.InitVelocityConstraints = function (step)
{
    var bA = this.m_bodyA;
    var bB = this.m_bodyB;
    var tMat;
    var tX = 0;
    tMat = bA.m_xf.R;
    var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r1X + tMat.col2.x * r1Y);
    r1Y = (tMat.col1.y * r1X + tMat.col2.y * r1Y);
    r1X = tX;
    tMat = bB.m_xf.R;
    var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = (tMat.col1.x * r2X + tMat.col2.x * r2Y);
    r2Y = (tMat.col1.y * r2X + tMat.col2.y * r2Y);
    r2X = tX;
    var m1 = bA.m_invMass;
    var m2 = bB.m_invMass;
    var i1 = bA.m_invI;
    var i2 = bB.m_invI;
    this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
    this.m_mass.col2.x = (-r1Y * r1X * i1) - r2Y * r2X * i2;
    this.m_mass.col3.x = (-r1Y * i1) - r2Y * i2;
    this.m_mass.col1.y = this.m_mass.col2.x;
    this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
    this.m_mass.col3.y = r1X * i1 + r2X * i2;
    this.m_mass.col1.z = this.m_mass.col3.x;
    this.m_mass.col2.z = this.m_mass.col3.y;
    this.m_mass.col3.z = i1 + i2;
    if (i1 + i2 == 0)
    {
        this.m_motorMass = 0;
    } else
    {
        this.m_motorMass = 0.01;//1.0 / (i1 + i2);
    }
    if (!this.m_enableMotor)
    {
        this.m_motorImpulse = 0.0;
    }
    if (this.m_enableLimit)
    {
        var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
        if (Math.abs(this.m_upperAngle - this.m_lowerAngle) < 2.0 * Box2D.Common.b2Settings.b2_angularSlop)
        {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_equalLimits;
        } else if (jointAngle <= this.m_lowerAngle)
        {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit)
            {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit;
        } else if (jointAngle >= this.m_upperAngle)
        {
            if (this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit)
            {
                this.m_impulse.z = 0.0;
            }
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
        } else
        {
            this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
            this.m_impulse.z = 0.0;
        }
    } else
    {
        this.m_limitState = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit;
    }
    if (step.warmStarting)
    {
        this.m_impulse.x *= step.dtRatio;
        this.m_impulse.y *= step.dtRatio;
        this.m_motorImpulse *= step.dtRatio;
        var PX = this.m_impulse.x;
        var PY = this.m_impulse.y;
        bA.m_linearVelocity.x -= m1 * PX;
        bA.m_linearVelocity.y -= m1 * PY;
        bA.m_angularVelocity -= i1 * ((r1X * PY - r1Y * PX) + this.m_motorImpulse + this.m_impulse.z);
        bB.m_linearVelocity.x += m2 * PX;
        bB.m_linearVelocity.y += m2 * PY;
        bB.m_angularVelocity += i2 * ((r2X * PY - r2Y * PX) + this.m_motorImpulse + this.m_impulse.z);
    } else
    {
        this.m_impulse.SetZero();
        this.m_motorImpulse = 0.0;
    }
};


Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d = 0, e = d = 0, f = 0, g = 0, h = 0, i = b.m_linearVelocity, j = b.m_angularVelocity, k = c.m_linearVelocity, l = c.m_angularVelocity, n = b.m_invMass, m = c.m_invMass, o = b.m_invI, p = c.m_invI;
    this.m_enableMotor && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_equalLimits && (e = this.m_motorMass * -(l - j - this.m_motorSpeed), f = this.m_motorImpulse, g = a.dt * this.m_maxMotorTorque, this.m_motorImpulse = Box2D.Common.Math.b2Math.Clamp(this.m_motorImpulse + e, -g, g), e = this.m_motorImpulse - f, j -= o * e, l += p * e);
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit)
    {
        var a = b.m_xf.R, e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, d = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = d, a = c.m_xf.R, g = this.m_localAnchor2.x - c.m_sweep.localCenter.x, h = this.m_localAnchor2.y - c.m_sweep.localCenter.y, d = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = d, a = k.x + -l * h - i.x - -j * f, q = k.y + l * g - i.y - j * e;
        this.m_mass.Solve33(this.impulse3, -a, -q, -(l - j));
        this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits ? this.m_impulse.Add(this.impulse3) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? (d = this.m_impulse.z + this.impulse3.z, 0 > d && (this.m_mass.Solve22(this.reduced, -a, -q), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0)) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit &&
            (d = this.m_impulse.z + this.impulse3.z, 0 < d && (this.m_mass.Solve22(this.reduced, -a, -q), this.impulse3.x = this.reduced.x, this.impulse3.y = this.reduced.y, this.impulse3.z = -this.m_impulse.z, this.m_impulse.x += this.reduced.x, this.m_impulse.y += this.reduced.y, this.m_impulse.z = 0));
        i.x -= n * this.impulse3.x;
        i.y -= n * this.impulse3.y;
        j -= o * (e * this.impulse3.y - f * this.impulse3.x + this.impulse3.z);
        k.x += m * this.impulse3.x;
        k.y += m * this.impulse3.y;
        l += p * (g * this.impulse3.y - h * this.impulse3.x + this.impulse3.z)
    } else
    {
        a = b.m_xf.R, e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, d = a.col1.x * e + a.col2.x * f, f = a.col1.y * e + a.col2.y * f, e = d, a = c.m_xf.R, g = this.m_localAnchor2.x - c.m_sweep.localCenter.x, h = this.m_localAnchor2.y - c.m_sweep.localCenter.y, d = a.col1.x * g + a.col2.x * h, h = a.col1.y * g + a.col2.y * h, g = d, this.m_mass.Solve22(this.impulse2, -(k.x + -l * h - i.x - -j * f), -(k.y + l * g - i.y - j * e)), this.m_impulse.x +=
            this.impulse2.x, this.m_impulse.y += this.impulse2.y, i.x -= n * this.impulse2.x, i.y -= n * this.impulse2.y, j -= o * (e * this.impulse2.y - f * this.impulse2.x), k.x += m * this.impulse2.x, k.y += m * this.impulse2.y, l += p * (g * this.impulse2.y - h * this.impulse2.x)
    }
    b.m_linearVelocity.SetV(i);
    b.m_angularVelocity = j;
    c.m_linearVelocity.SetV(k);
    c.m_angularVelocity = l
};
Box2D.Dynamics.Joints.b2RevoluteJoint.prototype.SolvePositionConstraints = function ()
{
    var a = 0, b, c = this.m_bodyA, d = this.m_bodyB, e = 0, f = b = 0, g = 0, h = 0;
    if (this.m_enableLimit && this.m_limitState != Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit)
    {
        var a = d.m_sweep.a - c.m_sweep.a - this.m_referenceAngle, i = 0;
        this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_equalLimits ? (a = Box2D.Common.Math.b2Math.Clamp(a - this.m_lowerAngle, -Box2D.Common.b2Settings.b2_maxAngularCorrection, Box2D.Common.b2Settings.b2_maxAngularCorrection), i = -this.m_motorMass * a, e = Math.abs(a)) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atLowerLimit ? (a -= this.m_lowerAngle, e = -a, a = Box2D.Common.Math.b2Math.Clamp(a + Box2D.Common.b2Settings.b2_angularSlop, -Box2D.Common.b2Settings.b2_maxAngularCorrection,
            0), i = -this.m_motorMass * a) : this.m_limitState == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (e = a -= this.m_upperAngle, a = Box2D.Common.Math.b2Math.Clamp(a - Box2D.Common.b2Settings.b2_angularSlop, 0, Box2D.Common.b2Settings.b2_maxAngularCorrection), i = -this.m_motorMass * a);
        c.m_sweep.a -= c.m_invI * i;
        d.m_sweep.a += d.m_invI * i;
        c.SynchronizeTransform();
        d.SynchronizeTransform()
    }
    b = c.m_xf.R;
    i = this.m_localAnchor1.x - c.m_sweep.localCenter.x;
    a = this.m_localAnchor1.y - c.m_sweep.localCenter.y;
    f = b.col1.x * i + b.col2.x * a;
    a = b.col1.y * i + b.col2.y * a;
    i = f;
    b = d.m_xf.R;
    var j = this.m_localAnchor2.x - d.m_sweep.localCenter.x, k = this.m_localAnchor2.y - d.m_sweep.localCenter.y, f = b.col1.x * j + b.col2.x * k, k = b.col1.y * j + b.col2.y * k, j = f, g = d.m_sweep.c.x + j - c.m_sweep.c.x - i, h = d.m_sweep.c.y + k - c.m_sweep.c.y - a, l = g * g + h * h;
    b = Math.sqrt(l);
    var f = c.m_invMass, n = d.m_invMass, m = c.m_invI, o = d.m_invI, p = 10 * Box2D.Common.b2Settings.b2_linearSlop;
    l > p * p && (l = 1 / (f + n), g = l * -g, h = l * -h, c.m_sweep.c.x -= 0.5 * f * g, c.m_sweep.c.y -= 0.5 * f * h, d.m_sweep.c.x += 0.5 * n * g, d.m_sweep.c.y += 0.5 * n * h, g = d.m_sweep.c.x + j - c.m_sweep.c.x - i, h = d.m_sweep.c.y + k - c.m_sweep.c.y - a);
    this.K1.col1.x = f + n;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = f + n;
    this.K2.col1.x = m * a * a;
    this.K2.col2.x = -m * i * a;
    this.K2.col1.y = -m * i * a;
    this.K2.col2.y = m * i * i;
    this.K3.col1.x = o * k * k;
    this.K3.col2.x = -o * j * k;
    this.K3.col1.y = -o * j * k;
    this.K3.col2.y = o * j * j;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.AddM(this.K3);
    this.K.Solve(Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse, -g, -h);
    g = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.x;
    h = Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse.y;
    c.m_sweep.c.x -= c.m_invMass * g;
    c.m_sweep.c.y -= c.m_invMass * h;
    c.m_sweep.a -= c.m_invI * (i * h - a * g);
    d.m_sweep.c.x += d.m_invMass * g;
    d.m_sweep.c.y += d.m_invMass * h;
    d.m_sweep.a += d.m_invI * (j * h - k * g);
    c.SynchronizeTransform();
    d.SynchronizeTransform();
    return b <= Box2D.Common.b2Settings.b2_linearSlop && e <= Box2D.Common.b2Settings.b2_angularSlop
};
Box2D.Dynamics.Joints.b2RevoluteJoint.tImpulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
Box2D.Dynamics.Joints.b2RevoluteJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint;
    this.localAnchorA.SetZero();
    this.localAnchorB.SetZero();
    this.motorSpeed = this.maxMotorTorque = this.upperAngle = this.lowerAngle = this.referenceAngle = 0;
    this.enableMotor = this.enableLimit = !1
};
goog.inherits(Box2D.Dynamics.Joints.b2RevoluteJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Initialize = function (a, b, c)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA = this.bodyA.GetLocalPoint(c);
    this.localAnchorB = this.bodyB.GetLocalPoint(c);
    this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
Box2D.Dynamics.Joints.b2RevoluteJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2RevoluteJoint(this)
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold = function ()
{
    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_separations = [];
    this.m_points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype.Initialize = function (a)
{
    Box2D.Common.b2Settings.b2Assert(0 < a.pointCount);
    switch (a.type)
    {
        case Box2D.Collision.b2Manifold.e_circles:
            this._InitializeCircles(a);
            break;
        case Box2D.Collision.b2Manifold.e_faceA:
            this._InitializeFaceA(a);
            break;
        case Box2D.Collision.b2Manifold.e_faceB:
            this._InitializeFaceB(a)
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeCircles = function (a)
{
    var b = a.bodyA.m_xf.R, c = a.localPoint, d = a.bodyA.m_xf.position.x + (b.col1.x * c.x + b.col2.x * c.y), e = a.bodyA.m_xf.position.y + (b.col1.y * c.x + b.col2.y * c.y), b = a.bodyB.m_xf.R, c = a.points[0].localPoint, f = a.bodyB.m_xf.position.x + (b.col1.x * c.x + b.col2.x * c.y), b = a.bodyB.m_xf.position.y + (b.col1.y * c.x + b.col2.y * c.y), c = f - d, g = b - e, h = c * c + g * g;
    h > Box2D.Common.b2Settings.MIN_VALUE_SQUARED ? (h = Math.sqrt(h), this.m_normal.x = c / h, this.m_normal.y = g / h) : (this.m_normal.x = 1, this.m_normal.y = 0);
    this.m_points[0].x = 0.5 * (d + f);
    this.m_points[0].y = 0.5 * (e + b);
    this.m_separations[0] = c * this.m_normal.x + g * this.m_normal.y - a.radius
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceA = function (a)
{
    this.m_normal.x = a.bodyA.m_xf.R.col1.x * a.localPlaneNormal.x + a.bodyA.m_xf.R.col2.x * a.localPlaneNormal.y;
    this.m_normal.y = a.bodyA.m_xf.R.col1.y * a.localPlaneNormal.x + a.bodyA.m_xf.R.col2.y * a.localPlaneNormal.y;
    for (var b = a.bodyA.m_xf.position.x + (a.bodyA.m_xf.R.col1.x * a.localPoint.x + a.bodyA.m_xf.R.col2.x * a.localPoint.y), c = a.bodyA.m_xf.position.y + (a.bodyA.m_xf.R.col1.y * a.localPoint.x + a.bodyA.m_xf.R.col2.y * a.localPoint.y), d = 0; d < a.pointCount; d++)
    {
        var e = a.bodyB.m_xf.position.x + (a.bodyB.m_xf.R.col1.x * a.points[d].localPoint.x + a.bodyB.m_xf.R.col2.x * a.points[d].localPoint.y), f = a.bodyB.m_xf.position.y + (a.bodyB.m_xf.R.col1.y * a.points[d].localPoint.x + a.bodyB.m_xf.R.col2.y * a.points[d].localPoint.y);
        this.m_separations[d] = (e - b) * this.m_normal.x + (f - c) * this.m_normal.y - a.radius;
        this.m_points[d].x = e;
        this.m_points[d].y = f
    }
};
Box2D.Dynamics.Contacts.b2PositionSolverManifold.prototype._InitializeFaceB = function (a)
{
    this.m_normal.x = a.bodyB.m_xf.R.col1.x * a.localPlaneNormal.x + a.bodyB.m_xf.R.col2.x * a.localPlaneNormal.y;
    this.m_normal.y = a.bodyB.m_xf.R.col1.y * a.localPlaneNormal.x + a.bodyB.m_xf.R.col2.y * a.localPlaneNormal.y;
    for (var b = a.bodyB.m_xf.position.x + (a.bodyB.m_xf.R.col1.x * a.localPoint.x + a.bodyB.m_xf.R.col2.x * a.localPoint.y), c = a.bodyB.m_xf.position.y + (a.bodyB.m_xf.R.col1.y * a.localPoint.x + a.bodyB.m_xf.R.col2.y * a.localPoint.y), d = 0; d < a.pointCount; d++)
    {
        var e = a.bodyA.m_xf.position.x + (a.bodyA.m_xf.R.col1.x * a.points[d].localPoint.x + a.bodyA.m_xf.R.col2.x * a.points[d].localPoint.y), f = a.bodyA.m_xf.position.y + (a.bodyA.m_xf.R.col1.y * a.points[d].localPoint.x + a.bodyA.m_xf.R.col2.y * a.points[d].localPoint.y);
        this.m_separations[d] = (e - b) * this.m_normal.x + (f - c) * this.m_normal.y - a.radius;
        this.m_points[d].Set(e, f)
    }
    this.m_normal.x *= -1;
    this.m_normal.y *= -1
};
Box2D.Dynamics.Contacts.b2PolyAndCircleContact = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2CircleShape);
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Reset = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(a.GetShape() instanceof Box2D.Collision.Shapes.b2PolygonShape);
    Box2D.Common.b2Settings.b2Assert(b.GetShape() instanceof Box2D.Collision.Shapes.b2CircleShape);
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolyAndCircleContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollidePolygonAndCircle(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Dynamics.Contacts.b2ContactConstraintPoint = function ()
{

    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.rA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.rB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.tangentImpulse = this.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactConstraintPoint.prototype.Reset = function ()
{
    this.localPoint.Set(0, 0);
    this.rA.Set(0, 0);
    this.rB.Set(0, 0);
    this.tangentImpulse = this.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactConstraint = function ()
{

    this.localPlaneNormal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localPoint = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normalMass = new Box2D.Common.Math.b2Mat22;
    this.K = new Box2D.Common.Math.b2Mat22;
    this.points = [];
    for (var a = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.points[a] = new Box2D.Dynamics.Contacts.b2ContactConstraintPoint
    }
};
Box2D.Dynamics.b2FixtureList = function ()
{

    this.fixtureLastNode = this.fixtureFirstNode = null;
    this.fixtureNodeLookup = {};
    this.fixtureCount = 0
};
Box2D.Dynamics.b2FixtureList.prototype.GetFirstNode = function ()
{
    return this.fixtureFirstNode
};
Box2D.Dynamics.b2FixtureList.prototype.AddFixture = function (a)
{
    var b = a.ID;
    if (null == this.fixtureNodeLookup[b])
    {
        var a = new Box2D.Dynamics.b2FixtureListNode(a), c = this.fixtureLastNode;
        null != c ? c.SetNextNode(a) : this.fixtureFirstNode = a;
        a.SetPreviousNode(c);
        this.fixtureLastNode = a;
        this.fixtureNodeLookup[b] = a;
        this.fixtureCount++
    }
};
Box2D.Dynamics.b2FixtureList.prototype.RemoveFixture = function (a)
{
    var a = a.ID, b = this.fixtureNodeLookup[a];
    if (null != b)
    {
        var c = b.GetPreviousNode(), b = b.GetNextNode();
        null == c ? this.fixtureFirstNode = b : c.SetNextNode(b);
        null == b ? this.fixtureLastNode = c : b.SetPreviousNode(c);
        delete this.fixtureNodeLookup[a];
        this.fixtureCount--
    }
};
Box2D.Dynamics.b2FixtureList.prototype.GetFixtureCount = function ()
{
    return this.fixtureCount
};
Box2D.Dynamics.Joints.b2Jacobian = function ()
{
    this.linearA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearB = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.SetZero = function ()
{
    this.linearA.SetZero();
    this.angularA = 0;
    this.linearB.SetZero();
    this.angularB = 0
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Set = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    void 0 === d && (d = 0);
    this.linearA.SetV(a);
    this.angularA = b;
    this.linearB.SetV(c);
    this.angularB = d
};
Box2D.Dynamics.Joints.b2Jacobian.prototype.Compute = function (a, b, c, d)
{
    void 0 === b && (b = 0);
    void 0 === d && (d = 0);
    return this.linearA.x * a.x + this.linearA.y * a.y + this.angularA * b + (this.linearB.x * c.x + this.linearB.y * c.y) + this.angularB * d
};
Box2D.Dynamics.Joints.b2GearJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_J = new Box2D.Dynamics.Joints.b2Jacobian;
    var b = a.joint1.m_type, c = a.joint2.m_type;
    this.m_prismatic2 = this.m_revolute2 = this.m_prismatic1 = this.m_revolute1 = null;
    var d = 0, e = 0;
    this.m_ground1 = a.joint1.GetBodyA();
    this.m_bodyA = a.joint1.GetBodyB();
    b == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint ? (this.m_revolute1 = a.joint1, this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2), d = this.m_revolute1.GetJointAngle()) : (this.m_prismatic1 = a.joint1, this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1), this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2), d = this.m_prismatic1.GetJointTranslation());
    this.m_ground2 = a.joint2.GetBodyA();
    this.m_bodyB = a.joint2.GetBodyB();
    c == Box2D.Dynamics.Joints.b2Joint.e_revoluteJoint ? (this.m_revolute2 = a.joint2, this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2), e = this.m_revolute2.GetJointAngle()) : (this.m_prismatic2 = a.joint2, this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1), this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2), e = this.m_prismatic2.GetJointTranslation());
    this.m_ratio = a.ratio;
    this.m_constant = d + this.m_ratio * e;
    this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2GearJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_J.linearB.x, a * this.m_impulse * this.m_J.linearB.y)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetReactionTorque = function (a)
{
    void 0 === a && (a = 0);
    var b = this.m_bodyB.m_xf.R, c = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x, d = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y, e = b.col1.x * c + b.col2.x * d, d = b.col1.y * c + b.col2.y * d;
    return a * (this.m_impulse * this.m_J.angularB - e * this.m_impulse * this.m_J.linearB.y + d * this.m_impulse * this.m_J.linearB.x)
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.GetRatio = function ()
{
    return this.m_ratio
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SetRatio = function (a)
{
    void 0 === a && (a = 0);
    this.m_ratio = a
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_ground1, c = this.m_ground2, d = this.m_bodyA, e = this.m_bodyB, f = 0, g = 0, h = 0, i = 0, j = h = 0, k = 0;
    this.m_J.SetZero();
    this.m_revolute1 ? (this.m_J.angularA = -1, k += d.m_invI) : (b = b.m_xf.R, g = this.m_prismatic1.m_localXAxis1, f = b.col1.x * g.x + b.col2.x * g.y, g = b.col1.y * g.x + b.col2.y * g.y, b = d.m_xf.R, h = this.m_localAnchor1.x - d.m_sweep.localCenter.x, i = this.m_localAnchor1.y - d.m_sweep.localCenter.y, j = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = j * g - i * f, this.m_J.linearA.Set(-f, -g), this.m_J.angularA = -h, k += d.m_invMass + d.m_invI * h * h);
    this.m_revolute2 ? (this.m_J.angularB = -this.m_ratio, k += this.m_ratio * this.m_ratio * e.m_invI) : (b = c.m_xf.R, g = this.m_prismatic2.m_localXAxis1, f = b.col1.x * g.x + b.col2.x * g.y, g = b.col1.y * g.x + b.col2.y * g.y, b = e.m_xf.R, h = this.m_localAnchor2.x - e.m_sweep.localCenter.x, i = this.m_localAnchor2.y - e.m_sweep.localCenter.y, j = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = j * g - i * f, this.m_J.linearB.Set(-this.m_ratio * f, -this.m_ratio * g), this.m_J.angularB =
        -this.m_ratio * h, k += this.m_ratio * this.m_ratio * (e.m_invMass + e.m_invI * h * h));
    this.m_mass = 0 < k ? 1 / k : 0;
    a.warmStarting ? (d.m_linearVelocity.x += d.m_invMass * this.m_impulse * this.m_J.linearA.x, d.m_linearVelocity.y += d.m_invMass * this.m_impulse * this.m_J.linearA.y, d.m_angularVelocity += d.m_invI * this.m_impulse * this.m_J.angularA, e.m_linearVelocity.x += e.m_invMass * this.m_impulse * this.m_J.linearB.x, e.m_linearVelocity.y += e.m_invMass * this.m_impulse * this.m_J.linearB.y, e.m_angularVelocity += e.m_invI * this.m_impulse * this.m_J.angularB) : this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = -this.m_mass * this.m_J.Compute(a.m_linearVelocity, a.m_angularVelocity, b.m_linearVelocity, b.m_angularVelocity);
    this.m_impulse += c;
    a.m_linearVelocity.x += a.m_invMass * c * this.m_J.linearA.x;
    a.m_linearVelocity.y += a.m_invMass * c * this.m_J.linearA.y;
    a.m_angularVelocity += a.m_invI * c * this.m_J.angularA;
    b.m_linearVelocity.x += b.m_invMass * c * this.m_J.linearB.x;
    b.m_linearVelocity.y += b.m_invMass * c * this.m_J.linearB.y;
    b.m_angularVelocity += b.m_invI * c * this.m_J.angularB
};
Box2D.Dynamics.Joints.b2GearJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c = 0, d = 0, c = this.m_revolute1 ? this.m_revolute1.GetJointAngle() : this.m_prismatic1.GetJointTranslation(), d = this.m_revolute2 ? this.m_revolute2.GetJointAngle() : this.m_prismatic2.GetJointTranslation(), c = -this.m_mass * (this.m_constant - (c + this.m_ratio * d));
    a.m_sweep.c.x += a.m_invMass * c * this.m_J.linearA.x;
    a.m_sweep.c.y += a.m_invMass * c * this.m_J.linearA.y;
    a.m_sweep.a += a.m_invI * c * this.m_J.angularA;
    b.m_sweep.c.x += b.m_invMass * c * this.m_J.linearB.x;
    b.m_sweep.c.y += b.m_invMass * c * this.m_J.linearB.y;
    b.m_sweep.a += b.m_invI * c * this.m_J.angularB;
    a.SynchronizeTransform();
    b.SynchronizeTransform();
    return 0 < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2GearJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_gearJoint;
    this.joint2 = this.joint1 = null;
    this.ratio = 1
};
goog.inherits(Box2D.Dynamics.Joints.b2GearJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Initialize = function (a, b, c)
{
    this.joint1 = a;
    this.bodyA = a.GetBodyA();
    this.joint2 = b;
    this.bodyB = b.GetBodyA();
    this.ratio = c
};
Box2D.Dynamics.Joints.b2GearJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2GearJoint(this)
};
Box2D.Dynamics.Joints.b2PulleyJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_groundAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_groundAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_ground = this.m_bodyA.m_world.m_groundBody;
    this.m_groundAnchor1.x = a.groundAnchorA.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor1.y = a.groundAnchorA.y - this.m_ground.m_xf.position.y;
    this.m_groundAnchor2.x = a.groundAnchorB.x - this.m_ground.m_xf.position.x;
    this.m_groundAnchor2.y = a.groundAnchorB.y - this.m_ground.m_xf.position.y;
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_ratio = a.ratio;
    this.m_constant = a.lengthA + this.m_ratio * a.lengthB;
    this.m_maxLength1 = Math.min(a.maxLengthA, this.m_constant - this.m_ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength);
    this.m_maxLength2 = Math.min(a.maxLengthB, (this.m_constant - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
    this.m_limitImpulse2 = this.m_limitImpulse1 = this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2PulleyJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_u2.x, a * this.m_impulse * this.m_u2.y)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorA = function ()
{
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor1);
    return a
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetGroundAnchorB = function ()
{
    var a = this.m_ground.m_xf.position.Copy();
    a.Add(this.m_groundAnchor2);
    return a
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength1 = function ()
{
    var a = this.m_bodyA.GetWorldPoint(this.m_localAnchor1), b = a.x - (this.m_ground.m_xf.position.x + this.m_groundAnchor1.x), a = a.y - (this.m_ground.m_xf.position.y + this.m_groundAnchor1.y);
    return Math.sqrt(b * b + a * a)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetLength2 = function ()
{
    var a = this.m_bodyB.GetWorldPoint(this.m_localAnchor2), b = a.x - (this.m_ground.m_xf.position.x + this.m_groundAnchor2.x), a = a.y - (this.m_ground.m_xf.position.y + this.m_groundAnchor2.y);
    return Math.sqrt(b * b + a * a)
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.GetRatio = function ()
{
    return this.m_ratio
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyA, c = this.m_bodyB, d;
    d = b.m_xf.R;
    var e = this.m_localAnchor1.x - b.m_sweep.localCenter.x, f = this.m_localAnchor1.y - b.m_sweep.localCenter.y, g = d.col1.x * e + d.col2.x * f, f = d.col1.y * e + d.col2.y * f, e = g;
    d = c.m_xf.R;
    var h = this.m_localAnchor2.x - c.m_sweep.localCenter.x, i = this.m_localAnchor2.y - c.m_sweep.localCenter.y, g = d.col1.x * h + d.col2.x * i, i = d.col1.y * h + d.col2.y * i, h = g;
    d = c.m_sweep.c.x + h;
    var g = c.m_sweep.c.y + i, j = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, k = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
    this.m_u1.Set(b.m_sweep.c.x + e - (this.m_ground.m_xf.position.x + this.m_groundAnchor1.x), b.m_sweep.c.y + f - (this.m_ground.m_xf.position.y + this.m_groundAnchor1.y));
    this.m_u2.Set(d - j, g - k);
    d = this.m_u1.Length();
    g = this.m_u2.Length();
    d > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u1.Multiply(1 / d) : this.m_u1.SetZero();
    g > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u2.Multiply(1 / g) : this.m_u2.SetZero();
    0 < this.m_constant - d - this.m_ratio * g ? (this.m_state = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_impulse = 0) : this.m_state = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    d < this.m_maxLength1 ? (this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_limitImpulse1 = 0) : this.m_limitState1 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    g < this.m_maxLength2 ? (this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_inactiveLimit, this.m_limitImpulse2 = 0) : this.m_limitState2 = Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit;
    d = e * this.m_u1.y - f * this.m_u1.x;
    g = h * this.m_u2.y - i * this.m_u2.x;
    this.m_limitMass1 = b.m_invMass + b.m_invI * d * d;
    this.m_limitMass2 = c.m_invMass + c.m_invI * g * g;
    this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
    this.m_limitMass1 = 1 / this.m_limitMass1;
    this.m_limitMass2 = 1 / this.m_limitMass2;
    this.m_pulleyMass = 1 / this.m_pulleyMass;
    a.warmStarting ? (this.m_impulse *= a.dtRatio, this.m_limitImpulse1 *= a.dtRatio, this.m_limitImpulse2 *= a.dtRatio, a = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x, d = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y, g = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x, j = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y, b.m_linearVelocity.x += b.m_invMass * a, b.m_linearVelocity.y += b.m_invMass * d, b.m_angularVelocity += b.m_invI *
        (e * d - f * a), c.m_linearVelocity.x += c.m_invMass * g, c.m_linearVelocity.y += c.m_invMass * j, c.m_angularVelocity += c.m_invI * (h * j - i * g)) : this.m_limitImpulse2 = this.m_limitImpulse1 = this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c;
    c = a.m_xf.R;
    var d = this.m_localAnchor1.x - a.m_sweep.localCenter.x, e = this.m_localAnchor1.y - a.m_sweep.localCenter.y, f = c.col1.x * d + c.col2.x * e, e = c.col1.y * d + c.col2.y * e, d = f;
    c = b.m_xf.R;
    var g = this.m_localAnchor2.x - b.m_sweep.localCenter.x, h = this.m_localAnchor2.y - b.m_sweep.localCenter.y, f = c.col1.x * g + c.col2.x * h, h = c.col1.y * g + c.col2.y * h, g = f, i = f = c = 0, j = 0;
    c = j = c = j = i = f = c = 0;
    this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_linearVelocity.x + -a.m_angularVelocity * e, f = a.m_linearVelocity.y + a.m_angularVelocity * d, i = b.m_linearVelocity.x + -b.m_angularVelocity * h, j = b.m_linearVelocity.y + b.m_angularVelocity * g, c = -(this.m_u1.x * c + this.m_u1.y * f) - this.m_ratio * (this.m_u2.x * i + this.m_u2.y * j), j = this.m_pulleyMass * -c, c = this.m_impulse, this.m_impulse = Math.max(0, this.m_impulse + j), j = this.m_impulse - c, c = -j *
        this.m_u1.x, f = -j * this.m_u1.y, i = -this.m_ratio * j * this.m_u2.x, j = -this.m_ratio * j * this.m_u2.y, a.m_linearVelocity.x += a.m_invMass * c, a.m_linearVelocity.y += a.m_invMass * f, a.m_angularVelocity += a.m_invI * (d * f - e * c), b.m_linearVelocity.x += b.m_invMass * i, b.m_linearVelocity.y += b.m_invMass * j, b.m_angularVelocity += b.m_invI * (g * j - h * i));
    this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_linearVelocity.x + -a.m_angularVelocity * e, f = a.m_linearVelocity.y + a.m_angularVelocity * d, c = -(this.m_u1.x * c + this.m_u1.y * f), j = -this.m_limitMass1 * c, c = this.m_limitImpulse1, this.m_limitImpulse1 = Math.max(0, this.m_limitImpulse1 + j), j = this.m_limitImpulse1 - c, c = -j * this.m_u1.x, f = -j * this.m_u1.y, a.m_linearVelocity.x += a.m_invMass * c, a.m_linearVelocity.y += a.m_invMass * f, a.m_angularVelocity +=
        a.m_invI * (d * f - e * c));
    this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (i = b.m_linearVelocity.x + -b.m_angularVelocity * h, j = b.m_linearVelocity.y + b.m_angularVelocity * g, c = -(this.m_u2.x * i + this.m_u2.y * j), j = -this.m_limitMass2 * c, c = this.m_limitImpulse2, this.m_limitImpulse2 = Math.max(0, this.m_limitImpulse2 + j), j = this.m_limitImpulse2 - c, i = -j * this.m_u2.x, j = -j * this.m_u2.y, b.m_linearVelocity.x += b.m_invMass * i, b.m_linearVelocity.y += b.m_invMass * j, b.m_angularVelocity +=
        b.m_invI * (g * j - h * i))
};
Box2D.Dynamics.Joints.b2PulleyJoint.prototype.SolvePositionConstraints = function ()
{
    var a = this.m_bodyA, b = this.m_bodyB, c, d = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x, e = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y, f = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, g = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y, h = 0, i = 0, j = 0, k = 0, l = c = 0, n = 0, m = 0, o = l = m = c = l = c = 0;
    this.m_state == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_xf.R, h = this.m_localAnchor1.x - a.m_sweep.localCenter.x, i = this.m_localAnchor1.y - a.m_sweep.localCenter.y, l = c.col1.x * h + c.col2.x * i, i = c.col1.y * h + c.col2.y * i, h = l, c = b.m_xf.R, j = this.m_localAnchor2.x - b.m_sweep.localCenter.x, k = this.m_localAnchor2.y - b.m_sweep.localCenter.y, l = c.col1.x * j + c.col2.x * k, k = c.col1.y * j + c.col2.y * k, j = l, c = a.m_sweep.c.x + h, l = a.m_sweep.c.y + i, n =
        b.m_sweep.c.x + j, m = b.m_sweep.c.y + k, this.m_u1.Set(c - d, l - e), this.m_u2.Set(n - f, m - g), c = this.m_u1.Length(), l = this.m_u2.Length(), c > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u1.Multiply(1 / c) : this.m_u1.SetZero(), l > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u2.Multiply(1 / l) : this.m_u2.SetZero(), c = this.m_constant - c - this.m_ratio * l, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection,
        0), m = -this.m_pulleyMass * c, c = -m * this.m_u1.x, l = -m * this.m_u1.y, n = -this.m_ratio * m * this.m_u2.x, m = -this.m_ratio * m * this.m_u2.y, a.m_sweep.c.x += a.m_invMass * c, a.m_sweep.c.y += a.m_invMass * l, a.m_sweep.a += a.m_invI * (h * l - i * c), b.m_sweep.c.x += b.m_invMass * n, b.m_sweep.c.y += b.m_invMass * m, b.m_sweep.a += b.m_invI * (j * m - k * n), a.SynchronizeTransform(), b.SynchronizeTransform());
    this.m_limitState1 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = a.m_xf.R, h = this.m_localAnchor1.x - a.m_sweep.localCenter.x, i = this.m_localAnchor1.y - a.m_sweep.localCenter.y, l = c.col1.x * h + c.col2.x * i, i = c.col1.y * h + c.col2.y * i, h = l, c = a.m_sweep.c.x + h, l = a.m_sweep.c.y + i, this.m_u1.Set(c - d, l - e), c = this.m_u1.Length(), c > Box2D.Common.b2Settings.b2_linearSlop ? (this.m_u1.x *= 1 / c, this.m_u1.y *= 1 / c) : this.m_u1.SetZero(), c = this.m_maxLength1 -
        c, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass1 * c, c = -m * this.m_u1.x, l = -m * this.m_u1.y, a.m_sweep.c.x += a.m_invMass * c, a.m_sweep.c.y += a.m_invMass * l, a.m_sweep.a += a.m_invI * (h * l - i * c), a.SynchronizeTransform());
    this.m_limitState2 == Box2D.Dynamics.Joints.b2Joint.e_atUpperLimit && (c = b.m_xf.R, j = this.m_localAnchor2.x - b.m_sweep.localCenter.x, k = this.m_localAnchor2.y - b.m_sweep.localCenter.y, l = c.col1.x * j + c.col2.x * k, k = c.col1.y * j + c.col2.y * k, j = l, n = b.m_sweep.c.x + j, m = b.m_sweep.c.y + k, this.m_u2.Set(n - f, m - g), l = this.m_u2.Length(), l > Box2D.Common.b2Settings.b2_linearSlop ? (this.m_u2.x *= 1 / l, this.m_u2.y *= 1 / l) : this.m_u2.SetZero(), c = this.m_maxLength2 -
        l, o = Math.max(o, -c), c = Box2D.Common.Math.b2Math.Clamp(c + Box2D.Common.b2Settings.b2_linearSlop, -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), m = -this.m_limitMass2 * c, n = -m * this.m_u2.x, m = -m * this.m_u2.y, b.m_sweep.c.x += b.m_invMass * n, b.m_sweep.c.y += b.m_invMass * m, b.m_sweep.a += b.m_invI * (j * m - k * n), b.SynchronizeTransform());
    return o < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength = 1;
Box2D.Dynamics.b2ContactImpulse = function ()
{

    this.normalImpulses = [];
    this.tangentImpulses = []
};
Box2D.Dynamics.b2ContactImpulse.prototype.Reset = function ()
{
    this.normalImpulses = [];
    this.tangentImpulses = []
};
Box2D.Dynamics.Contacts.b2ContactListNode = function (a)
{
    this.contact = a;
    this.previous = this.next = null
};
Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes = [];
Box2D.Dynamics.Contacts.b2ContactListNode.GetNode = function (a)
{
    if (0 < Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.length)
    {
        var b = Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.pop();
        b.next = null;
        b.previous = null;
        b.contact = a;
        return b
    }
    return new Box2D.Dynamics.Contacts.b2ContactListNode(a)
};
Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode = function (a)
{
    Box2D.Dynamics.Contacts.b2ContactListNode.freeNodes.push(a)
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetContact = function ()
{
    return this.contact
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.Contacts.b2ContactListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Dynamics.Contacts.b2ContactList = function ()
{
    this.contactFirstNodes = [];
    for (var a = 0; a <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; a++)
    {
        this.contactFirstNodes[a] = null
    }
    this.contactLastNodes = [];
    for (a = 0; a <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; a++)
    {
        this.contactLastNodes[a] = null
    }
    this.contactNodeLookup = {};
    this.contactCount = 0
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetFirstNode = function (a)
{
    return this.contactFirstNodes[a]
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.AddContact = function (a)
{
    var b = a.ID;
    if (null == this.contactNodeLookup[b])
    {
        this.contactNodeLookup[b] = [];
        for (var c = 0; c <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; c++)
        {
            this.contactNodeLookup[b][c] = null
        }
        this.CreateNode(a, b, Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts);
        this.contactCount++
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.UpdateContact = function (a, b, c)
{
    b ? this.CreateNode(a, a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts) : this.RemoveNode(a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts);
    c ? this.CreateNode(a, a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts) : this.RemoveNode(a.ID, Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts)
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveContact = function (a)
{
    a = a.ID;
    if (null != this.contactNodeLookup[a])
    {
        for (var b = 0; b <= Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts; b++)
        {
            this.RemoveNode(a, b)
        }
        delete this.contactNodeLookup[a];
        this.contactCount--
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.RemoveNode = function (a, b)
{
    var c = this.contactNodeLookup[a];
    if (null != c)
    {
        var d = c[b];
        if (null != d)
        {
            c[b] = null;
            var c = d.GetPreviousNode(), e = d.GetNextNode();
            null == c ? this.contactFirstNodes[b] = e : c.SetNextNode(e);
            null == e ? this.contactLastNodes[b] = c : e.SetPreviousNode(c);
            Box2D.Dynamics.Contacts.b2ContactListNode.FreeNode(d)
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.CreateNode = function (a, b, c)
{
    b = this.contactNodeLookup[b];
    null == b[c] && (b[c] = Box2D.Dynamics.Contacts.b2ContactListNode.GetNode(a), a = this.contactLastNodes[c], null != a ? (a.SetNextNode(b[c]), b[c].SetPreviousNode(a)) : this.contactFirstNodes[c] = b[c], this.contactLastNodes[c] = b[c])
};
Box2D.Dynamics.Contacts.b2ContactList.prototype.GetContactCount = function ()
{
    return this.contactCount
};
Box2D.Dynamics.Contacts.b2ContactList.TYPES = {nonSensorEnabledTouchingContacts:0, nonSensorEnabledContinuousContacts:1, allContacts:2};
Box2D.Collision.b2Segment = function ()
{

    this.p1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.p2 = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Collision.b2Segment.prototype.TestSegment = function (a, b, c, d)
{
    var e = c.p1, f = c.p2.x - e.x, g = c.p2.y - e.y, c = this.p2.y - this.p1.y, h = -(this.p2.x - this.p1.x), i = 100 * Number.MIN_VALUE, j = -(f * c + g * h);
    if (j > i)
    {
        var k = e.x - this.p1.x, l = e.y - this.p1.y, e = k * c + l * h;
        if (0 <= e && e <= d * j && (d = -f * l + g * k, -i * j <= d && d <= j * (1 + i)))
        {
            return e /= j, d = Math.sqrt(c * c + h * h), a[0] = e, b.Set(c / d, h / d), !0
        }
    }
    return!1
};
Box2D.Collision.b2Segment.prototype.Extend = function (a)
{
    this.ExtendForward(a);
    this.ExtendBackward(a)
};
Box2D.Collision.b2Segment.prototype.ExtendForward = function (a)
{
    var b = this.p2.x - this.p1.x, c = this.p2.y - this.p1.y, a = Math.min(0 < b ? (a.upperBound.x - this.p1.x) / b : 0 > b ? (a.lowerBound.x - this.p1.x) / b : Number.POSITIVE_INFINITY, 0 < c ? (a.upperBound.y - this.p1.y) / c : 0 > c ? (a.lowerBound.y - this.p1.y) / c : Number.POSITIVE_INFINITY);
    this.p2.x = this.p1.x + b * a;
    this.p2.y = this.p1.y + c * a
};
Box2D.Collision.b2Segment.prototype.ExtendBackward = function (a)
{
    var b = -this.p2.x + this.p1.x, c = -this.p2.y + this.p1.y, a = Math.min(0 < b ? (a.upperBound.x - this.p2.x) / b : 0 > b ? (a.lowerBound.x - this.p2.x) / b : Number.POSITIVE_INFINITY, 0 < c ? (a.upperBound.y - this.p2.y) / c : 0 > c ? (a.lowerBound.y - this.p2.y) / c : Number.POSITIVE_INFINITY);
    this.p1.x = this.p2.x + b * a;
    this.p1.y = this.p2.y + c * a
};
Box2D.Dynamics.Joints.b2MouseJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.K = new Box2D.Common.Math.b2Mat22;
    this.K1 = new Box2D.Common.Math.b2Mat22;
    this.K2 = new Box2D.Common.Math.b2Mat22;
    this.m_localAnchor = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_target = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_impulse = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_mass = new Box2D.Common.Math.b2Mat22;
    this.m_C = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_target.SetV(a.target);
    var b = this.m_target.x - this.m_bodyB.m_xf.position.x, c = this.m_target.y - this.m_bodyB.m_xf.position.y, d = this.m_bodyB.m_xf.R;
    this.m_localAnchor.x = b * d.col1.x + c * d.col1.y;
    this.m_localAnchor.y = b * d.col2.x + c * d.col2.y;
    this.m_maxForce = a.maxForce;
    this.m_impulse.SetZero();
    this.m_frequencyHz = a.frequencyHz;
    this.m_dampingRatio = a.dampingRatio;
    this.m_gamma = this.m_beta = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2MouseJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetAnchorA = function ()
{
    return Box2D.Common.Math.b2Vec2.Get(this.m_target.x, this.m_target.y)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetReactionForce = function (a)
{
    void 0 === a && (a = 0);
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse.x, a * this.m_impulse.y)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetTarget = function ()
{
    return this.m_target
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetTarget = function (a)
{
    !1 == this.m_bodyB.IsAwake() && this.m_bodyB.SetAwake(!0);
    this.m_target = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetMaxForce = function ()
{
    return this.m_maxForce
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetMaxForce = function (a)
{
    void 0 === a && (a = 0);
    this.m_maxForce = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetFrequency = function ()
{
    return this.m_frequencyHz
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetFrequency = function (a)
{
    void 0 === a && (a = 0);
    this.m_frequencyHz = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.GetDampingRatio = function ()
{
    return this.m_dampingRatio
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SetDampingRatio = function (a)
{
    void 0 === a && (a = 0);
    this.m_dampingRatio = a
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.InitVelocityConstraints = function (a)
{
    var b = this.m_bodyB, c = b.GetMass(), d = 2 * Math.PI * this.m_frequencyHz, e = c * d * d;
    this.m_gamma = a.dt * (2 * c * this.m_dampingRatio * d + a.dt * e);
    this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0;
    this.m_beta = a.dt * e * this.m_gamma;
    var e = b.m_xf.R, c = this.m_localAnchor.x - b.m_sweep.localCenter.x, d = this.m_localAnchor.y - b.m_sweep.localCenter.y, f = e.col1.x * c + e.col2.x * d, d = e.col1.y * c + e.col2.y * d, c = f, e = b.m_invMass, f = b.m_invI;
    this.K1.col1.x = e;
    this.K1.col2.x = 0;
    this.K1.col1.y = 0;
    this.K1.col2.y = e;
    this.K2.col1.x = f * d * d;
    this.K2.col2.x = -f * c * d;
    this.K2.col1.y = -f * c * d;
    this.K2.col2.y = f * c * c;
    this.K.SetM(this.K1);
    this.K.AddM(this.K2);
    this.K.col1.x += this.m_gamma;
    this.K.col2.y += this.m_gamma;
    this.K.GetInverse(this.m_mass);
    this.m_C.x = b.m_sweep.c.x + c - this.m_target.x;
    this.m_C.y = b.m_sweep.c.y + d - this.m_target.y;
    b.m_angularVelocity *= 0.98;
    this.m_impulse.x *= a.dtRatio;
    this.m_impulse.y *= a.dtRatio;
    b.m_linearVelocity.x += e * this.m_impulse.x;
    b.m_linearVelocity.y += e * this.m_impulse.y;
    b.m_angularVelocity += f * (c * this.m_impulse.y - d * this.m_impulse.x)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SolveVelocityConstraints = function (a)
{
    var b = this.m_bodyB, c, d = 0, e = 0;
    c = b.m_xf.R;
    var f = this.m_localAnchor.x - b.m_sweep.localCenter.x, g = this.m_localAnchor.y - b.m_sweep.localCenter.y, d = c.col1.x * f + c.col2.x * g, g = c.col1.y * f + c.col2.y * g, f = d, d = b.m_linearVelocity.x + -b.m_angularVelocity * g, h = b.m_linearVelocity.y + b.m_angularVelocity * f;
    c = this.m_mass;
    d = d + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
    e = h + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
    h = -(c.col1.x * d + c.col2.x * e);
    e = -(c.col1.y * d + c.col2.y * e);
    c = this.m_impulse.x;
    d = this.m_impulse.y;
    this.m_impulse.x += h;
    this.m_impulse.y += e;
    a = a.dt * this.m_maxForce;
    this.m_impulse.LengthSquared() > a * a && this.m_impulse.Multiply(a / this.m_impulse.Length());
    h = this.m_impulse.x - c;
    e = this.m_impulse.y - d;
    b.m_linearVelocity.x += b.m_invMass * h;
    b.m_linearVelocity.y += b.m_invMass * e;
    b.m_angularVelocity += b.m_invI * (f * e - g * h)
};
Box2D.Dynamics.Joints.b2MouseJoint.prototype.SolvePositionConstraints = function ()
{
    return!0
};
Box2D.Dynamics.b2BodyListNode = function (a)
{

    this.body = a;
    this.previous = this.next = null
};
Box2D.Dynamics.b2BodyListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.b2BodyListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.b2BodyListNode.prototype.GetBody = function ()
{
    return this.body
};
Box2D.Dynamics.b2BodyListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.b2BodyListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Common.b2Color = function (a, b, c)
{

    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(a, 0, 1);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(b, 0, 1);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(c, 0, 1)
};
Box2D.Common.b2Color.prototype.Set = function (a, b, c)
{
    this._r = 255 * Box2D.Common.Math.b2Math.Clamp(a, 0, 1);
    this._g = 255 * Box2D.Common.Math.b2Math.Clamp(b, 0, 1);
    this._b = 255 * Box2D.Common.Math.b2Math.Clamp(c, 0, 1)
};
Box2D.Common.b2Color.prototype.GetColor = function ()
{
    return this._r << 16 | this._g << 8 | this._b
};
Box2D.Dynamics.b2BodyList = function ()
{

    this.bodyFirstNodes = [];
    for (var a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
    {
        this.bodyFirstNodes[a] = null
    }
    this.bodyLastNodes = [];
    for (a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
    {
        this.bodyLastNodes[a] = null
    }
    this.bodyNodeLookup = {};
    this.bodyCount = 0
};
Box2D.Dynamics.b2BodyList.prototype.GetFirstNode = function (a)
{
    return this.bodyFirstNodes[a]
};
Box2D.Dynamics.b2BodyList.prototype.AddBody = function (a)
{
    var b = a.ID;
    null == this.bodyNodeLookup[b] && (this.CreateNode(a, b, Box2D.Dynamics.b2BodyList.TYPES.allBodies), this.UpdateBody(a), a.m_lists.push(this), this.bodyCount++)
};
Box2D.Dynamics.b2BodyList.prototype.UpdateBody = function (a)
{
    var b = a.GetType(), c = a.ID, d = a.IsAwake(), e = a.IsActive();
    b == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies);
    b != Box2D.Dynamics.b2BodyDef.b2_staticBody ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticBodies);
    b != Box2D.Dynamics.b2BodyDef.b2_staticBody && e && d ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies);
    d ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.awakeBodies);
    e ? this.CreateNode(a, c, Box2D.Dynamics.b2BodyList.TYPES.activeBodies) : this.RemoveNode(c, Box2D.Dynamics.b2BodyList.TYPES.activeBodies)
};
Box2D.Dynamics.b2BodyList.prototype.RemoveBody = function (a)
{
    var b = a.ID;
    if (null != this.bodyNodeLookup[b])
    {
        goog.array.remove(a.m_lists, this);
        for (a = 0; a <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; a++)
        {
            this.RemoveNode(b, a)
        }
        delete this.bodyNodeLookup[b];
        this.bodyCount--
    }
};
Box2D.Dynamics.b2BodyList.prototype.RemoveNode = function (a, b)
{
    var c = this.bodyNodeLookup[a];
    if (null != c)
    {
        var d = c[b];
        null != d && (c[b] = null, c = d.GetPreviousNode(), d = d.GetNextNode(), null == c ? this.bodyFirstNodes[b] = d : c.SetNextNode(d), null == d ? this.bodyLastNodes[b] = c : d.SetPreviousNode(c))
    }
};
Box2D.Dynamics.b2BodyList.prototype.CreateNode = function (a, b, c)
{
    var d = this.bodyNodeLookup[b];
    if (null == d)
    {
        for (var d = [], e = 0; e <= Box2D.Dynamics.b2BodyList.TYPES.allBodies; e++)
        {
            d[e] = null
        }
        this.bodyNodeLookup[b] = d
    }
    null == d[c] && (d[c] = new Box2D.Dynamics.b2BodyListNode(a), a = this.bodyLastNodes[c], null != a ? a.SetNextNode(d[c]) : this.bodyFirstNodes[c] = d[c], d[c].SetPreviousNode(a), this.bodyLastNodes[c] = d[c])
};
Box2D.Dynamics.b2BodyList.prototype.GetBodyCount = function ()
{
    return this.bodyCount
};
Box2D.Dynamics.b2BodyList.TYPES = {dynamicBodies:0, nonStaticBodies:1, activeBodies:2, nonStaticActiveAwakeBodies:3, awakeBodies:4, allBodies:5};
Box2D.Dynamics.Controllers = {};
Box2D.Dynamics.Controllers.b2Controller = function ()
{
    this.ID = "Controller" + Box2D.Dynamics.Controllers.b2Controller.NEXT_ID++;
    this.m_world = null;
    this.bodyList = new Box2D.Dynamics.b2BodyList
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Step = function ()
{
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Draw = function ()
{
};
Box2D.Dynamics.Controllers.b2Controller.prototype.AddBody = function (a)
{
    this.bodyList.AddBody(a);
    a.AddController(this)
};
Box2D.Dynamics.Controllers.b2Controller.prototype.RemoveBody = function (a)
{
    this.bodyList.RemoveBody(a);
    a.RemoveController(this)
};
Box2D.Dynamics.Controllers.b2Controller.prototype.Clear = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); a; a = a.GetNextNode())
    {
        this.RemoveBody(a.body)
    }
};
Box2D.Dynamics.Controllers.b2Controller.prototype.GetBodyList = function ()
{
    return this.bodyList
};
Box2D.Dynamics.Controllers.b2Controller.NEXT_ID = 0;
Box2D.Dynamics.Controllers.b2ConstantAccelController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.A = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
goog.inherits(Box2D.Dynamics.Controllers.b2ConstantAccelController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantAccelController.prototype.Step = function (a)
{
    for (var a = Box2D.Common.Math.b2Vec2.Get(this.A.x * a.dt, this.A.y * a.dt), b = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); b; b = b.GetNextNode())
    {
        var c = b.body, d = c.GetLinearVelocity(), d = Box2D.Common.Math.b2Vec2.Get(d.x + a.x, d.y + a.y);
        c.SetLinearVelocity(d);
        Box2D.Common.Math.b2Vec2.Free(d)
    }
    Box2D.Common.Math.b2Vec2.Free(a)
};
Box2D.Dynamics.Contacts.b2PolygonContact = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.call(this, a, b)
};
goog.inherits(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Dynamics.Contacts.b2Contact);
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Reset = function (a, b)
{
    Box2D.Dynamics.Contacts.b2Contact.prototype.Reset.call(this, a, b)
};
Box2D.Dynamics.Contacts.b2PolygonContact.prototype.Evaluate = function ()
{
    var a = this.m_fixtureA.GetShape(), b = this.m_fixtureB.GetShape();
    Box2D.Collision.b2Collision.CollidePolygons(this.m_manifold, a, this.m_fixtureA.GetBody().m_xf, b, this.m_fixtureB.GetBody().m_xf)
};
Box2D.Collision.IBroadPhase = "Box2D.Collision.IBroadPhase";
Box2D.Dynamics.b2Island = function (a, b)
{

    this.m_listener = a;
    this.m_contactSolver = b;
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = [];
    this.impulse = new Box2D.Dynamics.b2ContactImpulse
};
Box2D.Dynamics.b2Island.prototype.Reset = function (a, b)
{
    this.m_listener = a;
    this.m_contactSolver = b
};
Box2D.Dynamics.b2Island.prototype.Clear = function ()
{
    this.m_bodies = [];
    this.m_dynamicBodies = [];
    this.m_nonStaticBodies = [];
    this.m_contacts = [];
    this.m_joints = []
};
Box2D.Dynamics.b2Island.prototype.Solve = function (a, b, c)
{
    this._InitializeVelocities(a, b);
    this.m_contactSolver.Initialize(a, this.m_contacts, this.m_contacts.length);
    this._SolveVelocityConstraints(a);
    this._SolveBodies(a);
    this._SolvePositionConstraints(a);
    this.Report(this.m_contactSolver.m_constraints);
    c && this._SleepIfTired(a)
};
Box2D.Dynamics.b2Island.prototype._InitializeVelocities = function (a, gravity)
{
    // playcraft/pc -- modified to allow for each body to have it's own overriding gravity
    for (var c = 0; c < this.m_dynamicBodies.length; c++)
    {
        var d = this.m_dynamicBodies[c];
        var gx = gravity.x;
        var gy = gravity.y;
        if (d._pc_gravityX != undefined)
            gx = d._pc_gravityX;
        if (d._pc_gravityY != undefined)
            gy = d._pc_gravityY;

        d.m_linearVelocity.x += a.dt * (gx + d.m_invMass * d.m_force.x);
        d.m_linearVelocity.y += a.dt * (gy + d.m_invMass * d.m_force.y);
        d.m_angularVelocity += a.dt * d.m_invI * d.m_torque;
        d.m_linearVelocity.Multiply(Box2D.Common.Math.b2Math.Clamp(1 - a.dt * d.m_linearDamping, 0, 1));
        d.m_angularVelocity *= Box2D.Common.Math.b2Math.Clamp(1 - a.dt * d.m_angularDamping, 0, 1)
    }
};
Box2D.Dynamics.b2Island.prototype._SolveVelocityConstraints = function (a)
{
    this.m_contactSolver.InitVelocityConstraints(a);
    for (var b = 0; b < this.m_joints.length; b++)
    {
        this.m_joints[b].InitVelocityConstraints(a)
    }
    for (b = 0; b < a.velocityIterations; b++)
    {
        for (var c = 0; c < this.m_joints.length; c++)
        {
            this.m_joints[c].SolveVelocityConstraints(a)
        }
        this.m_contactSolver.SolveVelocityConstraints()
    }
    for (a = 0; a < this.m_joints.length; a++)
    {
        this.m_joints[a].FinalizeVelocityConstraints()
    }
    this.m_contactSolver.FinalizeVelocityConstraints()
};
Box2D.Dynamics.b2Island.prototype._SolveBodies = function (a)
{
    for (var b = 0; b < this.m_nonStaticBodies.length; ++b)
    {
        var c = this.m_nonStaticBodies[b], d = a.dt * c.m_linearVelocity.x, e = a.dt * c.m_linearVelocity.y;
        d * d + e * e > Box2D.Common.b2Settings.b2_maxTranslationSquared && (c.m_linearVelocity.Normalize(), c.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt, c.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt);
        d = a.dt * c.m_angularVelocity;
        d * d > Box2D.Common.b2Settings.b2_maxRotationSquared && (c.m_angularVelocity = 0 > c.m_angularVelocity ? -Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt : Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt);
        c.m_sweep.c0.SetV(c.m_sweep.c);
        c.m_sweep.a0 = c.m_sweep.a;
        c.m_sweep.c.x += a.dt * c.m_linearVelocity.x;
        c.m_sweep.c.y += a.dt * c.m_linearVelocity.y;
        c.m_sweep.a += a.dt * c.m_angularVelocity;
        c.SynchronizeTransform()
    }
};
Box2D.Dynamics.b2Island.prototype._SolvePositionConstraints = function (a)
{
    for (var b = 0; b < a.positionIterations; b++)
    {
        for (var c = this.m_contactSolver.SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), d = !0, e = 0; e < this.m_joints.length; e++)
        {
            var f = this.m_joints[e].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), d = d && f
        }
        if (c && d)
        {
            break
        }
    }
};
Box2D.Dynamics.b2Island.prototype._SleepIfTired = function (a)
{
    for (var b = Number.MAX_VALUE, c = 0; c < this.m_nonStaticBodies.length; c++)
    {
        var d = this.m_nonStaticBodies[c];
        !d.m_allowSleep || Math.abs(d.m_angularVelocity) > Box2D.Common.b2Settings.b2_angularSleepTolerance || Box2D.Common.Math.b2Math.Dot(d.m_linearVelocity, d.m_linearVelocity) > Box2D.Common.b2Settings.b2_linearSleepToleranceSquared ? b = d.m_sleepTime = 0 : (d.m_sleepTime += a.dt, b = Math.min(b, d.m_sleepTime))
    }
    if (b >= Box2D.Common.b2Settings.b2_timeToSleep)
    {
        for (a = 0; a < this.m_bodies.length; a++)
        {
            this.m_bodies[a].SetAwake(!1)
        }
    }
};
Box2D.Dynamics.b2Island.prototype.SolveTOI = function (a)
{
    var b = 0, c = 0;
    this.m_contactSolver.Initialize(a, this.m_contacts, this.m_contacts.length);
    for (var d = this.m_contactSolver, b = 0; b < this.m_joints.length; ++b)
    {
        this.m_joints[b].InitVelocityConstraints(a)
    }
    for (b = 0; b < a.velocityIterations; ++b)
    {
        d.SolveVelocityConstraints();
        for (c = 0; c < this.m_joints.length; ++c)
        {
            this.m_joints[c].SolveVelocityConstraints(a)
        }
    }
    for (b = 0; b < this.m_nonStaticBodies.length; ++b)
    {
        var c = this.m_nonStaticBodies[b], e = a.dt * c.m_linearVelocity.x, f = a.dt * c.m_linearVelocity.y;
        e * e + f * f > Box2D.Common.b2Settings.b2_maxTranslationSquared && (c.m_linearVelocity.Normalize(), c.m_linearVelocity.x *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt, c.m_linearVelocity.y *= Box2D.Common.b2Settings.b2_maxTranslation * a.inv_dt);
        e = a.dt * c.m_angularVelocity;
        e * e > Box2D.Common.b2Settings.b2_maxRotationSquared && (c.m_angularVelocity = 0 > c.m_angularVelocity ? -Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt : Box2D.Common.b2Settings.b2_maxRotation * a.inv_dt);
        c.m_sweep.c0.SetV(c.m_sweep.c);
        c.m_sweep.a0 = c.m_sweep.a;
        c.m_sweep.c.x += a.dt * c.m_linearVelocity.x;
        c.m_sweep.c.y += a.dt * c.m_linearVelocity.y;
        c.m_sweep.a += a.dt * c.m_angularVelocity;
        c.SynchronizeTransform()
    }
    for (b = 0; b < a.positionIterations; ++b)
    {
        e = d.SolvePositionConstraints(0.75);
        f = !0;
        for (c = 0; c < this.m_joints.length; ++c)
        {
            var g = this.m_joints[c].SolvePositionConstraints(Box2D.Common.b2Settings.b2_contactBaumgarte), f = f && g
        }
        if (e && f)
        {
            break
        }
    }
    this.Report(d.m_constraints)
};
Box2D.Dynamics.b2Island.prototype.Report = function (a)
{
    if (null != this.m_listener)
    {
        for (var b = 0; b < this.m_contacts.length; ++b)
        {
            var c = this.m_contacts[b], d = a[b];
            this.impulse.Reset();
            for (var e = 0; e < d.pointCount; ++e)
            {
                this.impulse.normalImpulses[e] = d.points[e].normalImpulse, this.impulse.tangentImpulses[e] = d.points[e].tangentImpulse
            }
            this.m_listener.PostSolve(c, this.impulse)
        }
    }
};
Box2D.Dynamics.b2Island.prototype.AddBody = function (a)
{
    this.m_bodies.push(a);
    a.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_nonStaticBodies.push(a), a.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && this.m_dynamicBodies.push(a))
};
Box2D.Dynamics.b2Island.prototype.AddContact = function (a)
{
    this.m_contacts.push(a)
};
Box2D.Dynamics.b2Island.prototype.AddJoint = function (a)
{
    this.m_joints.push(a)
};
Box2D.Dynamics.Contacts.b2ContactRegister = function ()
{
    this.pool = null;
    this.poolCount = 0
};
Box2D.Collision.b2DynamicTreePair = function (a, b)
{

    this.fixtureA = a;
    this.fixtureB = b
};
Box2D.Collision.b2DynamicTreePair._freeCache = [];
Box2D.Collision.b2DynamicTreePair.Get = function (a, b)
{

    if (0 < Box2D.Collision.b2DynamicTreePair._freeCache.length)
    {
        var c = Box2D.Collision.b2DynamicTreePair._freeCache.pop();
        c.fixtureA = a;
        c.fixtureB = b;
        return c
    }
    return new Box2D.Collision.b2DynamicTreePair(a, b)
};
Box2D.Collision.b2DynamicTreePair.Free = function (a)
{
    null != a && ( Box2D.Collision.b2DynamicTreePair._freeCache.push(a))
};
Box2D.Dynamics.b2DebugDraw = function ()
{

    this.m_xformScale = this.m_fillAlpha = this.m_alpha = this.m_lineThickness = this.m_drawScale = 1;
    this.m_drawFlags = 0;
    this.m_originX = 0;
    this.m_originY = 0;

    this.m_ctx = null
};

Box2D.Dynamics.b2DebugDraw.prototype.SetOrigin = function(x, y)
{
    this.m_originX = x;
    this.m_originY = y;
};

Box2D.Dynamics.b2DebugDraw.prototype.Clear = function ()
{
//  this.m_ctx.clearRect(0, 0, this.m_ctx.canvas.width, this.m_ctx.canvas.height)
};
Box2D.Dynamics.b2DebugDraw.prototype._color = function (a, b)
{
    return"rgba(" + ((a & 16711680) >> 16) + "," + ((a & 65280) >> 8) + "," + (a & 255) + "," + b + ")"
};
Box2D.Dynamics.b2DebugDraw.prototype.SetFlags = function (a)
{
    this.m_drawFlags = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetFlags = function ()
{
    return this.m_drawFlags
};
Box2D.Dynamics.b2DebugDraw.prototype.AppendFlags = function (a)
{
    this.m_drawFlags |= a
};
Box2D.Dynamics.b2DebugDraw.prototype.ClearFlags = function (a)
{
    this.m_drawFlags &= ~a
};
Box2D.Dynamics.b2DebugDraw.prototype.SetSprite = function (a)
{
    this.m_ctx = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetSprite = function ()
{
    return this.m_ctx
};
Box2D.Dynamics.b2DebugDraw.prototype.SetDrawScale = function (a)
{
    this.m_drawScale = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetDrawScale = function ()
{
    return this.m_drawScale
};
Box2D.Dynamics.b2DebugDraw.prototype.SetLineThickness = function (a)
{
    this.m_lineThickness = a;
    this.m_ctx.strokeWidth = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetLineThickness = function ()
{
    return this.m_lineThickness
};
Box2D.Dynamics.b2DebugDraw.prototype.SetAlpha = function (a)
{
    this.m_alpha = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetAlpha = function ()
{
    return this.m_alpha
};
Box2D.Dynamics.b2DebugDraw.prototype.SetFillAlpha = function (a)
{
    this.m_fillAlpha = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetFillAlpha = function ()
{
    return this.m_fillAlpha
};
Box2D.Dynamics.b2DebugDraw.prototype.SetXFormScale = function (a)
{
    this.m_xformScale = a
};
Box2D.Dynamics.b2DebugDraw.prototype.GetXFormScale = function ()
{
    return this.m_xformScale
};
(function (a)
{
    a.prototype.DrawPolygon = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.moveTo((a[0].x * f)-this.m_originX, (a[0].y * f)- this.m_originY);
            for (d = 1; d < c; d++)
            {
                e.lineTo((a[d].x*f) - this.m_originX, (a[d].y*f) - this.m_originY)
            }
            e.lineTo((a[0].x*f) - this.m_originX, (a[0].y*f) - this.m_originY);
            e.closePath();
            e.stroke()
        }
    };
    a.prototype.DrawSolidPolygon = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.fillStyle = this._color(d.GetColor(), this.m_fillAlpha);
            e.moveTo((a[0].x * f)-this.m_originX, (a[0].y * f) - this.m_originY);
            for (d = 1; d < c; d++)
            {
                e.lineTo((a[d].x * f) - this.m_originX, (a[d].y * f) - this.m_originY);
            }
            e.lineTo((a[0].x* f) - this.m_originX, (a[0].y* f) - this.m_originY);
            e.closePath();
            e.fill();
            e.stroke()
        }
    };
    a.prototype.DrawCircle = function (a, c, d)
    {
        if (c)
        {
            var e = this.m_ctx, f = this.m_drawScale;
            e.beginPath();
            e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
            e.arc((a.x * f) - this.m_originX, (a.y * f)-this.m_originY, c * f, 0, 2 * Math.PI, !0);
            e.closePath();
            e.stroke()
        }
    };
    a.prototype.DrawSolidCircle = function (a, c, d, e)
    {
        if (c)
        {
            var f = this.m_ctx, g = this.m_drawScale, h = (a.x * g) - this.m_originX, i = (a.y * g) - this.m_originY;
            f.moveTo(0, 0);
            f.beginPath();
            f.strokeStyle = this._color(e.GetColor(), this.m_alpha);
            f.fillStyle = this._color(e.GetColor(), this.m_fillAlpha);
            f.arc(h, i, c * g, 0, 2 * Math.PI, !0);
            f.moveTo(h, i);
            f.lineTo(((a.x + d.x * c) * g)-this.m_originX, ((a.y + d.y * c) * g)-this.m_originY);
            f.closePath();
            f.fill();
            f.stroke()
        }
    };
    a.prototype.DrawSegment = function (a, c, d)
    {
        var e = this.m_ctx, f = this.m_drawScale;
        e.strokeStyle = this._color(d.GetColor(), this.m_alpha);
        e.beginPath();
        e.moveTo((a.x * f) - this.m_originX, (a.y * f) - this.m_originY);
        e.lineTo((c.x * f) - this.m_originX, (c.y * f) - this.m_originY);
        e.closePath();
        e.stroke()
    };
    a.prototype.DrawTransform = function (a)
    {
        var c = this.m_ctx, d = this.m_drawScale;
        c.beginPath();
        c.strokeStyle = this._color(16711680, this.m_alpha);
        c.moveTo((a.position.x * d) - this.m_originX, (a.position.y * d) - this.m_originY);
        c.lineTo(((a.position.x + this.m_xformScale * a.R.col1.x) * d) - this.m_originX,
            ((a.position.y + this.m_xformScale * a.R.col1.y) * d) - this.m_originY);
        c.strokeStyle = this._color(65280, this.m_alpha);
        c.moveTo((a.position.x * d) - this.m_originX, (a.position.y * d) - this.m_originY);
        c.lineTo(((a.position.x + this.m_xformScale * a.R.col2.x) * d) - this.m_originX,
            ((a.position.y + this.m_xformScale * a.R.col2.y) * d) - this.m_originY);
        c.closePath();
        c.stroke()
    }
})(Box2D.Dynamics.b2DebugDraw);
Box2D.Dynamics.b2DebugDraw.e_shapeBit = 1;
Box2D.Dynamics.b2DebugDraw.e_jointBit = 2;
Box2D.Dynamics.b2DebugDraw.e_aabbBit = 4;
Box2D.Dynamics.b2DebugDraw.e_pairBit = 8;
Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit = 16;
Box2D.Dynamics.b2DebugDraw.e_controllerBit = 32;
Box2D.Collision.b2RayCastOutput = function ()
{

    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
Box2D.Dynamics.iContactFilter = function ()
{
};
Box2D.Dynamics.iContactFilter.prototype.ShouldCollide = function ()
{
};
Box2D.Dynamics.b2ContactFilter = function ()
{

};
Box2D.Dynamics.b2ContactFilter.prototype.ShouldCollide = function (a, b)
{
    var c = a.GetFilterData(), d = b.GetFilterData();
    return c.groupIndex == d.groupIndex && 0 != c.groupIndex ? 0 < c.groupIndex : 0 != (c.maskBits & d.categoryBits) && 0 != (c.categoryBits & d.maskBits)
};
Box2D.Dynamics.b2ContactFilter.b2_defaultFilter = new Box2D.Dynamics.b2ContactFilter;
Box2D.Dynamics.Joints.b2MouseJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.target = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_mouseJoint;
    this.maxForce = 0;
    this.frequencyHz = 5;
    this.dampingRatio = 0.7
};
goog.inherits(Box2D.Dynamics.Joints.b2MouseJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2MouseJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2MouseJoint(this)
};
Box2D.Dynamics.Contacts.b2ContactFactory = function ()
{
    this.m_registers = {};
    this.m_freeContacts = {};
    this.AddType(Box2D.Dynamics.Contacts.b2CircleContact, Box2D.Collision.Shapes.b2CircleShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndCircleContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolygonContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2PolygonShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2EdgeAndCircleContact, Box2D.Collision.Shapes.b2EdgeShape.NAME, Box2D.Collision.Shapes.b2CircleShape.NAME);
    this.AddType(Box2D.Dynamics.Contacts.b2PolyAndEdgeContact, Box2D.Collision.Shapes.b2PolygonShape.NAME, Box2D.Collision.Shapes.b2EdgeShape.NAME)
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.AddType = function (a, b, c)
{
    this.m_freeContacts[b] = this.m_freeContacts[b] || {};
    this.m_freeContacts[b][c] = this.m_freeContacts[b][c] || [];
    this.m_registers[b] = this.m_registers[b] || {};
    this.m_registers[b][c] = new Box2D.Dynamics.Contacts.b2ContactRegister;
    this.m_registers[b][c].ctor = a;
    this.m_registers[b][c].primary = !0;
    b != c && (this.m_registers[c] = this.m_registers[c] || {}, this.m_registers[c][b] = new Box2D.Dynamics.Contacts.b2ContactRegister, this.m_registers[c][b].ctor = a, this.m_registers[c][b].primary = !1)
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Create = function (a, b)
{

    var c = a.GetShape().GetTypeName(), d = b.GetShape().GetTypeName(), e = this.m_registers[c][d], f = e.ctor;
    return null != f ? e.primary ? 0 < this.m_freeContacts[c][d].length ? (c = this.m_freeContacts[c][d].pop(), c.Reset(a, b), c) : new f(a, b) : 0 < this.m_freeContacts[d][c].length ? (c = this.m_freeContacts[d][c].pop(), c.Reset(b, a), c) : new f(b, a) : null
};
Box2D.Dynamics.Contacts.b2ContactFactory.prototype.Destroy = function (a)
{

    var b = a.GetFixtureA().GetShape().GetTypeName(), c = a.GetFixtureB().GetShape().GetTypeName();
    this.m_freeContacts[b][c].push(a)
};
Box2D.Dynamics.b2ContactListener = function ()
{

};
Box2D.Dynamics.b2ContactListener.prototype.BeginContact = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.EndContact = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.PreSolve = function ()
{
};
Box2D.Dynamics.b2ContactListener.prototype.PostSolve = function ()
{
};
Box2D.Dynamics.b2ContactListener.b2_defaultListener = new Box2D.Dynamics.b2ContactListener;
Box2D.Collision.b2ContactPoint = function ()
{

    this.position = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.id = new Box2D.Collision.b2ContactID
};
Box2D.Collision.b2DynamicTreeBroadPhase = function ()
{

    this.m_tree = new Box2D.Collision.b2DynamicTree;
    this.m_moveBuffer = [];
    this.queryProxy = this.updatePairsCallback = this.lastQueryFixtureB = this.lastQueryFixtureA = null
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.CreateProxy = function (a, b)
{
    var c = this.m_tree.CreateProxy(a, b);
    this.BufferMove(c);
    return c
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.DestroyProxy = function (a)
{
    this.UnBufferMove(a);
    this.m_tree.DestroyProxy(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.MoveProxy = function (a, b, c)
{
    this.m_tree.MoveProxy(a, b, c) && this.BufferMove(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.TestOverlap = function (a, b)
{
    var c = this.m_tree.GetFatAABB(a), d = this.m_tree.GetFatAABB(b);
    return c.TestOverlap(d)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetFatAABB = function (a)
{
    return this.m_tree.GetFatAABB(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.GetProxyCount = function ()
{
    return this.m_tree.length
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UpdatePairs = function (a)
{
    this.lastQueryFixtureB = this.lastQueryFixtureA = null;
    for (this.updatePairsCallback = a; 0 < this.m_moveBuffer.length;)
    {
        this.queryProxy = this.m_moveBuffer.pop(), this.m_tree.Query(this.QueryCallback, this.m_tree.GetFatAABB(this.queryProxy), this)
    }
    this.queryProxy = this.updatePairsCallback = this.lastQueryFixtureB = this.lastQueryFixtureA = null
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.QueryCallback = function (a)
{
    a != this.queryProxy.fixture && (!(this.queryProxy.fixture == this.lastQueryFixtureA && a == this.lastQueryFixtureB) && !(this.queryProxy.fixture == this.lastQueryFixtureB && a == this.lastQueryFixtureA)) && (this.updatePairsCallback(this.queryProxy.fixture, a), this.lastQueryFixtureA = this.queryProxy.fixture, this.lastQueryFixtureB = a);
    return!0
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Query = function (a, b)
{
    this.m_tree.Query(a, b)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.RayCast = function (a, b)
{
    this.m_tree.RayCast(a, b)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.Rebalance = function (a)
{
    this.m_tree.Rebalance(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.BufferMove = function (a)
{
    this.m_moveBuffer.push(a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.prototype.UnBufferMove = function (a)
{
    goog.array.remove(this.m_moveBuffer, a)
};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements = {};
Box2D.Collision.b2DynamicTreeBroadPhase.__implements[Box2D.Collision.IBroadPhase] = !0;
Box2D.Dynamics.b2ContactManager = function (a)
{

    this.m_world = a;
    this.m_contactFilter = Box2D.Dynamics.b2ContactFilter.b2_defaultFilter;
    this.m_contactListener = Box2D.Dynamics.b2ContactListener.b2_defaultListener;
    this.m_contactFactory = new Box2D.Dynamics.Contacts.b2ContactFactory;
    this.m_broadPhase = new Box2D.Collision.b2DynamicTreeBroadPhase
};
Box2D.Dynamics.b2ContactManager.prototype.AddPair = function (a, b)
{
    var c = a.GetBody(), d = b.GetBody();
    if (c != d && d.ShouldCollide(c) && this.m_contactFilter.ShouldCollide(a, b))
    {
        for (c = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); c; c = c.GetNextNode())
        {
            if (d = c.contact.GetFixtureA(), d == a)
            {
                if (d = c.contact.GetFixtureB(), d == b)
                {
                    return
                }
            } else
            {
                if (d == b && (d = c.contact.GetFixtureB(), d == a))
                {
                    return
                }
            }
        }
        this.m_contactFactory.Create(a, b)
    }
};
Box2D.Dynamics.b2ContactManager.prototype.FindNewContacts = function ()
{
    var a = this;
    this.m_broadPhase.UpdatePairs(function (b, c)
    {
        a.AddPair(b, c)
    })
};
Box2D.Dynamics.b2ContactManager.prototype.Destroy = function (a)
{
    var b = a.GetFixtureA(), c = a.GetFixtureB(), b = b.GetBody(), c = c.GetBody();
    a.IsTouching() && this.m_contactListener.EndContact(a);
    0 < a.m_manifold.m_pointCount && (b.SetAwake(!0), c.SetAwake(!0));
    a.RemoveFromLists();
    this.m_contactFactory.Destroy(a)
};
Box2D.Dynamics.b2ContactManager.prototype.Collide = function ()
{
    for (var a = this.m_world.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
    {
        var b = a.contact, c = b.GetFixtureA(), d = b.GetFixtureB(), e = c.GetBody(), f = d.GetBody();
        if (e.IsAwake() || f.IsAwake())
        {
            if (b.IsFiltering())
            {
                if (!f.ShouldCollide(e))
                {
                    this.Destroy(b);
                    continue
                }
                if (!this.m_contactFilter.ShouldCollide(c, d))
                {
                    this.Destroy(b);
                    continue
                }
                b.ClearFiltering()
            }
            this.m_broadPhase.TestOverlap(c.m_proxy, d.m_proxy) ? b.Update(this.m_contactListener) : this.Destroy(b)
        }
    }
};
Box2D.Dynamics.b2ContactManager.s_evalCP = new Box2D.Collision.b2ContactPoint;
Box2D.Dynamics.Joints.b2DistanceJoint = function (a)
{
    Box2D.Dynamics.Joints.b2Joint.call(this, a);
    this.m_localAnchor1 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor2 = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_u = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_localAnchor1.SetV(a.localAnchorA);
    this.m_localAnchor2.SetV(a.localAnchorB);
    this.m_length = a.length;
    this.m_frequencyHz = a.frequencyHz;
    this.m_dampingRatio = a.dampingRatio;
    this.m_bias = this.m_gamma = this.m_impulse = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2DistanceJoint, Box2D.Dynamics.Joints.b2Joint);
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorA = function ()
{
    return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetAnchorB = function ()
{
    return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionForce = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(a * this.m_impulse * this.m_u.x, a * this.m_impulse * this.m_u.y)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetReactionTorque = function ()
{
    return 0
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetLength = function ()
{
    return this.m_length
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetLength = function (a)
{
    this.m_length = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetFrequency = function ()
{
    return this.m_frequencyHz
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetFrequency = function (a)
{
    this.m_frequencyHz = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.GetDampingRatio = function ()
{
    return this.m_dampingRatio
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SetDampingRatio = function (a)
{
    this.m_dampingRatio = a
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.InitVelocityConstraints = function (a)
{
    var b, c = 0, d = this.m_bodyA, e = this.m_bodyB;
    b = d.m_xf.R;
    var f = this.m_localAnchor1.x - d.m_sweep.localCenter.x, g = this.m_localAnchor1.y - d.m_sweep.localCenter.y, c = b.col1.x * f + b.col2.x * g, g = b.col1.y * f + b.col2.y * g, f = c;
    b = e.m_xf.R;
    var h = this.m_localAnchor2.x - e.m_sweep.localCenter.x, i = this.m_localAnchor2.y - e.m_sweep.localCenter.y, c = b.col1.x * h + b.col2.x * i, i = b.col1.y * h + b.col2.y * i, h = c;
    this.m_u.x = e.m_sweep.c.x + h - d.m_sweep.c.x - f;
    this.m_u.y = e.m_sweep.c.y + i - d.m_sweep.c.y - g;
    c = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
    c > Box2D.Common.b2Settings.b2_linearSlop ? this.m_u.Multiply(1 / c) : this.m_u.SetZero();
    b = f * this.m_u.y - g * this.m_u.x;
    var j = h * this.m_u.y - i * this.m_u.x;
    b = d.m_invMass + d.m_invI * b * b + e.m_invMass + e.m_invI * j * j;
    this.m_mass = 0 != b ? 1 / b : 0;
    if (0 < this.m_frequencyHz)
    {
        var c = c - this.m_length, j = 2 * Math.PI * this.m_frequencyHz, k = this.m_mass * j * j;
        this.m_gamma = a.dt * (2 * this.m_mass * this.m_dampingRatio * j + a.dt * k);
        this.m_gamma = 0 != this.m_gamma ? 1 / this.m_gamma : 0;
        this.m_bias = c * a.dt * k * this.m_gamma;
        this.m_mass = b + this.m_gamma;
        this.m_mass = 0 != this.m_mass ? 1 / this.m_mass : 0
    }
    a.warmStarting ? (this.m_impulse *= a.dtRatio, a = this.m_impulse * this.m_u.x, b = this.m_impulse * this.m_u.y, d.m_linearVelocity.x -= d.m_invMass * a, d.m_linearVelocity.y -= d.m_invMass * b, d.m_angularVelocity -= d.m_invI * (f * b - g * a), e.m_linearVelocity.x += e.m_invMass * a, e.m_linearVelocity.y += e.m_invMass * b, e.m_angularVelocity += e.m_invI * (h * b - i * a)) : this.m_impulse = 0
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolveVelocityConstraints = function ()
{
    var a = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x, b = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y, c = this.m_bodyA.m_xf.R.col1.x * a + this.m_bodyA.m_xf.R.col2.x * b, b = this.m_bodyA.m_xf.R.col1.y * a + this.m_bodyA.m_xf.R.col2.y * b, a = c, d = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x, e = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y, c = this.m_bodyB.m_xf.R.col1.x * d + this.m_bodyB.m_xf.R.col2.x * e, e = this.m_bodyB.m_xf.R.col1.y *
        d + this.m_bodyB.m_xf.R.col2.y * e, d = c, f = -this.m_mass * (this.m_u.x * (this.m_bodyB.m_linearVelocity.x - this.m_bodyB.m_angularVelocity * e - (this.m_bodyA.m_linearVelocity.x - this.m_bodyA.m_angularVelocity * b)) + this.m_u.y * (this.m_bodyB.m_linearVelocity.y + this.m_bodyB.m_angularVelocity * d - (this.m_bodyA.m_linearVelocity.y + this.m_bodyA.m_angularVelocity * a)) + this.m_bias + this.m_gamma * this.m_impulse);
    this.m_impulse += f;
    c = f * this.m_u.x;
    f *= this.m_u.y;
    this.m_bodyA.m_linearVelocity.x -= this.m_bodyA.m_invMass * c;
    this.m_bodyA.m_linearVelocity.y -= this.m_bodyA.m_invMass * f;
    this.m_bodyA.m_angularVelocity -= this.m_bodyA.m_invI * (a * f - b * c);
    this.m_bodyB.m_linearVelocity.x += this.m_bodyB.m_invMass * c;
    this.m_bodyB.m_linearVelocity.y += this.m_bodyB.m_invMass * f;
    this.m_bodyB.m_angularVelocity += this.m_bodyB.m_invI * (d * f - e * c)
};
Box2D.Dynamics.Joints.b2DistanceJoint.prototype.SolvePositionConstraints = function ()
{
    if (0 < this.m_frequencyHz)
    {
        return!0
    }
    var a = this.m_localAnchor1.x - this.m_bodyA.m_sweep.localCenter.x, b = this.m_localAnchor1.y - this.m_bodyA.m_sweep.localCenter.y, c = this.m_bodyA.m_xf.R.col1.x * a + this.m_bodyA.m_xf.R.col2.x * b, b = this.m_bodyA.m_xf.R.col1.y * a + this.m_bodyA.m_xf.R.col2.y * b, a = c, d = this.m_localAnchor2.x - this.m_bodyB.m_sweep.localCenter.x, e = this.m_localAnchor2.y - this.m_bodyB.m_sweep.localCenter.y, c = this.m_bodyB.m_xf.R.col1.x * d + this.m_bodyB.m_xf.R.col2.x * e, e = this.m_bodyB.m_xf.R.col1.y *
        d + this.m_bodyB.m_xf.R.col2.y * e, d = c, f = this.m_bodyB.m_sweep.c.x + d - this.m_bodyA.m_sweep.c.x - a, g = this.m_bodyB.m_sweep.c.y + e - this.m_bodyA.m_sweep.c.y - b, c = Math.sqrt(f * f + g * g), f = f / c, g = g / c, c = Box2D.Common.Math.b2Math.Clamp(c - this.m_length, -Box2D.Common.b2Settings.b2_maxLinearCorrection, Box2D.Common.b2Settings.b2_maxLinearCorrection), h = -this.m_mass * c;
    this.m_u.Set(f, g);
    f = h * this.m_u.x;
    g = h * this.m_u.y;
    this.m_bodyA.m_sweep.c.x -= this.m_bodyA.m_invMass * f;
    this.m_bodyA.m_sweep.c.y -= this.m_bodyA.m_invMass * g;
    this.m_bodyA.m_sweep.a -= this.m_bodyA.m_invI * (a * g - b * f);
    this.m_bodyB.m_sweep.c.x += this.m_bodyB.m_invMass * f;
    this.m_bodyB.m_sweep.c.y += this.m_bodyB.m_invMass * g;
    this.m_bodyB.m_sweep.a += this.m_bodyB.m_invI * (d * g - e * f);
    this.m_bodyA.SynchronizeTransform();
    this.m_bodyB.SynchronizeTransform();
    return Math.abs(c) < Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Joints.b2DistanceJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_distanceJoint;
    this.length = 1;
    this.dampingRatio = this.frequencyHz = 0
};
goog.inherits(Box2D.Dynamics.Joints.b2DistanceJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Initialize = function (a, b, c, d)
{
    this.bodyA = a;
    this.bodyB = b;
    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(c));
    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(d));
    a = d.x - c.x;
    c = d.y - c.y;
    this.length = Math.sqrt(a * a + c * c);
    this.dampingRatio = this.frequencyHz = 0
};
Box2D.Dynamics.Joints.b2DistanceJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2DistanceJoint(this)
};
Box2D.Dynamics.Controllers.b2BuoyancyController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.normal = Box2D.Common.Math.b2Vec2.Get(0, -1);
    this.density = this.offset = 0;
    this.velocity = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.linearDrag = 2;
    this.angularDrag = 1;
    this.useDensity = !1;
    this.useWorldGravity = !0;
    this.gravity = null
};
goog.inherits(Box2D.Dynamics.Controllers.b2BuoyancyController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Step = function ()
{
    this.useWorldGravity && (this.gravity = this.m_world.GetGravity());
    for (var a = Box2D.Common.Math.b2Vec2.Get(0, 0), b = Box2D.Common.Math.b2Vec2.Get(0, 0), c = Box2D.Common.Math.b2Vec2.Get(0, 0), d = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); d; d = d.GetNextNode())
    {
        b.Set(0, 0);
        a.Set(0, 0);
        for (var e = d.body, f = 0, g = 0, h = e.GetFixtureList().GetFirstNode(); h; h = h.GetNextNode())
        {
            c.Set(0, 0);
            var i = h.fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, e.GetTransform(), c), f = f + i;
            a.x += i * c.x;
            a.y += i * c.y;
            var j = 0, j = 1, g = g + i * j;
            b.x += i * c.x * j;
            b.y += i * c.y * j
        }
        f < Number.MIN_VALUE || (a.x /= f, a.y /= f, b.x /= g, b.y /= g, g = this.gravity.GetNegative(), g.Multiply(this.density * f), e.ApplyForce(g, b), Box2D.Common.Math.b2Vec2.Free(g), g = e.GetLinearVelocityFromWorldPoint(a), g.Subtract(this.velocity), g.Multiply(-this.linearDrag * f), e.ApplyForce(g, a), Box2D.Common.Math.b2Vec2.Free(g), e.ApplyTorque(-e.GetInertia() / e.GetMass() * f * e.GetAngularVelocity() * this.angularDrag))
    }
    Box2D.Common.Math.b2Vec2.Free(c);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(a)
};
Box2D.Dynamics.Controllers.b2BuoyancyController.prototype.Draw = function (a)
{
    var b = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset + 1E3 * this.normal.y, this.normal.y * this.offset - 1E3 * this.normal.x), c = Box2D.Common.Math.b2Vec2.Get(this.normal.x * this.offset - 1E3 * this.normal.y, this.normal.y * this.offset + 1E3 * this.normal.x);
    a.DrawSegment(b, c, Box2D.Dynamics.Controllers.b2BuoyancyController.color);
    Box2D.Common.Math.b2Vec2.Free(b);
    Box2D.Common.Math.b2Vec2.Free(c)
};
Box2D.Dynamics.Controllers.b2BuoyancyController.color = new Box2D.Common.b2Color(0, 0, 1);
Box2D.Dynamics.Controllers.b2GravityController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.G = 1;
    this.invSqr = !0
};
goog.inherits(Box2D.Dynamics.Controllers.b2GravityController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2GravityController.prototype.Step = function ()
{
    var a = null, b = null, c = 0, d = null, e = null, f = 0, g = 0, h = 0, f = null;
    if (this.invSqr)
    {
        for (var i = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); i; i = i.GetNextNode())
        {
            for (var a = i.body, b = a.GetWorldCenter(), c = a.GetMass(), j = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); j; j = j.GetNextNode())
            {
                if (d = j.body, a.IsAwake() || d.IsAwake())
                {
                    e = d.GetWorldCenter(), f = e.x - b.x, g = e.y - b.y, h = f * f + g * g, h < Number.MIN_VALUE || (f = Box2D.Common.Math.b2Vec2.Get(f, g), f.Multiply(this.G / h / Math.sqrt(h) * c * d.GetMass()), a.IsAwake() && a.ApplyForce(f, b), f.Multiply(-1), d.IsAwake() && d.ApplyForce(f, e), Box2D.Common.Math.b2Vec2.Free(f))
                }
            }
        }
    } else
    {
        for (i = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); i; i = i.GetNextNode())
        {
            a = bodyNode.body;
            b = a.GetWorldCenter();
            c = a.GetMass();
            for (j = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); j; j = j.GetNextNode())
            {
                if (d = bodyNode.body, a.IsAwake() || d.IsAwake())
                {
                    e = d.GetWorldCenter(), f = e.x - b.x, g = e.y - b.y, h = f * f + g * g, h < Number.MIN_VALUE || (f = Box2D.Common.Math.b2Vec2.Get(f, g), f.Multiply(this.G / h * c * d.GetMass()), a.IsAwake() && a.ApplyForce(f, b), f.Multiply(-1), d.IsAwake() && d.ApplyForce(f, e), Box2D.Common.Math.b2Vec2.Free(f))
                }
            }
        }
    }
};
Box2D.Collision.b2WorldManifold = function ()
{

    this.m_normal = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_points = [];
    for (var a = this.m_pointCount = 0; a < Box2D.Common.b2Settings.b2_maxManifoldPoints; a++)
    {
        this.m_points[a] = Box2D.Common.Math.b2Vec2.Get(0, 0)
    }
};
Box2D.Collision.b2WorldManifold.prototype.Initialize = function (a, b, c, d, e)
{
    if (0 != a.m_pointCount)
    {
        var f = 0, g, h, i = 0, j = 0, k = 0, l = 0, n = 0;
        g = 0;
        switch (a.m_type)
        {
            case Box2D.Collision.b2Manifold.e_circles:
                h = b.R;
                g = a.m_localPoint;
                f = b.position.x + h.col1.x * g.x + h.col2.x * g.y;
                b = b.position.y + h.col1.y * g.x + h.col2.y * g.y;
                h = d.R;
                g = a.m_points[0].m_localPoint;
                a = d.position.x + h.col1.x * g.x + h.col2.x * g.y;
                d = d.position.y + h.col1.y * g.x + h.col2.y * g.y;
                g = a - f;
                h = d - b;
                i = g * g + h * h;
                i > Box2D.Common.b2Settings.MIN_VALUE_SQUARED ? (i = Math.sqrt(i), this.m_normal.x = g / i, this.m_normal.y = h / i) : (this.m_normal.x = 1, this.m_normal.y = 0);
                g = b + c * this.m_normal.y;
                d -= e * this.m_normal.y;
                this.m_points[0].x = 0.5 * (f + c * this.m_normal.x + (a - e * this.m_normal.x));
                this.m_points[0].y = 0.5 * (g + d);
                break;
            case Box2D.Collision.b2Manifold.e_faceA:
                h = b.R;
                g = a.m_localPlaneNormal;
                i = h.col1.x * g.x + h.col2.x * g.y;
                j = h.col1.y * g.x + h.col2.y * g.y;
                h = b.R;
                g = a.m_localPoint;
                k = b.position.x + h.col1.x * g.x + h.col2.x * g.y;
                l = b.position.y + h.col1.y * g.x + h.col2.y * g.y;
                this.m_normal.x = i;
                this.m_normal.y = j;
                for (f = 0; f < a.m_pointCount; f++)
                {
                    h = d.R, g = a.m_points[f].m_localPoint, n = d.position.x + h.col1.x * g.x + h.col2.x * g.y, g = d.position.y + h.col1.y * g.x + h.col2.y * g.y, this.m_points[f].x = n + 0.5 * (c - (n - k) * i - (g - l) * j - e) * i, this.m_points[f].y = g + 0.5 * (c - (n - k) * i - (g - l) * j - e) * j
                }
                break;
            case Box2D.Collision.b2Manifold.e_faceB:
                h = d.R;
                g = a.m_localPlaneNormal;
                i = h.col1.x * g.x + h.col2.x * g.y;
                j = h.col1.y * g.x + h.col2.y * g.y;
                h = d.R;
                g = a.m_localPoint;
                k = d.position.x + h.col1.x * g.x + h.col2.x * g.y;
                l = d.position.y + h.col1.y * g.x + h.col2.y * g.y;
                this.m_normal.x = -i;
                this.m_normal.y = -j;
                for (f = 0; f < a.m_pointCount; f++)
                {
                    h = b.R, g = a.m_points[f].m_localPoint, n = b.position.x + h.col1.x * g.x + h.col2.x * g.y, g = b.position.y + h.col1.y * g.x + h.col2.y * g.y, this.m_points[f].x = n + 0.5 * (e - (n - k) * i - (g - l) * j - c) * i, this.m_points[f].y = g + 0.5 * (e - (n - k) * i - (g - l) * j - c) * j
                }
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver = function ()
{
    this.m_constraints = []
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.Initialize = function (a, b, c)
{
    for (this.m_constraintCount = c; this.m_constraints.length < this.m_constraintCount;)
    {
        this.m_constraints[this.m_constraints.length] = new Box2D.Dynamics.Contacts.b2ContactConstraint
    }
    for (a = 0; a < c; a++)
    {
        var d = b[a], e = d.m_fixtureA, f = d.m_fixtureB, g = e.m_shape.m_radius, h = f.m_shape.m_radius, i = e.GetBody(), j = f.GetBody(), k = d.GetManifold(), l = Box2D.Common.b2Settings.b2MixFriction(e.GetFriction(), f.GetFriction()), n = Box2D.Common.b2Settings.b2MixRestitution(e.GetRestitution(), f.GetRestitution()), m = i.m_linearVelocity.x, o = i.m_linearVelocity.y, p = j.m_linearVelocity.x, q = j.m_linearVelocity.y, r = i.m_angularVelocity, x = j.m_angularVelocity;
        Box2D.Common.b2Settings.b2Assert(0 < k.m_pointCount);
        Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.Initialize(k, i.m_xf, g, j.m_xf, h);
        f = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.x;
        d = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_normal.y;
        e = this.m_constraints[a];
        e.bodyA = i;
        e.bodyB = j;
        e.manifold = k;
        e.normal.x = f;
        e.normal.y = d;
        e.pointCount = k.m_pointCount;
        e.friction = l;
        e.restitution = n;
        e.localPlaneNormal.x = k.m_localPlaneNormal.x;
        e.localPlaneNormal.y = k.m_localPlaneNormal.y;
        e.localPoint.x = k.m_localPoint.x;
        e.localPoint.y = k.m_localPoint.y;
        e.radius = g + h;
        e.type = k.m_type;
        for (g = 0; g < e.pointCount; ++g)
        {
            l = k.m_points[g];
            h = e.points[g];
            h.normalImpulse = l.m_normalImpulse;
            h.tangentImpulse = l.m_tangentImpulse;
            h.localPoint.SetV(l.m_localPoint);
            var l = h.rA.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].x - i.m_sweep.c.x, n = h.rA.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].y - i.m_sweep.c.y, v = h.rB.x = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].x - j.m_sweep.c.x, w = h.rB.y = Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold.m_points[g].y - j.m_sweep.c.y, t = l * d - n * f, s = v * d - w * f, t = t * t, s = s * s;
            h.normalMass = 1 / (i.m_invMass + j.m_invMass + i.m_invI * t + j.m_invI * s);
            var u = i.m_mass * i.m_invMass + j.m_mass * j.m_invMass, u = u + (i.m_mass * i.m_invI * t + j.m_mass * j.m_invI * s);
            h.equalizedMass = 1 / u;
            s = d;
            u = -f;
            t = l * u - n * s;
            s = v * u - w * s;
            t *= t;
            s *= s;
            h.tangentMass = 1 / (i.m_invMass + j.m_invMass + i.m_invI * t + j.m_invI * s);
            h.velocityBias = 0;
            l = e.normal.x * (p + -x * w - m - -r * n) + e.normal.y * (q + x * v - o - r * l);
            l < -Box2D.Common.b2Settings.b2_velocityThreshold && (h.velocityBias += -e.restitution * l)
        }
        2 == e.pointCount && (q = e.points[0], p = e.points[1], k = i.m_invMass, i = i.m_invI, m = j.m_invMass, j = j.m_invI, o = q.rA.x * d - q.rA.y * f, q = q.rB.x * d - q.rB.y * f, r = p.rA.x * d - p.rA.y * f, p = p.rB.x * d - p.rB.y * f, f = k + m + i * o * o + j * q * q, d = k + m + i * r * r + j * p * p, j = k + m + i * o * r + j * q * p, f * f < 100 * (f * d - j * j) ? (e.K.col1.Set(f, j), e.K.col2.Set(j, d), e.K.GetInverse(e.normalMass)) : e.pointCount = 1)
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.InitVelocityConstraints = function (a)
{
    for (var b = 0; b < this.m_constraintCount; ++b)
    {
        var c = this.m_constraints[b], d = c.bodyA, e = c.bodyB, f = d.m_invMass, g = d.m_invI, h = e.m_invMass, i = e.m_invI, j = c.normal.x, k = c.normal.y, l = k, n = -j, m = 0, o = 0;
        if (a.warmStarting)
        {
            o = c.pointCount;
            for (m = 0; m < o; ++m)
            {
                var p = c.points[m];
                p.normalImpulse *= a.dtRatio;
                p.tangentImpulse *= a.dtRatio;
                var q = p.normalImpulse * j + p.tangentImpulse * l, r = p.normalImpulse * k + p.tangentImpulse * n;
                d.m_angularVelocity -= g * (p.rA.x * r - p.rA.y * q);
                d.m_linearVelocity.x -= f * q;
                d.m_linearVelocity.y -= f * r;
                e.m_angularVelocity += i * (p.rB.x * r - p.rB.y * q);
                e.m_linearVelocity.x += h * q;
                e.m_linearVelocity.y += h * r
            }
        } else
        {
            o = c.pointCount;
            for (m = 0; m < o; ++m)
            {
                d = c.points[m], d.normalImpulse = 0, d.tangentImpulse = 0
            }
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints = function ()
{
    for (var a = 0; a < this.m_constraintCount; a++)
    {
        this.SolveVelocityConstraints_Constraint(this.m_constraints[a])
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_Constraint = function (a)
{
    for (var b = a.normal.x, c = a.normal.y, d = 0; d < a.pointCount; d++)
    {
        Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint(a, a.points[d])
    }
    if (1 == a.pointCount)
    {
        var d = a.points[0], e = d.normalImpulse - d.normalMass * ((a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * d.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * d.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * d.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * d.rA.x) * c - d.velocityBias), e = 0 < e ? e : 0, f = e - d.normalImpulse, g = f * b, c = f * c;
        a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * g;
        a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * c;
        a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (d.rA.x * c - d.rA.y * g);
        a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * g;
        a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * c;
        a.bodyB.m_angularVelocity += a.bodyB.m_invI * (d.rB.x * c - d.rB.y * g);
        d.normalImpulse = e
    } else
    {
        for (var d = a.points[0], e = a.points[1], f = d.normalImpulse, g = e.normalImpulse, h = (a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * d.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * d.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * d.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * d.rA.x) * c - d.velocityBias, c = (a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * e.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity *
            e.rA.y) * b + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * e.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * e.rA.x) * c - e.velocityBias, h = h - (a.K.col1.x * f + a.K.col2.x * g), c = c - (a.K.col1.y * f + a.K.col2.y * g); ;)
        {
            b = -(a.normalMass.col1.x * h + a.normalMass.col2.x * c);
            if (0 <= b)
            {
                var i = -(a.normalMass.col1.y * h + a.normalMass.col2.y * c);
                if (0 <= i)
                {
                    this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, b - f, i - g);
                    d.normalImpulse = b;
                    e.normalImpulse = i;
                    break
                }
            }
            b = -d.normalMass * h;
            if (0 <= b && 0 <= a.K.col1.y * b + c)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, b - f, -g);
                d.normalImpulse = b;
                e.normalImpulse = 0;
                break
            }
            b = -e.normalMass * c;
            if (0 <= b && 0 <= a.K.col2.x * b + h)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, -f, b - g);
                d.normalImpulse = 0;
                e.normalImpulse = b;
                break
            }
            if (0 <= h && 0 <= c)
            {
                this.SolveVelocityConstraints_ConstraintPointUpdate(a, d, e, -f, -g);
                d.normalImpulse = 0;
                e.normalImpulse = 0;
                break
            }
            break
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPoint = function (a, b)
{
    var c = a.normal.y, d = -a.normal.x, e = a.friction * b.normalImpulse, e = Box2D.Common.Math.b2Math.Clamp(b.tangentImpulse - b.tangentMass * ((a.bodyB.m_linearVelocity.x - a.bodyB.m_angularVelocity * b.rB.y - a.bodyA.m_linearVelocity.x + a.bodyA.m_angularVelocity * b.rA.y) * c + (a.bodyB.m_linearVelocity.y + a.bodyB.m_angularVelocity * b.rB.x - a.bodyA.m_linearVelocity.y - a.bodyA.m_angularVelocity * b.rA.x) * d), -e, e), f = e - b.tangentImpulse, c = f * c, d = f * d;
    a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * c;
    a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * d;
    a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (b.rA.x * d - b.rA.y * c);
    a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * c;
    a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * d;
    a.bodyB.m_angularVelocity += a.bodyB.m_invI * (b.rB.x * d - b.rB.y * c);
    b.tangentImpulse = e
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolveVelocityConstraints_ConstraintPointUpdate = function (a, b, c, d, e)
{
    var f = d * a.normal.x, d = d * a.normal.y, g = e * a.normal.x, e = e * a.normal.y;
    a.bodyA.m_linearVelocity.x -= a.bodyA.m_invMass * (f + g);
    a.bodyA.m_linearVelocity.y -= a.bodyA.m_invMass * (d + e);
    a.bodyA.m_angularVelocity -= a.bodyA.m_invI * (b.rA.x * d - b.rA.y * f + c.rA.x * e - c.rA.y * g);
    a.bodyB.m_linearVelocity.x += a.bodyB.m_invMass * (f + g);
    a.bodyB.m_linearVelocity.y += a.bodyB.m_invMass * (d + e);
    a.bodyB.m_angularVelocity += a.bodyB.m_invI * (b.rB.x * d - b.rB.y * f + c.rB.x * e - c.rB.y * g);
    b.normalImpulse = 0;
    c.normalImpulse = 0
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.FinalizeVelocityConstraints = function ()
{
    for (var a = 0; a < this.m_constraintCount; ++a)
    {
        for (var b = this.m_constraints[a], c = b.manifold, d = 0; d < b.pointCount; ++d)
        {
            var e = c.m_points[d], f = b.points[d];
            e.m_normalImpulse = f.normalImpulse;
            e.m_tangentImpulse = f.tangentImpulse
        }
    }
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints = function (a)
{
    void 0 === a && (a = 0);
    for (var b = 0, c = 0; c < this.m_constraintCount; c++)
    {
        var d = this.m_constraints[c], e = d.bodyA, f = d.bodyB, g = e.m_mass * e.m_invMass, h = e.m_mass * e.m_invI, i = f.m_mass * f.m_invMass, j = f.m_mass * f.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(d);
        for (var k = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal, l = 0; l < d.pointCount; l++)
        {
            var n = d.points[l], m = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[l], o = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[l], p = m.x - e.m_sweep.c.x, q = m.y - e.m_sweep.c.y, r = m.x - f.m_sweep.c.x, m = m.y - f.m_sweep.c.y, b = b < o ? b : o, o = Box2D.Common.Math.b2Math.Clamp(a * (o + Box2D.Common.b2Settings.b2_linearSlop), -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0), o = -n.equalizedMass * o, n = o * k.x, o = o * k.y;
            e.m_sweep.c.x -= g * n;
            e.m_sweep.c.y -= g * o;
            e.m_sweep.a -= h * (p * o - q * n);
            e.SynchronizeTransform();
            f.m_sweep.c.x += i * n;
            f.m_sweep.c.y += i * o;
            f.m_sweep.a += j * (r * o - m * n);
            f.SynchronizeTransform()
        }
    }
    return b > -1.5 * Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Contacts.b2ContactSolver.prototype.SolvePositionConstraints_NEW = function (a)
{
    void 0 === a && (a = 0);
    for (var b = 0, c = 0; c < this.m_constraintCount; c++)
    {
        var d = this.m_constraints[c], e = d.bodyA, f = d.bodyB, g = e.m_mass * e.m_invMass, h = e.m_mass * e.m_invI, i = f.m_mass * f.m_invMass, j = f.m_mass * f.m_invI;
        Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.Initialize(d);
        for (var k = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_normal, l = 0; l < d.pointCount; l++)
        {
            var n = d.points[l], m = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_points[l], o = Box2D.Dynamics.Contacts.b2ContactSolver.s_psm.m_separations[l], p = m.x - e.m_sweep.c.x, q = m.y - e.m_sweep.c.y, r = m.x - f.m_sweep.c.x, m = m.y - f.m_sweep.c.y;
            o < b && (b = o);
            0 != a && Box2D.Common.Math.b2Math.Clamp(a * (o + Box2D.Common.b2Settings.b2_linearSlop), -Box2D.Common.b2Settings.b2_maxLinearCorrection, 0);
            o = 0 * -n.equalizedMass;
            n = o * k.x;
            o *= k.y;
            e.m_sweep.c.x -= g * n;
            e.m_sweep.c.y -= g * o;
            e.m_sweep.a -= h * (p * o - q * n);
            e.SynchronizeTransform();
            f.m_sweep.c.x += i * n;
            f.m_sweep.c.y += i * o;
            f.m_sweep.a += j * (r * o - m * n);
            f.SynchronizeTransform()
        }
    }
    return b > -1.5 * Box2D.Common.b2Settings.b2_linearSlop
};
Box2D.Dynamics.Contacts.b2ContactSolver.s_worldManifold = new Box2D.Collision.b2WorldManifold;
Box2D.Dynamics.Contacts.b2ContactSolver.s_psm = new Box2D.Dynamics.Contacts.b2PositionSolverManifold;
Box2D.Dynamics.Controllers.b2ControllerListNode = function (a)
{
    this.controller = a;
    this.previous = this.next = null
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetNextNode = function (a)
{
    this.next = a
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.SetPreviousNode = function (a)
{
    this.previous = a
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetNextNode = function ()
{
    return this.next
};
Box2D.Dynamics.Controllers.b2ControllerListNode.prototype.GetPreviousNode = function ()
{
    return this.previous
};
Box2D.Dynamics.Controllers.b2ControllerList = function ()
{
    this.controllerLastNode = this.controllerFirstNode = null;
    this.controllerNodeLookup = {};
    this.controllerCount = 0
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetFirstNode = function ()
{
    return this.controllerFirstNode
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.AddController = function (a)
{
    var b = a.ID;
    if (null == this.controllerNodeLookup[b])
    {
        var a = new Box2D.Dynamics.Controllers.b2ControllerListNode(a), c = this.controllerLastNode;
        null != c ? c.SetNextNode(a) : this.controllerFirstNode = a;
        a.SetPreviousNode(c);
        this.controllerLastNode = a;
        this.controllerNodeLookup[b] = a;
        this.controllerCount++
    }
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.RemoveController = function (a)
{
    var a = a.ID, b = this.controllerNodeLookup[a];
    if (null != b)
    {
        var c = b.GetPreviousNode(), b = b.GetNextNode();
        null == c ? this.controllerFirstNode = b : c.SetNextNode(b);
        null == b ? this.controllerLastNode = c : b.SetPreviousNode(c);
        delete this.controllerNodeLookup[a];
        this.controllerCount--
    }
};
Box2D.Dynamics.Controllers.b2ControllerList.prototype.GetControllerCount = function ()
{
    return this.controllerCount
};
Box2D.Dynamics.b2FixtureDef = function ()
{

    this.filter = new Box2D.Dynamics.b2FilterData;
    this.filter.categoryBits = 1;
    this.filter.maskBits = 65535;
    this.filter.groupIndex = 0;
    this.shape = null;
    this.friction = 0.2;
    this.density = this.restitution = 0;
    this.isSensor = !1
};
Box2D.Dynamics.b2Body = function (a, b)
{

    this.ID = "Body" + Box2D.Dynamics.b2Body.NEXT_ID++;
    this.m_xf = new Box2D.Common.Math.b2Transform;
    this.m_xf.position.SetV(a.position);
    this.m_xf.R.Set(a.angle);
    this.m_sweep = new Box2D.Common.Math.b2Sweep;
    this.m_sweep.localCenter.SetZero();
    this.m_sweep.t0 = 1;
    this.m_sweep.a0 = this.m_sweep.a = a.angle;
    this.m_sweep.c.x = this.m_xf.R.col1.x * this.m_sweep.localCenter.x + this.m_xf.R.col2.x * this.m_sweep.localCenter.y;
    this.m_sweep.c.y = this.m_xf.R.col1.y * this.m_sweep.localCenter.x + this.m_xf.R.col2.y * this.m_sweep.localCenter.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_linearVelocity = a.linearVelocity.Copy();
    this.m_force = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.m_bullet = a.bullet;
    this.m_fixedRotation = a.fixedRotation;
    this.m_allowSleep = a.allowSleep;
    this.m_awake = a.awake;
    this.m_active = a.active;
    this.m_world = b;
    this.m_userData = null;
    this.m_jointList = null;
    this.contactList = new Box2D.Dynamics.Contacts.b2ContactList;
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList;
    this.m_controllerCount = 0;
    this.m_angularVelocity = a.angularVelocity;
    this.m_linearDamping = a.linearDamping;
    this.m_angularDamping = a.angularDamping;
    this.m_sleepTime = this.m_torque = 0;
    this.m_type = a.type;
    this.m_mass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    this.m_invMass = this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody ? 1 : 0;
    this.m_invI = this.m_I = 0;
    this.m_inertiaScale = a.inertiaScale;
    this.fixtureList = new Box2D.Dynamics.b2FixtureList;
    this.m_lists = []
};
Box2D.Dynamics.b2Body.prototype.CreateFixture = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    a = new Box2D.Dynamics.b2Fixture(this, this.m_xf, a);
    this.m_active && a.CreateProxy(this.m_world.m_contactManager.m_broadPhase, this.m_xf);
    this.fixtureList.AddFixture(a);
    a.m_body = this;
    0 < a.m_density && this.ResetMassData();
    this.m_world.m_newFixture = !0;
    return a
};
Box2D.Dynamics.b2Body.prototype.CreateFixture2 = function (a, b)
{
    var c = new Box2D.Dynamics.b2FixtureDef;
    c.shape = a;
    c.density = b;
    return this.CreateFixture(c)
};
Box2D.Dynamics.b2Body.prototype.Destroy = function ()
{
    Box2D.Common.Math.b2Vec2.Free(this.m_linearVelocity);
    Box2D.Common.Math.b2Vec2.Free(this.m_force)
};
Box2D.Dynamics.b2Body.prototype.DestroyFixture = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.fixtureList.RemoveFixture(a);
    for (var b = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); b; b = b.GetNextNode())
    {
        (a == b.contact.GetFixtureA() || a == b.contact.GetFixtureB()) && this.m_world.m_contactManager.Destroy(b.contact)
    }
    this.m_active && a.DestroyProxy(this.m_world.m_contactManager.m_broadPhase);
    a.Destroy();
    this.ResetMassData()
};
Box2D.Dynamics.b2Body.prototype.SetPositionAndAngle = function (a, b)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    this.m_xf.R.Set(b);
    this.m_xf.position.SetV(a);
    var c = this.m_xf.R, d = this.m_sweep.localCenter;
    this.m_sweep.c.x = c.col1.x * d.x + c.col2.x * d.y;
    this.m_sweep.c.y = c.col1.y * d.x + c.col2.y * d.y;
    this.m_sweep.c.x += this.m_xf.position.x;
    this.m_sweep.c.y += this.m_xf.position.y;
    this.m_sweep.c0.SetV(this.m_sweep.c);
    this.m_sweep.a0 = this.m_sweep.a = b;
    c = this.m_world.m_contactManager.m_broadPhase;
    for (d = this.fixtureList.GetFirstNode(); d; d = d.GetNextNode())
    {
        d.fixture.Synchronize(c, this.m_xf, this.m_xf)
    }
    this.m_world.m_contactManager.FindNewContacts()
};
Box2D.Dynamics.b2Body.prototype.SetTransform = function (a)
{
    this.SetPositionAndAngle(a.position, a.GetAngle())
};
Box2D.Dynamics.b2Body.prototype.GetTransform = function ()
{
    return this.m_xf
};
Box2D.Dynamics.b2Body.prototype.GetPosition = function ()
{
    return this.m_xf.position
};
Box2D.Dynamics.b2Body.prototype.SetPosition = function (a)
{
    this.SetPositionAndAngle(a, this.GetAngle())
};
Box2D.Dynamics.b2Body.prototype.GetAngle = function ()
{
    return this.m_sweep.a
};
Box2D.Dynamics.b2Body.prototype.SetAngle = function (a)
{
    this.SetPositionAndAngle(this.GetPosition(), a)
};
Box2D.Dynamics.b2Body.prototype.GetWorldCenter = function ()
{
    return this.m_sweep.c
};
Box2D.Dynamics.b2Body.prototype.GetUserData = function ()
{
    return this.m_userData;
};
Box2D.Dynamics.b2Body.prototype.SetUserData = function (data)
{
    this.m_userData = data;
};
Box2D.Dynamics.b2Body.prototype.GetLocalCenter = function ()
{
    return this.m_sweep.localCenter
};
Box2D.Dynamics.b2Body.prototype.SetLinearVelocity = function (a)
{
    this.m_type != Box2D.Dynamics.b2BodyDef.b2_staticBody && this.m_linearVelocity.SetV(a)
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function ()
{
    return this.m_linearVelocity
};
Box2D.Dynamics.b2Body.prototype.SetAngularVelocity = function (a)
{
    this.m_type != Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_angularVelocity = a)
};
Box2D.Dynamics.b2Body.prototype.GetAngularVelocity = function ()
{
    return this.m_angularVelocity
};
Box2D.Dynamics.b2Body.prototype.GetDefinition = function ()
{
    var a = new Box2D.Dynamics.b2BodyDef;
    a.type = this.GetType();
    a.allowSleep = this.m_allowSleep;
    a.angle = this.GetAngle();
    a.angularDamping = this.m_angularDamping;
    a.angularVelocity = this.m_angularVelocity;
    a.fixedRotation = this.m_fixedRotation;
    a.bullet = this.m_bullet;
    a.active = this.m_active;
    a.awake = this.m_awake;
    a.linearDamping = this.m_linearDamping;
    a.linearVelocity.SetV(this.GetLinearVelocity());
    a.position.SetV(this.GetPosition());
    return a
};
Box2D.Dynamics.b2Body.prototype.ApplyForce = function (a, b)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_force.x += a.x, this.m_force.y += a.y, this.m_torque += (b.x - this.m_sweep.c.x) * a.y - (b.y - this.m_sweep.c.y) * a.x)
};
Box2D.Dynamics.b2Body.prototype.ApplyTorque = function (a)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_torque += a)
};
Box2D.Dynamics.b2Body.prototype.ApplyImpulse = function (a, b)
{
    this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (this.SetAwake(!0), this.m_linearVelocity.x += this.m_invMass * a.x, this.m_linearVelocity.y += this.m_invMass * a.y, this.m_angularVelocity += this.m_invI * ((b.x - this.m_sweep.c.x) * a.y - (b.y - this.m_sweep.c.y) * a.x))
};
Box2D.Dynamics.b2Body.prototype.Split = function (a)
{
    for (var b = this.GetLinearVelocity().Copy(), c = this.GetAngularVelocity(), d = this.GetWorldCenter(), e = this.m_world.CreateBody(this.GetDefinition()), f = this.fixtureList.GetFirstNode(); f; f = f.GetNextNode())
    {
        var g = f.fixture;
        a(g) && (this.fixtureList.RemoveFixture(g), e.fixtureList.AddFixture(g))
    }
    this.ResetMassData();
    e.ResetMassData();
    f = this.GetWorldCenter();
    a = e.GetWorldCenter();
    g = Box2D.Common.Math.b2Math.SubtractVV(f, d);
    f = Box2D.Common.Math.b2Math.CrossFV(c, g);
    Box2D.Common.Math.b2Vec2.Free(g);
    g = Box2D.Common.Math.b2Math.AddVV(b, f);
    Box2D.Common.Math.b2Vec2.Free(f);
    this.SetLinearVelocity(g);
    Box2D.Common.Math.b2Vec2.Free(g);
    a = Box2D.Common.Math.b2Math.SubtractVV(a, d);
    d = Box2D.Common.Math.b2Math.CrossFV(c, a);
    Box2D.Common.Math.b2Vec2.Free(a);
    a = Box2D.Common.Math.b2Math.AddVV(b, d);
    Box2D.Common.Math.b2Vec2.Free(d);
    e.SetLinearVelocity(a);
    Box2D.Common.Math.b2Vec2.Free(a);
    Box2D.Common.Math.b2Vec2.Free(b);
    this.SetAngularVelocity(c);
    e.SetAngularVelocity(c);
    this.SynchronizeFixtures();
    e.SynchronizeFixtures();
    return e
};
Box2D.Dynamics.b2Body.prototype.Merge = function (a)
{
    for (var b = a.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
    {
        this.fixtureList.AddFixture(b.fixture), a.fixtureList.RemoveFixture(b.fixture)
    }
    a.ResetMassData();
    this.ResetMassData();
    this.SynchronizeFixtures()
};
Box2D.Dynamics.b2Body.prototype.GetMass = function ()
{
    return this.m_mass
};
Box2D.Dynamics.b2Body.prototype.GetInertia = function ()
{
    return this.m_I
};
Box2D.Dynamics.b2Body.prototype.GetMassData = function (a)
{
    a || (a = Box2D.Collision.Shapes.b2MassData.Get());
    a.mass = this.m_mass;
    a.I = this.m_I;
    a.center.SetV(this.m_sweep.localCenter);
    return a
};
Box2D.Dynamics.b2Body.prototype.SetMassData = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.m_world.IsLocked());
    if (this.m_type == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
    {
        this.m_invI = this.m_I = this.m_invMass = 0;
        this.m_mass = a.mass;
        0 >= this.m_mass && (this.m_mass = 1);
        this.m_invMass = 1 / this.m_mass;
        0 < a.I && !this.m_fixedRotation && (this.m_I = a.I - this.m_mass * (a.center.x * a.center.x + a.center.y * a.center.y), this.m_invI = 1 / this.m_I);
        var b = this.m_sweep.c.Copy();
        this.m_sweep.localCenter.SetV(a.center);
        this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
        this.m_sweep.c.SetV(this.m_sweep.c0);
        this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - b.y);
        this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - b.x);
        Box2D.Common.Math.b2Vec2.Free(b)
    }
};
Box2D.Dynamics.b2Body.prototype.ResetMassData = function ()
{
    this.m_invI = this.m_I = this.m_invMass = this.m_mass = 0;
    this.m_sweep.localCenter.SetZero();
    if (!(this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody || this.m_type == Box2D.Dynamics.b2BodyDef.b2_kinematicBody))
    {
        for (var a = Box2D.Common.Math.b2Vec2.Get(0, 0), b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
        {
            var c = b.fixture;
            0 != c.m_density && (c = c.GetMassData(), this.m_mass += c.mass, a.x += c.center.x * c.mass, a.y += c.center.y * c.mass, this.m_I += c.I)
        }
        0 < this.m_mass ? (this.m_invMass = 1 / this.m_mass, a.x *= this.m_invMass, a.y *= this.m_invMass) : this.m_invMass = this.m_mass = 1;
        0 < this.m_I && !this.m_fixedRotation ? (this.m_I -= this.m_mass * (a.x * a.x + a.y * a.y), this.m_I *= this.m_inertiaScale, Box2D.Common.b2Settings.b2Assert(0 < this.m_I), this.m_invI = 1 / this.m_I) : this.m_invI = this.m_I = 0;
        b = this.m_sweep.c.Copy();
        this.m_sweep.localCenter.SetV(a);
        this.m_sweep.c0.SetV(Box2D.Common.Math.b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
        this.m_sweep.c.SetV(this.m_sweep.c0);
        this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - b.y);
        this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - b.x);
        Box2D.Common.Math.b2Vec2.Free(a);
        Box2D.Common.Math.b2Vec2.Free(b)
    }
};
Box2D.Dynamics.b2Body.prototype.GetWorldPoint = function (a)
{
    var b = this.m_xf.R, a = Box2D.Common.Math.b2Vec2.Get(b.col1.x * a.x + b.col2.x * a.y, b.col1.y * a.x + b.col2.y * a.y);
    a.x += this.m_xf.position.x;
    a.y += this.m_xf.position.y;
    return a
};
Box2D.Dynamics.b2Body.prototype.GetWorldVector = function (a)
{
    return Box2D.Common.Math.b2Math.MulMV(this.m_xf.R, a)
};
Box2D.Dynamics.b2Body.prototype.GetLocalPoint = function (a)
{
    return Box2D.Common.Math.b2Math.MulXT(this.m_xf, a)
};
Box2D.Dynamics.b2Body.prototype.GetLocalVector = function (a)
{
    return Box2D.Common.Math.b2Math.MulTMV(this.m_xf.R, a)
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromWorldPoint = function (a)
{
    return Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (a.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (a.x - this.m_sweep.c.x))
};
Box2D.Dynamics.b2Body.prototype.GetLinearVelocityFromLocalPoint = function (a)
{
    var b = this.m_xf.R, a = Box2D.Common.Math.b2Vec2.Get(b.col1.x * a.x + b.col2.x * a.y, b.col1.y * a.x + b.col2.y * a.y);
    a.x += this.m_xf.position.x;
    a.y += this.m_xf.position.y;
    b = Box2D.Common.Math.b2Vec2.Get(this.m_linearVelocity.x - this.m_angularVelocity * (a.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (a.x - this.m_sweep.c.x));
    Box2D.Common.Math.b2Vec2.Free(a);
    return b
};
Box2D.Dynamics.b2Body.prototype.GetLinearDamping = function ()
{
    return this.m_linearDamping
};
Box2D.Dynamics.b2Body.prototype.SetLinearDamping = function (a)
{
    this.m_linearDamping = a
};
Box2D.Dynamics.b2Body.prototype.GetAngularDamping = function ()
{
    return this.m_angularDamping
};
Box2D.Dynamics.b2Body.prototype.SetAngularDamping = function (a)
{
    this.m_angularDamping = a
};
Box2D.Dynamics.b2Body.prototype.SetType = function (a)
{
    if (this.m_type != a)
    {
        this.m_type = a;
        this.ResetMassData();
        this.m_type == Box2D.Dynamics.b2BodyDef.b2_staticBody && (this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0);
        this.SetAwake(!0);
        this.m_force.SetZero();
        this.m_torque = 0;
        for (a = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.FlagForFiltering()
        }
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.GetType = function ()
{
    return this.m_type
};
Box2D.Dynamics.b2Body.prototype.SetBullet = function (a)
{
    this.m_bullet = a
};
Box2D.Dynamics.b2Body.prototype.IsBullet = function ()
{
    return this.m_bullet
};
Box2D.Dynamics.b2Body.prototype.SetSleepingAllowed = function (a)
{
    (this.m_allowSleep = a) || this.SetAwake(!0)
};
Box2D.Dynamics.b2Body.prototype.SetAwake = function (a)
{
    if (this.m_awake != a)
    {
        this.m_awake = a;
        this.m_sleepTime = 0;
        a || (this.m_linearVelocity.SetZero(), this.m_angularVelocity = 0, this.m_force.SetZero(), this.m_torque = 0);
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.IsAwake = function ()
{
    return this.m_awake
};
Box2D.Dynamics.b2Body.prototype.SetFixedRotation = function (a)
{
    this.m_fixedRotation = a;
    this.ResetMassData()
};
Box2D.Dynamics.b2Body.prototype.IsFixedRotation = function ()
{
    return this.m_fixedRotation
};
Box2D.Dynamics.b2Body.prototype.SetActive = function (a)
{
    if (a != this.m_active)
    {
        if (a)
        {
            this.m_active = !0;
            for (var a = this.m_world.m_contactManager.m_broadPhase, b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
            {
                b.fixture.CreateProxy(a, this.m_xf)
            }
        } else
        {
            this.m_active = !1;
            a = this.m_world.m_contactManager.m_broadPhase;
            for (b = this.fixtureList.GetFirstNode(); b; b = b.GetNextNode())
            {
                b.fixture.DestroyProxy(a)
            }
            for (a = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
            {
                this.m_world.m_contactManager.Destroy(a.contact)
            }
        }
        for (a = 0; a < this.m_lists.length; a++)
        {
            this.m_lists[a].UpdateBody(this)
        }
    }
};
Box2D.Dynamics.b2Body.prototype.IsActive = function ()
{
    return this.m_active
};
Box2D.Dynamics.b2Body.prototype.IsSleepingAllowed = function ()
{
    return this.m_allowSleep
};
Box2D.Dynamics.b2Body.prototype.GetFixtureList = function ()
{
    return this.fixtureList
};
Box2D.Dynamics.b2Body.prototype.GetJointList = function ()
{
    return this.m_jointList
};
Box2D.Dynamics.b2Body.prototype.GetControllerList = function ()
{
    return this.controllerList
};
Box2D.Dynamics.b2Body.prototype.AddController = function (a)
{
    this.controllerList.AddController(a)
};
Box2D.Dynamics.b2Body.prototype.RemoveController = function (a)
{
    this.controllerList.RemoveController(a)
};
Box2D.Dynamics.b2Body.prototype.GetContactList = function ()
{
    return this.contactList
};
Box2D.Dynamics.b2Body.prototype.GetWorld = function ()
{
    return this.m_world
};
Box2D.Dynamics.b2Body.prototype.SynchronizeFixtures = function ()
{
    var a = Box2D.Dynamics.b2Body.s_xf1;
    a.R.Set(this.m_sweep.a0);
    var b = a.R, c = this.m_sweep.localCenter;
    a.position.x = this.m_sweep.c0.x - (b.col1.x * c.x + b.col2.x * c.y);
    a.position.y = this.m_sweep.c0.y - (b.col1.y * c.x + b.col2.y * c.y);
    b = this.m_world.m_contactManager.m_broadPhase;
    for (c = this.fixtureList.GetFirstNode(); c; c = c.GetNextNode())
    {
        c.fixture.Synchronize(b, a, this.m_xf)
    }
};
Box2D.Dynamics.b2Body.prototype.SynchronizeTransform = function ()
{
    this.m_xf.R.Set(this.m_sweep.a);
    var a = this.m_xf.R, b = this.m_sweep.localCenter;
    this.m_xf.position.x = this.m_sweep.c.x - (a.col1.x * b.x + a.col2.x * b.y);
    this.m_xf.position.y = this.m_sweep.c.y - (a.col1.y * b.x + a.col2.y * b.y)
};
Box2D.Dynamics.b2Body.prototype.ShouldCollide = function (a)
{
    if (this.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && a.m_type != Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
    {
        return!1
    }
    for (var b = this.m_jointList; b; b = b.next)
    {
        if (b.other == a && !1 == b.joint.m_collideConnected)
        {
            return!1
        }
    }
    return!0
};
Box2D.Dynamics.b2Body.prototype.Advance = function (a)
{
    this.m_sweep.Advance(a);
    this.m_sweep.c.SetV(this.m_sweep.c0);
    this.m_sweep.a = this.m_sweep.a0;
    this.SynchronizeTransform()
};
Box2D.Dynamics.b2Body.NEXT_ID = 0;
Box2D.Dynamics.b2Body.s_xf1 = new Box2D.Common.Math.b2Transform;
Box2D.Dynamics.b2World = function (a, b)
{
    this.m_contactManager = new Box2D.Dynamics.b2ContactManager(this);
    this.m_contactSolver = new Box2D.Dynamics.Contacts.b2ContactSolver;
    this.m_newFixture = this.m_isLocked = !1;
    this.m_debugDraw = this.m_destructionListener = null;
    this.bodyList = new Box2D.Dynamics.b2BodyList;
    this.contactList = new Box2D.Dynamics.Contacts.b2ContactList;
    this.m_jointList = null;
    this.controllerList = new Box2D.Dynamics.Controllers.b2ControllerList;
    this.m_jointCount = 0;
    this.m_continuousPhysics = this.m_warmStarting = !0;
    this.m_allowSleep = b;
    this.m_gravity = a;
    this.m_inv_dt0 = 0;
    this.m_groundBody = this.CreateBody(new Box2D.Dynamics.b2BodyDef);
    this.mainTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
    this.islandTimeStep = new Box2D.Dynamics.b2TimeStep(0, 0, 0, 0, this.m_warmStarting);
    this.island = new Box2D.Dynamics.b2Island(this.m_contactManager.m_contactListener, this.m_contactSolver)
};
Box2D.Dynamics.b2World.MAX_TOI = 1 - 100 * Number.MIN_VALUE;
Box2D.Dynamics.b2World.prototype.SetDestructionListener = function (a)
{
    this.m_destructionListener = a
};
Box2D.Dynamics.b2World.prototype.SetContactFilter = function (a)
{
    this.m_contactManager.m_contactFilter = a
};
Box2D.Dynamics.b2World.prototype.SetContactListener = function (a)
{
    this.m_contactManager.m_contactListener = a
};
Box2D.Dynamics.b2World.prototype.SetDebugDraw = function (a)
{
    this.m_debugDraw = a
};
Box2D.Dynamics.b2World.prototype.SetBroadPhase = function (a)
{
    var b = this.m_contactManager.m_broadPhase;
    this.m_contactManager.m_broadPhase = a;
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        for (var d = c.body.GetFixtureList().GetFirstNode(); d; d = d.GetNextNode())
        {
            var e = d.fixture;
            e.m_proxy = a.CreateProxy(b.GetFatAABB(e.m_proxy), e)
        }
    }
};
Box2D.Dynamics.b2World.prototype.GetProxyCount = function ()
{
    return this.m_contactManager.m_broadPhase.GetProxyCount()
};
Box2D.Dynamics.b2World.prototype.CreateBody = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    a = new Box2D.Dynamics.b2Body(a, this);
    this.bodyList.AddBody(a);
    return a
};
Box2D.Dynamics.b2World.prototype.DestroyBody = function (a)
{
    Box2D.Common.b2Settings.b2Assert(!this.IsLocked());
    for (var b = a.m_jointList; b;)
    {
        var c = b, b = b.next;
        this.m_destructionListener && this.m_destructionListener.SayGoodbyeJoint(c.joint);
        this.DestroyJoint(c.joint)
    }
    for (b = a.GetControllerList().GetFirstNode(); b; b = b.GetNextNode())
    {
        b.controller.RemoveBody(a)
    }
    for (b = a.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); b; b = b.GetNextNode())
    {
        this.m_contactManager.Destroy(b.contact)
    }
    for (b = a.GetFixtureList().GetFirstNode(); b; b = b.GetNextNode())
    {
        this.m_destructionListener && this.m_destructionListener.SayGoodbyeFixture(b.fixture), a.DestroyFixture(b.fixture)
    }
    a.Destroy();
    this.bodyList.RemoveBody(a)
};
Box2D.Dynamics.b2World.prototype.CreateJoint = function (a)
{
    var b = Box2D.Dynamics.Joints.b2Joint.Create(a);
    b.m_prev = null;
    if (b.m_next = this.m_jointList)
    {
        this.m_jointList.m_prev = b
    }
    this.m_jointList = b;
    this.m_jointCount++;
    b.m_edgeA.joint = b;
    b.m_edgeA.other = b.m_bodyB;
    b.m_edgeA.prev = null;
    if (b.m_edgeA.next = b.m_bodyA.m_jointList)
    {
        b.m_bodyA.m_jointList.prev = b.m_edgeA
    }
    b.m_bodyA.m_jointList = b.m_edgeA;
    b.m_edgeB.joint = b;
    b.m_edgeB.other = b.m_bodyA;
    b.m_edgeB.prev = null;
    if (b.m_edgeB.next = b.m_bodyB.m_jointList)
    {
        b.m_bodyB.m_jointList.prev = b.m_edgeB
    }
    b.m_bodyB.m_jointList = b.m_edgeB;
    var c = a.bodyA, d = a.bodyB;
    if (!a.collideConnected)
    {
        for (a = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.GetOther(d) == c && a.contact.FlagForFiltering()
        }
    }
    return b
};
Box2D.Dynamics.b2World.prototype.DestroyJoint = function (a)
{
    var b = a.m_collideConnected;
    a.m_prev && (a.m_prev.m_next = a.m_next);
    a.m_next && (a.m_next.m_prev = a.m_prev);
    a == this.m_jointList && (this.m_jointList = a.m_next);
    var c = a.m_bodyA, d = a.m_bodyB;
    c.SetAwake(!0);
    d.SetAwake(!0);
    a.m_edgeA.prev && (a.m_edgeA.prev.next = a.m_edgeA.next);
    a.m_edgeA.next && (a.m_edgeA.next.prev = a.m_edgeA.prev);
    a.m_edgeA == c.m_jointList && (c.m_jointList = a.m_edgeA.next);
    a.m_edgeA.prev = null;
    a.m_edgeA.next = null;
    a.m_edgeB.prev && (a.m_edgeB.prev.next = a.m_edgeB.next);
    a.m_edgeB.next && (a.m_edgeB.next.prev = a.m_edgeB.prev);
    a.m_edgeB == d.m_jointList && (d.m_jointList = a.m_edgeB.next);
    a.m_edgeB.prev = null;
    a.m_edgeB.next = null;
    this.m_jointCount--;
    if (!b)
    {
        for (a = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); a; a = a.GetNextNode())
        {
            a.contact.GetOther(d) == c && a.contact.FlagForFiltering()
        }
    }
};
Box2D.Dynamics.b2World.prototype.GetControllerList = function ()
{
    return this.controllerList
};
Box2D.Dynamics.b2World.prototype.AddController = function (a)
{
    if (null !== a.m_world && a.m_world != this)
    {
        throw Error("Controller can only be a member of one world");
    }
    this.controllerList.AddController(a);
    a.m_world = this;
    return a
};
Box2D.Dynamics.b2World.prototype.RemoveController = function (a)
{
    this.controllerList.RemoveController(a);
    a.m_world = null;
    a.Clear()
};
Box2D.Dynamics.b2World.prototype.CreateController = function (a)
{
    return this.AddController(a)
};
Box2D.Dynamics.b2World.prototype.DestroyController = function (a)
{
    this.RemoveController(a)
};
Box2D.Dynamics.b2World.prototype.SetWarmStarting = function (a)
{
    this.m_warmStarting = a
};
Box2D.Dynamics.b2World.prototype.SetContinuousPhysics = function (a)
{
    this.m_continuousPhysics = a
};
Box2D.Dynamics.b2World.prototype.GetBodyCount = function ()
{
    return this.bodyList.GetBodyCount()
};
Box2D.Dynamics.b2World.prototype.GetJointCount = function ()
{
    return this.m_jointCount
};
Box2D.Dynamics.b2World.prototype.GetContactCount = function ()
{
    return this.contactList.GetContactCount()
};
Box2D.Dynamics.b2World.prototype.SetGravity = function (a)
{
    this.m_gravity = a
};
Box2D.Dynamics.b2World.prototype.GetGravity = function ()
{
    return this.m_gravity
};
Box2D.Dynamics.b2World.prototype.GetGroundBody = function ()
{
    return this.m_groundBody
};
Box2D.Dynamics.b2World.prototype.Step = function (a, b, c)
{
    this.m_newFixture && (this.m_contactManager.FindNewContacts(), this.m_newFixture = !1);
    this.m_isLocked = !0;
    this.mainTimeStep.Reset(a, this.m_inv_dt0 * a, b, c, this.m_warmStarting);
    this.m_contactManager.Collide();
    0 < this.mainTimeStep.dt && (this.Solve(this.mainTimeStep), this.m_continuousPhysics && this.SolveTOI(this.mainTimeStep), this.m_inv_dt0 = this.mainTimeStep.inv_dt);
    this.m_isLocked = !1
};
Box2D.Dynamics.b2World.prototype.ClearForces = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.dynamicBodies); a; a = a.GetNextNode())
    {
        a.body.m_force.SetZero(), a.body.m_torque = 0
    }
};
Box2D.Dynamics.b2World.prototype.DrawDebugData = function ()
{
    if (null !== this.m_debugDraw)
    {
        this.m_debugDraw.Clear();
        var a = this.m_debugDraw.GetFlags();
        if (a & Box2D.Dynamics.b2DebugDraw.e_shapeBit)
        {
            for (var b = Box2D.Dynamics.b2World.s_color_inactive, c = Box2D.Dynamics.b2World.s_color_static, d = Box2D.Dynamics.b2World.s_color_kinematic, e = Box2D.Dynamics.b2World.s_color_dynamic_sleeping, f = Box2D.Dynamics.b2World.s_color_dynamic_awake, g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); g; g = g.GetNextNode())
            {
                for (var h = g.body, i = h.GetFixtureList().GetFirstNode(); i; i = i.GetNextNode())
                {
                    var j = i.fixture, j = j.GetShape();
                    h.IsActive() ? h.GetType() == Box2D.Dynamics.b2BodyDef.b2_staticBody ? this.DrawShape(j, h.m_xf, c) : h.GetType() == Box2D.Dynamics.b2BodyDef.b2_kinematicBody ? this.DrawShape(j, h.m_xf, d) : h.IsAwake() ? this.DrawShape(j, h.m_xf, f) : this.DrawShape(j, h.m_xf, e) : this.DrawShape(j, h.m_xf, b)
                }
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_jointBit)
        {
            for (g = this.m_jointList; g; g = g.m_next)
            {
                this.DrawJoint(g)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_controllerBit)
        {
            for (g = this.controllerList.GetFirstNode(); g; g = g.GetNextNode())
            {
                g.controller.Draw(this.m_debugDraw)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_pairBit)
        {
            g = Box2D.Dynamics.b2World.s_pairColor;
            for (i = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); i; i = i.GetNextNode())
            {
                b = i.contact.GetFixtureA(), h = i.contact.GetFixtureB(), b = b.GetAABB().GetCenter(), h = h.GetAABB().GetCenter(), this.m_debugDraw.DrawSegment(b, h, g), Box2D.Common.Math.b2Vec2.Free(b), Box2D.Common.Math.b2Vec2.Free(h)
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_aabbBit)
        {
            b = Box2D.Dynamics.b2World.s_aabbColor;
            for (g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.activeBodies); g; g = g.GetNextNode())
            {
                h = g.body;
                for (i = h.GetFixtureList().GetFirstNode(); i; i = i.GetNextNode())
                {
                    j = i.fixture, h = this.m_contactManager.m_broadPhase.GetFatAABB(j.m_proxy), h = [Box2D.Common.Math.b2Vec2.Get(h.lowerBound.x, h.lowerBound.y), Box2D.Common.Math.b2Vec2.Get(h.upperBound.x, h.lowerBound.y), Box2D.Common.Math.b2Vec2.Get(h.upperBound.x, h.upperBound.y), Box2D.Common.Math.b2Vec2.Get(h.lowerBound.x, h.upperBound.y)], this.m_debugDraw.DrawPolygon(h, 4, b), Box2D.Common.Math.b2Vec2.Free(h[0]), Box2D.Common.Math.b2Vec2.Free(h[1]), Box2D.Common.Math.b2Vec2.Free(h[2]), Box2D.Common.Math.b2Vec2.Free(h[3])
                }
            }
        }
        if (a & Box2D.Dynamics.b2DebugDraw.e_centerOfMassBit)
        {
            for (g = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); g; g = g.GetNextNode())
            {
                h = g.body, Box2D.Dynamics.b2World.s_xf.R = h.m_xf.R, Box2D.Dynamics.b2World.s_xf.position = h.GetWorldCenter(), this.m_debugDraw.DrawTransform(Box2D.Dynamics.b2World.s_xf)
            }
        }
    }
};
Box2D.Dynamics.b2World.prototype.QueryAABB = function (a, b)
{
    this.m_contactManager.m_broadPhase.Query(a, b)
};
Box2D.Dynamics.b2World.prototype.QueryPoint = function (a, b)
{
    var c = Box2D.Collision.b2AABB.Get();
    c.lowerBound.Set(b.x - Box2D.Common.b2Settings.b2_linearSlop, b.y - Box2D.Common.b2Settings.b2_linearSlop);
    c.upperBound.Set(b.x + Box2D.Common.b2Settings.b2_linearSlop, b.y + Box2D.Common.b2Settings.b2_linearSlop);
    this.m_contactManager.m_broadPhase.Query(function (c)
    {
        return c.TestPoint(b) ? a(c) : !0
    }, c);
    Box2D.Collision.b2AABB.Free(c)
};
Box2D.Dynamics.b2World.prototype.RayCast = function (a, b, c)
{
    var d = this.m_contactManager.m_broadPhase, e = new Box2D.Collision.b2RayCastOutput, f = new Box2D.Collision.b2RayCastInput(b, c, 1);
    d.RayCast(function (d, f)
    {
        if (f.RayCast(e, d))
        {
            var i = 1 - e.fraction, i = Box2D.Common.Math.b2Vec2.Get(i * b.x + e.fraction * c.x, i * b.y + e.fraction * c.y), j = a(f, i, e.normal, e.fraction);
            Box2D.Common.Math.b2Vec2.Free(i);
            return j
        }
        return d.maxFraction
    }, f)
};
Box2D.Dynamics.b2World.prototype.RayCastOne = function (a, b)
{
    var c = null;
    this.RayCast(function (a, b, f, g)
    {
        c = a;
        return g
    }, a, b);
    return c
};
Box2D.Dynamics.b2World.prototype.RayCastAll = function (a, b)
{
    var c = [];
    this.RayCast(function (a)
    {
        c.push(a);
        return 1
    }, a, b);
    return c
};
Box2D.Dynamics.b2World.prototype.GetBodyList = function ()
{
    return this.bodyList
};
Box2D.Dynamics.b2World.prototype.GetJointList = function ()
{
    return this.m_jointList
};
Box2D.Dynamics.b2World.prototype.GetContactList = function ()
{
    return this.contactList
};
Box2D.Dynamics.b2World.prototype.IsLocked = function ()
{
    return this.m_isLocked
};
Box2D.Dynamics.b2World.prototype.Solve = function (a)
{
    for (var b = this.controllerList.GetFirstNode(); b; b = b.GetNextNode())
    {
        b.controller.Step(a)
    }
    b = this.island;
    b.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        c.body.m_islandFlag = !1
    }
    for (var d = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); d; d = d.GetNextNode())
    {
        d.contact.m_islandFlag = !1
    }
    for (c = this.m_jointList; c; c = c.m_next)
    {
        c.m_islandFlag = !1
    }
    for (c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); c; c = c.GetNextNode())
    {
        if (d = c.body, !d.m_islandFlag)
        {
            b.Clear();
            var e = [];
            e.push(d);
            for (d.m_islandFlag = !0; 0 < e.length;)
            {
                var f = e.pop();
                b.AddBody(f);
                f.IsAwake() || f.SetAwake(!0);
                if (f.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody)
                {
                    for (d = f.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); d; d = d.GetNextNode())
                    {
                        var g = d.contact;
                        g.m_islandFlag || (b.AddContact(g), g.m_islandFlag = !0, g = g.GetOther(f), g.m_islandFlag || (e.push(g), g.m_islandFlag = !0))
                    }
                    for (d = f.m_jointList; d; d = d.next)
                    {
                        !d.joint.m_islandFlag && d.other.IsActive() && (b.AddJoint(d.joint), d.joint.m_islandFlag = !0, d.other.m_islandFlag || (e.push(d.other), d.other.m_islandFlag = !0))
                    }
                }
            }

            b.Solve(a, this.m_gravity, this.m_allowSleep)
        }
    }
    for (c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.nonStaticActiveAwakeBodies); c; c = c.GetNextNode())
    {
        c.body.SynchronizeFixtures()
    }
    this.m_contactManager.FindNewContacts()
};
Box2D.Dynamics.b2World.prototype.SolveTOI = function (a)
{
    var b = this.island;
    b.Reset(this.m_contactManager.m_contactListener, this.m_contactSolver);
    for (var c = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.allBodies); c; c = c.GetNextNode())
    {
        var d = c.body;
        d.m_islandFlag = !1;
        d.m_sweep.t0 = 0
    }
    for (var e = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); e; e = e.GetNextNode())
    {
        e.contact.m_islandFlag = !1, e.contact.m_toi = null
    }
    for (c = this.m_jointList; c; c = c.m_next)
    {
        c.m_islandFlag = !1
    }
    for (; ;)
    {
        var c = this._SolveTOI2(a), f = c.minContact, c = c.minTOI;
        if (null === f || Box2D.Dynamics.b2World.MAX_TOI < c)
        {
            break
        }
        e = f.m_fixtureA.GetBody();
        d = f.m_fixtureB.GetBody();
        Box2D.Dynamics.b2World.s_backupA.Set(e.m_sweep);
        Box2D.Dynamics.b2World.s_backupB.Set(d.m_sweep);
        e.Advance(c);
        d.Advance(c);
        f.Update(this.m_contactManager.m_contactListener);
        f.m_toi = null;
        if (f.IsSensor() || !f.IsEnabled())
        {
            e.m_sweep.Set(Box2D.Dynamics.b2World.s_backupA), d.m_sweep.Set(Box2D.Dynamics.b2World.s_backupB), e.SynchronizeTransform(), d.SynchronizeTransform()
        } else
        {
            if (f.IsTouching())
            {
                e.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody && (e = d);
                b.Clear();
                f = new goog.structs.Queue;
                f.enqueue(e);
                for (e.m_islandFlag = !0; 0 < f.size;)
                {
                    if (d = f.dequeue(), b.AddBody(d), d.IsAwake() || d.SetAwake(!0), d.GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
                    {
                        for (e = d.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledTouchingContacts); e && b.m_contactCount != Box2D.Common.b2Settings.b2_maxTOIContactsPerIsland; e = e.GetNextNode())
                        {
                            var g = e.contact;
                            g.m_islandFlag || (b.AddContact(g), g.m_islandFlag = !0, g = g.GetOther(d), g.m_islandFlag || (g.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (g.Advance(c), g.SetAwake(!0), f.enqueue(g)), g.m_islandFlag = !0))
                        }
                        for (d = d.m_jointList; d; d = d.next)
                        {
                            b.m_jointCount != Box2D.Common.b2Settings.b2_maxTOIJointsPerIsland && (!d.joint.m_islandFlag && d.other.IsActive()) && (b.AddJoint(d.joint), d.joint.m_islandFlag = !0, d.other.m_islandFlag || (d.other.GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody && (d.other.Advance(c), d.other.SetAwake(!0), f.enqueue(d.other)), d.other.m_islandFlag = !0))
                        }
                    }
                }
                this.islandTimeStep.Reset((1 - c) * a.dt, 0, a.velocityIterations, a.positionIterations, !1);
                b.SolveTOI(this.islandTimeStep);
                for (c = 0; c < b.m_bodies.length; c++)
                {
                    if (b.m_bodies[c].m_islandFlag = !1, b.m_bodies[c].IsAwake() && b.m_bodies[c].GetType() == Box2D.Dynamics.b2BodyDef.b2_dynamicBody)
                    {
                        b.m_bodies[c].SynchronizeFixtures();
                        for (e = b.m_bodies[c].contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.allContacts); e; e = e.GetNextNode())
                        {
                            e.contact.m_toi = null
                        }
                    }
                }
                for (c = 0; c < b.m_contactCount; c++)
                {
                    b.m_contacts[c].m_islandFlag = !1, b.m_contacts[c].m_toi = null
                }
                for (c = 0; c < b.m_jointCount; c++)
                {
                    b.m_joints[c].m_islandFlag = !1
                }
                this.m_contactManager.FindNewContacts()
            }
        }
    }
};
Box2D.Dynamics.b2World.prototype._SolveTOI2 = function (a)
{
    for (var b = null, c = 1, d = this.contactList.GetFirstNode(Box2D.Dynamics.Contacts.b2ContactList.TYPES.nonSensorEnabledContinuousContacts); d; d = d.GetNextNode())
    {
        var e = d.contact;
        if (!this._SolveTOI2SkipContact(a, e))
        {
            var f = 1;
            if (null != e.m_toi)
            {
                f = e.m_toi
            } else
            {
                if (e.IsTouching())
                {
                    f = 1
                } else
                {
                    var f = e.m_fixtureA.GetBody(), g = e.m_fixtureB.GetBody(), h = f.m_sweep.t0;
                    f.m_sweep.t0 < g.m_sweep.t0 ? (h = g.m_sweep.t0, f.m_sweep.Advance(h)) : g.m_sweep.t0 < f.m_sweep.t0 && (h = f.m_sweep.t0, g.m_sweep.Advance(h));
                    f = e.ComputeTOI(f.m_sweep, g.m_sweep);
                    Box2D.Common.b2Settings.b2Assert(0 <= f && 1 >= f);
                    0 < f && 1 > f && (f = (1 - f) * h + f)
                }
                e.m_toi = f
            }
            Number.MIN_VALUE < f && f < c && (b = e, c = f)
        }
    }
    return{minContact:b, minTOI:c}
};
Box2D.Dynamics.b2World.prototype._SolveTOI2SkipContact = function (a, b)
{
    var c = b.m_fixtureA.GetBody(), d = b.m_fixtureB.GetBody();
    return(c.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !c.IsAwake()) && (d.GetType() != Box2D.Dynamics.b2BodyDef.b2_dynamicBody || !d.IsAwake()) ? !0 : !1
};
Box2D.Dynamics.b2World.prototype.DrawJoint = function (a)
{
    if (a instanceof Box2D.Dynamics.Joints.b2DistanceJoint || a instanceof Box2D.Dynamics.Joints.b2MouseJoint)
    {
        var b = a.GetAnchorA(), c = a.GetAnchorB();
        this.m_debugDraw.DrawSegment(b, c, Box2D.Dynamics.b2World.s_jointColor);
        Box2D.Common.Math.b2Vec2.Free(b);
        Box2D.Common.Math.b2Vec2.Free(c)
    } else
    {
        if (a instanceof Box2D.Dynamics.Joints.b2PulleyJoint)
        {
            var b = a.GetAnchorA(), c = a.GetAnchorB(), d = a.GetGroundAnchorA(), a = a.GetGroundAnchorB();
            this.m_debugDraw.DrawSegment(d, b, Box2D.Dynamics.b2World.s_jointColor);
            this.m_debugDraw.DrawSegment(a, c, Box2D.Dynamics.b2World.s_jointColor);
            this.m_debugDraw.DrawSegment(d, a, Box2D.Dynamics.b2World.s_jointColor);
            Box2D.Common.Math.b2Vec2.Free(b);
            Box2D.Common.Math.b2Vec2.Free(c);
            Box2D.Common.Math.b2Vec2.Free(d);
            Box2D.Common.Math.b2Vec2.Free(a)
        } else
        {
            b = a.GetAnchorA(), c = a.GetAnchorB(), a.GetBodyA() != this.m_groundBody && this.m_debugDraw.DrawSegment(a.GetBodyA().m_xf.position, b, Box2D.Dynamics.b2World.s_jointColor), this.m_debugDraw.DrawSegment(b, c, Box2D.Dynamics.b2World.s_jointColor), a.GetBodyB() != this.m_groundBody && this.m_debugDraw.DrawSegment(a.GetBodyB().m_xf.position, c, Box2D.Dynamics.b2World.s_jointColor), Box2D.Common.Math.b2Vec2.Free(b), Box2D.Common.Math.b2Vec2.Free(c)
        }
    }
};
Box2D.Dynamics.b2World.prototype.DrawShape = function (a, b, c)
{
    if (a instanceof Box2D.Collision.Shapes.b2CircleShape)
    {
        var d = Box2D.Common.Math.b2Math.MulX(b, a.m_p);
        this.m_debugDraw.DrawSolidCircle(d, a.m_radius, b.R.col1, c);
        Box2D.Common.Math.b2Vec2.Free(d)
    } else
    {
        if (a instanceof Box2D.Collision.Shapes.b2PolygonShape)
        {
            for (var d = 0, e = a.GetVertexCount(), a = a.GetVertices(), f = [], d = 0; d < e; d++)
            {
                f[d] = Box2D.Common.Math.b2Math.MulX(b, a[d])
            }
            this.m_debugDraw.DrawSolidPolygon(f, e, c);
            for (d = 0; d < e; d++)
            {
                Box2D.Common.Math.b2Vec2.Free(f[d])
            }
        } else
        {
            a instanceof Box2D.Collision.Shapes.b2EdgeShape && (d = Box2D.Common.Math.b2Math.MulX(b, a.GetVertex1()), b = Box2D.Common.Math.b2Math.MulX(b, a.GetVertex2()), this.m_debugDraw.DrawSegment(d, b, c), Box2D.Common.Math.b2Vec2.Free(d), Box2D.Common.Math.b2Vec2.Free(b))
        }
    }
};
Box2D.Dynamics.b2World.s_xf = new Box2D.Common.Math.b2Transform;
Box2D.Dynamics.b2World.s_backupA = new Box2D.Common.Math.b2Sweep;
Box2D.Dynamics.b2World.s_backupB = new Box2D.Common.Math.b2Sweep;
Box2D.Dynamics.b2World.s_jointColor = new Box2D.Common.b2Color(0.5, 0.8, 0.8);
Box2D.Dynamics.b2World.s_color_inactive = new Box2D.Common.b2Color(0.5, 0.5, 0.3);
Box2D.Dynamics.b2World.s_color_static = new Box2D.Common.b2Color(0.3, 0.3, 0.3);
Box2D.Dynamics.b2World.s_color_kinematic = new Box2D.Common.b2Color(0.5, 0.5, 0.9);
Box2D.Dynamics.b2World.s_color_dynamic_sleeping = new Box2D.Common.b2Color(0.6, 0.6, 0.6);
Box2D.Dynamics.b2World.s_color_dynamic_awake = new Box2D.Common.b2Color(0.6, 0.9, 0.6);
Box2D.Dynamics.b2World.s_pairColor = new Box2D.Common.b2Color(0.3, 0.9, 0.9);
Box2D.Dynamics.b2World.s_aabbColor = new Box2D.Common.b2Color(0, 0, 0.8);
Box2D.generateCallback = function (a, b)
{
    return function ()
    {
        b.apply(a, arguments)
    }
};
Box2D.Dynamics.Controllers.b2TensorDampingController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.T = new Box2D.Common.Math.b2Mat22;
    this.maxTimestep = 0
};
goog.inherits(Box2D.Dynamics.Controllers.b2TensorDampingController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.SetAxisAligned = function (a, b)
{
    this.T.col1.x = -a;
    this.T.col1.y = 0;
    this.T.col2.x = 0;
    this.T.col2.y = -b;
    this.maxTimestep = 0 < a || 0 < b ? 1 / Math.max(a, b) : 0
};
Box2D.Dynamics.Controllers.b2TensorDampingController.prototype.Step = function (a)
{
    a = a.dt;
    if (!(a <= Number.MIN_VALUE))
    {
        a > this.maxTimestep && 0 < this.maxTimestep && (a = this.maxTimestep);
        for (var b = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); b; b = b.GetNextNode())
        {
            var c = b.body, d = c.GetLocalVector(c.GetLinearVelocity()), e = Box2D.Common.Math.b2Math.MulMV(this.T, d);
            Box2D.Common.Math.b2Vec2.Free(d);
            d = c.GetWorldVector(e);
            Box2D.Common.Math.b2Vec2.Free(e);
            e = Box2D.Common.Math.b2Vec2.Get(c.GetLinearVelocity().x + d.x * a, c.GetLinearVelocity().y + d.y * a);
            Box2D.Common.Math.b2Vec2.Free(d);
            c.SetLinearVelocity(e);
            Box2D.Common.Math.b2Vec2.Free(e)
        }
    }
};
Box2D.Collision.Shapes.b2EdgeChainDef = function ()
{

    this.vertexCount = 0;
    this.isALoop = !0;
    this.vertices = []
};
Box2D.Dynamics.Controllers.b2ConstantForceController = function ()
{
    Box2D.Dynamics.Controllers.b2Controller.call(this);
    this.F = Box2D.Common.Math.b2Vec2.Get(0, 0)
};
goog.inherits(Box2D.Dynamics.Controllers.b2ConstantForceController, Box2D.Dynamics.Controllers.b2Controller);
Box2D.Dynamics.Controllers.b2ConstantForceController.prototype.Step = function ()
{
    for (var a = this.bodyList.GetFirstNode(Box2D.Dynamics.b2BodyList.TYPES.awakeBodies); a; a = a.GetNextNode())
    {
        var b = a.body;
        b.ApplyForce(this.F, b.GetWorldCenter())
    }
};
Box2D.Dynamics.Joints.b2PulleyJointDef = function ()
{
    Box2D.Dynamics.Joints.b2JointDef.call(this);
    this.groundAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.groundAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorA = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.localAnchorB = Box2D.Common.Math.b2Vec2.Get(0, 0);
    this.type = Box2D.Dynamics.Joints.b2Joint.e_pulleyJoint;
    this.groundAnchorA.Set(-1, 1);
    this.groundAnchorB.Set(1, 1);
    this.localAnchorA.Set(-1, 0);
    this.localAnchorB.Set(1, 0);
    this.maxLengthB = this.lengthB = this.maxLengthA = this.lengthA = 0;
    this.ratio = 1;
    this.collideConnected = !0
};
goog.inherits(Box2D.Dynamics.Joints.b2PulleyJointDef, Box2D.Dynamics.Joints.b2JointDef);
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Initialize = function (a, b, c, d, e, f, g)
{
    void 0 === g && (g = 0);
    this.bodyA = a;
    this.bodyB = b;
    this.groundAnchorA.SetV(c);
    this.groundAnchorB.SetV(d);
    this.localAnchorA = this.bodyA.GetLocalPoint(e);
    this.localAnchorB = this.bodyB.GetLocalPoint(f);
    a = e.x - c.x;
    c = e.y - c.y;
    this.lengthA = Math.sqrt(a * a + c * c);
    c = f.x - d.x;
    d = f.y - d.y;
    this.lengthB = Math.sqrt(c * c + d * d);
    this.ratio = g;
    g = this.lengthA + this.ratio * this.lengthB;
    this.maxLengthA = g - this.ratio * Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength;
    this.maxLengthB = (g - Box2D.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
Box2D.Dynamics.Joints.b2PulleyJointDef.prototype.Create = function ()
{
    return new Box2D.Dynamics.Joints.b2PulleyJoint(this)
};

// first playcraft script loaded -- used to init anything before the rest of the engine is loaded
pc.Hashtable = gamecore.Hashtable;

/**
 * @class pc.Base
 * @augments gamecore.Base
 */
pc.Base = gamecore.Base('pc.Base',
    /** @lends gamecore.Base */
    {},
    /** @lends gamecore.Base.prototype */
    {});

/**
 * @class pc.Pool
 * @augments gamecore.Pool
 */
pc.Pool = gamecore.Pool.extend('pc.Pool',
    /** @lends gamecore.Pool */
    {},
    /** @lends gamecore.Pool.prototype */
    {});

/**
 * @class pc.Pooled
 * @augments gamecore.Pooled
 */
pc.Pooled = gamecore.Pooled.extend('pc.Pooled',
    /** @lends gamecore.Pooled */
    {},
    /** @lends gamecore.Pooled.prototype */
    {});

/**
 * @class pc.LinkedList
 * @augments gamecore.LinkedList
 */
pc.LinkedList = gamecore.LinkedList.extend('pc.LinkedList',
    /** @lends gamecore.LinkedList */
    {},
    /** @lends gamecore.LinkedList.prototype */
    {});

/**
 * @class pc.LinkedListNode
 * @augments gamecore.LinkedListNode
 */
pc.LinkedListNode = gamecore.LinkedListNode.extend('pc.LinkedListNode',
    /** @lends gamecore.LinkedListNode */
    {},
    /** @lends gamecore.LinkedListNode.prototype */
    {});

/**
 * @class pc.HashList
 * @augments gamecore.HashList
 */
pc.HashList = gamecore.HashList.extend('pc.HashList',
    /** @lends gamecore.HashList */
    {},
    /** @lends gamecore.HashList.prototype */
    {});

if (!Function.prototype.bind)
{
    Function.prototype.bind = function (oThis)
    {
        if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function ()
            {
            },
            fBound = function ()
            {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function (searchElement /*, fromIndex */)
    {
        "use strict";
        if (this == null)
        {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0)
        {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0)
        {
            n = Number(arguments[1]);
            if (n != n)
            { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity)
            {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len)
        {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++)
        {
            if (k in t && t[k] === searchElement)
            {
                return k;
            }
        }
        return -1;
    }
}


/**
 * Playcraft Engine
 */

if (!window.pc)
    window.pc = {};

pc.VERSION = '0.5.21';


/**
 * Simple javascript loader. Loads sources in a linear order (the order they are added to the loader).
 * This ensures dependencies based on the order of loading. It isn't particularly super efficient, but is
 * generally only used for development; and the difference in loading times over fast connections is minimal.
 * For production deployment you should be packing/minimizing the game into a single file.
 */
pc.JSLoader = function()
{
    this.progress = 0;
    this.canvasId = null;
    this.current = 0;
    this.baseUrl = '';
    this.started = false;
    this.finished = false;
    this._noCacheString = '';
    this.gameClass = null;
    this.resources = [];

    /**
     * Tells the resource loader to disable caching in the browser by modifying the resource src
     * by appending the current time
     */
    this.setDisableCache = function ()
    {
        this._noCacheString = '?nocache=' + Date.now();
    };

    this.setBaseUrl = function (url)
    {
        this.baseUrl = url;
    };

    this.makeUrl = function (src)
    {
        return this.baseUrl + src + this._noCacheString;
    };

    this.add = function (src)
    {
        this.resources.push(this.makeUrl(src));
    };

    this.start = function(canvasId, gameClass)
    {
        this.current = 0;
        this.canvasId = canvasId;
        this.gameClass = gameClass;
        this.loadNextScript();
    };

    this.loadNextScript = function()
    {
        var src = this.resources[this.current];
        var script = document.createElement("script");
        script.type = "application/javascript";
        script.src = src;

        script.onload = this.checkAllDone.bind(this);
        script.onerror = function ()
        {
            throw('Could not load javascript file: ' + script.src);
        };

        document.getElementsByTagName("head")[0].appendChild(script);
    };

    this.checkAllDone = function ()
    {
        if (this.resources.length-1 == this.current)
        {
            this.finished = true;
            pc.device.boot(this.canvasId, this.gameClass);
        } else
        {
            this.current++;
            this.loadNextScript();
        }
    }
};


pc.start = function(canvasId, gameClass, gameBaseUrl, scripts, engineBaseURL)
{
    var loader = new pc.JSLoader();

    // if we're not packed/minified, then load the source directly here
    if (pc.packed == undefined)
    {
        if (engineBaseURL == undefined)
            engineBaseURL = '/playcraftjs/lib/';
        loader.setBaseUrl(engineBaseURL);

        // Externals
//        loader.add('ext/jquery171.js');
        loader.add('ext/gamecore.js/src/gamecore.js');
        loader.add('ext/gamecore.js/src/class.js');
        loader.add('ext/gamecore.js/src/base.js');
        loader.add('ext/gamecore.js/src/jhashtable.js');
        loader.add('ext/gamecore.js/src/device.js');
        loader.add('ext/gamecore.js/src/perf.js');
        loader.add('ext/gamecore.js/src/linkedlist.js');
        loader.add('ext/gamecore.js/src/hashlist.js');
        loader.add('ext/gamecore.js/src/stacktrace.js');
        loader.add('ext/gamecore.js/src/pooled.js');
        loader.add('ext/base64.js');
        loader.add('ext/box2dweb.2.1a-pc.js');

        // Playcraft Engine
        loader.add('boot.js'); // <--- must be first for engine scripts (sets up some translations)
        loader.add('input.js');
        loader.add('hashmap.js');
        loader.add('tools.js');
        loader.add('color.js');
        loader.add('debug.js');
        loader.add('device.js');
        loader.add('sound.js');
        loader.add('layer.js');
        loader.add('entitylayer.js');
        loader.add('tileset.js');
        loader.add('tilemap.js');
        loader.add('tilelayer.js');
        loader.add('entity.js');
        loader.add('sprite.js');
        loader.add('spritesheet.js');
        loader.add('math.js');
        loader.add('image.js');
        loader.add('scene.js');
        loader.add('game.js');
        loader.add('loader.js');
        loader.add('dataresource.js');
        loader.add('components/component.js');
        loader.add('components/physics.js');
        loader.add('components/alpha.js');
        loader.add('components/joint.js');
        loader.add('components/expiry.js');
        loader.add('components/originshifter.js');
        loader.add('components/spatial.js');
        loader.add('components/overlay.js');
        loader.add('components/clip.js');
        loader.add('components/activator.js');
        loader.add('components/input.js');
        loader.add('components/fade.js');
        loader.add('components/rect.js');
        loader.add('components/text.js');
        loader.add('components/sprite.js');
        loader.add('components/layout.js');
        loader.add('components/particleemitter.js');
        loader.add('systems/system.js');
        loader.add('es/entitymanager.js');
        loader.add('es/systemmanager.js');
        loader.add('systems/entitysystem.js');
        loader.add('systems/physics.js');
        loader.add('systems/effects.js');
        loader.add('systems/particles.js');
        loader.add('systems/input.js');
        loader.add('systems/expiry.js');
        loader.add('systems/activation.js');
        loader.add('systems/render.js');
        loader.add('systems/layout.js');
    }

    // now load the game scripts
    loader.setBaseUrl(gameBaseUrl);
    for (var i=0; i < scripts.length; i++)
        loader.add(scripts[i]);

    loader.start(canvasId, gameClass);
};
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Input
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * This class provides a way of binding and reacting to input in a convenient and device independent way. The
 * engine will automatically construct a single, global input class which is accessible via the global pc.device.input.
 * <p>
 * There are two kinds of inputs that can be handled, actions and states. An action is a single event that occurs
 * as a reaction to an input such as clicking the mouse or pressing a key. Typical actions are having a player jump, or
 * open a door. States are when an input is in an on/off state, such as turning a ship or firing a weapon.
 * <p>
 * <h5>Actions</h5>
 * Reacting to action involves 'binding' an action, such as 'open door' or 'jump' to an object in the game which will
 * trigger a call to the object's onAction method.
 * <pre><code>
 * MyGame = pc.Game('MyGame',
 * {},
 * {
 *    onLoaded:function (loaded, errored)
 *    {
 *       // bind the jump action to the space key
 *       this.input.bindAction(this, 'jump', 'SPACE');
 *       // as well as a mouse click
 *       this.input.bindAction(this, 'jump', 'MOUSE_LEFT_CLICK');
 *    },
 *
 *    // this onAction method will be called when an action relating to
 *    // this object is triggered
 *    onAction:function(actionName)
 *    {
 *       if (actionName === 'jump')
 *       {
 *          // player.jump!
 *       }
 *    }
 *
 * });
 * </code></pre>
 * <p>
 * <h5>States</h5>
 * States are used to indicate when a key or input control is currently active or not. Typically a state is used
 * when you want to react for the entire time an input is engaged, such as holding down a key to accelerate a car.
 * <p>
 * To use an input state, bind it to an object the same way you do an action. You will then need to separately check
 * if the state is on at the appropriate time for your game. Most commonly this is done in a process function. See
 * the <a href='pc.Game'>game</a>, <a href='pc.Layer'>layer</a> or <a href='pc.Scene'>scene</a> classes for more
 * information on overriding a process function.
 * <pre><code>
 * // bind the state to an input and an object
 * this.input.bindState(this, 'moving left', 'LEFT');
 *
 * // check for the state being active in the game, layer or scene process
 * process:function ()
 * {
 *    if (pc.device.input.isInputState(this, 'moving left'))
 *       // move the player left
 * }
 * </code></pre>
 * You can see an example of both input actions and states in the Asteroids sample game.
 * <p>
 * Rather than using this class directly, you can also use the <a href='pc.components.Input'>input component</a>
 * and <a href='pc.systems.Input'>system</a> which lets you bind input to an entity as a component.
 */
pc.Input = pc.Base('pc.Input',
    /** @lends pc.Input */
    {
        _eventPos: null, // cached for speed

        /**
         * Extracts the position from an event (in a cross-browser way),and then sets the passed in pos
         * @param {Object} e Event to extract the position from
         * @param {pc.Point} [pos] Position object to set. Leave out to have a new (pooled) point returned
         */
        getEventPosition:function(e, pos)
        {
            if (this._eventPos == null)
                this._eventPos = pc.Point.create(0,0);

            var r = pos;
            if (!pc.Tools.isValid(pos))
                r = this._eventPos;

            if (e.pageX || e.pageY)
            {
                r.x = e.pageX;
                r.y = e.pageY;
            } else
            {
                r.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                r.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return r;
        }

    },
    /** @lends pc.Input.prototype */
    {
        /** Current state bindings */
        stateBindings:null,
        /** Currently active states */
        states:null,
        /** Action bindings */
        actionBindings:null,
        /** Current position of the mouse on-screen, updated continuously */
        mousePos: null,

        init:function ()
        {
            this._super();
            this.stateBindings = new pc.Hashtable();
            this.states = new pc.Hashtable();
            this.actionBindings = new pc.Hashtable();
            this.mousePos = pc.Point.create(0,0);
        },

        /**
         * Binds an input state to an object, such as 'turning left' or 'firing' to an input code.
         * You can bind an input to any object, however typically it's to a layer, scene or game. The input will not
         * trigger if the object is not presently active.
         * If you specify a UIElement (optional), the state is only triggered if the event occurs inside
         * the bounds of the element (typically a positional event like a touch start or mouse move)
         * @param {Object} obj An object to bind the state to
         * @param {String} stateName The name of the state, e.g. "turning left"
         * @param {String} input The name of the input, i.e. 'LEFT' (see pc.InputType)
         * @param {Object} [uiTarget] Optional UI object to bind the input to
         */
        bindState:function (obj, stateName, input, uiTarget)
        {
            if (obj.uniqueId == null)
                throw "Oops, you can't bind a state to an object if it doesn't have a uniqueId function";

            input = input.toUpperCase();
            // There can be many bindings associated with a particular input, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            var bindingSet = this.stateBindings.get(input);
            if (bindingSet == null)
                this.stateBindings.put(input, [
                    { stateName:stateName, object:obj, state:{on:false, event:null}, uiTarget:uiTarget }
                ]);
            else
                // otherwise append a new binding
                bindingSet.push({ stateName:stateName, object:obj, state:{ on:false, event:null }, uiTarget:uiTarget });

            // now setup a state for this object/input combination
            this.states.put(obj.uniqueId + '\\\\' + stateName, {on: false, event: null});
        },


        /**
         * Clears any on states related to an object.
         * @param {Object} obj The object to clear states for
         */
        clearStates:function (obj)
        {
            var bindings = this.stateBindings.entries();

            for (var b=0; b < bindings.length; b++)
            {
                var bindingSet = bindings[b];
                for (var i = 0; i < bindingSet.length; i++)
                {
                    var binding = bindingSet[i];
                    if (binding.object == obj)
                    {
                        var state = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                        state.on = false;
                        state.event = null;
                        pc.tools.arrayRemove(this._tracks, binding);
                    }
                }
            }
        },

        /**
         * Returns true if the named state is currently active. If you need anything more than the state boolean
         * use getInputState, which includes the actual event.
         * @param {Object} obj Object to check the binding against
         * @param {String} stateName A string representing a previously setup state, i.e. 'turning left'
         * @returns {Boolean} true if the state is currently on (such as a key being down)
         */
        isInputState:function (obj, stateName)
        {
            // lookup is very slow; have to find the state for a certain stateName and object
            // todo: oops this is creating strings for every check (usually every frame)-- get rid of it
            // add a state property to the bound object and update it when the state changes
            var state = this.states.get(obj.uniqueId + '\\\\' + stateName);
            if (state == null) throw 'Ooops, unknown state ' + stateName;
            return state.on;
        },

        /**
         * Gets the present input state object (which includes the event data).
         * @param {Object} obj Object to check against (such as a layer, scene or game)
         * @param {String} stateName Name of the state to check for
         * @return {Object} state object containing the state.state and state.event data
         */
        getInputState:function (obj, stateName)
        {
            return this.states.get(obj.uniqueId + '\\\\' + stateName);
        },

        /**
         * Binds an input event to an action and object; e.g. bindAction(playerShip, 'fire', 'CTRL')
         * will trigger an action callback on the playerShip entity when the CTRL key is pressed down.
         * You can bind an input to a layer, scene or entity. The input will not trigger if the object
         * is not presently active.
         * <p>
         * For positional events (such as a mouse or touch input) the action will only fire if the position
         * of the event is within the bounds of the object (based on a call to getScreenRect). You can optionally
         * provide a uiTarget object to provide a different bounding rectangle. If the object provides no getScreenRect
         * method, then no bounding check will be carried out.
         * <pre><code>
         * For example:
         * var menuLayer = new Layer();                     // a menu layer
         * var menuOption = new TextElement('New Game');    // a menu item
         *
         * // trigger the 'new game' action for the menuLayer, when a mouse click occurs within the menuOption element
         * pc.device.input.bindAction(menuLayer, 'new game', 'MOUSE_LEFT_BUTTON', menuOption);
         * </code></pre>
         * Note: If the uiTarget element is not provided, the bounding rectangle of the obj is used (as long as
         * the object provides a getScreenRect() method, otherwise there is no checking
         *
         * @param obj The entity, layer or scene to bind this action to (must implement onAction)
         * @param actionName The name of the action, e.g. 'FIRE' or 'JUMP'
         * @param input The input code as a string
         * @param uiTarget An optional element to limit the input to only within the bounds of the element (must
         * implement getScreenRect)
         */
        bindAction:function (obj, actionName, input, uiTarget)
        {
            // There can be many bindings associated with a particular input event, so we see
            // if there is already one, and then append this to the array, otherwise
            // we create the array
            input = input.toUpperCase();

            var bindingSet = this.actionBindings.get(input);
            if (bindingSet == null)
                this.actionBindings.put(input, [
                    { actionName:actionName, object:obj, uiTarget:uiTarget }
                ]);
            else
                // otherwise append a new binding
                bindingSet.push({ actionName:actionName, object:obj, uiTarget:uiTarget });
        },

        /**
         * Triggers an action to be fired. Typically this will be fired in response to an input, but it can
         * also be used to simulate an event.
         * @param eventCode event code
         * @param event An event object
         */
        fireAction:function (eventCode, event)
        {
            var bindingSet = this.actionBindings.get(pc.InputType.getName(eventCode));
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and fire the object callbacks
            for (var i = 0; i < bindingSet.length; i++)
            {
                var binding = bindingSet[i];
                var obj = bindingSet[i].object;
                if (!obj.isActive || obj.isActive())
                {
                    // if it's a positional event type (like a mouse down or move, then we only
                    // fire events to objects where the event is within its spatial bounds
                    if (pc.InputType.isPositional(eventCode))
                    {
                        var pos = this.Class.getEventPosition(event);
                        var er = null;
                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = obj.getScreenRect ? obj.getScreenRect() : null;

                        if (er && er.containsPoint(pos))
                            obj.onAction(binding.actionName, event, pos, binding.uiTarget);
                    } else
                        obj.onAction(binding.actionName);
                }
            }
            return true;
        },



        /*** INTERNALS **/

        _onReady:function ()
        {
            // touch input
            pc.device.canvas.addEventListener('touchstart', this._touchStart.bind(this), true);
            pc.device.canvas.addEventListener('touchend', this._touchEnd.bind(this), true);
            pc.device.canvas.addEventListener('touchmove', this._touchMove.bind(this), true);

            // mouse input
            pc.device.canvas.addEventListener('mouseup', this._mouseUp.bind(this), true);
            pc.device.canvas.addEventListener('mousedown', this._mouseDown.bind(this), true);
            pc.device.canvas.addEventListener('mousemove', this._mouseMove.bind(this), true);
            pc.device.canvas.addEventListener('mousewheel', this._mouseWheel.bind(this), true);
            pc.device.canvas.addEventListener('contextmenu', this._contextMenu.bind(this), true);

            // key input
            window.addEventListener('keydown', this._keyDown.bind(this), true);
            window.addEventListener('keyup', this._keyUp.bind(this), true);
        },

        _tracks: [], // a linked list of bindings we are currently tracking

        _checkState: function(moveEvent)
        {
            //
            // Tracks states that are active, by watching to see if the mouse has moved beyond the region (such as moving
            // the mouse out of a uitarget's surrounding rectangle, or having an entity move out from under the mouse.
            // Since you can have multiple overlapping elements, we support multiple tracked selections simultaneously.
            //

            // check existing tracked states -- did we move out of an element
            for (var i=0; i < this._tracks.length; i++)
            {
                var next = this._tracks[i];
                var pos = this.Class.getEventPosition(moveEvent);
                var er = null;
                if (pc.valid(next.uiTarget))
                    er = next.uiTarget.getScreenRect();
                else
                    er = next.object.getScreenRect ? next.object.getScreenRect() : null;

                if (er && !er.containsPoint(pos))
                {
                    // no longer in the right position, turn state off
                    var state = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                    state.on = false;
                    state.event = moveEvent;
                } else
                {
                    // moved into position, turn back on
                    var state2 = this.states.get(next.object.uniqueId + '\\\\' + next.stateName);
                    state2.on = true;
                    state2.event = moveEvent;
                }
            }

            // todo: check if we moved INTO an element, this is just checking for moving out

        },

        _changeState:function (eventCode, stateOn, event)
        {
            // grab all the bindings to this event code
            var keyName = pc.InputType.getName(eventCode);
            if (keyName == null)
            {
                this.log("Unknown keycode = " + eventCode);
                return false;
            }

            var bindingSet = this.stateBindings.get(keyName);
            //console.log('change state = ' + this.inputType.getName(event.keyCode,+ ' bindings=' + bindingSet);
            if (bindingSet == null) return false;

            // cycle through all the bindings against this input type and change the state
            for (var i = 0; i < bindingSet.length; i++)
            {
                var binding = bindingSet[i];
                if (!binding.object.isActive || binding.object.isActive())
                {
                    if (pc.InputType.isPositional(eventCode))
                    {
                        // if binding has a uiElement, then make sure the event hit is within the on-screen
                        // rectangle
                        var pos = this.Class.getEventPosition(event);
                        var er = null;

                        if (pc.valid(binding.uiTarget))
                            er = binding.uiTarget.getScreenRect();
                        else
                            er = binding.object.getScreenRect ? binding.object.getScreenRect() : null;

                        if (er)
                        {
                            if (er.containsPoint(pos))
                            {
                                var state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                                state.on = stateOn;
                                state.event = event;

                                // start tracking the movement for this element
                                if (state.on)
                                    this._tracks.push(binding);
                                else
                                    pc.Tools.arrayRemove(this._tracks, binding);
                            }
                        } else
                        {
                            // positional, but no uiTarget
                            state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                            state.on = stateOn;
                            state.event = event;
                        }
                    }
                    else
                    {
                        state = this.states.get(binding.object.uniqueId + '\\\\' + binding.stateName);
                        state.on = stateOn;
                        state.event = event;
                    }
                }
            }
            return true;
        },

        _lastMouseMove: null,

        /**
         * Called by the pc.device main loop to process any events received. We only handle events
         * here so they are processed once per cycle, not every time we get them (i.e. stop handling
         * a flood of mouse move or touch events
         */
        process: function()
        {
            if (this._lastMouseMove)
            {
                this._checkState(this._lastMouseMove);
                this.fireAction(pc.InputType.MOUSE_MOVE, this._lastMouseMove);
                this.Class.getEventPosition(this._lastMouseMove, this.mousePos);
                this._lastMouseMove = null;
            }
        },

        ///////////////////////////////////////////////////////////////////////////////////
        //
        //  EVENT HANDLERS
        //
        ///////////////////////////////////////////////////////////////////////////////////

        _keyDown:function (event)
        {
            if (this._changeState(event.keyCode, true, event))
                event.preventDefault();

            if (this.fireAction(event.keyCode, event))
                event.preventDefault();

        },

        _keyUp:function (event)
        {
            if (this._changeState(event.keyCode, false, event))
                event.preventDefault();
        },

        _touchStart:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
            {
                this._changeState(pc.InputType.TOUCH, true, event.touches[i]);
                this.fireAction(pc.InputType.TOUCH, event.touches[i]);
            }
            event.preventDefault();
        },

        _touchEnd:function (event)
        {
            this._tracks.length = 0;
            for(var i=0, len=event.changedTouches.length; i < len; i++)
            {
                this._changeState(pc.InputType.TOUCH, false, event.changedTouches[i]);
            }
            event.preventDefault();
        },

        _touchMove:function (event)
        {
            for(var i=0, len=event.touches.length; i < len; i++)
            {
                this._checkState(event.touches[i]);
            }
            event.preventDefault();
        },

        _mouseUp:function (event)
        {
            // kill all the mouse tracks (mouse is up)
            // todo: need separate tracks for different buttons
            this._tracks.length = 0;
            // turn off specific states
            this._changeState(pc.InputType.MOUSE_LEFT_BUTTON, false, event);
            event.preventDefault();
        },

        _mouseDown:function (event)
        {
            if (event.button == 0 || event.button == 1)
            {
                this._changeState(pc.InputType.MOUSE_LEFT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_LEFT_BUTTON, event);
            } else
            {
                this._changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
                this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
            }
            event.preventDefault();
        },

        _mouseMove:function (event)
        {
            this._lastMouseMove = event;
            event.preventDefault();
        },

        _contextMenu: function(event)
        {
            this._changeState(pc.InputType.MOUSE_RIGHT_BUTTON, true, event);
            this.fireAction(pc.InputType.MOUSE_RIGHT_BUTTON, event);
        },

        _mouseWheel:function (event)
        {
            if (event.wheel > 0)
                this.fireAction(pc.InputType.MOUSE_WHEEL_UP, event);
            else
                this.fireAction(pc.InputType.MOUSE_WHEEL_DOWN, event);
            event.preventDefault();
        }
    });

pc.InputType = pc.Base.extend('pc.InputType',
    {
        // STATICS
        nameToCode:null,
        codeToName:null,

        POSITIONAL_EVENT_START:1000,
        MOUSE_LEFT_BUTTON: 1100,
        MOUSE_RIGHT_BUTTON: 1101,
        MOUSE_WHEEL_UP: 1102,
        MOUSE_WHEEL_DOWN: 1103,
        MOUSE_MOVE: 1104,
        TOUCH: 1000,

        init:function ()
        {
            this.nameToCode = new pc.Hashtable();
            this.codeToName = new pc.Hashtable();

            this.addInput(8, 'BACKSPACE');
            this.addInput(9, 'TAB');
            this.addInput(13, 'ENTER');
            this.addInput(16, 'SHIFT');
            this.addInput(17, 'CTRL');
            this.addInput(18, 'ALT');
            this.addInput(19, 'PAUSE');
            this.addInput(20, 'CAPS');
            this.addInput(27, 'ESC');
            this.addInput(32, 'SPACE');
            this.addInput(33, 'PAGE_UP');
            this.addInput(34, 'PAGE_DOWN');
            this.addInput(35, 'END');
            this.addInput(36, 'HOME');
            this.addInput(37, 'LEFT');
            this.addInput(38, 'UP');
            this.addInput(39, 'RIGHT');
            this.addInput(40, 'DOWN');
            this.addInput(45, 'INSERT');
            this.addInput(46, 'DELETE');

            // add alphanumierics
            for (var c=48; c < 91; c++)
            {
                var ch = String.fromCharCode(c);
                this.addInput(c, ch);
            }

            this.addInput(91, 'WINDOW_LEFT');
            this.addInput(92, 'WINDOW_RIGHT');
            this.addInput(93, 'SELECT');
            this.addInput(96, 'NUM_0');
            this.addInput(97, 'NUM_1');
            this.addInput(98, 'NUM_2');
            this.addInput(99, 'NUM_3');
            this.addInput(100, 'NUM_4');
            this.addInput(101, 'NUM_5');
            this.addInput(102, 'NUM_6');
            this.addInput(103, 'NUM_7');
            this.addInput(104, 'NUM_8');
            this.addInput(105, 'NUM_9');
            this.addInput(106, '*');
            this.addInput(107, '+');
            this.addInput(109, '-');
            this.addInput(110, '.');
            this.addInput(111, '/');
            this.addInput(112, 'F1');
            this.addInput(113, 'F2');
            this.addInput(114, 'F3');
            this.addInput(115, 'F4');
            this.addInput(116, 'F5');
            this.addInput(117, 'F6');
            this.addInput(118, 'F7');
            this.addInput(119, 'F8');
            this.addInput(120, 'F9');
            this.addInput(121, 'F10');
            this.addInput(122, 'F11');
            this.addInput(123, 'F12');
            this.addInput(144, 'NUM_LOCK');
            this.addInput(145, 'SCROLL_LOCK');
            this.addInput(186, ';');
            this.addInput(187, '=');
            this.addInput(188, ',');
            this.addInput(189, '-');
            this.addInput(190, '.');
            this.addInput(191, '/');
            this.addInput(192, '`');
            this.addInput(219, '[');
            this.addInput(220, '\\');
            this.addInput(221, ']');
            this.addInput(222, '\'');

            this.addInput(this.TOUCH, 'TOUCH');
//            this.addInput(1001, 'touchmove');
//            this.addInput(1002, 'touchend');

            this.addInput(this.MOUSE_LEFT_BUTTON, 'MOUSE_LEFT_BUTTON');
            this.addInput(this.MOUSE_RIGHT_BUTTON, 'MOUSE_RIGHT_BUTTON');
            this.addInput(this.MOUSE_WHEEL_UP, 'MOUSE_WHEEL_UP');
            this.addInput(this.MOUSE_WHEEL_DOWN, 'MOUSE_WHEEL_DOWN');
            this.addInput(this.MOUSE_MOVE, 'MOUSE_MOVE');
        },

        isPositional:function (inputCode)
        {
            return inputCode >= this.POSITIONAL_EVENT_START;
        },

        /**
         * Private utility method used by the constructor to add the input codes and lookup
         * names to both indexes/hash tables
         * @param inputCode event input code (i.e. event.keyCode)
         * @param inputName the human name of the input
         */
        addInput:function (inputCode, inputName)
        {
            this.codeToName.put(inputCode, inputName);
            this.nameToCode.put(inputName, inputCode);
        },

        /**
         * Returns the name of an input based on the event code
         * @param inputCode
         */
        getName:function (inputCode)
        {
            return this.codeToName.get(inputCode);
        },

        /**
         * Returns the code of an input based on the input name
         * @param inputName
         */
        getCode:function (inputName)
        {
            return this.nameToCode.get(inputName);
        }


    },
    {}
);

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
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 *
 * xmlToJSON function:
 * This work is licensed under Creative Commons GNU LGPL License.
 * License: http://creativecommons.org/licenses/LGPL/2.1/
 * Version: 0.9
 * Author:  Stefan Goessner/2006
 * Web:     http://goessner.net/
 */

/**
 * @class pc.Tools
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of useful tools. This is a static class, so you can just call methods directly, i.e.
 * <p><pre><code>
 * var cleanValue = pc.Tools.checked(value, 'default');
 * </code></pre>
 * There are shortcuts for the following common tools functions to make like a little easier:
 * <p><pre><code>
 * pc.valid = pc.Tools.isValid;
 * pc.checked = pc.Tools.checked;
 * pc.assert = pc.Tools.assert;
 * </code></pre>
 */
pc.Tools = pc.Base.extend('pc.Tools',
    /** @lends pc.Tools */
    {
        /**
         * Checks if a param is valid (null or undefined) in which case the default value will be returned
         * @param {*} p Parameter to check
         * @param {*} def Default value to return if p is either null or undefined
         * @return {*} p if valid, otherwise def (default)
         */
        checked:function (p, def)
        {
            if (!pc.valid(p))
                return def;
            return p;
        },

        /**
         * Check if a value is valid (not null or undefined)
         * @param {*} p A value
         * @return {Boolean} true if the value is not undefined and not null
         */
        isValid:function (p)
        {
            return !(p == null || typeof p === 'undefined');
        },

        /**
         * Tests a boolean evaluation and throws an exception with the error string.
         * @param {Boolean} test A boolean result test
         * @param {String} error A string to throw with the exception
         */
        assert:function (test, error)
        {
            if (!test) throw error;
        },

        /**
         * Removes an element from an array
         * @param {Array} array The array to remove the element from
         * @param {*} e The element to remove
         */
        arrayRemove:function (array, e)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (array[i] == e)
                    array.splice(i, 1);
            }
        },

        /**
         * Adds an element to an array, but only if it isn't already there
         * @param array the array to add to
         * @param e the element to add
         */
        arrayExclusiveAdd:function (array, e)
        {
            if (array.indexOf(e) == -1)
                array.push(e);
        },

        /**
         * Convers XML to a json string
         * @param {String} xml XML source data as a string
         * @param {String} tab String to use for tabulation
         * @return {String} JSON string form of the XML
         */
        xmlToJson:function (xml, tab)
        {
            var X = {
                toObj:function (xml)
                {
                    var o = {};
                    if (xml.nodeType == 1)
                    {   // element node ..
                        if (xml.attributes.length)   // element with attributes  ..
                            for (var i = 0; i < xml.attributes.length; i++)
                                o[xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                        if (xml.firstChild)
                        { // element has child nodes ..
                            var textChild = 0, cdataChild = 0, hasElementChild = false;
                            for (var n = xml.firstChild; n; n = n.nextSibling)
                            {
                                if (n.nodeType == 1) hasElementChild = true;
                                else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                                else if (n.nodeType == 4) cdataChild++; // cdata section node
                            }
                            if (hasElementChild)
                            {
                                if (textChild < 2 && cdataChild < 2)
                                { // structured element with evtl. a single text or/and cdata node ..
                                    X.removeWhite(xml);
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                    {
                                        if (n.nodeType == 3)  // text node
                                            o["#text"] = X.escape(n.nodeValue);
                                        else if (n.nodeType == 4)  // cdata node
                                            o["#cdata"] = X.escape(n.nodeValue);
                                        else if (o[n.nodeName])
                                        {  // multiple occurence of element ..
                                            if (o[n.nodeName] instanceof Array)
                                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                            else
                                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                        }
                                        else  // first occurence of element..
                                            o[n.nodeName] = X.toObj(n);
                                    }
                                }
                                else
                                { // mixed content
                                    if (!xml.attributes.length)
                                        o = X.escape(X.innerXml(xml));
                                    else
                                        o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                            else if (textChild)
                            { // pure text
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                            else if (cdataChild)
                            { // cdata
                                if (cdataChild > 1)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    for (var n = xml.firstChild; n; n = n.nextSibling)
                                        o["#cdata"] = X.escape(n.nodeValue);
                            }
                        }
                        if (!xml.attributes.length && !xml.firstChild) o = null;
                    }
                    else if (xml.nodeType == 9)
                    { // document.node
                        o = X.toObj(xml.documentElement);
                    }
                    else
                        alert("unhandled node type: " + xml.nodeType);
                    return o;
                },
                toJson:function (o, name, ind)
                {
                    var json = name ? ("\"" + name + "\"") : "";
                    if (o instanceof Array)
                    {
                        for (var i = 0, n = o.length; i < n; i++)
                            o[i] = X.toJson(o[i], "", ind + "\t");
                        json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                    }
                    else if (o == null)
                        json += (name && ":") + "null";
                    else if (typeof(o) == "object")
                    {
                        var arr = [];
                        for (var m in o)
                            arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                        json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                    }
                    else if (typeof(o) == "string")
                        json += (name && ":") + "\"" + o.toString() + "\"";
                    else
                        json += (name && ":") + o.toString();
                    return json;
                },
                innerXml:function (node)
                {
                    var s = ""
                    if ("innerHTML" in node)
                        s = node.innerHTML;
                    else
                    {
                        var asXml = function (n)
                        {
                            var s = "";
                            if (n.nodeType == 1)
                            {
                                s += "<" + n.nodeName;
                                for (var i = 0; i < n.attributes.length; i++)
                                    s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                                if (n.firstChild)
                                {
                                    s += ">";
                                    for (var c = n.firstChild; c; c = c.nextSibling)
                                        s += asXml(c);
                                    s += "</" + n.nodeName + ">";
                                }
                                else
                                    s += "/>";
                            }
                            else if (n.nodeType == 3)
                                s += n.nodeValue;
                            else if (n.nodeType == 4)
                                s += "<![CDATA[" + n.nodeValue + "]]>";
                            return s;
                        };
                        for (var c = node.firstChild; c; c = c.nextSibling)
                            s += asXml(c);
                    }
                    return s;
                },
                escape:function (txt)
                {
                    return txt.replace(/[\\]/g, "\\\\")
                        .replace(/[\"]/g, '\\"')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r');
                },
                removeWhite:function (e)
                {
                    e.normalize();
                    for (var n = e.firstChild; n;)
                    {
                        if (n.nodeType == 3)
                        {  // text node
                            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/))
                            { // pure whitespace text node
                                var nxt = n.nextSibling;
                                e.removeChild(n);
                                n = nxt;
                            }
                            else
                                n = n.nextSibling;
                        }
                        else if (n.nodeType == 1)
                        {  // element node
                            X.removeWhite(n);
                            n = n.nextSibling;
                        }
                        else                      // any other node
                            n = n.nextSibling;
                    }
                    return e;
                }
            };
            if (xml.nodeType == 9) // document node
                xml = xml.documentElement;
            var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
            return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
        }
    },
    {
        // Static class, so nothing required here
    }
)
;


pc.tools = new pc.Tools();

// quick short cuts for common tools
pc.valid = pc.Tools.isValid;
pc.checked = pc.Tools.checked;
pc.assert = pc.Tools.assert;
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Color
 * @augments pc.Pooled
 * @description
 * A general purpose representation of a color. You can create a color either an array [R,G,B] or using a hex color
 * string in the form of #RRGGBB. (For alpha see the pc.component.Alpha and pc.components.Fade).
 * <p>
 *     Create a color using either new:
 * <pre><code>
 * var color = new pc.Color([255, 0, 0]); // super red
 * var color2 = new pc.Color('#00FF00'); // super green
 * </code></pre>
 * <p>
 *     Or, as a pooled object:
 * <pre><code>
 * var color = pc.Color.create([255, 0, 0]); // super red
 * </code></pre>
 */
pc.Color = pc.Pooled.extend('pc.Color',
    /** @lends pc.Color */
    {
        /**
         * Constructs a color object using the passed in color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        create: function(color)
        {
            var n = this._super();
            n.config(color);
            return n;
        }
    },
    /** @lends pc.Color.prototype */
    {
        /** Array of current colors */
        rgb: [],
        /** Representation of the current color as an rgb string. Automatically updates as you change color */
        color: null,

        /**
         * Constructs a new color using the passed in color string. Used if you call new pc.Color, but typically
         * you should be using pc.Color.create as this is a pooled class
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        init: function(color)
        {
            if (color != undefined)
                this.config(color);
        },

        /**
         * Configure this color object with a given color
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        config: function(color)
        {
            if (Array.isArray(color))
                this.rgb = color;
            else
            {
                if (color.charAt(0) === '#')
                {
                    this.rgb[0] = parseInt(color.substring(1,3), 16);
                    this.rgb[1] = parseInt(color.substring(3,5), 16);
                    this.rgb[2] = parseInt(color.substring(5,7), 16);
                } else
                    throw "Invalid color: use either array [r,g,b] or '#RRGGBB'";
            }
            this._updateColorCache();
        },

        /**
         * Sets this color object to a given color (synonym for config(color)
         * @param {Array|String} color Can either be a string in the form of #RRGGBB or an array of 3 numbers representing red,
         * green, blue levels, i.e. full red is [255, 0, 0]
         */
        set: function(color)        { this.config(color); },

        /**
         * Sets the red component of the color
         * @param {Number} r Red component of the color to set
         */
        setRed: function(r)     { this.rgb[0] = pc.Math.limit(r, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the red component of the color
         * @param {Number} r Red component
         */
        addRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], r, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the red component of the color
         * @param {Number} r Red component
         */
        subRed: function(r)     { this.rgb[0] = pc.Math.limitAdd(this.rgb[0], -r, 0, 255); this._updateColorCache(); },

        /**
         * Sets the green component of the color
         * @param {Number} g Green component of the color to set
         */
        setGreen: function(g)   { this.rgb[1] = pc.Math.limit(g, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the green component of the color
         * @param {Number} g Green component
         */
        addGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], g, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the green component of the color
         * @param {Number} g Green component
         */
        subGreen: function(g)   { this.rgb[1] = pc.Math.limitAdd(this.rgb[0], -g, 0, 255); this._updateColorCache(); },

        /**
         * Sets the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        setBlue: function(b)    { this.rgb[2] = pc.Math.limit(b, 0, 255); this._updateColorCache(); },

        /**
         * Adds to the blue component of the color
         * @param {Number} b Blue component of the color to set
         */
        addBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], b, 0, 255); this._updateColorCache(); },

        /**
         * Subtracts from the blue component of the color
         * @param {Number} b Blue component
         */
        subBlue: function(b)    { this.rgb[2] = pc.Math.limitAdd(this.rgb[0], -b, 0, 255); this._updateColorCache(); },

        /**
         * Darkens the color by the given value (1..255)
         * @param {Number} amt Amount to darken the color by
         */
        darken:function (amt)
        {
            this.subRed(amt);
            this.subGreen(amt);
            this.subBlue(amt);
        },

        /**
         * Lightens the color by the given amount (1..255)
         * @param {Number} amt Amount to lighten the color by
         */
        lighten: function(amt)
        {
            this.addRed(amt);
            this.addGreen(amt);
            this.addBlue(amt);
        },

        _updateColorCache: function()
        {
            // todo: this is constructing a string on every adjustment: can we save on that?
            this.color = 'rgb(' + this.rgb[0] + ',' + this.rgb[1] + ',' + this.rgb[2] + ')';
        }


    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DebugPanel
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * This class is used to create the real-time debugging panels. An instance of this class is automatically constructed
 * by the pc.device system. When onReady is triggered the panel will automatically attach to a canvas element with the
 * id 'debug'.
 * <p>
 * <pre><code>
 * &ltcanvas id="debug"&gt&lt/canvas&gt
 * </code></pre>
 * The debug panel will automatically size to the available space in the canvas element.
 * <p>
 * You can gain access to the debug panel through pc.device.debugPanel member.
 */

pc.DebugPanel = pc.Base('pc.DebugPanel',
    {},
    /** @lends pc.DebugPanel.prototype */
    {
        x:0,
        y:0,
        panelHeight:0,
        panelWidth:0,
        canvas:null,
        ctx:null,
        statusText:null,
        active:false,
        timeGraph:null,
        memGraph:null,
        entityGraph:null,
        poolGraph:null,
        currentMem:0,
        lastMem:0,

        init:function ()
        {
            this._super();
        },

        onReady:function ()
        {
            this.attach('pcDebug');
        },

        /**
         * Attach the debug panel to a canvas element with the supplied id
         * @param {String} canvasElement Id of a canvas element to attach to
         */
        attach:function (canvasElement)
        {
            this.canvas = document.getElementById(canvasElement);
            if (this.canvas == null)
            {
                this.warn('Showing debug requires a div with an id of "debug" to be added to your dom.');
                pc.device.showDebug = false;
                return;
            }

            // resize the canvas to be the size of it's parent (containing element)
            this.panelElement = this.canvas.parentNode;
            this.ctx = this.canvas.getContext('2d');
            this.onResize();

            var np = 4;
            // create the graphs
            this.timeGraph = new pc.CanvasLineGraph(this.ctx, 'Performance', '', 10,
                [
                    {name:'process (ms)', color:'#f55'},
                    { name:'render (ms)', color:'#5f5'}
                ], 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);

            if (typeof console.memory === 'undefined' || console.memory.totalJSHeapSize == 0)
            {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', 'Memory profiling not available', 0,
                    [
                        {name:'mem used (mb)', color:'#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            } else
            {
                this.memGraph = new pc.CanvasLineGraph(this.ctx, 'Memory', '', ((console.memory.totalJSHeapSize / 1024 / 1024) * 1.2),
                    [
                        {name:'mem used (mb)', color:'#55f'}
                    ], (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 10, this.panelHeight - 20);
            }

            this.poolGraph = new pc.CanvasLineGraph(this.ctx, 'Pool Size', '', 100,
                [
                    {name:'pooled', color:'#5b1654'}
                ], this.panelWidth - ((this.panelWidth / np) * 2) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.entityGraph = new pc.CanvasLineGraph(this.ctx, 'Entities', '', 100,
                [
                    { name:'drawn (total)', color:'#f9f007'}
                ], this.panelWidth - (this.panelWidth / np) + 10, 10, (this.panelWidth / np) - 20, this.panelHeight - 20);

            this.active = true;
        },

        onResize:function ()
        {
            if (this.canvas == null) return;

            this.canvas.width = this.panelElement.offsetWidth;
            this.canvas.height = this.panelElement.offsetHeight;
            this.panelWidth = this.panelElement.offsetWidth;
            this.panelHeight = this.panelElement.offsetHeight;

            // clear the background
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.panelWidth, this.panelHeight);

            var np = 4;
            if (this.timeGraph != null)
                this.timeGraph.resize(10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.memGraph != null)
                this.memGraph.resize(this.panelWidth / np + 10, 10, this.panelWidth / np - 10, this.panelHeight - 20);
            if (this.poolGraph != null)
                this.poolGraph.resize(this.panelWidth - ((this.panelWidth / np) * 2) + 20, 10, this.panelWidth / np - 20, this.panelHeight - 20);
            if (this.entityGraph != null)
                this.entityGraph.resize(this.panelWidth - (this.panelWidth / np) + 10, 10, this.panelWidth / np - 20, this.panelHeight - 20);

        },

        _timeSince:0,

        update:function (delta)
        {
            if (!this.active) return;

            // update the averages
            this._timeSince += delta;
            if (this._timeSince > 30)
            {
                this._timeSince = 0;
                if (this.timeGraph != null)
                    this.timeGraph.addLine2(pc.device.lastProcessMS, pc.device.lastDrawMS);
                if (this.entityGraph != null)
                    this.entityGraph.addLine1(pc.device.elementsDrawn);
                if (this.memGraph != null)
                    if (typeof console.memory !== 'undefined')
                        if (console.memory.totalJSHeapSize != 0)
                            this.memGraph.addLine1((window.performance.memory.usedJSHeapSize / 1024 / 1024));
                if (this.poolGraph != null)
                    this.poolGraph.addLine1(gamecore.Pool.totalPooled);
            }
        },

        draw:function ()
        {
            if (!this.active) return;

            if (this.timeGraph != null)
                this.timeGraph.draw();
            if (this.entityGraph != null)
                this.entityGraph.draw();
            if (this.memGraph != null) this.memGraph.draw();
            if (this.poolGraph != null) this.poolGraph.draw();
        }

    });


/**
 * CanvasLineGraph -- a line bar graph designed to be update quickly (optimized drawing)
 * rendered onto a canvas. Used primarily by the debug panel to display pretty graphs
 * of performance, memory, entity and network graphs.
 */
pc.CanvasLineGraph = pc.Base.extend('pc.CanvasLineGraph', {

    height:0,
    width:0,
    ctx:null,
    data:null,
    maxY:0, // top most range value
    x:0,
    y:0,
    labels:null,
    graphName:null,
    bgCanvas:null, // off screen canvas for background (grid etc)
    graphCanvas:null, // off screen canvas for graph
    message:null,
    cursor:0, // position in the data array that is the head of the data

    init:function (ctx, graphName, message, maxY, labels, x, y, width, height)
    {
        this._super();

        this.ctx = ctx;
        this.message = message;
        this.graphName = graphName;
        this.maxY = maxY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.labels = labels;
        this.graphX = this.x + this.graphLeftMargin;
        this.graphY = this.y + 20;
        this.cursor = 0;

        this.graphCanvas = document.createElement('canvas');
        this.bgCanvas = document.createElement('canvas');

        this.resize(x, y, width, height);
    },

    resize:function (x, y, width, height)
    {
        // if the current graph line data is too big we need to resize it down
        if (this.width > width)
            this.data = this.data.slice(this.width - width, width);

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;

        // size the graph component
        this.graphHeight = this.height - 40;
        this.graphWidth = this.width - (this.graphLeftMargin + this.graphRightMargin);
        this.graphX = this.graphLeftMargin;
        this.graphY = 20;

        this.bgCanvas.width = this.width;
        this.bgCanvas.height = this.height;
        this.graphCanvas.width = this.graphWidth;
        this.graphCanvas.height = this.graphHeight;

        // resize the data array?
        this.resizeDataArray(this.graphWidth, this.labels.length);
        this.renderBackground();
    },

    resizeDataArray:function (newSize, numDataPoints)
    {
        var start = 0;
        if (newSize <= 0) return;

        if (this.data == null)
            this.data = [];
        else
        {
            // resize the array
            if (newSize > this.data.length) // growing?
            {
                start = this.data.length - 1;
            }
            else
            {
                // shrinking -- we cut from the begining
                this.data.splice(0, newSize - this.data.length);
                if (this.cursor > this.data.length - 1)
                    this.cursor = this.data.length - 1;
                return; // job done, no new init needed (it's smaller)
            }
        }

        // add some new data -- the array is expanding
        for (var i = start; i < newSize; i++)
            this.data.push(new Array(numDataPoints));
    },

    _totalAdded:0,
    linesSinceLastPeak:0, // set a new peak every n lines
    lastPeak:0,
    _total:0,

    // we use this to add multiple data items -- saves using variable length arrays (which chew
    // memory, thus we only currently support graphs with up to two data elements to a line.
    // if you want more, add an addLine3 method
    addLine2:function (lineData1, lineData2)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1 + lineData2;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this.data[this.cursor][1] = lineData2;
        this._updateGraph(this._total);
    },

    addLine1:function (lineData1)
    {
        if (!this.data) return;

        this._totalAdded++;
        this._total = lineData1;
        this.checkMaxRange(this._total);
        this.data[this.cursor][0] = lineData1;
        this._updateGraph(lineData1);
    },

    checkMaxRange:function (max)
    {
        if (max > this.maxY)
        {
            this.maxY = max * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;
            this.renderBackground();
            this.renderGraph(true);
        }
    },

    _updateGraph:function (total)
    {
        this.linesSinceLastPeak++;
        if (this.linesSinceLastPeak > this.width * 1.5)
        {
            this.linesSinceLastPeak++;
            this.maxY = total * 1.4;
            // make sure the absolute smallest number of axis is equal to the height of the graph
            if (this.maxY < this.height / this.gridLineInc)
                this.maxY = this.height / this.gridLineInc;

            this.lastPeak = total * 1.4;
            this.renderBackground();
            this.linesSinceLastPeak = 0;
        }

        if (total > this.lastPeak)
            this.lastPeak = total * 1.4;

        this.cursor++;
        if (this.cursor > this.data.length - 1)
            this.cursor = 0;

    },

    margin:20,
    linePixelSize:0,
    yline:0,
    unit:0,
    gridY:0,
    i:0,
    n:0,
    graphLeftMargin:30,
    graphRightMargin:15,
    graphHeight:0,
    graphWidth:0,
    graphX:0,
    graphY:0,
    gridLineInc:15,

    /**
     * Renders to an offscreen background canvas, which is only drawn on or resize
     */
    renderBackground:function ()
    {
        var ctx = this.bgCanvas.getContext('2d');

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // graph title
        ctx.fillStyle = '#aaa';
        ctx.font = '11px sans-serif';
        ctx.fillText(this.graphName, this.graphX, this.graphY - 6);

        // draw the surround rectangle
        ctx.strokeStyle = '#111';
        ctx.strokeRect(this.graphX + 0.5, this.graphY + 0.5, this.graphWidth, this.graphHeight);

        // DRAW GRID AND MARKERS (Y AXIS)
        this.unit = (this.graphHeight) / this.maxY; // figure out the y scale
        var graphLines = (this.graphHeight + this.gridLineInc) / this.gridLineInc;
        var axisInc = this.maxY / graphLines;
        var axisValue = 0;
        var lineCount = 0;

        for (this.gridY = this.graphHeight + this.graphY; this.gridY > this.graphY + 1; this.gridY -= this.gridLineInc)
        {
            lineCount++;
            ctx.textAlign = 'right';
            (lineCount % 2 == 0) ? ctx.fillStyle = '#111' : ctx.fillStyle = '#000';

            var lineHeight = this.gridLineInc;
            if (this.gridY - lineHeight < this.graphY)
            {
                lineHeight = (this.gridY - this.graphY);
                ctx.fillRect(this.graphX + 1, this.graphY + 1, this.graphWidth - 2, lineHeight - 1);
            } else
                ctx.fillRect(this.graphX + 1, this.gridY - lineHeight - 1, this.graphWidth - 2, lineHeight);

            axisValue = Math.round(axisInc * lineCount);
            ctx.fillStyle = '#777';
            ctx.fillText('' + axisValue, this.graphX - 5, this.gridY);
        }

        // DRAW LEGEND
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        var legendY = this.height - 13;
        var textX = this.graphLeftMargin + 3;

        for (this.n = 0; this.n < this.labels.length; this.n++)
        {
            ctx.fillStyle = this.labels[this.n].color;
            ctx.fillRect(textX, legendY, 5, 5);
            ctx.fillStyle = '#888';
            ctx.fillText(this.labels[this.n].name, textX + 8, legendY + 6);
            textX += ctx.measureText(this.labels[this.n].name).width + 18;
        }

        this.renderGraph(true);
    },

    renderGraph:function (completeRedraw)
    {
        if (!this.data) return;

        var gtx = this.graphCanvas.getContext('2d');
        if (completeRedraw)
        {
            gtx.fillStyle = '#000';
            gtx.fillRect(0, 0, this.graphWidth, this.graphHeight);
        } else if (this._totalAdded > this.graphWidth) // we are appending a line
            gtx.drawImage(this.graphCanvas, -1, 0); // so draw the previous graph shift by one

        // now draw a new line on the far right side
        var len = 0;

        if (completeRedraw)
        {
            len = this.data.length - 1;
            this.dx = 1;

        } else
        {
            // draw the first set of lines across, prior to scrolling
            if (this._totalAdded < this.graphWidth)
                this.dx = this.cursor;
            else
                this.dx = this.graphWidth - 1;
            len = this.dx + 1;
        }

        if (len == 0) return;

        // dx is the count of pixels across the screen
        // dpos is the cursor being drawn pointing inside the array
        var dpos = this.cursor - 1;
        if (dpos < 0) dpos = this.data.length - 1;

        for (; this.dx < len; this.dx++)
        {
            if (dpos > this.data.length - 1) dpos = 0;

            gtx.fillStyle = '#000';
            gtx.fillRect(this.dx, 0, 1, this.graphHeight);

            this.yline = this.graphHeight; // start at the bottom of the graph

            for (this.i = 0; this.i < this.data[dpos].length; this.i++)
            {
                this.linePixelSize = (this.data[dpos][this.i] * this.unit);

                gtx.strokeStyle = this.labels[this.i].color;
                gtx.beginPath();
                gtx.moveTo(this.dx, this.yline);

                var lineY = this.yline - this.linePixelSize;
                if (lineY < 0)
                    lineY = 0;
                gtx.lineTo(this.dx, lineY);
                gtx.closePath();
                gtx.stroke();

                this.yline -= this.linePixelSize;
            }
            dpos++;
        }

    },

    draw:function ()
    {
        this.ctx.save();
        this.ctx.drawImage(this.bgCanvas, this.x, this.y);
        this.renderGraph(false);
        this.ctx.globalAlpha = 0.4;
        this.ctx.drawImage(this.graphCanvas, this.x + this.graphX, this.y + this.graphY);

        // draw the message over the top, if there is one
        if (this.message)
        {
            this.ctx.font = '13px sans-serif';
            this.ctx.fillStyle = '#333';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.message, this.x + this.width / 2, this.y + this.height / 2 - 9);
        }
        this.ctx.restore();
    }

});

/**
 * Playcraft Engine
 * System - the interface between the device (the real world) and the game
 */

/**
 * @class pc.Device
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * pc.Device is the primary interface between your game and the underlying hardware. It's a singleton instance
 * that will be constructed automatically and is globally accessible at all times as pc.device
 * <p>
 * pc.device will automatically be setup once pc.JSLoader has completed loading all required javascipt through a call
 * to pc.device.boot passing in the Id of the canvas element for your game as well as the name of the game class
 * which pc.device will then dynamically construct. Typically you do not need to construct your own pc.Device, pc.start
 * will take care of it for you.
 */
pc.Device = pc.Base.extend('pc.Device',
    { },
    /** @lends pc.Device.prototype */
    {
        /** element Id of the game canvas */
        canvasId:null,
        /** canvas element upon which all drawing will occur */
        canvas:null,
        /** width of the current canvas */
        canvasWidth:0,
        /** height of the current canvas */
        canvasHeight:0,
        /** resource loader */
        loader:null,

        timer:null,
        /** current 2D draw context */
        ctx:null,
        started:false,
        /** current requested frame rate */
        fps:0,
        /** last cycle frame rate */
        currentFPS:0,
        tick:0, // ms per cycle (just 1000/fps for convenience)

        /** whether the device is running */
        running:true,

        /** global render scale */
        scale:1,
        xmlParser:null,

        // debug related
        debugPanel:null,
        /** whether the debug panel should be updated/drawn */
        showDebug:true,
        /** whether the game is running in development mode; false = production */
        devMode: true,
        enablePooling:true,
        /** whether sound is enabled */
        soundEnabled:true,

        /** number of elements drawn in the last cycle */
        elementsDrawn:0,
        /** how long in ms the last process cycle took */
        lastProcessMS:0,
        /** how long in ms the last draw cycle took */
        lastDrawMS:0,

        // device information
        /** pc.Rect of the current screen dimensions */
        screen:null, // the device's screen dimensions (i.e. the display)
        /** pixel ratio of the screen -- typically 1 unless on a retina display where it's 2 */
        pixelRatio:1,
        /** is this device an iPhone */
        isiPhone:false,
        /** is this device an iPhone 4 */
        isiPhone4:false,
        /** is this device an iPad*/
        isiPad:false,
        /** is this device an Android*/
        isAndroid:false,
        /** is this a touch device */
        isTouch:false,

        requestAnimFrame:null,
        /** pc.Input handler global instance */
        input:null,
        /** the name of the game class that was constructed */
        gameClass: null,
        /** the game object constructed at startup */
        game: null, // the currently running instance of the gameClass

        /** amount of time the last cycle took in ms */
        elapsed:0,
        /** time the last frame cycle was started */
        lastFrame:0,
        /** the time now */
        now:Date.now(),

        /**
         * Setup the system interface for the game. Typically this will just be automatically called
         * by the game object and you don't need to worry about it.
         */
        boot:function (canvasId, gameClass)
        {
            if (this.devMode)
                this.info('Playcraft Engine v' + pc.VERSION + ' starting');
            this.canvasId = canvasId;
            this.gameClass = gameClass;
            this.fps = 60;
            this.tick = 1000 / this.fps;

            this.debugPanel = new pc.DebugPanel();
            this.input = new pc.Input();
            this.loader = new pc.Loader();
            this.isAppMobi = (typeof AppMobi != "undefined");

            this.pixelRatio = gamecore.Device.pixelRatio;
            this.isiPhone = gamecore.Device.isiPhone;
            this.isiPhone4 = gamecore.Device.isiPhone4;
            this.isiPad = gamecore.Device.isiPad;
            this.isAndroid = gamecore.Device.isAndroid;
            this.isTouch = gamecore.Device.isTouch;
            this.device = gamecore.Device;

            this.requestAnimFrame = gamecore.Device.requestAnimFrame;
            this.requestAnimFrame = (function ()
            {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element)
                        {
                            window.setTimeout(callback, 1000 / this.fps);
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element)
                {
                    request.apply(window, [callback, element]);
                };
            })();

            window.onresize = this.onResize.bind(this);
            this.onReady();
        },

        /**
         * Indicates whether a sound format is playable on the current device
         * @param {String} format Sound format to test: 'mp3', 'ogg' or 'wav'
         * @return {Boolean} True is the format can be played
         */
        canPlay: function(format)
        {
            return gamecore.Device.canPlay(format);
        },

        _calcScreenSize:function ()
        {
            if (this.isAppMobi)
            {
                if (this.screen != null)
                    this.screen.release();
                this.screen = pc.Dim.create(document.body.offsetWidth, document.body.offsetHeight);

                this.canvas.width = this.screen.x;
                this.canvas.height = this.screen.y;
                this.canvas.innerWidth = this.screen.x;
                this.canvas.innerHeight = this.screen.y;
                this.canvasWidth = this.screen.x;
                this.canvasHeight = this.screen.y;
            } else
            {
                // if the game canvas is in a surrounding div, size based on that
                if (this.isiPad || this.isiPhone)
                {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;

                } else
                {
                    if (this.panelElement)
                    {
                        this.canvas.width = this.panelElement.offsetWidth;
                        this.canvas.height = this.panelElement.offsetHeight;
                    }
                }

                this.canvasWidth = this.canvas.width;
                this.canvasHeight = this.canvas.height;

                this.screen = pc.Dim.create(this.canvasWidth, this.canvasHeight);

            }
        },

        /**
         * Automatically called once the device is ready
         */
        onReady:function ()
        {
            if (this.isiPad)
            {
                this.showDebug = false;
                this.soundEnabled = false;
            }

            if (this.started) return; // check we haven't already started
            this.game = eval('new ' + this.gameClass + '()');
            if (!this.game)
                throw "Invalid game class";

            this.canvas = document.getElementById(this.canvasId);
            if (!this.canvas)
                throw 'Abort! Could not attach to a canvas element using the id [' + this.canvasId + ']. ' +
                    'Add a canvas element to your HTML, such as <canvas id="pcGameCanvas"></canvas>';
            this.input._onReady();
            this.ctx = this.canvas.getContext('2d');

            // automatically resize to match my parent container
            this.panelElement = this.canvas.parentNode;
            this.onResize();

            // experimental webgl renderer
            // WebGL2D.enable(this.canvas); // adds "webgl-2d" to cvs
            // this.ctx = this.canvas.getContext('webgl-2d');

            // init the debug panel
            if (this.showDebug)
                this.debugPanel.onReady();

            // start the editor
            //if (this.editor)
            //    this.editor.onReady();

            this.lastFrame = Date.now();

            // give the game a chance to do something at the start
            // construct the game class and fire onReady

            this.game.onReady();

            // start the central game timer
            this.requestAnimFrame(this.cycle.bind(this));

            this.started = true;
        },

        startTime:0,

        /**
         * Called once per game cycle
         * @param time System time in ms
         */
        cycle:function (time)
        {
            if (this.running !== false)
            {
                this.now = Date.now();
                this.elapsed = this.now - this.lastFrame;
                this.lastDrawMS = 0;

                this.currentFPS = Math.round(1000.0 / this.elapsed);
                this.elementsDrawn = 0;

                this.startTime = Date.now();
                // do not render frame when delta is too high
                if (this.elapsed < 200)
                    this.running = this.game.process();
                this.lastProcessMS = (Date.now() - this.startTime) - this.lastDrawMS;

                // process the input system
                pc.device.input.process();

                if (this.showDebug)
                {
                    this.debugPanel.update(this.elapsed);
                    this.debugPanel.draw(this.ctx);
                }
                this.lastFrame = this.now;
                this.requestAnimFrame(this.cycle.bind(this));
            }

        },

        /**
         * Requests a resize of the canvas based on the supplied dimensions
         * @param {Number} w Width of the canvas
         * @param {Number} h Hight of the canvas
         */
        resize:function (w, h)
        {
            this.canvas.width = w;
            this.canvas.height = h;
            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize(this.canvasWidth, this.canvasHeight);
        },

        /**
         * Called when the primary display canvas has changed size in the browser
         */
        onResize:function ()
        {
            if (this.canvas == null) return;

            this._calcScreenSize();

            var flip = false;
            if (typeof window.orientation !== 'undefined' && window.orientation != 0)
                flip = true;

            if (flip)
            {
                // in landscape, flip things around
                var w = this.canvas.width;
                this.canvas.width = this.canvas.height;
                this.canvas.height = w;
            }

            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;

            this.game.onResize(this.canvasWidth, this.canvasHeight);
            this.debugPanel.onResize();
        },

        /**
         * Test whether a given rectangle overlaps any part of the device screen
         * @param {Number} x x position of the top left of the rectangle to test
         * @param {Number} y y position of the top left of the rectangle to test
         * @param {Number} w width of the rectangle
         * @param {Number} h height of the rectangle
         * @return {Boolean} true is it's on screen
         */
        isOnScreen:function (x, y, w, h)
        {
            return pc.Math.isRectColliding(x, y, w, h, 0, 0, this.canvasWidth, this.canvasHeight);
        },

        /**
         * Parses XML and returns an XMLDoc
         */
        parseXML:function (xml)
        {
            if (window.DOMParser)
            {
                // standard
                if (!this.xmlParser)
                    this.xmlParser = new DOMParser();
                return this.xmlParser.parseFromString(xml, "text/xml");

            } else // ie
            {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.loadXML(xml);
                return xmlDoc;
            }
        }

    });


// the singleton system by which we reference the device and setup events
pc.device = new pc.Device();
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sound
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A sound resource can be loaded from a URI and played, including support for managing multichannel sound
 * (playing multiple sounds at once) and different formats used by different browsers.
 * <p>
 * In order to support all modern browsers, sounds need to be provided in both 'ogg' and 'mp3' formats. This is
 * becuase IE supports mp3 (but not ogg), chrome supports ogg and mp3, but safari and firefox only supports ogg. You
 * will need to create sound files into both ogg and mp3 to support all browsers.
 * <p>
 * To play a sound, you first need to load it from a URI:
 * <p><pre><code>
 * // check if sound is enabled
 * if (pc.device.soundEnabled)
 * {
 *    // add the sound to the resource loader
 *    pc.device.loader.add(
 *       // construct a new sound named shotgun, loading formats for
 *       // ogg and mp3 (shotgun.mp3 and shotgun.ogg)
 *       // and setup to play up to 5 of these sounds simultaneously
 *       new pc.Sound('shotgun', 'sounds/shotgun', ['ogg', 'mp3'], 5));
 * }
 * </code></pre>
 * <p>
 * Once you have the sound loaded you can play it:
 * <pre><code>
 * // grab the sound resource from the resource loader
 * var shotgunSound = pc.device.loader.get('shotgun').resource;
 * // play the sound (without looping)
 * shotgunSound.play(false);
 * </code></pre>
 * <p>
 * If the sound is looping, or it's a long sound you can stop it:
 * <pre><code>
 * shotgunSound.stop();
 * </code></pre>
 * You can adjust the volume of a sound:
 * <pre><code>
 * // set the volume to 50%
 * shotgunSound.setVolume(0.5);
 * </code></pre>
 * <p>
 * You can also change the starting position of sound or music using setPlayPosition:
 * <pre><code>
 * // start half way through
 * shotgunSound.setPlayPosition( shotgunSound.getDuration() / 2 );
 * </code></pre>
 */

pc.Sound = pc.Base.extend('pc.Sound', {},
    /** @lends pc.Sound.prototype */
    {
        /** Array of the sound elements -- multichannel sound requires multiple element copies to play */
        sounds: [],
        /** Source URI for the sound resource */
        src:null,
        /** String name for the sound */
        name: null,
        /** Number of sounds loaded */
        numLoaded: 0,
        /** Whether the sound is loaded */
        loaded:false,
        /** Whether an error occured loading the sound */
        errored:false,
        /** Number of channels for the sound. No more than this number can be played at once */
        channels:1,
        /** Optional call back once the sound is loaded */
        onLoadCallback:null,
        /** Optional call back if the sound errors whilst loading */
        onErrorCallback:null,

        /**
         * Construct a new sound, if the resource loader has already start the sound will be immediately loaded.
         * @param {String} name Resource name (tag) you want to use
         * @param {String} src URI for the sound
         * @param {Number} channels Number of channels this sound can play at once
         * @param {Function} [onLoadCallback] Function to be called once the sound has been loaded (including all channels)
         * @param {Function} [onErrorCallback] Function to be called if the sound fails to load (on first error)
         */
        init:function (name, src, formats, channels, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.name = name;
            this.channels = channels;

            // append an extension to the src attribute that matches the format with what the device can play
            var canplay = false;
            for (var i=0; i < formats.length; i++)
            {
                if (pc.device.canPlay(formats[i]))
                {
                    this.src = pc.device.loader.makeUrl(src + '.' + formats[i]);
                    canplay = true;
                    break; // we set the src based on the first type we find (in the order they are provided)
                }
            }

            if (canplay)
            {
                if (pc.device.loader.started) // load now if the loader has already been started
                    this.load(onLoadCallback, onErrorCallback);
            } else
                this.errored = true;
        },

        /**
         * Pauses the sound (on all channels)
         */
        pause: function()
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].pause();
        },

        /**
         * Stop playing a sound (on all channels) -- actually just a synonym for pause
         */
        stop: function()
        {
            if (!this.canPlay()) return;
            this.pause();
        },

        /**
         * Volume to play the sound at
         * @param {Number} volume Volume as a range from 0 to 1 (0.5 is half volume)
         */
        setVolume: function(volume)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].volume = volume;
        },

        /**
         * Gets the duration of the sound in seconds
         * @return {Number} The duration in seconds
         */
        getDuration: function()
        {
            if (!this.canPlay()) return -1;
            return this.sounds[0].duration;
        },

        /**
         * Sets the playback rate of the sound where 0 is not playing and 2 is double speed. Negative values cause
         * the sound to play backwards.
         * WARNING: Only currently supported by Safari and Chrome.
         * @param {Number} r The speed to play the sound at
         */
        setPlaybackRate:function (r)
        {
            if (!this.canPlay()) return;
            for (var i = 0, len = this.sounds.length; i < len; i++)
                this.sounds[i].playbackRate = r;
        },

        /**
         * Start playing the sound at the specified time (instead of 0)
         * @param {Number} time time (in seconds to start at)
         */
        setPlayPosition: function(time)
        {
            if (!this.canPlay()) return;
            for (var i=0, len=this.sounds.length; i < len; i++)
                this.sounds[i].currentTime = time;
        },

        /**
         * Load a sound. If the game hasn't started then the sound resource
         * will be added to the resource manager's queue.
         * @param {Function} onLoadCallback function to call once the sound is loaded
         * @param {Function} onLoadCallback function to call if the sound errors
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            // user customized callbacks
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback)
            {
                this.onLoadCallback(this);
                return;
            }
            // load up multiple copies of the sound, one for each channel
            for (var i=0; i < this.channels; i++)
            {
                var n = new Audio();
                n.preload = 'auto';

                // setup event handlers for this class -- we'll call the callbacks from there
                n.addEventListener("canplaythrough", this.onLoad.bind(this), false);
                n.addEventListener("error", this.onError.bind(this), false);
                n.onerror = this.onError.bind(this);
                n.src = this.src;
                this.sounds.push(n);

                if (pc.device.isAppMobi)
                    // force an onload for appmodi -- since it wont create one and the load is almost instant
                    this.onLoad(null);
            }
        },

        /**
         * Force this sound to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.errored = false;
            this.load();
        },

        onLoad:function (ev)
        {
            this.numLoaded++;

            // remove the event listener so we don't get this happening multiple times
            if (!pc.device.isAppMobi)
                ev.target.removeEventListener("canplaythrough", this.onLoad.bind(this), false);

            if (this.numLoaded == this.channels)
            {
                this.loaded = true;
                this.errored = false;
                if (this.onLoadCallback)
                    this.onLoadCallback(this);
            }
        },

        onError:function ()
        {
            this.errored = true;
            this.loaded = false;
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Plays a sound
         * @param {Boolean} loop True if you want the sound to just keep looking.
         * @return {Object} Sound element that was played
         */
        play:function(loop)
        {
            if (!this.canPlay()) return null;

            // find a free channel and play the sound (if there is one free)
            for (var i=0, len=this.sounds.length; i < len; i++)
            {
                if (this.sounds[i].paused || this.sounds[i].ended)
                {
                    if (loop)
                        this.sounds[i].loop = true;
                    this.sounds[i].play();
                    return this.sounds[i];
                }
            }

            // no sounds were free, so we just do nothing
            this.warn(this.name + ' - all channels are in use');
            return null;
        },

        /**
         * @return {Boolean} true if the sound can be played
         */
        canPlay: function()
        {
            return (this.loaded && pc.device.soundEnabled && !this.errored);
        }


    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Layer
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A layer is a container for drawing and processing game elements. Layer's are contained with a
 * <a href='pc.Scene'>pc.Scene</a> which automatically handles calling the process and draw methods.
 * <p>
 * You can use the pc.Layer class to create your own custom layers, though typically <a href='pc.TileLayer'>
 * pc.TileLayer</a> and <a href='pc.EntityLayer'>pc.EntityLayer</a> should be used for typical game levels.
 * <p>
 * To create your own custom level, derive from pc.Level and override the draw and process methods:
 * <pre><code>
 * // construct a scene and add it to the game
 * myGameScene = new GameScene();
 *
 * // create your own layer class
 * MyLayer = pc.Layer.extend('MyLayer',
 * {},
 * {
 *    // override draw to do custom layer drawing
 *    draw:function()
 *    {
 *       // draw a rectangle
 *       pc.device.ctx.fillStyle = '#fff';
 *       pc.device.ctx.fillRect(0, 0, 10, 10);
 *    }
 *
 *    // override process to update or change things
 *    process:function()
 *    { }
 * });
 *
 * // construct the custom layer and add it to the scene
 * var myLayer = new MyLayer('Test layer', 1);
 * myGameScene.addLayer(myLayer);
 * </code></pre>
 * <h5>Pause/Resume</h5>
 * Layers can be paused/resumed, which will stop drawing and processing of a layer.
 * <pre><code>
 * myLayer.pause();
 * myLayer.resume();
 * </code></pre>
 * <h5>Z-Order Drawing</h5>
 * Layers support z-order draw sorting within their scenes. To change the z-order, either construct the layer
 * using a zIndex parameter, or call setZIndex to change the draw order layer
 * <p>
 * <h5>Origins and Parallax</h5>
 * A layer has an optional origin that can be used to use the layer as a viewport into a large world.
 * By changing the origin you can pan and move a layer. You should then use screenX() and screenY() to
 * modify where an element is drawn relative to layer's current origin offset.
 * <p>
 * <pre><code>
 * draw:function()
 * {
 *    // draw a rectangle (at world coordinate 100, 100)
 *    pc.device.ctx.fillStyle = '#fff';
 *    pc.device.ctx.fillRect(this.screenX(100), this.screenY(100), 10, 10);
 * }
 *
 * // override process to update or change things
 * process:function()
 * {
 *    // pan the origin to the right by 1 pixel every cycle
 *    this.setOrigin( this.origin.x + 1, 0);
 * }
 * </code></pre>
 * <p>
 * To center a layer around a player object set its origin to position the player at half the viewport width
 * and height. This should be done on every game update:
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 * }
 * </pre></code>
 * <p>
 * You can achieve parallax effects by panning one layer at a different rate to others. For example, changing
 * the origin of a background layer at a ratio to the main layer (this is most commonly done in a scene.process method):
 * <pre><code>
 * process:function()
 * {
 *    myLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2),
 *       playerPos.y - (this.viewPort.h / 2));
 *
 *    // pan the background at 10% of the speed of the
 *    myBackgroundLayer.setOrigin(
 *       playerPos.x - (this.viewPort.w / 2) / 10,
 *       playerPos.y - (this.viewPort.h / 2) / 10);
 * }
 * </pre></code>
 * <p>
 * When you have many layers tracking a single origin it can be a pain to keep them all up to date, so to make life easier
 * you can have a layer automatically track another layer's origin, including a ratio for parallax effects:
 * <pre><code>
 * // Automatically keep the background layer's origin relative to myLayer's
 * // at a ratio of 10:1 (slow panning)
 * myBackgroundLayer.setOriginTrack( myLayer, 10 );
 * </code></pre>
 */

pc.Layer = pc.Base.extend('pc.Layer', {},
    /** @lends pc.Layer.prototype */
    {
        /** Name of the layer */
        name:null,
        /** whether the layer is presently paused */
        paused:false,
        /** whether the layer is active (isActive should be used over this as it also checks whether
         * the scene is active */
        active:false,
        /** the scene this layer is within */
        scene:null,
        /** draw order of this layer, lower draws first (use setZIndex method to change in order to update the scene) */
        zIndex:0,
        /** current origin track -- layer's origin will automatically match the origin of another layer */
        originTrack:null,
        /** ratio of origin tracking on X */
        originTrackXRatio:1,
        /** ratio of origin tracking on Y */
        originTrackYRatio:1,

        /**
         * World coordinate origin for this layer
         */
        origin:null,

        /**
         * @constructs pc.Layer
         * @param {String} name Name you want to give the layer
         * @param {Number} zIndex Draw order for this layer within it's scene (lower draws earlier)
         */
        init:function (name, zIndex)
        {
            this._super();

            this.name = name;
            this.origin = pc.Point.create(0, 0);
            this._worldPos = pc.Point.create(0, 0);
            this._screenPos = pc.Point.create(0, 0);
            this.zIndex = pc.checked(zIndex, 0);
            this.originTrack = null;
            this.originTrackXRatio = 0;
            this.originTrackYRatio = 0;
        },

        /**
         * @return {String} A nice string representation of the layer
         */
        toString:function ()
        {
            return '' + this.name + ' (origin: ' + this.origin + ', zIndex: ' + this.zIndex + ')';
        },

        release:function ()
        {
            this.origin.release();
        },

        /**
         * @return {Boolean} Is this layer active, and is it within a scene that is active
         */
        isActive:function ()
        {
            if (this.scene != null)
                if (!this.scene.active) return false;
            return this.active;
        },

        /**
         * Make this layer active
         */
        setActive:function ()
        {
            this.scene.setLayerActive(this);
        },

        /**
         * Make this layer inactive
         */
        setInactive:function ()
        {
            this.scene.setLayerInactive(this);
        },

        /**
         * Change the z order drawing for this layer (lower draws earlier)
         * @param {Number} z index as a value > 0
         */
        setZIndex:function (z)
        {
            this.zIndex = z;
            if (this.scene)
                this.scene.sortLayers();
        },

        _worldPos:null, // cached temp

        /**
         * Gets the world position of a screen position.
         * @param pos {pc.Point} World position of this layer (cached, so you don't need to release it)
         */
        worldPos:function (pos)
        {
            this._worldPos.x = pos.x + this.origin.x;
            this._worldPos.y = pos.y + this.origin.y;
            return this._worldPos;
        },

        _screenPos:null, // cached temp
        /**
         * Get a screen relative position from a world coordinate.
         * @param {pc.Point} pos World relative position
         */
        screenPos:function (pos)
        {
            this._screenPos.x = this.worldYToScreen(pos.x);
            this._screenPos.y = this.worldYToScreen(pos.y);
            return this._screenPos;
        },

        /**
         * @param {Number} x X position in world co-ordinates
         * @return {Number} X position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenX:function (x)
        {
            return x + this.scene.viewPort.x - this.origin.x;
        },

        /**
         * @param {Number} y Y position in world co-ordinates
         * @return {Number} Y position relative to the screen (based on the layer's current origin and the viewport
         * of the scene)
         */
        screenY:function (y)
        {
            return y + this.scene.viewPort.y - this.origin.y;
        },

        /**
         * A layer uses whatever screen rectangle is defined by the scene it sits within,
         * so this is just a helper method (and makes it compliant for things like input checking)
         */
        getScreenRect:function ()
        {
            return this.scene.getScreenRect();
        },

        /**
         * Draw the layer's scene. Use the scene's viewport and origin members to correctly position things.
         * Typical used for simple/custom layers with no entities or tiles.
         */
        draw:function ()
        {
        },

        /**
         * Sets tracking for this origin to always follow the origin of another layer. The ratio can be used
         * to parallax the layer.
         * @param {pc.Layer} trackLayer Layer to track
         * @param {Number} [xRatio] Ratio to track horizontally (i.e. trackLayer.origin.x * xRatio)
         * @param {Number} [yRatio] Ratio to track vertically (i.e. trackLayer.origin.y * yRatio)
         */
        setOriginTrack:function (trackLayer, xRatio, yRatio)
        {
            this.originTrack = trackLayer;
            this.originTrackXRatio = pc.checked(xRatio, 1);
            this.originTrackYRatio = pc.checked(yRatio, 1);
        },

        /**
         * Sets the origin world point of the top left of this layer.
         * @param {Number} x Set offset origin for the layer to x
         * @param {Number} y Set offset origin for the layer to y
         */
        setOrigin:function (x, y)
        {
            if (this.origin.x == Math.round(x) && this.origin.y == Math.round(y))
                return false;
            this.origin.x = Math.round(x);
            this.origin.y = Math.round(y);
            return true;
        },

        /**
         * Process the layer (if you overide this method make sure you call this._super();
         */
        process:function ()
        {
            if (this.originTrack)
            {
                this.setOrigin(this.originTrack.origin.x * this.originTrackXRatio,
                    this.originTrack.origin.y * this.originTrackYRatio);
            }
        },

        /**
         * Pauses this layer
         */
        pause:function ()
        {
            this.paused = true;
        },

        /**
         * Resumes all active layers
         */
        resume:function ()
        {
            this.paused = false;
        },

        /**
         * Called when the layer changes size (triggered by a browser or device resize event)
         * @param {Number} width New width of the underlying canvas
         * @param {Number} height New height of the underlying canvas
         */
        onResize:function (width, height)
        {
        },

        /**
         * Notification call when this layer has been added to a scene
         */
        onAddedToScene:function ()
        {
        },

        /**
         * Notification call when this layer has been removed from a scene
         */
        onRemovedFromScene:function ()
        {
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your layer to do something about it.
         * @param {String} actionName The name of the action that happened
         * @param {Object} event Raw event object
         * @param {pc.Point} pos Position, such as a touch input or mouse position
         * @param {pc.Base} uiTarget the uiTarget where the action occurred
         */
        onAction:function (actionName, event, pos, uiTarget)
        {
        }

    });








/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * An entity layer is a container for <a href='pc.Entity'>entities</a> and systems.
 * See the <a href='../guides/entitysystems'>entity systems</a> guide for more information on how components,
 * entities and systems work together.
 * <p>
 * An entity layer is constructed similarly to a regular layer, except it also has a distinct 'world' size
 * which can be referenced by systems.
 * <pre><code>
 * var entityLayer = new pc.EntityLayer('my entity layer', 10000, 10000);
 * </code></pre>
 * The entity layer will automatically construct both an <a href='pc.EntityManager'>pc.EntityManager</a> and a
 * <a href='pc.SystemManager'>pc.SystemManager</a>.
 * <p>
 * Once you have an entity layer created you will need to add it to the scene:
 * <pre><code>
 * myScene.addLayer(entityLayer);
 * </code></pre>
 * You can then add entities to the layer:
 * <pre><code>
 * // create a new entity (it will automatically be added to the
 * // entity layer specified in the constructor
 * var box = pc.Entity.create(entityLayer);
 * box.addComponent( pc.components.Rect.create({ color:#ffffff }) );
 * </code></pre>
 * Entity layers are driven by systems, which must be added to the layer in order for anything to happen.
 * When you add components to an entity, you must also remember to add the corresponding system to the layer where
 * the entity exists. You can see which systems are required for components in the "used by" list in the component
 * API documentation.
 * <p>
 * To add a system, just construct it and call addSystem:
 * <pre><code>
 * // fire up the systems we need for the game layer
 * entityLayer.addSystem(new pc.systems.Physics());
 * entityLayer.addSystem(new pc.systems.Particles());
 * entityLayer.addSystem(new pc.systems.Effects());
 * entityLayer.addSystem(new pc.systems.Render());
 * </code></pre>
 *
 */
pc.EntityLayer = pc.Layer.extend('pc.EntityLayer',
    /** @lends pc.EntityLayer */
    {
        /**
         * Creates an entity layer from a TMX layer XML data resource
         * @param {String} scene
         * @param {String} groupXML
         * @param {pc.EntityFactory} entityFactory
         */
        loadFromTMX:function (scene, groupXML, entityFactory)
        {
            var layerName = groupXML.getAttribute('name');

            // create the new layer and add it to the scene - when you have the name
            var n = new pc.EntityLayer(layerName);
            scene.addLayer(n);

            // Parse object xml instances and turn them into entities
            // XML = <object type="EnemyShip" x="2080" y="256" width="32" height="32"/>
            var objs = groupXML.getElementsByTagName('object');
            for (var i = 0; i < objs.length; i++)
            {
                var objData = objs[i];
                var entityType = null;
                var x = parseInt(objData.getAttribute('x'));
                var y = parseInt(objData.getAttribute('y'));
                var w = parseInt(objData.getAttribute('width'));
                var h = parseInt(objData.getAttribute('height'));
                var props = objData.getElementsByTagName("properties")[0].getElementsByTagName("property");

                var options = {};
                for (var p = 0; p < props.length; p++)
                {
                    var name = props[p].getAttribute("name");
                    var value = props[p].getAttribute("value");
                    options[name] = value;
                    if (name === 'entity')
                        entityType = value;
                }

                // create a new entity
                // ask the entity factory to create entity of this type and on this layer
                //
                if (entityType)
                    entityFactory.createEntity(n, entityType, x, y, w, h, options);
                else
                    this.warn('Entity loaded from map with no "entity" type property set. x=' + x + ' y=' + y)
            }

        }

    },
    /** @lends pc.EntityLayer.prototype */
    {
        /** Size of the world */
        worldSize:null,

        /** Entity manager for this layer */
        entityManager:null,

        /** System manager for this layer */
        systemManager:null,

        /**
         * @param {String} name Name of the layer
         * @param {Number} worldSizeX X size of the world in pixels
         * @param {Number} worldSizeY Y size of the world in pixels
         * @param {pc.EntityFactory} entityFactory Optional factory class to use to construct entities (primarily
         * used by level loaders to create entities specified in map files.
         */
        init:function (name, worldSizeX, worldSizeY, entityFactory)
        {
            this._super(name);
            this.entityFactory = entityFactory;
            this.systemManager = new pc.SystemManager();
            this.entityManager = new pc.EntityManager(this.systemManager);
            this.entityManager.layer = this;
            this.systemManager.layer = this;

            this.worldSize = pc.Dim.create(pc.checked(worldSizeX, 10000), pc.checked(worldSizeY, 10000));
        },

        /**
         * Sets the origin for the layer
         * @param {Number} x x origin to set
         * @param {Number} y y origin to set
         * @return {Boolean} Whether the origin actually changed (was it already set to the passed in origin)
         */
        setOrigin:function (x, y)
        {
            var didChange = this._super(x, y);
            if (didChange)
                this.systemManager.onOriginChange(x, y);
            return didChange;
        },

        /**
         * Get the entity manager for this layer
         * @return {pc.EntityManager}
         */
        getEntityManager:function ()
        {
            return this.entityManager;
        },

        /**
         * Get the system manager for this layer
         * @return {pc.SystemManager}
         */
        getSystemManager:function ()
        {
            return this.systemManager;
        },

        /**
         * Add a system to the layer
         * @param {pc.systems.System} system The system to add to the layer
         */
        addSystem:function (system)
        {
            this.systemManager.add(system, this.entityManager);
        },

        /**
         * Gets all the systems that can handle a given component type, such as 'physics'
         * @param {String} componentType Type of component to match
         * @return {pc.LinkedList} Linked list of systems that match
         */
        getSystemsByComponentType:function (componentType)
        {
            return this.systemManager.getByComponentType(componentType);
        },

        /**
         * Removes a system from this layer's system manager
         * @param {pc.systems.System} system The system to remove
         */
        removeSystem:function (system)
        {
            this.systemManager.remove(system);
        },

        /**
         * Master process for the layer
         */
        process:function ()
        {
            this._super();
            this.systemManager.processAll();
            this.entityManager.cleanup();
        },

        /**
         * Called automatically when the viewport is changing size.
         * @param {Number} width Width to resize to
         * @param {Number} height Height to resize to
         */
        onResize:function (width, height)
        {
            this.systemManager.onResize(width, height);
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileSet
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * @description
 * A set of tiles consisting of a spritesheet, types and properties map. You can use a tile set to define the types
 * of tiles you want to appear in a <a href='pc.TileMap'>tile map</a> (and thus a <a href='pc.TileLayer'>tile layer</a>).
 * <p>
 * To construct a tile set, use a spritesheet containing the tile images you want to use:
 * <pre><code>
 * var tileSet = new pc.TileSet(tileSheet);
 * </code></pre>
 * Tiles are references by number, sequentially from the top and then across the spritesheet. Each tile number
 * corresponds to one frame of the spritsheet. There is presently no support for animated tiles.
 * <p>
 * You can also set properties on tiles which can later be used to indicate special areas of a map:
 * <pre><code>
 * tileSet.addProperty(0, 'climbable', 'true');
 * </code></pre>
 * To later check if a tile has a particular property use the hasProperty method:
 * <pre><code>
 * var tileNumber = this.getTile(1, 1);
 * if (tileNumber >= 0)
 *    if (tileSet.hasProperty(tileNumber, 'climable');
 *       // climb
 * </code></pre>
 * For convenience, you should probably just use the tileHasProperty method in the <a href='pc.TileMap'>pc.TileMap</a>
 * class.
 * <pre><code>
 * tileLayer.tileMap.tileHasProperty(1, 1, 'climbable')
 * </code></pre>
 */


pc.TileSet = pc.Base.extend('pc.TileSet',
    {},
    /** @lends pc.TileSet.prototype */
    {
        /** spritesheet used for tiles */
        tileSpriteSheet:null,
        /** pc.Hashmap of properties */
        props:null,

        /**
         * Constructs a new tile set using the supplied tile sheet
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to use for tile images
         */
        init:function (spriteSheet)
        {
            this.tileSpriteSheet = spriteSheet;
            this.props = new Array(spriteSheet.totalFrames);
            for (var i = 0; i < this.props.length; i++)
            {
                this.props[i] = new pc.Hashmap();
            }
        },

        /**
         * Draw a tile; typically for debugging or other strange purposes. Usually drawing is handled by the tile layer
         * @param {Object} ctx Context to draw the tile upon
         * @param {Number} tileNumber
         * @param {Number} x Frame x position within the spritesheet
         * @param {Number} y Frame y position within the spritesheet
         */
        drawTile:function (ctx, tileNumber, x, y)
        {
            this.tileSpriteSheet.drawFrame(
                ctx,
                tileNumber % this.tileSpriteSheet.framesWide,
                pc.Math.floor(tileNumber / this.tileSpriteSheet.framesWide),
                x, y);
        },

        /**
         * Adds a key/value property to a tile type
         * @param {Number} tileNumber Tile number to add the tile to
         * @param {String} key Key string
         * @param {String} value Value to add
         */
        addProperty:function (tileNumber, key, value)
        {
            this.props[tileNumber].put(key, value);
        },

        /**
         * Checks if a particular tile number (tile type) has a given property set
         * @param {Number} tileNumber Tile number to check
         * @param {String} key The key to test for
         * @return {Boolean} true if the property is set
         */
        hasProperty:function (tileNumber, key)
        {
            return this.props[tileNumber].hasKey(key);
        },

        /**
         * Gets all the properties associated with a given tile number
         * @param {Number} tileNumber Tile number to get properties for
         * @return {pc.Hashmap} Hashmap of the properties
         */
        getProperties:function (tileNumber)
        {
            return this.props[tileNumber];
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileMap
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * @description
 * A map of tiles using by pc.TileLayer to what to draw. See <a href='pc.TileLayer'>pc.TileLayer</a> for details
 * on using a tile map with a tile layer.
 * <p>
 * A tile map contains both a 2d array of tile data, size of each tile and the size of the map. It also links to
 * a spritesheet which contains the tile images to render.
 * <p>
 * An example tile map setup:
 * <pre><code>
 * var tileMap = new pc.TileMap(new pc.TileSet(tileSheet), 100, 100, 32, 32);
 *
 * // set all the tiles to empty
 * tileMap.generate(0);
 *
 * // set the tile at tile position x=3, y=2 to tile number 1
 * tileMap.setTile(3, 2, 1);
 * </code></pre>
 * <p>
 * You can directly access tile data using the tiles member:
 * <pre><code>
 * tileMap.tiles[tileY][tileX] = tileType;
 * </code></pre>
 * <p>
 * If you do modify the tile map though, and you're using prerendering you will need to call prerender on the tile
 * layer so the prerendered images are updated.
 */

pc.TileMap = pc.Base.extend('pc.TileMap',
    /** @lends pc.TileMap */
    {
        EMPTY_TILE:-1
    },
    /** @lends pc.TileMap.prototype */
    {
        /** 2d array of tile data */
        tiles:null,
        /** Number of tiles the map is wide */
        tilesWide:0,
        /** Number of tiles the map is high */
        tilesHigh:0,
        /** Width of each tile */
        tileWidth:0,
        /** Height of each tile */
        tileHeight:0,
        /** Current tile set */
        tileSet:null,

        /**
         * Constructs a new tile map using the supplied dimensions and tile set
         * @param {pc.TileSet} tileSet Tile set to use
         * @param {Number} tilesWide Number of tiles the map is wide
         * @param {Number} tilesHigh Number of tiles the map is high
         * @param {Number} tileWidth Width of each tile (e.g. 32)
         * @param {Number} tileHeight Height of each tile (e.g. 32)
         * @param {Array} tiles An array of tile data ordered by y then x
         */
        init:function (tileSet, tilesWide, tilesHigh, tileWidth, tileHeight, tiles)
        {
            this.tiles = tiles;
            this.tileWidth = pc.Math.round(tileWidth);
            this.tileHeight = pc.Math.round(tileHeight);
            this.tilesWide = pc.Math.round(tilesWide);
            this.tilesHigh = pc.Math.round(tilesHigh);
            this.tileSet = tileSet;
        },

        /**
         * Checks against this tilemap's tileset to see if the tile at a given location has a property set
         * @param {Number} tileX X tile location to check
         * @param {Number} tileY Y tile location to check
         * @param {String} property Property string to check for
         */
        tileHasProperty:function (tileX, tileY, property)
        {
            // get the number of the tile at tileX, tileY
            var tileNumber = this.getTile(tileX, tileY);
            if (tileNumber >= 0)
                return this.tileSet.hasProperty(tileNumber, property);
            return false;
        },


        /**
         * Generate a new tile map, optionally populating with a given tile type
         * @param {Number} tileType Type of tile to set the map to. Leave off to leave the tile map empty
         */
        generate:function (tileType)
        {
            this.tiles = new Array(this.tilesHigh);
            var t = pc.checked(tileType, this.Class.EMPTY_TILE);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.tiles[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.tiles[aty][atx] = t;
            }
        },

        /**
         * Populate an area of the tile map with a given tile type
         * @param {Number} x tile X position to start the paint
         * @param {Number} y tile Y position to start the paint
         * @param {Number} w How wide to paint
         * @param {Number} h How high to paint
         * @param {Number} tileType Type of tile to paint
         */
        paint:function (x, y, w, h, tileType)
        {
            for (var aty = y; aty < y + h; aty++)
                for (var atx = x; atx < x + w; atx++)
                    this.tiles[aty][atx] = tileType;
        },

        /**
         * Checks if a given tile location is within the tile map dimensions
         * @param {Number} x Tile x
         * @param {Number} y Tile y
         * @return {Boolean} true if the location is on the map
         */
        isOnMap:function (x, y)
        {
            return (x >= 0 && x < this.tilesWide && y >= 0 && y < this.tilesHigh);
        },

        /**
         * Clear a region of the tile map (setting the tiles to 0)
         * @param {Number} tx Starting tile x
         * @param {Number} ty Starting tile y
         * @param {Number} tw Number of tiles wide to clear
         * @param {Number} th Number of tiles high to clear
         */
        clear:function (tx, ty, tw, th)
        {
            this.paint(tx, ty, tw, th, this.Class.EMPTY_TILE);
        },

        /**
         * Sets a tile at a given location
         * @param {Number} tx Tile x
         * @param {Number} ty Tile y
         * @param {Number} tileType Type to set
         */
        setTile:function (tx, ty, tileType)
        {
            this.tiles[ty][tx] = tileType;
        },

        /**
         * Get the tile type at a given tile location
         * @param {Number} tx Tile x
         * @param {Number} ty Tile y
         * @return {Number} type of tile at that location or -1 if not on the map
         */
        getTile:function (tx, ty)
        {
            if (!this.isOnMap(tx, ty)) return -1;
            return this.tiles[ty][tx];
        },

        /**
         * Loads a tile map from a TMX formatted data stream
         * @param {String} layerXML XML string loaded from a Tiled TMX file
         */
        loadFromTMX:function (layerXML, tileWidth, tileHeight)
        {
            this.tileWidth = tileWidth;
            this.tileHeight = tileHeight;

            this.tilesWide = parseInt(layerXML.getAttribute('width'));
            this.tilesHigh = parseInt(layerXML.getAttribute('height'));

            var data = layerXML.getElementsByTagName('data')[0];
            if (data.getAttribute('compression'))
            {
                this.error('map: ' + name + ': TMX map compression not supported, use base64 encoding');
                return;
            }

            if (data.getAttribute('encoding') == 'base64')
            {
                // convert the base64 data to tiles
                var tileData = '';
                for (var n = 0; n < data.childNodes.length; n++)
                    tileData += data.childNodes[n].nodeValue;

                // trim
                tileData = tileData.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                var decoded = atob(tileData);

                // decode as an array
                var a = [];
                for (var i = 0; i < decoded.length / 4; i++)
                {
                    a[i] = 0;
                    for (var j = 3; j >= 0; --j)
                        a[i] += decoded.charCodeAt((i * 4) + j) << (j << 3);
                }
            }

            // todo: merge this with the above decode to speed up map setup
            this.tiles = new Array(this.tilesHigh);

            for (var aty = 0; aty < this.tilesHigh; aty++)
            {
                this.tiles[aty] = new Array(this.tilesWide);
                for (var atx = 0; atx < this.tilesWide; atx++)
                    this.tiles[aty][atx] = a[aty * this.tilesWide + atx] - 1;
            }
        }


    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.TileLayer
 * @description
 * [Extends <a href='pc.Layer'>pc.Layer</a>]
 * <p>
 * A tile layer is a specialized layer capable of managing and rendering large graphics layers using tiles of a
 * set dimension. Tile layers are more efficient to edit, update and render due to the set size of each tile.
 * <p>
 * To create a tile layer, first create a <a href='pc.TileMap'>tile map</a> containing the tile images and map data:
 * <pre><code>
 * // grab a tile sheet previously added to the resource loader
 * var tileSheet = new pc.SpriteSheet(
 *    { image:pc.device.loader.get('myTiles').resource,
 *      frameWidth:32, frameHeight:32 });
 *
 * // create a tile map to hold our tile data, using the supplied tile sheet
 * // 100 tiles wide by 100 tiles high with a tile height and width of 32
 * var tileMap = new pc.TileMap(new pc.TileSet(tileSheet), 100, 100, 32, 32);
 *
 * // set all the tiles to empty
 * tileMap.generate(0);
 *
 * // set the tile at tile position x=3, y=2 to tile number 1
 * tileMap.setTile(3, 2, 1);
 *
 * // create the tile layer using the supplied tile map
 * var myTileLayer = new pc.TileLayer('my tile layer', true, tileMap);
 * </code></pre>
 * <p>
 * Refer to <a href='pc.TileMap'>pc.TileMap</a> and <a href='pc.TileSet'>pc.TileSet</a> for more information on tile
 * graphics and maps.
 * <p>
 * <h5>Tiled Editor Integration</h5>
 * You can dynamically construct a tile layer using XML data from the Tiled map editor using the static loadFromTMX
 * constructor. Typically this is not used directly; you should use the pc.Scene loadFromTMX method for more information
 * on loading levels using Tiled.
 * <p>
 * <h5>Prerendering</h5>
 * By default, tile layers will use prerendering in order to "prebake" large blocks of tiles into cached images.
 * These images are then drawn instead of the individual tiles. This results in a large performance boost (5x to 10x) in
 * rendering speed. Prerendering is enabled by default.
 * <p>
 * There are some cases where prerendering may not be the best option, these include:
 * <ul>
 *     <li>When tile maps are regularly changing during a game - you will need to constantly re-render the tile blocks
 *     which is a slow process (relative to just drawing the tiles on each update)</li>
 *     <li>If the size of tiles is greater than 256x256 you may find only a minor speed difference (at the expense
 *     of graphics memory). Prerendering is disabled by default if you specify a tile map with a tile size greater
 *     than 256x256.</li>
 * </ul>
 * <p>
 * You can disable prerendering using the constructor option:
 * <pre><code>
 * // false indicates prerendering should not be used
 * var myTileLayer = new pc.TileLayer('my tile layer', false);
 * </code></pre>
 * <p>
 * If you change the tile map, you can use the prerender method to update the cache images.
 */

pc.TileLayer = pc.Layer.extend('pc.TileLayer',
    /** @lends pc.TileLayer */
    {
        /**
         * Constructs a tile layer using data from a TMX formatted (XML base 64) data stream
         * @param {pc.Scene} scene Scene to add the new layer to
         * @param {String} layerXML XML data for layer
         * @param {Number} tileWidth Width of each tile
         * @param tileHeight Height of each tile
         */
        loadFromTMX:function (scene, layerXML, tileWidth, tileHeight, tileSet)
        {
            var name = layerXML.getAttribute('name');
            var newLayer = new pc.TileLayer(name, true, null, tileSet);

            // fill in the rest using the data from the TMX file

            newLayer.tileMap.loadFromTMX(layerXML, tileWidth, tileHeight);
            scene.addLayer(newLayer);
        }
    },
    /** @lends pc.TileLayer.prototype */
    {
        /** pc.TileMap data used for this tile layer */
        tileMap:null,
        /** show a debugging grid around all the tiles */
        debugShowGrid:false,
        /** array of prerendered images */
        prerenders:null,
        /** indicates if prerendering is currently in use */
        usePrerendering:true,
        /** the size of the prerender chunks - default is 512 */
        prerenderSize:512,

        /**
         * Constructor for the tile layer
         * @param {String} name Name of the layer
         * @param {Boolean} [usePrerendering] Whether prerendering should be used (defaults to true)
         * @param {pc.TileMap} [tileMap] Tile map data used for the tile layer
         * @param {pc.TileSet} [tileSet] If no tile map is supplied, you can optional provide a tile set and a
         * tile map will be constructed using this tile set
         */
        init:function (name, usePrerendering, tileMap, tileSet)
        {
            this._super(name);
            this.tileMap = pc.checked(tileMap, new pc.TileMap(tileSet));

            this.usePrerendering = pc.checked(usePrerendering, true);
            if (this.tileMap && this.tileMap.tileWidth > 256)
                this.usePrerendering = false;
        },

        /**
         * Set the tile map
         * @param {pc.TileMap} tileMap The tile map to set
         */
        setTileMap:function (tileMap)
        {
            this.tileMap = tileMap;
            if (this.usePrerendering)
                this.prerender();
        },

        /**
         * Prerender using the current tilemap and tileset. Called automatically when a tile map is changed or when
         * the tile layer is constructed. Only needs to be called again if you change the tile map or tile set.
         */
        prerender:function ()
        {
            var totalWidth = this.tileMap.tilesWide * this.tileMap.tileWidth;
            var totalHeight = this.tileMap.tilesHigh * this.tileMap.tileHeight;

            var prerendersWide = Math.ceil(totalWidth / this.prerenderSize);
            var rows = Math.ceil(totalHeight / this.prerenderSize);

            this.prerenders = [];
            for (var cy = 0; cy < rows; cy++)
            {
                this.prerenders[cy] = [];

                for (var cx = 0; cx < prerendersWide; cx++)
                {
                    var prw = (x == prerendersWide - 1) ? totalWidth - x * this.prerenderSize : this.prerenderSize;
                    var prh = (y == rows - 1) ? totalHeight - y * this.prerenderSize : this.prerenderSize;

                    // draw the tiles in this prerender area
                    var tw = prw / this.tileMap.tileWidth + 1;
                    var th = prh / this.tileMap.tileHeight + 1;

                    var nx = (cx * this.prerenderSize) % this.tileMap.tileWidth,
                        ny = (cy * this.prerenderSize) % this.tileMap.tileHeight;

                    var tx = Math.floor(cx * this.prerenderSize / this.tileMap.tileWidth),
                        ty = Math.floor(cy * this.prerenderSize / this.tileMap.tileHeight);

                    var canvas = document.createElement('canvas');
                    canvas.width = prw;
                    canvas.height = prh;
                    var ctx = canvas.getContext('2d');

                    for (var x = 0; x < tw; x++)
                    {
                        for (var y = 0; y < th; y++)
                        {
                            if (x + tx < this.tileMap.tilesWide && y + ty < this.tileMap.tilesHigh)
                            {
                                var tileType = this.tileMap.getTile(x + tx, y + ty);
                                if (tileType >= 0)  // -1 means no tile
                                {
                                    this.tileMap.tileSet.drawTile(
                                        ctx,
                                        tileType,
                                        (x * this.tileMap.tileWidth) - nx,
                                        (y * this.tileMap.tileHeight) - ny);
                                }
                            }
                        }
                    }

                    this.prerenders[cy][cx] = canvas;
                }
            }
        },

        /**
         * Draws the tile layer to the current context (typically called automatically by the scene)
         */
        draw:function ()
        {
            this._super();
            if (!this.tileMap || !this.tileMap.tilesWide) return;

            if (this.usePrerendering)
                this.drawPrerendered();
            else
                this.drawTiled();
        },

        /**
         * Draws the tiled version of the layer (called automatically by a call to draw if prerendering is not used)
         */
        drawTiled:function ()
        {
            // figure out which tiles are on screen
            var tx = Math.floor(this.origin.x / this.tileMap.tileWidth);
            if (tx < 0) tx = 0;
            var ty = Math.floor(this.origin.y / this.tileMap.tileHeight);
            if (ty < 0) ty = 0;

            var tw = (Math.ceil((this.origin.x + this.scene.viewPort.w) / this.tileMap.tileWidth) - tx) + 2;
            if (tx + tw >= this.tileMap.tilesWide - 1) tw = this.tileMap.tilesWide - 1 - tx;
            var th = (Math.ceil((this.origin.y + this.scene.viewPort.h) / this.tileMap.tileHeight) - ty) + 2;
            if (ty + th >= this.tileMap.tilesHigh - 1) th = this.tileMap.tilesHigh - 1 - ty;

            for (var y = ty, c = ty + th; y < c + 1; y++)
            {
                var ypos = this.screenY(y * this.tileMap.tileHeight);

                for (var x = tx, d = tx + tw; x < d; x++)
                {
                    var tileType = this.tileMap.tiles[y][x];
                    if (tileType >= 0)  // -1 means no tile
                    {
                        this.tileMap.tileSet.drawTile(
                            pc.device.ctx, tileType,
                            this.screenX(x * this.tileMap.tileWidth), ypos);
                    }

                    if (this.debugShowGrid)
                    {
                        pc.device.ctx.save();
                        pc.device.ctx.strokeStyle = '#222222';
                        pc.device.ctx.strokeRect(this.screenX(x * this.tileMap.tileWidth), this.screenY(y * this.tileMap.tileHeight),
                            this.tileMap.tileWidth, this.tileMap.tileHeight);
                        pc.device.ctx.restore();
                    }
                }
            }
        },

        /**
         * Draws the prerendered version of the layer (called automatically by a call to draw if prerendering is used)
         */
        drawPrerendered:function ()
        {
            if (!this.prerenders)
                this.prerender();

            var drawX = -(this.origin.x) + this.scene.viewPort.x;
            var drawY = -(this.origin.y) + this.scene.viewPort.y;
            var startPX = Math.max(Math.floor(this.origin.x / this.prerenderSize), 0);
            var startPY = Math.max(Math.floor(this.origin.y / this.prerenderSize), 0);
            var maxPX = startPX + Math.ceil((this.origin.x + this.scene.viewPort.w) / this.prerenderSize);
            var maxPY = startPY + Math.ceil((this.origin.y + this.scene.viewPort.h) / this.prerenderSize);

            maxPX = Math.min(maxPX, this.prerenders[0].length);
            maxPY = Math.min(maxPY, this.prerenders.length);

            for (var cy = startPY; cy < maxPY; cy++)
                for (var cx = startPX; cx < maxPX; cx++)
                    pc.device.ctx.drawImage(this.prerenders[cy % this.prerenders.length][cx % this.prerenders[0].length],
                        drawX + (cx * this.prerenderSize), drawY + (cy * this.prerenderSize));
        }



    });

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
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Sprite
 * @description
 * [Extends <a href='pc.Sprite'>pc.Pooled</a>]
 * <p>
 * Sprites are instances of a sprite sheet used for rendering.
 * <p>
 * To create a sprite, pass a sprite sheet into the constructor:
 * <pre><code>
 * var zombieSprite = new pc.Sprite( zombieSpriteSheet );
 * </code></pre>
 * You can then use setAnimation to select an animation from the sheet:
 * <pre><code>
 * zombieSprite.setAnimation('attacking right');
 * </code></pre>
 * To draw the sprite, use the draw method:
 * <pre><code>
 * zombieSprite.draw(pc.device.ctx, 100, 100);
 * </code></pre>
 * To cycle animations, call update:
 * <pre><code>
 * zombieSprite.update(pc.device.elapsed);
 * </code></pre>
 * <p>
 * Check the <a href='http://playcraftlabs.com/develop/guide/spritesandanimation'>sprites and animation guide</a> for
 * more information and features.
 */

pc.Sprite = pc.Pooled.extend('pc.Sprite',
    {
        /**
         * Construct a new sprite object by acquiring it from the free pool and configuring it
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to use
         * @return {pc.Sprite} A sprite object
         */
        create:function (spriteSheet)
        {
            var n = this._super();
            n.config(spriteSheet);
            return n;
        }
    },
    {
        /** Current animation frame */
        currentFrame:0,
        /** Current animation object reference */
        currentAnim:null,
        /** pc.SpriteSheet used by this sprite */
        spriteSheet:null,
        /** speed different this instance uses, versus the animation speed */
        animSpeedOffset:0,
        /** Name of the current animation */
        currentAnimName:null,
        /** Alpha level */
        alpha:1,
        /** X-scale for drawing */
        scaleX: 1,
        /** Y-scale for drawing */
        scaleY: 1,
        /** Whether the sprite is active; false = not drawn or updated */
        active:true,
        /** Whether the sprite is held. Won't progress on animation, but will still draw */
        hold: false,
        /** Number of times the animation has played */
        loopCount:0,
        /** Current composite drawing operation to use */
        compositeOperation: null,

        _acDelta: 0,

        /**
         * Constructs a new sprite using the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to use
         */
        init:function(spriteSheet)
        {
            this._super();
            this.config(spriteSheet);
        },

        /**
         * Configure the sprite object with a given sprite sheet - typically called by init or create
         * @param {pc.SpriteSheet} spriteSheet Spritesheet to configure with
         */
        config: function(spriteSheet)
        {
            this.spriteSheet = pc.checked(spriteSheet, null);
            if (this.spriteSheet)
                this.reset();
        },

        /**
         * Clear the sprite back to a starting state (using first animation)
         */
        reset:function ()
        {
            this.currentFrame = 0;
            this.alpha = 1;
            this.loopCount = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.active = true;
            this.hold = false;
            if (this.spriteSheet.animations.size() > 0)
            {
                this.currentAnim = this.spriteSheet.animations.get(this.spriteSheet.animations.keys()[0]);
                this.currentFrame = 0;

            } else
                this.currentAnim = null;
        },

        /**
         * Change the sprite sheet
         * @param {pc.SpriteSheet} spriteSheet Sprite sheet to change to
         */
        setSpriteSheet: function(spriteSheet)
        {
            this.spriteSheet = spriteSheet;
            this.reset();
        },

        /**
         * Change the drawing scale of this sprite instance
         * @param {Number} scaleX x-scale to use
         * @param {Number} scaleY y-scale to use
         */
        setScale: function(scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the composite drawing operation for this sprite. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation to use
         */
        setCompositeOperation: function(o)
        {
            this.compositeOperation = o;
        },

        /**
         * Draw the sprite using the given context at a given location, and a certain direction
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} dir Direction to draw it at
         */
        draw:function (ctx, x, y, dir)
        {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            this.spriteSheet.draw(ctx, this, x, y, dir);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Draws a single frame of the current sprite sheet
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} frameX The frame to draw (x)
         * @param {Number} frameY The frame to draw (y)
         * @param {Number} x x-position
         * @param {Number} y y-position
         * @param {Number} angle Direction to draw it at
         */
        drawFrame: function(ctx, frameX, frameY, x, y, angle)
        {
            if (this.alpha != 1)
                this.spriteSheet.alpha = this.alpha;
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(this.scaleX, this.scaleY);
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation(this.compositeOperation);
            this.spriteSheet.drawFrame(ctx, frameX, frameY, x, y, angle);
            if (this.scaleX != 1 || this.scaleY != 1)
                this.spriteSheet.setScale(1, 1);
            if (this.alpha != 1)
                this.spriteSheet.alpha = 1;
            if (this.compositeOperation != null)
                this.spriteSheet.setCompositeOperation('source-over');
        },

        /**
         * Updates the sprite animation based on the time elapsed
         * @param {Number} elapsed Amount of time to move the animation forward by
         */
        update:function (elapsed)
        {
            if (this.currentAnim == null || !this.active || this.hold) return;

            // call the spritesheet class to actually do a sprite update, keep in mind though that the spritesheet
            // doesn't retain any present state, it just sets the state object, which in this case is passed in as the
            // this param -- this is so spritesheets (and the underlying image) may be used by more than one sprite
            // at the same time
            this.spriteSheet.update(this, elapsed);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param {String} name Key name of the animation to switch to.
         * @param {Number} speedOffset allows you to modify the animation speed for this instance of a sprite
         * @param {Number} force Restart the animation, even if this is the currently playing animation (default is true)
         */
        setAnimation:function (name, speedOffset, force)
        {
            var f = pc.checked(force, true);
            if (!f)
                if (this.currentAnim.name === name) return;

            this.currentAnim = this.spriteSheet.animations.get(name);
            this.currentFrame = 0;
            this.loopCount = 0;
            this.active = true;
            this.held = false;
            this.animSpeedOffset = pc.checked(speedOffset, 0);
            this.currentAnimName = name;
        },

        /**
         * Changes the speed of animation by the given offset. Good for randomizing when you have lots of the same
         * sprite on-screen
         * @param {Number} speedOffset Time in ms to offset by (can be negative to slow an animation down)
         */
        setAnimationSpeedOffset: function(speedOffset)
        {
            this.animSpeedOffset = speedOffset;
        },

        /**
         * Changes the current frame
         * @param {Number} frame Frame to change to
         */
        setCurrentFrame: function(frame)
        {
            this.currentFrame = frame;
        },

        /**
         * Returns the name of the current animation
         * @return {String} Current animation name
         */
        getAnimation:function ()
        {
            return this.currentAnimName;
        },

        /**
         * Changes the draw alpha for the sprite
         * @param {Number} a Alpha level to change to (0.5 = 50% transparent)
         */
        setAlpha:function (a)
        {
            this.alpha = a;
        },

        /**
         * Adds to the current alpha level
         * @param {Number} a Amount to add
         */
        addAlpha:function (a)
        {
            this.alpha += a;
            if (this.alpha > 1) this.alpha = 1;
        },

        /**
         * Subtracts from the current alpha level
         * @param {Number} a Amount to subtract
         */
        subAlpha:function (a)
        {
            this.alpha -= a;
            if (this.alpha < 0) this.alpha = 0;
        }


    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.SpriteSheet
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * Spritesheets are a tool used to configure an image into being a sprite. A spritesheet defines the frame size,
 * source placement and the animations that make up a sprite.
 * <p>
 * To create an on-screen sprite you need to setup a sprite sheet template, then construct a pc.Sprite object
 * using the sheet.
 * <p>
 * To create a sprite sheet you must first load an image resource using the resource loader. You can then use that
 * to construct a sprite sheet:
 * <p>
 * <pre><code>
 * // grab the zombie image resource from the loader
 * var zombieImage = pc.device.loader.get('zombie').resource;
 *
 * // create the spritesheet
 * var zombieSpriteSheet = new pc.SpriteSheet(
 *      { image:zombieImage, frameWidth:80, frameHeight:72 });
 * </code></pre>
 * The sprite sheet class is pretty flexible in how you define the frames. You can actually just specify the number of
 * frames wide and high the sheet is and it will figure our the frame size for you.
 * <p>
 * <h5>Adding Animations</h5>
 * To define the walk animation for the zombie, you just use addAnimation:
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'walking right', frameCount:16, time:1400 });
 * </code></pre>
 * Here we've defined an animation with the tag 'walking right', a frame count of 16 and a total animation time of 1400.
 * <p>
 * Notice we didn't say where in the image the frames start, that's because the default starting frame is 0 for both
 * x and y.
 * <p>
 * To specify a starting frame use the frameX and frameY options.
 * <pre><code>
 * zombieSpriteSheet.addAnimation({ name:'attacking right', frameX: 0, frameY: 2, frameCount:16, time:500 });
 * </code></pre>
 * In this case, the attack animation starts at frame 0 on the x-axis, and the 3rd frame down. It is then 16 frames
 * long.
 * <h5>Making Sprites</h5>
 * To make an actual sprite you can draw on the screen, use the <a href='pc.Sprite'>pc.Sprite</a> class.
 */

pc.SpriteSheet = pc.Base.extend('pc.SpriteSheet',
    /** @lends pc.SpriteSheet */
    {},
    /** @lends pc.SpriteSheet.prototype */
    {
        /** The source pc.Image resource */
        image:null,
        /** width of each frame (read-only) */
        frameWidth:0,
        /** height of each frame (read-only) */
        frameHeight:0,
        /** number of frames wide the sheet is (read-only) */
        framesWide:1,
        /** number of frames high the sheet is (read-only) */
        framesHigh:1,
        /** X scale to draw the image at */
        scaleX:1,
        /** Y scale to draw the image at */
        scaleY:1,
        /** source x position where frames start in the image */
        sourceX:0,
        /** source y position where frames start in the image */
        sourceY:0,
        /** alpha level to draw the image at */
        alpha:1,
        /** whether rotation should be used, or ignored when rendering frames */
        useRotation:false,
        /** composite drawing operation */
        compositeOperation:null,
        /** total number of frames (read-only) */
        totalFrames:0,
        /** Hashtable of animations keyed by animation name */
        animations:null,

        _frameXPos:null,
        _frameYPos:null,

        /**
         * Constructs a new sprite sheet with options. You can use either framesWide or frameWidth, and the logical
         * default will be assumed. Frame width is assumed to be image.width / framesWide or frames wide will default to
         * image.width/frameWidth.
         * @param {Number} options.framesWide Number of frames wide the sprite sheet is
         * @param {Number} options.framesHigh Number of frames high the sprite sheet is
         * @param {Number} options.frameHeight Height of each frame in pixels
         * @param {Number} options.frameWidth Width of each frame in pixels
         * @param {Number} options.scaleX X Scale to draw the image at
         * @param {Number} options.scaleY Y Scale to draw the image at
         * @param {Number} options.sourceX Source x position in the image
         * @param {Number} options.sourceY Source y position in the image
         * @param {Number} options.alpha Alpha level to draw the image at (0.5 is 50% visible)
         * @param {Boolean} options.useRotation True means the canvas rotation will be used to draw images as an angle
         */
        init:function (options)
        {
            this._super();

            if (pc.checked(options.image))
                this.image = options.image;
            else
                throw "No image supplied";

            if (!pc.valid(options.frameWidth))
            {
                if (pc.valid(options.framesWide) && options.framesWide > 0)
                    this.frameWidth = this.image.width / options.framesWide;
                else
                    this.frameWidth = this.image.width;
            } else
                this.frameWidth = options.frameWidth;

            if (!pc.valid(options.frameHeight))
            {
                if (pc.valid(options.framesHigh) && options.framesHigh > 0)
                    this.frameHeight = this.image.height / options.framesHigh;
                else
                    this.frameHeight = this.image.height;
            } else
                this.frameHeight = options.frameHeight;

            this.framesWide = pc.checked(options.framesWide, this.image.width / this.frameWidth);
            this.framesHigh = pc.checked(options.framesHigh, this.image.height / this.frameHeight);
            this.scaleX = pc.checked(options.scaleX, 1);
            this.scaleY = pc.checked(options.scaleY, 1);
            this.sourceX = pc.checked(options.sourceX, 0);
            this.sourceY = pc.checked(options.sourceY, 0);
            this.alpha = pc.checked(options.alpha, 1);
            this.useRotation = pc.checked(options.useRotation, true);

            this.totalFrames = this.framesWide * this.framesHigh;
            this.animations = new pc.Hashtable();

            // pre-calcs for speed
            this._frameXPos = [];
            for (var fx = 0; fx < this.framesWide; fx++)
                this._frameXPos.push(fx * this.frameWidth);
            this._frameYPos = [];
            for (var fy = 0; fy < this.framesHigh; fy++)
                this._frameYPos.push(fy * this.frameHeight);
        },

        /**
         * Defines an animation
         * @param {String} options.name A descriptive name for the animation (required)
         * @param {Number} options.frameX The starting frame X position (in frames, not pixels) defaults to 0
         * @param {Number} options.frameY The starting frame Y position (in frames, not pixels) defaults to 0
         * @param {Number} options.frames A 2d-array of frame numbers ([ [0, 0], [0, 1] ]) , note these are OFFSET by frameX and frameY. Use null
         * to automatically sequence through all frames across the image, or specify frame count
         * @param {Number} options.frameCount number of frames to use, starting from frameX, frameY and stepping forward across the spritesheet
         * @param {Number} options.time Seconds to loop through entire sequence defaults to 1000
         * @param {Number} options.loops Number of times to cycle through this animation, use 0 to loop infinitely (defaults to 0)
         * @param {Boolean} options.holdOnEnd Whether to hold the last frame when the animation has played through
         * @param {Number} options.scaleX X scaling to apply (negative values reverse the image)
         * @param {Number} options.scaleY Y scaling to apply (negative values reverse the image)
         * @param {Number} options.framesWide Number of frames to go across before stepping down
         * @param {Number} options.framesHigh Number of frames down
         */
        addAnimation:function (options)
        {
            if (!pc.valid(options.name)) throw "Animation requires a name for reference";

            options.frameX = pc.checked(options.frameX, 0);
            options.frameY = pc.checked(options.frameY, 0);
            options.directions = pc.checked(options.directions, 1);
            options.time = pc.checked(options.time, 1000);
            options.loops = pc.checked(options.loops, 0);
            options.holdOnEnd = pc.checked(options.holdOnEnd, false);
            options.dirAcross = pc.checked(options.dirAcross, false);
            options.scaleX = pc.checked(options.scaleX, 1);
            options.scaleY = pc.checked(options.scaleY, 1);
            options.offsetX = pc.checked(options.offsetX, 0);
            options.offsetY = pc.checked(options.offsetY, 0);
            options.framesWide = pc.checked(options.framesWide, this.framesWide);
            options.framesHigh = pc.checked(options.framesHigh, this.framesHigh);
            options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);

            if (options.frameCount == 0)
            {
                options.frameCount = pc.checked(options.frameCount, this.framesWide * this.framesHigh);
            }

            // no frames specified, create the frames array automagically
            if (!pc.valid(options.frames))
            {
                var frameStart = options.frameX + (options.frameY * options.framesWide);
                options.frames = [];
                // use the frameCount and frameX, frameY
                for (var frame = frameStart; frame < frameStart + options.frameCount; frame++)
                {
                    options.frames.push([frame % options.framesWide, Math.floor(frame / options.framesWide) ]);
                }
            }

            options.frameRate = (options.time / options.frames.length);
            options.degreesPerDir = (360 / options.directions);

            this.animations.put(options.name, options);
        },

        /**
         * Change this sprites animation. Animation frames always start from 0 again.
         * @param name Key name of the animation to switch to.
         */
        setAnimation:function (state, name, speedOffset)
        {
            state.currentAnim = this.animations.get(name);
            if (state.currentAnim == null)
                this.warn('attempt to set unknown animation [' + name + ']');
            state.currentFrame = 0;
            state.held = false;
            state.animSpeedOffset = pc.checked(speedOffset, 0);
        },

        /**
         * Checks if this sheet has an animation of a given name
         * @param {String} name Animation name
         * @return {Boolean} true if the animation exists on this sheet
         */
        hasAnimation:function (name)
        {
            return (this.animations.get(name) != null);
        },

        /**
         * Sets the scale to draw the image at
         * @param {Number} scaleX Value to multiply the image width by (e.g. width * scaleX)
         * @param {Number} scaleY Value to multiply the image height by (e.g. height * scaleX)
         */
        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this sprite sheet. Set to null to clear it back to the default.
         * @param {String} o Composite drawing operation
         */
        setCompositeOperation:function (o)
        {
            this.compositeOperation = o;
        },

        dirTmp:0,

        /**
         * Draw a sprite using a frame from the sprite sheet
         * @param {pc.Sprite} state Sprite to draw
         * @param {Number} x On-screen x position
         * @param {Number} y On-screen y position
         * @param {Number} dir The facing direction (in degrees)
         */
        draw:function (ctx, state, x, y, dir)
        {
            if (!this.image.loaded || state == null || !state.active) return;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (state.alpha != 1)
                this.image.alpha = state.alpha;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            if (state.currentAnim == null)
            {
                if (this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(this.scaleX, this.scaleY);
                this.image.draw(ctx, this.sourceX, this.sourceY,
                    Math.round(x), Math.round(y), this.frameWidth, this.frameHeight,
                    this.useRotation ? dir : 0);
            } else
            {
                var fx = 0;
                var fy = 0;

                if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                    this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);

                if (this.useRotation)
                {
                    // rotation/direction drawing is done using canvas rotation (slower)
                    fx = state.currentAnim.frames[state.currentFrame][0];
                    fy = state.currentAnim.frames[state.currentFrame][1];

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx],
                        this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x),
                        state.currentAnim.offsetY + pc.Math.round(y), this.frameWidth, this.frameHeight, dir);
                }
                else
                {
                    // rely on the sprite images to draw rotation

                    this.dirTmp = Math.round(dir / state.currentAnim.degreesPerDir);

                    if (this.dirTmp > state.currentAnim.directions - 1) this.dirTmp = 0; // accommodate the edge case causing by rounding back

//                if (!state.currentAnim.dirAcross)
//                {
//                    fx = this.dirTmp + state.currentAnim.frameX;
//                    fy = state.currentAnim.frames[state.currentFrame][0] + state.currentAnim.frameY;
//                } else
                    {
                        fx = state.currentAnim.frames[state.currentFrame][1] + this.dirTmp;
                        fy = state.currentAnim.frames[state.currentFrame][0];
                    }

                    if (state.currentAnim.directions == 1)
                    {
                        fy = state.currentAnim.frames[state.currentFrame][1];
                        fx = state.currentAnim.frames[state.currentFrame][0];
                    }

                    this.image.draw(ctx,
                        this.sourceX + this._frameXPos[fx], this.sourceY + this._frameYPos[fy],
                        state.currentAnim.offsetX + pc.Math.round(x),
                        state.currentAnim.offsetY + pc.Math.round(y),
                        this.frameWidth, this.frameHeight);

                    if (state.currentAnim.scaleX != 1 || state.currentAnim.scaleY != 1 || this.scaleX != 1 || this.scaleY != 1)
                        this.image.setScale(state.currentAnim.scaleX * this.scaleX, state.currentAnim.scaleY * this.scaleY);
                }

            }

            // restore scaling (as images can be used amongst spritesheets, we need to be nice)
            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);

            // set the alpha back to normal
            if (state.alpha != 1)
                this.image.alpha = 1;

            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');

        },

        /**
         * Draw a single frame from the sprite sheet
         * @param {Context} ctx Device context to draw on
         * @param {Number} frameX The x-pos of the frame to draw
         * @param {Number} frameY The y-pos of the frame to draw
         * @param {Number} x x-pos to draw on the target context
         * @param {Number} y y-pos to draw on the target context
         * @param {Number} angle Angle to draw the frame at
         */
        drawFrame:function (ctx, frameX, frameY, x, y, angle)
        {
            if (!this.image.loaded) return;
            if (this.alpha < 1) ctx.globalAlpha = this.alpha;

            if (this.scaleX != 1 || this.scaleY != 1)
                this.image.setScale(this.scaleX, this.scaleY);

            if (this.compositeOperation != null)
                this.image.setCompositeOperation(this.compositeOperation);

            this.image.draw(ctx,
                this.sourceX + this._frameXPos[frameX],
                this.sourceY + this._frameYPos[frameY], pc.Math.round(x), pc.Math.round(y),
                this.frameWidth, this.frameHeight, angle);

            if (this.image.scaleX != 1 || this.image.scaleY != 1)
                this.image.setScale(1, 1);
            if (this.alpha < 1) ctx.globalAlpha = 1;
            if (this.compositeOperation != null)
                this.image.setCompositeOperation('source-over');
        },

        /**
         * Draw all the frames of a sprite sheet according to the image and parameters you set it
         * up with. Primarily this is intended for debugging or sprite testing.
         * @param {Context} ctx Context to draw on
         * @param {Number} x Starting x position to draw on the given context
         * @param {Number} y Starting y position to draw on the given context
         */
        drawAllFrames:function (ctx, x, y)
        {
            for (var fy = 0; fy < this.framesHigh; fy++)
                for (var fx = 0; fx < this.framesWide; fx++)
                    this.drawFrame(ctx, fx, fy, x + (fx * this.frameWidth), y + (fy * this.frameHeight));
        },

        /**
         * Update the sprite based on the current animation, frame and timing. Typically called automatically
         * from the sprite class
         * @param {pc.Sprite} state Sprite to update
         * @param {Number} delta Amount of time to move forward by
         */
        update:function (state, delta)
        {
            if (state.currentAnim == null || !state.active || state.held) return;

            // see if enough time has past to increment the frame count
            if (state.currentAnim.frames.length <= 1) return;

            if (state._acDelta > (state.currentAnim.frameRate + state.animSpeedOffset))
            {
                state.currentFrame++;
                if (state.currentFrame >= state.currentAnim.frames.length)
                {
                    state.loopCount++;
                    // checked if we have looped the animation enough times
                    if (state.currentAnim.loops) // 0 means loop forever
                        if (state.loopCount >= state.currentAnim.loops)
                        {
                            if (state.currentAnim.holdOnEnd)
                            {
                                state.held = true;
                                if (state.currentFrame) state.currentFrame--;
                            }
                            else
                                state.active = false;
                        }

                    if (!state.held) state.currentFrame = 0; // take it from the top
                }
                state._acDelta -= state.currentAnim.frameRate;
            } else
            {
                state._acDelta += delta;
            }
        },

        /**
         * Clear the sprite by nulling the image and animations
         */
        reset:function ()
        {
            this.image = null;
            this.animations = null;
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Math
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A collection of math tools you can use. This is a static class, so you do not need to construct it, and all
 * methods/members are accessed using pc.Math.
 */
pc.Math = pc.Base('pc.Math',
    /** @lends pc.Math */
    {
        /** Quick lookup to convert radians to degrees */
        RADIAN_TO_DEGREE:(180 / Math.PI),
        /** Quick lookup to convert degrees to radians */
        DEGREE_TO_RADIAN:(Math.PI / 180),
        /** Quick lookup for Math.PI */
        PI:Math.PI,

        /** Quick lookup for Math.round */
        round:Math.round,
        /** Quick lookup for Math.random */
        random:Math.random,
        /** Quick lookup for Math.floor */
        floor:Math.floor,

        /**
         * Find the square of a number
         * @param {Number} number The square of the number
         */
        sqr:function (number)
        {
            return number * number;
        },

        /**
         * Returns a random integer within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
         * If you need a float random use randFloat.
         * @param {Number} min the start of the range
         * @param {Number} max the end of the range
         * @returns {Number} A random number between (and including) the range
         */
        rand:function (min, max)
        {
            return pc.Math.round((pc.Math.random() * (max - min)) + min);
        },

        /**
         * Returns a random float within the specified range. e.g. rand(10, 20) returns a value between 10 and 20.
         * @param {Number} min the start of the range
         * @param {Number} max the end of the range
         * @returns {Number} A random number between (and including) the range
         */
        randFloat:function (min, max)
        {
            return (pc.Math.random() * (max - min)) + min;
        },

        /**
         * Rotates a given angle by an amount in degrees
         * @param {Number} angle Original angle
         * @param {Number} by Amount to add in degrees (can be negative)
         * @return {Number} A new angle, rotated by the amount given
         */
        rotate:function (angle, by)
        {
            var newDir = angle + by;
            while (newDir > 359)
                newDir -= 359;
            while (newDir < 0)
                newDir = 359 + newDir;
            return newDir;
        },

        /**
         * Calcuates the angle difference based on two angles and a direction (clockwise or counterclockwise)
         * @param {Number} angleA Starting angle in degrees
         * @param {Number} angleB Ending angle in degrees
         * @param {Boolean} clockwise True if the difference should be calculated in a clockwise direction
         * @return {Number} Angle difference in degrees
         */
        angleDiff: function(angleA, angleB, clockwise)
        {
            if (!clockwise)
            {
                var diff = angleA - angleB;
                if (diff < 0) diff += 360;
                return diff;
            } else
            {
                if (angleB < angleA) // wrapping around 0/360
                    angleB += 360;
                return angleB - angleA;
            }
        },

        /**
         * Is the first angle closest by going clockwise of the second angle
         * @param {Number} angleA Angle to target
         * @param {Number} angleB Angle clockwise is relative to
         * @return {Boolean} True if angle A is clockwise to angle B
         */
        isClockwise:function (angleA, angleB)
        {
            if (angleA > angleB)
                return (Math.abs(angleA - angleB)) < (angleB + (360 - angleA));
            else
                return (angleA + (360 - angleB)) < (Math.abs(angleB - angleA));
        },

        /**
         * Returns whether an angle is facing to the right from a side-scrolling 2d perspective
         * @param {Number} angle Angle to test
         * @return {Boolean} true is facing to the right, otherwise false (meaning it's facing left)
         */
        isFacingRight: function(angle)
        {
            if (angle > 270 || angle < 90) return true;
            return false;
        },

        /**
         * Converts radians to degrees
         * @param {Number} radians Radians
         * @return {Number} Radians from degrees
         */
        radToDeg:function (radians)
        {
            return (radians * pc.Math.RADIAN_TO_DEGREE);
        },

        /**
         * Converts degrees to radains
         * @param {Number} degrees Degrees to convert
         * @return {Number} Number of radians
         */
        degToRad:function (degrees)
        {
            return degrees * pc.Math.DEGREE_TO_RADIAN;
        },

        /**
         * Gives you the angle of a given vector x, y
         * @param {Number} x x component of the 2d vector
         * @param {Number} y y component of the 2d vector
         * @return Angle in degrees
         */
        angleFromVector:function (x, y)
        {
            // angle to vector
            var a = pc.Math.radToDeg(Math.atan2(y, x));
            if (a < 0) a += 360;
            return a;
        },

        /**
         * Gives you the x, y vector of a given angle in degrees. This method creates a pc.Point which you should
         * release after use
         * @param {Number} angle Angle in degrees
         * @return {pc.Point} A newly acquired pc.Point with the vector.
         */
        vectorFromAngle: function(angle)
        {
            var vx = Math.cos(pc.Math.degToRad(angle));
            var vy = Math.sin(pc.Math.degToRad(angle));
            return pc.Point.create(vx, vy);
        },

        /**
         * A fast check if a point is within a rectangle
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the point is within the rectangle
         */
        isPointInRect:function (x, y, rx, ry, rw, rh)
        {
            return x >= rx && x <= (rx + rw) &&
                y >= ry && y <= (ry + rh);
        },

        /**
         * Checks if one rectangle is completely contained in another
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the rectangle is fully within the other
         */
        isRectInRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        /**
         * Fast test if one rectangle is overlapping another at any point
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true if the rectangle overlaps anywhere
         */
        isRectColliding:function (x, y, w, h, rx, ry, rw, rh)
        {
            return !(y + h < ry || y > ry + rh ||
                x + w < rx || x > rx + rw);
        },

        /**
         * Forces a given value to be within a range (lowest to highest)
         * @param {Number} v The value to check
         * @param {Number} lowest Lowest value it can be
         * @param {Number} highest Highest value it can be
         * @return {Number} Original value or the edge of the fence if needed
         */
        limit:function (v, lowest, highest)
        {
            if (v < lowest) return lowest;
            if (v > highest) return highest;
            return v;
        },

        /**
         * Same as limit, but allows an increment value as well (which can be negative)
         * @param {Number} v Original value
         * @param {Number} inc Amount to add (can be negative)
         * @param {Number} lowest Lowest value to fence
         * @param {Number} highest Highest value to fence
         * @return {Number} Value with inc added fenced by the lowest and highest limits
         */
        limitAdd:function (v, inc, lowest, highest)
        {
            if (v+inc < lowest) return lowest;
            if (v+inc > highest) return highest;
            return v+inc;
        }
    },
    {
        // No instance, since this is an all static class
    });


/**
 * @class pc.Rect
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a rectangle.
 */
pc.Rect = pc.Pooled('pc.Rect',
    /** @lends pc.Rect */
    {
        /**
         * Constructs a new rectangle
         * @param x x-position of the top left of the rectangle
         * @param y y-position of the top left of the rectangle
         * @param w width of the rectangle
         * @param h height of the rectangle
         * @return {pc.Rect} A new rectangle (acquired from the free object pool}
         */
        create:function (x, y, w, h)
        {
            var newDim = this._super();
            newDim.x = x;
            newDim.y = y;
            newDim.w = w;
            newDim.h = h;
            return newDim;
        }
    },
    /** @lends pc.Rect.prototype */
    {
        /** x position of the top left of the rectangle */
        x:0,
        /** y position of the top left of the rectangle */
        y:0,
        /** width of the rectangle */
        w:0,
        /** height of the rectangle */
        h:0,

        /**
         * Checks if one rectangle is completely contained in another
         * @param {Number} x x-position of the point to test
         * @param {Number} y y-position of the point to test
         * @param {Number} w height of the rectangle to test
         * @param {Number} h width of the rectangle to test
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @return {Boolean} true is the rectangle is fully within the other
         */
        containsRect:function (x, y, w, h, rx, ry, rw, rh)
        {
            if (!pc.Math.isPointInRect(x, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x + w, y, rx, ry, rw, rh)) return false;
            if (!pc.Math.isPointInRect(x, y + h, rx, ry, rw, rh)) return false;
            return pc.Math.isPointInRect(x + w, y + h, rx, ry, rw, rh);
        },

        /**
         * Checks if a point is within the rectangle
         * @param {pc.Point} p A pc.point (or any object with a .x and .y property
         * @return {Boolean} true if the point is within the rectangle
         */
        containsPoint:function (p)
        {
            return p.x >= this.x && p.x <= (this.x + this.w) &&
                p.y >= this.y && p.y <= (this.y + this.h);
        },

        /**
         * Checks if this rectangle overlaps another (including rotation support)
         * @param {Number} rx x-position of the rectangle
         * @param {Number} ry y-position of the rectangle
         * @param {Number} rw width of the rectangle
         * @param {Number} rh height of the rectangle
         * @param {Number} dir Direction to rotate the angle to
         * @return {Boolean} true if the rectangle overlaps another
         */
        overlaps:function (rx, ry, rw, rh, dir)
        {
            var w = rw;
            var h = rh;

            if (pc.valid(dir) && dir != 0)
            {
                // calculate using a rotated rectangle
                var s = Math.sin(pc.Math.degToRad(dir));
                var c = Math.cos(pc.Math.degToRad(dir));
                if (s < 0) s= -s;
                if (c < 0) c= -c;
                w = rh*s + rw*c; // width of AABB
                h = rh*c + rw*s; // height of AABB
            }
            return !(this.y + this.h < ry || this.y > ry + h ||
                this.x + this.w < rx || this.x > rx + w);
        },

        /**
         * @return {String} A nice string representation of the rectangle
         */
        toString:function ()
        {
            return this.x + ' x ' + this.y + ' by ' + this.w + ' x ' + this.h;
        }



    });

/**
 * @class pc.Point
 * @description
 * [Extends <a href='pc.Pooled'>pc.Pooled</a>]
 * <p>
 * Represents a 2D point.
 */
pc.Point = pc.Pooled('pc.Point',
    /** @lends pc.Point */
    {
        create:function (x, y)
        {
            var n = this._super();
            n.x = x;
            n.y = y;
            return n;
        }
    },
    /** @lends pc.Point.prototype */
    {
        /** x position of the point */
        x:0,
        /** y position of the point */
        y:0,

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        match:function (p)
        {
            this.x = p.x;
            this.y = p.y;
        },

        /**
         * Makes this point match another
         * @param {pc.Point} p The other point to match
         */
        set: function(p)
        {
            this.match(p);
        },

        /**
         * Sets the x and y of the point
         * @param {Number} x x position to set
         * @param {Number} y y position to set
         * @return {pc.Point} This point
         */
        setXY: function(x, y)
        {
            this.x = x;
            this.y = y;
            return this;
        },

        /**
         * Adds to the point
         * @param {Number} x Amount to add to x
         * @param {Number} y Amount to add to y
         * @return {pc.Point} This point
         */
        add: function(x, y)
        {
            this.x += x;
            this.y += y;
            return this;
        },

        /**
         * Subtracts from the point
         * @param {Number} x Amount to subtract from x
         * @param {Number} y Amount to subtract from y
         * @return {pc.Point} This point
         */
        subtract:function (x, y)
        {
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * Gives you the angle from this point to another
         * @param {pc.Point} p Another point
         * @return {Number} Facing direction (in degrees) from this point to another
         */
        dirTo:function (p)
        {
            var a = Math.abs(p.x - this.x);
            var b = Math.abs(p.y - this.y);
            if (a == 0) a = 1;
            if (b == 0) b = 1;

            var bovera = b / a;
            var angleInRadians = Math.atan(bovera);
            var angle = pc.Math.radToDeg(angleInRadians);

            if (p.x < this.x)
            {
                // left side
                if (p.y < this.y)
                    return angle + 180;
                return (90 - angle) + 90;
            } else
            {
                // right side
                if (p.y < this.y)
                    return (90 - angle) + 270;
                return angle;
            }
        },

        /**
         * Modifies the point by moving along at a projected angle (dir) by the distance
         * @param {Number} dir Direction to move, in degrees
         * @param {Number} distance Distance to move
         */
        moveInDir:function (dir, distance)
        {
            this.x += distance * Math.cos(pc.Math.degToRad(dir));
            this.y += distance * Math.sin(pc.Math.degToRad(dir));
            return this;
        },

        /**
         * Changes the from position by an amount of pixels in the direction of the to position
         * ultimately reaching that point
         * @param {pc.Point} to Ending position
         * @param {Number} distance Amount to move
         */
        moveTowards:function (to, distance)
        {
            this.moveInDir(this.dirTo(to), distance);
        },

        /**
         * Get the distance between this point and another
         * @param {pc.Point} p Another point
         * @return {Number} Distance between this point and another
         */
        distance:function (p)
        {
            return Math.sqrt((p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y));
        },

        /**
         * A nice string representing this point
         * @return {String}
         */
        toString:function ()
        {
            return this.x + 'x' + this.y;
        }


    });


/**
 * @class pc.Dim
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Dim = pc.Point;

/**
 * @class pc.Vector
 * @description
 * [Extends <a href='pc.Point'>pc.Point</a>]
 * <p>
 * Synonym for a point
 */
pc.Vector = pc.Point;


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Image
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A basic image resource. You can use this class to acquire images (loaded from a URI) and then draw them on-screen
 * with effects such as scaling, rotation, compositing and alpha.<p>
 */
pc.Image = pc.Base.extend('pc.Image',
    /** @lends pc.Image */
    {},
    /** @lends pc.Image.prototype */
    {
        /** Width of the image; set upon loading, can be overridden after load */
        width:0,
        /** Height of the image; set upon loading, can be overridden after load */
        height:0,
        /** Source image element */
        image:null,
        /** Source URI used to load the image */
        src:null,
        /** Resource name */
        name:null,
        /** Whether the image has been loaded yet */
        loaded:false,
        /** Optional function called after this image loads */
        onLoadCallback:null,
        /** Optional function called if this image fails to load */
        onErrorCallback:null,
        /** x-scale to draw the image at */
        scaleX:1,
        /** y-scale to draw the image at */
        scaleY:1,
        /** alpha level to draw the image at (0.5=50% transparent) */
        alpha:1,
        /** Composite operation to draw the image with, e.g. 'lighter' */
        compositeOperation:null,

        /**
         * Constructs a new pc.Image. If the pc.device.loader has already started then the image will be
         * immediately loaded, otherwise it will wait for the resource loader to handle the loading.
         * @param {String} name Name to give the image resource
         * @param {String} src URI for the image
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();

            this.name = name;
            this.src = pc.device.loader.makeUrl(src);
            this.image = new Image();

            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            // setup our own handlers
            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;

            if (pc.device.loader.started) // load now if the loader has already been started
                this.load();
        },

        /**
         * Change the alpha level to draw the image at (0.5 = 50% transparent)
         * @param {Number} a Alpha level
         */
        setAlpha:function (a)
        {
            this.alpha = a;
        },

        /**
         * Change the x and/or y scale to draw the image at.
         * @param {Number} scaleX x-scale to draw at (2 = 200% wide, -1 = reversed normal on x)
         * @param {Number} scaleY y-scale to draw at (2 = 200% high, -1 = reversed normal on y)
         */
        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        },

        /**
         * Sets the componsite drawing operation for this image.
         * @param {String} o Operation to use (e.g. 'lighter')
         */
        setCompositeOperation:function (o)
        {
            this.compositeOperation = o;
        },

        /**
         * Load an image directly
         * @param {Function} onLoadCallback Function to be called once the image has been loaded
         * @param {Function} onErrorCallback Function to be called if the image fails to load
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            if (this.loaded && onLoadCallback) this.onLoadCallback(this);

            this.image.onload = this._onLoad.bind(this);
            this.image.onerror = this._onError.bind(this);
            this.image.src = this.src;
        },

        /**
         * Force this image to be reloaded
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        /**
         * Draw the image onto a context
         * @param {Context} ctx Context to draw the sprite image on
         * @param {Number} sx Source position in the image (or detination x if only 3 params)
         * @param {Number} sy Source position in the image (or destination y if only 3 params)
         * @param {Number} x x-position destination x position to draw the image at
         * @param {Number} y y-position destination y position to draw the image at
         * @param {Number} width Width to draw (will clip the image edge)
         * @param {Number} height Height to draw (will clip the image edge)
         * @param {Number} rotationAngle Angle to draw the image at
         */
        draw:function (ctx, sx, sy, x, y, width, height, rotationAngle)
        {
            // scale testing
            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = this.compositeOperation;

            if (arguments.length == 3)
            {
                ctx.save();
                if (this.alpha != 1)
                    ctx.globalAlpha = this.alpha;
                ctx.translate(sx + (this.width / 2), sy + (this.height / 2));
                ctx.scale(this.scaleX, this.scaleY);
                ctx.drawImage(this.image, 0, 0, this.width, this.height, (-this.width / 2),
                    (-this.height / 2), this.width, this.height);
                ctx.restore();
            }
            else
            {
                if (pc.valid(rotationAngle))
                {
                    ctx.save();

                    if (this.alpha != 1)
                        ctx.globalAlpha = this.alpha;
                    if (this.scaleX < 0 || this.scaleY < 0)
                    {
                        var yf = this.scaleY == 1 ? 0 : this.scaleY;
                        var xf = this.scaleX == 1 ? 0 : this.scaleX;

                        ctx.translate((x + (width / 2) * xf), (y + (height / 2) * yf));
                    } else
                        ctx.translate(x + (width / 2), y + (height / 2));

                    ctx.rotate(rotationAngle * (Math.PI / 180));
                    ctx.scale(this.scaleX, this.scaleY);
                    ctx.drawImage(this.image, sx, sy, width, height, (-width / 2), (-height / 2), width, height);
                    ctx.restore();
                }
                else
                {
                    ctx.save();

                    if (this.alpha != 1)
                        ctx.globalAlpha = this.alpha;
                    if (this.scaleX < 0 || this.scaleY < 0)
                    {
                        var yf2 = this.scaleY == 1 ? 0 : this.scaleY;
                        var xf2 = this.scaleX == 1 ? 0 : this.scaleX;

                        ctx.translate(x + (-(width / 2) * xf2), y + (-(height / 2) * yf2));
                    } else
                        ctx.translate(x, y);

                    ctx.scale(this.scaleX, this.scaleY);
                    ctx.drawImage(this.image, sx, sy, width, height, 0, 0, width, height);
                    ctx.restore();
                }
            }

            if (this.compositeOperation != null)
                ctx.globalCompositeOperation = 'source-over';
            pc.device.elementsDrawn++;

        },

        _onLoad:function ()
        {
            this.loaded = true;

            this.width = this.image.width;
            this.height = this.image.height;

            if (this.onLoadCallback)
                this.onLoadCallback(this);
        },

        _onError:function ()
        {
            if (this.onErrorCallback)
                this.onErrorCallback(this);
        },

        /**
         * Expands the image by adding blank pixels to the bottom and side
         * @param {Number} extraWidth Amount of width to add
         * @param {Number} extraHeight Amount of height to add
         */
        expand:function (extraWidth, extraHeight)
        {
            this.image.width = this.width + extraWidth;
            this.image.height = this.height + extraHeight;
            this.width = this.image.width;
            this.height = this.image.height;
        },

        resize:function (scaleX, scaleY)
        {
            var sw = this.width * scaleX;
            var sh = this.height * scaleY;

            var startingImage = document.createElement('canvas');
            startingImage.width = this.width;
            startingImage.height = this.height;

            var result = document.createElement('canvas');
            result.width = sw;
            result.height = sh;

            var ctx = result.getContext('2d');
            var resultPixels = ctx.getImageData(0, 0, sw, sh);

            var startingCtx = startingImage.getContext('2d');
            startingCtx.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            var startingPixels = startingCtx.getImageData(0, 0, this.width, this.height);

            for (var y = 0; y < sh; y++)
            {
                for (var x = 0; x < sw; x++)
                {
                    var i = (Math.floor(y / scaleY) * this.width + Math.floor(x / scaleX)) * 4;
                    var is = (y * sw + x) * 4;
                    for (var j = 0; j < 4; j++)
                        resultPixels.data[is + j] = startingPixels.data[i + j];
                }
            }

            ctx.putImageData(resultPixels, 0, 0);
            this.image = result;
            return this;
        }


    });

// todo: this should be derived from image (or at least a common base -- merge things like scaling factor api)
pc.CanvasImage = pc.Base.extend('pc.CanvasImage', {},
    {

        width:0,
        height:0,
        canvas:null,
        loaded:true,
        scaleX:1,
        scaleY:1,

        init:function (canvas)
        {
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
        },

        draw:function (ctx, sx, sy, x, y, width, height)
        {
            if (width == undefined || height == undefined || width == 0 || height == 0)
                ctx.drawImage(this.canvas, sx, sy);
            else
                ctx.drawImage(this.canvas, sx, sy, width, height, x * this.scaleX, y * this.scaleY,
                    width * this.scaleX, height * this.scaleY);
        },

        setScale:function (scaleX, scaleY)
        {
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }

    });


pc.ImageTools = pc.Base.extend('pc.ImageTools',
    {
        /**
         * Rotates an image by the given number of directions
         * @param image Source image
         * @param w Width of the image
         * @param h Height of the image
         * @param directions Number of directions you want back
         * @return {pc.CanvasImage} A new pc.CanvasImage with the rotations
         */
        rotate:function (image, w, h, directions)
        {
            // create an destination canvas big enough
            var resultCanvas = document.createElement('canvas');
            resultCanvas.width = w * directions;
            resultCanvas.height = h;

            var ctx = resultCanvas.getContext('2d');

            // find center of the source image
            var cx = w / 2;
            var cy = h / 2;

            for (var d = 0; d < directions; d++)
            {
                ctx.save();
                ctx.translate(d * w + (w / 2), h / 2);
                ctx.rotate(((360 / directions) * d) * (Math.PI / 180));
                ctx.drawImage(image, -(w / 2), -(h / 2));
                ctx.restore();
            }

            return new pc.CanvasImage(resultCanvas);
        }


    },
    {});/**
 * Playcraft Engine - (c) 2011 Playcraft Labs, inc.
 */

/**
 * @class pc.Scene
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A game is primarily a container for various "scenes", with each scene containing one or more layers. You can
 * construct a scene, and use addScene to add it to the game. This is typically done once all the queued resources
 * have been loaded:
 * <pre><code>
 * onLoaded:function ()
 * {
 *    // construct the game scene
 *    this.gameScene = new GameScene();
 *
 *    // add it to the game
 *    this.addScene(this.gameScene);
 * }
 * </code></pre>
 * Active scenes will be updated and drawn by the system, inactive ones will not. Adding a scene makes it active by
 * default.
 * <p>
 * To activate a scene (such as displaying a menu scene):
 * <pre><code>
 * myGame.activateScene(myMenuScene);
 * </code></pre>
 * You can likewise deactivate a scene (it will no longer be rendered or processed):
 * <pre><code>
 * myGame.deactivateScene(myMenuScene);
 * </code></pre>
 * Upon activating a scene, the game's onSceneActivated is called passing in the scene that became active. Likewise
 * onSceneDeactivated will be called when a scene is deactivated.
 * <p>
 * You can access scenes by calling getFirstScene or getFirstActiveScene which will return a pc.LinkedListNode you can
 * use to loop through the list of scenes:
 * <pre><code>
 * var sceneNode = myGame.getFirstScene();
 * while (sceneNode)
 * {
 *    var scene = sceneNode.object();
 *    // scene.doSomething();
 *
 *    // move to the next one (will be null if done)
 *    sceneNode = sceneNode.next();
 * }
 * </code></pre>
 */
pc.Scene = pc.Base.extend('pc.Scene',
    /** @lends pc.Scene */
    {},
    /** @lends pc.Scene.prototype */
    {
        /** Name of the scene */
        name:null,
        /** An index of layers by name */
        layersByName:null,
        /** Linked list of all layers in the scene */
        layers:null,
        /** Linked list of all active layers */
        activeLayers:null,
        /** Whether the scene is currently paused (read-only) */
        paused:false,
        /** Whether the scene is active (read-only) */
        active:true,
        /** pc.Rect of the current viewport */
        viewPort: null,

        viewPortCenter: null, // readonly, changes when you call setViewPort

        /**
         * Constructs a new scene with the given name
         * @param {String} name Name of the scene, i.e. 'menu'
         */
        init:function (name)
        {
            this._super();
            this.name = name;
            this.layersByName = new pc.Hashtable();
            this.layers = new pc.LinkedList();
            this.activeLayers = new pc.LinkedList();

            this.viewPort = pc.Rect.create(0, 0, 0, 0); // set by setViewPort below
            this.viewPortCenter = pc.Point.create(0, 0);

            // set the view port to be the default size of the system canvas
            this.setViewPort(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // if the system has already started, then automatically call the onReady
            if (pc.device.started)
                this.onReady();
        },

        /**
         * Called when the device is ready
         */
        onReady:function ()
        {
            // signal all the layers that we're ready
            var next = this.layers.first;
            while (next)
            {
                next.obj.onReady();
                next = next.next();
            }
        },

        /**
         * Called when this scene is being activated
         */
        onActivated:function ()
        {
        },

        /**
         * Called when this scene has been deactviated
         */
        onDeactivated:function ()
        {
        },

        /**
         * Event notifier when the underlying game canvas is being resized
         * @param {Number} width New width of the game canvas
         * @param {Number} height New height of the game canvas
         */
        onResize:function (width, height)
        {
            this.setViewPort(this.viewPort.x, this.viewPort.y, width, height);

            var next = this.layers.first;
            while (next)
            {
                next.obj.onResize(width, height);
                next = next.next();
            }
        },

        /**
         * Sets the view port to the given top left postion (x, y) and dimensions (width and height)
         * The view port represents the on-screen pixels dimensions of the game relative to the
         * associated canvas. Use the view port dimensions to render different scenes at different
         * positions on screen. e.g. a game layer would typically be 0, 0, canvas.width, canvas.height
         * whereas a mini map may just be in the top left corner of the screen (0, 0, 100, 100).
         * @param {Number} x X position to render the scene within the canvas (in screen pixels)
         * @param {Number} y Y position to render the scene within the canvas (in screen pixels)
         * @param {Number} width The maximum width to render (in screen pixels)
         * @param {Number} height The maximum height to render (in screen pixels)
         */
        setViewPort:function (x, y, width, height)
        {
            this.viewPort.x = x;
            this.viewPort.y = y;
            this.viewPort.w = width;
            this.viewPort.h = height;
            this.viewPortCenter.x = this.viewPort.w / 2;
            this.viewPortCenter.y = this.viewPort.h / 2;
        },

        /**
         * Gets the current viewport (essentially an alias for viewPort used by abstract interfaces (such as
         * the input system). You can use it to if you want to write generic code that again layers, scenes and
         * entities, since this method is the same across all. Otherwise you can just read the viewport member
         * directly.
         */
        getScreenRect:function ()
        {
            return this.viewPort;
        },

        /**
         * Resorts layer processing/drawing order based on each layers zIndex value
         */
        sortLayers: function()
        {
            this.activeLayers.sort(
                function(a, b)
                {
                    return a.zIndex - b.zIndex;
                });
        },

        /**
         * Fired when a bound event/action is triggered in the input system. Use bindAction
         * to set one up. Override this in your subclass to do something about it.
         * @param {String} actionName The name of the action that happened
         * @param {Event} event Raw event object
         * @param {pc.Point} pos Position, such as a touch input or mouse position
         */
        onAction:function (actionName, event, pos)
        {
        },

        /**
         * Gets whether the scene is active or not
         * @return {Boolean} True if active
         */
        isActive:function ()
        {
            return this.active;
        },

        /**
         * Gets a layer using a name
         * @param {String} name Name of the layer you want
         * @return {pc.Layer} The layer
         */
        get:function (name)
        {
            return this.layersByName.get(name);
        },

        /**
         * Adds a layer to the scene. The added layer will automatically be made active.
         * @param {pc.Layer} layer Layer you want to add
         * @return {pc.Layer} The layer you added, for convenience.
         */
        addLayer:function (layer)
        {
            this.layersByName.put(layer.name, layer);
            this.layers.add(layer);
            this.activeLayers.add(layer);
            layer.active = true;
            layer.scene = this;
            layer.onAddedToScene();
            this.sortLayers();

            return layer;
        },

        /**
         * Remove a layer
         * @param {pc.Layer} layer The layer you want to remove
         */
        removeLayer:function (layer)
        {
            this.layersByName.remove(layer.name);
            this.layers.remove(layer);
            this.activeLayers.remove(layer);
            layer.active = false;
            layer.scene = null;
            layer.onRemovedFromScene();
        },

        /**
         * Sets the layer to active
         * @param {pc.Layer} layer Layer you want to make active
         */
        setLayerActive:function (layer)
        {
            this.activeLayers.add(layer);
            this.sortLayers();
            layer.active = true;
        },

        /**
         * Sets the layer to inactive
         * @param {pc.Layer} layer Layer you want to make inactive
         */
        setLayerInactive:function (layer)
        {
            this.activeLayers.remove(layer);
            layer.active = false;
        },

        /**
         * Toggles a layer to active or inactive
         * @param {pc.Layer} layer Layer you want to toggle
         */
        toggleLayerActive: function(layer)
        {
            if (layer.active)
                this.setLayerInactive(layer);
            else
                this.setLayerActive(layer);
        },

        /**
         * Gets the linked list node of the first active layer
         * @return {pc.LinkedListNode} Node pointing to the first layer
         */
        getFirstActiveLayer:function ()
        {
            return this.activeLayers.first;
        },

        /**
         * Gets the linked list node of the first layer
         * @return {pc.LinkedListNode} Node pointing to the first layer
         */
        getFirstLayer:function ()
        {
            return this.layers.first;
        },

        //
        // LIFECYCLE
        //
        startTime: 0,

        process:function ()
        {
            // draw all the layers
            var next = this.activeLayers.first;
            while (next)
            {
                if (!next.obj.paused)
                {
                    next.obj.process();

                    this.startTime = Date.now();
                    next.obj.draw();
                    pc.device.lastDrawMS += (Date.now() - this.startTime);
                }
                next = next.next();
            }
        },

        /**
         * Pauses all active layers
         */
        pause:function ()
        {
            this.paused = true;
            var next = this.activeLayers.first;
            while (next)
            {
                next.obj.pause();
                next = next.next();
            }
        },

        /**
         * Resumes all active layers
         */
        resume:function ()
        {
            this.paused = false;
            var next = this.activeLayers.first;
            while (next)
            {
                next.obj.resume();
                next = next.next();
            }
        },

        /**
         * Resets all layers
         */
        reset:function ()
        {
            var next = this.layers.first;
            while (next)
            {
                next.obj.reset();
                next = next.next();
            }

            this.layers.clear();
            this.activeLayers.clear();
        },

        /**
         * Ask all the layers etc for any entities under the x, y position
         * @param {Number} x the screen x position
         * @param {Number} y the screen y position
         */
        entitiesUnderXY:function (x, y)
        {
            var found = [];
            var next = this.layers.first;
            while (next)
            {
                found.push(next.obj.entitiesUnderXY(x, y));
                next = next.next();
            }
        },


        /**
         * Loads all of the layers from a Tiled (TMX) map file. Tile layers will become instances of
         * TileLayer, objectgroups will become EntityLayers. Tile sets must have a name that matches an
         * available spritesheet image resource. Note that only a single tilesheet is currently supported.
         * @param {String} levelData XML formatted TMX data
         */
        loadFromTMX:function (levelData, entityFactory)
        {
            var xmlDoc = pc.device.parseXML(levelData.data);
            var mapXML = xmlDoc.getElementsByTagName('map')[0];

            var tileWidth = parseInt(mapXML.getAttribute('tilewidth'));
            var tileHeight = parseInt(mapXML.getAttribute('tileheight'));

            // load up the tilesets (note: only 1 is supported right now)
            // todo: add support for multiple tile sets

            //
            // TILESET
            //
            var tileSetXML = xmlDoc.getElementsByTagName('tileset')[0];
            var tsName = tileSetXML.getAttribute('name');
            var tsImageWidth = tileSetXML.getAttribute('width');
            var tsImageHeight = tileSetXML.getAttribute('height');
            var tileSheet = pc.device.loader.get(tsName);
            pc.assert(tileSheet, 'Unable to locate tile image resource: ' + tsName + '. It must match the tileset name in tiled.');

            var tsImageResource = pc.device.loader.get(tsName).resource;
            var tsSpriteSheet = new pc.SpriteSheet({ image:tsImageResource, frameWidth:tileWidth, frameHeight:tileHeight });

            // create a tileset object which marries (one or more spritesheet's) and contains tileproperty data
            // pulled from tiled

            var tileSet = new pc.TileSet(tsSpriteSheet);

            // load all the tile properties
            var tiles = xmlDoc.getElementsByTagName('tile');
            for (var p = 0; p < tiles.length; p++)
            {
                var tile = tiles[p];
                var tileId = parseInt(tile.getAttribute('id'));

                var pr = tile.getElementsByTagName('properties')[0];
                var props = pr.getElementsByTagName('property');

                for (var b = 0; b < props.length; b++)
                {
                    var prop = props[b];
                    var name = prop.getAttribute('name');
                    var value = prop.getAttribute('value');
                    tileSet.addProperty(tileId, name, value);
                }
            }

            //
            // LAYERS
            //
            var layers = xmlDoc.getElementsByTagName('layer');
            for (var m = 0; m < layers.length; m++)
            {
                pc.TileLayer.loadFromTMX(this, layers[m], tileWidth, tileHeight, tileSet);
            }

            // load entity layers
            var objectGroups = xmlDoc.getElementsByTagName('objectgroup');
            for (var i = 0; i < objectGroups.length; i++)
            {
                // partial construction

                // fill in the rest using the data from the TMX file
                pc.EntityLayer.loadFromTMX(this, objectGroups[i], entityFactory);
            }

        }




    });
/**
 * Playcraft Engine
 * game.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 */

/**
 * @class pc.Game
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * pc.Game is the primary base class for creating a game and drives resources, core processing (cycling) your
 * game, and serves as a placeholder for scenes.
 * <h5>Basic Usage</h5>
 * <p>
 * Typically a pc.Game is constructed by the pc.start method call made from within your games index.html:
 * <pre><code>
 * &ltscript&gt
 *    // pc.start will construct an instance of TheGame once the device (browser) is ready
 *    pc.start('pcGameCanvas', 'TheGame', '/mygame/js/', ['mygame.js']);
 * &lt/script&gt
 * </code></pre>
 * When the pc.start system has finished preparing everything, it will dynamically construct an instance of
 * the class parameter (in the above example 'TheGame'). You can always gain access to the game from the global
 * pc.device:
 * <pre><code>
 * var myGame = pc.device.game;
 * </code></pre>
 * <p>
 * To create a pc.Game, extend it and override what you need:
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     // onReady is called when the browser DOM is ready
 *     onReady:function ()
 *     {
 *         this._super();
 *
 *         // load resources
 *         // declare a base URL; saves you typing
 *         pc.device.loader.setBaseUrl('images/');
 *
 *         // add an image to the resource loader's queue
 *         pc.device.loader.add(new pc.Image('player-ship', 'ship1.png'));
 *
 *         // start the resource loader
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // draw title screen -- with loading bar
 *     }
 *
 * });
 * </code></pre>
 * See the pc.Loader for more information on using the resource loader and the onLoading/onLoaded callbacks.
 * <p>

 * <h5>Pause/Resume</h5>
 * <p>
 * You can pause/resume individual scenes, or you can pause/resume all scenes by calling pause on the game:
 * <pre><code>
 * myGame.pause();
 * myGame.resume();
 * myGame.togglePauseResume();
 * </code></pre>
 *
 * <h5>Debugging</h5>
 * pc.Game sets up the following default input keys for debugging:
 * <ul>
 *     <li>F9 to enable/disable physics debugging across all layers.</li>
 *     <li>F10 to dump stats on the object pools.</li>
 *     <li>F11 toggle sound.</li>
 * </ul>
 */

pc.Game = pc.Base.extend('pc.Game', {},
    /** @lends pc.Game.prototype */
    {
        /** (pc.LinkedList) List of all scenes in the game */
        scenes:null,
        /** (pc.LinkedList) List of scenes current active */
        activeScenes:null,
        /** (Boolean) Whether the game is currently paused. You can theGame.paused=true; to suspend all scenes **/
        paused:false,

        /**
         * Constructs a new game using the supplied canvas element ID and fps
         * @param {String} canvasId Id of the canvas element that will serve as the game canvas
         * @param {Number} fps Base frame rate in frames per second (fastest cycle time)
         */
        init:function (canvasId, fps)
        {
            this._super();

            this.scenes = new pc.LinkedList();
            this.activeScenes = new pc.LinkedList();

            if (pc.device.devMode)
            {
                // bind some special keys for general debugging use
                pc.device.input.bindAction(this, 'physics debug', 'F9');
                pc.device.input.bindAction(this, 'pool dump', 'F10');
                pc.device.input.bindAction(this, 'toggle sound', 'F11');
            }
        },

        /**
         * Processes all active scenes (called automatically by pc.Device.cycle)
         * @return {Boolean} false indicates the device should stop running the game loop
         */
        process:function ()
        {
            if (this.paused) return true;

            var scene = this.getFirstActiveScene();
            while (scene)
            {
                scene.object().process();
                scene = scene.next();
            }

            return true; // return false to quit the update loop
        },

        stopAllSounds: function()
        {
            // stop any current sounds from playing
            var sounds = pc.device.loader.getAllSounds();
            for (var i = 0; i < sounds.length; i++)
            {
                if (pc.device.soundEnabled)
                    sounds[i].stop();
            }
        },

        /**
         * Base handler for input actions. This gives the game a chance to intercept and act on actions like
         * F9 and F10 for debugging. See pc.Input for more information on input handlers
         * @param {String} actionName Name of the action to be handled
         */
        onAction:function (actionName)
        {
            if (actionName === 'toggle sound')
            {
                this.stopAllSounds();
                // toggle the sound
                pc.device.soundEnabled = !pc.device.soundEnabled;
            }

            if (actionName === 'pool dump')
            {
                console.log(pc.Pool.getStats());
            }

            if (actionName === 'physics debug')
            {
                // find all physics systems, and toggle debug
                var sceneNode = this.getFirstScene();
                while (sceneNode)
                {
                    var layerNode = sceneNode.object().getFirstActiveLayer();
                    while (layerNode)
                    {
                        var layer = layerNode.object();
                        if (layer.Class.isA('pc.EntityLayer'))
                        {
                            var systemNode = layer.systemManager.systems.first;
                            while (systemNode)
                            {
                                var system = systemNode.object();
                                if (system.Class.isA('pc.systems.Physics'))
                                    system.setDebug(!system.debug);
                                systemNode = systemNode.next();
                            }
                        }
                        layerNode = layerNode.next();
                    }
                    sceneNode = sceneNode.next();
                }

            }
        },

        //
        // SCENES
        //
        /**
         * Add a scene to the game. Automatically makes the scene active. Once added, the game's onSceneAdded method
         * will be called.
         * @param {pc.Scene} scene Scene to add
         */
        addScene:function (scene)
        {
            this.scenes.add(scene);
            this.activeScenes.add(scene);
            this.onSceneAdded(scene);
        },

        /**
         * Called whenever a scene is added to the game. Useful for handling setup or detecting when new scenes are
         * being added.
         * @param {pc.Scene} scene Scene that was added
         */
        onSceneAdded:function (scene)
        {
        },

        /**
         * Removes a scene from the game. Will trigger a notifier call to onSceneRemoved
         * @param {pc.Scene} scene Scene to remove
         */
        removeScene:function (scene)
        {
            this.scenes.remove(scene);
            this.activeScenes.remove(scene);
            this.onSceneRemoved(scene);
        },

        /**
         * Notifier callback when a scene is removed from this game
         * @param {pc.Scene} scene Scene being removed
         */
        onSceneRemoved:function (scene)
        {
        },

        /**
         * Activates a scene (it will be rendered and processed)
         * @param {pc.Scene} scene Scene you want to make active
         */
        activateScene:function (scene)
        {
            if (scene.active) return;

            this.activeScenes.add(scene);
            scene.active = true;
            this.onSceneActivated(scene);
            scene.onActivated();
        },

        /**
         * Called when a scene has been activated.
         * @param {pc.Scene} scene Scene that has been activated.
         */
        onSceneActivated:function (scene)
        {
        },

        /**
         * Deactivate a given scene
         * @param {pc.Scene} scene Scene to deactivate
         */
        deactivateScene:function (scene)
        {
            if (!scene.active) return;

            this.activeScenes.remove(scene);
            scene.active = false;
            this.onSceneDeactivated(scene);
            scene.onDeactivated();
        },

        /**
         * Called when a scene has been deactviated
         * @param {pc.Scene} scene Scene that was deactivated
         */
        onSceneDeactivated:function (scene)
        {
        },

        /**
         * Get the first active scene from the active scenes linked list
         * @return {pc.LinkedNode} Linked list node pointing to the first active scene (use getFirstActiveScene().object())
         * to get the scene.
         */
        getFirstActiveScene:function ()
        {
            return this.activeScenes.first;
        },

        /**
         * Get the first scene from the scene linkedlist
         * @return {pc.LinkedNode} Linked node pointing to the first scene
         */
        getFirstScene:function ()
        {
            return this.scenes.first;
        },

        //
        // lifecycle
        //

        /**
         * Pauses all scenes, which means no drawing or updates will occur. If you wish to pause game play and leave a menu
         * still running, then just pause the scene associated with game play, and not the menu scenes.
         */
        pause:function ()
        {
            this.paused = true;

            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.object().pause();
                nextScene = nextScene.next();
            }
        },

        /**
         * @return {Boolean} True is the game is active (not paused)
         */
        isActive:function ()
        {
            return !this.paused;
        },

        /**
         * Resumes all scenes (after being paused)
         */
        resume:function ()
        {
            this.paused = false;

            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.object().resume();
                nextScene = nextScene.next();
            }
        },

        /**
         * Toggles pause/resume of the game
         */
        togglePauseResume:function ()
        {
            if (pc.system.game.paused)
                pc.system.game.resume();
            else
                pc.system.game.pause();
        },

        /**
         * Resets all scenes back to their starting state (by calling reset() on all scenes), then calling
         * clear() on all scenes, before finally calling the game class onReady
         */
        reset:function ()
        {
            // clear all scenes, layers, entities
            var nextScene = this.getFirstScene();
            while (nextScene)
            {
                nextScene.obj.reset();
                nextScene = nextScene.next();
            }

            this.scenes.clear();
            this.activeScenes.clear();

            // then restart the game
            this.onReady();
        },

        /**
         * Called by the pc.Device when the game is ready to be started (also called when a reset() is done)
         */
        onReady:function ()
        {
        },

        /**
         * Called when the device canvas changes size (such as when a browser is resized)
         * @param width Width of the canvas
         * @param height Height of the canvas
         */
        onResize:function (width, height)
        {
            var nextScene = this.getFirstActiveScene();
            while (nextScene)
            {
                nextScene.obj.onResize(width, height);
                nextScene = nextScene.next();
            }
        },

        /**
         * Convenience fucntion to grab the size of the associated device screen
         * @return {pc.Rect} Rectangle of the current canvas
         */
        getScreenRect:function ()
        {
            return pc.Rect.create(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);
        }


    });



/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.Loader
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The Loader takes care of loading resources (downloading) and then notifying you when everything
 * is ready. The loader is a static class that will always be constructed by the engine and accessible through th
 * pc.device.loader member.
 * <p>
 * Using the loader you can load <a href='pc.Image'>pc.Image</a>'s, <a href='pc.DataResource'>pc.DataResources</a>'s,
 * and <a href='pc.Sound'>pc.Sound</a>'s.
 * <p>
 * Typically you use the loader from within your game class onReady method (called automatically by the engine).
 * <pre><code>
 * TheGame = pc.Game.extend('TheGame',
 * {},
 * {
 *     onReady:function ()
 *     {
 *         this._super(); // call the base class' onReady
 *
 *         // disable caching when developing
 *         if (pc.device.devMode)
 *             pc.device.loader.setDisableCache();
 *
 *         // load up resources
 *         pc.device.loader.add(new pc.Image('spaceship', 'images/spaceship.png'));
 *
 *         // fire up the loader (with a callback once done)
 *         pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
 *     },
 *
 *     onLoading:function (percentageComplete)
 *     {
 *         // display progress, such as a loading bar
 *     },
 *
 *     onLoaded:function ()
 *     {
 *         // we're ready; make the magic happen
 *     }
 * });
 * </code></pre>
 * You can disable caching using setDisableCache. This is the default when in devMode (when the engine has not been
 * packed/minified.
 */

pc.Loader = pc.Base.extend('pc.Loader',
    {},
    /** @lends pc.Loader.prototype */
    {
        State:{ QUEUED:0, LOADING:1, READY:2, FAILED:3 },

        /** A hashtable of all the resources, keyed by the resource name */
        resources:new pc.Hashtable(),
        /** Function called after each new resource has been loaded */
        loadingListener:null,
        /** Function called after all resources have been loaded or errored */
        loadedListener:null,
        /** Progress of the loader (number of items loaded so far) */
        progress:0,
        /** Total number of resources to be loaded */
        totalBeingLoaded:0,
        /** Number of resources that had a problem */
        errored:0,
        /** Optional baseURI prepended to resource URI's */
        baseUrl:'',

        /**
         * True if loader.start() has been called. Typically resources use this to check
         * if they should just load immediately (after game start) or hold on loading until the loader calls (triggered
         * by loader.start()
         */
        started:false,
        /** True if the resource loader has finished loading everything */
        finished:false,

        _noCacheString:'',

        /**
         * Constructor -- typically called by the engine to automatically construct pc.device.loader.
         */
        init:function ()
        {
            this._super();
        },

        /**
         * Tells the resource loader to disable caching in the browser by modifying the resource src
         * by appending the current date/time
         */
        setDisableCache:function ()
        {
            this._noCacheString = '?nocache=' + Date.now();
        },

        /**
         * Sets a base URI to save you type. Applies to all resources added until the next setBaseURL is called.
         * @param {String} url URI to preprend
         */
        setBaseUrl:function (url)
        {
            this.baseUrl = url;
        },

        /**
         * Sets an optional listener
         * @param {Function} loadingListener Function to call when each resource is loaded
         * @param {Function} loadedListener Function to call when all resources have been loaded
         */
        setListener:function (loadingListener, loadedListener)
        {
            this.loadingListener = loadingListener;
            this.loadedListener = loadedListener;
        },

        /**
         * Add a resource to the loader queue
         * @param {pc.Image|pc.Sound|pc.DataResource} resource Resource to load
         */
        add:function (resource)
        {
            // resource.src already has the baseUrl set by the resource class (i.e. pc.Image)
            // so no need to add it here
            this.resources.put(resource.name.toLowerCase(), { resource:resource, state:this.State.QUEUED });
            this.info('Adding resource ' + resource.src + ' to the queue.');
        },

        /**
         * Retrieve a resource from the loader
         * @param {String} name Name of the resource
         * @return {pc.Image|pc.Sound|pc.DataResource} Resource
         */
        get:function (name)
        {
            var res = this.resources.get(name.toLowerCase());
            if (!res)
                this.warn("Attempting to get a resource that hasn't been added: " + name);
            return res;
        },

        /**
         * Get all the sound resources
         * @return {Array} An array of all the sounds
         */
        getAllSounds:function ()
        {
            var sounds = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]).resource;
                if (res.Class.isA('pc.Sound'))
                    sounds.push(res);
            }
            return sounds;
        },

        /**
         * Get all the image resources
         * @return {Array} An array of all the images
         */
        getAllImages:function ()
        {
            var images = [];
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]);
                if (res.isA('pc.Image'))
                    images.push(res);
            }

            return images;
        },

        /**
         * Starts the resource loader
         * @param {Function} loadingListener Function to call after each resource is loaded
         * @param {Function} loadedListener Function to call after all resources have been loaded or errored.
         */
        start:function (loadingListener, loadedListener)
        {
            this.setListener(loadingListener, loadedListener);

            this.progress = 0;
            this.errored = 0;

            // ask all of the resources to get busy loading
            var keys = this.resources.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var res = this.resources.get(keys[i]);
                if (res.state == this.State.QUEUED)
                {
                    res.resource.load(this._onLoad.bind(this), this._onError.bind(this));
                    res.state = this.State.LOADING;
                    this.totalBeingLoaded++;
                }
            }
            this.info('Started loading ' + this.totalBeingLoaded + ' resource(s).');
        },

        /**
         * Generates a URL using a src string (by prepending the baseURL and appending the optional no-cache string
         * @param {String} src Source URI
         * @return {String} A full resource URI
         */
        makeUrl:function (src)
        {
            return this.baseUrl + src + this._noCacheString;
        },

        _onLoad:function (resource)
        {
            var res = this.resources.get(resource.name);
            res.state = this.State.READY;
            this.progress++;

            if (this.loadingListener != null)
                this.loadingListener(Math.round((this.progress / this.totalBeingLoaded) * 100));

            this.info(resource.name + ' loaded (' + Math.round((this.progress / this.totalBeingLoaded) * 100) + '% done)');

            this._checkAllDone();
        },

        _onError:function (resource)
        {
            var res = this.resources.get(resource.name);
            res.state = this.State.FAILED;
            this.progress++;
            this.errored++;

            if (this.loadingListener != null)
                this.loadingListener(this.progress / this.totalBeingLoaded);
            this.warn(resource.name + ' (' + resource.src + ') failed.');

            this._checkAllDone();
        },

        _checkAllDone:function ()
        {
            if (this.progress >= this.totalBeingLoaded)
            {
                this.finished = true;
                this.loadedListener(this.progress, this.errored);
                this.progress = 0;
                this.errored = 0;
                this.totalBeingLoaded = 0;
            }

        }

    });



/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.DataResource
 * @augments pc.Base
 * @description
 * A generic resource you can load data, such as JSON, XML or config files from a URL, just like an image or sound file.
 * <p>
 * To load a resource, use the pc.Loader to add a resource:
 * <pre><code>
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx'));
 * </code></pre>
 * <p>
 * Once you have the resource loaded you can access the contents of the resource using the data member:
 * <pre><code>
 * var xmlData = pc.device.loader.get('level1').resource.data;
 * </code></pre>
 * <p>
 * You can optionally provide a function to be called when the resource has finished loading or has an error.
 * <pre><code>
 * function onLevelDataLoaded(dataResource)
 * {
 *    // dataResource.data
 * }
 * pc.device.loader.add(new pc.DataResource('level1', 'data/level1.tmx', onLevelDataLoaded));
 * </code></pre>
 * <p>
 * The Scrollia demo game has an example using that loads the level.tmx file from the editor as a data resource which
 * is passed to pc.Scene to construct entities and layers.
 */
pc.DataResource = pc.Base.extend('pc.DataResource',
    {},
    /** @lends pc.DataResource.prototype */
    {
        /** Data resource that has been loaded */
        data:null,
        /** HTTP request object used to load the data */
        request:null,
        /** src URL */
        src:null,
        /** Short name for this resource */
        name: null,
        /** boolean indicating whether the resource has been loaded yet */
        loaded:false,
        /** current callback when the resource has been loaded */
        onLoadCallback:null,
        /** current callback if an error occurs whilst loading the resource */
        onErrorCallback:null,

        /**
         * Loads data from a remote (URI) resource.
         * @param {String} src URI for the data
         * @param {function} [onLoadCallback] Function to be called once the image has been loaded
         * @param {function} [onErrorCallback] Function to be called if the image fails to load
         */
        init:function (name, src, onLoadCallback, onErrorCallback)
        {
            this._super();
            this.src = pc.device.loader.makeUrl(src);
            this.name = name;
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;
            this.request = new XMLHttpRequest();
            this.request.onreadystatechange = this.onReadyStateChange.bind(this);
            this.request.onload = this.onReadyStateChange.bind(this);
            this.request.onloadend = this.onReadyStateChange.bind(this);
            this.load();
        },

        /**
         * Triggers an immediate load of the resource. Use only if you're manually loading a resource, otherwise
         * the pc.Loader will automatically call load when it starts.
         * @param {function} [onLoadCallback] Optional function called when the resource has finished loading
         * @param {function} [onErrorCallback] Optional function called if the resource fails to load
         * @param
         */
        load:function (onLoadCallback, onErrorCallback)
        {
            this.onLoadCallback = onLoadCallback;
            this.onErrorCallback = onErrorCallback;

            this.request.open('get', this.src);
            this.request.send(null);
        },

        /**
         * Force the reloading of a resource (by marking it not loaded and calling load
         */
        reload:function ()
        {
            this.loaded = false;
            this.load();
        },

        /**
         * Called when the resource is loaded/ready. Generally this is used internally, and you should use the
         * onLoadCallback function optionally pass to the load method or constructor
         */
        onReadyStateChange:function()
        {
            if (this.loaded) return;

            if (this.request.readyState == 4)
            {
                if (this.request.status == 200)
                {
                    this.loaded = true;

                    this.data = this.request.responseText;

                    if (this.onLoadCallback)
                        this.onLoadCallback(this);
                } else
                if (this.request.status == 404)
                {
                    this.warn('resource ' + this.src + ' error ' + this.request.status);
                    if (this.onErrorCallback)
                        this.onErrorCallback(this);
                }
            }
        }


    });
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
            return this._super();
        }
    },
    /** @lends pc.components.Component.prototype */
    {
        /** entity I am on, or null if I'm not on an entity */
        _entity: null,

        _type:null,

        /**
         * Constructs a new component using the given type string
         * @param {String} type The type to assign the component
         */
        init:function (type)
        {
            this._super();
            this._type = type;
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

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Physics
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Physics'>pc.systems.Physics</a>]
 * <p>
 * Adds 2D physics to an entity. See the <a href='/develop/guides/physics'>physics</a> and
 * <a href='/develop/guides/collisions'>collision</a> guides for more information.
 *
 * <h5>Shapes</h5>
 * You can define physics shapes by providing an array of settings, one for each shape. The available options for
 * each shape are:
 * - shape: shape type (pc.CollisionShape.RECT | pc.CollisionShape.CIRCLE | pc.CollisionShape.POLY)
 * - offset: (x, y, w, h) of the shape to the entity's spatial (all default to 0)
 * - type: user-set type which will be passed on in collisions
 * - sensorOnly: boolean, use true to not react to collisions, just report them
 * - collisionGroup: same as component collision group, but applies to only this fixture shape.
 * - collisionMask: same as component collision mask, but applies to only this fixture shape.
 * - collisionCategory: same as component collision category, but applies to only this fixture shape.
 *
 * Here's an example of a complex configuration of shapes (from the Scrollia player entity):
 * <pre><code>
 * e.addComponent(pc.components.Physics.create(
 * {
 *   ...
 *
 *     shapes:[
 *         // upper torso/head
 *         { type:0, offset:{y:-20, w:-60}, shape:pc.CollisionShape.CIRCLE },
 *         // middle torso
 *         { type:0, offset:{y:-3, w:-60}, shape:pc.CollisionShape.CIRCLE },
 *         // leg area
 *         { type:0, offset:{y:12, w:-60}, shape:pc.CollisionShape.CIRCLE },
 *         // feet
 *         { type:1, sensorOnly:true, shape:pc.CollisionShape.CIRCLE, offset:{y:20, w:-68} }
 *     ],
 *
 *     ...
 * }));
 * </code></pre>
 */

pc.components.Physics = pc.components.Component.extend('pc.components.Physics',
    /** @lends pc.components.Physics */
    {
        /**
         * Creates (or acquires) a new physics component using the provided options
         * @param {Number} [options.collisionGroup] Collision group to assign (default: 0)
         * @param {Number} [options.collisionCategory] Collision category to assign (default: 0)
         * @param {Number} [options.collisionMask] Collision mask to assign (default: 0)
         * @param {Boolean} [options.sensorOnly] Don't react to collisions, just sense them (default: false)
         * @param {Array} [options.shapes] An array of shapes representing the fixtures (default: entity's spatial rectangle)
         * @param {pc.Dim} [options.maxSpeed] Maxium velocity to allow the entity to go (as an x, y vector)
         * @param {pc.Dim} [options.gravity] Gravity override for the entity only (x, y vector)
         * @param {Number} [options.mass] Amount of relative mass to assign to the entity
         * @param {Boolean} [options.fixedRotation] True if the object is not allow to turn (default: false)
         * @param {Number} [options.thrust] Initial thrust to apply
         * @param {Number} [options.bounce] Amount of bounciness (2=200% reverse velocity on impact)
         * @param {Boolean} [options.faceVel] Use true to have the entity always face the direction it's heading
         * @param {pc.CollisionShape} [options.shape] Collision shape default (if shapes array not set)
         * @param {Boolean} [options.immovable] Makes the object immovable (by any force)
         * @param {Number} [options.density] How dense the entity is
         * @param {Number} [options.friction] Amount of friction to apply
         * @param {Number} [options.linearDamping] How fast to slow down velocity (less = more slide)
         * @param {Number} [options.angularDamping] How fast to slow down spin (less = better bearings)
         * @param {Boolean} [options.bullet] Special case handling of high-speed objects (enabled CCD)
         * @param {Number} [options.torque] Amount of torque to apply (generate spin)
         * @param {Number} [options.impulse] Amount of impulse force to apply initially
         * @param {Number} [options.turn] Amount of initial spin to apply
         * @param {pc.Dim} [options.centerOfMass] Where to position the entities centerOfMass (x, y)
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Physics.prototype */
    {
        /** maximum speed the entity can move at (pc.Dim|pc.Point) */
        maxSpeed:null,
        /** bounciness (2 = bounce back at twice the impact speed) */
        bounce:0.5,
        /** causes the entity's direction to always match the velocity angle */
        faceVel:false,
        /** the density of the object */
        density:0,
        /** mass */
        mass:-1,
        /** level of friction (rubbing) of the surface */
        friction:0,
        /** rate at which an object will slow down movement */
        linearDamping:0,
        /** rate at which ab object will slow down its rate of spin */
        angularDamping:0,
        /** stop the entity from rotating */
        fixedRotation:false,
        /** tell the physics engine to expect this object to move fast (slows things down */
        bullet:false,
        /**
         * A designated collision index, anything in the same index won't collide
         * a negative value will cause collisions with other objects, but not others of the same index
         * a positive number will cause collisions between objects of this group as well
         */
        collisionGroup:0,
        /** Advanced collisions using a bit mask. Use this to set bits on/off. */
        collisionCategory:0,
        /** Collision mask to apply to the entities */
        collisionMask:0,
        /** Senses collisions only; there will be no reaction to the collision (like pushing back) */
        sensorOnly:false,
        /** Whether the object can move in space (true gives it infinite mass) */
        immovable:false,
        /** Changes the center of mass from the default center (pc.Dim) */
        centerOfMass:null,
        /**
         * Custom gravity (x an y properties)
         */
        gravity:null,

        /** Shapes - an array of shapes that make up this physics body */
        shapes:null,

        /** force to apply on adding the component */
        force:0,
        /** turn (spin) to apply on adding the component */
        turn:0,
        /** torque energy to apply on adding the component */
        torque:0, // torque to apply

        _body:null, // set by the physics system, if this is attached to a physics body
        _fixtures:null, // array of fixtures attached to the body

        /**
         * Constructs and configures a new physics component (see create for details of options)
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.centerOfMass = pc.Point.create(0, 0);
            this.margin = { x:0, y:0 };
            if (pc.valid(options))
                this.config(options);
            this._velReturn = pc.Dim.create(0, 0);
            this.gravity = {};
        },

        /**
         * Configures the physics component (see create for details of options)
         */
        config:function (options)
        {
            this._body = null;
            if (this._fixtures)
                this._fixtures.length = 0;
            else
                this._fixtures = [];

            this.collisionGroup = pc.checked(options.collisionGroup, 0);
            this.collisionCategory = pc.checked(options.collisionCategory, 0);
            this.collisionMask = pc.checked(options.collisionMask, 0);
            this.sensorOnly = pc.checked(options.sensorOnly, false);

            // no shape supplied, create a default one
            if (!pc.valid(options.shapes) && !Array.isArray(options.shapes))
            {
                options.shapes = [
                    {}
                ];
                options.shapes[0].shape = pc.CollisionShape.RECT;
            }

            for (var i = 0; i < options.shapes.length; i++)
            {
                var shape = options.shapes[i];

                // take the spatial, then offset
                if (!shape.offset)
                    shape.offset = {};

                shape.offset.x = pc.checked(shape.offset.x, 0);
                shape.offset.y = pc.checked(shape.offset.y, 0);
                shape.offset.w = pc.checked(shape.offset.w, 0);
                shape.offset.h = pc.checked(shape.offset.h, 0);

                shape.type = pc.checked(shape.type, 0);
                shape.shape = pc.checked(shape.shape, pc.CollisionShape.RECT);
                shape.sensorOnly = pc.checked(shape.sensorOnly, this.sensorOnly);
                shape.collisionGroup = pc.checked(shape.collisionGroup, this.collisionGroup);
                shape.collisionCategory = pc.checked(shape.collisionCategory, this.collisionCategory);
                shape.collisionMask = pc.checked(shape.collisionMask, this.collisionMask);
            }

            this.shapes = options.shapes;

            if (!this.maxSpeed) this.maxSpeed = {};
            if (options.maxSpeed)
            {
                this.maxSpeed.x = pc.checked(options.maxSpeed.x, 0);
                this.maxSpeed.y = pc.checked(options.maxSpeed.y, 0);
            } else
            {
                this.maxSpeed.x = 0;
                this.maxSpeed.y = 0;
            }

            if (options.gravity)
            {
                this.gravity.x = options.gravity.x;
                this.gravity.y = options.gravity.y;
            } else
            {
                this.gravity.x = undefined;
                this.gravity.y = undefined;
            }

            this.mass = pc.checked(options.mass, -1);

            this.fixedRotation = pc.checked(options.fixedRotation, false);
            this.thrust = pc.checked(options.thrust, 0);
            this.bounce = pc.checked(options.bounce, 0.5);
            this.faceVel = pc.checked(options.faceVel, 0);
            this.shape = pc.checked(options.shape, pc.CollisionShape.RECT);

            this.immovable = pc.checked(options.immovable, false);

            this.density = pc.checked(options.density, 1);
            this.friction = pc.checked(options.friction, 0.2);
            this.linearDamping = pc.checked(options.linearDamping, 0);
            this.angularDamping = pc.checked(options.angularDamping, 0);
            this.bullet = pc.checked(options.bullet, false);
            this.torque = pc.checked(options.torque, 0);
            this.impulse = pc.checked(options.impulse, 0);
            this.turn = pc.checked(options.turn, 0);
            this.force = pc.checked(options.force, 0);

            if (pc.valid(options.centerOfMass))
            {
                this.centerOfMass.x = pc.checked(options.centerOfMass.x);
                this.centerOfMass.y = pc.checked(options.centerOfMass.y);
            }
        },

        applyTurn:function (d)
        {
            if (this._body)
            {
                this._body.SetAngularVelocity(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this._pendingDir = d;
        },

        /**
         * Clears any custom gravity
         */
        clearGravity:function ()
        {
            this.setGravity();
        },

        /**
         * Changes gravity for this entity only: useful for swimming through water, climbing ladder or
         * balloons.
         * @param gravityX Gravity value (0 for no gravity)
         * @param gravityY Gravity value (0 for no gravity)
         */
        setGravity:function (gravityX, gravityY)
        {
            this.gravity.x = gravityX;
            this.gravity.y = gravityY;
            if (this._body)
            {
                if (this.gravity.x != undefined || this._body._pc_gravityX != undefined)
                    this._body._pc_gravityX = this.gravity.x;
                if (this.gravity.y != undefined || this._body._pc_gravityY != undefined)
                    this._body._pc_gravityY = this.gravity.y;
            }
        },

        /**
         * Force a direction change
         * @param {Number} d Direction to change to
         */
        setDir:function (d)
        {
            if (this._body)
            {
                this._body.SetAngle(pc.Math.degToRad(d));
                this._body.SetAwake(true);
            } else
                this.dir = d;
        },

        /**
         * Retrieves the current direction
         * @return {Number} Current direction
         */
        getDir:function ()
        {
            if (this._body)
            {
                return pc.Math.radToDeg(this._body.GetAngle());
            }
            return 0;
        },

        /**
         * Applies force to the entity at a given angle
         * @param {Number} f Amount of force to apply
         * @param {Number} a Angle to apply the force at
         */
        applyForce:function (f, a)
        {
            if (this._body)
            {
                var angle = this._body.GetAngle();
                if (pc.valid(a))
                    angle = pc.Math.degToRad(a);

                this._body.ApplyForce(
                    Box2D.Common.Math.b2Vec2.Get(Math.cos(angle) * f, Math.sin(angle) * f),
                    this._body.GetWorldCenter());

            } else
                this.force = f;
        },

        /**
         * Applies immediate force to the entity at a given angle
         * @param {Number} f Amount of force to apply
         * @param {Number} a Direction to apply it at
         */
        applyImpulse:function (f, a)
        {
            if (this._body)
            {
                var angle = this._body.GetAngle();
                if (pc.valid(a))
                    angle = pc.Math.degToRad(a);

                this._body.ApplyImpulse(
                    Box2D.Common.Math.b2Vec2.Get(Math.cos(angle) * f, Math.sin(angle) * f),
                    this._body.GetWorldCenter());
            } else
                this.impulse = f;
        },

        /**
         * Applies angular force (torque/spin) to an object to rotate it
         * @param {Number} a Amount of angular force
         */
        applyTorque:function (a)
        {
            if (this._body)
            {
                this._body.ApplyTorque(pc.Math.degToRad(a));
            } else
                this.torque = a;
        },

        /**
         * Change the center of masss
         * @param {Number} x x-position relative to the origin of the entity
         * @param {Number} y y-position relative to the origin of the entity
         */
        setCenterOfMass:function (x, y)
        {
            if (this._body)
            {
                var md = new Box2D.Collision.Shapes.b2MassData();
                md.center = Box2D.Common.Math.b2Vec2.Get(pc.systems.Physics.toP(x), pc.systems.Physics.toP(y));
                this._body.SetMassData(md);
            } else
            {
                this.centerOfMass.x = x;
                this.centerOfMass.y = y;
            }
        },

        /**
         * Returns the current speed in linear velocity
         * @return {Number} Current linear velocity (the length of the speed vector)
         */
        getSpeed:function ()
        {
            if (this._body)
                return this._body.GetLinearVelocity().Length() / pc.systems.Physics.SCALE;
            return 0;
        },

        /**
         * Force change the speed of the entity
         * @param {Number} x x-component of a speed vector
         * @param {Number} y y-component of a speed vector
         */
        setLinearVelocity:function (x, y)
        {
            if (this._body)
                this._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(x * pc.systems.Physics.SCALE, y * pc.systems.Physics.SCALE));
        },

        _velReturn:null,

        /**
         * Current linear velocity vector
         * @return {pc.Dim} Current velocity as a 2d vector
         */
        getLinearVelocity:function ()
        {
            if (this._body)
            {
                var v = this._body.GetLinearVelocity();
                this._velReturn.setXY(pc.systems.Physics.fromP(v.x), pc.systems.Physics.fromP(v.y));
            }
            return this._velReturn;
        },

        /**
         * Gets the angle based on the current velocity vector
         * @return {Number} Angle
         */
        getVelocityAngle:function ()
        {
            return pc.Math.angleFromVector(this._body.GetLinearVelocity().x, this._body.GetLinearVelocity().y);
        },

        /**
         * Forces an angular velocity (spin) change
         * @param {Number} a Amount of angular force to apply
         */
        setAngularVelocity:function (a)
        {
            if (this._body)
                this._body.SetAngularVelocity(a);
        },

        /*
         getCollisions: function()
         {
         // tbd - return a list of current colliding entities
         var contactList = this._body.GetContactList();
         return ;
         },
         */

        /**
         * Change the collision category (changes all shapes)
         * @param {Number} c Category to change to
         */
        setCollisionCategory:function (c)
        {
            if (!this._fixtures.length) return;

            this.collisionCategory = c;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.collisionCategory = c;
                this._fixtures[i].SetFilterData(f);

                this._fixtures[i].GetFilterData().categoryBits = c;
            }
        },

        /**
         * Change the collision group (changes all shapes)
         * @param {Number} g Group to change to
         */
        setCollisionGroup:function (g)
        {
            if (!this._fixtures.length) return;

            this.collisionGroup = g;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.groupIndex = g;
                this._fixtures[i].SetFilterData(f);
            }
        },

        /**
         * Change the collision mask (changes all shapes)
         * @param {Number} m Mask to change to
         */
        setCollisionMask:function (m)
        {
            if (!this._fixtures.length) return;

            this.collisionMask = m;
            for (var i = 0; i < this._fixtures.length; i++)
            {
                var f = this._fixtures[i].GetFilterData();
                f.maskBits = m;
                this._fixtures[i].SetFilterData(f);
            }
        },

        /**
         * Change the sensor only status of a given shape
         * @param {Boolean} s True if this is only a sensor
         * @param {Number} shapeIndex Index of the shape to change
         */
        setIsSensor:function (s, shapeIndex)
        {
            if (!this._fixtures.length) return;
            this._fixtures[shapeIndex].isSensor = s;
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Alpha
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Changes the alpha drawing of an associated drawable object (sprite, shape, text etc).
 */
pc.components.Alpha = pc.components.Component.extend('pc.components.Alpha',
    /** @lends pc.components.Alpha */
    {
        /**
         * Constructs (or acquires) an alpha component.
         * @param {Number} options.level Amount of initial alpha to set
         * @return {pc.components.Alpha} The new alpha object
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Alpha.prototype */
    {
        /** Current alpha level 0=fully transparent */
        level:1,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.level = pc.checked(options.level, 1);
        },

        /**
         * Set the alpha level
         * @param {Number} a Level to set alpha to
         */
        setAlpha: function(a)   { this.level = a;  this._fix(this.level); },

        /**
         * Add to the alpha level
         * @param {Number} a Amount to increase alpha by
         */
        addAlpha: function(a)   { this.level += a; this._fix(this.level); },

        /**
         * Subtract from the alpha level
         * @param {Number} a Amount o subtract
         */
        subAlpha: function(a)   { this.level -= a; this._fix(this.level); },

        _fix: function(c)
        {
            if (c > 1) return;
            if (c < 0) return;
            this.level = c;
        }

    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.JointType = {
    WELD:0,
    REVOLUTE:1,
    DISTANCE:2
};

/**
 * @class pc.components.Joint
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Physics'>pc.systems.Physics</a>]
 * <p>
 * Creates a joint that holds to physics entities together.
 */
pc.components.Joint = pc.components.Component.extend('pc.components.Joint',
    /** @lends pc.components.Joint */
    {
        /**
         * Construct (or acquires) a new component with the options supplied
         * @param {pc.Entity} options.attachTo Entity to attach the joint to
         * @param {pc.Dim} options.offset Dim x, y of the pixel offset the joint is relative to the source entity
         * @param {pc.Dim} options.attachmentOffset Dim x, y of the offset of the joint on the attached entity
         * @param {Number} options.distance How long the joint is
         * @param {pc.JointType} options.type Type of joint (pc.JointType.WELD, pc.JointType.REVOLUTE, pc.JointType.DISTANCE)
         * @param {Number} options.dampingRatio Ratio for damping motion
         * @param {Number} options.lowerAngleLimit Limit angular movement this angle at the lowest
         * @param {Number} options.upperAngleLimit Limit angular movement this angle at the highest
         * @param {Boolean} options.enableLimit True is anglular limiting is enabled
         * @param {Number} options.maxMotorTorque Highest torque that motor can power to
         * @param {Number} options.motorSpeed Speed of the motor that drives joint turn
         * @param {Boolean} options.enableMotor Whether to engage the motor
         * @param {Number} options.angle Angle of the joint
         * @return {pc.components.Joint} A configured joint component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Joint.prototype */
    {
        /** The entity this joint attaches to */
        attachTo:null,
        /** Position offset of the joint on the source entity */
        offset:null,
        /** Position offset of the joint on the atached to entity */
        attachmentOffset:null,
        /** Distance / length of the joint */
        distance:0,
        /** Type of joint -- see pc.JointType */
        type:0,

        /** Frequency of the joint (distance joints only) */
        frequency:0,
        /** Damping ratio (distance joints only) */
        dampingRatio:0,

        /** Angle of the joint (revolute joints only) */
        angle:0,
        /** Lower angle limit (revolute joints only) */
        lowerAngleLimit:0,
        /** Upper angle limit (revolute joints only) */
        upperAngleLimit:0,
        /** Whether angule limiting is in play (revolute joints only) */
        enableLimit:false,
        /** Maxmium torque of the motor (revolute joints only) */
        maxMotorTorque:0,
        /** Whether the motor is enabled (revolute joints only) */
        enableMotor:0,
        /** Speed of the motor (revolute joints only) */
        motorSpeed:0,

        _joint:null,

        /**
         * Constructs a new joint (via new). See create method for options details.
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.offset = pc.Point.create(0, 0);
            this.attachmentOffset = pc.Point.create(0, 0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures a joint. See create method for options details.
         */
        config:function (options)
        {
            this.attachTo = pc.checked(options.attachedTo, null);
            if (options.offset)
                this.offset.setXY(pc.checked(options.offset.x, 0), pc.checked(options.offset.y, 0));
            if (options.attachmentOffset)
                this.attachmentOffset.setXY(pc.checked(options.attachmentOffset.x, 0), pc.checked(options.attachmentOffset.y, 0));

            this.distance = pc.checked(options.distance, 0);
            this.type = pc.checked(options.type, pc.JointType.WELD);

            this.dampingRatio = pc.checked(options.dampingRatio, 0);
            this.lowerAngleLimit = pc.checked(options.lowerAngleLimit, 0);
            this.upperAngleLimit = pc.checked(options.upperAngleLimit, 359);
            this.enableLimit = pc.checked(options.enableLimit, false);
            this.maxMotorTorque = pc.checked(options.maxMotorTorque, 100);
            this.enableMotor = pc.checked(options.enableMotor, false);
            this.motorSpeed = pc.checked(options.motorSpeed, 0);
            this.angle = pc.checked(options.angle, 0);

            this._joint = null;
        },

        /**
         * Gets the current angle of the joint
         * @return {Number} Angle
         */
        getAngle:function ()
        {
            return pc.Math.radToDeg(this._joint.GetJointAngle());
        },

        /**
         * Gets the current speed of the motor
         * @return {Number} Current speed
         */
        getSpeed:function ()
        {
            return this._joint.GetJointSpeed();
        },

        /**
         * Sets the motor speed
         * @param {Number} s Speed
         */
        setMotorSpeed:function (s)
        {
            this.motorSpeed = s;
            this._joint.SetMotorSpeed(s);
        },

        /**
         * Gets the current torque of the motor
         * @return {Number} Torque
         */
        getMotorTorque:function ()
        {
            return this._joint.GetMotorTorque();
        },

        /**
         * Gets whether the angle limits are on
         * @return {Boolean} True is they are on
         */
        isLimitEnabled:function ()
        {
            return this.enableLimit;
        },

        /**
         * Gets whether the motor is presently enabled
         * @return {Boolean} True is the motor is enabled
         */
        isMotorEnabled:function ()
        {
            return this.enableMotor;
        },

        /**
         * Sets the max motor torque level (how fast she'll spin)
         * @param {Number} m Maxium
         */
        setMaxMotorTorque:function (m)
        {
            this.maxMotorTorque = m;
            this._joint.SetMaxMotorTorque(m);
        },

        /**
         * Gets the current max motor torque
         * @return {Number} The max
         */
        getMaxMotorTorque:function ()
        {
            return this.maxMotorTorque;
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Expiry
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Expiry'>pc.systems.Expiry</a>]
 * <p>
 * Automatically expires an entity after a given time. Great for things like bullets that have a known lifetime;
 * just add the expiry component and it will happily kill itself (release) after the given time
 */
pc.components.Expiry = pc.components.Component.extend('pc.components.Expiry',
    /** @lends pc.components.Expiry */
    {
        /**
         * Constructs (or acquires from the pool) an expiry component.
         * @param {Number} options.lifetime Life time before expiry (in ms)
         * @return {pc.components.Expiry} The shiny new component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Expiry.prototype */
    {
        /** lifetime of the expiry */
        lifetime: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);
        },

        /**
         * Reduce the lifetime
         * @param {Number} time Amount to reduce the lifetime by
         */
        decrease: function(time)    { this.lifetime -= time;  },

        /**
         * Gets whether the lifetime has expired (typically only the expiry system will use this)
         * @return {Boolean} True if it has expired
         */
        hasExpired: function()      { return this.lifetime <= 0; }
    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.OriginShifter
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Shifts the origin of the entity relative to the origin of the layer it's on, with an additional origin ratio
 * adjuster. You can use this to make an entity shift around as the layer origin moves (parallax within parallax)
 */
pc.components.OriginShifter = pc.components.Component.extend('pc.components.OriginShifter',
    /** @lends pc.components.OriginShifter */
    {
        /**
         * Constructs (or acquires from the pool) a component, configuring it with the given options.
         * @param {Number} options.ratio The ratio to shift the position by
         * @return {*}
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.OriginShifter.prototype */
    {
        /** current shift ratio */
        ratio:1,

        _offsetX: 0,
        _offsetY: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.ratio = pc.checked(options.ratio, 1);
        }

    });





/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Spatial
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>, <a href='pc.systems.Physics'>pc.systems.Physics</a>,
 * <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Represents where an entity exists in 2D space (x, y, width and height). This component is mostly for use by other
 * systems to update and use.
 */
pc.components.Spatial = pc.components.Component.extend('pc.components.Spatial',
    /** @lends pc.components.Spatial */
    {
        /**
         * Constructs (or acquires from the pool) a spatial component configuring it with the given options
         * @param {pc.Point} options.pos Position (containing x, y) to place the entity
         * @param {pc.Dim} options.dim Size (containing x, y) of the entity (x=width, y=height)
         * @return {pc.components.Spatial} A shiney new component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Spatial.prototype */
    {
        /** Last movement in 2D space */
        lastMove: null,

        /** position of the entity as a pc.Point object (use pos.x and pos.y). Note: if you add a physics
         * component, then it will then manage position (use force etc to move). This pos then becomes read-only */
        pos: null,
        /** dimension of the entity as a pc.Dim object (use dim.x for width and dim.y for height) */
        dim: null,
        dir: 0,

        _centerPos: null, // cache of the current center
        _screenRect: null, // cache of the getScreenRect return

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);

            this.pos = pc.Point.create(0, 0);
            this.dim = pc.Dim.create(0, 0);
            this._screenRect = pc.Rect.create(0, 0, 0, 0);
            this._centerPos = pc.Point.create(0, 0);
            this.lastMove = pc.Dim.create(0, 0);

            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.pos.x = pc.checked(options.x, 0);
            this.pos.y = pc.checked(options.y, 0);
            this.dim.x = pc.checked(options.w, 0);
            this.dim.y = pc.checked(options.h, 0);
            this.dir = pc.checked(options.dir, 0);

            this._centerPos.x = 0;
            this._centerPos.y = 0;
            this._screenRect.x = 0;
            this._screenRect.y = 0;
            this._screenRect.w = 0;
            this._screenRect.h = 0;
            this.lastMove.x = 0;
            this.lastMove.y = 0;
        },

        /**
         * Get the current position
         * @return {pc.Point} the current position
         */
        getPos: function()
        {
            return this.pos;
        },

        /**
         * Get the current dimensions (x, y)
         * @return {pc.Dim} Reference to the current pc.Dim for this spatial
         */
        getDim: function()
        {
            return this.dim;
        },

        /**
         * Get the center pos of the spatial (calculated when you call this)
         * @return {pc.Point} A pc.Point representing the center of the spatial (cached so you do not neet to release it)
         */
        getCenterPos: function()
        {
            this._centerPos.x = this.pos.x + (this.dim.x/2);
            this._centerPos.y = this.pos.y + (this.dim.y/2);
            return this._centerPos;
        },

        /**
         * Gets a pc.Rect of the screen relative location of this spatial (i.e. not world space)
         * @return {pc.Rect} on-screen rectangle (cached, so you should not release it). Null if not on a layer.
         */
        getScreenRect: function()
        {
            if (this._entity && this._entity.layer)
            {
                this._screenRect.x = this._entity.layer.screenX(this.pos.x);
                this._screenRect.y = this._entity.layer.screenY(this.pos.y);
                this._screenRect.w = this.dim.x;
                this._screenRect.h = this.dim.y;
                return this._screenRect;
            }
            return null;
        },

        /**
         * A nice string representation of the spatial
         * @return {String} A string representation
         */
        toString: function()
        {
            return 'x: ' + this.x + ' y: ' + this.y + ' z: ' + this.z + ' dir: '+ this.dir;
        }


    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Overlay
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Used to lay another sprite over an entity, with options to automagically expire after a certain time limit.
 * Good for things like smoke, explosive damage or muzzle flashs, and where you don't need to create a complete
 * entity.
 */
pc.components.Overlay = pc.components.Component.extend('pc.components.Overlay',
    /** @lends pc.components.Overlay */
    {
        /**
         * Constructs (or acquires an object from the pool) with the given options.
         * @param {Number} options.lifetime Lifetime of the overlay (will automatically remove itself)
         * @param {pc.SpriteSheet} options.spriteSheet Sprite sheet to use for the animation
         * @param {String} options.animationStart Which animation to play in the sprite
         * @param {Number} options.animationStartDelay Amount of time in ms to increase or decrease the animation speed
         * @return {pc.components.Overlay} An overlay component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Overlay.prototype */
    {
        /** lifetime the overlay will display for */
        lifetime: 0,
        /** sprite object this overlay displays */
        sprite: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.sprite = pc.Sprite.create();
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.lifetime = pc.checked(options.lifetime, 1000);

            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);
        },

        /**
         * Descreases the amount of time the sprite should stay alive for
         * @param {Number} time Time to reduce by in ms
         */
        decrease: function(time)    { this.lifetime -= time;  },

        /**
         * Tests if the sprite has expired already
         * @return {Boolean} True if it has expired
         */
        hasExpired: function()      { return this.lifetime <= 0; }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Clip
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Clips all rendering for an entity to be within the specified rect (in layer relative coordinates)
 * You can also specify an entity, which will clip based on the spatial rectangle of the other entity
 * You can also do both entity clipping as well as stacking a rectangle clip on top
 */
pc.components.Clip = pc.components.Component.extend('pc.components.Clip',
    /** @lends pc.components.Clip */
    {
        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Clip.prototype */
    {
        /** Clip this entity to the bounding rectangle of another entity */
        clipEntity:null,
        /** x-position of the top left of the clipping rectangle */
        x:0,
        /** y-position of the top left of the clipping rectangle */
        y:0,
        /** Width the clipping rectangle */
        w:0,
        /** Height the clipping rectangle */
        h:0,

        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.clipEntity = pc.checked(options.clipEntity, null);
            this.x = pc.checked(options.x, 0);
            this.y = pc.checked(options.y, 0);
            this.w = pc.checked(options.w, 0);
            this.h = pc.checked(options.h, 0);
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Activator
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Activation'>pc.systems.Activation</a>]
 * <p>
 * Causes an entity to be inactive (no rendering or physics etc) until another entity moves within range of it.
 * Great for autosleeping all your monsters until the player gets close.
 */
pc.components.Activator = pc.components.Component.extend('pc.components.Activator',
    /** @lends pc.components.Activator */
    {
        /**
         * Constructs a new activator component (by acquiring it from the pool).
         * @param {String} options.tag Tag to look for. When an entity with this tag gets close... bing!
         * @param {pc.Layer} options.layer The layer the target enitty is on
         * @param {Number} options.range How close the tagged entity has to be to cause activation
         * @param {Boolean} options.stayActive Stay active once active, otherwise go inactive if range exceeds (default false)
         * @return {pc.components.Activator} The component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Activator.prototype */
    {
        /**
         * entities with this tag to track -- if entity moves within range, the entity with this component will become active
         */
        tag:null,

        /**
         * Layer name to look for the activation entity, default is the same layer as the entity (null)
         */
        layer: null,

        /**
         * Range (in pixels) to cause activation.
         */
        range:0,

        /**
         * Whether the entity should stay active once activated, otherwise if the range exceeds the distance the
         * entity will go back to sleep
         */
        stayActive: false,

        _cacheLayer:null,

        /**
         * Constructs (or acquires) a clipping component
         * @param options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options.
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (!options.tag)
                throw 'Activator requires an entity to track against';

            this.tag = options.tag;
            this.layer = pc.checked(options.layer, null);
            this.range = pc.checked(options.range, 300);
            this.stayActive = pc.checked(options.stayActive, false);
        }



    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Input
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Input'>pc.systems.Input</a>]
 * <p>
 * Convenience component that lets you bind input states and actions to an entity.
 * In options provide an array of states and actions, with the associated input, e.g.
 * <pre><code>
 * states:
 * [
 *      ['moving right', ['D', 'TOUCH', 'RIGHT']],
 *      ['moving left', ['A', 'LEFT']],
 *      ['jumping', ['W', 'UP']],
 *      ['jumping', ['MOUSE_LEFT_BUTTON', 'SPACE'], false],
 * ],
 * actions:
 * [
 *      ['fire', ['SPACE']]
 * ]
 * </code></pre>
 * Note the use of a positional input (the mouse left button click for attack). This takes an optional extra
 * boolean to set whether the positional event should be contained with the on-screen spatial rectangle of the entity.
 * In this case, true means only engage the attack state if the click is on the player; false means you can click
 * anywhere on-screen.
 */
pc.components.Input = pc.components.Component.extend('pc.components.Input',
    /** @lends pc.components.Input */
    {
        /**
         * Constructs (or acquires from the pool) an input component.
         * @param {Array} options.states Array of states, e.g. states:['fire',['SPACE','D']];
         * @param {Array} options.states Array of actions, e.g. actions:['fire',['SPACE','D']];
         * @return {pc.components.Spatial} A shiny new input component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Input.prototype */
    {
        /** array of input states */
        states:null,
        /** array of input actions */
        actions: null,

        _bound: false,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (!options.states && !options.actions)
                throw 'Input requires at least an action or state set';

            this.states = options.states;
            this.actions = options.actions;
        }
    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Fade
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Effects'>pc.systems.Effects</a>]
 * <p>
 * Adds a fade effects to the entity. e.g.
 * <pre><code>
 * entity.addComponent(
 *      pc.components.Fade.create( { holdTime: 1300, fadeOutTime:200 } ) );
 * </code></pre>
 */
pc.components.Fade = pc.components.Component.extend('pc.components.Fade',
    /** @lends pc.components.Fade */
    {
        /**
         * Constructs (or acquires from the pool) a fade component
         * @param {Number} options.startDelay ms to wait before doing anything
         * @param {Number} options.fadeInTime time to fade in (in ms)
         * @param {Number} options.fadeOutTime time to fade out (in ms)
         * @param {Number} options.holdTime time to hold between fading in and fading out (in ms)
         * @param {Number} options.loops number of loops (0=infinite)
         * @return {pc.components.Fade} A configured fade component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Fade.prototype */
    {
        /** ms to wait before doing anything */
        startDelay:0,
        /** time to fade in (in ms) */
        fadeInTime:0,
        /** time to fade out (in ms) */
        fadeOutTime:0,
        /** time to hold between fading in and fading out (in ms) */
        holdTime:0,
        /** when the current state started */
        startTime:0,
        /** how long before we need to change states */
        timeLimit:0,
        /** current state */
        state:0,
        /** number of loops (0=infinite) */
        loops:1,

        /** read-only for how many loops have been completed */
        loopsSoFar:0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this.startDelay = pc.checked(options.startDelay, 0);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.holdTime = pc.checked(options.holdTime, 0);
            this.loops = pc.checked(options.loops, 1);
            this.timeLimit = 0;
            this.state = 0;
            this.loopsSoFar = 0;
        }
    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Rect
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a rectangle to an entity.
 */
pc.components.Rect = pc.components.Component.extend('pc.components.Rect',
    /** @lends pc.components.Rect */
    {
        /**
         * Constructs (or acquires from the pool) a rectangle component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.strokeColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {Number} options.cornerRadius Radius of the corners (defaults to 0)
         * @return {pc.components.Rectangle} A rectangle component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Rect.prototype */
    {
        /** pc.Color representing fill color */
        color:null,
        /** pc.Color representing stroke color */
        strokeColor:null,
        /** Stroke width */
        lineWidth:0,
        /** radius of the corners (0=straight edges) */
        cornerRadius:0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (!options.color)
                this.color.set('#ffffff');
            else
                this.color.set(pc.checked(options.color, '#ffffff'));

            if (!options.strokeColor)
                this.strokeColor.set('#ffffff');
            else
                this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));

            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.cornerRadius = pc.checked(options.cornerRadius, 0);
        }

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Text
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds display text to an entity.
 */
pc.components.Text = pc.components.Component.extend('pc.components.Text',
    /** @lends pc.components.Text */
    {
        /**
         * Constructs (or acquires from the pool) a text component.
         * @param {String} options.color Fill color in the form of #RRGGBB.
         * @param {String} options.strokeColor Line color in the form of #RRGGBB
         * @param {Number} options.lineWidth Stroke width
         * @param {String} options.font Name of the font
         * @param {Number} options.height Size/height of the font (i.e. 20 for 20pt)
         * @param {String} options.text String to display
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the text.
         * @return {pc.components.Text} A text component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Text.prototype */
    {
        /** pc.Color representing fill color */
        color: null,
        /** pc.Color representing stroke color */
        strokeColor: null,
        /** Font name (read-only - use setFont) */
        font: null,
        /** Font size: 20 = 20pt (read-only - use setHeight) */
        fontHeight: 0,
        /** Display text */
        text: null,
        /** Stroke width */
        lineWidth: 0,
        /** Offset position of the text relative to the entity spatial */
        offset: null,

        _fontCache: null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.color = pc.Color.create('#ffffff');
            this.strokeColor = pc.Color.create('#888888');
            this.text = [];
            this.font = 'Calibri';
            this.fontHeight = 20;
            this.offset = pc.Dim.create(0,0);
            this._fontCache = '';
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            this.color.set(pc.checked(options.color, '#ffffff'));
            this.strokeColor.set(pc.checked(options.strokeColor, '#888888'));
            this.lineWidth = pc.checked(options.lineWidth, 0);
            this.text = pc.checked(options.text, ['']);
            this.font = pc.checked(options.font, 'Arial');
            this.fontHeight = pc.checked(options.fontHeight, 20);
            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x);
                this.offset.y = pc.checked(options.offset.y);
            }
            this._updateFont();
        },

        /**
         * Sets the font height
         * @param {Number} height Height in points (20=20pt)
         */
        setHeight: function(height)
        {
            this.fontHeight = height;
            this._updateFont();
        },

        /**
         * Sets the font
         * @param {String} font Name of the font (i.e. 'Arial')
         */
        setFont: function(font)
        {
            this.font = font;
            this._updateFont();
        },

        _updateFont: function()
        {
            this._fontCache = '' + this.fontHeight + 'px ' + this.font;
        }


    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Sprite
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Render'>pc.systems.Render</a>]
 * <p>
 * Adds a sprite to an entity. See the core <a href='pc.Sprite'>sprite</a> class for information on sprites.
 */
pc.components.Sprite = pc.components.Component.extend('pc.components.Sprite',
    /** @lends pc.components.Sprite */
    {
        /**
         * Constructs (or acquires from the pool) a sprite component.
         * @param {pc.Sprite} options.sprite Sprite object to use
         * @param {pc.Point} options.offset Object containing x, y properties. Offset position of the sprite.
         * @return {pc.components.Sprite} A newly configured sprite component
         */
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Sprite.prototype */
    {
        /** sprite object */
        sprite:null,
        /** Offset position of the text relative to the entity spatial */
        offset:null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init: function(options)
        {
            this._super(this.Class.shortName);
            this.sprite = pc.Sprite.create();
            this.offset = pc.Point.create(0,0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config: function(options)
        {
            var spriteSheet = pc.checked(options.spriteSheet, null);
            if (spriteSheet == null)
                throw this.getUniqueId() + ': no spritesheet specified';

            this.sprite.setSpriteSheet(spriteSheet);

            if (pc.valid(options.offset))
            {
                this.offset.x = pc.checked(options.offset.x, 0);
                this.offset.y = pc.checked(options.offset.y, 0);
            } else
            {
                this.offset.x = 0;
                this.offset.y = 0;
            }

            var animationStart = pc.checked(options.animationStart, null);
            var animationStartDelay = pc.checked(options.animationStartDelay, 0);
            if (animationStart != null)
                this.sprite.setAnimation(animationStart, animationStartDelay);

            this.sprite.currentFrame = pc.checked(options.currentFrame, 0);
        }



    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.Layout
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Layout'>pc.systems.Layout</a>]
 * <p>
 * Automatically positions an entity on screen using a variety of layout options.
 * <p>
 * To use automated layout, add the layout system to the layer containing the entity:
 * <pre><code>
 * gameLayer.addSystem(new pc.systems.Layout());
 * </code></pre>
 * You can then add a layout component to an entity. The layout system will then automatically position the entity
 * bassed on the chosen alignment, and accomodating a given margin.
 * <pre><code>
 * entity.addComponent(pc.components.Layout.create(
 *     { vertical:'middle', horizontal:'right', margin:{ right:80 } }));
 * </code></pre>
 * Multiple items will be stacked vertically.
 */
pc.components.Layout = pc.components.Component.extend('pc.components.Layout',
    /** @lends pc.components.Layout */
    {
        /**
         * Constructs (or acquires from the pool) a layout component
         * @param {String} options.vertical Vertical positioning: 'top', 'middle', 'bottom'
         * @param {String} options.horizontal Horizontal positioning: 'left', 'center', 'right'
         * @param {Object} options.margin Margin for the entity (ie. margin.left, right, top, bottom)
         * @return {pc.components.Layout} A newly configured layout component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Layout.prototype */
    {
        /** Vertical positioning: 'top', 'middle', 'bottom' */
        vertical:null,
        /** Horizontal positioning: 'left', 'center', 'right' */
        horizontal:null,
        /** margin offset to the position */
        margin:null,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.margin = {};
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            if (pc.checked(options.margin))
            {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else
            {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }

            this.horizontal = pc.checked(options.horizontal, 'left');
            this.vertical = pc.checked(options.vertical, 'top');
        }


    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.components.ParticleEmitter
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Particles'>pc.systems.Particles</a>]
 * <p>
 * A particle generator.
 */
pc.components.ParticleEmitter = pc.components.Component.extend('pc.components.ParticleEmitter',
    /** @lends pc.components.ParticleEmitter */
    {
        /**
         * Constructs (or acquires from the pool) a particle emitter component
         * @param {Object} options See member list for available options
         * @return {pc.components.ParticleEmitter} A newly configured emitter component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.ParticleEmitter.prototype */
    {
        /** set to false to pause the emitter (and all emissions) */
        active: true,
        /** set to false to stop new emissions, but still update existing ones */
        emitting: true,
        /** minimum amount to grow particles at (negative values shrink) x-axis */
        growXMin:0,
        /** maximum amount to grow particles at x-axis (defaults to growXMin) */
        growXMax:0,
        /** minimum amount to grow particles at (negative values shrink) y-axis */
        growYMin:0,
        /** maximum amount to grow particles at y-axis (defaults to growYMin) */
        growYMax:0,
        /** scaling of the image on x-axis (minimum) */
        scaleXMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleXMax: 0,
        /** scaling of the image on y-axis (minimum) */
        scaleYMin: 0,
        /** scaling maximum. if different to min a random scale is chosen */
        scaleYMax: 0,
        /** time to spend fading in the particle */
        fadeInTime: 0,
        /** time spent fading out the particle */
        fadeOutTime: 0,
        /** minimum angle (direction) to fire a particle in */
        angleMin: 0,
        /** maximum angle (direction) to fire a particle in */
        angleMax: 0,
        /** minimum speed */
        thrustMin: 0,
        /** (optional) maximum speed (default is speed minimum */
        thrustMax: 0,
        /** how long to thrust for */
        thrustTime: 0,
        /** min amount of spin on the particle (in degrees per second) */
        spinMin: 0,
        /** max spin (random spin chosen between min and max) */
        spinMax: 0,
        /** distribution of particles over x range */
        rangeX: 1,
        /** distribution of particles over y */
        rangeY: 1,
        /** number to fire out on each emission */
        burst: 1,
        /** delay time between emissions in ms */
        delay: 25,
        /** spritesheet to use (a particle = a frame) */
        spriteSheet: null,
        /** minimum life span of particles */
        lifeMin: 0,
        /** max life span (random life span = max-min) */
        lifeMax: 0,
        /** whether sprite should rotate with angle changes */
        rotateSprite: false,
        /** x position offset (from the position of the entity) */
        offsetX: null,
        /** y position offset (from the position of the entity) */
        offsetY: null,
        /** composite operation on the image */
        compositeOperation: null,
        /** whether particle angles should be relative to the entity I'm attached to */
        relativeAngle: true,
        /** number of shots the emitter shold fire (self destructs after this). 0=repeat continuously */
        shots: 0,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMin: 1,
        /** minimum range of alpha to randomly change opacity/alpha */
        alphaMax: 1,
        /** delay before changing alpha */
        alphaDelay: 0,

        _particles: null,
        _lastEmitTime: 0,
        _shotCount: 0,

        /**
         * Constructs a new component. See create method for options
         * @param {Object} options Options
         */
        init:function (options)
        {
            this._super('emitter');
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Reset the emitter to start again
         */
        reset: function()
        {
            this._shotCount = 0;
            this._lastEmitTime = 0;
        },

        /**
         * Configures the component. See create method for options
         * @param {Object} options Options
         */
        config:function (options)
        {
            this._lastEmitTime = 0;
            this._shotCount = 0;

            this.active = pc.checked(options.active, true);
            this.emitting = pc.checked(options.emitting, true);
            this.growXMin = pc.checked(options.growXMin, 0);
            this.growXMax = pc.checked(options.growXMax, this.growXMin);
            this.growYMin = pc.checked(options.growYMin, 0);
            this.growYMax = pc.checked(options.growYMax, this.growYMin);
            this.scaleXMin = pc.checked(options.scaleXMin, 1);
            this.scaleYMin = pc.checked(options.scaleYMin, 1);
            this.scaleXMax = pc.checked(options.scaleXMax, 1);
            this.scaleYMax = pc.checked(options.scaleYMax, 1);
            this.compositeOperation = pc.checked(options.compositeOperation, null);
            this.alphaMin = pc.checked(options.alphaMin, 1);
            this.alphaMax = pc.checked(options.alphaMax, this.alphaMin);
            this.alphaDelay = pc.checked(options.alphaDelay, 50);
            this.shots = pc.checked(options.shots, 0);
            this.relativeAngle = pc.checked(options.relativeAngle, true);

            this.rangeX = pc.checked(options.rangeX, 1);
            this.rangeY = pc.checked(options.rangeY, 1);
            this.fadeInTime = pc.checked(options.fadeInTime, 0);
            this.fadeOutTime = pc.checked(options.fadeOutTime, 0);
            this.angleMin = pc.checked(options.angleMin, 0);
            this.angleMax = pc.checked(options.angleMax, 359);
            this.thrustMin = pc.checked(options.thrustMin, 1);
            this.thrustMax = pc.checked(options.thrustMax, this.thrustMin);
            this.thrustTime = pc.checked(options.thrustTime, 100);
            this.burst = pc.checked(options.burst, 1);
            this.delay = pc.checked(options.delay, 25);
            this.lifeMin = pc.checked(options.lifeMin, 100);
            this.lifeMax = pc.checked(options.lifeMin, this.lifeMin);
            this.rotateSprite = pc.checked(options.rotateSprite, false);
            this.spinMin = pc.checked(options.spinMin, 0);
            this.spinMax = pc.checked(options.spinMax, this.spinMin);
            this.offsetX = pc.checked(options.offsetX, 0);
            this.offsetY = pc.checked(options.offsetY, 0);
            this.gravityX = pc.checked(options.gravityX, 0);
            this.gravityY = pc.checked(options.gravityY, 0);
            this.maxVelX = pc.checked(options.maxVelX, 50);
            this.maxVelY = pc.checked(options.maxVelY, 50);

            if (!pc.valid(options.spriteSheet))
                throw "A spritesheet is required for the emitter";
            else
                this.spriteSheet = options.spriteSheet;

            if (!Array.isArray(this._particles))
                this._particles = new pc.LinkedList();
            else
                this._particles.clear();
        },

        onBeforeRemoved: function()
        {
            // being removed from entity, so need to release any particles that
            // are left back into the pool
            var p = this._particles.first;
            while (p)
            {
                p.obj.release();
                p = p.next();
            }
        }

    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.systems = {};

/**
 * @class pc.systems.System
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * The base class for all systems. See the entity systems guide for more information on creating your own systems.
 */

pc.systems.System = pc.Base.extend('pc.System',
    /** @lends pc.systems.System */
    { },
    /** @lends pc.systems.System.prototype */
    {
        /** layer this system is on */
        layer: null,
        /** array of string component types this system handles */
        componentTypes: null,
        /** reference to the systems system manager (read-only) */
        systemManager: null,
        /** optional delay for running this system, default is 0 (which means run every cycle) */
        delay: 0,

        _lastRun: 0,

        /**
         * Constructs a new system
         * @param {Array} componentTypes Array of strings representing the component types this system will handle
         * @param {Number} delay Amount of time delay in ms between runs. i.e. systems that don't need to run every.
         */
        init: function(componentTypes, delay)
        {
            this._super();
            this.delay = pc.checked(delay, 0);
            if (!componentTypes instanceof Array)
                throw "Invalid component types array. Use a blank array ([]) if there are no components handled by the system.";
            this.componentTypes = componentTypes;
        },

        /**
         * Called by the system manager to allow this system to take care of business. This default does nothing.
         */
        processAll: function()
        {
        },

        /**
         * Called by the system when the layer has changed size
         */
        onResize: function()
        {
        },

        /**
         * Called by the system when the origin changes
         */
        onOriginChange: function(x, y)
        {
        },

        /**
         * Called when this system instance is added to a layer
         */
        onAddedToLayer: function(layer)
        {
        },

        /**
         * Called when this system instance is removed from a layer
         */
        onRemovedFromLayer:function (layer)
        {
        }
    });

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



    });/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.EntityManager
 * @description
 * [Extends <a href='pc.Base'>pc.Base</a>]
 * <p>
 * A system that processes entities.
 */
pc.systems.EntitySystem = pc.systems.System.extend('pc.systems.EntitySystem',
    /** @lends pc.systems.EntitySystem */
    {},
    /** @lends pc.systems.EntitySystem.prototype */
    {
        /** list of entities that are to be process by this system */
        entities: null,
        /** holding place for entities that are to be removed at the end of each cycle */
        suicides: null,

        /**
         * Constructor for a system
         * @param {Array} componentTypes An array of component types this system is interested in. Any entity with
         * a component matching this type will be sent to this system for processing.
         * @param {Number} delay Amount of time between cycles for this system (default = 0)
         */
        init: function(componentTypes, delay)
        {
            this._super(componentTypes, delay);
            this.entities = new pc.LinkedList();
            this.suicides = new pc.LinkedList();
        },

        /**
         * Adds an entity to this system, but only if the entity has a component type matching one of the types
         * used by this system (this.componentTypes)
         * @param {pc.Entity} entity Entity to add (if the entity's component type matches the systems
         */
        addIfMatched: function(entity)
        {
            // checks the entity to see if it should be added to this system
            for (var i=0; i < this.componentTypes.length; i++)
                if (entity.hasComponentOfType(this.componentTypes[i]))
                {
                    this.entities.add(entity);
                    this.onEntityAdded(entity);
                    return; // we only need to add an entity once
                }
        },

        /**
         * Adds an entity to the system
         * @param {pc.Entity} entity Entity to add
         */
        add: function(entity)
        {
            if (this.entities.has(entity)) return; // already in the list
            this.entities.add(entity);
            this.onEntityAdded(entity);
        },

        /**
         * Removes an entity from this system -- ignored if the entity isn't there
         * @param {pc.Entity} entity Entity to remove
         */
        remove: function(entity)
        {
            if (this.entities.remove(entity)) // return true if one was removed
                this.onEntityRemoved(entity);
        },

        /**
         * Removes an entity from this system, but checks to see if it still matches first (has a component of
         * the correct type). This is called by the entity manager when a component is removed
         * @param {pc.Entity} entity Entity to remove
         */
        removeIfNotMatched: function(entity)
        {
            // checks the entity to see if it should be added to this system
            for (var i=0; i < this.componentTypes.length; i++)
            {
                if (entity.hasComponentOfType(this.componentTypes[i]))
                    return; // still matches, abort removing
            }

            // we got to here, so nothing matched, ok to remove the entity
            this.remove(entity);
        },

        /**
         * Processes all entities. If you override this method, make sure you call this._super() to give the entity
         * system a chance to process and clean up all entities.
         */
        processAll: function()
        {
            var next = this.entities.first;
            while (next)
            {
                this.process(next.obj);
                next = next.next();
            }

            next = this.suicides.first;
            while (next)
            {
                this.remove(next.obj);
                next = next.next();
            }
            this.suicides.clear();

        },

        /**
         * Override this in your system to handle updating of matching entities
         * @param {pc.Entity} entity Entity to update
         */
        process: function(entity) {},

        /**
         * Adds the entity to the suicide list; it will be removed at the end of the cycle.
         * @param entity
         */
        suicide: function(entity)
        {
            this.suicides.add(entity);
        },

        /**
         * Called when an entity has been added to this system
         * @param {pc.Entity} entity Entity that was added
         */
        onEntityAdded: function(entity) {},

        /**
         * Called when an entity has been removed from this system
         * @param {pc.Entity} entity Entity that was removed
         */
        onEntityRemoved: function(entity) {},

        /**
         * Called when a component is added to an entity
         * @param {pc.Entity} entity Entity the component was added to
         * @param {pc.components.Component} component Component that was added
         */
        onComponentAdded: function(entity, component) {},

        /**
         * Called when a component is removed from an entity
         * @param {pc.Entity} entity Entity the component was removed from
         * @param {pc.components.Component} component Component that was removed
         */
        onComponentRemoved: function(entity, component) {}

    });

/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.CollisionShape = {
    RECT:0, // rectangular collision area
    CIRCLE:1, // circular
    POLY:2     // a polygon
};

pc.BodyType = {
    ENTITY:0,
    TILE:1
};

/**
 * @class pc.systems.Physics
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A 2D physics system for entities. See the <a href='pc.components.Physics'>physics component</a> and
 * <a href='/develop/guide/physics'>physics guide</a>.
 */
pc.systems.Physics = pc.systems.EntitySystem.extend('pc.systems.Physics',
    /** @lends pc.systems.Physics */
    {
        /** scale of the physics systems relative to 1 pixel */
        SCALE:0.1,

        /** static function to convert from a screen coordinate to physics space */
        toP:function (a)
        {
            return a * this.SCALE;
        },

        /** static function to convert from a physics coordinate to a screen space */
        fromP:function (a)
        {
            return a / this.SCALE;
        }
    },
    /** @lends pc.systems.Physics.prototype */
    {
        /** the physics world */
        world:null,
        /** current gravity (pc.Dim) */
        gravity:null,
        /** whether debugging is enabled */
        debug:false,

        debugDraw:null,

        /**
         * Constructs a new physics systems with options.
         * @param {pc.Dim} options.gravity Level of gravity as a 2D vector (gravity.x, gravity.y)
         * @param {pc.TileMap} options.tileCollisionMap.tileMap A tile map which will be used to construct tile collisions
         * @param {Number} options.tileCollisionMap.collisionCategory Collision category for the tile map
         * @param {Number} options.tileCollisionMap.collisionMask Collision mask for the tile map
         * @param {Number} options.tileCollisionMap.collisionGroup Collision group for the tile map
         * @param {Boolean} options.debug Whether debugging is enabled
         */
        init:function (options)
        {
            this._super([ 'physics' ]);

            if (options && options.gravity)
                this.gravity = pc.Point.create(pc.checked(options.gravity.x, 0), pc.checked(options.gravity.y, 0));
            else
                this.gravity = pc.Point.create(0, 0);

            var gravity = new Box2D.Common.Math.b2Vec2(this.gravity.x * this.Class.SCALE, this.gravity.y * this.Class.SCALE);
            this.world = new Box2D.Dynamics.b2World(gravity, true);

            if (options && pc.valid(options.tileCollisionMap))
            {
                pc.assert(pc.valid(options.tileCollisionMap.tileMap), 'A tileMap is required for a tileCollisionMap');
                this.addTileCollisionMap(
                    options.tileCollisionMap.tileMap,
                    pc.checked(options.tileCollisionMap.collisionGroup, 0),
                    pc.checked(options.tileCollisionMap.collisionCategory, 0),
                    pc.checked(options.tileCollisionMap.collisionMask, 0));
            }

            // setup the contact listeners
            var listener = new Box2D.Dynamics.b2ContactListener;
            listener.BeginContact = this._beginContactListener.bind(this);
            listener.EndContact = this._endContactListener.bind(this);
            listener.PostSolve = this._postSolveListener.bind(this);
            this.world.SetContactListener(listener);

            // setup debug drawing
            var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
            this.debugDraw = new b2DebugDraw();
            this.debugDraw.SetSprite(pc.device.ctx);
            this.debugDraw.SetDrawScale(this.Class.SCALE * 100);
            this.debugDraw.SetFillAlpha(0.3);
            this.debugDraw.SetLineThickness(1.0);
            this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);

            if (options && options.debug == true)
            {
                this.debug = options.debug;
                this.setDebug(options.debug);
            }
        },

        _beginContactListener:function (contact)
        {
            this.onCollisionStart(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        _endContactListener:function (contact)
        {
            this.onCollisionEnd(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        _postSolveListener:function (contact, impulse)
        {
            var i = impulse.normalImpulses[0];
            this.onCollision(
                contact.GetFixtureA().GetBody()._pc_bodyType,
                contact.GetFixtureB().GetBody()._pc_bodyType,
                contact.GetFixtureA().GetBody().GetUserData(),
                contact.GetFixtureB().GetBody().GetUserData(),
                i,
                contact.GetFixtureA()._pc_type,
                contact.GetFixtureB()._pc_type,
                contact);
        },

        /**
         * Process an entity's physics. Called automatically by the entity system.
         * @param {pc.Entity} entity Entity being processed
         */
        process:function (entity)
        {
            if (!entity.active) return;

            var sp = entity.getComponent('spatial');
            var ph = entity.getComponent('physics');
            var at = entity.getComponent('joint');

            if (!ph._body)
            {
                // setup physics body
                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = ph.immovable ? Box2D.Dynamics.b2BodyDef.b2_staticBody :
                    bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_dynamicBody;

                bodyDef.position.x = this.Class.toP(sp.pos.x + (sp.dim.x / 2));
                bodyDef.position.y = this.Class.toP(sp.pos.y + (sp.dim.y / 2));
                bodyDef.linearDamping = ph.linearDamping;
                bodyDef.angularDamping = ph.angularDamping;
                bodyDef.isBullet = ph.bullet;
                bodyDef.fixedRotation = ph.fixedRotation;

                ph._body = this.world.CreateBody(bodyDef);
                ph._body.SetAngle(pc.Math.degToRad(sp.dir));
                ph._body.SetUserData(entity);
                ph._body._pc_bodyType = pc.BodyType.ENTITY;

                // custom gravity for the body (optional)
                if (ph.gravity)
                    ph.setGravity(ph.gravity.x, ph.gravity.y);

                //
                // Fixtures
                //
                pc.assert(ph.shapes.length, "You must specify at least one shapes for a physics entity");

                // configure the shapes as fixtures
                for (var i = 0; i < ph.shapes.length; i++)
                {
                    var shape = ph.shapes[i];

                    // take the spatial, then offset
                    var w = (sp.dim.x + shape.offset.w) * this.Class.SCALE;
                    var h = (sp.dim.y + shape.offset.h) * this.Class.SCALE;
                    var hw = w / 2;
                    var hh = h / 2;
                    var hx = (shape.offset.x * this.Class.SCALE) / 2;
                    var hy = (shape.offset.y * this.Class.SCALE) / 2;

                    pc.assert(hw > 0 && hh > 0, "Physics requires a spatial size minimum of 1");

                    var fixDef = new Box2D.Dynamics.b2FixtureDef();
                    fixDef.density = ph.density;
                    fixDef.friction = ph.friction;
                    fixDef.restitution = ph.bounce;

                    switch (shape.shape)
                    {
                        case pc.CollisionShape.CIRCLE:
                            fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(w / 2);
                            fixDef.shape.SetLocalPosition(
                                Box2D.Common.Math.b2Vec2.Get(shape.offset.x * this.Class.SCALE,
                                    shape.offset.y * this.Class.SCALE));
                            break;

                        case pc.CollisionShape.POLY:
                            var points = [];
                            for (var q = 0; q < shape.points.length; q++)
                                points.push(new Box2D.Common.Math.b2Vec2(
                                    (shape.offset.x + shape.points[q][0]) * this.Class.SCALE,
                                    (shape.offset.y + shape.points[q][1]) * this.Class.SCALE));
                            fixDef.shape.SetAsArray(points, points.length);
                            break;

                        default: // pc.CollisionShape.RECT:
                            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

                            // need to set based on polygon rectangle --
                            points = [];

                            // the body is positioned relative to the center in physics,
                            // so we have to figure out the correct position of the center
                            points.push(Box2D.Common.Math.b2Vec2.Get(-(hw) + hx, -(hh) + hy));   // top left
                            points.push(Box2D.Common.Math.b2Vec2.Get(hw, -(hh) + hy));    // top right
                            points.push(Box2D.Common.Math.b2Vec2.Get(hw, hh));    // bottom right
                            points.push(Box2D.Common.Math.b2Vec2.Get(-(hw) + hx, hh));   // bottom left

                            fixDef.shape.SetAsArray(points, points.length);
                            break;
                    }

                    // set the collision filters
                    fixDef.filter.groupIndex = shape.collisionGroup;
                    fixDef.filter.categoryBits = shape.collisionCategory;
                    fixDef.filter.maskBits = shape.collisionMask;
                    fixDef.isSensor = shape.sensorOnly;

                    var f = ph._body.CreateFixture(fixDef);
                    f._pc_type = shape.type;
                    ph._fixtures.push(f);
                }


                if (ph.centerOfMass.x != 0 || ph.centerOfMass.y != 0 || ph.mass != -1)
                {
                    var md = new Box2D.Collision.Shapes.b2MassData();
                    md.center = Box2D.Common.Math.b2Vec2.Get(ph.centerOfMass.x * pc.systems.Physics.SCALE, ph.centerOfMass.y * pc.systems.Physics.SCALE);
                    if (ph.mass != -1) md.mass = ph.mass;
                    md.I = 1;
                    ph._body.SetMassData(md);
                } else
                {
                    md = new Box2D.Collision.Shapes.b2MassData();
                    md.mass = 1;
                    md.I = 1;

                    ph._body.SetMassData(md);
                }

                if (ph.force) ph.applyForce(ph.force);
                if (ph.impulse) ph.applyImpulse(ph.impulse);
                if (ph.torque) ph.applyTorque(ph.torque);
                if (ph.turn) ph.applyTurn(ph.turn);
            }

            // handle attachments/joints
            if (at)
            {
                if (!at._joint) // still not hooked up
                {
                    // test if we're ready to create a join (is other entity bound to physics and
                    // therefore has a body already)
                    var connectToPhysics = at.attachTo.getComponent('physics');
                    if (connectToPhysics._body)
                    {
                        var jointDef = null;

                        switch (at.type)
                        {
                            case pc.JointType.WELD:
                                jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                // set this bodies position to the right place
                                var atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.JointType.DISTANCE:
                                jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.frequency = at.frequency;
                                jointDef.dampingRatio = at.dampingRatio;
                                jointDef.collideConnected = false;
                                jointDef.length = at.distance;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                // set this bodies position to the right place
                                atPos = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos.x + (at.offset.x * this.Class.SCALE),
                                        y:atPos.y + (at.offset.y * this.Class.SCALE)
                                    });
                                break;

                            case pc.JointType.REVOLUTE:
                                jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
                                jointDef.bodyA = connectToPhysics._body;
                                jointDef.bodyB = ph._body;
                                jointDef.collideConnected = false;
                                jointDef.referenceAngle = at.angle;
                                jointDef.localAnchorA.Set(at.offset.x * this.Class.SCALE, at.offset.y * this.Class.SCALE);
                                jointDef.localAnchorB.Set(at.attachmentOffset.x * this.Class.SCALE, at.attachmentOffset.y * this.Class.SCALE);
                                connectToPhysics._body.SetAwake(true);

                                if (at.enableLimit)
                                {
                                    jointDef.enableLimit = at.enableLimit;
                                    jointDef.lowerAngle = pc.Math.degToRad(at.lowerAngleLimit);
                                    jointDef.upperAngle = pc.Math.degToRad(at.upperAngleLimit);
                                }

                                if (at.enableMotor)
                                {
                                    jointDef.enableMotor = at.enableMotor;
                                    jointDef.motorSpeed = pc.Math.degToRad(at.motorSpeed);
                                    jointDef.maxMotorTorque = at.maxMotorTorque;
                                }

                                // set this bodies position to the right place
                                var atPos2 = connectToPhysics._body.GetPosition();
                                ph._body.SetPosition(
                                    {
                                        x:atPos2.x + this.Class.toP(at.offset.x),
                                        y:atPos2.y + this.Class.toP(at.offset.y)
                                    });
                                break;
                        }

                        if (!jointDef)
                            throw "Invalid attachment config";
                        at._joint = this.world.CreateJoint(jointDef);
                    }
                }
            }

            var p = ph._body.GetPosition();

            sp.pos.x = this.Class.fromP(p.x) - (sp.dim.x / 2);
            sp.pos.y = this.Class.fromP(p.y) - (sp.dim.y / 2);
            sp.dir = pc.Math.radToDeg(ph._body.GetAngle());

            // if there is a max velocity set enforce it
            if (ph.maxSpeed.x > 0 || ph.maxSpeed.y > 0)
            {
                var velocity = ph._body.GetLinearVelocity();
                if (velocity.x != 0 || velocity.y != 0)
                {
                    var maxX = this.Class.toP(ph.maxSpeed.x);
                    if (velocity.x > 0 && velocity.x > maxX)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(maxX, velocity.y));
                    if (velocity.x < 0 && velocity.x < -maxX)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(-maxX, velocity.y));

                    var maxY = this.Class.toP(ph.maxSpeed.y);
                    if (velocity.y > 0 && velocity.y > maxY)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(velocity.x, maxY));
                    if (velocity.y < 0 && velocity.y < -maxY)
                        ph._body.SetLinearVelocity(Box2D.Common.Math.b2Vec2.Get(velocity.x, -maxY));
                }
            }
        },

        /**
         * Called when the origin of the layer changes
         * @param {Number} x x-position of the origin
         * @param {Number} y y-position of the origin
         */
        onOriginChange:function (x, y)
        {
            // update the debug draw origin so it keeps up with us
            this.debugDraw.SetOrigin(x, y);
        },

        /**
         * Process the system
         */
        processAll:function ()
        {
            // this.world.Step(pc.device.elapsed / 200, 20, 20);
            this.world.Step(0.08, 10, 10); // fixed step to avoid frame rate physics issues when encountering lag
            this.world.DrawDebugData();
            this.world.ClearForces();

            this._super();
        },

        onAddedToLayer:function (layer)
        {
            var worldBoundingBox = new Box2D.Collision.b2AABB();
            worldBoundingBox.lowerBound.Set(0, 0);
            worldBoundingBox.upperBound.Set(this.Class.toP(layer.worldSize.x), this.Class.toP(layer.worldSize.y));
        },

        /**
         * Sets debugging
         * @param {Boolean} on True to enable debugging
         */
        setDebug:function (on)
        {
            if (on)
            {
                this.world.SetDebugDraw(this.debugDraw);
            } else
                this.world.SetDebugDraw(null);

            this.debug = on;
        },

        /**
         * Get all the entities in a given area
         * @param {pc.Rect} rect Area to query
         * @return {Array} Array of entities in the area
         */
        getEntitiesInArea:function (rect)
        {
            var aabb = new Box2D.Collision.b2AABB(), entities = [];
            aabb.lowerBound.Set(rect.x, rect.y);
            aabb.upperBound.Set(rect.w, rect.h);

            // Query the world
            this.world.QueryAABB(function (fixture)
            {
                //if (fixture.GetBody().GetType() != Box2D.Dynamics.b2Body.b2_staticBody)
                entities.push(fixture.GetBody().GetUserData());
                return true;
            }, aabb);

            return entities;
        },

        /**
         * Quick way to create a static shape and add it directly to the physics world (without requiring an entity).
         * Great for collision shapes like world boundaries
         * @param {Number} x x-position of the collidable shape
         * @param {Number} y y-position of the collidable shape
         * @param {Number} w width of the collidable shape
         * @param {Number} h height of the collidable
         * @param {Number} collisionGroup Collision group index
         * @param {Number} collisionCategory Collision category
         * @param {Number} collisionMask Collision mask
         */
        createStaticBody:function (x, y, w, h, collisionGroup, collisionCategory, collisionMask)
        {
            var hw = this.Class.toP(w / 2);
            var hh = this.Class.toP(h / 2);

            // setup physics body
            var fixDef = new Box2D.Dynamics.b2FixtureDef();
            var bodyDef = new Box2D.Dynamics.b2BodyDef();

            bodyDef.type = Box2D.Dynamics.b2BodyDef.b2_staticBody;
            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;

            var points = [];
            points.push(Box2D.Common.Math.b2Vec2.Get(-hw, -hh));   // top left
            points.push(Box2D.Common.Math.b2Vec2.Get(hw, -hh));    // top right
            points.push(Box2D.Common.Math.b2Vec2.Get(hw, hh));    // bottom right
            points.push(Box2D.Common.Math.b2Vec2.Get(-hw, hh));   // bottom left
            fixDef.shape.SetAsArray(points, points.length);

            // set the collision filters
            fixDef.filter.groupIndex = collisionGroup;
            fixDef.filter.categoryBits = collisionCategory;
            fixDef.filter.maskBits = collisionMask;

            bodyDef.position.x = this.Class.toP(x) + hw;
            bodyDef.position.y = this.Class.toP(y) + hh;

            var body = this.world.CreateBody(bodyDef);
            body._pc_bodyType = pc.BodyType.TILE;
            body.CreateFixture(fixDef);
        },

        /**
         * Add a collision tile map (by creating collidable shapes in the physics world matching the tile map)
         * @param {pc.TileMap} tileMap Tile map for all the tiles
         * @param {Number} collisionGroup Collision group index
         * @param {Number} collisionCategory Collision category
         * @param {Number} collisionMask Collision mask
         */
        addTileCollisionMap:function (tileMap, collisionGroup, collisionCategory, collisionMask)
        {
            // Generate a set of rectangles (polys) for the tiles. To make things more efficient
            // we pack tiles horizontally across to reduce the total number of physics fixtures being
            // added.

            for (var ty = 0; ty < tileMap.tilesHigh; ty++)
            {
                // new row, start again
                var x = 0;
                var w = 0;

                for (var tx = 0; tx < tileMap.tilesWide; tx++)
                {
                    if (tileMap.tiles[ty][tx] >= 0)
                    {
                        w += tileMap.tileWidth;

                    } else
                    {
                        // we found a gap, so create the physics body for his horizontal tile set
                        if (w > 0)
                        {
                            this.createStaticBody(x, ty * tileMap.tileHeight, w,
                                tileMap.tileHeight, collisionGroup, collisionCategory, collisionMask);
                            w = 0;
                        }

                        // set the starting x position for the next rectangle
                        x = ((tx + 1) * tileMap.tileWidth);
                    }
                }
            }
        },

        /** Not implemented fully yet
         getEntityAtPoint:function (p)
         {
         var aabb = new Box2D.Collision.b2AABB();
         var entity = null;

         var wx = p.x / this.Class.SCALE;
         var wy = p.y / this.Class.SCALE;

         aabb.lowerBound.Set(wx, wy);
         aabb.upperBound.Set(wx, wy);

         // Query the world
         this.world.QueryAABB(
         function (fixture)
         {
         if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), b2P))
         {
         body = fixture.GetBody();
         return false;
         }
         return true;
         }, aabb);

         return body;
         },
         */


        /**
         * Called when an entity first collides with a tile or another entity. Use the fixture types to differentiate
         * collisions with different fixtures.
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        },

        /**
         * Continuously called when in a collision state -- note that sensors will not be reported as constantly
         * colliding, they will only be reported as collision start and end events.
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} force The impact force of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {
        },

        /**
         * Called when an entity has finished colliding with a tile or another entity
         * @param {pc.BodyType} aType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.BodyType} bType Type of the collision body (pc.BodyType.TILE or pc.BodyType.ENTITY)
         * @param {pc.Entity} entityA If an entity, a reference to the entity that was the first part of the collision
         * @param {pc.Entity} entityB If an entity, a reference to the entity that was the second part of the collision
         * @param {Number} fixtureAType User type provided when fixture was created of the first fixture
         * @param {Number} fixtureBType User type provided when fixture was created of the second fixture
         * @param {b2Contact} contact Additional contact information
         */
        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
        },

        onEntityAdded:function (entity)
        {
        },

        onEntityRemoved:function (entity)
        {
            var ph = entity.getComponent('physics');
            if (ph._body)
            {
                this.world.DestroyBody(ph._body);
                var at = entity.getComponent('attachment');
                if (at)
                {
                    this.world.DestroyJoint(at._joint);
                }
            }
        }

    });


/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Effects
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A effects system that drives effects like fade.
 */
pc.systems.Effects = pc.systems.EntitySystem.extend('pc.systems.Effects',
    /** @lends pc.systems.Effects */
    {
        FadeState:
        {
            NOT_STARTED: 0,
            DELAYING:1,
            FADING_IN:2,
            HOLDING:3,
            FADING_OUT:4,
            DONE: 5
        }
    },
    /** @lends pc.systems.Effects.prototype */
    {
        /**
         * Constructs a new systems with options.
         */
        init: function()
        {
            this._super( [ 'fade' ] );
        },

        /**
         * Processes all the entities with effect components
         */
        processAll: function()
        {
            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var fade = entity.getComponent('fade');
                    if (fade)
                    {
                        var alpha = entity.getComponent('alpha');
                        if (!alpha)
                            alpha = entity.addComponent(pc.components.Alpha.create({}));

                        if (fade.state != this.Class.FadeState.DONE)
                        {
                            if (!this._fade(alpha, fade))
                                entity.removeComponent(fade);
                        }
                    }
                }

//                var floatAway = entity.getComponent('float');
//                if (float)
//                {
//                      this component could just modify physics over time?
//                }

                next = next.next();
            }
        },

        _fade: function(alpha, fader)
        {
            var timeSinceStart = pc.device.now - fader.startTime;

            // do something about the current state, and change states if it's time.
            switch (fader.state)
            {
                case this.Class.FadeState.NOT_STARTED:
                    fader.startTime = pc.device.now;

                    if (fader.startDelay > 0)
                    {
                        fader.state = this.Class.FadeState.DELAYING;
                        fader.timeLimit = fader.startDelay;
                        alpha.setAlpha(0);

                    } else if (fader.fadeInTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_IN;
                        fader.timeLimit = fader.fadeInTime;
                        // if we have a fade in element, then start alpha at 0
                        alpha.setAlpha(0);
                    }
                    else if (fader.holdTime > 0)
                    {
                        fader.state = this.Class.FadeState.HOLDING;
                        fader.timeLimit = fader.holdTime;
                    }
                    else if (fader.fadeOutTime > 0)
                    {
                        fader.state = this.Class.FadeState.FADING_OUT;
                        fader.timeLimit = fader.fadeOutTime;
                    }
                    break;

                case this.Class.FadeState.DELAYING:
                    // do nothing whilst holding
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeInTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_IN;
                    }
                    break;
                case this.Class.FadeState.FADING_IN:
                    alpha.addAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.holdTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.HOLDING;
                    }
                    break;
                case this.Class.FadeState.HOLDING:
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.timeLimit = fader.fadeOutTime;
                        fader.startTime = pc.device.now;
                        fader.state = this.Class.FadeState.FADING_OUT;
                    }
                    // do nothing whilst holding
                    break;
                case this.Class.FadeState.FADING_OUT:
                    if (timeSinceStart > fader.timeLimit)
                    {
                        fader.loopsSoFar++;

                        if (fader.loops > 1 || fader.loops == 0) // restart?
                        {
                            fader.startTime = pc.device.now;
                            fader.timeLimit = fader.fadeInTime;
                            fader.state = this.Class.FadeState.FADING_IN;
                            if (fader.timeLimit > 0) alpha.setAlpha(0);
                        }

                        if (fader.loopsSoFar >= fader.loops)
                        {
                           // all done, kill thyself
                           fader.state = this.Class.FadeState.DONE;
                           if (fader.timeLimit > 0) alpha.setAlpha(0);
                           return false;
                        }
                    } else
                    {
                        alpha.subAlpha((pc.device.elapsed * (100 / fader.timeLimit)) / 100);
                    }

                    break;
            }
            return true;
        }


    });
















/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Particles
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * A particle system. See the particle component for more information.
 */
pc.systems.Particles = pc.systems.EntitySystem.extend('pc.systems.Particles',
    /** @lends pc.systems.Particles */
    { },
    /** @lends pc.systems.Particles.prototype */
    {
        /**
         * Constructs a new particle system
         */
        init:function ()
        {
            this._super([ 'emitter' ]);
        },

        _drawStartTime: 0,

        process:function (entity)
        {
            if (!entity.active) return;

            var em = entity.getComponent('emitter');
            var sp = entity.getComponent('spatial');
            if (!sp)
                sp = entity.addComponent(new pc.components.Spatial({}));

            if (em)
            {
                if (!em.active) return;

                // New emissions
                if (em.emitting && Date.now() - em._lastEmitTime > em.delay && (em.shots == 0 || em._shotCount < em.shots))
                {
                    for (var b = 0; b < em.burst; b++)
                    {
                        // if this sprite sheet has no animations, then we just use the spritesheet frames
                        var frame = 0;
                        if (em.spriteSheet.animations.size() == 0)
                            // pick a random frame to use
                            frame = pc.Math.rand(0, (em.spriteSheet.framesHigh * em.spriteSheet.framesWide)-1);

                        em._particles.add(
                            pc._Particle.create(
                                sp.pos.x + em.offsetX + pc.Math.rand(-(em.rangeX/2), em.rangeX/2),
                                sp.pos.y + em.offsetY + pc.Math.rand(-(em.rangeY/2), em.rangeY/2),
                                pc.Math.rotate(em.relativeAngle ? sp.dir : 0, pc.Math.rand(em.angleMin, em.angleMax)),
                                pc.Math.randFloat(em.thrustMin, em.thrustMax),
                                pc.Math.randFloat(em.lifeMin, em.lifeMax),
                                pc.Math.randFloat(em.spinMin, em.spinMax),
                                pc.Math.randFloat(em.growXMin, em.growXMax),
                                pc.Math.randFloat(em.growYMin, em.growYMax),
                                pc.Math.randFloat(em.scaleXMin, em.scaleXMax),
                                pc.Math.randFloat(em.scaleYMin, em.scaleYMax),
                                em.fadeInTime, em.fadeOutTime,
                                em.alphaMin, em.alphaMax,
                                em.spriteSheet,
                                em.compositeOperation,
                                frame));
                    }

                    em._lastEmitTime = Date.now();
                    em._shotCount++;
                }

                // update all the particles
                var next = em._particles.first;
                while (next)
                {
                    var p = next.obj;

                    // move the particles in the right direction
                    if (pc.device.now - p.start > em.thrustTime)
                        p.thrust = 0;

                    var accelX = p.thrust * Math.cos( pc.Math.degToRad(p.dir) );
                    var accelY = p.thrust * Math.sin( pc.Math.degToRad(p.dir) );

                    // add the acceleration to velocity
                    p.velX += (accelX * (pc.device.elapsed/1000)) + em.gravityX;
                    p.velY += (accelY * (pc.device.elapsed/1000)) + em.gravityY;
                    p.velX = pc.Math.limit(p.velX, -em.maxVelX, em.maxVelX);
                    p.velY = pc.Math.limit(p.velY, -em.maxVelY, em.maxVelY);
                    p.x += p.velX;
                    p.y += p.velY;

                    // render aspects (spin, grow, fade etc)
                    if (p.spin)
                        p.rotation = pc.Math.rotate(p.rotation, p.spin * (pc.device.elapsed/1000));
                    if (p.growXRate != 0 || p.growYRate != 0)
                    {
                        p.scaleX += p.growXRate * (pc.device.elapsed/1000);
                        p.scaleY += p.growYRate * (pc.device.elapsed/1000);
                    }

                    if (p.fadeState == 0) // fading in
                    {
                        p.sprite.addAlpha((pc.device.elapsed * (100 / p.fadeInTime)) / 100);
                        if (pc.device.now - p.fadeStateStart > p.fadeInTime)
                        {
                            p.fadeState++;
                            p.fadeStateStart = pc.device.now;
                        }
                    }

                    if (p.fadeState == 1)
                    {
                        if (pc.device.now - p.fadeStateStart > p.holdTime)
                        {
                            p.fadeState++;
                            p.fadeStateStart = pc.device.now;
                        }
                    }

                    if (p.fadeState == 2) // fading out
                    {
                        if (p.fadeOutTime > 0)// && p.sprite.alpha > 0)
                        {
                            var fa = (pc.device.elapsed * (100 / p.fadeOutTime)) / 100;
                            p.sprite.subAlpha(fa);
                            // doesn't need to time ending because lifetime will take over
                            // down below and kill this particle
                        }
                    }

                    // pick a random alpha
                    if (p.alphaMin != 1 || p.alphaMax != 1)
                    {
                        if (pc.device.now - p.lastAlpha > em.alphaDelay)
                        {
                            p.sprite.setAlpha(pc.Math.rand(p.alphaMin, p.alphaMax));
                            p.lastAlpha = pc.device.now;
                        }
                    }

                    // draw it
                    this.drawStartTime = Date.now();
                    if (p.scaleX != 1 || p.scaleY != 1)
                        em.spriteSheet.setScale(p.scaleX, p.scaleY);

                    if (!p.sprite.currentAnim)
                    {
                        p.sprite.drawFrame(pc.device.ctx, p.frame % em.spriteSheet.framesWide,
                            Math.floor(p.frame / em.spriteSheet.framesWide),
                            p.x - entity.layer.origin.x - entity.layer.scene.viewPort.x,
                            p.y - entity.layer.origin.y - entity.layer.scene.viewPort.y,
                            em.rotateSprite ? p.rotation : p.dir);
                        pc.device.lastDrawMS += (Date.now() - this.drawStartTime);
                    }
                    else
                    {
                        p.sprite.draw(pc.device.ctx,
                            p.x - entity.layer.origin.x - entity.layer.scene.viewPort.x,
                            p.y - entity.layer.origin.y - entity.layer.scene.viewPort.y,
                            p.dir);
                        pc.device.lastDrawMS += (Date.now() - this.drawStartTime);
                        p.sprite.update(pc.device.elapsed);
                    }

                    if (p.scaleX != 1 || p.scaleY != 1)
                        em.spriteSheet.setScale(1, 1);

                    // assign next before we (maybe) remove this one
                    next = next.next();

                    // time to die?
                    if (pc.device.now - p.start > p.lifetime)
                    {
                        p.release();
                        em._particles.remove(p);
                    }
                }

                // if all the particles are done, and the shot count is finished, time to kill the emitter
                if (em.shots != 0)
                {
                    if (em._particles.first == null && em._shotCount >= em.shots)
                       em.active = false;
                }

            }
        }


    });


pc._Particle = pc.Pooled.extend('pc._Particle',
    {
        create:function (x, y, dir, thrust, lifetime, spin, growXRate, growYRate, scaleX, scaleY,
                         fadeInTime, fadeOutTime, alphaMin, alphaMax, spriteSheet, compositeOperation, frame)
        {
            var n = this._super();
            n.x = x;
            n.y = y;
            n.dir = dir;
            n.thrust = thrust;
            n.frame = frame;
            n.lifetime = lifetime;
            n.spin = spin;
            n.growXRate = growXRate;
            n.growYRate = growYRate;
            n.scaleX = scaleX;
            n.scaleY = scaleY;
            if (n.sprite == null)
                n.sprite = pc.Sprite.create(spriteSheet);
            else
                n.sprite.setSpriteSheet(spriteSheet);
            n.start = pc.device.now;
            n.fadeStart = 0;
            n.velX = 0;
            n.velY = 0;
            n.rotation = 0;
            n.alphaMin = alphaMin;
            n.alphaMax = alphaMax;
            n.lastAlpha = pc.device.now;
            n.fadeInTime = fadeInTime;
            n.fadeOutTime = fadeOutTime;
            n.holdTime = n.lifetime - (n.fadeInTime + n.fadeOutTime);
            if (compositeOperation)
                n.sprite.setCompositeOperation(compositeOperation);
            else
                n.sprite.setCompositeOperation('source-over');

            n.fadeState = 1;    // 0=fading in, 1 = displaying, 2 = fading out
            n.fadeStateStart = pc.device.now;
            if (n.fadeInTime > 0)
            {
                n.fadeState = 0;
                n.sprite.setAlpha(0);
            } else
                n.sprite.setAlpha(1);

            return n;
        }
    },
    {
        x: 0,
        y: 0,
        dir: 0,
        rotation: 0,
        thrust: 0,
        sprite: null,
        start: 0,
        frame: 0,
        fadeStart: 0,
        velX: 0,
        velY: 0,
        spin: 0,
        growXRate: 0,
        growYRate: 0,
        scaleX: 1,
        scaleY: 1,
        fadeInTime: 0,
        fadeOutTime: 0,
        fadeStateStart: 0,
        holdTime: 0,
        fadeState: 1,
        alphaMin: 1,
        alphaMax: 1,
        lastAlpha: 0 // time of last alpha change

    });














/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Input
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Input system. See the <a href='pc.components.Input'>input component</a> for more information.
 */
pc.systems.Input = pc.systems.EntitySystem.extend('pc.systems.Input',
    /** @lends pc.systems.Input */
    {},
    /** @lends pc.systems.Input.prototype */
    {
        /**
         * Constructs a new input system.
         */
        init:function ()
        {
            this._super(['input']);
        },

        process:function (entity)
        {
            var input = entity.getComponent('input');

            if (!input._bound)
            {
                // bind all the inputs we want
                if (input.states)
                {
                    var spatial = entity.getComponent('spatial');
                    for (var i=0; i < input.states.length; i++)
                    {
                        var keys = input.states[i][1];
                        for (var k = 0; k < keys.length; k++)
                            pc.device.input.bindState(entity, input.states[i][0], keys[k], input.states[i][2] ? spatial : null);
                    }
                }

                if (input.actions)
                {
                    spatial = entity.getComponent('spatial');
                    for (i = 0; i < input.actions.length; i++)
                    {
                        keys = input.actions[i][1];
                        for (k = 0; k < keys.length; k++)
                            pc.device.input.bindAction(entity, input.actions[i][0], keys[k], input.actions[i][2] ? spatial:null);
                    }
                }

                input._bound = true;
            }
        },

        /**
         * Override to react to the actions
         * @param {pc.Entity} entity Entity that had the action occur on it
         * @param {String} action Name of the action
         */
        onAction: function(entity, action)
        {
        },

        /**
         * Gets whether an input state is active
         * @param {pc.Entity} entity Entity testing the active state for
         * @param {String} state The state to test
         * @return {Boolean} true if the state is presently on
         */
        isInputState: function(entity, state)
        {
            if (entity.getComponent('input')._bound)
                return pc.device.input.isInputState(entity, state);
            return false;
        }


    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Expiration
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Expiry system. See the <a href='pc.components.Expiry'>expiry component</a> for more information.
 */
pc.systems.Expiration = pc.systems.EntitySystem.extend('pc.systems.Expiration',
    /** @lends pc.systems.Expiration */
    {},
    /** @lends pc.systems.Expiration.prototype */
    {
        init: function()
        {
            this._super(['expiry']);
        },

        process: function(entity)
        {
            var c = entity.getComponent('expiry');
            c.decrease(pc.device.elapsed);
            if (c.hasExpired())
                entity.remove();
        }

    });
/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Activation
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Handles activating entities when they get within a certain range of another entity.
 * See the <a href='pc.components.Activator'>activator component</a> for more information.
 */
pc.systems.Activation = pc.systems.EntitySystem.extend('pc.systems.Activation',
    /** @lends pc.systems.Activation */
    {},
    /** @lends pc.systems.Activation.prototype */
    {
        /**
         * Constructor for the activation system
         * @param {Number} delay Time between system runs in milliseconds. Default is 2000 (2 seconds).
         */
        init:function(delay)
        {
            this._super(['activator'], delay);
        },

        onEntityAdded:function (entity)
        {
            entity.active = false;
        },

        process:function (entity)
        {
            var a = entity.getComponent('activator');

            if (entity.active && a.stayActive) return;
            if (!a._cacheLayer)
            {
                if (a.layer)
                    a._cacheLayer = entity.layer.scene.get(a.layer);
                else
                    a._cacheLayer = entity.layer;
            }

            var entities = a._cacheLayer.getEntityManager().getTagged(a.tag);

            if (!entities) return;

            var e = entities.first;
            while(e)
            {
                var thisSP = entity.getComponent('spatial');
                var otherSP = e.object().getComponent('spatial');

                var distance = thisSP.getCenterPos().distance(otherSP.getCenterPos());
                if (!entity.active)
                {
                    // is the other entity close enough
                    if (distance < a.range)
                        entity.active = true;
                } else
                {
                    if (distance >= a.range)
                        entity.active = false;
                }

                e = e.next();
            }
        }

    });




/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Render
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Handles rendering of components: sprite, overlay, rect, text
 */
pc.systems.Render = pc.systems.EntitySystem.extend('pc.systems.Render',
    /** @lends pc.systems.Render */
    {},
    /** @lends pc.systems.Render.prototype */
    {
        /**
         * Constructs a new render system.
         */
        init: function()
        {
            this._super( [ 'sprite', 'overlay', 'rect', 'text' ] );
        },

        processAll: function()
        {
            var startTime = Date.now();

            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                if (entity.active)
                {
                    var spatial = entity.getComponent('spatial');
                    var alpha = entity.getComponent('alpha');
                    var clip = entity.getComponent('clip');

                    // accommodate scene viewport and layering offset positions
                    var drawX = entity.layer.screenX(spatial.pos.x);
                    var drawY = entity.layer.screenY(spatial.pos.y);

                    // is it onscreen?
                    if (entity.layer.scene.viewPort.overlaps(drawX, drawY, spatial.dim.x, spatial.dim.y,0, spatial.dir))
                    {
                        var ctx = pc.device.ctx;

                        if (clip)
                        {
                            ctx.save();
                            ctx.beginPath();
                            if (clip.clipEntity)
                            {
                                // entity plus clipping rectangle
                                var sp = clip.clipEntity.getComponent('spatial');
                                ctx.rect(
                                    entity.layer.screenX(sp.pos.x) + clip.x, entity.layer.screenY(sp.pos.y) + clip.y,
                                    sp.dim.x+clip.w, sp.dim.y+clip.h);
                            } else
                            {
                                // just plain rectangle clipping
                                ctx.rect(
                                    entity.layer.screenX(spatial.pos.x) + clip.x,
                                    entity.layer.screenY(spatial.pos.y) + clip.y, clip.w, clip.h);
                            }
                            ctx.closePath();
                            ctx.clip();
                        }

                        var shifter = entity.getComponent('originshifter');
                        if (shifter)
                        {
                            // if it has a shifter on it, adjust the position of the entity based on a ratio to
                            // the layer's origin

                            // reverse any changes we've made so far
                            var origX = spatial.pos.x - shifter._offsetX;
                            var origY = spatial.pos.y - shifter._offsetY;

                            shifter._offsetX = (this.layer.origin.x * shifter.ratio);
                            shifter._offsetY = (this.layer.origin.y * shifter.ratio);

                            spatial.pos.x = origX + shifter._offsetX;
                            spatial.pos.y = origY + shifter._offsetY;
                        }

                        var spriteComponent = entity.getComponent('sprite');
                        if (spriteComponent)
                        {
                            spriteComponent.sprite.update(pc.device.elapsed);
                            if (alpha && alpha.level != 1 && alpha.level != 0)
                                spriteComponent.sprite.alpha = alpha.level;
                            spriteComponent.sprite.draw(ctx, drawX+ spriteComponent.offset.x, drawY+ spriteComponent.offset.y, spatial.dir);
                        }

                        var overlay = entity.getComponent('overlay');
                        if (overlay)
                        {
                            // update and draw the overlay sprite
                            overlay.sprite.update(pc.device.elapsed);
                            if (alpha)
                                overlay.sprite.alpha = alpha.level;
                            overlay.sprite.draw(ctx, drawX, drawY, spatial.dir);

                            overlay.decrease(pc.device.elapsed);
                            if (overlay.hasExpired())
                                entity.removeComponent(overlay);
                        }

                        var rect = next.obj.getComponent('rect');
                        if (rect)
                        {
                            ctx.save();
                            ctx.lineWidth = rect.lineWidth;
                            ctx.fillStyle = rect.color.color;
                            if (alpha) ctx.globalAlpha = alpha.level;
                            if (rect.strokeColor && rect.lineWidth) ctx.strokeStyle = rect.strokeColor.color;

                            ctx.translate(drawX+(spatial.dim.x/2), drawY+(spatial.dim.y/2));
                            ctx.rotate( spatial.dir * (Math.PI/180));

                            // rounded rectangle
                            if (rect.cornerRadius > 0)
                            {
                                ctx.beginPath();
                                ctx.moveTo(drawX + spatial.radius, drawY);
                                ctx.lineTo(drawX + spatial.dim.x - spatial.radius, drawY);
                                ctx.quadraticCurveTo(drawX + spatial.dim.x, drawY, drawX + spatial.dim.x, drawY + spatial.radius);
                                ctx.lineTo(drawX + spatial.dim.x, drawY + spatial.dim.y - spatial.radius);
                                ctx.quadraticCurveTo(drawX + spatial.dim.x, drawY + spatial.dim.y,
                                    drawX + spatial.dim.x - spatial.radius, drawY + spatial.dim.y);
                                ctx.lineTo(drawX + spatial.radius, drawY + spatial.dim.y);
                                ctx.quadraticCurveTo(drawX, drawY + spatial.dim.y, drawX, drawY + spatial.dim.y - spatial.radius);
                                ctx.lineTo(drawX, drawY + spatial.radius);
                                ctx.quadraticCurveTo(drawX, drawY, drawX + spatial.radius, drawY);
                                ctx.closePath();
                                ctx.fill();
                            } else
                            {
                                ctx.fillRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                                if (rect.strokeColor && rect.lineWidth)
                                    ctx.strokeRect(-spatial.dim.x/2, -spatial.dim.y/2, spatial.dim.x, spatial.dim.y);
                            }

                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            ctx.restore();
                            pc.device.elementsDrawn++;
                        }

                        var text = entity.getComponent('text');
                        if (text)
                        {
                            ctx.save();
                            var yAdd=0;
                            if (alpha) ctx.globalAlpha = alpha.level;
                            ctx.font = text._fontCache;
                            ctx.lineWidth = text.lineWidth;

                            for (var i=0; i < text.text.length; i++)
                            {
                                // canvas text is drawn with an origin at the bottom left, so we draw at y+h, not y
                                if (text.color)
                                {
                                    ctx.fillStyle = text.color.color;
                                    ctx.fillText(text.text[i], drawX + text.offset.x, drawY + yAdd + spatial.dim.y + text.offset.y);
                                }
                                if (text.strokeColor && text.lineWidth)
                                {
                                    ctx.strokeStyle = text.strokeColor.color;
                                    ctx.strokeText(text.text[i], drawX + text.offset.x, drawY + yAdd + spatial.dim.y + text.offset.y);
                                }
                                yAdd += (text.fontHeight * 1.1);
                            }
                            if (alpha) ctx.globalAlpha = 1; // restore the alpha
                            pc.device.elementsDrawn++;
                            ctx.restore();
                        }

                        if (clip)
                            ctx.restore();
                    }
                }
                next = next.next();
            }

            pc.device.lastDrawMS += (Date.now() - startTime);
        }

    });
















/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

/**
 * @class pc.systems.Layout
 * @description
 * [Extends <a href='pc.systems.System'>pc.systems.System</a>]
 * <p>
 * Manages the layout of entities
 */
pc.systems.Layout = pc.systems.EntitySystem.extend('pc.systems.Layout',
    /** @lends pc.systems.Layout */
    {},
    /** @lends pc.systems.Layout.prototype */
    {
        /** current margin (left, right, top, bottom) */
        margin: null,

        /**
         * Constructs a new layout system.
         * @param {Number} options.margin.left Default left margin for all entities
         * @param {Number} options.margin.right Default right margin for all entities
         * @param {Number} options.margin.top Default top margin for all entities
         * @param {Number} options.margin.bottom Default bottom margin for all entities
         */
        init: function(options)
        {
            this._super( [ 'layout' ] );
            this.margin = {};
            if (pc.checked(options) && pc.checked(options.margin))
            {
                this.margin.left = pc.checked(options.margin.left, 0);
                this.margin.right = pc.checked(options.margin.right, 0);
                this.margin.top = pc.checked(options.margin.top, 0);
                this.margin.bottom = pc.checked(options.margin.bottom, 0);
            } else
            {
                this.margin.left = 0;
                this.margin.right = 0;
                this.margin.top = 0;
                this.margin.bottom = 0;
            }
        },

        _getAnchorLocation: function(horizontal, vertically)
        {
            if (horizontal === 'left')
            {
                if (vertically === 'top') return 'top-left';
                if (vertically === 'middle') return 'middle-left';
                if (vertically === 'bottom') return 'bottom-left';
            }

            if (horizontal === 'center')
            {
                if (vertically === 'top') return 'top-center';
                if (vertically === 'middle') return 'middle-center';
                if (vertically === 'bottom') return 'bottom-center';
            }

            if (horizontal === 'right')
            {
                if (vertically === 'top') return 'top-right';
                if (vertically === 'middle') return 'middle-right';
                if (vertically === 'bottom') return 'bottom-right';
            }

            return null;
        },

        /**
         * Processes all the entities and lays them out according to the anchoring options.
         * Typically this is called whenever a new entity with a layout component is added to the
         * system, but you can call it manually if you really want to (such as when an entity changed size or moves)
         */
        doLayout: function()
        {
            var layouts = new pc.HashList(); // a list for each of the anchors

            var next = this.entities.first;
            while (next)
            {
                var entity = next.obj;
                var spatial = entity.getComponent('spatial');
                if (!spatial)
                    entity.addComponent( pc.components.Spatial({}) );

                var layout = entity.getComponent('layout');

                // add entities to the layout sides; this just sorts them
                var al = this._getAnchorLocation(layout.horizontal, layout.vertical);
                layouts.add(al, next.obj);
                //console.log(' adding: ' + next.obj.toString() + ' to anchor group: ' + al);
                next = next.next();
            }

            // now go through all the anchor groups and lay things out
            var layoutKeys = layouts.hashtable.keys();
            for (var i=0; i < layoutKeys.length; i++)
            {
                var anchor = layoutKeys[i];
                var list = layouts.get(layoutKeys[i]);

                // if it's centered we need to know the height of all the entities being laid out
                // before we place the first item.

                var dim = this._getEntityDimensions(list);
                var cx = this.margin.left;
                var cy = this.margin.top;

                // set the starting position
                switch(anchor)
                {
                    case 'top-left':
                        break;
                    case 'middle-left':
                        cy += ( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-left':
                        cy = this.layer.getScreenRect().h - dim.y - this.margin.bottom;
                        break;
                    case 'top-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x/2);
                        break;
                    case 'middle-center':
                        cx += this.layer.getScreenRect().w / 2 - (dim.x/2);
                        cy +=( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-center':
                        cx = this.layer.getScreenRect().w / 2 - (dim.x/2) - this.margin.bottom;
                        cy += this.layer.getScreenRect().h - dim.y;
                        break;
                    case 'top-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        break;
                    case 'middle-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy +=( this.layer.getScreenRect().h / 2) - (dim.y/2);
                        break;
                    case 'bottom-right':
                        cx += this.layer.getScreenRect().w - dim.x;
                        cy = this.layer.getScreenRect().h - dim.y - this.margin.bottom;
                        break;
                }

                // whilst this while loop below looks like it's handling all anchor types, keep in mind
                // each loop is only handling one type (since they are sorted/grouped above)
                var listNext = list.first;
                while (listNext)
                {
                    entity = listNext.obj;
                    spatial = entity.getComponent('spatial');
                    layout = entity.getComponent('layout');

                    cy += layout.margin.top;

                    switch(anchor)
                    {
                        case 'top-left':
                        case 'middle-left':
                        case 'bottom-left':
                            cx = layout.margin.left + this.margin.left;
                            break;
                        case 'top-center':
                        case 'middle-center':
                        case 'bottom-center':
                            cx = layout.margin.left + (this.layer.getScreenRect().w/2) - (spatial.dim.x/2);
                            break;
                        case 'top-right':
                        case 'middle-right':
                        case 'bottom-right':
                            cx = this.layer.getScreenRect().w - spatial.dim.x - layout.margin.right - this.margin.right;
                            break;
                    }

                    spatial.pos.x = cx;
                    spatial.pos.y = cy;

                    cy += spatial.dim.y + layout.margin.bottom;

                    listNext = listNext.next();
                }

            }
        },

        _entityDim: null,

        _getEntityDimensions: function(list)
        {
            if (!this._entityDim)
                this._entityDim = new pc.Dim();

            this._entityDim.x = 0;
            this._entityDim.y = 0;

            var listNext = list.first;
            while (listNext)
            {
                var sp = listNext.obj.getComponent('spatial');
                var layout = listNext.obj.getComponent('layout');

                if (sp)
                {
                    this._entityDim.x += layout.margin.left + sp.dim.x + layout.margin.right;
                    this._entityDim.y += layout.margin.top + sp.dim.y + layout.margin.bottom;
                }

                listNext = listNext.nextLinked;
            }

            return this._entityDim;
        },

        onResize: function(width, height)
        {
            this.doLayout();
        },

        onEntityAdded: function(entity)
        {
            this._super();
            this.doLayout();
        },

        onEntityRemoved: function(entity)
        {
            this._super();
            this.doLayout();
        },

        onComponentAdded: function(entity, component)
        {
            this._super();
            this.doLayout();
        }



    });
















