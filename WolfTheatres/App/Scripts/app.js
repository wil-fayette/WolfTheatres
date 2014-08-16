﻿var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngRoute", "ui.bootstrap", "ngAnimate", "snap", "ngSanitize", "ngTable", "angularUtils.directives.dirPagination"]).config(function ($routeProvider) {
    $routeProvider.
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/main.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/movies/info', { controller: 'MovieInformationController', templateUrl: 'App/Views/movieInfo.html' }).
        when('/movies/schedule', { controller: 'MovieScheduleController', templateUrl: 'App/Views/movieSchedule.html' }).
        when('/movies/main', { templateUrl: 'App/Views/moviesMain.html' }).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.directive('fileStyle', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            debugger;
            $(element).addClass('fileStyle');
            $(element).filestyle({ buttonText: "Select Image", input: false });
        }
    };
});


WolfTheatresApp.factory('movieDatabaseService', function ($http) {
    var movieDatabaseService = {};

    movieDatabaseService.search = function (query, callback) {
        $http.get('api/TheMovieDatabase/Search?query=' +  query).success(function (data) {
            callback(data);
        });
    }

    movieDatabaseService.getDetails = function (movieId, callback) {
        $http.get('api/theMovieDatabase/GetMovieDetails?movieId=' + movieId).success(function (data) {
            callback(data);
        });
    }

    movieDatabaseService.getUpcomingMovies = function (callback) {
        $http.get('api/theMovieDatabase/GetUpcomingMovies').success(function (data) {
            callback(data);
        });
    }

    return movieDatabaseService;
});

