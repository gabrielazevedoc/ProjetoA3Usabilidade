namespace ProjetoA3.Api.Dtos.Empresas;

public class EmpresaUpdateRequest
{
    public string? RazaoSocial { get; set; }
    public string? NomeContato { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Senha { get; set; }
    public string? Cnpj { get; set; }
}
