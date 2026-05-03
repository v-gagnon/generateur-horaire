package com.vincentgagnon.horaires;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

class GeneratorTest {

    private Generator generator;

    @BeforeEach
    void setUp() {
        generator = new Generator();
    }

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS) // Coupe l'exécution si boucle infinie
    void testGereSeulementCoursObligatoires() {
        // Préparation (Arrange)
        Periode p1 = new Periode();
        p1.jour = "Lundi"; p1.hDebut = 8; p1.mDebut = 30; p1.hFin = 11; p1.mFin = 30;

        Groupe g1 = new Groupe("A", new Periode[]{p1});
        Cours mat1000 = new Cours("MAT1000", "Analyse 1", true, new Groupe[]{g1});

        Cours[] repertoire = new Cours[]{mat1000};

        // Exécution (Act)
        Groupe[][] horaires = generator.generate(repertoire, 0);

        // Vérification (Assert)
        assertNotNull(horaires);
        assertEquals(1, horaires.length, "Il devrait y avoir exactement 1 horaire possible.");
        assertEquals(1, horaires[0].length, "L'horaire devrait contenir 1 seul groupe.");
        assertEquals("A", horaires[0][0].nom, "Le groupe devrait être le groupe A.");
    }

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    void testCombinaisonsCoursOptionnels() {
        // Préparation (Arrange)
        Periode p1 = new Periode(); p1.jour = "Lundi";
        Groupe g1 = new Groupe("A", new Periode[]{p1});
        Cours mat1000 = new Cours("MAT1000", "Analyse 1", true, new Groupe[]{g1});

        Periode p2 = new Periode(); p2.jour = "Mardi";
        Groupe g2 = new Groupe("B", new Periode[]{p2});
        Cours ift1015 = new Cours("IFT1015", "Programmation 1", false, new Groupe[]{g2});

        Periode p3 = new Periode(); p3.jour = "Mercredi";
        Groupe g3 = new Groupe("C", new Periode[]{p3});
        Cours mat2130 = new Cours("MAT2130", "Variable Complexe", false, new Groupe[]{g3});

        Cours[] repertoire = new Cours[]{mat1000, ift1015, mat2130};

        // Exécution (Act) : On demande 1 cours optionnel parmi les 2 disponibles
        Groupe[][] horaires = generator.generate(repertoire, 1);

        // Vérification (Assert)
        // Les combinaisons valides sont : (MAT1000 + IFT1015) OU (MAT1000 + MAT2130)
        assertEquals(2, horaires.length, "Il devrait y avoir 2 horaires possibles.");
        assertEquals(2, horaires[0].length, "Chaque horaire doit contenir 2 cours (1 obl + 1 opt).");
    }

    @Test
    @Timeout(value = 2, unit = TimeUnit.SECONDS)
    void testFiltrageConflitsExacts() {
        // Préparation : Deux cours avec EXACTEMENT la même période
        Periode p1 = new Periode();
        p1.jour = "Lundi"; p1.hDebut = 10; p1.mDebut = 0; p1.hFin = 12; p1.mFin = 0;

        // Comme ta logique actuelle utilise HashSet, on doit utiliser la même instance
        // ou s'assurer que equals() et hashCode() fonctionnent parfaitement.
        Groupe g1 = new Groupe("A", new Periode[]{p1});
        Cours c1 = new Cours("C1", "Cours 1", true, new Groupe[]{g1});

        Groupe g2 = new Groupe("B", new Periode[]{p1}); // Conflit intentionnel
        Cours c2 = new Cours("C2", "Cours 2", true, new Groupe[]{g2});

        Cours[] repertoire = new Cours[]{c1, c2};

        // Exécution
        Groupe[][] horaires = generator.generate(repertoire, 0);

        // Vérification : L'horaire combinant C1 et C2 doit être rejeté
        assertEquals(0, horaires.length, "L'horaire en conflit doit être filtré, retournant 0 résultat.");
    }
}