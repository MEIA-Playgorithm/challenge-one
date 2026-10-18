**A implementação está agora bastante mais alinhada com a entrevista.** As duas lacunas anteriores — distinguir filmes vistos de apreciados e permitir rever filmes — estão resolvidas. Ainda faltam algumas funcionalidades e há decisões de pontuação que precisam de validação pelo perito.

**O que está correto atualmente**

| Elemento | Avaliação |
| --- | --- |
| Duração máxima, intervalo de anos e idioma obrigatório | Implementados como requisitos que não podem ser compensados por pontuação. |
| Rejeição de géneros, realizadores e atores | Implementada, com prioridade sobre as preferências positivas. |
| Público da sessão | Considera a idade do espectador mais novo, quando definida. |
| Classificação mínima e tolerância | Distingue opções principais de alternativas e desativa a tolerância quando o mínimo é obrigatório. |
| Histórico com avaliação pessoal | `watched=filme=nota` distingue filmes vistos de filmes apreciados. |
| Nota 0 | Representa ausência de avaliação; não é tratada como avaliação negativa. |
| Semelhança com filmes apreciados | A regra 41 utiliza avaliações pessoais 4–5, em vez de qualquer filme visto. |
| Pedido para rever | `allow_rewatch=true` permite filmes vistos, sem ultrapassar outras restrições. |
| Explicações | Apresenta motivos positivos, requisitos cumpridos, preferências não satisfeitas e composição da pontuação. |
| Validação do histórico | Rejeita notas inválidas e filmes repetidos no histórico do mesmo utilizador. |

O formato escolhido para o histórico é adequado.

**O que ainda falta incluir**

Legenda: as linhas com fundo amarelo e a indicação **Dados em falta** dependem de informação que ainda não existe no catálogo.

<table>
  <thead><tr><th>Elemento da entrevista</th><th>O que falta</th></tr></thead>
  <tbody>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Conteúdo e linguagem imprópria</strong> — perguntas 8, 14 e 15<br><strong>Dados em falta</strong></td><td>Descritores fiáveis por filme e limites de conteúdo para a sessão. Idioma e classificação etária não descrevem integralmente o conteúdo.</td></tr>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Plataformas acessíveis</strong> — perguntas 6 e 13<br><strong>Dados em falta</strong></td><td>Disponibilidade por plataforma, região e data, e plataformas disponíveis ao utilizador.</td></tr>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Sagas apreciadas</strong> — pergunta 21<br><strong>Dados em falta</strong></td><td>Identificação das sagas e relação entre os títulos, além da preferência do utilizador.</td></tr>
    <tr><td><strong>Avaliações de pessoas com gostos semelhantes</strong> — pergunta 21</td><td>Comparar avaliações pessoais entre utilizadores e definir quando existe semelhança suficiente. O novo histórico já fornece parte dos dados necessários.</td></tr>
    <tr><td><strong>Classificação contextualizada por género</strong> — perguntas 4, 9 e 21</td><td>A nota IMDb continua a ser utilizada de forma absoluta, sem contextualização pelo género.</td></tr>
    <tr><td><strong>Desempate por semelhança</strong> — pergunta 24</td><td>A ordenação usa pontuação, nota IMDb e ID; ainda não usa o grau de semelhança com filmes apreciados como desempate.</td></tr>
  </tbody>
</table>

Estas funcionalidades não são todas restrições de exclusão. Plataformas, sagas e opiniões de utilizadores semelhantes podem funcionar como fatores de valorização, conforme o pedido.

**O que deveria ser alterado ou validado**

1. **Aproveitar melhor as avaliações pessoais.**  
   Atualmente, notas **4 e 5 têm o mesmo efeito**, e notas **0, 1, 2 e 3 não contribuem para a semelhança**. Isto é uma primeira implementação coerente, mas perde informação.

   Poderia haver uma contribuição gradual conforme a avaliação e a semelhança. Notas negativas poderiam reduzir a pontuação de sugestões semelhantes, mas isso seria uma extensão a validar — **não uma exclusão automática exigida pela entrevista**.

2. **Rever o peso da semelhança.**  
   A contribuição é apenas de **1 ponto no máximo**, dentro do grupo secundário limitado a 9. Quando esse grupo já atingiu 9 pontos, a semelhança deixa de alterar a pontuação, embora apareça nos motivos. Convém mostrar esse efeito nas explicações ou dar à semelhança uma contribuição própria.

3. **Validar pesos e limiares com o perito.**  
   Os valores `40/30/10/10/9`, a avaliação pessoal mínima de 4 e a similaridade mínima de 7 são decisões da implementação. A entrevista fundamenta a importância dos critérios, mas **não fornece estes números**.

   A hierarquia género → classificação → realizador/atores também não fica garantida de forma absoluta por uma soma ponderada. É preciso confirmar se o perito pretende pesos relativos ou uma ordem estrita.

4. **Clarificar o significado de rejeitar um idioma.**  
   A regra 36 exclui um filme que contenha qualquer idioma rejeitado, mesmo que tenha também um idioma aceite. Isto é adequado para “não quero ouvir esse idioma”, mas pode ser excessivo para “preciso de uma versão em português”. Para o segundo caso faltam dados sobre áudio e legendas.

5. **Distinguir incumprimento de informação desconhecida.**  
   Um filme que excede a duração máxima e outro cuja duração está ausente podem receber o mesmo motivo de exclusão. A explicação deveria distinguir:
   - requisito efetivamente violado;
   - requisito que não foi possível verificar.

6. **Tratar alternativas dentro da mesma preferência.**  
   Se o utilizador aceitar ritmo `slow|medium`, um filme lento não deveria necessariamente apresentar `medium` como uma preferência por cumprir. Deve definir-se se cada lista significa “qualquer um destes valores” ou vários gostos independentes.

7. **Separar perfil permanente de pedido da sessão.**  
   O sistema já representa limites da sessão, mas guarda-os na mesma linha do perfil. Uma evolução útil seria separar gostos duradouros de condições como “hoje tenho 100 minutos” ou “hoje vou ver com crianças”. Isso também evita interpretar uma avaliação passada positiva como contradição com uma rejeição atual.

8. **Melhorar a validação de conflitos explícitos.**  
   O carregador valida notas, duplicados e intervalos de anos, mas ainda não identifica sistematicamente condições como o mesmo ator simultaneamente preferido e rejeitado. Já uma nota 5 num filme de terror e a rejeição de terror para a sessão atual **não devem ser automaticamente consideradas um erro**.

**O que eliminaria ou manteria apenas como extensão**

- **Não eliminaria nenhuma das novas restrições essenciais**, nem o histórico avaliado.
- Consolidaria **`audience` e popularidade**, porque ambos dependem dos votos e podem valorizar duas vezes informação semelhante. `audience=mainstream/niche` também não representa o público da sessão.
- Manteria **lista de desejos, argumentistas, países, ritmo, humor e complexidade** como extensões opcionais, sem as apresentar como regras confirmadas pelo perito.
- Não usaria **violência inferida pelo género** como garantia de adequação do conteúdo.
- Não transformaria **notas pessoais baixas** em rejeições obrigatórias de géneros, atores ou filmes semelhantes.
