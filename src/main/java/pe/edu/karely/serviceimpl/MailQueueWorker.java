package pe.edu.karely.serviceimpl;

import pe.edu.karely.repository.OracleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.List;

/** Servicio de correo OPCIONAL; deshabilitado por defecto.
 *  Respeta el protocolo reclamar -> commit -> SMTP -> resultado del paso 22.
 *  Garantía "al menos una vez"; usar código de evento para deduplicar en proveedor si aplica.
 */
@Component
@ConditionalOnProperty(name="app.mail.enabled",havingValue="true")
public class MailQueueWorker {
 private static final Logger LOG=LoggerFactory.getLogger(MailQueueWorker.class);
 private final OracleRepository repo;private final JavaMailSender mail;
 private final TransactionTemplate tx;private final long operator;private final String from;
 public MailQueueWorker(OracleRepository repo,JavaMailSender mail,PlatformTransactionManager tm,
  @Value("${app.mail.operator-id:0}")long operator,@Value("${app.mail.from:}")String from){
  if(operator<1||from.isBlank())throw new IllegalArgumentException("Configurar APP_MAIL_OPERATOR_ID (administradora activa) y APP_MAIL_FROM para activar SMTP");
  this.repo=repo;this.mail=mail;this.tx=new TransactionTemplate(tm);this.operator=operator;this.from=from;
 }
 @Scheduled(fixedDelayString="${app.mail.poll-ms:30000}")
 public void run(){
  List<Object> job;
  try{job=tx.execute(status->repo.call("SP_TOMAR_NOTIFICACION",operator,
    operator,OracleRepository.outNumber(),OracleRepository.outText(),OracleRepository.outText(),OracleRepository.outText(),OracleRepository.outNumber()));}
  catch(Exception ex){LOG.error("No se pudo reclamar una notificación",ex);return;}
  if(job==null||job.isEmpty()||job.getFirst()==null)return;
  long id=((Number)job.get(0)).longValue();
  String tipo=String.valueOf(job.get(1));String recipient=String.valueOf(job.get(2));
  String codigo=String.valueOf(job.get(3));int intento=((Number)job.get(4)).intValue();
  String success="N";String error=null;
  try {
    SimpleMailMessage msg=new SimpleMailMessage();msg.setFrom(from);msg.setTo(recipient);
    msg.setSubject("Karely's - " + tipo.replace('_',' '));
    msg.setText("Su notificación del centro médico Karely's está registrada. Referencia: "+codigo+". Si no solicitó esta operación, contacte a administración.\n\nNo responda a este correo.");
    mail.send(msg);success="S";
  }catch(Exception ex){error=ex.getClass().getSimpleName();LOG.warn("Falló el envío del evento {}",codigo);}
  final String succeeded=success,detail=error;
  try{tx.execute(status->{repo.call("SP_REGISTRAR_RESULTADO_ENVIO",operator,operator,id,intento,succeeded,detail);return null;});}
  catch(Exception ex){LOG.error("No se pudo registrar resultado del envío {}",codigo,ex);}
 }
}
