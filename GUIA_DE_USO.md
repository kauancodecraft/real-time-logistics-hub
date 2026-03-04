# 🚀 Guia de Uso - Logistics Command Center

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 10+ ([Instalação](https://pnpm.io/installation))
- **MySQL** 8.0+ ([Download](https://www.mysql.com/downloads/))

### Verificar Instalação

```bash
node --version      # Deve ser v18 ou superior
pnpm --version      # Deve ser 10 ou superior
mysql --version     # Deve ser 8.0 ou superior
```

---

## 🔧 Instalação Passo a Passo

### **Passo 1: Clonar o Repositório**

```bash
git clone https://github.com/kauancodecraft/real-time-logistics-hub.git
cd real-time-logistics-hub
```

### **Passo 2: Instalar Dependências**

```bash
pnpm install
```

Isso vai instalar todas as bibliotecas necessárias (React, Express, Drizzle, etc.).

### **Passo 3: Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
touch .env.local
```

Adicione o seguinte conteúdo:

```env
# Banco de Dados
DATABASE_URL=mysql://root:password@localhost:3306/logistics_db

# Segurança
JWT_SECRET=seu_secret_super_seguro_aqui_123456

# Ambiente
NODE_ENV=development
```

**Importante**: 
- Substitua `password` pela sua senha do MySQL
- Você pode usar qualquer string para `JWT_SECRET`
- Se estiver usando MySQL localmente sem senha, use: `mysql://root@localhost:3306/logistics_db`

### **Passo 4: Criar Banco de Dados (Opcional)

Se você quiser criar o banco manualmente:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE logistics_db;
EXIT;
```

### **Passo 5: Executar Migrações do Banco**

```bash
pnpm db:push
```

Isso vai:
- Gerar as migrações SQL baseadas no schema
- Criar todas as tabelas no banco de dados
- Preparar o banco para receber dados

---

## ▶️ Iniciando o Projeto

### **Modo Desenvolvimento**

```bash
pnpm dev
```

Você verá algo como:

```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
[Simulator] Logistics simulator initialized and started
```

### **Acessar a Aplicação**

Abra seu navegador e vá para:

```
http://localhost:3000
```

Você verá o dashboard com:
- ✅ 4 cards com KPIs (OTD, Tempo Médio, Faturamento, Lucro)
- ✅ 3 gráficos interativos
- ✅ Filtros de data
- ✅ Dados atualizando a cada 5 segundos

---

## 🧪 Executar Testes

### **Rodar Todos os Testes**

```bash
pnpm test
```

Você verá:

```
✓ server/auth.logout.test.ts (1 test)
✓ server/logistics.test.ts (12 tests)

Test Files  2 passed (2)
Tests  13 passed (13)
```

### **Modo Watch (Testes em Tempo Real)**

```bash
pnpm test -- --watch
```

Os testes rodam automaticamente quando você salva um arquivo.

---

## 🏗️ Build para Produção

### **Compilar o Projeto**

```bash
pnpm build
```

Isso vai:
- Compilar o React para produção
- Compilar o Node.js
- Otimizar o código
- Gerar arquivos em `dist/`

### **Iniciar em Produção**

```bash
pnpm start
```

---

## 📊 Usando o Dashboard

### **1. Visualizar Dados em Tempo Real**

Quando você acessa `http://localhost:3000`, vê:

```
┌─────────────────────────────────────────────────────┐
│        LOGISTICS COMMAND CENTER                     │
│   Dashboard em tempo real de operações logísticas   │
└─────────────────────────────────────────────────────┘

Filtros:
┌──────────────────┬──────────────────┐
│ Data Inicial     │ Data Final       │
│ 02/02/2026       │ 03/04/2026       │
└──────────────────┴──────────────────┘

KPIs:
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ OTD: 100%    │ Tempo: 0.0h  │ Faturamento: │ Lucro:       │
│              │              │ R$ 11.581    │ R$ -113.929  │
└──────────────┴──────────────┴──────────────┴──────────────┘

Gráficos:
[Gráfico de Pizza]          [Gráfico de Pizza]
Status das Entregas         Status dos Veículos

[Gráfico de Barras]
Entregas por Região
```

### **2. Filtrar por Data**

- Clique em **Data Inicial** e selecione uma data
- Clique em **Data Final** e selecione outra data
- Os dados se atualizam automaticamente

### **3. Observar Atualização em Tempo Real**

Os números e gráficos se atualizam **a cada 5 segundos** automaticamente. Você não precisa fazer nada!

### **4. Entender as Métricas**

| Métrica | O Que Significa |
| --- | --- |
| **OTD** | Percentual de entregas que chegaram no prazo |
| **Tempo Médio** | Horas médias para completar uma entrega |
| **Faturamento** | Quanto a empresa ganhou com as entregas |
| **Lucro** | Faturamento menos custos operacionais |

---

## 🔄 Como o Simulador Funciona

O simulador executa automaticamente quando o servidor inicia:

### **A Cada 10 Segundos:**

1. **Atualiza posição dos veículos**
   - Simula GPS (latitude, longitude)
   - Muda a região

2. **Transiciona status de entregas**
   - Pendente → Coletado → Em Trânsito → Entregue
   - 15% de chance de atraso

3. **Registra custos operacionais**
   - Combustível, manutenção, pedágios
   - Valores aleatórios realistas

### **Logs do Simulador**

Você verá no terminal:

```
[Simulator] Initializing with base data...
[Simulator] Vehicles initialized
[Simulator] Routes initialized
[Simulator] Deliveries initialized
[Simulator] Started
[Simulator] Operations simulated at 2026-03-04T15:33:23.697Z
[Simulator] Operations simulated at 2026-03-04T15:33:33.695Z
```

---

## 🐛 Solução de Problemas

### **Erro: "Database not available"**

**Solução**: Verifique se o MySQL está rodando:

```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo service mysql start
```

### **Erro: "Cannot find module"**

**Solução**: Reinstale as dependências:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **Erro: "Port 3000 already in use"**

**Solução**: Mude a porta:

```bash
PORT=3001 pnpm dev
```

Depois acesse `http://localhost:3001`

### **Testes Falhando**

**Solução**: Certifique-se de que o banco de dados está rodando:

```bash
pnpm test
```

---

## 📁 Estrutura do Projeto

```
real-time-logistics-hub/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx  # Dashboard principal
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── lib/
│   │   │   └── trpc.ts        # Cliente tRPC
│   │   ├── App.tsx            # Roteamento
│   │   └── index.css          # Estilos globais
│   ├── public/                # Arquivos estáticos
│   └── index.html
│
├── server/                    # Backend Node.js
│   ├── simulator.ts           # Simulador de dados
│   ├── logistics.router.ts    # Endpoints tRPC
│   ├── logistics.test.ts      # Testes
│   ├── db.ts                  # Queries do banco
│   ├── routers.ts             # Roteador principal
│   └── _core/
│       ├── index.ts           # Servidor Express
│       ├── context.ts         # Contexto tRPC
│       └── oauth.ts           # Autenticação
│
├── drizzle/                   # ORM Drizzle
│   ├── schema.ts              # Definição de tabelas
│   └── migrations/            # Migrações SQL
│
├── shared/                    # Código compartilhado
│   └── const.ts               # Constantes
│
├── README.md                  # Documentação principal
├── GUIA_DE_USO.md            # Este arquivo
├── package.json               # Dependências
└── .env.local                 # Variáveis de ambiente (não commitar)
```

---

## 🔌 API Endpoints (tRPC)

Se você quiser entender a API:

### **Listar Dados**

```typescript
// Frontend
const { data: vehicles } = trpc.logistics.vehicles.list.useQuery();
const { data: deliveries } = trpc.logistics.deliveries.list.useQuery();
const { data: routes } = trpc.logistics.routes.list.useQuery();
```

### **Filtrar Dados**

```typescript
// Por status
const { data } = trpc.logistics.deliveries.byStatus.useQuery({ 
  status: "delivered" 
});

// Por região
const { data } = trpc.logistics.deliveries.byRegion.useQuery({ 
  region: "São Paulo" 
});

// Por data
const { data } = trpc.logistics.deliveries.byDateRange.useQuery({ 
  startDate: "2026-02-01",
  endDate: "2026-03-04"
});
```

### **Obter Dashboard Completo**

```typescript
const { data: dashboard } = trpc.logistics.kpis.dashboard.useQuery({
  startDate: "2026-02-01",
  endDate: "2026-03-04"
});

// Retorna:
// {
//   otd: 100,
//   avgTime: 0,
//   revenue: 11581,
//   costs: 125510,
//   profit: -113929,
//   deliveryStatusCount: { pending: 0, collected: 0, ... },
//   vehicleStatusCount: { available: 2, in_transit: 2, ... },
//   totalDeliveries: 50,
//   totalVehicles: 5
// }
```

---

## 📚 Documentação Adicional

- **README.md**: Visão geral do projeto
- **GUIA_DE_USO.md**: Este arquivo (como usar)
- **EXPLICACAO_PROJETO.md**: Explicação detalhada para recrutadores

---

## 🎯 Próximos Passos

Depois de ter tudo rodando, você pode:

1. **Explorar o código**: Veja como tudo funciona
2. **Modificar o simulador**: Altere `server/simulator.ts` para gerar dados diferentes
3. **Adicionar novas métricas**: Crie novos cálculos em `server/db.ts`
4. **Customizar o dashboard**: Modifique `client/src/pages/Dashboard.tsx`
5. **Adicionar testes**: Crie novos testes em `server/logistics.test.ts`

---

## 💬 Dúvidas?

Se tiver problemas:

1. Verifique se todas as dependências estão instaladas: `pnpm install`
2. Verifique se o MySQL está rodando
3. Verifique se o `.env.local` está configurado corretamente
4. Veja os logs no terminal para mensagens de erro

---

## 📞 Suporte

Para mais informações:
- Veja o **README.md** para arquitetura e stack
- Veja o **EXPLICACAO_PROJETO.md** para entender o projeto
- Veja o código em `server/` e `client/` para detalhes técnicos

---

**Pronto para começar? Execute `pnpm dev` e veja a mágica acontecer! 🚀**
