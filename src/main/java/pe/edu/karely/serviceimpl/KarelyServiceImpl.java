package pe.edu.karely.serviceimpl;
import pe.edu.karely.service.KarelyService;
import pe.edu.karely.repository.OracleRepository;
import pe.edu.karely.dto.ApiInput;
import java.sql.Types;
import java.util.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KarelyServiceImpl implements KarelyService {
 private final OracleRepository repo;private final JdbcTemplate jdbc;
 public KarelyServiceImpl(OracleRepository repo,JdbcTemplate jdbc){this.repo=repo;this.jdbc=jdbc;}
 private String role(long actor){
  Map<String,Object> r=repo.one("SELECT R.NOMBRE AS ROL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.ID_USUARIO=? AND U.ESTADO='ACTIVO' AND R.ESTADO='ACTIVO'",actor);
  if(r==null)throw new AccessDeniedException("Usuario inactivo");return r.get("ROL").toString();
 }
 private void permit(long actor,String...roles){if(!Arrays.asList(roles).contains(role(actor)))throw new AccessDeniedException("Rol sin permiso para esta operación");}
 private void audit(long actor,String table,Object id,String action,String detail){
  repo.update("INSERT INTO AUDITORIA (ID_USUARIO,TABLA_AFECTADA,ID_REGISTRO,ACCION,DETALLE,ORIGEN) VALUES (?,?,?,?,?,'USUARIO')",actor,table,id,action,detail);
 }
 private Map<String,Object> result(String type,Object id){Map<String,Object> r=new LinkedHashMap<>();r.put("ok",true);r.put("operacion",type);if(id!=null)r.put("id",id);return r;}
 private Map<String,Object> proc(String procedure,long actor,Object...args){List<Object> result=repo.call(procedure,actor,args);return result(procedure,result.isEmpty()?null:result.getFirst());}
 @Override @Transactional(readOnly=true) public List<Map<String,Object>> listing(String resource,long actor){
  String rol=role(actor);
  return switch(resource){
   case "pacientes" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA");yield repo.list("SELECT ID_PACIENTE,TIPO_DOCUMENTO,NUMERO_DOCUMENTO,NOMBRES,APELLIDOS,FECHA_NACIMIENTO,TELEFONO,CORREO,DIRECCION,ESTADO FROM PACIENTE ORDER BY ID_PACIENTE DESC FETCH FIRST 200 ROWS ONLY");}
   case "doctores" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA","DOCTOR","TESORERA");
    yield rol.equals("DOCTOR") ? repo.list("SELECT ID_DOCTOR,ID_USUARIO,NOMBRES,APELLIDOS,ESTADO_DOCUMENTACION,ESTADO FROM DOCTOR WHERE ID_USUARIO=?",actor)
     : rol.equals("TESORERA") ? repo.list("SELECT ID_DOCTOR,NOMBRES,APELLIDOS,ESTADO FROM DOCTOR ORDER BY NOMBRES,APELLIDOS")
     : repo.list("SELECT D.ID_DOCTOR,D.ID_USUARIO,D.TIPO_DOCUMENTO,D.NUMERO_DOCUMENTO,D.NOMBRES,D.APELLIDOS,D.TELEFONO,D.CORREO,D.ESTADO_DOCUMENTACION,D.ESTADO FROM DOCTOR D ORDER BY D.ID_DOCTOR DESC FETCH FIRST 200 ROWS ONLY");}
   case "especialidades" -> repo.list("SELECT ID_ESPECIALIDAD,NOMBRE,PRECIO_CONSULTA,ESTADO FROM ESPECIALIDAD WHERE ESTADO='ACTIVO' ORDER BY NOMBRE");
   case "consultorios" -> repo.list("SELECT ID_CONSULTORIO,NOMBRE,UBICACION,ESTADO FROM CONSULTORIO WHERE ESTADO='ACTIVO' ORDER BY NOMBRE");
   case "franjas" -> repo.list("SELECT ID_FRANJA,HORA_INICIO,HORA_FIN,ESTADO FROM FRANJA_HORARIA WHERE ESTADO='ACTIVO' ORDER BY HORA_INICIO");
   case "disponibilidades" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA","DOCTOR");
    yield rol.equals("DOCTOR") ? repo.list("SELECT DD.ID_DISPONIBILIDAD,DD.ID_DOCTOR,DD.FECHA_TURNO,DD.ID_FRANJA,F.HORA_INICIO,F.HORA_FIN,DD.ESTADO FROM DISPONIBILIDAD_DOCTOR DD JOIN DOCTOR D ON D.ID_DOCTOR=DD.ID_DOCTOR JOIN FRANJA_HORARIA F ON F.ID_FRANJA=DD.ID_FRANJA WHERE D.ID_USUARIO=? AND DD.FECHA_TURNO>=TRUNC(SYSDATE)-7 ORDER BY DD.FECHA_TURNO,F.HORA_INICIO FETCH FIRST 400 ROWS ONLY",actor)
    : repo.list("SELECT DD.ID_DISPONIBILIDAD,DD.ID_DOCTOR,D.NOMBRES||' '||D.APELLIDOS NOMBRE_DOCTOR,DD.FECHA_TURNO,DD.ID_FRANJA,F.HORA_INICIO,F.HORA_FIN,DD.ESTADO FROM DISPONIBILIDAD_DOCTOR DD JOIN DOCTOR D ON D.ID_DOCTOR=DD.ID_DOCTOR JOIN FRANJA_HORARIA F ON F.ID_FRANJA=DD.ID_FRANJA WHERE DD.FECHA_TURNO>=TRUNC(SYSDATE)-7 ORDER BY DD.FECHA_TURNO,F.HORA_INICIO FETCH FIRST 400 ROWS ONLY");}
   case "citas" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA","CAJERA","DOCTOR");yield rol.equals("DOCTOR") ? repo.list("SELECT A.* FROM VW_AGENDA_CITAS A JOIN DOCTOR D ON A.ID_DOCTOR=D.ID_DOCTOR WHERE D.ID_USUARIO=? ORDER BY A.FECHA_CITA DESC,A.HORA_INICIO FETCH FIRST 200 ROWS ONLY",actor):repo.list("SELECT * FROM VW_AGENDA_CITAS ORDER BY FECHA_CITA DESC, HORA_INICIO FETCH FIRST 400 ROWS ONLY");}
   case "reservas" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA","CAJERA");yield repo.list("SELECT ID_PRE_RESERVA,ID_PACIENTE,ID_DOCTOR,ID_CONSULTORIO,ID_FRANJA,FECHA_CITA,MONTO,FECHA_EXPIRACION,ESTADO FROM PRE_RESERVA_CITA WHERE ESTADO='BLOQUEADA' AND FECHA_EXPIRACION>SYSTIMESTAMP ORDER BY ID_PRE_RESERVA DESC FETCH FIRST 100 ROWS ONLY");}
   case "liquidaciones" -> {permit(actor,"TESORERA","ADMINISTRADORA");yield repo.list("SELECT * FROM VW_SALDOS_LIQUIDACIONES ORDER BY ID_LIQUIDACION DESC FETCH FIRST 200 ROWS ONLY");}
   case "ingresos" -> {permit(actor,"TESORERA","ADMINISTRADORA");yield repo.list("SELECT * FROM VW_INGRESOS_GESTORA ORDER BY FECHA_REGISTRO DESC FETCH FIRST 200 ROWS ONLY");}
   case "pagos-doctor" -> {permit(actor,"TESORERA","ADMINISTRADORA");yield repo.list("SELECT ID_PAGO_DOCTOR,ID_LIQUIDACION,MONTO,METODO_PAGO,NUMERO_OPERACION,NUMERO_BOLETA,FECHA_PAGO FROM PAGO_DOCTOR ORDER BY ID_PAGO_DOCTOR DESC FETCH FIRST 200 ROWS ONLY");}
   case "notificaciones" -> {permit(actor,"ADMINISTRADORA","TESORERA");yield repo.list("SELECT * FROM VW_CONTROL_NOTIFICACIONES FETCH FIRST 200 ROWS ONLY");}
   case "roles" -> {permit(actor,"ADMINISTRADORA");yield repo.list("SELECT ID_ROL,NOMBRE,ESTADO FROM ROL ORDER BY ID_ROL");}
   case "usuarios" -> {permit(actor,"ADMINISTRADORA");yield repo.list("SELECT U.ID_USUARIO,U.USERNAME,U.CORREO,U.ESTADO,U.ULTIMO_ACCESO,R.NOMBRE AS ROL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL ORDER BY U.ID_USUARIO DESC FETCH FIRST 200 ROWS ONLY");}
   case "parametros" -> {permit(actor,"ADMINISTRADORA");yield repo.list("SELECT ID_PARAMETRO,NOMBRE,VALOR,DESCRIPCION,ESTADO FROM PARAMETRO_SISTEMA ORDER BY NOMBRE");}
   case "auditoria" -> {permit(actor,"ADMINISTRADORA");yield repo.list("SELECT ID_AUDITORIA,ID_USUARIO,TABLA_AFECTADA,ID_REGISTRO,ACCION,DETALLE,FECHA_OPERACION,ORIGEN FROM AUDITORIA ORDER BY FECHA_OPERACION DESC FETCH FIRST 200 ROWS ONLY");}
   case "atenciones" -> {permit(actor,"DOCTOR","ADMINISTRADORA");yield rol.equals("DOCTOR") ? repo.list("SELECT A.ID_ATENCION,A.ID_CITA,A.ID_DOCTOR,A.FECHA_INICIO,A.FECHA_CIERRE,A.ESTADO FROM ATENCION_MEDICA A JOIN DOCTOR D ON D.ID_DOCTOR=A.ID_DOCTOR WHERE D.ID_USUARIO=? ORDER BY A.FECHA_INICIO DESC FETCH FIRST 150 ROWS ONLY",actor):repo.list("SELECT ID_ATENCION,ID_CITA,ID_DOCTOR,FECHA_INICIO,FECHA_CIERRE,ESTADO FROM ATENCION_MEDICA ORDER BY FECHA_INICIO DESC FETCH FIRST 150 ROWS ONLY");}
   case "resumen" -> {permit(actor,"ADMINISTRADORA","TESORERA","RECEPCIONISTA");yield repo.list("SELECT * FROM VW_RESUMEN_CITAS_DIARIAS ORDER BY FECHA_CITA DESC FETCH FIRST 100 ROWS ONLY");}
   default -> throw new IllegalArgumentException("Recurso desconocido: "+resource);
  };
 }
 @Override @Transactional public Map<String,Object> operate(String action,ApiInput i,long actor){
  return switch(action){
   case "paciente-crear" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA");Long id=repo.insertReturning("begin insert into PACIENTE(TIPO_DOCUMENTO,NUMERO_DOCUMENTO,NOMBRES,APELLIDOS,FECHA_NACIMIENTO,TELEFONO,CORREO,DIRECCION) values(?,?,?,?,?,?,?,?) returning ID_PACIENTE into ?; end;",i.required("tipoDocumento"),i.required("numeroDocumento"),i.required("nombres"),i.required("apellidos"),i.text("fechaNacimiento")==null||i.text("fechaNacimiento").isBlank()?null:java.sql.Date.valueOf(i.date("fechaNacimiento")),i.text("telefono"),i.text("correo"),i.text("direccion"));audit(actor,"PACIENTE",id,"CREAR","Alta de paciente via API");yield result(action,id);}
   case "paciente-editar" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA");int n=repo.update("UPDATE PACIENTE SET NOMBRES=?,APELLIDOS=?,TELEFONO=?,CORREO=?,DIRECCION=?,ESTADO=? WHERE ID_PACIENTE=?",i.required("nombres"),i.required("apellidos"),i.text("telefono"),i.text("correo"),i.text("direccion"),i.required("estado"),i.id("idPaciente"));if(n!=1)throw new IllegalArgumentException("Paciente no encontrado");audit(actor,"PACIENTE",i.id("idPaciente"),"ACTUALIZAR","Actualizacion de paciente via API");yield result(action,i.id("idPaciente"));}
   case "doctor-crear" -> {permit(actor,"ADMINISTRADORA");Long id=repo.insertReturning("begin insert into DOCTOR(TIPO_DOCUMENTO,NUMERO_DOCUMENTO,NOMBRES,APELLIDOS,TELEFONO,CORREO,ID_USUARIO) values(?,?,?,?,?,?,?) returning ID_DOCTOR into ?; end;",i.required("tipoDocumento"),i.required("numeroDocumento"),i.required("nombres"),i.required("apellidos"),i.text("telefono"),i.text("correo"),i.optionalId("idUsuario"));audit(actor,"DOCTOR",id,"CREAR","Alta de doctor via API");yield result(action,id);}
   case "doctor-editar" -> {permit(actor,"ADMINISTRADORA");int n=repo.update("UPDATE DOCTOR SET NOMBRES=?,APELLIDOS=?,TELEFONO=?,CORREO=?,ESTADO=? WHERE ID_DOCTOR=?",i.required("nombres"),i.required("apellidos"),i.text("telefono"),i.text("correo"),i.required("estado"),i.id("idDoctor"));if(n!=1)throw new IllegalArgumentException("Doctor no encontrado");audit(actor,"DOCTOR",i.id("idDoctor"),"ACTUALIZAR","Actualizacion de doctor via API");yield result(action,i.id("idDoctor"));}
   case "especialidad-crear" -> {permit(actor,"ADMINISTRADORA");Long id=repo.insertReturning("begin insert into ESPECIALIDAD(NOMBRE,PRECIO_CONSULTA) values(?,?) returning ID_ESPECIALIDAD into ?; end;",i.required("nombre"),i.money("precioConsulta"));audit(actor,"ESPECIALIDAD",id,"CREAR","Alta de especialidad");yield result(action,id);}
   case "consultorio-crear" -> {permit(actor,"ADMINISTRADORA");Long id=repo.insertReturning("begin insert into CONSULTORIO(NOMBRE,UBICACION) values(?,?) returning ID_CONSULTORIO into ?; end;",i.required("nombre"),i.text("ubicacion"));audit(actor,"CONSULTORIO",id,"CREAR","Alta de consultorio");yield result(action,id);}
   case "franja-crear" -> {permit(actor,"ADMINISTRADORA");Long id=repo.insertReturning("begin insert into FRANJA_HORARIA(HORA_INICIO,HORA_FIN) values(?,?) returning ID_FRANJA into ?; end;",i.required("horaInicio"),i.required("horaFin"));audit(actor,"FRANJA_HORARIA",id,"CREAR","Alta de franja horaria");yield result(action,id);}
   case "doctor-vincular-usuario" -> {permit(actor,"ADMINISTRADORA");
    Long usr=i.id("idUsuario");
    Map<String,Object> usrOk=repo.one("SELECT U.ID_USUARIO FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.ID_USUARIO=? AND U.ESTADO='ACTIVO' AND R.NOMBRE='DOCTOR'",usr);
    if(usrOk==null)throw new IllegalArgumentException("Se requiere un usuario activo con rol DOCTOR");
    int n=repo.update("UPDATE DOCTOR SET ID_USUARIO=? WHERE ID_DOCTOR=?",usr,i.id("idDoctor"));
    if(n!=1)throw new IllegalArgumentException("Doctor no encontrado");audit(actor,"DOCTOR",i.id("idDoctor"),"VINCULAR_USUARIO","Asignacion de cuenta a doctor");yield result(action,i.id("idDoctor"));}
   case "doctor-especialidad" -> {permit(actor,"ADMINISTRADORA");repo.update("INSERT INTO DOCTOR_ESPECIALIDAD(ID_DOCTOR,ID_ESPECIALIDAD) VALUES (?,?)",i.id("idDoctor"),i.id("idEspecialidad"));audit(actor,"DOCTOR_ESPECIALIDAD",i.id("idDoctor"),"ASIGNAR","Asignacion de especialidad");yield result(action,null);}
   case "doctor-validar" -> {permit(actor,"ADMINISTRADORA");yield proc("SP_VALIDAR_DOCUMENTACION",actor,actor,i.id("idDoctor"));}
   case "disponibilidad-registrar" -> {permit(actor,"ADMINISTRADORA","DOCTOR");yield proc("SP_REGISTRAR_DISPONIBILIDAD",actor,actor,i.id("idDoctor"),i.date("fecha"),i.id("idFranja"),OracleRepository.outNumber());}
   case "prereserva-crear" -> {permit(actor,"RECEPCIONISTA","ADMINISTRADORA");yield proc("SP_PRE_RESERVAR_CITA",actor,actor,i.id("idPaciente"),i.id("idDoctor"),i.id("idEspecialidad"),i.id("idConsultorio"),i.id("idFranja"),i.date("fecha"),OracleRepository.outNumber());}
   case "cita-confirmar" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA","CAJERA");yield proc("SP_CONFIRMAR_CITA_PAGADA",actor,actor,i.id("idPreReserva"),i.required("metodoPago"),i.required("referenciaPago"),OracleRepository.outNumber());}
   case "cita-reprogramar" -> {permit(actor,"RECEPCIONISTA","ADMINISTRADORA");yield proc("SP_REPROGRAMAR_CITA",actor,actor,i.id("idCita"),i.date("fechaNueva"),i.id("idFranjaNueva"),i.id("idConsultorioNuevo"),i.required("motivo"),i.required("aceptacionPaciente"));}
   case "asistencia-registrar" -> {permit(actor,"RECEPCIONISTA");yield proc("SP_REGISTRAR_ASISTENCIA",actor,actor,i.id("idCita"),OracleRepository.outNumber());}
   case "atencion-iniciar" -> {permit(actor,"DOCTOR");yield proc("SP_INICIAR_ATENCION",actor,actor,i.id("idCita"),OracleRepository.outNumber());}
   case "diagnostico-registrar" -> {permit(actor,"DOCTOR");yield proc("SP_REGISTRAR_DIAGNOSTICO",actor,actor,i.id("idCita"),i.required("diagnostico"),i.text("observaciones"));}
   case "receta-crear" -> {permit(actor,"DOCTOR");yield proc("SP_CREAR_RECETA",actor,actor,i.id("idCita"),i.required("indicaciones"),OracleRepository.outNumber());}
   case "medicamento-agregar" -> {permit(actor,"DOCTOR");yield proc("SP_AGREGAR_MEDICAMENTO",actor,actor,i.id("idReceta"),i.required("medicamento"),i.required("dosis"),i.required("frecuencia"),i.required("duracion"),OracleRepository.outNumber(),i.text("observaciones"));}
   case "recibo-emitir" -> {permit(actor,"DOCTOR");yield proc("SP_EMITIR_RECIBO",actor,actor,i.id("idCita"),i.required("numeroRecibo"),OracleRepository.outNumber());}
   case "recibo-entregar" -> {permit(actor,"DOCTOR");yield proc("SP_ENTREGAR_RECIBO",actor,actor,i.id("idCita"),i.required("medioEntrega"));}
   case "atencion-cerrar" -> {permit(actor,"DOCTOR");yield proc("SP_CERRAR_ATENCION",actor,actor,i.id("idCita"));}
   case "liquidacion-generar" -> {permit(actor,"TESORERA");yield proc("SP_GENERAR_LIQUIDACION",actor,actor,i.id("idDoctor"),i.date("fechaInicio"),i.date("fechaFin"),OracleRepository.outNumber());}
   case "doctor-pagar" -> {permit(actor,"TESORERA");yield proc("SP_PAGAR_DOCTOR",actor,actor,i.id("idLiquidacion"),i.money("monto"),i.required("metodoPago"),i.required("numeroOperacion"),i.required("numeroBoleta"),OracleRepository.outNumber());}
   case "reprogramada-cancelar" -> {permit(actor,"ADMINISTRADORA");yield proc("SP_CANCELAR_REPROGRAMADA",actor,actor,i.id("idCita"),i.required("motivo"));}
   case "usuario-rol" -> {permit(actor,"ADMINISTRADORA");yield proc("SP_CAMBIAR_ROL_USUARIO",actor,actor,i.id("idUsuario"),i.id("idRol"));}
   case "usuario-estado" -> {permit(actor,"ADMINISTRADORA");yield proc("SP_CAMBIAR_ESTADO_USUARIO",actor,actor,i.id("idUsuario"),i.required("estado"));}
   case "parametro-cambiar" -> {permit(actor,"ADMINISTRADORA");yield proc("SP_CAMBIAR_PARAMETRO",actor,actor,i.required("nombre"),i.required("valor"));}
   case "notificacion-encolar" -> {permit(actor,"ADMINISTRADORA","RECEPCIONISTA");yield proc("SP_ENCOLAR_NOTIFICACION_CITA",actor,actor,i.id("idCita"),i.required("tipo"),OracleRepository.outNumber());}
   default -> throw new IllegalArgumentException("Acción no implementada: "+action);
  };
 }
}
