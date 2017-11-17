var appN2M = angular.module('nice2meet')
var id_ponto_quiz = 0;
var dadosOfertas = [];
var id_oferta_escolhida = 0;
var reloadHome = 0;
var reScopePerfil = 0;
var retorno_api_quiz = 0;
appN2M.controller('LoginCtrl', function($scope,$state, $location, $http,$ionicSlideBoxDelegate,$ionicHistory, $ionicLoading, $timeout, $ionicPlatform, $cordovaSplashscreen) {
    document.getElementById('idTabs').style.display='none';
    $scope.$on('$ionicView.enter', function(event, viewData) {
        $ionicHistory.clearCache();
    });
    $scope.login = function(u) {
        if (u == undefined || u.login == undefined || u.senha == undefined) {
            document.getElementById('error').innerHTML = "Digite o login e senha.";
        } else {
            document.getElementById("login__submit").classList.add("processing");
            document.getElementById("login__submit").classList.add("bg-gradient");
            $http({
                method: "post",
                url: "http://nice2meettcc.herokuapp.com/api/auth/login",
                data: {
                        email : u.login,
                        password : u.senha
                }
            }).success(function(success,turista) {
                if(success.logado == 1) {
                        document.getElementById("login__submit").classList.add("success");
                        window.localStorage.setItem("stat", success.logado);
                        window.localStorage.setItem("turista.nm_turista", success.turista.nm_turista);
                        window.localStorage.setItem("turista.dt_nascimento", success.turista.dt_nascimento);
                        window.localStorage.setItem("turista.id_turista", success.turista.id_turista);
                        window.localStorage.setItem("turista.nm_email_turista", success.turista.nm_email_turista);
                        window.localStorage.setItem("turista.dt_registro", success.turista.dt_registro);
                        window.localStorage.setItem("turista.ic_tutorial", success.turista.ic_tutorial);
                      setTimeout(function() {
                        $ionicHistory.nextViewOptions({
                          disableAnimate: true
                        });
                        document.getElementById("login__submit").classList.remove("success");
                        document.getElementById("login__submit").classList.remove("processing");
                        //mudar o 0 pra 1 pra fazer o tutorial funcionar certo
                        if(success.turista.ic_tutorial == 1){
                            document.getElementById('idTabs').style.display='block';
                            $state.go('home');
                        }else{
                            $state.go('tutorial');
                        };
                      }, 400);
                }else{
                    document.getElementById('error').innerHTML = success.error;
                    document.getElementById("login__submit").classList.remove("processing");
                }
            }).error(function(error){
                document.getElementById('error').innerHTML = "Erro de conexão.";
                document.getElementById("login__submit").classList.remove("processing");
            });
        }
    };
    $scope.cadastro = function(){
        $location.url('/cadastro');
    }
})
appN2M.controller('CadastroCtrl', function($scope, $http, $ionicPopup, $location, $ionicLoading, $timeout) {
    $scope.cadastrarTurista = function(usuario) {

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
                url: "http://nice2meettcc.herokuapp.com/api/cadastroTurista",
                data: usuario
            }).then(function() {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                  title: 'Cadastro realizado!',
                  template: 'Realize o login com o email e a senha.',
                  buttons: [{ text: 'Ok', type: 'button-gradient' }]
                });
                alertPopup.then(function(res) {
                    $location.url('/login');
                });
            });
    }    
})
var marcadores = {};
var markerArray = [];
appN2M.controller('HomeCtrl', function($scope, $compile, $window, $ionicPopup, $rootScope, $ionicLoading, $timeout, $http, $location, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function(){
        if(reloadHome == 1){
            $window.location.reload(true);
        }
    });
    $scope.$on('$ionicView.enter', function(){
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
            var infowindow = new google.maps.InfoWindow({Height:50});
            $scope.$on('$ionicView.beforeLeave', function(){
              infowindow.close();
            });
            var positionCliente = '';
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
    "img/s.svg",
    null,
    null,
    /* Offset x axis 33% of overall size, Offset y axis 100% of overall size */
    new google.maps.Point(25, 50), 
    new google.maps.Size(50, 50)); 

            var imagePonto = new google.maps.MarkerImage(
    "img/v.svg",
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
                        
                        $scope.buttonQuiz = function(){
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
                            if(distancia < 200){
                                $location.url('/infoOferta'); 
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
                        $scope.closeInfoW = function(){
                            infowindow.close();
                        };
                        
                        var contentInfoWindow = '<div>' +
                            '<span style="text-align:center; font-size:20px;">' + markertitle + '</span>' + 
                            "<img src='img/rota.png' id='botãorota' style='float:right;' title='Rota até o ponto turistico.' ng-click='buttonRota()' class='rotaImg'></img>"+
                            '<div>' +
                                "<div style='text-align:center'>" +
                                    
                                    "<ion-spinner id='spinnerquiz' class='spinner-loading spinner-calm' icon='lines'></ion-spinner>" +
                                    "<button id='botãoquiz' class='btn' style='display:none' ng-click='buttonQuiz()'>Ofertas</button>" +
                                    "<span id='errorquiz' style='display:none'>Sem ofertas no momento</span>" +
                                "</div>"+
                                "<p>Lorem Ipsum é simplesmente uma simulação de texto da indústria tipográfica e de impressos, e vem sendo utilizado desde o século XVI, quando um impressor desconhecido pegou uma bandeja de tipos e os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum sobreviveu não só a cinco séculos, como também ao salto para a editoração eletrônica, permanecendo essencialmente inalterado. Se popularizou na década de 60, quando a Letraset lançou decalques contendo passagens de Lorem Ipsum, e mais recentemente quando passou a ser integrado a softwares de editoração eletrônica como Aldus PageMaker.</p>" +
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
                        var markerCluster = new MarkerClusterer(map, marker,
                            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
                        google.maps.event.addListener(marker,'click', (function(marker,contentInfoWindow,infowindow){ 
                        
                        return function() {

                                    $http({
                                        method: "post",
                                        url: "http://nice2meettcc.herokuapp.com/api/oferta",
                                        data: {
                                                lat : marker.metadata.lat,
                                                long : marker.metadata.lng
                                        }
                                    }).success(function(success) {
                                                
                                        if(success) {
                                            oferta = success;
                                            lengthOferta = success.length;
                                            dadosOfertas = [];
                                            if (lengthOferta > 0){
                                                document.getElementById('errorquiz').style.display = 'none';
                                                document.getElementById('spinnerquiz').style.display = 'none';
                                                document.getElementById('botãoquiz').style.display = 'inline-block';
                                            };
                                            
                                            for (var i = 0; i < lengthOferta; i++) {
                                                for (var j = 0; j < success[i].length; j++) {
                                                    dadosOfertas.push(success[i][j]);
                                                };
                                            };
                                        }else{
                                            console.log("erro");
                                            document.getElementById('botãoquiz').style.display = 'none';
                                            document.getElementById('spinnerquiz').style.display = 'none';
                                            document.getElementById('errorquiz').style.display = 'inline-block';
                                        }
                                    }).error(function(error){
                                        document.getElementById('botãoquiz').style.display = 'none';
                                        document.getElementById('spinnerquiz').style.display = 'none';
                                        document.getElementById('errorquiz').style.display = 'inline-block';
                                    });
                                    infowindow.setContent(contentInfoWindow);
                                    infowindow.open(map,marker);
                                    document.getElementById('errorquiz').style.display = 'none';
                                    document.getElementById('spinnerquiz').style.display = 'inline-block';
                                    document.getElementById('botãoquiz').style.display = 'none';
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
            };
            var countZoom = 0;
            function onSuccess(position) {
                var lat = position.coords.latitude
                var long = position.coords.longitude
                
                if(countZoom <1){
                    $scope.map.setCenter(new google.maps.LatLng(lat, long));
                }else if(countZoom == 5){
                    countZoom = 0;
                }
                countZoom++;
                latLng = new google.maps.LatLng(lat, long);
                positionCliente = latLng;
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
                console.log("Erro de geolocalização");
                console.log(error);
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
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Tentar novamente?',
                    template: "<div class='centralizar'>" +
                    messageErrorMapa +
                    "</div>",
                    buttons: [{ text: 'Não', type: 'button-gradient' },
                              { text: 'Sim', type: 'button-gradient', onTap: function() { return true; }}]
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        $window.location.reload(true);
                    } else {
                                                        
                    }
                });
                navigator.geolocation.watchPosition(onSuccess, onError);
              }
              var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });
        }, function(error) {
            console.log(error.code);
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
            var confirmPopup = $ionicPopup.confirm({
                title: 'Tentar novamente?',
                template: "<div class='centralizar'>" +
                messageErrorMapa +
                "</div>",
                buttons: [{ text: 'Não', type: 'button-gradient' },
                          { text: 'Sim', type: 'button-gradient', onTap: function() { return true; }}]
            });
            confirmPopup.then(function(res) {
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
        $scope.map.fitBounds(response.routes[0].bounds);
      }
      else {
        console.log('error');
      }
    });
  }    
})

