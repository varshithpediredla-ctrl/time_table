import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory "database" to hold state
let users: any[] = [];

// Academic Policy Knowledge Base for RAG Systems
const ragDocuments = [
  {
    id: "doc-1",
    title: "Faculty Leave Policy & Entitlements",
    content: "Faculty members are entitled to 15 days of Casual Leave (CL) per academic year. All leave requests must be filed at least 48 hours in advance through the faculty portal. Long-term medical leaves and sabbatical plans require Head of Department (HOD) approval, validation by the Dean Office Registrar, and are strictly limited to 1 semester every 5 years.",
    category: "Leaves & Absences"
  },
  {
    id: "doc-2",
    title: "Substitute Allocation & Lecture Coverage Remuneration",
    content: "When a faculty member goes on leave, they must arrange for lecture coverage. Substitutes are recommended based on course expertise matching (match rates above 80% are ideal). If a substitute is allotted, they receive a standard compensation rate of $50 per lecture hour, subject to final signature by the HOD.",
    category: "Substitute & Allotments"
  },
  {
    id: "doc-3",
    title: "Teaching Workload Limits & Faculty Burnout Prevention",
    content: "To prevent faculty burnout, the maximum workload for assistant professors is capped at 16 credit hours per week. Associate professors are capped at 14 credit hours, and full professors at 12. If a faculty member is scheduled for more than 4 consecutive lecture hours, the system flags a high burnout warning in the planner.",
    category: "Workload & Burnout"
  },
  {
    id: "doc-4",
    title: "Timetable Room Allocation & Overbooking Guidelines",
    content: "No two academic classes can occupy the same room at the same time. The scheduler automatically highlights any double-booking in Seminar Rooms, Lecture Halls, and Computer Labs. Booking of central facilities like the Conference Hall or Seminar Room requires 24-hour advance admin clearance.",
    category: "Timetable & Infrastructure"
  },
  {
    id: "doc-5",
    title: "Course Syllabus, Credits, and Faculty Expertise Mapping",
    content: "Accredited courses carry 3 credits for standard lecture classes and 2 credits for laboratory practicals. Faculty expertise scores are dynamically computed from publication alignment, past teaching logs, and syllabus relevance. A course match rate above 90% indicates elite domain mastery.",
    category: "Academics & Syllabus"
  },
  {
    id: "doc-6",
    title: "Academic Grading and Continuous Internal Evaluation (CIE)",
    content: "The grading scheme consists of continuous internal evaluation (CIE) contributing 40% and end-semester exams contributing 60%. CIE includes quizzes, projects, and assignments. All marks must be validated and uploaded by the subject teacher to the administrative portal for HOD approval within 1 week of exams.",
    category: "Exams & Grading"
  },
  {
    id: "doc-7",
    title: "Research Funding, Lab Facilities, and HPC Cluster Usage",
    content: "The department provides seed research funding up to $5,000 per faculty member annually. Advanced laboratories, including the AI-Lab, Robotics Lab, and High-Performance Computing (HPC) cluster, are open 24/7. HPC cluster high-density jobs require prior reservation and administrator sign-off.",
    category: "Research & Labs"
  }
];

