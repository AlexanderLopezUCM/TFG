using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public class SampleRepository(ApplicationDBContext dbContext) : ISampleRepository
    {
        //  Fields
        private readonly ApplicationDBContext _entities = dbContext;

        //  Interface implementations
        List<Sample> ISampleRepository.GetAllSamples()
        {
            return [.. _entities.Samples.Include(s => s.User)];
        }
        List<Sample> ISampleRepository.GetAllSamplesByID(int[] ids)
        {
            return [.. _entities.Samples
                .Include(s => s.User)
                .Where(s => ids.Contains(s.ID))
            ];
        }
        List<Sample> ISampleRepository.GetAllSamplesByCollection(int collectionID)
        {
            return [.. _entities.Samples
                .Include(s => s.User)
                .Include(s => s.Collections)
                .AsEnumerable()
                .Where(s =>
                    s.Collections != null &&
                    s.Collections.Any(c => c.ID == collectionID))
            ];
        }
        List<Sample> ISampleRepository.GetAllSamplesByName(string name)
        {
            return [.. _entities.Samples
                .Include(s => s.User)
                .Where(s => EF.Functions.Like(s.Name, $"%{name}%"))
            ];
        }
        List<Sample> ISampleRepository.GetAllUserSamples(int clientID)
        {
            return [.. _entities.Samples
                .Include(s => s.User)
                .Where(s => s.User.ID == clientID)
            ];
        }
        List<Sample> ISampleRepository.GetAllSamplesInSet(List<int> sampleIDs)
        {
            return [.. _entities.Samples.Where(s => sampleIDs.Contains(s.ID))];
        }
        Sample? ISampleRepository.GetSampleByID(int id)
        {
            return _entities.Samples.Include(s => s.User).FirstOrDefault(s => s.ID == id);
        }
        bool ISampleRepository.AddSample(Sample sample)
        {
            if (sample == null)
                return false;

            _entities.Samples.Add(sample);
            _entities.SaveChanges();

            return true;
        }
        bool ISampleRepository.UpdateSample(Sample sample)
        {
            if (sample == null)
                return false;

            _entities.Samples.Update(sample);
            _entities.SaveChanges();

            return true;
        }
        bool ISampleRepository.DeleteSamples(int[] ids)
        {
            //  Validate paramters
            if (ids == null || ids.Length == 0)
                return false;

            //  Fetch samples
            IQueryable<Sample> samples = _entities.Samples.Where(s => ids.Contains(s.ID));

            //  Validate samples
            if (!samples.Any())
                return false;

            //  Validate models
            foreach (Sample sample in samples)
                if (!File.Exists(sample.ModelPath))
                    return false;

            //  Delete models
            foreach (Sample sample in samples)
                File.Delete(sample.ModelPath);

            //  Remove samples
            _entities.Samples.RemoveRange(samples);
            _entities.SaveChanges();

            return true;
        }
    }
}