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
using WolfTheatres.Database;


namespace WolfTheatres.Controllers
{
    public class MovieController : ApiController
    {
        private const string POSTER_IMG_LOCATION_PROJECT = "~/Movies/Posters/";
        private const string POSTER_IMG_LOCATION_WEB = "Movies/Posters/";

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
        public HttpResponseMessage PostMovie(Movie movie)
        {
            if (ModelState.IsValid)
            {
                db.Movies.Add(movie);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, movie);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = movie.MovieId }));
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        public int PostMovies(IEnumerable<Movie> movies)
        {
            if (ModelState.IsValid)
            {
                foreach (var movie in movies)
                {
                    if (db.Movies.Find(movie.MovieId) == null)
                    {
                        movie.Poster.PosterId = Guid.NewGuid();

                        
                        var webClient = new WebClient();

                        webClient.DownloadFile(movie.Poster.ImageUrl, HttpContext.Current.Server.MapPath(POSTER_IMG_LOCATION_PROJECT) + movie.MovieId + ".png");

                        movie.Poster.FileLocation = POSTER_IMG_LOCATION_WEB + movie.MovieId + ".png";

                        db.Movies.Add(movie);
                    }   
                }
                
                db.SaveChanges();
                return 1;
            }
            else
            {
                return 0;
            }
        }

        // DELETE api/Movie/5
        public HttpResponseMessage DeleteMovie(int id)
        {
            Movie movie = db.Movies.Find(id);
            if (movie == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
            if (movie.Poster != null)
            {
                    var databasePoster = db.Posters.Find(movie.Poster.PosterId);
                    if (databasePoster != null)
                        db.Posters.Remove(databasePoster);
                
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