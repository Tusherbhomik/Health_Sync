package com.prescription.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.storage.bucket:}")
    private String storageBucket;

    @Value("${firebase.service.account.key.json:}")
    private String firebaseKeyJson;

    private GoogleCredentials credentials;

    @PostConstruct
    public void initialize() {
        // ✅ Firebase disabled if not configured
        if (firebaseKeyJson == null || firebaseKeyJson.isBlank()) {
            System.out.println("⚠️ Firebase disabled (no credentials provided)");
            return;
        }

        try {
            ByteArrayInputStream serviceAccountStream =
                    new ByteArrayInputStream(firebaseKeyJson.getBytes(StandardCharsets.UTF_8));

            this.credentials = GoogleCredentials.fromStream(serviceAccountStream);

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setStorageBucket(storageBucket)
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

    @Bean
    public Storage storage() {
        // ✅ Return null if Firebase is disabled
        if (credentials == null) {
            return null;
        }

        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }

    @Bean
    public StorageClient storageClient() {
        // ✅ Prevent crash when Firebase is disabled
        if (FirebaseApp.getApps().isEmpty()) {
            return null;
        }
        return StorageClient.getInstance();
    }
}
