"use client"

import dynamic from "next/dynamic";
import type { FC } from "react";

import type { RichTextEditorProps } from "./RichTextEditorClientOnly";

const CKEditorNoSSR = dynamic(() => import("./RichTextEditorClientOnly"), { ssr: false });

const RichTextEditor: FC<RichTextEditorProps> = (props) => <CKEditorNoSSR {...props} />;

export default RichTextEditor; 