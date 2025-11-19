using System.ComponentModel.DataAnnotations;

namespace ProjetoA3.Api.Dtos.Empresas;

public class EmpresaCreateRequest
{
    [Required]
    public string RazaoSocial { get; set; } = string.Empty;

    [Required]
    public string NomeContato { get; set; } = string.Empty;

    [Required]
    public string Telefone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Senha { get; set; } = string.Empty;

    public string? Cnpj { get; set; }
}
