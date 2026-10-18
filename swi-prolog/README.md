# SWI-Prolog

Motor de inferência em SWI-Prolog. Aplica regras de produção a uma base de filmes e de
utilizadores e devolve recomendações através de uma API HTTP.

Mais documentação: [api/README.md](api/README.md) (endpoints) e
[MOTOR.md](MOTOR.md) (regras e cálculo das recomendações).

---

## Com Docker

Só precisas do Docker Desktop. Todos os comandos correm num terminal aberto na **raiz do
repositório** (a pasta onde está o `docker-compose.yml`).

### Passo 1. Abrir o Docker Desktop

Confirma que está aberto e a correr.

### Passo 2. Arrancar

```bash
docker compose up -d --build swi-prolog
```

Isto arranca o Prolog e o serviço `knowledge-base`, de onde o Prolog lê os CSV. A primeira
vez demora alguns minutos, porque constrói as imagens.

### Passo 3. Confirmar que arrancou

Espera cerca de 30 segundos e abre no browser:

> http://localhost:8081/api/health

Deves ver `{"status":"ok"}`. Se der erro, espera mais um pouco e atualiza a página.

### Passo 4. Usar a API

Abre no browser:

| O que mostra | Endereço |
| --- | --- |
| Lista de filmes | http://localhost:8081/api/filmes |
| Um filme | http://localhost:8081/api/filme?id=tt0372784 |
| Filmes parecidos com esse | http://localhost:8081/api/recomendacoes?id=tt0372784 |
| Recomendações para o utilizador `ana` | http://localhost:8081/api/recomendacoes_utilizador?user_id=ana |

### Passo 5. Alterar os dados

1. Edita `knowledge_base/users.csv` (ou `movies.csv`) e grava.
2. Pede ao Prolog que os leia outra vez. São pedidos `POST`, por isso não dá no browser.
   Escolhe o que alteraste:

   | O que alteraste | Comando | Pedido no Postman |
   | --- | --- | --- |
   | Os dois ficheiros | `curl -X POST http://localhost:8081/api/reload` | Reload all |
   | Só `users.csv` | `curl -X POST http://localhost:8081/api/reload/users` | Reload users |
   | Só `movies.csv` | `curl -X POST http://localhost:8081/api/reload/movies` | Reload movies |

   No PowerShell escreve `curl.exe` em vez de `curl`.

3. Se correu bem, a resposta tem `"status":"ok"`. Se o CSV tiver um erro, responde `422`
   com a descrição e o Prolog continua com os dados anteriores.

### Passo 6. Ver o que se passa e parar

Ver os pedidos a chegar (Ctrl+C para sair):

```bash
docker compose logs -f swi-prolog
```

Parar tudo:

```bash
docker compose down
```

Depois de alterares ficheiros `.pl`, volta ao Passo 2 para reconstruir a imagem.

---

## Manualmente

Sem Docker. Precisas do **SWI-Prolog 9 ou superior** instalado (o comando `swipl` tem de
funcionar no terminal).

### Passo 1. Entrar na pasta

A partir da raiz do repositório:

```bash
cd swi-prolog
```

Todos os comandos seguintes correm aqui dentro.

### Passo 2. Escolher de onde vêm os ficheiros CSV

**Opção A: dos ficheiros do repositório.** Não faças nada. O Prolog lê
`../knowledge_base/movies.csv` e `../knowledge_base/users.csv`.

**Opção B: do serviço `knowledge-base`** (porta 8090). Precisa do Docker:

1. Na raiz do repositório, arranca o serviço:

   ```bash
   docker compose up -d knowledge-base
   ```

2. No terminal onde vais correr o Prolog, indica os endereços dos ficheiros.

   Linux, macOS ou Git Bash:

   ```bash
   export MOVIES_CSV=http://localhost:8090/movies.csv
   export USERS_CSV=http://localhost:8090/users.csv
   ```

   PowerShell:

   ```powershell
   $env:MOVIES_CSV = "http://localhost:8090/movies.csv"
   $env:USERS_CSV = "http://localhost:8090/users.csv"
   ```

### Passo 3. Carregar a base de conhecimento e arrancar

Escolhe **uma** das três.

**Opção 1: a API** (fica em http://localhost:8080). A base é carregada ao arrancar:

```bash
swipl -q -s api/server.pl -g 'server:start(8080), thread_get_message(stop)'
```

Espera cerca de 30 segundos e abre http://localhost:8080/api/health.

**Opção 2: a consola com o motor 1** (`sp_exp1`):

```bash
swipl -q -s sp_exp1.pl
```

**Opção 3: a consola com o motor 2** (`sp_exp2`, também explica as conclusões):

```bash
swipl -q -s sp_exp2.pl
```

Nas opções 2 e 3, quando aparecer o prompt `?-`, carrega a base escrevendo estas três
linhas, **uma de cada vez** (cada uma termina com ponto):

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.
```

- `carrega_bc.` pergunta o nome da base de conhecimento.
- `'filmes_bc.pl'.` é a resposta: lê os CSV e carrega as regras.
- `arranca_motor.` corre as regras. Escreve muitas linhas "Foi concluído o facto...".
  É normal e demora alguns segundos.

### Passo 4. Fazer perguntas (só na consola)

Os géneros do Batman Begins (`;` mostra a resposta seguinte, Enter pára):

```prolog
facto(_, genre(tt0372784, G)).
```

Só no motor 2: porque é que o Batman Begins tem ritmo rápido?

```prolog
facto(N, pace(tt0372784, fast)), como(N).
```

Sair da consola: `halt.`

Mais perguntas possíveis em [MOTOR.md](MOTOR.md).

### Passo 5. Depois de alterar um CSV

- **API a correr:** não é preciso reiniciar. Faz um destes pedidos, conforme o que
  alteraste (no PowerShell, `curl.exe`):

  ```bash
  curl -X POST http://localhost:8080/api/reload          # os dois ficheiros
  curl -X POST http://localhost:8080/api/reload/users    # só users.csv
  curl -X POST http://localhost:8080/api/reload/movies   # só movies.csv
  ```

- **Consola:** escreve `carrega_factos_filmes.` e depois `arranca_motor.` (recarrega os
  dois ficheiros).

---

## Ficheiros

| Ficheiro | Para que serve |
| --- | --- |
| `api/` | A API HTTP, um ficheiro por área |
| `csv_source.pl` | Lê um CSV de um URL ou de um ficheiro |
| `movies_loader.pl`, `user_bc.pl` | Transformam os CSV de filmes e de utilizadores em factos |
| `filmes_bc.pl` | Junta os factos e trata do recarregamento |
| `rules_movies.pl` | Regras 1–33: classificam os filmes |
| `rules_users.pl` | Regras 34–65: preferências, exclusões e limites dos utilizadores |
| `user_constraints.pl` | Funções auxiliares das regras |
| `rules_dialog.pl` | Diálogo no motor 2: escolha de uma de 7 experiências, perguntas de seguimento e «porquê?»; ver [MOTOR.md](MOTOR.md) |
| `sp_exp1.pl`, `sp_exp2.pl` | Os dois motores de inferência |
| `rules_user.pl` | Só por compatibilidade; carrega `rules_users.pl` |
