'use client'

import { motion } from 'framer-motion'
import { WorkIllustration, BusinessIllustration, EverydayIllustration } from './SituationIllustrations'

interface SituationPickerProps {
  selectedSituation: string
  onSituationChange: (situation: string) => void
}

const situations = [
  {
    value: 'work',
    title: 'Looking for work',
    subtitle: 'CVs, cover letters, interview prep',
    Illustration: WorkIllustration,
  },
  {
    value: 'business',
    title: 'Running a small business',
    subtitle: 'Posts, planning, customer emails',
    Illustration: BusinessIllustration,
  },
  {
    value: 'everyday',
    title: 'Everyday life',
    subtitle: 'Home, family, learning something new',
    Illustration: EverydayIllustration,
  },
]

export default function SituationPicker({ selectedSituation, onSituationChange }: SituationPickerProps) {
  return (
    <section id="brings" className="bg-cream border-t border-line py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif font-bold text-green text-3xl sm:text-4xl md:text-5xl leading-tight mb-3">
            What brings you here?
          </h2>
          <p className="text-soft text-lg mb-8">
            Pick the one that sounds most like you. You can change it any time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5" role="radiogroup" aria-labelledby="brings-heading">
          {situations.map((situation, index) => (
            <motion.label
              key={situation.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative cursor-pointer block transition-all duration-300 ${
                selectedSituation === situation.value ? 'transform -translate-y-1' : ''
              }`}
            >
              <input
                type="radio"
                name="situation"
                value={situation.value}
                checked={selectedSituation === situation.value}
                onChange={(e) => onSituationChange(e.target.value)}
                className="sr-only"
              />
              <div
                className={`bg-cardBg border-2 rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col ${
                  selectedSituation === situation.value
                    ? 'border-green shadow-[0_0_0_2px_#1E3B2C,0_16px_30px_-22px_rgba(30,59,44,0.8)]'
                    : 'border-line hover:border-soft'
                }`}
              >
                {/* Illustration */}
                <div className="aspect-[16/10] w-full">
                  <situation.Illustration />
                </div>

                {/* Text */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink text-base sm:text-lg leading-tight mb-1">
                      {situation.title}
                    </div>
                    <div className="text-soft text-sm hidden sm:block">
                      {situation.subtitle}
                    </div>
                  </div>

                  {/* Checkmark */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSituation === situation.value
                        ? 'bg-green border-green'
                        : 'border-soft'
                    }`}
                  >
                    {selectedSituation === situation.value && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 10">
                        <path
                          d="M1 5l3.5 3.5L11 1"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </motion.label>
          ))}
        </div>
      </div>
    </section>
  )
}
