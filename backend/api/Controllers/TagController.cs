using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/tags"), ApiController]
    public class TagController(ApplicationDBContext context) : ControllerBase
    {
        //  Fields
        private readonly ApplicationDBContext _context = context;

        //  Methods
        [HttpGet("{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            return await Task.Run(() =>
            {
                Tag[] tags = [.. _context.Tags .Where(tag => EF.Functions.Like(tag.Value, $"%{name}%"))];

                return Ok(tags);
            });
        }
    }
}