package br.com.ludus.checkin.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import br.com.ludus.checkin.security.model.User;

public class LoggedUser {

    public static User get() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getPrincipal)
                .filter(User.class::isInstance)
                .map(User.class::cast)
                .orElseThrow(() -> new RuntimeException("User not authenticated or invalid Authentication type."));
    }
}
