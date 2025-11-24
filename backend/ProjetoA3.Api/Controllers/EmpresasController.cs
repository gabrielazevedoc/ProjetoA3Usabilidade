using Microsoft.AspNetCore.Mvc;
using ProjetoA3.Api.Models;
using ProjetoA3.Api.Repositories;
using ProjetoA3.Api.Dtos.Empresas;

namespace ProjetoA3.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpresasController : ControllerBase
    {
        private readonly IEmpresasRepository _repository;

        public EmpresasController(IEmpresasRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var empresas = await _repository.ListAsync();
            return Ok(empresas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var empresa = await _repository.GetByIdAsync(id);
            if (empresa == null) return NotFound();
            return Ok(empresa);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmpresaCreateRequest request)
        {
            var empresa = await _repository.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = empresa.Id }, empresa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EmpresaUpdateRequest request)
        {
            var empresa = await _repository.UpdateAsync(id, request);
            if (empresa == null) return NotFound();
            return Ok(empresa);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
