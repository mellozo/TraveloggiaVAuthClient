﻿

angularTraveloggia.controller('AlbumController', function ($scope, $location, $route, DataTransportService, SharedStateService, $window) {

    $scope.authorizationState = SharedStateService.getAuthorizationState();
    var toolbarHeight = 62; $window.document.getElementById("toolbarRow");
    var viewFrameHeight = $scope.reliableHeight - toolbarHeight;
    $scope.scrollWindowStyle = {
        "height": viewFrameHeight,
       "max-height": viewFrameHeight
    }
    //var vhseventysix = $window.innerHeight * .76;
    //var vweighty = $window.innerWidth * .8;
    $scope.viewFrameWidth = $window.document.getElementById("viewFrame").offsetWidth;
    $scope.viewFrameHeight = $window.document.getElementById("viewFrame").offsetHeight;
    var vhseventysix = $scope.viewFrameHeight * .76;
    var vweighty = $scope.viewFrameWidth * .8;

    $scope.landscapeImageStyle = {
        "max-height": vhseventysix,
        "max-width": vweighty
    };

    var vheighty = $window.document.getElementById("viewFrame").offsetHeight * .8;
    $scope.portaitImageStyle = {
        "height":"auto",
        "max-width:":vheighty
    }

    $scope.filesToUpload = null;

    $scope.photoRecords = [];

    $scope.imageServer = "https://s3-us-west-2.amazonaws.com/traveloggia-guests/";

    $scope.imagePath = SharedStateService.getAuthenticatedMemberID() +"/" + SharedStateService.getSelectedMapName() + "/";

    var randomDate = new Date();
    $scope.imageRefresher = "?reload=" + randomDate.getMilliseconds().toString();

    var cachedPhotos = SharedStateService.Repository.get('Photos');

    if (cachedPhotos.length > 0 && cachedPhotos[0].SiteID == SharedStateService.getSelectedID("Site"))
    {
        $scope.PhotoList = cachedPhotos;
        $scope.selectedPhoto = SharedStateService.getSelectedPhoto();    
    }
    else if (SharedStateService.getSelectedID("Site") != null ){
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
        $scope.selectedPhoto = photo;
        $location.path("/Photo");
    }


    // rotates image if nescessary 
    $scope.onImageLoad = function (e, orientationID) {
        var loadedImage = e.target;
        var degrees = 0;
        var maxHeight = $window.innerHeight * .76
        var scaledWidth = maxHeight;
        var height = loadedImage.height;

        var width = loadedImage.width;
        var x;

        //   height/width = x/scaledWidth;
      //  height * scaledWidth = x * width;
        x= (height * scaledWidth)/width;
        var canvas = loadedImage.parentNode.getElementsByTagName("canvas")[0];
        var ctx = canvas.getContext("2d");
       ctx.save();
        // make canvas a big square for now
        canvas.width = scaledWidth;
        canvas.height =scaledWidth;
       // ctx.drawImage(loadedImage, 0,0,scaledWidth, x);
        ctx.restore();

        switch (orientationID) {
            case 1:
                degrees = 0;
                break;
            case 2:
                degrees = 0;
                break;
            case 3:
                degrees = 180;
                break;
            case 4:
                degrees = 0;
                break;
            case 5:
                degrees = 90;
                ctx.translate(width / 2, height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((width / 2) -(height / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                break;
            case 6:
                ctx.save();
                degrees = 90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveLeft = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(0, moveLeft)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = 90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveLeft = ((width / 2) - (height / 2)) * 2
                //ctx.translate(0, moveLeft)
                //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                //break;
            case 7:
                ctx.save();
                degrees = -90;
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = -90;
                //degrees = -90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveDown = ((width / 2) - (height / 2)) * 2
                //ctx.translate(-moveDown, 0)
                //ctx.drawImage(loadedImage, -height / 2, -width / 2, width, height);
                //break;
            case 8:
                ctx.save();
                degrees = -90;
                ctx.translate(scaledWidth / 2, x / 2);
                ctx.rotate(degrees * Math.PI / 180);
                var moveDown = ((scaledWidth / 2) - (x / 2)) * 2
                ctx.translate(-moveDown, 0)
                ctx.drawImage(loadedImage, -x / 2, -scaledWidth / 2, scaledWidth, x);
                ctx.restore();
                break;
                //degrees = -90;
                //ctx.translate(width / 2, height / 2);
                //ctx.rotate(degrees * Math.PI / 180);
                //var moveDown = ((width / 2) - (height / 2)) * 2
                //ctx.translate(-moveDown, 0)
                //ctx.drawImage(loadedImage, -height/2, -width/2, width, height);
                //break;
        }

      


    }

// upon selecting file to upload
    $scope.fileNameChanged = function (mel) {
            var files = mel.files;
            if (files && files.length > 0)
            {
                // store file objects to be passed to http => aws
                $scope.filesToUpload = files;

                //display selected files in preview pane ( this will change ) 
                for (var i = 0; i < files.length; i++)
                {
                    var file = files[i];
                    // use the image loader componenet
                    onFileSelected(file);
                }
            }
    }


    // used to display in preview pane
    function replaceResults(img) {
        var content
        if (!(img.src || img instanceof HTMLCanvasElement)) {
            content = $('<span>Loading image file failed</span>')
        } else {
            
            content = $('<a target=_blank>').append(img)
              .attr('download', currentFile.name)
              .attr('href', img.src || img.toDataURL())
        }
        var previewContainer = angular.element("#previewPanel");
        previewContainer.append(content);

    }

    // used to display in preview pane
    function displayImage(file, options) {
        currentFile = file
        if (!loadImage(
            file,
            replaceResults,
            options
          )) {
            result.children().replaceWith(
              $('<span>Your browser does not support the URL or FileReader API.</span>')
            )
        }
    }


// displays in preview pane and creates record with exif data
    function onFileSelected(file) {
        var options = {
            maxWidth: 80,
            maxHeight:80,
            canvas: true,
            pixelRatio: window.devicePixelRatio,
            downsamplingRatio: 0.5
        }
     
        loadImage.parseMetaData(file, function (data) {
            var exifData = null;
            var orientationID = null;
            if (data.exif) {
                options.orientation = data.exif.get('Orientation');
                exifData = data.exif.getAll();
                orientationID = options.orientation
            }
            var dbRecord = createPhotoRecord(file.name, exifData, orientationID);
            // store in associative array so that at the right time ( after sucessful upload) we can post the record to db 
            $scope.photoRecords.push(dbRecord);
            displayImage(file, options)
        })
    }


    $scope.filesUploadedCount = 0;

   var createPhotoRecord = function (fileName, exif, orientationID) {
        var photoRecord = new Photo();
        photoRecord.SiteID = SharedStateService.getSelectedID("Site");
        photoRecord.StorageURL = $scope.imageServer;
        photoRecord.FileName = fileName;
        if (exif != null) {
            photoRecord.orientation = exif.orientation;
            photoRecord.orientationID = orientationID;
            photoRecord.DateTaken = exif.DateTimeOriginal;
        }
        return photoRecord;
    }

   $scope.handleUploadClick = function () {
       $scope.systemMessage.text = "working...";
       $scope.systemMessage.activate();
 
       uploadFile();
     
    }
   
    var uploadFile = function () {     
        var memberID = SharedStateService.getAuthenticatedMemberID();
        var mapName = SharedStateService.getSelectedMapName();
        for (var i = 0; i < $scope.filesToUpload.length; i++)
        {
            (  function(imageFile,fileName,photoRecord){
                var fileName = imageFile.name
                var photoRecord = getObjectByProperty( $scope.photoRecords, "FileName", fileName);
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
        if ($scope.filesToUpload.length == $scope.filesUploadedCount) {
            if($scope.filesUploadedCount == 1)
                $scope.systemMessage.text = "photo was uploaded successfuly"
            else if ($scope.filesUploadedCount > 1)
                $scope.systemMessage.text =$scope.filesUploadedCount +  " photos were uploaded successfuly"
            $scope.systemMessage.activate();
        }
        
    }



    getObjectByProperty = function (list, property, value) {
        var obj = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i][property] == value) {
                obj = list[i];
                break;
            }
        }
        return obj;
    }

    $scope.addPhotoRecord = function (photoRecord) {
        DataTransportService.addPhoto(photoRecord).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                cachedPhotos.push(result.data);
                SharedStateService.Repository.put('Photos', cachedPhotos);
                $scope.filesUploadedCount = $scope.filesUploadedCount + 1;
               // $route.reload();
            },
            function (error) {
                $scope.systemMessage.text = "error adding photo record";
                $scope.systemMessage.activate();
            });
    }

    $scope.deletePhoto = function () {
        DataTransportService.deletePhoto($scope.selectedPhoto.PhotoID).then(
            function (result) {
                var cachedPhotos = SharedStateService.Repository.get('Photos');
                for (var i = 0; i < cachedPhotos.length; i++) {
                    if (cachedPhotos[i].PhotoID == $scope.selectedPhoto.PhotoID) {
                        cachedPhotos.splice(i, 1);
                        break;
                    }
                }
                $scope.systemMessage.text = "selected photo has been deleted";
                $scope.systemMessage.activate();
                $location.path("/Album");
            },
            function (error) {
                $scope.systemMessage.text = "error deleting photo record";
                $scope.systemMessage.activate();
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
                    $scope.systemMessage.text = $scope.filesUploadedCount +  " photos uploaded successfully";
                else 
                    $scope.systemMessage.text =" photo uploaded successfully";

                    $scope.systemMessage.activate();
                    $scope.filesToUpload = null;
                    $scope.filesUploadedCount = 0;
                    $route.reload();
            }
        }
        );


    // loading the data if they change sites but stay on the page
    $scope.$watch(
        function (scope) {
            if(SharedStateService.Selected.Site != null)
            return SharedStateService.Selected.Site.SiteID;
        },
        function (newValue, oldValue) {
            if (newValue != null && newValue != oldValue)
            {
                $scope.PhotoList = [];
                DataTransportService.getPhotos(newValue).then(
                function (result) {
                    $scope.PhotoList = result.data;
                },
                function (error) { }
                );
            }
               
        });

})

