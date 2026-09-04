import type { EditMode, GlobalEditMode } from "common/unions";
import { isMobile } from "common/globals";

export const LIST_INTROS = {
  lessonsTeacher:
    "Create a lesson or add a sample from the library (bookshelf icon), then use Invite in the app bar to share the access link with students.",
  lessonsStudent: "Open a lesson your teacher shared with you.",
  questions:
    "Questions are exercise templates on the board. Pick a lesson, then open or create a question.",
  answers:
    "Review student submissions per question. Select a lesson and question to see answers.",
  questionsEmpty:
    "No questions yet for this lesson. Use + to add a question students can work on.",
} as const;

export const TEACHER_WORKFLOW_STEPS = [
  "Create or open a lesson from Lessons",
  "Click Invite in the app bar and copy the access link",
  "Students join via the link — open Online Students to allow board editing",
  "Add questions from Questions and review answers from Answers",
] as const;

export const WELCOME_TEACHER_HERO = {
  subtitle: "Run a live lesson in four steps:",
  cta: "Go to Lessons",
} as const;

/** Welcome entry: classroom (teacher + students) vs solo AI practice. */
export const WELCOME_PATHS = {
  brandLine: "Math Whiteboard",
  brandSub:
    "Two ways to use the same board: live classroom, or solo AI tutor.",
  classroom: {
    title: "Classroom",
    teacherBlurb: "Teachers and students together — run a live lesson in four steps:",
    studentBlurb:
      "Teachers and students together — join a shared lesson, then work on questions and answers.",
    guestBlurb:
      "Teachers and students together — live lessons, questions, and answers on a shared board.",
    ctaTeacher: "Go to Lessons",
    ctaStudent: "Go to Lessons",
    ctaGuest: "Get started in class",
    signInTeacher: "Sign in as Teacher",
    signInStudent: "Sign in as Student",
  },
  practice: {
    title: "AI tutor",
    blurb:
      "Solo practice by subject — write on the board, check answers, or get text/voice tips (work stays on this device).",
    cta: "Practice by subject",
    ctaGuest: "Practice by subject",
    blankCta: "Blank sheet (write, paste, or upload)",
    landingLead:
      "Solo practice by subject — write on the board, check answers, or get text or voice tips. Work stays on this device. No account needed.",
    classroomLink: "Looking for a live class?",
  },
} as const;

export const COLLABORATION = {
  copyLink: "Copy access link",
  onlineStudents: "Online Students",
  inviteTooltip: "Invite students — copy the lesson access link",
  emptyLessonTitle: "Your lesson board is empty",
  emptyLessonBody:
    "Click a cell and type your math with the keyboard — that is the fastest way to write. Use Selection to move or copy work, lines/text tools for diagrams, and free sketch only when you need informal marks. Paste images with Ctrl+V. When ready, use Invite in the app bar to share with students.",
  studentJoinedToast: (name: string) =>
    `${name} joined the lesson. Open Online Students to manage editing.`,
  studentJoinedToastGeneric: "A student joined the lesson. Open Online Students to manage editing.",
} as const;

export const BOARD_ROLE_BANNERS = {
  lessonViewOnly:
    "View only — your teacher must allow you to edit (they use Online Students in the app bar).",
  lessonCanEdit: "You can edit this lesson board.",
  lessonTeacherAsStudent:
    "Previewing as a student — editing follows student rules on this lesson.",
  questionTeacher:
    "Question template — what you draw here is what students see for this exercise.",
  questionStudent: "Question board — read only. Your work goes on your answer board.",
  answerTeacher:
    "Reviewing a student answer — use checkmarks in the toolbar to grade cells.",
  answerStudent: "Your answer board — write here. Your teacher will review when you submit.",
  practiceStudent:
    "Check grades your work when you ask. Text and Voice give live tips while you write — including in a text box after you pause. Work stays on this device.",
  practiceBlank:
    "Write or paste the question on the board, then solve. Work stays on this device.",
  practiceGuest:
    "Guest practice — limited free AI uses per day. Sign in for a higher limit. Work stays on this device.",
} as const;

