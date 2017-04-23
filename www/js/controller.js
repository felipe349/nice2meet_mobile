angular.module('nice2meet')

.controller('loginCtrl',function($scope){
    $scope.login = function(){
        if($scope.usuario == undefined || $scope.senha == undefined ){
            $scope.erro = "Por favor, preencher login e senha";
        }
        else{
            $scope.erro = ""
        }
    }
})

.controller('CadastroCtrl', function($scope, $http){

    $scope.cadastrarTurista = function(usuario){   
        $http.get('http://projeto-nice2meet-barbaromatrix.c9users.io/api/teste', function(retorno){
            console.log(retorno);
        });

        $http({
            method : "POST",
            url : "http://projeto-nice2meet-barbaromatrix.c9users.io/api/cadastroTurista",
            data: usuario
        }).then(function(retorno){
            console.log(retorno);
        });
    }
})

