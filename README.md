![Thumbnail](images/thumbnail.png)

# Description

A Multi-Agent AI Assistant for Noob Open-source Contributors. It can recommand trending projects for a specific topic, listing beginner-friendly issues, providing initial analysis for an issue.

# Architecture Overview

- User inputs a topic to get recommendations of hot repositories
- Potential Agent -> analyze contribution potential of listed repositories
- User selects a repository to get issues
- Issue Discovery Agent -> read and filter **opening** **unassigned** issues with labels like 'good first issue', 'bug', 'enhancement', etc.
- Display a table with at most 10 issues and their status, labels
- Issue Analysis Agent -> click a specific issue to get initial analysis of solution, with estimated difficulty and workload

![Workflow](images/workflow_diagram.png)

# Motivation
Contributing to open source projects is a good way for developers to get hands-on experience on a specific field in computer science and software engineering. However, choosing a novice-friendly project, filtering doable issues based on a person's experience is sometimes time-consuming and confusing. To ramp up with a new code repository, it involves understanding the code architecture through reading documents and core pieces of code. To pick up a doable issues, developers need to read conversations and contexts of unsolved issues, estimating the difficulty of the issue and workload accordingly. These tasks are the ones that current LLM models and agents can perform welll on for human developers. 

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
