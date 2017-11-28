appN2M.controller('QuizCtrl', function($scope, $http, $ionicLoading, $ionicPopup, $location, $ionicModal, $window) {
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