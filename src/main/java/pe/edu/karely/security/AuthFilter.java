package pe.edu.karely.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
public class AuthFilter extends OncePerRequestFilter {
 private final JwtService jwt;private final JdbcTemplate jdbc;
 public AuthFilter(JwtService jwt,JdbcTemplate jdbc){this.jwt=jwt;this.jdbc=jdbc;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException {
  String auth=req.getHeader("Authorization");
  if(auth!=null&&auth.startsWith("Bearer ")) {
   try {
    JwtService.Claims c=jwt.verify(auth.substring(7));
    List<Map<String,Object>> row=jdbc.queryForList("""
       SELECT R.NOMBRE AS ROL FROM SESION_USUARIO S JOIN USUARIO U ON U.ID_USUARIO=S.ID_USUARIO
       JOIN ROL R ON R.ID_ROL=U.ID_ROL
       WHERE S.ID_SESION=? AND U.ID_USUARIO=? AND S.ESTADO='ACTIVA'
       AND U.ESTADO='ACTIVO' AND R.ESTADO='ACTIVO' AND S.ULTIMA_ACTIVIDAD >= SYSTIMESTAMP - NUMTODSINTERVAL((SELECT TO_NUMBER(VALOR) FROM PARAMETRO_SISTEMA WHERE NOMBRE='SESION_MINUTOS' AND ESTADO='ACTIVO'), 'MINUTE')""",c.sessionId(),c.userId());
    if(!row.isEmpty()&&c.role().equals(row.getFirst().get("ROL"))){
     var token=new UsernamePasswordAuthenticationToken(c.userId(),null,List.of(new SimpleGrantedAuthority("ROLE_"+c.role())));
     SecurityContextHolder.getContext().setAuthentication(token);
     jdbc.update("UPDATE SESION_USUARIO SET ULTIMA_ACTIVIDAD=SYSTIMESTAMP WHERE ID_SESION=?",c.sessionId());
    }
   }catch(Exception ignored){SecurityContextHolder.clearContext();}
  }
  try{chain.doFilter(req,res);}finally{SecurityContextHolder.clearContext();}
 }
}