// Helper to tokenize and clean text
function tokenize(text: string): string[] {
  const stopWords = new Set(["the", "a", "an", "is", "of", "in", "and", "to", "for", "on", "with", "by", "at", "this", "that", "are", "be", "as", "from", "at", "it", "will", "or", "has", "must", "if", "any", "all", "more", "can", "they", "we", "i", "how", "what", "our", "you", "your", "she", "he", "his", "her", "their"]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
}

// Vocabulary and TF-IDF calculation components
const docTokens = ragDocuments.map(d => tokenize(d.title + " " + d.content));
const vocabSet = new Set<string>();
docTokens.forEach(tokens => tokens.forEach(t => vocabSet.add(t)));
const vocab = Array.from(vocabSet);

const df: Record<string, number> = {};
vocab.forEach(word => {
  df[word] = docTokens.filter(tokens => tokens.includes(word)).length;
});

const idf: Record<string, number> = {};
const N_docs = ragDocuments.length;
vocab.forEach(word => {
  idf[word] = Math.log(1 + N_docs / (df[word] || 1)) + 1;
});

function getTfIdfVector(tokens: string[]): number[] {
  const tf: Record<string, number> = {};
  tokens.forEach(t => {
    tf[t] = (tf[t] || 0) + 1;
  });
  return vocab.map(word => {
    const termFreq = tf[word] || 0;
    return termFreq * (idf[word] || 0);
  });
}

const docVectors = docTokens.map(tokens => getTfIdfVector(tokens));

const semanticConcepts: Record<string, string[]> = {
  "doc-1": ["leave", "holiday", "vacation", "casual", "sabbatical", "sick", "off", "absence", "request", "medical", "cl", "days", "semester"],
  "doc-2": ["substitute", "coverage", "cover", "compensation", "money", "remuneration", "pay", "rate", "remunerated", "allot", "allotted", "allotment", "dollar", "$50"],
  "doc-3": ["workload", "burnout", "hours", "credits", "teaching", "consecutive", "limits", "stress", "max", "professor", "professors", "assistant", "associate"],
  "doc-4": ["room", "classroom", "booking", "overbooking", "double-booking", "hall", "lab", "facility", "venue", "schedule", "computers", "seminar", "labs"],
  "doc-5": ["syllabus", "academics", "course", "credits", "expertise", "teaching history", "match rate", "curriculum", "publications", "domain", "mastery"],
  "doc-6": ["grading", "marks", "exam", "quiz", "assignment", "evaluation", "cie", "test", "scoring", "result", "quizzes", "marks", "semester"],
  "doc-7": ["research", "funding", "seed", "grant", "gpu", "hpc", "cluster", "ai-lab", "robotics", "supercomputer", "facility", "cluster", "computing", "facilities"]
};

function getSemanticScore(docId: string, queryTokens: string[]): number {
  const concepts = semanticConcepts[docId] || [];
  let matchCount = 0;
  queryTokens.forEach(token => {
    if (concepts.some(c => c.includes(token) || token.includes(c))) {
      matchCount += 1.5;
    }
  });
  return Math.min(1.0, matchCount / Math.max(2.5, queryTokens.length));
}

let schedule: any[] = [
  { id: "sch-1", day: "Mon", time: "09:00 - 10:30", subject: "Neural Nets", room: "Lab A-4", status: "optimized", conflictText: "", credits: 3 },
  { id: "sch-2", day: "Mon", time: "14:00 - 15:30", subject: "Lab A-4", room: "Lab A-4", status: "optimized", conflictText: "", credits: 2 },
  { id: "sch-3", day: "Wed", time: "10:00 - 11:30", subject: "Ethics in AI", room: "Seminar Room", status: "conflict", conflictText: "Room double-booking with CS101 in Seminar Room", credits: 3 },
  { id: "sch-4", day: "Wed", time: "11:45 - 13:15", subject: "Post-Grad Sem", room: "Conference Hall", status: "optimized", conflictText: "", credits: 3 },
  { id: "sch-5", day: "Thu", time: "13:00 - 14:30", subject: "Robotics 101", room: "Lab B", status: "optimized", conflictText: "", credits: 3 },
  { id: "sch-6", day: "Fri", time: "09:00 - 10:30", subject: "Research Sync", room: "Faculty Room", status: "burnout", conflictText: "Elena exceeds consecutive research hours limit", credits: 4 }
];

let pendingApprovals = [
  { id: "app-1", title: "Curriculum Review: ML Basics", subtitle: "Assigned by Dept. Head • 2h ago", type: "assignment", icon: "assignment", status: "pending" },
  { id: "app-2", title: "Final Grade Validation: CS402", subtitle: "Due tomorrow • System Auto-flag", type: "warning", icon: "grade", status: "pending" },
  { id: "app-3", title: "Research Grant Budget: AI-Lab", subtitle: "Due in 3 days • Pending sign-off", type: "assignment", icon: "assignment", status: "pending" },
  { id: "app-4", title: "Sabbatical Plan Review: Prof. Miller", subtitle: "Due next week • Multi-signature", type: "warning", icon: "grade", status: "pending" }
];

let leaveRequests = [
  { id: "leave-1", startDate: "2026-11-10", endDate: "2026-11-14", leaveType: "Casual Leave", reason: "Family event engagement", status: "approved", notifiedSubstitutes: ["Prof. David Miller"] }
];

let substitutes: any[] = [
  { id: "sub-1", name: "David Miller", matchRate: "90%", statusText: "Free Mon", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Miller" },
  { id: "sub-2", name: "Sarah Chen", matchRate: "85%", statusText: "Free Fri", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chen" },
  { id: "sub-3", name: "Charles Babbage", matchRate: "95%", statusText: "Available", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Babbage" },
  { id: "sub-4", name: "Ada Lovelace", matchRate: "98%", statusText: "Free Wed", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lovelace" },
  { id: "sub-5", name: "Alan Turing", matchRate: "92%", statusText: "Free Tue", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Turing" }
];

let notifications = [
  { id: "notif-1", recipient: "Dr. Elena Kostic", text: "Welcome to SmartDyn! Use Settings to reset the database at any time.", date: "Today, 10:00", read: false, type: "info" }
];

// Lazily initialize Gemini SDK to prevent startup crashes when API Key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return aiClient;
}

// REST API Endpoints
app.post("/api/register", (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Username already exists" });
  }
  const newUser = { name, username, password, role };
  users.push(newUser);

  // Auto-register as a substitute if role is teacher
  if (role === "teacher") {
    const cleanName = name.replace(/^Dr\.\s+/i, "").replace(/^Prof\.\s+/i, "");
    const subExists = substitutes.some(s => s.name.toLowerCase() === cleanName.toLowerCase());
    if (!subExists) {
      substitutes.push({
        id: `sub-${Date.now()}`,
        name: cleanName,
        matchRate: "90%",
        statusText: "Available",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`
      });
    }
  }

  res.json({ success: true, user: { name, username, role } });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    res.json({ success: true, user: { name: user.name, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

app.get("/api/schedule", (req, res) => {
  res.json(schedule);
});

app.post("/api/schedule", (req, res) => {
  if (Array.isArray(req.body)) {
    schedule = req.body;
  }
  res.json({ success: true, schedule });
});

app.get("/api/approvals", (req, res) => {
  res.json(pendingApprovals);
});

app.post("/api/approvals/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  const item = pendingApprovals.find(p => p.id === id);
  if (item) {
    item.status = status;
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: "Approval item not found" });
  }
});

app.get("/api/leave-requests", (req, res) => {
  res.json(leaveRequests);
});

app.post("/api/leave-requests", (req, res) => {
  const { startDate, endDate, leaveType, reason, notifiedSubstitutes } = req.body;
  const newLeave = {
    id: `leave-${Date.now()}`,
    startDate,
    endDate,
    leaveType,
    reason,
    status: "pending",
    notifiedSubstitutes: notifiedSubstitutes || []
  };
  leaveRequests.unshift(newLeave);
  res.json({ success: true, leaveRequest: newLeave });
});

app.post("/api/leave-requests/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'declined'
  const leave = leaveRequests.find(l => l.id === id);
  if (leave) {
    leave.status = status;
    res.json({ success: true, leaveRequest: leave });
  } else {
    res.status(404).json({ error: "Leave request not found" });
  }
});

app.get("/api/substitutes", (req, res) => {
  res.json(substitutes);
});

app.post("/api/substitutes", (req, res) => {
  const { name, matchRate, statusText, avatar } = req.body;
  const newSub = {
    id: `sub-${Date.now()}`,
    name,
    matchRate: matchRate || "95%",
    statusText: statusText || "Available",
    avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "Faculty")}`
  };
  substitutes.push(newSub);
  res.json({ success: true, substitute: newSub });
});

app.put("/api/substitutes/:id", (req, res) => {
  const { id } = req.params;
  const { name, matchRate, statusText, avatar } = req.body;
  const sub = substitutes.find(s => s.id === id);
  if (sub) {
    if (name !== undefined) sub.name = name;
    if (matchRate !== undefined) sub.matchRate = matchRate;
    if (statusText !== undefined) sub.statusText = statusText;
    if (avatar !== undefined) sub.avatar = avatar;
    res.json({ success: true, substitute: sub });
  } else {
    res.status(404).json({ error: "Faculty member not found" });
  }
});

app.delete("/api/substitutes/:id", (req, res) => {
  const { id } = req.params;
  const index = substitutes.findIndex(s => s.id === id);
  if (index !== -1) {
    const deleted = substitutes.splice(index, 1)[0];
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Faculty member not found" });
  }
});

app.get("/api/notifications", (req, res) => {
  res.json(notifications);
});

app.post("/api/notifications/clear", (req, res) => {
  notifications = [];
  res.json({ success: true, notifications });
});

app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true, notifications });
});

app.post("/api/allot", (req, res) => {
  const { 
    year, 
    substituteId, 
    substituteName, 
    onLeaveTeacherName, 
    classId, 
    className, 
    day, 
    time, 
    room 
  } = req.body;

  const scheduleItem = schedule.find(s => s.id === classId);
  if (scheduleItem) {
    scheduleItem.professor = substituteName;
    scheduleItem.notes = `Covered by ${substituteName} (${year})`;
    scheduleItem.status = "optimized";
  }

  const notifLeave = {
    id: `notif-${Date.now()}-1`,
    recipient: onLeaveTeacherName || "Dr. Elena Kostic",
    text: `${substituteName} is free from ${year} and has been allotted to cover your class '${className}' on ${day} (${time}) in Room ${room}.`,
    date: "Just now",
    read: false,
    type: "success"
  };

  const notifSub = {
    id: `notif-${Date.now()}-2`,
    recipient: substituteName,
    text: `You have been allotted to cover ${onLeaveTeacherName}'s class '${className}' on ${day} (${time}) in Room ${room}.`,
    date: "Just now",
    read: false,
    type: "success"
  };

  notifications.unshift(notifLeave, notifSub);

  res.json({ 
    success: true, 
    schedule, 
    notifications 
  });
});

app.post("/api/substitute-propose", (req, res) => {
  const { substituteName, subject, onLeaveTeacherName } = req.body;
  const newNotif = {
    id: `notif-${Date.now()}`,
    recipient: substituteName,
    text: `Proposal cover request: Dr. ${onLeaveTeacherName || "Elena Kostic"} has requested you to cover her lecture "${subject}".`,
    date: "Just now",
    read: false,
    type: "info"
  };
  notifications.unshift(newNotif);
  res.json({ success: true, notifications });
});

// Dynamic RAG Search & SVM Margin Optimizer Endpoint
app.post("/api/rag/query", async (req, res) => {
  const { query, system, alpha = 0.5 } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const startTime = Date.now();
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return res.json({
      success: true,
      results: [],
      answer: "Please enter a more descriptive academic query with keywords (e.g., 'sabbatical leave', 'burnout teaching limit', 'gpu cluster reservation').",
      explanation: "No significant keywords found in your query.",
      retrievalTime: 0,
      svmData: null
    });
  }

  // 1. Calculate TF-IDF vectors and Sparse Cosine similarity
  const qVec = getTfIdfVector(queryTokens);
  const magnitude = (v: number[]) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
  const dotProduct = (v1: number[], v2: number[]) => v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  const qMag = magnitude(qVec);

  const docResults = ragDocuments.map((doc, idx) => {
    // Sparse tfidf cosine similarity
    const docVec = docVectors[idx];
    const docMag = magnitude(docVec);
    let tfidfScore = 0;
    if (qMag > 0 && docMag > 0) {
      tfidfScore = dotProduct(qVec, docVec) / (qMag * docMag);
    }

    // Synonym-concept semantic match score
    const semanticScore = getSemanticScore(doc.id, queryTokens);

    // Dynamic scale to 2D feature coordinates [0, 10] for SVM Decision visualization
    // We boost representation slightly for easier visual separation
    const x = Math.round(Math.min(1.0, tfidfScore * 2.5) * 100) / 10;
    const y = Math.round(semanticScore * 100) / 10;

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tfidfScore,
      semanticScore,
      hybridScore: alpha * semanticScore + (1 - alpha) * tfidfScore,
      x,
      y
    };
  });

  // 2. Training Support Vector Machine (Linear SVM Classifier) in 2D Space
  // We classify docs with combination score >= 2.0 as positive (+1), others as negative (-1)
  // We inject synthetic stable anchor landmarks to guarantee consistent hyperplane layout
  const trainingData = docResults.map(doc => {
    const isPositive = (doc.x + doc.y) >= 2.5;
    return {
      x: doc.x,
      y: doc.y,
      label: isPositive ? 1 : -1
    };
  });

  // Stabilizer landmarks (Query anchor and noise anchor)
  trainingData.push({ x: 10, y: 10, label: 1 });
  trainingData.push({ x: 0, y: 0, label: -1 });

  // Train SVM via Stochastic Gradient Descent / Pegasos style
  let wx = 0.5;
  let wy = 0.7;
  let b = -2.8;
  const learningRate = 0.03;
  const iterations = 300;
  const C = 1.5;

  for (let i = 0; i < iterations; i++) {
    for (const sample of trainingData) {
      const margin = sample.label * (wx * sample.x + wy * sample.y + b);
      if (margin < 1.0) {
        // Misclassification or inside margin boundaries: apply gradient updates
        wx = wx - learningRate * (wx - C * sample.label * sample.x);
        wy = wy - learningRate * (wy - C * sample.label * sample.y);
        b = b + learningRate * C * sample.label;
      } else {
        // Correctly classified and outside margins: apply weight regularization decay
        wx = wx - learningRate * wx;
        wy = wy - learningRate * wy;
      }
    }
  }

  // Ensure wy is non-zero to prevent division by zero in coordinate graphing
  if (Math.abs(wy) < 0.001) {
    wy = wy >= 0 ? 0.001 : -0.001;
  }

  // Calculate final SVM ranking scores & add retrieval status
  const finalizedResults = docResults.map(doc => {
    const svmScore = wx * doc.x + wy * doc.y + b;
    return {
      ...doc,
      svmScore,
      // Retrieve document if selected retrieval metric satisfies threshold or rankings
      score: system === "svm" 
        ? svmScore 
        : system === "tfidf" 
        ? doc.tfidfScore 
        : system === "semantic" 
        ? doc.semanticScore 
        : doc.hybridScore
    };
  });

  // Sort by the chosen system's score descending
  finalizedResults.sort((a, b) => b.score - a.score);

  // Top retrieved context documents (Retrieve top 2 documents for context)
  const topDocs = finalizedResults.slice(0, 2);
  const contextText = topDocs.map(d => `[Source: ${d.title}] ${d.content}`).join("\n\n");

  let answer = "";
  let isAiGenerated = false;

  // 3. Answer Generation step: Call Gemini API if active, otherwise compile a dynamic local answer
  try {
    const client = getGeminiClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the SmartDyn RAG Assistant. Answer the user's policy query using ONLY the provided document context. If the answer is not contained in the context, say "Based on general academic practices..." and answer as best as possible. Keep the response clean, comprehensive, formatted in markdown with bullet points, and mention the sources used.\n\nDOCUMENT CONTEXT:\n${contextText}\n\nUSER POLICIES QUERY:\n${query}`,
      });
      answer = response.text || "No response received from the model.";
      isAiGenerated = true;
    }
  } catch (error) {
    console.warn("RAG Gemini API Generation failed, using local high-fidelity template engine:", error);
  }

  if (!answer) {
    // Intelligent local template compiler to maintain premium fidelity offline
    if (topDocs.length > 0 && topDocs[0].score > 0.05) {
      const prime = topDocs[0];
      answer = `### 📚 Institutional Policy Search Result (Retrieval Compiled)

Based on the highly matched document **"${prime.title}"** (Category: *${prime.category}*), here is the official departmental protocol:

* **Key Provision**: ${prime.content}
${topDocs[1] && topDocs[1].score > 0.05 ? `* **Secondary Provision (from "${topDocs[1].title}")**: ${topDocs[1].content}` : ""}

* **Retrieval Verification**: This response is assembled from the academic syllabus and regulations registry. Please consult your Head of Department (HOD) for personalized validation.`;
    } else {
      answer = `### ⚠️ Low Similarity Match Detected

The search engine returned very low match rates across our current institutional knowledge base. 

* **General Guidelines**: For leave arrangements, lecture coverage allotments, grading deadlines, or HPC laboratory bookings, please submit a formal request via the respective dashboard rails or contact the **Dean's Office Registrar** directly.
* **Suggestion**: Try searching for specific terms like "Casual Leave", "burnout limits", "remuneration", "syllabus credits", "CIE marks", "HPC cluster", or "AI Lab".`;
    }
  }

  // Calculate 2D hyperplane coordinates for the frontend charting panel
  // Decision boundary: wx * x + wy * y + b = 0 => y = - (wx / wy) * x - (b / wy)
  const slope = -wx / wy;
  const intercept = -b / wy;
  
  // Margins: wx * x + wy * y + b = ±1 => y = - (wx / wy) * x - (b ± 1) / wy
  const marginUpperIntercept = -(b - 1) / wy;
  const marginLowerIntercept = -(b + 1) / wy;

  res.json({
    success: true,
    results: finalizedResults.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category,
      x: r.x,
      y: r.y,
      score: r.score,
      tfidfScore: r.tfidfScore,
      semanticScore: r.semanticScore,
      hybridScore: r.hybridScore,
      svmScore: r.svmScore
    })),
    answer,
    isAiGenerated,
    retrievalTime: Date.now() - startTime,
    explanation: `Calculated query vector overlap with institutional corpus. Trained a Linear Support Vector Machine on 2D coordinates for ${iterations} epochs. Successfully extracted separating boundary with slope m = ${slope.toFixed(3)} and margin size.`,
    svmData: {
      slope,
      intercept,
      marginUpperIntercept,
      marginLowerIntercept,
      weights: { wx, wy },
      bias: b
    }
  });
});

