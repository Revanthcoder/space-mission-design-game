export function isSupabaseConfigured(environment = import.meta.env) {
  return Boolean(environment?.VITE_SUPABASE_URL && environment?.VITE_SUPABASE_ANON_KEY);
}

export function createSupabaseAdapter(client) {
  if (!client || typeof client.from !== "function") {
    throw new TypeError("An initialized Supabase client is required.");
  }

  return {
    async saveResult(record, userId) {
      if (!userId) throw new Error("Sign in before saving cloud mission results.");
      const { data, error } = await client
        .from("mission_results")
        .insert({ user_id: userId, record })
        .select()
        .single();
      if (error) throw new Error(`Could not save cloud result: ${error.message}`);
      return data;
    },

    async listResults(userId) {
      if (!userId) throw new Error("Sign in before loading cloud mission results.");
      const { data, error } = await client
        .from("mission_results")
        .select("id, record, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load cloud results: ${error.message}`);
      return data;
    },
  };
}
