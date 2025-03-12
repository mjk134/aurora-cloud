import { Folder } from "@prisma/client";
import { AlertDialog } from "radix-ui";

export default function DeleteFolderAlert({
    selectedFolder,
}: {
    selectedFolder: Folder;
}) {
    return (
        <AlertDialog.Root>
		<AlertDialog.Trigger />
		<AlertDialog.Portal>
			<AlertDialog.Overlay />
			<AlertDialog.Content>
				<AlertDialog.Title>
                    Are you sure you want to delete this folder?
                </AlertDialog.Title>
				<AlertDialog.Description />
				<AlertDialog.Cancel />
				<AlertDialog.Action />
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>

    )
}