app.post("/api/optimize", async (req, res) => {
  try {
    const client = getGeminiClient();
    
    // Formulate a structured text payload to send to Gemini
    const currentScheduleStr = JSON.stringify(schedule, null, 2);
    const userPrompt = `
You are the SmartDyn Academic Timetable Scheduler. Below is the current weekly class schedule for Dr. Elena Kostic (Senior Professor, AI Dept).
Current credits logged: 18 credits out of 24 max limit.

Here is her weekly class list:
${currentScheduleStr}

Please analyze this schedule for any inefficiencies, conflicts, or burnout risks:
1. Note the Wednesday morning double-booking room conflict for "Ethics in AI" in the Seminar Room with CS101.
2. Note the Friday morning burnout risk for "Research Sync" in the Faculty Room where Elena exceeds consecutive research/working hours limit.

Optimize her schedule by:
1. Relocating "Ethics in AI" to Wednesday afternoon or another free slot when Room 302 or another room is vacant.
2. Appointing Dr. Sarah Chen (85% Match, Free Friday) or another available colleague as the coordinator for the Friday 09:00 Research Sync, resolving the burnout risk while keeping the session active.

Generate:
1. A concise analysis paragraph.
2. A list of exact actionable recommendations with details, conflict resolved, and positive impact.
3. The final optimized schedule with day, time, subject, room, status, and notes.

Format your output STRICTLY as a JSON object matching the requested schema.
    `;

    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "A detailed analysis of the current timetable, highlighting conflicts and workload status.",
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A unique short ID for this recommendation." },
                    title: { type: Type.STRING, description: "Actionable recommendation title." },
                    description: { type: Type.STRING, description: "Details of why this is recommended and what it resolves." },
                    conflictResolved: { type: Type.STRING, description: "The specific conflict resolved." },
                    impact: { type: Type.STRING, description: "The visual or numeric impact of this optimization." }
                  },
                  required: ["id", "title", "description", "conflictResolved", "impact"]
                },
                description: "Actionable recommendations that the user can apply to optimize the schedule.",
              },
              optimizedSchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Use same ID or a new unique id." },
                    day: { type: Type.STRING, description: "Mon, Wed, Thu, Fri, etc." },
                    time: { type: Type.STRING, description: "e.g., 14:00 - 15:30." },
                    subject: { type: Type.STRING, description: "The subject name." },
                    room: { type: Type.STRING, description: "The room number or location." },
                    status: { type: Type.STRING, description: "The new status: 'optimized' or 'burnout' or 'conflict'." },
                    conflictText: { type: Type.STRING, description: "Empty if resolved." },
                    credits: { type: Type.INTEGER, description: "Number of credits." },
                    notes: { type: Type.STRING, description: "Any notes regarding this slot." }
                  },
                  required: ["id", "day", "time", "subject", "room", "status", "credits"]
                },
                description: "The complete optimized weekly schedule resulting from the recommendations."
              }
            },
            required: ["analysis", "recommendations", "optimizedSchedule"]
          }
        }
      });

      const text = response.text || "";
      const resultObj = JSON.parse(text);
      res.json({ aiGenerated: true, ...resultObj });
    } else {
      // Return beautiful, high-fidelity local fallback if API key is not configured yet
      res.json({
        aiGenerated: false,
        analysis: "[LOCAL OPTIMIZER] Dr. Elena Kostic's schedule contains 2 critical issues: 1) Wednesday 10:00 Room Conflict for 'Ethics in AI' in the Seminar Room (overbooked with CS101), and 2) Friday 09:00 Burnout Risk for 'Research Sync' in the Faculty Room due to excessive continuous research sessions. (Note: To activate real-time Gemini AI optimization, please set your GEMINI_API_KEY in Settings > Secrets).",
        recommendations: [
          {
            id: "rec-1",
            title: "Resolve Wednesday Room Collision",
            description: "Shift Wednesday 10:00 - 11:30 'Ethics in AI' to Wednesday 14:00 - 15:30. A slot is free and Room 302 is vacant, successfully resolving the double-booking with CS101.",
            conflictResolved: "Wednesday room conflict",
            impact: "Resolves room collision with CS101"
          },
          {
            id: "rec-2",
            title: "Mitigate Friday Burnout Risk",
            description: "Appoint Dr. Sarah Chen (85% Match, Free Friday) as the facilitator for the Friday 09:00 'Research Sync'. This maintains the research group's alignment while reducing Elena's weekly continuous teaching load.",
            conflictResolved: "Friday burnout risk",
            impact: "Reduces weekly load by 1.5 hours"
          }
        ],
        optimizedSchedule: [
          { id: "sch-1", day: "Mon", time: "09:00 - 10:30", subject: "Neural Nets", room: "Lab A-4", status: "optimized", conflictText: "", credits: 3, notes: "No changes needed" },
          { id: "sch-2", day: "Mon", time: "14:00 - 15:30", subject: "Lab A-4", room: "Lab A-4", status: "optimized", conflictText: "", credits: 2, notes: "No changes needed" },
          { id: "sch-4", day: "Wed", time: "11:45 - 13:15", subject: "Post-Grad Sem", room: "Conference Hall", status: "optimized", conflictText: "", credits: 3, notes: "No changes needed" },
          { id: "sch-3", day: "Wed", time: "14:00 - 15:30", subject: "Ethics in AI", room: "Room 302", status: "optimized", conflictText: "", credits: 3, notes: "Rescheduled to Wednesday afternoon to resolve Seminar Room overbooking" },
          { id: "sch-5", day: "Thu", time: "13:00 - 14:30", subject: "Robotics 101", room: "Lab B", status: "optimized", conflictText: "", credits: 3, notes: "No changes needed" },
          { id: "sch-6", day: "Fri", time: "09:00 - 10:30", subject: "Research Sync", room: "Faculty Room", status: "optimized", conflictText: "", credits: 3, notes: "Dr. Sarah Chen appointed as substitute facilitator to mitigate professor workload" }
        ]
      });
    }
  } catch (error: any) {
    console.error("AI optimization failed:", error);
    res.status(500).json({ error: error?.message || "AI optimization failed. Please verify your Gemini API key." });
  }
});

