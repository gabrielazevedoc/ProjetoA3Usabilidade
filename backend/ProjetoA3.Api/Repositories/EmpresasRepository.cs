using Microsoft.EntityFrameworkCore;
using ProjetoA3.Api.Data;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Dtos.Empresas;

namespace ProjetoA3.Api.Repositories
{
    public class EmpresasRepository : IEmpresasRepository
    {
        private readonly AppDbContext _context;

        public EmpresasRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Empresa> CreateAsync(EmpresaCreateRequest request)
        {
            var empresa = new Empresa
            {
                RazaoSocial = request.RazaoSocial,
                Nome = request.NomeContato,
                Telefone = request.Telefone,
                Email = request.Email,
                SenhaHash = string.IsNullOrWhiteSpace(request.Senha) ? string.Empty : BCrypt.Net.BCrypt.HashPassword(request.Senha),
                Cnpj = request.Cnpj
            };
            _context.Empresas.Add(empresa);
            await _context.SaveChangesAsync();
            return empresa;
        }

        public async Task<IReadOnlyCollection<Empresa>> ListAsync()
        {
            return await _context.Empresas
                .OrderByDescending(e => e.Id)
                .ToListAsync();
        }

        public async Task<Empresa?> GetByIdAsync(int id)
        {
            return await _context.Empresas.FindAsync(id);
        }

        public async Task<Empresa?> GetByEmailAsync(string email)
        {
            return await _context.Empresas
                .FirstOrDefaultAsync(e => e.Email == email);
        }

        public async Task<Empresa?> UpdateAsync(int id, EmpresaUpdateRequest request)
        {
            var empresa = await _context.Empresas.FindAsync(id);
            if (empresa == null) return null;

            if (!string.IsNullOrWhiteSpace(request.NomeContato))
                empresa.Nome = request.NomeContato;

            if (!string.IsNullOrWhiteSpace(request.Cnpj))
                empresa.Cnpj = request.Cnpj;

            await _context.SaveChangesAsync();
            return empresa;
        }

        public async Task DeleteAsync(int id)
        {
            var empresa = await _context.Empresas.FindAsync(id);
            if (empresa != null)
            {
                _context.Empresas.Remove(empresa);
                await _context.SaveChangesAsync();
            }
        }
    }
}