function stickyExitHint(toolName: string): string {
  return isMobile()
    ? `Double-tap or tap ${toolName} again to exit`
    : `Press Esc or click ${toolName} again to exit`;
}

export const TOOL_TOOLTIPS: Record<string, string> = {
  FreeText: "Text box — drag a rectangle on the board",
  annotation: "Annotation — click to place short labels",
  freeSketch: `Free sketch — informal marks only. ${stickyExitHint("Free sketch")}.`,
  freeSketchOcr:
    "Draw a symbol; pause briefly to combine strokes (e.g. =), then it is recognized and placed on the grid",
  Line: "Line — draw a segment; it stays selected after you release",
  polyline: `Polyline — drag each segment; close on the start. ${stickyExitHint("Polyline")}.`,
  DivisionLine: "Division line — it stays selected after you release",
  curve: "Curve — drag a segment; it stays selected after you release",
  circle: "Circle — it stays selected after you release",
  parabola:
    "Parabola — click the vertex, then drag through a point; the shape stays selected so you can stretch it",
  hyperbola:
    "Hyperbola — click the center, then drag to a vertex; the shape stays selected so you can stretch it",
  sqrt: "Square root — insert at the selected cell (Alt+S). Select symbols first to draw the bar over them",
  exponent: "Exponent — click a cell (Alt+X)",
  log: "Logarithm (Alt+L)",
  "cartesian system": "Cartesian axes — click to place; both axes stay selected",
  checkmark: "Mark cell correct",
  xmark: "Mark cell incorrect",
  semicheckmark: "Mark cell partially correct",
};

export const TOOLBAR_SECTIONS = {
  import: "Import",
  select: "Select",
  draw: "Draw",
  text: "Text",
  marks: "Grade",
} as const;

export const DRAW_TOOL_NAMES = new Set([
  "freeSketch",
  "freeSketchOcr",
  "Line",
  "polyline",
  "DivisionLine",
  "curve",
  "circle",
  "parabola",
  "hyperbola",
  "cartesian system",
]);

export const TEXT_TOOL_NAMES = new Set([
  "FreeText",
  "annotation",
  "sqrt",
  "exponent",
  "log",
]);

export function getToolTooltip(name: string): string {
  return TOOL_TOOLTIPS[name] ?? name;
}

export function getSelectionHelpText(): string {
  return isMobile()
    ? "Tap Selection, drag a rectangle to select, then drag to move. Double-tap to exit selection mode."
    : "Drag a rectangle to select notations, then drag to move. Hold Ctrl (Cmd on Mac) while dragging to duplicate. Delete or Backspace removes the selection. Click one notation to select it alone.";
}

export const KEYBOARD_INPUT = {
  title: "Keyboard (recommended)",
  intro:
    "Most math is typed directly into grid cells — faster and clearer than free sketch.",
  tips: isMobile()
    ? [
        "Tap a cell, then type letters, numbers, and operators.",
        "Use toolbar Text tools for exponents, logs, and text boxes.",
        "Free sketch is optional for rough diagrams only.",
      ]
    : [
        "Click a cell, then type letters, numbers, and operators.",
        "Space moves right if the next cells are empty; otherwise it pushes symbols right. Enter moves down if the next rows are empty; otherwise it pushes work down.",
        "Backspace or Delete removes the symbol in the selected cell.",
        "Alt+X exponent, Alt+L log, Alt+S square root — or use the Text tools on the left.",
        "Free sketch is optional for informal marks, not for main work.",
      ],
} as const;

