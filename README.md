# IRecycle – Portal de Sustentabilidade

Sistema full-stack desenvolvido para conectar cidadãos, empresas e ONGs no processo de reciclagem e destinação correta de resíduos. O projeto integra um frontend moderno com Bootstrap e um backend robusto em **.NET 8 / ASP.NET Core**, utilizando SQL Server, autenticação JWT, Dapper e Entity Framework Core.

## 🎯 Funcionalidades

### Frontend
- **Carrossel Bootstrap** com imagens sobre sustentabilidade e reciclagem
- **Formulário multi-etapas** para cadastro de resíduos (pessoas físicas)
- **Mapa interativo Leaflet** exibindo pontos de coleta e resíduos cadastrados
- **Sistema de autenticação** com modais para login/cadastro de pessoas e empresas
- **Painel administrativo** completo com CRUD para gerenciar pessoas físicas e empresas
- **Dashboard com estatísticas** dinâmicas (empresas, usuários, pontos de coleta)
- **Design responsivo** com navegação intuitiva e acessibilidade

### Backend
- **API RESTful** com ASP.NET Core 8
- **Dual ORM**: Entity Framework Core (Empresas) + Dapper (Pessoas)
- **Autenticação JWT** com tokens seguros e hash BCrypt
- **CRUD completo** para pessoas físicas e empresas
- **Endpoints protegidos** com políticas de autorização
- **Validação de dados** e tratamento de erros
- **CORS configurado** para integração frontend/backend

## 📂 Estrutura do Projeto

```
ProjetoA3Usabilidade/
├── assets/                     # Imagens, ícones e recursos visuais
├── backend/
│   ├── ProjetoA3Backend.sln   # Solution .NET
│   └── ProjetoA3.Api/
│       ├── Controllers/        # AuthController, PessoasController, EmpresasController
│       ├── Data/              # AppDbContext, SqlConnectionFactory
│       ├── Dtos/              # Requests e Responses (Auth, Pessoas, Empresas)
│       ├── Models/            # PessoaFisica, Empresa
│       ├── Repositories/      # Interfaces e implementações (Dapper + EF Core)
│       ├── Services/          # JwtTokenService
│       ├── Configuration/     # JwtSettings
│       ├── Migrations/        # Entity Framework Migrations
│       ├── Program.cs         # Configuração da aplicação
│       └── appsettings.json   # Configurações e connection string
├── js/
│   └── main.js               # Lógica do formulário, mapa, autenticação e stats
├── styles/
│   └── style.css            # Estilos personalizados + variáveis CSS
├── admin.html               # Painel administrativo com CRUD completo
├── index.html              # Página principal com carrossel e formulários
├── database.sql           # Script de criação do banco de dados
└── README.md             # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **C# / .NET 8** - Framework principal
- **ASP.NET Core Web API** - Criação da API RESTful
- **Entity Framework Core** - ORM para gerenciamento de Empresas
- **Dapper** - Micro-ORM para operações com Pessoas (performance)
- **SQL Server** - Banco de dados relacional
- **BCrypt.Net** - Hash seguro de senhas
- **JWT (JSON Web Tokens)** - Autenticação stateless
- **Swashbuckle (Swagger)** - Documentação automática da API

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos com variáveis CSS e responsividade
- **JavaScript ES6+** - Lógica client-side (Vanilla JS)
- **Bootstrap 5.3** - Framework CSS para carrossel e componentes
- **Leaflet.js** - Mapa interativo para visualização de pontos
- **Font Awesome** - Biblioteca de ícones
- **Google Fonts (Poppins)** - Tipografia moderna

### Ferramentas
- **Git / GitHub** - Controle de versão
- **Python HTTP Server** - Servidor de desenvolvimento para frontend
- **Visual Studio Code** - IDE de desenvolvimento

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
- [SQL Server 2019+](https://www.microsoft.com/sql-server/sql-server-downloads) (local ou remoto)
- [Python 3.x](https://www.python.org/downloads/) (para servidor HTTP de desenvolvimento)
- Git para controle de versão

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco de dados

```sql
CREATE DATABASE db_a3;
GO
USE db_a3;
```

### 2. Executar o script de criação das tabelas

Execute o arquivo `database.sql` que contém:
- Tabela `Pessoas` - Cadastro de pessoas físicas com resíduos
- Tabela `Empresas` - Cadastro de empresas parceiras

**Opção 1: SQL Server Management Studio (SSMS)**
- Abra o SSMS
- Conecte-se ao servidor
- Abra o arquivo `database.sql`
- Execute o script (F5)

**Opção 2: Linha de comando**
```bash
sqlcmd -S .\SQLEXPRESS -i database.sql
```

### 3. Configurar a connection string

Edite o arquivo `backend/ProjetoA3.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=db_a3;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "sua-chave-secreta-super-segura-com-no-minimo-32-caracteres",
    "Issuer": "ProjetoA3",
    "Audience": "ProjetoA3",
    "ExpiresHours": 8
  }
}
```

> ⚠️ **Importante**: Altere a `Jwt:Key` para uma chave segura em produção!

## 🚀 Como Executar o Projeto

### Backend (.NET API)

1. **Navegue até o diretório do backend:**
   ```bash
   cd backend/ProjetoA3.Api
   ```

2. **Restaure os pacotes NuGet:**
   ```bash
   dotnet restore
   ```

3. **(Opcional) Aplique as migrations do Entity Framework:**
   ```bash
   dotnet ef database update
   ```

4. **Inicie o servidor:**
   ```bash
   dotnet run
   ```

O backend estará disponível em: **http://localhost:5000**
- API Base: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/swagger` (documentação interativa)

