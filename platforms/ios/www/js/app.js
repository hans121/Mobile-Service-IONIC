// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic',
                           'ngCordova',
                           'starter.controllers',
                           'starter.services',
                           'starter.config',
                           'starter.dbmanage',
                           'starter.detail.controller',
                           'starter.edit.controller',
                           'ti-segmented-control',
                           'angular-carousel'])
.config(function($ionicConfigProvider){
  $ionicConfigProvider.tabs.position('bottom');  
})

.run(function($ionicPlatform, DB , $rootScope, $state, Util, PictureService, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if(window.Connection) {
        if(navigator.connection.type == "wifi")
          Util.wifiOn = true;
        else
          Util.wifiOn = false;
      }
    DB.init();
  });
  $ionicPlatform.on("resume", function(event) {
    //PictureService.uploadPicture();  
  });
  $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
    if(networkState == "wifi")
    {
      window.plugins.toast.showLongBottom("WiFi online");
        Util.wifiOn = true;
      if(Util.canUpload)
      {
        window.plugins.toast.showLongBottom("Uploading queued images");
        Util.uploadCount = 0;
        //$ionicLoading.show({template:"Photo Uploading..."});
        $rootScope.$broadcast('statuschange');
        $state.go("tab.itemdetail");
        PictureService.uploadPicture(function(){
          // $rootScope.$broadcast('statuschange');
          // $state.go("tab.itemdetail");
        });
        Util.canUpload = false;
      }
    }
  });
  $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
    Util.wifiOn = false;
    window.plugins.toast.showLongBottom("WiFi offline");
  });
  $rootScope.backPressed = false
  $ionicPlatform.registerBackButtonAction(function (event) {
      
        $rootScope.backPressed = true;
        navigator.app.backHistory();
      
        }, 100);
  /*
  $ionicPlatform.onHardwareBackButton(function () {
      
      if(true) { // your check here
          $rootScope.backPressed = true;
      }
  });*/
  $rootScope.prevToStName = "";
  $rootScope.prevFrStName = "";
  //$rootScope.backPressed = true;
  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){

    if($rootScope.backPressed == true && fromState.name == "tab.home")
        navigator.app.exitApp();
    if($rootScope.backPressed == true && toState.name !="tab.home") 
    {
      $rootScope.backPressed = false;
      event.preventDefault(); 
      if((toState.name =="tab.itemdetail.detailview" && fromState.name=="tab.edititem.commandlist"))
      {
          $state.go(toState.name);
      }
      else
      {

        $state.go("tab.home");
      }
    } 
    $rootScope.backPressed = false;
    });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  
  .state('loading',{
    url: '/loading',
    templateUrl: 'templates/loading.html',
    controller: "LoadingCtrl"
  })
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:
  .state('tab.home',{
    url: "/home",
    cache: false,
    views:{
      'tab-home':{
        templateUrl: 'templates/schedule-item.html',
        controller: 'HomeCtrl'
      }
    }
  
  })
  .state('tab.timecard', {
    url: '/timecard',
    views: {
      'tab-timecard': {
        templateUrl: 'templates/tab-timecard.html',
        controller: 'TimeCardCtrl'
      }
    }
  })       

  .state('tab.sync', {
      url: '/sync',
      views: {
        'tab-sync': {
          templateUrl: 'templates/tab-sync.html',
          controller: 'SyncCtrl'
        }
      }
    })
  /////////////////////

  .state('tab.map', {
      url: '/map',
      views: {   
        'tab-map': {
          templateUrl: 'templates/tab-map.html',
          controller: 'MapCtrl'
        }
      }
    })

  .state('tab.setup', {
    url: '/setup',
    views: {
      'tab-setup': {
        templateUrl: 'templates/tab-setup.html',
        controller: 'SetupCtrl'
      }
    }
  })             
   
  //item details states.dua
  .state('tab.itemdetail',{
    url:'/itemdetail',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/detailview.html',
        controller: 'ITInitDetailViewCtrl'
      }
    }
    })
  
  .state('tab.itemdetail.detailview',{
    url:'/detailview',
    cache: false,
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/detailview.html',
        controller: 'ITDetailViewCtrl'
      }
    }  
    })
  
  .state('tab.itemdetail.taskdetail',{
    url:'/taskdetail',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/task-detail.html'
      }
    }
    })
  
    .state('tab.itemdetail.joblocation',{
    url:'/joblocation',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/job-location.html'
      }
    }
    })
    
    .state('tab.itemdetail.lastfivecall',{
    url:'/lastfivecall',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/last-five-service.html'
      }
    }
    })
    
    .state('tab.itemdetail.equipment',{
    url:'/equipment',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/equipment.html'
      }
    }
    })
    
    .state('tab.itemdetail.interview',{
    url:'/interview',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/interviews.html'
      }
    }
    })
    
    .state('tab.itemdetail.siteprofile',{
    url:'/siteprofile',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/siteprofiles.html'
      }
    }
    })
    
    .state('tab.itemdetail.existorderitem',{
    url:'/existorderitem',
    views:{
      'tab-home':{
        templateUrl:'templates/itemdetail/exist-order-item.html'
      }
    }
    })
                        
    // Edit item states.
    .state('tab.edititem',{
      url:'/edititem',
      views:{
        'tab-home':{
          templateUrl:'templates/edititem/edit-item.html'
        }
      }
      })
    
    .state('tab.edititem.commandlist',{
      url:'commandlist',
      views:{
        'content':{
          templateUrl:'templates/edititem/edit-command.html',
          controller:'EDEditItemCtrl'
          }
        }
      })
    
    .state('tab.edititem.arrive',{
      url:'/arrive',
      views:{
        'content':{
          templateUrl:'templates/set-arrive.html',
          controller: 'EDSetArriveCtrl'
        }
      }
      })
    
    .state('tab.edititem.editmobilenote',{
      url:'/editmobilenote',
      views:{
        'content':{
          templateUrl : 'templates/edititem/mobile-note.html',
          controller : 'EDEditMobileNoteCtrl'
        }
      }
      })
    
    .state('tab.edititem.notestatus',{
      url:'/notestatus',
      views:{
        'content':{
          templateUrl:'templates/edititem/note-status.html',
          controller: 'EDNoteStatusCtrl'
        }
      }
      })
    
    .state('tab.edititem.selsiteprofile',{
      url:'/selsiteprofile',
      views:{
        'content':{
          templateUrl:'templates/edititem/select-site-profile.html',
          controller: 'EDSelectSitePCtrl'
        }
      }
      })
    
    .state('tab.edititem.editsiteprofile',{
      url:'/editsiteprofile',
      views:{
        'content':{
          templateUrl:'templates/edititem/edit-site-profile.html',
          controller: 'EDEditSiteProfileCtrl'
        }
      }
      })
      
    .state('tab.edititem.selserviceprompt',{
      url:'/selserviceprompt',
      views:{
        'content':{
          templateUrl:'templates/edititem/select-service-prompt.html',
          controller: 'EDSelectServicePCtrl'
        }
      }
      })
      
    .state('tab.edititem.editserviceprompt',{
      url:'/editserviceprompt',
      views:{
        'content':{
          templateUrl:'templates/edititem/edit-service-prompt.html',
          controller: 'EDEditServicePromptCtrl'
        }    
      }
      })
    
    .state('tab.edititem.additem',{
      url:'/additem',
      views:{
        'content':{
          templateUrl:'templates/edititem/add-item.html',
          controller: 'EDAddItemCtrl'
        }
      }
      })
    
    .state('tab.edititem.takepicture',{
      url:'/takepicture',
      views:{
        'content':{
          templateUrl:'templates/edititem/take-picture.html',
          controller: "EDTakePictureCtrl"
        }      
      }
      })
    .state('tab.edititem.imagequeue',{
      url:'/imagequeue',
      views:{
        'content':{
          templateUrl:'templates/edititem/image-queue.html',
          controller: "EDImageQueueCtrl"
        }      
      }
      })
