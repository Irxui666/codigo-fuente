package pe.edu.karely;
import pe.edu.karely.dto.ApiInput;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
class ApiInputTest {
 @Test void parsearEntrada(){ApiInput input=new ApiInput(Map.of("idDoctor",3,"fecha","2026-11-15","monto","60.50"));assertEquals(3L,input.id("idDoctor"));assertEquals("2026-11-15",input.date("fecha").toString());assertEquals("60.50",input.money("monto").toString());assertThrows(IllegalArgumentException.class,()->input.required("idPaciente"));}
}
