appN2M.controller('PerfilCtrl',  function($scope,$state,$ionicHistory, $ionicPopup, $cacheFactory, $ionicPopover, $window) {
    $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
    $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
    var url_avatar;
    if( window.localStorage.getItem("turista.img") == "null"){
        window.localStorage.setItem("turista.img","img/avatar.png");
   }
   $scope.turista_img = window.localStorage.getItem("turista.img") ;
    

    $scope.$on('$ionicView.enter', function(){
        if(reScopePerfil == 1){
            $scope.nome_perfil = window.localStorage.getItem("turista.nm_turista");
            $scope.email_perfil = window.localStorage.getItem("turista.nm_email_turista");
            $scope.turista_img = window.localStorage.getItem("turista.img");
            reScopePerfil = 0;
        }
    });
    function logout(){
        document.getElementById('idTabs').style.display='none';
        $cacheFactory.get('$http').removeAll(); 
        localforage.clear();
        window.localStorage.clear();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
        });        
            reloadHome = 1;
            $state.go('login');
    };
    $scope.logoutPopup = function() {
        $scope.popover.hide();
        var confirmPopup = $ionicPopup.confirm({
            title: 'Deseja sair da conta?',
            buttons: [{ text: 'Cancelar', type: 'button-blue' },
                      { text: 'Sair', type: 'button-red', onTap: function() { return true; }}]
        });
        confirmPopup.then(function(res) {
            if (res) {
                logout();
            } else {
            }
        });
    };
    $ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
        animation: 'am-fade-and-scale'
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.hidePopover = function(){
        $scope.popover.hide();
    };
})