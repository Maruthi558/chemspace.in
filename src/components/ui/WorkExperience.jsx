import React, { useState, useRef, useCallback } from 'react';
import { BriefcaseBusiness, Infinity as InfinityIcon, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { ChevronsUpDownIcon } from './ChevronsUpDownIcon';

export function formatDuration(start, end) {
  if (!start) return '';
  const startYear = parseInt(start.split('.').pop(), 10) || parseInt(start, 10);
  const endYear = end ? (parseInt(end.split('.').pop(), 10) || parseInt(end, 10)) : new Date().getFullYear();

  const startMonth = start.includes('.') ? parseInt(start.split('.')[0], 10) : 1;
  const endMonth = end && end.includes('.') ? parseInt(end.split('.')[0], 10) : new Date().getMonth() + 1;

  const totalMonths = Math.max(1, (endYear - startYear) * 12 + (endMonth - startMonth) + 1);

  if (totalMonths < 12) {
    return `${totalMonths}m`;
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return months === 0 ? `${years}y` : `${years}y ${months}m`;
}

export function ExperiencePositionItem({ position }) {
  const [isOpen, setIsOpen] = useState(Boolean(position.isExpanded));
  const iconRef = useRef(null);

  const toggleOpen = useCallback(() => {
    if (!position.description && (!position.skills || position.skills.length === 0)) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (iconRef.current) {
        if (next) iconRef.current.startAnimation();
        else iconRef.current.stopAnimation();
      }
      return next;
    });
  }, [position.description, position.skills]);

  const { start, end } = position.employmentPeriod || {};
  const isOngoing = !end;
  const duration = formatDuration(start, end);

  return (
    <div className="relative last:before:hidden pl-2">
      {/* Position Header Bar */}
      <div
        onClick={toggleOpen}
        className={cn(
          'group/pos block w-full text-left select-none p-2 rounded-xl transition cursor-pointer',
          'hover:bg-[var(--bg-inner)]',
          !position.description && 'cursor-default'
        )}
      >
        <div className="relative z-10 flex items-start gap-3 text-sm">
          {/* Position Icon */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-orange-500 shadow-xs">
            {position.icon || <BriefcaseBusiness className="size-3.5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[var(--text-primary)] text-sm truncate">
              {position.title}
            </h4>

            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[var(--text-secondary)] font-mono">
              {position.employmentType && (
                <>
                  <span>{position.employmentType}</span>
                  <span className="text-[var(--text-muted)]">•</span>
                </>
              )}

              <div className="flex items-center gap-1 tabular-nums">
                <span>{start}</span>
                <span>—</span>
                {isOngoing ? (
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <span>Present</span>
                    <InfinityIcon className="size-3" />
                  </span>
                ) : (
                  <span>{end}</span>
                )}
              </div>

              {duration && (
                <>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-[var(--text-muted)]">({duration})</span>
                </>
              )}
            </div>
          </div>

          {position.description && (
            <div className="shrink-0 text-[var(--text-muted)] group-hover/pos:text-orange-500 transition">
              <ChevronsUpDownIcon ref={iconRef} />
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="pt-2 pb-3 pl-12 pr-4 space-y-3 animate-in fade-in duration-200">
          {position.description && (
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{position.description}</ReactMarkdown>
            </div>
          )}

          {Array.isArray(position.skills) && position.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {position.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-inner)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-muted)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceItem({ experience }) {
  return (
    <div className="space-y-3 py-4 border-b border-[var(--border-subtle)] last:border-b-0">
      {/* Company / Institution Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-lg shadow-xs select-none">
          {experience.companyLogo ? (
            <img
              src={experience.companyLogo}
              alt={experience.companyName}
              className="size-6 object-contain rounded-md"
            />
          ) : (
            <span>{experience.emoji || '🏛️'}</span>
          )}
        </div>

        <div className="flex items-center gap-2 truncate">
          <h3 className="text-base font-bold font-sans text-[var(--text-primary)]">
            {experience.companyWebsite ? (
              <a
                href={experience.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-500 hover:underline transition"
              >
                {experience.companyName}
              </a>
            ) : (
              experience.companyName
            )}
          </h3>

          {experience.isCurrentEmployer && (
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          )}
        </div>
      </div>

      {/* Vertical Track for Positions */}
      <div className="relative space-y-2 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-[var(--border-subtle)]">
        {experience.positions.map((pos) => (
          <ExperiencePositionItem key={pos.id} position={pos} />
        ))}
      </div>
    </div>
  );
}

export function WorkExperience({ experiences = [], className = '' }) {
  return (
    <div className={cn('w-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-6 text-[var(--text-primary)] shadow-sm', className)}>
      {experiences.map((exp) => (
        <ExperienceItem key={exp.id} experience={exp} />
      ))}
    </div>
  );
}

export default WorkExperience;
