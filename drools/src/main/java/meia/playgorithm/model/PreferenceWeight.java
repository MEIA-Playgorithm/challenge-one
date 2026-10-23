package meia.playgorithm.model;

/** Reference knowledge from preference-weights.csv: how much a preference reason adds to the score. */
public record PreferenceWeight(Reason reason, int weight) {
}
