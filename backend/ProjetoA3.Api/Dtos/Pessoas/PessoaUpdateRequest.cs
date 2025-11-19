namespace ProjetoA3.Api.Dtos.Pessoas;

public class PessoaUpdateRequest
{
    public string? Nome { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Senha { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? TipoResiduo { get; set; }
    public decimal? QuantidadeKg { get; set; }
    public string? Observacoes { get; set; }
}
