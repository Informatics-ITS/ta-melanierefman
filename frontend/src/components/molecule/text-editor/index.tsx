"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./menubar";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}
export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        defaultProtocol: 'https',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[156px] py-2 px-3",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}