
## Check-up Completo do Sistema SIAG

### Erros Encontrados

**1. Erro de ref no Login (console)**
O componente `Login` nao usa `forwardRef`, mas o React Router tenta passar uma ref para ele dentro do `AuthenticatedApp`. Isso gera o warning "Function components cannot be given refs" no console. Solucao: o `Login` nao precisa de ref -- o problema esta na forma como ele e renderizado fora de `<Routes>` no `AuthenticatedApp`. Nao e critico, mas polui o console.

**2. Erro de ref no Badge (console)**  
O componente `Badge` e uma funcao simples sem `forwardRef`. Quando usado como filho de um `Button` ou `Tooltip` na pagina Agenda, gera o mesmo warning. Solucao: adicionar `React.forwardRef` ao componente `Badge`.

**3. Botao "Sair do Sistema" no MenuPage nao funciona**
O botao de logout no `MenuPage.tsx` nao chama nenhuma funcao -- e apenas um `<button>` vazio sem `onClick`. Precisa chamar `logout()` do `useAuth()`.

**4. Pagina Agenda com data fixa (hardcoded)**
A constante `TODAY = new Date(2026, 1, 16)` esta hardcoded. Isso significa que o calendario nunca mostra o dia real como "hoje". Deveria usar `new Date()`.

**5. Constante CURRENT_USER hardcoded na Agenda**
`const CURRENT_USER = "Thiago"` esta fixo. Deveria usar o usuario logado via `useAuth()` (ja importado no componente, mas nao usado nesse ponto).

---

### Melhorias Recomendadas

**6. Seguranca: senha fixa no codigo**
A senha `SENHA_PADRAO = "rev123"` esta exposta no codigo-fonte do Login. Qualquer pessoa pode ver via DevTools. Quando migrar para autenticacao real com Supabase Auth, isso sera resolvido.

**7. GlobalSearch fora do contexto de autenticacao**
O `GlobalSearch` esta posicionado fora do `MockDataProvider` e `NotificationsProvider` no App.tsx. Ele acessa `mockCases` diretamente, entao funciona, mas se migrar para dados do Supabase, precisara de contexto adequado.

**8. Notificacoes perdidas ao recarregar**
O `NotificationsContext` armazena notificacoes apenas em `useState` -- ao recarregar a pagina, todas sao perdidas. Considerar persistir no `localStorage` ou Supabase.

**9. Arquivos de pagina muito grandes**
- `Agenda.tsx`: 1032 linhas
- `Relatorios.tsx`: 707 linhas  
- `ProcessoDetalhe.tsx`: provavelmente grande tambem

Recomendavel extrair sub-componentes para facilitar manutencao.

**10. Menu so visivel para admin**
O item "Menu" no sidebar so aparece para `admin` (`adminOnly: true`). Usuarios com outras roles nao conseguem acessar funcoes como backup/export. Considerar liberar a pagina Menu para mais roles.

---

### Detalhes Tecnicos das Correcoes

**Correcao 1 e 2 - forwardRef**: Adicionar `React.forwardRef` ao componente `Badge` em `src/components/ui/badge.tsx`.

**Correcao 3 - Logout no Menu**: No `MenuPage.tsx`, importar `useAuth` e chamar `logout()` no `onClick` do botao "Sair do Sistema".

**Correcao 4 e 5 - Agenda**: Substituir `TODAY` por `new Date()` e usar `user.name` do `useAuth()` em vez de `CURRENT_USER`.

**Arquivos afetados:**
- `src/components/ui/badge.tsx` -- adicionar forwardRef
- `src/pages/MenuPage.tsx` -- wiring do botao logout
- `src/pages/Agenda.tsx` -- remover constantes hardcoded
- `src/contexts/NotificationsContext.tsx` -- persistencia opcional
