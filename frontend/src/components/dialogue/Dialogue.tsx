import { useState, type ReactElement } from "react";
import { Box, Button, CircularProgress, IconButton, LinearProgress, Stack, Tooltip, Typography, type Theme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SearchIcon from "@mui/icons-material/Search";
import ReplayIcon from "@mui/icons-material/Replay";
import { useApp } from "../../context/AppContext";
import { config, type EngineId } from "../../lib/config";
import EngineSelector from "../recommendations/EngineSelector";
import FadeLine from "../common/FadeLine";
import { useDialogue } from "../../hooks/useDialogue";
import { fade } from "../../lib/fade";
import { isYesNo, optionLabel } from "../../lib/dialogue";
import type { DialogueAnswers, DialogueQuestion } from "../../types/Dialogue";
import DialogueResults from "./DialogueResults";
import WhyExplanation from "./WhyExplanation";

// Ícones das experiências (os mesmos ícones monocromáticos do resto da interface).
const OPTION_ICONS: Record<string, ReactElement> = {
    emocao: <FavoriteIcon fontSize="inherit" />,
    comedia: <EmojiEmotionsIcon fontSize="inherit" />,
    acao: <BoltIcon fontSize="inherit" />,
    misterio: <SearchIcon fontSize="inherit" />,
    terror: <NightsStayIcon fontSize="inherit" />,
    ficcao_cientifica: <RocketLaunchIcon fontSize="inherit" />,
    fantasia: <AutoAwesomeIcon fontSize="inherit" />,
};

// Cada parte do diálogo (a conversa e cada motor) é uma coluna; da 2.ª em diante tem uma linha tenue
// vertical à esquerda, a meio do espaço entre colunas (só em ecrãs largos, onde ficam lado a lado).
const column = (theme: Theme) => ({
    position: "relative",
    [theme.breakpoints.up("lg")]: {
        "&:not(:first-of-type)::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -12,
            width: "1px",
            background: fade(theme, "to bottom"),
        },
    },
});

// Barra no topo da coluna enquanto o motor responde; flutua, por isso não mexe no conteúdo.
// (As colunas usam useFlexGap: com margens, a barra contava como irmão e empurrava o conteúdo 12 px.)
const Loading = () => <LinearProgress aria-label="À espera do motor" sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />;

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
                endIcon={<ExpandMoreIcon sx={{ transform: showWhy ? "rotate(180deg)" : "none" }} />}
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
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                {OPTION_ICONS[answer] && <Box component="span" aria-hidden sx={{ display: "flex", fontSize: 18 }}>{OPTION_ICONS[answer]}</Box>}
                <span>{optionLabel(answer)}</span>
            </Stack>
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
                    {OPTION_ICONS[option] && (
                        <Box component="span" aria-hidden sx={{ display: "flex", fontSize: 24 }}>
                            {OPTION_ICONS[option]}
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

type EngineDialogueProps = Props & { engine: EngineId; showChat: boolean; showTitle: boolean };

// One engine's dialogue. `showChat` is for the first engine only: the chat (pick today's
// experience, answer that branch's questions, with the why behind each) is shown once and
// every engine gets the column with its own results for the same answers.
const EngineDialogue = ({ engine, showChat, showTitle, answers, onAnswersChange }: EngineDialogueProps) => {
    const { currentUser, engineStatus } = useApp();
    const { dialogue, loading, error, answer, revise, restart } = useDialogue(
        engine,
        currentUser.user_id,
        answers,
        onAnswersChange,
        engineStatus[engine]
    );

    // Question texts, so explanations can say "you answered yes to ..." in words.
    const asked = [...(dialogue?.history ?? []), ...(dialogue?.question ? [dialogue.question] : [])];
    const questions = Object.fromEntries(asked.map((question) => [question.key, question.text]));

    return (
        <>
            {showChat && (
                <Stack spacing={1.5} useFlexGap sx={column}>
                    {loading && <Loading />}
                    <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                O que te apetece ver hoje?
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
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
                        </Stack>
                    )}
                </Stack>
            )}

            <Stack spacing={1.5} useFlexGap sx={column}>
                {loading && <Loading />}
                {showTitle && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {config.engines[engine].label}
                    </Typography>
                )}
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
                {!dialogue && loading && <CircularProgress size={24} />}
                {dialogue && <DialogueResults dialogue={dialogue} questions={questions} />}
            </Stack>
        </>
    );
};

// One chat and, next to it, each chosen engine's results for the same answers.
const Dialogue = ({ answers, onAnswersChange }: Props) => {
    const { engines } = useApp();

    return (
        <Stack spacing={2} sx={{ minHeight: "100%" }}>
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                <EngineSelector />
            </Stack>
            <FadeLine />
            {engines.length === 0 && (
                <Typography color="textSecondary" variant="body2">
                    Nenhum motor selecionado. Seleciona pelo menos um motor para o diálogo.
                </Typography>
            )}
            <Box
                sx={{
                    display: "grid",
                    gap: 3,
                    flex: 1,
                    gridTemplateColumns: { xs: "1fr", lg: `minmax(0, 4fr) repeat(${Math.max(engines.length, 1)}, minmax(0, 5fr))` },
                }}
            >
                {engines.map((engine, index) => (
                    <EngineDialogue
                        key={engine}
                        engine={engine}
                        showChat={index === 0}
                        showTitle={engines.length > 1}
                        answers={answers}
                        onAnswersChange={onAnswersChange}
                    />
                ))}
            </Box>
        </Stack>
    );
};

export default Dialogue;
