// =====================================================
// LISSA 1K FOLDER
// ADMIN.JS
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");


const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");


const loginMessage =
    document.getElementById("loginMessage");


const dashboardMessage =
    document.getElementById("dashboardMessage");


const adminEmail =
    document.getElementById("adminEmail");


const logoutBtn =
    document.getElementById("logoutBtn");


const refreshBtn =
    document.getElementById("refreshBtn");


const downloadVcfBtn =
    document.getElementById("downloadVcfBtn");


const vcfMessage =
    document.getElementById("vcfMessage");


const membersList =
    document.getElementById("membersList");


const totalCount =
    document.getElementById("totalCount");


const pendingCount =
    document.getElementById("pendingCount");


const approvedCount =
    document.getElementById("approvedCount");


const rejectedCount =
    document.getElementById("rejectedCount");


// =====================================================
// AFFICHER LOGIN
// =====================================================

function showLogin() {

    loginSection.classList.remove("hidden");

    dashboardSection.classList.add("hidden");

    adminEmail.textContent = "";

}


// =====================================================
// AFFICHER DASHBOARD
// =====================================================

function showDashboard(session) {

    loginSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

    if (session && session.user) {

        adminEmail.textContent =
            session.user.email || "";

    }

}


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

        showDashboard(data.session);

        await loadMembers();

    } else {

        showLogin();

    }

}


// =====================================================
// CONNEXION
// =====================================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const email =
            loginEmail.value.trim();


        const password =
            loginPassword.value;


        loginMessage.textContent =
            "Connexion en cours...";

        loginMessage.className =
            "message";


        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "E-mail ou mot de passe incorrect.";

            loginMessage.className =
                "message error";

            return;

        }


        loginMessage.textContent =
            "Connexion réussie.";

        loginMessage.className =
            "message success";


        showDashboard(data.session);

        await loadMembers();

    }
);


// =====================================================
// DÉCONNEXION
// =====================================================

logoutBtn.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        showLogin();

    }
);


// =====================================================
// CHARGER LES INSCRIPTIONS
// =====================================================

