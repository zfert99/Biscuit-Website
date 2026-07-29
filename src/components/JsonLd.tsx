/**
 * Renders JSON-LD server-side so it lands in the first HTML response. Validate
 * changes in Google's Rich Results Test. See hub plan Part 8.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own trusted data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
