import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
  Unlink,
} from "lucide-react";
import { Toggle } from "../toggle"
import { Editor } from "@tiptap/react";
  
export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }
  
  const Options = [
    {
      icon: <Heading className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
      preesed: editor.isActive("heading", { level: 6 }),
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      preesed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      preesed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      preesed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editor.isActive("orderedList"),
    },
    {
      icon: <Link className="size-4" />,
      onClick: () => {
        const url = prompt("Enter URL");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
      },
      preesed: editor.isActive("link"),
    },
    {
      icon: <Unlink className="size-4" />,
      onClick: () => editor.chain().focus().unsetLink().run(),
      preesed: editor.isActive("link"),
    },
  ];
  
  return (
    <div className="flex flex-wrap border-b p-1 md:space-x-2 z-50">
      {Options.map((option, index) => (
        <Toggle key={index} pressed={option.preesed} onPressedChange={option.onClick}>
          {option.icon}
        </Toggle>
      ))}
    </div>
  );  
}