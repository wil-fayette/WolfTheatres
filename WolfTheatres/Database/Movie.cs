using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolfTheatres.Database
{
    public class Movie
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int MovieId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string RunTime { get; set; }
        public string Rating { get; set; }
        public string Year { get; set; }
        public string Cast { get; set; }
        public virtual Poster Poster { get; set; }
    }
}