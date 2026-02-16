package br.com.ludus.checkin.security.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenDto(
        @NotBlank String userName,
        @NotBlank String token) {

}
