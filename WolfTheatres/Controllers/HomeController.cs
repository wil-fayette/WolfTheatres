using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WolfTheatres.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return new FilePathResult("Index.html", "text/html");
        }
    }
}
