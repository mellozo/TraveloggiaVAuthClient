angularTraveloggia.controller('SignInController', function (DataFactory,$location,$rootScope,$scope) {
    var VM = this;

    VM.systemMessage = "monkey fun today";
   
    $scope.systemMessageStyle = { "display": "none" };
    VM.Member = new Member();

    VM.signOut = function(){

        window.location.href = "http://html5.traveloggia.net/Default.html";

       // and all the other stuff we will fool around with later like JWT
    }

    VM.dismissSystemMessage = function () {
        $scope.systemMessageStyle = { "display": "none"};
    }
    VM.signIn = function () {

        DataFactory.getMember(VM.Member.Email, VM.Member.Password).then(
            function (result,x, y, z, h)
            {
                $rootScope.MemberID = result.data.MemberID;
             
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
        DataFactory.addMember(VM.Member).then(
            function (result, x, y, z, h) {
                $rootScope.MemberID = result.data.MemberID;
                $location.path("/Map")
            },
            function (error) {

                VM.Member = new Member();
                if (error.data.Message == "member exists already")
                {
                    VM.systemMessage = "email already in use"
                    $scope.systemMessageStyle = { "display": "inline-block" }
                }
                   
                else
                    VM.systemMessage = "error creating member"
               
            }
            );

    }



})