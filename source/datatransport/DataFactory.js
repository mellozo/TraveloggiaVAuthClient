//var dataService = angular.module("DataService", []);



angularTraveloggia.factory('DataFactory', function ($http) {

    return {
   
        getMember: function(email, password){

            var config = {
                method:"post",
                url: "http://localhost/TraveloggiaVAuthService/api/Members/Validate",
                headers: {
                    'Content-Type': 'application/json'
                },
                data:{ Email:email,
                           Password:password
                        }
            }

            return $http(config);
        },

        test: function testDataFactory(msg) {
            alert(msg);
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







