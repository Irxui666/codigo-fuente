package pe.edu.karely.entity;
/** Proyección del esquema Oracle existente. */
public record Doctor(long idDoctor,Long idUsuario,String nombres,String apellidos,
 String estadoDocumentacion,String estado) {}
