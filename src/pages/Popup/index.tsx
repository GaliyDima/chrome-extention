import React from "react";
import { createRoot } from "react-dom/client";

import Popup from "./Popup";
import "./index.css";

const root = createRoot(window.document.querySelector("#app-container")!);
root.render(<Popup />);

if ((module as any).hot) (module as any).hot.accept();
