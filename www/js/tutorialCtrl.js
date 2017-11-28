appN2M.controller('TutorialCtrl',  function($scope, $state, $ionicSlideBoxDelegate, $http, $window) {
    document.getElementById('idTabs').style.display='none';
  $scope.startApp = function() {
    
    /*$http({
            method: "post",
            url: "https://nice2meettcc.herokuapp.com/api/setTutorial",
            data: {
                    id_turista : window.localStorage.getItem("turista.id_turista")
            }
        }).success(function(success) {
            
                window.localStorage.setItem("turista.ic_tutorial",1)*/
                document.getElementById('idTabs').style.display='block';
                $state.go('home');
            
        /*}).error(function(error){
            console.log("net");
        });*/
        
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
})