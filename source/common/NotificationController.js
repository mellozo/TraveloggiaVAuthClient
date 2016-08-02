angularTraveloggia.controller("NotificationController", function ($scope) {

    // demonstrating use of inherited scope via nested controllers
    // even though some people think this is a big no no

    $scope.systemMessage = {

        cover: false,
        text: "",
        dismiss: function(){
            this.cover = false;
        },
        activate:function(){
            this.cover=true;
        },
        loadComplete:false
    };


  





});