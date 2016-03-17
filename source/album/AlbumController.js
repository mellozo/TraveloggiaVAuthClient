angularTraveloggia.controller('AlbumController', function ( photos,$scope,DataTransportService,SharedStateService,$window) {
  
    //loading the data with the router/resolve just to demo different was of doing things

    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";
    $scope.imagePath = SharedStateService.authenticatedMember.MemberID + "/" + SharedStateService.Selected.Map.MapName + "/" 

    $scope.PhotoList = photos.data;
   
    $scope.fileToUpload = null;

    $scope.fileNameChanged = function (mel) {
            var files = mel.files;
            var file = null;
            if (files && files.length > 0)
            {
                file = files[0];
                $scope.fileToUpload = file;
            
               try {
                        // Create ObjectURL
                        var imgURL = $window.URL.createObjectURL(file);
                        angular.element("#imagePreview").attr("src",   imgURL);
                        // Revoke ObjectURL
                        URL.revokeObjectURL(imgURL);
                    }
                    catch (e) {
                        //try {
                        //    // Fallback if createObjectURL is not supported
                        //    var fileReader = new FileReader();
                        //    fileReader.onload = function (event) {
                        //        showPicture.src = event.target.result;
                        //    };
                        //    fileReader.readAsDataURL(file);
                        //}
                        //catch (e) {
                        //    $scope.systemMessage.text = "Neither createObjectURL or FileReader are supported";
                        //    $scope.systemMessage.activate();

                        //}
                    }
             }
    }

    $scope.uploadFile = function () {
        var memberID = SharedStateService.authenticatedMember.MemberID;
        var mapName = SharedStateService.Selected.Map.MapName;
        DataTransportService.uploadImage(memberID, mapName, $scope.fileToUpload).then(
            function (result) {
                $scope.addPhotoRecord();
            },
            function (error) {
                $scope.systemMessage.text = "error uploading photo";
                $scope.systemMessage.activate();
            } );
    }


    $scope.addPhotoRecord = function () {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.Selected.Site.SiteID;
        photoRecord.StorageURL = $scope.imageServer;
        photoRecord.FileName = $scope.fileToUpload.name;
        DataTransportService.addPhoto(photoRecord).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                cachedPhotos.push(result.data);
                SharedStateService.Repository.put('Photos', cachedPhotos);
                $scope.systemMessage.text = "photo saved successfully";
                $scope.systemMessage.activate();
            },
            function (error) {
                $scope.systemMessage.text = "error uploading photo";
                $scope.systemMessage.activate();
            });
    }

    // loading the data if they change sites but stay on the page
    // may we say, what an inelegant syntax
    $scope.$watch(
        function (scope) {
            return SharedStateService.Selected.Site
        },
        function (newValue, oldValue) {
            if(newValue != oldValue)
            DataTransportService.getPhotos(newValue).then(
                function (result) {
                        $scope.PhotoList = result.data;
                },
                function (error) { }
                );
        }
        );

   

})

