import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

type Student = {
  id: number;
  matricule: string;
  nom: string;
  prenom?: string;
  sexe: string;
  nationalite: string;
  cmi: string;
  examen: string | null;
  rattrapage: string | null;
};

type CourseInfo = {
  code: string;
  ecue: string;
  filiaire: string;
  credit: number;
  annee: string;
  statut: string;
};

class FicheCotation {
  private calculateTotals(cmi: string, examen: string | null, rattrapage: string | null, credit: number) {
    const cmiValue = parseFloat(cmi) || 0;
    const examenValue = parseFloat(examen || '0') || 0;
    const rattrapageValue = parseFloat(rattrapage || '0') || 0;
    
    const totalAnnuel = cmiValue + examenValue;
    let totalObtenu = totalAnnuel;
    
    if (rattrapageValue > 0 && rattrapageValue > totalAnnuel) {
      totalObtenu = rattrapageValue;
    }
    
    const totalPond = totalObtenu * credit;
    
    return {
      totalAnnuel,
      totalObtenu,
      totalPond,
      mention: this.getMention(totalObtenu)
    };
  }

  private getMention(total: number) {
    if (total < 10) return "Échec";
    if (total < 12) return "Passable";
    if (total < 14) return "Assez Bien";
    if (total < 16) return "Bien";
    if (total < 18) return "Très Bien";
    return "Excellent";
  }

