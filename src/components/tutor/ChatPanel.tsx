'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Trash2, ChevronDown,
  Plus, MessageSquare, Loader2, User,
} from 'lucide-react';
import { useStore, useActiveSession } from '@/store';
import { Skeleton } from '@/components/ui/feedback/Skeleton';
import { cn, formatRelativeDate } from '@/lib/utils';
import { renderMarkdown } from '@/lib/renderMarkdown';
import { ExerciseTimer } from './ExerciseTimer';
import { StreakBadge } from '@/components/ui/progress/StreakBadge';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '@/types';

const BASE_PROMPTS = [
  'Interroge-moi sur mes dernières notes 🎯',
  'Quels sujets ai-je étudiés cette semaine ?',
  'Crée un plan de révision basé sur mes notes',
];

// Prompts adaptés selon la dernière humeur renseignée — pas de seuil, pas de diagnostic
function useDynamicPrompts(notes: import('@/types').Note[]): string[] {
  return useMemo(() => {
    // Humeur de la note la plus récente avec humeur renseignée
    const lastMoodNote = [...notes]
      .filter((n) => n.mood)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];

    const prompts = [...BASE_PROMPTS];

    if (!lastMoodNote) {
      prompts.push(
        'Aide-moi à comprendre un concept difficile',
        'Explique-moi les thèmes clés de mes notes'
      );
      return prompts;
    }

    // Un seul prompt contextuel selon la dernière humeur enregistrée par l'élève
    switch (lastMoodNote.mood) {
      case 'confused':
        prompts.push(`Explique-moi le cours "${lastMoodNote.title}" autrement`);
        prompts.push('Fais-moi un quiz sur les points que j\'ai trouvé difficiles');
        break;
      case 'anxious':
        prompts.push('Fais-moi un quiz rapide pour me préparer 😰');
        prompts.push('Qu\'est-ce que je sais déjà bien dans mes notes ?');
        break;
      case 'motivated':
      case 'focused':
        prompts.push('Je suis en forme — approfondissons un sujet 🔥');
        prompts.push('Crée-moi un quiz plus difficile sur mes notes');
        break;
      case 'tired':
        prompts.push('Résume-moi l\'essentiel de mes notes en quelques points');
        prompts.push('Qu\'est-ce que je dois absolument retenir pour l\'exam ?');
        break;
      default:
        prompts.push('Aide-moi à comprendre un concept de mes notes');
    }

    return prompts.slice(0, 6);
  }, [notes]);
}

