

Member = function () {
    var scope_safe = this;
    scope_safe.MemberID = null;
    var recordDate = new Date(Date.now());
    scope_safe.AccountCreateDate = recordDate.toDateString();
    scope_safe.Email = null;
    scope_safe.Password = null;
    scope_safe.OpenID = "";
    scope_safe.TraveloggiaEdition = 'TraveloggiaV';
    scope_safe.FirstName = "";
    scope_safe.LastName = "";
    scope_safe.TraveloggiaEditionID = 4;
    //scope_safe.CreatedByMapID = 8;   
}

Map = function () {
    var scope_safe = this;
    scope_safe.MapID = null;
    var recordDate = new Date(Date.now());
    var melness = recordDate.toDateString();
    scope_safe.MapName = melness;
    scope_safe.MemberID = 
    scope_safe.MinX = null;
    scope_safe.MaxX = null;
    scope_safe.MinY = null;
    scope_safe.MaxY = null;
    scope_safe.CreateDate = null; // serializing js dates + entity no workey
    scope_safe.FromPhone = null;
    scope_safe.LastRevision = null;
    scope_safe.HasLayers = null;
    scope_safe.SavedToDB = false;
    scope_safe.IsDeleted = false;
    scope_safe.Sites = [];
}


var Site = function () {
    var scope_safe = this;
    scope_safe.SiteID = null;
    scope_safe.Longitude = null;
    scope_safe.Latitude = null;
    scope_safe.MapID = null;
    scope_safe.MemberID = null;
    scope_safe.Name = null;
    scope_safe.Address = null;
    scope_safe.Description = null;
    scope_safe.Phone = null;
    scope_safe.Email = null;
    scope_safe.URL = null;
    var recordDate = new Date(Date.now());
    scope_safe.DateAdded = recordDate.toLocaleDateString();
    scope_safe.RouteIndex = null;
    scope_safe.Rating = null;
    scope_safe.AverageRating = null;
    scope_safe.VotesCast = null;
    scope_safe.Arrival = null;
    scope_safe.Departure = null;
    scope_safe.Photos = [];
    scope_safe.Journals = [];
}


var Photo=function()
{
    var scope_safe = this;
    scope_safe.PhotoID = null;
    scope_safe.FileName = null;
    scope_safe.Caption = null;
    scope_safe.SiteID = null;
    scope_safe.JournalID = null;
    scope_safe.DateAdded = null;
    scope_safe.DateTaken = null;
    scope_safe.FromPhone = null;
    scope_safe.StorageURL = null;
    scope_safe.ThumbnailURL = null;
    scope_safe.orientation  = null;
    scope_safe.orientationID  = null;
    scope_safe.GPSLatitude  = null;
    scope_safe.GPSLongitude  = null;
    scope_safe.Camera  = null;
    scope_safe.Model  = null;
    scope_safe.Software  = null;
    scope_safe.Height  = null;
    scope_safe.Width  = null;
    scope_safe.BitsPerSample  = null;

}

var Journal = function () {
    var scope_safe = this;
    scope_safe.JournalID = null;
    scope_safe.Text = null;
    scope_safe.SiteID = null;
    scope_safe.KeyWords = null;
    var recordDate = new Date(Date.now());
    scope_safe.DateAdded = recordDate.toLocaleDateString();  
    scope_safe.JournalDate = null;
    scope_safe.FromPhone = null;
    scope_safe.Title = "untitled";
    scope_safe.MemberID = null;
}

var Device =function(){
    this.osName=null;
    this.osVersion=null;
    this.browserName = null;
    this.browserVersion = null;
    this.engineName = null;
    this.engineVersion = null;
    this.deviceModel = null;
    this.deviceType = null;
    this.deviceVendor = null;
    this.windowInnerHeight = null;
    this.windowInnerWidth = null;
    this.documentElementClientHeight = null;
    this.documentElementClientWidth = null;
    this.Issue = null;
    this.MemberID = null;

}