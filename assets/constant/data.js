// ============================================================
//  MicroMind Lab LMS — Google Sheets Data Loader
//
//  HOW TO SET UP YOUR GOOGLE SHEET:
//  ─────────────────────────────────────────────────────────
//  1. Create a new Google Sheet.
//  2. Create 5 tabs with EXACTLY these names:
//       Admin  |  Students  |  Courses  |  Files  |  Questions
//  3. Fill each tab using the column headers and structure below.
//  4. Publish the sheet to web:
//       File → Share → Publish to web
//       → choose each tab one at a time → Comma-separated values (.csv)
//       → click Publish → copy the URL for each tab
//  5. Paste each tab's URL into SHEET_URLS below.
//
// ─────────────────────────────────────────────────────────
//  TAB: Admin   (Row 1 = headers)
//  ┌──────────┬──────────┬───────────────┬────────┐
//  │ username │ password │ name          │ avatar │
//  ├──────────┼──────────┼───────────────┼────────┤
//  │ admin    │ admin123 │ Administrator │ 🛡️    │
//  └──────────┴──────────┴───────────────┴────────┘
//
//  TAB: Students   (Row 1 = headers)
//  ┌────┬──────────┬──────────┬──────────────┬────────┬─────────────────┐
//  │ id │ username │ password │ name         │ avatar │ enrolledCourses │
//  ├────┼──────────┼──────────┼──────────────┼────────┼─────────────────┤
//  │ s1 │ alice    │ pass123  │ Alice Johnson│ 👩‍💻   │ c1,c7           │
//  │ s2 │ bob      │ pass123  │ Bob Martinez │ 👨‍🎨   │ c2              │
//  └────┴──────────┴──────────┴──────────────┴────────┴─────────────────┘
//  NOTE: enrolledCourses = comma-separated course IDs (no spaces)
//
//  TAB: Courses   (Row 1 = headers)
//  ┌────┬────────────────────┬──────┬─────────┬─────────────────────────┬──────────────────────┐
//  │ id │ title              │ icon │ color   │ description             │ instructor           │
//  ├────┼────────────────────┼──────┼─────────┼─────────────────────────┼──────────────────────┤
//  │ c1 │ Miss IT - Grade 6  │ 🐍   │ #6C63FF │ ICT for Grade 6         │ Ms. Shammi Dodangoda │
//  └────┴────────────────────┴──────┴─────────┴─────────────────────────┴──────────────────────┘
//
//  TAB: Files   (Row 1 = headers)
//  One row per FILE. Multiple files share the same dayId → they group into one day folder.
//  ┌──────────┬───────┬──────────────────────────┬────────────┬────────┬──────────┬───────────────────┬─────────────────┬────────────────────────────────────┬──────────────┬─────────────────────────┐
//  │ courseId │ dayId │ dayTitle                 │ dayDate    │ fileId │ fileType │ fileTitle         │ fileDescription │ fileUrl                            │ fileDuration │ fileContent             │
//  ├──────────┼───────┼──────────────────────────┼────────────┼────────┼──────────┼───────────────────┼─────────────────┼────────────────────────────────────┼──────────────┼─────────────────────────┤
//  │ c1       │ d1    │ Introduction to computer │ 2025-01-06 │ f1     │ video    │ What is computer? │ Overview        │ https://www.youtube.com/embed/xxx  │ 10 min       │                         │
//  │ c1       │ d1    │ Introduction to computer │ 2025-01-06 │ f2     │ note     │ Basics Notes      │ Computer basics │                                    │              │ <h3>Title</h3><p>...</p> │
//  │ c1       │ d2    │ Keyboard                 │ 2025-01-08 │ f3     │ link     │ Typing Practice   │ Practice typing │ https://www.typing.com/            │              │                         │
//  └──────────┴───────┴──────────────────────────┴────────────┴────────┴──────────┴───────────────────┴─────────────────┴────────────────────────────────────┴──────────────┴─────────────────────────┘
//  fileType options: video | note | link | pdf
//
//  TAB: Questions   (Row 1 = headers)
//  One row per QUESTION. Multiple questions share the same testId → they form one quiz.
//  ┌──────────┬────────┬──────────────────────┬──────────────┬─────────────────────┬─────────┬─────────┬─────────┬─────────┬───────────────┐
//  │ courseId │ testId │ testTitle            │ testDuration │ question            │ option1 │ option2 │ option3 │ option4 │ correctAnswer │
//  ├──────────┼────────┼──────────────────────┼──────────────┼─────────────────────┼─────────┼─────────┼─────────┼─────────┼───────────────┤
//  │ c1       │ t1     │ Computer Basics Quiz │ 20 min       │ What is a computer? │ A tool  │ A device│ A robot │ A lamp  │ 1             │
//  └──────────┴────────┴──────────────────────┴──────────────┴─────────────────────┴─────────┴─────────┴─────────┴─────────┴───────────────┘
//  correctAnswer = 0-based index  (0 = option1, 1 = option2, 2 = option3, 3 = option4)
//
// ============================================================