function MessageBubble({
  message,
  onTimerExpire,
}: {
  message: ChatMessage;
  onTimerExpire?: (msgId: string) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-semibold text-white select-none',
        isUser ? 'bg-[#1A1A1A]' : 'bg-[#F4A236]'
      )}>
        {isUser ? <User size={13} className="text-white" /> : 'IA'}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        {message.isLoading ? (
          <div className="bg-[#F5F3EF] dark:bg-[#242320] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
            <Loader2 size={14} className="text-[#9B9590] animate-spin" />
            <span className="text-sm text-[#9B9590]">En train de réfléchir…</span>
          </div>
        ) : (
          <div className={cn(
            'px-4 py-3 rounded-2xl text-sm',
            isUser
              ? 'bg-[#1A1A1A] text-white rounded-tr-sm leading-relaxed whitespace-pre-wrap'
              : 'bg-[#F5F3EF] dark:bg-[#242320] text-[#1A1A1A] dark:text-[#F0EDE8] rounded-tl-sm space-y-0.5'
          )}>
            {isUser ? message.content : renderMarkdown(message.content)}

            {/* Chronomètre — uniquement sur les messages IA avec timerSeconds */}
            {!isUser && message.timerSeconds && onTimerExpire && (
              <ExerciseTimer
                durationSeconds={message.timerSeconds}
                onExpire={() => onTimerExpire(message.id)}
              />
            )}
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.sources.slice(0, 3).map((src) => (
              <span
                key={src.noteId}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-full text-[#9B9590]"
              >
                <BookOpen size={9} />
                {src.title}
              </span>
            ))}
          </div>
        )}

        <span className="text-[9px] text-[#C8C4BE] px-1">
          {formatRelativeDate(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export function ChatPanel({ initialPrompt }: { initialPrompt?: string }) {
  const { sessions, sessionsLoaded, createSession, sendMessage, setActiveSession, deleteSession, isAILoading, notes, userType } = useStore();
  const [showSummary, setShowSummary] = useState(false);
  const suggestedPrompts = useDynamicPrompts(notes);
  const activeSession = useActiveSession();
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(initialPrompt);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Déclenché par l'ExerciseTimer quand il arrive à 0
  const handleTimerExpire = useCallback(async (msgId: string) => {
    void msgId;
    await sendMessage('[TIMER_EXPIRED] Le temps imparti pour l\'exercice est écoulé.');
  }, [sendMessage]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isAILoading) return;
    await sendMessage(text);
  }, [isAILoading, sendMessage]);

  const handleReset = useCallback(() => {
    const { activeSessionId, deleteSession: del, createSession: create } = useStore.getState();
    if (activeSessionId) { del(activeSessionId); create(); }
  }, []);

  const handlePrompt = (prompt: string) => {
    setPendingPrompt(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DF] dark:border-[#2E2C28] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE8]">Tuteur</h2>
              <StreakBadge />
            </div>
            <p className="text-[10px] text-[#9B9590] flex items-center gap-1.5">
              <span className={cn(
                'px-1.5 py-0.5 rounded-full font-semibold text-[9px]',
                userType === 'etudiant'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-orange-100 text-orange-700'
              )}>
                {userType === 'etudiant' ? '🎓 Étudiant' : '🎒 Élève'}
              </span>
              {notes.length} note{notes.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {sessions.length > 0 && (
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8] hover:bg-[#F5F3EF] dark:hover:bg-[#242320] rounded-xl transition-colors"
            >
              <MessageSquare size={13} />
              Historique
              <ChevronDown size={12} className={cn('transition-transform', showSessions && 'rotate-180')} />
            </button>
          )}
          <button
            onClick={() => { createSession(); setShowSessions(false); }}
            className="p-1.5 rounded-xl bg-[#F5F3EF] dark:bg-[#242320] text-[#9B9590] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE8] hover:bg-[#EDE9E3] dark:hover:bg-[#2E2C28] transition-colors"
            title="Nouvelle conversation"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Session History Dropdown */}
      <AnimatePresence>
        {showSessions && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[#E8E4DF] dark:border-[#2E2C28] overflow-hidden"
          >
            <div className="p-3 space-y-1 max-h-40 overflow-y-auto">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex items-center gap-1">
                  <button
                    onClick={() => { setActiveSession(sess.id); setShowSessions(false); }}
                    className={cn(
                      'flex-1 text-left px-3 py-2 rounded-xl text-xs transition-colors',
                      activeSession?.id === sess.id
                        ? 'bg-[#FDF0DC] dark:bg-[#F4A236]/10 text-[#F4A236]'
                        : 'hover:bg-[#F5F3EF] dark:hover:bg-[#242320] text-[#1A1A1A] dark:text-[#F0EDE8]'
                    )}
                  >
                    <span className="font-medium truncate block">{sess.title || 'Nouvelle conversation'}</span>
                    <span className="text-[10px] text-[#9B9590]">{sess.messages.length} message{sess.messages.length > 1 ? 's' : ''}</span>
                  </button>
                  <button
                    onClick={() => deleteSession(sess.id)}
                    className="p-1.5 rounded-lg text-[#C8C4BE] hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Supprimer cette conversation"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {!sessionsLoaded ? (
          // Skeleton pendant le chargement des sessions
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
              <div className="space-y-2 flex-1 max-w-md">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
              <div className="space-y-2 max-w-xs">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
              <div className="space-y-2 flex-1 max-w-lg">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ) : !activeSession || activeSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <h3 className="text-[#1A1A1A] dark:text-[#F0EDE8] font-semibold mb-1">Bonjour 👋</h3>
            <p className="text-[#9B9590] text-sm max-w-xs mb-6">
              Ton tuteur IA personnel. Pose-moi des questions sur tes notes, demande un quiz ou aide-toi à comprendre un concept.
            </p>
            <div className="w-full space-y-2">
              <p className="text-[10px] font-semibold text-[#9B9590] uppercase tracking-wider mb-2">Essaie de demander…</p>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePrompt(prompt)}
                  className="w-full text-left px-3 py-2.5 bg-white dark:bg-[#242320] border border-[#E8E4DF] dark:border-[#2E2C28] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F0EDE8] hover:border-[#F4A236] hover:bg-[#FDF0DC]/30 dark:hover:bg-[#2A1F0A]/30 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeSession.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onTimerExpire={handleTimerExpire}
              />
            ))}

            {/* Carte résumé de session — affichée si un résumé IA existe */}
            {activeSession.summary && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-2 mt-2 bg-[#FDF0DC]/60 dark:bg-[#2A1F0A]/40 border border-[#F4A236]/30 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left"
                >
                  <span className="text-[10px] font-semibold text-[#F4A236] uppercase tracking-wider flex items-center gap-1.5">
                    📋 Résumé de session
                  </span>
                  <ChevronDown size={13} className={cn('text-[#F4A236] transition-transform', showSummary && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {showSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 text-xs text-[#57514C] dark:text-[#9B9590] leading-relaxed space-y-0.5">
                        {renderMarkdown(activeSession.summary)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[#E8E4DF] dark:border-[#2E2C28] flex-shrink-0">
        <ChatInput
          onSend={handleSend}
          onReset={handleReset}
          disabled={isAILoading}
          initialValue={pendingPrompt}
          onInitialValueConsumed={() => setPendingPrompt(undefined)}
        />
      </div>
    </div>
  );
}
