package br.com.ludus.checkin.dto.dancing;

import java.util.List;

public record RegisterStudentsDto(
        Long dancingClassId,
        List<Long> studentIds) {

}
