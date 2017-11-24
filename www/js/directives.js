angular.module('nice2meet')

.directive('map', function() {


    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        link: function($scope, $element, $attr, $location, $http) {
            function initialize() {
                var myStyle = [
    
    {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },{
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color":"#DDDDE5"
            }
        ]
    },
    {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },{
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#666666"
      }
    ]
  },{
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },{
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7fadc4"
      }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#BBBBCC"
            }
        ]
    },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    
    {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
    
    {
        "featureType": "administrative",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    }
] ; ;
                
                var map = new google.maps.Map($element[0],  {
       mapTypeControlOptions: {
         mapTypeIds: ['mystyle', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN]
       },
       zoom: 17,
       mapTypeId: 'mystyle',
        disableDefaultUI: true
     });
            map.mapTypes.set('mystyle', new google.maps.StyledMapType(myStyle, { name: 'My Style' }));

                $scope.onCreate({ map: map });

                // Stop the side bar from dragging when mousedown/tapdown on the map
                google.maps.event.addDomListener($element[0], 'mousedown', function(e) {
                    e.preventDefault();
                    return false;
                });
            }

            if (document.readyState === "complete") {
                initialize();
            } else {
                google.maps.event.addDomListener(window, 'load', initialize);
            }
        }
    }
        
});



 
