import type { ReactNode } from 'react';
import { OrangeSwoosh } from '@/components/OrangeSwoosh';
import { DeskAccent, type AccentName } from '@/components/DeskAccents';

/**
 * Everyday Guide page header: serif headline, orange swoosh, friendly lead, a small desk accent.
 * One per page; renders the page's only <h1>.
 */
export function PageIntro({
  title,
  lead,
  accent,
  children,
  narrow = false,
  above,
}: {
  title: ReactNode;
  lead?: ReactNode;
  accent?: AccentName;
  children?: ReactNode;
  narrow?: boolean;
  above?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-cream-2/50">
      <div className={`container-max ${narrow ? 'max-w-4xl' : ''}`}>
        <div className={`grid gap-6 py-10 md:py-14 items-center ${accent ? 'md:grid-cols-[1fr_auto]' : ''}`}>
          <div className="min-w-0">
            {above ? <div className="mb-4">{above}</div> : null}
            <h1 className="heading-page">{title}</h1>
            <OrangeSwoosh />
            {lead ? <div className="text-lead max-w-[38em]">{lead}</div> : null}
            {children ? <div className="mt-6 flex flex-wrap gap-3 items-center">{children}</div> : null}
          </div>
          {accent ? (
            <DeskAccent name={accent} className="hidden sm:block w-[180px] md:w-[220px] h-auto justify-self-end" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
