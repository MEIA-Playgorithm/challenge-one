import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import type { User } from "../../types/User";
import { avatarColor, initials } from "../../lib/utils";

type Props = {
    user: User;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

// O utilizador escolhido, com os botões de editar e apagar.
const UserSummary = ({ user, canDelete, onEdit, onDelete }: Props) => {
    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
                sx={{
                    width: 64,
                    height: 64,
                    bgcolor: avatarColor(user.user_id),
                    fontSize: 22,
                    fontWeight: 600,
                }}
            >
                {initials(user.user_id)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {user.user_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user.age ? `${user.age} anos` : "Sem idade definida"}
                </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={onEdit}>
                Editar
            </Button>
            <Button variant="outlined" size="small" color="error" disabled={!canDelete} onClick={onDelete}>
                Eliminar
            </Button>
        </Stack>
    );
};

export default UserSummary;
