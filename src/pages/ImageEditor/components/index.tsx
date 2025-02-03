import React, { useEffect, useState, useRef } from "react";
import { Box } from "@mui/system";

import PinturaEditor from "./PinturaEditor";

const ImageEditor: React.FC = () => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const imageTransform = { panX: 0, panY: 0, width: 8000, height: 3000 };
  const drawings = { imageState: {} };
  const onImageStateChange = (newState: any) => {
    drawings.imageState = newState;
    console.log("Image state changed:", newState);
  };

  useEffect(() => {
    const fetchImageData = async () => {
      const result = await chrome.storage.local.get("imageToEdit");
      if (result.imageToEdit) {
        setImageDataUrl(result.imageToEdit);
      }
    };

    fetchImageData();
  }, []);

  const downloadImage = async () => {
    if (editorRef.current) {
      const editedImageDataUrl = await editorRef.current.saveImage(
        drawings.imageState,
        imageTransform
      );
      const link = document.createElement("a");
      link.href = editedImageDataUrl;
      link.download = "edited-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    imageDataUrl && (
      <Box
        sx={{
          maxWidth: "unset",
          maxHeight: "unset",
          width: "100vw",
          height: "100vh",
          margin: "0",
        }}
      >
        <button onClick={downloadImage}>Download</button>
        <PinturaEditor
          ref={editorRef}
          imageDataUrl={imageDataUrl}
          imageTransform={imageTransform}
          imageState={drawings.imageState}
          onImageStateChange={onImageStateChange}
        />
      </Box>
    )
  );
};

export default ImageEditor;