export const EDITING_TECHNIQUES = {
  title: "Select, move, and copy",
  items: isMobile()
    ? [
        "Selection tool: drag a rectangle, then drag the selection to move it.",
        "Tap a cell and type; use toolbar tools for structured math.",
      ]
    : [
        "Selection tool: drag a rectangle to select, then drag to move.",
        "Hold Ctrl (Cmd on Mac) while dragging to duplicate the selection.",
        "Delete or Backspace removes selected notations.",
        "With symbols selected, Square root (Alt+S) draws the bar over them.",
        "With a cell selected: Space moves right if the next cells are empty, otherwise it pushes content right; Enter moves down if the next rows are empty, otherwise it pushes work down; Backspace/Delete clears the cell.",
        "Arrow keys move the selected cell; type to replace or add symbols.",
      ],
} as const;

export const EDIT_MODE_STATUS: Partial<
  Record<EditMode | GlobalEditMode, string>
> = {
  FREE_SKETCH_STARTED: "Free sketch",
  FREE_SKETCH_DRAWING: "Free sketch",
  FREE_SKETCH_WITH_OCR_STARTED: "Sketch → symbol",
  FREE_SKETCH_WITH_OCR_DRAWING: "Sketch → symbol",
  TEXT_STARTED: "Text box",
  TEXT_WRITING: "Text box",
  SQRT_STARTED: "Square root",
  CURVE_STARTED: "Curve",
  CURVE_DRAWING: "Curve",
  EXPONENT_STARTED: "Exponent",
  EXPONENT_WRITING: "Exponent",
  LINE_STARTED: "Line",
  LINE_DRAWING: "Line",
  DIVISIONLINE_STARTED: "Division line",
  DIVISIONLINE_DRAWING: "Division line",
  CIRCLE_STARTED: "Circle",
  CIRCLE_DRAWING: "Circle",
  PARABOLA_STARTED: "Parabola",
  HYPERBOLA_STARTED: "Hyperbola",
  CONIC_DRAWING: "Conic",
  ANNOTATION_STARTED: "Annotation",
  ANNOTATION_WRITING: "Annotation",
  POLYGON_STARTED: "Polyline",
  POLYGON_DRAWING: "Polyline",
  CHECKMARK_STARTED: "Checkmark",
  SEMICHECKMARK_STARTED: "Semi checkmark",
  XMARK_STARTED: "X mark",
  COLORIZING: "Colorize",
  AREA_SELECTION_STARTED: "Selection",
  LOG_STARTED: "Log",
  CARTESIAN_SYSTEM_STARTED: "Axes",
};

const EDIT_MODE_HINTS: Partial<Record<EditMode | GlobalEditMode, string>> = {
  FREE_SKETCH_STARTED: `Informal drawing only — for typed math, use the keyboard. ${stickyExitHint("Free sketch")}.`,
  FREE_SKETCH_DRAWING: stickyExitHint("Free sketch") + ".",
  TEXT_STARTED: "Drag a rectangle, then type. Double-click to resize.",
  TEXT_WRITING:
    "Type in the box, then click outside. In practice, pause for a tip; Ctrl+Enter checks.",
  LINE_STARTED: "Drag to draw a line. The line stays selected when you release.",
  LINE_DRAWING: "Release to place. The line stays selected.",
  CIRCLE_STARTED: "Drag to draw a circle. The circle stays selected when you release.",
  CIRCLE_DRAWING: "Release to place. The circle stays selected.",
  DIVISIONLINE_STARTED:
    "Drag a horizontal division line. It stays selected when you release.",
  DIVISIONLINE_DRAWING: "Release to place. The line stays selected.",
  CONIC_DRAWING: "Release to place. The shape stays selected.",
  PARABOLA_STARTED:
    "Click the vertex, then drag through a point. The parabola stays selected so you can drag a handle to stretch it.",
  HYPERBOLA_STARTED:
    "Click the center, then drag to a vertex. The hyperbola stays selected so you can drag a handle to stretch it.",
  ANNOTATION_STARTED: `Click to place text. ${stickyExitHint("Annotation")}.`,
  AREA_SELECTION_STARTED: getSelectionHelpText(),
  CURVE_STARTED: "Drag to draw a curve. The curve stays selected when you release.",
  CURVE_DRAWING: "Release to place. The curve stays selected.",
  POLYGON_STARTED: `Drag each segment; close on the start. ${stickyExitHint("Polyline")}.`,
  POLYGON_DRAWING: `Drag the next segment, or close on the start. ${stickyExitHint("Polyline")}.`,
  CARTESIAN_SYSTEM_STARTED: "Click to place x and y axes. Both axes stay selected.",
  FREE_SKETCH_WITH_OCR_STARTED:
    "Draw strokes; a brief pause combines them, then OCR places the symbol on the grid.",
  FREE_SKETCH_WITH_OCR_DRAWING:
    "Release to finish stroke — draw another within a moment for multi-stroke symbols",
};

