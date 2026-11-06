// Re-export domain types from centralized types
export * from "@/types";

// Legacy database abstraction layer (Deprecated in favor of Supabase services)
export const db = {
  deprecated: true,
  message: "PasarNusa has migrated to Supabase. Use services in @/services instead.",
};

export default db;
