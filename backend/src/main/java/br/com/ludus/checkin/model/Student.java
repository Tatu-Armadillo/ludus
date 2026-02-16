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
    
    @Column(name = "is_active")
    private boolean active;
    
    @Column(name = "is_deleted")
    private boolean deleted;
    
    @Column(name = "date_birth")
    private LocalDate birth;
    
    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(schema = "checkin", name = "dancing_class_student", 
        joinColumns = @JoinColumn(name = "id_student", foreignKey = @ForeignKey(name = "fk_dancing_class_student_student")),
        inverseJoinColumns = @JoinColumn(name = "id_dancing_class", foreignKey = @ForeignKey(name = "fk_dancing_class_student_dancing"))
    )
    private List<DancingClass> dancingClasses;
    
}