export function getActiveToolDisplay(
  editMode: EditMode | GlobalEditMode,
): { label: string; hint: string } | null {
  const label = EDIT_MODE_STATUS[editMode];
  if (!label) {
    return null;
  }
  const hint =
    EDIT_MODE_HINTS[editMode] ??
    (editMode in EDIT_MODE_STATUS
      ? "See the status message at the bottom for details."
      : "");
  return { label, hint };
}

export function getEditModeStatusText(
  editMode: EditMode | GlobalEditMode,
): string | undefined {
  const longForm: Partial<Record<EditMode | GlobalEditMode, string>> = {
    FREE_SKETCH_STARTED: `Optional informal sketching — for equations, click a cell and type. ${stickyExitHint("Free sketch")}.`,
    FREE_SKETCH_DRAWING: stickyExitHint("Free sketch") + ".",
    FREE_SKETCH_WITH_OCR_STARTED:
      "Draw a handwritten symbol. Wait a moment after each stroke to combine multi-stroke symbols (e.g. =). The recognized symbol is placed on the nearest grid cell.",
    FREE_SKETCH_WITH_OCR_DRAWING:
      "Drawing for recognition — release to finish the stroke; draw another stroke within a moment if needed",
    TEXT_STARTED:
      "Draw a rectangle on screen to create a text box, click once to edit and twice to resize",
    TEXT_WRITING:
      "Type in the box, then click outside when done. In practice, pause for a tip; Ctrl+Enter checks.",
    SQRT_STARTED: "Square root is inserted at the selected cell, or wrapped over a selection",
    CURVE_STARTED:
      "Drag to draw a curve. The curve stays selected — click Curve again to draw another.",
    CURVE_DRAWING: "Release to place. The curve stays selected.",
    EXPONENT_STARTED: "Click on a cell to create an exponent",
    EXPONENT_WRITING: "Type exponent and then click outside or press enter",
    CIRCLE_STARTED: "Drag to draw a circle. The circle stays selected when you release.",
    PARABOLA_STARTED:
      "Click the vertex, then drag through a point. The parabola stays selected so you can drag a handle to stretch it.",
    HYPERBOLA_STARTED:
      "Click the center, then drag to a vertex. The hyperbola stays selected so you can drag a handle to stretch it.",
    ANNOTATION_STARTED: `Click everywhere to add annotation text. ${stickyExitHint("Annotation")}.`,
    ANNOTATION_WRITING:
      "Type annotation text and then click outside or press enter",
    POLYGON_STARTED: `Click and drag for each segment. Close on the start. ${stickyExitHint("Polyline")}.`,
    POLYGON_DRAWING: `Drag the next segment, or close on the start. ${stickyExitHint("Polyline")}.`,
    LINE_STARTED:
      "Drag to draw a line. The line stays selected — click Line again to draw another.",
    DIVISIONLINE_STARTED:
      "Drag a horizontal division line. It stays selected when you release.",
    CHECKMARK_STARTED: "Click on a cell to create a checkmark",
    SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
    XMARK_STARTED: "Click on a cell to create an xmark",
    COLORIZING:
      "Click on a notation to colorize it or drag slowly to colorize multiple notations",
    CARTESIAN_SYSTEM_STARTED:
      "Click on the board to place x and y axes. Both axes stay selected.",
    AREA_SELECTION_STARTED: getSelectionHelpText(),
  };

  return longForm[editMode];
}

