appN2M.controller('LoginCtrl', function($scope,$state, $location, $window, $http,$ionicSlideBoxDelegate,$ionicHistory, $ionicLoading, $timeout, $ionicPlatform, $cordovaSplashscreen) {
    document.getElementById('idTabs').style.display='none';
    
    $scope.$on('$ionicView.enter', function(event, viewData) {
        $ionicHistory.clearCache();
    });
    $scope.login = function(u) {
        if (u == undefined || u.login == undefined || u.senha == undefined) {
            document.getElementById('error').innerHTML = "Digite o login e senha.";
        } else {
            document.getElementById("login__submit").classList.add("processing");
            document.getElementById("login__submit").classList.add("bg-gradient");
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
                        localforage.setItem('status', success.logado);
                        window.localStorage.setItem("stat", success.logado);
                        window.localStorage.setItem("turista.img", success.turista.img);
                        window.localStorage.setItem("turista.nm_turista", success.turista.nm_turista);
                        window.localStorage.setItem("turista.dt_nascimento", success.turista.dt_nascimento);
                        window.localStorage.setItem("turista.id_turista", success.turista.id_turista);
                        window.localStorage.setItem("turista.nm_email_turista", success.turista.nm_email_turista);
                        window.localStorage.setItem("turista.ic_tutorial", success.turista.ic_tutorial);
                      setTimeout(function() {
                        $ionicHistory.nextViewOptions({
                          disableAnimate: true
                        });
                        document.getElementById("login__submit").classList.remove("success");
                        document.getElementById("login__submit").classList.remove("processing");
                        //mudar o 0 pra 1 pra fazer o tutorial funcionar certo
                        if(success.turista.ic_tutorial == 1){
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