import { useEffect, useRef } from 'react';

/**
 * Closes a floating panel when the user clicks outside it or presses Escape.
 *
 * Both the notification bell and the profile menu were opening with no way to
 * dismiss them other than clicking the trigger again.
 *
 * @param open  Whether the panel is currently open.
 * @param close Callback invoked when a dismissal should occur.
 */
export function useDismissable<T extends HTMLElement>(
  open: boolean,
  close: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      // A click on the trigger button is handled by the button's own onClick,
      // so ignore anything that is still inside the panel wrapper.
      if (target && ref.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  return ref;
}