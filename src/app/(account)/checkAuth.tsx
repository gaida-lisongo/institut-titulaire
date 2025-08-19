"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("Vérification de l'authentification...");
    // Vérification de l'authentification
    const checkAuthentication = () => {
      // Vérifier si nous sommes côté client (browser)
      if (typeof window !== "undefined") {
        // Récupérer le token du localStorage
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.log("Aucun token trouvé, redirection vers la page de connexion");
          router.push("/login");
          setIsAuthenticated(false);
          return;
        }

        // Vérifier si le token est expiré (optionnel)
        try {
          // Si vous utilisez un JWT, vous pouvez vérifier son expiration
          // Cet exemple suppose un format JWT simple
          const tokenData = JSON.parse(atob(token.split(".")[1]));
          const expirationTime = tokenData.exp * 1000; // Convertir en millisecondes
          
          if (Date.now() >= expirationTime) {
            console.log("Token expiré, redirection vers la page de connexion");
            localStorage.removeItem("token");
            router.push("/login");
            setIsAuthenticated(false);
            return;
          }
        } catch (error) {
          // Si la vérification d'expiration échoue, on continue
          // Le backend rejettera un token invalide de toute façon
          console.warn("Impossible de vérifier l'expiration du token", error);
        }

        // Si on arrive ici, l'utilisateur est authentifié
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
    
    // Événement pour vérifier l'authentification après le chargement de la page
    window.addEventListener("storage", checkAuthentication);
    
    return () => {
      window.removeEventListener("storage", checkAuthentication);
    };
  }, [router]);

  // Afficher un état de chargement pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="text-lg font-medium text-dark dark:text-white">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié, afficher le contenu
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher (redirection déjà en cours)
  return null;
}

// Fonction utilitaire pour vérifier l'authentification sans composant (pour les API routes)
export function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false; // Côté serveur, on considère l'utilisateur non authentifié
  }
  
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  
  try {
    // Vérification simple de l'expiration (optionnel)
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    return Date.now() < tokenData.exp * 1000;
  } catch {
    return false;
  }
}