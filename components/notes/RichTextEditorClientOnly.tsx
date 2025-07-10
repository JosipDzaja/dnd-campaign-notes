"use client";

import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditorClientOnly: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, disabled }) => {
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

  return (
    <div className="rich-text-editor-container">
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={value}
        disabled={disabled}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      <style jsx global>{`
        .rich-text-editor-container .ck-editor__editable {
          background-color: rgb(51 65 85 / 0.5) !important;
          border: 1px solid rgb(71 85 105) !important;
          border-radius: 0.5rem !important;
          color: white !important;
          min-height: 200px !important;
          padding: 1rem !important;
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }
        .rich-text-editor-container .ck-editor__editable:focus {
          outline: none !important;
          border-color: rgb(59 130 246) !important;
          box-shadow: 0 0 0 2px rgb(59 130 246 / 0.2) !important;
        }
        .rich-text-editor-container .ck-editor__editable.ck-blurred {
          border-color: rgb(71 85 105) !important;
        }
        .rich-text-editor-container .ck-toolbar {
          background-color: rgb(51 65 85 / 0.8) !important;
          border: 1px solid rgb(71 85 105) !important;
          border-bottom: none !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
          padding: 0.5rem !important;
        }
        .rich-text-editor-container .ck-toolbar__items {
          gap: 0.25rem !important;
        }
        .rich-text-editor-container .ck-button {
          background-color: transparent !important;
          border: 1px solid transparent !important;
          border-radius: 0.25rem !important;
          color: rgb(203 213 225) !important;
          padding: 0.25rem 0.5rem !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }
        .rich-text-editor-container .ck-button:hover {
          background-color: rgb(71 85 105 / 0.5) !important;
          border-color: rgb(100 116 139) !important;
          color: white !important;
        }
        .rich-text-editor-container .ck-button.ck-on {
          background-color: rgb(59 130 246 / 0.2) !important;
          border-color: rgb(59 130 246) !important;
          color: rgb(147 197 253) !important;
        }
        .rich-text-editor-container .ck-button.ck-disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        .rich-text-editor-container .ck-toolbar__separator {
          background-color: rgb(71 85 105) !important;
          margin: 0 0.25rem !important;
        }
        .rich-text-editor-container .ck-editor__editable p {
          margin: 0.5rem 0 !important;
        }
        .rich-text-editor-container .ck-editor__editable ul,
        .rich-text-editor-container .ck-editor__editable ol {
          margin: 0.5rem 0 !important;
          padding-left: 1.5rem !important;
        }
        .rich-text-editor-container .ck-editor__editable a {
          color: rgb(147 197 253) !important;
          text-decoration: underline !important;
        }
        .rich-text-editor-container .ck-editor__editable a:hover {
          color: rgb(191 219 254) !important;
        }
        .rich-text-editor-container .ck.ck-editor__main {
          border-radius: 0 0 0.5rem 0.5rem !important;
          overflow: hidden !important;
        }
        .rich-text-editor-container .ck.ck-editor__top {
          border-radius: 0.5rem 0.5rem 0 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorClientOnly; 