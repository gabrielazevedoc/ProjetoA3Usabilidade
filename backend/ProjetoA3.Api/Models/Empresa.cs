namespace ProjetoA3.Api.Models;

public class Empresa
{
    public int Id { get; set; }
    public string RazaoSocial { get; set; } = string.Empty;
    public string NomeContato { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Cnpj { get; set; }
    public DateTime CreatedAt { get; set; }
}
