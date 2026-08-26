
const SUPABASE_URL = "https://grmqbvihmnzvgwufjmbt.supabase.co";

const SUPABASE_KEY = "sb_publishable_pDhX2wAEzv7fzTFIeFiyVA_YrqZPdVa";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.supabaseClient = supabaseClient;
