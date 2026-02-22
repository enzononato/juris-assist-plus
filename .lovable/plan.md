

## Problema

Quando um novo processo e criado, o codigo faz `mockCases.push(newCase)` e `bumpMockRevision()`, mas **nenhum estado React muda**. Isso significa que os componentes que listam processos (Dashboard, pagina de Processos) nao re-renderizam e o novo processo "some".

O `bumpMockRevision()` incrementa um contador global, porem nenhum componente React esta observando esse contador para disparar uma atualizacao.

## Solucao

Criar um mecanismo simples de "pub/sub" com React Context para que, ao mutar dados mock, todos os componentes que consomem `useTenantData` sejam forcados a re-renderizar.

### Passos

1. **Criar um contexto `MockDataContext`** em `src/contexts/MockDataContext.tsx`
   - Expor um estado `revision` (numero) e uma funcao `notifyChange()` que incrementa esse estado
   - Isso garante que qualquer componente consumindo o contexto re-renderize quando `notifyChange` for chamado

2. **Atualizar `useTenantData`** (`src/hooks/useTenantData.ts`)
   - Importar e consumir o `revision` do `MockDataContext` (basta ler o valor para que o hook fique "inscrito" nas mudancas)

3. **Atualizar `NovoProcesso.tsx`**
   - Ao criar o processo, chamar `notifyChange()` do contexto apos o `mockCases.push()`
   - Remover dependencia do `bumpMockRevision` (substituido pelo contexto)

4. **Atualizar `NovaTarefa.tsx`**
   - Mesma logica: chamar `notifyChange()` apos `mockTasks.push()`

5. **Atualizar qualquer outro local que mute dados mock** (ex: `EditarProcessoDialog.tsx`, timeline events)
   - Adicionar chamada a `notifyChange()` para garantir consistencia

6. **Registrar o `MockDataProvider`** no `App.tsx` ou `main.tsx`, envolvendo a arvore de componentes

### Detalhes Tecnicos

- O contexto tera um estado simples: `const [revision, setRevision] = useState(0)` e `notifyChange = () => setRevision(r => r + 1)`
- `useTenantData` lera `revision` apenas para se inscrever no contexto -- nao precisa usar o valor diretamente
- Isso e o padrao mais leve possivel sem adicionar bibliotecas externas de estado