const SHEET_URLS = {
  admin:     "https://docs.google.com/spreadsheets/d/e/2PACX-1vRor3USWj5m3EB6eAiGg5euVQCMBlqomG5i6G6ACOCCTHcElEu9Z506IO8HFkvpDNWsWAqeSWOrALj5/pub?gid=0&single=true&output=csv",
  students:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRor3USWj5m3EB6eAiGg5euVQCMBlqomG5i6G6ACOCCTHcElEu9Z506IO8HFkvpDNWsWAqeSWOrALj5/pub?gid=26403546&single=true&output=csv",
  courses:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRor3USWj5m3EB6eAiGg5euVQCMBlqomG5i6G6ACOCCTHcElEu9Z506IO8HFkvpDNWsWAqeSWOrALj5/pub?gid=2102519719&single=true&output=csv",
  files:     "https://docs.google.com/spreadsheets/d/e/2PACX-1vRor3USWj5m3EB6eAiGg5euVQCMBlqomG5i6G6ACOCCTHcElEu9Z506IO8HFkvpDNWsWAqeSWOrALj5/pub?gid=424331607&single=true&output=csv",
  questions: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRor3USWj5m3EB6eAiGg5euVQCMBlqomG5i6G6ACOCCTHcElEu9Z506IO8HFkvpDNWsWAqeSWOrALj5/pub?gid=1514774377&single=true&output=csv",
};

// ── CSV PARSER ────────────────────────────────────────────
// Robust parser: handles quoted fields, embedded commas, escaped quotes.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false, i = 0;

  const pushField = () => { row.push(field.trim()); field = ""; };
  const pushRow   = () => { pushField(); if (row.some(c => c !== "")) rows.push(row); row = []; };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
      if (ch === '"') { inQuotes = false; i++; continue; }                        // close quote
      field += ch;
    } else {
      if (ch === '"')  { inQuotes = true; i++; continue; }
      if (ch === ',')  { pushField(); i++; continue; }
      if (ch === '\r') { i++; continue; }
      if (ch === '\n') { pushRow(); i++; continue; }
      field += ch;
    }
    i++;
  }
  pushRow(); // flush last row
  return rows;
}

// First row as header keys → array of plain objects.
function rowsToObjects(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (row[i] || "").trim(); });
    return obj;
  });
}

