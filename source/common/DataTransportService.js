
angularTraveloggia.factory('DataTransportService', function ($http) {
    var baseURL = "http://localhost:58143"


    return {
   
        getMember: function (email, password) {
            var endpoint = baseURL + "/api/Members/Validate"
            var config = {
                method:"post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                        Email: email,
                        Password:password
                      }
            }
            return $http(config);
        },

        addMember:function( member )
        {
            var endpoint = baseURL + "/api/Members"
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: member
            }

            return $http(config);

        },

        getMaps: function (memberID) {
      
            var endpoint = baseURL + "/api/Maps/" + memberID;
            var config = {
                method: "get",
                url:endpoint
            }
            return $http(config);
        },

        addSite:function(site){
            var endpoint = baseURL + "/api/Sites";
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: site
            }

            return $http(config);
        },

        getPhotos: function (siteID) {
            var endpoint = baseURL + "/api/Photos/" + siteID;
            var config = {
                method: "get",
                url: endpoint
            }
            return $http(config);
        },
       
        uploadImage:function(imageFile){
            var fd = new FormData();
            fd.append(imageFile.name, imageFile);
            var config = {
                method: "post",
                url: "http://www.traveloggia.net/upload/1/Maui/",
                transformRequest: angular.identity,// overrides default serialization to json
                headers: {
                    'Content-Type': 'undefined'// multi-part form doesnt quite work, bounderies are not created 
                },
                data: fd
            }
            return $http(config);
        },

        getJournals:function(siteID){
            var endpoint = baseURL + "/api/Journals/" + siteID;
            var config = {
                method: "get",
                url: endpoint
            }
            return $http(config);

    }

    }









    //function createMember(observableList, createdMap) {
    //    var theMap = ko.toJS(createdMap);
    //    var theData = JSON.stringify(theMap);
    //    alert(theData);
    //    $.ajax(
    //           {
    //               url: "api/Map",
    //               type: "POST",
    //               contentType: "application/json",
    //               data: theData
    //           })
    //       .done(function (data) {

    //           var insertedMap = new window.traveloggia.Map(data);
    //           observableList.push(insertedMap);
    //           $('#mapSelector').listview('refresh');
    //       })
    //       .fail(function (x, y, z) {
    //           alert(z);
    //       });

    //};

    //function getMember(callback, id) {

    //    $.ajax(
    //       {
    //           url: "http://localhost/TraveloggiaWebApi/api/Member/id",
    //           dataType: "json"
    //       })
    //   .done(function (arrayOjson) {

    //       if (arrayOjson.length > 0) {
    //           alert(" you are a genius");
    //           //self.repository = arrayOjson;
    //           //var stringified = JSON.stringify(arrayOjson);
    //           //self.setLocalStorageValue("repository", stringified);
    //           //callback(arrayOjson);
    //       }
    //       else {
    //           // create a new map 
    //       }

    //   })
    //   .fail(function (x, y, z) {

    //       alert(z);
    //   });

    //}

   

   


});







