angularTraveloggia.controller('AlbumController', function ( photos,$scope,DataTransportService,SharedStateService,$window) {
  
    //loading the data with the router/resolve just to demo different was of doing things

    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";

    $scope.imagePath = SharedStateService.authenticatedMember.MemberID + "/" + SharedStateService.Selected.Map.MapName + "/";

    $scope.filesUploadedCount = 0;

    $scope.createPhotoRecord = function (fileName) {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.Selected.Site.SiteID;
        photoRecord.StorageURL = $scope.imageServer;
        photoRecord.FileName = fileName;
        return photoRecord;
    }

    $scope.PhotoList = photos.data;
   
    $scope.filesToUpload = null;

    $scope.fileNameChanged = function (mel) {
            var files = mel.files;
          //  var file = null;
            if (files && files.length > 0)
            {
                $scope.filesToUpload = files;
                var previewContainer = $window.document.getElementById("previewPanel");
                for (var i = 0; i < files.length; i++)
                {
                    var file = files[i]
                    var imgURL = $window.URL.createObjectURL(file);
                    var imageEl = $window.document.createElement('img');
                    imageEl.setAttribute("src", imgURL);
                    imageEl.setAttribute("width","200px")
                    previewContainer.appendChild(imageEl);
                    // Revoke ObjectURL
                    URL.revokeObjectURL(imgURL);
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
                    $scope.systemMessage.text =  "photo uploaded successfuly";
                $scope.systemMessage.activate();
                $scope.filesToUpload = null;
                $scope.filesUploadedCount = 0;
            }
        }
        );


    // loading the data if they change sites but stay on the page
    // may we say, what an inelegant syntax
    $scope.$watch(
        function (scope) {
            return SharedStateService.Selected.SiteID;
        },
        function (newValue, oldValue) {
            if(newValue != oldValue)
            DataTransportService.getPhotos(newValue).then(
                function (result) {
                        $scope.PhotoList = result.data;
                },
                function (error) { }
                );
        });
})

