package br.com.ludus.checkin.security.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import br.com.ludus.checkin.security.model.User;


@Service
public class TokenService {

    private final String secret;

    @Autowired
    public TokenService(@Value("${spring.security.token.secret}") final String secret) {
        this.secret = secret;
    }

    public String createToken(final User user) {
        try {
            final var algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("checkin")
                    .withClaim("roles", user.getRoles())
                    .withSubject(user.getUsername())
                    .withExpiresAt(this.expirationDate())
                    .sign(algorithm);
        } catch (Exception exception) {
            throw new RuntimeException("Error to generate Token JWT");
        }
    }

    public String getSubject(final String tokenJWT) {
        try {
            final var algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("checkin")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Token JWT Invalid or expired");
        }
    }

    private Instant expirationDate() {
        return Instant.now().plusSeconds(21600);
    }

}
