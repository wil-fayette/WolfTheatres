using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;

namespace WolfTheatres.Database
{
    public class Poster
    {
        public Guid PosterId { get; set; }
        public bool Display { get; set; }
        public string ImageUrl { get; set; }
        public string FileLocation { get; set; }
        public int MovieId { get; set; }
    }
}