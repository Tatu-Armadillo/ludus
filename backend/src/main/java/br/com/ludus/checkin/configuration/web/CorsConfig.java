package br.com.ludus.checkin.configuration.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(final CorsRegistry registry) {
        // final var httpValid = "http://localhost:4200,http://localhost:9090/,http://localhost:3000/,http://localhost:5173/";
        // final String[] allowedOrigins = httpValid.split(",");
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowedOrigins("*")
                .allowedHeaders("*")
                .exposedHeaders("*");
    }
}