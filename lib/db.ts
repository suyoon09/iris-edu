import { getStore } from "@netlify/blobs";
import { v4 as uuidv4 } from "uuid";
import type { Student, StudentCreate, StudentUpdate } from "@/types/student";
import type { Counselor, CounselorCreate, CounselorUpdate } from "@/types/counselor";
import type { TimelineEvent, TimelineEventCreate, TimelineEventUpdate } from "@/types/timeline";
import type { University, UniversityListItem } from "@/types/university";

// Store names
const STORES = {
  STUDENTS: "students",
  COUNSELORS: "counselors",
  TIMELINE_EVENTS: "timeline-events",
  UNIVERSITIES: "universities",
} as const;

// Keys for arrays
const KEYS = {
  ALL_STUDENTS: "all",
  ALL_COUNSELORS: "all",
  ALL_EVENTS: "all",
  UNIVERSITY_INDEX: "index",
} as const;

// Helper function to get a store with consistency options
function getDataStore(name: string) {
  return getStore({
    name,
    consistency: "strong",
  });
}

// Helper functions for JSON operations
async function getJsonData<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const store = getDataStore(storeName);
    const data = await store.get(key, { type: "json" });
    return data as T | null;
  } catch (error) {
    console.error(`Error reading from store ${storeName}/${key}:`, error);
    return null;
  }
}

async function setJsonData<T>(storeName: string, key: string, data: T): Promise<void> {
  try {
    const store = getDataStore(storeName);
    await store.setJSON(key, data);
  } catch (error) {
    console.error(`Error writing to store ${storeName}/${key}:`, error);
    throw error;
  }
}

// ==================== STUDENTS ====================

export async function getStudents(): Promise<Student[]> {
  const data = await getJsonData<Student[]>(STORES.STUDENTS, KEYS.ALL_STUDENTS);
  return data || [];
}

export async function getStudentById(id: string): Promise<Student | null> {
  const students = await getStudents();
  return students.find((s) => s.id === id) || null;
}

export async function getStudentsByCounselorId(counselorId: string): Promise<Student[]> {
  const students = await getStudents();
  return students.filter((s) => s.assigned_counselor_id === counselorId);
}

export async function createStudent(data: StudentCreate): Promise<Student> {
  const students = await getStudents();
  const now = new Date().toISOString();

  const newStudent: Student = {
    id: uuidv4(),
    assigned_counselor_id: null,
    name_korean: data.name_korean,
    name_english: data.name_english,
    email: data.email,
    phone: data.phone,
    grade: data.grade,
    school_type: data.school_type,
    current_school: data.current_school,
    graduation_year: data.graduation_year,
    academic: {
      gpa: {
        unweighted: 0,
        weighted: null,
        scale: "4.0",
      },
      class_rank: {
        rank: null,
        total: null,
      },
      courses: [],
      standardized_tests: {
        sat: {
          total: null,
          reading_writing: null,
          math: null,
          date: null,
        },
        act: {
          composite: null,
          english: null,
          math: null,
          reading: null,
          science: null,
          date: null,
        },
        ap_scores: [],
        toefl: null,
      },
    },
    extracurriculars: [],
    awards: [],
    target_universities: [],
    saved_reports: [],
    application_status: "planning",
    created_at: now,
    updated_at: now,
    notes: data.notes || "",
  };

  students.push(newStudent);
  await setJsonData(STORES.STUDENTS, KEYS.ALL_STUDENTS, students);
  return newStudent;
}

export async function updateStudent(id: string, data: StudentUpdate): Promise<Student | null> {
  const students = await getStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) return null;

  const updated: Student = {
    ...students[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  students[index] = updated;
  await setJsonData(STORES.STUDENTS, KEYS.ALL_STUDENTS, students);
  return updated;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const students = await getStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) return false;

  students.splice(index, 1);
  await setJsonData(STORES.STUDENTS, KEYS.ALL_STUDENTS, students);
  return true;
}

export async function assignCounselorToStudent(
  studentId: string,
  counselorId: string
): Promise<Student | null> {
  const student = await updateStudent(studentId, {
    assigned_counselor_id: counselorId,
  });

  if (!student) return null;

  const counselors = await getCounselors();
  const counselorIndex = counselors.findIndex((c) => c.id === counselorId);

  if (counselorIndex !== -1) {
    if (!counselors[counselorIndex].assigned_students.includes(studentId)) {
      counselors[counselorIndex].assigned_students.push(studentId);
      await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, counselors);
    }
  }

  return student;
}

