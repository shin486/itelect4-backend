import { execSync } from "child_process";
import jwt from "jsonwebtoken";
import { User } from "../src/models/User.js";
import { Submission } from "../src/models/Submission.js";
import { authenticate } from "../src/middleware/auth.js";
import { connectDB } from "../src/config/db.js";

let passed = 0;
let total = 0;

function assert(condition: boolean, label: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔\x1b[0m ${label}`);
  } else {
    console.error(`  \x1b[31m✖\x1b[0m ${label}`);
  }
}

console.log("\n==================================================");
console.log("   ITELECT4 GT4 PART 1 - BACKEND VERIFICATION");
console.log("==================================================\n");

// 1. GIT & ENVIRONMENT CHECKS
console.log("\x1b[36m[1/4] Git & Repository Configuration\x1b[0m");
try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  assert(branch === "gt4-part1", `Current branch is "gt4-part1" (detected: "${branch}")`);

  const gitIgnored = execSync("git status --ignored --porcelain", { encoding: "utf8" });
  assert(gitIgnored.includes(".env"), `.env is properly git-ignored`);

  const gitTracked = execSync("git ls-files", { encoding: "utf8" });
  assert(!gitTracked.split("\n").includes(".env"), `.env is NOT tracked in git index`);
} catch (e: any) {
  console.error("  \x1b[31m✖\x1b[0m Git check failed:", e.message);
}

// 2. USER MODEL & VALIDATION CHECKS
console.log("\n\x1b[36m[2/4] User Model & Schema Rules\x1b[0m");
const validUser = new User({
  name: "  Maria Santos  ",
  email: "  MARIA@EXAMPLE.COM  ",
  password: "securepassword123",
  role: "student",
});

assert(validUser.name === "Maria Santos", "Name field is trimmed");
assert(validUser.email === "maria@example.com", "Email field is trimmed and lowercased");
assert(validUser.role === "student", "Default role is 'student'");
assert(validUser.isActive === true, "Default isActive is true");

const userJson = validUser.toJSON();
assert(typeof userJson.id === "string", "toJSON converts _id to string 'id'");
assert(userJson._id === undefined, "toJSON removes '_id'");
assert(userJson.__v === undefined, "toJSON removes '__v'");
assert(userJson.password === undefined, "toJSON strips 'password'");

// User validation failures
const invalidUser = new User({
  name: "",
  email: "",
  password: "short",
  role: "superadmin" as any,
});
const userErr = invalidUser.validateSync();
assert(!!userErr?.errors["name"], "Required name error message enforced");
assert(!!userErr?.errors["email"], "Required email error message enforced");
assert(!!userErr?.errors["password"], "Password minlength (>= 8) enforced");
assert(!!userErr?.errors["role"], "Role enum rule enforced");

// 3. SUBMISSION MODEL & VALIDATION RULES
console.log("\n\x1b[36m[3/4] Custom Resource (Submission) Rules\x1b[0m");
const validSub = new Submission({
  studentId: validUser._id,
  courseCode: "  itelect4  ",
  repoUrl: "  https://github.com/maria/itelect4-project  ",
  score: 98,
  status: "submitted",
});

assert(validSub.courseCode === "ITELECT4", "courseCode is trimmed and converted to uppercase");
assert(validSub.repoUrl === "https://github.com/maria/itelect4-project", "repoUrl is trimmed");
assert(validSub.studentId.toString() === validUser._id.toString(), "studentId references User ObjectId");

const subJson = validSub.toJSON();
assert(typeof subJson.id === "string", "toJSON converts _id to string 'id'");
assert(subJson._id === undefined, "toJSON removes '_id'");
assert(subJson.__v === undefined, "toJSON removes '__v'");

// 3+ Validation Rules Check
const badSub = new Submission({
  studentId: validUser._id,
  courseCode: "",
  repoUrl: "https://not-github.com/invalid/format",
  score: 150,
  status: "archived" as any,
});
const badSubErr = badSub.validateSync();
assert(
  badSubErr?.errors["courseCode"]?.message === "Course code is required",
  "Rule 1: Required field with custom message array [true, '...']"
);
assert(
  badSubErr?.errors["repoUrl"]?.message?.includes("Must be a valid GitHub"),
  "Rule 2: RegEx match rule on repoUrl enforced"
);
assert(
  badSubErr?.errors["score"]?.message?.includes("Score cannot exceed 100"),
  "Rule 3: Numeric range rule (max: 100) enforced"
);
assert(
  !!badSubErr?.errors["status"],
  "Rule 4: Enum rule on status enforced"
);

// 4. AUTH MIDDLEWARE & DATABASE CONNECTION CHECKS
console.log("\n\x1b[36m[4/4] Auth Middleware & Database Connection Config\x1b[0m");

// Auth rejection: missing header
let statusSent = 0;
let jsonSent: any = null;
const mockRes = {
  status(code: number) {
    statusSent = code;
    return this;
  },
  json(data: any) {
    jsonSent = data;
    return this;
  },
} as any;

let nextCalled = false;
authenticate({ headers: {} } as any, mockRes, () => {
  nextCalled = true;
});
assert(statusSent === 401 && !nextCalled, "Auth rejects missing Authorization header with 401");

// Auth success: valid token
process.env.JWT_SECRET = "test-secret-123";
const token = jwt.sign({ userId: "user-abc-123", role: "student" }, process.env.JWT_SECRET);
const successReq = {
  headers: { authorization: `Bearer ${token}` },
} as any;
let authedUserId = "";
authenticate(successReq, mockRes, () => {
  authedUserId = successReq.userId;
});
assert(authedUserId === "user-abc-123", "Auth verifies JWT and attaches req.userId");

// Database URI missing test
const originalUri = process.env.MONGODB_URI;
delete process.env.MONGODB_URI;
let dbErrorThrown = false;
try {
  await connectDB();
} catch (e: any) {
  dbErrorThrown = e.message.includes("MONGODB_URI");
}
assert(dbErrorThrown, "connectDB() immediately throws error when MONGODB_URI is undefined");
process.env.MONGODB_URI = originalUri;

// SUMMARY
console.log("\n--------------------------------------------------");
console.log(`Results: ${passed} / ${total} checks passed (${Math.round((passed / total) * 100)}%)`);
console.log("--------------------------------------------------\n");

if (passed === total) {
  console.log("\x1b[32m✔ ALL GT4 PART 1 ARCHITECTURE SPECIFICATIONS ARE CORRECT!\x1b[0m\n");
} else {
  console.error("\x1b[31m✖ Some checks failed. Please review the output above.\x1b[0m\n");
  process.exit(1);
}
