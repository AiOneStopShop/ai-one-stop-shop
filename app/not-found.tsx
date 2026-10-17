import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section-spacing">
      <div className="container-max max-w-2xl text-center">
        <h1 className="heading-1 mb-4">Page not found</h1>
        <p className="text-lead mb-8">
          That page does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
