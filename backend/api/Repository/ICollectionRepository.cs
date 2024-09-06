using api.Models;

namespace api.Repository
{
    public interface ICollectionRepository
    {
        //  Methods
        List<Collection> GetAllCollections();
        List<Collection> GetAllCollectionsByUser(int userID);
        List<Collection> GetAllCollectionsByName(string name);
        Collection? GetCollectionByID(int id);

        bool AddCollection(Collection collection);
        bool UpdateCollection(Collection collection);
        bool DeleteCollection(int id);
    }
}