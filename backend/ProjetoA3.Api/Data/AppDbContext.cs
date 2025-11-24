using Microsoft.EntityFrameworkCore;
using ProjetoA3.Api.Models;

namespace ProjetoA3.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<PessoaFisica> Pessoas { get; set; }
        public DbSet<Empresa> Empresas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PessoaFisica>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nome).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            });

            modelBuilder.Entity<Empresa>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RazaoSocial).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Nome).HasMaxLength(150).IsRequired();
                entity.Property(e => e.Cnpj).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(150).IsRequired(false);
                entity.Property(e => e.Telefone).HasMaxLength(30).IsRequired(false);
                entity.Property(e => e.SenhaHash).HasMaxLength(200).IsRequired(false);
            });
        }
    }
}
