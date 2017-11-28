appN2M.controller('CupomCtrl',  function($scope, $http, $ionicLoading, $timeout, $state, $stateParams, $window) {
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