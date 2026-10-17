'use client'

import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface BudgetPickerProps {
  selectedBudget: string
  monthlyLimit: number
  onBudgetChange: (budget: string) => void
  onLimitChange: (limit: number) => void
  onShowResults: () => void
}

export default function BudgetPicker({
  selectedBudget,
  monthlyLimit,
  onBudgetChange,
  onLimitChange,
  onShowResults,
}: BudgetPickerProps) {
  return (
    <section className="bg-cream py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <fieldset className="mb-6">
          <legend className="font-serif font-bold text-green text-2xl sm:text-3xl mb-4">
            Choose your budget
          </legend>

          {/* Segmented control */}
          <div className="bg-cardBg border-2 border-line rounded-2xl p-1.5 max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {[
              { value: 'free', label: 'Free options only' },
              { value: 'limit', label: 'Set my budget' },
              { value: 'help', label: 'Help me decide' },
            ].map((option) => (
              <label key={option.value} className="relative">
                <input
                  type="radio"
                  name="budget"
                  value={option.value}
                  checked={selectedBudget === option.value}
                  onChange={(e) => onBudgetChange(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`flex items-center justify-center gap-2 sm:gap-3 min-h-[52px] px-3 sm:px-4 py-2 rounded-xl font-semibold text-center cursor-pointer transition-all duration-200 ${
                    selectedBudget === option.value
                      ? 'bg-green text-white'
                      : 'bg-transparent text-ink hover:bg-cream-dark'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedBudget === option.value
                        ? 'border-white bg-green'
                        : 'border-soft bg-white'
                    }`}
                  >
                    {selectedBudget === option.value && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-sm sm:text-base leading-tight">{option.label}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Monthly limit selector */}
          {selectedBudget === 'limit' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-3 flex-wrap"
            >
              <label htmlFor="cap" className="font-semibold text-ink">
                Up to
              </label>
              <select
                id="cap"
                value={monthlyLimit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="min-h-[48px] px-4 border-2 border-soft rounded-xl font-semibold bg-white text-ink focus:outline-none focus:ring-2 focus:ring-green-light focus:border-green"
              >
                <option value="15">$15 a month</option>
                <option value="30">$30 a month</option>
                <option value="60">$60 a month</option>
              </select>
            </motion.div>
          )}
        </fieldset>

        {/* CTA and helper text */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={onShowResults}
            className="inline-flex items-center gap-3 bg-green hover:bg-green-light text-white font-bold text-lg px-7 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Show my first step
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          <p className="text-soft max-w-md text-sm sm:text-base">
            We&apos;ll suggest one or two tools to start with. Nothing to sign up for.
          </p>
        </div>
      </div>
    </section>
  )
}
