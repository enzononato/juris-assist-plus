
# MVP 1.0 – "Agenda + Tarefas + Alertas"

## Status: EM PROGRESSO

## ✅ Fase 1 – Fluxo Básico (CONCLUÍDA)

### Botão "Criar" Global
- Dropdown no sidebar com "Criar Processo" e "Criar Tarefa"

### Formulário de Processo (NovoProcesso.tsx)
- Campos: Nº do Processo, Nome do Colaborador, Empresa/Filial, Tema (texto livre), Status (Em andamento | Encerrado), Responsável (executor), Gestor responsável

### Formulário de Tarefa (NovaTarefa.tsx)
- Busca de processo/caso com popover
- Seleção múltipla de responsáveis com chips
- Campo gestor responsável separado
- Data com calendar picker
- Opções: Mostrar na agenda / Dia inteiro
- Notificação in-app simulada ao criar

### Lista de Processos
- Processos encerrados ocultos por padrão (botão "Mostrar encerrados")
- Default tab: "Em andamento"

## ✅ Fase 2 – Agenda + Alertas (CONCLUÍDA)

### Agenda (Agenda.tsx)
- Toggle "Minhas atribuições / Todas" sempre visível no header
- Selector de ano (dropdown) no header
- Não-admin começa em "Minhas atribuições"
- Views: Mês, Semana, Dia
- Modal de evento ao clicar com link para processo

### Central de Alertas (Alertas.tsx)
- Abas: Todos / Prazos / Audiências / Minhas Tarefas
- Regras MVP: Audiências 30/7/1 dia, Prazos 30/7/1 dia, Tarefas 1 dia antes e no vencimento
- Status: Não tratada / Tratada (state local)
- Link para processo relacionado

## 🔲 Fase 3 – Gestor, Encerrados e Permissões

- Campo "Gestor responsável" já implementado em Processos e Tarefas (formulários)
- Notificação in-app para gestor ao criar tarefa: TODO (precisa de backend real)
- Processos encerrados: filtro "Mostrar encerrados" implementado
- Modo leitura para encerrados: TODO
- Teste "caso David": permissões mockadas na agenda via assignmentFilter

## Próximas prioridades

1. Ativar Lovable Cloud para persistência real
2. Notificações in-app reais para responsável e gestor
3. Modo leitura para processo encerrado (bloquear criação de tarefas)
4. Edge Function de alertas automáticos
