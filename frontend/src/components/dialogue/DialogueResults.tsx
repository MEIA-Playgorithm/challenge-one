import { useState } from "react";
import { Box, Chip, Link, Stack, Typography } from "@mui/material";
import { describe, matchLabel, optionLabel } from "../../lib/dialogue";
import type { Dialogue, DialogueConclusion } from "../../types/Dialogue";

const panel = { border: 1, borderColor: "divider", borderRadius: 2, p: 2 } as const;

// Facts that answer "what should the movie have?": the ones picks use.
const SUGGESTIONS = ["sugerir_genero", "sugerir_tom", "preferencia_sessao"];

// A conclusion in words and, on request, how it was reached (console how/1).
const Conclusion = ({ conclusion, questions }: { conclusion: DialogueConclusion; questions: Record<string, string> }) => {
    const [showHow, setShowHow] = useState(false);
    return (
        <Box component="li">
            <Typography variant="body2" component="span">
                {describe(conclusion.fact, questions)}
            </Typography>{" "}
            <Link component="button" type="button" variant="caption" onClick={() => setShowHow((current) => !current)}>
                {showHow ? "esconder" : "como?"}
            </Link>
            {showHow && (
                <Typography variant="caption" color="text.secondary" component="div">
                    Regra {conclusion.rule}, porque: {conclusion.premises.map((premise) => describe(premise, questions)).join("; ")}.
                </Typography>
            )}
        </Box>
    );
};

type Props = {
    dialogue: Dialogue;
    questions: Record<string, string>;
};

// Dialogue result: today's movies, what the engine concluded and what was left out.
const DialogueResults = ({ dialogue, questions }: Props) => {
    const hasSuggestions = dialogue.conclusions.some((conclusion) => SUGGESTIONS.includes(conclusion.fact.name));
    // A "no" stops the question's rule from concluding its facts (console whynot/1).
    const declined = dialogue.history.filter((item) => item.answer === "nao");

    return (
        <Stack spacing={2}>
            <Box sx={panel}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sugestões de hoje
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Recomendações de {dialogue.user_id} que encaixam nesta sessão, por isso os seus limites e exclusões continuam a aplicar-se.
                </Typography>
                {!hasSuggestions ? (
                    <Typography variant="body2" color="text.secondary">
                        {dialogue.question
                            ? "Responde às perguntas e os filmes que encaixam aparecem aqui."
                            : "As tuas respostas não levaram a nenhuma sugestão. Experimenta mudar uma delas."}
                    </Typography>
                ) : dialogue.picks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Nenhum dos filmes elegíveis de {dialogue.user_id} encaixa nestas sugestões. Os seus limites podem excluí-los.
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {dialogue.picks.map(({ movie, score, status, matches }) => (
                            <Box key={movie.id} sx={{ bgcolor: "background.default", borderRadius: 1.5, px: 1.5, py: 1 }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {movie.title}
                                        {movie.year !== null && (
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                {" "}
                                                ({movie.year})
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                        IMDb {movie.rating_imdb?.toFixed(1) ?? "?"} · {score} pts
                                    </Typography>
                                </Stack>
                                <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                                    {matches.map((match) => (
                                        <Chip key={`${match.type}-${match.value}`} label={matchLabel(match)} size="small" color="primary" />
                                    ))}
                                    {status === "alternative" && <Chip label="abaixo da tua classificação mínima" size="small" variant="outlined" />}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            {dialogue.conclusions.length > 0 && (
                <Box sx={panel}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        O que concluí
                    </Typography>
                    <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
                        {dialogue.conclusions.map((conclusion) => (
                            <Conclusion key={conclusion.fact.text} conclusion={conclusion} questions={questions} />
                        ))}
                    </Stack>
                </Box>
            )}

            {declined.length > 0 && (
                <Box sx={panel}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Excluído
                    </Typography>
                    <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
                        {declined.map((item) => (
                            <Typography component="li" variant="body2" key={item.key}>
                                {item.why.concludes.map((fact) => describe(fact, questions)).join("; ")}
                                <Typography component="span" variant="caption" color="text.secondary">
                                    {" "}
                                    — respondeste {optionLabel(item.answer)} a “{item.text}”
                                </Typography>
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
};

export default DialogueResults;
