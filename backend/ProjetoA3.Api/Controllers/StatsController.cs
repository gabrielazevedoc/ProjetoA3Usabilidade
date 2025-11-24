using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Dtos.Stats;
using ProjetoA3.Api.Repositories;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IEmpresasRepository _empresasRepository;
    private readonly IPessoasRepository _pessoasRepository;

    public StatsController(IEmpresasRepository empresasRepository, IPessoasRepository pessoasRepository)
    {
        _empresasRepository = empresasRepository;
        _pessoasRepository = pessoasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<StatsResponse>> Get()
    {
        var empresas = await _empresasRepository.ListAsync();
        var (totalPessoas, withCoords) = await _pessoasRepository.GetCountsAsync();

        var stats = new StatsResponse
        {
            EmpresasCount = empresas?.Count ?? 0,
            UsuariosCount = totalPessoas,
            PontosColetaCount = withCoords
        };

        return Ok(stats);
    }
}
