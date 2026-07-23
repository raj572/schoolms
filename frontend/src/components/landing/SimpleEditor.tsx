"use client";

import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";

const MenuBar = ({ editor }: any) => {
  if (!editor) return null;

  const baseButton =
    "px-2 py-1 text-sm rounded-md transition font-medium border border-transparent";
  const activeClass =
    "bg-primary/20 border-primary text-primary hover:bg-primary/30";
  const inactiveClass =
    "text-gray-300 hover:bg-muted/30 hover:text-primary/80";

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-700 p-2 bg-[#1b1d24] sticky top-0 z-10">
      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("bold") ? activeClass : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("italic") ? activeClass : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("underline") ? activeClass : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("heading", { level: 1 })
            ? activeClass
            : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("heading", { level: 2 })
            ? activeClass
            : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("bulletList") ? activeClass : inactiveClass
        }`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${
          editor.isActive("link") ? activeClass : inactiveClass
        }`}
        onClick={() => {
          const url = prompt("Enter URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        🔗 Link
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${inactiveClass}`}
        onClick={() => {
          const url = prompt("Enter image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        🖼️ Img
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={`${baseButton} ${inactiveClass}`}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Reset
      </Button>
    </div>
  );
};

interface SimpleEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline hover:text-primary/80",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto mx-auto",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your documentation...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert min-h-[300px] max-w-none px-4 py-3 focus:outline-none text-gray-200",
      },
    },
  });

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#1b1d24]">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-[#1b1d24]" />
    </div>
  );
};

export default SimpleEditor;
