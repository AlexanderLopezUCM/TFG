using api.Models;

namespace api.Repository
{
    public interface ISampleRepository
    {
        //  Methdods
        List<Sample> GetAllSamples();
        List<Sample> GetAllSamplesByID(int[] ids);
        List<Sample> GetAllSamplesByCollection( int collectionID);
        List<Sample> GetAllSamplesByName(string name);
        List<Sample> GetAllUserSamples(int clientID);
        List<Sample> GetAllSamplesInSet(List<int> sampleIDs);
        Sample? GetSampleByID(int id);
        bool AddSample(Sample sample);
        bool UpdateSample(Sample sample);
        bool DeleteSamples(int[] ids);
    }
}