### Frontend

1. **Navegue até o diretório raiz do projeto:**
   ```bash
   cd c:\Users\rodrigo.oliveira\Desktop\ProjetoA3Usabilidade-main
   ```

2. **Inicie um servidor HTTP local:**
   
   **Opção 1: Python**
   ```bash
   py -3 -m http.server 8000
   ```
   
   **Opção 2: Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

3. **Acesse no navegador:**
   - Página principal: http://localhost:8000/index.html
   - Painel admin: http://localhost:8000/admin.html

### Credenciais de Administrador

Para acessar o painel administrativo, use:
- **Email:** admin@gmail.com
- **Senha:** admin123

> 💡 **Dica**: Se o usuário admin não existir, crie-o através do endpoint `POST /api/pessoas` com estes dados.

## 📡 Documentação da API

### Base URL
```
http://localhost:5000/api
```

### Autenticação

#### Login de Pessoa Física
```http
POST /api/auth/login-pessoa
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@email.com",
    "tipo": "pessoa"
  }
}
```

#### Login de Empresa
```http
POST /api/auth/login-empresa
Content-Type: application/json

{
  "email": "empresa@email.com",
  "senha": "senha123"
}
```

### Pessoas Físicas

#### Listar todas as pessoas
```http
GET /api/pessoas
```

#### Buscar pessoa por ID
```http
GET /api/pessoas/{id}
```

#### Criar nova pessoa
```http
POST /api/pessoas
Content-Type: application/json

{
  "nome": "João Silva",
  "telefone": "(11) 98765-4321",
  "email": "joao@email.com",
  "senha": "senha123",
  "tipoResiduo": "Plástico",
  "quantidadeKg": 15.5,
  "observacoes": "Garrafas PET",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

#### Atualizar pessoa
```http
PUT /api/pessoas/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "nome": "João Silva Santos",
  "telefone": "(11) 98765-4321"
}
```

#### Deletar pessoa
```http
DELETE /api/pessoas/{id}
Authorization: Bearer {token}
```

### Empresas

#### Listar todas as empresas
```http
GET /api/empresas
```

#### Criar nova empresa
```http
POST /api/empresas
Content-Type: application/json

