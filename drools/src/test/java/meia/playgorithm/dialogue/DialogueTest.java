package meia.playgorithm.dialogue;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DialogueTest {

    @Test
    void shouldReadTheDialogueRulesFromTheKnowledgeBase() {
        DialogueResult result = run(Map.of("experiencia", "comedia", "prefere_romance_com_humor", "nao"));

        assertEquals(16, result.rules().size());
        DialogueRule rule = result.rules().stream()
            .filter(candidate -> candidate.id().equals("dialogo_comedia_2"))
            .findFirst()
            .orElseThrow();
        assertEquals("DialogueConclusion(type == \"sugerir_genero\", value == \"Romantic Comedy\")",
            DialogueRule.describe(rule.inserts()));
        assertEquals("DialogueAnswer(key == \"prefere_romance_com_humor\", value == \"sim\")",
            DialogueRule.describe(rule.conditions().get(1)));
    }

    @Test
    void shouldAskTheExperienceFirstAndOnlyTheChosenBranch() {
        ScriptedAsker asker = new ScriptedAsker(Map.of(
            "experiencia", "comedia",
            "prefere_romance_com_humor", "sim"
        ));

        DialogueResult result = new DialogueService().run("ana", asker);

        assertEquals(List.of("experiencia", "prefere_romance_com_humor"), asker.asked);
        assertEquals("comedia", result.experience().orElseThrow());
        assertEquals(List.of("Comedy", "Romantic Comedy"), result.suggestedGenres());
    }

    @Test
    void shouldListWorkingMemoryInInsertionOrder() {
        DialogueResult result = run(Map.of("experiencia", "comedia", "prefere_romance_com_humor", "nao"));

        assertEquals(List.of(
            "#1 DialogueUser(id == \"ana\")",
            "#2 DialogueAnswer(key == \"experiencia\", value == \"comedia\")",
            "#3 DialogueConclusion(type == \"experiencia_sessao\", value == \"comedia\")  (regra \"dialogo_experiencia\")",
            "#4 DialogueConclusion(type == \"sugerir_genero\", value == \"Comedy\")  (regra \"dialogo_comedia_1\")",
            "#5 DialogueAnswer(key == \"prefere_romance_com_humor\", value == \"nao\")"
        ), result.factLines());
    }

    @Test
    void shouldExplainHowThroughTheMatchedObjects() {
        DialogueResult result = run(Map.of("experiencia", "comedia", "prefere_romance_com_humor", "nao"));

        List<String> expected = List.of(
            "#4 DialogueConclusion(type == \"sugerir_genero\", value == \"Comedy\")",
            "   foi inserido pela regra \"dialogo_comedia_1\", porque estes objetos satisfizeram as condições (when):",
            "   #3 DialogueConclusion(type == \"experiencia_sessao\", value == \"comedia\")",
            "      foi inserido pela regra \"dialogo_experiencia\", porque estes objetos satisfizeram as condições (when):",
            "      #1 DialogueUser(id == \"ana\")",
            "         foi inserido no início da sessão (utilizador atual)",
            "      #2 DialogueAnswer(key == \"experiencia\", value == \"comedia\")",
            "         foi inserido com a resposta do utilizador"
        );
        assertEquals(expected, result.how("sugerir_genero Comedy"));
        assertEquals(expected, result.how("4"));
        assertEquals(expected, result.how("#4"));
    }

    @Test
    void shouldExplainWhyNotThroughEveryRuleThatCouldInsertTheObject() {
        DialogueResult result = run(Map.of("experiencia", "comedia", "prefere_romance_com_humor", "sim"));

        assertEquals(List.of(
            "DialogueConclusion(type == \"sugerir_genero\", value == \"Adventure\") não está na memória de trabalho.",
            "A regra \"dialogo_acao_2\" podia inseri-lo, mas a condição DialogueConclusion(type == \"experiencia_sessao\", value == \"acao\") não foi satisfeita:",
            "   DialogueConclusion(type == \"experiencia_sessao\", value == \"acao\") não está na memória de trabalho.",
            "   A regra \"dialogo_experiencia\" podia inseri-lo, mas a condição DialogueAnswer(key == \"experiencia\", value == \"acao\") não foi satisfeita:",
            "      DialogueAnswer(key == \"experiencia\", value == \"acao\") não está na memória de trabalho.",
            "      Nenhuma regra o insere: depende da resposta do utilizador, que foi \"comedia\" (DialogueAnswer(key == \"experiencia\", value == \"comedia\"))."
        ), result.whyNot("sugerir_genero Adventure"));

        assertTrue(result.whyNot("sugerir_genero Comedy").get(0).contains("está na memória de trabalho (#4)"));
    }

    @Test
    void shouldExplainWhyNotForANegativeAnswer() {
        DialogueResult result = run(Map.of("experiencia", "acao", "procura_aventura", "nao"));

        assertEquals(List.of("Action"), result.suggestedGenres());
        assertEquals(List.of(
            "DialogueConclusion(type == \"sugerir_genero\", value == \"Adventure\") não está na memória de trabalho.",
            "A regra \"dialogo_acao_2\" podia inseri-lo, mas a condição DialogueAnswer(key == \"procura_aventura\", value == \"sim\") não foi satisfeita:",
            "   DialogueAnswer(key == \"procura_aventura\", value == \"sim\") não está na memória de trabalho.",
            "   Nenhuma regra o insere: depende da resposta do utilizador, que foi \"nao\" (DialogueAnswer(key == \"procura_aventura\", value == \"nao\"))."
        ), result.whyNot("sugerir_genero Adventure"));
    }

    @Test
    void shouldFollowTheEmotionalChainUntilTheSadTone() {
        ScriptedAsker asker = new ScriptedAsker(Map.of(
            "experiencia", "emocao",
            "procura_historia_emocional", "sim",
            "prefere_temas_realistas", "sim",
            "aceita_final_triste", "sim"
        ));

        DialogueResult result = new DialogueService().run("ana", asker);

        assertEquals(4, asker.asked.size());
        assertEquals(List.of("Drama"), result.suggestedGenres());
        assertTrue(result.findFact("perfil_sessao emocional").isPresent());

        String how = String.join("\n", result.how("sugerir_tom triste"));
        assertTrue(how.contains("regra \"dialogo_3\""));
        assertTrue(how.contains("regra \"dialogo_2\""));
        assertTrue(how.contains("regra \"dialogo_1\""));
    }

    @Test
    void shouldStopTheEmotionalChainAfterANegativeAnswer() {
        ScriptedAsker asker = new ScriptedAsker(Map.of(
            "experiencia", "emocao",
            "procura_historia_emocional", "nao"
        ));

        DialogueResult result = new DialogueService().run("ana", asker);

        assertEquals(List.of("experiencia", "procura_historia_emocional"), asker.asked);
        assertTrue(result.suggestedGenres().isEmpty());
        List<String> whyNot = result.whyNot("sugerir_genero Drama");
        assertTrue(whyNot.get(1).startsWith("A regra \"dialogo_2\" podia inseri-lo"));
        assertTrue(whyNot.get(3).contains("A regra \"dialogo_1\" podia inseri-lo, mas a condição DialogueAnswer(key == \"procura_historia_emocional\", value == \"sim\")"));
        assertTrue(whyNot.get(5).contains("que foi \"nao\""));
    }

    @Test
    void shouldExplainWhyAQuestionIsAskedWithTheMatchedConditions() {
        List<List<String>> explanations = new ArrayList<>();
        new DialogueService().run("ana", question -> {
            explanations.add(question.why());
            return question.isChoice() ? "terror" : "sim";
        });

        assertEquals(List.of(
            "A avaliar a regra Drools \"dialogo_experiencia\" (dialogue.drl).",
            "Condições (when):",
            "  [satisfeita] DialogueUser(id == \"ana\")",
            "  [em falta]   DialogueAnswer(key == \"experiencia\", value == $experiencia)",
            "Preciso da tua resposta para inserir DialogueAnswer(key == \"experiencia\") na memória de trabalho.",
            "Se todas as condições forem satisfeitas, a regra insere (then): DialogueConclusion(type == \"experiencia_sessao\", value == $experiencia)"
        ), explanations.get(0));
        assertEquals(List.of(
            "A avaliar a regra Drools \"dialogo_terror_2\" (dialogue.drl).",
            "Condições (when):",
            "  [satisfeita] DialogueConclusion(type == \"experiencia_sessao\", value == \"terror\")",
            "  [em falta]   DialogueAnswer(key == \"prefere_sobrenatural\", value == \"sim\")",
            "Preciso da tua resposta para inserir DialogueAnswer(key == \"prefere_sobrenatural\") na memória de trabalho.",
            "Se todas as condições forem satisfeitas, a regra insere (then): DialogueConclusion(type == \"preferencia_sessao\", value == \"sobrenatural\")"
        ), explanations.get(1));
    }

    @Test
    void shouldRejectUnknownFactsAndInvalidOptions() {
        DialogueResult result = run(Map.of("experiencia", "comedia", "prefere_romance_com_humor", "sim"));

        assertThrows(IllegalArgumentException.class, () -> result.whyNot("inexistente ana"));
        assertThrows(IllegalArgumentException.class,
            () -> new DialogueService().run("ana", question -> "sim"));
    }

    private static DialogueResult run(Map<String, String> answers) {
        return new DialogueService().run("ana", new ScriptedAsker(answers));
    }

    private static final class ScriptedAsker implements DialogueService.Asker {
        private final Map<String, String> answers;
        private final List<String> asked = new ArrayList<>();

        private ScriptedAsker(Map<String, String> answers) {
            this.answers = answers;
        }

        @Override
        public String ask(DialogueQuestion question) {
            asked.add(question.getKey());
            return answers.get(question.getKey());
        }
    }
}
