package pe.edu.karely.config;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

/** Solo consulta metadatos Oracle. Nunca realiza DDL. */
@Configuration
public class SchemaCheck {
    private static final Set<String> TABLAS = Set.of(
        "ROL", "USUARIO", "SESION_USUARIO", "AUDITORIA", "DOCTOR", "DOCUMENTO_DOCTOR",
        "ESPECIALIDAD", "DOCTOR_ESPECIALIDAD", "PACIENTE", "CONSULTORIO", "FRANJA_HORARIA",
        "DISPONIBILIDAD_DOCTOR", "PRE_RESERVA_CITA", "PAGO_CITA", "CITA", "COMPROBANTE_CITA",
        "REPROGRAMACION_CITA", "ASISTENCIA", "ATENCION_MEDICA", "RECETA", "RECETA_DETALLE",
        "RECIBO_HONORARIO", "LIQUIDACION_DOCTOR", "LIQUIDACION_DETALLE", "PAGO_DOCTOR",
        "INGRESO_GESTORA", "PARAMETRO_SISTEMA", "HISTORIAL_PARAMETRO", "NOTIFICACION_SALIENTE"
    );
    private static final Set<String> VISTAS = Set.of(
        "VW_AGENDA_CITAS", "VW_RESUMEN_CITAS_DIARIAS", "VW_SALDOS_LIQUIDACIONES",
        "VW_INGRESOS_GESTORA", "VW_CONTROL_NOTIFICACIONES"
    );
    private static final Set<String> PL_SQL = Set.of(
        "FN_DOCUMENTACION_COMPLETA", "FN_INICIO_TURNO", "FN_ROL_USUARIO",
        "FN_SALDO_LIQUIDACION", "TR_DOCUMENTO_REVALIDACION", "TR_DOCTOR_ESTADO_VALIDADO",
        "SP_VALIDAR_DOCUMENTACION", "SP_REGISTRAR_DISPONIBILIDAD", "SP_PRE_RESERVAR_CITA",
        "SP_CONFIRMAR_CITA_PAGADA", "SP_EXPIRAR_PRE_RESERVAS", "SP_REPROGRAMAR_CITA",
        "SP_REGISTRAR_ASISTENCIA", "SP_INICIAR_ATENCION", "SP_REGISTRAR_DIAGNOSTICO",
        "SP_CREAR_RECETA", "SP_AGREGAR_MEDICAMENTO", "SP_EMITIR_RECIBO", "SP_ENTREGAR_RECIBO",
        "SP_CERRAR_ATENCION", "SP_GENERAR_LIQUIDACION", "SP_PAGAR_DOCTOR",
        "SP_CANCELAR_REPROGRAMADA", "SP_CREAR_USUARIO", "SP_CAMBIAR_ROL_USUARIO",
        "SP_CAMBIAR_ESTADO_USUARIO", "SP_CAMBIAR_PARAMETRO", "SP_CERRAR_SESION",
        "SP_EXPIRAR_SESIONES", "SP_ENCOLAR_NOTIFICACION_CITA", "SP_TOMAR_NOTIFICACION",
        "SP_REGISTRAR_RESULTADO_ENVIO", "SP_MARCAR_CITAS_PERDIDAS", "SP_TAREA_MANTENIMIENTO"
    );

    private static void require(String group, Set<String> required, List<String> present) {
        Set<String> missing = new HashSet<>(required);
        missing.removeAll(present);
        if (!missing.isEmpty()) {
            throw new IllegalStateException("Faltan " + group + " en KARELY_BD2: " + String.join(", ", missing.stream().sorted().toList()));
        }
    }

    @Bean
    @Order(1)
    ApplicationRunner validarEsquema(JdbcTemplate jdbc) {
        return args -> {
            require("tablas", TABLAS, jdbc.queryForList("SELECT TABLE_NAME FROM USER_TABLES", String.class));
            require("vistas VALID", VISTAS, jdbc.queryForList(
                "SELECT OBJECT_NAME FROM USER_OBJECTS WHERE OBJECT_TYPE='VIEW' AND STATUS='VALID'", String.class));
            require("objetos PL/SQL VALID", PL_SQL, jdbc.queryForList(
                "SELECT OBJECT_NAME FROM USER_OBJECTS WHERE OBJECT_TYPE IN ('PROCEDURE','FUNCTION','TRIGGER') AND STATUS='VALID'", String.class));
            Integer bad = jdbc.queryForObject(
                "SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE IN ('VIEW','PROCEDURE','FUNCTION','TRIGGER') AND STATUS<>'VALID'", Integer.class);
            if (bad != null && bad > 0) {
                throw new IllegalStateException("Objetos INVALID en KARELY_BD2: " + bad);
            }
        };
    }
}
