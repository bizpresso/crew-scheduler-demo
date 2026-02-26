import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { assignJob, rescheduleJob, holdJob, unholdJob, completeJob, splitJob, addCrewMember, updateCrewMember, deleteCrewMember, fetchOpportunityDetail, fetchScheduleActivity, uploadCrewAvatar, getHlAppOrigin, createNote, fetchSettings, updateSettings } from "./mockApi.js";

// ── Config ──────────────────────────────────────────────────────────────
const STD_HOURS = 8;
const CREW_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#F97316"];

// ── SVG Icons ───────────────────────────────────────────────────────────
const LockIcon = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <rect x="3" y="7" width="10" height="7" rx="1.5" fill={color} />
    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const ScissorsIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <circle cx="4.5" cy="4.5" r="2" stroke={color} strokeWidth="1.2" />
    <circle cx="4.5" cy="11.5" r="2" stroke={color} strokeWidth="1.2" />
    <path d="M6.2 5.8L13 12M6.2 10.2L13 4" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PauseIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <rect x="3" y="2" width="3.5" height="12" rx="1" fill={color} />
    <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill={color} />
  </svg>
);

const MaterialIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
);

const GearIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" fill={color} />
    <path d="M6.5 1.5l-.5 1.5a5 5 0 00-1.2.7l-1.5-.5-1.5 2.6 1.2 1a5 5 0 000 1.4l-1.2 1 1.5 2.6 1.5-.5a5 5 0 001.2.7l.5 1.5h3l.5-1.5a5 5 0 001.2-.7l1.5.5 1.5-2.6-1.2-1a5 5 0 000-1.4l1.2-1-1.5-2.6-1.5.5a5 5 0 00-1.2-.7L9.5 1.5h-3z" stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
  </svg>
);

const RefreshIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M2 8a6 6 0 0110.5-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 8a6 6 0 01-10.5 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 1v3.5h-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 15v-3.5h3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapPinIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
    <path d="M8 1.5A4.5 4.5 0 0112.5 6C12.5 9.5 8 14.5 8 14.5S3.5 9.5 3.5 6A4.5 4.5 0 018 1.5z" stroke={color} strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    <circle cx="8" cy="6" r="1.5" stroke={color} strokeWidth="1.2" fill="none" />
  </svg>
);

const ExternalLinkIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M9 2h5v5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2L7 9" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const HardhatIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M2 11h12v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1V11z" fill={color} />
    <path d="M3 11V8a5 5 0 0110 0v3" stroke={color} strokeWidth="1.3" fill="none" />
    <rect x="7" y="3" width="2" height="5" rx="1" fill={color} />
  </svg>
);

const CalendarIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={color} strokeWidth="1.3" />
    <path d="M2 6.5h12" stroke={color} strokeWidth="1.3" />
    <path d="M5 2v2M11 2v2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <rect x="4.5" y="8.5" width="2" height="2" rx=".5" fill={color} />
    <rect x="7" y="8.5" width="2" height="2" rx=".5" fill={color} />
    <rect x="9.5" y="8.5" width="2" height="2" rx=".5" fill={color} />
  </svg>
);

const AlertIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M7.134 2.5a1 1 0 011.732 0l5.196 9a1 1 0 01-.866 1.5H2.804a1 1 0 01-.866-1.5l5.196-9z" stroke={color} strokeWidth="1.3" fill="none" />
    <path d="M8 6v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11" r=".75" fill={color} />
  </svg>
);

// ── Colors ───────────────────────────────────────────────────────────────
const C = {
  bg: "#F4F4F6", card: "#FFFFFF", border: "#E5E7EB", borderLight: "#F3F4F6",
  text: "#111827", sub: "#6B7280", muted: "#9CA3AF",
  blue: "#3B82F6", blueHover: "#2563EB", blueLight: "#EFF6FF",
  green: "#10B981", orange: "#F59E0B", orangeLight: "#FFF7ED", orangeBorder: "#FBBF24",
  completed: "#D1D5DB",
};

// ── Helpers ──────────────────────────────────────────────────────────────
const getWeek = (off) => {
  const n = new Date();
  const d = n.getDay();
  const mon = new Date(n);
  mon.setDate(n.getDate() - (d === 0 ? 6 : d - 1) + off * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
};
const fmt = (d) => d.toISOString().split("T")[0];
const money = (v) => "$" + Number(v || 0).toLocaleString();
const fmtFriendly = (ds) => {
  const d = new Date(ds + "T12:00:00");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
};
const hLabel = (h) => {
  if (!h) return "—";
  if (h < 8) return `${h}h`;
  if (h === 8) return "1 day";
  if (h % 8 === 0) return `${h / 8} days`;
  const days = Math.floor(h / 8);
  const rem = h % 8;
  return days > 0 ? `${days}d ${rem}h` : `${h}h`;
};

// ── Allocation engine ───────────────────────────────────────────────────
function computeDayAllocations(schedule, oppsMap, workingDays) {
  const wd = workingDays || [1, 2, 3, 4, 5]; // default Mon-Fri
  const allocs = new Map();
  for (const entry of schedule) {
    const opp = oppsMap.get(entry.oppId);
    if (!opp) continue;

    // Manual split block: all its hours land on its own start date
    if (entry.splitGroupId) {
      allocs.set(entry.id, [{ date: entry.startDate, hours: entry.durationHours || 0 }]);
      continue;
    }

    const hours = opp.estDurationHours || 8;
    const isContinuous = opp.schedulingType?.toLowerCase() === "continuous";

    if (isContinuous) {
      allocs.set(entry.id, [{ date: entry.startDate, hours }]);
    } else {
      const days = [];
      let remaining = hours;
      let currentDate = entry.startDate;
      const startUsed = getHoursUsedOnDate(entry.userId, currentDate, entry.id, schedule, allocs);
      const avail = Math.max(STD_HOURS - startUsed, 0);
      const first = avail > 0 ? Math.min(remaining, Math.max(avail, 1)) : Math.min(remaining, STD_HOURS);
      days.push({ date: currentDate, hours: first });
      remaining -= first;
      while (remaining > 0) {
        currentDate = nextWorkingDay(currentDate, wd);
        const dh = Math.min(remaining, STD_HOURS);
        days.push({ date: currentDate, hours: dh });
        remaining -= dh;
      }
      allocs.set(entry.id, days);
    }
  }
  return allocs;
}

function getHoursUsedOnDate(userId, date, excludeId, schedule, existing) {
  let t = 0;
  for (const [eid, days] of existing) {
    const e = schedule.find((s) => s.id === eid);
    if (!e || e.userId !== userId || eid === excludeId) continue;
    for (const d of days) {
      if (d.date === date) t += d.hours;
    }
  }
  return t;
}

function nextDay(ds) {
  const d = new Date(ds + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return fmt(d);
}

function nextWorkingDay(ds, workingDays) {
  let d = new Date(ds + "T12:00:00");
  // Advance at least one day, then skip non-working days
  for (let i = 0; i < 30; i++) { // safety limit
    d.setDate(d.getDate() + 1);
    if (workingDays.includes(d.getDay())) return fmt(d);
  }
  // Fallback: just return next calendar day
  return nextDay(ds);
}

function getTotalHours(userId, date, schedule, allocs) {
  let t = 0;
  for (const entry of schedule) {
    if (entry.userId !== userId) continue;
    const days = allocs.get(entry.id);
    if (!days) continue;
    for (const d of days) {
      if (d.date === date) t += d.hours;
    }
  }
  return t;
}

function getBlocksForDate(userId, date, schedule, allocs, oppsMap) {
  const blocks = [];
  for (const entry of schedule) {
    if (entry.userId !== userId) continue;
    const days = allocs.get(entry.id);
    if (!days) continue;
    const da = days.find((d) => d.date === date);
    if (!da) continue;
    const opp = oppsMap.get(entry.oppId);
    if (!opp) continue;

    // For split blocks, compute split label info (e.g., "1/3")
    let splitLabel = null;
    if (entry.splitGroupId) {
      const siblings = schedule.filter((s) => s.splitGroupId === entry.splitGroupId);
      const total = siblings.length;
      const index = (entry.splitIndex ?? 0) + 1;
      splitLabel = `${index}/${total}`;
    }

    blocks.push({
      entry,
      opp,
      hours: da.hours,
      isStart: entry.splitGroupId ? true : entry.startDate === date,
      isEnd: entry.splitGroupId ? true : days[days.length - 1].date === date,
      totalHours: entry.splitGroupId ? entry.durationHours : (opp.estDurationHours || 8),
      splitLabel,
    });
  }
  return blocks;
}

// ── Queue Card ──────────────────────────────────────────────────────────
function QueueCard({ opp, onDragStart, onDoubleClick }) {
  const isContinuous = opp.schedulingType?.toLowerCase() === "continuous";
  const addr = opp.projectAddress
    ? `${opp.projectAddress}${opp.projectCity ? `, ${opp.projectCity}` : ""}`
    : null;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", opp.id);
        onDragStart(opp.id);
      }}
      onDoubleClick={() => onDoubleClick && onDoubleClick(opp)}
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: "8px 10px", marginBottom: 6, cursor: "grab",
        transition: "box-shadow .15s, border-color .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor = C.blue; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{opp.contactName || opp.name}</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
          {opp.needsMaterials && (
            <span title="Needs materials" style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, background: "#DBEAFE", color: "#1E40AF", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>
              <MaterialIcon size={8} /> MAT
            </span>
          )}
          {isContinuous && (
            <span title="Continuous — can't split across days" style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, background: "#FEF3C7", color: "#92400E", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>
              <LockIcon size={8} color="#92400E" /> CONT
            </span>
          )}
        </div>
      </div>
      {addr && <div style={{ fontSize: 10, color: C.muted, marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{addr}</div>}
      <div style={{ fontSize: 11, color: C.sub, marginBottom: 2 }}>{opp.typeOfWork || "—"}</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.blue }}>{hLabel(opp.estDurationHours)}</span>
        <span style={{ fontSize: 11, color: C.muted }}>{money(opp.monetaryValue)}</span>
      </div>
    </div>
  );
}

