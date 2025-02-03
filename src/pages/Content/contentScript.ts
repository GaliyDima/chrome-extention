document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openEditor") {
      openModalEditor(request.imageSrc);
      sendResponse({ status: "Editor opened" });
    }
  });

  function openModalEditor(imageSrc: string) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <canvas id="editorCanvas"></canvas>
        <button id="saveButton">Save</button>
      </div>
    `;
    document.body.appendChild(modal);

    const canvas = document.getElementById("editorCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context?.drawImage(img, 0, 0);
    };
    img.src = imageSrc;

    modal.querySelector(".close")?.addEventListener("click", () => {
      modal.remove();
    });

    document.getElementById("saveButton")?.addEventListener("click", () => {
      const dataUrl = canvas.toDataURL("image/png");
      chrome.storage.local.set({ editedImage: dataUrl }, () => {
        console.log("Edited image saved");
      });
      modal.remove();
    });
  }
});