// ==================== COUNSELORS ====================

export async function getCounselors(): Promise<Counselor[]> {
  const data = await getJsonData<Counselor[]>(STORES.COUNSELORS, KEYS.ALL_COUNSELORS);
  return data || [];
}

export async function getCounselorById(id: string): Promise<Counselor | null> {
  const counselors = await getCounselors();
  return counselors.find((c) => c.id === id) || null;
}

export async function getCounselorByEmail(email: string): Promise<Counselor | null> {
  const counselors = await getCounselors();
  return counselors.find((c) => c.email === email) || null;
}

export async function createCounselor(data: CounselorCreate): Promise<Counselor> {
  const counselors = await getCounselors();
  const now = new Date().toISOString();

  const newCounselor: Counselor = {
    id: uuidv4(),
    email: data.email,
    password: data.password,
    name: data.name,
    name_en: data.name_en,
    role: data.role,
    specialization: data.specialization,
    assigned_students: [],
    created_at: now,
    last_login: null,
  };

  counselors.push(newCounselor);
  await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, counselors);
  return newCounselor;
}

export async function updateCounselor(
  id: string,
  data: CounselorUpdate
): Promise<Counselor | null> {
  const counselors = await getCounselors();
  const index = counselors.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updated: Counselor = {
    ...counselors[index],
    ...data,
  };

  counselors[index] = updated;
  await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, counselors);
  return updated;
}

export async function updateCounselorLastLogin(id: string): Promise<void> {
  const counselors = await getCounselors();
  const index = counselors.findIndex((c) => c.id === id);

  if (index !== -1) {
    counselors[index].last_login = new Date().toISOString();
    await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, counselors);
  }
}

export async function deleteCounselor(id: string): Promise<boolean> {
  const counselors = await getCounselors();
  const index = counselors.findIndex((c) => c.id === id);

  if (index === -1) return false;

  counselors.splice(index, 1);
  await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, counselors);
  return true;
}

// ==================== TIMELINE EVENTS ====================

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const data = await getJsonData<TimelineEvent[]>(STORES.TIMELINE_EVENTS, KEYS.ALL_EVENTS);
  return data || [];
}

