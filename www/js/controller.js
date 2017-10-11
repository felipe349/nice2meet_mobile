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


function abreLoading(){

}

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
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("navigator.geolocation works well");
    }
    var marcadorCliente = null;
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
            function onSuccess(position) {
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
            //EM CASO DE ERRO DE GEOLOCALIZAÇÃO
            function onError(error) {
                /*alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');*/
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
                //alert('Unable to get location: ' + error.message);
            });
        };
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
})
appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory, $ionicPopup) {
    function logout(){
        document.getElementById("logout_btn").classList.add("processing");
        document.getElementById('idTabs').style.display='none';
        $scope.hideHeaderOnLogout = true;
        window.localStorage.removeItem("logado");
        window.localStorage.removeItem("email");
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

