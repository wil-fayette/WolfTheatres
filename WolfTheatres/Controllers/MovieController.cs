using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.IO;
using WolfTheatres.Database;
using System.Xml.Linq;
using System.Text;
using System.Text.RegularExpressions;


namespace WolfTheatres.Controllers
{
    public class MovieController : ApiController
    {
        private const string POSTER_IMAGE_LOCATION = "Movies/Posters/";

        private WolfTheatresContext db = new WolfTheatresContext();

        // GET api/Movie
        public IEnumerable<Movie> GetMovies()
        {
            return db.Movies.AsEnumerable();
        }

        // GET api/Movie/5
        public Movie GetMovie(int id)
        {
            Movie movie = db.Movies.Find(id);
            if (movie == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return movie;
        }

        // PUT api/Movie/5
        public HttpResponseMessage PutMovie(int id, Movie movie)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != movie.MovieId)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(movie).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // POST api/Movie
        public Movie PostMovie(Movie movie)
        {
            if (!ModelState.IsValid)
                return null;

            var databaseMovie = db.Movies.Find(movie.MovieId);

            if (databaseMovie == null)
            {
                if (movie.Posters.Count > 0)
                {
                    var displayOrder = 1;
                    foreach (var poster in movie.Posters)
                    {
                        GetPosterImage(poster, movie.MovieId);
                        displayOrder++;
                    }
                    if (movie.Posters.Count > 0)
                        movie.Posters.First().Display = true;
                }
                movie.Trailers = GetMovieTrailers(movie.ImdbId, movie.MovieId);
            }
            else
            {
                this.DeleteMovie(databaseMovie.MovieId);
            }

            db.Movies.Add(movie);
            db.SaveChanges();

            return movie;
        }

        public int PostMovies(IEnumerable<Movie> movies)
        {
            if (!ModelState.IsValid)
                return 0;
           
            foreach (var movie in movies)
            {
                if (db.Movies.Find(movie.MovieId) == null)
                {
                    if (movie.Posters.Count > 0)
                    {
                        var displayOrder = 1;
                        foreach (var poster in movie.Posters)
                        {
                            GetPosterImage(poster, movie.MovieId);
                            displayOrder++;
                        }
                        if (movie.Posters.Count > 0)
                            movie.Posters.First().Display = true;
                    }

                    db.Movies.Add(movie);
                }
            }

            db.SaveChanges();
            return 1;
        }

        private void GetPosterImage(Poster poster, int movieId)
        {
            poster.PosterId = Guid.NewGuid();
            var webClient = new WebClient();

            if (!string.IsNullOrEmpty(poster.ImageUrl))
            {
                webClient.DownloadFile(poster.ImageUrl, HttpContext.Current.Server.MapPath("~/" + POSTER_IMAGE_LOCATION) + movieId + ".png");
                poster.FileLocation = POSTER_IMAGE_LOCATION + movieId + ".png";
            }
        }

        private List<Trailer> GetMovieTrailers(int imdbId, int movieId)
        {
            var trailers = new List<Trailer>();

            var count = 4;
            var width = 680;

            using (var webClient = new WebClient())
            {
                string xml = webClient.DownloadString("http://api.traileraddict.com/?imdb=" + imdbId + "&count=" + count + "&width=" + width);
                XDocument document = XDocument.Parse(xml);
                

                foreach (var element in document.Descendants("embed")) {
                    var pattern = "(<iframe .+></iframe>)";

                    string trailerUrl = "";

                    if (Regex.IsMatch(element.Value, pattern)) {
                        trailerUrl = Regex.Match(element.Value, pattern).Value;
                    }
                    
                    trailers.Add(new Trailer
                    {
                        TrailerId = Guid.NewGuid(),
                        TrailerUrl = trailerUrl,
                        Display = false,
                        MovieId = movieId
                    });
                }
            }

            return trailers ;
        }

        // DELETE api/Movie/5
        public HttpResponseMessage DeleteMovie(int id)
        {
            Movie movie = db.Movies.Find(id);
            if (movie == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
            if (movie.Posters.Count > 0)
            {
                foreach (var poster in movie.Posters.ToList())
                {
                    var databasePoster = db.Posters.Find(poster.PosterId);
                    if (databasePoster != null)
                    {
                        if (File.Exists(HttpContext.Current.Server.MapPath("~/" + databasePoster.FileLocation)))
                            File.Delete((HttpContext.Current.Server.MapPath("~/" + databasePoster.FileLocation)));

                        db.Posters.Remove(databasePoster);
                    }
                }                
            }

            if (movie.Trailers.Count > 0)
            {
                foreach (var trailer in movie.Trailers.ToList())
                {
                    var databaseTrailer = db.Trailers.Find(trailer.TrailerId);
                    if (databaseTrailer != null)
                        db.Trailers.Remove(databaseTrailer);
                }
            }
            db.Movies.Remove(movie);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, movie);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}