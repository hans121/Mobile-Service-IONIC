var gImageURI = '';
var gFileSystem = {};
var fileurl = '';
var entry = '';
var filecallback;
var FileIO = {

// sets the filesystem to the global var gFileSystem
 gotFS : function(fileSystem) {
      gFileSystem = fileSystem;
      console.log(fileSystem);
      console.log(gFileSystem);
 },
 
// pickup the URI from the Camera edit and assign it to the global var gImageURI
// create a filesystem object called a 'file entry' based on the image URI
// pass that file entry over to gotImageURI()
updateCameraImages : function(imageURI, func) {
        filecallback = func;
        //gImageURI.push(imageURI);
        window.resolveLocalFileSystemURL(imageURI, FileIO.gotImageURI, FileIO.errorHandler);
    },
 
// pickup the file entry, rename it, and move the file to the app's root directory.
// on success run the movedImageSuccess() method
 gotImageURI : function(fileEntry) {
      //fileurl.push(fileEntry.toURL());
      //fileurl = fileEntry.toURL();
      
       entry = fileEntry;
       var directoryEntry = gFileSystem.root;
       console.log(gFileSystem);
       directoryEntry.getDirectory("EvosusCache", {create: true, exclusive: false}, FileIO.onDirectorySuccess, FileIO.onDirectoryFail);
       
 },
 
 onDirectorySuccess : function(parent) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var j = 0; j < 10; j++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  var newName = "thumbnail"+text+".jpg";
        entry.copyTo(parent, newName, FileIO.movedImageSuccess, FileIO.errorHandler);
          console.log(parent);
      },
 onDirectoryFail : function(error) {
      alert("Unable to create new directory: " + error.code);
  },
// send the full URI of the moved image to the updateImageSrc() method which does some DOM manipulation
 movedImageSuccess : function(fileEntry) {
      //alert(fileEntry.fullPath);
      //alert(fileEntry.toURI());
      //fileurl.push(fileEntry.toURL());
      gImageURI = fileEntry.toURI();
      fileurl = fileEntry.toURL();
      console.log("new file");
      console.log(fileurl);
      return filecallback();
      //DocTypeInfo.set('file', fileEntry.toURL());
      
      //updateImageSrc(fileEntry.fullPath);
 },
 
// get a new file entry for the moved image when the user hits the delete button
// pass the file entry to removeFile()
 removeDeletedImage : function(imageURI){
      window.resolveLocalFileSystemURL(imageURI, FileIO.removeFile, FileIO.errorHandler);
 },
 
// delete the file
 removeFile : function(fileEntry){
      fileEntry.remove();
 },
 
// simple error handler
 errorHandler : function(e) {
       var msg = '';
       switch (e.code) {
       case FileError.QUOTA_EXCEEDED_ERR:
               msg = 'QUOTA_EXCEEDED_ERR';
               break;
        case FileError.NOT_FOUND_ERR:
               msg = 'NOT_FOUND_ERR';
               break;
        case FileError.SECURITY_ERR:
               msg = 'SECURITY_ERR';
               break;
        case FileError.INVALID_MODIFICATION_ERR:
               msg = 'INVALID_MODIFICATION_ERR';
               break;
        case FileError.INVALID_STATE_ERR:
               msg = 'INVALID_STATE_ERR';
               break;
        default:
               msg = e.code;
        break;
 };
 alert("Error occured");
 console.log('Error: ' + msg);
 }
}