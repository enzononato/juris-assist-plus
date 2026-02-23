

# Sugestoes de Melhorias para o SIAG -- Baseado em Concorrentes

Analise dos principais concorrentes no mercado juridico brasileiro (ADVBOX, EasyJur, Projuris, Brainlaw, TOTVS Sisjuri, Legalcloud, Autojur) e comparacao com o estado atual do SIAG.

---

## O que o SIAG ja tem de bom

- Dashboard com KPIs e graficos (pie, bar, area)
- Busca global com Ctrl+K
- IA integrada (Juria Chat)
- Gestao de processos, tarefas, agenda, alertas
- Multi-empresa com filtros por filial
- Sistema de roles e permissoes
- Tema claro/escuro
- PWA configurado
- Loading skeletons e transicoes suaves

---

## Melhorias Recomendadas (por prioridade)

### 1. Captura Automatica de Andamentos Processuais
**Concorrentes que tem:** ADVBOX, Projuris, EasyJur, Autojur, TOTVS

O recurso mais valorizado no mercado. Consulta automatica nos tribunais (TRT, TST) para puxar movimentacoes e notificar o usuario.

- Integracao com APIs dos tribunais (DataJud, e-Proc)
- Notificacao push quando houver movimentacao
- Timeline atualizada automaticamente
- Alertas inteligentes: "Sentenca publicada no processo X"

**Impacto:** Alto -- elimina trabalho manual diario de conferir andamentos.

---

### 2. Gestao Financeira / Honorarios
**Concorrentes que tem:** ADVBOX, EasyJur, Projuris, Brainlaw

Totalmente ausente no SIAG. Concorrentes oferecem:

- Controle de honorarios por processo
- Timesheet (registro de horas trabalhadas)
- Contas a pagar/receber vinculadas a processos
- Relatorio de rentabilidade por cliente/processo
- Dashboard financeiro com receita projetada vs realizada

**Impacto:** Alto -- advogados e DPs precisam controlar custos processuais.

---

### 3. Modelos de Documentos e Geracao Automatica
**Concorrentes que tem:** EasyJur, ADVBOX, Projuris, Legalcloud

- Biblioteca de modelos (peticoes, contratos, notificacoes)
- Preenchimento automatico com dados do processo (variaveis)
- Geracao via IA (a Juria ja existe, poderia gerar documentos)
- Versionamento de documentos
- Assinatura eletronica integrada

**Impacto:** Alto -- reduz tempo gasto em documentos repetitivos.

---

### 4. Kanban para Processos e Tarefas
**Concorrentes que tem:** EasyJur, ADVBOX, Autojur

O SIAG tem lista e grid. Falta a visao Kanban:

- Arrastar processos entre colunas de status
- Kanban de tarefas por prioridade ou responsavel
- Visao de pipeline do contencioso
- Limites WIP (work in progress) por coluna

**Impacto:** Medio-alto -- melhora a visualizacao do fluxo de trabalho.

---

### 5. Central de Prazos Inteligente
**Concorrentes que tem:** Legalcloud, ADVBOX, Projuris

Apesar de ter prazos, o SIAG nao calcula prazos processuais automaticamente:

- Calculadora de prazos trabalhistas (dias uteis, feriados locais)
- Contagem automatica baseada no tipo de prazo
- Alertas escalonados (15 dias, 7 dias, 3 dias, vencendo hoje)
- Calendario de feriados por comarca
- Controle de suspensao de prazos

**Impacto:** Alto -- erro de prazo e a maior causa de problemas para advogados.

---

### 6. Portal do Cliente / Advogado Externo
**Concorrentes que tem:** Projuris Empresas, Brainlaw, TOTVS

O SIAG ja tem role "advogado_externo" mas com acesso limitado:

- Painel simplificado para o cliente acompanhar seus processos
- Upload de documentos pelo cliente
- Chat direto com o advogado responsavel
- Status atualizado em tempo real
- Relatorios personalizados para o cliente

**Impacto:** Medio -- melhora a comunicacao e reduz ligacoes/emails.

---

### 7. Business Intelligence e Relatorios Avancados
**Concorrentes que tem:** ADVBOX (BI integrado), DeepLegal, Brainlaw

O SIAG tem relatorios basicos. Concorrentes oferecem:

- Analise preditiva (probabilidade de exito)
- Benchmarking de valores por tipo de acao
- Heatmap de riscos por filial/tema
- Provisao financeira automatica
- Export em PDF/Excel com marca do escritorio
- Dashboards customizaveis pelo usuario

**Impacto:** Medio-alto -- diferencial competitivo importante.

---

### 8. App Mobile Nativo / PWA Aprimorado
**Concorrentes que tem:** Projuris (app nativo), EasyJur, ADVBOX

O SIAG tem PWA configurado, mas pode melhorar:

- Notificacoes push nativas
- Modo offline para consulta de processos
- Captura de fotos de documentos via camera
- Biometria para login (FaceID/fingerprint)
- Widget de prazos na tela inicial

**Impacto:** Medio -- advogados trabalham muito pelo celular.

---

### 9. Automacao de Workflows
**Concorrentes que tem:** Brainlaw, TOTVS, Projuris Empresas

- Regras tipo "quando processo mudar para status X, criar tarefa Y"
- Workflows pre-configurados por tipo de acao trabalhista
- Distribuicao automatica de tarefas por carga de trabalho
- Escalacao automatica de prazos nao cumpridos
- Templates de fluxo de trabalho reutilizaveis

**Impacto:** Alto -- reduz trabalho manual repetitivo.

---

### 10. Integracao com Sistemas Externos
**Concorrentes que tem:** Todos os líderes de mercado

- Integracao com e-mail (Gmail/Outlook) para vincular emails a processos
- Calendario Google/Outlook sincronizado
- Integracao com WhatsApp para notificacoes
- API publica para integracao com ERP (SAP, TOTVS)
- Webhook para eventos do sistema

**Impacto:** Medio -- facilita adocao em empresas que ja usam outros sistemas.

---

## Resumo de Prioridades

```text
Prioridade    Funcionalidade                      Esforco
──────────    ──────────────────────────────       ───────
1 (critica)   Captura de andamentos processuais    Alto
2 (critica)   Central de prazos inteligente        Medio
3 (alta)      Gestao financeira / honorarios       Alto
4 (alta)      Modelos de documentos + IA           Medio
5 (alta)      Automacao de workflows               Alto
6 (media)     Kanban para processos/tarefas        Baixo
7 (media)     BI e relatorios avancados            Medio
8 (media)     Portal do cliente aprimorado         Medio
9 (baixa)     PWA aprimorado                       Medio
10 (baixa)    Integracoes externas                 Alto
```

## Proximos Passos Sugeridos

Para comecar a implementar, recomendo priorizar o **Kanban** (esforco baixo, impacto visual alto) e a **Central de Prazos** (alto valor para o usuario). Ambos podem ser construidos em cima da estrutura existente do SIAG sem grandes mudancas de arquitetura.

