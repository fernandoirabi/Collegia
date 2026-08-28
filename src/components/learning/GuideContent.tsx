import styles from "./GuideContent.module.css";

interface GuideContentProps {
  content: string;
}

const BULLET = "•";

function isBulletLine(line: string): boolean {
  return line.trim().startsWith(BULLET);
}

function renderBlock(block: string, idx: number) {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 1) {
    return <p key={idx} className={styles.paragraph}>{lines[0]}</p>;
  }

  if (lines.every(isBulletLine)) {
    return (
      <ul key={idx} className={styles.list}>
        {lines.map((line, i) => (
          <li key={i} className={styles.listItem}>
            {line.replace(BULLET, "").trim()}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={idx} className={styles.paragraph}>
      {lines.join(" ")}
    </p>
  );
}

export default function GuideContent({ content }: GuideContentProps) {
  const blocks = content.split("\n\n");
  return <>{blocks.map(renderBlock)}</>;
}
