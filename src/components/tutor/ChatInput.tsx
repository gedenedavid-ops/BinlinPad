'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, ArrowUp, X, FileText, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttachedFile {
  id: string;
  file: File;
  preview: string | null;
  uploadStatus: 'pending' | 'uploading' | 'complete';
}

interface PastedSnippet {
  id: string;
  content: string;
}

// ─── FilePreviewCard ──────────────────────────────────────────────────────────

function FilePreviewCard({ file, onRemove }: { file: AttachedFile; onRemove: (id: string) => void }) {
  const isImage = file.file.type.startsWith('image/') && file.preview;
  return (
    <div className="relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-[#E8E4DF] dark:border-[#2E2C28] bg-[#F5F3EF] dark:bg-[#242320]">
      {isImage ? (
        <img src={file.preview!} alt={file.file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full p-2 flex flex-col justify-between">
          <div className="p-1.5 bg-white dark:bg-[#1C1B19] rounded-lg w-fit">
            <FileText className="w-3.5 h-3.5 text-[#9B9590]" />
          </div>
          <p className="text-[10px] text-[#9B9590] truncate">{file.file.name}</p>
        </div>
      )}
      {file.uploadStatus === 'uploading' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
      )}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ─── PastedSnippetCard ────────────────────────────────────────────────────────

function PastedSnippetCard({ snippet, onRemove }: { snippet: PastedSnippet; onRemove: (id: string) => void }) {
  return (
    <div className="relative group flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-[#E8E4DF] dark:border-[#2E2C28] bg-white dark:bg-[#1C1B19] p-2.5 flex flex-col justify-between">
      <p className="text-[9px] text-[#9B9590] font-mono leading-relaxed line-clamp-4 break-all">{snippet.content}</p>
      <span className="text-[8px] font-bold text-[#C8C4BE] uppercase tracking-wider border border-[#E8E4DF] dark:border-[#2E2C28] rounded px-1 py-px w-fit">
        Collé
      </span>
      <button
        onClick={() => onRemove(snippet.id)}
        className="absolute top-1.5 right-1.5 p-0.5 bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-full text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-2 h-2" />
      </button>
    </div>
  );
}

// ─── ChatInput ────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (text: string) => void;
  onReset: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Valeur initiale injectée depuis l'extérieur (ex: prompt depuis le graphe) */
  initialValue?: string;
  onInitialValueConsumed?: () => void;
}

export function ChatInput({ onSend, onReset, disabled = false, placeholder, initialValue, onInitialValueConsumed }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [pastes, setPastes] = useState<PastedSnippet[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Injecter la valeur initiale depuis le parent (ex: prompt depuis le graphe)
  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
      onInitialValueConsumed?.();
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleFiles = useCallback((list: FileList | File[]) => {
    const newFiles: AttachedFile[] = Array.from(list).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      uploadStatus: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((p) => p.id === f.id ? { ...p, uploadStatus: 'complete' } : p));
      }, 600 + Math.random() * 800);
    });
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedFiles: File[] = [];
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) pastedFiles.push(f);
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleFiles(pastedFiles);
      return;
    }
    const text = e.clipboardData.getData('text');
    if (text.length > 300) {
      e.preventDefault();
      setPastes((prev) => [...prev, { id: Math.random().toString(36).slice(2), content: text }]);
    }
  };

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text && files.length === 0 && pastes.length === 0) return;
    if (disabled) return;
    onSend(text);
    setMessage('');
    setFiles([]);
    setPastes([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [message, files, pastes, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = message.trim().length > 0 || files.length > 0 || pastes.length > 0;

  return (
    <div
      className="relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-[#F4A236] bg-[#FDF0DC]/80 dark:bg-[#2A1F0A]/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
          <Plus className="w-8 h-8 text-[#F4A236] mb-1.5" />
          <p className="text-sm font-medium text-[#F4A236]">Dépose pour joindre</p>
        </div>
      )}

      <div className={cn(
        'flex flex-col bg-white dark:bg-[#242320] border rounded-2xl transition-[color,background-color,border-color,box-shadow,transform] duration-200',
        'border-[#E8E4DF] dark:border-[#2E2C28]',
        'shadow-[0_2px_12px_rgba(26,26,26,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]',
        'focus-within:border-[#F4A236]/60 focus-within:shadow-[0_2px_16px_rgba(244,162,54,0.12)]',
      )}>
        {/* Fichiers / snippets collés */}
        {(files.length > 0 || pastes.length > 0) && (
          <div className="flex gap-2 px-3 pt-3 overflow-x-auto pb-2">
            {pastes.map((s) => (
              <PastedSnippetCard key={s.id} snippet={s} onRemove={(id) => setPastes((p) => p.filter((x) => x.id !== id))} />
            ))}
            {files.map((f) => (
              <FilePreviewCard key={f.id} file={f} onRemove={(id) => setFiles((p) => p.filter((x) => x.id !== id))} />
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? 'Pose une question sur tes notes, demande un quiz…'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent resize-none text-sm text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-[#C8C4BE] dark:placeholder-[#4A4845] focus:outline-none leading-relaxed max-h-48 overflow-y-auto disabled:opacity-50"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Barre d'actions */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
          {/* Gauche : joindre + reset */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8] hover:bg-[#F5F3EF] dark:hover:bg-[#2E2C28] transition-colors"
              title="Joindre un fichier"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-xl text-[#9B9590] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Nouvelle conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Droite : hint + envoyer */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#C8C4BE] dark:text-[#4A4845] hidden sm:block">↵ Envoyer · ⇧↵ Saut de ligne</span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || disabled}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-[color,background-color,border-color,box-shadow,transform] flex-shrink-0',
                hasContent && !disabled
                  ? 'bg-[#F4A236] text-white hover:bg-[#EAA240] active:scale-95 shadow-sm'
                  : 'bg-[#F5F3EF] dark:bg-[#2E2C28] text-[#C8C4BE] cursor-not-allowed'
              )}
              aria-label="Envoyer"
            >
              {disabled
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <ArrowUp className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Input fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
      />

      {/* Lien SOS */}
      <div className="mt-2 text-center">
        <a href="tel:+22527222263" className="text-[9px] text-[#C8C4BE] dark:text-[#4A4845] hover:text-[#9B9590] transition-colors">
          Besoin d&apos;aide ? SOS Amitié CI · 27 22 22 63
        </a>
      </div>
    </div>
  );
}
