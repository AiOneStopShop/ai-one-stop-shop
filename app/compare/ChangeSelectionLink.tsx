'use client';

export function ChangeSelectionLink() {
  return (
    <a
      href="#compare-selector"
      className="text-green hover:underline text-sm focus-ring rounded"
      onClick={(event) => {
        event.preventDefault();
        const selector = document.getElementById('compare-selector');
        selector?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstControl = selector?.querySelector<HTMLElement>('select, button, a, [tabindex]');
        firstControl?.focus();
      }}
    >
      Change selection
    </a>
  );
}