// ── Day Block ───────────────────────────────────────────────────────────
function DayBlock({ block, color, onDoubleClick, onDragStart }) {
  const { entry, opp, hours, isStart, isEnd, totalHours, splitLabel } = block;
  const isCompleted = entry.status === "completed";
  const isContinuous = opp.schedulingType?.toLowerCase() === "continuous";
  const pct = Math.min((hours / STD_HOURS) * 100, 100);
  const h = Math.max(Math.round((pct / 100) * 92), 40);
  const bgColor = isCompleted ? C.completed : color;
  const addr = opp.projectAddress
    ? `${opp.projectAddress}${opp.projectCity ? `, ${opp.projectCity}` : ""}`
    : null;

  return (
    <div
      draggable={!isCompleted}
      onDragStart={!isCompleted ? (e) => { e.dataTransfer.setData("text/plain", `move:${entry.id}`); onDragStart(entry.id); } : undefined}
      onDoubleClick={() => !isCompleted && onDoubleClick(entry)}
      title={isCompleted
        ? `${opp.typeOfWork || opp.name} — Completed`
        : `${opp.contactName || opp.name}${addr ? `\n${addr}` : ""}\n${opp.typeOfWork || ""} · ${hours}h${splitLabel ? ` (block ${splitLabel})` : ` on this day (${totalHours}h total)`}\nDrag to move · Double-click for details`}
      style={{
        background: bgColor,
        borderRadius: isStart && isEnd ? 5 : isStart ? "5px 5px 2px 2px" : isEnd ? "2px 2px 5px 5px" : 2,
        padding: "3px 6px", cursor: isCompleted ? "default" : "grab", color: isCompleted ? C.sub : "#fff",
        overflow: "hidden", height: h, minHeight: 40, marginBottom: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,.1)", transition: "opacity .12s",
        display: "flex", flexDirection: "column", justifyContent: "center",
        opacity: isCompleted ? 0.75 : 1,
        border: isCompleted ? `1px solid ${C.border}` : "none",
      }}
      onMouseEnter={(e) => { if (!isCompleted) e.currentTarget.style.opacity = ".9"; }}
      onMouseLeave={(e) => { if (!isCompleted) e.currentTarget.style.opacity = "1"; }}
    >
      {/* Line 1: Name + badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
        {!isStart && <span style={{ opacity: 0.7 }}>↳</span>}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{opp.contactName || opp.name}</span>
        {splitLabel && (
          <span style={{ fontSize: 8, fontWeight: 700, background: "rgba(255,255,255,0.25)", padding: "0 3px", borderRadius: 3, flexShrink: 0, lineHeight: 1.4 }}>
            {splitLabel}
          </span>
        )}
        {isCompleted && <CheckIcon size={9} />}
        {!isCompleted && isContinuous && <LockIcon size={8} color="rgba(255,255,255,0.7)" />}
      </div>
      {/* Line 2: Address (if start block and has address) */}
      {isStart && addr && (
        <div style={{ fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.7, lineHeight: 1.2 }}>
          {addr}
        </div>
      )}
      {/* Line 3: Type of work + hours */}
      {isStart ? (
        <div style={{ fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.85 }}>
          {opp.typeOfWork || "—"} · {hours}h
        </div>
      ) : (
        <div style={{ fontSize: 9, opacity: 0.7 }}>{hours}h</div>
      )}
    </div>
  );
}

// ── Activity Icons ──────────────────────────────────────────────────────
const activityIcons = {
  assigned: { icon: "→", color: C.blue },
  rescheduled: { icon: "↻", color: "#8B5CF6" },
  held: { icon: "⏸", color: C.orange },
  unheld: { icon: "▶", color: C.green },
  completed: { icon: "✓", color: C.green },
  split: { icon: "✂", color: "#7C3AED" },
};

const NoteIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.2" />
    <path d="M5 5h6M5 8h6M5 11h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.2" />
    <path d="M8 4.5V8l2.5 1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Split Dialog ────────────────────────────────────────────────────────
