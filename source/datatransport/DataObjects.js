

Member = function () {

    var scope_safe = this;
    var recordDate = new Date();
    scope_safe.AccountCreateDate = recordDate.getDay() + "/" + recordDate.getMonth() + "/" + recordDate.getFullYear();
    scope_safe.Email = null;
    scope_safe.Password = null;
    scope_safe.OpenID = null;
    scope_safe.TraveloggiaEdition = 'TraveloggiaV';
    scope_safe.FirstName = null;
    scope_safe.LastName = null;


}