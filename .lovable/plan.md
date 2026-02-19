
## Objetivo

Substituir o botão "Mostrar/Ocultar encerrados" por uma **aba "Encerrados"** dedicada na página de Processos, integrada ao sistema de tabs de status já existente.

## Análise do Estado Atual

Atualmente, a página `Processos.tsx` tem:
- **Tabs de status**: "Todos", "Novo", "Em Andamento", "Audiência Marcada", "Sentença", "Recurso", "Encerrado" — geradas dinamicamente a partir de `statusLabels`.
- **Botão separado** "Mostrar/Ocultar encerrados" com estado `showEncerrados` que controla a visibilidade.
- **Lógica de filtro**: processos encerrados são ocultos por padrão (`if (!showEncerrados && c.status === "encerrado" && statusTab !== "encerrado") return false`).

O problema é que a aba "Encerrado" já existe visualmente nas tabs (linha 549-556), mas os dados mock atuais não têm processos com `status: 'encerrado'`, então a aba não aparece (filtra por `statusCounts[k] > 0`). Além disso, o botão "Mostrar/Ocultar encerrados" está redundante com a aba.

## Mudanças Necessárias

### 1. `src/data/mock.ts` — Adicionar processos encerrados

Adicionar 2–3 processos com `status: 'encerrado'` ao `mockCases` para que a aba seja populada e o usuário possa ver o comportamento real.

### 2. `src/pages/Processos.tsx` — Refatorar UI

**Remover:**
- Estado `showEncerrados` e seu `useState`.
- Botão "Mostrar/Ocultar encerrados" do header.
- A condição `if (!showEncerrados && c.status === "encerrado" && statusTab !== "encerrado") return false` do filtro.
- Chamada `setShowEncerrados(false)` no `clearAll`.

**Ajustar:**
- A lógica de filtro já garante que a aba "encerrado" funciona — ao clicar nela, `statusTab === "encerrado"` e apenas processos encerrados são exibidos.
- A condição `statusCounts[k] > 0` na renderização das tabs continuará funcionando — a aba "Encerrado" só aparece se houver processos encerrados.
- Garantir que a aba "Encerrado" tenha visual diferenciado (tom acinzentado/neutro) para sinalizar que são processos arquivados — usando a cor já definida em `statusColors.encerrado`.

**Comportamento resultante:**
- Aba "Encerrado (N)" aparece na barra de tabs com badge de contagem.
- Ao selecionar, exibe apenas os processos encerrados com todos os filtros/ordenação normais.
- Nos modos "Todos" e demais abas, processos encerrados NÃO aparecem (comportamento atual mantido — encerrados são ocultados das outras abas).
- No Kanban, a coluna "Encerrado" já existia e continua funcionando.

## Arquivos a Modificar

| Arquivo | O que muda |
|---|---|
| `src/data/mock.ts` | Adicionar 2 processos com `status: 'encerrado'` |
| `src/pages/Processos.tsx` | Remover botão/estado `showEncerrados`, ajustar lógica de filtro, garantir que a aba funcione corretamente |

## Comportamento Final

```text
[Tabs de status]
Todos (5) | Novo (1) | Em Andamento (1) | Audiência Marcada (1) | Sentença (1) | Recurso (1) | Encerrado (2)
                                                                                                    ↑
                                                                                          Nova aba dedicada
```

- Clicar em "Encerrado" → lista/grid/kanban mostra apenas processos encerrados.
- Os cards de encerrados exibem o badge cinza já estilizado com `statusColors.encerrado`.
- Um banner informativo sutil pode aparecer no topo da lista de encerrados: "Processos encerrados estão em modo leitura."
- Nas demais abas, processos encerrados permanecem ocultos (sem poluir a visão ativa).
