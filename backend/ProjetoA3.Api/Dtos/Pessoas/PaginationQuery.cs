using System.ComponentModel.DataAnnotations;

namespace ProjetoA3.Api.Dtos.Pessoas;

public class PaginationQuery
{
    private const int DefaultPage = 1;
    private const int DefaultLimit = 20;

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = DefaultPage;

    [Range(1, 100)]
    public int Limit { get; set; } = DefaultLimit;

    public void Sanitize()
    {
        if (Page <= 0)
        {
            Page = DefaultPage;
        }

        if (Limit <= 0)
        {
            Limit = DefaultLimit;
        }
    }
}
