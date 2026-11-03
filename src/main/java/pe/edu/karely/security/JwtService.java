package pe.edu.karely.security;
import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
@Service
public class JwtService {
 private final byte[] secret;private final long minutes;private final ObjectMapper mapper;
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.expiration-minutes:60}") long minutes,ObjectMapper mapper){
  if(secret.length()<32)throw new IllegalArgumentException("APP_JWT_SECRET requiere minimo 32 caracteres seguros");
  this.secret=secret.getBytes(StandardCharsets.UTF_8);this.minutes=minutes;this.mapper=mapper;
 }
 private String b64(byte[] data){return Base64.getUrlEncoder().withoutPadding().encodeToString(data);}
 private byte[] sign(String value){try {Mac m=Mac.getInstance("HmacSHA256");m.init(new SecretKeySpec(secret,"HmacSHA256"));return m.doFinal(value.getBytes(StandardCharsets.US_ASCII));}catch(Exception e){throw new IllegalStateException(e);}}
 public String issue(long uid,long sid,String role){try {
  String h=b64(mapper.writeValueAsBytes(Map.of("alg","HS256","typ","JWT")));
  String p=b64(mapper.writeValueAsBytes(Map.of("iss","karely-bd2","sub",Long.toString(uid),"sid",sid,"role",role,"iat",Instant.now().getEpochSecond(),"exp",Instant.now().plusSeconds(minutes*60).getEpochSecond())));
  return h+"."+p+"."+b64(sign(h+"."+p));
 }catch(Exception ex){throw new IllegalStateException("JWT",ex);}}
 public Claims verify(String token){try {
  String[] parts=token.split("\\.");if(parts.length!=3)throw new IllegalArgumentException("JWT incompleto");
  if(!java.security.MessageDigest.isEqual(sign(parts[0]+"."+parts[1]),Base64.getUrlDecoder().decode(parts[2])))throw new IllegalArgumentException("JWT invalido");
  Map<?,?> head=mapper.readValue(Base64.getUrlDecoder().decode(parts[0]),Map.class);
  if(!"HS256".equals(head.get("alg")))throw new IllegalArgumentException("Algoritmo JWT invalido");
  Map<?,?> payload=mapper.readValue(Base64.getUrlDecoder().decode(parts[1]),Map.class);
  if(!"karely-bd2".equals(payload.get("iss")))throw new IllegalArgumentException("Emisor JWT invalido");
  if(((Number)payload.get("exp")).longValue()<=Instant.now().getEpochSecond())throw new IllegalArgumentException("JWT vencido");
  return new Claims(Long.parseLong((String)payload.get("sub")),((Number)payload.get("sid")).longValue(),(String)payload.get("role"));
 }catch(Exception e){throw new IllegalArgumentException("Sesión no válida",e);}}
 public record Claims(long userId,long sessionId,String role){}
}
