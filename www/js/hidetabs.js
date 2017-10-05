angular.module('nice2meet')

.directive('hideTabs', function($rootScope, $ionicTabsDelegate) {
  return {
    restrict: 'A',
    link: function($scope, $el) {
      $scope.$on("$ionicView.beforeEnter", function () {
        $ionicTabsDelegate.showBar(false);
      });
    }
  };
})
.directive('showTabs', function($rootScope, $ionicTabsDelegate) {
  return {
    restrict: 'A',
    link: function($scope, $el) {
      $scope.$on("$ionicView.beforeEnter", function () {
        $ionicTabsDelegate.showBar(true);
      });
    }
  };
})