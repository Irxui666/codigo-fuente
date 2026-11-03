package pe.edu.karely.config;
import pe.edu.karely.repository.OracleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
/** Solo alta inicial opcional; ninguna contraseña predeterminada. */
@Configuration
public class BootstrapAdmin {
 @Bean @Order(2) ApplicationRunner initAdmin(OracleRepository db,PasswordEncoder encoder,
    @Value("${app.bootstrap.username:}")String username,
    @Value("${app.bootstrap.email:}")String email,
    @Value("${app.bootstrap.password:}")String password){
  return args->{
   if(username.isBlank()&&email.isBlank()&&password.isBlank())return;
   if(username.isBlank()||email.isBlank()||password.length()<12)throw new IllegalArgumentException("Bootstrap: usuario/correo/contraseña segura (12 caracteres mínimo) obligatorios");
   var found=db.one("SELECT COUNT(*) AS TOTAL FROM USUARIO U JOIN ROL R ON R.ID_ROL=U.ID_ROL WHERE R.NOMBRE='ADMINISTRADORA' AND U.ESTADO='ACTIVO'");
   if(((Number)found.get("TOTAL")).longValue()>0)return;
   var rol=db.one("SELECT ID_ROL FROM ROL WHERE NOMBRE='ADMINISTRADORA' AND ESTADO='ACTIVO'");
   if(rol==null)throw new IllegalStateException("Primero ejecutar el paso 13: roles iniciales");
   db.insertReturning("begin insert into USUARIO(ID_ROL,USERNAME,CORREO,PASSWORD_HASH) values(?,?,?,?) returning ID_USUARIO into ?; end;",rol.get("ID_ROL"),username.trim().toLowerCase(java.util.Locale.ROOT),email.trim().toLowerCase(java.util.Locale.ROOT),encoder.encode(password));
  };
 }
}
