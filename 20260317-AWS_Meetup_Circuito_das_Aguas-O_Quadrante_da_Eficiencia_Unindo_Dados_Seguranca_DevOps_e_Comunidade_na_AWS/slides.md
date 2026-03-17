---

marp: true
paginate: true
size: 16:9
title: Do Terraform à Engenharia de Plataforma
description: Reduzindo a carga cognitiva do time

---

<style>
    :root {
        --yellow: #D4AC0D;
        --bg: #121212;
        --text: #e6edf3;
    }

    section {
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
        padding: 60px;
        font-size: 30px;
    }

    h1 {
        color: var(--yellow);
        font-size: 60px;
    }

    h2 {
        color: white;
        font-size: 48px;
    }

    h3 {
        color: var(--yellow);
    }

    h4 {
        color: var(--yellow);
        text-align: center;
        font-size: 80px;
    }

    h5 {
        text-align: right;
        font-style: italic;
    }

    strong {
        color: var(--yellow);
    }
</style>

# Do Terraform à Engenharia de Plataforma:
## Reduzindo a carga cognitiva do time
&nbsp;
&nbsp;
&nbsp;

### Felipe KiKo
&nbsp;

AWS User Group Circuito das Águas Paulista
*O Quadrante da Eficiência: Unindo Dados, Segurança, DevOps e Comunidade na AWS*

---

# Qual é o problema?

Times de engenharia hoje precisam saber (além do desenvolvimento):

- Kubernetes, Container
- IaC, Terraform, Cloudformation
- CI/CD
- Networking
- Observabilidade
- Segurança, IAM
- Custos
- ...

***Ahhhhhhhh!!*** **Isso cria uma carga enorme em cima dos times!**

---

# Como geralmente começamos

No início tudo parece simples
&nbsp;

Time usa:

- Terraform
- Alguns módulos
- Minimamente um CI/CD
- Documentação
&nbsp;
&nbsp;
&nbsp;

---

# Porém, o problema aparece rápido...

Cada time precisa aprender:

- Como escrever Terraform
- Como criar módulos
- Como configurar IAM
- Como estruturar pipelines
- Como configurar observabilidade
- Como implementar boas práticas
&nbsp;

Resultado: **Cada time vira parcialmente um time de plataforma**

---

# Sinais de alerta

Algumas coisas começam a acontecer:

- PRs enormes de Terraform
- Pipelines complexos (...e quando eles quebram?? Vishhh)
- Erros de IAM difíceis de debugar
- Inconsistência entre serviços
- Onboarding lento
&nbsp;
&nbsp;

Desenvolvedores passam mais tempo **lutando contra infra** do que entregando produto e valor 😢

---

# Dica...Terraform não é o problema!

Terraform é **excelente** para:

- Gestão declarativa de infraestrutura
- Versionamento
- Automação
- Padronização
&nbsp;
&nbsp;
&nbsp;

Mas ele é uma **ferramenta de plataforma**, não necessariamente uma **interface de desenvolvedor**

---

# O próximo nível:<br />Engenharia de Plataforma
&nbsp;

Em vez de cada time operar a infra, criamos uma **plataforma interna**!
&nbsp;
&nbsp;
&nbsp;
&nbsp;

Objetivo:
> Transformar infraestrutura em **PRODUTO INTERNO**

---

# Infraestrutura como Produto

Times de plataforma oferecem:
&nbsp;

- Templates
- APIs internas
- Automação, automação, automação...
- Padrões (com documentações claras e de fácil acesso)
&nbsp;
&nbsp;
&nbsp;
&nbsp;

---

# Exemplinho

Em vez do dev rodar:
```
terraform apply
```
...com 200 linhas de código e 50 linhas de output 😬
&nbsp;
&nbsp;

O dev usa algo como:
```
platform create-service
```
...*PLIM!* Serviço criado! 😎
&nbsp;

---

# O papel do Terraform aqui

Terraform continua existindo, mas agora ele fica **dentro da plataforma**
&nbsp;

O desenvolvedor não precisa lidar diretamente com:

- Módulos
- Providers
- State
- Detalhes de permissão (IAM)
&nbsp;
&nbsp;
&nbsp;

---

# Exemplos de plataforma

Algumas ferramentas que ajudam:
&nbsp;

- Backstage
- Crossplane
- Terraform Cloud / Enterprise
&nbsp;
- GitOps
- IDP (Internal Developer Platforms)
&nbsp;

Mas a ideia é sempre a mesma: **abstração + automação**

---

# Resultado

Boa plataforma gera:
&nbsp;

- Onboarding beeeeem mais rápido, tanto de produto como time
- Menos erros de infraestrutura e rastreabilidade
- Padrões consistentes
&nbsp;
&nbsp;
&nbsp;

Mais autonomia para devs 🥰 ...deixa eles **focarem no que é realmente importante**!

---

# Só que...um grande erro de entendimento

Plataforma não é:
&nbsp;

❌ Time que controla tudo  
❌ Portal cheio de burocracia  
❌ O time que vira gargalo
&nbsp;
&nbsp;
&nbsp;

Plataforma precisa ser **self-service**!

---

# Não tenho nada...mas quero começar

A jornada geralmente é:
&nbsp;

1. Scripts
1. Terraform
1. Módulos Terraform
1. Plataforma interna
&nbsp;
&nbsp;
&nbsp;
&nbsp;

---
&nbsp;
&nbsp;
&nbsp;

#### Dúvidas?
#### Obrigado!

&nbsp;
&nbsp;

##### kiko.dev.br