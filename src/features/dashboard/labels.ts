export const ADMISSION_STAGES = ["new", "under_review", "assessment", "accepted", "rejected", "enrolled"] as const;
export type AdmissionStage = (typeof ADMISSION_STAGES)[number];

export const ADMISSION_STAGE_LABEL: Record<string, string> = {
  new: "New",
  under_review: "Under Review",
  assessment: "Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  enrolled: "Enrolled",
};

export const ADMISSION_STAGE_TONE: Record<string, "gray" | "blue" | "orange" | "green" | "red" | "violet"> = {
  new: "blue",
  under_review: "orange",
  assessment: "violet",
  accepted: "green",
  rejected: "red",
  enrolled: "green",
};

export const INVOICE_STATUS_TONE: Record<string, "gray" | "green" | "orange" | "red" | "blue"> = {
  unpaid: "orange",
  partial: "blue",
  paid: "green",
  overdue: "red",
};

export const ATTENDANCE_TONE: Record<string, "green" | "red" | "orange" | "blue"> = {
  present: "green",
  absent: "red",
  late: "orange",
  excused: "blue",
};
