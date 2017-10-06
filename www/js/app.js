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
    
    $ionicConfigProvider.backButton.previousTitleText(false).text('Voltar');//Padroniza no IOS o botão voltar
$ionicConfigProvider.views.swipeBackEnabled(false);//desabilita o voltar arrastando o dedo no IOS
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
        controller: 'QuizCtrl'
    });
     if(window.localStorage.getItem("logado") == 1){
        $urlRouterProvider.otherwise('/home');
    }else{
         $urlRouterProvider.otherwise('/login');
    }
});