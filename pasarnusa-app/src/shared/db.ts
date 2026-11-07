// Re-export domain types from centralized types
export * from "@/shared/types";

// Legacy database abstraction layer (Deprecated in favor of Supabase services)
export const db = {
  deprecated: true,
  message: "PasarNusa has migrated to Supabase. Use services in @/backend/services instead.",
};

export default db;
