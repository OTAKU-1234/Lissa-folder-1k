
const SUPABASE_URL = "COLLE_ICI_TON_URL_SUPABASE";

const SUPABASE_KEY = "COLLE_ICI_TA_CLE_PUBLISHABLE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.supabaseClient = supabaseClient;
