# Cardio Tracker

App web mobile-first para registrar treinos de cardio e visualizar progresso com gráficos.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **SQLite** + **Prisma** (banco local em `prisma/dev.db`)
- **Recharts** (gráficos)

## Pré-requisitos

- Node.js 18+
- npm

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

(O `postinstall` já roda `prisma generate`.)

### 2. Login e criar conta

O app exige login para acessar treinos e gráficos.

- **Criar conta:** na tela de login, use o link **"Criar conta"** para se cadastrar (usuário, email opcional, senha com pelo menos 6 caracteres). Após criar, você já entra no app. Se informar email e o Resend estiver configurado, um link de confirmação será enviado.
- **Entrar:** se já tiver conta, informe usuário e senha. Se existir usuário no banco, o login é validado nele; caso contrário, vale o fallback do `.env` (usuário/senha padrão `admin`/`admin`).
- No `.env` (opcional): `LOGIN_USER`, `LOGIN_PASSWORD`, `SESSION_SECRET` (para fallback e cookie).

### 3. Banco de dados (SQLite)

O banco fica em `prisma/dev.db`.

- **Primeira vez ou após mudar o schema:** rode as migrations:
  ```bash
  npm run db:migrate
  ```
  (Na primeira vez, informe um nome para a migration, ex.: `init`.)

- **Ou** aplicar migrations já existentes (ex.: em CI):
  ```bash
  npx prisma migrate deploy
  ```

### 4. (Opcional) Dados de exemplo

```bash
npm run db:seed
```

Cria cerca de 15 treinos variados para testar listagem e gráficos.

### 5. Subir o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). No celular, use o mesmo IP da rede (ex.: `http://192.168.1.x:3000`) para testar em dispositivo real.

**Se aparecer erro do Prisma (ex.: "Unknown argument"):** pare o servidor (Ctrl+C), rode `npx prisma generate` e depois `npm run dev` de novo.

### 6. Testes

**Unitários (Vitest):**
```bash
npm run test
```
Testes para `lib/auth`, `lib/utils` e `lib/validation`.

**E2E (Playwright):**
```bash
npm run test:e2e
```
Sobe o servidor automaticamente e roda os fluxos de login e criação de conta. Na primeira vez, instale os browsers: `npx playwright install`.

## Produção

Para deploy (ex.: Vercel), configure:

1. **SESSION_SECRET** (obrigatório)  
   Gere uma chave forte, ex.: `openssl rand -base64 32`. Se não definir em produção, o app recusa requisições de sessão.

2. **Banco de dados**  
   Em produção use um banco remoto (PostgreSQL). Ex.: Vercel Postgres, Neon, Supabase. Defina `DATABASE_URL` no ambiente e ajuste o `provider` em `prisma/schema.prisma` para `postgresql` se necessário. Rode `npx prisma migrate deploy` no deploy.

