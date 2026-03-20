"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowUp, Square, Paperclip, X, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import type { Attachment } from "@/hooks/useChat";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** 外部からチャット入力にプリセットするメッセージ */
  prefillMessage?: string | null;
  onPrefillConsumed?: () => void;
}

function fileToAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data from data URL
      const base64 = result.split(",")[1];
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "image",
        name: file.name,
        url: URL.createObjectURL(file),
        base64,
        mediaType: file.type || "image/png",
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

export default function ChatInput({
  onSend,
  onStop,
  disabled = false,
  placeholder = "メッセージを入力...",
  prefillMessage,
  onPrefillConsumed,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [message]);

  // Prefill message from external source (e.g. section edit button)
  useEffect(() => {
    if (prefillMessage) {
      setMessage(prefillMessage);
      onPrefillConsumed?.();
      // Focus textarea after prefill
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [prefillMessage, onPrefillConsumed]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      ACCEPTED_TYPES.includes(f.type),
    );
    if (validFiles.length === 0) return;

    const newAttachments = await Promise.all(
      validFiles.map((f) => fileToAttachment(f)),
    );
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleSend = useCallback(() => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;
    onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, attachments, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    },
    [addFiles],
  );

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const hasContent = message.trim().length > 0 || attachments.length > 0;

  return (
    <div
      className="px-4 pb-4 pt-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={clsx(
          "rounded-2xl transition-all duration-200 bg-white/55 backdrop-blur-[16px] border border-white/35 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.5)]",
          disabled && !onStop && "opacity-50",
          !disabled && "hover:shadow-sm",
          hasContent && !disabled && "shadow-sm",
          isDragOver && "ring-2 ring-accent/40 shadow-md",
        )}
      >
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-3 pt-3 flex-wrap">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border bg-white shadow-sm"
              >
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-foreground/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={clsx(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150",
              "text-muted-foreground hover:text-foreground hover:bg-black/[0.04]",
              disabled && "opacity-30 pointer-events-none",
            )}
            title="画像を添付"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={clsx(
              "flex-1 bg-transparent text-[15px] text-foreground",
              "placeholder:text-muted-foreground/60",
              "resize-none outline-none min-h-[24px] max-h-[180px] leading-relaxed",
              "py-1 px-1",
            )}
          />

          {onStop ? (
            <button
              onClick={onStop}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-foreground/80 text-white hover:bg-foreground transition-colors"
              title="応答を停止"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!hasContent || disabled}
              className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                hasContent && !disabled
                  ? "bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] text-white shadow-sm hover:shadow-md hover:shadow-accent/20 scale-100"
                  : "bg-black/[0.04] text-muted-foreground scale-95",
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Drop overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-accent/5 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl px-8 py-6 flex flex-col items-center gap-3 bg-white/55 backdrop-blur-[16px] border border-white/35 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.5)]">
            <ImageIcon className="w-10 h-10 text-accent" />
            <p className="text-[15px] font-medium text-foreground">
              画像をドロップして添付
            </p>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
        Aicata は AI パートナーです。応答内容をご確認ください。
      </p>
    </div>
  );
}
