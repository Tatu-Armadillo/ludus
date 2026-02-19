package br.com.ludus.checkin.model;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.SQLRestriction;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student", schema = "checkin")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;
    
    @Column(name = "contact")
    private String contact;
    
    @Column(name = "cpf")
    private String cpf;

    @Column(name = "email")
    private String email;

    @Column(name = "gender")
    private String gender;
    
    @Column(name = "is_active")
    private boolean active;
    
    @Column(name = "is_deleted")
    private boolean deleted;
    
    @Column(name = "date_birth")
    private LocalDate birth;
    
    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @JsonIgnore
    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private List<DancingClassEnrollment> enrollments;

}
