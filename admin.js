const db = window.supabaseClient;

const loginForm =
    document.getElementById("loginForm");

const loginCard =
    document.getElementById("loginCard");

const adminPanel =
    document.getElementById("adminPanel");

const loginMessage =
    document.getElementById("loginMessage");

const adminMessage =
    document.getElementById("adminMessage");

const registrationsList =
    document.getElementById("registrationsList");

const logoutBtn =
    document.getElementById("logoutBtn");


function showLoginMessage(text, success = false) {

    loginMessage.textContent = text;

    loginMessage.style.color =
        success
            ? "#69e89a"
            : "#ff6b6b";
}


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("adminEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("adminPassword")
                .value;


        showLoginMessage(
            "Connexion..."
        );


        const { error } =
            await db.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(error);

            showLoginMessage(
                "Email ou mot de passe incorrect."
            );

            return;
        }


        showLoginMessage(
            "Connexion réussie.",
            true
        );


        loginCard.style.display =
            "none";

        adminPanel.style.display =
            "block";


        await loadRegistrations();

    }
);


async function loadRegistrations() {

    registrationsList.innerHTML = `
        <div class="registration">
            Chargement des demandes...
        </div>
    `;


    const { data, error } =
        await db
            .from("registrations")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        registrationsList.innerHTML = `
            <div class="registration">
                Impossible de charger les demandes.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        registrationsList.innerHTML = `
            <div class="registration">
                Aucune demande pour le moment.
            </div>
        `;

        return;
    }


    registrationsList.innerHTML =
        data.map(function (item) {

            const date =
                new Date(
                    item.created_at
                ).toLocaleString();


            let actionButtons = "";


            if (item.status === "pending") {

                actionButtons = `
                    <button
                        class="approve-button"
                        onclick="changeStatus(
                            '${item.id}',
                            'approved'
                        )"
                    >
                        Approuver
                    </button>

                    <button
                        class="reject-button"
                        onclick="changeStatus(
                            '${item.id}',
                            'rejected'
                        )"
                    >
                        Refuser
                    </button>
                `;

            } else if (
                item.status === "approved"
            ) {

                actionButtons = `
                    <button
                        class="reject-button"
                        onclick="changeStatus(
                            '${item.id}',
                            'pending'
                        )"
                    >
                        Remettre en attente
                    </button>
                `;

            } else {

                actionButtons = `
                    <button
                        class="approve-button"
                        onclick="changeStatus(
                            '${item.id}',
                            'approved'
                        )"
                    >
                        Approuver
                    </button>
                `;
            }


            return `
                <div class="registration">

                    <div class="registration-top">

                        <div class="registration-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="status">
                            ${escapeHTML(item.status)}
                        </div>

                    </div>


                    <div class="registration-info">

                        <div>
                            <strong>WhatsApp :</strong>
                            ${escapeHTML(item.phone)}
                        </div>

                        <div>
                            <strong>Pays :</strong>
                            ${escapeHTML(item.country)}
                        </div>

                        <div>
                            <strong>Email :</strong>
                            ${escapeHTML(
                                item.email || "Non renseigné"
                            )}
                        </div>

                        <div>
                            <strong>Date :</strong>
                            ${escapeHTML(date)}
                        </div>

                    </div>


                    <div class="registration-actions">

                        ${actionButtons}

                    </div>

                </div>
            `;

        }).join("");
}


async function changeStatus(id, status) {

    adminMessage.textContent =
        "Modification en cours...";

    adminMessage.style.color =
        "#91a69d";


    const { error } =
        await db
            .from("registrations")
            .update({
                status: status
            })
            .eq("id", id);


    if (error) {

        console.error(error);

        adminMessage.textContent =
            "Erreur : " + error.message;

        adminMessage.style.color =
            "#ff6b6b";

        return;
    }


    adminMessage.textContent =
        "Statut modifié avec succès.";

    adminMessage.style.color =
        "#69e89a";


    await loadRegistrations();
}


logoutBtn.addEventListener(
    "click",
    async function () {

        await db.auth.signOut();

        adminPanel.style.display =
            "none";

        loginCard.style.display =
            "block";

        loginForm.reset();

    }
);


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
                             }