{
  "nome": "EcoRecicla Ltda",
  "cnpj": "12.345.678/0001-90",
  "razaoSocial": "EcoRecicla Reciclagem Ltda",
  "telefone": "(11) 3456-7890",
  "email": "contato@ecorecicla.com.br",
  "senha": "senha123"
}
```

#### Atualizar empresa
```http
PUT /api/empresas/{id}
Authorization: Bearer {token}
```

#### Deletar empresa
```http
DELETE /api/empresas/{id}
Authorization: Bearer {token}
```

### Estatísticas

```http
GET /api/stats
```

**Resposta:**
```json
{
  "empresasCount": 5,
  "usuariosCount": 127,
  "pontosColetaCount": 15
}
```

## 🎨 Funcionalidades do Frontend

### Página Principal (index.html)

1. **Carrossel de Imagens**
   - 3 slides com imagens sobre reciclagem e sustentabilidade
   - Navegação automática e manual
   - Legendas informativas

2. **Estatísticas Dinâmicas**
   - Empresas cadastradas
   - Usuários ativos
   - Pontos de coleta
   - Atualização em tempo real via API

3. **Formulário de Cadastro de Resíduos**
   - Multi-etapas com validação
   - Captura de geolocalização opcional
   - Integração direta com a API

4. **Mapa Interativo**
   - Visualização de pontos de coleta
   - Markers clicáveis com informações
   - Integração com Leaflet.js

5. **Sistema de Autenticação**
   - Login para pessoas físicas e empresas
   - Cadastro com validação de campos
   - Persistência de sessão com JWT

### Painel Administrativo (admin.html)

1. **Autenticação Restrita**
   - Acesso exclusivo para admin@gmail.com
   - Validação de credenciais via API
   - Sessão persistida com localStorage

2. **Interface com Abas**
   - **Pessoas Físicas**: Gerenciamento completo de usuários
   - **Empresas**: CRUD de empresas parceiras

3. **Funcionalidades CRUD**
   - **Create**: Formulário modal com validação
   - **Read**: Tabela responsiva com dados dinâmicos
   - **Update**: Edição inline com pré-preenchimento
   - **Delete**: Confirmação antes de remover

4. **Recursos Adicionais**
   - Busca por nome, email ou telefone
   - Filtro por tipo de resíduo (pessoas)
   - Formulários dinâmicos adaptáveis
   - Feedback visual de operações

## 🔒 Segurança

- **Hash de Senhas**: BCrypt com salt automático
- **JWT Tokens**: Autenticação stateless e segura
- **HTTPS Ready**: Configurável para produção
- **CORS Configurado**: Proteção contra requisições não autorizadas
- **Validação de Dados**: Backend e frontend
- **SQL Injection Protection**: Queries parametrizadas (Dapper + EF Core)
- **XSS Protection**: Escapamento de HTML no frontend

## 🛠️ Desenvolvimento

### Hot Reload
```bash
dotnet watch run
```

### Estrutura de Código
- **Frontend**: HTML/CSS/JS puro (Vanilla JavaScript)
- **Backend**: Arquitetura em camadas com Repository Pattern
- **Database**: Dual ORM (Dapper para performance + EF Core para migrations)

### Boas Práticas Implementadas
- Separation of Concerns
- Dependency Injection nativa do .NET
- DTOs para contratos de API
- Validação em múltiplas camadas
- Tratamento centralizado de erros

## 📝 Próximos Passos

- [ ] Implementar paginação na listagem de pessoas/empresas
- [ ] Adicionar refresh tokens para segurança aprimorada
- [ ] Criar testes unitários e de integração
- [ ] Implementar upload de imagens de resíduos
- [ ] Dashboard com gráficos e analytics
- [ ] Sistema de notificações em tempo real
- [ ] Aplicativo mobile com React Native
- [ ] Internacionalização (i18n)

## 👥 Autores

- **Rodrigo Oliveira** - Desenvolvimento Full Stack
- **Gabriela Azevedo** - Contribuições e melhorias

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Unsplash pelas imagens de reciclagem
- Comunidade .NET e JavaScript
- Leaflet.js pelo mapa interativo
- Bootstrap pela facilidade de UI

---

**🌱 Desenvolvido com propósito de criar um futuro mais sustentável!**
