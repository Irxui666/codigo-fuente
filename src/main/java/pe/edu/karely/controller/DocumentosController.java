package pe.edu.karely.controller;
import java.util.*;
import pe.edu.karely.repository.OracleRepository;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/v1/documentos")
public class DocumentosController {
 private final OracleRepository db;private final org.springframework.jdbc.core.JdbcTemplate jdbc;
 public DocumentosController(OracleRepository db,org.springframework.jdbc.core.JdbcTemplate jdbc){this.db=db;this.jdbc=jdbc;}
 private void admin(Authentication a){if(a.getAuthorities().stream().noneMatch(r->r.getAuthority().equals("ROLE_ADMINISTRADORA")))throw new AccessDeniedException("Solo administración");}
 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @Transactional
 public Map<String,Object> upload(@RequestParam long idDoctor,@RequestParam String tipo,@RequestParam MultipartFile archivo,Authentication a)throws Exception {
  admin(a);if(!Set.of("DNI","TITULO","OTRO").contains(tipo))throw new IllegalArgumentException("Tipo no permitido");
  if(archivo.isEmpty()||archivo.getSize()>10*1024*1024)throw new IllegalArgumentException("Archivo obligatorio, máximo 10 MB");
  String mime=Objects.toString(archivo.getContentType(),"");if(!Set.of("application/pdf","image/png","image/jpeg").contains(mime))throw new IllegalArgumentException("Archivo PDF, PNG o JPEG únicamente");
  byte[] bytes=archivo.getBytes();String name=Objects.toString(archivo.getOriginalFilename(),"documento").replaceAll("[^A-Za-z0-9._-]","_");
  Long id=db.insertReturning("begin insert into DOCUMENTO_DOCTOR(ID_DOCTOR,TIPO_DOCUMENTO,NOMBRE_ARCHIVO,TIPO_MIME,ARCHIVO) values(?,?,?,?,?) returning ID_DOCUMENTO into ?; end;",idDoctor,tipo,name,mime,bytes);
  db.update("UPDATE DOCTOR SET ESTADO_DOCUMENTACION='INCOMPLETO' WHERE ID_DOCTOR=?",idDoctor);
  return Map.of("ok",true,"idDocumento",id);
 }
 @GetMapping("/doctor/{idDoctor}") public List<Map<String,Object>> list(@PathVariable long idDoctor,Authentication a){admin(a);return db.list("SELECT ID_DOCUMENTO,ID_DOCTOR,TIPO_DOCUMENTO,NOMBRE_ARCHIVO,TIPO_MIME,ESTADO,FECHA_VALIDACION FROM DOCUMENTO_DOCTOR WHERE ID_DOCTOR=? ORDER BY ID_DOCUMENTO DESC",idDoctor);}
 @GetMapping("/{idDocumento}") @Transactional(readOnly=true)
 public ResponseEntity<byte[]> read(@PathVariable long idDocumento,Authentication a){
  admin(a);
  List<DocumentoDescargado> data=jdbc.query("SELECT NOMBRE_ARCHIVO,TIPO_MIME,ARCHIVO FROM DOCUMENTO_DOCTOR WHERE ID_DOCUMENTO=?",
   (rs,rowNum)->new DocumentoDescargado(rs.getString("NOMBRE_ARCHIVO"),rs.getString("TIPO_MIME"),rs.getBytes("ARCHIVO")),idDocumento);
  if(data.isEmpty())return ResponseEntity.notFound().build();
  DocumentoDescargado d=data.getFirst();
  String filename=d.name().replace("\"","_").replace("\r","_").replace("\n","_");
  return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+filename+"\"")
   .contentType(MediaType.parseMediaType(d.mime())).body(d.bytes());
 }
 private record DocumentoDescargado(String name,String mime,byte[] bytes){}
}
