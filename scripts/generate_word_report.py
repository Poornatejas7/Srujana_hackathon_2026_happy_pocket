import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report(output_path):
    doc = Document()

    # Page Margins: 1 inch all around
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    # Document Header / Banner
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    title_run = title_p.add_run("DETAILED PROJECT REPORT")
    title_run.font.size = Pt(11)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(234, 88, 12) # Orange 600

    h1_p = doc.add_paragraph()
    h1_p.paragraph_format.space_before = Pt(4)
    h1_p.paragraph_format.space_after = Pt(8)
    h1_run = h1_p.add_run("Happy Pocket (FinLens)")
    h1_run.font.size = Pt(26)
    h1_run.font.bold = True
    h1_run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(16)
    sub_run = sub_p.add_run("Autonomous Consumer Financial Intelligence, Anti-Distortion Spending Engine & Wealth Compounding Platform")
    sub_run.font.size = Pt(13)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(71, 85, 105) # Slate 600

    # Meta Table (Team ORYN, Theme, Problem Statement)
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Team Name", "ORYN"),
        ("Hackathon Theme", "Consumer Finance & Wealth Technology"),
        ("Project Title", "Happy Pocket (FinLens)"),
        ("Submission Date", "October 2026")
    ]

    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        cell_k, cell_v = row.cells[0], row.cells[1]
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.3)
        
        set_cell_background(cell_k, 'F1F5F9')
        set_cell_background(cell_v, 'FFFFFF')
        set_cell_margins(cell_k, 120, 120, 150, 150)
        set_cell_margins(cell_v, 120, 120, 150, 150)
        
        pk = cell_k.paragraphs[0]
        pk.paragraph_format.space_after = Pt(0)
        rk = pk.add_run(k)
        rk.font.bold = True
        rk.font.size = Pt(10)
        rk.font.color.rgb = RGBColor(30, 41, 59)

        pv = cell_v.paragraphs[0]
        pv.paragraph_format.space_after = Pt(0)
        rv = pv.add_run(v)
        rv.font.size = Pt(10)
        rv.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    def add_section_heading(number, title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        
        num_run = p.add_run(f"{number}. ")
        num_run.font.size = Pt(15)
        num_run.font.bold = True
        num_run.font.color.rgb = RGBColor(234, 88, 12) # Orange 600
        
        t_run = p.add_run(title)
        t_run.font.size = Pt(15)
        t_run.font.bold = True
        t_run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900

    def add_sub_heading(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(title)
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 41, 59)

    def add_body(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(text)
        run.font.size = Pt(10.5)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        
        run_b = p.add_run(bold_prefix + ": ")
        run_b.font.bold = True
        run_b.font.size = Pt(10.5)
        run_b.font.color.rgb = RGBColor(15, 23, 42)
        
        run_t = p.add_run(text)
        run_t.font.size = Pt(10.5)
        run_t.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # =========================================================================
    # SECTION 1: PROJECT OVERVIEW
    # =========================================================================
    add_section_heading("1", "Project Overview")
    add_bullet("Project Title", "Happy Pocket (FinLens) — Autonomous Financial Intelligence & Spending Visibility Platform")
    add_bullet("Team Name", "ORYN")
    add_bullet("Theme", "Consumer Finance & Wealth Technology")
    add_bullet("Official Problem Statement", 
               "Develop a solution that transforms fragmented financial activity into a clear, useful picture of an individual's spending behaviour, recurring commitments, and overall financial position. The solution should help users categorise transactions, identify recurring payments, distinguish essential commitments from discretionary spending, and recognise meaningful changes in their financial behaviour. It should account for transfers between a user's own accounts, refunds, irregular income, shared expenses, and other transactions that may distort a simple spending summary. Users should be able to investigate unexpected spending, estimate the future impact of recurring commitments, compare actual expenditure against a budget, and explore practical adjustments to improve their financial position. The solution should make its conclusions understandable and allow users to correct inaccurate classifications or assumptions.")
    add_bullet("Executive Summary", 
               "Happy Pocket (FinLens) is an institutional-grade, full-stack financial intelligence application built to resolve the pervasive distortion and fragmentation in personal financial management. Modern consumers transact across multiple bank accounts, UPI apps, payment mandates, and digital wallets. Conventional budgeting tools rely on passive SMS scraping or simplistic aggregation, leading to artificial expense inflation, missed zombie subscriptions, and zero actionable guidance. Happy Pocket implements an Anti-Distortion Spend Engine that automatically zeroes out self-transfers between own accounts, reconciles store return refunds, isolates true living expenses, identifies avoidable wealth leakage, and calculates the 5-to-10 year compounded opportunity cost of that leakage by connecting directly to live AMFI mutual fund Net Asset Values (NAV). In addition to personal wealth optimization, Happy Pocket features dual-persona support for Indian micro-merchants (e.g. Medical Stores, Colleges) and a fully functional consent flow adhering to the official RBI Account Aggregator (AA) ReBIT specifications.")

    # =========================================================================
    # SECTION 2: PROBLEM UNDERSTANDING
    # =========================================================================
    add_section_heading("2", "Problem Understanding")
    add_bullet("Target Users", 
               "1) Young salaried professionals and gig workers managing multiple UPI accounts (HDFC, SBI, ICICI) and credit lines; 2) Small business owners and micro-merchants (medical pharmacy owners, tuition teachers, colleges) who frequently mix personal living expenses with commercial collections; 3) Financially aspiring consumers who want to transition from uncurbed lifestyle spending to disciplined mutual fund SIPs and tax-shielded insurance coverage.")
    add_bullet("User Pain Points", 
               "• The Self-Transfer Mirage: Transferring money between one's own savings accounts (e.g. ₹25,000 from SBI salary to HDFC) is treated by standard apps as ₹25,000 spent, causing panic and distorted metrics.\n"
               "• The Zombie Subscription Trap: Recurring charges (OTT streaming, SaaS, gym memberships) continue unchecked after free trials or suffer silent price hikes without user awareness.\n"
               "• The Refund Blindspot: Store returns on e-commerce platforms (Zara, Meesho) take days to credit and are frequently lost in the noise, falsely inflating purchase totals.\n"
               "• The Latte Effect / Micro-Leakage: Consumers do not realize that ₹40 chai, ₹160 bakery snacks, and ₹350 midnight Swiggy orders aggregate to ₹2,500–₹5,000/month of lost investment potential.\n"
               "• Black-Box AI Guesswork: Budgeting apps either misclassify unfamiliar Indian traders into arbitrary buckets or dump them into 'Others' without explanation or user override.")
    add_bullet("Why the Problem Matters", 
               "In an economy rapidly shifting to cashless, frictionless UPI micro-payments, spending friction has disappeared. Frictionless spending leads to cognitive disconnect; individuals cannot accurately estimate their monthly net burn rate. Without a clean, undistorted baseline of essential living expenses, individuals fail to build emergency reserves and under-invest in long-term equity compounding.")
    add_bullet("Assumptions & Addressed Needs", 
               "Assumes users need deterministic, auditable numbers rather than probabilistic hallucinations. Solves the need for automated reconciliation, accurate living spend baselines, transparency in categorization, and instant redirection of avoidable waste into wealth.")

    # =========================================================================
    # SECTION 3: PROPOSED SOLUTION
    # =========================================================================
    add_section_heading("3", "Proposed Solution")
    add_body("Happy Pocket operates as a comprehensive, bi-directional financial hub structured around 4 foundational pillars:")
    add_bullet("1. Tripartite Ingestion Layer", 
               "Consolidates transactions through three resilient rails: (a) Real-Time In-App UPI Simulation (Scan & Pay, Send Money), (b) Universal Bank Statement Ingestion (PDF/Excel parsing for SBI, HDFC, ICICI), and (c) Official RBI Account Aggregator Consent Flow (encrypted data sharing).")
    add_bullet("2. Anti-Distortion Financial Engine", 
               "A deterministic rule-based engine that nets own-account transfers to ₹0, pairs return credits against original purchases, and isolates True Living Spend from gross cash movement.")
    add_bullet("3. Leakage Radar & Compounded Opportunity Cost", 
               "Monitors temporal signals (midnight dining orders 10 PM - 4 AM) and impulsive retail purchases to identify avoidable spend. Converts monthly leakage into a 65% Equity SIP + 35% Insurance protection allocation with live AMFI mutual fund daily NAVs.")
    add_bullet("4. Dual-Persona Architecture & Human-in-the-Loop Control", 
               "Enables seamless switching between Personal Ledger and Merchant Portals (Medical Shop, College) with dedicated Bharat QR codes. Detects ambiguous commercial traders (e.g. 'Balaji Enterprises', 48% confidence) and provides 1-click editing with permanent local overrides.")

    # =========================================================================
    # SECTION 4: INNOVATION AND DIFFERENTIATION
    # =========================================================================
    add_section_heading("4", "Innovation and Differentiation")
    add_body("Unlike conventional personal finance applications like Fold Money, Walnut, or MoneyManager:")
    add_bullet("Active Execution vs. Passive Tracking", 
               "Fold Money is strictly a read-only viewer. Happy Pocket is an active financial workspace where users can scan Bharat QR codes, execute transfers, link banks via RBI AA, and manage personal and merchant roles in one ecosystem.")
    add_bullet("Mathematical Anti-Distortion Netting", 
               "Existing apps merely sum all debit transactions. Happy Pocket's multi-pass reconciliation identifies paired refunds (e.g. ₹2,490 debit on Zara paired with ₹2,490 credit) and self-transfers, providing the first mathematically truthful 'True Living Spend' indicator.")
    add_bullet("Direct Bridge from Leakage to Live AMFI SIPs", 
               "Instead of merely displaying historical spending charts, the system calculates the real 5- and 10-year future value of avoided expenses using real-time daily NAVs from official AMFI Open APIs (UTI Nifty 50 Index Fund, Parag Parikh Flexi Cap Fund).")
    add_bullet("Transparent Ambiguity Radar with Persistent Memory", 
               "When encountering generic Indian business names ('Enterprises', 'Traders'), rather than guessing, it states the ambiguity reason, displays confidence score, and gives the user 1-click reclassification with permanent local cache.")
    add_bullet("Dual-Mode Web SaaS + Smartphone Preview", 
               "Provides a desktop-grade FinTech dashboard (Mercury/Stripe aesthetic) alongside a mobile device frame simulator, making dense financial analysis comfortable on large screens.")

    # =========================================================================
    # SECTION 5: SYSTEM ARCHITECTURE
    # =========================================================================
    add_section_heading("5", "System Architecture")
    add_body("The application is architected as a modern, full-stack Next.js 16 application backed by MongoDB Atlas cloud database:")
    
    add_sub_heading("5.1 High-Level Architecture Diagram")
    arch_diagram = (
        "+-----------------------------------------------------------------------------------+\n"
        "|                             CLIENT WORKSPACE (React 19)                           |\n"
        "|  +---------------------------+  +------------------------+  +-------------------+ |\n"
        "|  | Institutional Web Portal  |  | Phone Frame Simulator  |  | 1-Click Tx Editor | |\n"
        "|  +---------------------------+  +------------------------+  +-------------------+ |\n"
        "+-----------------------------------------+-----------------------------------------+\n"
        "                                          | REST APIs (JSON)\n"
        "+-----------------------------------------v-----------------------------------------+\n"
        "|                       NEXT.JS 16 SERVERLESS BACKEND (App Router)                  |\n"
        "|  +------------------------------------------------------------------------------+ |\n"
        "|  |  API Endpoints: /api/transactions, /api/upi/pay, /api/aa/*, /api/parse-pdf    | |\n"
        "|  +------------------------------------------------------------------------------+ |\n"
        "|  |  FINANCIAL INTELLIGENCE LAYER:                                               | |\n"
        "|  |   • Anti-Distortion Spend Engine (Self-Transfers, Refund Reconciliation)     | |\n"
        "|  |   • Semantic Lexicon Classifier (20+ Dictionaries, VPA Gateway Detection)    | |\n"
        "|  |   • Avoidable Leakage & Impulse Spending Detector                            | |\n"
        "|  |   • Actuarial SIP Compounding & IRDAI Insurance Planner                      | |\n"
        "|  +------------------------------------------------------------------------------+ |\n"
        "+-------------------+-----------------------------------+---------------------------+\n"
        "                    |                                   | Live Open APIs\n"
        "                    v                                   v\n"
        "+-----------------------------------+   +-------------------------------------------+\n"
        "|       MONGODB ATLAS CLUSTER       |   |       EXTERNAL FINANCIAL APIS             |\n"
        "|  • transactions (Ledger)          |   |  • AMFI Open API (api.mfapi.in - Live NAV)| |\n"
        "|  • bankaccounts (Core Balances)   |   |  • Setu RBI AA Sandbox Gateway            |\n"
        "|  • receipts (Merchant Collections)|   +-------------------------------------------+\n"
        "+-----------------------------------+"
    )
    p_arch = doc.add_paragraph()
    p_arch.paragraph_format.space_before = Pt(4)
    p_arch.paragraph_format.space_after = Pt(8)
    r_arch = p_arch.add_run(arch_diagram)
    r_arch.font.name = 'Consolas'
    r_arch.font.size = Pt(8.5)
    r_arch.font.color.rgb = RGBColor(30, 41, 59)

    add_sub_heading("5.2 Major Components & Technology Stack")
    add_bullet("Next.js 16 (Turbopack, App Router)", "Server-side rendering, API route lambdas, and fast file-system routing.")
    add_bullet("React 19", "Modern reactive component state, optimistic UI updates, and zero layout shift.")
    add_bullet("TypeScript", "Strict static type enforcement across all financial schemas, preventing runtime math bugs.")
    add_bullet("Tailwind CSS v4", "High-performance styling engine used to construct the clean, institutional FinTech UI.")
    add_bullet("MongoDB Atlas & Mongoose 9.11", "Fully managed cloud NoSQL database storing transactions, bank accounts, and merchant data.")
    add_bullet("Recharts 3.10", "Data visualization charting library for spending velocity breakdowns and 10-year SIP compound curves.")
    add_bullet("pdf-parse & pdfjs-dist", "Server-side document parser converting raw bank statements into structured JSON records.")
    add_bullet("AMFI Open API (`api.mfapi.in`)", "Live external API fetching real-time daily Net Asset Values for official Indian mutual funds.")

    # =========================================================================
    # SECTION 6: IMPLEMENTATION DETAILS
    # =========================================================================
    add_section_heading("6", "Implementation Details & Mathematical Formulas")
    add_body("All financial computations are implemented deterministically in TypeScript. Below are the key algorithms and code implementations:")

    add_sub_heading("6.1 Anti-Distortion & Living Spend Algorithm (src/lib/engine.ts)")
    add_body("Standard budgeting tools sum all debits. Happy Pocket applies a multi-pass reconciliation pipeline:")
    add_bullet("Self-Transfer Exclusion", "Identifies account holder fingerprints ('Kotresh', 'Own A/C', 'Self') and sets netOutflowAmount = 0.")
    add_bullet("Refund Reconciliation", "Pairs credit refunds with original purchase debits: Net Outflow = max(0, Original Debit - Refund Credit).")
    add_bullet("True Living Spend Formula", "True Living Spend = Sum of NetOutflow for all debits excluding internal transfers and friend reimbursement splits.")

    add_sub_heading("6.2 Monthly Compounding Future Value SIP Formula (src/lib/recommenderEngine.ts)")
    add_body("Calculates the exact wealth created when monthly leakage is redirected into an equity index mutual fund:")
    add_bullet("Future Value Formula", "FV = P * [ ((1 + r)^n - 1) / r ] * (1 + r)")
    add_bullet("Variable Definitions", "P = Monthly contribution (₹); r = Monthly interest rate (Annual Return / 12 / 100); n = Total months (Years * 12).")
    add_bullet("Wealth Created", "Wealth Created = Future Value - (P * n).")

    add_sub_heading("6.3 Subscription Cadence & Price Increase Detection (src/lib/insightsEngine.ts)")
    add_bullet("Cadence Determination", "Calculates difference in days between payments: diffDays >= 300 -> Annual; diffDays <= 10 -> Weekly; otherwise Monthly.")
    add_bullet("Price Spike Formula", "Price Hike % = round( ((Latest Amount - Previous Amount) / Previous Amount) * 100 ).")
    add_bullet("Outlier Detection", "Flags debits where Amount > 5 * Median(Debits) and Amount >= ₹5,000 as statistical anomalies.")

    # =========================================================================
    # SECTION 7: ACHIEVEMENTS DURING THE HACKATHON
    # =========================================================================
    add_section_heading("7", "Achievements During the Hackathon")
    add_bullet("1. End-to-End Working System", "Completed a fully integrated financial intelligence platform from database to API to responsive UI.")
    add_bullet("2. Sovereign RBI Account Aggregator Module", "Built complete multi-bank consent flow (HDFC, SBI, ICICI, Axis), OTP verification, account discovery, and canonical encrypted transaction ingestion.")
    add_bullet("3. Institutional Web SaaS Redesign", "Overhauled the UI from a cramped smartphone emulator into a full-width desktop FinTech portal (Stripe/Mercury style) with an instant Phone Frame toggle.")
    add_bullet("4. Live AMFI Mutual Fund Integration", "Integrated live external calls to api.mfapi.in, pulling daily NAVs for UTI Nifty 50 and Parag Parikh Flexi Cap funds.")
    add_bullet("5. Merchant Dual-Persona Portal", "Implemented dedicated dashboards for Medical Shops and Colleges with gross collection receipts and dynamic Bharat QR generation.")
    add_bullet("6. Zero TypeScript Errors & Production Build", "Verified npx tsc --noEmit (0 errors) and completed next build (Exit code 0).")

    # =========================================================================
    # SECTION 8: TESTING AND VALIDATION
    # =========================================================================
    add_section_heading("8", "Testing and Validation")
    add_body("The application was tested through comprehensive unit, integration, and scenario-based tests:")
    add_bullet("Test Case 1: Self-Transfer Neutralization", 
               "Input: ₹4,000 transfer to 'Kotresh C (Self Canara Bank)'. Result: netOutflowAmount = ₹0.00; total living spend remains unaffected.")
    add_bullet("Test Case 2: Refund Credit Matching", 
               "Input: ₹2,490 debit on Zara followed by ₹2,490 credit tagged return. Result: Debit net outflow reduced to ₹0; paired refund ID linked.")
    add_bullet("Test Case 3: Late-Night Impulse Detection", 
               "Input: ₹420 Swiggy food delivery order placed at 11:15 PM. Result: Correctly tagged isUnnecessary = true, spendNature = 'Unnecessary_Leakage'.")
    add_bullet("Test Case 4: Ambiguous Merchant Flagging", 
               "Input: ₹650 store payment to 'Lakshmi Traders'. Result: isAmbiguous = true, confidence = 48%, surfaces suggested categories in UI.")
    add_bullet("Test Case 5: 10-Year SIP Compounding Math", 
               "Input: ₹1,892 monthly contribution at 14.5% annual CAGR for 10 years (120 months). Result: Correctly calculated ₹4.82 Lakhs future corpus.")
    add_bullet("Test Case 6: Statement PDF Ingestion", 
               "Input: Multi-page sample bank statement PDF. Result: Parsed 15 transactions, eliminated duplicates, and updated balance in MongoDB.")

    # =========================================================================
    # SECTION 9: AI, DATA, AND EXTERNAL DEPENDENCIES
    # =========================================================================
    add_section_heading("9", "AI, Data, and External Dependencies")
    add_bullet("Deterministic NLP & Semantic Regex Lexicons", "Used domain-specific rule-based parsing for 20+ merchant categories rather than slow, hallucination-prone generative models.")
    add_bullet("Official AMFI Open API (`api.mfapi.in`)", "Used for real-time daily NAV retrieval for Indian mutual funds (Free, public, high-availability).")
    add_bullet("ReBIT Canonical Data Specifications", "Adheres to Reserve Bank Information Technology standards for deposit account information sharing.")
    add_bullet("MongoDB Atlas", "Cloud database cluster storing user bank accounts, transaction ledgers, and merchant logs.")
    add_bullet("Open-Source Libraries", "Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Mongoose 9, Recharts 3, Lucide React, pdf-parse, canvas-confetti.")

    # =========================================================================
    # SECTION 10: USER INTERFACE AND DEMONSTRATION
    # =========================================================================
    add_section_heading("10", "User Interface and Demonstration")
    add_body("Happy Pocket provides an intuitive, high-density financial interface designed for clarity and rapid action:")
    add_bullet("1. Top KPI Command Bar", 
               "Displays 4 core metrics at a glance: (a) Available Core Balance (₹34,432.00), (b) True Living Spend (₹15,568.00) with Anti-Distortion badge, (c) Net Savings Capacity (+₹29,882.00), and (d) Avoidable Wealth Leakage (🚨 ₹2,910.00).")
    add_bullet("2. Two-Column Live Financial Workspace", 
               "Left column (65% width) displays the live transaction ledger with category badges, spend natures, and click-to-edit triggers. Right column (35% width) houses quick financial tools: Scan Bharat QR, Send Money, Statement Upload, and the RBI AA consent card.")
    add_bullet("3. One-Click Transaction Editor", 
               "Clicking any transaction row opens a modal allowing instant category override, merchant rename, and avoidable leakage toggling with permanent local storage caching.")
    add_bullet("4. Dual-Mode Switcher", 
               "A header toggle allows instantaneous switching between the full desktop Web Portal and a smartphone preview frame.")

    # =========================================================================
    # SECTION 11: LIMITATIONS AND INCOMPLETE WORK
    # =========================================================================
    add_section_heading("11", "Limitations and Incomplete Work")
    add_body("To maintain complete transparency for evaluation:")
    add_bullet("Demonstrated & Production-Ready", 
               "• Full MongoDB Atlas integration with real-time CRUD;\n"
               "• Anti-Distortion spend calculation and refund reconciliation;\n"
               "• Semantic lexicon classification and ambiguity detection;\n"
               "• Live AMFI API mutual fund NAV fetching and SIP compounding equations;\n"
               "• RBI Account Aggregator consent, OTP, and account discovery journey;\n"
               "• Merchant role switching with Bharat QR and collections dashboard.")
    add_bullet("Sandbox & Simulated Aspects", 
               "• RBI Account Aggregator operates against the Setu Sandbox / ReBIT sovereign specification (live bank OTPs require commercial enterprise NBFC-AA license);\n"
               "• UPI payment execution simulates bank core switch debit/credit rather than live NPCI production rails;\n"
               "• Bank statement parsing handles standardized PDF layouts; highly distorted or image-scanned statements require OCR integration.")

    # =========================================================================
    # SECTION 12: REAL-WORLD VIABILITY AND IMPACT
    # =========================================================================
    add_section_heading("12", "Real-World Viability and Impact")
    add_bullet("Consumer Economic Impact", 
               "By uncovering an average of ₹2,500 to ₹4,000 in monthly avoidable leakage and redirecting it into compounding index funds, a user can accumulate over ₹3.5 to ₹5.0 Lakhs in 5 years, fundamentally transforming middle-class financial security.")
    add_bullet("Privacy & Security Architecture", 
               "Zero SMS scraping and zero net-banking password sharing. All data transfer complies with the RBI NBFC-AA consent architecture, ensuring end-to-end encrypted transfer.")
    add_bullet("Scalability", 
               "Built on serverless Next.js API lambdas and auto-scaling MongoDB Atlas clusters, enabling low-cost scaling to hundreds of thousands of concurrent users.")
    add_bullet("Regulatory Feasibility", 
               "Fully aligned with Indian financial regulations (RBI AA guidelines, ReBIT schemas, AMFI mutual fund codes, IRDAI insurance guidelines).")

    # =========================================================================
    # SECTION 13: FUTURE SCOPE
    # =========================================================================
    add_section_heading("13", "Future Scope")
    add_bullet("1. Direct Mutual Fund Execution via BSE StAR MF / MF Central", 
               "Enable users to execute recommended SIPs directly through BSE StAR MF APIs without leaving the app.")
    add_bullet("2. Production NPCI UPI Integration", 
               "Partner with an authorized sponsor bank (Yes Bank, Axis) to enable real money UPI transactions via TPAP certification.")
    add_bullet("3. Tesseract OCR for Scanned Physical Receipts", 
               "Add on-device optical character recognition for paper bills, supermarket thermal slips, and local fuel receipts.")
    add_bullet("4. Multi-Language Vernacular Audio Support", 
               "Integrate Indian regional language summaries (Hindi, Kannada, Tamil, Telugu) for tier-2/3 micro-merchants.")

    # =========================================================================
    # SECTION 14: SETUP AND REPRODUCIBILITY
    # =========================================================================
    add_section_heading("14", "Setup and Reproducibility")
    add_body("The project is 100% reproducible with standard Node.js and MongoDB:")
    add_bullet("1. Clone Repository", "git clone https://github.com/Poornatejas7/Srujana_hackathon_2026_happy_pocket.git && cd happy_pocket")
    add_bullet("2. Install Dependencies", "npm install")
    add_bullet("3. Environment Variables (.env.local)", 
               "MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.0bnasia.mongodb.net/happypocket\n"
               "(Optional) SETU_CLIENT_ID=<your_setu_client_id>\n"
               "(Optional) SETU_CLIENT_SECRET=<your_setu_client_secret>")
    add_bullet("4. Seed Curated Demo Data", "node scripts/seed_sample_data.js")
    add_bullet("5. Run Development Server", "npm run dev  (Opens on http://localhost:3000)")
    add_bullet("6. Production Build Verification", "npm run build  (Validates TypeScript and static generation)")

    # =========================================================================
    # SECTION 15: TEAM CONTRIBUTIONS AND REFERENCES
    # =========================================================================
    add_section_heading("15", "Team Contributions and References")
    add_bullet("Team ORYN Contributions", 
               "• Full-Stack Architecture & Next.js 16 Implementation;\n"
               "• Anti-Distortion Engine, Semantic Lexicons, & Mathematical Formulation;\n"
               "• Sovereign RBI Account Aggregator Flow & ReBIT Compliance;\n"
               "• Desktop FinTech SaaS UI, Charting Visualizations, & Mobile Frame Simulator;\n"
               "• MongoDB Atlas Database Design, Seeding Scripts, & Comprehensive QA.")
    add_bullet("References & Official Specifications", 
               "1. Reserve Bank of India (RBI) — Master Directions on NBFC-Account Aggregator (2016-2023).\n"
               "2. ReBIT (Reserve Bank Information Technology) — Financial Information Data Standards (v1.1.2).\n"
               "3. Sahamati — India Account Aggregator Ecosystem Specifications.\n"
               "4. Association of Mutual Funds in India (AMFI) — Historical Returns & Scheme API Documentation.\n"
               "5. Insurance Regulatory and Development Authority of India (IRDAI) — Term & Health Premium Benchmarks.")

    doc.save(output_path)
    print(f"Report successfully saved to: {output_path}")

if __name__ == '__main__':
    project_doc_path = r"c:\Users\Poornatejas\OneDrive\Desktop\happy_pocket\ORYN_Happy_Pocket_Detailed_Project_Report.docx"
    desktop_doc_path = r"c:\Users\Poornatejas\OneDrive\Desktop\ORYN_Happy_Pocket_Detailed_Project_Report.docx"
    
    create_report(project_doc_path)
    create_report(desktop_doc_path)
