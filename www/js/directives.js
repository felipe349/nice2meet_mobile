angular.module('nice2meet')

.directive('map', function() {
    return {
        restrict: 'E',
        scope: {
            onCreate: '&'
        },
        link: function($scope, $element, $attr, $location) {
            function initialize() {
                var latlongPraiaGrande = { lat: -24.0208431, lng: -46.4731311 };

                var mapOptions = {
                    //center: new google.maps.LatLng(-24.0208431, -46.4731311),
                    center: latlongPraiaGrande,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var map = new google.maps.Map($element[0], mapOptions);

                //MARCADOR CRIADO
                var marker = new google.maps.Marker({
                    position: latlongPraiaGrande,
                    map: map
                });

                var contentString = '<div id="content">' +
                    /*'<div id="siteNotice">Netuno' +
                    '</div>' +*/
                    '<span class="titulo-mapa">Netuno</span>' +
                    '<a href="/#/quiz"><button class="button button-m" style="float: right; position: relative;">QUIZ!</button></a><br>' +
                    '<div style="height: 10px;"><br></div>' +
                    '<div id="bodyContent">' +
                    //'<p>A estátua de <b>Netuno</b>, representa o deus grego de mesmo nome.</p>' +
                    '<img src="../img/praia-cidade-ocian.jpg" class="img">' +
                    '<p>Fonte: Google' +
                    '</div>' +
                    '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                marker.addListener('click', function() {
                    map.setZoom(18);
                    map.setCenter(marker.getPosition());
                    infowindow.open(map, marker);
                    //alert("Foi");
                });

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