/** Display source explicitly imported by an MDX page. */
export function ExampleSource({
  source,
  language,
}: {
  source: string;
  language?: string;
}) {
  return (
    <pre>
      <code className={language ? `language-${language}` : undefined}>
        {source}
      </code>
    </pre>
  );
}
