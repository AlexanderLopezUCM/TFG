namespace api.DTO.User
{
    public class CreateUserDTO
    {
        // Properties   
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public required string PasswordSalt { get; set; }
    }
}