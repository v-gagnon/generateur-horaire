package com.vincentgagnon;

import java.net.URL;
import java.util.Optional;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.TextInputDialog;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.concurrent.Worker;
import netscape.javascript.JSObject;

public class Main extends Application {
    private final WebView webView = new WebView();
    private final WebEngine webEngine = webView.getEngine();
    private final DataBridge dataBridge = new DataBridge(webEngine);

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage) {
        connectHTML();
        conifgureDataBridge();
        conifgureMessages();

        Scene scene = new Scene(webView, 1024, 768);
        stage.setTitle("Générateur d'horaires");
        stage.setScene(scene);
        stage.show();
    }

    public void connectHTML() {
        URL url = getClass().getResource("/web/index.html");

        if (url != null) {
            webEngine.load(url.toExternalForm());
        } else {
            System.err.println("CRITICAL: Could not find /web/index.html in resources.");
        }
    }

    public void conifgureDataBridge() {
        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaApp", this.dataBridge);
            }
        });
    }

    public void conifgureMessages() {
        webEngine.setOnAlert(event -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Information - Générateur d'horaires");
            alert.setHeaderText(null);
            alert.setContentText(event.getData());
            alert.showAndWait();
        });

        webEngine.setConfirmHandler(message -> {
            Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
            confirmAlert.setTitle("Confirmation requise");
            confirmAlert.setHeaderText(null);
            confirmAlert.setContentText(message);

            return confirmAlert.showAndWait()
                    .filter(response -> response == ButtonType.OK)
                    .isPresent();
        });

        webEngine.setPromptHandler(promptData -> {
            TextInputDialog dialog = new TextInputDialog(promptData.getDefaultValue());
            dialog.setTitle("Entrée requise");
            dialog.setHeaderText(null);
            dialog.setContentText(promptData.getMessage());

            Optional<String> result = dialog.showAndWait();
            return result.orElse(null);
        });
    }
}