// =====================================================
// LISSA 1K FOLDER — SCRIPT PRINCIPAL
// =====================================================

// Vérifier que Supabase est bien chargé
if (typeof supabase === "undefined") {
console.error("Supabase JS n'est pas chargé.");
}

// Récupérer le client créé dans supabase-client.js
const db = window.supabaseClient;

// Éléments du formulaire
const form = document.getElementById("registrationForm");
const message = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

// Éléments des membres
const membersList = document.getElementById("membersList");
const memberCounters = document.querySelectorAll("#memberCount");

// =====================================================
// VÉRIFICATION
// =====================================================

if (!db) {
console.error("supabaseClient est introuvable.");
showMessage(
"Erreur de connexion au serveur.",
"error"
);
}

// =====================================================
// MESSAGE
// =====================================================

function showMessage(text, type) {

if (!message) return;  

message.textContent = text;  

if (type === "success") {  
    message.style.color = "#69e89a";  
} else {  
    message.style.color = "#ff6b6b";  
}

}

// =====================================================
// ENVOI DU FORMULAIRE
// =====================================================

if (form) {

form.addEventListener("submit", async function (event) {  

    event.preventDefault();  

    // Récupération des valeurs  
    const name = document  
        .getElementById("name")  
        .value  
        .trim();  

    const phone = document  
        .getElementById("phone")  
        .value  
        .trim();  

    const country = document  
        .getElementById("country")  
        .value  
        .trim();  

    const email = document  
        .getElementById("email")  
        .value  
        .trim();  


    // ================= VALIDATION =================  

    if (name.length < 2) {  

        showMessage(  
            "Tanpri antre non ou.",  
            "error"  
        );  

        return;  
    }  


    if (phone.length < 6) {  

        showMessage(  
            "Tanpri antre yon nimewo WhatsApp valab.",  
            "error"  
        );  

        return;  
    }  


    if (!country) {  

        showMessage(  
            "Tanpri chwazi peyi ou.",  
            "error"  
        );  

        return;  
    }  


    // ================= CHARGEMENT =================  

    showMessage(  
        "Ap voye demann ou...",  
        "success"  
    );  

    if (submitBtn) {  

        submitBtn.disabled = true;  

        const buttonText =  
            submitBtn.querySelector("span");  

        if (buttonText) {  
            buttonText.textContent =  
                "Ap voye...";  
        }  
    }  


    try {  

        // ================= SUPABASE INSERT =================  

        const { data, error } = await db  
            .from("registrations")  
            .insert([  
                {  
                    name: name,  
                    email: email || null,  
                    phone: phone,  
                    status: "pending",  
                    country: country  
                }  
            ])  
            .select();  


        // ================= ERREUR =================  

        if (error) {  

            console.error(  
                "SUPABASE ERROR:",  
                error  
            );  

            showMessage(  
                "Erreur : " + error.message,  
                "error"  
            );  

            return;  
        }  


        // ================= SUCCÈS =================  

        console.log(  
            "Inscription enregistrée :",  
            data  
        );  

        showMessage(  
            "Demann ou voye avèk siksè. Tann apwobasyon admin lan.",  
            "success"  
        );  


        // Vider le formulaire  
        form.reset();  


        // Actualiser les membres  
        loadMembers();  

    } catch (error) {  

        console.error(  
            "ERREUR JAVASCRIPT:",  
            error  
        );  

        showMessage(  
            "Yon pwoblèm rive : " + error.message,  
            "error"  
        );  

    } finally {  

        // Réactiver le bouton  
        if (submitBtn) {  

            submitBtn.disabled = false;  

            const buttonText =  
                submitBtn.querySelector("span");  

            if (buttonText) {  
                buttonText.textContent =  
                    "Envoyer ma demande";  
            }  
        }  
    }  

});

}

// =====================================================
// CHARGER LES MEMBRES APPROUVÉS
// =====================================================

async function loadMembers() {

if (!db || !membersList) return;  

try {  

    const { data, error } = await db  
        .from("registrations")  
        .select("name, country, created_at")  
        .eq("status", "approved")  
        .order("created_at", {  
            ascending: false  
        });  


    if (error) {  

        console.error(  
            "Erreur chargement membres:",  
            error  
        );  

        return;  
    }  


    // Nombre de membres  
    const count = data  
        ? data.length  
        : 0;  


    memberCounters.forEach(function (counter) {  

        counter.textContent = count;  

    });  


    // Aucun membre  
    if (!data || data.length === 0) {  

        membersList.innerHTML = `  
            <div class="empty-members">  

                <div class="empty-icon">  
                    LE  
                </div>  

                <strong>  
                    Aucun membre pour le moment.  
                </strong>  

                <span>  
                    Sois le premier à rejoindre la communauté.  
                </span>  

            </div>  
        `;  

        return;  
    }  


    // Afficher les membres  
    membersList.innerHTML = data  
        .map(function (member) {  

            const firstLetter =  
                member.name  
                    ? member.name.charAt(0).toUpperCase()  
                    : "L";  

            return `  
                <div class="member-item">  

                    <div class="member-avatar">  
                        ${firstLetter}  
                    </div>  

                    <div class="member-info">  

                        <strong>  
                            ${escapeHTML(member.name)}  
                        </strong>  

                        <span>  
                            ${escapeHTML(member.country || "")}  
                        </span>  

                    </div>  

                </div>  
            `;  

        })  
        .join("");  


} catch (error) {  

    console.error(  
        "Erreur membres:",  
        error  
    );  
}

}

// =====================================================
// PROTECTION HTML
// =====================================================

function escapeHTML(value) {

if (!value) return "";  

return String(value)  
    .replace(/&/g, "&amp;")  
    .replace(/</g, "&lt;")  
    .replace(/>/g, "&gt;")  
    .replace(/"/g, "&quot;")  
    .replace(/'/g, "&#039;");

}

// =====================================================
// DÉMARRAGE
// =====================================================

loadMembers();
