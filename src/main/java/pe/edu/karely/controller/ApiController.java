package pe.edu.karely.controller;
import java.util.*;
import pe.edu.karely.dto.ApiInput;
import pe.edu.karely.service.KarelyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1")
public class ApiController {
 private final KarelyService service;
 public ApiController(KarelyService service){this.service=service;}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("status","UP","service","KARELY_BD2");}
 @GetMapping("/datos/{recurso}") public List<Map<String,Object>> list(@PathVariable String recurso,Authentication auth){return service.listing(recurso,(Long)auth.getPrincipal());}
 @PostMapping("/operaciones/{accion}") public Map<String,Object> operate(@PathVariable String accion,@RequestBody Map<String,Object> datos,Authentication auth){return service.operate(accion,new ApiInput(datos),(Long)auth.getPrincipal());}
}
