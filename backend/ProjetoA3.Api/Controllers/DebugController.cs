using Microsoft.AspNetCore.Mvc;

namespace ProjetoA3.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebugController : ControllerBase
{
    [HttpPost("echo")]
    public async Task<IActionResult> Echo()
    {
        using var reader = new StreamReader(Request.Body, System.Text.Encoding.UTF8);
        var body = await reader.ReadToEndAsync();
        return Ok(new { length = body?.Length ?? 0, body });
    }
}
