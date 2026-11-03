package pe.edu.karely.serviceimpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.karely.repository.OracleRepository;
@Service
public class LoginAttemptService {
 private final OracleRepository db;
 public LoginAttemptService(OracleRepository db){this.db=db;}
 @Transactional(propagation=Propagation.REQUIRES_NEW)
 public void failed(long userId){db.update("UPDATE USUARIO SET INTENTOS_FALLIDOS=INTENTOS_FALLIDOS+1,ESTADO=CASE WHEN INTENTOS_FALLIDOS+1>=5 THEN 'BLOQUEADO' ELSE ESTADO END WHERE ID_USUARIO=? AND ESTADO='ACTIVO'",userId);}
}
