package meia.playgorithm.api;

import meia.playgorithm.api.dto.ErrorDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Todos os erros saem como {"error": "..."}, com as mensagens da API Prolog. */
@RestControllerAdvice
public class ApiErrors {

    private static final Logger log = LoggerFactory.getLogger(ApiErrors.class);

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorDto> status(ResponseStatusException e) {
        return error(HttpStatus.valueOf(e.getStatusCode().value()), e.getReason());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    ResponseEntity<ErrorDto> missing(MissingServletRequestParameterException e) {
        return error(HttpStatus.BAD_REQUEST, "Parâmetro obrigatório: " + e.getParameterName());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ErrorDto> invalidType() {
        return error(HttpStatus.BAD_REQUEST, "Parâmetro inválido");
    }

    /** Falha de uma anotação @Min, @Max ou @Pattern; a mensagem está na própria anotação. */
    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ErrorDto> invalidValue(HandlerMethodValidationException e) {
        return error(HttpStatus.BAD_REQUEST, e.getAllErrors().get(0).getDefaultMessage());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErrorDto> methodNotAllowed() {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "method_not_allowed");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErrorDto> routeNotFound() {
        return error(HttpStatus.NOT_FOUND, "Route not found");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorDto> unexpected(Exception e) {
        log.error("Unexpected error", e);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "internal_server_error");
    }

    private static ResponseEntity<ErrorDto> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorDto(String.valueOf(message)));
    }
}
