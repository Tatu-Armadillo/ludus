package br.com.ludus.checkin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dancing_class_student", schema = "checkin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DancingClassEnrollment {

    @EmbeddedId
    private EnrollmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dancingClassId")
    @JoinColumn(name = "id_dancing_class", foreignKey = @ForeignKey(name = "fk_dancing_class_student_dancing"))
    private DancingClass dancingClass;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("studentId")
    @JoinColumn(name = "id_student", foreignKey = @ForeignKey(name = "fk_dancing_class_student_student"))
    private Student student;

    @Column(name = "role", length = 20, nullable = false)
    private String role = "CONDUCTED";
}