3. **Esqueci a senha (email)**  
   Para enviar o link de redefinição por email, crie uma conta em [Resend](https://resend.com), gere uma API key e defina no ambiente:
   - `RESEND_API_KEY=re_xxxx`
   - Opcional: `RESEND_FROM=Seu App <noreply@seudominio.com>` (em teste pode usar `onboarding@resend.dev`).

4. **Confirmação de email**  
   Ao criar conta com email, um link de confirmação é enviado (se `RESEND_API_KEY` estiver definido). O usuário acessa `/verify-email?token=...` para marcar o email como verificado.

5. **Rate limiting**  
   O login limita a 5 tentativas por IP a cada 15 minutos. Por padrão usa memória local; em deploy com várias instâncias defina `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (crie um banco em [Upstash](https://upstash.com)) para usar Redis e compartilhar a contagem.

6. **PWA**  
   O app inclui `manifest.json` e um service worker para “Adicionar à tela inicial” no celular. Há ícones placeholder em `public/icon-192.png` e `public/icon-512.png`; substitua por PNGs 192×192 e 512×512 para ícones personalizados. O service worker faz cache de `/_next/static/` para uso offline básico.

Copie `.env.example` para `.env` e preencha os valores. Não commite o `.env`.

### Deploy na Vercel

1. **Criar projeto e conectar repositório**  
   No [Vercel](https://vercel.com), crie um novo projeto e conecte o repositório do app (GitHub/GitLab/Bitbucket).

2. **Banco de dados (PostgreSQL)**  
   Adicione um banco:
   - **Vercel Postgres:** no dashboard do projeto, aba Storage → Create Database → Postgres; a `DATABASE_URL` é preenchida automaticamente.
   - **Neon / Supabase:** crie o banco no serviço, copie a connection string e adicione como variável de ambiente `DATABASE_URL` (ex.: `postgresql://user:pass@host/db?sslmode=require`).

3. **Schema Prisma em produção**  
   O projeto usa SQLite por padrão. Para produção com PostgreSQL:
   - Altere em `prisma/schema.prisma`: `provider = "postgresql"` e `url = env("DATABASE_URL")`.
   - O script `npm run build` já executa `prisma migrate deploy` e `prisma generate` antes do `next build`. Defina `DATABASE_URL` no projeto Vercel para o build.
   - Se quiser manter dev com SQLite e produção com Postgres, troque o provider/url ao fazer deploy ou use variáveis diferentes.

4. **Variáveis de ambiente na Vercel**  
   Em Settings → Environment Variables, defina:
   - **Obrigatórias:** `SESSION_SECRET`, `DATABASE_URL` (se usar Postgres no deploy).
   - **Opcionais:** `RESEND_API_KEY`, `RESEND_FROM`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

5. **Deploy**  
   Faça push para o branch conectado ou clique em Redeploy. Após o deploy, acesse a URL do projeto.

6. **Health check**  
   O endpoint `GET /api/health` retorna `200` com `{ ok: true }` (e `{ db: "ok" }` se o banco estiver acessível). Não exige autenticação. Use para monitoramento ou para o platform verificar se a app está no ar.

## Scripts úteis

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Webpack) |
| `npm run dev:turbo` | Servidor de desenvolvimento com Turbopack |
| `npm run build` | Build de produção (migrations + Prisma + Next) |
| `npm run build:next` | Só build do Next.js (útil se `prisma generate` falhar com EPERM) |
| `npm run start` | Servidor de produção (porta 3000; rode `npm run build` antes) |
| `npm run start:prod` | Servidor de produção na porta 3001 (rode `npm run build` ou `npm run build:next` antes) |
| `npm run test` | Roda testes unitários (Vitest) |
| `npm run test:watch` | Testes unitários em modo watch |
| `npm run test:e2e` | Testes E2E (Playwright; sobe o servidor se necessário) |
| `npm run test:e2e:ui` | Playwright em modo UI |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Roda migrations (cria/atualiza tabelas) |
| `npm run db:seed` | Insere dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio (UI do banco) |

## Troubleshooting

### Porta 3000 em uso (EADDRINUSE)

Se `npm run start` falhar com `Error: listen EADDRINUSE: address already in use :::3000`:

