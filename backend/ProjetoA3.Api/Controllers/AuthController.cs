using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Repositories;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Dtos.Auth;
using ProjetoA3.Api.Services;

namespace ProjetoA3.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IEmpresasRepository _empresasRepository;
        private readonly IPessoasRepository _pessoasRepository;
        private readonly IJwtTokenService _jwtService;

        public AuthController(IEmpresasRepository empresasRepository, IPessoasRepository pessoasRepository, IJwtTokenService jwtService)
        {
            _empresasRepository = empresasRepository;
            _pessoasRepository = pessoasRepository;
            _jwtService = jwtService;
        }

        [HttpPost("login-pessoa")]
        public async Task<IActionResult> LoginPessoa([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var pessoa = await _pessoasRepository.GetByEmailAsync(request.Email);
            if (pessoa == null) return Unauthorized();

            var valid = BCrypt.Net.BCrypt.Verify(request.Senha, pessoa.SenhaHash);
            if (!valid) return Unauthorized();

            var token = _jwtService.GenerateToken(pessoa.Id, pessoa.Nome, "pessoa");

            var response = new LoginResponse
            {
                Token = token,
                User = new AuthenticatedUser
                {
                    Id = pessoa.Id,
                    Nome = pessoa.Nome,
                    Tipo = "pessoa"
                }
            };

            return Ok(response);
        }

        [HttpPost("login-empresa")]
        public async Task<IActionResult> LoginEmpresa([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var empresa = await _empresasRepository.GetByEmailAsync(request.Email);
            if (empresa == null) return Unauthorized();

            var valid = BCrypt.Net.BCrypt.Verify(request.Senha, empresa.SenhaHash);
            if (!valid) return Unauthorized();

            var token = _jwtService.GenerateToken(empresa.Id, empresa.Nome, "empresa");

            var response = new LoginResponse
            {
                Token = token,
                User = new AuthenticatedUser
                {
                    Id = empresa.Id,
                    Nome = empresa.Nome,
                    Tipo = "empresa"
                }
            };

            return Ok(response);
        }
    }
}
