import { useEffect, useRef, useState } from "react";

/**
 * useTypewriter (character-by-character with auto speed-up)
 *
 * Options:
 * - initialSpeed (ms/char) default 22
 * - minSpeed (fastest ms/char) default 6
 * - accelerateAfter (chars) default 120
 * - accelerateFactor (how much to reduce delay each step) default 0.92
 */
export default function useTypewriter(
  initialText = "",
  {
    initialSpeed = 22,
    minSpeed = 6,
    accelerateAfter = 120,
    accelerateFactor = 0.92
  } = {}
) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fullRef = useRef(initialText);
  const idxRef = useRef(0);
  const timerRef = useRef(null);
  const speedRef = useRef(initialSpeed);

  useEffect(() => {
    fullRef.current = initialText;
    reset();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  function reset() {
    stop();
    setDisplayed("");
    idxRef.current = 0;
    speedRef.current = initialSpeed;
    setIsTyping(false);
  }

  function start(text = null) {
    stop();
    if (typeof text === "string") {
      fullRef.current = text;
    }
    const full = fullRef.current || "";
    if (!full) {
      setDisplayed("");
      return;
    }
    idxRef.current = 0;
    speedRef.current = initialSpeed;
    setDisplayed("");
    setIsTyping(true);

    function step() {
      const f = fullRef.current;
      if (idxRef.current >= f.length) {
        stop();
        return;
      }
      idxRef.current += 1;
      setDisplayed(f.slice(0, idxRef.current));

      // accelerate after threshold
      if (idxRef.current >= accelerateAfter) {
        speedRef.current = Math.max(minSpeed, Math.floor(speedRef.current * accelerateFactor));
      }

      timerRef.current = setTimeout(step, speedRef.current);
    }

    // start
    step();
  }

  function stop() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsTyping(false);
  }

  return { displayed, isTyping, start, stop, reset, setDisplayed };
}
