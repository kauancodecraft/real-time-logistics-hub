# Logistics Command Center

Um dashboard de análise de dados em tempo real para operações logísticas, desenvolvido com **React 19**, **FastAPI/tRPC**, **MySQL** e **Recharts**. O projeto simula operações de uma empresa de logística e fornece métricas de desempenho em tempo real.

## 🎯 Objetivo

Demonstrar habilidades de **desenvolvimento full-stack** com foco em:
- Arquitetura de dados escalável
- API em tempo real com tRPC
- Visualização de dados com gráficos interativos
- Simulação de operações logísticas
- Testes unitários e qualidade de código

## 🚀 Funcionalidades Principais

### 1. **Dashboard em Tempo Real**
- Atualização automática a cada 5 segundos
- KPIs principais: OTD, Tempo Médio, Faturamento, Lucro
- Gráficos interativos com Recharts
- Filtros por data, status e região

### 2. **Simulador de Operações**
- Gera dados fictícios realistas
- Simula movimentação de veículos
- Atualiza status de entregas automaticamente
- Registra custos operacionais

### 3. **Banco de Dados Robusto**
- 5 tabelas principais: `users`, `vehicles`, `deliveries`, `routes`, `operationalCosts`
- Relacionamentos bem definidos
- Queries otimizadas para performance

### 4. **API tRPC Completa**
- Endpoints para listar dados
- Filtros avançados (status, região, data)
- Cálculos de KPIs agregados
- Dashboard endpoint com todas as métricas

### 5. **Testes Unitários**
- 13 testes passando
- Cobertura de operações CRUD
- Validação de cálculos de KPIs

## 📊 Métricas Monitoradas

| Métrica | Descrição |
| --- | --- |
| **OTD (On-Time Delivery)** | Percentual de entregas no prazo |
| **Tempo Médio de Entrega** | Horas médias para completar uma entrega |
| **Faturamento Total** | Soma de todas as receitas |
| **Custos Operacionais** | Combustível, manutenção, pedágios, etc. |
| **Lucro** | Faturamento - Custos |
| **Entregas por Status** | Distribuição de pedidos (pendente, coletado, em trânsito, entregue, atrasado) |
| **Veículos por Status** | Disponível, em trânsito, manutenção |

## 🏗️ Arquitetura

```
logistics-command-center/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx  # Dashboard principal
│   │   ├── lib/
│   │   │   └── trpc.ts        # Cliente tRPC
│   │   ├── App.tsx            # Roteamento
│   │   └── index.css          # Estilos globais
│   └── public/
├── server/                    # Backend Node.js/Express
│   ├── simulator.ts           # Simulador de dados
│   ├── logistics.router.ts    # Endpoints tRPC
│   ├── db.ts                  # Queries do banco
│   ├── routers.ts             # Roteador principal
│   └── _core/
│       └── index.ts           # Servidor Express
├── drizzle/                   # ORM Drizzle
│   ├── schema.ts              # Definição de tabelas
│   └── migrations/
├── shared/                    # Código compartilhado
└── package.json
```

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
| --- | --- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express, tRPC, Drizzle ORM |
| **Banco de Dados** | MySQL |
| **Testes** | Vitest |
| **Build** | Vite, esbuild |

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- pnpm (ou npm/yarn)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/logistics-command-center.git
cd logistics-command-center

# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
DATABASE_URL=mysql://user:password@localhost:3306/logistics_db
JWT_SECRET=seu_secret_aqui
NODE_ENV=development
```

## 📈 Usando o Dashboard

1. **Acesse** `http://localhost:3000`
2. **Visualize** os KPIs em tempo real
3. **Filtre** por data para análises específicas
4. **Explore** os gráficos interativos
5. **Observe** as atualizações automáticas a cada 5 segundos

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar com cobertura
pnpm test -- --coverage

