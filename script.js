// =====================================================
// LISSA 1K FOLDER — ADMIN
// =====================================================

const loginSection =
    document.getElementById("loginSection");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshBtn");

const membersList =
    document.getElementById("membersList");

const adminMessage =
    document.getElementById("adminMessage");

const downloadVcfBtn =
    document.getElementById("downloadVcfBtn");

const vcfMessage =
    document.getElementById("vcfMessage");

const totalCount =
    document.getElementById("totalCount");

const pendingCount =
    document.getElementById("pendingCount");

const approvedCount =
    document.getElementById("approvedCount");


// =====================================================
// AFFICHER LOGIN
// =====================================================

function showLogin() {

    loginSection.classList.remove("hidden");

    adminPanel.classList.add("hidden");

}


// =====================================================
// AFFICHER ADMIN
// =====================================================

function showAdmin() {

    loginSection.classList.add("hidden");

    adminPanel.classList.remove("hidden");

}


// =====================================================
// CONNEXION
// =====================================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginBtn.disabled = true;

    loginBtn.textContent = "Connexion...";

    loginMessage.textContent = "";

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

    });


    if (error) {

        console.error(error);

        loginMessage.textContent =
            "E-mail ou mot de passe incorrect.";

        loginMessage.style.color = "#e95d5d";

        loginBtn.disabled = false;

        loginBtn.textContent =
            "Se connecter";

        return;

    }


    showAdmin();

    await loadMembers();


    loginBtn.disabled = false;

    loginBtn.textContent =
        "Se connecter";

});


// =====================================================
// VÉRIFIER LA SESSION
// =====================================================

async function checkSession() {

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(error);

        showLogin();

        return;

    }


    if (data.session) {

        showAdmin();

        await loadMembers();

    } else {

        showLogin();

    }

}


// =====================================================
// DÉCONNEXION
// =====================================================

logoutBtn.addEventListener("click", async function() {

    await supabaseClient.auth.signOut();

    showLogin();

});


// =====================================================
// CHARGER LES MEMBRES
// =====================================================

