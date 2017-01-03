"use strict"

angularTraveloggia.service('SharedStateService', function (DataTransportService, isEditing, readOnly, canEdit, $cacheFactory, $window, $cookies, $q)
{

    var local_scope = this;

    local_scope.setAuthorizationState = function (constValue) {
        localStorage.setItem("AuthorizationState", constValue)

    }

    local_scope.getAuthorizationState = function () {
        return localStorage.getItem("AuthorizationState");

    }

    local_scope.setAuthenticatedMember = function (member) {
        var stringified = (member != null) ? JSON.stringify(member) : null;
        localStorage.setItem("AuthenticatedMember", stringified);
    }

    local_scope.getAuthenticatedMemberID = function () {
        var item = null;
        var cacheitem = localStorage.getItem("AuthenticatedMember");
        if (cacheitem != null && cacheitem != "null") {
            item = JSON.parse(cacheitem).MemberID;
          
        }
          
        return item;
    }


    // bootstrap to a demo user - this may go away 
    if (local_scope.getAuthenticatedMemberID() == null) {
        local_scope.setAuthenticatedMember( { "MemberID": 1 });
        local_scope.setAuthorizationState("READ_ONLY")
    }
    else if (local_scope.getAuthenticatedMemberID() != 1) {
        local_scope.setAuthorizationState("CAN_EDIT")
    }



    local_scope.setSelectedAsync = function (key, value) {
        try {
            var stringified = (value != null) ? JSON.stringify(value) : null;
            localStorage.setItem(key, stringified)

        }
        catch (error) {
            console.log(error.message)
        }
    }


    local_scope.getItemFromCache = function (key) {
        var item = null;
        var cacheitem = localStorage.getItem(key);
        if (cacheitem != null && cacheitem != "null")
            item = JSON.parse(cacheitem);
        return item;

    }

    //ridiculous that angular doesnt have this already
    local_scope.deleteFromCacheAsync = function (collectionName, propName, itemID) 
    {
        var collection = local_scope.getItemFromCache(collectionName)
        if (collection == null)
            return;
        var spliceIndex = 0;
        try {
                    for (var i = 0; i < collection.length; i++) {
                        if (collection[i][propName] == itemID) {
                            spliceIndex = i;
                            break;
                        }
                    }
                    collection.splice(i, 1);
                    local_scope.setSelectedAsync(collectionName, collection) 
            }
            catch (error) {
                $scope.systemMessage.text = "error deleting from cache";
                $scope.systemMessage.activate();
            }
    }


    local_scope.addToCacheAsync = function (collectionName, item) {
        var list = local_scope.getItemFromCache(collectionName);
        if (list == null)
            list = [];

            list.splice(0, 0, item);
        local_scope.setSelectedAsync(collectionName, list)
    }



    local_scope.updateCacheAsync = function (collectionName, propName, itemID, item) {
        var collection = local_scope.getItemFromCache(collectionName);
        if (collection == null)
            return;

        for (var i = 0; i < collection.length; i++) {
            if (collection[i][propName] == itemID) {
                collection[i] = item;
                break;
            }
        }

        local_scope.setSelectedAsync(collectionName, collection)
    }


    local_scope.clearAll = function () {
        local_scope.setSelectedAsync("MapListItem", null)
        local_scope.clearMap();
    }

    local_scope.clearMap = function () {
        local_scope.setSelectedAsync('Map', null);
        local_scope.clearMapChildren();
    }

    local_scope.clearMapChildren = function () {
        local_scope.setSelectedAsync("Site", null);
        //  local_scope.setSelectedAsync("Sites", []);
        local_scope.clearSiteChildren();
    }

    local_scope.clearSiteChildren = function () {
        local_scope.setSelectedAsync('Photos', []);
        local_scope.setSelectedAsync('Journals', []);
        local_scope.setSelectedAsync('Photo', null);
        local_scope.setSelectedAsync('Journal', null);
    }


    // to do maybe
    local_scope.getItemFromCollection = function (key, idField, idValue, callback) {

    }


    local_scope.getSearchManager = function () {
        var deferredResult = $q.defer();
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            deferredResult.resolve("ok");
        });
        return deferredResult.promise;
    }




    

})