- **Opção 1:** Use a porta 3001: `npm run start:prod` e abra [http://localhost:3001](http://localhost:3001).
- **Opção 2:** Liberte a porta 3000. No PowerShell (como administrador, se precisar):
  ```powershell
  netstat -ano | findstr :3000
  ```
  Anote o PID (última coluna) do processo que usa a porta e encerre-o:
  ```powershell
  taskkill /PID <número_do_pid> /F
  ```
  Depois rode `npm run start` de novo.

### "This page isn't working" / "localhost is currently unable to handle this request"

Se a página não carrega ao abrir `http://localhost:3000/workouts` (ou outra rota):

- **Confirme que o servidor está a correr.** No terminal deve estar ativo `npm run dev` ou `npm run start` (ou `npm run start:prod`).
- **Use a porta certa:** `npm run dev` e `npm run start` usam a **porta 3000** → abra [http://localhost:3000](http://localhost:3000). O comando `npm run start:prod` usa a **porta 3001** → abra [http://localhost:3001](http://localhost:3001). Se abrir a porta errada, o browser mostra "This page isn't working".
- Espere o Next avisar que está pronto (ex.: "Ready in X ms") antes de abrir o link.

### "This page isn't working" / EvalError ao rodar `npm run start`

Em alguns ambientes (Node/Windows), o middleware do Next.js no Edge Runtime pode falhar com *Code generation from strings disallowed*. O projeto está configurado **sem** o ficheiro `middleware.ts` ativo (a lógica de redirecionamento para login está em `middleware.reference.ts` apenas como referência).

- **Garanta que não existe `middleware.ts`** na raiz do projeto (apenas `middleware.reference.ts`).
- Faça um build limpo e suba de novo:
  ```bash
  rmdir /s /q .next
  npm run build:next
  npm run start
  ```
  Se `npm run build` falhar com EPERM no Prisma, feche todos os terminais e o IDE que tenham o projeto aberto, depois rode só `npm run build:next` e `npm run start`.
- **Prefira `npm run dev`** para desenvolvimento; em produção (Vercel, etc.) o middleware não é usado neste projeto.

### Erro "Cannot read properties of undefined (reading 'call')" em desenvolvimento

Em alguns ambientes (Windows, Node, cache do browser), o Next.js pode mostrar este erro ao carregar a página. É um problema conhecido do runtime (webpack/RSC) e não do código da aplicação. Tente por esta ordem:

1. **Atualização forçada no browser:** Ctrl+Shift+R (ou Cmd+Shift+R no Mac) para recarregar sem cache.
2. **Limpar cache do site:** DevTools → Application → Storage → Clear site data para localhost.
3. **Build limpo:** apague a pasta `.next`, reinicie o servidor e abra de novo:
   ```bash
   rmdir /s /q .next
   npm run dev
   ```
4. **Testar em produção:** o erro pode ocorrer só em dev. Rode `npm run build` e depois `npm run start` e abra http://localhost:3000. Se funcionar em produção, use esse fluxo para validar o app.
5. **Alternar bundler em dev:** o script `npm run dev` usa Webpack. Se tiver usado Turbopack antes, teste com `npm run dev:turbo` (ou o contrário) para ver se um deles é estável no seu ambiente.

Se o erro aparecer mesmo assim, a tela "Algo deu errado" (global-error) deve permitir **Tentar novamente** ou **Ir para Treinos**; recarregar a página manualmente (F5) costuma resolver nessa sessão.

### Porta 3000 já em uso

Se aparecer `EADDRINUSE: address already in use :::3000`, use outra porta:

```bash
npm run start:prod
```

Isso sobe o servidor em **http://localhost:3001**.

## Estrutura

- `/app` – rotas e páginas (App Router)
- `/components` – componentes reutilizáveis (WorkoutForm, WorkoutList, BottomNav, StatsSummary, ChartsView)
- `/lib` – Prisma client, validação (Zod), utils (pace, tempo, etc.)
- `/prisma` – schema, migrations e seed

## Funcionalidades (V1)

- **Treinos**: lista dos últimos treinos, resumo da semana (total km, pace médio), adicionar / editar / excluir
- **Formulário**: data, tempo (min:s), distância (km), peso no pé (sim/não e valor em kg), notas
- **Gráficos**: distância, tempo e pace ao longo do tempo; filtros por período (7/30/90 dias ou tudo) e “somente com peso no pé”
- **Navegação**: bottom nav (Treinos, Adicionar, Gráficos)

## Regras de negócio

- Tempo é armazenado em **segundos** no banco (ex.: 12m30s = 750).
- **Pace** = tempo ÷ distância (segundos por km), exibido como `mm:ss`/km.
- Distância aceita decimais (ex.: 3.2, 10.5).
- **Carga** = distância × peso no pé (kg·km) quando o peso for informado.
