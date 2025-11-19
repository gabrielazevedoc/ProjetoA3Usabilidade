# IRecycle – Portal completo de sustentabilidade

Aplicação full-stack que conecta cidadãos e empresas interessadas em dar destino correto aos resíduos. O projeto mantém o front-end estático original e adiciona uma API Node.js/Express com persistência em SQL Server, autenticação JWT e integração direta com o formulário e com o mapa Leaflet.

## Estrutura do projeto

```
├── assets/                 # Imagens e ícones utilizados no front
├── backend/                # Código do servidor Express
│   ├── config/db.js        # Conexão com o SQL Server (mssql)
│   ├── middleware/auth.js  # Middleware JWT e regra para empresas
│   ├── models/             # Camada de acesso às tabelas
│   ├── routes/             # Rotas REST (pessoas, empresas, auth)
│   └── server.js           # Ponto de entrada do back-end
├── database.sql            # Script de criação das tabelas
├── index.html              # Landing page + formulário multi-etapas
├── js/main.js              # Lógica do formulário, mapa e autenticação
├── styles/style.css        # Estilos responsivos do site
└── .env.example            # Variáveis de ambiente esperadas
```

## Pré-requisitos

- Node.js 18+
- SQL Server 2019+ com acesso ao `sqlcmd` ou outra ferramenta para executar o script

## Configuração do banco de dados

1. Crie um banco chamado `IRecycle` (ou outro nome de sua preferência).
2. Execute o conteúdo de [`database.sql`](./database.sql) para criar as tabelas `PessoasFisicas`, `Empresas` e `Residuos`.
3. Garanta que o usuário configurado tenha permissão de leitura/escrita.

## Variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com os dados do seu servidor SQL Server e com o segredo do JWT:

```
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourStrong!Passw0rd
DB_DATABASE=IRecycle
DB_PORT=1433
JWT_SECRET=super-secret-key
PORT=3000
```

> **Dica:** mantenha o `JWT_SECRET` em segredo; ele é utilizado para assinar os tokens de autenticação.

## Instalando e executando o back-end

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor Express:
   ```bash
   npm start
   ```
3. Por padrão a aplicação é servida em `http://localhost:3000`, entregando tanto a API quanto os arquivos estáticos (`index.html`, `js/`, `styles/`).

## Endpoints principais

### Pessoas físicas – `/api/pessoas`
- `POST /api/pessoas` – cria o cadastro da pessoa + resíduo (nome, telefone, e-mail, senha, localização opcional, tipo/quantidade e observações). A senha é salva com hash `bcrypt`.
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

- **Formulário “Cadastrar resíduo”**: continua com três etapas, agora exigindo criação de senha. Os dados são enviados via `fetch` para `POST /api/pessoas`. Após o sucesso, o mapa é recarregado.
- **Autenticação na interface**: botões no cabeçalho abrem um modal com abas “Entrar” e “Cadastrar” para pessoas físicas e empresas. Tokens são persistidos no `localStorage` e o cabeçalho mostra “Olá, ...” + botão de sair.
- **Mapa Leaflet dinâmico**: os marcadores são carregados usando `GET /api/pessoas`. Usuários comuns veem o nome mascarado, tipo e quantidade de resíduo; empresas logadas disparam um `GET /api/pessoas/:id/contato` ao abrir o popup para revelar telefone e e-mail.
- **Geolocalização**: a página tenta capturar latitude/longitude via `navigator.geolocation` ao enviar o formulário. Também é possível informar manualmente pelo modal de cadastro.

## Segurança implementada

- Hash de senhas com `bcryptjs` (nunca armazenamos senha em texto puro).
- Tokens JWT com expiração de 8 horas e middleware de autenticação.
- Middleware adicional `requireEmpresa` que garante que apenas empresas logadas possam acessar dados sensíveis de contato.
- Escapagem de HTML no front-end ao montar popups do Leaflet.

## Desenvolvendo

- O código do front continua totalmente em HTML/CSS/JS puro, facilitando o deploy estático.
- O Express serve os arquivos estáticos e a API na mesma porta, simplificando o consumo do front.
- Utilize `npm run dev` (requer `nodemon` instalado globalmente) se quiser hot reload durante o desenvolvimento.

## Próximos passos sugeridos

- Implementar uma tabela dedicada para resíduos, caso seja necessário armazenar múltiplos resíduos por pessoa.
- Adicionar refresh tokens e políticas mais avançadas de autorização.
- Criar testes automatizados para os modelos/rotas.
