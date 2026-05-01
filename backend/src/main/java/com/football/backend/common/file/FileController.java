package com.football.backend.common.file;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final Path fileStorageLocation;

    public FileController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // Проверка: файл не пустой
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        // Генерируем уникальное имя файла
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        // Получаем расширение файла (например .jpg)
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFileName.substring(dotIndex);
        }
        
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            // Сохраняем файл в папку uploads
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Возвращаем публичный URL (относительный путь от корня)
            // Важно: здесь мы отдаем путь, по которому WebConfig будет искать файл
            // Пример: /uploads/abc-123.jpg
            String fileDownloadUri = "/uploads/" + fileName;

            return ResponseEntity.ok(new FileUploadResponse(fileDownloadUri));
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body("Could not store file " + fileName + ". Please try again!");
        }
    }

    // DTO для ответа
    static class FileUploadResponse {
        private String url;

        public FileUploadResponse(String url) {
            this.url = url;
        }

        public String getUrl() {
            return url;
        }
    }
}
