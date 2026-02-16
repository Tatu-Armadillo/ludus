package br.com.ludus.checkin.model;

import java.time.*;

import org.hibernate.annotations.SQLRestriction;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesson", schema = "checkin")
@SQLRestriction("is_deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day")
    private LocalDate day;

    @Column(name = "start_schedule")
    private LocalTime startSchedule;

    @Column(name = "end_schedule")
    private LocalTime endSchedule;

    @Column(name = "is_deleted")
    private boolean deleted;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dancing_class", foreignKey = @ForeignKey(name = "fk_dancing_class_lesson"))
    @JsonBackReference
    private DancingClass dancingClass;

}
