package pe.edu.karely.controller;
import pe.edu.karely.dto.ApiInput;
import pe.edu.karely.repository.OracleRepository;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
 private final OracleRepository db;private final PasswordEncoder encoder;
 public AdminController(OracleRepository db,PasswordEncoder encoder){this.db=db;this.encoder=encoder;}
 @PostMapping("/usuarios") @Transactional public Map<String,Object> create(@RequestBody Map<String,Object> body,Authentication a){
  if(a.getAuthorities().stream().noneMatch(x->x.getAuthority().equals("ROLE_ADMINISTRADORA")))throw new AccessDeniedException("Solo administradora");
  ApiInput i=new ApiInput(body);String pwd=i.required("password");if(pwd.length()<12)throw new IllegalArgumentException("Contraseña mínima: 12 caracteres");
  long actor=(Long)a.getPrincipal();Object id=db.call("SP_CREAR_USUARIO",actor,actor,i.id("idRol"),i.required("username"),i.required("correo"),encoder.encode(pwd),OracleRepository.outNumber()).getFirst();
  return Map.of("ok",true,"id",id);
 }
}
