# Backbone liveSync 0.0.1 #
A Backbone plugin which provides a means for a collection to make asynchronous calls to a function which are timed to be evenly spaced. Useful for keeping the collection synced with the server.

## Introduction ##
Backbone liveSync is a Backbone plugin which provides a means for collections to define a callback which is repeatedly called on a timer. Timers are set asynchronously so that each call to the callback receives a callback as a parameter to create the next timer. This is useful when working with functions that could potentially take a long time, such as making HTTP requests.

## Usage ##

### Set Up liveSync With a Collection ###

In order to use setMatch with any collection, simply define the `liveSync` property in the collection's declaration.

    var MyCollection = Backbone.Collection.extend({
        liveSync: {
        	// options
        }
    });

The `liveSync` property is an object; there are many different parameters which may be defined:

#### callback (required) ####
`callback` may be an actual function or a string, representing the name of a callback property of the collection. This is the callback which should be called by the timer.

#### period (optional) ####
`period` defines the time, in milliseconds, that the callback waits after being set before making the call to the callback. This defaults to 1000.

#### initialize (optional) ####
`initialize` is a boolean that indicates whether or not to make a call to the callback immediately after the collection has been instantiated, instead of creating a timer to make the first call. This defaults to `false`.

#### asProperty (optional) ####
If `asProperty` is defined as a string, an object will be created with the callback to create the next timer as a property with name `asProperty`. This object will be passed to the `callback` instead of an actual function. `asProperty` may also take the value `false` to indicate that an actual function should be passed. This defaults to `false`.

#### active (optional) ####
`active` is a boolean that allows you to switch off liveSync. If liveSync has been defined in a collection's declaration then you will need to set the `active` property to false to disable liveSync.

### Usage at Runtime ###
liveSync also provides a number of methods for interaction with this plugin after instantiation of the collection. These can be called on the collection as `myCollectionInstance.getLiveSyncProperty()`.

#### setLiveSyncProperty ####
This method receives the name of a liveSync setting (which may be any of those which may be defined in the liveSync object in the collection's declaration), as the first parameter, and its new value, as the second parameter, to change the behaviour of the plugin at runtime. The setting `active` also accepts the value 'toggle' to swap between active and inactive states.

#### getLiveSyncProperty ####
This method receives the name of a liveSync setting and returns its value.

#### liveSyncNow ####
Call this method to force a call to the callback. If there is a currently set timer, then it will be cancelled - a new timer may be set after the callback passed is called.

## Example ##
The example below fetches the models for a collection of potatoes. The contents are initialized on instantiation of the collection and updates will be tested for every 2 seconds after the previous HTTP request has responded.

    var PotatoCollection = Backbone.Collection.extend({
    	url: 'http://example.com/api/potatoes',
        liveSync: {
        	initialize: true,		// fetch the initial potatoes immediately after collection instatiated
        	callback: 'fetch',		// call `fetch` on this collection
        	asProperty: 'complete',	// pass the callback to create the next timer as the property `complete` of an object
        	period: 2000			// fetch again 2 seconds after `complete` function called
        }
    });