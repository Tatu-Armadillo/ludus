package br.com.ludus.checkin.security.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.ludus.checkin.security.dto.AccountCredentialsDto;
import br.com.ludus.checkin.security.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;

@Tag(name = "Authentication", description = "Endpoints for Managing token")
@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Authenticates a user and returns a token", tags = { "Authentication" })
    @PostMapping("/login")
    public ResponseEntity<Void> signin(@RequestBody @NotNull final AccountCredentialsDto data) {
        final var login = this.authService.signin(data);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + login.token())
                .body(null);
    }


}
