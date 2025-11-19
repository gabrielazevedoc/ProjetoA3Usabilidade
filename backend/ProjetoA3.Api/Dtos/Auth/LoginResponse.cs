namespace ProjetoA3.Api.Dtos.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public AuthenticatedUser User { get; set; } = new();
}

public class AuthenticatedUser
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
}
