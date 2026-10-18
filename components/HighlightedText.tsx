import { highlightSegments } from '@/lib/search-tools';

export function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  return (
    <>
      {highlightSegments(text, query).map((segment, index) =>
        segment.match ? <mark key={`${segment.text}-${index}`}>{segment.text}</mark> : segment.text
      )}
    </>
  );
}
