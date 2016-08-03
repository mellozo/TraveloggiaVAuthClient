angularTraveloggia.service('SharedStateService',function ( DataTransportService,isEditing,readOnly,canEdit,$cacheFactory,$window,$cookies)
{

    var local_scope = this;

    local_scope.Authorization = {
        state: null
    }


    local_scope.center = null;
    local_scope.zoom = null;
    local_scope.Selected = {}

    // bootstrap to a demo user - this may go away 
    if ($cookies.get("AuthenticatedMemberID") == null) {
        $cookies.put("AuthenticatedMemberID", 1);
       // local_scope.readOnlyUser = true;
    }
       


    local_scope.getAuthenticatedMemberID = function () {
        var id = null;
       id= local_scope.authenticatedMember == null ? $cookies.get("AuthenticatedMemberID") : local_scope.authenticatedMember.MemberID;
       return id;
    }

    local_scope.setAuthenticatedMember = function (member) {
        local_scope.authenticatedMember = member;
        $cookies.put("AuthenticatedMemberID", member.MemberID);

    }
    
    local_scope.setAuthorizationState = function (constValue) {
        local_scope.Authorization.state = constValue;
        $cookies.put("AuthorizationState", constValue);
    }

    local_scope.getAuthorizationState = function () {
        var constvalue = local_scope.Authorization.state;
        if (constvalue == null)
            constvalue = $cookies.get("AuthorizationState") != null ? $cookies.get("AuthorizationState") : readOnly;
        return constvalue;
    }

    

    local_scope.setSelected = function (key, value) {
        local_scope.Selected[key] = value;
        var propName = key + "ID";
        if (value != null)
            var idValue = value[propName];
        else
            idValue = null;
        $cookies.put(propName, idValue)
        // this is messy indeed because we use the mapname in the photo path - probably shouldnt - human readable though
        if (key == "Map")
            $cookies.put("MapName", value.MapName);
     

     //   var test = $cookies.get(propName);
      //  alert(key + propName + test + "=" + idValue);

    }

    local_scope.getSelectedID = function (key) {
        var ID = null;
        var propName = key + "ID";
        ID = local_scope.Selected[key] == null ? $cookies.get(propName) : local_scope.Selected[key][propName];
        return ID;
    }

    local_scope.getSelectedPhoto = function () {
        var photo = local_scope.Selected.Photo;
        if (photo == null)
        {
            var id = $cookies.get("PhotoID");
            var photos = local_scope.Repository.get("Photos");
            for (var i = 0; i<photos.length; i++)
            {
                if(photos[i].PhotoID == id)
                {
                    photo = photos[i];
                    break;
                }
                    
            }
        }
        return photo;
    }

    local_scope.getSelectedMapName = function () {
        var mapName = null;
        mapName = local_scope.Selected.Map == null ? $cookies.get("MapName") : local_scope.Selected.Map.MapName;
        return mapName;
    }

    local_scope.getSelected = function (key) {
        return local_scope.Selected[key];
    }

 

    local_scope.Repository = $cacheFactory('Repository', {});

    local_scope.Repository.put('Maps', []);

    local_scope.Repository.put('Sites', []);

    // for now these are not multi - dimensional arrays
    // but todo - store whatever we load from the same map
    local_scope.Repository.put('Photos', []);

    local_scope.Repository.put('Journals',[])
  

})