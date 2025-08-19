class User {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async uploadFile(formData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/file/upload`, {
                method: "POST",
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error("Failed to upload file");
            }
    
            const data = await response.json();
            console.log("File uploaded successfully:", data);

            return data;
        } catch (error) {
            console.error("Error uploading file:", error);
            return { 
                success: false,
                message: error instanceof Error ? error.message : "An unknown error occurred"
            };
        }
    }

    async createdAgent({        
        nom,
        post_nom,
        prenom,
        sexe,
        date_naissance,
        nationalite,
        e_mail,
        secure,
        photo,
        telephone,
    } : any){
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nom,
                    post_nom,
                    prenom,
                    sexe,
                    date_naissance,
                    nationalite,
                    e_mail,
                    secure,
                    photo,
                    telephone,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create agent");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error creating agent:", error);
            throw error;
        }
    }

    async login({
        matricule,
        secure
    }: {
        matricule: string;
        secure: string;
    }): Promise<{ success: boolean; data?: any; message?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/user/auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    matricule,
                    secure,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Échec de l'authentification");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error during login:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion"
            };
        }
    }

    // Méthode pour envoyer une note à l'administrateur (mot de passe oublié)
    async sendPasswordResetNote({
        matricule,
        note
    }: {
        matricule: string;
        note: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/user/password-reset-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    matricule,
                    note,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Échec de l'envoi de la note");
            }

            return {
                success: true,
                message: "Votre demande a été envoyée avec succès à l'administrateur"
            };
        } catch (error) {
            console.error("Error sending password reset note:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de la note"
            };
        }
    }

    async getPrivileges(id: string){
        try {
            const response = await fetch(`${this.baseUrl}/user/privileges/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user privileges");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching user privileges:", error);
            throw error;
        }
    }
}

export default User;