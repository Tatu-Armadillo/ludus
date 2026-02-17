package br.com.ludus.checkin.security.config;

import java.io.IOException;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import br.com.ludus.checkin.security.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final String secret;
    private final UserService userService;

    @Autowired
    public SecurityFilter(
            @Value("${spring.security.token.secret}") final String secret,
            final UserService userService) {
        this.secret = secret;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        final var token = this.recoverToken(request);
        if (Objects.nonNull(token)) {

            final var algorithm = Algorithm.HMAC256(secret);
            final var verifier = JWT.require(algorithm).build();
            final var decodedJWT = verifier.verify(token);

            final var authorities = decodedJWT.getClaim("roles").asList(String.class)
                    .stream().map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
            final var user = this.userService.loadUserByUsername(decodedJWT.getClaim("sub").asString());
            final var authentication = new UsernamePasswordAuthenticationToken(user, token, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        final var authHeader = request.getHeader("Authorization");
        return authHeader == null
                ? null
                : authHeader.replace("Bearer ", "");
    }

}