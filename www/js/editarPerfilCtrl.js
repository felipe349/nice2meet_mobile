appN2M.controller('EditarPerfilCtrl',  function($scope,$state, $http, $ionicLoading, $window) {
    
    $scope.$on('$ionicView.enter', function(){
    var editar = [];
    editar.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    editar.dt_nascimento_perfil = window.localStorage.getItem("turista.dt_nascimento");
    $scope.edit = editar;
    var buttonsEditImg= function(){
        var file=document.getElementById('file').files[0];
        if(!angular.isUndefined(file)){
            document.getElementById("buttonEditar").style.display = "block";
            document.getElementById("buttonEditar2").style.display = "block";
        }
    }
    $scope.buttonsEdit = function(usuarioEdit) {

        if(usuarioEdit.nome_perfil !== window.localStorage.getItem("turista.nm_turista") || usuarioEdit.dt_nascimento_perfil !== window.localStorage.getItem("turista.dt_nascimento")){
            document.getElementById("buttonEditar").style.display = "block";
            document.getElementById("buttonEditar2").style.display = "block";
        }else{
            if(!document.getElementById('file').files[0]){
                document.getElementById("buttonEditar").style.display = "none";
                document.getElementById("buttonEditar2").style.display = "none";
            }
        }
    }
    $scope.editarTurista = function(usuarioEdit) {
        $ionicLoading.show({
                    content: 'Loading',
                    template: '<ion-spinner class="spinner-loading spinner-royal" icon="lines"></ion-spinner>',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
        });

        var file=document.getElementById('file').files[0];
        var UsuarioNome = usuarioEdit.nome_perfil;
        var UsuarioNasc = usuarioEdit.dt_nascimento_perfil;
        if(UsuarioNome == window.localStorage.getItem("turista.nm_turista")){
            UsuarioNome = '';
        }
        if(UsuarioNasc == window.localStorage.getItem("turista.dt_nascimento")){
            UsuarioNasc = '';
        }
        if(!angular.isUndefined(file)){
          var reader = new FileReader();
          reader.onloadend = function() {
            
            file=reader.result;
            $http({
                method: "post",
                url: "https://api.cloudinary.com/v1_1/nice2meet/image/upload",
                data: {
                        file:file,
                        api_key : "655974539346927",
                        upload_preset: "urgrqt2c"
                        //public_id: "turista" + window.localStorage.getItem("turista.id_turista")
                }
            }).success(function(success) {
                if(success) {
                    console.log(success)
                    var linkImage = success.url;
                    $http({
                        method: "post",
                        url: "https://nice2meettcc.herokuapp.com/api/editarTurista",
                        data: {
                                id_turista : window.localStorage.getItem("turista.id_turista"),
                                nome: UsuarioNome,
                                nascimento: UsuarioNasc,
                                img: linkImage
                        }
                    }).success(function(success) {
                        if(success) {

                            if(UsuarioNome !== ''){
                                window.localStorage.setItem("turista.nm_turista", UsuarioNome);
                            }
                            if(UsuarioNasc !== ''){
                                window.localStorage.setItem("turista.dt_nascimento",UsuarioNasc);
                            }
                            if(linkImage !== ''){
                                window.localStorage.setItem("turista.img",linkImage);
                            }
                            reScopePerfil = 1;
                            $state.go('perfil');
                            $ionicLoading.hide();
                        }else{
                            console.log("erro");
                        }
                    }).error(function(error){
                        console.log("net");
                    });
                }else{
                    console.log("erro");
                }
            }).error(function(error){
                console.log("net");
            });
          }
          reader.readAsDataURL(file);
         
        }else{
            $http({
                        method: "post",
                        url: "https://nice2meettcc.herokuapp.com/api/editarTurista",
                        data: {
                                id_turista : window.localStorage.getItem("turista.id_turista"),
                                nome: UsuarioNome,
                                nascimento: UsuarioNasc,
                                img: ''
                        }
                    }).success(function(success) {
                        if(success) {
                            if(UsuarioNome !== ''){
                                window.localStorage.setItem("turista.nm_turista", UsuarioNome);
                            }
                            if(UsuarioNasc !== ''){
                                window.localStorage.setItem("turista.dt_nascimento",UsuarioNasc);
                            }
                            reScopePerfil = 1;
                            $ionicLoading.hide();
                        }else{
                            $state.go('perfil');
                            console.log("erro");
                        }
                    }).error(function(error){
                        console.log("net");
                    });
        };

        
        
    }
    });
})