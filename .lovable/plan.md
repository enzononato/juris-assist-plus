

## Melhorias para a Juria - Plano Completo

### 1. Historico de Conversas com Persistencia Local
Atualmente o chat perde toda a conversa ao fechar o painel. Salvar o historico no `localStorage` para que o usuario possa continuar de onde parou.

- Persistir mensagens no `localStorage` com chave por usuario
- Ao abrir o painel, restaurar a conversa anterior
- Botao "Nova Conversa" limpa o historico salvo
- Limite de 50 mensagens salvas para nao sobrecarregar

### 2. Sugestoes Dinamicas Baseadas no Contexto
As sugestoes atuais sao estaticas. Tornar as sugestoes inteligentes com base nos dados reais do sistema.

- Se ha prazo vencendo em 3 dias: sugerir "Quais prazos vencem esta semana?"
- Se ha audiencia proxima: sugerir "Me prepare para a audiencia de [reclamante]"
- Se ha tarefas atrasadas: sugerir "Quais tarefas estao atrasadas?"
- Gerar ate 4 sugestoes dinamicas + 2 fixas

### 3. Juria na Pagina da Agenda (Contexto por Pagina)
Ao abrir a Juria estando na pagina /agenda, ela deve saber que o usuario esta vendo a agenda e oferecer insights relevantes automaticamente.

- Detectar a rota atual (`useLocation`) e injetar contexto extra
- Na Agenda: adicionar sugestoes como "Resuma minha semana" ou "Quais compromissos tenho amanha?"
- No Processo: sugestoes especificas do processo aberto
- No Dashboard: visao geral e alertas prioritarios

### 4. Mensagem de Boas-Vindas Contextual
Ao abrir o chat sem historico, a Juria envia uma mensagem automatica com um resumo rapido do sistema.

- "Bom dia! Voce tem X prazos pendentes, Y audiencias esta semana e Z tarefas abertas."
- Mensagem gerada localmente (sem chamar a IA), baseada nos dados do `useTenantData`
- Exibida como mensagem do assistente no inicio da conversa

### 5. Acoes Rapidas no Chat
Quando a Juria menciona um processo ou prazo, permitir que o usuario clique para navegar diretamente.

- Detectar numeros de processo nas respostas (regex no formato XXXXX-XX.XXXX.X.XX.XXXX)
- Renderizar como links clicaveis que navegam para `/processos/:id`
- Adicionar botoes de acao apos respostas: "Criar tarefa", "Ver processo"

### 6. Textarea Expandivel + Atalhos de Teclado
Substituir o input simples por um textarea que cresce conforme o usuario digita, com suporte a Shift+Enter para nova linha e Enter para enviar.

### 7. Indicador de Tokens/Contexto
Exibir discretamente quantos processos/tarefas estao sendo enviados como contexto para a IA, dando transparencia ao usuario.

- Badge pequeno no header: "Conectada a X processos, Y tarefas"

---

### Detalhes Tecnicos

**Arquivos modificados:**
- `src/components/ai/JuriaChatPanel.tsx` — Historico local, sugestoes dinamicas, boas-vindas contextual, textarea, links clicaveis, indicador de contexto
- `src/components/ai/JuriaChatButton.tsx` — Passar rota atual para o painel
- `src/lib/buildJuriaContext.ts` — Helper para gerar sugestoes dinamicas e mensagem de boas-vindas

**Abordagem:**
- Persistencia via `localStorage` (sem necessidade de banco)
- Sugestoes dinamicas calculadas localmente a partir de `useTenantData`
- Links clicaveis via componente customizado no `ReactMarkdown` (override de `<a>` e regex para numeros de processo)
- Textarea com `onKeyDown` para Enter/Shift+Enter e `auto-resize` via ref
- Nenhuma alteracao na edge function necessaria

