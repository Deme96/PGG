# Portal Gospel Guineense (PGG) — Full-Stack

> **A Voz e a Luz da Comunidade Gospel na Guiné-Bissau**  
> Plataforma informativa trilingue (Português, Inglês e Francês) com **Frontend SPA em React 18 + Vite** e **Backend REST API em Node.js / Express + TypeScript**.

---

## 🏗️ Arquitetura do Sistema

O projeto está estruturado em duas camadas integradas:

```
PGG/
├── Frontend/                     # React, páginas, componentes, estilos e cliente HTTP
│   └── src/
├── Backend/                      # API Express, autenticação e persistência
│   ├── src/
│   ├── database/postgres_schema.sql
│   └── data/db.json              # origem preservada para a primeira migração
└── package.json                  # Workspaces e comandos para os dois serviços
```

As instruções e scripts atuais usam exclusivamente `Backend/`; a antiga pasta `server/` fica preservada como arquivo e não participa da execução nem da migração.

---

## 🔌 Endpoints da API REST Backend

O backend expõe endpoints completos com respostas em JSON:

| Módulo | Método | Endpoint | Descrição |
|---|---|---|---|
| **Sistema** | `GET` | `/api/health` | Estado do servidor e verificação de saúde |
| **Definições** | `GET`, `PUT` | `/api/settings` | Nome, lemas trilingues, contactos e redes |
| **Notícias** | `GET`, `POST` | `/api/articles` | Listagem e publicação de notícias |
| | `PUT`, `DELETE` | `/api/articles/:id` | Edição e remoção de notícias |
| | `POST` | `/api/articles/:id/view` | Incremento de contagem de leituras |
| **Vídeos** | `GET`, `POST` | `/api/videos` | Gestão de vídeos e transmissões |
| | `PUT`, `DELETE` | `/api/videos/:id` | Edição e remoção de vídeos |
| **Artistas** | `GET`, `POST` | `/api/artists` | Perfis e ministérios gospel guineenses |
| **Carrossel** | `GET`, `POST`, `PUT` | `/api/carousel-slides` | Banners e slides de destaque |
| **Departamentos** | `GET`, `PUT` | `/api/departments/:id` | Os 6 departamentos e suas lideranças |
| **Pessoal** | `GET`, `POST`, `PUT` | `/api/staff` | Fichas de colaboradores e assiduidade |
| **Escalas** | `GET`, `POST`, `PUT` | `/api/schedules` | Escalas de serviço e cumprimento |
| **Cobertura** | `GET`, `POST` | `/api/coverage-requests` | Pedidos de cobertura de eventos |
| | `POST` | `/api/coverage-requests/:id/approve` | **Aprova e gera automaticamente entrada na escala** |
| **Parcerias** | `GET`, `POST`, `PUT` | `/api/partnerships` | Acordos institucionais e apoios |
| **Publicação** | `GET`, `POST` | `/api/music-requests` | Pedidos da Zona do Artista com áudio e capa opcionais |
| **Finanças** | `GET`, `POST` | `/api/finances` | Entradas e saídas de fundos |
| | `GET` | `/api/finances/summary` | **Saldo líquido em tempo real (entradas − saídas)** |
| **Património** | `GET`, `POST` | `/api/assets` | Ativos e inventário de equipamentos |
| | `GET`, `POST` | `/api/liabilities` | Passivos, dívidas e faturas pendentes |
| **Tarefas** | `GET`, `POST`, `PUT` | `/api/tasks` | Trabalhos e atribuições pendentes |
| **Auditoria** | `GET` | `/api/logs` | Logs de sistema com IP, data e módulo |
| **Backups** | `GET` | `/api/backups/export` | Descarregar snapshot JSON completo |
| | `POST` | `/api/backups/restore` | Restaurar base de dados via JSON |
| **Acessos** | `GET`, `POST` | `/api/pings` | Registo e geolocalização de visitas |
| **Autenticação** | `POST` | `/api/auth/login` | Sessão administrativa validada pelo backend |
| | `GET` | `/api/auth/session` | Validação da sessão administrativa |
| | `POST` | `/api/auth/logout` | Terminar sessão administrativa |
| | `POST` | `/api/auth/community/login`, `/api/auth/community/register` | Acesso de membros com credenciais guardadas no PostgreSQL |
| **Utilizadores** | `GET`, `POST` | `/api/auth/users` | Listar e criar contas de gestão (administrador principal) |
| | `PUT`, `DELETE` | `/api/auth/users/:id` | Personalizar, desativar ou remover contas de gestão |

