import React from 'react';
import { Calendar, Clock, ArrowUpRight, BookOpen } from 'lucide-react';

export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function ArticleItem({
  title,
  coverUrl,
  createdAt,
  category = 'Research',
  readTime = '4 min read',
  summary = '',
  author = 'ChemSpace Research Lab'
}) {
  return (
    <article className="group h-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-primary)] shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden select-none">
      {/* Cover Image Container with Ratio & Inner Rings */}
      <div className="p-2 pb-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/10 dark:bg-white/5">
          <img
            className="size-full rounded-xl object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            src={coverUrl}
            alt={title}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />

          {/* Category Badge */}
          {category && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
              {category}
            </div>
          )}

          {/* Quick Corner Arrow Icon on Hover */}
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-orange-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Article Content & Metadata */}
      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-5 flex-1 justify-between">
        <div className="space-y-2">
          {/* Date & Read Time */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-orange-400" />
              <time dateTime={new Date(createdAt).toISOString()}>
                {formatDate(createdAt)}
              </time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 opacity-60" />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Article Title */}
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-orange-500 transition-colors duration-200 line-clamp-2 leading-snug">
            {title}
          </h3>

          {/* Summary / Snippet if provided */}
          {summary && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {/* Author / Source footer */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span className="truncate">{author}</span>
          <span className="text-[10px] font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Read Paper &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}

export default ArticleItem;