export const EDITING_BASICS = {
  idle: isMobile()
    ? "Tap a cell and type. Selection moves work; free sketch is optional."
    : "Click a cell and type (keyboard). Selection: drag to select, move, or Ctrl+drag to copy. Space/Delete edit the current cell. Line, circle, curve, and axes exit after one shape; polyline and sketch stay on until Esc or you click the tool again.",
  exitHint: isMobile()
    ? "Double-tap or tap the active tool again to exit."
    : "Press Esc or click the active tool again to exit.",
} as const;

export const COLLAB_HELP = {
  teacherTitle: "Collaborate with students",
  teacherSteps: [
    "Use Invite in the app bar to copy the lesson access link.",
    "Students open the link and join your board.",
    "Open Online Students to see who joined and allow one student to edit at a time.",
  ],
  studentTitle: "Working with your teacher",
  studentSteps: [
    "You are viewing the teacher's lesson board.",
    "When the teacher enables editing, click a cell and type with the keyboard.",
    "Use Selection to move work; Ctrl+drag copies. Space and Delete edit the current cell.",
    "Your changes sync in real time for everyone in the lesson.",
  ],
  accessLinkIntro:
    "Students sign in (or register), then land on this lesson board.",
  accessLinkStudentsLocator:
    "Top bar on the right — school icon with a green badge when students are online.",
  lessonStudentsTip:
    "Tap a student row to allow or revoke board editing. Only one student can edit at a time.",
} as const;

export const TOOLS_HELP = {
  title: "Board tools",
  intro:
    "Line, circle, curve, conics, and axes place one shape and leave it selected. Polyline and sketch stay on until you press Esc or click the same tool again.",
  groups: [
    {
      name: "Keyboard",
      tools: [
        "Click a cell and type — primary way to write math",
        "Space — move right if the next cells are empty, otherwise push symbols right",
        "Enter — move down if the next rows are empty, otherwise push work down",
        "Backspace / Delete — clear cell or remove selection",
      ],
    },
    {
      name: "Select",
      tools: [
        "Drag a rectangle to select",
        "Drag selection to move",
        "Ctrl+drag (Cmd on Mac) to duplicate",
        "Delete / Backspace — remove selection",
      ],
    },
    {
      name: "Draw",
      tools: [
        "Free sketch — informal marks; Esc or click the tool again to exit",
        "Line — one segment, then the line stays selected",
        "Polyline — stays on until you close it, press Esc, or click the tool again",
        "Curve — one curve, then it stays selected",
        "Circle — one circle, then it stays selected",
        "Cartesian axes — both axes stay selected after placing",
      ],
    },
    {
      name: "Text",
      tools: ["Text box", "Annotation", "Square root", "Exponent", "Log"],
    },
  ],
} as const;

export type CoachMarkDef = {
  id: string;
  targetSelector: string;
  title: string;
  body: string;
};

/** Short first-visit tour on the lesson board (keyboard → selection → symbols → shortcuts). */
export const QUICK_TIPS_COACH_MARK_IDS = [
  "quick-tip-keyboard",
  "quick-tip-selection",
  "quick-tip-special-symbols",
  "quick-tip-shortcuts",
] as const;

