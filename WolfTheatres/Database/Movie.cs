using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WolfTheatres.Database
{
    public class Movie
    {
        public Guid MovieId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RunTime { get; set; }
        public string Rating { get; set; }
    }
}