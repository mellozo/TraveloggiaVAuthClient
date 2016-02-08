angularTraveloggia.controller('SignInController', function (DataFactory,$location) {
    var VM = this;

    VM.Member = new Member();

    VM.signOut = function(){

        window.location.href = "http://html5.traveloggia.net/Default.html";

       // and all the other stuff we will fool around with later like JWT
    }


    VM.signIn = function () {

        DataFactory.getMember("acap@sd.net", "buster").then(
            function (data,x, y, z, h)
            {

                VM.suck = " you dont suck"
                $location.path("/Map")

            },
            function (error) {
                alert("failure" + error.statusText)
                var retryLink = window.document.getElementById("aSignIn");
                retryLink.innerText = "Try Again";
                var accountAnchor = window.document.getElementById("aCreateAccount");
                accountAnchor.style.display = "inline-block";



            }

            )

    }
   

    VM.suck = "you suck";

})