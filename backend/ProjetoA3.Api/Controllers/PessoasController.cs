using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Dtos.Pessoas;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Repositories;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoasController : ControllerBase
{
    private readonly IPessoasRepository _repository;

    public PessoasController(IPessoasRepository repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<ActionResult<PessoaResponse>> Create([FromBody] PessoaCreateRequest request)
    {
        var pessoa = await _repository.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = pessoa.Id }, ToResponse(pessoa));
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PessoaResponse>>> List([FromQuery] PaginationQuery query)
    {
        var result = await _repository.ListAsync(query);
        var response = new PagedResult<PessoaResponse>
        {
            Items = result.Items.Select(ToResponse).ToList(),
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
        {
            return NotFound(new { message = "Pessoa física não encontrada" });
        }
        return Ok(ToResponse(pessoa));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PessoaResponse>> Update(int id, [FromBody] PessoaUpdateRequest request)
    {
        var pessoa = await _repository.UpdateAsync(id, request);
        if (pessoa is null)
        {
            return NotFound(new { message = "Pessoa física não encontrada" });
        }
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
        {
            return NotFound(new { message = "Contato não encontrado" });
        }

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
}
