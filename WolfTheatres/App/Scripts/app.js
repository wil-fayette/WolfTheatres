var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute", "ui.bootstrap", "ngAnimate", "snap"]).config(function ($routeProvider) {
    $routeProvider.
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/main.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/movies', { controller: 'MoviesController', templateUrl: 'App/Views/movies.html' }).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.config(function (snapRemoteProvider) {
    snapRemoteProvider.globalOptions.disable = 'right';
    snapRemoteProvider.globalOptions = {
        disable: 'right',
    }
});

WolfTheatresApp.service('rottenMovieService', function ($http) {
    var apiKey = 'pup7g2wafuxya22ryzfvyung';

    this.getBoxOfficeMovies = function (callback) {
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

    this.getUpcomingMovies = function (callback) {
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

    this.getInTheatresMovies = function (callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json', {
            params: {
                apikey: apiKey,
                page_limit: 50,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            callback(data);
        });
    }

    this.getOpeningMovies = function (callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json', {
            params: {
                apikey: apiKey,
                page_limit: 50,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            callback(data);
        });
    }

});
WolfTheatresApp.factory('wolfMovieService', function ($resource) {
    return $resource('api/Movie/:id', { id: '@id' }, { update: { method: 'PUT' } });
});

WolfTheatresApp.controller('NavigationController', function ($scope, $location) {
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    }
}).controller('MoviesController', function ($scope, $http, $timeout, $rootScope, rottenMovieService, wolfMovieService) {
    var apiKey = 'pup7g2wafuxya22ryzfvyung';
    $scope.wolfMovies = [];
    $scope.rottenMovies = [];
    $scope.alerts = [];
    $scope.showMovieSearchDiv = true;
    $scope.showOurMoviesDiv = true;
    $scope.showMovieInformationDiv = true;
    
    function removeMovieById(id, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                array.splice(i, 1);
            }
        }
    }

    function addMovie(movie) {
        var inArray = false;

        for (var i = 0; i < $scope.wolfMovies.length; i++) {
            if ($scope.wolfMovies[i] == movie) {
                inArray = true;
            }
        }

        var indexOfMovie = $scope.rottenMovies.indexOf(movie);
        if (indexOfMovie != -1) {
            $scope.rottenMovies.splice(indexOfMovie, 1);
        }

        if (inArray != true) {
            $scope.wolfMovies.push(movie);
        } else {
            var alert = { message: 'That movie has already been added.' };

            if ($scope.alerts.length == 1) {
                for (var i = 0; i < $scope.alerts.length; i++) {
                    $scope.closeAlert($scope.alerts[i]);
                }
                $scope.alerts = [];
            }

            $scope.alerts.push(alert);
            $timeout(function () {
                $scope.closeAlert($scope.alerts.indexOf(alert));
            }, 1000);
        }
    }

    function selectMovie(movie) {
        debugger;
        if ($scope.selectedMovie == movie) {
            removeMovieById(movie.id, $scope.wolfMovies);
            $scope.wolfMovies.push(movie);
            $scope.selectedMovie = null;
        } else {
            $scope.selectedMovie = movie;
        }
    }

    $scope.selectMovie = selectMovie;

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.addMovie = addMovie;
    
    rottenMovieService.getInTheatresMovies(function (inTheatresMovies) {
        var movies = [];
        movies = inTheatresMovies.movies;
        rottenMovieService.getOpeningMovies(function (openingMovies) {
            $scope.rottenMovies = movies.concat(openingMovies.movies);
        });
    });

    $scope.date = new Date();

    $scope.wolf = wolfMovieService.query();

    console.log($scope.wolf);
    //TODO
    //call out to webapi and populate wolfMovies with movies in our database


}).controller('ShowtimesController', function ($scope) {

});

