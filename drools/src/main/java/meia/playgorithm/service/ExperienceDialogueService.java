package meia.playgorithm.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import meia.playgorithm.api.dto.DialogueConclusionDto;
import meia.playgorithm.api.dto.DialogueDto;
import meia.playgorithm.api.dto.DialogueQuestionDto;
import meia.playgorithm.catalog.UserCatalog;
import meia.playgorithm.engine.dialogue.DialogueQuestion;
import meia.playgorithm.engine.dialogue.DialogueResult;
import meia.playgorithm.engine.dialogue.DialogueService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * O diálogo de experiência pela API. Não guarda sessões: o cliente envia todas as respostas que já
 * deu, o motor volta a correr com elas e para na primeira pergunta que ainda não tem resposta.
 */
@Service
public class ExperienceDialogueService {

    private final UserCatalog users;
    private final DialogueService dialogue;

    public ExperienceDialogueService(UserCatalog users, DialogueService dialogue) {
        this.users = users;
        this.dialogue = dialogue;
    }

    public DialogueDto next(String userId, Map<String, String> answers) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parâmetro obrigatório: user_id");
        }
        if (users.find(userId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado");
        }
        Map<String, String> given = answers == null ? Map.of() : answers;

        DialogueResult result;
        try {
            result = dialogue.run(userId, question -> given.get(question.getKey()));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
        }

        Map<String, String> used = new LinkedHashMap<>();
        result.answers().forEach(answer -> used.put(answer.getKey(), answer.getValue()));
        List<DialogueConclusionDto> conclusions = result.conclusions().stream()
            .map(conclusion -> new DialogueConclusionDto(
                conclusion.getType(),
                conclusion.getValue(),
                conclusion.getRule(),
                result.how(conclusion.getType() + " " + conclusion.getValue())))
            .toList();
        DialogueQuestionDto question = result.pendingQuestion().map(ExperienceDialogueService::question).orElse(null);

        return new DialogueDto(userId, question == null ? "done" : "question", question, used, conclusions,
            result.factLines());
    }

    private static DialogueQuestionDto question(DialogueQuestion question) {
        return new DialogueQuestionDto(question.getKey(), question.getText(), question.getOptions(),
            question.getRule(), question.why());
    }
}
