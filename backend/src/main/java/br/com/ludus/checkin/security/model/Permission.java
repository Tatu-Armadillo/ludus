package br.com.ludus.checkin.security.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;

@Entity
@Table(name = "permission", schema = "checkin")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Permission implements GrantedAuthority {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPermission;

    @Column(name = "description")
    private String description;

    public Permission(String description) {
        this.description = description;
    }

    @Override
    public String getAuthority() {
        return this.description;
    }

}
