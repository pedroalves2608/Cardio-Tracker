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

### 2. Login (opcional)

O app exige login para acessar treinos e gráficos. Por padrão use **usuário:** `admin` e **senha:** `admin`. Para alterar, crie um arquivo `.env` na raiz (copie de `.env.example`) e defina:

- `LOGIN_USER` – usuário
- `LOGIN_PASSWORD` – senha
- `SESSION_SECRET` – chave do cookie de sessão (mude em produção)

Se não existir `.env`, valem os padrões acima.

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

## Scripts úteis

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Roda migrations (cria/atualiza tabelas) |
| `npm run db:seed` | Insere dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio (UI do banco) |

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