As operações de gestão requerem um token de sessão. Os pedidos públicos de leitura e os formulários públicos continuam acessíveis sem autenticação.

Os ficheiros enviados são guardados em `Backend/uploads/` com nomes gerados pelo servidor e são servidos pela API em `/api/uploads/`. A pasta é excluída do controlo de versões.

---

## 🎨 Identidade Visual e UI
- **Cores:** Azul-marinho institucional (`#14243B`), dourado de acento (`#C9A44C`) e fundo creme (`#FAF8F4`).
- **Tipografia:** Times New Roman em todo o portal e sistema de gestão.
- **Idiomas:** Seletor em lista **PT / EN / FR** persistido no browser, mostrando o idioma ativo.
- **Tema:** Alternância entre modo claro e escuro, com preferência guardada no browser.
- **Início:** O logótipo e o título do portal levam à página inicial.
- **Contacto:** `portalgospelgpc@gmail.com`.
- **Componentes:**
  - Carrossel com autoplay e pausa ao passar o rato.
  - Mapa do **Google Maps** centrado na cidade selecionada entre as localidades dos acessos registados.
  - O mapa apresenta os pings guardados; não determina a localização dos visitantes automaticamente nem infere a localização pelo IP.
  - Reprodutor de vídeo 16:9 integrado em diálogo modal.
  - Leitor modal de notícias com botões de partilha e marcador.
  - Formulário da Zona do Artista para agendamento e lançamento de louvores, com envio de áudio (MP3, WAV, M4A ou AAC até 20 MB) e capa (JPG, PNG ou WebP até 5 MB).
  - Ecrã de acesso dedicado à área de gestão, com sessão administrativa validada no backend.

---

## 🏛️ Menus e Submenus da Área de Gestão
- **Departamentos:** Direção, Reportagem, Transmissão, Redação, Secretaria Geral e Design Gráfico.
- **Recursos Humanos:** Pessoal e Escalas.
- **Património:** Ativos e Passivos.
- **Correspondências:** Pedidos de cobertura, Parcerias e acordos, Pedidos de publicação.
- **Finanças:** Entradas, Saídas e Saldo Disponível.
- **Configurações:** Dados do sistema, Notícias, Vídeos, Logs, Backup e Carrossel.
- **Utilizadores e Privilégios:** gestão de contas individuais, estado da conta e permissões por área, disponível ao administrador principal.

As contas de gestão usam e-mail e palavra-passe próprios, armazenados com hash scrypt no PostgreSQL; as permissões são verificadas também pela API. Uma alteração de privilégios ou palavra-passe termina as sessões ativas da conta. A conta principal `admin@portalgospel.gw` mantém acesso total e também autentica pelo hash armazenado em `users`.

---

## 🚀 Como Executar

### 1. Iniciar Frontend e Backend em simultâneo (Recomendado)
```bash
npm run dev:all
```
*Inicia o Backend na porta `5000` e o Frontend Vite na porta `5173` (com proxy `/api` automático).*

Configure a palavra-passe administrativa no ambiente do backend antes de iniciar os serviços:

```powershell
$env:DATABASE_URL = "URL_PRIVADA_DO_POSTGRES"
npm run migrate:postgres
$env:PGG_ADMIN_BOOTSTRAP_PASSWORD = "uma-palavra-passe-forte"
npm run admin:bootstrap
Remove-Item Env:PGG_ADMIN_BOOTSTRAP_PASSWORD
npm run dev:all
```

