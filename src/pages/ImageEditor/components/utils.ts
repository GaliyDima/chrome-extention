import {
    PinturaEditorOptions,
    createDefaultImageReader,
    createDefaultImageWriter,
    locale_en_gb,
    plugin_crop_locale_en_gb,
    plugin_annotate_locale_en_gb,
    plugin_redact_locale_en_gb,
    markup_editor_defaults,
    markup_editor_locale_en_gb,
    createMarkupEditorToolbar,
    createDefaultShapePreprocessor,
    createDefaultImageScrambler,
    createMarkupEditorToolStyles,
    createMarkupEditorToolStyle,
    createDefaultColorOptions,
    createDefaultStrokeScaleOptions,
    MarkupEditorToolStyleDefaults,
    plugin_finetune_defaults,
    plugin_filter_defaults,
    plugin_finetune_locale_en_gb,
    plugin_filter_locale_en_gb,
} from '@pqina/pintura';

export const defaultMarkupEditorStyles = createMarkupEditorToolStyles({
    rectangle: createMarkupEditorToolStyle('rectangle', {
        strokeColor: createDefaultColorOptions().red,
        backgroundColor: createDefaultColorOptions().transparent,
        strokeWidth: createDefaultStrokeScaleOptions().extraSmall,
    }),
});

export const editorConfig: PinturaEditorOptions = {
    // This will read the image data (required)
    imageReader: createDefaultImageReader(),
    // This will write the output image
    imageWriter: createDefaultImageWriter(),
    imageScrambler: createDefaultImageScrambler(),

    shapePreprocessor: createDefaultShapePreprocessor(),

    ...plugin_finetune_defaults,
    ...plugin_filter_defaults,
    ...markup_editor_defaults,

    markupEditorToolbar: createMarkupEditorToolbar(['arrow', 'line', 'rectangle', 'text']),

    locale: {
        ...locale_en_gb,
        ...plugin_crop_locale_en_gb,
        ...plugin_finetune_locale_en_gb,
        ...plugin_filter_locale_en_gb,
        ...plugin_annotate_locale_en_gb,
        ...plugin_redact_locale_en_gb,
        ...markup_editor_locale_en_gb,
    },
};

export type MarkupControl = "path" | "rectangle" | "ellipse" | "line" | "text";

export const getMarkupEditorStylesFromStorage = async () => {
    const { markupEditorStyles } = await chrome.storage.local.get('markupEditorStyles');

    return markupEditorStyles || defaultMarkupEditorStyles;
};

export const setMarkupEditorStylesToStorage = async (markupEditorStyles: MarkupEditorToolStyleDefaults) => {
    await chrome.storage.local.set({ markupEditorStyles });
};

export const getLastSelectedControlFromStorage = async (): Promise<MarkupControl> => {
    const { lastSelectedControl } = await chrome.storage.local.get('lastSelectedControl');

    return lastSelectedControl;
};

export const setLastSelectedControlToStorage = async (lastSelectedControl: MarkupControl) => {
    await chrome.storage.local.set({ lastSelectedControl });
};