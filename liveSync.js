/*
    liveSync.js
    version 0.0.1
    
    A Backbone plugin which provides a means for a collection to make
    asynchronous calls to a function which are timed to be evenly spaced.
    
    Useful for keeping the collection synced with the server.

    Copyright 2014 Josh Bambrick
    http://joshbambrick.com/

    Github
    http://github.com/joshbambrick/liveSync
    
    Licensed under the MIT license:
    http://www.opensource.org/licenses/mit-license.php

*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], factory);
    } else {
        // Browser globals
        factory(this._, this.Backbone);
    }
}(function (_, Backbone) {
    var oldCollection = Backbone.Collection;

    Backbone.Collection = function () {
        oldCollection.apply(this, arguments);

        if (this.liveSync) {
            // set per-instance settings (as opposed to mofiying the prototype)
            // also set defaults
            _.extend(this, {
                _liveSyncActive: this.liveSync.active === false ? false : true,
                _liveSyncPeriod: this.liveSync.period || 10000,
                _liveSyncCallback: this.liveSync.callback,
                _liveSyncInitialize: this.liveSync.initialize,
                _liveSyncAsProperty: this.liveSync.asProperty
            });


            if (this._liveSyncActive !== false) {
                if (this.liveSync.initialize) {
                    this.liveSyncNow();
                } else {
                    this._setLiveSyncTimeout();
                }
            }
        }
    };

    _.extend(Backbone.Collection, oldCollection);
    _.extend(Backbone.Collection.prototype, {
        setLiveSyncProperty: function(propertyName, value) {
            if (propertyName === 'active') {
                // dummy value to toggle current value
                if (value === 'toggle') {
                    value = !this._liveSyncActive;
                }

                if (value === true) {
                    if (!this._liveSyncActive) {
                        this._liveSyncActive = true;
                        this._setLiveSyncTimeout();
                    }
                } else {
                    this._liveSyncActive = false;
                }
            } else if (propertyName === 'callback') {
                this._liveSyncCallback = value;
            } else if (propertyName === 'period') {
                this._liveSyncPeriod = value;
            } else if (propertyName === 'asProperty') {
                this._liveSyncAsProperty = value;
            }

            return this;
        },

        getLiveSyncProperty: function(propertyName) {
            var result;

            if (propertyName === 'active') {
                result = this._liveSyncActive;
            } else if (propertyName === 'callback') {
                result = this._liveSyncCallback;
            } else if (propertyName === 'period') {
                result = this._liveSyncPeriod;
            } else if (propertyName === 'asProperty') {
                result = this._liveSyncAsProperty;
            }

            return result;
        },

        _setLiveSyncTimeout: function () {
            this._liveSyncTimeout = setTimeout(_.bind(this.liveSyncNow, this), this._liveSyncPeriod);
        },

        liveSyncNow: function () {
            var callback, callbackArgument = {};

            if (this._liveSyncTimeout != null) {
                // clear timer (in the case that this call was made by the user)
                clearTimeout(this._liveSyncTimeout);
            }

            if (this._liveSyncActive !== false) {
                if (_.isString(this._liveSyncCallback)) {
                    callback = this[this._liveSyncCallback];
                } else {
                    callback = this._liveSyncCallback;
                }

                callback = _.isFunction(callback) ? callback : function () {};

                if (this._liveSyncAsProperty) {
                    callbackArgument[_liveSyncAsProperty] = _.bind(this._setLiveSyncTimeout, this);
                } else {
                    callbackArgument = _.bind(this._setLiveSyncTimeout, this);
                }

                callback.call(this, callbackArgument);
            }

            return this;
        }
    }, oldCollection.prototype);
}));