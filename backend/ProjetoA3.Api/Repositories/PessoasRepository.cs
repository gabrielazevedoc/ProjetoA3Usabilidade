using Dapper;
using ProjetoA3.Api.Data;
using ProjetoA3.Api.Dtos.Pessoas;
using ProjetoA3.Api.Models;

namespace ProjetoA3.Api.Repositories;

public class PessoasRepository : IPessoasRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public PessoasRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PessoaFisica> CreateAsync(PessoaCreateRequest request)
    {
        var senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);
        const string sql = @"INSERT INTO Pessoas
            (Nome, Telefone, Email, SenhaHash, Latitude, Longitude, TipoResiduo, QuantidadeKg, Observacoes, CreatedAt)
            OUTPUT INSERTED.*
            VALUES (@Nome, @Telefone, @Email, @SenhaHash, @Latitude, @Longitude, @TipoResiduo, @QuantidadeKg, @Observacoes, GETUTCDATE());";

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleAsync<PessoaFisica>(sql, new
        {
            request.Nome,
            request.Telefone,
            request.Email,
            SenhaHash = senhaHash,
            request.Latitude,
            request.Longitude,
            request.TipoResiduo,
            request.QuantidadeKg,
            request.Observacoes
        });
    }

    public async Task<PagedResult<PessoaListItem>> ListAsync(PaginationQuery query)
    {
        query.Sanitize();
        var offset = (query.Page - 1) * query.Limit;

        const string sql = @"SELECT Id, Nome, Telefone, Email, Latitude, Longitude, TipoResiduo, QuantidadeKg, Observacoes, CreatedAt
                             FROM Pessoas
                             ORDER BY CreatedAt DESC
                             OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
                             SELECT COUNT(*) FROM Pessoas;";

        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        using var multi = await connection.QueryMultipleAsync(sql, new { Offset = offset, Limit = query.Limit });
        var items = (await multi.ReadAsync<PessoaListItem>()).ToList();
        var total = await multi.ReadSingleAsync<int>();

        return new PagedResult<PessoaListItem>
        {
            Items = items,
            Total = total,
            Page = query.Page,
            Limit = query.Limit
        };
    }

    public async Task<PessoaFisica?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM Pessoas WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<PessoaFisica>(sql, new { Id = id });
    }

    public async Task<PessoaFisica?> GetByEmailAsync(string email)
    {
        const string sql = "SELECT * FROM Pessoas WHERE Email = @Email";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<PessoaFisica>(sql, new { Email = email });
    }

    public async Task<PessoaFisica?> UpdateAsync(int id, PessoaUpdateRequest request)
    {
        var fields = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("Id", id);

        if (request.Nome is not null)
        {
            fields.Add("Nome = @Nome");
            parameters.Add("Nome", request.Nome);
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
        if (request.Latitude.HasValue)
        {
            fields.Add("Latitude = @Latitude");
            parameters.Add("Latitude", request.Latitude);
        }
        if (request.Longitude.HasValue)
        {
            fields.Add("Longitude = @Longitude");
            parameters.Add("Longitude", request.Longitude);
        }
        if (request.TipoResiduo is not null)
        {
            fields.Add("TipoResiduo = @TipoResiduo");
            parameters.Add("TipoResiduo", request.TipoResiduo);
        }
        if (request.QuantidadeKg.HasValue)
        {
            fields.Add("QuantidadeKg = @QuantidadeKg");
            parameters.Add("QuantidadeKg", request.QuantidadeKg);
        }
        if (request.Observacoes is not null)
        {
            fields.Add("Observacoes = @Observacoes");
            parameters.Add("Observacoes", request.Observacoes);
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

        var sql = $"UPDATE Pessoas SET {string.Join(", ", fields)} WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        await connection.ExecuteAsync(sql, parameters);
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Pessoas WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        await connection.ExecuteAsync(sql, new { Id = id });
    }

    public async Task<PessoaContato?> GetContatoAsync(int id)
    {
        const string sql = "SELECT Id, Nome, Telefone, Email FROM Pessoas WHERE Id = @Id";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<PessoaContato>(sql, new { Id = id });
    }
    
    public async Task<(int Total, int WithCoords)> GetCountsAsync()
    {
        const string sql = "SELECT COUNT(*) FROM Pessoas; SELECT COUNT(*) FROM Pessoas WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL;";
        await using var connection = await _connectionFactory.CreateOpenConnectionAsync();
        using var multi = await connection.QueryMultipleAsync(sql);
        var total = await multi.ReadSingleAsync<int>();
        var withCoords = await multi.ReadSingleAsync<int>();
        return (total, withCoords);
    }
}
