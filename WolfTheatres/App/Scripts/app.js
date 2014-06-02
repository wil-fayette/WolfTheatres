var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute", "ui.bootstrap"]).config(function ($routeProvider) {
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
}).controller('HomeController', function ($scope) {
    $scope.message = 'cat';
}).controller('EmployeesController', function ($scope) {
    $scope.message = 'dog';
}).controller('MoviesController', function ($scope, $http){ 
    var apiKey = 'pup7g2wafuxya22ryzfvyung';
    $scope.wolfMovies = [];
    $scope.rottenMovies = [];
    
    function getBoxOfficeMovies(callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json', {
            params: {
                apikey: apiKey,
                limit: 50,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            callback(data);
        });
    }

    function getUpcomingMovies(callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/upcoming.json', {
            params: {
                apikey: apiKey,
                page_limit: 50,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            callback(data);
        });
    }

    function addMovie(movie) {
        var inArray = false;
        for (var i = 0; i < $scope.wolfMovies.length; i++) {
            if ($scope.wolfMovies[i] == movie) {
                inArray = true;
            }
        }

        if (inArray != true) {
            $scope.wolfMovies.push(movie);
        }
    }

    $scope.addMovie = addMovie;
    
    function refreshMovies() {
        getBoxOfficeMovies(function (boxOfficeMovies) {
            getUpcomingMovies(function (upcomingMovies) {
                var rottenMovies = upcomingMovies.movies.concat(boxOfficeMovies.movies)
                for (var i = 0; i < rottenMovies.length; i++) {
                    if (rottenMovies[i].posters.detailed == "http://images.rottentomatoescdn.com/images/redesign/poster_default.gif") {
                        rottenMovies.splice(i, 1);
                    }
                }
                $scope.rottenMovies = rottenMovies;
            });
        });
    }

    refreshMovies();

    



    //TODO
    //call out to webapi and populate wolfMovies with movies in our database


}).controller('ShowtimesController', function ($scope) {

});

