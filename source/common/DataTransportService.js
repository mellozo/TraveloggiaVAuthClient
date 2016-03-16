
angularTraveloggia.factory('DataTransportService', function ($http) {
    var baseURL = "http://localhost:58143"
//    var baseURL = "http://traveloggiaservices.net"
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

        updateSite: function (site) {
            var endpoint = baseURL + "/api/Sites";
            var config = {
                method: "put",
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
       
        uploadImage: function (memberID, mapName, siteName, imageFile) {
// very primative for now data clean
            var mapName = mapName.replace(' ', '').replace(',', '');
            var siteName = siteName.replace(' ', '').replace(',', '');
            //using the amazon javascript api
            var bucketName = 'artemisbucket';
            AWS.config.update({ accessKeyId: 'AKIAIER5RMXUR4346VGA', secretAccessKey: '5DIR5nffcS4YaKsS1wo6iRNKmvsxmuRE/M6tm1cm' })
            AWS.config.region = 'us-west-2'
            var objKey = memberID+"/" + mapName+"/" + siteName+"/" + imageFile.name;
            var bucket = new AWS.S3({
                params: {
                    Bucket: bucketName
                }
            });
            var params = {
                Key: objKey,
                ContentType: imageFile.type,
                Body: imageFile
            };
            bucket.putObject(params, function (err, data) {
                if (err) {
                     // need to do a promise thing or notify or whatever but it works!!!
                } else {
                  
                }
               
            });
        },

        getJournals:function(siteID){
            var endpoint = baseURL + "/api/Journals/" + siteID;
            var config = {
                method: "get",
                url: endpoint
            }
            return $http(config);
        },


        addJournal:function(journal){
        var endpoint = baseURL + "/api/Journals"
        var config = {
            method: "post",
            url: endpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data: journal
        }
        return $http(config);
        },


        updateJournal: function (journal) {
            var endpoint = baseURL + "/api/Journals/"+journal.JournalID
            var config = {
                method: "put",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: journal
            }
            return $http(config);
        },

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







