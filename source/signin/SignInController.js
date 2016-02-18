angularTraveloggia.controller('SignInController', function (SharedState,DataTransportService,$location,$scope,$route) {
    var VM = this;

    VM.showCreate = function () {
        var accountAnchor = window.document.getElementById("aCreateAccount");
        accountAnchor.style.display = "inline-block";
        var accountAnchor = window.document.getElementById("divSignIn");
        accountAnchor.style.display = "none";
    }
    if ($route.current.isCreate == true)
        VM.showCreate();

    VM.Member = new Member();

    VM.signOut = function(){

        window.location.href = "http://html5.traveloggia.net/Default.html";

       // and all the other stuff we will fool around with later like JWT
    }

    VM.signIn = function () {


       


        DataTransportService.getMember("acap@sd.net", "buster").then(
            function (result,x, y, z, h)
            {
                SharedState.MemberID = result.data.MemberID;
                SharedState.LoadMaps();
                 $location.path("/Map")
              
               
            },
            function (error) {
                VM.Member = new Member();
                var retryLink = window.document.getElementById("aSignIn");
                retryLink.innerText = "Try Again";
                var accountAnchor = window.document.getElementById("aCreateAccount");
                accountAnchor.style.display = "inline-block";
            }
        )
    }
   

    VM.createAccount = function () {
        DataTransportService.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                SharedState.MemberID = result.data.MemberID;
                var defaultMap = new Map();
                defaultMap.MemberID = $rootScope.MemberID;
                SharedState.currentMap = defaultMap;
                $location.path("/Map")
            },
            function (error) {

                VM.Member = new Member();
                if ( error.data != null && error.data.Message == "member exists already")
                {
                    $scope.showSystemMessage("email already in use")
                
                }
                   
                else
                    $scope.showSystemMessage("error creating account")
            }
            );

    }



})