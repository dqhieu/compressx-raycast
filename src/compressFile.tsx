import { showToast, Toast, getSelectedFinderItems, ActionPanel, Action, Form, popToRoot, LocalStorage } from "@raycast/api";
import { exec } from "child_process";
import { checkCompressXInstallation } from "./utils/checkInstall";
import { useState, useEffect } from "react";
import path from "path";

export default function Command() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"video" | "image" | null>(null);
  const [quality, setQuality] = useState<string>("high");
  const [videoFormat, setVideoFormat] = useState<string>("same");
  const [imageFormat, setImageFormat] = useState<string>("same");

  useEffect(() => {
    checkCompressXInstallation().then(setIsInstalled);
    getSelectedFinderItems().then((items) => {
      if (items.length > 0) {
        setSelectedFile(items[0].path);
        const ext = path.extname(items[0].path).toLowerCase();
        setFileType(ext.match(/\.(mp4|mov|avi|mkv|webm)$/) ? "video" : "image");
      }
    });
    
    // Load saved preferences
    LocalStorage.getItem<string>("savedQuality").then((savedQuality) => {
      if (savedQuality) setQuality(savedQuality);
    });
    LocalStorage.getItem<string>("savedVideoFormat").then((savedFormat) => {
      if (savedFormat) setVideoFormat(savedFormat);
    });
    LocalStorage.getItem<string>("savedImageFormat").then((savedFormat) => {
      if (savedFormat) setImageFormat(savedFormat);
    });
  }, []);

  const qualityOptions = [
    { title: "High", value: "high" },
    { title: "Good", value: "good" },
    { title: "Medium", value: "medium" },
    { title: "Acceptable", value: "acceptable" },
  ];

  const videoFormatOptions = [
    { title: "Same as input", value: "same" },
    { title: "MP4", value: "mp4" },
    { title: "WebM", value: "webm" },
  ];

  const imageFormatOptions = [
    { title: "Same as input", value: "same" },
    { title: "PNG", value: "png" },
    { title: "JPG", value: "jpg" },
    { title: "WebP", value: "webp" },
  ];

  const compressFile = async (values: { quality: string; format: string }) => {
    if (!selectedFile) return;

    try {
      const url = `compressx://open?path=file://${selectedFile}&quality=${values.quality}&format=${values.format}`;
      exec(`open "${url}"`);
      
      // Save user preferences
      await LocalStorage.setItem("savedQuality", values.quality);
      await LocalStorage.setItem(fileType === "video" ? "savedVideoFormat" : "savedImageFormat", values.format);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Sent to CompressX for compressing",
        message: `Quality: ${values.quality}, Format: ${values.format}`,
      });
      await popToRoot();
    } catch (e) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: e instanceof Error ? e.message : "An error occurred",
      });
    }
  };

  if (isInstalled === null || !selectedFile || !fileType) {
    return <Form isLoading={true} />;
  }

  if (isInstalled === false) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action.OpenInBrowser title="Install CompressX" url="https://compressx.app" />
          </ActionPanel>
        }
      >
        <Form.Description text="CompressX is not installed. Please install it to use this extension." />
      </Form>
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Compress File" onSubmit={compressFile} />
        </ActionPanel>
      }
    >
      <Form.Dropdown 
        id="quality" 
        title="Quality" 
        value={quality}
        onChange={setQuality}
      >
        {qualityOptions.map((option) => (
          <Form.Dropdown.Item key={option.value} value={option.value} title={option.title} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown 
        id="format" 
        title="Output Format" 
        value={fileType === "video" ? videoFormat : imageFormat}
        onChange={(newValue) => fileType === "video" ? setVideoFormat(newValue) : setImageFormat(newValue)}
      >
        {(fileType === "video" ? videoFormatOptions : imageFormatOptions).map((option) => (
          <Form.Dropdown.Item key={option.value} value={option.value} title={option.title} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
