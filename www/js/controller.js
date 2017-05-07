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
    $scope.verificarCPF = function(cpf){
        cpf = cpf.replace(/[^\d]+/g,'');    
        if(cpf == '') return false; 
        // Elimina CPFs invalidos conhecidos    
        if (cpf.length != 11 || 
            cpf == "00000000000" || 
            cpf == "11111111111" || 
            cpf == "22222222222" || 
            cpf == "33333333333" || 
            cpf == "44444444444" || 
            cpf == "55555555555" || 
            cpf == "66666666666" || 
            cpf == "77777777777" || 
            cpf == "88888888888" || 
            cpf == "99999999999")
                return false;       
        // Valida 1o digito 
        add = 0;    
        for (i=0; i < 9; i ++)       
            add += parseInt(cpf.charAt(i)) * (10 - i);  
            rev = 11 - (add % 11);  
            if (rev == 10 || rev == 11)     
                rev = 0;    
            if (rev != parseInt(cpf.charAt(9)))     
                return false;       
        // Valida 2o digito 
        add = 0;    
        for (i = 0; i < 10; i ++)        
            add += parseInt(cpf.charAt(i)) * (11 - i);  
        rev = 11 - (add % 11);  
        if (rev == 10 || rev == 11) 
            rev = 0;    
        if (rev != parseInt(cpf.charAt(10))){
            $scope.errorCPF = "CPF inválido";
            return false;       
        }
        $scope.errorCPF = "";
        return true;
    }
    $scope.verificarSenha = function(senha, conSenha){
        console.log(senha);
        if(senha == conSenha){
            $scope.erro = "";
            return true;
        } else{
            $scope.erro = "As senhas não estão iguais";
            return false;
        }
    }
    $scope.cadastrarTurista = function(usuario) {
        if($scope.verificarCPF(usuario.cd_cpf) && $scope.verificarSenha(usuario.password, usuario.confirmaSenha)){
            console.log("ok");
        } else {
            console.log("not ok");
        }
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