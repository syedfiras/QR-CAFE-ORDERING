import supabase from "../config/supabase.js";

/**
 * Start or validate a session for a table
 * - If valid active session exists for this token, return it
 * - If no token provided or invalid, create a new session
 */
export const startSession = async (req, res) => {
  try {
    const { table_number, session_token } = req.body;

    if (!table_number) {
      return res.status(400).json({ error: "Table number is required" });
    }

    // If session_token provided, try to validate it
    if (session_token) {
      const { data: existingSession, error: fetchError } = await supabase
        .from("table_sessions")
        .select("*")
        .eq("session_token", session_token)
        .eq("table_number", table_number)
        .single();

      if (!fetchError && existingSession) {
        // Return existing session (active, completed, or expired)
        return res.json({
          session_token: existingSession.session_token,
          session_id: existingSession.id,
          status: existingSession.status,
          table_number: existingSession.table_number,
          created_at: existingSession.created_at,
          is_valid: existingSession.status === "ACTIVE"
        });
      }
    }

    // No valid session found - create new one
    const { data: newSession, error: createError } = await supabase
      .from("table_sessions")
      .insert([{ 
        table_number: Number(table_number), 
        status: "ACTIVE" 
      }])
      .select()
      .single();

    if (createError) {
      console.error("Error creating session:", createError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    res.json({
      session_token: newSession.session_token,
      session_id: newSession.id,
      status: newSession.status,
      table_number: newSession.table_number,
      created_at: newSession.created_at,
      is_valid: true
    });
  } catch (err) {
    console.error("Session start error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Validate a session token
 */
export const validateSession = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token is required", is_valid: false });
    }

    const { data: session, error } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("session_token", token)
      .single();

    if (error || !session) {
      return res.json({ 
        is_valid: false, 
        status: null,
        error: "Session not found" 
      });
    }

    res.json({
      is_valid: session.status === "ACTIVE",
      status: session.status,
      session_id: session.id,
      session_token: session.session_token,
      table_number: session.table_number,
      created_at: session.created_at
    });
  } catch (err) {
    console.error("Session validation error:", err);
    res.status(500).json({ error: "Server error", is_valid: false });
  }
};

/**
 * Get session by ID (internal use)
 */
export const getSessionByToken = async (token) => {
  const { data, error } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("session_token", token)
    .single();

  if (error) return null;
  return data;
};

/**
 * Mark session as completed
 */
export const completeSession = async (sessionId) => {
  const { error } = await supabase
    .from("table_sessions")
    .update({ status: "COMPLETED" })
    .eq("id", sessionId);

  return !error;
};
