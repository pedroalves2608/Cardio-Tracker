<<<<<<< HEAD
# Cardio Tracker

App web mobile-first para registrar treinos de cardio e visualizar progresso com gráficos.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **SQLite** + **Prisma**
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

### 2. Criar o banco e as tabelas (migração)

```bash
npm run db:migrate
```

Na primeira vez, informe um nome para a migration (ex: `init`).

### 3. (Opcional) Popular com dados de exemplo

```bash
npm run db:seed
```

Cria cerca de 15 treinos variados para testar listagem e gráficos.

### 4. Subir o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). No celular, use o mesmo IP da rede (ex: `http://192.168.1.x:3000`) para testar em dispositivo real.

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
- **Formulário**: data, tempo (min:s), distância (km), peso no pé (sim/não), notas
- **Gráficos**: distância, tempo e pace ao longo do tempo; filtros por período (7/30/90 dias ou tudo) e “somente com peso no pé”
- **Navegação**: bottom nav (Treinos, Adicionar, Gráficos)

## Regras de negócio

- Tempo é armazenado em **segundos** no banco (ex.: 12m30s = 750).
- **Pace** = tempo ÷ distância (segundos por km), exibido como `mm:ss`/km.
- Distância aceita decimais (ex.: 3.2, 10.5).
=======
# Cardio-Tracker
>>>>>>> 4b2a743ca85707bee26d47811aa7a907f054b8f6