WolfTheatresApp.factory('wolfMovieService', function ($http) {
    var wolfMovieService = {};
    wolfMovieService.getWolfMovies = function (callback) {
        $http.get('api/Movie/GetMovies').success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.getMovieShowtimes = function (callback) {
        $http.get('api/Movie/GetMovieShowtimes').success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.addNewMovie = function (movieDbId, callback) {
        debugger;
        $http.post('api/Movie/AddNewMovie?movieDbId=' +  movieDbId).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteMovie = function (movieId, callback) {
        $http.delete('api/Movie/DeleteMovie?movieId=' + movieId).success(function (data) {
            return data;
        });
    }

    wolfMovieService.updateMovie = function (movie, callback) {
        debugger;
        $http.post('api/Movie/UpdateMovie/', movie).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.addMovieTrailer = function (trailer, callback) {
        $http.post('api/Movie/AddMovieTrailer/', trailer).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteMoviePoster = function (posterId, callback) {
        $http.delete('api/Movie/DeleteMoviePoster/?posterId=' + posterId).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteMovieTrailer = function (trailerId, callback) {
        $http.delete('api/Movie/DeleteMovieTrailer?trailerId=' + trailerId).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteMovieShowtime = function (showtimeId, callback) {
        $http.delete('api/Movie/DeleteMovieTrailer?trailerId=' + trailerId).success(function (data) {
            callback(data);
        });
    }

    return wolfMovieService;
});

WolfTheatresApp.controller('NavigationController', function ($scope, $location) {
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    }
}).controller('MovieInformationController', function ($scope, $filter, $http, $timeout, $rootScope, wolfMovieService, $sce, $modal, movieDatabaseService, ngTableParams) {
    var apiKey = 'pup7g2wafuxya22ryzfvyung';
    $scope.wolfMovies = [];
    $scope.searchResults = [];
    $scope.alerts = [];
    $scope.showMovieSearchDiv = true;
    $scope.showOurMoviesDiv = true;
    $scope.showMovieInformationDiv = true;
    $scope.movieTrailerUrl = "";
    $scope.selectedTrailer = true;
    $scope.selectedPoster = true;

    function removeMovieById(id, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].MovieId === id) {
                array.splice(i, 1);
            }
        }
    }

    function addNewMovie(movie) {
        var inArray = false;

        for (var i = 0; i < $scope.wolfMovies.length; i++) {
            if ($scope.wolfMovies[i].MovieDbId == movie.MovieDbId) {
                inArray = true;
            }
        }

        if (!inArray) {
            debugger;
            var indexOfMovie = $scope.searchResults.indexOf(movie);
            if (indexOfMovie != -1) {
                $scope.searchResults.splice(indexOfMovie, 1);
            }

            wolfMovieService.addNewMovie(movie.MovieDbId, function (returnedMovie) {
                $scope.wolfMovies.push(returnedMovie);
            });
        }
    }

    function selectMovie(movie) {
        console.log(movie);
        if ($scope.selectedMovie == movie) {
            $scope.selectedMovie = null;
        } else {
            $scope.selectedMovie = movie;
        }
    }

    $scope.selectMovie = selectMovie;
    $scope.addNewMovie = addNewMovie;

    $scope.date = new Date();

    wolfMovieService.getWolfMovies(function (data) {
        $scope.wolfMovies = data;
    });

    function deleteMovie(movieId) {
        removeMovieById(movieId, $scope.wolfMovies);
        wolfMovieService.deleteMovie(movieId, function (data) {
        });
    }

    $scope.editMovie = function (movie) {
        var modalInstance = $modal.open({
            templateUrl: 'editMovieModal.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            resolve: {
                object: function () {
                    return movie;
                }
            }
        });
    }

    movieDatabaseService.getUpcomingMovies(function (movies) {
        //$scope.searchResults = movies;
        $scope.searchResults = [];
    });

    $scope.movieDatabaseSearch = function movieDatabaseSearch(query) {
        movieDatabaseService.search(query, function (movies) {
            $scope.searchResults = movies;
        });
    }
    $scope.deleteMovie = deleteMovie;
}).controller('ShowtimesController', function ($scope) {

}).controller('MovieScheduleController', function ($scope, $filter, $http, $timeout, $rootScope, wolfMovieService, $sce, $modal, movieDatabaseService) {
    $scope.wolfMovies = [];
    $scope.showOurMoviesDiv = true;
    $scope.showCalendarDiv = true;
    $scope.dt = new Date();
    $scope.moviesPlayingOnSelectedDate = [];
    $scope.dates = [];
    
    function addDates(movies, dates) {
        for (var i = 0; i < movies.length; i++) {
            addDate(movies[i], dates);
        }
    }

    function addDate(movie, dates) {
        for (var j = 0; j < movie.MovieShowtimes.length; j++) {
            if ($.inArray(movie.MovieShowtimes[j].ScheduleDate, dates) == -1) {
                dates.push(movie.MovieShowtimes[j].ScheduleDate);
            }
        }
    }

    $scope.filterByDate = function (date) {
        return function (movieShowtime) {

            var showtimeDate = movieShowtime.ScheduleDate;

            if (showtimeDate.length == 19) {
                var year = movieShowtime.ScheduleDate.substring(0, 4);
                var month = movieShowtime.ScheduleDate.substring(5, 7);
                var day = movieShowtime.ScheduleDate.substring(8, 10);

                var dateString = month + "-" + day + "-" + year;
                showtimeDate = new Date(dateString);

                showtimeDate.setHours(0, 0, 0, 0);
            }

            date.setHours(0, 0, 0, 0);

            return showtimeDate.getTime() == date.getTime();
        }
    };
    
    $scope.addMovieToSelectedDate = function (movie) {
        debugger;
        movie.MovieShowtimes.push({ MovieId: movie.MovieId, MovieShowtimeId: "", ScheduleDate: $scope.dt, Showtimes: "" });
        addDate(movie, $scope.dates);
    }

    wolfMovieService.getWolfMovies(function (data) {
        debugger;
        $scope.wolfMovies = data;
        addDates($scope.wolfMovies, $scope.dates);

    });

});



var ModalInstanceCtrl = function ($scope, wolfMovieService, $modalInstance, object, $sce) {
    $scope.movieTrailerUrl = "";


    $scope.uploadPoster = function uploadPoster(poster, movie) {
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
                                $scope.object.Posters.push(results[i]);

                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }
                        }
                    });
                } else {
                    alert("This browser doesn't support HTML5 multiple file uploads!");
                }
            }
        }
    }

    $scope.addTrailer = function (movie, trailerUrl) {
        var trailer = {
            Display: true,
            MovieId: movie.MovieId,
            TrailerUrl: trailerUrl
        };

        wolfMovieService.addMovieTrailer(trailer, function (trailer) {
            if (trailer != "null") {
                $scope.object.Trailers.push(trailer);
            }
        });
    }

    $scope.deleteTrailer = function deleteTrailer(trailer) {
        wolfMovieService.deleteMovieTrailer(trailer.TrailerId, function (data) {
            if (data == 1) {
                var index = $scope.object.Trailers.indexOf(trailer);
                $scope.object.Trailers.splice(index, 1);

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });
    }

    $scope.deletePoster = function deletePoster(poster) {
        wolfMovieService.deleteMoviePoster(poster.PosterId, function (data) {
            if (data == 1) {
                var index = $scope.object.Posters.indexOf(poster);
                $scope.object.Posters.splice(index, 1);

                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });
    }

    $scope.clearMovieTrailerUrl = function () {
        $scope.movieTrailerUrl = "";
    }

    $scope.trustSrc = function (src) {
        if (src) {
            return $sce.trustAsResourceUrl(src);
        }
    }

    $scope.backup = {};
    $scope.backup = angular.copy(object);

    $scope.object = object;
 
    $scope.save = function updateMovie(movie) {
        wolfMovieService.updateMovie(movie, function (returnedMovie) {
        
            $scope.object = returnedMovie;

            if (!$scope.$$phase) {
                $scope.$apply();
            }
            $modalInstance.dismiss('cancel');
        });
    }

    $scope.undo = function () {
        angular.copy($scope.backup, $scope.object);
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};


