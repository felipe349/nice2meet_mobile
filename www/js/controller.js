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

