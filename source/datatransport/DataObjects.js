

Member = function () {

    var scope_safe = this;
    var recordDate = new Date(Date.now());
    scope_safe.AccountCreateDate = recordDate.toLocaleDateString();
    scope_safe.Email = null;
    scope_safe.Password = null;
    scope_safe.OpenID = "";
    scope_safe.TraveloggiaEdition = 'TraveloggiaV';
    scope_safe.FirstName = "";
    scope_safe.LastName = "";
    scope_safe.TraveloggiaEditionID = 4;
    scope_safe.CreatedByMapID = 8;
   

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