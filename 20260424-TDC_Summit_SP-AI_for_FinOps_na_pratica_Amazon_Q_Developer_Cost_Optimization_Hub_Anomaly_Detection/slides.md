---
marp: true
theme: default
paginate: true
backgroundColor: #121212
color: #E8EDF5
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

  section {
    font-family: 'Inter', sans-serif;
    background-color: #0A0E1A;
    color: #E8EDF5;
    padding: 60px 72px;
  }

  h1 {
    font-size: 2.6rem;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.15;
    margin-bottom: 0.3em;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 0.5em;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #D4AC0D;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.3em;
  }

  p {
    font-size: 1rem;
    line-height: 1.65;
    color: #B8C4D4;
  }

  ul {
    padding-left: 1.2em;
  }

  li {
    font-size: 0.9rem;
    line-height: 1.8;
    color: #B8C4D4;
    margin-bottom: 0.2em;
  }

  li strong {
    color: #E8EDF5;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    background: #161616;
    color: #D4AC0D;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.88em;
  }

  pre {
    background: #161616;
    border-left: 4px solid #D4AC0D;
    border-radius: 8px;
    padding: 20px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    color: #A8C4FF;
  }

  .tag {
    display: inline-block;
    background: #FF990022;
    border: 1px solid #D4AC0D;
    color: #D4AC0D;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 3px 12px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  .card {
    background: #161616;
    border: 1px solid #393b3f;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 12px;
  }

  .highlight {
    color: #D4AC0D;
    font-weight: 700;
  }

  .dim {
    color: #6B7A90;
    font-size: 0.85rem;
  }

  /* Cover slide */
  section.cover {
    background: linear-gradient(135deg, #0A0E1A 0%, #0D1B35 60%, #0A1628 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Section divider */
  section.divider {
    background: linear-gradient(135deg, #FF990015 0%, #161616 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    border-left: 6px solid #D4AC0D;
    padding-left: 80px;
  }

  section.divider h1 {
    font-size: 3rem;
    color: #D4AC0D;
  }

  section.divider p {
    font-size: 1.1rem;
    color: #B8C4D4;
  }

  /* Two columns */
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    margin-top: 16px;
  }

  .cols-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-top: 16px;
  }

  .col-card {
    background: #161616;
    border: 1px solid #393b3f;
    border-radius: 12px;
    padding: 24px;
  }

  .col-card h3 {
    margin-top: 0;
  }

  /* Big stat */
  .stat-block {
    text-align: center;
    padding: 24px;
    background: #161618;
    border-radius: 12px;
    border: 1px solid #393b3f;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 900;
    color: #D4AC0D;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #6B7A90;
    margin-top: 6px;
  }

  /* Step flow */
  .step {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .step-num {
    background: #D4AC0D;
    color: #0A0E1A;
    font-weight: 900;
    font-size: 0.9rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-content h4 {
    margin: 0 0 4px 0;
    color: #FFFFFF;
    font-size: 1rem;
  }

  .step-content p {
    margin: 0;
    font-size: 0.88rem;
    color: #7A8BA0;
  }

  /* Alert box */
  .alert {
    background: #FF990010;
    border: 1px solid #FF990055;
    border-radius: 10px;
    padding: 16px 20px;
    margin-top: 16px;
  }

  .alert p {
    margin: 0;
    color: #FFB84D;
    font-size: 0.92rem;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    font-size: 0.9rem;
  }

  th {
    background: #161616;
    color: #D4AC0D;
    text-align: left;
    padding: 10px 14px;
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  td {
    padding: 10px 14px;
    border-bottom: 1px solid #393b3f;
    color: #393b3f;
  }

  tr:last-child td {
    border-bottom: none;
  }

  /* Paginate styling */
  section::after {
    color: #2D3E55;
    font-size: 0.75rem;
  }

  /* Quote */
  blockquote {
    border-left: 3px solid #D4AC0D;
    margin: 20px 0;
    padding: 12px 20px;
    background: #161616;
    border-radius: 0 8px 8px 0;
  }

  blockquote p {
    font-style: italic;
    color: #C4D0E0;
    font-size: 1rem;
  }

  /* Others */
  .name {
    color: #D4AC0D;
    font-size: 1.4rem;
    text-align: right;
    font-weight: bold;
  }

  .reference p, .reference h3 {
    font-size: 0.7rem;
    margin: 0;
  }

  .end{
    font-size: 4rem;
    color: #D4AC0D;
    font-weight: bold;
    text-align: center
  }
---

<!-- _class: cover -->
<!-- _paginate: false -->

<span class="tag">TDC Summit SP 2026</span>

&nbsp;

# AI for FinOps na prática
## AWS Cost Anomaly Detection + Cost Optimization Hub + Amazon Q

&nbsp;

<p class="name">Felipe KiKo</p>

---

<!-- _class: divider -->
<!-- _paginate: false -->

# O problema real

&nbsp;

***Custos sobem...e quase todo mundo percebe tarde demais***

---

## O ciclo do incidente de custo

<div class="cols">
<div class="col-card">

### Como é

- Alerta chega com **2–5 dias de atraso**
- Investigação manual: consoles, relatórios, Slack, etc...
- Reuniões para descobrir "quem mexeu no quê"

</div>
<div class="col-card">

### O que queremos

- Detectar desvio **em horas**
- Entender causa em **minutos**
- Agir com contexto e rastreabilidade
- FinOps como operação **contínua**, e não reação

</div>
</div>

<div class="alert">
<p>A maioria das organizações demora + ou - 2 semanas para fechar o ciclo de "anomalia → ação"</p>
</div>

---

## E como? Exemplo prático de Playbook

&nbsp;

<div class="step">
  <div class="step-num">1</div>
  <div class="step-content">
    <h4>Detectar: AWS Cost Anomaly Detection</h4>
    <p>Monitores gerenciados, alertas e suporte a accounts / tags / categories</p>
  </div>
</div>

<div class="step">
  <div class="step-num">2</div>
  <div class="step-content">
    <h4>Priorizar: Cost Optimization Hub</h4>
    <p>Cost Efficiency como KPI e separando incidente de otimização</p>
  </div>
</div>

<div class="step">
  <div class="step-num">3</div>
  <div class="step-content">
    <h4>Investigar: Amazon Q</h4>
    <p>Perguntas em linguagem natural sobre billing e custo</p>
  </div>
</div>

---

## Mas antes...FinOps não é só cortar custo

&nbsp;

> *"FinOps é uma disciplina de gestão financeira de cloud que permite às equipes maximizar valor de negócio, tomando decisões informadas sobre tradeoffs entre velocidade, custo e qualidade."*
> — FinOps Foundation

---

## A dor que todo mundo sente

&nbsp;

- Multi-account, multi-serviço, multi-time...**multi** tudo!
- Custo raramente tem **um** motivo
- Engenharia + Produto + Finanças falam línguas **diferentes**
- A IA ajuda a **traduzir e acelerar**, mas não substitui julgamento

---

<!-- _class: divider -->
<!-- _paginate: false -->

# Passo 1: Detectar
**AWS Cost Anomaly Detection**

---

## AWS Cost Anomaly Detection

### O que é

- Serviço que usa ML para detectar padrões anômalos de gasto
- Compara spend atual com baseline histórico por dimensão
- Envia alertas via **SNS ou E-mail**

### Tipos de monitor

- **AWS Services**: por serviço (ex: EC2, RDS)
- **Linked Account**: por conta AWS
- **Cost Category**: agrupamentos customizados
- **Cost Allocation Tags**: por tag (ex: `team`, `env`)

---

## Anatomia de uma anomalia

<div>
<div>

### O que o alerta traz:

```
Anomaly detected: EC2 - us-east-1
Account: 123456789012 (prod-api)
Period: 2026-04-10 → 2026-04-12

Expected spend: $1,240 / day
Actual spend:   $4,870 / day
Impact: +$7,890 total

Root cause candidates:
  • Instance type: p3.16xlarge
  • Usage type: BoxUsage:p3.16xlarge
  • Region: us-east-1
```

</div>

---

## Boas práticas de configuração

&nbsp;

- **Threshold**: Combine valor absoluto + % para evitar ruído
- **Granularidade**: Diária para times de engenharia
- **Alertas**: Slack, Teams, Chat via SNS → menos e-mail ignorado
- **Tags obrigatórias**: `team`, `env`, `product`, ...

&nbsp;

<div class="alert">
<p><strong>IMPORTANTE:</strong> Anomalia sem tag = investigação cega</p>
</div>

</div>

---

<!-- _class: divider -->
<!-- _paginate: false -->

# Passo 2: Priorizar
**AWS Cost Optimization Hub**

---

## AWS Cost Optimization Hub

### O que é

Painel centralizado que **agrega e prioriza** recomendações de custo de múltiplos serviços AWS em um único lugar.

<div class="cols">
<div class="col-card">

### Fontes

- Compute Optimizer
- Trusted Advisor
- Savings Plans recommendations
- Reserved Instance recommendations
- RDS, EBS, Lambda, Fargate...

</div>
<div class="col-card">

### Para que serve aqui

- Separar **incidente** (anomalia) de **oportunidade contínua**
- Priorizar por impacto financeiro real
- Dar contexto antes de chamar o Amazon Q

</div>
</div>

---

## Incidente vs. Otimização Contínua

&nbsp;

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | **Anomalia (Incidente)** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | **Oportunidade (Hub)** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|---|---|---|
| **Origem** | Desvio do baseline ML | Rightsizing, Savings Plans |
| **Urgência** | Alta: Agir hoje | Média: Planejar sprint |
| **Ator** | Engenharia + FinOps | FinOps + Arquitetura |
| **Ferramenta** | Anomaly Detection + Q | Cost Optimization Hub |
| **KPI** | MTTR, impacto $$ | Cost Efficiency Score |

<div class="alert">
<p>Tratar uma anomalia como oportunidade de rightsizing causa <strong>confusão de prioridade</strong>...separe os fluxos antes de investigar</p>
</div>

---

<!-- _class: divider -->
<!-- _paginate: false -->

# Passo 3: Investigar
**Amazon Q**

---

## Amazon Q para Custos

### O que é...no contexto de billing!

- **IMPORTANTE:** Antes, Q Developer!
- Interface de linguagem natural integrada ao **AWS Cost Management**
- Acessa dados do **Cost Explorer, Cost & Usage Report (CUR), Savings Plans, Reserved Instances**
- Responde perguntas sobre **contas, serviços, tags, cost categories e períodos**
- Gera **insights** sem precisar escrever queries no Athena

<div class="alert">
<p>Amazon Q usa o contexto do Cost Explorer com permissões do usuário...ele não "acha" dados que você não tem acesso</p>
</div>

---

## Como o Q responde perguntas de custo

### Capacidades confirmadas

- Comparar spend **período vs período**
- Detalhar por **serviço, conta, região, tag**
- Identificar **top N serviços** por crescimento
- Explicar variações em **cost categories**
- Sugerir próximos passos (rightsizing, Savings Plans)

### Limites importantes

- Sem acesso a logs de infra (CloudTrail, CloudWatch)
- Sem contexto de deploys ou tickets (ex.: Jira, Trello, etc..)
- Responde com dados de billing, mas a **interpretação é sua**

---

## Prompt engineering para custo

&nbsp;

```
❌ Ruim:
"Por que meu custo aumentou?"


✅ Melhor:
"Compare o custo de EC2 em us-east-1 entre 1–7 Abril e 8–14 Abril, detalhado 
por usage type e conta. Mostre as top 3 variações absolutas em USD."


✅✅ Melhor ainda:
"[contexto acima] + A conta prod-data teve anomalia de +$14k.
O que mudou nessa conta nesse período?"
```

---


## Perguntas que eu faria ao Amazon Q

&nbsp;

```text
Compare os custos dos últimos 7 dias com os 7 dias anteriores
para a cost category X e mostre os maiores drivers.
```

```text
Quais contas, serviços e tags explicam 80% do aumento no período?
```

```text
Existe correlação com novas recomendações no Cost Optimization Hub
ou mudança de cobertura/utilização de Savings Plans?
```

```text
Monte um resumo executivo com causa provável, impacto e próximos passos.
```

---

## Da investigação à ação

### O que o Amazon Q entrega

<div class="cols">
<div class="col-card">

### Para time de engenharia

- Qual recurso/serviço gerou o custo
- Em qual conta e região
- Qual tag ou categoria (= qual time)
- Comparação período anterior

</div>
<div class="col-card">

### Para time de FinOps

- Impacto financeiro quantificado
- Se é anomalia ou tendência
- Oportunidade de Savings Plans / RI
- Baseline esperado pós-correção

</div>
</div>

<div class="alert">
<p>Use a resposta do Q como <strong>draft do ticket / post-mortem</strong>. Copie os dados, adicione contexto de infra, assine com o time responsável...rastreabilidade garantida!</p>
</div>

---

## A Dor do MTTD e MTTR

- Mean Time to Detect (MTTD): Quanto tempo leva para você saber do desvio?
- Mean Time to Resolve (MTTR): A IA entra para reduzir o tempo entre o alerta e a ação
- Detecção Lenta: Custos raramente explodem por um "único motivo" fácil de ver
- Investigação Manual: Horas cruzando Tags, Contas e UsageTypes no Cost Explorer

&nbsp;

<div class="cols-3">
<div class="stat-block">
  <div class="stat-number">MTTD</div>
  <div class="stat-label">Meta: < 8 horas<br/>do fato até o alerta</div>
</div>
<div class="stat-block">
  <div class="stat-number">MTTR</div>
  <div class="stat-label">Meta: < 4 horas<br/>do alerta à ação</div>
</div>
<div class="stat-block">
  <div class="stat-number">≥90%</div>
  <div class="stat-label">Recursos com tags<br/>obrigatórias</div>
</div>
</div>

---

<!-- _class: divider -->
<!-- _paginate: false -->

# Takeaways

---

## O que você leva daqui

### 3 ferramentas, 1 fluxo

- **Anomaly Detection** → detecta o "o quê"
- **Cost Optimization Hub** → prioriza o "agora ou depois"
- **Amazon Q** → explica o "por quê"

&nbsp;

<div class="alert">
<p><strong>A IA não decide...você decide!</strong><br />O Q dá dados estruturados e interpretação preliminar. A decisão de agir (parar uma instância, escalar uma conversa com o time, abrir um post-mortem) ainda é humana e requer contexto de negócio.</p>
</div>

---

## Referências

<div class="reference">

### AWS: Documentação oficial

- **Amazon Q para Cost Management**
  `docs.aws.amazon.com/cost-management/latest/userguide/ce-q-overview.html`

- **Cost Optimization Hub: Cost Efficiency Metric**
  `aws.amazon.com/about-aws/whats-new/2025/11/aws-cost-optimization-hub-cost-efficiency-metric-measure-track/`

- **Anomaly Detection: Managed Monitors**
  `aws.amazon.com/about-aws/whats-new/2025/11/aws-cost-anomaly-detection-managed-monitoring`

&nbsp;

### FinOps Foundation

- **FinOps Framework & Capabilities**
  `finops.org/framework`

- **Anomaly Management Capability**
  `finops.org/framework/capabilities/anomaly-management`

</div>

---

<!-- _class: cover -->
<!-- _paginate: false -->

<div class="end">
Dúvidas?<br />Obrigado!
<div>

![bg right:40% w:280px](./qrcode.png)