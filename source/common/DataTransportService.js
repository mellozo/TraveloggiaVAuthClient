
angularTraveloggia.factory('DataTransportService', function ($http,$q) {
var baseURL = "http://localhost:51316"
//var baseURL = "http://traveloggiaservices.net"
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
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(config);
        },


        getMapList: function (memberID) {
            var endpoint = baseURL + "/api/MapList/" + memberID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(config);
        },

        getMapByID: function (mapID) {
            var endpoint = baseURL + "/api/SelectMap/" + mapID;
            var config = {
                method: "get",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(config);
        },

        addMap:function(wholeMap){
            var endpoint = baseURL + "/api/Maps";
            var config = {
                method: "post",
                url: endpoint,
                data:wholeMap
            }
            return $http(config);

        },

       updateMap: function (wholeMap) {
            var endpoint = baseURL + "/api/Maps/"+ wholeMap.MapID;
            var config = {
                method: "put",
                url: endpoint,
                data: wholeMap
            }
            return $http(config);

       },
       deleteMap: function (id) {
           var endpoint = baseURL + "/api/Maps/" +id;
           var config = {
               method: "delete",
               url: endpoint
           }
           return $http(config);

       },

        getSiteByID: function (siteID) {
            var endpoint = baseURL + "/api/SelectSite/" + siteID;
            var config = {
                method: "get",
                url: endpoint
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
            var endpoint = baseURL + "/api/Sites/" + site.SiteID;
            var config = {
                method: "PUT",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: site
            }

            return $http(config);
        },

        deleteSite:function(siteID){
            var endpoint = baseURL + "/api/Sites/" + siteID
            var config = {
            method: "DELETE",
            url: endpoint,
            headers: {'Content-Type': 'application/json'}
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

      
        addPhoto: function (photo) {
            var endpoint = baseURL + "/api/Photos";
            var config = {
                method: "post",
                url: endpoint,
                headers: {'Content-Type': 'application/json' },
                data: photo
            }

            return $http(config);
        },

        updatePhoto: function (photo) {
            var endpoint = baseURL + "/api/Photos/" + photo.PhotoID;
            var config = {
                method: "PUT",
                url: endpoint,
                headers: { 'Content-Type': 'application/json' },
                data: photo
            }

            return $http(config);
        },


        deletePhoto: function (photoID) {
            var endpoint = baseURL + "/api/Photos/" + photoID
            var config = {
                method: "DELETE",
                url: endpoint,
                headers: { 'Content-Type': 'application/json' }
            }

            return $http(config);
        },

       
        uploadImage: function (memberID, mapID,  imageFile) {
            var uploadResult = $q.defer();
            //using the amazon javascript api
            var bucketName = 'traveloggia-guests';
            AWS.config.update({ accessKeyId: 'AKIAJ5HBU5J7RIIHEETQ', secretAccessKey: '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' })
            AWS.config.region = 'us-west-2'
            var objKey = memberID+"/" + mapID+"/"  + imageFile.name;
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
                    uploadResult.reject(err)
                } else {
                  uploadResult.resolve("success")
                }
               
            });

            return uploadResult.promise;
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
                method: "PUT",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: journal
            }
            return $http(config);
        },

        deleteJournal: function (JournalID) {
            var endpoint = baseURL + "/api/Journals/" + JournalID
            var config = {
                method: "DELETE",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            return $http(config);
        },

        addDevice: function (device) {
            var endpoint = baseURL + "/api/Devices";
            var config = {
                method: "post",
                url: endpoint,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: device
            }

            return $http(config);
        },
       
    }

  

});







