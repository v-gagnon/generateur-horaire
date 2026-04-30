package com.vincentgagnon;

import com.fasterxml.jackson.core.JsonProcessingException;
import javafx.application.Platform;
import javafx.scene.web.WebEngine;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DataBridge {

    private final WebEngine webEngine;
    private final ObjectMapper mapper;
    private final Generator generator;

    public DataBridge(WebEngine webEngine) {
        this.webEngine = webEngine;
        this.mapper = new ObjectMapper();
        this.generator = new Generator();
    }

    public void sendSchedules(String jsonBuffer, int nbCoursOptionnels) {
        try {
            Cours[] repertoireCours = mapper.readValue(jsonBuffer, Cours[].class);
            for (Cours coursActuel : repertoireCours) {
                coursActuel.addBidirectionalGroupRelations();
            }

            Groupe[][] horaires = generator.generate(repertoireCours, nbCoursOptionnels);
            String escapedJson = formatEscapedJson(horaires);

            Platform.runLater(() -> {
                webEngine.executeScript("displaySchedules(\"" + escapedJson + "\")");
            });

        } catch (Exception e) {
            System.err.println("Erreur critique lors de la lecture du JSON : " + e.getMessage());
        }
    }

    // Helper de sendSchedules
    public String formatEscapedJson(Groupe[][] horaires) throws JsonProcessingException {
        if (horaires.length == 0) return "[]";

        List<List<Map<String, Object>>> formattedSchedules = new ArrayList<>();
        for (Groupe[] horaire : horaires) {
            List<Map<String, Object>> formattedHoraire = new ArrayList<>();
            for (Groupe groupe : horaire) {
                Map<String, Object> groupData = new HashMap<>();
                groupData.put("sigle", groupe.cours.sigle);
                groupData.put("nom", groupe.cours.nom);
                groupData.put("groupe", groupe.nom);
                groupData.put("periodes", groupe.periodes);
                formattedHoraire.add(groupData);
            }
            formattedSchedules.add(formattedHoraire);
        }

        String resultJson = mapper.writeValueAsString(formattedSchedules);
        return resultJson.replace("\"", "\\\"").replace("'", "\\'");
    }

    // Helper method to get (and create if needed) the data directory
    private Path getDataDirectory() {
        String userHome = System.getProperty("user.home");
        Path dirPath = Paths.get(userHome, ".course_scheduler", "data");

        if (!Files.exists(dirPath)) {
            try {
                Files.createDirectories(dirPath);
            } catch (Exception e) {
                System.err.println("Erreur lors de la création du dossier de données : " + e.getMessage());
            }
        }
        return dirPath;
    }

    // Sauvegarde le JSON envoyé par le JS dans un fichier
    public void saveSession(String jsonData, String fileName) {
        try {
            Path dirPath = getDataDirectory();
            Path filePath = dirPath.resolve(fileName + ".json");
            Files.write(filePath, jsonData.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            System.err.println("Erreur lors de la sauvegarde : " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Retourne un JSON contenant la liste des noms de fichiers disponibles
    public String getAvailableSessions() {
        try {
            Path dirPath = getDataDirectory();

            try (Stream<Path> stream = Files.list(dirPath)) {
                List<String> files = stream
                        .filter(file -> !Files.isDirectory(file))
                        .map(Path::getFileName)
                        .map(Path::toString)
                        .filter(name -> name.endsWith(".json"))
                        .map(name -> name.replace(".json", ""))
                        .collect(Collectors.toList());
                return mapper.writeValueAsString(files);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la lecture du dossier : " + e.getMessage());
            e.printStackTrace();
            return "[]";
        }
    }

    // Lit le fichier demandé et retourne son contenu (la chaîne JSON)
    public String loadSession(String fileName) {
        try {
            Path filePath = getDataDirectory().resolve(fileName + ".json");
            if (Files.exists(filePath)) {
                return new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du chargement : " + e.getMessage());
        }
        return "[]";
    }

    // Supprime un fichier de session spécifique
    public void deleteSession(String fileName) {
        try {
            Path filePath = getDataDirectory().resolve(fileName + ".json");
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression : " + e.getMessage());
        }
    }

    // Supprime le dossier .course_scheduler complet
    public void deleteAllSessions() {
        try {
            String userHome = System.getProperty("user.home");
            Path baseDir = Paths.get(userHome, ".course_scheduler");

            if (Files.exists(baseDir)) {
                try (Stream<Path> walk = Files.walk(baseDir)) {
                    walk.sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression du dossier complet : " + e.getMessage());
        }
    }
}