export const COACH_MARKS: CoachMarkDef[] = [
  {
    id: "quick-tip-keyboard",
    targetSelector: '[data-cy="mathboard"]',
    title: "Type on the grid",
    body: "Click a cell and type with your keyboard — the fastest way to write math. Free sketch is only for informal marks.",
  },
  {
    id: "quick-tip-selection",
    targetSelector: '[data-cy="selectionButton"]',
    title: "Move and copy",
    body: "Use Selection: drag a rectangle to select, drag to move, and hold Ctrl (Cmd on Mac) while dragging to duplicate.",
  },
  {
    id: "quick-tip-special-symbols",
    targetSelector: '[data-cy="special-symbols-toolbar"]',
    title: "Special symbols",
    body: "Use the panel on the right (or tap the Σ button on mobile) for Greek letters, √, °, ×, and more. They work in grid cells, text boxes, and annotations.",
  },
  {
    id: "quick-tip-shortcuts",
    targetSelector: '[data-cy="instruction-bar"]',
    title: "Cell shortcuts",
    body: "Space moves to the next cell when the row is empty ahead, or pushes symbols right to make a gap. Enter moves down when the next rows are empty, or pushes work down to make a gap. Backspace or Delete clears the cell. Delete also removes a selection.",
  },
  {
    id: "invite-app-bar",
    targetSelector: "#invite-btn",
    title: "Invite students",
    body: "Copy the lesson link here and share it with your class.",
  },
  {
    id: "online-students",
    targetSelector: "#online-students-btn",
    title: "Online Students",
    body: "See who joined and tap a name to allow board editing.",
  },
  {
    id: "tool-selection",
    targetSelector: '[data-cy="selectionButton"]',
    title: "Selection",
    body: "Drag to select, then move. Hold Ctrl (Cmd on Mac) while dragging to duplicate. Delete removes the selection.",
  },
  {
    id: "tool-line",
    targetSelector: '[data-cy="lineButton"]',
    title: "Line tool",
    body: "Draw a straight line on the grid. It stays selected when you release — click Line again to draw another.",
  },
  {
    id: "tool-text",
    targetSelector: '[data-cy="freetextButton"]',
    title: "Text box",
    body: "Drag a rectangle on the board, then type. In practice, pause for a tip; Ctrl+Enter checks your answer.",
  },
  {
    id: "practice-assist-modes",
    targetSelector: '[data-cy="practice-assist-mode"]',
    title: "How help works",
    body: "Check grades you when you press Check answer (Ctrl+Enter, including inside a text box). Text shows a tip after you pause. Voice reads the tip aloud. Live tips use your daily AI quota.",
  },
];

export const TOOL_COACH_MARK_IDS: Record<string, string> = {
  Line: "tool-line",
  FreeText: "tool-text",
  selection: "tool-selection",
};

export const CHECKLIST = {
  title: "Your first live lesson",
  subtitle: "Three steps to collaborate with students:",
  steps: [
    { id: "create", label: "Create or open a lesson" },
    { id: "invite", label: "Invite — copy the access link from the app bar" },
    { id: "students", label: "Open Online Students when someone joins" },
  ],
  gotIt: "Got it",
  dontShowAgain: "Don't show again",
  showTour: "Show me around",
} as const;

export type HelpPageKey =
  | "lesson"
  | "question"
  | "answer"
  | "lessons-list"
  | "questions-list"
  | "answers-list"
  | "home"
  | "default";

export function getPageHelp(key: HelpPageKey): { title: string; lines: string[] } {
  switch (key) {
    case "lesson":
      return {
        title: "Lesson board",
        lines: [
          "This is your shared whiteboard for the lesson.",
          "Click a cell and type with the keyboard — that is the main way to write math.",
          "Use Selection to move notations or Ctrl+drag to copy them.",
          "Space and Delete edit symbols in the selected cell.",
          LIST_INTROS.lessonsTeacher,
        ],
      };
    case "question":
      return {
        title: "Question board",
        lines: [BOARD_ROLE_BANNERS.questionTeacher, LIST_INTROS.questions],
      };
    case "answer":
      return {
        title: "Answer board",
        lines: [LIST_INTROS.answers, BOARD_ROLE_BANNERS.answerTeacher],
      };
    case "lessons-list":
      return { title: "Lessons", lines: [LIST_INTROS.lessonsTeacher] };
    case "questions-list":
      return { title: "Questions", lines: [LIST_INTROS.questions] };
    case "answers-list":
      return { title: "Answers", lines: [LIST_INTROS.answers] };
    default:
      return {
        title: "Math Whiteboard",
        lines: [
          "Create lessons, share links with students, and review their work.",
        ],
      };
  }
}

export function boardContextToHelpKey(
  level: string,
): HelpPageKey {
  if (level === "none") return "default";
  return level as HelpPageKey;
}
