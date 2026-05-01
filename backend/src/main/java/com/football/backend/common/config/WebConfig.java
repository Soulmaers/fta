package com.football.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
         // Получаем абсолютный путь к папке uploads
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Если пришел запрос на /uploads/**, смотрим в папку uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/" + uploadPath + "/");
    }

    @Override
    public void addViewControllers(org.springframework.web.servlet.config.annotation.ViewControllerRegistry registry) {
        // Явное перенаправление всех известных React-маршрутов на index.html
        registry.addViewController("/auth").setViewName("forward:/index.html");
        registry.addViewController("/auth/**").setViewName("forward:/index.html");
        registry.addViewController("/config").setViewName("forward:/index.html");
        registry.addViewController("/config/**").setViewName("forward:/index.html");
        registry.addViewController("/app").setViewName("forward:/index.html");
        registry.addViewController("/app/**").setViewName("forward:/index.html");
        registry.addViewController("/profile").setViewName("forward:/index.html");
    }
}
