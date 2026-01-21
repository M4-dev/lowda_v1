import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

type AlertDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: string;
  name: string;
  handleOK: () => void;
};

const AlertDialog = ({
  open,
  setOpen,
  action,
  name,
  handleOK,
}: AlertDialogProps) => {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        <WarningRoundedIcon style={{ marginRight: 8 }} />
        Confirmation
      </DialogTitle>
      <Divider />
      <DialogContent>
        Are you sure you want to {action} &quot;{name}&quot;?
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleOK();
            setOpen(false);
          }}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
