var appNice = angular.module('nice2meet', ['ionic', 'ngCordova', 'ngAnimate'])

appNice.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            if (ionic.Platform.isAndroid()) {
              StatusBar.backgroundColorByHexString("#608628");
            } else {
              StatusBar.styleLightContent();
            }
        }
    });
})
        
appNice.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $ionicConfigProvider.backButton.previousTitleText(false).text(false);
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.views.transition('platform');
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'        
    })
    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
    })
    .state('cadastro', {
        url: '/cadastro',
        templateUrl: 'templates/cadastro.html',
        controller: 'CadastroCtrl'
    })
    .state('cupom', {
        url: '/cupom',
        templateUrl: 'templates/cupom.html',
        controller: 'CupomCtrl'
    })
    .state('perfil', {
        url: '/perfil',
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
    })
    .state('quiz', {
        url: '/quiz',
        templateUrl: 'templates/quiz.html',
        cache:false,
        controller: 'QuizCtrl'
    })
    .state('tutorial', {
        url: '/tutorial',
        templateUrl: 'templates/tutorial.html',
        controller: 'TutorialCtrl'
    })
    .state('ajuda', {
        url: '/ajuda',
        templateUrl: 'templates/ajuda.html',
        controller: 'AjudaCtrl'
    })
    .state('sobre', {
        url: '/sobre',
        templateUrl: 'templates/sobre.html',
        controller: 'SobreCtrl'
    })
    .state('editarPerfil', {
        url: '/editarPerfil',
        templateUrl: 'templates/editarPerfil.html',
        controller: 'EditarPerfilCtrl'
    })
    .state('trocarSenha', {
        url: '/trocarSenha',
        templateUrl: 'templates/trocarSenha.html',
        controller: 'TrocarSenhaCtrl'
    })
    .state('infoWindow', {
        url: '/infoWindow',
        templateUrl: 'templates/infoWindow.html'
    });
    localforage.setDriver([
          localforage.INDEXEDDB,
          localforage.WEBSQL,
          localforage.LOCALSTORAGE
          ])
    if(window.localStorage.getItem("stat") == 1){
        if(window.localStorage.getItem("turista.ic_tutorial") == 0){
          $urlRouterProvider.otherwise('/tutorial');
        }else{
          $urlRouterProvider.otherwise('/home');
        }
    }else{
        $urlRouterProvider.otherwise('/login');
    }
});