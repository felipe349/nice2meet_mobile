var appN2M = angular.module('nice2meet')
var id_ponto_quiz = 0;
var dadosOfertas = [];
var id_oferta_escolhida = 0;
var reloadHome = 0;
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
                      setTimeout(function() {
                        $ionicHistory.nextViewOptions({
                          disableAnimate: true
                        });
                        document.getElementById("login__submit").classList.remove("success");
                        document.getElementById("login__submit").classList.remove("processing");
                        //mudar o 0 pra 1 pra fazer o tutorial funcionar certo
                        if(success.turista.ic_tutorial == 0){
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
appN2M.controller('HomeCtrl', function($scope, $compile,$window, $rootScope, $ionicLoading, $timeout, $http, $location, $cordovaGeolocation, $ionicPopup, $ionicSideMenuDelegate, $ionicModal) {
    $scope.$on('$ionicView.enter', function(){
        if (reloadHome == 1) {
            reloadHome = 0;
            $window.location.reload();
        };
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
            var lengthOferta = 0;
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
                        
                        $scope.buttonQuiz = function(){
                                $location.url('/infoOferta');
                        };
                        var contentInfoWindow = '<div>' +
                            '<div>' + markertitle + '</div>' +
                            '<div>' +
                                "<ion-spinner id='spinnerquiz' class='spinner-loading spinner-calm' icon='lines'></ion-spinner>" +
                                "</br><button id='botãoquiz' class='' style='display:none' ng-click='buttonQuiz()'>Quiz</button>" +
                                "<p id='errorquiz' style='display:none'>Sem quiz no momento</p>" +
                            '</div>'+ 
                          '</div>' ;

                          var compiledContent = $compile(contentInfoWindow)($scope);
                        var marker  = new google.maps.Marker({
                            map: $scope.map,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(latJson, lngJson),
                            title: markertitle,
                            store_id: marcadores[i].id_ponto_turistico
                        });
                        marker.metadata = {type: "point", id: 1, lat: latJson, lng: lngJson};
                        markerArray.push(marker);
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
                                        document.getElementById('errorquiz').style.display = 'none';
                                                document.getElementById('spinnerquiz').style.display = 'block';
                                                document.getElementById('botãoquiz').style.display = 'none';
                                        if(success) {
                                            oferta = success;
                                            lengthOferta = success.length;
                                            if (lengthOferta > 0){
                                                document.getElementById('errorquiz').style.display = 'none';
                                                document.getElementById('spinnerquiz').style.display = 'none';
                                                document.getElementById('botãoquiz').style.display = 'block';
                                            }else{
                                                document.getElementById('botãoquiz').style.display = 'none';
                                                document.getElementById('spinnerquiz').style.display = 'none';
                                                document.getElementById('errorquiz').style.display = 'block';
                                            };
                                            for (var i = 0; i < success.length; i++) {
                                                dadosOfertas[i] = success[i];
                                            };
                                        }else{console.log("erro");}
                                    }).error(function(error){console.log("net");
                                    });
                                   infowindow.setContent(contentInfoWindow);
                                   infowindow.open(map,marker);
                                   id_ponto_quiz = marker.store_id;
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
            console.log("Erro de geolocalização");
            mapCreated();
            }
            var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 2000 });
        }, function(error) {
            console.log("Erro de conexão");
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

appN2M.controller('QuizCtrl', function($scope, $http, $ionicLoading, $ionicPopup, $location, $ionicModal) {
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
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
    idcountdown.textContent = "Tempo restante: " +  tempoRestante;
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
                        template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
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
                                                id_turista : window.localStorage.getItem("turista.id_turista")
                                        }
                                    }).success(function(success) {
                                        if(success) {
                                            console.log(success)
                                            $ionicLoading.hide();
                                                var confirmPopup = $ionicPopup.confirm({
                                                    title: 'Resposta correta',
                                                    template: "Cupom gerado com sucesso <br>" + 
                                                    "Codigo do cupom: " + success.cd_cupom,
                                                    buttons: [{ text: 'Cupons', type: 'button-positive' },
                                                              { text: 'Mapa', type: 'button-positive', onTap: function() { return true; }}]
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
                        var alertPopup = $ionicPopup.alert({
                            title: 'Errou'
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

appN2M.controller('CupomCtrl',  function($scope, $http, $ionicLoading, $timeout) {
    $ionicLoading.show({
        content: 'Loading',
        template: '<ion-spinner class="spinner-loading spinner-calm" icon="lines"></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    

// Update the count down every 1 second
    var listLengthCupom = 20;
    var cupons_lenght = 0;
    var testee = [];
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
            var c = 0;
            var stopCountdown = 0;
            var secondscount = 0;
            var x = setInterval(function() {
                horarioServidor.setSeconds(horarioServidor.getSeconds() + 1);
                for (var i = 0; i < listLengthCupom; i++) {                       
                    
                    var countDownDate = new Date(cupom_array[i].dt_final_cupom).getTime();
                    //var countDownDate2 = new Date((createDate).getDate() + 2);
                    // Get todays date and time
                    //var now = new Date().getTime();
                    
                    // Find the distance between now an the count down date
                    var distance = countDownDate - horarioServidor;
                    
                    // Time calculations for days, hours, minutes and seconds
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    
                    // Output the result in an element with id="demo"
                    if (hours > 0) {
                        testee[i] =  hours + "h "
                    + minutes + "m ";
                    }else{
                        testee[i] =   minutes + "m " + seconds + "s " ;
                    };
                    if (distance>=0) {
                        document.getElementById("demo-" + i).innerHTML = testee[i];
                    }else if (distance < 0) {
                        document.getElementById("demo-" + i).innerHTML = "EXPIRED";
                    };
                };
            }, 1000);
            
            $scope.$on('$ionicView.beforeLeave', function(){
              clearInterval(x);
            });
            $ionicLoading.hide();
        }else{
            console.log("erro");
            $ionicLoading.hide();
        }
    }).error(function(error){
        console.log("net");
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
  $scope.clearSearch = function() {
    $scope.searchh = '';
    console.log("t")
  };
})
appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory, $ionicPopup, $cacheFactory, $ionicPopover) {
    $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
    function logout(){
        document.getElementById('idTabs').style.display='none';
        $scope.popover.hide();
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
appN2M.controller('InfoOfertaCtrl',  function($scope,$state,$ionicPopup) {
    $scope.ofertaJson = dadosOfertas;
    
    function ofertaEscolhida($index){
        id_oferta_escolhida = dadosOfertas[$index].id_oferta;
        $state.go('quiz');
    };

    $scope.showConfirm = function($index) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Fazer o quiz para a oferta ' + dadosOfertas[$index].nm_oferta +'?',
            template: 'Após clicar no ok a chance será utilizada, conclua sua tentativa com sabedoria.'
        });
        confirmPopup.then(function(res) {
            if (res) {
                ofertaEscolhida($index);
            } else {
            }
        });
    };
    

})
appN2M.controller('TutorialCtrl',  function($scope,$state) {

})
appN2M.controller('AjudaCtrl',  function($scope,$state) {

})
appN2M.controller('SobreCtrl',  function($scope,$state) {

})
appN2M.controller('EditarPerfilCtrl',  function($scope,$state) {
    $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
    $scope.dt_nascimento_perfil = window.localStorage.getItem("turista.dt_nascimento");
})
appN2M.controller('TrocarSenhaCtrl',  function($scope,$state) {

})