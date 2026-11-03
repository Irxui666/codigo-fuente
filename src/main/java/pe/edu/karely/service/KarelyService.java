package pe.edu.karely.service;
import java.util.*;
import pe.edu.karely.dto.ApiInput;
public interface KarelyService {
 List<Map<String,Object>> listing(String resource,long actor);
 Map<String,Object> operate(String action,ApiInput input,long actor);
}
