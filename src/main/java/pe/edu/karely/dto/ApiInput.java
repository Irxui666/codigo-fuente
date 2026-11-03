package pe.edu.karely.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
public class ApiInput {
 private final Map<String,Object> values;
 public ApiInput(Map<String,Object> values){this.values=values;}
 public String text(String key){Object x=values.get(key);return x==null?null:x.toString().trim();}
 public String required(String key){String s=text(key);if(s==null||s.isBlank())throw new IllegalArgumentException("Falta el campo "+key);return s;}
 public Long id(String key){return Long.valueOf(required(key));}
 public Long optionalId(String key){String v=text(key);return v==null||v.isBlank()?null:Long.valueOf(v);}
 public BigDecimal money(String key){return new BigDecimal(required(key));}
 public LocalDate date(String key){return LocalDate.parse(required(key));}
 public Map<String,Object> raw(){return values;}
}
