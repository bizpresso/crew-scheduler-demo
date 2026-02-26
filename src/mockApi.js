/**
 * Mock API — in-memory implementations of all API functions
 * used by CrewScheduler.jsx. No network calls are made.
 */

// ── Module-level state ──────────────────────────────────────────────────
let _settings = {
  workingDays: [1, 2, 3, 4, 5],
  reminderName: "Rick Gramlich",
  reminderPhone: "(410) 555-0001",
  reminderEmail: "rick@bizpresso.co",
  reminderMethods: ["sms", "email"],
  reminderTime: "08:00",
  reminderEnabled: true,
};

// Mock notes keyed by oppId
const _notes = {
  opp_1: [
    { body: "Customer confirmed they'll be home for the crew on Monday morning.", dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(), source: "contact", authorName: null },
    { body: "Materials ordered from ABC Supply, delivery confirmed for Friday.", dateAdded: new Date(Date.now() - 86400000 * 3).toISOString(), source: "opportunity", authorName: "Admin" },
  ],
  opp_3: [
    { body: "Old system is a Carrier 14 SEER. New 16 SEER unit is on site.", dateAdded: new Date(Date.now() - 86400000).toISOString(), source: "opportunity", authorName: "Admin" },
  ],
  opp_5: [
    { body: "Customer wants composite decking, not pressure treated. Budget approved.", dateAdded: new Date(Date.now() - 86400000 * 4).toISOString(), source: "contact", authorName: null },
    { body: "Permits submitted to county. Expected approval in 5 business days.", dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(), source: "opportunity", authorName: "Admin" },
    { body: "Site survey completed. Ground is level, no grading needed.", dateAdded: new Date(Date.now() - 86400000 * 7).toISOString(), source: "opportunity", authorName: "Admin" },
  ],
};

// Mock activity keyed by oppId
const _activity = {
  opp_1: [
    { action: "assigned", description: "Assigned to Mike Torres", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  opp_6: [
    { action: "assigned", description: "Assigned to Dave Rivera", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { action: "rescheduled", description: "Moved from Thursday to Wednesday", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  opp_3: [
    { action: "assigned", description: "Assigned to Carlos Martinez", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  ],
  opp_7: [
    { action: "assigned", description: "Assigned to Sarah Kim", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { action: "completed", description: "Job marked as completed", performedBy: "Admin", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  ],
};

// Avatar store (blob URLs from uploaded files)
const _avatars = {};

// ── Helpers ─────────────────────────────────────────────────────────────
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms + Math.random() * 150));
let _idCounter = 1000;
const genId = () => `demo_${_idCounter++}`;

// ── Exported mocks ──────────────────────────────────────────────────────

export async function assignJob(/* opportunityId, pipelineId, assignedTo, startDate */) {
  await delay(200);
  return { success: true };
}

export async function rescheduleJob(/* opportunityId, assignedTo, startDate, entryId */) {
  await delay(200);
  return { success: true };
}

export async function holdJob(/* opportunityId, pipelineId, reason */) {
  await delay(150);
  return { success: true };
}

export async function unholdJob(/* opportunityId, pipelineId */) {
  await delay(150);
  return { success: true };
}

export async function completeJob(/* opportunityId, pipelineId, entryId */) {
  await delay(200);
  return { success: true };
}

export async function splitJob(opportunityId, entryId, blocks) {
  await delay(300);
  const groupId = genId();
  const entries = blocks.map((block, i) => {
    // Compute start date: first block keeps original date, subsequent blocks
    // are computed by advancing working days (Mon-Fri)
    const baseDate = new Date();
    const dayOfWeek = baseDate.getDay();
    // Start from Monday of current week
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    // Advance by i working days from Monday
    let workDaysAdded = 0;
    const startDate = new Date(monday);
    while (workDaysAdded < i) {
      startDate.setDate(startDate.getDate() + 1);
      const dow = startDate.getDay();
      if (dow >= 1 && dow <= 5) workDaysAdded++;
    }

    return {
      id: genId(),
      oppId: opportunityId,
      userId: null, // will be set by the component from the original entry
      startDate: startDate.toISOString().split("T")[0],
      status: "scheduled",
      durationHours: block.hours,
      splitGroupId: groupId,
      splitIndex: i,
    };
  });

  return { success: true, entries };
}

export async function addCrewMember(member) {
  await delay(300);
  const CREW_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#F97316"];
  return {
    id: genId(),
    name: member.name,
    phone: member.phone || null,
    email: member.email || null,
    color: CREW_COLORS[Math.floor(Math.random() * CREW_COLORS.length)],
    avatarUrl: null,
    sortOrder: 99,
  };
}

export async function updateCrewMember(/* id, updates */) {
  await delay(200);
  return { success: true };
}

export async function deleteCrewMember(/* id */) {
  await delay(200);
  return { success: true };
}

export async function fetchOpportunityDetail(oppId) {
  await delay(200);
  return { notes: _notes[oppId] || [] };
}

export async function fetchScheduleActivity(oppId) {
  await delay(200);
  return _activity[oppId] || [];
}

export async function uploadCrewAvatar(id, file) {
  await delay(300);
  const url = URL.createObjectURL(file);
  _avatars[id] = url;
  return { avatarUrl: url };
}

export function getHlAppOrigin() {
  return "#";
}

export async function createNote(oppId, contactId, body) {
  await delay(200);
  const note = {
    body,
    dateAdded: new Date().toISOString(),
    source: "contact",
    authorName: null,
  };
  if (!_notes[oppId]) _notes[oppId] = [];
  _notes[oppId].unshift(note);
  return note;
}

export async function fetchSettings() {
  await delay(100);
  return { ..._settings };
}

export async function updateSettings(updates) {
  await delay(200);
  _settings = { ..._settings, ...updates };
  return { success: true };
}
