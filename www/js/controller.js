var appN2M = angular.module('nice2meet')


appN2M.controller('LoginCtrl', function($scope,$state, $location, $http,$ionicSlideBoxDelegate,$ionicHistory, $ionicLoading, $timeout, $ionicPlatform, $cordovaSplashscreen) {
    document.getElementById('idTabs').style.display='none';
    $scope.login = function(u) {
        if (u == undefined || u.login == undefined || u.senha == undefined) {
            document.getElementById('error').innerHTML = "Digite o login e senha.";
        } else {
            document.getElementById("login__submit").classList.add("processing");
            $http({
                method: "post",
                url: "http://nice2meettcc.herokuapp.com/api/auth/login",
                data: {
                        email : u.login,
                        password : u.senha
                }
            }).success(function(success) {
                if(success.logado == 1) {
                        document.getElementById("login__submit").classList.add("success");
                        window.localStorage.setItem("logado", success.logado);
                        window.localStorage.setItem("email", u.login);
                      setTimeout(function() {
                        document.getElementById('idTabs').style.display='block';
                        $ionicHistory.nextViewOptions({
                          disableAnimate: true
                        });
                        document.getElementById("login__submit").classList.remove("success");
                        document.getElementById("login__submit").classList.remove("processing");
                        $state.go('home');
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
                template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
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
                  template: 'Realize o login com o email e a senha.'
                });
                alertPopup.then(function(res) {
                    $location.url('/login');
                });
            });
    }    
})




var marcadores = {};
var markerArray = [];
var perguntasQuiz = {};


appN2M.controller('HomeCtrl', function($scope, $compile, $rootScope, $ionicLoading, $timeout, $http, $location, $cordovaGeolocation, $ionicPopup, $ionicSideMenuDelegate, $ionicModal) {
      
    $http.get('json/pontos.json')
        .then(function(res) {
            marcadores = res.data.pontos;
        });
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });


  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createContact = function(u) {        
    $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
    $scope.modal.hide();
  };

  
    
  

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


        //$scope.map = map;
        //INICIA O MAPA
        var options = { timeout: 10000, enableHighAccuracy: true};
        $timeout(function () {
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

            //var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            //$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
            //COLOCA O MAPA EM EXECUÇÃO
            $scope.map = map;
            

            circle = new google.maps.Circle({
                strokeColor: '#3398ff',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#71b7ff',
                fillOpacity: 0.35,
                map: map,
                center: map.center,
                radius: 50
            });

            var direction = 1;
            var rMin = 35;
            var rMax = 50;

            setInterval(function() {
                var radius = circle.getRadius();
                if ((radius > rMax) || (radius < rMin)) {
                    direction *= -1;
                }
                circle.setRadius(radius + direction * 0.1);
            }, 10);

            //CRIA O MARCADOR DA POSIÇÃO ATUAL DO USUÁRIO
            var imageCliente = 'img/marker.png';
            marcadorCliente = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: map.center,
                icon: imageCliente
            });

            //PARA CÁLCULO DE DISTÂNCIA (TESTE SOMENTE)
            /*var rad = function(x) {
                return x * Math.PI / 180;
            };

            var getDistance = function(p1, p2) {
                var R = 6378137; // Earth’s mean radius in meter
                var dLat = rad(p2.lat() - p1.lat());
                var dLong = rad(p2.lng() - p1.lng());
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                return d; // returns the distance in meter
            };*/


            for (i = 0; i < marcadores.length; i++) {

                var latJson = marcadores[i].lat;
                var lngJson = marcadores[i].lng;
                var markertitle = marcadores[i].titulo;
                var contentInfoWindow = '<div>' +
                    '<div>' + marcadores[i].titulo + '</div>' +
                    '<div>' +
                      '</br><a ui-sref="quiz"><button>Quiz</button></a>' +
                    '</div>' +
                  '</div>';
                  var compiledContent = $compile(contentInfoWindow)($scope)


                //var latLngOrigem = new google.maps.LatLng(-24.020310, -46.478727);
                //var latLngDestino = new google.maps.LatLng(latJson, lngJson);

                var marker  = new google.maps.Marker({
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(latJson, lngJson),
                    title: markertitle
                });

                markerArray.push(marker);


                var infowindow = new google.maps.InfoWindow()

                google.maps.event.addListener(marker,'click', (function(marker,contentInfoWindow,infowindow){ 
                        return function() {
                           infowindow.setContent(contentInfoWindow);
                           infowindow.open(map,marker);
                        };
                    })(marker,compiledContent[0],infowindow)); 
            }

            //COLOCA OU NÃO OS MARCADORES DE ACORDO COM A DISTÂNCIA
            /*for (var i = 0; i < this.marcadoresArray.length; i++) {

                var distancia = getDistance(latLngOrigem, latLngDestino);
                var distanciaX = 20;

                if (distancia < distanciaX) {
                    alert("perto");
                    this.marcadoresArray[i].setMap(map);
                } else {
                    this.marcadoresArray[i].setMap(null);
                    this.marcadoresArray[i] = null;
                    alert("longe");
                }
            }*/



            //CASO NO SUCESSO DA GEOLOCALIZAÇÃO
            function onSuccess(position) {
                //alert("Watching");
                var lat = position.coords.latitude
                var long = position.coords.longitude
                $scope.map.setCenter(new google.maps.LatLng(lat, long));
                latLng = new google.maps.LatLng(lat, long);


                //POSIONA OU CRIA O MARCADOR DO USUÁRIO ONDE ELE ESTÁ
                if (marcadorCliente != null) {

                    marcadorCliente.setPosition(latLng);
                }

                //CRIA UM CÍRCULO PARA MOSTRAR O RAIO DE ALCANCE (20m)
                circle.setCenter(latLng);



                //CRIA MARCADORES OU....
                /*if (markerArray.length > 0) {

                    for (var i = 0; i < markerArray.length; i++) {

                        var latJson = marcadores[i].lat;
                        var lngJson = marcadores[i].lng;

                        var latLngOrigem = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        var latLngDestino = new google.maps.LatLng(latJson, lngJson);

                        var distancia = getDistance(latLngOrigem, latLngDestino);
                        var distanciaX = 50;


                        if (distancia < distanciaX) {
                            //alert("perto");
                            this.markerArray[i].setMap(map);
                        } else {
                            markerArray[i].setMap(null);
                            //markerArray[i] = null;
                            //alert("longe");n

                        }
                    }

                }*/$ionicLoading.hide();
            }

            // onError Callback receives a PositionError object
            //EM CASO DE ERRO DE GEOLOCALIZAÇÃO
            function onError(error) {
                /*alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');*/
            console.log("Não foi possível conseguir a Geolocalização.");
            }



            // Options: throw an error if no update is received every 30 seconds.
            //AQUI ATIVA A VERIFICAÇÃO RECORRENTE DA GEOLOCALIZAÇÃO
            var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });


        }, function(error) {
            console.log("Não foi possível conseguir a Geolocalização.");
        });});
    };


    //CENTRALIZA O MAPA
    
    
        $scope.centerOnMe = function() {
            console.log("Centralizando");
            if (!$scope.map) {
                return;
            }

            

            navigator.geolocation.getCurrentPosition(function(pos) {
                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                
            }, function(error) {
                //alert('Unable to get location: ' + error.message);
            });
        };
    





    //--------------------------MARCADOR-----------------------------------
    /*
    google.maps.event.addListenerOnce($scope.map, 'idle', function() {

        var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
        });

        var infoWindow = new google.maps.InfoWindow({
            content: "Here I am!"
        });

        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open($scope.map, marker);
        });

    });*/
    //--------------------------MARCADOR-----------------------------------

})