async function loadMembers() {

    membersList.innerHTML = `
        <div class="loading">
            Chargement...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("registrations")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        membersList.innerHTML = `
            <div class="empty">
                Impossible de charger les demandes.
            </div>
        `;

        adminMessage.textContent =
            error.message;

        adminMessage.style.color =
            "#e95d5d";

        return;

    }


    updateStats(data);

    displayMembers(data);

}


// =====================================================
// STATISTIQUES
// =====================================================

function updateStats(members) {

    const total =
        members.length;


    const pending =
        members.filter(
            member =>
                member.status === "pending"
        ).length;


    const approved =
        members.filter(
            member =>
                member.status === "approved"
        ).length;


    totalCount.textContent =
        total;

    pendingCount.textContent =
        pending;

    approvedCount.textContent =
        approved;

}


// =====================================================
// AFFICHER LES MEMBRES
// =====================================================

function displayMembers(members) {

    if (!members.length) {

        membersList.innerHTML = `
            <div class="empty">
                Aucune demande pour le moment.
            </div>
        `;

        return;

    }


    membersList.innerHTML = "";


    members.forEach(member => {

        const div =
            document.createElement("div");

        div.className =
            "member";


        const date =
            member.created_at
                ? new Date(
                    member.created_at
                ).toLocaleDateString("fr-FR")
                : "";


        const status =
            member.status || "pending";


        div.innerHTML = `

            <div>

                <div class="member-name">
                    ${escapeHTML(
                        member.name || "Sans nom"
                    )}
                </div>

                <div class="member-info">
                    ${escapeHTML(
                        member.phone || "Pas de numéro"
                    )}
                </div>

            </div>


            <div>

                <div class="member-info">
                    Pays :
                    ${escapeHTML(
                        member.country || "Inconnu"
                    )}
                </div>

                <div class="member-info">
                    ${escapeHTML(
                        member.email || "Pas d'e-mail"
                    )}
                </div>

                <div class="member-info">
                    ${date}
                </div>

            </div>


            <div>

                <span class="status ${status}">
                    ${getStatus(status)}
                </span>


                <div class="actions">

                    ${
                        status !== "approved"
                        ? `
                            <button
                                class="approve"
                                data-id="${member.id}"
                            >
                                Approuver
                            </button>
                        `
                        : ""
                    }


                    ${
                        status !== "rejected"
                        ? `
                            <button
                                class="reject"
                                data-id="${member.id}"
                            >
                                Refuser
                            </button>
                        `
                        : ""
                    }

                </div>

            </div>

        `;


        membersList.appendChild(div);

    });


    document
        .querySelectorAll(".approve")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => updateStatus(
                    button.dataset.id,
                    "approved"
                )
            );

        });


    document
        .querySelectorAll(".reject")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => updateStatus(
                    button.dataset.id,
                    "rejected"
                )
            );

        });

}


// =====================================================
// CHANGER LE STATUT
// =====================================================

async function updateStatus(id, status) {

    const confirmation =
        confirm(
            status === "approved"
                ? "Approuver cette demande ?"
                : "Refuser cette demande ?"
        );


    if (!confirmation) {

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("registrations")
        .update({
            status: status
        })
        .eq("id", id);


    if (error) {

        console.error(error);

        adminMessage.textContent =
            error.message;

        adminMessage.style.color =
            "#e95d5d";

        return;

    }


    adminMessage.textContent =
        status === "approved"
            ? "Demande approuvée."
            : "Demande refusée.";

    adminMessage.style.color =
        "#159447";


    await loadMembers();

}


// =====================================================
// TÉLÉCHARGER LISSA.VCF
// =====================================================

downloadVcfBtn.addEventListener(
    "click",
    async function() {

        downloadVcfBtn.disabled = true;

        downloadVcfBtn.textContent =
            "Génération...";


        vcfMessage.textContent = "";


        try {

            const {
                data: sessionData
            } =
                await supabaseClient.auth.getSession();


            if (!sessionData.session) {

                throw new Error(
                    "Vous devez être connecté."
                );

            }


            const {
                data: members,
                error
            } =
                await supabaseClient
                    .from("registrations")
                    .select(
                        "name,email,phone,country,created_at"
                    )
                    .eq(
                        "status",
                        "approved"
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                throw error;

            }


            if (!members.length) {

                throw new Error(
                    "Aucun membre approuvé."
                );

            }


            let vcf = "";


            members.forEach(member => {

                const name =
                    member.name || "Membre";

                const displayName =
                    `(LE) ${name}`;


                vcf +=
                    "BEGIN:VCARD\r\n";

                vcf +=
                    "VERSION:3.0\r\n";

                vcf +=
                    `FN:${escapeVCF(displayName)}\r\n`;

                vcf +=
                    `N:${escapeVCF(name)};;;;\r\n`;


                if (member.phone) {

                    vcf +=
                        `TEL;TYPE=CELL:${escapeVCF(
                            member.phone
                        )}\r\n`;

                }


                if (member.email) {

                    vcf +=
                        `EMAIL:${escapeVCF(
                            member.email
                        )}\r\n`;

                }


                if (member.country) {

                    vcf +=
                        `NOTE:Pays: ${escapeVCF(
                            member.country
                        )}\r\n`;

                }


                if (member.created_at) {

                    const date =
                        new Date(
                            member.created_at
                        ).toLocaleDateString(
                            "fr-FR"
                        );


                    vcf +=
                        `NOTE:Date d'inscription: ${escapeVCF(
                            date
                        )}\r\n`;

                }


                vcf +=
                    "END:VCARD\r\n";

            });


            const blob =
                new Blob(
                    [vcf],
                    {
                        type:
                            "text/vcard;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "Lissa.vcf";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            URL.revokeObjectURL(url);


            vcfMessage.textContent =
                `${members.length} contact(s) exporté(s) dans Lissa.vcf.`;

            vcfMessage.style.color =
                "#159447";


        } catch (error) {

            console.error(error);

            vcfMessage.textContent =
                "Erreur : " +
                error.message;

            vcfMessage.style.color =
                "#e95d5d";

        }


        downloadVcfBtn.disabled = false;

        downloadVcfBtn.textContent =
            "Télécharger Lissa.vcf";

    }
);


// =====================================================
// ACTUALISER
// =====================================================

refreshBtn.addEventListener(
    "click",
    loadMembers
);


// =====================================================
// UTILITAIRES
// =====================================================

function getStatus(status) {

    if (status === "approved") {

        return "Approuvé";

    }


    if (status === "rejected") {

        return "Refusé";

    }


    return "En attente";

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeVCF(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");

}


// =====================================================
// DÉMARRAGE
// =====================================================

checkSession();
