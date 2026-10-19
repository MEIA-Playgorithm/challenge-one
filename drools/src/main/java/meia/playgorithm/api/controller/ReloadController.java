package meia.playgorithm.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import meia.playgorithm.api.dto.ReloadDto;
import meia.playgorithm.service.KnowledgeBaseService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReloadController {

    private final KnowledgeBaseService knowledgeBase;

    public ReloadController(KnowledgeBaseService knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    /** Relê os CSV: sem `scope` os dois, ou só `users` ou só `movies`. */
    @Operation(summary = "Reload the knowledge base CSV files")
    @PostMapping({"/reload", "/reload/{scope:users|movies}"})
    public ReloadDto reload(@PathVariable(name = "scope", required = false) String scope) {
        return knowledgeBase.reload(scope == null ? "all" : scope);
    }
}
