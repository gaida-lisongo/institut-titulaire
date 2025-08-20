class Titulaire {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async initTitulaire() {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  // Ajoutez cette méthode à votre classe Titulaire

  async getFicheById(
    id: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire/fiche/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération de la fiche: ${response.status}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching fiche:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération de la fiche",
      };
    }
  }

  async updateFiche({
    id,
    col,
    value,
  }: {
    id: number;
    col: string;
    value: any;
  }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/descriptif/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ col, value }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la mise à jour de la fiche: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating fiche:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour de la fiche",
      };
    }
  }

  async fetchStudentsByCharge(
    chargeId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/charge/${chargeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération des étudiants: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching students:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération des étudiants",
      };
    }
  }

  async updateNoteCharge({
    cmdId,
    col,
    value,
  }: {
    cmdId: number;
    col: string;
    value: any;
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/charge/${cmdId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ col, value }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la mise à jour de la note: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating note:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour de la note",
      };
    }
  }

  async deleteStudentFromCharge({
    id,
  }: {
    id: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire/charge/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la suppression de l'étudiant: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting student:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression de l'étudiant",
      };
    }
  }

  async fetchTravauxByCharge(
    chargeId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/travail/charge/${chargeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération des travaux: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching travaux:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération des travaux",
      };
    }
  }

  async uploadPdf(
    file: File,
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${this.baseUrl}/file/upload-pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de l'upload du PDF: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'upload du PDF",
      };
    }
  }

  async addTravail({
    titre,
    description,
    type,
    date_fin,
    montant,
    id_charge,
    ponderation,
    url,
  }: {
    titre: string;
    description: string;
    type: string;
    date_fin: string;
    montant: number;
    id_charge: number;
    ponderation: number;
    url?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/travail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          titre,
          description,
          type,
          date_fin,
          montant,
          id_charge,
          ponderation,
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de l'ajout du travail: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding travail:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'ajout du travail",
      };
    }
  }

  async updateTravail({
    id,
    col,
    value,
  }: {
    id: number;
    col: string;
    value: any;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/travail/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [col]: value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la mise à jour du travail: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating travail:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour du travail",
      };
    }
  }

  async deleteTravail(
    id: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Attempting to delete travail with ID: ${id}`);

      const response = await fetch(`${this.baseUrl}/travail/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Delete response data:", data);

      return data;
    } catch (error) {
      console.error("Erreur lors de la suppression du travail:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression du travail",
      };
    }
  }

  async fetchCmdTravaux(
    id: number,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/travail/commandes/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération des travaux: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching travaux:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération des travaux",
      };
    }
  }

  async updateCmdTravail({
    id,
    col,
    value,
  }: {
    id: number;
    col: string;
    value: any;
  }) {
    try {
      const result = await fetch(`${this.baseUrl}/travail/commande/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ col, value }),
      });
      return result;
    } catch (error) {
      console.error("Error updating cmd travail:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour du cmd travail",
      };
    }
  }

  async fetchSeancesByCharge(
    chargeId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/seances/${chargeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération des séances: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching séances:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération des séances",
      };
    }
  }

  async updateSeance({
    id,
    col,
    value,
  }: {
    id: number;
    col: string;
    value: any;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await fetch(`${this.baseUrl}/titulaire/seance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ col, value }),
      });
      return await result.json();
    } catch (error) {
      console.error("Error updating seance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour de la séance",
      };
    }
  }

  async deleteSeance(
    id: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire/seance/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la suppression de la séance: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting seance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression de la séance",
      };
    }
  }

  async createSeance(
    data: any,
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire/seance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la création de la séance: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating seance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la création de la séance",
      };
    }
  }

  async fetchCommandesSeance(
    seanceId: number,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/seance/${seanceId}/commandes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération des commandes de la séance: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching commandes de la séance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération des commandes de la séance",
      };
    }
  }

  async updateCommandesSeance({
    id,
    col,
    value,
  }: {
    id: number;
    col: string;
    value: any;
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/seance/${id}/commande`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ col, value }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la mise à jour des commandes de la séance: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating commandes de la séance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la mise à jour des commandes de la séance",
      };
    }
  }

  async deleteCommandesSeance(
    id: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/seance/${id}/commandes`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la suppression des commandes de la séance: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting commandes de la séance:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression des commandes de la séance",
      };
    }
  }

  async fetchJury(
    id: number,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/titulaire/jury/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération du jury: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching jury:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération du jury",
      };
    }
  }

  async fetchStudent({
    id,
    semestre,
  }: {
    id: number;
    semestre: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/students/${id}/${semestre}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération de l'étudiant: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching student:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération de l'étudiant",
      };
    }
  }

  async fetchNote({
    id_etudiant,
    id_element,
    id_annee,
  }: {
    id_etudiant: number;
    id_element: number;
    id_annee: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/note?id_etudiant=${id_etudiant}&id_element=${id_element}&id_annee=${id_annee}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la récupération de la note: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching note:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la récupération de la note",
      };
    }
  }

  async checkAutorizationJury({ id, code }: { id: number; code: string }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/titulaire/check-jury/${id}/${code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Erreur lors de la vérification de l'autorisation: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking autorization:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la vérification de l'autorisation",
      };
    }
  }
}
export default Titulaire;