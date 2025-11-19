namespace ProjetoA3.Api.Dtos.Pessoas;

public class PessoaContatoResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string Email { get; set; } = string.Empty;
}
