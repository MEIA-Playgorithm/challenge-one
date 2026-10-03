# challenge-one
Inference Engine

Os programas, dados e testes encontram-se neste diretório. A partir da raiz do
repositório, executar primeiro:

```bash
cd swi-prolog
```

Consultar [PARA_CORRER.md](PARA_CORRER.md) para os motores de inferência e
[api/README.md](api/README.md) para a API HTTP.

Executar os testes:

```bash
swipl -q -s tests_movies_engine.pl -s tests_users.pl -s tests_user_constraints.pl -g run_tests -t halt
python3 api/test_http.py
```

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
