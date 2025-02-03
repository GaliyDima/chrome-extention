import React, { useState, useEffect, useRef, useCallback } from "react";

import "./Popup.css";

const Popup: React.FC = () => {
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    chrome.storage.local.get("screenshots", (result) => {
      if (result.screenshots) {
        setScreenshots(result.screenshots);
      }
    });
  }, []);

  const saveToLocalStorage = (dataUrl: string) => {
    const updatedScreenshots = [...screenshots, dataUrl];
    chrome.storage.local.set({ screenshots: updatedScreenshots }, () => {
      console.log("Screenshot saved");
      setScreenshots(updatedScreenshots);
      setCurrentIndex(updatedScreenshots.length - 1);
    });
  };

  const takeScreenshot = () => {
    chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window", "tab"],
      (streamId) => {
        if (!streamId) {
          console.error("Failed to get stream ID");
          return;
        }

        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: streamId,
              },
            } as any,
          })
          .then((stream) => {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              video.play();
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const context = canvas.getContext("2d");
              if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                saveToLocalStorage(dataUrl);
              }
              stream.getTracks().forEach((track) => track.stop());
            };
          })
          .catch((err) => console.error("Error capturing screen:", err));
      }
    );
  };

  const captureViewport = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      saveToLocalStorage(dataUrl);
    });
  };

  const showPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const showNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < screenshots.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const deleteScreenshot = () => {
    const updatedScreenshots = screenshots.filter(
      (_, index) => index !== currentIndex
    );
    chrome.storage.local.set({ screenshots: updatedScreenshots }, () => {
      setScreenshots(updatedScreenshots);
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    });
  };

  const downloadScreenshot = () => {
    const link = document.createElement("a");
    link.href = screenshots[currentIndex];
    link.download = `screenshot-${currentIndex + 1}.png`;
    link.click();
  };

  const openEditor = useCallback((imageToEdit: string) => {
    console.log("Opening editor with image:", imageToEdit);
    chrome.storage.local.set({ imageToEdit }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("imageEditor.html"),
      });
    });
  }, []);
  return (
    <div>
      <h1>Hello World</h1>

      <button onClick={takeScreenshot}>Screen/Window</button>
      <button onClick={captureViewport}>Viewport</button>

      {screenshots.length > 0 && (
        <div>
          <h2>Screenshot Preview:</h2>
          <div className="canvas-container">
            <img
              src={screenshots[currentIndex]}
              alt="Screenshot"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div>
            <button onClick={showPrevious} disabled={currentIndex === 0}>
              Previous
            </button>
            <button
              onClick={showNext}
              disabled={currentIndex === screenshots.length - 1}
            >
              Next
            </button>
            <button onClick={deleteScreenshot}>Delete</button>
            <button onClick={downloadScreenshot}>Download</button>
            <button onClick={() => openEditor(screenshots[currentIndex])}>
              Open in Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
