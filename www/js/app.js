// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var appNice = angular.module('nice2meet', ['ionic', 'ngCordova', 'ngAnimate'])

 
appNice.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
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


// AQUI SÃO CONFIGURADAS AS ROTAS
//===============================

appNice.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider) {


    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');

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


    $urlRouterProvider.otherwise('/login');
    
});
//====================================

