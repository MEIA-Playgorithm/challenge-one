package meia.playgorithm.catalog;

import java.util.ArrayList;
import java.util.List;

/** Splits one CSV line, honouring double-quoted fields and "" escapes. */
public final class CsvParser {

    private CsvParser() {
    }

    public static List<String> parseLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;

        for (int i = 0; i < line.length(); i++) {
            char character = line.charAt(i);
            if (character == '"') {
                if (quoted && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (character == ',' && !quoted) {
                values.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(character);
            }
        }

        values.add(current.toString().trim());
        return values;
    }
}
