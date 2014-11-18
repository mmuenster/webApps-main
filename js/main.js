var mainApp=angular.module('mainApp', ['ngRoute', 'firebase']);

//Define Routing for app
mainApp.config(['$routeProvider', 
	function($routeProvider) {
		$routeProvider.
			when('/caseDataEditor', {
				templateUrl: 'templates/caseDataEditor.html',
				controller: 'caseDataEditorController'
			}).
			when('/dxCodeEditor', {
				templateUrl: 'templates/dxCodeEditor.html',
				controller: 'dxCodeEditorController'
			}).
			otherwise({
				redirectTo: '/main',
				templateUrl: 'templates/login.html'
			});
	}]);

mainApp.controller('navigationController', ['$scope', '$location', function ($scope, $location) {
    $scope.isCurrentPath = function (path) {
      return $location.path() == path;
    };
  }]);