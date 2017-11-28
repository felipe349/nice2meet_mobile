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