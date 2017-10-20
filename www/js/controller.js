var appN2M = angular.module('nice2meet')

var id_ponto_quiz = 0;

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
                        window.localStorage.setItem("status", success.logado);
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
        var options = { timeout: 10000, enableHighAccuracy: true};
        $timeout(function () {
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
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
            var imageCliente = 'img/marker.png';
            marcadorCliente = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: map.center,
                icon: imageCliente
            });
            var infowindow = new google.maps.InfoWindow()
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

        
                        var contentInfoWindow = '<form ng-submit= "pega_id_ponto()">'+'<div>' +
                            '<div>' + markertitle + '</div>' +
                            '<div>' +
                              "</br><button type='submit' >Quiz</button>" +
                              "<input type='hidden' id='input-get-id-ponto' name='id_ponto' value=" + marcadores[i].id_ponto_turistico + "></input>"+
                            '</div>'+ 
                          '</div>'+'</form>';
                          $scope.pega_id_ponto = function() {
                                id_ponto_quiz = document.getElementById('input-get-id-ponto').value;
                                $location.url('/quiz');
                            };
                          var compiledContent = $compile(contentInfoWindow)($scope);
                        var marker  = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(latJson, lngJson),
                            title: markertitle,
                            store_id: marcadores[i].id_ponto_turistico
                        });
                        markerArray.push(marker);
                        google.maps.event.addListener(marker,'click', (function(marker,contentInfoWindow,infowindow){ 
                        return function() {
                                   infowindow.setContent(contentInfoWindow);
                                   infowindow.open(map,marker);
                                };
                            })(marker,compiledContent[0],infowindow)); 
                    }
                }else{
                }
            }).error(function(error){
            });
            function onSuccess(position) {
                //alert("Watching");
                var lat = position.coords.latitude
                var long = position.coords.longitude
                $scope.map.setCenter(new google.maps.LatLng(lat, long));
                latLng = new google.maps.LatLng(lat, long);
                if (marcadorCliente != null) {
                    marcadorCliente.setPosition(latLng);
                }
                circle.setCenter(latLng);
                $ionicLoading.hide();
            }
            function onError(error) {
            console.log("Não foi possível conseguir a Geolocalização.");
            }
            var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });
        }, function(error) {
            console.log("Não foi possível conseguir a Geolocalização.");
        });});
    };
        $scope.centerOnMe = function() {
            console.log("Centralizando");
            if (!$scope.map) {
                return;
            }
            navigator.geolocation.getCurrentPosition(function(pos) {
                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            }, function(error) {
            });
        };
})

appN2M.controller('QuizCtrl', function($scope, $http, $ionicLoading, $ionicPopup, $location) {
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
var dataValidade = new Date();
var idcountdown = document.getElementById("idcountdown");
var tempo = dataValidade.setSeconds(dataValidade.getSeconds() + 61);
var countdown = function () {
  var dataAtual = new Date();
  var tempoRestante = new Date(tempo - dataAtual);         
  if (tempoRestante < 0){
    var alertPopup = $ionicPopup.alert({
        title: 'Tempo Esgotado!',
        template: 'Espere o quiz ser liberado novamente ou visite outro ponto turistico :D'
    });
    alertPopup.then(function(res) {
        $location.url('/home');
    });
  }else{    
    tempoRestante.setMinutes(tempoRestante.getMinutes() + tempoRestante.getTimezoneOffset())
    idcountdown.textContent = "Tempo restante: " +  tempoRestante.toTimeString().substring(0, 8) + ".";
    setTimeout(countdown);
  }
}
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
                    if(choice == data_quiz[6]){
                        var alertPopup = $ionicPopup.alert({
                          title: 'Acertô mizeravi'
                        });
                        alertPopup.then(function(res) {
                        });
                    }else{
                        var alertPopup = $ionicPopup.alert({
                          title: 'Errou'
                        });
                        alertPopup.then(function(res) {
                        });
                    }
                };
        }).error(function(error){
            $ionicLoading.hide();
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
})
appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory, $ionicPopup) {
    $scope.infoPerfil = window.localStorage.getItem("email");
    function logout(){
        document.getElementById("logout_btn").classList.add("processing");
        document.getElementById('idTabs').style.display='none';
        $scope.hideHeaderOnLogout = true;
        window.localStorage.removeItem("status");
        window.localStorage.removeItem("email");
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        setTimeout(function() {
            document.getElementById("logout_btn").classList.add("success");
        },300);
        setTimeout(function() {
            document.getElementById("logout_btn").classList.remove("success");
            document.getElementById("logout_btn").classList.remove("processing");
            $state.go('login');
            $scope.hideHeaderOnLogout = false;
        }, 700);
    };
    $scope.logoutPopup = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Deseja sair da conta?',
            buttons: [{ text: 'Cancelar' },
                      { text: 'Sair', type: 'button-assertive', onTap: function() { return true; }}]
        });
        confirmPopup.then(function(res) {
            if (res) {
                logout();
            } else {
            }
        });
    };
})

