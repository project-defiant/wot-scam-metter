import { AssessmentCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  WG_SERVER_LAG: "WG server lag",
  SHELL_DISAPPEARED: "Shell disappeared",
  PLAYER_CHEATING: "Player cheating",
};

export const CATEGORIES = Object.values(AssessmentCategory);
