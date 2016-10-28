angularTraveloggia.directive("wrappedDate", function () {
    return {

        restrict: "E",
        require:'ngModel',
        scope: {
            mel: '=ngModel'
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
            $('#'+attrs.id).datetimepicker()
            var picker = $('#' + attrs.id).data('DateTimePicker');
            var ipt = elem.find("#dateInputField");
            if (scope.mel != null && scope.mel !="") {
                var jdate = new Date(scope.mel);
                var readableDate = jdate.toLocaleString();
                ipt[0].value = readableDate;
            }
            else {
                picker.clear();
            }
    
            ipt.on('blur', function () {
                scope.$apply(function() {
                    ngModel.$setViewValue(ipt[0].value);
                    });
            })

            scope.$watch('mel', function (data, x, y, z) {
                //var picker = $('#' + elem[0].id).data('DateTimePicker');
                //if (picker != null)
                //    picker.enable();
              
                    var ipt = elem.find("#dateInputField");
                 
                if (scope.mel != null && scope.mel != "") {
                    var jdate = new Date(scope.mel);
                    var readableDate = jdate.toLocaleString();
                    ipt[0].value = readableDate;
                }
                else {
                    var picker = $('#' + elem[0].id).data('DateTimePicker');
                    picker.clear();
                }

             
                
            

            });


            
        }

    }
});