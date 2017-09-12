var appN2M = angular.module('nice2meet')
    //

appN2M.controller('LoginCtrl', function($scope, $location, $http) {
    
    document.getElementById('idTabs').style.display='none';
    $scope.login = function(u) {
         if (u == undefined || u.login == undefined || u.senha == undefined) {
            document.getElementById('error').innerHTML = "Digite o login e senha.";
        } else {
            $http({
                method: "post",
                url: "http://nice2meettcc.herokuapp.com/api/auth/login",
                data: {
                        email : u.login,
                        password : u.senha
                }
            }).success(function(success) {
                if(success.success == 1) {
                    $scope.erro = "";
                    $location.url();
                    $location.path('/home');
                    document.getElementById('idTabs').style.display='block';
                }else{
                    document.getElementById('error').innerHTML = "Login ou senha invalidos.";
                }
            }).error(function(error){
                document.getElementById('error').innerHTML = "Digite o login e senha.";
            });
            


            }
    };

    $scope.cadastro = function(){
        $location.url();
        $location.url('/cadastro');
    }


    $http.get('json/pontos.json')
        .then(function(res) {
            marcadores = res.data.pontos;
            //alert($scope.marcadores.pontos[0].titulo);
            //alert(marcadores[0].lat);
        });

    $http.get("json/perguntas.json").then(function(response) {
        perguntasQuiz = response.data.perguntas;
        //alert(perguntasQuiz[0]);

    });
})

appN2M.controller('CadastroCtrl', function($scope, $http) {
    $scope.verificarSenha = function(senha, conSenha) {
        console.log(senha);
        if (senha == conSenha) {
            $scope.erro = "";
            return true;
        } else {
            $scope.erro = "As senhas não estão iguais";
            return false;
        }
    }
    $scope.cadastrarTurista = function(usuario) {

        $http({
            method: "post",
            url: "http://nice2meettcc.herokuapp.com/api/cadastroTurista",
            data: usuario
        }).then(function(retorno) {
            console.log(retorno);
        });
    }
})




var marcadores = {};
var markerArray = [];
var perguntasQuiz = {};


appN2M.controller('HomeCtrl', function($scope, $ionicLoading, $http, $location, $cordovaGeolocation, $ionicPopup, $ionicSideMenuDelegate, $ionicModal) {



  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createContact = function(u) {        
    $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
    $scope.modal.hide();
  };

  
          $scope.ListaDePontos = [
    { text: "Netuno", value: "nt" },
    { text: "Iemanja", value: "mj" },
    { text: "Forte Itaipu", value: "fi" },
    { text: "Palacio Das Artes", value: "pa" }
  ];
  

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
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {

            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            
            

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
            var rMin = 5;
            var rMax = 50;

            setInterval(function() {
                var radius = circle.getRadius();
                if ((radius > rMax) || (radius < rMin)) {
                    direction *= -1;
                }
                circle.setRadius(radius + direction * 0.2);
            }, 100);

            //CRIA O MARCADOR DA POSIÇÃO ATUAL DO USUÁRIO
            var imageCliente = 'img/marker2.png';
            marcadorCliente = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: map.center,
                icon: imageCliente
            });

            //PARA CÁLCULO DE DISTÂNCIA (TESTE SOMENTE)
            var rad = function(x) {
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
            };


            for (i = 0; i < 13; i++) {

                var latJson = marcadores[i].lat;
                var lngJson = marcadores[i].lng;

                //var latLngOrigem = new google.maps.LatLng(-24.020310, -46.478727);
                //var latLngDestino = new google.maps.LatLng(latJson, lngJson);

                var marker = new google.maps.Marker({
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(latJson, lngJson)
                });

                markerArray.push(marker);

                var infoWindow = new google.maps.InfoWindow({
                    content: "Marcador [" + (i + 1) + "]"
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infoWindow.open($scope.map, marker);
                });
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
                if (markerArray.length > 0) {

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

                }
            }

            // onError Callback receives a PositionError object
            //EM CASO DE ERRO DE GEOLOCALIZAÇÃO
            function onError(error) {
                /*alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');*/
            }



            // Options: throw an error if no update is received every 30 seconds.
            //AQUI ATIVA A VERIFICAÇÃO RECORRENTE DA GEOLOCALIZAÇÃO
            var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });


        }, function(error) {
            console.log("Não foi possível conseguir a Geolocalização.");
        });
    };


    //CENTRALIZA O MAPA
    $scope.centerOnMe = function() {
        console.log("Centralizando");
        if (!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
            console.log('Got pos', pos);
            $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            $ionicLoading.hide();
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

    //alert("LASO");
    //alert(perguntasQuiz[0]);
    //this.Quiz = null;
    //alert(this.Quiz[0].Pergunta);
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



appN2M.controller('PerfilCtrl', function($scope, $http) {

});

