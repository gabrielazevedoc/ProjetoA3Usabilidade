namespace ProjetoA3.Api.Models
{
    public class Empresa
    {
        public int Id { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty; // contato
        public string Cnpj { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string Email { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;
    }
}
