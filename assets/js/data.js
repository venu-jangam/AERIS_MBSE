/* =====================================================================
   AERIS FDM SYSTEM — MBSE MODEL DATA
   Space Copy Inc. | Seed dataset (SysML v2-aligned)
   ---------------------------------------------------------------------
   This file is the authoritative in-browser model store. It mirrors the
   Neo4j schema from the master spec (Module 1.2) as plain JS objects so
   the dashboard runs fully offline with zero build step.

   Each collection corresponds to a node type; AERIS.edges holds the typed
   relationships used by the Digital Thread impact-traversal engine.

   NOTE: The original .docx/.pdf/.xlsx source documents were not present in
   the project folder, so this model is seeded from the AERIS Master
   Development Prompt (requirement IDs, FFBD steps, control loops, PLC
   phases, risks, BOM categories, design tokens). Swap any collection for
   parsed source data without touching the view layer.
   ===================================================================== */
(function (global) {
  "use strict";

  /* ---- Design tokens (match AERIS documents) ---------------------- */
  const TOKENS = {
    primary: "#0A1628", accent: "#1A6EFF",
    stage1: "#3B82F6", stage2: "#F97316", stage3: "#EAB308", stage4: "#22C55E",
    crosscut: "#6B7280", alertRed: "#EF4444", alertAmber: "#F59E0B",
    deferred: "#7C3AED", background: "#0D1117", surface: "#161B22", border: "#30363D",
  };

  /* ---- Category color map for requirement chips ------------------- */
  const CATEGORY_COLOR = {
    FR: "#1A6EFF", OR: "#22C55E", ER: "#F97316",
    IR: "#06B6D4", C: "#A855F7", SC: "#EF4444",
  };

  /* =================================================================
     REQUIREMENTS  (:Requirement)
     Source: SpaceCopy_Requirements_Matrix_Complete_Rev_0_1.xlsx
     ================================================================= */
  const requirements = [
    // Functional Requirements
    { id: "FR-1", title: "Autonomous Feedstock-to-Part Production", category: "FR",
      text: "The system shall autonomously convert raw granular feedstock into finished functional parts with minimal crew intervention across all four pipeline stages.",
      status: "In Progress", verificationMethod: "Demonstration", deferred: false, pbs: ["1", "2", "3", "4"] },
    { id: "FR-2", title: "Dimensional Repeatability", category: "FR",
      text: "The system shall produce parts within a dimensional repeatability tolerance suitable for functional aerospace components across consecutive print cycles.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["2", "3"] },
    { id: "FR-3", title: "Material Beneficiation & Filament Conversion", category: "FR",
      text: "The system shall mill, anneal, integrate binder, and convert beneficiated slurry into print-ready wire filament.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["1", "2"] },
    { id: "FR-4", title: "CAD Repository & Slicing", category: "FR",
      text: "The system shall maintain an onboard CAD/part repository and generate sliced toolpaths for the print engine.",
      status: "Open", verificationMethod: "Inspection", deferred: false, pbs: ["6"] },
    { id: "FR-5", title: "In-Process Monitoring", category: "FR",
      text: "The system shall continuously monitor thermal, motion, and quality parameters during all stages and raise alerts on out-of-tolerance conditions.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["5", "6"] },
    { id: "FR-6", title: "Data Logging & Downlink", category: "FR",
      text: "The system shall log all sensor, decision, and event data and provide a downlink/export path for ground or crew review.",
      status: "In Progress", verificationMethod: "Demonstration", deferred: false, pbs: ["6", "8"] },

    // Operational Requirements
    { id: "OR-1", title: "Minimal Crew Intervention", category: "OR",
      text: "The system shall operate with minimal crew intervention during nominal production cycles.",
      status: "In Progress", verificationMethod: "Demonstration", deferred: false, pbs: ["8"] },
    { id: "OR-2", title: "Field-Deployable Footprint", category: "OR",
      text: "The system shall be deployable within the AERIS STANDARD envelope (~2700 x 1620 x 1740 mm) in remote and industrial environments.",
      status: "Verified", verificationMethod: "Inspection", deferred: false, pbs: ["7", "8"] },
    { id: "OR-3", title: "Remote Monitoring & Control", category: "OR",
      text: "The system shall support remote monitoring and supervisory control via the HMI and remote interface.",
      status: "In Progress", verificationMethod: "Demonstration", deferred: false, pbs: ["8"] },
    { id: "OR-4", title: "Power Management", category: "OR",
      text: "The system shall manage power within 3 kW peak / 2.5 kW continuous (STANDARD) including battery buffering and load shedding.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["7"] },
    { id: "OR-5", title: "Operator Training & Guidance", category: "OR",
      text: "The system shall provide onboard operator training and guided-procedure support through the interface subsystem.",
      status: "Open", verificationMethod: "Demonstration", deferred: false, pbs: ["8"] },

    // Environmental Requirements (ER-1, ER-2, ER-4 deferred — spaceflight)
    { id: "ER-1", title: "Microgravity Operation", category: "ER",
      text: "The system shall operate under microgravity conditions for spaceflight deployment.",
      status: "Deferred", verificationMethod: "Analysis", deferred: true, pbs: ["1", "3", "4"] },
    { id: "ER-2", title: "Vacuum / Low-Pressure Operation", category: "ER",
      text: "The system shall operate within vacuum or low-pressure spaceflight cabin environments.",
      status: "Deferred", verificationMethod: "Analysis", deferred: true, pbs: ["3", "7"] },
    { id: "ER-3", title: "Thermal Environment Tolerance", category: "ER",
      text: "The system shall operate within the specified ambient and process thermal envelope and manage chamber/nozzle heat.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["3", "7"] },
    { id: "ER-4", title: "Radiation Tolerance", category: "ER",
      text: "The system electronics shall tolerate the spaceflight radiation environment (rad-hard qualified components).",
      status: "Deferred", verificationMethod: "Analysis", deferred: true, pbs: ["5", "6", "7"] },
    { id: "ER-5", title: "Vibration & Shock", category: "ER",
      text: "The system shall withstand transport, launch, and operational vibration and shock loads.",
      status: "Open", verificationMethod: "Test", deferred: false, pbs: ["1", "3"] },
    { id: "ER-6", title: "Crew Safety", category: "ER",
      text: "The system shall protect crew from thermal, mechanical, and particulate hazards during all modes of operation.",
      status: "In Progress", verificationMethod: "Inspection", deferred: false, pbs: ["4", "8"] },

    // Interface Requirements
    { id: "IR-1", title: "Mechanical Interface", category: "IR",
      text: "The system shall provide standardized mechanical mounting and modular structural interfaces between subsystems.",
      status: "Verified", verificationMethod: "Inspection", deferred: false, pbs: ["1", "3", "4"] },
    { id: "IR-2", title: "Electrical Interface", category: "IR",
      text: "The system shall provide standardized electrical power and signal interfaces via the PDU.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["7"] },
    { id: "IR-3", title: "Data Interface", category: "IR",
      text: "The system shall provide a standardized data bus interface for sensor, command, and downlink traffic.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["5", "6"] },
    { id: "IR-4", title: "Modular Interface", category: "IR",
      text: "The system shall support modular replacement of subsystems and tooling without full system teardown.",
      status: "Open", verificationMethod: "Demonstration", deferred: false, pbs: ["4", "8"] },

    // Constraints
    { id: "C-1", title: "Power Envelope Constraint", category: "C",
      text: "Total system power shall not exceed 3 kW peak / 2.5 kW continuous (AERIS STANDARD).",
      status: "Verified", verificationMethod: "Analysis", deferred: false, pbs: ["7"] },
    { id: "C-2", title: "Mass & Envelope Constraint", category: "C",
      text: "Subsystem masses and overall envelope shall remain within the AERIS Dimensions specification.",
      status: "Verified", verificationMethod: "Inspection", deferred: false, pbs: ["1", "3"] },
    { id: "C-3", title: "Material Constraint", category: "C",
      text: "Binder content shall not exceed 20% PEEK; particle size shall remain 40-70 micron post-milling.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["1", "2"] },
    { id: "C-4", title: "Build Volume Constraint", category: "C",
      text: "Build volume shall be 914 x 914 x 1524 mm (STANDARD) / 226 x 226 x 366 mm (DESKTOP).",
      status: "Verified", verificationMethod: "Inspection", deferred: false, pbs: ["3"] },
    { id: "C-5", title: "Standards Compliance", category: "C",
      text: "Systems engineering activities shall comply with NASA/SP-2016-6105 Rev 2.",
      status: "In Progress", verificationMethod: "Inspection", deferred: false, pbs: ["6", "8"] },

    // System Capability / Safety-Critical
    { id: "SC-1", title: "Safe-Mode Transition", category: "SC",
      text: "The system shall transition to a SAFE mode on detection of any critical thermal, motion, or feed fault.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["6", "7"] },
    { id: "SC-2", title: "Fault Detection & Isolation", category: "SC",
      text: "The system shall detect, isolate, and annunciate subsystem faults to the operator.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["5", "6"] },
    { id: "SC-3", title: "Emergency Stop", category: "SC",
      text: "The system shall provide a hardware and software emergency-stop that halts all actuation.",
      status: "Verified", verificationMethod: "Test", deferred: false, pbs: ["7", "8"] },
    { id: "SC-4", title: "Thermal Runaway Protection", category: "SC",
      text: "The system shall prevent thermal runaway via redundant temperature limits and heater cutoff.",
      status: "In Progress", verificationMethod: "Test", deferred: false, pbs: ["3", "7"] },
    { id: "SC-5", title: "Collision Avoidance", category: "SC",
      text: "The 5-DOF post-processing arm shall avoid collision with the build, chamber, and tooling via proximity sensing.",
      status: "Open", verificationMethod: "Test", deferred: false, pbs: ["4", "5"] },
  ];

  /* =================================================================
     SUBSYSTEMS  (:Subsystem)  — PBS nodes 1..8 + child nodes
     Color scheme from AERIS_Diagram_Reference_Guide.docx
     ================================================================= */
  const subsystems = [
    { pbsId: "1", name: "Material Beneficiation Unit (MBU)", color: TOKENS.stage1, parentId: null, ffbdStage: 1, trlCurrent: 5,
      desc: "Mills, anneals, and beneficiates raw granular feedstock into binder-integrated slurry.", req: ["FR-1","FR-3","ER-1","ER-5","IR-1","C-2","C-3"] },
    { pbsId: "1.1", name: "Ball Mill Assembly", color: TOKENS.stage1, parentId: "1", ffbdStage: 1, trlCurrent: 5, desc: "1,200 RPM milling to 40-70 micron particle size.", req: ["FR-3","C-3"] },
    { pbsId: "1.2", name: "Annealing Module", color: TOKENS.stage1, parentId: "1", ffbdStage: 1, trlCurrent: 4, desc: "200 degC anneal of milled powder.", req: ["FR-3","ER-3"] },
    { pbsId: "1.3", name: "Binder Integration Unit", color: TOKENS.stage1, parentId: "1", ffbdStage: 1, trlCurrent: 4, desc: "PEEK binder integration <= 20%.", req: ["FR-3","C-3"] },

    { pbsId: "2", name: "Filament Production Subsystem", color: TOKENS.stage2, parentId: null, ffbdStage: 2, trlCurrent: 4,
      desc: "Converts slurry to wire filament and loads the extruder via WC nozzle.", req: ["FR-2","FR-3","C-3"] },
    { pbsId: "2.1", name: "Funneling & Feed", color: TOKENS.stage2, parentId: "2", ffbdStage: 2, trlCurrent: 5, desc: "Feeds slurry into wire conversion.", req: ["FR-3"] },
    { pbsId: "2.2", name: "Wire Conversion Die", color: TOKENS.stage2, parentId: "2", ffbdStage: 2, trlCurrent: 4, desc: "Converts material to print-ready wire.", req: ["FR-2","FR-3"] },
    { pbsId: "2.3", name: "Extruder / WC Nozzle", color: TOKENS.stage2, parentId: "2", ffbdStage: 2, trlCurrent: 4, desc: "Tungsten-carbide nozzle; FMEA-critical.", req: ["FR-2","ER-3"], critical: true },

    { pbsId: "3", name: "Print Engine (Gantry)", color: TOKENS.stage3, parentId: null, ffbdStage: 3, trlCurrent: 5,
      desc: "Pre-heats, deposits layers, and completes prints across the 1,000 mm build volume.", req: ["FR-1","FR-2","ER-2","ER-3","ER-5","C-4","SC-4"] },
    { pbsId: "3.1", name: "Gantry Motion System", color: TOKENS.stage3, parentId: "3", ffbdStage: 3, trlCurrent: 5, desc: "XYZ gantry, 1,000 mm build volume.", req: ["FR-2","C-4"] },
    { pbsId: "3.2", name: "Hot End & Band Heaters", color: TOKENS.stage3, parentId: "3", ffbdStage: 3, trlCurrent: 5, desc: "Nozzle thermal zone with band heaters.", req: ["ER-3","SC-4"] },
    { pbsId: "3.3", name: "Build Plate / Chamber", color: TOKENS.stage3, parentId: "3", ffbdStage: 3, trlCurrent: 5, desc: "1,420 x 1,420 mm FDM chamber, 220 kg.", req: ["C-2","C-4"] },

    { pbsId: "4", name: "Post-Processing Unit", color: TOKENS.stage4, parentId: null, ffbdStage: 4, trlCurrent: 3,
      desc: "5-DOF robotic arm for thermal check, support removal, defect correction, and retrieval.", req: ["FR-1","ER-6","IR-4","SC-5"] },
    { pbsId: "4.1", name: "5-DOF Robotic Arm", color: TOKENS.stage4, parentId: "4", ffbdStage: 4, trlCurrent: 3, desc: "Articulated arm; joints FMEA-critical.", req: ["SC-5","IR-4"], critical: true },
    { pbsId: "4.2", name: "Magnetic Tool Changer", color: TOKENS.stage4, parentId: "4", ffbdStage: 4, trlCurrent: 3, desc: "Selects post-processing tooling.", req: ["IR-4"] },
    { pbsId: "4.3", name: "Sealed Collection Bin", color: TOKENS.stage4, parentId: "4", ffbdStage: 4, trlCurrent: 6, desc: "400 x 400 mm sealed part bin.", req: ["ER-6"] },

    { pbsId: "5", name: "Sensing & Inspection Suite", color: TOKENS.crosscut, parentId: null, ffbdStage: null, trlCurrent: 4,
      desc: "Cameras, thermocouples, and SWIR for in-process and QC sensing.", req: ["FR-5","ER-4","IR-3","SC-2","SC-5"] },
    { pbsId: "5.1", name: "Thermocouple Array", color: TOKENS.crosscut, parentId: "5", ffbdStage: null, trlCurrent: 6, desc: "Process temperature sensing; FMEA-critical.", req: ["FR-5","ER-3"], critical: true },
    { pbsId: "5.2", name: "Vision Cameras", color: TOKENS.crosscut, parentId: "5", ffbdStage: null, trlCurrent: 5, desc: "Layer/defect imaging for ML QA.", req: ["FR-5","SC-2"] },
    { pbsId: "5.3", name: "SWIR Spectral Sensor", color: TOKENS.crosscut, parentId: "5", ffbdStage: null, trlCurrent: 3, desc: "Short-wave IR material inspection.", req: ["FR-5"] },

    { pbsId: "6", name: "Software & Data Management", color: TOKENS.crosscut, parentId: null, ffbdStage: null, trlCurrent: 4,
      desc: "ML defect detection, slicing, QA, control loops, logging, and CAD repository.", req: ["FR-4","FR-5","FR-6","C-5","SC-1","SC-2"] },
    { pbsId: "6.1", name: "Control Loop Runtime", color: TOKENS.crosscut, parentId: "6", ffbdStage: null, trlCurrent: 4, desc: "Hosts CL-1..CL-5.", req: ["FR-5","SC-1"] },
    { pbsId: "6.2", name: "ML Defect Detection (CNN)", color: TOKENS.crosscut, parentId: "6", ffbdStage: null, trlCurrent: 3, desc: "CNN-based defect classification.", req: ["FR-5","SC-2"] },
    { pbsId: "6.6", name: "CAD Repository", color: TOKENS.crosscut, parentId: "6", ffbdStage: null, trlCurrent: 5, desc: "Onboard part/CAD store and slicer.", req: ["FR-4"] },

    { pbsId: "7", name: "Power & Thermal Management", color: TOKENS.crosscut, parentId: null, ffbdStage: null, trlCurrent: 5,
      desc: "PDU, batteries, heaters, and fans managing the 3 kW envelope.", req: ["OR-4","ER-2","ER-3","ER-4","IR-2","C-1","SC-1","SC-3","SC-4"] },
    { pbsId: "7.1", name: "Power Distribution Unit (PDU)", color: TOKENS.crosscut, parentId: "7", ffbdStage: null, trlCurrent: 6, desc: "Electrical distribution and load shedding.", req: ["OR-4","IR-2","C-1"] },
    { pbsId: "7.2", name: "Battery Buffer", color: TOKENS.crosscut, parentId: "7", ffbdStage: null, trlCurrent: 5, desc: "Peak-shaving energy storage.", req: ["OR-4"] },
    { pbsId: "7.3", name: "Heaters & Fans", color: TOKENS.crosscut, parentId: "7", ffbdStage: null, trlCurrent: 6, desc: "Thermal actuation for CL-1.", req: ["ER-3","SC-4"] },

    { pbsId: "8", name: "Interface & Controls", color: TOKENS.crosscut, parentId: null, ffbdStage: null, trlCurrent: 5,
      desc: "HMI, remote monitoring, operator training, and emergency controls.", req: ["OR-1","OR-3","OR-5","ER-6","IR-4","C-5","SC-3"] },
    { pbsId: "8.1", name: "HMI Console", color: TOKENS.crosscut, parentId: "8", ffbdStage: null, trlCurrent: 6, desc: "Local operator interface.", req: ["OR-3","ER-6"] },
    { pbsId: "8.2", name: "Remote Monitoring Link", color: TOKENS.crosscut, parentId: "8", ffbdStage: null, trlCurrent: 5, desc: "Supervisory remote control.", req: ["OR-3","FR-6"] },
    { pbsId: "8.3", name: "E-Stop & Safety Controls", color: TOKENS.crosscut, parentId: "8", ffbdStage: null, trlCurrent: 7, desc: "Hardware/software emergency stop.", req: ["SC-3"] },
  ];

  /* =================================================================
     COMPONENTS  (:Component) — Space_Copy_BOM_Rev_2_April_2026.xlsx
     ================================================================= */
  const components = [
    { partNumber: "MBU-BM-1200", name: "Ball Mill Drive (1200 RPM)", pbsId: "1.1", quantity: 1, unitCost: 4200, supplier: "Retsch", bomRev: 2, rev1Cost: 3900, notes: "" },
    { partNumber: "MBU-ANL-200", name: "Annealing Heater Cartridge", pbsId: "1.2", quantity: 4, unitCost: 180, supplier: "Watlow", bomRev: 2, rev1Cost: 180, notes: "" },
    { partNumber: "MBU-BND-PEEK", name: "PEEK Binder Dosing Pump", pbsId: "1.3", quantity: 1, unitCost: 1350, supplier: "ViscoTec", bomRev: 2, rev1Cost: 1100, notes: "Rev2 upsized" },
    { partNumber: "FIL-FUN-01", name: "Slurry Funnel & Hopper", pbsId: "2.1", quantity: 1, unitCost: 620, supplier: "Custom", bomRev: 2, rev1Cost: 620, notes: "" },
    { partNumber: "FIL-WCD-02", name: "Wire Conversion Die", pbsId: "2.2", quantity: 1, unitCost: 2750, supplier: "Custom", bomRev: 2, rev1Cost: 2400, notes: "" },
    { partNumber: "FIL-WCN-03", name: "Tungsten-Carbide Extruder Nozzle", pbsId: "2.3", quantity: 2, unitCost: 980, supplier: "Kennametal", bomRev: 2, rev1Cost: 880, notes: "FMEA-critical (clog)", critical: true },
    { partNumber: "GAN-XYZ-01", name: "XYZ Gantry Motion Kit", pbsId: "3.1", quantity: 1, unitCost: 5400, supplier: "Hiwin", bomRev: 2, rev1Cost: 5400, notes: "" },
    { partNumber: "GAN-BND-HTR", name: "Band Heater Set", pbsId: "3.2", quantity: 6, unitCost: 95, supplier: "Watlow", bomRev: 2, rev1Cost: 88, notes: "Thermal zone" },
    { partNumber: "GAN-CHM-1420", name: "FDM Chamber Enclosure", pbsId: "3.3", quantity: 1, unitCost: 8800, supplier: "Custom", bomRev: 2, rev1Cost: 8800, notes: "220 kg" },
    { partNumber: "PPU-ARM-5DOF", name: "5-DOF Robotic Arm", pbsId: "4.1", quantity: 1, unitCost: 14500, supplier: "Universal Robots", bomRev: 2, rev1Cost: 12900, notes: "FMEA-critical (joints)", critical: true },
    { partNumber: "PPU-TCH-MAG", name: "Magnetic Tool Changer", pbsId: "4.2", quantity: 1, unitCost: 1900, supplier: "ATI", bomRev: 2, rev1Cost: 1900, notes: "" },
    { partNumber: "PPU-BIN-400", name: "Sealed Collection Bin", pbsId: "4.3", quantity: 1, unitCost: 540, supplier: "Custom", bomRev: 2, rev1Cost: 540, notes: "" },
    { partNumber: "SEN-TC-K", name: "Type-K Thermocouple", pbsId: "5.1", quantity: 12, unitCost: 28, supplier: "Omega", bomRev: 2, rev1Cost: 28, notes: "FMEA-critical (sense loss)", critical: true },
    { partNumber: "SEN-CAM-4K", name: "4K Vision Camera", pbsId: "5.2", quantity: 3, unitCost: 460, supplier: "Basler", bomRev: 2, rev1Cost: 420, notes: "" },
    { partNumber: "SEN-SWIR-01", name: "SWIR Spectral Sensor", pbsId: "5.3", quantity: 1, unitCost: 7600, supplier: "Xenics", bomRev: 2, rev1Cost: 6800, notes: "Spectral drift risk" },
    { partNumber: "SW-EDGE-GPU", name: "Edge ML Compute Module", pbsId: "6.2", quantity: 1, unitCost: 2200, supplier: "NVIDIA Jetson", bomRev: 2, rev1Cost: 1800, notes: "Rev2 upgraded" },
    { partNumber: "SW-STORE-2TB", name: "Logging / CAD Storage 2TB", pbsId: "6.6", quantity: 2, unitCost: 240, supplier: "Samsung", bomRev: 2, rev1Cost: 240, notes: "" },
    { partNumber: "PWR-PDU-3KW", name: "3 kW Power Distribution Unit", pbsId: "7.1", quantity: 1, unitCost: 3100, supplier: "Vicor", bomRev: 2, rev1Cost: 2950, notes: "" },
    { partNumber: "PWR-BAT-LI", name: "Li-ion Battery Buffer", pbsId: "7.2", quantity: 2, unitCost: 1450, supplier: "Custom", bomRev: 2, rev1Cost: 1450, notes: "" },
    { partNumber: "PWR-FAN-HTR", name: "Heater + Fan Thermal Kit", pbsId: "7.3", quantity: 1, unitCost: 680, supplier: "EBM-Papst", bomRev: 2, rev1Cost: 680, notes: "" },
    { partNumber: "INT-HMI-15", name: '15" HMI Touch Console', pbsId: "8.1", quantity: 1, unitCost: 1250, supplier: "Advantech", bomRev: 2, rev1Cost: 1250, notes: "" },
    { partNumber: "INT-RMT-LINK", name: "Remote Monitoring Gateway", pbsId: "8.2", quantity: 1, unitCost: 540, supplier: "Sierra Wireless", bomRev: 2, rev1Cost: 480, notes: "" },
    { partNumber: "INT-ESTOP-01", name: "E-Stop Safety Relay Kit", pbsId: "8.3", quantity: 1, unitCost: 320, supplier: "Pilz", bomRev: 2, rev1Cost: 320, notes: "Safety-critical" },
  ];

  /* =================================================================
     FUNCTIONS  (:Function) — Space_Copy__MVP_FFBD
     ================================================================= */
  const functions = [
    // Stage 1
    { ffbdId: "1.1", name: "Load Material", stage: 1, subStep: "1.1", pbsId: "1", inputs: ["Raw Material 20kg"], outputs: ["Loaded feedstock"], sensors: ["Load cell"], devices: ["Hopper"] },
    { ffbdId: "1.2", name: "Ball Milling", stage: 1, subStep: "1.2", pbsId: "1.1", inputs: ["Loaded feedstock"], outputs: ["Milled powder 40-70um"], sensors: ["RPM encoder","Vibration"], devices: ["Ball mill @1200 RPM"] },
    { ffbdId: "1.3", name: "Anneal", stage: 1, subStep: "1.3", pbsId: "1.2", inputs: ["Milled powder"], outputs: ["Annealed powder"], sensors: ["Thermocouple"], devices: ["Annealing heater @200C"] },
    { ffbdId: "1.4", name: "Binder Integration", stage: 1, subStep: "1.4", pbsId: "1.3", inputs: ["Annealed powder"], outputs: ["Binder mix"], sensors: ["Flow sensor"], devices: ["PEEK dosing pump <=20%"] },
    { ffbdId: "1.5", name: "Slurry Formation", stage: 1, subStep: "1.5", pbsId: "1", inputs: ["Binder mix"], outputs: ["Slurry"], sensors: ["Viscometer"], devices: ["Mixer"] },
    // Stage 2
    { ffbdId: "2.1", name: "Funneling", stage: 2, subStep: "2.1", pbsId: "2.1", inputs: ["Slurry"], outputs: ["Fed slurry"], sensors: ["Level sensor"], devices: ["Funnel"] },
    { ffbdId: "2.2", name: "Wire Conversion", stage: 2, subStep: "2.2", pbsId: "2.2", inputs: ["Fed slurry"], outputs: ["Wire Filament"], sensors: ["Diameter gauge"], devices: ["Conversion die"] },
    { ffbdId: "2.3", name: "Extruder Loading", stage: 2, subStep: "2.3", pbsId: "2.3", inputs: ["Wire Filament"], outputs: ["Loaded extruder"], sensors: ["Feed encoder"], devices: ["WC nozzle"] },
    // Stage 3
    { ffbdId: "3.1", name: "Pre-heating", stage: 3, subStep: "3.1", pbsId: "3.2", inputs: ["Loaded extruder"], outputs: ["At-temp nozzle"], sensors: ["Nozzle TC"], devices: ["Band heaters"] },
    { ffbdId: "3.2", name: "Layer Deposition", stage: 3, subStep: "3.2", pbsId: "3.1", inputs: ["At-temp nozzle","Sliced toolpath"], outputs: ["Deposited layers"], sensors: ["Nozzle TC","Vision cam","Encoders"], devices: ["Gantry","Hot end"] },
    { ffbdId: "3.3", name: "Print Completion", stage: 3, subStep: "3.3", pbsId: "3", inputs: ["Deposited layers"], outputs: ["Cooled Complete Print"], sensors: ["Vision cam","TC"], devices: ["Chamber"] },
    // Stage 4
    { ffbdId: "4.1", name: "Thermal Monitor", stage: 4, subStep: "4.1", pbsId: "5.1", inputs: ["Cooled Complete Print"], outputs: ["Thermal-OK part"], sensors: ["TC","SWIR"], devices: ["Chamber"] },
    { ffbdId: "4.2", name: "Tool Selection", stage: 4, subStep: "4.2", pbsId: "4.2", inputs: ["Thermal-OK part"], outputs: ["Tool engaged"], sensors: ["Tool ID"], devices: ["Magnetic changer"] },
    { ffbdId: "4.3", name: "Support Removal", stage: 4, subStep: "4.3", pbsId: "4.1", inputs: ["Tool engaged"], outputs: ["De-supported part"], sensors: ["Force/torque","Proximity"], devices: ["5-DOF arm"] },
    { ffbdId: "4.4", name: "Defect Correction", stage: 4, subStep: "4.4", pbsId: "4.1", inputs: ["De-supported part"], outputs: ["Corrected part"], sensors: ["Vision cam","ML/CNN"], devices: ["5-DOF arm"] },
    { ffbdId: "4.5", name: "Final Retrieval", stage: 4, subStep: "4.5", pbsId: "4.3", inputs: ["Corrected part"], outputs: ["Finished Part"], sensors: ["Bin sensor"], devices: ["Sealed bin 400x400"] },
  ];

  /* Material state transitions (Flow) between stages */
  const materialFlow = [
    { from: 1, to: 2, label: "Slurry" },
    { from: 2, to: 3, label: "Wire Filament" },
    { from: 3, to: 4, label: "Cooled Complete Print" },
  ];

  /* =================================================================
     CONTROL LOOPS  (:ControlLoop) — Software Architecture
     ================================================================= */
  const controlLoops = [
    { id: "CL-1", name: "Thermal Control", scope: "All stages", logic: "PID",
      inputSignals: ["A: TC temp", "Nozzle TC", "Chamber TC"], outputCommands: ["Heater duty", "Fan speed"],
      functions: ["1.3","3.1","3.2","4.1"], req: ["FR-5","ER-3","SC-4"], devices: ["Band heaters","Fans"] },
    { id: "CL-2", name: "Motion Planning", scope: "Stage 4", logic: "Inverse Kinematics",
      inputSignals: ["Arm joint encoders", "Proximity"], outputCommands: ["Joint setpoints"],
      functions: ["4.3","4.4"], req: ["SC-5","IR-4"], devices: ["5-DOF arm"] },
    { id: "CL-3", name: "Layer Deposition", scope: "Stage 3", logic: "Slicing / Toolpath",
      inputSignals: ["Sliced toolpath", "Gantry encoders"], outputCommands: ["Gantry moves", "Extrude rate"],
      functions: ["3.2"], req: ["FR-2","FR-4"], devices: ["Gantry","Hot end"] },
    { id: "CL-4", name: "Defect Detection & QA", scope: "Stages 3-4", logic: "ML / CNN",
      inputSignals: ["Vision frames", "SWIR spectra"], outputCommands: ["Pass/Fail flag", "Rework trigger"],
      functions: ["3.2","3.3","4.4"], req: ["FR-5","SC-2"], devices: ["Cameras","SWIR"] },
    { id: "CL-5", name: "State Machine", scope: "All stages", logic: "FSM",
      inputSignals: ["All fault flags", "Mode commands"], outputCommands: ["Mode transition", "SAFE-mode"],
      functions: ["1.1","2.1","3.1","4.1"], req: ["SC-1","SC-3"], devices: ["Controller"] },
  ];

  const backgroundProcesses = [
    { id: "BP-LOG", name: "Data Logging & Downlink", req: ["FR-6"] },
    { id: "BP-CAD", name: "CAD Repository", req: ["FR-4"] },
    { id: "BP-PWR", name: "Power Management", req: ["OR-4"] },
  ];

  /* =================================================================
     DATA SIGNALS  (:DataSignal) — 3-tier per stage, tags [A]..
     ================================================================= */
  const dataSignals = [
    // Stage 1
    { tag: "A", stage: 1, tier1: "TC temp degC", tier2: "Anneal temp-rate computed", tier3: "Proceed / Halt anneal", source: "1.3", trigger: false, loop: "CL-1" },
    { tag: "B", stage: 1, tier1: "Mill RPM encoder", tier2: "Particle-size estimate", tier3: "Continue / Re-mill", source: "1.2", trigger: false, loop: "CL-5" },
    { tag: "C", stage: 1, tier1: "Binder flow", tier2: "Binder ratio %", tier3: "Halt if >20% PEEK", source: "1.4", trigger: true, loop: "CL-5" },
    // Stage 2
    { tag: "D", stage: 2, tier1: "Wire diameter gauge", tier2: "Diameter deviation", tier3: "Reject / Accept wire", source: "2.2", trigger: true, loop: "CL-4" },
    { tag: "E", stage: 2, tier1: "Feed encoder pulses", tier2: "Feed-rate computed", tier3: "Jam flag trigger", source: "2.3", trigger: true, loop: "CL-5" },
    // Stage 3
    { tag: "F", stage: 3, tier1: "Nozzle TC degC", tier2: "Thermal error vs setpoint", tier3: "Over-temp Halt / Proceed", source: "3.1", trigger: true, loop: "CL-1" },
    { tag: "G", stage: 3, tier1: "Gantry encoders", tier2: "Position error", tier3: "Re-home / Continue", source: "3.2", trigger: false, loop: "CL-3" },
    { tag: "H", stage: 3, tier1: "Vision frame", tier2: "CNN defect score", tier3: "Layer pass / Rework", source: "3.2", trigger: true, loop: "CL-4" },
    // Stage 4
    { tag: "I", stage: 4, tier1: "Part TC / SWIR", tier2: "Cooldown estimate", tier3: "Safe-to-handle / Wait", source: "4.1", trigger: true, loop: "CL-1" },
    { tag: "J", stage: 4, tier1: "Arm proximity", tier2: "Collision distance", tier3: "Stop / Move arm", source: "4.3", trigger: true, loop: "CL-2" },
    { tag: "K", stage: 4, tier1: "Vision/CNN", tier2: "Defect map", tier3: "Correct / Accept part", source: "4.4", trigger: true, loop: "CL-4" },
  ];

  /* =================================================================
     RISKS  (:Risk) — ConOps Section 8.0
     ================================================================= */
  const risks = [
    { id: "RISK-1", title: "Nozzle clog (WC extruder)", likelihood: 4, impact: 4, status: "Open",
      mitigation: "Redundant nozzle, feed monitoring, auto-purge.", req: ["FR-2","FR-3"], pbs: "2.3", drm: "DRM-0700", component: "FIL-WCN-03" },
    { id: "RISK-2", title: "Arm collision (5-DOF)", likelihood: 3, impact: 5, status: "Open",
      mitigation: "Proximity sensing, IK envelope limits, SC-5 verification.", req: ["SC-5","ER-6"], pbs: "4.1", drm: "DRM-0600", component: "PPU-ARM-5DOF" },
    { id: "RISK-3", title: "SWIR spectral drift", likelihood: 3, impact: 3, status: "Open",
      mitigation: "Periodic recalibration, reference standard.", req: ["FR-5"], pbs: "5.3", drm: "DRM-0400", component: "SEN-SWIR-01" },
    { id: "RISK-4", title: "Layer delamination", likelihood: 3, impact: 4, status: "Open",
      mitigation: "ML defect detection (CL-4), thermal control (CL-1).", req: ["FR-2","SC-2"], pbs: "3", drm: "DRM-0400", component: null },
    { id: "RISK-5", title: "Thermal runaway", likelihood: 2, impact: 5, status: "Mitigating",
      mitigation: "Redundant TC limits, heater cutoff (SC-4), SAFE mode.", req: ["SC-4","ER-3","FR-5"], pbs: "3.2", drm: "DRM-0500", component: "GAN-BND-HTR" },
    { id: "RISK-6", title: "Slurry blockage", likelihood: 3, impact: 3, status: "Open",
      mitigation: "Viscosity monitoring, funnel agitation.", req: ["FR-3","C-3"], pbs: "2.1", drm: "DRM-0400", component: "FIL-FUN-01" },
    { id: "RISK-7", title: "Filament feed failure", likelihood: 3, impact: 4, status: "Open",
      mitigation: "Feed encoder jam flag (signal E), retry sequence.", req: ["FR-1","FR-3"], pbs: "2.3", drm: "DRM-0700", component: "FIL-WCN-03" },
  ];

  /* =================================================================
     LIFECYCLE PHASES  (:LifeCyclePhase) — Product Life Cycle
     ================================================================= */
  const lifecyclePhases = [
    { phase: "Pre-Phase A", name: "Concept Studies", trlRange: "1-3", gateReview: "MDR",
      deliverables: ["Mission need", "ConOps draft", "Feasibility"], activeRequirements: ["OR-1","OR-2"],
      techGaps: ["WC tooling concept","ML defect feasibility"], current: false },
    { phase: "Phase A", name: "Concept & Tech Development", trlRange: "3-4", gateReview: "SDR",
      deliverables: ["System requirements", "Architecture baseline"], activeRequirements: ["FR-1","FR-3","OR-1","OR-4"],
      techGaps: ["SWIR integration","5-DOF arm prototype"], current: false },
    { phase: "Phase B", name: "Preliminary Design", trlRange: "4-5", gateReview: "PDR",
      deliverables: ["Preliminary design", "Verification plan", "BOM Rev 2"], activeRequirements: ["FR-1","FR-2","FR-3","FR-5","ER-3","C-1","C-3","C-4","SC-4"],
      techGaps: ["ML defect detection","WC tooling qualification"], current: true },
    { phase: "Phase C", name: "Detailed Design", trlRange: "5-6", gateReview: "CDR",
      deliverables: ["Detailed design", "Build-to package"], activeRequirements: ["FR-4","FR-6","IR-1","IR-2","IR-3","SC-1","SC-2"],
      techGaps: ["5-DOF arm qualification"], current: false },
    { phase: "Phase D", name: "Fabrication, Integration & Test", trlRange: "6-7", gateReview: "SAR",
      deliverables: ["Integrated system", "Qualification test reports"], activeRequirements: ["FR-2","SC-3","SC-5","ER-5","ER-6"],
      techGaps: ["Full-pipeline integration"], current: false },
    { phase: "Phase E", name: "Operations & Sustainment", trlRange: "7-9", gateReview: "ORR",
      deliverables: ["Ops readiness", "Sustainment plan"], activeRequirements: ["OR-3","OR-5","FR-6"],
      techGaps: ["Spaceflight variant (ER-1/ER-2/ER-4)"], current: false },
  ];

  /* =================================================================
     DRM SCENARIOS — off-nominal overlays + built-in thread scenarios
     ================================================================= */
  const drmScenarios = [
    { id: "DRM-0400", name: "Quality Fault (delamination/spectral)", path: ["5.3","CL-4","RISK-4","FR-5"] },
    { id: "DRM-0500", name: "Thermal Over-Temperature Fault", path: ["3.2","F","CL-1","CL-5","RISK-5","SC-4","FR-6","ER-6"] },
    { id: "DRM-0600", name: "Arm Collision Event", path: ["4.3","J","CL-2","RISK-2","SC-5","ER-6"] },
    { id: "DRM-0700", name: "Filament Feed Failure", path: ["2.3","E","CL-5","RISK-7","FR-1"] },
  ];

  /* =================================================================
     RELATIONSHIPS (edges) — typed graph for Digital Thread engine
     Built partly programmatically from the collections above.
     edge: { from, to, type }
     ================================================================= */
  const edges = [];
  const E = (from, to, type) => edges.push({ from, to, type });

  // Requirement -[:ALLOCATED_TO]-> Subsystem
  requirements.forEach(r => (r.pbs || []).forEach(p => E(r.id, p, "ALLOCATED_TO")));
  // Subsystem -[:CONTAINS]-> Component
  components.forEach(c => E(c.pbsId, c.partNumber, "CONTAINS"));
  // Subsystem -[:PERFORMS]-> Function
  functions.forEach(f => E(f.pbsId, f.ffbdId, "PERFORMS"));
  // Function -[:FEEDS_INTO]-> Function (sequential within + across stages)
  const fnIds = functions.map(f => f.ffbdId);
  for (let i = 0; i < fnIds.length - 1; i++) E(fnIds[i], fnIds[i + 1], "FEEDS_INTO");
  // Function -[:MONITORED_BY]-> DataSignal
  dataSignals.forEach(s => E(s.source, "SIG-" + s.tag, "MONITORED_BY"));
  // ControlLoop -[:GOVERNS]-> Function ; -[:READS]-> DataSignal
  controlLoops.forEach(cl => {
    (cl.functions || []).forEach(f => E(cl.id, f, "GOVERNS"));
    dataSignals.filter(s => s.loop === cl.id).forEach(s => E(cl.id, "SIG-" + s.tag, "READS"));
    (cl.req || []).forEach(r => E(cl.id, r, "SATISFIES"));
  });
  // Requirement -[:IMPACTS]-> Requirement (change propagation)
  [["FR-2","SC-4"],["ER-3","FR-5"],["FR-5","FR-6"],["SC-4","ER-6"],["OR-4","C-1"],["ER-4","IR-2"],["FR-2","FR-4"]]
    .forEach(([a, b]) => E(a, b, "IMPACTS"));
  // Risk -[:THREATENS]-> Requirement ; Risk -> Subsystem/Component
  risks.forEach(rk => {
    (rk.req || []).forEach(r => E(rk.id, r, "THREATENS"));
    if (rk.pbs) E(rk.id, rk.pbs, "THREATENS");
    if (rk.component) E(rk.id, rk.component, "THREATENS");
  });
  // Component -[:SOURCED_IN]-> LifeCyclePhase (BOM Rev 2 baselined at PDR/Phase B)
  components.forEach(c => E(c.partNumber, "Phase B", "SOURCED_IN"));
  // Requirement allocated into lifecycle phases
  lifecyclePhases.forEach(ph => (ph.activeRequirements || []).forEach(r => E(r, ph.phase, "BASELINED_IN")));
  // Subsystem parent containment
  subsystems.forEach(s => { if (s.parentId) E(s.parentId, s.pbsId, "CONTAINS"); });

  /* =================================================================
     KPIs / config
     ================================================================= */
  const config = {
    system: "AERIS FDM-1",
    configurations: {
      STANDARD: { build: "914 x 914 x 1524 mm", power: "3 kW peak / 2.5 kW continuous", primary: true },
      DESKTOP:  { build: "226 x 226 x 366 mm", power: "2 kW peak / 1.5 kW continuous", primary: false },
    },
    phase: "Phase B - PDR",
    trl: "4-5",
    trlTarget: "5-6",
    postProcessWindowMin: 20, // KPI on FFBD Stage 4
    standard: "NASA/SP-2016-6105 Rev 2",
  };

  /* ---- helper indexes -------------------------------------------- */
  function index(arr, key) { const m = {}; arr.forEach(o => (m[o[key]] = o)); return m; }

  const AERIS = {
    TOKENS, CATEGORY_COLOR, config,
    requirements, subsystems, components, functions, materialFlow,
    controlLoops, backgroundProcesses, dataSignals, risks, lifecyclePhases,
    drmScenarios, edges,
    // indexes
    reqById: index(requirements, "id"),
    subById: index(subsystems, "pbsId"),
    compById: index(components, "partNumber"),
    fnById: index(functions, "ffbdId"),
    clById: index(controlLoops, "id"),
    riskById: index(risks, "id"),
    sigByTag: index(dataSignals, "tag"),
  };

  global.AERIS = AERIS;
})(typeof window !== "undefined" ? window : globalThis);