async function loadMembers() {

    membersList.innerHTML = `
        <div class="loading">
            Chargement des demandes...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("registrations")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        membersList.innerHTML = `
            <div class="empty">
                Impossible de charger les inscriptions.
            </div>
        `;

        dashboardMessage.textContent =
            error.message;

        dashboardMessage.className =
            "message error";

        return;

    }


    updateStatistics(data);

    renderMembers(data);

}


// =====================================================
// STATISTIQUES
// =====================================================

function updateStatistics(members) {

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


    const rejected =
        members.filter(
            member =>
                member.status === "rejected"
        ).length;


    totalCount.textContent =
        total;


    pendingCount.textContent =
        pending;


    approvedCount.textContent =
        approved;


    rejectedCount.textContent =
        rejected;

}


// =====================================================
// AFFICHER LES MEMBRES
// =====================================================

function renderMembers(members) {

    if (
        !members ||
        members.length === 0
    ) {

        membersList.innerHTML = `
            <div class="empty">
                Aucune inscription pour le moment.
            </div>
        `;

        return;

    }


    membersList.innerHTML = "";


    members.forEach(
        member => {

            const row =
                document.createElement("div");


            row.className =
                "member-row";


            const status =
                member.status || "pending";


            const date =
                member.created_at
                    ? new Date(
                        member.created_at
                    ).toLocaleString("fr-FR")
                    : "Date inconnue";


            row.innerHTML = `

                <div class="member-info">

                    <div class="member-avatar">

                        ${escapeHTML(
                            getInitials(
                                member.name
                            )
                        )}

                    </div>


                    <div class="member-main">

                        <strong>
                            ${escapeHTML(
                                member.name ||
                                "Sans nom"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                member.phone ||
                                "Aucun numéro"
                            )}
                        </span>

                    </div>

                </div>


                <div class="member-details">

                    <span>
                        Pays :
                        ${escapeHTML(
                            member.country ||
                            "Inconnu"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            member.email ||
                            "Pas d'e-mail"
                        )}
                    </span>

                    <small>
                        ${date}
                    </small>

                </div>


                <div>

                    <span
                        class="status ${escapeHTML(status)}"
                    >
                        ${getStatusLabel(status)}
                    </span>

                </div>


                <div class="member-actions">

                    ${
                        status !== "approved"
                        ? `
                            <button
                                class="approve-btn"
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
                                class="reject-btn"
                                data-id="${member.id}"
                            >
                                Refuser
                            </button>
                        `
                        : ""
                    }

                </div>

            `;


            membersList.appendChild(row);

        }
    );


    // ================= APPROUVER =================

    document
        .querySelectorAll(".approve-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        updateStatus(
                            button.dataset.id,
                            "approved"
                        );

                    }
                );

            }
        );


    // ================= REFUSER =================

    document
        .querySelectorAll(".reject-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        updateStatus(
                            button.dataset.id,
                            "rejected"
                        );

                    }
                );

            }
        );

}


// =====================================================
// MODIFIER LE STATUT
// =====================================================

async function updateStatus(
    id,
    newStatus
) {

    const question =
        newStatus === "approved"
            ? "Approuver cette demande ?"
            : "Refuser cette demande ?";


    if (!confirm(question)) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("registrations")
            .update({

                status: newStatus

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        dashboardMessage.textContent =
            "Erreur : " +
            error.message;

        dashboardMessage.className =
            "message error";

        return;

    }


    dashboardMessage.textContent =
        newStatus === "approved"
            ? "Demande approuvée."
            : "Demande refusée.";


    dashboardMessage.className =
        "message success";


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


        vcfMessage.textContent =
            "";


        try {

            // -----------------------------------------
            // Vérifier la connexion admin
            // -----------------------------------------

            const {
                data: userData,
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (
                userError ||
                !userData.user
            ) {

                throw new Error(
                    "Tu dois être connecté en tant qu'admin."
                );

            }


            // -----------------------------------------
            // Récupérer les membres approuvés
            // -----------------------------------------

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

                console.error(error);

                throw new Error(
                    error.message
                );

            }


            // -----------------------------------------
            // Aucun membre
            // -----------------------------------------

            if (
                !members ||
                members.length === 0
            ) {

                throw new Error(
                    "Aucun membre approuvé pour le moment."
                );

            }


            // -----------------------------------------
            // CRÉER LE VCF
            // -----------------------------------------

            let vcfContent = "";


            members.forEach(
                member => {

                    const name =
                        member.name
                            ? member.name.trim()
                            : "Membre";


                    const phone =
                        member.phone
                            ? member.phone.trim()
                            : "";


                    const email =
                        member.email
                            ? member.email.trim()
                            : "";


                    const country =
                        member.country
                            ? member.country.trim()
                            : "";


                    const date =
                        member.created_at
                            ? new Date(
                                member.created_at
                            ).toLocaleDateString(
                                "fr-FR"
                            )
                            : "";


                    // Préfixe Lissa
                    const displayName =
                        `(LE) ${name}`;


                    // ---------------------------------
                    // VCARD
                    // ---------------------------------

                    vcfContent +=
                        "BEGIN:VCARD\r\n";

                    vcfContent +=
                        "VERSION:3.0\r\n";


                    vcfContent +=
                        `FN:${escapeVCF(
                            displayName
                        )}\r\n`;


                    vcfContent +=
                        `N:${escapeVCF(
                            name
                        )};;;;\r\n`;


                    if (phone) {

                        vcfContent +=
                            `TEL;TYPE=CELL:${escapeVCF(
                                phone
                            )}\r\n`;

                    }


                    if (email) {

                        vcfContent +=
                            `EMAIL:${escapeVCF(
                                email
                            )}\r\n`;

                    }


                    if (country) {

                        vcfContent +=
                            `NOTE:Pays: ${escapeVCF(
                                country
                            )}\\n`;

                    }


                    if (date) {

                        vcfContent +=
                            `NOTE:Date d'inscription: ${escapeVCF(
                                date
                            )}\r\n`;

                    }


                    vcfContent +=
                        "END:VCARD\r\n";


                    vcfContent +=
                        "\r\n";

                }
            );


            // -----------------------------------------
            // CRÉER LE FICHIER
            // -----------------------------------------

            const blob =
                new Blob(
                    [vcfContent],
                    {
                        type:
                            "text/vcard;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href =
                url;


            link.download =
                "Lissa.vcf";


            document.body.appendChild(link);


            link.click();


            document.body.removeChild(link);


            setTimeout(
                () => {

                    URL.revokeObjectURL(url);

                },
                1000
            );


            // -----------------------------------------
            // MESSAGE
            // -----------------------------------------

            vcfMessage.textContent =
                `${members.length} contact(s) approuvé(s) exporté(s) dans Lissa.vcf.`;

            vcfMessage.className =
                "message success";


        } catch (error) {

            console.error(error);

            vcfMessage.textContent =
                "Erreur : " +
                error.message;

            vcfMessage.className =
                "message error";

        } finally {

            downloadVcfBtn.disabled =
                false;

            downloadVcfBtn.textContent =
                "Télécharger Lissa.vcf";

        }

    }
);


// =====================================================
// ACTUALISER
// =====================================================

refreshBtn.addEventListener(
    "click",
    async function() {

        await loadMembers();

    }
);


// =====================================================
// AUTH STATE
// =====================================================

supabaseClient.auth.onAuthStateChange(
    async function(
        event,
        session
    ) {

        if (session) {

            showDashboard(session);

            await loadMembers();

        } else {

            showLogin();

        }

    }
);


// =====================================================
// UTILITAIRES
// =====================================================

function getInitials(name) {

    if (!name) {

        return "LE";

    }


    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


function getStatusLabel(status) {

    if (
        status === "approved"
    ) {

        return "Approuvé";

    }


    if (
        status === "rejected"
    ) {

        return "Refusé";

    }


    return "En attente";

}


function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
  
