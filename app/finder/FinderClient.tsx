'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { PaidVisitLink } from '@/components/PaidVisitLink';
import type { AffiliateGoMap } from '@/lib/affiliate-links';
import { toolHasAffiliate } from '@/lib/affiliate-links';

type UseCase = 'coding' | 'writing' | 'design' | 'productivity' | 'other';
type Budget = 'free' | 'low' | 'medium' | 'high';
type Experience = 'beginner' | 'intermediate' | 'advanced';

export default function FinderClient({
  affiliates = {},
}: {
  affiliates?: AffiliateGoMap;
}) {
  const [useCase, setUseCase] = useState<UseCase | ''>('');
  const [budget, setBudget] = useState<Budget | ''>('');
  const [experience, setExperience] = useState<Experience | ''>('');
  const [showResults, setShowResults] = useState(false);
  const [focusFirstQuestion, setFocusFirstQuestion] = useState(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const firstQuestionRef = useRef<HTMLFieldSetElement>(null);

  // Home page cards link here with ?situation=work|business|everyday; start from a sensible first answer.
  useEffect(() => {
    const situation = new URLSearchParams(window.location.search).get('situation');
    const map: Record<string, UseCase> = { work: 'writing', business: 'productivity', everyday: 'other' };
    if (situation && map[situation]) setUseCase((current) => current || map[situation]);
  }, []);

  useEffect(() => {
    if (showResults) {
      resultsHeadingRef.current?.focus();
    } else if (focusFirstQuestion) {
      firstQuestionRef.current?.focus();
      setFocusFirstQuestion(false);
    }
  }, [showResults, focusFirstQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useCase && budget && experience) {
      setShowResults(true);
    }
  };

  const reset = () => {
    setUseCase('');
    setBudget('');
    setExperience('');
    setShowResults(false);
    setFocusFirstQuestion(true);
  };

  const getRecommendations = () => {
    const recommendations: Array<{ name: string; slug: string; why: string }> = [];

    if (useCase === 'coding') {
      if (budget === 'free') {
        recommendations.push({
          name: 'GitHub Copilot',
          slug: 'github-copilot',
          why: 'Free for students and open-source maintainers, works in multiple IDEs'
        });
      }
      if (experience === 'beginner') {
        recommendations.push({
          name: 'Replit Agent',
          slug: 'replit-agent',
          why: 'Build complete apps from natural language, great for learning'
        });
      }
      if (budget === 'medium' || budget === 'high') {
        recommendations.push({
          name: 'Cursor',
          slug: 'cursor',
          why: 'AI-first code editor with deep codebase understanding'
        });
      }
    }

    if (useCase === 'writing') {
      if (budget === 'free' || budget === 'low') {
        recommendations.push({
          name: 'Grammarly',
          slug: 'grammarly',
          why: 'Free version covers basics, premium adds style suggestions'
        });
      }
      if (budget === 'medium' || budget === 'high') {
        recommendations.push({
          name: 'Jasper AI',
          slug: 'jasper-ai',
          why: 'Professional content generation with brand voice'
        });
      }
    }

    if (useCase === 'design') {
      if (budget === 'free' || budget === 'low') {
        recommendations.push({
          name: 'Canva AI',
          slug: 'canva-ai',
          why: 'Easy to use with free tier and AI design features'
        });
      }
      if (experience === 'advanced') {
        recommendations.push({
          name: 'Midjourney',
          slug: 'midjourney',
          why: 'Professional-grade AI image generation'
        });
      }
    }

    if (useCase === 'productivity') {
      if (budget === 'free' || budget === 'low') {
        recommendations.push({
          name: 'Notion AI',
          slug: 'notion-ai',
          why: 'All-in-one workspace with AI features'
        });
      }
      recommendations.push({
        name: 'ChatGPT Plus',
        slug: 'chatgpt-plus',
        why: 'Versatile AI assistant for various tasks'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        name: 'ChatGPT Plus',
        slug: 'chatgpt-plus',
        why: 'Versatile AI assistant good for most tasks'
      });
      recommendations.push({
        name: 'Claude Pro',
        slug: 'claude-pro',
        why: 'Strong at analysis and long-form content'
      });
    }

    const unique = recommendations.filter((rec, index, self) =>
      index === self.findIndex((r) => r.slug === rec.slug)
    );

    return unique.slice(0, 3);
  };

  const recommendations = showResults ? getRecommendations() : [];

  const useCaseOptions = [
    { value: 'writing', label: 'Writing: CVs, emails, posts' },
    { value: 'productivity', label: 'Planning and organizing' },
    { value: 'design', label: 'Design: flyers, images, social posts' },
    { value: 'coding', label: 'Coding and building apps' },
    { value: 'other', label: 'Something else, just exploring' },
  ] as const;

  return (
    <div className="scroll-mt-16">
      <PageIntro
        title="Find your starting point"
        accent="notebook"
        lead="Three quick questions. We'll suggest up to three tools to try first, and you stay in charge of every choice."
      />
      <section className="py-10 md:py-14">
        <div className="container-max max-w-2xl">
          {!showResults ? (
            <form onSubmit={handleSubmit} className="card !p-6 md:!p-8 space-y-8">
              <fieldset ref={firstQuestionRef} tabIndex={-1} className="border-0 p-0 m-0 focus:outline-none">
                <legend className="block font-fraunces font-bold text-green text-[1.35rem] mb-3">
                  What will you mainly use it for? <span className="text-red-600" aria-hidden="true">*</span>
                </legend>
                <div className="space-y-2">
                  {useCaseOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 min-h-[52px] border-[1.5px] border-line rounded-xl bg-white cursor-pointer hover:border-green transition-colors has-[:checked]:border-green has-[:checked]:bg-leaf has-[:checked]:shadow-[0_0_0_1px_#1E3B2C] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-green-2 has-[:focus-visible]:outline-offset-2">
                      <input
                        type="radio"
                        name="useCase"
                        value={option.value}
                        checked={useCase === option.value}
                        onChange={(e) => setUseCase(e.target.value as UseCase)}
                        className="w-5 h-5 accent-[#1E3B2C] shrink-0"
                        required
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border-0 p-0 m-0">
                <legend className="block font-fraunces font-bold text-green text-[1.35rem] mb-3">
                  What's your budget? <span className="text-red-600" aria-hidden="true">*</span>
                </legend>
                <div className="space-y-2">
                  {[
                    { value: 'free', label: 'Free only' },
                    { value: 'low', label: 'Up to $15/month' },
                    { value: 'medium', label: '$15-30/month' },
                    { value: 'high', label: '$30+ per month' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 min-h-[52px] border-[1.5px] border-line rounded-xl bg-white cursor-pointer hover:border-green transition-colors has-[:checked]:border-green has-[:checked]:bg-leaf has-[:checked]:shadow-[0_0_0_1px_#1E3B2C] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-green-2 has-[:focus-visible]:outline-offset-2">
                      <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={budget === option.value}
                        onChange={(e) => setBudget(e.target.value as Budget)}
                        className="w-5 h-5 accent-[#1E3B2C] shrink-0"
                        required
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border-0 p-0 m-0">
                <legend className="block font-fraunces font-bold text-green text-[1.35rem] mb-3">
                  How would you describe your experience with AI tools? <span className="text-red-600" aria-hidden="true">*</span>
                </legend>
                <div className="space-y-2">
                  {[
                    { value: 'beginner', label: 'Beginner - Just starting out' },
                    { value: 'intermediate', label: "Intermediate - I've used a few" },
                    { value: 'advanced', label: "Advanced - I'm very familiar with AI tools" },
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-3 min-h-[52px] border-[1.5px] border-line rounded-xl bg-white cursor-pointer hover:border-green transition-colors has-[:checked]:border-green has-[:checked]:bg-leaf has-[:checked]:shadow-[0_0_0_1px_#1E3B2C] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-green-2 has-[:focus-visible]:outline-offset-2">
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={experience === option.value}
                        onChange={(e) => setExperience(e.target.value as Experience)}
                        className="w-5 h-5 accent-[#1E3B2C] shrink-0"
                        required
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn-primary w-full">
                Get recommendations
              </button>
            </form>
          ) : (
            <div>
              <div className="note mb-8">
                <h2
                  ref={resultsHeadingRef}
                  tabIndex={-1}
                  className="heading-2 mb-2 focus:outline-none"
                >
                  Based on your answers:
                </h2>
                <p className="text-soft">
                  {useCase === 'coding' && "You're looking for coding tools"}
                  {useCase === 'writing' && "You're looking for writing tools"}
                  {useCase === 'design' && "You're looking for design tools"}
                  {useCase === 'productivity' && "You're looking for productivity tools"}
                  {useCase === 'other' && "You're exploring AI tools"}
                  {' · '}
                  {budget === 'free' && 'Free only'}
                  {budget === 'low' && 'Up to $15/month'}
                  {budget === 'medium' && '$15-30/month'}
                  {budget === 'high' && '$30+/month'}
                  {' · '}
                  {experience === 'beginner' && 'Beginner level'}
                  {experience === 'intermediate' && 'Intermediate level'}
                  {experience === 'advanced' && 'Advanced user'}
                </p>
              </div>

              <h2 className="heading-2 mb-6">Our recommendations:</h2>

              <ol className="space-y-6 mb-8 list-none p-0">
                {recommendations.map((rec, index) => (
                  <li key={rec.slug} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-leaf text-green font-fraunces font-bold grid place-items-center" aria-hidden="true">
                          {index + 1}
                        </span>
                        <h3 className="heading-3">{rec.name}</h3>
                      </div>
                    </div>
                    <p className="text-soft mb-4">{rec.why}</p>
                    <div className="flex flex-wrap gap-3 items-start">
                      <PaidVisitLink
                        slug={rec.slug}
                        name={rec.name}
                        paid={toolHasAffiliate(affiliates, rec.slug)}
                        goSlug={affiliates[rec.slug]}
                      />
                      <Link
                        href={`/tools/${rec.slug}`}
                        className="btn-secondary inline-block"
                      >
                        View details
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={reset}
                  className="btn-secondary"
                >
                  Start over
                </button>
                <Link href="/tools" className="btn-secondary">
                  Browse all tools
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 note text-sm">
            <strong>Note:</strong> These are general recommendations based on common use cases. Always check the full tool details to make sure it fits your specific needs.
          </div>
        </div>
      </section>
    </div>
  );
}
