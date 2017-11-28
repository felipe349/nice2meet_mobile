appN2M.controller('TrocarSenhaCtrl',  function($scope,$state, $http, $window) {

    $scope.editarTurista = function(usuarioEdit) {
        if(usuarioEdit.senha == usuarioEdit.new_senha){
            document.getElementById('error-box-senha').classList.remove("ng-hide");
            document.getElementById('senhasIguais').style.display = 'block';
        }else{
            $http({
            method: "post",
            url: "https://nice2meettcc.herokuapp.com/api/editarSenha",
            data: {
                    id_turista : window.localStorage.getItem("turista.id_turista"),
                    password: usuarioEdit.senha,
                    newPassword: usuarioEdit.new_senha
            }
        }).success(function(success) {
            if(success) {
                console.log(success + "a")
            }else{
                console.log("erro");
            }
        }).error(function(error){
            console.log("net");
        });
            console.log(usuarioEdit.senha);
        }
    }
})