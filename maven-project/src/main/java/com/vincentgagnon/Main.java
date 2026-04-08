package com.vincentgagnon;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import java.net.URL;

public class Main extends Application {

    @Override
    public void start(Stage stage) {
        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();

        URL url = getClass().getResource("/web/index.html");

        if (url != null) {
            webEngine.load(url.toExternalForm());
        } else {
            System.err.println("CRITICAL: Could not find /web/index.html in resources.");
        }

        Scene scene = new Scene(webView, 1024, 768);
        stage.setTitle("Générateur d'horaires");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}