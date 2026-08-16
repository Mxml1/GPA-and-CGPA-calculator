import React, { useState } from 'react';
import type { Subject } from '../store/useStore';

// Muted, distinct dashboard colors. A subject keeps the same color in both bars.
const COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#10B981', // emerald
  '#F59E0B', // amber
  '#06B6D4', // cyan
  '#F43F5E', // rose
  '#84CC16', // lime
  '#14B8A6', // teal
   '#EC4899', // pink
  '#6366F1', // indigo
  
];

interface ContributionBarsProps {
  subjects: Subject[];
}

type HoveredBar = 'max' | 'actual' | null;

interface TooltipPosition {
  left: number;
  top: number;
}

type ViewMode = 'bars' | 'pie';

const MAX_GP = 4;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const polarToCartesian = (
  center: number,
  radius: number,
  angleInDegrees: number
) => {
  const angle = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
};

const describeDonutSegment = (
  center: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const outerStart = polarToCartesian(center, outerRadius, endAngle);
  const outerEnd = polarToCartesian(center, outerRadius, startAngle);
  const innerStart = polarToCartesian(center, innerRadius, startAngle);
  const innerEnd = polarToCartesian(center, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
};

export const ContributionBars: React.FC<ContributionBarsProps> = ({ subjects }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('bars');
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<HoveredBar>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

  // Ignore incomplete subjects when building the contribution visualization.
  const validSubjects = subjects.filter(
    (subject) => subject.credits > 0 && subject.name.trim() !== ''
  );
  const totalCH = validSubjects.reduce((sum, subject) => sum + subject.credits, 0);

  const totalAchievedPoints = validSubjects.reduce(
    (sum, subject) => sum + clamp(subject.points, 0, MAX_GP) * subject.credits,
    0
  );
  const actualGPA = totalCH > 0 ? totalAchievedPoints / totalCH : 0;

  const clearTooltip = () => {
    setHoveredSubject(null);
    setHoveredBar(null);
    setTooltipPosition(null);
  };

  const handleSegmentEnter = (
    subject: Subject,
    bar: Exclude<HoveredBar, null>,
    element: Element
  ) => {
    const rect = element.getBoundingClientRect();

    setHoveredSubject(subject.id);
    setHoveredBar(bar);
    setTooltipPosition({
      left: rect.left + rect.width / 2,
      top: bar === 'max' ? rect.top - 10 : rect.bottom + 10,
    });
  };

  if (totalCH === 0 || validSubjects.length === 0) {
    return (
      <div className="bg-card/50 border border-border/50 border-dashed rounded-xl p-8 text-center text-muted-foreground mt-8">
        Add subjects and credits to see your GPA contribution breakdown.
      </div>
    );
  }

  const hoveredSubjectData = hoveredSubject
    ? validSubjects.find((subject) => subject.id === hoveredSubject) ?? null
    : null;

  const hoveredSubjectIndex = hoveredSubjectData
    ? validSubjects.findIndex((subject) => subject.id === hoveredSubjectData.id)
    : -1;

  const hoveredColor = hoveredSubjectIndex >= 0
    ? COLORS[hoveredSubjectIndex % COLORS.length]
    : '#3B82F6';

  const hoveredWidth = hoveredSubjectData
    ? (hoveredSubjectData.credits / totalCH) * 100
    : 0;

  const hasActualResult = hoveredSubjectData
    ? Boolean(hoveredSubjectData.grade) || hoveredSubjectData.marks !== undefined
    : false;

  const hoveredAchievement = hoveredSubjectData && hasActualResult
    ? Math.min(Math.max((hoveredSubjectData.points / 4) * 100, 0), 100)
    : 0;

  const renderPieChart = (mode: 'max' | 'actual') => {
    const size = 320;
    const center = size / 2;
    const outerRadius = 132;
    const innerRadius = 82;

    let currentAngle = 0;

    return (
      <div className="relative mx-auto w-full max-w-[320px] aspect-square">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={
            mode === 'max'
              ? 'Maximum 4.00 GPA contribution pie chart'
              : 'Actual GPA contribution pie chart'
          }
        >
          {validSubjects.map((sub, index) => {
            const color = COLORS[index % COLORS.length];
            const sliceAngle = (sub.credits / totalCH) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            const hasResult = Boolean(sub.grade) || sub.marks !== undefined;
            const achievement = hasResult
              ? clamp(sub.points / MAX_GP, 0, 1)
              : 0;

            currentAngle = endAngle;

            const fullPath = describeDonutSegment(
              center,
              outerRadius,
              innerRadius,
              startAngle,
              endAngle
            );

            const achievedEndAngle =
              startAngle + sliceAngle * achievement;

            const achievedPath =
              achievement > 0
                ? describeDonutSegment(
                    center,
                    outerRadius,
                    innerRadius,
                    startAngle,
                    achievedEndAngle
                  )
                : '';

            return (
              <g key={sub.id}>
                <path
                  d={fullPath}
                  fill={
                    mode === 'max'
                      ? color
                      : hexToRgba(color, 0.2)
                  }
                  stroke="rgba(15, 23, 42, 0.95)"
                  strokeWidth="2"
                  className="cursor-help transition-[filter] duration-200 hover:brightness-110"
                  onMouseEnter={(event) =>
                    handleSegmentEnter(sub, mode, event.currentTarget)
                  }
                  aria-label={`${sub.name}, ${sub.credits} credit hours, ${(
                    (sub.credits / totalCH) *
                    100
                  ).toFixed(2)} percent contribution`}
                />

                {mode === 'actual' && achievement > 0 && (
                  <path
                    d={achievedPath}
                    fill={color}
                    stroke="rgba(15, 23, 42, 0.95)"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                )}
              </g>
            );
          })}

          <circle
            cx={center}
            cy={center}
            r={innerRadius - 1}
            className="fill-card"
          />

          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-[0.16em]"
          >
            {mode === 'max' ? 'Maximum' : 'Your GPA'}
          </text>

          <text
            x={center}
            y={center + 24}
            textAnchor="middle"
            className="fill-white text-[26px] font-black"
          >
            {mode === 'max' ? '4.00' : actualGPA.toFixed(2)}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div
      className="mt-8 bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-lg fade-in relative"
      onMouseLeave={clearTooltip}
    >
      {/* Single floating tooltip. It lives outside the overflow-hidden bars. */}
      {hoveredSubjectData && tooltipPosition && (
        <div
          className="fixed z-[100] pointer-events-none w-max max-w-[280px] -translate-x-1/2"
          style={{
            left: tooltipPosition.left,
            top: tooltipPosition.top,
            transform: hoveredBar === 'max'
              ? 'translate(-50%, -100%)'
              : 'translate(-50%, 0)',
          }}
        >
          <div className="rounded-xl border border-white/10 bg-black/95 px-3.5 py-3 text-xs text-white shadow-2xl backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: hoveredColor }}
              />
              <p className="font-bold text-sm leading-tight">{hoveredSubjectData.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
              <span className="text-muted-foreground">Credit Hours:</span>
              <span className="text-right font-medium">{hoveredSubjectData.credits}</span>

              <span className="text-muted-foreground">Contribution:</span>
              <span className="text-right font-medium">{hoveredWidth.toFixed(2)}%</span>

              {hoveredBar === 'max' ? (
                <>
                  <span className="text-muted-foreground">Maximum GP:</span>
                  <span className="text-right font-medium text-emerald-400">4.00</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Achievement:</span>
                  <span className="text-right font-medium text-primary">
                    {hoveredAchievement.toFixed(0)}%
                  </span>

                  <span className="text-muted-foreground">Actual GP:</span>
                  <span className="text-right font-medium">
                    {hasActualResult ? hoveredSubjectData.points.toFixed(2) : '-'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-5">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            GPA Contribution Breakdown
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            See how much each subject contributes to your semester based on its Credit Hours.
          </p>
        </div>

        <div className="flex items-end gap-6 sm:gap-8 shrink-0">
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Max Potential
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white leading-none">4.00</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Your Result
            </p>
            <p className="text-2xl sm:text-3xl font-black text-primary leading-none">
              {actualGPA.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Visualization switcher */}
      <div className="mb-8 flex justify-center">
        <div
          className="inline-flex rounded-lg border border-border/50 bg-background/70 p-1"
          role="tablist"
          aria-label="Contribution visualization"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'bars'}
            onClick={() => {
              setViewMode('bars');
              clearTooltip();
            }}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
              viewMode === 'bars'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Contribution Bars
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'pie'}
            onClick={() => {
              setViewMode('pie');
              clearTooltip();
            }}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
              viewMode === 'pie'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Pie Charts
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {viewMode === 'bars' ? (
          <>
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Maximum 4.00 GPA
                </h4>
                <span className="shrink-0 rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                  Total CH: {totalCH}
                </span>
              </div>

              <div className="w-full h-12 bg-background border border-border/30 rounded-xl overflow-hidden flex drop-shadow-sm">
                {validSubjects.map((sub, index) => {
                  const widthPercentage = (sub.credits / totalCH) * 100;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div
                      key={sub.id}
                      role="img"
                      aria-label={`${sub.name}, ${sub.credits} credit hours, ${widthPercentage.toFixed(2)} percent contribution, maximum grade point 4.00`}
                      className="h-full relative shrink-0 cursor-help border-r border-background/20 last:border-r-0 transition-[filter] duration-200 hover:brightness-110"
                      style={{ width: `${widthPercentage}%`, backgroundColor: color }}
                      onMouseEnter={(event) =>
                        handleSegmentEnter(sub, 'max', event.currentTarget)
                      }
                    />
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Your Actual Result
                </h4>
                <span className="text-right text-xs font-medium text-muted-foreground">
                  Weighted by Grade Points
                </span>
              </div>

              <div className="w-full h-12 bg-background border border-border/30 rounded-xl overflow-hidden flex drop-shadow-sm">
                {validSubjects.map((sub, index) => {
                  const widthPercentage = (sub.credits / totalCH) * 100;
                  const hasResult = Boolean(sub.grade) || sub.marks !== undefined;
                  const achievedPercentage = hasResult
                    ? clamp((sub.points / 4) * 100, 0, 100)
                    : 0;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div
                      key={sub.id}
                      role="img"
                      aria-label={`${sub.name}, ${sub.credits} credit hours, ${widthPercentage.toFixed(2)} percent contribution, ${achievedPercentage.toFixed(0)} percent achieved`}
                      className="h-full relative shrink-0 cursor-help border-r border-background/20 last:border-r-0 transition-[filter] duration-200 hover:brightness-110"
                      style={{ width: `${widthPercentage}%` }}
                      onMouseEnter={(event) =>
                        handleSegmentEnter(sub, 'actual', event.currentTarget)
                      }
                    >
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: color, opacity: 0.2 }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                        style={{ width: `${achievedPercentage}%`, backgroundColor: color }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="flex flex-col items-center">
              <div className="mb-3 w-full text-center">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Maximum 4.00 GPA
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total CH: {totalCH}
                </p>
              </div>
              {renderPieChart('max')}
            </section>

            <section className="flex flex-col items-center">
              <div className="mb-3 w-full text-center">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Your Actual Result
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weighted by Grade Points
                </p>
              </div>
              {renderPieChart('actual')}
            </section>
          </div>
        )}
        {/* Subject Legend */}
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Subjects</h4>
            <span className="text-xs text-muted-foreground">Color identifies each subject</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3">
            {validSubjects.map((sub, index) => {
              const widthPercentage = (sub.credits / totalCH) * 100;
              const color = COLORS[index % COLORS.length];

              return (
                <div
                  key={sub.id}
                  className="min-w-0 flex items-center gap-2.5 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-white/[0.03]"
                  title={sub.name}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/5"
                    style={{ backgroundColor: color }}
                  />
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {sub.name}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {sub.credits} CH · {widthPercentage.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};