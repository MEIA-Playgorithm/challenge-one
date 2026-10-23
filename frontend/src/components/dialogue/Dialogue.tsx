import { useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import { useApp } from "../../context/AppContext";
import { useDialogue } from "../../hooks/useDialogue";
import { isYesNo, optionIcon, optionLabel } from "../../lib/dialogue";
import type { DialogueAnswers, DialogueQuestion } from "../../types/Dialogue";
import DialogueResults from "./DialogueResults";
import WhyExplanation from "./WhyExplanation";

const engineBubble = {
    alignSelf: "flex-start",
    maxWidth: "92%",
    bgcolor: "background.default",
    border: 1,
    borderColor: "divider",
    borderRadius: 2,
    borderTopLeftRadius: 4,
    px: 1.5,
    py: 1,
} as const;

// An engine message: the question and, on request, its why.
const EngineMessage = ({ question, questions }: { question: DialogueQuestion; questions: Record<string, string> }) => {
    const [showWhy, setShowWhy] = useState(false);
    return (
        <Box sx={engineBubble}>
            <Typography variant="body2">{question.text}</Typography>
            <Button
                size="small"
                startIcon={<HelpOutlineIcon />}
                aria-expanded={showWhy}
                onClick={() => setShowWhy((current) => !current)}
                sx={{ mt: 0.5, ml: -0.75, py: 0 }}
            >
                {showWhy ? "Esconder" : "Porquê esta pergunta?"}
            </Button>
            {showWhy && <WhyExplanation question={question} questions={questions} />}
        </Box>
    );
};

// The given answer, on the user's side, with a button to change it.
const UserMessage = ({ answer, disabled, onRevise }: { answer: string; disabled: boolean; onRevise: () => void }) => (
    <Stack direction="row" spacing={0.5} sx={{ alignSelf: "flex-end", alignItems: "center" }}>
        <Tooltip title="Mudar esta resposta (as perguntas seguintes voltam a ser feitas)">
            <span>
                <IconButton size="small" aria-label="Mudar esta resposta" disabled={disabled} onClick={onRevise}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
        <Box
            sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                borderRadius: 2,
                borderTopRightRadius: 4,
                px: 1.5,
                py: 0.75,
                fontWeight: 600,
            }}
        >
            {optionIcon(answer) && <span aria-hidden>{optionIcon(answer)} </span>}
            {optionLabel(answer)}
        </Box>
    </Stack>
);

type AnswerOptionsProps = { options: string[]; disabled: boolean; onAnswer: (value: string) => void };

// The current question's options: yes/no as two buttons, a choice as a grid.
const AnswerOptions = ({ options, disabled, onAnswer }: AnswerOptionsProps) =>
    isYesNo(options) ? (
        <Stack direction="row" spacing={1} sx={{ alignSelf: "flex-end" }}>
            <Button variant="contained" disabled={disabled} onClick={() => onAnswer("sim")}>
                {optionLabel("sim")}
            </Button>
            <Button variant="outlined" disabled={disabled} onClick={() => onAnswer("nao")}>
                {optionLabel("nao")}
            </Button>
        </Stack>
    ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 1 }}>
            {options.map((option) => (
                <Button
                    key={option}
                    variant="outlined"
                    disabled={disabled}
                    onClick={() => onAnswer(option)}
                    sx={{ flexDirection: "column", py: 1.25, gap: 0.5 }}
                >
                    {optionIcon(option) && (
                        <Box component="span" aria-hidden sx={{ fontSize: 24, lineHeight: 1 }}>
                            {optionIcon(option)}
                        </Box>
                    )}
                    {optionLabel(option)}
                </Button>
            ))}
        </Box>
    );

type Props = {
    answers: DialogueAnswers;
    onAnswersChange: (answers: DialogueAnswers) => void;
};

// The engine dialogue as a chat: pick today's experience, answer that branch's questions
// and see the movies that fit, with the why behind everything.
const Dialogue = ({ answers, onAnswersChange }: Props) => {
    const { currentUser, engineStatus } = useApp();
    const { dialogue, loading, error, answer, revise, restart } = useDialogue(
        currentUser.user_id,
        answers,
        onAnswersChange,
        engineStatus.prolog
    );

    // Question texts, so explanations can say "you answered yes to ..." in words.
    const asked = [...(dialogue?.history ?? []), ...(dialogue?.question ? [dialogue.question] : [])];
    const questions = Object.fromEntries(asked.map((question) => [question.key, question.text]));

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 5fr) minmax(0, 6fr)" },
                gap: 3,
                alignItems: "start",
            }}
        >
            <Stack spacing={1.5}>
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            O que te apetece ver hoje?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            O motor de recomendação faz algumas perguntas para esta sessão. Pergunta porquê em qualquer pergunta para veres o raciocínio.
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        color="inherit"
                        startIcon={<ReplayIcon />}
                        disabled={loading || !dialogue?.history.length}
                        onClick={restart}
                        sx={{ flexShrink: 0 }}
                    >
                        Recomeçar
                    </Button>
                </Stack>

                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
                {!dialogue && loading && <CircularProgress size={24} />}

                {dialogue && (
                    <Stack spacing={1.25} aria-live="polite">
                        {dialogue.history.map((item, index) => (
                            <Stack key={item.key} spacing={1.25}>
                                <EngineMessage question={item} questions={questions} />
                                <UserMessage answer={item.answer} disabled={loading} onRevise={() => revise(index)} />
                            </Stack>
                        ))}
                        {dialogue.question ? (
                            <Stack key={dialogue.question.key} spacing={1.25}>
                                <EngineMessage question={dialogue.question} questions={questions} />
                                <AnswerOptions
                                    options={dialogue.question.options}
                                    disabled={loading}
                                    onAnswer={(value) => answer(dialogue.question!.key, value)}
                                />
                            </Stack>
                        ) : (
                            <Box sx={engineBubble}>
                                <Typography variant="body2">É tudo o que precisava. As tuas sugestões estão prontas.</Typography>
                            </Box>
                        )}
                        {loading && <CircularProgress size={18} sx={{ alignSelf: "flex-start" }} aria-label="À espera do motor" />}
                    </Stack>
                )}
            </Stack>

            {dialogue && <DialogueResults dialogue={dialogue} questions={questions} />}
        </Box>
    );
};

export default Dialogue;
