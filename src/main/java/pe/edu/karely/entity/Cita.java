package pe.edu.karely.entity;
import java.math.BigDecimal;
import java.time.LocalDate;
/** Proyección de la cita; los cambios se realizan con PL/SQL. */
public record Cita(long idCita,long idPaciente,long idDoctor,LocalDate fechaCita,
 long idFranja,long idConsultorio,BigDecimal montoTotal,String estado) {}
