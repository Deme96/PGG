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
│   └── data/db.json
└── package.json                  # Workspaces e comandos para os dois serviços
```

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
| | `POST` | `/api/backups/reset` | Repor valores padrão de demonstração |
| **Acessos** | `GET`, `POST` | `/api/pings` | Registo e geolocalização de visitas |
| **Autenticação** | `POST` | `/api/auth/login` | Sessão administrativa validada pelo backend |
| | `GET` | `/api/auth/session` | Validação da sessão administrativa |
| | `POST` | `/api/auth/logout` | Terminar sessão administrativa |
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

As contas de gestão adicionais usam e-mail e palavra-passe próprios. O administrador principal cria e personaliza estas contas; as palavras-passe são armazenadas com hash scrypt e as permissões são verificadas também pela API. Uma alteração de privilégios ou palavra-passe termina as sessões ativas da conta. A conta principal `admin@portalgospel.gw` mantém acesso total e continua a usar `PGG_ADMIN_PASSWORD`.

---

## 🚀 Como Executar

### 1. Iniciar Frontend e Backend em simultâneo (Recomendado)
```bash
npm run dev:all
```
*Inicia o Backend na porta `5000` e o Frontend Vite na porta `5173` (com proxy `/api` automático).*

Configure a palavra-passe administrativa no ambiente do backend antes de iniciar os serviços:

```powershell
$env:PGG_ADMIN_PASSWORD = "uma-palavra-passe-forte"
npm run dev:all
```

O acesso de administrador utiliza o e-mail `admin@portalgospel.gw`. Não existe palavra-passe padrão; a API rejeita o login até que `PGG_ADMIN_PASSWORD` esteja configurada.

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
