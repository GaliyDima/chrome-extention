import "@pqina/pintura/pintura.css";
import * as React from "react";

import {
  setPlugins,
  plugin_annotate,
  plugin_crop,
  plugin_redact,
  PinturaImageState,
  processImage,
  Rect,
  MarkupEditorToolStyleDefaults,
  createMarkupEditorToolStyles,
  Shape,
  ShapeToolOptions,
} from "@pqina/pintura";
import { PinturaEditor as Editor } from "@pqina/react-pintura";
import {
  MarkupControl,
  defaultMarkupEditorStyles,
  editorConfig,
  getLastSelectedControlFromStorage,
  getMarkupEditorStylesFromStorage,
  setLastSelectedControlToStorage,
  setMarkupEditorStylesToStorage,
} from "./utils";

export interface IProps {
  ref?: React.Ref<any>;
  imageDataUrl: string;
  imageState: PinturaImageState;
  imageTransform: any;
  onImageStateChange: any;
}

export const PinturaEditor: React.FC<IProps> = React.memo(
  React.forwardRef((props: IProps, ref) => {
    const {
      imageState,
      imageDataUrl,
      imageTransform,
      onImageStateChange: onChange,
    } = props;

    const editorRef = React.useRef<Editor>(null);
    const shapeRef = React.useRef<Shape>(null);
    const copyRef = React.useRef<Shape>(null);

    const [pluginsRegistered, setPluginsRegistered] =
      React.useState<boolean>(false);
    const [markupEditorStyles, setMarkupEditorStyles] =
      React.useState<MarkupEditorToolStyleDefaults>(defaultMarkupEditorStyles);

    React.useEffect(() => {
      if (pluginsRegistered) {
        editorRef.current.editor.on("update", (evt) => {
          onChange(evt);
        });

        editorRef.current.editor.on("selectstyle", async (evt) => {
          const oldStyles = await getMarkupEditorStylesFromStorage();
          const lastSelectedControl: MarkupControl =
            await getLastSelectedControlFromStorage();
          const existingStyles = oldStyles[lastSelectedControl];

          const mergeProperties = (
            target: [Shape, ShapeToolOptions] | Shape,
            source: Shape
          ) => {
            for (const key in source) {
              if (source.hasOwnProperty(key) && target.hasOwnProperty(key)) {
                target[key] = source[key];
              }
            }
          };

          if (existingStyles[0]) {
            if (evt.hasOwnProperty("cornerRadius")) {
              existingStyles[0].cornerRadius = evt.cornerRadius;
            }
            mergeProperties(existingStyles[0], evt);
          }

          if (existingStyles[0]) {
            if (evt.hasOwnProperty("fontFamily")) {
              existingStyles[0].fontFamily = evt.fontFamily;
            }
            mergeProperties(existingStyles[0], evt);
          }

          if (existingStyles[0]) {
            if (evt.hasOwnProperty("lineHeight")) {
              existingStyles[0].lineHeight = evt.lineHeight;
            }
            mergeProperties(existingStyles[0], evt);
          }

          if (existingStyles[0]) {
            if (evt.hasOwnProperty("fontStyle")) {
              existingStyles[0].fontStyle = evt.fontStyle;
            }
            mergeProperties(existingStyles[0], evt);
          }

          if (existingStyles[0]) {
            if (evt.hasOwnProperty("fontWeight")) {
              existingStyles[0].fontWeight = evt.fontWeight;
            }
            mergeProperties(existingStyles[0], evt);
          }

          const updated = await createMarkupEditorToolStyles({
            ...oldStyles,
            [lastSelectedControl]: existingStyles,
          });

          setMarkupEditorStylesToStorage(updated);

          editorRef.current.editor.markupEditorToolStyles = updated;
        });

        editorRef.current.editor.on("selectcontrol", (evt) => {
          setLastSelectedControlToStorage(evt);
        });
      }
    }, [pluginsRegistered]);

    React.useEffect(() => {
      setPlugins(plugin_annotate, plugin_crop, plugin_redact);

      getMarkupEditorStylesFromStorage().then((v) => {
        setMarkupEditorStyles(v);
        getLastSelectedControlFromStorage().then(() => {
          setPluginsRegistered(true);
        });
      });
    }, []);

    const imageCrop = React.useMemo(
      () => ({
        x: -imageTransform.panX,
        y: -imageTransform.panY,
        width: imageTransform.width,
        height: imageTransform.height,
      }),
      [imageTransform]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        saveImage: (state: PinturaImageState, crop: Rect) =>
          new Promise((resolve, reject) => {
            processImage(imageDataUrl, {
              ...editorConfig,
              imageState: state,
              imageCrop: crop,
            })
              .then(({ dest }) => {
                const preview = new Image();
                preview.onload = () => {
                  const canvas = document.createElement("canvas");
                  const context = canvas.getContext("2d");
                  canvas.width = preview.width;
                  canvas.height = preview.height;
                  context.drawImage(preview, 0, 0);
                  const dataUrl = canvas.toDataURL("image/png");

                  resolve(dataUrl);
                };
                preview.onerror = (error) => {
                  reject(error);
                };
                preview.src = URL.createObjectURL(dest);
              })
              .catch((error) => {
                reject(error);
              });
          }),
      }),
      [imageDataUrl, imageState, imageCrop]
    );

    React.useEffect(() => {
      console.log("Image URL:", imageDataUrl);
    }, [imageDataUrl]);

    return pluginsRegistered ? (
      <Editor
        {...editorConfig}
        ref={editorRef}
        src={imageDataUrl}
        imageState={imageState}
        imageCrop={imageCrop}
        markupEditorToolStyles={markupEditorStyles}
        onSelectshape={(shape) => {
          shapeRef.current = shape;
        }}
      />
    ) : null;
  }),
  (prevProps, nextProps) => {
    return (
      prevProps.imageDataUrl === nextProps.imageDataUrl &&
      prevProps.imageState === nextProps.imageState &&
      prevProps.imageTransform === nextProps.imageTransform
    );
  }
);

export default PinturaEditor;