appN2M.controller('QuizCtrl', function($scope, $http) {
    
    $http.get("json/perguntas.json").then(function(response) {
        $scope.perguntasQuizJson = response.data.perguntas;
        //alert(perguntasQuiz[0]);

    });
})


appN2M.controller('CupomCtrl', function($scope, $http, $ionicPopup) {
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Deseja validar o cupom?',
            template: 'Deseja ganhar um sorvete?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                console.log('You are sure');
            } else {
                console.log('You are not sure');
            }
        });
    };
    $scope.noMoreItemsAvailable = false;

    $scope.loadMore = function() {
        $scope.items.push({ id: $scope.items.length });

        if ($scope.items.length == 99) {
            $scope.noMoreItemsAvailable = true;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.items = [];


})




appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory) {
    $scope.logout = function(){
        window.localStorage.setItem("logado", 0);
        window.localStorage.removeItem("email");
        document.getElementById('idTabs').style.display='none';
        document.getElementById("view-perfil").classList.add("clicked");
        document.getElementById("app__logout").classList.add("clicked");
        $ionicHistory.nextViewOptions({
             disableAnimate: true,
             disableBack: true
        });
    setTimeout(function() {
        $state.go('login');
      document.getElementById("app__logout").classList.remove("clicked");
    }, 800);
    };


})

