package br.com.ludus.checkin.security.dto;

import java.util.List;

import br.com.ludus.checkin.security.model.User;

public record ValidUserCreateDto(
                String username,
                List<String> roles) {

        public static ValidUserCreateDto toRecord(final User entity) {
                return new ValidUserCreateDto(
                                entity.getUsername(),
                                entity.getRoles());
        }
}
