using System.Diagnostics;
using api.DTO.Sample;
using api.Mappers;
using api.Models;
using api.Other;
using api.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/samples"), ApiController]
    [Authorize]
    public class SampleController(ISampleRepository sampleRepository, IUserRepository userRepository) : AuthControllerBase(userRepository)
    {
        //  Fields
        private readonly ISampleRepository _sampleRepository = sampleRepository;

        //  Methods
        [HttpGet("previews")]
        public IActionResult GetAllPreviews()
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            return Ok(FilterByVisibility(_sampleRepository.GetAllSamples(), clientID).Select(s => s.ToSamplePreviewDTO()));
        }

        [HttpGet("previews/collection/{collectionID}")]
        public IActionResult GetAllPreviewsByCollection(int collectionID)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            List<Sample> samples = _sampleRepository.GetAllSamplesByCollection(collectionID);

            return base.Ok(FilterByVisibility(samples, clientID).Select(s => s.ToSamplePreviewDTO()));
        }

        [HttpGet("previews/name/{name}")]
        public IActionResult GetAllPreviewsByName(string name)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            return base.Ok(FilterByVisibility(_sampleRepository.GetAllSamplesByName(name), clientID).Select(s => s.ToSamplePreviewDTO()));
        }

        [HttpGet("previews/user")]
        public IActionResult GetAllUserSamples()
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            return Ok(_sampleRepository.GetAllUserSamples(clientID).Select(s => s.ToSamplePreviewDTO()));
        }

        [HttpGet("{id}")]
        public IActionResult GetSampleByID(int id)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            Sample? sample = _sampleRepository.GetSampleByID(id);

            if (sample == null)
                return NotFound();

            if (!IsVisible(sample, clientID))
                return Unauthorized();

            return Ok(sample.ToSampleDTO());
        }
        [HttpPost]
        public IActionResult CreateSample([FromBody] CreateSampleDTO createSampleDTO)
        {
            if (!TryGetClientInfo(out _, out User? user))
                return BadRequest();

            Debug.Assert(user != null);

            string tempFilePath = $"Public/3D Models/Temp/{createSampleDTO.ModelID}.obj";
            string filePath = $"Public/3D Models/{createSampleDTO.ModelID}.obj";
            bool modelExists = System.IO.File.Exists($"Public/3D Models/Temp/{createSampleDTO.ModelID}.obj");

            if (!modelExists)
                return BadRequest();

            //  Move model to permanent folder
            System.IO.File.Move(tempFilePath, filePath, true);

            //  Create sample
            Sample sample = new()
            {
                Name = createSampleDTO.Name,
                Description = createSampleDTO.Description,
                Tags = createSampleDTO.Tags,
                PublicationStatus = createSampleDTO.PublicationStatus,
                ModelPath = filePath,
                User = user,
                Collections = []
            };

            //  Store sample in database
            return _sampleRepository.AddSample(sample) ? Ok(sample.ID) : BadRequest();
        }
        [HttpPatch]
        public IActionResult UpdateSample([FromBody] PatchSampleDTO patchSampleDTO)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest();

            Sample? sample = _sampleRepository.GetSampleByID(patchSampleDTO.ID);

            if (sample == null)
                return BadRequest();

            if (clientID != sample.User.ID)
                return Unauthorized();


            sample.Name = patchSampleDTO.Name ?? sample.Name;
            sample.Description = patchSampleDTO.Description ?? sample.Description;
            sample.Tags = patchSampleDTO.Tags ?? sample.Tags;
            sample.PublicationStatus = patchSampleDTO.PublicationStatus ?? sample.PublicationStatus;

            _sampleRepository.UpdateSample(sample);

            return Ok();
        }
        [HttpDelete]
        public IActionResult DeleteSamples(DeleteSamplesDTO deleteSamples)
        {
            if (!TryGetClientID(out int clientID))
                return BadRequest("a");

            List<Sample> samples = _sampleRepository.GetAllSamplesByID(deleteSamples.SampleIDs);

            if (samples.Any(s => s.User.ID != clientID))
                return BadRequest("b");

            return _sampleRepository.DeleteSamples(deleteSamples.SampleIDs)
                ? Ok()
                : BadRequest("c");
        }

        private static IEnumerable<Sample> FilterByVisibility(IEnumerable<Sample> samples, int clientID)
        {
            return samples.Where(sample => IsVisible(sample, clientID));
        }
        private static bool IsVisible(Sample sample, int clientID)
        {
            return sample != null && (sample.PublicationStatus == PublicationStatus.Public || sample.User.ID == clientID);
        }
    }
}