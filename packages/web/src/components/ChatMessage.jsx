import React, { useEffect } from "react";
import useTypewriter from "../hooks/useTypewriter";

/**
 * ChatMessage
 * - role: 'user' | 'assistant'
 * - text: full text (assistant will type it)
 * - typingSpeed: ms per char (optional)
 */
export function ChatMessage({ role, text, typingSpeed = 18, onTypingComplete }) {
  // only animate assistant messages
  const { displayed, isTyping, start, stop } = useTypewriter("", typingSpeed);

  useEffect(() => {
    if (role === "assistant") {
      // start typing when text becomes non-empty
      if (text && text.length > 0) {
        start(text, typingSpeed);
      } else {
        // keep empty placeholder
        stop();
      }
      return () => stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, role]);

  useEffect(() => {
    if (!isTyping && role === "assistant") {
      onTypingComplete && onTypingComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTyping]);

  // USER message: render plain text
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-[75%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">U</span>
          </div>
          <div className="rounded-2xl px-4 py-3 bg-neon-blue/20 backdrop-blur-sm border border-neon-blue/30 text-white">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
            {/* timestamp handled in parent */}
          </div>
        </div>
      </div>
    );
  }

  // ASSISTANT: show typing display (use displayed from hook)
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 max-w-[75%] flex-row">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-neon-blue text-lg">🤖</span>
        </div>
        <div className="rounded-2xl px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {/* render displayed (safe) with line breaks */}
            <span dangerouslySetInnerHTML={{ __html: (displayed || "").replace(/\n/g, "<br/>") }} />
            {/* caret while typing */}
            {isTyping ? <span className="ml-1 text-neon-blue">|</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}
