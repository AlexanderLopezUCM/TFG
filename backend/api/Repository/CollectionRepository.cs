using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class CollectionRepository(ApplicationDBContext entities) : ICollectionRepository
    {
        //  Fields
        private readonly ApplicationDBContext _entities = entities;

        //  Interface implementations
        List<Collection> ICollectionRepository.GetAllCollections()
        {
            return [.. _entities.Collections.Include(c => c.User)];
        }
        List<Collection> ICollectionRepository.GetAllCollectionsByUser(int userID)
        {
            return [.. _entities.Collections
                .Include(c => c.User)
                .Where(c => c.User.ID == userID)
            ];
        }
        List<Collection> ICollectionRepository.GetAllCollectionsByName(string name)
        {
            return [.. _entities.Collections
                .Include(c => c.User)
                .Where(c => c.Name.Contains(name, StringComparison.InvariantCultureIgnoreCase))
            ];
        }
        Collection? ICollectionRepository.GetCollectionByID(int id)
        {
            return _entities.Collections.Include(c => c.User).FirstOrDefault(c => c.ID == id);
        }
        bool ICollectionRepository.AddCollection(Collection collection)
        {
            if (collection == null)
                return false;

            _entities.Collections.Add(collection);
            _entities.SaveChanges();

            return true;
        }
        bool ICollectionRepository.UpdateCollection(Collection collection)
        {
            if (collection == null)
                return false;

            _entities.Update(collection);
            _entities.SaveChanges();

            return true;
        }
        bool ICollectionRepository.DeleteCollection(int id)
        {
            Collection? collection = _entities.Collections.Find(id);

            if (collection == null)
                return false;

            _entities.Collections.Remove(collection);
            _entities.SaveChanges();

            return true;
        }
    }
}