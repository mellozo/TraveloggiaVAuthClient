sampleApp.controller('SignInController', function(DataFactory) {
    var VM = this;

    VM.Member = new Member();
    VM.signIn = function () {

        DataFactory.getMember(VM.Member.Email, VM.Member.Password).then(
            function(data){VM.suck =  " you dont suck"},
            function(error){alert("failure" + error.statusText)}
            )

    }
    VM.callTest = function () {
        alert(VM.Member.Email + " " + VM.Member.Password);
           // return DataFactory.test("monkey");

        }

    VM.suck = "you suck";

})