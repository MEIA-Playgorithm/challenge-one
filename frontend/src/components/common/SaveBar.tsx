import { useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    CircularProgress,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { AUTOSAVE_DELAY_MS } from "../../hooks/useSave";

type Props = {
    dirty: boolean;
    // Impede a gravação (ex.: campos inválidos); mostrado no lugar do estado.
    blocked?: string;
    saving: boolean;
    error: string | null;
    // Milissegundos que faltam para a gravação automática, ou null.
    remaining: number | null;
    autosave: boolean;
    onAutosaveChange: (autosave: boolean) => void;
    onReset: () => void;
    onSave: () => void;
};

const SaveBar = ({ dirty, blocked, saving, error, remaining, autosave, onAutosaveChange, onReset, onSave }: Props) => {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const message =
        error ??
        blocked ??
        (saving
            ? "A guardar..."
            : remaining !== null
              ? `A guardar em ${Math.ceil(remaining / 1000)}s`
              : dirty
                ? "Alterações por guardar"
                : "Todas as alterações guardadas");

    return (
        <Box
            sx={{
                position: "sticky",
                bottom: -16,
                zIndex: 1,
                mx: -2,
                mb: -2,
                px: 2,
                py: 1.5,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2" color={error || blocked ? "error" : dirty ? "primary" : "text.secondary"} sx={{ flex: 1 }}>
                    {message}
                </Typography>
                <Button variant="text" size="small" color="inherit" startIcon={<CloseIcon />} disabled={!dirty} onClick={onReset}>
                    Repor
                </Button>
                {/* Sem alterações o grupo fica só com contorno, para a seta não parecer ativa ao lado do botão apagado. */}
                <ButtonGroup variant={dirty ? "contained" : "outlined"} size="small" disabled={saving}>
                    <Button
                        startIcon={
                            remaining !== null ? (
                                <CircularProgress
                                    variant="determinate"
                                    value={(remaining / AUTOSAVE_DELAY_MS) * 100}
                                    size={18}
                                    thickness={6}
                                    color="inherit"
                                    aria-label="Tempo até guardar automaticamente"
                                />
                            ) : (
                                <CheckIcon />
                            )
                        }
                        disabled={!dirty || Boolean(blocked) || saving}
                        onClick={onSave}
                    >
                        Guardar
                    </Button>
                    <Button size="small" aria-label="Opções de gravação" onClick={(event) => setMenuAnchor(event.currentTarget.parentElement)}>
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                {/* O tema dá width 100% e flex 1 a todos os Paper; aqui o menu tem de ter o tamanho do conteúdo. */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                    slotProps={{ paper: { sx: { width: "auto", flex: "none" } } }}
                >
                    <MenuItem
                        dense
                        onClick={() => {
                            onAutosaveChange(!autosave);
                            setMenuAnchor(null);
                        }}
                    >
                        <Checkbox size="small" checked={autosave} disableRipple sx={{ p: 0, mr: 1.5 }} />
                        <ListItemText primary="Guardar automaticamente" secondary="Guarda 5 segundos após a última alteração" />
                    </MenuItem>
                </Menu>
            </Stack>
        </Box>
    );
};

export default SaveBar;
