angularTraveloggia.directive("wrappedDate", function () {
    return {

        restrict: "E",
        require:'ngModel',
        scope: {
            mel: '='
        },
        template:
                 "<div class='input-group date'  id='dtPicker'>" +
                    "<input   id='dateInputField'   type='text' class='form-control'   />"+
                    "<span class='input-group-addon'>" +
                        "<span class='glyphicon glyphicon-calendar'></span>"+
                    "</span>"+
                "</div>",
        link: function (scope, elem, attrs, ngModel) {

            $("#dtPicker").datetimepicker();
           var picker = $('#dtPicker').data('DateTimePicker');
            var ipt = elem.find("#dateInputField");
            ipt[0].value = scope.mel;
               ipt.on('blur', function () {
                  // scope.mel = ipt[0].value;
                   scope.$apply(function() {
                       ngModel.$setViewValue(ipt[0].value);
                       });
                  
               })



        }

    }
});