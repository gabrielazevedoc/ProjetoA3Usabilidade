using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ProjetoA3.Api.Dtos.Pessoas;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Repositories;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly IPessoasRepository _repository;
    private readonly ProjetoA3.Api.Configuration.JwtSettings _jwtSettings;

    public PessoasController(IPessoasRepository repository, IOptions<ProjetoA3.Api.Configuration.JwtSettings> jwtOptions)
    {
        _repository = repository;
        _jwtSettings = jwtOptions?.Value ?? throw new ArgumentNullException(nameof(jwtOptions));
    }

    [HttpPost]
    public async Task<ActionResult<PessoaResponse>> Create([FromBody] PessoaCreateRequest request)
    {
        // Se houver Authorization, fazemos validação simples do token JWT;
        // caso contrário permitimos criação pública de pessoas (cadastro aberto).
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            var principal = ValidateToken(token);
            if (principal is null)
                return Unauthorized(new { message = "Token inválido ou expirado" });

            var role = principal.FindFirst(ClaimTypes.Role)?.Value;
            if (role is null || role != "empresa")
                return Forbid();
        }

        var pessoa = await _repository.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = pessoa.Id }, ToResponse(pessoa));
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.Key);
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            return principal;
        }
        catch
        {
            return null;
        }
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PessoaResponse>>> List([FromQuery] PaginationQuery query)
    {
        var result = await _repository.ListAsync(query);

        var response = new PagedResult<PessoaResponse>
        {
            Items = result.Items
                .Select(p => ToResponse(p)) 
                .ToList(),
            Total = result.Total,
            Page = result.Page,
            Limit = result.Limit
        };

        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PessoaResponse>> GetById(int id)
    {
        var pessoa = await _repository.GetByIdAsync(id);
        if (pessoa is null)
            return NotFound(new { message = "Pessoa física não encontrada" });

        return Ok(ToResponse(pessoa));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PessoaResponse>> Update(int id, [FromBody] PessoaUpdateRequest request)
    {
        var pessoa = await _repository.UpdateAsync(id, request);
        if (pessoa is null)
            return NotFound(new { message = "Pessoa física não encontrada" });

        return Ok(ToResponse(pessoa));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id:int}/contato")]
    [Authorize(Policy = "EmpresaOnly")]
    public async Task<ActionResult<PessoaContatoResponse>> GetContato(int id)
    {
        var contato = await _repository.GetContatoAsync(id);
        if (contato is null)
            return NotFound(new { message = "Contato não encontrado" });

        return Ok(new PessoaContatoResponse
        {
            Id = contato.Id,
            Nome = contato.Nome,
            Telefone = contato.Telefone,
            Email = contato.Email
        });
    }

    
    private static PessoaResponse ToResponse(PessoaFisica pessoa) => new()
    {
        Id = pessoa.Id,
        Nome = pessoa.Nome,
        Telefone = pessoa.Telefone,
        Email = pessoa.Email,
        Latitude = pessoa.Latitude,
        Longitude = pessoa.Longitude,
        TipoResiduo = pessoa.TipoResiduo,
        QuantidadeKg = pessoa.QuantidadeKg,
        Observacoes = pessoa.Observacoes,
        CreatedAt = pessoa.CreatedAt
    };

    
    private static PessoaResponse ToResponse(PessoaListItem pessoa) => new()
    {
        Id = pessoa.Id,
        Nome = pessoa.Nome,
        Telefone = pessoa.Telefone,
        Email = pessoa.Email,
        Latitude = pessoa.Latitude,
        Longitude = pessoa.Longitude,
        TipoResiduo = pessoa.TipoResiduo,
        QuantidadeKg = pessoa.QuantidadeKg,
        Observacoes = pessoa.Observacoes,
        CreatedAt = pessoa.CreatedAt
    };
}
