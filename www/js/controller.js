angular.module('nice2meet')

.controller('loginCtrl', function($scope, $location) {
    $scope.login = function() {
        if ($scope.usuario == undefined || $scope.senha == undefined) {
            $scope.erro = "Por favor, preencher login e senha";
        } else {
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







.controller('MapCtrl', function($scope, $ionicLoading) {
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
});