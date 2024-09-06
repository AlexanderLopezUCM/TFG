using System.Security.Claims;
using api.Models;
using api.Repository;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    public abstract class AuthControllerBase(IUserRepository userRepository) : ControllerBase
    {
        //  Fields
        private readonly IUserRepository _userRepository = userRepository;

        //  Methods
        protected bool TryGetClientID(out int clientID)
        {
            return int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out clientID);
        }
        protected bool TryGetClientInfo(out int clientID, out User? user)
        {
            user = default;

            if (!TryGetClientID(out clientID))
                return false;

            return (user = _userRepository.GetUserByID(clientID)) != null;
        }
    }
}