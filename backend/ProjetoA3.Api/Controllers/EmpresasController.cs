using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Dtos.Empresas;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Repositories;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly IEmpresasRepository _repository;

    public EmpresasController(IEmpresasRepository repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<ActionResult<EmpresaResponse>> Create([FromBody] EmpresaCreateRequest request)
    {
        var empresa = await _repository.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = empresa.Id }, ToResponse(empresa));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmpresaResponse>>> List()
    {
        var empresas = await _repository.ListAsync();
        return Ok(empresas.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmpresaResponse>> GetById(int id)
    {
        var empresa = await _repository.GetByIdAsync(id);
        if (empresa is null)
        {
            return NotFound(new { message = "Empresa não encontrada" });
        }
        return Ok(ToResponse(empresa));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmpresaResponse>> Update(int id, [FromBody] EmpresaUpdateRequest request)
    {
        var empresa = await _repository.UpdateAsync(id, request);
        if (empresa is null)
        {
            return NotFound(new { message = "Empresa não encontrada" });
        }
        return Ok(ToResponse(empresa));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }

    private static EmpresaResponse ToResponse(Empresa empresa) => new()
    {
        Id = empresa.Id,
        RazaoSocial = empresa.RazaoSocial,
        NomeContato = empresa.NomeContato,
        Telefone = empresa.Telefone,
        Email = empresa.Email,
        Cnpj = empresa.Cnpj,
        CreatedAt = empresa.CreatedAt
    };
}
