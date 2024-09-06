using api.Data;
using api.Models;

namespace api.Repository
{
    public class UserRepository(ApplicationDBContext dbContext) : IUserRepository
    {
        //  Fields
        private readonly ApplicationDBContext _entities = dbContext;

        //  Interface implementations
        User? IUserRepository.GetUserByID(int currentUserID)
        {
            return _entities.Users.Find(currentUserID);
        }
        bool IUserRepository.AddUser(User user)
        {
            if (user == null)
                return false;

            _entities.Users.Add(user);
            _entities.SaveChanges();

            return true;
        }
        bool IUserRepository.UpdateUser(User user)
        {
            if (user == null)
                return false;

            _entities.Users.Update(user);
            _entities.SaveChanges();

            return true;
        }
        bool IUserRepository.DeleteUser(int id)
        {
            User? user = _entities.Users.Find(id);

            if (user == null)
                return false;

            _entities.Users.Remove(user);
            _entities.SaveChanges();

            return true;
        }
    }
}