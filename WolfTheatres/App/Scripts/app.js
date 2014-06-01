var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute"]).config(function ($routeProvider) {
    $routeProvider.
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/home.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/showtimes', { controller: 'ShowtimesController', templateUrl: 'App/Views/showtimes.html' }).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.controller('NavigationController', function ($scope, $location) {
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    }
});

WolfTheatresApp.controller('HomeController', function ($scope) {
    $scope.message = 'cat';
});

WolfTheatresApp.controller('EmployeesController', function ($scope) {
    $scope.message = 'dog';
});

WolfTheatresApp.controller('ShowtimesController', function ($scope) {
    $scope.message = 'racoon';
});