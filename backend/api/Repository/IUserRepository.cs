using api.Models;

namespace api.Repository
{
    public interface IUserRepository
    {
        //  Methods
        User? GetUserByID(int currentUserID);
        bool AddUser(User user);
        bool UpdateUser(User user);
        bool DeleteUser(int id);
    }
}