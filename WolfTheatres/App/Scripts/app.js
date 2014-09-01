var WolfTheatresApp = angular.module("WolfTheatresApp", ["ngResource", "ngCookies", "ngRoute", "ui.bootstrap", "ngAnimate", "snap", "ngSanitize", "angularUtils.directives.dirPagination", "ui.utils", 'jQueryScrollbar']).config(function ($routeProvider) {
    $routeProvider.
        when('/login', { controller: 'LoginController', templateUrl: 'App/Views/login.html' }).
        when('/', { controller: 'HomeController', templateUrl: 'App/Views/main.html' }).
        when('/employees', { controller: 'EmployeesController', templateUrl: 'App/Views/employees.html' }).
        when('/movies/info', { controller: 'MovieInformationController', templateUrl: 'App/Views/movieInfo.html' }).
        when('/movies/schedule', { controller: 'MovieScheduleController', templateUrl: 'App/Views/movieSchedule.html' }).
        when('/movies/main', { templateUrl: 'App/Views/moviesMain.html' }).
        when('/website/index', { controller: 'WebsiteIndexController', templateUrl: 'App/Views/websiteIndex.html'}).
        otherwise({ redirectTo: '/' });
});

WolfTheatresApp.run(function($rootScope, $location, $cookieStore) {
  $rootScope.$on('$routeChangeSuccess', function () {
    if($cookieStore.get('isLoggedIn') != true) {
      $location.url("/login");
    }else{
        $rootScope.page = $location.$$path;
        $rootScope.user = $cookieStore.get('user');
        $rootScope.isLoggedIn = true;
    }
  });
});

