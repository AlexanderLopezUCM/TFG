using System.Diagnostics;
using System.Text.Json;
using api.DTO.Collection;
using api.Mappers;
using api.Models;
using api.Other;
using api.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController, Route("api/collections")]
    [Authorize]
    public class CollectionController
    (
        IUserRepository userRepository,
        ICollectionRepository collectionRepository,
        ISampleRepository sampleRepository
    ) : AuthControllerBase(userRepository)
    {
        //  Fields
        private readonly ICollectionRepository _collectionRepository = collectionRepository;
        private readonly ISampleRepository _sampleRepository = sampleRepository;

        //  Methods
        [HttpGet("previews")]
        public IActionResult GetAllCollectionPreviews()
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            List<Collection> collections = _collectionRepository.GetAllCollections();

            return Ok(FilterByVisibility(collections, clientID).Select(c => c.ToCollectionDTO()));
        }
        [HttpGet("previews/user")]
        public IActionResult GetAllUserCollectionPreviews()
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            List<Collection> collections = _collectionRepository.GetAllCollectionsByUser(clientID);

            return Ok(collections.Select(c => c.ToCollectionDTO()));
        }
        [HttpGet("previews/name/{name}")]
        public IActionResult GetAllCollectionPreviewsByName(string name)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            List<Collection> collections = _collectionRepository.GetAllCollectionsByName(name);

            return Ok(FilterByVisibility(collections, clientID).Select(c => c.ToCollectionDTO()));
        }
        [HttpGet("{id}")]
        public IActionResult GetByID([FromRoute] int id)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            Collection? collection = _collectionRepository.GetCollectionByID(id);

            if (collection == null)
                return NotFound();

            if (collection.User.ID != clientID)
                return Unauthorized();

            return Ok(collection.ToCollectionDTO());
        }
        [HttpPost]
        public IActionResult Create(CreateCollectionDTO createCollectionDTO)
        {
            Console.WriteLine("\n\n\n");
            Console.WriteLine(JsonSerializer.Serialize(createCollectionDTO));
            Console.WriteLine("\n\n\n");

            if (!TryGetClientInfo(out int clientID, out User? user))
                return BadRequest();

            Debug.Assert(user != null);

            List<Sample> samples = createCollectionDTO.SampleIDs != null
                ? _sampleRepository.GetAllSamplesInSet(createCollectionDTO.SampleIDs)
                : [];

            if (samples.Any(s => s.User.ID != clientID))
                return BadRequest();

            //  Create collection
            Collection collection = new()
            {
                Name = createCollectionDTO.Name,
                Description = createCollectionDTO.Description,
                PublicationStatus = createCollectionDTO.PublicationStatus,
                User = user,
                Samples = samples,
            };

            //  Add and save changes
            _collectionRepository.AddCollection(collection);

            //  Return result
            return Ok(new CreateCollectionResponseDTO() { ID = collection.ID });
        }

        [HttpPatch]
        public IActionResult UpdateCollection(PatchCollectionDTO patchCollectionDTO)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            Collection? collection = _collectionRepository.GetCollectionByID(patchCollectionDTO.ID);

            if (collection == null)
                return BadRequest();

            List<Sample> samples = patchCollectionDTO.SampleIDs != null
                ? _sampleRepository.GetAllSamplesInSet(patchCollectionDTO.SampleIDs)
                : [];

            if (samples.Any(s => s.User.ID != clientID))
                return BadRequest();


            collection.Name = patchCollectionDTO.Name ?? collection.Name;
            collection.Description = patchCollectionDTO.Description ?? collection.Description;
            collection.Tags = patchCollectionDTO.Tags ?? collection.Tags;
            collection.PublicationStatus = patchCollectionDTO.PublicationStatus ?? collection.PublicationStatus;

            _collectionRepository.UpdateCollection(collection);

            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            Collection? collection = _collectionRepository.GetCollectionByID(id);

            if (collection == null)
                return BadRequest();

            if (collection.User.ID != clientID)
                return Unauthorized();

            _collectionRepository.DeleteCollection(id);

            return Ok();
        }

        private static IEnumerable<Collection> FilterByVisibility(IEnumerable<Collection> collections, int clientID)
        {
            return collections.Where(c => c.PublicationStatus == PublicationStatus.Public || c.User.ID == clientID);
        }
    }
}