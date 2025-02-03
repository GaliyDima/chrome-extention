export const getCurrentTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const sendToActiveTab = async (msg) => {
  const tab = await getCurrentTab();
  if (!tab) return;
  chrome.tabs.sendMessage(tab.id, msg);
};
