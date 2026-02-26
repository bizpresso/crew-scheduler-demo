import { useState, useCallback } from "react";
import CrewScheduler from "./CrewScheduler.jsx";

// ── Date helpers (compute everything relative to "this week") ────────────
function getMonday() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return mon;
}

function offsetDay(base, offset) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

const monday = getMonday();
const mon = offsetDay(monday, 0);
const tue = offsetDay(monday, 1);
const wed = offsetDay(monday, 2);
const thu = offsetDay(monday, 3);
const fri = offsetDay(monday, 4);

// ── Mock crew members ───────────────────────────────────────────────────
const INITIAL_CREW = [
  { id: "crew_1", name: "Mike Torres", color: "#9E7060", phone: "(410) 555-1001", email: "mike@example.com", avatarUrl: null, sortOrder: 0 },
  { id: "crew_2", name: "Dave Rivera", color: "#A67C5B", phone: "(410) 555-1002", email: "dave@example.com", avatarUrl: null, sortOrder: 1 },
  { id: "crew_3", name: "Carlos Martinez", color: "#7A6248", phone: "(410) 555-1003", email: "carlos@example.com", avatarUrl: null, sortOrder: 2 },
  { id: "crew_4", name: "Sarah Kim", color: "#B08B6B", phone: "(410) 555-1004", email: "sarah@example.com", avatarUrl: null, sortOrder: 3 },
];

const CREW_BILLING = { total: 4, free: 3, paid: 1, monthlyCost: 10 };

// ── Mock stages ──────────────────────────────────────────────────────────
const STAGES = [
  { id: "stage_scheduling", name: "Scheduling" },
  { id: "stage_scheduled", name: "Scheduled" },
  { id: "stage_completed", name: "Completed" },
];

// ── Mock opportunities ──────────────────────────────────────────────────
const OPPORTUNITIES = [
  // In queue (Scheduling stage)
  { id: "opp_2", name: "Gutter Install — Davis", contactName: "Sarah Davis", contactPhone: "(410) 555-2002", contactEmail: "sarah.d@example.com", contactId: "c2", typeOfWork: "Gutter Installation", estDurationHours: 4, monetaryValue: 3200, schedulingType: "splittable", needsMaterials: false, projectAddress: "812 Maple St", projectCity: "Severna Park", projectState: "MD", projectZip: "21146", stageId: "stage_scheduling" },
  { id: "opp_4", name: "Siding Repair — Chen", contactName: "Maria Chen", contactPhone: "(410) 555-2004", contactEmail: "maria.c@example.com", contactId: "c4", typeOfWork: "Siding Repair", estDurationHours: 8, monetaryValue: 4100, schedulingType: "splittable", needsMaterials: true, projectAddress: "903 Commerce Rd", projectCity: "Pasadena", projectState: "MD", projectZip: "21122", stageId: "stage_scheduling" },
  { id: "opp_5", name: "Deck Build — Baker", contactName: "Tom Baker", contactPhone: "(410) 555-2005", contactEmail: "tom.b@example.com", contactId: "c5", typeOfWork: "Deck Construction", estDurationHours: 40, monetaryValue: 12000, schedulingType: "splittable", needsMaterials: true, projectAddress: "2210 Forest Hill Ln", projectCity: "Crofton", projectState: "MD", projectZip: "21114", stageId: "stage_scheduling" },
  { id: "opp_8", name: "Outlet Install — Brooks", contactName: "Karen Brooks", contactPhone: "(410) 555-2008", contactEmail: "karen.b@example.com", contactId: "c8", typeOfWork: "Electrical", estDurationHours: 1, monetaryValue: 250, schedulingType: "continuous", needsMaterials: false, projectAddress: "3302 River Rd", projectCity: "Davidsonville", projectState: "MD", projectZip: "21035", stageId: "stage_scheduling" },
  { id: "opp_9", name: "Bathroom Remodel — Taylor", contactName: "Jeff Taylor", contactPhone: "(410) 555-2009", contactEmail: "jeff.t@example.com", contactId: "c9", typeOfWork: "Bathroom Remodel", estDurationHours: 32, monetaryValue: 15500, schedulingType: "splittable", needsMaterials: true, projectAddress: "1500 Cedar Blvd", projectCity: "Bowie", projectState: "MD", projectZip: "20716", stageId: "stage_scheduling" },
  { id: "opp_10", name: "Fence Install — Morris", contactName: "Linda Morris", contactPhone: "(410) 555-2010", contactEmail: "linda.m@example.com", contactId: "c10", typeOfWork: "Fence Installation", estDurationHours: 16, monetaryValue: 7200, schedulingType: "splittable", needsMaterials: true, projectAddress: "675 Sunset Dr", projectCity: "Odenton", projectState: "MD", projectZip: "21113", stageId: "stage_scheduling" },

  // Scheduled (on the calendar)
  { id: "opp_1", name: "Roof Replacement — Jones", contactName: "Robert Jones", contactPhone: "(410) 555-2001", contactEmail: "robert.j@example.com", contactId: "c1", typeOfWork: "Roof Replacement", estDurationHours: 24, monetaryValue: 18500, schedulingType: "splittable", needsMaterials: true, projectAddress: "4521 Oak Ridge Dr", projectCity: "Annapolis", projectState: "MD", projectZip: "21401", stageId: "stage_scheduled" },
  { id: "opp_3", name: "HVAC Install — Wilson", contactName: "James Wilson", contactPhone: "(410) 555-2003", contactEmail: "james.w@example.com", contactId: "c3", typeOfWork: "HVAC Installation", estDurationHours: 16, monetaryValue: 8900, schedulingType: "splittable", needsMaterials: false, projectAddress: "1205 Bay Ridge Ave", projectCity: "Edgewater", projectState: "MD", projectZip: "21037", stageId: "stage_scheduled" },
  { id: "opp_6", name: "Window Replacement — Park", contactName: "Lisa Park", contactPhone: "(410) 555-2006", contactEmail: "lisa.p@example.com", contactId: "c6", typeOfWork: "Window Replacement", estDurationHours: 12, monetaryValue: 6800, schedulingType: "splittable", needsMaterials: false, projectAddress: "445 Waterfront Dr", projectCity: "Arnold", projectState: "MD", projectZip: "21012", stageId: "stage_scheduled" },
  { id: "opp_11", name: "Drywall Repair — Garcia", contactName: "Ana Garcia", contactPhone: "(410) 555-2011", contactEmail: "ana.g@example.com", contactId: "c11", typeOfWork: "Drywall Repair", estDurationHours: 6, monetaryValue: 2400, schedulingType: "splittable", needsMaterials: false, projectAddress: "220 Pine St", projectCity: "Glen Burnie", projectState: "MD", projectZip: "21061", stageId: "stage_scheduled" },

  // Completed
  { id: "opp_7", name: "Water Heater — Murphy", contactName: "Dan Murphy", contactPhone: "(410) 555-2007", contactEmail: "dan.m@example.com", contactId: "c7", typeOfWork: "Plumbing", estDurationHours: 5, monetaryValue: 1800, schedulingType: "continuous", needsMaterials: false, projectAddress: "118 Highland Ave", projectCity: "Glen Burnie", projectState: "MD", projectZip: "21061", stageId: "stage_scheduled" },

  // On hold
  { id: "opp_12", name: "Painting Exterior — Lee", contactName: "Kevin Lee", contactPhone: "(410) 555-2012", contactEmail: "kevin.l@example.com", contactId: "c12", typeOfWork: "Exterior Painting", estDurationHours: 24, monetaryValue: 5500, schedulingType: "splittable", needsMaterials: true, projectAddress: "890 Birch Ave", projectCity: "Severna Park", projectState: "MD", projectZip: "21146", stageId: "stage_scheduled" },
];

