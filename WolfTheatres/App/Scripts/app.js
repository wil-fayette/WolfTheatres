var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute", "ui.bootstrap", "ngAnimate", "snap"]).config(function ($routeProvider) {
    $routeProvider.
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/main.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/movies', { controller: 'MoviesController', templateUrl: 'App/Views/movies.html' }).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.service('wolfMovieConverter', function () {
    this.convertIntoWolfMovie = function (movie) {
        debugger;

        var wolfMovie = {
            MovieId: movie.id,
            Name: movie.title,
            Description: movie.synopsis,
            RunTime: movie.runtime,
            Rating: movie.mpaa_rating,
            Year: movie.year,
            Cast: "",
            Poster: {
                ImageUrl: movie.posters.detailed,
                FileLocation: "",
                MovieId: movie.id
            }
        }

        for (var i = 0; i < movie.abridged_cast.length; i++) {
            if (i == (movie.abridged_cast.length - 1)){
                wolfMovie.Cast += movie.abridged_cast[i].name;
            }else {
                wolfMovie.Cast += movie.abridged_cast[i].name + ", ";
            }
        }

        return wolfMovie;
    }

    this.convertIntoWolfMovies = function (movies) {
        var wolfMovies = [];
        for (var i = 0; i < movies.length; i++) {
            wolfMovies.push(this.convertIntoWolfMovie(movies[i]));
        }

        return wolfMovies;
    }
});
WolfTheatresApp.service('rottenMovieService', function ($http, wolfMovieConverter) {
    var apiKey = 'pup7g2wafuxya22ryzfvyung';

    this.getBoxOfficeMovies = function (callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/box_office.json', {
            params: {
                apikey: apiKey,
                limit: 50,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            callback(wolfMovieConverter.convertIntoWolfMovies(data.movies));
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
            callback(wolfMovieConverter.convertIntoWolfMovies(data.movies));
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
            callback(wolfMovieConverter.convertIntoWolfMovies(data.movies));
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
            callback(wolfMovieConverter.convertIntoWolfMovies(data.movies));
        });
    }

});
WolfTheatresApp.factory('wolfMovieService', function ($http) {
    var wolfMovieService = {};
    wolfMovieService.getWolfMovies = function (callback) {
        $http.get('api/Movie/GetMovies').success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.saveWolfMovies = function (movies, callback) {
        $http.post('api/Movie/PostMovies', movies).success(function (data) {
            return data;
        });
    }

    wolfMovieService.deleteWolfMovie = function (movieId, callback) {
        $http.delete('api/Movie/DeleteMovie/' + movieId).success(function (data) {
            return data;
        });
    }
    
    return wolfMovieService;
});

WolfTheatresApp.controller('NavigationController', function ($scope, $location) {
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    }
}).controller('MoviesController', function ($scope, $http, $timeout, $rootScope, rottenMovieService, wolfMovieService, wolfMovieConverter) {
    var apiKey = 'pup7g2wafuxya22ryzfvyung';
    $scope.wolfMovies = [];
    $scope.rottenMovies = [];
    $scope.alerts = [];
    $scope.showMovieSearchDiv = true;
    $scope.showOurMoviesDiv = true;
    $scope.showMovieInformationDiv = true;
    
    function removeMovieById(id, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].MovieId === id) {
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
        }
    }

    function selectMovie(movie) {
        if ($scope.selectedMovie == movie) {
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

        movies = inTheatresMovies;
        rottenMovieService.getOpeningMovies(function (openingMovies) {
            $scope.rottenMovies = movies.concat(openingMovies);
        });
    });

    $scope.date = new Date();
    //TODO
    //call out to webapi and populate wolfMovies with movies in our database

    wolfMovieService.getWolfMovies(function (data) {
        $scope.wolfMovies = data;
    });


    function saveWolfMovies() {
        wolfMovieService.saveWolfMovies($scope.wolfMovies, function (data) {
            console.log(data);
        });
    }
    
    function deleteWolfMovie(movieId) {
        debugger;
        removeMovieById(movieId, $scope.wolfMovies);
        wolfMovieService.deleteWolfMovie(movieId, function (data) {
            console.log(data);
        });
    }

    $scope.deleteWolfMovie = deleteWolfMovie;

    $scope.saveWolfMovies = saveWolfMovies;

}).controller('ShowtimesController', function ($scope) {

});

