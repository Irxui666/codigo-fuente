package pe.edu.karely.controller;

import java.sql.SQLException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ExceptionHandlerApi {
    private static final Logger LOG = LoggerFactory.getLogger(ExceptionHandlerApi.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> invalid(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() == null ? "Datos inválidos" : e.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String,String>> denied(AccessDeniedException e) {
        return ResponseEntity.status(403).body(Map.of("error", "Acceso no autorizado"));
    }

    /** No convertir los errores de login (401) en 500. */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,String>> status(ResponseStatusException e) {
        String reason = e.getReason();
        return ResponseEntity.status(e.getStatusCode())
            .body(Map.of("error", reason == null || reason.isBlank() ? "Solicitud rechazada" : reason));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String,String>> sql(DataAccessException e) {
        Throwable cause = e;
        while (cause != null) {
            if (cause instanceof SQLException sql && sql.getErrorCode() >= 20000 && sql.getErrorCode() <= 20999) {
                String message = sql.getMessage();
                int index = message == null ? -1 : message.indexOf("ORA-");
                String detail = index >= 0 ? message.substring(index).split("\\n")[0] : "Regla de negocio no cumplida";
                return ResponseEntity.badRequest().body(Map.of("error", detail));
            }
            cause = cause.getCause();
        }
        LOG.error("Fallo interno de base de datos", e);
        return ResponseEntity.status(500).body(Map.of("error", "Error en la operación. Consulte el registro del servidor."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> other(Exception e) {
        LOG.error("Fallo del servidor", e);
        return ResponseEntity.status(500).body(Map.of("error", "Error interno del servidor"));
    }
}
