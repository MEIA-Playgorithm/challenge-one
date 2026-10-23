import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";

type Props = {
    open: boolean;
    userId: string | null;
    onClose: () => void;
};

const DeleteUserDialog = ({ open, userId, onClose }: Props) => {
    const { deleteUser } = useApp();
    const [deleting, setDeleting] = useState(false);

    const confirm = async () => {
        if (!userId) return;
        setDeleting(true);
        const message = await deleteUser(userId);
        setDeleting(false);
        if (message) return toast.error(message);
        toast.success(`${userId} eliminado`);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Eliminar {userId}?</DialogTitle>
            <DialogContent>
                <DialogContentText>Isto remove {userId} da lista.</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button color="error" disabled={deleting} onClick={confirm}>
                    Eliminar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteUserDialog;
