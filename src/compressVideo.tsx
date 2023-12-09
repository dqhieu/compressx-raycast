import { showToast, Toast, getSelectedFinderItems } from "@raycast/api";
import { exec } from "child_process";
import path from "path";

export default async function main() {
  let filePaths: string[];

  try {
    filePaths = (await getSelectedFinderItems()).map((f) => f.path);
    if (filePaths.length > 0) {
      
      const filePath = filePaths[0];

      const fileExtension = path.extname(filePath).toLowerCase();
      const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'];

      // if (!videoExtensions.includes(fileExtension)) {
      //   await showToast({
      //     style: Toast.Style.Failure,
      //     title: "File format is not supported"
      //   });
      //   return;
      // }

      const url = `compressx://open?path=file://${filePath}&autoCompress=true`;
      
      await showToast({
        style: Toast.Style.Success,
        title: "Compressing with CompressX"
      });
      exec(`open "${url}"`, (error, stdout, stderr) => {
      });
    }
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: e instanceof Error ? e.message : "Could not get the selected Finder items",
    });
    return;
  }
}