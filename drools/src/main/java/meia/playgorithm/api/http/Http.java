package meia.playgorithm.api.http;

import com.sun.net.httpserver.HttpExchange;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class Http {

    private static final ObjectMapper JSON = new ObjectMapper();

    public static void json(HttpExchange exchange, int status, Object body) throws IOException {
        byte[] bytes = JSON.writerWithDefaultPrettyPrinter().writeValueAsBytes(body);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        send(exchange, status, bytes);
    }

    public static void html(HttpExchange exchange, String body) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
        send(exchange, 200, body.getBytes(StandardCharsets.UTF_8));
    }

    public static void send(HttpExchange exchange, int status, byte[] bytes) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    public static Map<String, String> query(HttpExchange exchange) {
        Map<String, String> values = new LinkedHashMap<>();
        String rawQuery = exchange.getRequestURI().getRawQuery();
        if (rawQuery == null || rawQuery.isBlank()) {
            return values;
        }
        for (String pair : rawQuery.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = decode(parts[0]);
            String value = parts.length > 1 ? decode(parts[1]) : "";
            values.put(key, value);
        }
        return values;
    }

    public static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    public static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public static String required(Map<String, String> query, String name) {
        String value = query.get(name);
        if (value == null || value.isBlank()) {
            throw new ApiException(400, "Parâmetro obrigatório: " + name);
        }
        return value;
    }

    public static int intParam(Map<String, String> query, String name, int fallback) {
        String value = query.get(name);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            throw new ApiException(400, "Parâmetro inválido");
        }
    }

    public static void validPage(int limit, int offset) {
        if (limit < 1 || limit > 100 || offset < 0) {
            throw new ApiException(400, "limit: 1 a 100; offset: maior ou igual a 0");
        }
    }

    public static <T> List<T> page(List<T> values, int offset, int limit) {
        if (offset >= values.size()) {
            return List.of();
        }
        return values.subList(offset, Math.min(values.size(), offset + limit));
    }

    public static void validEnum(String value, List<String> allowed) {
        if (value != null && !allowed.contains(value)) {
            throw new ApiException(400, "Valor de classificação inválido");
        }
    }

    public static <T> T read(InputStream body, Class<T> type) throws IOException {
        return JSON.readValue(body, type);
    }
}