WolfTheatresApp.directive('fileStyle', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
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

WolfTheatresApp.factory('imageService', function ($http) {
    var imageService = {};

    imageService.getImages = function (page, callback) {
        $http.get('api/Image/get?page=' + page).success(function (data) {
            callback(data);
        });
    }

    imageService.deleteImage = function (imageId, callback){
        $http.delete('api/Image/delete?imageId=' + imageId).success(function (data){
            callback(data);
        });
    }
    return imageService;
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
        $http.post('api/Movie/AddNewMovie?movieDbId=' +  movieDbId).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.deleteMovie = function (movieId, callback) {
        $http.delete('api/Movie/DeleteMovie?movieId=' + movieId).success(function (data) {
            callback(data);
        });
    }

    wolfMovieService.updateMovie = function (movie, callback) {
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

    wolfMovieService.saveMovieShowtimes = function (movieShowtimes, callback) {
        $http.post('api/Movie/SaveMovieShowtimes/', movieShowtimes).success(function (data) {
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
}).controller('MovieInformationController', function ($scope, $filter, $http, $timeout, $rootScope, wolfMovieService, $sce, $modal, movieDatabaseService) {
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
    $scope.copyDate;
    $scope.paste;
    $scope.addMovieDisabled = false;
    $scope.deleteMovieDisabled = false;

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
            var indexOfMovie = $scope.searchResults.indexOf(movie);
            if (indexOfMovie != -1) {
                $scope.searchResults.splice(indexOfMovie, 1);
            }
            $scope.addMovieDisabled = true;
            wolfMovieService.addNewMovie(movie.MovieDbId, function (returnedMovie) {
                $scope.addMovieDisabled = false;
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
        $scope.deleteMovieDisabled = true;
        wolfMovieService.deleteMovie(movieId, function (data) {
            $scope.deleteMovieDisabled = false;
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

    $scope.movieDatabaseSearch = function movieDatabaseSearch(query) {
        movieDatabaseService.search(query, function (movies) {
            $scope.searchResults = movies;
        });
    }
    $scope.deleteMovie = deleteMovie;
}).controller('ShowtimesController', function ($scope) {

}).controller('MovieScheduleController', function ($scope, $filter, $http, $route, $timeout, $rootScope, wolfMovieService, $sce, $modal, movieDatabaseService) {
    $scope.wolfMovies = [];
    $scope.showOurMoviesDiv = true;
    $scope.showCalendarDiv = true;
    $scope.dt = "";
    $scope.moviesPlayingOnSelectedDate = [];
    $scope.dates = [];
    $scope.copyDate;
    $scope.copy = false;
    $scope.showtimeDates = {};
    $scope.selectedDate;
    $scope.showDate;
    $scope.copyDate = '';
    $scope.expand = false;
    $scope.publish = true;

    $scope.jqueryScrollbarOptions = {
        "type": "simpble"
    };

    $scope.deleteShowtime = function (key, showtime) {
        for (var i = 0; i < $scope.showtimeDates[key].length; i++) {
            if ($scope.showtimeDates[key][i] == showtime) {
                $scope.showtimeDates[key].splice(i, 1);
            }
        }

        if ($scope.showtimeDates[key].length == 0) {
            $scope.deleteShowtimeDate(key);
        }
    }

    $scope.deleteShowtimeDate = function (key) {
        delete $scope.showtimeDates[key];
    }

    wolfMovieService.getMovieShowtimes(function (data) {
        for (var i = 0; i < data.length; i++) {
            addToShowtimeDates(data[i]);
        }
    });

    $scope.publish = function () {
        var movies = [];
        for (var showtimeDate in $scope.showtimeDates) {

            var showtimeDate = $scope.showtimeDates[showtimeDate];

            for (var i = 0; i < showtimeDate.length; i++) {
                movies.push(showtimeDate[i]);
            }
        }
        wolfMovieService.saveMovieShowtimes(movies, function (data) {
            $route.reload();
        });
    }

    function addToShowtimeDates(movieShowtime) {

        if (!$scope.showtimeDates.hasOwnProperty(movieShowtime.ScheduleDate))
            $scope.showtimeDates[movieShowtime.ScheduleDate] = [];

        $scope.showtimeDates[movieShowtime.ScheduleDate].push(movieShowtime);
    }

    $scope.pasteShowtimes = function (key) {
        if ($scope.showtimeDates.hasOwnProperty(key) && $scope.showtimeDates.hasOwnProperty($scope.copyDate)) {
            var copy = [];
            var toCopy = $scope.showtimeDates[$scope.copyDate];

            for (var i = 0; i < toCopy.length; i++) {
                copy.push({ MovieId: toCopy[i].MovieId, MovieShowtimeId: "", ScheduleDate: key, Showtimes: toCopy[i].Showtimes, MovieName: toCopy[i].MovieName });
            }

            $scope.showtimeDates[key] = copy;
        }
    }


    $scope.filterByDate = function (movieShowtime) {
        var result = movieShowtime.ScheduleDate == $filter('date')($scope.dt, 'yyyy-MM-dd');
        return result;
    };

    $scope.setDate = function (date) {
        if ($scope.dt != date) {
            $scope.dt = date;
            return;
        }

        $scope.dt = "";
    }

    $scope.showPaste = function (key) {

        if ($scope.copyDate != key && $scope.copyDate != '') {
            return true;
        }

        return false;
    }

    $scope.expand = function (bool) {
        var i = 0;
        for (var property in $scope.showtimeDates) {
            debugger;
            $(angular.element('.showDate')[i]).scope().showDate = bool;
            i++;
        }
    }

    $scope.setCopyDate = function (key) {
        $scope.copyDate = key;
    }

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.deleteDate = function (date) {
        delete $scope.showtimeDates[date];
    }

    $scope.addMovieToSelectedDate = function (movie) {
        var i = 0;
        for (var property in $scope.showtimeDates) {
            if ($(angular.element('.showDate')[i]).scope().key == $scope.dt){
                 $(angular.element('.showDate')[i]).scope().showDate = true;
                 break;
            }
            i++;
        }

        var formattedDate = $filter('date')($scope.dt, 'yyyy-MM-dd');

        if (!$scope.showtimeDates.hasOwnProperty(formattedDate) && $scope.dt != "") {
            $scope.showtimeDates[formattedDate] = [];
        }

        $scope.showtimeDates[formattedDate].push({ MovieId: movie.MovieId, MovieShowtimeId: "", ScheduleDate: formattedDate, Showtimes: "", MovieName: movie.Name });
    }

    $scope.copyMode = function (dt) {
        $scope.copyDate = dt;
        $scope.copy = !$scope.copy;
    }

    wolfMovieService.getWolfMovies(function (data) {
        $scope.wolfMovies = data;
    });

    $scope.$watch('dt', function () {
        if ($scope.dt != "") {
            var filteredDate = $filter('date')($scope.dt, 'yyyy-MM-dd');
            if (!$scope.showtimeDates[filteredDate])
                $scope.showtimeDates[filteredDate] = [];
        }
    });


}).controller('WebsiteIndexController', function ($scope, imageService) {
    $scope.showCarousel = true;
    $scope.publishDisabled = false;


    function removeImageById(id, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].ImageId === id) {
                array.splice(i, 1);
            }
        }
    }

    imageService.getImages("HOME", function (data){
        $scope.images = data;
    });

    $scope.selectImage = function(image){
        if ($scope.selectedImage == image){
            $scope.selectedImage = "";
        }else {
            $scope.selectedImage = image;
        }
    }

    $scope.deleteImage = function(image){
        imageService.deleteImage(image.ImageId, function (data){
            removeImageById(image.ImageId, $scope.images);
        });
    }


     $scope.uploadImage = function uploadImage(image) {
        debugger;
        if ($('#' + image).get(0) != null) {
            var files = $('#' + image).get(0).files;

            if (files.length > 0) {
                if (window.FormData !== undefined) {
                    var data = new FormData();
                    for (i = 0; i < files.length; i++) {
                        data.append("file" + i, files[i]);
                    }

                    data.append("page", "HOME");

                    $.ajax({
                        type: "POST",
                        url: "/api/Image/Post",
                        contentType: false,
                        processData: false,
                        data: data,
                        success: function (results) {
                            debugger;
                            for (var i = 0; i < results.length; i++) {
                                $scope.images.push(results[i]);

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


}).controller('LoginController', function ($scope, $rootScope, $location, $cookieStore) {
        $scope.user = {
            name: "",
            password: ""
        };

    $scope.submit = function (user){
        if (user.name == "admin" && user.password == "Wolf!"){
            $cookieStore.put('isLoggedIn', true);
            $cookieStore.put('user', $scope.user);
            $location.url("/movies/info");
        }
    }
});

var ModalInstanceCtrl = function ($scope, wolfMovieService, $modalInstance, object, $sce) {
    $scope.movieTrailerUrl = "";


    $scope.uploadPoster = function uploadPoster(poster, movie) {
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



