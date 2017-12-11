appN2M.controller('HomeCtrl', function($scope,$state, $compile, $cacheFactory,$ionicHistory, $window, $ionicPopup, $rootScope, $ionicLoading, $timeout, $http, $location, $cordovaGeolocation) {
    localforage.getItem('status').then(function(readValue) {
        if(readValue !== 1){
                $state.go('login');
        $cacheFactory.get('$http').removeAll(); 
        localforage.clear();
        window.localStorage.clear();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
        });
        console.log("t");   
        }
    });
    var statusPopupMap = 0;
    var confirmPopupMapError;
    var latlng;
    var secondsCenterFlag = 0;
    $scope.$on('$ionicView.beforeEnter', function(){
        if(reloadHome == 1){
            $window.location.reload(true);
        }
    });
    $scope.$on('$ionicView.enter', function(){
        if(latlng){
            $scope.map.setCenter(latlng);
        }
        google.maps.event.trigger(this.map, 'resize');
        
    });
    var drivingLine;
    var directionsService = new google.maps.DirectionsService();
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    document.addEventListener("deviceready", onDeviceReady, false);
    //PARA USAR OS PLUGINS DO CORDOVA
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
    //ÍCONE MARCADOR DA POSIÇÃO DO USUÁRIO
    var marcadorCliente = null;
    //CÍRCULO ANIMADO
    var circle = null;
    $scope.mapCreated = function(map) {
        var options = { maximumAge: 0,timeout: 20000, enableHighAccuracy: true};
        $timeout(function () {
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
            $scope.map = map;
            circle = new google.maps.Circle({
                strokeColor: '#3398ff',
                strokeOpacity: 0.8,
                strokeWeight: 0,
                fillColor: '#ff6820',
                fillOpacity: 0.5,
                map: map,
                center: map.center,
                radius: 50
            });
            var direction = 1;
            var rMin = 20;
            var rMax = 50;
            var lengthOferta = 0;
            var infowindow = new google.maps.InfoWindow();
            $scope.$on('$ionicView.beforeLeave', function(){
              infowindow.close();
            });
            var positionCliente = '';
            var positionClienteAntiga = 0;
            var positionPonto = '';
            var to = '';
            setInterval(function() {
                var radius = circle.getRadius();
                if ((radius > rMax) || (radius < rMin)) {
                    direction *= -1;
                }
                circle.setRadius(radius + direction * 0.1);
            }, 2);
            var imageCliente = new google.maps.MarkerImage(
                "img/markerCliente.svg",
                null,
                null,
                /* Offset x axis 33% of overall size, Offset y axis 100% of overall size */
                new google.maps.Point(25, 50), 
                new google.maps.Size(50, 50)); 

            var imagePonto = new google.maps.MarkerImage(
                "img/markerPonto.svg",
                null,
                null,
                /* Offset x axis 33% of overall size, Offset y axis 100% of overall size */
                new google.maps.Point(25, 50), 
                new google.maps.Size(50, 50)); 
            marcadorCliente = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: map.center,
                icon: imageCliente
            });            
            var infoWindowCliente = "<p>Estou aqui!<p>" 
            google.maps.event.addListener(marcadorCliente,'click', (function(marcadorCliente,infoWindowCliente,infowindow){ 
                         
                         return function() {
                                    infowindow.setContent(infoWindowCliente);
                                    infowindow.open(map,marcadorCliente);
                                 };
            })(marcadorCliente,infoWindowCliente,infowindow));
            
            $http({
                method: "post",
                url: "http://nice2meettcc.herokuapp.com/api/pontoTuristico",
                data: {
                        lat : position.coords.latitude,
                        long : position.coords.longitude
                }
            }).success(function(success) {
                if(success) {
                    marcadores = success;
                    for (i = 0; i < marcadores.length; i++) {
                        var latJson = marcadores[i].cd_latitude;
                        var lngJson = marcadores[i].cd_longitude;
                        var markertitle = marcadores[i].nm_ponto_turistico;
                        var markerDescricao = marcadores[i].ds_ponto_turistico;
                        var markerId = marcadores[i].id_ponto_turistico;
                        $scope.buttonQuiz = function($index){
                            var rad = function(x) {
                                return x * Math.PI / 180;
                            };
                            var getDistance = function(p1, p2) {
                                var R = 6378137;
                                var dLat = rad(p2.lat() - p1.lat());
                                var dLong = rad(p2.lng() - p1.lng());
                                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                var d = R * c;
                                return d; 
                            };
                            var distancia = getDistance(positionCliente, positionPonto);
                            if(distancia < 300){
                                var confirmPopup = $ionicPopup.confirm({
                                    title: 'Fazer o quiz para a oferta ' + dadosOfertas[$index].nm_oferta +'?',
                                    template: 'Após clicar no ok a chance será utilizada, conclua sua tentativa com sabedoria.',
                                    buttons: [{ text: 'Não', type: 'button-red' },
                                              { text: 'Sim',  type: 'button-blue', onTap: function() { return true; }}]
                                });
                                confirmPopup.then(function(res) {
                                    if (res) {
                                        $ionicLoading.show({
                                            content: 'Loading',
                                            template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
                                            animation: 'fade-in',
                                            showBackdrop: true,
                                            maxWidth: 200,
                                            showDelay: 0
                                        });
                                                            $http({
                                                                method: "post",
                                                                url: "https://nice2meettcc.herokuapp.com/api/cupom",
                                                                data: {
                                                                        id_oferta : dadosOfertas[$index].id_oferta,
                                                                        id_turista : window.localStorage.getItem("turista.id_turista"),
                                                                        flag: 0
                                                                }
                                                            }).success(function(success) {
                                                                if(success) {
                                                                    retorno_api_quiz = success;

                                                                    if(retorno_api_quiz != 1){
                                                                        id_oferta_escolhida = dadosOfertas[$index].id_oferta;
                                                                        $state.go('quiz');
                                                                    }else{
                                                                        $ionicLoading.hide();
                                                                        var alertPopup = $ionicPopup.alert({
                                                                          title: 'Oferta já realizada!',
                                                                          template: 'Você já fez essa oferta 1 vez, tente fazer outra oferta.',
                                                                          buttons: [{ text: 'Ok', type: 'button-gradient' }]
                                                                        });
                                                                        alertPopup.then(function(res) {
                                                                            
                                                                        });
                                                                    }
                                                                }else{console.log("erro");$ionicLoading.hide();}
                                                            }).error(function(error){console.log("net");$ionicLoading.hide();
                                                            });
                                                
                                                
                                            
                                        
                                    } else {
                                    }
                                });
                            }else{
                                var alertPopup = $ionicPopup.alert({
                                  title: 'Muito longe.',
                                  template: 'O quiz será liberado quando estiver proximo do ponto turistico.',
                                  buttons: [{ text: 'Ok', type: 'button-gradient' }]
                                });
                                alertPopup.then(function(res) {
                                    
                                });
                            }
                                
                        };
                        var markerr;
                        $scope.centralizaIW = function(){
                            if($scope.Testette){
                                if(document.getElementById('item_ofertas') != null){
                                    infowindow.open(map,markerr);
                                }else{
                                    var countCenterIW = setInterval(function() {
                                        if(document.getElementById('item_ofertas') != null){
                                            clearInterval(countCenterIW);
                                            infowindow.open(map,markerr);
                                        }

                                    }, 5);  
                                }
                            }else if($scope.Historia || $scope.Oferta){
                                infowindow.open(map,markerr);
                            }
                            
                            

                           
                        };
                        var contentInfoWindow = "<div >" +"<img src='img/rota.png' id='botãorota' style='float:right;' title='Rota até o ponto turistico.' ng-click='buttonRota()' class='rotaImg'></img>"+
                            
                            "<span class='nm_ponto_iw' style='display:relative;' >" + markertitle + "</span>" + 
                            '<div>' +
                               "<div style='text-align:center'>" +
                                    
                                    
                                    /*"<button id='botãoquiz' class='btn' style='display:none' ng-click='buttonQuiz()'>Ofertas</button>" +*/
                                    
                                    "<div class='list'>"+
                                            "<a class='item  item_oferta item-text-wrap'  ng-model='Historia' ng-click='Historia = !Historia;centralizaIW()'>"+    
                                                "<b>História do Ponto Turistico</b>" + 
                                                    "<div ng-if='Historia'>"+
                                                        "<br>"+
                                                        "<p >"+markerDescricao+"</p>" + 
                                                        "<br>"+
                                                    "</div>"+

                                            "</a>"+
                                            "<a class='item  item_oferta' ng-click='Testette = !Testette;centralizaIW()' ng-model='Oferta' >"+    
                                                "<b>Ofertas</b>" + 
                                                    
                                            "</a>"+
                                            "<ion-spinner id='spinnerquiz' class='spinner-loading spinner-calm' ng-show='Testette' icon='lines'></ion-spinner>" +
                                            "<span id='errorquiz' style='display:none'>Sem ofertas no momento</span>" +
                                            "<a id=\"item_ofertas\" class=\"item  item_ofertas item-text-wrap ofertaStatus{{x.flag}} \"  ng-show=\"Testette\" ng-model=\"Oferta\" ng-repeat=\"x in ofertaJson | orderBy: 'flag' \" ng-click=\"Oferta = !Oferta;centralizaIW()\" >"+
                                                    
                                                "{{ x.nm_oferta }}" + 
                                                    "<div ng-if='Oferta'>"+
                                                        "<br>"+
                                                        "<p>Descrição: {{ x.ds_oferta }}</p>"+
                                                        "<br>"+ 
                                                        "<p ng-show='{{ x.flag }}' style='float:right'>Oferta já realizada.</p>"+
                                                        "<button class='button button-positive button-oferta' ng-hide='{{ x.flag }}' ng-click='buttonQuiz({{x.position}})'>"+
                                                            "Quiz"+
                                                        "</button>" +
                                                    "</div>"+
                                            "</a>"+
                                        
                                    "</div>"+
                                "</div>"+
                                
                            '</div>'+ 
                          '</div>' ;

                          var compiledContent = $compile(contentInfoWindow)($scope);
                        var marker  = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(latJson, lngJson),
                            title: markertitle,
                            icon: imagePonto,
                            store_id: marcadores[i].id_ponto_turistico
                        });
                        


                        marker.metadata = {type: "point", id: 1, lat: latJson, lng: lngJson};
                        markerArray.push(marker);
                        
                        google.maps.event.addListener(marker,'click', (function(marker,contentInfoWindow,infowindow){ 
                        
                        return function() {
                            markerr = marker;
                            
                                    $http({
                                        method: "post",
                                        url: "http://nice2meettcc.herokuapp.com/api/oferta",
                                        data: {
                                                lat : marker.metadata.lat,
                                                long : marker.metadata.lng,
                                                id_turista : window.localStorage.getItem("turista.id_turista")
                                        }
                                    }).success(function(success) {
                                                
                                        if(success) {
                                            
                                            oferta = success;
                                            lengthOferta = success.length;
                                            dadosOfertas = [];
                                            dadosOfertas;
                                            for (var i = 0; i < lengthOferta; i++) {
                                                for (var j = 0; j < success[i].length; j++) {
                                                    dadosOfertas.push(success[i][j]);
                                                };
                                            };
                                            for(var i=0; i< dadosOfertas.length;i++){
                                                dadosOfertas[i].position = i;
                                            }
                                            if (lengthOferta > 0){
                                                document.getElementById('spinnerquiz').style.display = 'none';
                                                $scope.ofertaJson = dadosOfertas; 
                                            };
                                            
                                            
                                        }else{
                                            console.log("erro");
                                            document.getElementById('spinnerquiz').style.display = 'none';
                                            document.getElementById('errorquiz').style.display = 'inline-block';
                                        }
                                    }).error(function(error){
                                        
                                        document.getElementById('spinnerquiz').style.display = 'none';
                                        document.getElementById('errorquiz').style.display = 'inline-block';
                                    });
                                    infowindow.setContent(contentInfoWindow);
                                    infowindow.open(map,marker);
                                    $scope.ofertaJson = '';
                                    $scope.Testette = 0;
                                    $scope.Historia = 0;
                                    document.getElementById('errorquiz').style.display = 'none';
                                    document.getElementById('spinnerquiz').style.display = 'inline-block';
                                    console.log($scope.map.getCenter());
                                    $scope.buttonRota = function(){
                                        infowindow.close();
                                        var from = positionCliente;
                                        to = new google.maps.LatLng(marker.metadata.lat, marker.metadata.lng);
                                        document.getElementById('nm-ponto').innerHTML = marker.title;
                                        drivingRoute(from, to);
                                    };
                                    positionPonto = new google.maps.LatLng(marker.metadata.lat, marker.metadata.lng);
                                    id_ponto_quiz = marker.store_id;
                                };
                        })(marker,compiledContent[0],infowindow));
                    }
                }else{
                }
            }).error(function(error){
            });
            $scope.clearRota = function(){
                to = '';
                document.getElementById('rota-box').style.display = "none";
                map.setZoom(17); 
                $scope.map.setCenter(positionCliente);
                drivingLine.setMap(null);
                countCenterRoute=1;
            };
            function onSuccess(position) {
                if(statusPopupMap == 1){
                    console.log('a')
                    setTimeout(confirmPopupMapError.close(),1000);
                    console.log('d')
                }

                //confirmPopupMapError.close();
                var lat = position.coords.latitude
                var long = position.coords.longitude
                latLng = new google.maps.LatLng(lat, long);
                positionCliente = latLng;
                var rad = function(x) {
                                return x * Math.PI / 180;
                            };
                if(positionClienteAntiga != 0){
                    var infoWindowOpenCheck = infowindow.getMap();
                    var rad = function(x) {
                        return x * Math.PI / 180;
                    };
                    var getDistance = function(p1, p2) {
                        var R = 6378137;
                        var dLat = rad(p2.lat() - p1.lat());
                        var dLong = rad(p2.lng() - p1.lng());
                        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                            Math.sin(dLong / 2) * Math.sin(dLong / 2);
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        var d = R * c;
                    return d; 
                    };
                    var distancia = getDistance(positionCliente, positionClienteAntiga);
                }
                
                
                
                if(secondsCenterFlag == 0 && ((distancia >= 50 && infoWindowOpenCheck == null && typeof infoWindowOpenCheck == "undefined") || positionClienteAntiga == 0) ){
                    $scope.map.setCenter(new google.maps.LatLng(lat, long));
                    positionClienteAntiga = positionCliente;
                }
                
                if(to != ''){
                    buttonRota = function(){
                        from = positionCliente;
                        drivingRoute(from, to);
                    };
                    buttonRota();
                }   
                if (marcadorCliente != null) {
                    marcadorCliente.setPosition(latLng);
                }
                circle.setCenter(latLng);
                $ionicLoading.hide();
            }
            
              function onError(error) {
                $ionicLoading.hide();
                var messageErrorMapa;
                if(error.code == 1){
                    messageErrorMapa = "Localização desabilitada, ative a localização para encontrarmos sua localização.";
                }
                if(error.code == 2){
                    messageErrorMapa = "Sem internet, ligue a internet e tente novamente";
                }
                if(error.code == 3){
                    messageErrorMapa = "Internet lenta, vá a um lugar onde a internet funcione melhor.";
                }
                statusPopupMap = 1;
                 confirmPopupMapError = $ionicPopup.confirm({
                    title: 'Tentar novamente?',
                    template: "<div class='centralizar'>" +
                    messageErrorMapa +
                    "</div>",
                    buttons: [{ text: 'Não', type: 'button-gradient' },
                              { text: 'Sim', type: 'button-gradient', onTap: function() { return true; }}]
                });
                confirmPopupMapError.then(function(res) {
                    if (res) {
                        $window.location.reload(true);
                    } else {
                                                        
                    }
                });
                navigator.geolocation.watchPosition(onSuccess, onError);
              }
              var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });

              var countFunctionCenter = setInterval(function() {
                if(secondsCenterFlag !== 0){
                    secondsCenterFlag--; 
                }

            }, 1000);

              google.maps.event.addListener(map,"drag",function(event){
                secondsCenterFlag = 10;
              })
              google.maps.event.addListener(map,"click",function(event){
                secondsCenterFlag = 10;
              })
        }, function(error) {
            $ionicLoading.hide();
            var messageErrorMapa;
            if(error.code == 1){
                messageErrorMapa = "Localização desabilitada, ative a localização para encontrarmos sua localização.";
            }
            if(error.code == 2){
                messageErrorMapa = "Sem internet, ligue a internet e tente novamente";
            }
            if(error.code == 3){
                messageErrorMapa = "Internet lenta, vá a um lugar onde a internet funcione melhor.";
            }
            statusPopupMap = 1;
             confirmPopupMapError = $ionicPopup.confirm({
                title: 'Tentar novamente?',
                template: "<div class='centralizar'>" +
                messageErrorMapa +
                "</div>",
                buttons: [{ text: 'Não', type: 'button-gradient' },
                          { text: 'Sim', type: 'button-gradient', onTap: function() { return true; }}]
            });
            confirmPopupMapError.then(function(res) {
                if (res) {
                    $window.location.reload(true);
                } else {
                                                        
                }
            });
        });});
    };
    
        
        drivingLine = new google.maps.Polyline({
          strokeColor: "#ff6820",
          strokeOpacity: .75,
          strokeWeight: 5,
          geodesic: true
        });
    var countCenterRoute = 1;
    function drivingRoute(from, to) {
    var request = {
      origin: from,
      destination: to,
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };
    directionsService.route(request, function(response, status){
      if(status == google.maps.DirectionsStatus.OK){
        var totalKM = (response.routes[0].legs[0].distance.value / 1000);
        if(totalKM>=1){
            totalKM = totalKM.toFixed(1);
            distanceText = totalKM+'km';
            document.getElementById('rota-box').style.display = "block";
            document.getElementById('distanceRota').innerHTML = distanceText;
        }else{
            distanceText = totalKM*1000+'m';
            document.getElementById('rota-box').style.display = "block";
            document.getElementById('distanceRota').innerHTML = distanceText;
        }
        var path = response.routes[0].overview_path;
        drivingLine.setPath(path);
        drivingLine.setMap($scope.map);
        if(countCenterRoute == 1){
           $scope.map.fitBounds(response.routes[0].bounds); 
           countCenterRoute = 0;
        }
        
      }
      else {
        console.log('error');
      }
    });
  }    
})