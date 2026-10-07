import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Star } from 'lucide-react';

export function GlowCardGrid({
  cardRadius = 16,
  iconBlur = 25,
  iconSaturate = 5.0,
  iconBrightness = 1.3,
  iconScale = 4,
  iconOpacity = 0.35,
  borderWidth = 3,
  borderBlur = 10,
  borderSaturate = 4.2,
  borderBrightness = 2.5,
  borderContrast = 2.5,
  className,
  style,
  children,
  ...props
}) {
  const gridRef = useRef(null);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!gridRef.current) return;

      const cards = gridRef.current.querySelectorAll("[data-slot='glow-card']");

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const x = (event.clientX - centerX) / (rect.width / 2);
        const y = (event.clientY - centerY) / (rect.height / 2);

        card.style.setProperty('--pointer-x', x.toFixed(3));
        card.style.setProperty('--pointer-y', y.toFixed(3));
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <div
      ref={gridRef}
      className={cn(
        'grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3',
        className
      )}
      style={{
        '--card-radius': `${cardRadius}px`,
        '--card-icon-blur': `${iconBlur}px`,
        '--card-icon-saturate': iconSaturate,
        '--card-icon-brightness': iconBrightness,
        '--card-icon-scale': iconScale,
        '--card-icon-opacity': iconOpacity,
        '--card-border-width': `${borderWidth}px`,
        '--card-border-blur': `${borderBlur}px`,
        '--card-border-saturate': borderSaturate,
        '--card-border-brightness': borderBrightness,
        '--card-border-contrast': borderContrast,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlowCard({
  name,
  handle,
  avatar,
  emoji,
  role,
  quote,
  rating = 5,
  className,
}) {
  return (
    <div
      data-slot="glow-card"
      className={cn(
        'relative min-h-[220px] w-full overflow-hidden rounded-[var(--card-radius)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-all select-none active:scale-[0.98] shadow-sm hover:shadow-md flex flex-col justify-between group',
        className
      )}
    >
      {/* Background Glowing Ambient Flare */}
      <div className="absolute inset-0 overflow-hidden rounded-[var(--card-radius)] pointer-events-none [clip-path:inset(0_round_var(--card-radius))]">
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center',
            'translate-x-[calc(var(--pointer-x,-10)*50%)] translate-y-[calc(var(--pointer-y,-10)*50%)] scale-[var(--card-icon-scale)]',
            'blur-[var(--card-icon-blur)] brightness-[var(--card-icon-brightness)] saturate-[var(--card-icon-saturate)]',
            'opacity-[var(--card-icon-opacity)] will-change-[transform,filter] transition-opacity duration-300'
          )}
        >
          {avatar ? (
            <img className="w-24 h-24 rounded-full" src={avatar} alt={name} />
          ) : (
            <div className="text-6xl select-none filter drop-shadow-lg">
              {emoji || '🧪'}
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Review Details */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        {/* Top Header: Avatar/Emoji + Rating */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/40 shadow-sm"
                src={avatar}
                alt={name}
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl shadow-inner select-none">
                {emoji || '🧪'}
              </div>
            )}

            <div className="flex flex-col">
              <h3 className="text-sm font-bold font-sans text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                <span>{name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </h3>
              <p className="text-xs font-mono text-[var(--text-secondary)]">{handle}</p>
            </div>
          </div>

          {rating ? (
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          ) : null}
        </div>

        {/* Center: Quote / Review Text */}
        {quote ? (
          <p className="text-xs leading-relaxed text-[var(--text-secondary)] italic line-clamp-3">
            "{quote}"
          </p>
        ) : null}

        {/* Bottom Tag / Role */}
        {role ? (
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
            <span className="truncate">{role}</span>
            <span className="text-emerald-500 font-bold uppercase tracking-wider">Verified Scientist</span>
          </div>
        ) : null}
      </div>

      {/* Interactive Glowing Border Mask */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[var(--card-radius)]',
          'border-[length:var(--card-border-width)] border-solid border-transparent',
          'backdrop-blur-[var(--card-border-blur)] backdrop-brightness-[var(--card-border-brightness)] backdrop-contrast-[var(--card-border-contrast)] backdrop-saturate-[var(--card-border-saturate)]',
          '[clip-path:inset(0_round_var(--card-radius))]'
        )}
        style={{
          maskImage: 'linear-gradient(#fff 0 100%), linear-gradient(#fff 0 100%)',
          maskOrigin: 'border-box, padding-box',
          maskClip: 'border-box, padding-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      />
    </div>
  );
}

export default GlowCardGrid;
