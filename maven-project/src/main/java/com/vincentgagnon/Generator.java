package com.vincentgagnon;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.HashSet;
import java.util.List;

public class Generator {

    public Groupe[][] generate(Cours[] repertoireCours, int nbCoursOptionnels) {
        Cours[][] classCombinations = generateClassCombinations(repertoireCours, nbCoursOptionnels);
        Groupe[][] horaires = generateHoraires(classCombinations);
        return filterHoraires(horaires);
    }

    private Cours[][] generateClassCombinations(Cours[] repertoireCours, int nbCoursOptionnels) {
        LinkedList<Cours[]> classCombinations = new LinkedList<>();

        ArrayList<Cours> obligatoryClasses = new ArrayList<>();
        ArrayList<Cours> optionnalClasses = new ArrayList<>();
        for (Cours cours: repertoireCours) {
            if (cours.estObligatoire) obligatoryClasses.add(cours);
            else optionnalClasses.add(cours);
        }

        for (int i=0; i<Math.pow(2, optionnalClasses.size()); i++) {
            LinkedList<Cours> additionnalClasses = new LinkedList<>();
            int j = i;
            int classIndex = 0;
            while (j > 0) {
                if ((j % 2) == 1) additionnalClasses.add(optionnalClasses.get(classIndex));
                j = j >> 1;
                classIndex ++;
            }

            if (additionnalClasses.size() == nbCoursOptionnels) {
                List<Cours> classCombination = new ArrayList<>(obligatoryClasses);
                classCombination.addAll(additionnalClasses);
                classCombinations.add(classCombination.toArray(new Cours[0]));
            }
        }
        
        return classCombinations.toArray(new Cours[0][0]);
    }

    private Groupe[][] generateHoraires(Cours[][] classCombinations) {
        LinkedList<Groupe[]> horaires = new LinkedList<>();
        for (Cours[] classCombination: classCombinations) {
            ArrayList<Groupe[]> horaireForClass = convertHoraires(generateHoraire(classCombination, 0));
            horaires.addAll(horaireForClass);
        }

        return horaires.toArray(new Groupe[0][0]);
    }

    private ArrayList<LinkedList<Groupe>> generateHoraire(Cours[] classCombination, int index) {
        if (classCombination.length == 0) return new ArrayList<>();
        if (index == classCombination.length - 1) {
            ArrayList<LinkedList<Groupe>> groupesChoicesList = new ArrayList<>();
            for (Groupe groupe: classCombination[index].groupes) {
                LinkedList<Groupe> groupesChoices = new LinkedList<>();
                groupesChoices.add(groupe);
                groupesChoicesList.add(groupesChoices);
            }

            return groupesChoicesList;
        }

        ArrayList<LinkedList<Groupe>> groupesChoicesList = new ArrayList<>();
        for (Groupe groupe: classCombination[index].groupes) {
            for (LinkedList<Groupe> groupesChoices : generateHoraire(classCombination, index+1)) {
                groupesChoices.addFirst(groupe);
                groupesChoicesList.add(groupesChoices);
            }
        }

        return groupesChoicesList;
    }

    public ArrayList<Groupe[]> convertHoraires(ArrayList<LinkedList<Groupe>> dynamicSchedules) {
        ArrayList<Groupe[]> fixedSchedules = new ArrayList<>(dynamicSchedules.size());

        for (LinkedList<Groupe> path : dynamicSchedules) {
            Groupe[] scheduleArray = path.toArray(new Groupe[0]);
            fixedSchedules.add(scheduleArray);
        }

        return fixedSchedules;
    }

    private Groupe[][] filterHoraires(Groupe[][] horaires) {
        LinkedList<Groupe[]> horairesValides = new LinkedList<>();
        for (Groupe[] horaire: horaires) {
            HashSet<Periode> periodes = new HashSet<>();
            boolean horaireValide = true;
            
            horaireLoop: for (Groupe groupe: horaire) {
                for (Periode periode : groupe.periodes) {
                    if (periodes.contains(periode)) {
                        horaireValide = false;
                        break horaireLoop;
                    }
                    else {
                        periodes.add(periode);
                    }
                }
            }
            
            if (horaireValide) horairesValides.add(horaire);
        }
        
        return horairesValides.toArray(new Groupe[0][0]);
    }
}
