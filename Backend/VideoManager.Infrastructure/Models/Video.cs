using System;
using System.Collections.Generic;
using System.Text;

namespace VideoManager.Infrastructure.Models
{
    public class Video
    {
        public int Id { get; set;  }
        public String Title { get; set; }
        public String? Description { get; set; }

        public int CreatorId { get; set;  }

        // 1: To-DO
        //2: In-Progress
        //3: Done

        public int Status {  get; set; }
        public int Price { get; set; } = 0;

        public DateTime Due { get; set; }
    }
}
