# Testes do frontend

Com os serviços de `docker-compose.yml` ativos, executar:

```sh
npm run test:e2e
```

Por omissão, o frontend está em `http://localhost:4173`. Para outro endereço,
usar `PLAYWRIGHT_BASE_URL`.

Os testes de `porque.spec.ts` e `explanations.spec.ts` percorrem o separador
**Diálogo** com o motor real, sem mocks, chamadas diretas à API ou processos
SWI-Prolog lançados pelo runner. Cada teste cria e elimina o seu próprio
utilizador pela interface.

Cobertura:
- **Porquê:** mostra a justificação e a regra sem assumir uma resposta.
- **Como:** apresenta e esconde a regra e as premissas de uma conclusão.
- **Whynot:** explica uma conclusão excluída por uma resposta negativa e
  recalcula quando essa resposta muda.
- **Sessão:** mantém respostas ao trocar de separador, descarta respostas
  posteriores ao rever uma escolha e limpa as conclusões ao recomeçar.

`example.spec.ts` mantém o cenário de edição de perfil e recomendações Drools;
observa também as respostas HTTP e verifica os dados persistidos.

Os testes alteram temporariamente a base de conhecimento. Usar uma instância
local de desenvolvimento e executar com um único worker, como definido na
configuração. Não é necessário executar comandos na consola SWI-Prolog.

`people-and-origins.spec.ts` cobre os seis campos de **Pessoas e origens**, a
persistência após recarregar a página e a remoção automática de um realizador
ou ator preferido quando passa a rejeitado.

`recommendations.spec.ts` cobre o separador **Recomendações** com SWI-Prolog e
Drools reais: seleção de motores, um filme da lista de desejos, abertura e fecho
das explicações, apresentação da pontuação, alternância entre painel lateral e
separador, e ausência de filmes elegíveis. Os novos cenários usam apenas a
interface, incluindo a criação e eliminação dos perfis temporários.
