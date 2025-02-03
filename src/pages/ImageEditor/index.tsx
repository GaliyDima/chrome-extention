import React from "react";

import { createRoot } from "react-dom/client";

import ImageEditor from "./ImageEditor";
import "./index.css";

const root = createRoot(window.document.querySelector("#app-container")!);
root.render(<ImageEditor />);

if ((module as any).hot) (module as any).hot.accept();
