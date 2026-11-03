package pe.edu.karely;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableScheduling
public class KarelyApplication {
  public static void main(String[] args) { SpringApplication.run(KarelyApplication.class, args); }
}
