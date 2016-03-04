angularTraveloggia.controller('AlbumController', function ( photos,$scope,DataTransportService,SharedStateService) {
   
    //https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/API/Camera_API/Introduction
  

    $scope.PhotoList = photos.data;

    // may we say, what an inelegant syntax
    $scope.$watch(
        function (scope) {
            return SharedStateService.Selected.SiteID
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

    $scope.previewImage = function () {
        var takePicture = document.querySelector("#take-picture");
        var showPicture = document.querySelector("#show-picture");
        if (takePicture && showPicture) {
            // Set events
            takePicture.onchange = function (event) {
                var files = event.target.files, file;
                if (files && files.length > 0) {
                    file = files[0];
                    try {
                        // Create ObjectURL
                        var imgURL = window.URL.createObjectURL(file);
                        // Set img src to ObjectURL
                        showPicture.src = imgURL;
                        // Revoke ObjectURL
                        URL.revokeObjectURL(imgURL);
                    }
                    catch (e) {
                        try {
                            // Fallback if createObjectURL is not supported
                            var fileReader = new FileReader();
                            fileReader.onload = function (event) {
                                showPicture.src = event.target.result;
                            };
                            fileReader.readAsDataURL(file);
                        }
                        catch (e) {
                            $scope.systemMessage.text = "Neither createObjectURL or FileReader are supported";
                            $scope.systemMessage.activate();

                        }
                    }
                }
            }
        };



    }

   
    $scope.uploadImage = function () {
        DataTransportService.uploadImage(file)
    }

})