appN2M.controller('QuizCtrl', function($scope, $http, $ionicLoading, $ionicPopup, $location, $ionicModal) {
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
var tempoRestante = 60;
var ifexitquiz=1;
var idcountdown = document.getElementById("idcountdown");
var countdown = function () {         
  if (tempoRestante>=0 && ifexitquiz == 1){
    if(tempoRestante == 5){
        idcountdown.style.color = 'red';
    };
    idcountdown.textContent =  tempoRestante;
    tempoRestante--;
    setTimeout(countdown, 1000);
  }else if(tempoRestante < 0){    
    var alertPopup = $ionicPopup.alert({
        title: 'Tempo Esgotado!',
        template: 'Espere o quiz ser liberado novamente ou visite outro ponto turistico :D'
    });
    alertPopup.then(function(res) {
        $location.url('/home');
    });

  }
}
$scope.$on('$ionicView.beforeLeave', function(){
  ifexitquiz=0;
});
    $http({
                method: "post",
                url: "http://nice2meettcc.herokuapp.com/api/quiz",
                data: {
                        id_ponto_turistico : id_ponto_quiz
                }
        }).success(function(data_quiz) {
                if(data_quiz) {
                    $scope.perguntasQuiz = data_quiz;
                    $ionicLoading.hide();
                    countdown();
                }else{
                    $ionicLoading.hide();
                }
                $scope.finalizaQuiz = function(choice){
                    $ionicLoading.show({
                        content: 'Loading',
                        template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                    if(choice == data_quiz[6]){
                        ifexitquiz=0;
                                    $http({
                                        method: "post",
                                        url: "https://nice2meettcc.herokuapp.com/api/cupom",
                                        data: {
                                                id_oferta : id_oferta_escolhida,
                                                id_turista : window.localStorage.getItem("turista.id_turista"),
                                                flag: retorno_api_quiz
                                        }
                                    }).success(function(success) {
                                        if(success) {
                                            $ionicLoading.hide();
                                                var confirmPopup = $ionicPopup.confirm({
                                                    title: 'Correto',
                                                    template: "<div class='centralizar'>" +
                                                    "<img src='img/trophy.gif' width='80%'></img><br>" +
                                                    "Codigo do cupom: " + success.cd_cupom +
                                                    "</div>",
                                                    buttons: [{ text: 'Cupons', type: 'button-gradient' },
                                                              { text: 'Mapa', type: 'button-gradient', onTap: function() { return true; }}]
                                                });
                                                confirmPopup.then(function(res) {
                                                    if (res) {
                                                        $location.url('/home');
                                                    } else {
                                                        $location.url('/cupom');
                                                    }
                                                });
                                        }else{console.log("erro");}
                                    }).error(function(error){console.log("net");
                                    });
                        
                        
                    }else{
                        ifexitquiz=0;
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                            title: 'Errado',
                            template: "<div class='centralizar'>" +
                                                    "<p>Não foi desta vez,tente novamente em outra oferta<p>"+
                                                    
                                                    "</div>",
                            buttons: [{ text: 'Ok', type: 'button-gradient' }]
                        });
                        alertPopup.then(function(res) {
                            $location.url('/home');
                        });
                    }
                };
        }).error(function(error){
            $ionicLoading.hide();
            });
})

