using api.DTO.User;
using api.Models;

namespace api.Mappers
{
    public static class UserMapper
    {
        //  Methods
        public static ViewUserDTO ToViewUserDTO(this User user) => new()
        {
            ID = user.ID,
            Username = user.Username,
        };
    }
}