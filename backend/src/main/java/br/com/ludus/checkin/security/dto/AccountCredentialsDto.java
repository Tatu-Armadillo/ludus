package br.com.ludus.checkin.security.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record AccountCredentialsDto(
        @NotNull @NotBlank @NotEmpty String username,
        @NotNull @NotBlank @NotEmpty String password) {

}
