package pe.edu.karely.controller;
import pe.edu.karely.repository.OracleRepository;
import pe.edu.karely.security.JwtService;
import pe.edu.karely.serviceimpl.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
 private final OracleRepository db;private final PasswordEncoder encoder;private final JwtService jwt;private final LoginAttemptService attempts;
 public AuthController(OracleRepository db,PasswordEncoder encoder,JwtService jwt,LoginAttemptService attempts){this.db=db;this.encoder=encoder;this.jwt=jwt;this.attempts=attempts;}
 @PostMapping("/login") @Transactional
 public Map<String,Object> login(@RequestBody Map<String,Object> body){
  String username=Objects.toString(body.get("username"),"").trim().toLowerCase(java.util.Locale.ROOT);String password=Objects.toString(body.get("password"),"");
  if(username.isEmpty()||password.isEmpty())throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
  Map<String,Object> user=db.one("SELECT U.ID_USUARIO,U.PASSWORD_HASH,U.ESTADO,U.INTENTOS_FALLIDOS,R.NOMBRE AS ROL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.USERNAME=? AND R.ESTADO='ACTIVO'",username);
  if(user==null||!"ACTIVO".equals(user.get("ESTADO"))||!encoder.matches(password,Objects.toString(user.get("PASSWORD_HASH"),""))){
   if(user!=null&&"ACTIVO".equals(user.get("ESTADO")))attempts.failed(((Number)user.get("ID_USUARIO")).longValue());
   throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
  }
  long id=((Number)user.get("ID_USUARIO")).longValue();
  db.update("UPDATE USUARIO SET INTENTOS_FALLIDOS=0,ULTIMO_ACCESO=SYSTIMESTAMP WHERE ID_USUARIO=?",id);
  Long sid=db.insertReturning("begin insert into SESION_USUARIO(ID_USUARIO) values(?) returning ID_SESION into ?; end;",id);
  return Map.of("token",jwt.issue(id,sid,Objects.toString(user.get("ROL"))),"usuario",username,"rol",user.get("ROL"),"idUsuario",id);
 }
 @GetMapping("/me") public Map<String,Object> me(Authentication a){long id=(Long)a.getPrincipal();Map<String,Object> u=db.one("SELECT U.ID_USUARIO,U.USERNAME,U.CORREO,U.ESTADO,R.NOMBRE AS ROL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE U.ID_USUARIO=?",id);if(u==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);return u;}
 @PostMapping("/logout") @Transactional
 public Map<String,String> logout(Authentication a,HttpServletRequest request){String header=request.getHeader("Authorization");if(header!=null&&header.startsWith("Bearer ")){JwtService.Claims c=jwt.verify(header.substring(7));if(c.userId()==(Long)a.getPrincipal())db.update("UPDATE SESION_USUARIO SET ESTADO='CERRADA',FECHA_FIN=SYSTIMESTAMP WHERE ID_SESION=? AND ID_USUARIO=? AND ESTADO='ACTIVA'",c.sessionId(),c.userId());}return Map.of("mensaje","Sesión cerrada");}
}
