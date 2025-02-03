chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenWindow") {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext("2d");
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL("image/png");
          // Збереження скріншоту
          chrome.storage.local.set({ screenshot: imgData }, () => {
            console.log("Screenshot saved.");
          });
          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((error) => console.error("Error capturing screen/window:", error));
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureViewport") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing viewport:", chrome.runtime.lastError);
        return;
      }
      console.log("Captured viewport:", dataUrl);
    });
  }
});
