

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

Map = function () {
    var scope_safe = this;
    scope_safe.MapID = null;
    scope_safe.MapName = null;
    scope_safe.MemberID = null;
    scope_safe.MinX = null;
    scope_safe.MaxX = null;
    scope_safe.MinY = null;
    scope_safe.MaxY = null;
    scope_safe.CreateDate = null;
    scope_safe.FromPhone = null;
    scope_safe.LastRevision = null;
    scope_safe.HasLayers = null;



}