package br.com.ludus.checkin.security.service;

import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.ludus.checkin.security.dto.AccountCredentialsDto;
import br.com.ludus.checkin.security.dto.CreateCredentialsDto;
import br.com.ludus.checkin.security.dto.TokenDto;
import br.com.ludus.checkin.security.model.User;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final UserService userService;

    public TokenDto signin(final AccountCredentialsDto data) {

        this.validatedUsernameAndPassword(data.username(), data.password());

        final var user = this.userService.findUserByUsername(data.username());

        final var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        data.username(),
                        data.password(),
                        user.getAuthorities()));

        final String token = tokenService.createToken((User) authentication.getPrincipal());
        return new TokenDto(data.username(), token);
    }

    public User create(String password, final String username, final String typeUser) {
        final var encodedPassword = passwordEncoder.encode(password);
        return this.userService.create(new CreateCredentialsDto(username, encodedPassword, typeUser));
    }

    private void validatedUsernameAndPassword(String username, String password) {
        if (username == null || username.isBlank()) {
            throw new BadCredentialsException("Usuário não informado");
        }
        if (password == null || password.isBlank()) {
            throw new BadCredentialsException("Senha não informada");
        }
    }

}
