package com.prescription.service;

import com.google.cloud.storage.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class FirebaseStorageService {

    private final Storage storage;

    @Value("${firebase.storage.bucket:}")
    private String bucketName;

    @Value("${app.profile.image.max-size}")
    private long maxFileSize;

    @Value("${app.profile.image.allowed-types}")
    private List<String> allowedTypes;

    private static final String PROFILE_PICTURES_FOLDER = "profile-pictures";

    // ✅ Optional injection (CRITICAL FIX)
    public FirebaseStorageService(@Autowired(required = false) Storage storage) {
        this.storage = storage;
    }

    // ✅ Check if Firebase is enabled
    public boolean isEnabled() {
        return storage != null && bucketName != null && !bucketName.isBlank();
    }

    // ===================== PUBLIC METHODS =====================

    public String uploadProfileImage(MultipartFile file, Long userId) throws IOException {
        ensureEnabled();
        validateFile(file);

        String fileName = generateFileName(file.getOriginalFilename());
        String objectName = PROFILE_PICTURES_FOLDER + "/" + userId + "/" + fileName;

        deleteExistingProfileImage(userId);

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .setCacheControl("public, max-age=31536000")
                .build();

        storage.create(blobInfo, file.getBytes());

        log.info("Profile image uploaded for user {}", userId);
        return generatePublicUrl(objectName);
    }

    public void deleteProfileImage(Long userId, String imageUrl) {
        ensureEnabled();

        String objectName = extractObjectNameFromUrl(imageUrl);
        if (objectName == null) return;

        storage.delete(BlobId.of(bucketName, objectName));
        log.info("Profile image deleted for user {}", userId);
    }

    public String generateSignedUrl(String objectName, long duration, TimeUnit unit) {
        ensureEnabled();

        BlobInfo blobInfo = BlobInfo.newBuilder(
                BlobId.of(bucketName, objectName)
        ).build();

        return storage.signUrl(blobInfo, duration, unit).toString();
    }

    // ===================== PRIVATE HELPERS =====================

    private void ensureEnabled() {
        if (!isEnabled()) {
            throw new IllegalStateException("Firebase Storage is disabled");
        }
    }

    private void deleteExistingProfileImage(Long userId) {
        String prefix = PROFILE_PICTURES_FOLDER + "/" + userId + "/";
        storage.list(bucketName, Storage.BlobListOption.prefix(prefix))
                .iterateAll()
                .forEach(blob -> storage.delete(blob.getBlobId()));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    "File size exceeds limit: " + maxFileSize
            );
        }

        if (!allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Invalid file type: " + file.getContentType()
            );
        }
    }

    private String generateFileName(String original) {
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : "";
        return "profile_" + UUID.randomUUID() + ext;
    }

    private String generatePublicUrl(String objectName) {
        return String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucketName,
                objectName.replace("/", "%2F")
        );
    }

    private String extractObjectNameFromUrl(String imageUrl) {
        try {
            if (imageUrl != null && imageUrl.contains("/o/")) {
                return imageUrl
                        .split("/o/")[1]
                        .split("\\?")[0]
                        .replace("%2F", "/");
            }
        } catch (Exception e) {
            log.warn("Failed to extract object name", e);
        }
        return null;
    }
}
