import { Avatar, Chip, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { User } from "../../types/User";
import { avatarColor, initials } from "../../lib/utils";

type Props = {
    users: User[];
    selectedId: string | null;
    creating: boolean;
    onSelect: (user: User) => void;
    onNew: () => void;
};

// Um chip por utilizador, mais o chip para criar um novo.
const UserList = ({ users, selectedId, creating, onSelect, onNew }: Props) => {
    const sorted = users.slice().sort((a, b) => a.user_id.toLowerCase().localeCompare(b.user_id.toLowerCase()));

    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", gap: 1 }}>
            {sorted.map((user) => {
                const selected = user.user_id === selectedId;
                return (
                    <Chip
                        key={user.user_id}
                        avatar={
                            <Avatar sx={{ bgcolor: avatarColor(user.user_id), fontSize: 12, color: "white !important" }}>
                                {initials(user.user_id)}
                            </Avatar>
                        }
                        label={user.user_id}
                        onClick={() => onSelect(user)}
                        variant={selected ? "filled" : "outlined"}
                        color={selected ? "primary" : "default"}
                        sx={{ fontWeight: selected ? 600 : 400 }}
                    />
                );
            })}
            <Tooltip title="New user">
                <Chip
                    icon={<AddIcon />}
                    label="New"
                    onClick={onNew}
                    variant={creating ? "filled" : "outlined"}
                    color={creating ? "primary" : "default"}
                />
            </Tooltip>
        </Stack>
    );
};

export default UserList;
