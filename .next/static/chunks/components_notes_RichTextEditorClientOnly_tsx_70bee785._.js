(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/notes/RichTextEditorClientOnly.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-react/dist/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$build$2d$classic$2f$build$2f$ckeditor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js [app-client] (ecmascript)");
"use client";
;
;
;
;
const RichTextEditorClientOnly = ({ value, onChange, placeholder, disabled })=>{
    const editorConfig = {
        placeholder: placeholder || "Write your note content...",
        toolbar: [
            "bold",
            "italic",
            "underline",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "|",
            "undo",
            "redo"
        ],
        removePlugins: [
            "CKFinderUploadAdapter",
            "CKFinder",
            "EasyImage",
            "Image",
            "ImageCaption",
            "ImageStyle",
            "ImageToolbar",
            "ImageUpload"
        ],
        language: "en"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-ba37e3ecb8e04ed0" + " " + "rich-text-editor-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CKEditor"], {
                editor: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$build$2d$classic$2f$build$2f$ckeditor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
                config: editorConfig,
                data: value,
                disabled: disabled,
                onChange: (event, editor)=>{
                    const data = editor.getData();
                    onChange(data);
                }
            }, void 0, false, {
                fileName: "[project]/components/notes/RichTextEditorClientOnly.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ba37e3ecb8e04ed0",
                children: ".rich-text-editor-container .ck-editor__editable{color:#fff!important;background-color:#33415580!important;border:1px solid #475569!important;border-radius:.5rem!important;min-height:200px!important;padding:1rem!important;font-size:.875rem!important;line-height:1.25rem!important}.rich-text-editor-container .ck-editor__editable:focus{border-color:#3b82f6!important;outline:none!important;box-shadow:0 0 0 2px #3b82f633!important}.rich-text-editor-container .ck-editor__editable.ck-blurred{border-color:#475569!important}.rich-text-editor-container .ck-toolbar{background-color:#334155cc!important;border:1px solid #475569!important;border-bottom:none!important;border-radius:.5rem .5rem 0 0!important;padding:.5rem!important}.rich-text-editor-container .ck-toolbar__items{gap:.25rem!important}.rich-text-editor-container .ck-button{color:#cbd5e1!important;background-color:#0000!important;border:1px solid #0000!important;border-radius:.25rem!important;padding:.25rem .5rem!important;font-size:.75rem!important;font-weight:500!important;transition:all .2s!important}.rich-text-editor-container .ck-button:hover{color:#fff!important;background-color:#47556980!important;border-color:#64748b!important}.rich-text-editor-container .ck-button.ck-on{color:#93c5fd!important;background-color:#3b82f633!important;border-color:#3b82f6!important}.rich-text-editor-container .ck-button.ck-disabled{opacity:.5!important;cursor:not-allowed!important}.rich-text-editor-container .ck-toolbar__separator{background-color:#475569!important;margin:0 .25rem!important}.rich-text-editor-container .ck-editor__editable p{margin:.5rem 0!important}.rich-text-editor-container .ck-editor__editable ul,.rich-text-editor-container .ck-editor__editable ol{margin:.5rem 0!important;padding-left:1.5rem!important}.rich-text-editor-container .ck-editor__editable a{color:#93c5fd!important;text-decoration:underline!important}.rich-text-editor-container .ck-editor__editable a:hover{color:#bfdbfe!important}.rich-text-editor-container .ck.ck-editor__main{border-radius:0 0 .5rem .5rem!important;overflow:hidden!important}.rich-text-editor-container .ck.ck-editor__top{border-radius:.5rem .5rem 0 0!important;overflow:hidden!important}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/notes/RichTextEditorClientOnly.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
};
_c = RichTextEditorClientOnly;
const __TURBOPACK__default__export__ = RichTextEditorClientOnly;
var _c;
__turbopack_context__.k.register(_c, "RichTextEditorClientOnly");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/notes/RichTextEditorClientOnly.tsx [app-client] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/components/notes/RichTextEditorClientOnly.tsx [app-client] (ecmascript)"));
}}),
}]);

//# sourceMappingURL=components_notes_RichTextEditorClientOnly_tsx_70bee785._.js.map