package br.com.ludus.checkin.security.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.ludus.checkin.security.model.Permission;


@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    @Query("SELECT permission FROM Permission permission WHERE permission.description = :description ")
    Optional<Permission> getPermissionByDescription(@Param("description") String description);
}
