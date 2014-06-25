using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WolfTheatres.Database
{
    public class Trailer
    {
        public Guid TrailerId { get; set; }
        public bool Display { get; set; }
        public string TrailerUrl { get; set; }
        public int MovieId { get; set; }
    }
}