// Fetch one published CSV tab and return objects.
async function fetchSheet(name, url) {
  if (!url || url.startsWith("YOUR_")) {
    throw new Error(
      `Sheet URL for "${name}" is not set. Open data.js and paste your Google Sheets CSV URL into SHEET_URLS.${name}`
    );
  }
  // Cache-bust so edits in the sheet appear quickly.
  const res = await fetch(url + "&cachebust=" + Date.now());
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching "${name}" sheet.`);
  const text = await res.text();
  return rowsToObjects(parseCSV(text));
}

// ── MAIN ASSEMBLER ────────────────────────────────────────
async function loadLMSData() {

  // Fetch all five tabs in parallel.
  const [adminRows, studentRows, courseRows, fileRows, questionRows] =
    await Promise.all([
      fetchSheet("admin",     SHEET_URLS.admin),
      fetchSheet("students",  SHEET_URLS.students),
      fetchSheet("courses",   SHEET_URLS.courses),
      fetchSheet("files",     SHEET_URLS.files),
      fetchSheet("questions", SHEET_URLS.questions),
    ]);

  // ── Admin ──────────────────────────────────────────────
  const a = adminRows[0] || {};
  const admin = {
    username: a.username || "admin",
    password: a.password || "admin123",
    name:     a.name     || "Administrator",
    avatar:   a.avatar   || "🛡️",
  };

  // ── Students ───────────────────────────────────────────
  const students = studentRows
    .filter(r => r.id && r.username)
    .map(r => ({
      id:       r.id,
      username: r.username,
      password: r.password,
      name:     r.name,
      avatar:   r.avatar || "👤",
      // "c1,c3,c7" → ["c1","c3","c7"]
      enrolledCourses: r.enrolledCourses
        ? r.enrolledCourses.split(",").map(s => s.trim()).filter(Boolean)
        : [],
    }));

  // ── Courses skeleton ───────────────────────────────────
  // Preserve sheet order; use a Map to keep insertion order.
  const courseMap = new Map();
  courseRows
    .filter(r => r.id)
    .forEach(r => {
      courseMap.set(r.id, {
        id:          r.id,
        title:       r.title       || r.id,
        icon:        r.icon        || "📚",
        color:       r.color       || "#6C63FF",
        description: r.description || "",
        instructor:  r.instructor  || "",
        days:  [],
        tests: [],
      });
    });

  // ── Files → Days ───────────────────────────────────────
  // dayRegistry[courseId][dayId] = { id, title, date, files[] }
  const dayRegistry = {};
  fileRows
    .filter(r => r.courseId && r.dayId && r.fileId)
    .forEach(r => {
      if (!dayRegistry[r.courseId]) dayRegistry[r.courseId] = {};
      if (!dayRegistry[r.courseId][r.dayId]) {
        dayRegistry[r.courseId][r.dayId] = {
          id:    r.dayId,
          title: r.dayTitle || r.dayId,
          date:  r.dayDate  || "",
          files: [],
        };
      }
      const file = {
        id:          r.fileId,
        type:        r.fileType        || "note",
        title:       r.fileTitle       || "",
        description: r.fileDescription || "",
      };
      if (r.fileUrl)      file.url      = r.fileUrl;
      if (r.fileDuration) file.duration = r.fileDuration;
      if (r.fileContent)  file.content  = r.fileContent;

      dayRegistry[r.courseId][r.dayId].files.push(file);
    });

  // Attach days to courses (preserving sheet order).
  Object.entries(dayRegistry).forEach(([courseId, days]) => {
    if (courseMap.has(courseId)) {
      courseMap.get(courseId).days = Object.values(days);
    }
  });

  // ── Questions → Tests ──────────────────────────────────
  // testRegistry[courseId][testId] = { id, title, duration, questions[] }
  const testRegistry = {};
  questionRows
    .filter(r => r.courseId && r.testId && r.question)
    .forEach(r => {
      if (!testRegistry[r.courseId]) testRegistry[r.courseId] = {};
      if (!testRegistry[r.courseId][r.testId]) {
        testRegistry[r.courseId][r.testId] = {
          id:        r.testId,
          title:     r.testTitle    || r.testId,
          duration:  r.testDuration || "20 min",
          questions: [],
        };
      }
      testRegistry[r.courseId][r.testId].questions.push({
        q:       r.question || "",
        options: [
          r.option1 || "",
          r.option2 || "",
          r.option3 || "",
          r.option4 || "",
        ],
        answer: parseInt(r.correctAnswer, 10) || 0,
      });
    });

  // Attach tests to courses.
  Object.entries(testRegistry).forEach(([courseId, tests]) => {
    if (courseMap.has(courseId)) {
      courseMap.get(courseId).tests = Object.values(tests);
    }
  });

  return {
    admin,
    students,
    courses: Array.from(courseMap.values()),
  };
}

// ── BOOTSTRAP ─────────────────────────────────────────────
// lms.html waits on this promise before calling init().
let LMS_DATA = null;

const LMS_DATA_PROMISE = loadLMSData()
  .then(data  => { LMS_DATA = data; return data; })
  .catch(err  => { console.error("❌ LMS data load failed:", err); throw err; });
