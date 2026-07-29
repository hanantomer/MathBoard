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
  },
  practice: {
    title: "AI tutor",
    blurb:
      "Solo practice by subject — write on the board, check answers, and get voice coaching (work stays on this device).",
    cta: "Practice by subject",
    ctaGuest: "Practice by subject",
    blankCta: "Blank sheet (paste or upload image)",
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
    "Practicing with AI tutor — Check and voice coach use your daily AI quota. Work is saved only on this device.",
  practiceBlank:
    "Blank practice sheet — paste (Ctrl+V) or upload a worksheet image, then work on the board. Saved only on this device.",
  practiceGuest:
    "Guest practice — limited free Check/Coach uses per day. Sign in for a higher daily limit. Work stays on this device.",
} as const;

export const TOOL_TOOLTIPS: Record<string, string> = {
  FreeText: "Text box — drag a rectangle on the board",
  annotation: "Annotation — click to place short labels",
  freeSketch: "Free sketch — informal marks only; type math in grid cells with the keyboard",
  freeSketchOcr:
    "Draw a symbol; pause briefly to combine strokes (e.g. =), then it is recognized and placed on the grid",
  Line: "Line — draw a segment",
  polyline: "Polyline — click vertices, close on the start point",
  DivisionLine: "Division line",
  curve:
    "Curve — snaps to grid and endpoints; next segment continues from the end (Esc to finish)",
  circle: "Circle",
  sqrt: "Square root — draw the vinculum (Alt+S)",
  exponent: "Exponent — click a cell (Alt+X)",
  log: "Logarithm (Alt+L)",
  "cartesian system": "Cartesian axes",
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
        "Space pushes symbols in the current cell to the right.",
        "Backspace or Delete removes the symbol in the selected cell.",
        "Alt+X exponent, Alt+L log — or use the Text tools on the left.",
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
        "With a cell selected: Space pushes content right; Backspace/Delete clears the cell.",
        "Arrow keys move the selected cell; type to replace or add symbols.",
      ],
} as const;

export const EDIT_MODE_STATUS: Partial<
  Record<EditMode | GlobalEditMode, string>
> = {
  FREE_SKETCH_STARTED: "Free sketch",
  FREE_SKETCH_WITH_OCR_STARTED: "Sketch → symbol",
  FREE_SKETCH_WITH_OCR_DRAWING: "Sketch → symbol",
  TEXT_STARTED: "Text box",
  SQRT_STARTED: "Square root",
  CURVE_STARTED: "Curve",
  EXPONENT_STARTED: "Exponent",
  EXPONENT_WRITING: "Exponent",
  CIRCLE_STARTED: "Circle",
  ANNOTATION_STARTED: "Annotation",
  ANNOTATION_WRITING: "Annotation",
  POLYGON_STARTED: "Polyline",
  LINE_STARTED: "Line",
  DIVISIONLINE_STARTED: "Division line",
  CHECKMARK_STARTED: "Checkmark",
  SEMICHECKMARK_STARTED: "Semi checkmark",
  XMARK_STARTED: "X mark",
  COLORIZING: "Colorize",
  AREA_SELECTION_STARTED: "Selection",
  LOG_STARTED: "Log",
  CARTESIAN_SYSTEM_STARTED: "Axes",
};

const EDIT_MODE_HINTS: Partial<Record<EditMode | GlobalEditMode, string>> = {
  FREE_SKETCH_STARTED:
    "Informal drawing only — for typed math, click a cell and use the keyboard. Press Esc to exit.",
  TEXT_STARTED: "Drag a rectangle, then type. Double-click to resize.",
  LINE_STARTED: "Drag to draw a line. Press Esc to exit.",
  ANNOTATION_STARTED: "Click to place text. Press Esc when done.",
  AREA_SELECTION_STARTED: getSelectionHelpText(),
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
  const mobile = isMobile();
  const exitText = mobile ? "double-tap to exit" : "press ESC to exit";
  const escText = mobile ? "double-tap" : "press ESC";

  const longForm: Partial<Record<EditMode | GlobalEditMode, string>> = {
    FREE_SKETCH_STARTED: `Optional informal sketching — for equations, click a cell and type. ${exitText} free sketch mode`,
    FREE_SKETCH_WITH_OCR_STARTED:
      "Draw a handwritten symbol. Wait a moment after each stroke to combine multi-stroke symbols (e.g. =). The recognized symbol is placed on the nearest grid cell.",
    FREE_SKETCH_WITH_OCR_DRAWING:
      "Drawing for recognition — release to finish the stroke; draw another stroke within a moment if needed",
    TEXT_STARTED:
      "Draw a rectangle on screen to create a text box, click once to edit and twice to resize",
    SQRT_STARTED: "Draw a line on screen to create a square root",
    CURVE_STARTED:
      "Draw a curve; endpoints snap to the grid and axes. The next segment starts at the end — press Esc when finished",
    EXPONENT_STARTED: "Click on a cell to create an exponent",
    EXPONENT_WRITING: "Type exponent and then click outside or press enter",
    CIRCLE_STARTED: "Draw a circle on screen",
    ANNOTATION_STARTED: `Click everywhere to add annotation text, ${escText} annotation mode`,
    ANNOTATION_WRITING:
      "Type annotation text and then click outside or press enter",
    POLYGON_STARTED:
      "Click and drag for each segment. Connect the last vertex to the first to close the shape.",
    LINE_STARTED: `Draw a line on screen, ${exitText} line drawing mode`,
    DIVISIONLINE_STARTED: "Draw a horizontal division line on the board",
    CHECKMARK_STARTED: "Click on a cell to create a checkmark",
    SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
    XMARK_STARTED: "Click on a cell to create an xmark",
    COLORIZING:
      "Click on a notation to colorize it or drag slowly to colorize multiple notations",
    CARTESIAN_SYSTEM_STARTED: "Click on the board to place x and y axes",
    AREA_SELECTION_STARTED: getSelectionHelpText(),
  };

  return longForm[editMode];
}

export const EDITING_BASICS = {
  idle: isMobile()
    ? "Tap a cell and type. Selection moves work; free sketch is optional."
    : "Click a cell and type (keyboard). Selection: drag to select, move, or Ctrl+drag to copy. Space/Delete edit the current cell. Esc exits a tool.",
  exitHint: isMobile() ? "Double-tap to exit a tool." : "Press Esc to exit a tool.",
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
  intro: "Tools stay active until you press Esc or pick another tool.",
  groups: [
    {
      name: "Keyboard",
      tools: [
        "Click a cell and type — primary way to write math",
        "Space — push cell content right",
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
        "Free sketch — informal marks only",
        "Line",
        "Polyline",
        "Curve",
        "Circle",
        "Cartesian axes",
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
    body: "Space pushes symbols right in the selected cell. Backspace or Delete clears it. Delete also removes a selection.",
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
    body: "Draw straight lines on the grid. Press Esc when finished.",
  },
  {
    id: "tool-text",
    targetSelector: '[data-cy="freetextButton"]',
    title: "Text box",
    body: "Drag a rectangle on the board, then type your math.",
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
