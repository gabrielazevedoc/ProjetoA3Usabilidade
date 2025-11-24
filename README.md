# IRecycle – Portal completo de sustentabilidade

Aplicação full-stack que conecta cidadãos e empresas interessadas em dar destino correto aos resíduos. O projeto mantém o front-end estático original e expõe uma API REST criada em **.NET 8 / ASP.NET Core** integrada ao SQL Server, com autenticação JWT e integração direta com o formulário e com o mapa Leaflet.

## Estrutura do projeto

```
├── assets/                 # Imagens e ícones utilizados no front
├── backend/
│   ├── ProjetoA3Backend.sln    # Solution com a Web API
│   └── ProjetoA3.Api/          # Projeto ASP.NET Core
│       ├── Controllers/        # Endpoints (Pessoas, Empresas, Auth)
│       ├── Dtos/               # Contratos de entrada/saída
│       ├── Models/             # Entidades utilizadas pelo Dapper
│       ├── Repositories/       # Camada de acesso ao SQL Server
│       ├── Services/           # Serviços de suporte (JWT, conexão)
│       └── appsettings.json    # Configuração padrão
├── database.sql            # Script de criação das tabelas
├── index.html              # Landing page + formulário multi-etapas
├── js/main.js              # Lógica do formulário, mapa e autenticação
├── styles/style.css        # Estilos responsivos do site
└── .env.example            # Variáveis de ambiente esperadas
```

## Pré-requisitos

- [.NET SDK 8.0](https://dotnet.microsoft.com/download)
- SQL Server 2019+ (local ou remoto)

## Configuração do banco de dados

1. Crie um banco chamado `IRecycle` (ou outro nome de sua preferência).
2. Execute o conteúdo de [`database.sql`](./database.sql) para criar as tabelas `PessoasFisicas`, `Empresas` e `Residuos`.
3. Garanta que o usuário configurado tenha permissão de leitura/escrita.

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis abaixo. O ASP.NET Core mapeia automaticamente as variáveis em formato `Section__Key` para o `appsettings`:

```
ConnectionStrings__DefaultConnection=Server=localhost;Database=IRecycle;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;
Jwt__Key=altere-esta-chave-no-ambiente
Jwt__Issuer=ProjetoA3
Jwt__Audience=ProjetoA3
Jwt__ExpiresHours=8
ASPNETCORE_URLS=http://0.0.0.0:5000
```

> **Dica:** mantenha o `Jwt__Key` em segredo; ele é utilizado para assinar os tokens de autenticação.

## Executando o back-end ASP.NET Core

1. Instale os pacotes NuGet:
   ```bash
   cd backend/ProjetoA3.Api
   dotnet restore
   ```
2. Inicie a API em modo desenvolvimento:
   ```bash
   dotnet run
   ```
3. Por padrão a aplicação é servida em `http://localhost:5000` e expõe o Swagger em `http://localhost:5000/swagger`.

> Caso deseje alterar a URL/porta utilize a variável `ASPNETCORE_URLS` ou o arquivo `launchSettings.json` (não incluso).

## Endpoints principais

### Pessoas físicas – `/api/pessoas`
- `POST /api/pessoas` – cria o cadastro da pessoa + resíduo (nome, telefone, e-mail, senha, localização opcional, tipo/quantidade e observações). A senha é salva com hash `BCrypt`.
- `GET /api/pessoas?page=1&limit=20` – lista paginada dos cadastros (utilizada pelo mapa Leaflet).
- `GET /api/pessoas/:id` – detalhes completos.
- `PUT /api/pessoas/:id` – atualização parcial.
- `DELETE /api/pessoas/:id` – remoção definitiva.
- `GET /api/pessoas/:id/contato` – **rota protegida** que devolve telefone e e-mail; requer token de uma empresa autenticada.

### Empresas – `/api/empresas`
CRUD equivalente ao de pessoas, com campos de razão social, contato, telefone, e-mail, CNPJ e senha com hash.

### Autenticação – `/api/auth`
- `POST /api/auth/login-pessoa`
- `POST /api/auth/login-empresa`

Ambas retornam `{ token, user }`, onde `user.tipo` indica se é pessoa ou empresa. O token deve ser enviado no header `Authorization: Bearer <token>` para acessar rotas protegidas.

## Integração com o front-end

- **Formulário “Cadastrar resíduo”**: continua com três etapas, exigindo criação de senha. Os dados são enviados via `fetch` para `POST /api/pessoas`. Após o sucesso, o mapa é recarregado.
- **Autenticação na interface**: botões no cabeçalho abrem um modal com abas “Entrar” e “Cadastrar” para pessoas físicas e empresas. Tokens são persistidos no `localStorage` e o cabeçalho mostra “Olá, ...” + botão de sair.
- **Mapa Leaflet dinâmico**: os marcadores são carregados usando `GET /api/pessoas`. Usuários comuns veem o nome mascarado, tipo e quantidade de resíduo; empresas logadas disparam um `GET /api/pessoas/:id/contato` ao abrir o popup para revelar telefone e e-mail.
- **Geolocalização**: a página tenta capturar latitude/longitude via `navigator.geolocation` ao enviar o formulário. Também é possível informar manualmente pelo modal de cadastro.

## Segurança implementada

- Hash de senhas com `BCrypt.Net-Next` (nunca armazenamos senha em texto puro).
- Tokens JWT com expiração configurável e autenticação/autorizações integradas ao ASP.NET Core.
- Política `EmpresaOnly` que garante que apenas empresas logadas possam acessar dados sensíveis de contato.
- Escapagem de HTML no front-end ao montar popups do Leaflet.

## Desenvolvendo

- O código do front continua totalmente em HTML/CSS/JS puro, facilitando o deploy estático.
- A Web API ASP.NET Core fica isolada no diretório `backend/` e pode ser publicada em qualquer ambiente compatível com .NET 8.
- Utilize `dotnet watch run` para hot reload durante o desenvolvimento, se desejar.

## Próximos passos sugeridos

- Implementar uma tabela dedicada para resíduos, caso seja necessário armazenar múltiplos resíduos por pessoa.
- Adicionar refresh tokens e políticas mais avançadas de autorização.
- Criar testes automatizados para os repositórios/controles.
