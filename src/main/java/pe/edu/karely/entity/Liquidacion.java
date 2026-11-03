package pe.edu.karely.entity;
import java.math.BigDecimal;
/** Proyección contable; fuente de verdad: LIQUIDACION_DOCTOR en Oracle. */
public record Liquidacion(long idLiquidacion,long idDoctor,BigDecimal montoDoctor,
 BigDecimal montoGestora,String estado) {}
