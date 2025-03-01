import React, {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Quill, { Delta, Op, QuillOptions } from "quill";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import Image from "next/image";
import { ImageIcon, Smile, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { EmojiPopover } from "./EmojiPopover";
import { Button } from "./ui/button";
import { Hint } from "./Hint";

import "quill/dist/quill.snow.css";

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  variant?: "create" | "update";
  onSubmit: (values: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
}

const Editor = ({
  variant = "create",
  onSubmit,
  onCancel,
  placeholder = "Write something...",
  defaultValue = [],
  disabled = false,
  innerRef,
}: EditorProps) => {
  const [text, setText] = useState("");
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeholderRef = useRef(placeholder);
  const defaultValueRef = useRef(defaultValue);
  const quillRef = useRef<Quill | null>(null);
  const disabledRef = useRef(disabled);
  const imageRef = useRef<HTMLInputElement>(null);

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  const toggleToolbar = () => {
    setIsToolbarVisible((prev) => !prev);

    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const onEmojiSelect = (emojiValue: string) => {
    const quill = quillRef.current;

    quill?.insertText(quill.getSelection()?.index || 0, emojiValue);
  };

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeholderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addedImage = imageRef.current?.files?.[0] || null;
                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents());
                submitRef.current?.({ body, image: addedImage });

                return;
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () =>
                quill.insertText(quill.getSelection()?.index || 0, "\n"),
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    if (innerRef) {
      innerRef.current = quill;
    }

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);

      if (container) {
        container.innerHTML = "";
      }

      if (quillRef.current) {
        quillRef.current = null;
      }

      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageRef}
        onChange={(event) => setImage(event.target.files![0])}
        className="hidden"
      />

      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          {
            "opacity-50": disabled,
          }
        )}
      >
        <div className="h-full ql-custom" ref={containerRef} />

        {!!image ? (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>

              <Image
                src={URL.createObjectURL(image)}
                alt="Uploaded"
                fill
                className="rounded-xl overflow-hidden border oject-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="flex px-2 pb-2 z-[5]">
          <Hint label={isToolbarVisible ? "Hide toolbar" : "Show toolbar"}>
            <Button
              disabled={disabled}
              onClick={toggleToolbar}
              variant="ghost"
              size="iconSm"
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>

          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} variant="ghost" size="iconSm">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>

          {variant === "create" ? (
            <>
              <Hint label="Add image">
                <Button
                  onClick={() => imageRef.current?.click()}
                  disabled={disabled}
                  variant="ghost"
                  size="iconSm"
                >
                  <ImageIcon className="size-4" />
                </Button>
              </Hint>

              <Button
                disabled={isEmpty || disabled}
                size="iconSm"
                className={cn(
                  "ml-auto",
                  isEmpty
                    ? "bg-white hover:bg-white text-muted-foreground"
                    : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                )}
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
              >
                <MdSend className="size-4" />
              </Button>
            </>
          ) : null}

          {variant === "update" ? (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                disabled={disabled}
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>

              <Button
                disabled={disabled || isEmpty}
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                size="sm"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
              >
                Save
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {variant === "create" ? (
        <div
          className={cn(
            "p-1 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",
            { "opacity-100": !isEmpty }
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Editor;
