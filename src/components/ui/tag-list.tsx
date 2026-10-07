type TagListProps = {
  items: readonly string[];
};

export function TagList({ items }: TagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
