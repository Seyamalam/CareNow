import { Dialog, Button } from "panelui-native";
export function Confirm({
  open,
  setOpen,
  title,
  detail,
  onConfirm,
  loading = false,
  label = "Confirm",
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  detail: string;
  onConfirm: () => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{detail}</Dialog.Description>
        <Dialog.Footer>
          <Button variant="ghost" onPress={() => setOpen(false)}>
            Keep
          </Button>
          <Button variant="destructive" loading={loading} onPress={onConfirm}>
            {label}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
