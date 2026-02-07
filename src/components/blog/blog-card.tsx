interface BlogCardProps {
  title: string;
  date: string;
  excerpt: string;
}

export function BlogCard({ title, date, excerpt }: BlogCardProps) {
  return (
    <article className="group rounded-xl border border-(--border-primary) bg-(--bg-card) p-5 transition-colors hover:bg-(--bg-card-hover)">
      <time className="text-xs font-medium text-(--text-muted)">{date}</time>
      <h2 className="mt-2 text-lg font-semibold text-(--text-primary)">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
        {excerpt}
      </p>
      <span className="mt-4 inline-block cursor-not-allowed text-sm font-medium text-(--text-muted)">
        Lees meer &rarr;
      </span>
    </article>
  );
}
