type Element = {
    id: number;
    credit: number;
    id_unite: number;
    designation: string | null;
}

type Unite = {
    id: number;
    id_annee: number;
    id_section: number;
    categorie: string;
    code: string;
    evaluation: string;
    id_semestre: number;
    intitule: string;
    objectif: string;
    pedagogie: string;
    semestre: string;
    elements?: Element[] | [];
}

type Semestre = {
    semestre: string;
    unites: Unite[];
    etudiants: Student[] | [];
}

type Promotions = [{
    promotion: string;
    semestres: Semestre[];
}];

type Student = {
  id: number;
  id_etudiant: number;
  date_created: string;
  id_annee: number;
  intitule: string;
  id_section: number;
  id_semestre: number;
  nom: string;
  prenom: string | null;
  matricule: string;
  sexe: string;
  grade: string;
  nationalite: string;
  date_naissance: string | null;
  telephone: string;
  photo: string | null;
  adresse: string | null;
  cmi?: string | number | null;
  examen?: string | number | null;
  rattrapage?: string | number | null;
  e_mail?: string | null;
};

export type { Element, Unite, Semestre, Promotions, Student };