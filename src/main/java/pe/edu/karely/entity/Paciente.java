package pe.edu.karely.entity;
/** Proyección del esquema Oracle existente; no crea tablas ni aplica DDL. */
public record Paciente(long idPaciente,String tipoDocumento,String numeroDocumento,
 String nombres,String apellidos,String telefono,String correo,String estado) {}