function SplitDialog({ opp, entry, onClose, onSplit }) {
  const totalHours = opp.estDurationHours || 8;
  const [blocks, setBlocks] = useState(() => {
    // Default: two equal blocks (or close to equal)
    const half = Math.round((totalHours / 2) * 10) / 10;
    return [{ hours: half }, { hours: +(totalHours - half).toFixed(1) }];
  });
  const [saving, setSaving] = useState(false);

  const sum = blocks.reduce((t, b) => t + (b.hours || 0), 0);
  const isValid = blocks.length >= 2 && blocks.every((b) => b.hours > 0) && Math.abs(sum - totalHours) < 0.01;

  const updateBlock = (i, val) => {
    const v = parseFloat(val) || 0;
    setBlocks((prev) => prev.map((b, idx) => idx === i ? { hours: v } : b));
  };

  const addBlock = () => {
    setBlocks((prev) => [...prev, { hours: 0 }]);
  };

  const removeBlock = (i) => {
    if (blocks.length <= 2) return;
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSplit = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSplit(blocks);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,.3)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.card, borderRadius: 12, padding: 24, width: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,.15)", border: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Split Job</div>
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>
          {opp.typeOfWork || opp.name} — {totalHours}h total
        </div>

        {/* Block rows */}
        <div style={{ marginBottom: 12 }}>
          {blocks.map((block, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.muted, width: 48, flexShrink: 0 }}>Block {i + 1}</span>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={block.hours || ""}
                  onChange={(e) => updateBlock(i, e.target.value)}
                  style={{
                    flex: 1, minWidth: 0, padding: "6px 8px", fontSize: 13, border: `1px solid ${C.border}`,
                    borderRadius: 6, outline: "none", fontFamily: "inherit", color: C.text,
                    background: C.bg, boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                />
                <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>hrs</span>
              </div>
              <button onClick={() => removeBlock(i)} style={{
                background: "none", border: "none", color: blocks.length > 2 ? C.muted : "transparent", cursor: blocks.length > 2 ? "pointer" : "default",
                fontSize: 16, padding: "0 2px", lineHeight: 1, flexShrink: 0, width: 20, textAlign: "center",
                pointerEvents: blocks.length > 2 ? "auto" : "none",
              }}
                onMouseEnter={(e) => { if (blocks.length > 2) e.currentTarget.style.color = "#EF4444"; }}
                onMouseLeave={(e) => { if (blocks.length > 2) e.currentTarget.style.color = C.muted; }}
              >{blocks.length > 2 ? "×" : ""}</button>
            </div>
          ))}
        </div>

        {/* Add block */}
        <button onClick={addBlock} style={{
          width: "100%", padding: "6px 0", fontSize: 12, color: C.blue, background: C.blueLight,
          border: `1px dashed ${C.blue}`, borderRadius: 6, cursor: "pointer", fontWeight: 500, marginBottom: 12,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.blueLight)}
        >+ Add Block</button>

        {/* Running total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "8px 10px", background: isValid ? "#D1FAE5" : sum > totalHours ? "#FEE2E2" : C.bg, borderRadius: 6, border: `1px solid ${isValid ? "#6EE7B7" : sum > totalHours ? "#FECACA" : C.border}` }}>
          <span style={{ fontSize: 12, color: C.sub }}>{isValid ? "✓ Ready" : `${Math.abs(+(totalHours - sum).toFixed(1))}h ${sum > totalHours ? "over" : "remaining"}`}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: isValid ? "#059669" : sum > totalHours ? "#DC2626" : C.text }}>
            {sum}h / {totalHours}h
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "9px 12px", background: C.bg, color: C.sub,
            border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSplit} disabled={!isValid || saving} style={{
            flex: 2, padding: "9px 16px",
            background: isValid && !saving ? "#7C3AED" : C.borderLight,
            color: isValid && !saving ? "#fff" : C.muted,
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: isValid && !saving ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
            onMouseEnter={(e) => { if (isValid && !saving) e.currentTarget.style.background = "#6D28D9"; }}
            onMouseLeave={(e) => { if (isValid && !saving) e.currentTarget.style.background = "#7C3AED"; }}
          >
            <ScissorsIcon size={12} color={isValid && !saving ? "#fff" : C.muted} />
            {saving ? "Splitting…" : `Split into ${blocks.length} blocks`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ────────────────────────────────────────────────────────
function DetailPanel({ entry, opp, user, crewMembers, alloc, schedule, onClose, onComplete, onPutOnHold, onSplit, onReschedule, locationId }) {
  if (!entry || !opp) return null;
  const [holdReason, setHoldReason] = useState("");
  const [showHold, setShowHold] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const noteRef = useRef(null);
  const [savingNote, setSavingNote] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingCrew, setEditingCrew] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const isContinuous = opp.schedulingType?.toLowerCase() === "continuous";
  const isEditable = entry.status === "scheduled";

  // Split-related info
  const isSplitBlock = !!entry.splitGroupId;
  const splitSiblings = isSplitBlock ? (schedule || []).filter((s) => s.splitGroupId === entry.splitGroupId) : [];
  const splitTotal = splitSiblings.length;
  const splitNonCompleted = splitSiblings.filter((s) => s.status !== "completed");
  const isLastSplitBlock = isSplitBlock && splitNonCompleted.length === 1 && splitNonCompleted[0].id === entry.id;
  const canSplit = !isContinuous && isEditable && entry.status !== "unscheduled";

  const handleAddNote = async () => {
    const noteText = noteRef.current?.value?.trim();
    if (!noteText || !opp.contactId) return;
    setSavingNote(true);
    try {
      const createdNote = await createNote(opp.id, opp.contactId, noteText);
      setNotes((prev) => [{
        body: createdNote?.body || noteText,
        dateAdded: createdNote?.dateAdded || new Date().toISOString(),
        source: "contact",
        authorName: null,
      }, ...prev]);
      if (noteRef.current) noteRef.current.value = "";
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Failed to add note: " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoadingExtra(true);
    Promise.allSettled([
      fetchOpportunityDetail(entry.oppId),
      fetchScheduleActivity(entry.oppId),
    ]).then(([detailResult, actResult]) => {
      if (cancelled) return;
      if (detailResult.status === "fulfilled" && detailResult.value?.notes) {
        setNotes(detailResult.value.notes);
      }
      if (actResult.status === "fulfilled") {
        setActivity(actResult.value);
      }
      setLoadingExtra(false);
    });
    return () => { cancelled = true; };
  }, [entry.oppId]);

  const fmtTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const Sec = ({ title, icon, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
        {icon}{title}
      </div>
      {children}
    </div>
  );
  const Box = ({ label, value }) => (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px" }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{value}</div>
    </div>
  );

  return (
    <div
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, background: C.card, borderLeft: `1px solid ${C.border}`, boxShadow: "-4px 0 16px rgba(0,0,0,.08)", zIndex: 50, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: ".03em" }}>{opp.typeOfWork || "Job"}</span>
            {isContinuous && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, background: "#FEF3C7", color: "#92400E", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>
                <LockIcon size={8} color="#92400E" /> CONTINUOUS
              </span>
            )}
            {opp.needsMaterials && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, background: "#DBEAFE", color: "#1E40AF", padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>
                <MaterialIcon size={8} /> MATERIALS
              </span>
            )}
          </div>
          <a
            href={`${getHlAppOrigin()}/v2/location/${locationId}/opportunities/list/${opp.id}?tab=Opportunity+Details`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 16, fontWeight: 600, color: C.text, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.blue; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.text; }}
          >
            {opp.contactName || opp.name}
            <ExternalLinkIcon size={13} />
          </a>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: C.muted, cursor: "pointer", padding: "2px 6px", borderRadius: 4 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.borderLight)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke={C.muted} strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Scrollable top — Contact, Address, Schedule — shrinks on small screens */}
        <div className="hide-scrollbar" style={{ padding: "16px 20px 0", overflow: "auto", flexShrink: 1 }}>
        <Sec title="Contact">
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: C.text }}>
            <span><span style={{ color: C.muted }}>Ph: </span>{opp.contactPhone || "—"}</span>
            <span><span style={{ color: C.muted }}>Em: </span>{opp.contactEmail || "—"}</span>
          </div>
        </Sec>
        {(opp.projectAddress || opp.projectCity) && (
          <Sec title="Project Address">
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, fontSize: 12, color: C.text }}>
                {[opp.projectAddress, [opp.projectCity, opp.projectState].filter(Boolean).join(", "), opp.projectZip].filter(Boolean).join(", ")}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([opp.projectAddress, opp.projectCity, opp.projectState, opp.projectZip].filter(Boolean).join(", "))}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Maps"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, background: C.card, border: `1px solid ${C.border}`, color: C.blue, cursor: "pointer", flexShrink: 0, transition: "all .15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.border; }}
              >
                <MapPinIcon size={13} color={C.blue} />
              </a>
            </div>
          </Sec>
        )}
        <Sec title="Schedule">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {/* Start Date — inline editable */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", cursor: isEditable ? "pointer" : "default" }}
              onClick={() => { if (isEditable) setEditingDate(true); }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>Start Date</div>
              {editingDate ? (
                <input
                  type="date"
                  defaultValue={entry.startDate}
                  autoFocus
                  style={{ fontSize: 12, fontWeight: 500, color: C.text, border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit" }}
                  onBlur={(e) => {
                    setEditingDate(false);
                    if (e.target.value && e.target.value !== entry.startDate) {
                      onReschedule(entry, null, e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.target.blur();
                    if (e.key === "Escape") { setEditingDate(false); }
                  }}
                />
              ) : (
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, display: "flex", alignItems: "center", gap: 4 }}>
                  {entry.startDate ? fmtFriendly(entry.startDate) : "Not scheduled"}
                  {isEditable && <span style={{ fontSize: 10, color: C.muted }}>✎</span>}
                </div>
              )}
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>
                  {isSplitBlock ? `Block ${(entry.splitIndex ?? 0) + 1}/${splitTotal}` : "Total Duration"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>
                  {isSplitBlock
                    ? (() => {
                        const completedH = splitSiblings.filter((s) => s.status === "completed").reduce((t, s) => t + (s.durationHours || 0), 0);
                        const remaining = (opp.estDurationHours || 0) - completedH - (entry.durationHours || 0);
                        return `${entry.durationHours}h — ${remaining > 0 ? `${remaining}h remaining` : "last block"}`;
                      })()
                    : hLabel(opp.estDurationHours)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {!isSplitBlock && alloc && alloc.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setShowBreakdown((v) => !v); }}
                    title={showBreakdown ? "Hide day breakdown" : "Show day breakdown"}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 26, height: 26, borderRadius: 6,
                      background: showBreakdown ? C.blueLight : C.card,
                      border: `1px solid ${showBreakdown ? C.blue : C.border}`,
                      color: showBreakdown ? C.blue : C.sub,
                      fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                      transition: "all .15s", lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
                    onMouseLeave={(e) => { if (!showBreakdown) { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; } }}
                  >i</span>
                )}
                {canSplit && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setShowSplit(true); }}
                    title="Split into blocks"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 26, height: 26, borderRadius: 6,
                      background: C.card, border: `1px solid #C4B5FD`,
                      color: "#7C3AED", cursor: "pointer", flexShrink: 0,
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#EDE9FE"; e.currentTarget.style.borderColor = "#7C3AED"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = "#C4B5FD"; }}
                  ><ScissorsIcon size={12} color="#7C3AED" /></span>
                )}
              </div>
            </div>
            {/* Assigned To — inline editable */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", cursor: isEditable ? "pointer" : "default" }}
              onClick={() => { if (isEditable && !editingCrew) setEditingCrew(true); }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>Assigned To</div>
              {editingCrew ? (
                <select
                  defaultValue={entry.userId}
                  autoFocus
                  style={{ fontSize: 12, fontWeight: 500, color: C.text, border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit", cursor: "pointer" }}
                  onChange={(e) => {
                    setEditingCrew(false);
                    if (e.target.value && e.target.value !== entry.userId) {
                      onReschedule(entry, e.target.value, null);
                    }
                  }}
                  onBlur={() => setEditingCrew(false)}
                >
                  {crewMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, display: "flex", alignItems: "center", gap: 4 }}>
                  {user?.name || "—"}
                  {isEditable && <span style={{ fontSize: 10, color: C.muted }}>✎</span>}
                </div>
              )}
            </div>
            <div style={{
              background: isContinuous ? "#FEF3C7" : C.bg,
              border: `1px solid ${isContinuous ? C.orangeBorder : C.border}`,
              borderRadius: 6, padding: "5px 10px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>Type</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: isContinuous ? "#92400E" : C.sub, display: "flex", alignItems: "center", gap: 4 }}>
                {isContinuous
                  ? <><LockIcon size={10} color="#92400E" /> Continuous</>
                  : <><ScissorsIcon size={10} color={C.sub} /> Splittable</>}
              </div>
            </div>
          </div>
          {showBreakdown && alloc && alloc.length > 1 && (
            <div style={{ marginTop: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.sub, marginBottom: 4 }}>Day Breakdown</div>
              {alloc.map((a, i) => (
                <div key={i} style={{ fontSize: 11, color: C.text, display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
                  <span style={{ color: C.sub }}>{fmtFriendly(a.date)}</span>
                  <span style={{ fontWeight: 500 }}>{a.hours}h</span>
                </div>
              ))}
            </div>
          )}
        </Sec>
        </div>{/* end scrollable top */}

        {/* Flexible middle — Notes section (chat-style: messages above, input below) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 20px", minHeight: 120 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <NoteIcon size={11} color={C.muted} />Notes
          </div>
          {/* Notes card — sizes to fill space, content scrolls inside */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {loadingExtra ? (
              <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", padding: "12px 0" }}>Loading notes…</div>
            ) : notes.length === 0 ? (
              <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px", fontSize: 12, color: C.muted }}>No notes yet</div>
            ) : (
              <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
                <div className="hide-scrollbar" style={{ flex: 1, overflow: "auto", padding: "2px 10px" }}>
                  {notes.map((note, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: i < notes.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ fontSize: 13, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{note.body}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 500, color: C.muted }}>{fmtTimestamp(note.dateAdded)}</span>
                        {note.source && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                            background: note.source === "opportunity" ? "#DBEAFE" : "transparent",
                            color: note.source === "opportunity" ? "#1E40AF" : C.muted,
                          }}>
                            {note.source === "opportunity" ? "Opp" : "Contact"}
                          </span>
                        )}
                        {note.authorName && (
                          <span style={{ fontSize: 10, color: C.sub, fontWeight: 500 }}>{note.authorName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Bottom fade inside card */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, background: `linear-gradient(transparent, ${C.bg})`, pointerEvents: "none", borderRadius: "0 0 7px 7px" }} />
              </div>
            )}
          </div>
          {/* Note input — pinned to bottom like a chat input */}
          {opp.contactId && (
            <div style={{ flexShrink: 0, paddingTop: 8, paddingBottom: 12 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <textarea
                  ref={noteRef}
                  defaultValue=""
                  placeholder="Add a note..."
                  rows={1}
                  style={{
                    flex: 1, padding: "7px 10px", fontSize: 12, border: `1px solid ${C.border}`,
                    borderRadius: 8, resize: "none", outline: "none", fontFamily: "inherit",
                    boxSizing: "border-box", background: C.bg, color: C.text, lineHeight: 1.4,
                    minHeight: 34, maxHeight: 80, overflow: "auto",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                  onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote();
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote}
                  title="Add note (Cmd+Enter)"
                  style={{
                    padding: "0 14px", fontSize: 11, fontWeight: 600, borderRadius: 8,
                    background: savingNote ? C.borderLight : C.blue,
                    color: savingNote ? C.muted : "#fff",
                    border: "none", cursor: savingNote ? "default" : "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { if (!savingNote) e.currentTarget.style.background = "#2563EB"; }}
                  onMouseLeave={(e) => { if (!savingNote) e.currentTarget.style.background = C.blue; }}
                >
                  {savingNote ? "…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>{/* end notes section */}

        {/* Fixed bottom — Activity section */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.border}`, padding: "10px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <ClockIcon size={11} color={C.muted} />Activity
          </div>
          <div style={{ maxHeight: 80, overflow: "hidden", position: "relative" }}>
            <div className="hide-scrollbar" style={{ overflow: "auto", maxHeight: 80 }}>
              {loadingExtra ? (
                <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Loading activity…</div>
              ) : activity.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>No activity recorded</div>
              ) : (
                <div style={{ position: "relative", paddingLeft: 20, paddingBottom: 16 }}>
                  <div style={{ position: "absolute", left: 6, top: 4, bottom: 4, width: 1, background: C.border }} />
                  {activity.map((act, i) => {
                    const info = activityIcons[act.action] || { icon: "•", color: C.muted };
                    return (
                      <div key={i} style={{ position: "relative", marginBottom: 10 }}>
                        <div style={{ position: "absolute", left: -17, top: 2, width: 13, height: 13, borderRadius: "50%", background: info.color, color: "#fff", fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {info.icon}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 1 }}>{fmtTimestamp(act.createdAt)}</div>
                        <div style={{ fontSize: 11, color: C.text }}>
                          {act.description}
                          {act.performedBy && act.performedBy !== "System" && (
                            <span style={{ color: C.sub }}> by {act.performedBy}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Bottom fade overlay */}
            {!loadingExtra && activity.length > 0 && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: "linear-gradient(transparent, white)", pointerEvents: "none" }} />
            )}
          </div>
        </div>{/* end activity section */}
      </div>
      {entry.status !== "unscheduled" && entry.status !== "completed" && <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}` }}>
        {showHold ? (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Reason (optional)</div>
            <input value={holdReason} onChange={(e) => setHoldReason(e.target.value)}
              placeholder="e.g. Materials delayed, customer emergency..."
              style={{ width: "100%", padding: "8px 10px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 8, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.orange)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowHold(false)} style={{ flex: 1, padding: "8px 12px", background: C.bg, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => onPutOnHold(entry, holdReason)} style={{ flex: 1, padding: "8px 12px", background: C.orange, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D97706")}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.orange)}>
                <PauseIcon size={11} color="#fff" /> Put on Hold
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowHold(true)} style={{ flex: 1, padding: "9px 12px", background: C.bg, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.orangeLight; e.currentTarget.style.borderColor = C.orangeBorder; e.currentTarget.style.color = "#92400E"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}>
              <PauseIcon size={11} /> {isSplitBlock ? "Hold Remaining" : "Hold"}
            </button>
            <button onClick={() => onComplete(entry)} style={{ flex: 2, padding: "9px 16px", background: C.green, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#059669")}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.green)}>
              <CheckIcon size={14} /> {isSplitBlock ? (isLastSplitBlock ? "Complete Job" : "Complete Block") : "Mark Complete"}
            </button>
          </div>
        )}
      </div>}

      {/* Split Dialog */}
      {showSplit && <SplitDialog
        opp={opp}
        entry={entry}
        onClose={() => setShowSplit(false)}
        onSplit={(blocks) => { onSplit(entry, blocks); setShowSplit(false); }}
      />}
    </div>
  );
}

// ── Avatar Component ─────────────────────────────────────────────────────
function Avatar({ member, size = 32, editable = false, onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const initials = (member.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (onUpload) onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleClick = () => {
    if (!editable) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => handleFile(e.target.files?.[0]);
    input.click();
  };

  const baseStyle = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.38, fontWeight: 600, overflow: "hidden",
    cursor: editable ? "pointer" : "default",
    border: dragOver ? `2px dashed ${C.blue}` : "2px solid transparent",
    transition: "border-color .15s",
  };

  if (member.avatarUrl && !imgError) {
    return (
      <div
        style={{ ...baseStyle, background: C.bg }}
        onClick={handleClick}
        onDragOver={editable ? (e) => { e.preventDefault(); setDragOver(true); } : undefined}
        onDragLeave={editable ? () => setDragOver(false) : undefined}
        onDrop={editable ? handleDrop : undefined}
        title={editable ? "Click or drag to change avatar" : member.name}
      >
        <img
          src={member.avatarUrl}
          alt={member.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ ...baseStyle, background: member.color, color: "#fff" }}
      onClick={handleClick}
      onDragOver={editable ? (e) => { e.preventDefault(); setDragOver(true); } : undefined}
      onDragLeave={editable ? () => setDragOver(false) : undefined}
      onDrop={editable ? handleDrop : undefined}
      title={editable ? "Click or drag to add avatar" : member.name}
    >
      {initials}
    </div>
  );
}

// ── Settings Panel ───────────────────────────────────────────────────────
function SettingsPanel({ crewMembers, crewBilling, onClose, onCrewChange, flash, settings, onSettingsChange }) {
  const [activeTab, setActiveTab] = useState("crew");

  // ── Crew tab state ──
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ name: "", phone: "", email: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Working Days tab state ──
  const [workingDays, setWorkingDays] = useState(settings?.workingDays || [1, 2, 3, 4, 5]);
  const [daysSaving, setDaysSaving] = useState(false);

  // ── Reminder tab state ──
  const [reminder, setReminder] = useState({
    name: settings?.reminderName || "",
    phone: settings?.reminderPhone || "",
    email: settings?.reminderEmail || "",
    methods: settings?.reminderMethods || ["sms", "email"],
    time: settings?.reminderTime || "08:00",
    enabled: settings?.reminderEnabled || false,
  });
  const [reminderSaving, setReminderSaving] = useState(false);

  const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // ── Crew handlers ──
  const startEdit = (member) => {
    setEditId(member.id);
    setDeleteConfirmId(null);
    setEditForm({ name: member.name, phone: member.phone || "", email: member.email || "", color: member.color });
  };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const handleSave = async () => {
    if (!editForm.name?.trim()) return;
    setSaving(true);
    try {
      await updateCrewMember(editId, { name: editForm.name.trim(), phone: editForm.phone || null, email: editForm.email || null, color: editForm.color });
      await onCrewChange();
      setEditId(null);
      flash("Crew member updated");
    } catch (err) { console.error(err); flash("Failed to update member"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) { setDeleteConfirmId(id); return; }
    setSaving(true);
    try {
      await deleteCrewMember(id);
      await onCrewChange();
      setDeleteConfirmId(null); setEditId(null);
      flash("Crew member removed");
    } catch (err) { console.error(err); flash("Failed to remove member"); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.name?.trim()) return;
    setSaving(true);
    try {
      await addCrewMember({ name: addForm.name.trim(), phone: addForm.phone || null, email: addForm.email || null });
      await onCrewChange();
      setAddForm({ name: "", phone: "", email: "" });
      setShowAdd(false);
      flash("Crew member added");
    } catch (err) { console.error(err); flash("Failed to add member"); }
    finally { setSaving(false); }
  };

  // ── Working Days handler ──
  const toggleDay = (dayNum) => {
    setWorkingDays((prev) => prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort());
  };

  const saveWorkingDays = async () => {
    setDaysSaving(true);
    try {
      await updateSettings({ workingDays });
      onSettingsChange({ ...settings, workingDays });
      flash("Working days updated");
    } catch (err) { console.error(err); flash("Failed to save working days"); }
    finally { setDaysSaving(false); }
  };

  // ── Reminder handler ──
  const toggleMethod = (m) => {
    setReminder((prev) => ({
      ...prev,
      methods: prev.methods.includes(m) ? prev.methods.filter((x) => x !== m) : [...prev.methods, m],
    }));
  };

  const saveReminder = async () => {
    setReminderSaving(true);
    try {
      await updateSettings({
        reminderName: reminder.name,
        reminderPhone: reminder.phone,
        reminderEmail: reminder.email,
        reminderMethods: reminder.methods,
        reminderTime: reminder.time,
        reminderEnabled: reminder.enabled,
      });
      onSettingsChange({
        ...settings,
        reminderName: reminder.name,
        reminderPhone: reminder.phone,
        reminderEmail: reminder.email,
        reminderMethods: reminder.methods,
        reminderTime: reminder.time,
        reminderEnabled: reminder.enabled,
      });
      flash("Reminder settings saved");
    } catch (err) { console.error(err); flash("Failed to save reminder"); }
    finally { setReminderSaving(false); }
  };

  const inputStyle = {
    width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`,
    borderRadius: 6, outline: "none", boxSizing: "border-box", background: C.card, color: C.text,
  };

  const tabs = [
    { id: "crew", label: "Crew", icon: HardhatIcon, color: C.blue },
    { id: "days", label: "Working Days", icon: CalendarIcon, color: "#10B981" },
    { id: "reminder", label: "Reminder", icon: AlertIcon, color: "#F59E0B" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.25)" }} />
      <div style={{
        position: "relative", background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,.12)", width: 620, height: 580,
        display: "flex", overflow: "hidden",
      }}>
        {/* Vertical tabs */}
        <div style={{ width: 170, minWidth: 170, background: C.bg, borderRight: `1px solid ${C.border}`, padding: "20px 0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 20px 20px", fontSize: 15, fontWeight: 600, color: C.text }}>Settings</div>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "11px 20px", background: active ? C.card : "transparent",
                  border: "none", borderRight: active ? `2px solid ${tab.color}` : "2px solid transparent",
                  cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? C.text : C.sub, transition: "all .15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.borderLight; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <Icon size={16} color={active ? tab.color : C.muted} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
              {activeTab === "crew" ? "Crew Members" : activeTab === "days" ? "Working Days" : "Schedule Reminder"}
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "4px 6px", borderRadius: 4 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.borderLight)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke={C.muted} strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* ── CREW TAB ── */}
          {activeTab === "crew" && (
            <>
              <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
                {crewMembers.length === 0 && !showAdd && (
                  <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "24px 0" }}>
                    No crew members yet. Add your first one below.
                  </div>
                )}

                {crewMembers.map((member) => (
                  <div key={member.id} style={{ border: `1px solid ${editId === member.id ? C.blue : C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 10, background: editId === member.id ? C.blueLight : C.card }}>
                    {editId === member.id ? (
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>NAME</div>
                          <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>PHONE</div>
                            <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="optional"
                              onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>EMAIL</div>
                            <input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="optional"
                              onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 5 }}>COLOR</div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {CREW_COLORS.map((col) => (
                              <button key={col} onClick={() => setEditForm((f) => ({ ...f, color: col }))}
                                style={{ width: 22, height: 22, borderRadius: "50%", background: col, border: editForm.color === col ? "2px solid #111827" : "2px solid transparent", cursor: "pointer", padding: 0 }} />
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button onClick={cancelEdit} style={{ flex: 1, padding: "7px 10px", background: C.bg, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                          <button onClick={handleSave} disabled={saving || !editForm.name?.trim()} style={{ flex: 2, padding: "7px 10px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                            {saving ? "Saving…" : "Save Changes"}
                          </button>
                          <button onClick={() => handleDelete(member.id)} disabled={saving}
                            style={{ padding: "7px 10px", background: deleteConfirmId === member.id ? "#EF4444" : C.bg, color: deleteConfirmId === member.id ? "#fff" : "#EF4444", border: `1px solid ${deleteConfirmId === member.id ? "#EF4444" : "#FECACA"}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                            {deleteConfirmId === member.id ? "Confirm" : "Delete"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar member={member} size={32} editable onUpload={async (file) => {
                          try { await uploadCrewAvatar(member.id, file); await onCrewChange(); flash("Avatar updated"); }
                          catch (err) { console.error(err); flash("Failed to upload avatar"); }
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{member.name}</div>
                          {(member.phone || member.email) && (
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                              {member.phone && <span>{member.phone}</span>}
                              {member.phone && member.email && <span style={{ margin: "0 4px" }}>·</span>}
                              {member.email && <span>{member.email}</span>}
                            </div>
                          )}
                        </div>
                        <button onClick={() => startEdit(member)} style={{ fontSize: 11, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: "3px 6px", borderRadius: 4 }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.blueLight)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {showAdd ? (
                  <div style={{ border: `1px solid ${C.blue}`, borderRadius: 8, padding: "10px 12px", background: C.blueLight }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.blue, marginBottom: 8 }}>NEW CREW MEMBER</div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>NAME *</div>
                      <input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. John Smith" style={inputStyle} autoFocus
                        onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>PHONE</div>
                        <input value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} placeholder="optional" style={inputStyle}
                          onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 3 }}>EMAIL</div>
                        <input value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} placeholder="optional" style={inputStyle}
                          onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setShowAdd(false); setAddForm({ name: "", phone: "", email: "" }); }}
                        style={{ flex: 1, padding: "7px 10px", background: C.bg, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
                      <button onClick={handleAdd} disabled={saving || !addForm.name.trim()}
                        style={{ flex: 2, padding: "7px 10px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving || !addForm.name.trim() ? 0.6 : 1 }}>
                        {saving ? "Adding…" : "Add Member"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowAdd(true); setEditId(null); }}
                    style={{ width: "100%", padding: "9px 12px", background: C.bg, color: C.blue, border: `1px dashed ${C.blue}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.blueLight)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = C.bg)}>
                    + Add Crew Member
                  </button>
                )}
              </div>

              {/* Billing footer */}
              {crewBilling && (
                <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
                  <div style={{ fontSize: 11, color: C.sub }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{crewBilling.total}</span> crew member{crewBilling.total !== 1 ? "s" : ""}
                    {" · "}
                    <span style={{ color: crewBilling.paid > 0 ? C.orange : C.green, fontWeight: 600 }}>
                      {crewBilling.paid > 0 ? `${crewBilling.paid} paid ($${crewBilling.monthlyCost}/mo)` : `${Math.min(crewBilling.total, crewBilling.free)} of ${crewBilling.free} free`}
                    </span>
                  </div>
                  {crewBilling.total < crewBilling.free && (
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{crewBilling.free - crewBilling.total} free slot{crewBilling.free - crewBilling.total !== 1 ? "s" : ""} remaining · Additional members $10/mo</div>
                  )}
                  {crewBilling.total >= crewBilling.free && crewBilling.paid === 0 && (
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Additional members $10/mo each</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── WORKING DAYS TAB ── */}
          {activeTab === "days" && (
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>
                Select the days of the week that jobs can be scheduled on. The allocation engine will skip non-working days when spreading multi-day jobs.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DAY_LABELS.map((label, i) => {
                  const checked = workingDays.includes(i);
                  return (
                    <label key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                      background: checked ? C.blueLight : C.card, border: `1px solid ${checked ? C.blue : C.border}`,
                      borderRadius: 8, cursor: "pointer", transition: "all .15s",
                    }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleDay(i)}
                        style={{ width: 16, height: 16, accentColor: C.blue, cursor: "pointer" }} />
                      <span style={{ fontSize: 13, fontWeight: checked ? 600 : 500, color: checked ? C.text : C.sub }}>{label}</span>
                      {(i === 0 || i === 6) && <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>Weekend</span>}
                    </label>
                  );
                })}
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveWorkingDays} disabled={daysSaving}
                  style={{ padding: "9px 24px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: daysSaving ? 0.7 : 1 }}>
                  {daysSaving ? "Saving…" : "Save Working Days"}
                </button>
              </div>
            </div>
          )}

          {/* ── REMINDER TAB ── */}
          {activeTab === "reminder" && (
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              <div style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>
                Set up a reminder to go out if the schedule hasn't been sent (Notify Crews hasn't been clicked) by a certain time.
              </div>

              {/* Enable toggle */}
              <label style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 20,
                background: reminder.enabled ? "#FFF7ED" : C.card, border: `1px solid ${reminder.enabled ? C.orange : C.border}`,
                borderRadius: 8, cursor: "pointer",
              }}>
                <input type="checkbox" checked={reminder.enabled} onChange={(e) => setReminder((r) => ({ ...r, enabled: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: C.orange, cursor: "pointer" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: reminder.enabled ? C.text : C.sub }}>Enable schedule reminder</span>
              </label>

              <div style={{ opacity: reminder.enabled ? 1 : 0.5, pointerEvents: reminder.enabled ? "auto" : "none" }}>
                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".03em" }}>Recipient Name</div>
                  <input value={reminder.name} onChange={(e) => setReminder((r) => ({ ...r, name: e.target.value }))} placeholder="e.g. John Smith" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                </div>

                {/* Phone & Email */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".03em" }}>Phone</div>
                    <input value={reminder.phone} onChange={(e) => setReminder((r) => ({ ...r, phone: e.target.value }))} placeholder="+1 (555) 123-4567" style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".03em" }}>Email</div>
                    <input value={reminder.email} onChange={(e) => setReminder((r) => ({ ...r, email: e.target.value }))} placeholder="john@company.com" style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                  </div>
                </div>

                {/* Notification methods */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 7, textTransform: "uppercase", letterSpacing: ".03em" }}>Notification Method</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[{ id: "sms", label: "SMS" }, { id: "email", label: "Email" }].map((m) => {
                      const active = reminder.methods.includes(m.id);
                      return (
                        <button key={m.id} onClick={() => toggleMethod(m.id)}
                          style={{
                            flex: 1, padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            background: active ? C.blueLight : C.card, color: active ? C.blue : C.sub,
                            border: `1px solid ${active ? C.blue : C.border}`, transition: "all .15s",
                          }}>
                          {active ? "✓ " : ""}{m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".03em" }}>Send Reminder If Not Sent By</div>
                  <input type="time" value={reminder.time} onChange={(e) => setReminder((r) => ({ ...r, time: e.target.value }))}
                    style={{ ...inputStyle, width: 160 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)} onBlur={(e) => (e.currentTarget.style.borderColor = C.border)} />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                    If "Notify Crews" hasn't been clicked by this time, a reminder will be sent.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveReminder} disabled={reminderSaving}
                  style={{ padding: "9px 24px", background: C.orange, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: reminderSaving ? 0.7 : 1 }}>
                  {reminderSaving ? "Saving…" : "Save Reminder"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────
export default function CrewScheduler({ crewMembers, crewBilling, stages, opportunities, scheduleEntries, pipelineId, locationId, onRefresh, onCrewChange }) {
  const [weekOff, setWeekOff] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [onHold, setOnHold] = useState([]);
  const [stageOverrides, setStageOverrides] = useState({});
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [notified, setNotified] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationSettings, setLocationSettings] = useState(null);

  // Load location settings on mount
  useEffect(() => {
    fetchSettings().then(setLocationSettings).catch(console.error);
  }, []);

  // Build a map of stage names to IDs
  const stageMap = useMemo(() => {
    const map = {};
    stages.forEach((s) => { map[s.name] = s.id; map[s.id] = s.name; });
    return map;
  }, [stages]);

  // Helper to optimistically update an opp's stage in local state
  const onUpdateOppStage = useCallback((oppId, newStageId) => {
    setStageOverrides((prev) => ({ ...prev, [oppId]: newStageId }));
  }, []);

  // Build a map of opp ID to opp for quick lookups (with local stage overrides applied)
  const oppsMap = useMemo(() => {
    const map = new Map();
    opportunities.forEach((o) => {
      const override = stageOverrides[o.id];
      map.set(o.id, override ? { ...o, stageId: override } : o);
    });
    return map;
  }, [opportunities, stageOverrides]);

  // Build crew color map
  const crewColorMap = useMemo(() => {
    const map = {};
    crewMembers.forEach((m) => { map[m.id] = m.color; });
    return map;
  }, [crewMembers]);

  // Initialize schedule and hold state from DB entries (runs once on load)
  // Only include entries assigned to current crew members — old HL user entries are stale
  const crewIds = useMemo(() => new Set(crewMembers.map((m) => m.id)), [crewMembers]);

  useMemo(() => {
    if (scheduleEntries.length === 0 && schedule.length > 0) return;

    const calendarEntries = [];
    const holdEntries = [];

    for (const entry of scheduleEntries) {
      if (entry.status === "on_hold") {
        holdEntries.push({ oppId: entry.oppId, reason: entry.holdReason || "" });
      } else if (entry.status === "scheduled" || entry.status === "in_progress" || entry.status === "completed") {
        // Skip entries assigned to old HL users that don't match any crew member
        if (crewIds.size > 0 && !crewIds.has(entry.userId)) continue;
        calendarEntries.push({
          id: entry.id,
          oppId: entry.oppId,
          userId: entry.userId,
          startDate: entry.startDate,
          status: entry.status,
          durationHours: entry.durationHours || null,
          splitGroupId: entry.splitGroupId || null,
          splitIndex: entry.splitIndex ?? null,
        });
      }
    }

    setSchedule(calendarEntries);
    setOnHold(holdEntries);
  }, [scheduleEntries, crewIds]);

  // Categorize opportunities by their pipeline stage for the queue
  // Uses oppsMap which includes local stage overrides
  const queueOpps = useMemo(() => {
    return [...oppsMap.values()].filter((opp) => {
      const stageName = stageMap[opp.stageId];
      return stageName === "Scheduling";
    });
  }, [oppsMap, stageMap]);

  const week = useMemo(() => getWeek(weekOff), [weekOff]);
  const today = fmt(new Date());

  // Filter queue items — exclude anything already on calendar (including completed) or on hold
  const schedIds = useMemo(() => new Set(schedule.map((s) => s.oppId)), [schedule]);
  const holdIds = useMemo(() => new Set(onHold.map((h) => h.oppId)), [onHold]);
  const unscheduled = useMemo(
    () => queueOpps.filter((o) => !schedIds.has(o.id) && !holdIds.has(o.id)),
    [queueOpps, schedIds, holdIds]
  );
  const holdItems = useMemo(
    () => onHold.map((h) => ({ ...h, opp: oppsMap.get(h.oppId) })).filter((h) => h.opp),
    [onHold, oppsMap]
  );
  const types = useMemo(() => [...new Set(opportunities.map((o) => o.typeOfWork).filter(Boolean))], [opportunities]);
  const filtered = filter === "All" ? unscheduled : unscheduled.filter((o) => o.typeOfWork === filter);

  const allocs = useMemo(() => computeDayAllocations(schedule, oppsMap, locationSettings?.workingDays), [schedule, oppsMap, locationSettings?.workingDays]);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      flash("Refreshed");
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, flash]);

  const handleDrop = useCallback((e, userId, dateStr) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");

    if (raw.startsWith("move:")) {
      const eid = raw.replace("move:", "");
      const entry = schedule.find((s) => s.id === eid);
      if (entry?.status === "completed") return; // can't move completed jobs
      setSchedule((p) => p.map((s) => s.id === eid ? { ...s, userId, startDate: dateStr } : s));
      setDragging(null);
      flash("Job rescheduled");
      setNotified(false);
      if (entry) {
        rescheduleJob(entry.oppId, userId, dateStr, entry.splitGroupId ? entry.id : undefined).catch((err) => {
          console.error("Failed to sync reschedule:", err);
          flash("Warning: HL sync failed");
        });
      }
      return;
    }

    if (raw.startsWith("hold:")) {
      const oppId = raw.replace("hold:", "");
      setOnHold((p) => p.filter((h) => h.oppId !== oppId));
      setSchedule((p) => [...p, { id: `s_${Date.now()}`, oppId, userId, startDate: dateStr, status: "scheduled" }]);
      setDragging(null);
      const opp = oppsMap.get(oppId);
      flash(`Scheduled: ${opp?.typeOfWork || opp?.name}`);
      setNotified(false);
      assignJob(oppId, pipelineId, userId, dateStr).catch((err) => {
        console.error("Failed to sync hold→schedule:", err);
        flash("Warning: HL sync failed");
      });
      return;
    }

    // New job from queue to calendar
    if (schedule.some((s) => s.oppId === raw)) return;
    setSchedule((p) => [...p, { id: `s_${Date.now()}`, oppId: raw, userId, startDate: dateStr, status: "scheduled" }]);
    setDragging(null);
    const opp = oppsMap.get(raw);
    flash(`Scheduled: ${opp?.typeOfWork || opp?.name}`);
    setNotified(false);
    assignJob(raw, pipelineId, userId, dateStr).catch((err) => {
      console.error("Failed to sync assign:", err);
      flash("Warning: HL sync failed");
    });
  }, [schedule, oppsMap, pipelineId, flash]);

  const handleComplete = useCallback((entry) => {
    if (entry.splitGroupId) {
      // Per-block completion for split jobs
      // Check if this is the last non-completed block
      const siblings = schedule.filter((s) => s.splitGroupId === entry.splitGroupId);
      const nonCompleted = siblings.filter((s) => s.status !== "completed");
      const isLastBlock = nonCompleted.length === 1 && nonCompleted[0].id === entry.id;

      if (isLastBlock) {
        // Last block: mark ALL blocks in the group as completed
        setSchedule((p) => p.map((s) => s.splitGroupId === entry.splitGroupId ? { ...s, status: "completed" } : s));
        const opp = oppsMap.get(entry.oppId);
        flash(`Completed: ${opp?.typeOfWork || opp?.name} (all blocks)`);
      } else {
        // Single block: mark only this one
        setSchedule((p) => p.map((s) => s.id === entry.id ? { ...s, status: "completed" } : s));
        const opp = oppsMap.get(entry.oppId);
        flash(`Block completed: ${opp?.typeOfWork || opp?.name}`);
      }
      setSelected(null);
      completeJob(entry.oppId, pipelineId, entry.id).catch((err) => {
        console.error("Failed to sync complete:", err);
        flash("Warning: HL sync failed");
      });
    } else {
      // Non-split job: mark as completed
      setSchedule((p) => p.map((s) => s.id === entry.id ? { ...s, status: "completed" } : s));
      setSelected(null);
      const opp = oppsMap.get(entry.oppId);
      flash(`Completed: ${opp?.typeOfWork || opp?.name}`);
      completeJob(entry.oppId, pipelineId).catch((err) => {
        console.error("Failed to sync complete:", err);
        flash("Warning: HL sync failed");
      });
    }
  }, [schedule, oppsMap, pipelineId, flash]);

  const handlePutOnHold = useCallback((entry, reason) => {
    const today = fmt(new Date());
    if (entry.splitGroupId) {
      // Split job: only hold future, non-completed blocks
      setSchedule((p) => p.filter((s) => {
        if (s.splitGroupId !== entry.splitGroupId) return true;
        // Keep past/completed blocks
        if (s.status === "completed" || s.startDate < today) return true;
        // Remove future non-completed blocks
        return false;
      }));
    } else {
      setSchedule((p) => p.filter((s) => s.id !== entry.id));
    }
    setOnHold((p) => [...p, { oppId: entry.oppId, reason }]);
    setSelected(null);
    const opp = oppsMap.get(entry.oppId);
    flash(`On hold: ${opp?.typeOfWork || opp?.name}`);
    setNotified(false);
    holdJob(entry.oppId, pipelineId, reason).catch((err) => {
      console.error("Failed to sync hold:", err);
      flash("Warning: HL sync failed");
    });
  }, [oppsMap, pipelineId, flash]);

  const handleRemoveHold = useCallback((oppId) => {
    setOnHold((p) => p.filter((h) => h.oppId !== oppId));
    const opp = oppsMap.get(oppId);
    flash(`Back to queue: ${opp?.typeOfWork || opp?.name}`);
    unholdJob(oppId, pipelineId).catch((err) => {
      console.error("Failed to sync unhold:", err);
      flash("Warning: HL sync failed");
    });
  }, [oppsMap, pipelineId, flash]);

  const handleSplit = useCallback(async (entry, blocks) => {
    try {
      const result = await splitJob(entry.oppId, entry.id, blocks);
      if (result.success && result.entries) {
        // Remove old entry (or old split group entries), add new split entries
        setSchedule((p) => {
          const filtered = entry.splitGroupId
            ? p.filter((s) => s.splitGroupId !== entry.splitGroupId)
            : p.filter((s) => s.id !== entry.id);
          const newEntries = result.entries.map((e) => ({
            id: e.id,
            oppId: e.oppId,
            userId: e.userId,
            startDate: e.startDate,
            status: e.status,
            durationHours: e.durationHours,
            splitGroupId: e.splitGroupId,
            splitIndex: e.splitIndex,
          }));
          return [...filtered, ...newEntries];
        });
        flash(`Split into ${blocks.length} blocks`);
        setSelected(null);
      }
    } catch (err) {
      console.error("Failed to split job:", err);
      flash("Failed to split job: " + err.message);
    }
  }, [flash]);

  // Drop a calendar job back onto the queue to unschedule it
  const handleQueueDrop = useCallback((e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw.startsWith("move:")) return;
    const eid = raw.replace("move:", "");
    const entry = schedule.find((s) => s.id === eid);
    if (!entry || entry.status === "completed") return;
    // Remove from calendar
    setSchedule((p) => p.filter((s) => s.id !== eid));
    // Also remove from on-hold in case it was held
    setOnHold((p) => p.filter((h) => h.oppId !== entry.oppId));
    // Optimistically move the opp back to the "Scheduling" stage in local state
    // so it reappears in the queue immediately
    const schedulingStageId = stageMap["Scheduling"];
    if (schedulingStageId) {
      onUpdateOppStage(entry.oppId, schedulingStageId);
    }
    setDragging(null);
    const opp = oppsMap.get(entry.oppId);
    flash(`Unscheduled: ${opp?.typeOfWork || opp?.name}`);
    setNotified(false);
    // Delete schedule entry + move back to Scheduling in HL
    unholdJob(entry.oppId, pipelineId).catch((err) => {
      console.error("Failed to sync unschedule:", err);
      flash("Warning: HL sync failed");
    });
  }, [schedule, oppsMap, pipelineId, flash, stageMap, onUpdateOppStage]);

  const dayMinW = 110;

  // Bottom bar week navigation: shows "‹ Previous Week" and "Next Week ›" when dragging
  const calendarRef = useRef(null);
  const weekNavTimer = useRef(null);
  const [weekNavHover, setWeekNavHover] = useState(null); // "prev" | "next" | null

  const weekNavDirRef = useRef(null);

  const handleWeekNavEnter = useCallback((dir) => {
    // Only start timer if we're entering a new zone (avoid resetting on continuous dragover)
    if (weekNavDirRef.current === dir) return;
    weekNavDirRef.current = dir;
    setWeekNavHover(dir);
    if (weekNavTimer.current) clearTimeout(weekNavTimer.current);
    weekNavTimer.current = setTimeout(() => {
      setWeekOff((w) => dir === "next" ? w + 1 : w - 1);
      weekNavTimer.current = null;
      weekNavDirRef.current = null;
      setWeekNavHover(null);
    }, 700);
  }, []);

  const handleWeekNavLeave = useCallback(() => {
    weekNavDirRef.current = null;
    setWeekNavHover(null);
    if (weekNavTimer.current) { clearTimeout(weekNavTimer.current); weekNavTimer.current = null; }
  }, []);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", color: C.text, fontSize: 14, padding: 10 }}>
     <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", height: "calc(100vh - 20px)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Crew Schedule</div>
          <div style={{ display: "flex", alignItems: "center", gap: 2, background: C.borderLight, borderRadius: 6, padding: 2, border: `1px solid ${C.border}` }}>
            {[["‹", () => setWeekOff((w) => w - 1)], ["Today", () => setWeekOff(0)], ["›", () => setWeekOff((w) => w + 1)]].map(([l, fn], i) => (
              <button key={i} onClick={fn} style={{ background: "transparent", border: "none", borderRadius: 4, padding: l.length > 1 ? "4px 12px" : "4px 8px", cursor: "pointer", fontSize: 13, fontWeight: 500, color: C.sub }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.border)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>{l}</button>
            ))}
          </div>
          <span style={{ fontSize: 13, color: C.sub }}>
            {week[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {week[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 4, fontSize: 11, color: C.muted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><LockIcon size={9} color={C.muted} /> continuous</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: C.orangeLight, border: `1px solid ${C.orangeBorder}` }} /> overtime</span>
          </div>
          {notified && <span style={{ fontSize: 11, color: C.green, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}><CheckIcon size={11} /> Sent</span>}
          <button onClick={() => { setNotified(true); flash("Crew leaders notified"); }} style={{
            padding: "7px 14px", background: notified ? C.card : C.blue, color: notified ? C.blue : "#fff",
            border: notified ? `1px solid ${C.blue}` : "1px solid transparent",
            borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s",
          }}
            onMouseEnter={(e) => { if (!notified) e.currentTarget.style.background = C.blueHover; }}
            onMouseLeave={(e) => { if (!notified) e.currentTarget.style.background = notified ? C.card : C.blue; }}>
            {notified ? "Resend to Crews" : "Notify Crews"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Queue — also a drop target to unschedule jobs */}
        <div
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = C.blueLight; }}
          onDragLeave={(e) => { e.currentTarget.style.background = C.card; }}
          onDrop={(e) => { e.currentTarget.style.background = C.card; handleQueueDrop(e); }}
          style={{ width: 240, minWidth: 240, borderRight: `1px solid ${C.border}`, background: C.card, display: "flex", flexDirection: "column", transition: "background .15s" }}>
          <div style={{ padding: "12px 12px 8px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
              Ready to Schedule ({filtered.length})
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid ${C.border}`, borderRadius: 6, background: C.card, color: C.text, outline: "none", cursor: "pointer" }}>
              <option value="All">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "0 12px 12px" }}>
            {filtered.length === 0 && <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>No jobs to schedule</div>}
            {filtered.map((o) => <QueueCard key={o.id} opp={o} onDragStart={setDragging} onDoubleClick={(opp) => setSelected({ id: null, oppId: opp.id, userId: null, startDate: null, status: "unscheduled" })} />)}

            {/* On Hold section */}
            {holdItems.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.orange, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <PauseIcon size={10} color={C.orange} /> On Hold ({holdItems.length})
                </div>
                {holdItems.map(({ opp, reason, oppId }) => (
                  <div key={oppId} draggable
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", `hold:${oppId}`); setDragging(oppId); }}
                    style={{ background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, padding: "8px 10px", marginBottom: 6, cursor: "grab", transition: "box-shadow .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 1 }}>{opp.typeOfWork || opp.name}</div>
                    <div style={{ fontSize: 11, color: C.sub, marginBottom: 2 }}>{opp.contactName || "—"}</div>
                    {reason && <div style={{ fontSize: 10, color: "#92400E", fontStyle: "italic", marginBottom: 4 }}>{reason}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.orange }}>{hLabel(opp.estDurationHours)}</span>
                      <button onClick={() => handleRemoveHold(oppId)} style={{ fontSize: 10, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: "2px 4px" }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>
                        Back to queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar footer — Settings & Refresh */}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
            <button onClick={() => setShowSettings(true)} title="Crew settings"
              style={{ flex: 1, padding: "8px 10px", background: showSettings ? C.blueLight : C.borderLight, border: `1px solid ${showSettings ? C.blue : C.border}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: showSettings ? C.blue : C.sub, fontSize: 12, fontWeight: 500, transition: "all .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
              onMouseLeave={(e) => { if (!showSettings) { e.currentTarget.style.background = C.borderLight; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; } }}>
              <GearIcon size={14} color="currentColor" /> Settings
            </button>
            <button onClick={handleRefresh} disabled={refreshing} title="Refresh data"
              style={{ padding: "8px 10px", background: C.borderLight, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.sub, fontSize: 12, fontWeight: 500, transition: "all .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.blueLight; e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.borderLight; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}>
              <RefreshIcon size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div ref={calendarRef} style={{ flex: 1, overflow: "auto", position: "relative" }}>
          <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 110, minWidth: 110, padding: "8px 12px", borderRight: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>Crew</span>
            </div>
            {week.map((d, i) => {
              const t = fmt(d) === today;
              return (
                <div key={i} style={{ flex: 1, minWidth: dayMinW, padding: "6px 0", borderRight: `1px solid ${C.border}`, textAlign: "center", background: t ? C.blueLight : "transparent" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: t ? C.blue : C.muted, textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div style={{ fontSize: 16, fontWeight: t ? 700 : 500, color: t ? C.blue : C.text }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {crewMembers.map((member) => (
            <div key={member.id} style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 110, minWidth: 110, padding: "12px 10px", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, background: C.card, minHeight: 100 }}>
                <Avatar member={member} size={32} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{member.name}</div>
              </div>
              {week.map((d, di) => {
                const ds = fmt(d);
                const isT = ds === today;
                const blocks = getBlocksForDate(member.id, ds, schedule, allocs, oppsMap);
                const totalH = getTotalHours(member.id, ds, schedule, allocs);
                const over = totalH > STD_HOURS;
                return (
                  <div key={di}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = C.blueLight; }}
                    onDragLeave={(e) => { e.currentTarget.style.background = over ? C.orangeLight : isT ? "rgba(59,130,246,.03)" : "transparent"; }}
                    onDrop={(e) => { e.currentTarget.style.background = over ? C.orangeLight : isT ? "rgba(59,130,246,.03)" : "transparent"; handleDrop(e, member.id, ds); }}
                    style={{
                      flex: 1, minWidth: dayMinW, borderRight: `1px solid ${C.border}`,
                      padding: "3px 3px", minHeight: 100,
                      background: over ? C.orangeLight : isT ? "rgba(59,130,246,.03)" : "transparent",
                      borderLeft: over ? `2px solid ${C.orangeBorder}` : "none",
                      transition: "background .1s",
                    }}>
                    {blocks.map((block, bi) => (
                      <DayBlock key={bi} block={block} color={member.color} onDoubleClick={setSelected} onDragStart={setDragging} />
                    ))}
                    {totalH > 0 && (
                      <div style={{ fontSize: 9, fontWeight: 600, textAlign: "right", padding: "0 2px", color: over ? "#92400E" : C.muted, marginTop: 1 }}>
                        {totalH}h{over ? ` / ${STD_HOURS}h` : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {crewMembers.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>
              No crew members yet. Click the <GearIcon size={13} color={C.muted} /> settings icon to add your crew.
            </div>
          )}

        </div>{/* end calendar scroll area */}

        {/* Week navigation bar — appears at bottom of calendar when dragging */}
        {dragging && (
          <div style={{
            display: "flex", borderTop: `1px solid ${C.border}`,
            animation: "edgePulse .2s ease-out", flexShrink: 0,
          }}>
            <div
              onDragOver={(e) => { e.preventDefault(); handleWeekNavEnter("prev"); }}
              onDragLeave={handleWeekNavLeave}
              onDrop={(e) => { e.preventDefault(); handleWeekNavLeave(); }}
              style={{
                flex: 1, padding: "10px 12px",
                background: weekNavHover === "prev" ? C.blueLight : C.card,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "default", transition: "all .15s",
                borderLeft: weekNavHover === "prev" ? `3px solid ${C.blue}` : "3px solid transparent",
              }}>
              <span style={{ fontSize: 18, color: weekNavHover === "prev" ? C.blue : C.sub, fontWeight: 600 }}>‹</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: weekNavHover === "prev" ? C.blue : C.sub }}>Previous Week</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); handleWeekNavEnter("next"); }}
              onDragLeave={handleWeekNavLeave}
              onDrop={(e) => { e.preventDefault(); handleWeekNavLeave(); }}
              style={{
                flex: 1, padding: "10px 12px",
                background: weekNavHover === "next" ? C.blueLight : C.card,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "default", transition: "all .15s",
                borderLeft: weekNavHover === "next" ? `3px solid ${C.blue}` : "3px solid transparent",
              }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: weekNavHover === "next" ? C.blue : C.sub }}>Next Week</span>
              <span style={{ fontSize: 18, color: weekNavHover === "next" ? C.blue : C.sub, fontWeight: 600 }}>›</span>
            </div>
          </div>
        )}

        </div>{/* end calendar column wrapper */}
      </div>

     </div>{/* end card wrapper */}

      {/* Detail panel */}
      {selected && (
          <>
            <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.2)", zIndex: 40 }} />
            <DetailPanel
              entry={selected}
              opp={oppsMap.get(selected.oppId)}
              user={crewMembers.find((m) => m.id === selected.userId)}
              crewMembers={crewMembers}
              alloc={allocs.get(selected.id)}
              schedule={schedule}
              onClose={() => setSelected(null)}
              onComplete={handleComplete}
              onPutOnHold={handlePutOnHold}
              onSplit={handleSplit}
              onReschedule={(entry, newUserId, newDate) => {
                if (entry.splitGroupId) {
                  // Split block: only update this specific entry
                  setSchedule((p) => p.map((s) => s.id === entry.id ? { ...s, userId: newUserId || s.userId, startDate: newDate || s.startDate } : s));
                } else {
                  setSchedule((p) => p.map((s) => s.oppId === entry.oppId ? { ...s, userId: newUserId || s.userId, startDate: newDate || s.startDate } : s));
                }
                setSelected((prev) => prev ? { ...prev, userId: newUserId || prev.userId, startDate: newDate || prev.startDate } : prev);
                flash("Job rescheduled");
                setNotified(false);
                rescheduleJob(entry.oppId, newUserId, newDate, entry.splitGroupId ? entry.id : undefined).catch((err) => {
                  console.error("Failed to sync reschedule:", err);
                  flash("Warning: HL sync failed");
                });
              }}
              locationId={locationId}
            />
          </>
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          crewMembers={crewMembers}
          crewBilling={crewBilling}
          onClose={() => setShowSettings(false)}
          onCrewChange={onCrewChange}
          flash={flash}
          settings={locationSettings}
          onSettingsChange={setLocationSettings}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1E293B", color: "#fff", fontSize: 13, fontWeight: 500, padding: "10px 20px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,.15)", zIndex: 100, animation: "su .2s ease" }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes su{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.hide-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.hide-scrollbar::-webkit-scrollbar{display:none}@keyframes edgePulse{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
