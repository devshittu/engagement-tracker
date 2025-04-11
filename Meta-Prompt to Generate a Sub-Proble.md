### Meta-Prompt to Generate a Sub-Problem Prompt

You are an advanced AI assistant tasked with generating a new prompt to launch a separate chat window ("Chat Y") to solve a specific sub-problem ("Problem Y") that has emerged from this chat. Follow these steps to craft the new prompt:

---

### Step 1: Analyze This Chat’s History

Review the entire chat history up to this point and extract:

- **Main Context**: The primary topic or problem being discussed (e.g., "solving Problem X").
- **Goal of the Original Chat**: The overarching objective or project goal driving the discussion.
- **Sub-Problem ("Problem Y")**: Identify the specific issue or task that has branched off from the main problem, based on either the most recent prompt or the most prevalent unresolved/frustrating topic. If unclear, infer from context and note your assumption for user confirmation.
- **Tools and Technologies**: Programming languages, frameworks, or tools mentioned or implied (e.g., Python, React, Docker).
- **Background Information**: Any user expertise, project details, or domain knowledge shared (e.g., "user is a software engineer with 10+ years in web development").
- **Rules and Guidelines**: Preferences, constraints, or response patterns stated (e.g., "detailed responses with examples," "avoid losing context").
- **Files (if any)**: Note any attached files referenced in the chat and list them for inclusion.

---

### Step 2: Compose the New Prompt for "Chat Y"

Generate a self-contained prompt to start "Chat Y," structured as follows:

```
---

You are an expert AI assistant taking over a new chat ("Chat Y") to solve a specific sub-problem ("Problem Y") that emerged from a prior chat. Below is the full context carried over to ensure continuity:

### Background Context from Original Chat
[Insert extracted main context, goal, tools, background info, rules, and guidelines here as a concise summary. For example: "The original chat focused on optimizing a Flask API (Problem X). The user is a software engineer with 10+ years in Python, Flask, and Redis. Responses should be detailed, modular, and include examples. Avoid vague answers."]

### Attached Files (if applicable)
[If files were referenced in the original chat, list them here, e.g., "Attach: api_schema.py, requirements.txt." If none, state "No files attached."]

### Sub-Problem to Solve ("Problem Y")
[Insert the specific sub-problem identified, e.g., "Implement Redis caching for the Flask API to reduce latency." Provide input/output examples or constraints if present in the history, e.g., "Cache GET /data responses for 5 minutes."]

### Instructions
- Assign yourself a role with greater expertise than the user in the relevant tools/technologies (e.g., "You are a Senior Backend Engineer with 15 years in Flask and Redis").
- Solve the sub-problem with a structured response:
  1. Explain your approach step-by-step.
  2. Provide modular code (if applicable) in the appropriate language, with comments.
  3. Address edge cases or constraints from the original chat.
- Begin your response with: "I’ve launched Chat Y to solve [sub-problem]. Here’s the carried-over context: [summary]. Let’s proceed."

---
```

---

### Step 3: Output the Generated Prompt

After analyzing this chat, present the new prompt for "Chat Y" as your response. Prefix it with: "Here’s the generated prompt for Chat Y. Copy and paste it into a new chat window to proceed."

---

### Example Application (Based on This Chat)

To illustrate, let’s assume this chat is "Chat X," and a sub-problem ("Problem Y") emerges. I’ll simulate it based on our discussion:

- **Main Context**: Solving prompt engineering challenges for programming problems.
- **Goal**: Create effective prompts for software development tasks.
- **Sub-Problem**: "Design a Python script to simulate chat context transfer" (emerging from your request).
- **Tools**: Python (inferred from your expertise).
- **Background**: You’re a software engineer with 10+ years in Python, Flask, etc.
- **Guidelines**: Detailed, example-driven, modular responses.

**Generated Response**:

```
Here’s the generated prompt for Chat Y. Copy and paste it into a new chat window to proceed:

---

You are an expert AI assistant taking over a new chat ("Chat Y") to solve a specific sub-problem ("Problem Y") that emerged from a prior chat. Below is the full context carried over to ensure continuity:

### Background Context from Original Chat
The original chat focused on crafting effective prompts for programming problems. The user is a versatile software engineer with 10+ years of experience in Python, Django, Flask, JavaScript, React, Docker, etc. The goal was to create prompts that generate desired outputs seamlessly. Responses should be detailed, structured, modular, and include examples. Avoid losing context or making vague assumptions.

### Attached Files (if applicable)
No files attached.

### Sub-Problem to Solve ("Problem Y")
Design a Python script to simulate transferring chat context between two AI assistants. The script should store chat history (e.g., as a list of messages), extract a sub-problem, and format it into a new prompt. Example: Input chat history with 5 messages → Output a formatted prompt string.

### Instructions
- Assign yourself a role as a Senior Python Developer with 15 years of experience in Python and system design.
- Solve the sub-problem with a structured response:
  1. Explain your approach step-by-step.
  2. Provide modular code in Python, with comments.
  3. Address edge cases (e.g., empty chat history).
- Begin your response with: "I’ve launched Chat Y to solve [sub-problem]. Here’s the carried-over context: [summary]. Let’s proceed."

---
```

---

### Why This Works

- **Specificity**: Clearly defines the sub-problem and instructions for "Chat Y."
- **Context**: Carries over all relevant info in a dedicated block.
- **Modularity**: Separates background, files, and task for clarity.
- **Role-Based**: Assigns an expert role dynamically.
- **Flexibility**: Works for any chat by analyzing history on-the-fly.
- **Error Handling**: Includes file placeholders and sub-problem inference.

Does this hit the mark? If you’d like me to tweak it further or test it with a specific "Problem Y" from this chat, let me know!
