import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/PageIntro';
import { DeskAccent } from '@/components/DeskAccents';
import { generateBreadcrumbSchema, generateItemListSchema, safeJsonLd } from '@/lib/json-ld';
import { PERSONAS } from '@/lib/personas';
import { personaStyle } from '@/lib/persona-style';

export const metadata: Metadata = {
  title: 'Toolkits by role',
  description:
    'Four starter toolkits for job seekers, freelancers, small business owners, and builders, picked from the live catalog.',
  alternates: { canonical: '/personas' },
};

export default function PersonasPage() {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Personas', url: '/personas' },
  ]);
  const list = generateItemListSchema(
    'AI tool personas',
    'Who each starter stack is built for',
    PERSONAS.map((persona) => ({
      name: `${persona.name}: ${persona.title}`,
      url: `/personas/${persona.slug}`,
      description: persona.whoFor,
    }))
  );

  return (
    <div className="scroll-mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(list) }} />

      <PageIntro
        title="Toolkits by role"
        accent="books"
        lead="Four people, four different jobs to get done. Each starter toolkit is picked from the live catalog for that person's goals and budget, and you can change any of it."
        above={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-soft hover:text-green focus-ring rounded underline underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-soft">/</li>
              <li aria-current="page" className="text-ink font-medium">
                Personas
              </li>
            </ol>
          </nav>
        }
      >
        <Link href="/budget" className="btn-primary">
          Build a stack to your budget
        </Link>
      </PageIntro>

      <section className="py-10 md:py-14">
        <div className="container-max">
          <ul className="grid gap-6 md:grid-cols-2 list-none p-0 m-0">
            {PERSONAS.map((persona) => {
              const style = personaStyle(persona.slug);
              return (
                <li key={persona.slug}>
                  <Link
                    href={`/personas/${persona.slug}`}
                    className="card !p-0 overflow-hidden flex flex-col h-full hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-22px_rgba(30,59,44,0.8)] transition-all duration-200 focus-ring group"
                  >
                    <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4" style={{ background: style.tint }}>
                      <div>
                        <h2 className="heading-3">{persona.name}</h2>
                        <span className="badge mt-1 bg-card text-green border border-line">{persona.audience}</span>
                      </div>
                      <DeskAccent name={style.accent} className="w-16 h-auto shrink-0" />
                    </div>
                    <div className="flex flex-col gap-3 p-6 flex-1">
                      <span className="font-semibold text-ink">{persona.title}</span>
                      <span className="text-soft">{persona.whoFor}</span>
                      <span className="block font-fraunces text-[1.1rem] leading-snug text-green">
                        &ldquo;{persona.voice}&rdquo;
                      </span>
                      <span className="mt-auto inline-flex items-center gap-2 font-semibold text-green">
                        See {persona.name}&apos;s toolkit
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="note mt-10">
            These are composite people, not real customers. A person sets the rules for each toolkit and reviews what&apos;s listed; the picks update as the catalog changes.
          </p>
        </div>
      </section>
    </div>
  );
}
