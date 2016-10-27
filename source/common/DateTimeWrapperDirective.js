angularTraveloggia.directive("wrappedDate", function () {
    return {

        restrict: "E",
        require:'ngModel',
        scope: {
            mel: '='
        },
      replace:true,
        template:
                 "<div class='input-group date'  >" +
                    "<input   id='dateInputField'   type='text' class='form-control'   />"+
                    "<span class='input-group-addon'>" +
                        "<span class='glyphicon glyphicon-calendar'></span>"+
                    "</span>"+
                "</div>",
        link: function (scope, elem, attrs, ngModel) {
            var selector = "#" + attrs.id;
            $('#'+attrs.id).datetimepicker();
            var picker = $('#' + attrs.elid).data('DateTimePicker');
            var ipt = elem.find("#dateInputField");
            ipt[0].value = scope.mel;
               ipt.on('blur', function () {
                   scope.$apply(function() {
                       ngModel.$setViewValue(ipt[0].value);
                       });
               })
            
        }

    }
});