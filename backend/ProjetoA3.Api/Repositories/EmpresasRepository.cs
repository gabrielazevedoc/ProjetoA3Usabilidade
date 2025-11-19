using Dapper;
using ProjetoA3.Api.Data;
using ProjetoA3.Api.Dtos.Empresas;
using ProjetoA3.Api.Models;

namespace ProjetoA3.Api.Repositories;

public class EmpresasRepository : IEmpresasRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public EmpresasRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Empresa> CreateAsync(EmpresaCreateRequest request)
    {
        var senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);
        const string sql = @"INSERT INTO Empresas (RazaoSocial, NomeContato, Telefone, Email, SenhaHash, Cnpj)
                             OUTPUT INSERTED.*
                             VALUES (@RazaoSocial, @NomeContato, @Telefone, @Email, @SenhaHash, @Cnpj);";

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleAsync<Empresa>(sql, new
        {
            request.RazaoSocial,
            request.NomeContato,
            request.Telefone,
            request.Email,
            SenhaHash = senhaHash,
            request.Cnpj
        });
    }

    public async Task<IReadOnlyCollection<Empresa>> ListAsync()
    {
        const string sql = "SELECT Id, RazaoSocial, NomeContato, Telefone, Email, Cnpj, CreatedAt FROM Empresas ORDER BY CreatedAt DESC";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        var result = await connection.QueryAsync<Empresa>(sql);
        return result.ToList();
    }

    public async Task<Empresa?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM Empresas WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<Empresa>(sql, new { Id = id });
    }

    public async Task<Empresa?> GetByEmailAsync(string email)
    {
        const string sql = "SELECT * FROM Empresas WHERE Email = @Email";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<Empresa>(sql, new { Email = email });
    }

    public async Task<Empresa?> UpdateAsync(int id, EmpresaUpdateRequest request)
    {
        var fields = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("Id", id);

        if (request.RazaoSocial is not null)
        {
            fields.Add("RazaoSocial = @RazaoSocial");
            parameters.Add("RazaoSocial", request.RazaoSocial);
        }
        if (request.NomeContato is not null)
        {
            fields.Add("NomeContato = @NomeContato");
            parameters.Add("NomeContato", request.NomeContato);
        }
        if (request.Telefone is not null)
        {
            fields.Add("Telefone = @Telefone");
            parameters.Add("Telefone", request.Telefone);
        }
        if (request.Email is not null)
        {
            fields.Add("Email = @Email");
            parameters.Add("Email", request.Email);
        }
        if (request.Cnpj is not null)
        {
            fields.Add("Cnpj = @Cnpj");
            parameters.Add("Cnpj", request.Cnpj);
        }
        if (!string.IsNullOrWhiteSpace(request.Senha))
        {
            fields.Add("SenhaHash = @SenhaHash");
            parameters.Add("SenhaHash", BCrypt.Net.BCrypt.HashPassword(request.Senha));
        }

        if (fields.Count == 0)
        {
            return await GetByIdAsync(id);
        }

        var sql = $"UPDATE Empresas SET {string.Join(", ", fields)} WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        await connection.ExecuteAsync(sql, parameters);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Empresas WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        await connection.ExecuteAsync(sql, new { Id = id });
    }
}
