# Como fazer a gestão de branches

Neste guia encontras práticas para manter o histórico do projeto organizado e facilitar o trabalho em equipa. Estas orientações complementam a política de branches do projeto.

## Antes de criar uma branch

- Confirma que a issue está bem definida e usa o respetivo ID no nome da branch.
- Atualiza a branch de origem antes de começar:

```bash
git switch development
git pull origin development
```

- Cria a branch a partir de `development`:

```bash
git switch -c feature/123_nome-da-feature
```

## Durante o desenvolvimento

- Mantém cada branch focada numa única issue ou alteração.
- Faz commits pequenos e objetivos, descrevendo o que alteraste.
- Evita incluir ficheiros temporários, credenciais ou alterações sem relação com a issue.
- Sincroniza regularmente a branch com `development` para reduzir conflitos:

```bash
git fetch origin
git rebase origin/development
```

- Executa os testes localmente antes de abrir um Pull Request.

## Ao terminar o trabalho

- Revê as alterações antes de publicar:

```bash
git status
git diff
```

- Envia a branch para o repositório remoto:

```bash
git push -u origin feature/123_nome-da-feature
```

- Abre um Pull Request para `development` e associa-o à issue correspondente.
- Explica no Pull Request o que foi feito, como validar a alteração e eventuais limitações.
- Pede uma revisão a pelo menos um colega e resolve todos os comentários antes do merge.

## Depois do merge

- Confirma que a branch foi integrada corretamente.
- Apaga a branch remota e local quando já não for necessária:

```bash
git push origin --delete feature/123_nome-da-feature
git branch -d feature/123_nome-da-feature
```

- Não faças commits diretamente em `main` ou `development`; usa sempre Pull Requests.

## Resolução de conflitos

1. Atualiza a branch com a versão mais recente de `development`.
2. Resolve os conflitos manualmente, mantendo o comportamento correto das duas alterações.
3. Confirma que não ficaram marcadores como `<<<<<<<` ou `>>>>>>>`.
4. Executa os testes e só depois faz o push e atualiza o Pull Request.

Se tiveres dúvidas sobre o resultado de um conflito, pede uma revisão antes de continuar.