package com.vincentgagnon;

import com.fasterxml.jackson.core.JsonProcessingException;
import javafx.application.Platform;
import javafx.scene.web.WebEngine;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataBridge {

    private final WebEngine webEngine;
    private final ObjectMapper mapper;
    private final Generator generator;

    public DataBridge(WebEngine webEngine) {
        this.webEngine = webEngine;
        this.mapper = new ObjectMapper();
        this.generator = new Generator();
    }

    public void transferBuffer(String jsonBuffer, int nbCoursOptionnels) {
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
            e.printStackTrace();
        }
    }

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
}