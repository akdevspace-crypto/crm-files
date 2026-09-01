# ElderCare Enterprise CRM - User Manual & Documentation

Welcome to the **ElderCare Enterprise CRM**, a next-generation, omnichannel customer relationship management system designed for seamless agent workflows, AI-driven insights, and real-time telephony. 

This manual provides a beginner-friendly overview of all the modules, functions, and architecture powering the system.

---

## 🏗️ System Architecture Overview

The CRM is built on a modern, real-time technology stack:
* **Frontend**: Next.js 16 (React) with TailwindCSS and Framer Motion for a dynamic, real-time UI.
* **Backend**: Node.js & Express.js.
* **Database**: Supabase (PostgreSQL) managed via Prisma ORM.
* **Real-time State**: Redis (for agent presence) and Socket.io (for instant signaling).
* **Telephony**: Mediasoup SFU (Selective Forwarding Unit) for high-performance WebRTC voice calls, bridged with Exotel APIs for traditional PSTN networks.
* **AI Engine**: Google Gemini 2.5 Pro for automated call summarization and sentiment analysis.

---

## 📱 Core Modules & Features

### 1. Dashboard & Analytics
**Purpose**: The central command center for agents and supervisors.
* **Real-Time Metrics**: Displays the agent's total calls, average handle time, and active tickets for the day.
* **Agent Status Toggle**: Agents can switch their availability (Available, Busy, Offline) instantly.
* **Global Activity Feed**: A live feed of omnichannel events (incoming calls, new WhatsApp messages, system alerts).

### 2. Call Center & Telephony (WebRTC)
**Purpose**: A fully integrated software-based phone system that eliminates the need for physical desk phones.
* **Inbound Call Routing**: When a customer calls the main company number, the Exotel webhook pings the backend. The backend checks Redis for available agents and routes the call instantly to an agent's screen.
* **Outbound Calling**: Agents can click-to-call any customer directly from the CRM. 
* **Live Call Widget**: A floating interface that handles microphone/speaker muting, call timers, and displays real-time customer profiles (Active Service Plans, Past Notes) while on the call.
* **Graceful Teardown**: Built-in logic ensures that when a call ends, microphone resources are cleanly released and the agent is seamlessly returned to the queue.

### 3. AI Summarization & Call Recording
**Purpose**: Automating the post-call wrap-up process.
* **Background Recording**: All voice calls are silently recorded on the server using FFmpeg and automatically uploaded to secure Supabase Cloud Storage.
* **Gemini AI Integration**: For outbound calls, the recorded audio is instantly analyzed by Google Gemini AI.
* **Automated Notes**: The AI generates a structured JSON report containing:
  * A 2-sentence summary of the conversation.
  * Sentiment analysis (Positive, Neutral, Negative).
  * Escalation Risk Level.
  * Actionable next steps for the agent.
* **Post-Call Feedback**: Agents are prompted with a quick manual feedback modal to classify the disposition (e.g., "Follow-up required") before taking the next call.

### 4. Omnichannel Inbox
**Purpose**: Unifying all text-based customer communication into a single thread.
* **Supported Channels**: WhatsApp (Twilio), Instagram DMs, and standard Email.
* **Unified Thread**: Agents see a single, chronological chat history for a customer, regardless of which platform the customer used to send the message.
* **Quick Replies**: Agents can reply directly from the CRM, and the backend routes the message back to the correct platform (WhatsApp, IG, etc.).

### 5. Customer Data Management
**Purpose**: A 360-degree view of the customer.
* **Dynamic Profiles**: Stores contact info, active service plans, and lifetime interaction history.
* **Automated Context**: When a customer calls or messages, their profile is automatically fetched and displayed next to the communication widget so the agent has instant context.

### 6. Agent Directory & Administration
**Purpose**: Managing the workforce and access controls.
* **Super Admin Role**: A specialized role (enforced at the database level) that allows a single user to manage the entire platform.
* **Agent CRUD**: Admins can Create, Read, Update, and Delete agent profiles.
* **Live Presence Tracking**: The directory shows exactly who is currently online, on a call, or offline, synced via Redis.

### 7. Internal Ticketing System
**Purpose**: Tracking complex issues that require escalation.
* **Ticket Creation**: Agents can convert complex customer queries into internal tickets.
* **Tracking**: Tickets have statuses (Open, In Progress, Resolved) and priorities, allowing teams to collaborate on resolving customer grievances.

---

## 🚀 Beginner Workflows

### How to Handle an Inbound Call
1. Ensure your status on the Dashboard is set to **Available**.
2. When a customer calls, a ringing modal will pop up with their Caller ID.
3. Click **Accept**. The Call Widget will open, connecting your microphone. The customer's profile will automatically load on the screen.
4. Assist the customer.
5. Click **End Call**. You will be seamlessly returned to the Available queue.

### How to Make an Outbound Call
1. Navigate to the **Customer Data** module or the **Omnichannel Inbox**.
2. Click the **Phone Icon** next to a customer's name.
3. The Call Widget will open in "Connecting" mode. 
4. Once the customer answers, the timer begins.
5. Click **End Call**. 
6. Fill out the brief **Post-Call Feedback** popup. 
7. The CRM will automatically attach the recording and AI-generated summary to the customer's profile in the background.

---

## 🛠️ Technical Troubleshooting for Developers

* **Audio Not Connecting?** Ensure you are accessing the CRM via your local Wi-Fi IP address (e.g., `http://192.168.1.5:3000`). Microsoft DevTunnels and Ngrok block the UDP ports (10000-10100) required for WebRTC audio transmission.
* **Backend Crashes on Call End?** The backend handles FFmpeg recording, Supabase uploads, and AI generation asynchronously. These are wrapped in robust `try-catch` blocks to prevent unhandled promise rejections from crashing the WebSocket server.
* **Roles & Permissions**: There can only be one `SUPER_ADMIN`. If you need to reassign it, you must demote the current Super Admin first.
