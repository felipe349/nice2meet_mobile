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
    $ionicConfigProvider.backButton.previousTitleText(false).text('Voltar');
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
        cache:false,
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
    .state('infoOferta', {
        url: '/infoOferta',
        templateUrl: 'templates/infoOferta.html',
        controller: 'InfoOfertaCtrl'
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
        cache:false,
        controller: 'EditarPerfilCtrl'
    })
    .state('trocarSenha', {
        url: '/trocarSenha',
        templateUrl: 'templates/trocarSenha.html',
        cache:false,
        controller: 'TrocarSenhaCtrl'
    });
      if(window.localStorage.getItem("stat") == 1){
        if(window.localStorage.getItem("turista.ic_tutorial") == 0){
          $urlRouterProvider.otherwise('/home');
        }else{
          $urlRouterProvider.otherwise('/home');
        }
      }else{
           $urlRouterProvider.otherwise('/login');
      }
});