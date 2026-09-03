const db = window.supabaseClient;

const form = document.getElementById("registrationForm");
const message = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

const countrySelect = document.getElementById("country");
const countryCode = document.getElementById("countryCode");

const membersList = document.getElementById("membersList");
const memberCount = document.getElementById("memberCount");


const countryCodes = {
    "Haïti": "+509",
    "République dominicaine": "+1",
    "États-Unis": "+1",
    "Canada": "+1",
    "France": "+33",
    "Belgique": "+32",
    "Suisse": "+41",
    "Autre": "+"
};


function showMessage(text, success = false) {

    message.textContent = text;

    message.style.color =
        success
            ? "#69e89a"
            : "#ff6b6b";
}


countrySelect.addEventListener("change", function () {

    const selectedCountry =
        countrySelect.value;

    countryCode.textContent =
        countryCodes[selectedCountry] || "+";

});


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const name =
        document.getElementById("name")
            .value
            .trim();

    const country =
        countrySelect.value
            .trim();

    const phone =
        document.getElementById("phone")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();


    if (name.length < 2) {

        showMessage(
            "Tanpri antre non ou."
        );

        return;
    }


    if (!country) {

        showMessage(
            "Tanpri chwazi peyi ou."
        );

        return;
    }


    const cleanPhone =
        phone.replace(/\D/g, "");


    if (cleanPhone.length < 6) {

        showMessage(
            "Tanpri antre yon nimewo WhatsApp valab."
        );

        return;
    }


    if (country === "Autre") {

        showMessage(
            "Pou kounye a, chwazi youn nan peyi ki disponib."
        );

        return;
    }


    const code =
        countryCodes[country];


    const fullPhone =
        code.replace("+", "") +
        cleanPhone;


    submitBtn.disabled = true;

    submitBtn.textContent =
        "Ap voye demann lan...";

    showMessage(
        "Ap voye demann ou...",
        true
    );


    const { error } =
        await db
            .from("registrations")
            .insert({
                name: name,
                email: email || null,
                phone: "+" + fullPhone,
                country: country,
                status: "pending"
            });


    if (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        showMessage(
            "Yon pwoblèm rive : " +
            error.message
        );

        submitBtn.disabled = false;

        submitBtn.textContent =
            "Envoyer ma demande";

        return;
    }


    showMessage(
        "Demann ou voye avèk siksè. Tann apwobasyon admin lan.",
        true
    );


    form.reset();

    countryCode.textContent =
        "+509";


    submitBtn.disabled = false;

    submitBtn.textContent =
        "Envoyer ma demande";

});


async function loadMembers() {

    if (!db) return;


    const { data, error } =
        await db
            .from("registrations")
            .select("name, country")
            .eq("status", "approved")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "MEMBERS ERROR:",
            error
        );

        membersList.innerHTML = `
            <div class="empty-members">
                Impossible de charger les membres.
            </div>
        `;

        return;
    }


    memberCount.textContent =
        data.length;


    if (data.length === 0) {

        membersList.innerHTML = `
            <div class="empty-members">
                Aucun membre approuvé pour le moment.
            </div>
        `;

        return;
    }


    membersList.innerHTML =
        data.map(function (member) {

            const firstLetter =
                member.name
                    .charAt(0)
                    .toUpperCase();

            return `
                <div class="member-item">

                    <div class="member-avatar">
                        ${escapeHTML(firstLetter)}
                    </div>

                    <div class="member-info">

                        <strong>
                            ${escapeHTML(member.name)}
                        </strong>

                        <span>
                            ${escapeHTML(member.country)}
                        </span>

                    </div>

                </div>
            `;

        }).join("");
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadMembers();
