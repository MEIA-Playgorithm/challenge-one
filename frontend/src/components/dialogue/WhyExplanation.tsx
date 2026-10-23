import { useState } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { describe, isYesNo, optionLabel } from "../../lib/dialogue";
import type { DialogueQuestion } from "../../types/Dialogue";

const code = { fontFamily: "monospace", fontSize: 12, overflowWrap: "anywhere" } as const;

type Props = {
    question: DialogueQuestion;
    // Chave -> texto das perguntas conhecidas, para descrever as respostas "sim" por palavras.
    questions: Record<string, string>;
};

const Bullets = ({ items }: { items: string[] }) => (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {items.map((item, index) => (
            <Typography component="li" variant="body2" key={index}>
                {item}
            </Typography>
        ))}
    </Box>
);

// O "porque" da consola, por palavras: o que a resposta permite concluir, o que o motor já
// sabe (as condições antes da pergunta) e o que falta verificar. A regra em Prolog fica à parte.
const WhyExplanation = ({ question, questions }: Props) => {
    const [showProlog, setShowProlog] = useState(false);
    const { why } = question;
    const asking = why.asking ?? why.conditions.length;
    const known = why.conditions.slice(0, asking);
    const pending = why.conditions.slice(asking + 1);
    const concludes = why.concludes.map((term) => describe(term, questions));

    return (
        <Stack spacing={1} sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {isYesNo(question.options)
                    ? `Se responderes ${optionLabel("sim")}, posso concluir:`
                    : "A tua escolha permite-me concluir:"}
            </Typography>
            <Bullets items={concludes} />
            {known.length > 0 && (
                <>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Pergunto porque já sei:
                    </Typography>
                    <Bullets items={known.map((term) => describe(term, questions))} />
                </>
            )}
            {pending.length > 0 && (
                <>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Depois da tua resposta, ainda tenho de verificar:
                    </Typography>
                    <Bullets items={pending.map((term) => describe(term, questions))} />
                </>
            )}
            <Link component="button" type="button" variant="caption" onClick={() => setShowProlog((current) => !current)} sx={{ alignSelf: "flex-start" }}>
                {showProlog ? "Esconder a regra" : `Mostrar a regra ${why.rule} em Prolog`}
            </Link>
            {showProlog && (
                <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 1 }}>
                    <Box sx={code}>regra {why.rule}</Box>
                    <Box sx={{ ...code, mt: 0.5 }}>se</Box>
                    {why.conditions.map((condition, index) => (
                        <Stack key={index} direction="row" spacing={1} sx={{ alignItems: "center", pl: 1.5 }}>
                            {index < asking ? (
                                <CheckCircleOutlineIcon sx={{ fontSize: 14 }} color="success" titleAccess="já verdadeiro" />
                            ) : index === asking ? (
                                <HelpOutlineIcon sx={{ fontSize: 14 }} color="primary" titleAccess="esta pergunta" />
                            ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} color="disabled" titleAccess="ainda não verificado" />
                            )}
                            <Box sx={code}>{condition.text}</Box>
                        </Stack>
                    ))}
                    <Box sx={{ ...code, mt: 0.5 }}>entao</Box>
                    {why.concludes.map((fact, index) => (
                        <Box key={index} sx={{ ...code, pl: 1.5 }}>
                            cria_facto({fact.text})
                        </Box>
                    ))}
                </Box>
            )}
        </Stack>
    );
};

export default WhyExplanation;
