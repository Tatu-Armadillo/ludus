package br.com.ludus.checkin.model;

import java.time.*;
import java.util.List;

import org.hibernate.annotations.SQLRestriction;

import br.com.ludus.checkin.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dancing_class", schema = "checkin")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DancingClass {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private LevelDancingEnum level;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusDancingEnum status;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_week")
    private DayOfWeek dayWeek;

    @Column(name = "start_schedule")
    private LocalTime startSchedule;

    @Column(name = "end_schedule")
    private LocalTime endSchedule;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_deleted")
    private boolean deleted;

    @OneToMany(mappedBy = "dancingClass")
    private List<Lesson> lessons;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "beat", foreignKey = @ForeignKey(name = "fk_beat_dancing_class"))
    private Beat beat;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(schema = "checkin", name = "dancing_class_student", 
        joinColumns = @JoinColumn(name = "id_dancing_class", foreignKey = @ForeignKey(name = "fk_dancing_class_student_dancing")), 
        inverseJoinColumns = @JoinColumn(name = "id_student", foreignKey = @ForeignKey(name = "fk_dancing_class_student_student")))
    private List<Student> students;

}
