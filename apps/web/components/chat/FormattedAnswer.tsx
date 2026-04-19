const citationPattern = /(\[\d+\])/g;

export function FormattedAnswer({ content }: { content: string }) {
  const segments = content.split(citationPattern);

  return (
    <p
      style={{
        margin: 0,
        fontSize: "var(--ll-text-base)",
        lineHeight: 1.7,
        color: "var(--ll-text-primary)",
        fontFamily: "var(--ll-font-ui)",
        fontWeight: 400,
        maxWidth: "72ch"
      }}
    >
      {segments.map((segment, index) => {
        if (/^\[\d+\]$/.test(segment)) {
          return (
            <sup
              key={`${segment}-${index}`}
              style={{
                fontFamily: "var(--ll-font-mono)",
                fontSize: "var(--ll-text-2xs)",
                color: "var(--ll-accent)",
                padding: "0 2px",
                cursor: "default"
              }}
            >
              {segment}
            </sup>
          );
        }
        return <span key={`t-${index}`}>{segment}</span>;
      })}
    </p>
  );
}