# Modo watch
pnpm test -- --watch
```

## 📊 Estrutura de Dados

### Veículos (vehicles)
```typescript
{
  id: number
  plate: string (único)
  model: string
  capacity: number (kg)
  fuelConsumption: number (km/l)
  status: "available" | "in_transit" | "maintenance"
  currentLatitude: decimal
  currentLongitude: decimal
  currentRegion: string
  totalKmRun: number
}
```

### Entregas (deliveries)
```typescript
{
  id: number
  trackingNumber: string (único)
  clientName: string
  originCity: string
  destinationCity: string
  region: string
  weight: number (kg)
  value: decimal
  status: "pending" | "collected" | "in_transit" | "delivered" | "delayed" | "cancelled"
  vehicleId: number (FK)
  scheduledDeliveryDate: timestamp
  actualDeliveryDate: timestamp
}
```

### Rotas (routes)
```typescript
{
  id: number
  routeCode: string (único)
  vehicleId: number (FK)
  region: string
  totalDistance: number (km)
  totalDeliveries: number
  completedDeliveries: number
  status: "planned" | "in_progress" | "completed" | "cancelled"
  startDate: timestamp
  endDate: timestamp
}
```

### Custos Operacionais (operationalCosts)
```typescript
{
  id: number
  vehicleId: number (FK)
  costType: "fuel" | "maintenance" | "toll" | "insurance" | "salary"
  amount: decimal
  description: string
  date: timestamp
}
```

## 🔌 API Endpoints (tRPC)

### Veículos
- `logistics.vehicles.list` - Listar todos os veículos

### Entregas
- `logistics.deliveries.list` - Listar todas as entregas
- `logistics.deliveries.byStatus` - Filtrar por status
- `logistics.deliveries.byRegion` - Filtrar por região
- `logistics.deliveries.byDateRange` - Filtrar por período

### Rotas
- `logistics.routes.list` - Listar todas as rotas

### Custos
- `logistics.costs.byVehicle` - Custos de um veículo
- `logistics.costs.byDateRange` - Custos em um período

### KPIs
- `logistics.kpis.otd` - Calcular OTD
- `logistics.kpis.averageDeliveryTime` - Tempo médio
- `logistics.kpis.totalRevenue` - Faturamento total
- `logistics.kpis.totalOperationalCosts` - Custos totais
- `logistics.kpis.dashboard` - Todos os dados do dashboard

## 🔄 Simulador em Tempo Real

O simulador executa automaticamente quando o servidor inicia:

1. **Inicialização**: Cria 5 veículos, 50 entregas e rotas iniciais
2. **Simulação**: A cada 10 segundos:
   - Atualiza posição dos veículos
   - Transiciona status de entregas (pending → collected → in_transit → delivered)
   - Simula atrasos aleatórios (15% de chance)
   - Registra custos operacionais

## 📝 Exemplo de Uso

```typescript
// Frontend - React Hook
import { trpc } from "@/lib/trpc";

function MyComponent() {
  const { data: dashboard } = trpc.logistics.kpis.dashboard.useQuery({
    startDate: "2026-02-01",
    endDate: "2026-03-04",
  });

  return (
    <div>
      <h1>OTD: {dashboard?.otd}%</h1>
      <p>Faturamento: R$ {dashboard?.revenue}</p>
    </div>
  );
}
```

## 🎨 Design

- **Tema**: Escuro profissional
- **Paleta de Cores**: Azul, verde, laranja, vermelho (para status)
- **Responsividade**: Desktop, tablet e mobile
- **Componentes**: shadcn/ui + Tailwind CSS

## 📦 Build para Produção

```bash
# Build
pnpm build

# Iniciar servidor de produção
pnpm start
```

## 🤝 Contribuindo

Este é um projeto de portfólio. Sinta-se livre para fazer fork e melhorar!

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido como projeto de portfólio para demonstrar habilidades de desenvolvimento full-stack.

---

**Última atualização**: Março de 2026

Para dúvidas ou sugestões, abra uma issue no repositório!
