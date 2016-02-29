angularTraveloggia.controller('AlbumController', function ( photos,$scope,DataTransportService) {
   
    //https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/API/Camera_API/Introduction
  
    var baseURL = "www.traveloggia.net/upload/1/ny test/";

    $scope.PhotoList = photos.data;

    var takePicture = document.querySelector("#take-picture"),
      showPicture = document.querySelector("#show-picture");

    if (takePicture && showPicture) {
        // Set events
        takePicture.onchange = function (event) {
            // Get a reference to the taken picture or chosen file
            var files = event.target.files, file;

            if (files && files.length > 0) {
                file = files[0];
                try {



                  var  xhr = new XMLHttpRequest();
                   
                  xhr.open("post", "/upload", true);
                  
 
                 
                    // Set appropriate headers
                    
                    xhr.setRequestHeader("Content-Type", "multipart/form-data");
                  
                    xhr.setRequestHeader("X-File-Name", file.name);
                  
                    xhr.setRequestHeader("X-File-Size", file.size);
                   
                    xhr.setRequestHeader("X-File-Type", file.type);
                  
 
             
                    // Send the file (doh)
                        xhr.send(file);



                    // Create ObjectURL
                    var imgURL = window.URL.createObjectURL(file);

                    //DataTransportService.uploadImage(file).then(
                    //    function (result) {
                    //                 alert("you rule");},
                    //    function (error) {
                    //        alert("you suck");}
                    //    );

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
                        //
                        var error = document.querySelector("#error");
                        if (error) {
                            error.innerHTML = "Neither createObjectURL or FileReader are supported";
                        }
                    }
                }
            }
        };
    }


})