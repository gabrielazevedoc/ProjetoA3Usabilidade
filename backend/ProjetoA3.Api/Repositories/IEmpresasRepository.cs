using ProjetoA3.Api.Dtos.Empresas;
using ProjetoA3.Api.Models;

namespace ProjetoA3.Api.Repositories;

public interface IEmpresasRepository
{
    Task<Empresa> CreateAsync(EmpresaCreateRequest request);
    Task<IReadOnlyCollection<Empresa>> ListAsync();
    Task<Empresa?> GetByIdAsync(int id);
    Task<Empresa?> GetByEmailAsync(string email);
    Task<Empresa?> UpdateAsync(int id, EmpresaUpdateRequest request);
    Task DeleteAsync(int id);
}
