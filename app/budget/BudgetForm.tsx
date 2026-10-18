'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { BUDGET_PRESETS, budgetPath, type BudgetQuery } from '@/lib/budget-url';
import { PERSONAS, TOOLKIT_GOALS } from '@/lib/personas';

function selectedValues(form: HTMLFormElement, name: string): string[] {
  return Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`))
    .map((input) => input.value);
}

export function BudgetForm({ query }: { query: BudgetQuery }) {
  const router = useRouter();

  const applyForm = (form: HTMLFormElement) => {
    const persona = (form.elements.namedItem('persona') as RadioNodeList | HTMLInputElement | null);
    const personaValue = persona && 'value' in persona ? persona.value : '';
    const budgetInput = form.elements.namedItem('budget') as RadioNodeList | HTMLInputElement | null;
    const custom = form.elements.namedItem('budget_custom') as HTMLInputElement | null;
    let budget = 50;
    if (budgetInput && 'value' in budgetInput && budgetInput.value === 'custom') {
      budget = Number(custom?.value || 0);
    } else if (budgetInput && 'value' in budgetInput) {
      budget = Number(budgetInput.value);
    }
    if (!Number.isFinite(budget) || budget < 0) budget = 0;

    const next: BudgetQuery = {
      persona: personaValue || null,
      budget,
      goals: selectedValues(form, 'goals'),
      needs: selectedValues(form, 'need'),
      freeFirst: Boolean((form.elements.namedItem('free') as HTMLInputElement | null)?.checked),
      picks: query.picks,
    };
    router.replace(budgetPath(next), { scroll: false });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyForm(event.currentTarget);
  };

  const presetMatch = BUDGET_PRESETS.includes(query.budget as (typeof BUDGET_PRESETS)[number]);

  return (
    <form method="get" action="/budget" onSubmit={onSubmit} className="card space-y-8">
      <fieldset>
        <legend className="heading-3 mb-3">Persona</legend>
        <div className="grid gap-2">
          <label className="flex items-start gap-3 min-h-11 cursor-pointer">
            <input
              type="radio"
              name="persona"
              value=""
              defaultChecked={!query.persona}
              className="mt-1"
            />
            <span>Choose by goals only</span>
          </label>
          {PERSONAS.map((persona) => (
            <label key={persona.slug} className="flex items-start gap-3 min-h-11 cursor-pointer">
              <input
                type="radio"
                name="persona"
                value={persona.slug}
                defaultChecked={query.persona === persona.slug}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{persona.name}</span>
                <span className="text-soft"> — {persona.title}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="heading-3 mb-3">Monthly budget</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {BUDGET_PRESETS.map((amount) => (
            <label key={amount} className="flex items-center gap-3 min-h-11 cursor-pointer">
              <input
                type="radio"
                name="budget"
                value={String(amount)}
                defaultChecked={presetMatch && query.budget === amount}
              />
              <span>{amount === 0 ? '$0 (free tools only)' : `Up to $${amount}/month`}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 min-h-11 cursor-pointer sm:col-span-2">
            <input
              type="radio"
              name="budget"
              value="custom"
              defaultChecked={!presetMatch}
            />
            <span className="sr-only">Custom monthly budget</span>
            <input
              type="number"
              name="budget_custom"
              min={0}
              max={10000}
              step={1}
              defaultValue={presetMatch ? '' : query.budget}
              className="w-32 px-3 py-2 border border-soft rounded-lg focus-ring bg-white"
              aria-label="Custom monthly budget in US dollars"
            />
            <span>/month</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="heading-3 mb-3">Goals</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOOLKIT_GOALS.map((goal) => (
            <label key={goal.id} className="flex items-start gap-3 min-h-11 cursor-pointer">
              <input
                type="checkbox"
                name="goals"
                value={goal.id}
                defaultChecked={query.goals.includes(goal.id)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">{goal.label}</span>
                <span className="block text-sm text-soft">{goal.blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="heading-3 mb-3">Must-haves</legend>
        <p className="text-sm text-soft mb-3">
          We fill these slots first when the budget is tight.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TOOLKIT_GOALS.map((goal) => (
            <label key={goal.id} className="flex items-center gap-3 min-h-11 cursor-pointer">
              <input
                type="checkbox"
                name="need"
                value={goal.id}
                defaultChecked={query.needs.includes(goal.id)}
              />
              <span>{goal.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          name="free"
          value="1"
          defaultChecked={query.freeFirst}
          className="mt-1"
        />
        <span>Prefer free tiers when a tool has one</span>
      </label>

      {Object.entries(query.picks).map(([slot, slug]) => (
        <input key={slot} type="hidden" name="picks" value={`${slot}:${slug}`} />
      ))}

      <button type="submit" className="btn-primary">
        Update stack
      </button>
    </form>
  );
}
