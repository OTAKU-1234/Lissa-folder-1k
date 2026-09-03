// =====================================================
// LISSA 1K FOLDER — SUPABASE CLIENT
// =====================================================

const SUPABASE_URL =
    "https://grmqbvihmnzvgwufjmbt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pDhX2wAEzv7fzTFIeFiyVA_YrqZPdVa";

if (!window.supabase) {
    console.error("Supabase JS n'est pas chargé.");
} else {

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );

    window.supabaseClient = supabaseClient;
}
