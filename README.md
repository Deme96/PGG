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
│   └── data/db.json              # armazenamento persistente do backend
└── package.json                  # Workspaces e comandos para os dois serviços
```

As instruções e scripts atuais usam exclusivamente `Backend/`; a antiga pasta `server/` fica preservada como arquivo e não participa da execução.

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
| | `POST` | `/api/auth/community/login`, `/api/auth/community/register` | Acesso de membros com credenciais guardadas no ficheiro JSON |
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

As contas de gestão usam e-mail e palavra-passe próprios, armazenados com hash scrypt em `Backend/data/db.json`; as permissões são verificadas também pela API. Uma alteração de privilégios ou palavra-passe termina as outras sessões ativas da conta. O ficheiro inclui as contas `admin@portalgospel.gw` (acesso total), `redacao@portalgospel.gw` (configurações/conteúdo), `artista@portalgospel.gw` (correspondências) e `seguidor@portalgospel.gw` (sem acesso administrativo). Não há palavras-passe padrão: o administrador principal deve definir as credenciais das outras contas na gestão de utilizadores.

---

## 🚀 Como Executar

### 1. Iniciar Frontend e Backend em simultâneo (Recomendado)
```bash
npm run dev:all
```
*Inicia o Backend na porta `5000` e o Frontend Vite na porta `5173` (com proxy `/api` automático).*

Para desenvolvimento local, copie `.env.example` para `.env`. `PGG_DATA_FILE` é opcional e permite indicar outro caminho para o JSON; se esse caminho ainda não existir, o backend cria uma cópia inicial de `Backend/data/db.json`.

### Deploy do backend no Render

O `render.yaml` descreve o serviço web `pgg-api` e o Static Site `portal-gospel-guineense`, mas o deploy pode ser configurado manualmente no Dashboard do Render. O frontend usa `VITE_API_URL` para chamar a API; atualize `Frontend/.env.production` se o endereço público mudar. O Render usa `/api/health` para verificar a disponibilidade do serviço.

Para manter os dados entre deploys, associe um **Persistent Disk** ao serviço API e defina `PGG_DATA_FILE` para um caminho dentro do disco (por exemplo, `/var/data/db.json`). Sem um disco persistente, as alterações ao ficheiro podem ser perdidas em reinícios ou novos deploys. Este armazenamento não coordena várias instâncias do backend; mantenha apenas uma. A conta administrativa principal é `admin@portalgospel.gw`; a palavra-passe fica guardada como hash no ficheiro persistente, não numa variável de ambiente.

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

## Armazenamento e autenticação

O backend usa `Backend/data/db.json` para configurações, conteúdo, contas e demais coleções; não é necessário configurar PostgreSQL. As palavras-passe são guardadas com hash scrypt. O administrador principal pode alterar a própria palavra-passe pela área **Utilizadores e Privilégios**, informando a atual e escolhendo uma nova com 12 a 128 caracteres; as restantes contas podem receber ou alterar palavras-passe nessa área. Os backups JSON incluem hashes de palavra-passe; trate-os como credenciais confidenciais.

Os backups JSON contêm os hashes de palavra-passe das contas para permitir restauro completo; guarde-os como credenciais confidenciais.
