// Converts a country flag emoji (🇲🇽) to its ISO 3166-1 alpha-2 code ("mx")
// Flag emoji = two Regional Indicator Symbols (U+1F1E6–U+1F1FF)
function emojiToCode(emoji: string): string | null {
  const indicators = [...emoji].filter((c) => {
    const cp = c.codePointAt(0) ?? 0
    return cp >= 0x1f1e6 && cp <= 0x1f1ff
  })
  if (indicators.length < 2) return null
  return indicators
    .slice(0, 2)
    .map((c) => String.fromCharCode((c.codePointAt(0) ?? 0) - 0x1f1e6 + 65))
    .join("")
    .toLowerCase()
}

interface FlagProps {
  emoji: string
  size?: number
  className?: string
}

export function Flag({ emoji, size = 28, className = "" }: FlagProps) {
  if (!emoji) return null
  const code = emojiToCode(emoji)
  // Subdivision flags (Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿, etc.) fall back to emoji
  if (!code) return <span style={{ fontSize: size }}>{emoji}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      width={size}
      height={Math.round(size * 0.67)}
      alt={code.toUpperCase()}
      className={`inline-block object-cover rounded-sm ${className}`}
    />
  )
}
