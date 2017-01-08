'use strict'

function Member() {};
Member.prototype.MemberID =null;
Member.prototype.AccountCreateDate =new Date(Date.now()).toDateString();
Member.prototype.Email=null;
Member.prototype.Password=null;
Member.prototype.OpenID = null;
Member.prototype.TraveloggiaEdition = 'TraveloggiaV';
Member.prototype.FirstName = null;
Member.prototype.LastName = null;
Member.prototype.TraveloggiaEditionID = 4;


function Map() {};
Map.prototype.MapID = null;
Map.prototype.MapName = new Date(Date.now()).toDateString();
Map.prototype.MemberID = 
Map.prototype.MinX = null;
Map.prototype.MaxX = null;
Map.prototype.MinY = null;
Map.prototype.MaxY = null;
Map.prototype.CreateDate = null; // serializing js dates + entity no workey
Map.prototype.FromPhone = null;
Map.prototype.LastRevision = null;
Map.prototype.HasLayers = null;
Map.prototype.SavedToDB = false;
Map.prototype.IsDeleted = false;
Map.prototype.Sites = [];


function Site() {}
Site.prototypeSiteID = null;
Site.prototypeLongitude = null;
Site.prototypeLatitude = null;
Site.prototypeMapID = null;
Site.prototypeMemberID = null;
Site.prototypeName = null;
Site.prototypeAddress = null;
Site.prototypeDescription = null;
Site.prototypePhone = null;
Site.prototypeEmail = null;
Site.prototypeURL = null;
Site.prototypeDateAdded = new Date(Date.now()).toDateString();
Site.prototypeRouteIndex = null;
Site.prototypeRating = null;
Site.prototypeAverageRating = null;
Site.prototypeVotesCast = null;
Site.prototypeArrival = null;
Site.prototypeDeparture = null;
Site.prototypePhotos = [];
Site.prototypeJournals = [];



function Photo() { }
Photo.prototype.PhotoID = null;
Photo.prototype.FileName = null;
Photo.prototype.Caption = null;
Photo.prototype.SiteID = null;
Photo.prototype.JournalID = null;
Photo.prototype.DateAdded = null;
Photo.prototype.DateTaken = null;
Photo.prototype.FromPhone = null;
Photo.prototype.StorageURL = null;
Photo.prototype.ThumbnailURL = null;
Photo.prototype.orientation  = null;
Photo.prototype.orientationID  = null;
Photo.prototype.GPSLatitude  = null;
Photo.prototype.GPSLongitude  = null;
Photo.prototype.Camera  = null;
Photo.prototype.Model  = null;
Photo.prototype.Software  = null;
Photo.prototype.Height  = null;
Photo.prototype.Width  = null;
Photo.prototype.BitsPerSample  = null;


function Journal() {}
Journal.prototype.JournalID = null;
Journal.prototype.Text = null;
Journal.prototype.SiteID = null;
Journal.prototype.KeyWords = null;
Journal.prototype.DateAdded = new Date(Date.now()).toLocaleDateString();  
Journal.prototype.JournalDate = null;
Journal.prototype.FromPhone = null;
Journal.prototype.Title = "untitled";
Journal.prototype.MemberID = null;


function Device(){}
Device.prototype.osName=null;
Device.prototype.osVersion=null;
Device.prototype.browserName = null;
Device.prototype.browserVersion = null;
Device.prototype.engineName = null;
Device.prototype.engineVersion = null;
Device.prototype.deviceModel = null;
Device.prototype.deviceType = null;
Device.prototype.deviceVendor = null;
Device.prototype.windowInnerHeight = null;
Device.prototype.windowInnerWidth = null;
Device.prototype.documentElementClientHeight = null;
Device.prototype.documentElementClientWidth = null;
Device.prototype.Issue = null;
Device.prototype.MemberID = null;

