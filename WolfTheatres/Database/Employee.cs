using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WolfTheatres.Database
{
    public class Employee
    {
        public Guid EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public Guid EmployeeShiftId { get; set; }
        public ICollection<EmployeeShift> EmployeeShifts { get; set; }
    }
}