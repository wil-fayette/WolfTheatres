var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute", "ui.bootstrap", "ngAnimate", "snap"]).config(function ($routeProvider) {
    $routeProvider.
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/main.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/movies', { controller: 'MoviesController', templateUrl: 'App/Views/movies.html' }).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.directive('fileStyle', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            debugger;
            $(element).addClass('fileStyle');
            $(element).filestyle({ buttonText: "Add Poster" });
        }
    };
});

WolfTheatresApp.service('wolfMovieConverter', function () {
    this.convertIntoWolfMovie = function (movie) {
        

        if (movie.alternate_ids) {
            imdbId = movie.alternate_ids.imdb;
        }
     
        var wolfMovie = {
            MovieId: movie.id,
            Name: movie.title,
            Description: movie.synopsis,
            RunTime: movie.runtime,
            Rating: movie.mpaa_rating,
            Year: movie.year,
            Cast: "",
            ImdbId: imdbId,
            Posters: [{
                Display: 1,
                ImageUrl: movie.posters.detailed,
                FileLocation: "",
                MovieId: movie.id
            }],
            Trailers: [{
                Display: 0,
                TrailerUrl: "",
                MovieId: movie.id
            }]
        }
        debugger;

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
    var apiKey = '2n73mdr22zfk7exg5gysaccj';

    this.searchForMovie = function(search, callback) {
        $http.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies.json', {
            params: {
                q: search,
                apikey: apiKey,
                page_limit: 10,
                page: 1,
                callback: 'JSON_CALLBACK'
            }
        }).success(function (data) {
            debugger;
            callback(wolfMovieConverter.convertIntoWolfMovies(data.movies));
        });
    }

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
            callback(data);
        });
    }

    wolfMovieService.saveWolfMovie = function (movie, callback) {
        $http.post('api/Movie/PostMovie', movie).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteWolfMovie = function (movieId, callback) {
        $http.delete('api/Movie/DeleteMovie/' + movieId).success(function (data) {
            return data;
        });
    }

    wolfMovieService.saveMoviePosters = function (posters, callback) {
        $http.post('api/Movie/SaveMoviePosters', posters).success(function (data) {
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
            if ($scope.wolfMovies[i].MovieId == movie.MovieId) {
                inArray = true;
            }
        }

        if (!inArray) {
            debugger;
            var indexOfMovie = $scope.rottenMovies.indexOf(movie);
            if (indexOfMovie != -1) {
                $scope.rottenMovies.splice(indexOfMovie, 1);
            }

            wolfMovieService.saveWolfMovie(movie, function (returnedMovie) {
                $scope.wolfMovies.push(returnedMovie);
                $scope.$apply();
            });
        }
    }

    function updateMovie(movie) {
        wolfMovieService.saveWolfMovie(movie, function (returnedMovie) {
            $scope.selectedMovie = returnedMovie;
            $scope.$apply();
        });
    }

    $scope.updateMovie = updateMovie;

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
    
    $scope.date = new Date();

    wolfMovieService.getWolfMovies(function (data) {
        $scope.wolfMovies = data;
    });

    function saveWolfMovies() {
        wolfMovieService.saveWolfMovies($scope.wolfMovies, function (data) {
            if (data == 1) {
                wolfMovieService.getWolfMovies(function (data) {
                    $scope.wolfMovies = data;
                });
            }
        });
    }

    function searchForMovie(search) {
        rottenMovieService.searchForMovie(search, function (data) {
            $scope.rottenMovies = data;
            $($("#rottenMovieSearch")).val("");
        });
    }
    

    $scope.searchForMovie = searchForMovie;

    function deleteWolfMovie(movieId) {
        removeMovieById(movieId, $scope.wolfMovies);
        wolfMovieService.deleteWolfMovie(movieId, function (data) {
            console.log(data);
            $scope.$apply();
        });
    }

    function uploadPoster(poster, movie) {
        debugger;

        if ($('#' + poster).get(0) != null) {
            var files = $('#' + poster).get(0).files;

            if (files.length > 0) {
                if (window.FormData !== undefined) {
                    var data = new FormData();
                    for (i = 0; i < files.length; i++) {
                        data.append("file" + i, files[i]);
                    }

                    data.append("movieId", movie.MovieId);

                    $.ajax({
                        type: "POST",
                        url: "/api/Poster/Post",
                        contentType: false,
                        processData: false,
                        data: data,
                        success: function (results) {
                            for (var i = 0; i < results.length; i++) {
                                $scope.selectedMovie.Posters.push(results[i]);
                                $scope.$apply();
                            }
                        }
                    });
                } else {
                    alert("This browser doesn't support HTML5 multiple file uploads!");
                }
            }
        }
    }

    $scope.deleteWolfMovie = deleteWolfMovie;
    $scope.saveWolfMovies = saveWolfMovies;
    $scope.uploadPoster = uploadPoster;

    rottenMovieService.getUpcomingMovies(function (movies) {
        $scope.rottenMovies = movies;
    });

}).controller('ShowtimesController', function ($scope) {

});

