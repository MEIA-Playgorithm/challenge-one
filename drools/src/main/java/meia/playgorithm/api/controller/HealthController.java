package meia.playgorithm.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import meia.playgorithm.api.dto.HealthDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Operation(summary = "Check API health")
    @GetMapping("/health")
    public HealthDto health() {
        return new HealthDto("ok");
    }
}
