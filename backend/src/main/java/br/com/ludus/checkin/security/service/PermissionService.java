package br.com.ludus.checkin.security.service;

import org.springframework.stereotype.Service;

import br.com.ludus.checkin.security.model.Permission;
import br.com.ludus.checkin.security.repository.PermissionRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public Permission getPermission(final String description) {
        return this.permissionRepository.getPermissionByDescription(description)
                .orElseThrow(() -> new RuntimeException("Permission: " + description + " not found"));
    }

}
