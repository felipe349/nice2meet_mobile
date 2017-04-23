angular.module('nice2meet')

.controller('loginCtrl',function($scope){
    $scope.login = function(){
        return $scope.usuario + $scope.senha;
    }
})