package br.com.ludus.checkin.model;

import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participation", schema = "checkin")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participation {
    
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "confirmed")
    private boolean confirmed;

    @Column(name = "is_deleted")
    private boolean deleted;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lesson", foreignKey = @ForeignKey(name = "fk_lesson_participation"))
    private Lesson lesson;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student", foreignKey = @ForeignKey(name = "alter table checkin.participation add constraint fk_student_participation foreign key (student) references checkin.student;\r\n" + //
                ""))
    private Student student;



}
