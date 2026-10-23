package meia.playgorithm.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import meia.playgorithm.api.dto.DialogueDto;
import meia.playgorithm.api.dto.DialogueRequestDto;
import meia.playgorithm.service.ExperienceDialogueService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DialogueController {

    private final ExperienceDialogueService dialogue;

    public DialogueController(ExperienceDialogueService dialogue) {
        this.dialogue = dialogue;
    }

    /** Envia as respostas já dadas; devolve a próxima pergunta, com o porquê, ou as conclusões. */
    @Operation(summary = "Run the experience dialogue up to the next unanswered question")
    @PostMapping("/dialogue")
    public DialogueDto dialogue(@RequestBody DialogueRequestDto request) {
        return dialogue.next(request.userId(), request.answers());
    }
}
