namespace ProjetoA3.Api.Dtos.Pessoas;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; set; } = Array.Empty<T>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
}
