using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Dtos.Auth;
using ProjetoA3.Api.Repositories;
using ProjetoA3.Api.Services;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IPessoasRepository _pessoasRepository;
    private readonly IEmpresasRepository _empresasRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(IPessoasRepository pessoasRepository, IEmpresasRepository empresasRepository, IJwtTokenService jwtTokenService)
    {
        _pessoasRepository = pessoasRepository;
        _empresasRepository = empresasRepository;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("login-pessoa")]
    public async Task<ActionResult<LoginResponse>> LoginPessoa([FromBody] LoginRequest request)
    {
        var pessoa = await _pessoasRepository.GetByEmailAsync(request.Email);
        if (pessoa is null || !BCrypt.Net.BCrypt.Verify(request.Senha, pessoa.SenhaHash))
        {
            return Unauthorized(new { message = "Credenciais inválidas" });
        }

        var token = _jwtTokenService.GenerateToken(pessoa.Id, pessoa.Nome, "pessoa");
        return Ok(new LoginResponse
        {
            Token = token,
            User = new AuthenticatedUser
            {
                Id = pessoa.Id,
                Nome = pessoa.Nome,
                Tipo = "pessoa"
            }
        });
    }

    [HttpPost("login-empresa")]
    public async Task<ActionResult<LoginResponse>> LoginEmpresa([FromBody] LoginRequest request)
    {
        var empresa = await _empresasRepository.GetByEmailAsync(request.Email);
        if (empresa is null || !BCrypt.Net.BCrypt.Verify(request.Senha, empresa.SenhaHash))
        {
            return Unauthorized(new { message = "Credenciais inválidas" });
        }

        var token = _jwtTokenService.GenerateToken(empresa.Id, empresa.RazaoSocial, "empresa");
        return Ok(new LoginResponse
        {
            Token = token,
            User = new AuthenticatedUser
            {
                Id = empresa.Id,
                Nome = empresa.RazaoSocial,
                Tipo = "empresa"
            }
        });
    }
}