app.post("/api/reset", (req, res) => {
  schedule = [
    { id: "sch-1", day: "Mon", time: "09:00 - 10:30", subject: "Neural Nets", room: "Lab A-4", status: "optimized", conflictText: "", credits: 3 },
    { id: "sch-2", day: "Mon", time: "14:00 - 15:30", subject: "Lab A-4", room: "Lab A-4", status: "optimized", conflictText: "", credits: 2 },
    { id: "sch-3", day: "Wed", time: "10:00 - 11:30", subject: "Ethics in AI", room: "Seminar Room", status: "conflict", conflictText: "Room double-booking with CS101 in Seminar Room", credits: 3 },
    { id: "sch-4", day: "Wed", time: "11:45 - 13:15", subject: "Post-Grad Sem", room: "Conference Hall", status: "optimized", conflictText: "", credits: 3 },
    { id: "sch-5", day: "Thu", time: "13:00 - 14:30", subject: "Robotics 101", room: "Lab B", status: "optimized", conflictText: "", credits: 3 },
    { id: "sch-6", day: "Fri", time: "09:00 - 10:30", subject: "Research Sync", room: "Faculty Room", status: "burnout", conflictText: "Elena exceeds consecutive research hours limit", credits: 4 }
  ];
  pendingApprovals = [
    { id: "app-1", title: "Curriculum Review: ML Basics", subtitle: "Assigned by Dept. Head • 2h ago", type: "assignment", icon: "assignment", status: "pending" },
    { id: "app-2", title: "Final Grade Validation: CS402", subtitle: "Due tomorrow • System Auto-flag", type: "warning", icon: "grade", status: "pending" },
    { id: "app-3", title: "Research Grant Budget: AI-Lab", subtitle: "Due in 3 days • Pending sign-off", type: "assignment", icon: "assignment", status: "pending" },
    { id: "app-4", title: "Sabbatical Plan Review: Prof. Miller", subtitle: "Due next week • Multi-signature", type: "warning", icon: "grade", status: "pending" }
  ];
  leaveRequests = [
    { id: "leave-1", startDate: "2026-11-10", endDate: "2026-11-14", leaveType: "Casual Leave", reason: "Family event engagement", status: "approved", notifiedSubstitutes: ["Prof. David Miller"] }
  ];
  substitutes = [
    { id: "sub-1", name: "David Miller", matchRate: "90%", statusText: "Free Mon", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Miller" },
    { id: "sub-2", name: "Sarah Chen", matchRate: "85%", statusText: "Free Fri", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chen" },
    { id: "sub-3", name: "Charles Babbage", matchRate: "95%", statusText: "Available", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Babbage" },
    { id: "sub-4", name: "Ada Lovelace", matchRate: "98%", statusText: "Free Wed", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lovelace" },
    { id: "sub-5", name: "Alan Turing", matchRate: "92%", statusText: "Free Tue", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Turing" }
  ];
  notifications = [
    { id: "notif-1", recipient: "Dr. Elena Kostic", text: "Welcome to SmartDyn! Use Settings to reset the database at any time.", date: "Today, 10:00", read: false, type: "info" }
  ];
  users = [];
  res.json({ success: true, schedule, pendingApprovals, leaveRequests, substitutes, notifications });
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
