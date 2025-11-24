using ProjetoA3.Api.Dtos.Pessoas;
using ProjetoA3.Api.Models;

namespace ProjetoA3.Api.Repositories;

public interface IPessoasRepository
{
    Task<PessoaFisica> CreateAsync(PessoaCreateRequest request);
    Task<PagedResult<PessoaListItem>> ListAsync(PaginationQuery query);
    Task<PessoaFisica?> GetByIdAsync(int id);
    Task<PessoaFisica?> GetByEmailAsync(string email);
    Task<PessoaFisica?> UpdateAsync(int id, PessoaUpdateRequest request);
    Task DeleteAsync(int id);
    Task<PessoaContato?> GetContatoAsync(int id);
    Task<(int Total, int WithCoords)> GetCountsAsync();
}
