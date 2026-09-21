# challenge-one
Inference Engine

# Política de Branches

## Branches principais

- **main** — produção. Só recebe merge via PR.
- **development** — testes e playground. Só recebe merge via PR.

## Branches de trabalho

- **feature/** — novas funcionalidades
- **bugfix/** — correções de bugs

Sempre nascem de `development` e fazem merge de volta para `development`.

### Convenção de nomes

```
feature/idissue_nomebranch
bugfix/idissue_nomebranch
```

Exemplo: `feature/123_login-social`

O id da issue vem do **Issue Board do GitHub**.

## Fluxo de release

- `development` → `main` semanalmente (merge/PR semanal para produção).
