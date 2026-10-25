package meia.playgorithm.engine.dialogue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Minimal logic term (name and arguments) used by the dialogue explanations. Variables start
 * with an uppercase letter or '_' (each '_' is a fresh variable). Unquoted
 * atoms with spaces, such as Romantic Comedy, are read as atoms.
 */
public record Term(String name, List<Term> args, boolean variable) {

    private static final AtomicLong FRESH = new AtomicLong();

    public Term {
        args = List.copyOf(args);
    }

    public static Term atom(String name) {
        return new Term(name, List.of(), false);
    }

    public static Term compound(String name, Term... args) {
        return new Term(name, List.of(args), false);
    }

    public static Term parse(String text) {
        Parser parser = new Parser(stripFinalDot(text));
        Term term = parser.term();
        parser.end();
        return term;
    }

    /** Parses a rule body such as "a(U) e b(U, x)". */
    public static List<Term> parseConjunction(String text) {
        Parser parser = new Parser(stripFinalDot(text));
        List<Term> terms = new ArrayList<>();
        terms.add(parser.term());
        while (parser.conjunction()) {
            terms.add(parser.term());
        }
        parser.end();
        return terms;
    }

    /** Copy with every variable renamed apart, so each use of a rule has its own variables. */
    public Term renamed(Map<String, Term> renames) {
        if (variable) {
            return renames.computeIfAbsent(name, ignored -> fresh(name));
        }
        return new Term(name, args.stream().map(arg -> arg.renamed(renames)).toList(), false);
    }

    public Term substitute(Map<String, Term> bindings) {
        Term term = walk(this, bindings);
        if (term.variable) {
            return term;
        }
        return new Term(term.name, term.args.stream().map(arg -> arg.substitute(bindings)).toList(), false);
    }

    /** Unifies two terms, extending {@code bindings}. Returns false (bindings may be partial) on failure. */
    public static boolean unify(Term left, Term right, Map<String, Term> bindings) {
        Term a = walk(left, bindings);
        Term b = walk(right, bindings);
        if (a.variable && b.variable && a.name.equals(b.name)) {
            return true;
        }
        if (a.variable) {
            bindings.put(a.name, b);
            return true;
        }
        if (b.variable) {
            bindings.put(b.name, a);
            return true;
        }
        if (!a.name.equals(b.name) || a.args.size() != b.args.size()) {
            return false;
        }
        for (int i = 0; i < a.args.size(); i++) {
            if (!unify(a.args.get(i), b.args.get(i), bindings)) {
                return false;
            }
        }
        return true;
    }

    public static boolean unifiable(Term left, Term right) {
        return unify(left, right, new HashMap<>());
    }

    @Override
    public String toString() {
        if (variable) {
            return name.startsWith("_") ? "_" : name.replaceAll("#\\d+$", "");
        }
        String atom = name.matches("[a-z][a-zA-Z0-9_]*") ? name : "'" + name + "'";
        if (args.isEmpty()) {
            return atom;
        }
        return atom + args.stream().map(Term::toString).collect(Collectors.joining(", ", "(", ")"));
    }

    private static Term walk(Term term, Map<String, Term> bindings) {
        Term current = term;
        while (current.variable && bindings.containsKey(current.name)) {
            current = bindings.get(current.name);
        }
        return current;
    }

    private static Term fresh(String base) {
        return new Term(base + "#" + FRESH.incrementAndGet(), List.of(), true);
    }

    private static String stripFinalDot(String text) {
        String trimmed = text.trim();
        return trimmed.endsWith(".") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static final class Parser {
        private final String text;
        private int index;

        private Parser(String text) {
            this.text = text;
        }

        private Term term() {
            skipSpaces();
            if (index >= text.length()) {
                throw error("expected a term");
            }

            String name;
            boolean quoted = text.charAt(index) == '\'';
            if (quoted) {
                int close = text.indexOf('\'', index + 1);
                if (close < 0) {
                    throw error("unclosed quote");
                }
                name = text.substring(index + 1, close);
                index = close + 1;
            } else {
                int start = index;
                while (index < text.length() && "(),".indexOf(text.charAt(index)) < 0) {
                    index++;
                }
                name = text.substring(start, index).trim();
                if (name.isEmpty()) {
                    throw error("expected a name");
                }
            }

            skipSpaces();
            if (index < text.length() && text.charAt(index) == '(') {
                index++;
                List<Term> args = new ArrayList<>();
                args.add(term());
                skipSpaces();
                while (index < text.length() && text.charAt(index) == ',') {
                    index++;
                    args.add(term());
                    skipSpaces();
                }
                expect(')');
                return new Term(name, args, false);
            }

            if (!quoted && name.equals("_")) {
                return fresh("_");
            }
            boolean variable = !quoted && !name.contains(" ")
                && (Character.isUpperCase(name.charAt(0)) || name.charAt(0) == '_');
            return new Term(name, List.of(), variable);
        }

        /** Consumes the conjunction operator "e" between two terms. */
        private boolean conjunction() {
            skipSpaces();
            if (text.startsWith("e", index)
                && index + 1 < text.length()
                && Character.isWhitespace(text.charAt(index + 1))) {
                index++;
                return true;
            }
            return false;
        }

        private void end() {
            skipSpaces();
            if (index != text.length()) {
                throw error("unexpected text");
            }
        }

        private void expect(char character) {
            skipSpaces();
            if (index >= text.length() || text.charAt(index) != character) {
                throw error("expected '" + character + "'");
            }
            index++;
        }

        private void skipSpaces() {
            while (index < text.length() && Character.isWhitespace(text.charAt(index))) {
                index++;
            }
        }

        private IllegalArgumentException error(String message) {
            return new IllegalArgumentException("Invalid term '" + text + "': " + message + " at position " + index);
        }
    }
}