export async function getTimelineEventsByStudentId(studentId: string): Promise<TimelineEvent[]> {
  const events = await getTimelineEvents();
  return events
    .filter((e) => e.student_id === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getTimelineEventById(id: string): Promise<TimelineEvent | null> {
  const events = await getTimelineEvents();
  return events.find((e) => e.id === id) || null;
}

export async function createTimelineEvent(data: TimelineEventCreate): Promise<TimelineEvent> {
  const events = await getTimelineEvents();
  const now = new Date().toISOString();

  const newEvent: TimelineEvent = {
    id: uuidv4(),
    student_id: data.student_id,
    counselor_id: data.counselor_id,
    event_type: data.event_type,
    title: data.title,
    description: data.description,
    date: data.date,
    status: data.status || "pending",
    related_university_id: data.related_university_id,
    score_achieved: data.score_achieved,
    due_date: data.due_date,
    created_at: now,
    updated_at: now,
  };

  events.push(newEvent);
  await setJsonData(STORES.TIMELINE_EVENTS, KEYS.ALL_EVENTS, events);
  return newEvent;
}

export async function updateTimelineEvent(
  id: string,
  data: TimelineEventUpdate
): Promise<TimelineEvent | null> {
  const events = await getTimelineEvents();
  const index = events.findIndex((e) => e.id === id);

  if (index === -1) return null;

  const updated: TimelineEvent = {
    ...events[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  events[index] = updated;
  await setJsonData(STORES.TIMELINE_EVENTS, KEYS.ALL_EVENTS, events);
  return updated;
}

export async function deleteTimelineEvent(id: string): Promise<boolean> {
  const events = await getTimelineEvents();
  const index = events.findIndex((e) => e.id === id);

  if (index === -1) return false;

  events.splice(index, 1);
  await setJsonData(STORES.TIMELINE_EVENTS, KEYS.ALL_EVENTS, events);
  return true;
}

export async function getRecentTimelineEvents(limit: number = 10): Promise<TimelineEvent[]> {
  const events = await getTimelineEvents();
  return events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function getRecentTimelineEventsByCounselor(
  counselorId: string,
  limit: number = 10
): Promise<TimelineEvent[]> {
  const events = await getTimelineEvents();
  const counselor = await getCounselorById(counselorId);

  if (!counselor) return [];

  return events
    .filter((e) => counselor.assigned_students.includes(e.student_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// ==================== UNIVERSITIES ====================

export async function getUniversities(): Promise<UniversityListItem[]> {
  const data = await getJsonData<UniversityListItem[]>(STORES.UNIVERSITIES, KEYS.UNIVERSITY_INDEX);
  return data || [];
}

export async function getUniversityById(id: string): Promise<University | null> {
  // First try Netlify Blobs
  const blobData = await getJsonData<University>(STORES.UNIVERSITIES, id);
  if (blobData) {
    return blobData;
  }

  // Fallback: load from JSON file
  try {
    const { loadUniversityFromFile } = await import("./university-loader");
    return loadUniversityFromFile(id);
  } catch (error) {
    console.error(`Error loading university ${id} from file:`, error);
    return null;
  }
}

export async function searchUniversities(query: string): Promise<UniversityListItem[]> {
  const universities = await getUniversities();
  const lowerQuery = query.toLowerCase();

  return universities.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.name_short.toLowerCase().includes(lowerQuery) ||
      u.location.toLowerCase().includes(lowerQuery)
  );
}

// ==================== STATS ====================

export async function getDashboardStats(counselorId?: string) {
  const students = await getStudents();
  const events = await getTimelineEvents();

  let filteredStudents = students;
  let filteredEvents = events;

  if (counselorId) {
    filteredStudents = students.filter((s) => s.assigned_counselor_id === counselorId);
    const studentIds = filteredStudents.map((s) => s.id);
    filteredEvents = events.filter((e) => studentIds.includes(e.student_id));
  }

  const now = new Date();
  const upcomingDeadlines = filteredEvents.filter((e) => {
    if (!e.due_date || e.status === "completed" || e.status === "cancelled") return false;
    const dueDate = new Date(e.due_date);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  });

  const pendingTasks = filteredEvents.filter(
    (e) => e.status === "pending" && (e.event_type === "task_assigned" || e.event_type === "document_submitted")
  );

  const statusCounts = {
    planning: 0,
    preparing: 0,
    applying: 0,
    complete: 0,
  };

  filteredStudents.forEach((s) => {
    statusCounts[s.application_status]++;
  });

  return {
    totalStudents: filteredStudents.length,
    pendingTasks: pendingTasks.length,
    upcomingDeadlines: upcomingDeadlines.length,
    applicationsInProgress: statusCounts.applying,
    statusBreakdown: statusCounts,
  };
}

// ==================== SEEDING ====================

export async function seedDatabase(seedData: {
  counselors: Counselor[];
  students: Student[];
  timelineEvents: TimelineEvent[];
  universities: {
    index: UniversityListItem[];
    details: Record<string, University>;
  };
}): Promise<{ success: boolean; message: string }> {
  try {
    // Seed counselors
    await setJsonData(STORES.COUNSELORS, KEYS.ALL_COUNSELORS, seedData.counselors);

    // Seed students
    await setJsonData(STORES.STUDENTS, KEYS.ALL_STUDENTS, seedData.students);

    // Seed timeline events
    await setJsonData(STORES.TIMELINE_EVENTS, KEYS.ALL_EVENTS, seedData.timelineEvents);

    // Seed university index
    await setJsonData(STORES.UNIVERSITIES, KEYS.UNIVERSITY_INDEX, seedData.universities.index);

    // Seed individual university details
    for (const [id, university] of Object.entries(seedData.universities.details)) {
      await setJsonData(STORES.UNIVERSITIES, id, university);
    }

    return { success: true, message: "Database seeded successfully" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, message: `Seeding failed: ${error}` };
  }
}

export async function checkDatabaseInitialized(): Promise<boolean> {
  const counselors = await getCounselors();
  return counselors.length > 0;
}
