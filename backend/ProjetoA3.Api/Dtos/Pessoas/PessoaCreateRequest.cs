using System.ComponentModel.DataAnnotations;

namespace ProjetoA3.Api.Dtos.Pessoas;

public class PessoaCreateRequest
{
    [Required]
    public string Nome { get; set; } = string.Empty;

    public string? Telefone { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Senha { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? TipoResiduo { get; set; }
    public decimal? QuantidadeKg { get; set; }
    public string? Observacoes { get; set; }
}
