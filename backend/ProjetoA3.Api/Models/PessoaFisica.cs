namespace ProjetoA3.Api.Models;

public class PessoaFisica
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? TipoResiduo { get; set; }
    public decimal? QuantidadeKg { get; set; }
    public string? Observacoes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PessoaContato
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string Email { get; set; } = string.Empty;
}

public class PessoaListItem
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string Email { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? TipoResiduo { get; set; }
    public decimal? QuantidadeKg { get; set; }
    public string? Observacoes { get; set; }
    public DateTime CreatedAt { get; set; }
}
