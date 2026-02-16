package br.com.ludus.checkin.security.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.ludus.checkin.security.dto.CreateCredentialsDto;
import br.com.ludus.checkin.security.model.User;
import br.com.ludus.checkin.security.repository.UserRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username " + username + " not found!"));
    }

    public User findUserByUsername(final String username) throws UsernameNotFoundException {
        return this.userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username " + username + " not found!"));
    }

    public User create(final CreateCredentialsDto data) {
        final var permission = this.permissionService.getPermission(data.typeUser());
        final var user = new User(
                data.username(),
                data.password(),
                true,
                true,
                true,
                true);
        user.setPermissions(List.of(permission));
        return this.userRepository.saveAndFlush(user);
    }

    public User setNewPassword(String username, String newPassword) {
        final var user = this.findUserByUsername(username);
        user.setPassword(newPassword);
        return this.userRepository.saveAndFlush(user);
    }

}
