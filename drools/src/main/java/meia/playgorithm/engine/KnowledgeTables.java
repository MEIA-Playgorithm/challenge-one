package meia.playgorithm.engine;

import meia.playgorithm.catalog.CsvParser;
import meia.playgorithm.model.Attribute;
import meia.playgorithm.model.ContentAttribute;
import meia.playgorithm.model.GenreHint;
import meia.playgorithm.model.HintKind;
import meia.playgorithm.model.PreferenceWeight;
import meia.playgorithm.model.Reason;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Reference knowledge the rules match as facts, kept as data next to the DRL
 * files (knowledge/*.csv) so the expert can change it without editing rules.
 */
public record KnowledgeTables(
    List<GenreHint> genreHints,
    List<ContentAttribute> contentAttributes,
    List<PreferenceWeight> preferenceWeights
) {

    private static final String DIRECTORY = "/meia/playgorithm/engine/knowledge/";

    public static KnowledgeTables load() {
        List<GenreHint> hints = new ArrayList<>();
        for (List<String> row : rows("genre-hints.csv")) {
            hints.add(new GenreHint(
                HintKind.valueOf(row.get(0)),
                Attribute.valueOf(row.get(1)),
                row.get(2),
                Integer.parseInt(row.get(3)),
                Arrays.asList(row.get(4).split("\\|"))
            ));
        }

        // Attributes inferred from hints; a movie with no matching hint gets the value unknown.
        Set<Attribute> inferred = new LinkedHashSet<>();
        hints.stream().filter(hint -> hint.kind() != HintKind.SUBGENRE).forEach(hint -> inferred.add(hint.attribute()));

        List<PreferenceWeight> weights = new ArrayList<>();
        for (List<String> row : rows("preference-weights.csv")) {
            weights.add(new PreferenceWeight(Reason.valueOf(row.get(0)), Integer.parseInt(row.get(1))));
        }

        return new KnowledgeTables(hints, inferred.stream().map(ContentAttribute::new).toList(), weights);
    }

    private static List<List<String>> rows(String file) {
        try (InputStream input = KnowledgeTables.class.getResourceAsStream(DIRECTORY + file)) {
            if (input == null) {
                throw new IllegalStateException("Missing knowledge table " + DIRECTORY + file);
            }
            String[] lines = new String(input.readAllBytes(), StandardCharsets.UTF_8).split("\\R");
            List<List<String>> rows = new ArrayList<>();
            for (int i = 1; i < lines.length; i++) {
                if (!lines[i].isBlank()) {
                    rows.add(CsvParser.parseLine(lines[i]));
                }
            }
            return rows;
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read knowledge table " + file, exception);
        }
    }
}
