package meia.playgorithm.api.dto;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Os campos dos DTOs saem em snake_case, como no resto do contrato (ex.: ratingImdb -> rating_imdb). */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@JacksonAnnotationsInside
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public @interface SnakeCase {
}