appN2M.controller('CupomCtrl',  function($scope, $http, $ionicLoading, $timeout, $state, $stateParams) {
    $scope.$on('$ionicView.enter', function(){
        
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    var listLengthCupom = 20;
    var cupons_lenght = 0;
    var countVar = [];
    var cupom_array = [];
    var oferta_array = [];
    $http({
        method: "post",
        url: "https://nice2meettcc.herokuapp.com/api/getCupom",
        data: {
            id_turista : window.localStorage.getItem("turista.id_turista")
        }
    }).success(function(success) {
        if(success) {
            document.getElementById('error-cupom').classList.add("error-cupom-none");
            document.getElementById('error-cupom').classList.remove("error-cupom-block");
            cupom_array = success;
            oferta_array = cupom_array.pop();
            cupom_array = cupom_array[0];
            horarioServidor = cupom_array.pop();
            horarioServidor = new Date(horarioServidor.date);
            cupons_lenght = cupom_array.length ;
            for (var i = 0; i < cupons_lenght; i++) {
                cupom_array[i].nm_oferta = oferta_array[i].nm_oferta;
                cupom_array[i].ds_oferta = oferta_array[i].ds_oferta;
                cupom_array[i].count = i;
            };
            $scope.cupons = cupom_array; 
            if(success.length < listLengthCupom){
                listLengthCupom = cupons_lenght;
            }
            var secondscount = 0;
            var countFunction = setInterval(function() {
                horarioServidor.setSeconds(horarioServidor.getSeconds() + 1);
                for (var i = 0; i < listLengthCupom; i++) {
                    if(document.getElementById("count-" + i)){                       
                        var countDownDate = new Date(cupom_array[i].dt_final_cupom).getTime();
                        var distance = countDownDate - horarioServidor;
                        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                        if (hours > 0) {
                            countVar[i] =  hours + "h " + minutes + "m ";
                        }else{
                            countVar[i] =   minutes + "m " + seconds + "s " ;
                            document.getElementById("count-" + i).classList.remove("badge-balanced");
                            document.getElementById("count-" + i).classList.add("badge-assertive");
                        };
                        if (distance>=0) {
                            document.getElementById("count-" + i).innerHTML = countVar[i];
                        }else if (distance < 0) {
                            document.getElementById("count-" + i).innerHTML = "Vencido";
                        };
                    };
                };
            }, 1000);
            
            $scope.$on('$ionicView.beforeLeave', function(){
              clearInterval(countFunction);
            });
            $ionicLoading.hide();
        }else{
            document.getElementById('error-cupom').classList.remove("error-cupom-none");
            document.getElementById('error-cupom').classList.add("error-cupom-block");
            $ionicLoading.hide();
        }
    }).error(function(error){
        $scope.cupons = cupom_array; 
        document.getElementById('error-cupom').classList.remove("error-cupom-none");
            document.getElementById('error-cupom').classList.add("error-cupom-block");
        $ionicLoading.hide();
    });
    listLengthCupom = 20;
    $scope.listlength = listLengthCupom;
   $scope.loadMore = function(){
    if (!$scope.cupons_teste){
        if((listLengthCupom+10)<=cupons_lenght){
            listLengthCupom+=10;
        }else{
            listLengthCupom = cupons_lenght;
        }
        
        $scope.listlength=listLengthCupom;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }else{
    }
    }
    $scope.clearfunction=function(){
        $scope.search='';
    }
    });

})
appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory, $ionicPopup, $cacheFactory, $ionicPopover) {
    $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
    
    $scope.$on('$ionicView.enter', function(){
        if(reScopePerfil == 1){
            $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
            $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
            reScopePerfil = 0;
        }
    });
    function logout(){
        document.getElementById('idTabs').style.display='none';
        
        $cacheFactory.get('$http').removeAll(); 
        localStorage.clear();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
        });        
            reloadHome = 1;
            $state.go('login');
    };
    $scope.logoutPopup = function() {
        $scope.popover.hide();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Deseja sair da conta?',
            buttons: [{ text: 'Cancelar', type: 'button-blue' },
                      { text: 'Sair', type: 'button-red', onTap: function() { return true; }}]
        });
        confirmPopup.then(function(res) {
            if (res) {
                logout();
            } else {
            }
        });
    };
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
        animation: 'am-fade-and-scale'
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.hidePopover = function(){
        $scope.popover.hide();
    };
})
appN2M.controller('InfoOfertaCtrl',  function($scope,$state,$ionicPopup, $http, $ionicLoading) {
    $scope.ofertaJson = dadosOfertas;
    function ofertaEscolhida($index){
        id_oferta_escolhida = dadosOfertas[$index].id_oferta;
        $state.go('quiz');
    };

    $scope.showConfirm = function($index) {
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
                                                ofertaEscolhida($index);
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
    };
    

})
appN2M.controller('TutorialCtrl',  function($scope, $state, $ionicSlideBoxDelegate) {
    document.getElementById('idTabs').style.display='none';
  $scope.startApp = function() {
    $state.go('home');
    document.getElementById('idTabs').style.display='block';
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
})


appN2M.controller('AjudaCtrl',  function($scope,$state) {

})
appN2M.controller('SobreCtrl',  function($scope,$state) {

})
appN2M.controller('EditarPerfilCtrl',  function($scope,$state, $http, $ionicLoading) {
    $scope.$on('$ionicView.enter', function(){
    var editar = [];
    editar.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    editar.dt_nascimento_perfil = window.localStorage.getItem("turista.dt_nascimento");
    $scope.edit = editar;
    $scope.buttonsEdit = function(usuarioEdit) {
        if(usuarioEdit.nome_perfil !== window.localStorage.getItem("turista.nm_turista") || usuarioEdit.dt_nascimento_perfil !== window.localStorage.getItem("turista.dt_nascimento")){
            document.getElementById("buttonEditar").style.display = "block";
            document.getElementById("buttonEditar2").style.display = "block";
        }else{
            document.getElementById("buttonEditar").style.display = "none";
            document.getElementById("buttonEditar2").style.display = "none";
        }
    }
    $scope.editarTurista = function(usuarioEdit) {
        $ionicLoading.show({
                    content: 'Loading',
                    template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
        });
        var UsuarioNome = usuarioEdit.nome_perfil;
        var UsuarioNasc = usuarioEdit.dt_nascimento_perfil;
        if(UsuarioNome == window.localStorage.getItem("turista.nm_turista")){
            UsuarioNome = '';
        }
        if(UsuarioNasc == window.localStorage.getItem("turista.dt_nascimento")){
            UsuarioNasc = '';
        }
        $http({
            method: "post",
            url: "https://nice2meettcc.herokuapp.com/api/editarTurista",
            data: {
                    id_turista : window.localStorage.getItem("turista.id_turista"),
                    nome: UsuarioNome,
                    nascimento: UsuarioNasc
            }
        }).success(function(success) {
            if(success) {
                if(UsuarioNome !== ''){
                    window.localStorage.setItem("turista.nm_turista", UsuarioNome);
                }
                if(UsuarioNasc !== ''){
                    window.localStorage.setItem("turista.dt_nascimento",UsuarioNasc);
                }
                reScopePerfil = 1;
                $state.go('perfil');
                $ionicLoading.hide();
            }else{
                console.log("erro");
            }
        }).error(function(error){
            console.log("net");
        });
    }
    });
})
appN2M.controller('TrocarSenhaCtrl',  function($scope,$state) {
    $scope.editarTurista = function(usuarioEdit) {
        if(usuarioEdit.senha == usuarioEdit.new_senha){
            document.getElementById('error-box-senha').classList.remove("ng-hide");
            document.getElementById('senhasIguais').style.display = 'block';
        }else{
            console.log(usuarioEdit.senha);
            console.log(usuarioEdit.new_senha);
        }
    }
})