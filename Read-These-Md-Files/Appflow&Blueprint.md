# Application Flow & Blueprint - CookLog

## 1. User Workflows

### A. The Developer (Content Creator Workflow)
1. **Land on Application:** Accesses the platform; if unauthenticated, views a clean marketing banner.
2. **Access Dashboard:** Signs in to access the private editor workspace.
3. **Select/Create Category:** Picks an existing book context (e.g., *Linear Algebra Primer*) or logs a new textbook title.
4. **Publish Solution:** Inputs the problem details, adds explicit code solutions, and hits "Save to Profile." Data instantly commits to the storage driver.

### B. The Recruiter (Viewer Workflow)
1. **Access Public Route:** Lands directly on the developer's unique link (e.g., `/profile/your-username`).
2. **Scan Overview:** Sees profile metadata, bio, social links, and total topic breakdown immediately.
3. **Filter Topics:** Clicks on specific categories (e.g., "Math" or "Algorithms") to instantly narrow down entries.
4. **Inspect Code Quality:** Expands a question block to read the clean code implementation and written problem explanation.

## 2. Data Lifecycle Blueprint
* **Creation:** Raw string data collected via controlled React inputs -> Sanitized against TypeScript contracts (`QuestionEntry`).
* **Persistence:** Serialized directly into JSON strings -> Committed via `localStorage.setItem()`.
* **Hydration:** Loaded on mount via `useEffect` hooks -> Checked for type validity -> Rendered seamlessly down the component tree.