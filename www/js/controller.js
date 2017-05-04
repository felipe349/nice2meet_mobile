angular.module('nice2meet')

.controller('LoginCtrl', function($scope, $location) {
    $scope.login = function(u) {
        if ($scope.usuario == undefined || $scope.senha == undefined) {
            $scope.erro = "Por favor, preencher login e senha";
        } else {
            $http({
                method: "POST",
                url: "http://projeto-nice2meet-barbaromatrix.c9users.io/api/loginTurista",
                data: usuario
            }).success(function(sucess) {
                console.log(sucess);
            }).error(function(error){
                console.log(error);
            });
            
            $scope.erro = "";
            $location.url();
            $location.url('/home')
        }
    }
})

.controller('CadastroCtrl', function($scope, $http) {

    $scope.cadastrarTurista = function(usuario) {
        $http.get('http://projeto-nice2meet-barbaromatrix.c9users.io/api/teste', function(retorno) {
            console.log(retorno);
        });

        $http({
            method: "POST",
            url: "http://projeto-nice2meet-barbaromatrix.c9users.io/api/cadastroTurista",
            data: usuario
        }).then(function(retorno) {
            console.log(retorno);
        });
    }
})








.controller('HomeCtrl', function($scope, $ionicLoading, $http, $location) {

    $scope.mapCreated = function(map) {
        $scope.map = map;
    };

    $scope.centerOnMe = function() {
        console.log("Centering");
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
            $scope.loading.hide();
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });
    };

})


.controller('QuizCtrl', function($scope, $http) {

    $http.get("json/perguntas.json").then(function(response) {
        $scope.asPerguntas = response.data.perguntas;
    });

})


.controller('AjudaCtrl', function($scope, $http) {



})

.controller('CupomCtrl', function($scope, $http) {



});