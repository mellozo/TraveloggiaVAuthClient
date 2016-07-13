

angularTraveloggia.controller('AlbumController', function ($scope, $location, DataTransportService, SharedStateService, $window) {

    $scope.authorizationState = SharedStateService.getAuthorizationState();

    var cachedPhotos = SharedStateService.Repository.get('Photos');
    if (cachedPhotos.length > 0 && cachedPhotos[0].SiteID == SharedStateService.getSelectedID("Site")) {
        $scope.PhotoList = cachedPhotos;
        $scope.selectedPhoto = SharedStateService.getSelectedPhoto();
    }
    else {
        DataTransportService.getPhotos(SharedStateService.getSelectedID("Site")).then(
            function (result) {
                $scope.PhotoList = result.data;
                SharedStateService.Repository.put('Photos', result.data);
                $scope.selectedPhoto = SharedStateService.getSelectedPhoto();
            },
            function (error) { })
    }


    $scope.selectPhoto = function (photo) {
        SharedStateService.setSelected("Photo", photo);
        $location.path("/Photo");
    }


    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";

    $scope.imagePath = SharedStateService.getAuthenticatedMemberID() + "/" + SharedStateService.getSelectedMapName() + "/";

    $scope.filesUploadedCount = 0;

    $scope.createPhotoRecord = function (fileName) {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.getSelectedID("Site");
        photoRecord.StorageURL = $scope.imageServer;
        photoRecord.FileName = fileName;
        return photoRecord;
    }
   
    $scope.filesToUpload = null;

    $scope.fileNameChanged = function (mel) {
            var files = mel.files;
            if (files && files.length > 0)
            {
                $scope.filesToUpload = files;
                var previewContainer = $window.document.getElementById("previewPanel");
                for (var i = 0; i < files.length; i++)
                {
                    var file = files[i];
                    var imgURL;
                    try {
                        imgURL = ($window.URL) ? $window.URL.createObjectURL(file) : $window.webkitURL.createObjectURL(file);
                    }
                    catch (error) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(file);
                    }
                    var imageEl = $window.document.createElement('img');
                    imageEl.setAttribute("src", imgURL);
                    imageEl.style.width = "200px"
                    imageEl.style.margin="4px"
                    previewContainer.appendChild(imageEl);
                    // Revoke ObjectURL
                    //URL.revokeObjectURL(imgURL);
                }
            }
    }

    $scope.uploadFile = function () {
        var memberID = SharedStateService.authenticatedMember.MemberID;
        var mapName = SharedStateService.Selected.Map.MapName;

        for (var i = 0; i < $scope.filesToUpload.length; i++) {

            (  function(imageFile,fileName,photoRecord){
                var fileName = imageFile.name
                var photoRecord = $scope.createPhotoRecord(fileName);
                DataTransportService.uploadImage(memberID, mapName, imageFile).then(
                                 function (result) {
                                     $scope.addPhotoRecord(photoRecord);
                                 },
                                 function (error) {
                                     $scope.systemMessage.text = "error uploading photo";
                                     $scope.systemMessage.activate();
                                 });
          })($scope.filesToUpload[i])

        }
    }

    $scope.addPhotoRecord = function (photoRecord) {
        DataTransportService.addPhoto(photoRecord).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                cachedPhotos.push(result.data);
                SharedStateService.Repository.put('Photos', cachedPhotos);
                $scope.filesUploadedCount = $scope.filesUploadedCount + 1;
            },
            function (error) {
                $scope.systemMessage.text = "error uploading photo";
                $scope.systemMessage.activate();
            });
    }

    $scope.deletePhoto = function () {
        DataTransportService.deletePhoto($scope.selectedPhoto.PhotoID).then(
            function (result) {
                $scope.systemMessage.text = "selected photo has been deleted";
                $scope.systemMessage.activate();
                $location.path("/Album");
            }
            )

    }

    $scope.$watch(
        function (scope) {
            return $scope.filesUploadedCount
        },
        function (newValue, oldValue) {
            if ($scope.filesToUpload && newValue == $scope.filesToUpload.length)
            {
                if ($scope.filesUploadedCount >1)
                    $scope.systemMessage.text = $scope.filesUploadedCount + " photos uploaded successfuly";
                else 
                    $scope.systemMessage.text = "photo uploaded successfuly";

                    $scope.systemMessage.activate();
                      var previewContainer = $window.document.getElementById("previewPanel");
                           while (previewContainer.firstChild)
                               previewContainer.removeChild(previewContainer.firstChild);
                    $scope.filesToUpload = null;
                    $scope.filesUploadedCount = 0;
                    angular.element("#photoFileInput").val("");
            }
        }
        );


    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            return SharedStateService.getSelected("SiteID");
        },
        function (newValue, oldValue) {
            if (newValue != oldValue)
                $scope.PhotoList = [];
            DataTransportService.getPhotos(newValue).then(
                function (result) {
                        $scope.PhotoList = result.data;
                },
                function (error) { }
                );
        });

    

})