// ── Pre-scheduled entries ────────────────────────────────────────────────
const SCHEDULE_ENTRIES = [
  // Mike: 24h Roof Replacement starting Monday (overflows across Mon-Wed)
  { id: "entry_1", oppId: "opp_1", userId: "crew_1", startDate: mon, status: "scheduled", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: null },
  // Dave: 12h Window Replacement starting Wednesday
  { id: "entry_2", oppId: "opp_6", userId: "crew_2", startDate: wed, status: "scheduled", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: null },
  // Carlos: 16h HVAC starting Thursday (overflows Thu-Fri — shows overtime on Fri with drywall)
  { id: "entry_3", oppId: "opp_3", userId: "crew_3", startDate: thu, status: "scheduled", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: null },
  // Carlos also has a 6h Drywall job on Friday — this will cause overtime (>8h)
  { id: "entry_4", oppId: "opp_11", userId: "crew_3", startDate: fri, status: "scheduled", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: null },
  // Sarah: Completed water heater on Monday (shows grayed out + checkmark)
  { id: "entry_5", oppId: "opp_7", userId: "crew_4", startDate: mon, status: "completed", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: null },
  // On hold: Exterior Painting (waiting for materials)
  { id: "entry_6", oppId: "opp_12", userId: null, startDate: null, status: "on_hold", durationHours: null, splitGroupId: null, splitIndex: null, holdReason: "Waiting for paint delivery — expected Friday" },
];

// ── Demo App ─────────────────────────────────────────────────────────────
export default function DemoApp() {
  const [crewMembers, setCrewMembers] = useState(INITIAL_CREW);

  const handleCrewChange = useCallback(async () => {
    // In the real app this re-fetches from the API.
    // For the demo, crew state is managed locally through the settings panel callbacks.
    // The CrewScheduler's SettingsPanel calls addCrewMember/updateCrewMember/deleteCrewMember
    // from mockApi.js, then calls onCrewChange(). Since mockApi returns success but doesn't
    // actually mutate our state, we need the settings panel's optimistic UI to handle it.
    // For simplicity, we just no-op here — the settings panel already shows the change.
  }, []);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 500));
  }, []);

  return (
    <div>
      <CrewScheduler
        crewMembers={crewMembers}
        crewBilling={CREW_BILLING}
        stages={STAGES}
        opportunities={OPPORTUNITIES}
        scheduleEntries={SCHEDULE_ENTRIES}
        pipelineId="pipeline_demo"
        locationId="loc_demo"
        onRefresh={handleRefresh}
        onCrewChange={handleCrewChange}
      />
    </div>
  );
}