`PGG_ADMIN_BOOTSTRAP_PASSWORD` serve somente para criar/definir uma vez o hash da conta principal; remova-a do ambiente depois. O login usa o hash persistido no PostgreSQL, não uma variável de ambiente. `DATABASE_URL` é obrigatória e deve apontar para `pgg_db`; sem ligação, esquema e dados importados válidos o backend não inicia. Para desenvolvimento local, copie `.env.example` para `.env` e configure a URL. O `.env` é ignorado pelo Git; não use nem partilhe a URL com credenciais.

### Deploy do backend no Render

O ficheiro `render.yaml` configura o serviço web `pgg-api` e o Static Site `portal-gospel-guineense`. O frontend usa `VITE_API_URL` para chamar a API no backend; o valor de produção está em `Frontend/.env.production` e deve ser atualizado se o endereço público da API mudar. Configure `DATABASE_URL` com a **Internal Database URL** do banco Render `pgg_db`. O Render usa `/api/health` para verificar a disponibilidade do serviço.

Após criar o esquema e importar `Backend/data/db.json` uma única vez, defina temporariamente `PGG_ADMIN_BOOTSTRAP_PASSWORD` no serviço API e execute `npm run admin:bootstrap` no Shell. Remova a variável do ambiente depois da execução. O acesso principal é `admin@portalgospel.gw` com a palavra-passe escolhida; não coloque a palavra-passe em SQL nem a envie por chat.

Para um deploy manual do Static Site, use a raiz do repositório, o comando `npm ci --include=dev && npm run build --workspace=Frontend` e o diretório publicado `Frontend/dist`. `Frontend/.env.production` fornece o `VITE_API_URL`; uma variável de ambiente definida no Render pode substituí-lo. O endereço é incorporado ao bundle durante o build, então faça novo deploy após alterá-lo. Não coloque nele a palavra-passe administrativa. Para desenvolvimento local, copie `Frontend/.env.example` para `Frontend/.env`.

### 2. Iniciar apenas o Servidor Backend (API REST)
```bash
npm run server
```
*API acessível em `http://localhost:5000/api`.*

### 3. Iniciar apenas o Frontend
```bash
npm run dev
```
*Aplicação web acessível em `http://localhost:5173`.*

### 4. Compilação para Produção
```bash
npm run build
```
O build estático do Frontend é gerado em `Frontend/dist/` com todos os módulos otimizados.

## PostgreSQL e migração inicial

O backend e o frontend usam a API ligada ao PostgreSQL; os dados de conteúdo e gestão não têm fallback para JSON, mocks ou `localStorage`. Preferências de apresentação e o token de sessão administrativa continuam no armazenamento local do browser. O ficheiro `Backend/data/db.json` permanece intacto como origem da importação.

1. Configure `DATABASE_URL` para o banco `pgg_db`.
2. Crie as tabelas e índices no banco, uma única vez:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f Backend/database/postgres_schema.sql
```

3. Execute a migração **uma única vez** num ambiente com acesso a `DATABASE_URL` e ao repositório:

```bash
npm run migrate:postgres
```

O comando importa as coleções, os IDs e os dados atuais em uma transação. Só prossegue se todas as tabelas estiverem vazias; se o banco já contiver registos, interrompe sem os sobrescrever. Em caso de erro, a transação inteira é revertida e o JSON original não é apagado. Para Render, pode executar o comando no Shell do serviço API após configurar a URL e concluir o deploy.

Se os logs do Render indicarem `site_settings` ausente, execute `npm run migrate:postgres` uma única vez no Shell do serviço API; não adicione esse comando ao Build ou ao Pre-Deploy, pois ele não deve ser repetido após a importação. O script SQL opcional de criação do administrador não substitui esta migração e não deve ser executado antes dela.

Os backups JSON contêm os hashes de palavra-passe das contas para permitir restauro completo; guarde-os como credenciais confidenciais.
