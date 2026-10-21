package meia.playgorithm.engine;

import org.drools.drl.ast.descr.PackageDescr;
import org.drools.drl.ast.descr.RuleDescr;
import org.drools.drl.parser.DrlParser;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Structure of the rule files: how many rules each has, unique names, and queries kept apart. */
public class RuleParityTest {

    private static final Path DRL = Path.of("src/main/resources/meia/playgorithm/engine");

    @Test
    void shouldKeepTheExpectedRulesInEachFile() throws Exception {
        assertEquals(31, rules("movies.drl").size());
        assertEquals(18, rules("users.drl").size());
    }

    @Test
    void shouldGiveEveryRuleAUniqueName() throws Exception {
        List<RuleDescr> rules = rules("movies.drl", "users.drl");
        HashSet<String> names = new HashSet<>();
        for (RuleDescr rule : rules) {
            assertTrue(names.add(rule.getName()), "duplicate rule " + rule.getName());
        }
    }

    @Test
    void shouldKeepOnlyQueriesInQueriesDrl() throws Exception {
        assertTrue(rules("queries.drl").isEmpty());
    }

    private static List<RuleDescr> rules(String... files) throws Exception {
        List<RuleDescr> rules = new ArrayList<>();
        for (String file : files) {
            DrlParser parser = new DrlParser();
            PackageDescr descr = parser.parse(null, Files.readString(DRL.resolve(file)));
            assertFalse(parser.hasErrors(), file + ": " + parser.getErrors());
            descr.getRules().stream().filter(rule -> !rule.isQuery()).forEach(rules::add);
        }
        return rules;
    }
}
