export function openOnboarding() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('axis:openOnboarding'));
  }
}

