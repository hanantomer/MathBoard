import type { EditMode, GlobalEditMode } from "common/unions";
import { isMobile } from "common/globals";

export const LIST_INTROS = {
  lessonsTeacher:
    "Create a lesson, open it, then use Invite in the app bar to share the access link with students.",
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

export const COLLABORATION = {
  copyLink: "Copy access link",
  onlineStudents: "Online Students",
  inviteTooltip: "Invite students — copy the lesson access link",
  emptyLessonTitle: "Your lesson board is empty",
  emptyLessonBody:
    "Draw on the board or paste an image (Ctrl+V). When ready, use Invite in the app bar to share with students.",
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
} as const;

export const TOOL_TOOLTIPS: Record<string, string> = {
  FreeText: "Text box — drag a rectangle on the board",
  annotation: "Annotation — click to place short labels",
  freeSketch: "Free sketch — draw with mouse or stylus",
  Line: "Line — draw a segment",
  polyline: "Polyline — click vertices, close on the start point",
  DivisionLine: "Division line",
  curve: "Curve — adjust with the control point",
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
    ? "Tap the selection tool, then drag on the board to select. Double-tap to exit selection mode."
    : "Drag to select an area, then move or Ctrl+drag to copy. Delete removes the selection. Click one notation to select it alone.";
}

export const EDIT_MODE_STATUS: Partial<
  Record<EditMode | GlobalEditMode, string>
> = {
  FREE_SKETCH_STARTED: "Free sketch",
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
  FREE_SKETCH_STARTED: "Draw on the board. Press Esc to exit.",
  TEXT_STARTED: "Drag a rectangle, then type. Double-click to resize.",
  LINE_STARTED: "Drag to draw a line. Press Esc to exit.",
  ANNOTATION_STARTED: "Click to place text. Press Esc when done.",
  AREA_SELECTION_STARTED: getSelectionHelpText(),
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
    FREE_SKETCH_STARTED: `Draw freely on the screen with your mouse or stylus, ${exitText} free sketch mode`,
    TEXT_STARTED:
      "Draw a rectangle on screen to create a text box, click once to edit and twice to resize",
    SQRT_STARTED: "Draw a line on screen to create a square root",
    CURVE_STARTED:
      "Draw a curve on screen, then use the control point to adjust the curve",
    EXPONENT_STARTED: "Click on a cell to create an exponent",
    EXPONENT_WRITING: "Type exponent and then click outside or press enter",
    CIRCLE_STARTED: "Draw a circle on screen",
    ANNOTATION_STARTED: `Click everywhere to add annotation text, ${escText} annotation mode`,
    ANNOTATION_WRITING:
      "Type annotation text and then click outside or press enter",
    POLYGON_STARTED:
      "To draw a polygon, click and hold to start a line at a point, drag to draw, and release to set the first vertex. Repeat for each segment: click and hold from the last vertex, drag, and release to set the next vertex. Connect the final vertex to the starting point to complete the polygon",
    LINE_STARTED: `Draw a line on screen, ${exitText} line drawing mode`,
    CHECKMARK_STARTED: "Click on a cell to create a checkmark",
    SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
    XMARK_STARTED: "Click on a cell to create an xmark",
    COLORIZING:
      "Click on a notation to colorize it or drag slowly to colorize multiple notations",
  };

  return longForm[editMode];
}
