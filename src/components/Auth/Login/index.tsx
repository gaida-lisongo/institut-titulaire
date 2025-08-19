"use client";
import { useState } from "react";
import InputGroup from "../../FormElements/InputGroup";
import Link from "next/link";
import { userApi } from "@/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [data, setData] = useState({
    matricule: "",
    secure: "",
    rememberMe: false
  });

  // États pour les modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // État pour la note à l'administrateur
  const [adminNote, setAdminNote] = useState("");
  const [sendingNote, setSendingNote] = useState(false);
  const [noteSubmitted, setNoteSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setData({ ...data, [name]: checked });
    } else {
      setData({ ...data, [name]: value });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Appel à votre API d'authentification
      const response = await userApi.login({
        matricule: data.matricule,
        secure: data.secure
      });
      
      console.log("Réponse de l'API:", response);
      if (response.success) {
        // Redirection vers le tableau de bord
        const login = response.data;
        console.log("Connexion réussie:", login);

        localStorage.setItem("token", login.token);
        localStorage.setItem("user", JSON.stringify(login.user));
        router.push("/");
      } else {
        setErrorMessage(response.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Envoyer la note à l'administrateur
  const handleSendNote = async () => {
    if (!adminNote.trim()) {
      setErrorMessage("Veuillez expliquer votre problème avant d'envoyer la note.");
      setShowErrorModal(true);
      return;
    }

    setSendingNote(true);
    
    try {
      // Simulation d'envoi de la note à l'administrateur
      // Dans une véritable implémentation, vous appelleriez une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marquer comme soumis et afficher un message de confirmation
      setNoteSubmitted(true);
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setNoteSubmitted(false);
        setAdminNote("");
      }, 3000);
    } catch (error) {
      setErrorMessage("Erreur lors de l'envoi de la note. Veuillez réessayer.");
      setShowErrorModal(true);
    } finally {
      setSendingNote(false);
    }
  };

  // Modal mot de passe oublié
  const ForgotPasswordModal = () => {
    if (!showForgotPasswordModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-medium text-dark dark:text-white">
              Mot de passe oublié
            </h3>
            <button 
              onClick={() => {
                setShowForgotPasswordModal(false);
                setNoteSubmitted(false);
                setAdminNote("");
              }}
              className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {noteSubmitted ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h4 className="mb-2 text-lg font-medium text-dark dark:text-white">Note envoyée avec succès</h4>
              <p className="text-body-color dark:text-dark-6">
                Votre demande a été transmise à l'administrateur. Vous serez contacté prochainement.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-body-color dark:text-dark-6">
                Pour réinitialiser votre mot de passe, veuillez envoyer une note à l'administrateur 
                en expliquant votre situation. Veuillez inclure votre matricule et votre nom complet.
              </p>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Votre matricule
                </label>
                <input
                  type="text"
                  value={data.matricule}
                  onChange={(e) => setData({ ...data, matricule: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2"
                  placeholder="Entrez votre matricule"
                />
              </div>
              
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Message à l'administrateur
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="h-32 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2"
                  placeholder="Expliquez votre situation (nom complet, problème rencontré, etc.)"
                  required
                />
              </div>
              
              <button
                onClick={handleSendNote}
                disabled={sendingNote || !adminNote.trim()}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
              >
                {sendingNote ? (
                  <>
                    Envoi en cours...
                    <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                  </>
                ) : (
                  "Envoyer la note"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Modal d'erreur
  const ErrorModal = () => {
    if (!showErrorModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
          <div className="mb-5 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h3 className="mb-2 text-center text-xl font-medium text-dark dark:text-white">
            Erreur
          </h3>
          
          <p className="mb-6 text-center text-body-color dark:text-dark-6">
            {errorMessage}
          </p>
          
          <button
            onClick={() => setShowErrorModal(false)}
            className="flex w-full items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-7.5 text-center">
          <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
            Connexion
          </h2>
          <p className="font-medium">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        <InputGroup
          type="text"
          label="Matricule"
          className="[&_input]:py-[15px]"
          placeholder="Entrez votre matricule"
          name="matricule"
          handleChange={handleChange}
          value={data.matricule}
          required
        />

        <InputGroup
          type="password"
          label="Mot de passe"
          className="[&_input]:py-[15px]"
          placeholder="Entrez votre mot de passe"
          name="secure"
          handleChange={handleChange}
          value={data.secure}
          required
        />

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={data.rememberMe}
              onChange={handleChange}
              className="h-5 w-5 rounded border-stroke bg-transparent accent-primary"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-body-color dark:text-dark-6"
            >
              Se souvenir de moi
            </label>
          </div>

          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setShowForgotPasswordModal(true)}
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
        >
          {loading ? (
            <>
              Connexion en cours...
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
            </>
          ) : (
            "Se connecter"
          )}
        </button>

        <div className="mt-6 text-center">
          <p>
            Vous n'avez pas de compte ?{" "}
            <Link href="/auth/register" className="text-primary">
              S'inscrire
            </Link>
          </p>
        </div>
      </form>

      {/* Modals */}
      <ForgotPasswordModal />
      <ErrorModal />
    </>
  );
}