;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/loading'); 
})
.directive(
"bnLazySrc",
function( $window, $document ) {


    // I manage all the images that are currently being
    // monitored on the page for lazy loading.
    var lazyLoader = (function() {

        // I maintain a list of images that lazy-loading
        // and have yet to be rendered.
        var images = [];

        // I define the render timer for the lazy loading
        // images to that the DOM-querying (for offsets)
        // is chunked in groups.
        var renderTimer = null;
        var renderDelay = 100;

        // I cache the window element as a jQuery reference.
        var win = $( $window );

        // I cache the document document height so that
        // we can respond to changes in the height due to
        // dynamic content.
        var doc = $document;
        var documentHeight = doc.height();
        var documentTimer = null;
        var documentDelay = 2000;

        // I determine if the window dimension events
        // (ie. resize, scroll) are currenlty being
        // monitored for changes.
        var isWatchingWindow = false;


        // ---
        // PUBLIC METHODS.
        // ---


        // I start monitoring the given image for visibility
        // and then render it when necessary.
        function addImage( image ) {

            images.push( image );

            if ( ! renderTimer ) {

                startRenderTimer();

            }

            if ( ! isWatchingWindow ) {

                startWatchingWindow();

            }

        }


        // I remove the given image from the render queue.
        function removeImage( image ) {

            // Remove the given image from the render queue.
            for ( var i = 0 ; i < images.length ; i++ ) {

                if ( images[ i ] === image ) {

                    images.splice( i, 1 );
                    break;

                }

            }

            // If removing the given image has cleared the
            // render queue, then we can stop monitoring
            // the window and the image queue.
            if ( ! images.length ) {

                clearRenderTimer();

                stopWatchingWindow();

            }

        }


        // ---
        // PRIVATE METHODS.
        // ---


        // I check the document height to see if it's changed.
        function checkDocumentHeight() {

            // If the render time is currently active, then
            // don't bother getting the document height -
            // it won't actually do anything.
            if ( renderTimer ) {

                return;

            }

            var currentDocumentHeight = doc.height();

            // If the height has not changed, then ignore -
            // no more images could have come into view.
            if ( currentDocumentHeight === documentHeight ) {

                return;

            }

            // Cache the new document height.
            documentHeight = currentDocumentHeight;

            startRenderTimer();

        }


        // I check the lazy-load images that have yet to
        // be rendered.
        function checkImages() {

            // Log here so we can see how often this
            // gets called during page activity.
            console.log( "Checking for visible images..." );

            var visible = [];
            var hidden = [];

            // Determine the window dimensions.
            var windowHeight = win.height();
            var scrollTop = win.scrollTop();

            // Calculate the viewport offsets.
            var topFoldOffset = scrollTop;
            var bottomFoldOffset = ( topFoldOffset + windowHeight );

            // Query the DOM for layout and seperate the
            // images into two different categories: those
            // that are now in the viewport and those that
            // still remain hidden.
            for ( var i = 0 ; i < images.length ; i++ ) {

                var image = images[ i ];

                if ( image.isVisible( topFoldOffset, bottomFoldOffset ) ) {

                    visible.push( image );

                } else {

                    hidden.push( image );

                }

            }

            // Update the DOM with new image source values.
            for ( var i = 0 ; i < visible.length ; i++ ) {

                visible[ i ].render();

            }

            // Keep the still-hidden images as the new
            // image queue to be monitored.
            images = hidden;

            // Clear the render timer so that it can be set
            // again in response to window changes.
            clearRenderTimer();

            // If we've rendered all the images, then stop
            // monitoring the window for changes.
            if ( ! images.length ) {

                stopWatchingWindow();

            }

        }


        // I clear the render timer so that we can easily
        // check to see if the timer is running.
        function clearRenderTimer() {

            clearTimeout( renderTimer );

            renderTimer = null;

        }


        // I start the render time, allowing more images to
        // be added to the images queue before the render
        // action is executed.
        function startRenderTimer() {

            renderTimer = setTimeout( checkImages, renderDelay );

        }


        // I start watching the window for changes in dimension.
        function startWatchingWindow() {

            isWatchingWindow = true;

            // Listen for window changes.
            win.on( "resize.bnLazySrc", windowChanged );
            win.on( "scroll.bnLazySrc", windowChanged );

            // Set up a timer to watch for document-height changes.
            documentTimer = setInterval( checkDocumentHeight, documentDelay );

        }


        // I stop watching the window for changes in dimension.
        function stopWatchingWindow() {

            isWatchingWindow = false;

            // Stop watching for window changes.
            win.off( "resize.bnLazySrc" );
            win.off( "scroll.bnLazySrc" );

            // Stop watching for document changes.
            clearInterval( documentTimer );

        }


        // I start the render time if the window changes.
        function windowChanged() {

            if ( ! renderTimer ) {

                startRenderTimer();

            }

        }


        // Return the public API.
        return({
            addImage: addImage,
            removeImage: removeImage
        });

    })();


    // ------------------------------------------ //
    // ------------------------------------------ //


    // I represent a single lazy-load image.
    function LazyImage( element ) {

        // I am the interpolated LAZY SRC attribute of
        // the image as reported by AngularJS.
        var source = null;

        // I determine if the image has already been
        // rendered (ie, that it has been exposed to the
        // viewport and the source had been loaded).
        var isRendered = false;

        // I am the cached height of the element. We are
        // going to assume that the image doesn't change
        // height over time.
        var height = null;


        // ---
        // PUBLIC METHODS.
        // ---


        // I determine if the element is above the given
        // fold of the page.
        function isVisible( topFoldOffset, bottomFoldOffset ) {

            // If the element is not visible because it
            // is hidden, don't bother testing it.
            if ( ! element.is( ":visible" ) ) {

                return( false );

            }

            // If the height has not yet been calculated,
            // the cache it for the duration of the page.
            if ( height === null ) {

                height = element.height();

            }

            // Update the dimensions of the element.
            var top = element.offset().top;
            var bottom = ( top + height );

            // Return true if the element is:
            // 1. The top offset is in view.
            // 2. The bottom offset is in view.
            // 3. The element is overlapping the viewport.
            return(
                    (
                        ( top <= bottomFoldOffset ) &&
                        ( top >= topFoldOffset )
                    )
                ||
                    (
                        ( bottom <= bottomFoldOffset ) &&
                        ( bottom >= topFoldOffset )
                    )
                ||
                    (
                        ( top <= topFoldOffset ) &&
                        ( bottom >= bottomFoldOffset )
                    )
            );

        }


        // I move the cached source into the live source.
        function render() {

            isRendered = true;

            renderSource();

        }


        // I set the interpolated source value reported
        // by the directive / AngularJS.
        function setSource( newSource ) {

            source = newSource;

            if ( isRendered ) {

                renderSource();

            }

        }


        // ---
        // PRIVATE METHODS.
        // ---


        // I load the lazy source value into the actual
        // source value of the image element.
        function renderSource() {

            element[ 0 ].src = source;

        }


        // Return the public API.
        return({
            isVisible: isVisible,
            render: render,
            setSource: setSource
        });

    }


    // ------------------------------------------ //
    // ------------------------------------------ //


    // I bind the UI events to the scope.
    function link( $scope, element, attributes ) {

        var lazyImage = new LazyImage( element );

        // Start watching the image for changes in its
        // visibility.
        lazyLoader.addImage( lazyImage );


        // Since the lazy-src will likely need some sort
        // of string interpolation, we don't want to
        attributes.$observe(
            "bnLazySrc",
            function( newSource ) {

                lazyImage.setSource( newSource );

            }
        );


        // When the scope is destroyed, we need to remove
        // the image from the render queue.
        $scope.$on(
            "$destroy",
            function() {

                lazyLoader.removeImage( lazyImage );

            }
        );

    }


    // Return the directive configuration.
    return({
        link: link,
        restrict: "A"
    });

}
);
