namespace ProjetoA3.Api.Dtos.Empresas
{
    public class EmpresaCreateRequest
    {
        public string RazaoSocial { get; set; } = string.Empty;
        public string NomeContato { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Cnpj { get; set; } = string.Empty;
    }
}
