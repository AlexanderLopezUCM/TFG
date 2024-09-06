using System.Diagnostics;
using api.DTO.User;
using api.Mappers;
using api.Models;
using api.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace api.Controllers
{
    [Route("api"), ApiController]
    public class UserController(IUserRepository userRepository) : AuthControllerBase(userRepository)
    {
        //  Fields
        private readonly IUserRepository _userRepository = userRepository;

        //  Methods
        [HttpGet("user")]
        public IActionResult Get()
        {
            if (!TryGetClientInfo(out _, out User? user))
                return BadRequest();

            Debug.Assert(user != null);

            return Ok(user.ToViewUserDTO());
        }
        [HttpPatch("users")]
        public IActionResult Update([FromBody] PatchUserDTO patchUserDTO)
        {
            if (!TryGetClientInfo(out _, out User? user))
                return BadRequest();

            Debug.Assert(user != null);

            user.Username = patchUserDTO.Username ?? user.Username;

            return _userRepository.UpdateUser(user) ? Ok() : BadRequest();
        }
        [HttpDelete("user")]
        public IActionResult Delete()
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            return _userRepository.DeleteUser(clientID) ? Ok() : BadRequest();
        }
    }
}