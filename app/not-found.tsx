import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DeskAccent } from '@/components/DeskAccents';
import { OrangeSwoosh } from '@/components/OrangeSwoosh';

export default function NotFound() {
  return (
    <section className="py-14 md:py-20">
      <div className="container-max grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="max-w-2xl">
          <h1 className="heading-page">This page wandered off</h1>
          <OrangeSwoosh />
          <p className="text-lead mb-8">
            That page does not exist or has been moved. Here are a few good places to pick up again.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">
              Back to home
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="/tools" className="btn-secondary">Browse all tools</Link>
            <Link href="/finder" className="btn-secondary">Find my starting point</Link>
          </div>
        </div>
        <DeskAccent name="plant" className="hidden sm:block w-[220px] h-auto justify-self-center" />
      </div>
    </section>
  );
}
