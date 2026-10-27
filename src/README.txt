=================================================================
AUTONOMOUS WHATSAPP AI ORCHESTRATOR (BOT-RTRW-NET)
=================================================================

A lightweight, production-ready backend automation system that 
uses LLMs and WhatsApp web automation to handle inbound customer 
service routing, ticketing, and technician scheduling autonomously 
without human intervention.

-----------------------------------------------------------------
KEY FEATURES
-----------------------------------------------------------------
- Autonomous Inbound Routing: 
  Automatically processes, categorizes, and responds to customer 
  inquiries via WhatsApp message handler.

- LLM-Powered Intelligence: 
  Integrated with Google Gemini API, custom prompts, schemas, and 
  memory management for dynamic agentic responses.

- Low-Code Persistence Layer: 
  Utilizes Google Sheets API as a rapid, lightweight database 
  for logging tickets and tracking operational states.

- Modular Testing Environment: 
  Includes dedicated test scripts for AI agents, Gemini API 
  integration, and Google Sheets modules.

- Resilient Background Execution: 
  Managed via PM2 and environment configurations for stable 24/7 
  background uptime on a Linux VPS.

-----------------------------------------------------------------
TECH STACK
-----------------------------------------------------------------
- Runtime: Node.js, Express
- WhatsApp Automation: whatsapp-web.js
- AI & LLM: Google Gemini API, Custom Agent Prompts & Schemas
- Database / Storage: Google Sheets API
- Infrastructure: Linux VPS, PM2 Process Manager

-----------------------------------------------------------------
PROJECT STRUCTURE
-----------------------------------------------------------------
Bot-rtrw-net/
├── .env                  # Environment variables (Secrets)
├── .gitignore            # Ignored files and directories
├── credentials.json      # Google Sheets API credentials (Secrets)
├── package.json          # Dependencies and scripts
└── src/
    ├── index.js          # Application entry point
    ├── ai/               # AI core architecture
    │   ├── Agent.js      # Main AI agent logic
    │   ├── memory.js     # Conversation memory handler
    │   ├── prompts.js    # System prompts definition
    │   ├── schemas.js    # Data validation & parsing schemas
    │   ├── testAgent.js  # Agent isolated test script
    │   └── testGemini.js # Gemini API connectivity test
    ├── handlers/         # Business logic handlers
    │   └── messageHandler.js # Inbound message router & processor
    └── services/         # External integrations
        ├── sheets.js          # Google Sheets API service
        ├── testModulSheets.js # Sheets module unit test
        ├── testSheets.js      # Sheets integration test
        └── whatsapp.js        # WhatsApp client wrapper

-----------------------------------------------------------------
GETTING STARTED (LOCAL SETUP)
-----------------------------------------------------------------
1. Clone the repository:
   git clone https://github.com/jimmyrmdn29/Autonomous-Whatsapp-AI-ORchestrator
2. Install dependencies:
   npm install

3. Configure environment variables:
   Create a .env file and add your GEMINI_API_KEY and 
   configuration variables. Place your credentials.json 
   in the root directory.

4. Run the application:
   npm start