  /**
   * Génère et télécharge un fichier Excel avec les notes des étudiants
   * @param students Liste des étudiants avec leurs notes
   * @param courseInfo Informations sur le cours
   * @returns Promise<boolean> true si l'export a réussi, false sinon
   */
  public async generateAndDownloadExcel(students: Student[], courseInfo: CourseInfo): Promise<boolean> {
    try {
      // Créer un nouveau classeur
      const workbook = new ExcelJS.Workbook();
      
      // Ajouter une feuille
      const worksheet = workbook.addWorksheet('Notes Étudiants');
      
      // Définir les en-têtes
      worksheet.columns = [
        { header: 'Matricule', key: 'matricule', width: 15 },
        { header: 'Nom', key: 'nom', width: 20 },
        { header: 'Prénom', key: 'prenom', width: 20 },
        { header: 'Sexe', key: 'sexe', width: 10 },
        { header: 'Nationalité', key: 'nationalite', width: 15 },
        { header: 'CMI', key: 'cmi', width: 10 },
        { header: 'Examen', key: 'examen', width: 10 },
        { header: 'Rattrapage', key: 'rattrapage', width: 12 },
        { header: 'Total', key: 'total', width: 10 },
        { header: 'Mention', key: 'mention', width: 15 }
      ];
      
      // Style pour l'en-tête
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4167B2' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      
      // Ajouter les informations du cours
      const titleRow = worksheet.addRow(['Relevé de notes']);
      titleRow.font = { bold: true, size: 16 };
      worksheet.mergeCells(`A${titleRow.number}:J${titleRow.number}`);
      
      worksheet.addRow([]);
      
      const courseRows = [
        ['Cours', courseInfo.ecue],
        ['Code', courseInfo.code],
        ['Filière', courseInfo.filiaire],
        ['Crédits', courseInfo.credit.toString()],
        ['Année académique', courseInfo.annee],
        ['Statut', courseInfo.statut]
      ];
      
      courseRows.forEach(row => {
        const newRow = worksheet.addRow(row);
        newRow.getCell(1).font = { bold: true };
        worksheet.mergeCells(`B${newRow.number}:J${newRow.number}`);
      });
      
      worksheet.addRow([]);
      
      // Réinitialiser le compteur pour les en-têtes du tableau des étudiants
      const headerRow = worksheet.addRow([
        'Matricule', 'Nom', 'Prénom', 'Sexe', 'Nationalité', 
        'CMI', 'Examen', 'Rattrapage', 'Total', 'Mention'
      ]);
      
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      
      // Ajouter les données des étudiants
      students.forEach(student => {
        const { totalObtenu, mention } = this.calculateTotals(
          student.cmi,
          student.examen,
          student.rattrapage,
          courseInfo.credit
        );
        
        const row = worksheet.addRow({
          matricule: student.matricule,
          nom: student.nom,
          prenom: student.prenom || '',
          sexe: student.sexe === 'M' ? 'Homme' : 'Femme',
          nationalite: student.nationalite,
          cmi: student.cmi,
          examen: student.examen || 'N/A',
          rattrapage: student.rattrapage || 'N/A',
          total: totalObtenu.toFixed(1),
          mention: mention
        });
        
        // Mettre en rouge les notes en échec
        if (totalObtenu < 10) {
          row.getCell('total').font = { color: { argb: 'FF0000' } };
          row.getCell('mention').font = { color: { argb: 'FF0000' } };
        } else {
          row.getCell('total').font = { color: { argb: '008000' } };
          row.getCell('mention').font = { color: { argb: '008000' } };
        }
      });
      
      // Ajouter une statistique récapitulative
      worksheet.addRow([]);
      
      const maleCount = students.filter(s => s.sexe === 'M').length;
      const femaleCount = students.filter(s => s.sexe === 'F').length;
      const totalStudents = students.length;
      const passCount = students.filter(s => {
        const { totalObtenu } = this.calculateTotals(s.cmi, s.examen, s.rattrapage, courseInfo.credit);
        return totalObtenu >= 10;
      }).length;
      const failCount = totalStudents - passCount;
      
      const statsRows = [
        ['Nombre total d\'étudiants', totalStudents.toString()],
        ['Hommes', maleCount.toString()],
        ['Femmes', femaleCount.toString()],
        ['Réussite', `${passCount} (${Math.round((passCount / totalStudents) * 100)}%)`],
        ['Échec', `${failCount} (${Math.round((failCount / totalStudents) * 100)}%)`]
      ];
      
      const statsHeaderRow = worksheet.addRow(['Statistiques']);
      statsHeaderRow.font = { bold: true, size: 14 };
      worksheet.mergeCells(`A${statsHeaderRow.number}:J${statsHeaderRow.number}`);
      
      statsRows.forEach(row => {
        const newRow = worksheet.addRow(row);
        newRow.getCell(1).font = { bold: true };
        worksheet.mergeCells(`B${newRow.number}:J${newRow.number}`);
      });
      
      // Ajouter la date de génération
      worksheet.addRow([]);
      const dateRow = worksheet.addRow([`Document généré le ${new Date().toLocaleString()}`]);
      worksheet.mergeCells(`A${dateRow.number}:J${dateRow.number}`);
      dateRow.font = { italic: true, color: { argb: '888888' } };
      
      // Générer le fichier Excel
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Créer un nom de fichier sécurisé en remplaçant les caractères problématiques
      const filename = `${courseInfo.code}_${courseInfo.ecue.replace(/[^a-zA-Z0-9]/g, '_')}_${courseInfo.annee.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      
      saveAs(blob, filename);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du fichier Excel:', error);
      return false;
    }
  }

  /**
   * Génère un fichier Excel sans le télécharger (utile pour les tests ou les traitements serveur)
   * @param students Liste des étudiants avec leurs notes
   * @param courseInfo Informations sur le cours
   * @returns Promise<ArrayBuffer> Buffer contenant les données du fichier Excel
   */
  public async generateExcelBuffer(students: Student[], courseInfo: CourseInfo): Promise<ArrayBuffer> {
    // Créer un nouveau classeur
    const workbook = new ExcelJS.Workbook();
    
    // Même logique que ci-dessus, mais retourne le buffer au lieu de télécharger
    
    // ... (code identique à la méthode précédente jusqu'à la génération du buffer)
    
    // Générer et retourner le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

// Exporter une instance pour une utilisation simple
const ficheCotation = new FicheCotation();
export default ficheCotation;

// Exporter aussi la classe pour permettre l'instantiation si nécessaire
export { FicheCotation };